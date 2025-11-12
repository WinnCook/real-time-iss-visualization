/**
 * Sun Module - Sun rendering with glow effects
 * Creates and manages the sun visualization at the center of the solar system
 */

import { SUN_RADIUS, COLORS, RENDER, scaleRadius } from '../utils/constants.js';
import { addToScene, removeFromScene } from '../core/scene.js';
import { getCachedSphereGeometry } from '../utils/geometryCache.js';

/**
 * The sun mesh object
 * @type {THREE.Mesh}
 */
let sunMesh = null;

/**
 * The sun glow mesh (corona effect)
 * @type {THREE.Mesh}
 */
let sunGlow = null;

/**
 * The sun corona particle system
 * @type {THREE.Points}
 */
let coronaParticles = null;

/**
 * Current visual style configuration
 * @type {Object}
 */
let currentStyle = null;

/**
 * Initialize the sun at the origin (0, 0, 0)
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Mesh} The sun mesh
 */
export function initSun(styleConfig = {}) {
    currentStyle = styleConfig;

    // Clean up existing sun if any
    if (sunMesh) {
        disposeSun();
    }

    // Calculate sun radius with scaling
    const sunRadius = scaleRadius(SUN_RADIUS, 'sun');

    // Get cached sun geometry (reuse if possible)
    const geometry = getCachedSphereGeometry(
        sunRadius,
        RENDER.SPHERE_SEGMENTS,
        RENDER.SPHERE_SEGMENTS
    );

    // Create sun material based on style
    const material = createSunMaterial(styleConfig);

    // Create sun mesh
    sunMesh = new THREE.Mesh(geometry, material);
    sunMesh.position.set(0, 0, 0);
    sunMesh.name = 'Sun';

    // Add to scene
    addToScene(sunMesh);

    // Create glow effect if enabled in style
    if (styleConfig.sunGlow !== false) {
        createSunGlow(sunRadius, styleConfig);
    }

    // Create corona particle system (realistic and neon styles)
    if (styleConfig.name === 'Realistic' || styleConfig.name === 'Neon/Cyberpunk') {
        createCoronaParticles(sunRadius, styleConfig);
    }

    console.log('✅ Sun initialized at origin with glow effects');
    return sunMesh;
}

/**
 * Create sun material based on visual style
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Material}
 */
function createSunMaterial(styleConfig) {
    // Base color
    const color = COLORS.SUN;

    // Check style-specific properties
    const flatShading = styleConfig.flatShading || false;
    const wireframe = styleConfig.wireframe || false;
    const glowIntensity = styleConfig.glowIntensity || 1.0;

    // For neon style, make it extra bright
    const emissiveIntensity = styleConfig.name === 'Neon/Cyberpunk' ? 2.0 : 1.0;

    // Create material
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: emissiveIntensity,
        flatShading: flatShading,
        wireframe: wireframe,
        roughness: 1.0,
        metalness: 0.0
    });

    return material;
}

/**
 * Create glow effect around the sun (corona)
 * @param {number} sunRadius - Radius of the sun
 * @param {Object} styleConfig - Visual style configuration
 */
function createSunGlow(sunRadius, styleConfig) {
    // Glow is larger than the sun itself
    const glowRadius = sunRadius * 1.5;
    const glowIntensity = styleConfig.glowIntensity || 1.0;

    // Create glow geometry
    const glowGeometry = new THREE.SphereGeometry(
        glowRadius,
        RENDER.SPHERE_SEGMENTS,
        RENDER.SPHERE_SEGMENTS
    );

    // Create glow material with transparency
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.SUN,
        transparent: true,
        opacity: 0.3 * glowIntensity,
        side: THREE.BackSide, // Only render backside for glow effect
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    // Create glow mesh
    sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    sunGlow.position.set(0, 0, 0);
    sunGlow.name = 'SunGlow';

    // Add to scene
    addToScene(sunGlow);
}

/**
 * Create corona particle system around the sun
 * @param {number} sunRadius - Radius of the sun
 * @param {Object} styleConfig - Visual style configuration
 */
function createCoronaParticles(sunRadius, styleConfig) {
    const particleCount = 2000; // Number of corona particles
    const coronaRadius = sunRadius * 2.5; // Particles extend well beyond sun

    // Create geometry for particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Generate particles in spherical shell around sun
    for (let i = 0; i < particleCount; i++) {
        // Random position in spherical shell
        const theta = Math.random() * Math.PI * 2; // Azimuth angle
        const phi = Math.acos((Math.random() * 2) - 1); // Polar angle (uniform distribution)
        const distance = sunRadius * (1.2 + Math.random() * 1.3); // Between 1.2x and 2.5x sun radius

        // Convert spherical to Cartesian coordinates
        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.sin(phi) * Math.sin(theta);
        const z = distance * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Color variation: orange to yellow
        const colorVariation = 0.8 + Math.random() * 0.2;
        colors[i * 3] = 1.0 * colorVariation; // R
        colors[i * 3 + 1] = 0.7 * colorVariation; // G
        colors[i * 3 + 2] = 0.1 * colorVariation; // B

        // Size variation: most small, some large
        sizes[i] = Math.random() * 3 + 1; // 1-4 units
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create particle material
    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: styleConfig.name === 'Neon/Cyberpunk' ? 0.9 : 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    // Create particle system
    coronaParticles = new THREE.Points(geometry, material);
    coronaParticles.name = 'SunCorona';
    coronaParticles.position.set(0, 0, 0);

    // Add to scene
    addToScene(coronaParticles);

    console.log('✅ Sun corona particles created');
}

/**
 * Update sun appearance based on visual style
 * @param {Object} styleConfig - New style configuration
 */
export function updateSunStyle(styleConfig) {
    if (!sunMesh) return;

    currentStyle = styleConfig;

    // Update sun material
    const newMaterial = createSunMaterial(styleConfig);
    sunMesh.material.dispose();
    sunMesh.material = newMaterial;

    // Handle glow visibility
    if (styleConfig.sunGlow !== false) {
        if (!sunGlow) {
            // Create glow if it doesn't exist
            const sunRadius = scaleRadius(SUN_RADIUS, 'sun');
            createSunGlow(sunRadius, styleConfig);
        } else {
            // Update existing glow
            const glowIntensity = styleConfig.glowIntensity || 1.0;
            sunGlow.material.opacity = 0.3 * glowIntensity;
        }
    } else {
        // Remove glow if style doesn't support it
        if (sunGlow) {
            removeFromScene(sunGlow);
            sunGlow.geometry.dispose();
            sunGlow.material.dispose();
            sunGlow = null;
        }
    }

    // Handle corona particles (only for realistic and neon styles)
    if (styleConfig.name === 'Realistic' || styleConfig.name === 'Neon/Cyberpunk') {
        if (!coronaParticles) {
            const sunRadius = scaleRadius(SUN_RADIUS, 'sun');
            createCoronaParticles(sunRadius, styleConfig);
        } else {
            // Update opacity based on style
            coronaParticles.material.opacity = styleConfig.name === 'Neon/Cyberpunk' ? 0.9 : 0.6;
        }
    } else {
        // Remove corona particles for other styles
        if (coronaParticles) {
            removeFromScene(coronaParticles);
            coronaParticles.geometry.dispose();
            coronaParticles.material.dispose();
            coronaParticles = null;
        }
    }

    console.log(`✅ Sun style updated to: ${styleConfig.name}`);
}

/**
 * Update sun animation (e.g., rotation)
 * @param {number} deltaTime - Time since last frame in milliseconds
 * @param {number} simulationTime - Current simulation time in milliseconds
 */
export function updateSun(deltaTime, simulationTime) {
    if (!sunMesh) return;

    // Convert deltaTime from milliseconds to seconds
    const deltaTimeSeconds = deltaTime / 1000;

    // The sun rotates very slowly (about 25 days for one rotation)
    // This is mostly cosmetic and can be adjusted
    const rotationSpeed = 0.05; // Radians per second
    sunMesh.rotation.y += rotationSpeed * deltaTimeSeconds;

    // Also rotate the glow slightly differently for visual interest
    if (sunGlow) {
        sunGlow.rotation.y -= rotationSpeed * 0.5 * deltaTimeSeconds;
        sunGlow.rotation.x += rotationSpeed * 0.3 * deltaTimeSeconds;
    }

    // Animate corona particles (slow rotation for dynamic effect)
    if (coronaParticles) {
        coronaParticles.rotation.y += rotationSpeed * 0.2 * deltaTimeSeconds;
        coronaParticles.rotation.x -= rotationSpeed * 0.1 * deltaTimeSeconds;
    }
}

/**
 * Get the sun mesh
 * @returns {THREE.Mesh|null}
 */
export function getSun() {
    return sunMesh;
}

/**
 * Get sun position (always at origin)
 * @returns {THREE.Vector3}
 */
export function getSunPosition() {
    return new THREE.Vector3(0, 0, 0);
}

/**
 * Get sun radius in scene units
 * @returns {number}
 */
export function getSunRadius() {
    return scaleRadius(SUN_RADIUS, 'sun');
}

/**
 * Dispose of sun resources
 */
export function disposeSun() {
    if (sunMesh) {
        removeFromScene(sunMesh);
        sunMesh.geometry.dispose();
        sunMesh.material.dispose();
        sunMesh = null;
    }

    if (sunGlow) {
        removeFromScene(sunGlow);
        sunGlow.geometry.dispose();
        sunGlow.material.dispose();
        sunGlow = null;
    }

    if (coronaParticles) {
        removeFromScene(coronaParticles);
        coronaParticles.geometry.dispose();
        coronaParticles.material.dispose();
        coronaParticles = null;
    }
}

/**
 * Clean up and remove the sun
 */
export function removeSun() {
    disposeSun();
    console.log('✅ Sun removed');
}

// Export default object
export default {
    initSun,
    updateSunStyle,
    updateSun,
    getSun,
    getSunPosition,
    getSunRadius,
    removeSun
};
