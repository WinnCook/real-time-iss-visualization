/**
 * Planets Module - Planet orbital mechanics and rendering
 * Creates and manages Mercury, Venus, Earth, and Mars
 */

import { PLANETS, RENDER, scaleRadius, auToScene, DEG_TO_RAD, TWO_PI, daysToMs, ASTRONOMICAL_UNIT } from '../utils/constants.js';
import { calculatePlanetPosition } from '../utils/orbitalElements.js';
import { addToScene, removeFromScene } from '../core/scene.js';
import { getCachedSphereGeometry } from '../utils/geometryCache.js';
import { isRotationEnabled } from './performanceSlider.js';

/**
 * Planet mesh objects keyed by planet name
 * @type {Object<string, THREE.Mesh>}
 */
const planetMeshes = {};

/**
 * Starting angles for each planet (for visual distribution)
 * @type {Object<string, number>}
 */
const startAngles = {
    mercury: 0,
    venus: Math.PI / 2,
    earth: Math.PI,
    mars: (3 * Math.PI) / 2,
    jupiter: Math.PI / 4,
    saturn: (3 * Math.PI) / 4,
    uranus: (5 * Math.PI) / 4,
    neptune: (7 * Math.PI) / 4
};

/**
 * Current visual style configuration
 * @type {Object}
 */
let currentStyle = null;

/**
 * Orbital mechanics mode (simplified circular or accurate Keplerian)
 * @type {boolean}
 */
let useAccurateOrbits = false;

/**
 * Epoch date for J2000 calculations (January 1, 2000, 12:00 TT)
 * @type {Date}
 */
const J2000_EPOCH = new Date('2000-01-01T12:00:00Z');

/**
 * Cached orbital data for performance optimization
 * Avoids recalculating constant values every frame
 * @type {Object}
 */
const cachedOrbitalData = {};

/**
 * Initialize all planets
 * @param {Object} styleConfig - Visual style configuration
 * @returns {Object} Object containing all planet meshes
 */
export function initPlanets(styleConfig = {}) {
    currentStyle = styleConfig;

    // Clean up existing planets if any
    disposePlanets();

    // Create each planet
    Object.keys(PLANETS).forEach(planetKey => {
        const planetData = PLANETS[planetKey];
        createPlanet(planetKey, planetData, styleConfig);

        // Add rings to Saturn
        if (planetKey === 'saturn' && planetData.rings) {
            createSaturnRings(planetKey, planetData, styleConfig);
        }

        // Pre-calculate and cache orbital data for this planet (OPTIMIZATION)
        cachedOrbitalData[planetKey] = {
            orbitRadiusScene: auToScene(planetData.orbitRadius),
            periodMs: daysToMs(planetData.orbitPeriod),
            rotationSpeedPerSec: (Math.PI * 2) / (planetData.rotationPeriod * 24 * 60 * 60)
        };
    });

    console.log('✅ Planets initialized: Mercury, Venus, Earth, Mars, Jupiter, Saturn (with rings), Uranus, Neptune');
    return planetMeshes;
}

/**
 * Create a single planet mesh
 * @param {string} planetKey - Planet identifier (e.g., 'mercury')
 * @param {Object} planetData - Planet configuration data
 * @param {Object} styleConfig - Visual style configuration
 */
function createPlanet(planetKey, planetData, styleConfig) {
    // Calculate planet radius with scaling (using tiered scaling based on planet category)
    const planetRadius = scaleRadius(planetData.radius, 'planet', planetKey);

    // Get cached planet geometry (reuse if possible)
    const geometry = getCachedSphereGeometry(
        planetRadius,
        RENDER.SPHERE_SEGMENTS,
        RENDER.SPHERE_SEGMENTS
    );

    // Create planet material based on style
    const material = createPlanetMaterial(planetData, styleConfig);

    // Create planet mesh
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.name = planetData.name;

    // Apply axial tilt if specified
    if (planetData.tilt) {
        planetMesh.rotation.z = planetData.tilt * DEG_TO_RAD;
    }

    // Add to scene
    addToScene(planetMesh);

    // Store reference
    planetMeshes[planetKey] = planetMesh;

    // Add atmospheric glow for Earth (if enabled in style)
    if (planetKey === 'earth' && styleConfig.atmosphereGlow) {
        createEarthAtmosphere(planetKey, planetRadius, styleConfig);
    }
}

/**
 * Create planet material based on visual style
 * @param {Object} planetData - Planet configuration data
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Material}
 */
function createPlanetMaterial(planetData, styleConfig) {
    const color = planetData.color;

    // Check style-specific properties
    const flatShading = styleConfig.flatShading || false;
    const wireframe = styleConfig.wireframe || false;

    // For neon style, add some emissive glow
    const emissive = styleConfig.name === 'Neon/Cyberpunk' ? color : 0x000000;
    const emissiveIntensity = styleConfig.name === 'Neon/Cyberpunk' ? 0.3 : 0;

    // Create material
    // For realistic style with textures, we would load texture maps here
    // For now, using solid colors for all styles
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        flatShading: flatShading,
        wireframe: wireframe,
        roughness: 0.8,
        metalness: 0.2
    });

    return material;
}

/**
 * Create Earth's atmospheric glow effect using Fresnel shader
 * @param {string} planetKey - Should be 'earth'
 * @param {number} planetRadius - Earth's radius in scene units
 * @param {Object} styleConfig - Visual style configuration
 */
function createEarthAtmosphere(planetKey, planetRadius, styleConfig) {
    const planetMesh = planetMeshes[planetKey];
    if (!planetMesh) return;

    // Create atmosphere geometry (slightly larger than planet)
    const atmosphereRadius = planetRadius * 1.15; // 15% larger than Earth
    const atmosphereGeometry = getCachedSphereGeometry(
        atmosphereRadius,
        RENDER.SPHERE_SEGMENTS,
        RENDER.SPHERE_SEGMENTS
    );

    // Create Fresnel glow shader material
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            uniform vec3 glowColor;
            uniform float glowIntensity;
            void main() {
                // Fresnel effect: stronger glow at edges
                float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                intensity *= glowIntensity;
                gl_FragColor = vec4(glowColor, 1.0) * intensity;
            }
        `,
        uniforms: {
            glowColor: {
                value: new THREE.Color(0x4a90e2) // Blue atmospheric color
            },
            glowIntensity: {
                value: styleConfig.name === 'Neon/Cyberpunk' ? 2.0 : 1.0
            }
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide, // Only render from outside
        transparent: true,
        depthWrite: false
    });

    // Create atmosphere mesh
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereMesh.name = 'Earth-Atmosphere';

    // Apply same tilt as Earth
    const earthData = PLANETS['earth'];
    if (earthData.tilt) {
        atmosphereMesh.rotation.z = earthData.tilt * DEG_TO_RAD;
    }

    // Add atmosphere as child of Earth (so it follows Earth's position)
    planetMesh.add(atmosphereMesh);

    console.log('✅ Earth atmosphere glow created');
}

/**
 * Create Saturn's ring system
 * @param {string} planetKey - Should be 'saturn'
 * @param {Object} planetData - Saturn configuration data with rings property
 * @param {Object} styleConfig - Visual style configuration
 */
function createSaturnRings(planetKey, planetData, styleConfig) {
    const planetMesh = planetMeshes[planetKey];
    if (!planetMesh || !planetData.rings) return;

    const ringData = planetData.rings;

    // Convert ring radii from km to scene units (using saturn's tiered scaling)
    const kmToScene = (km) => scaleRadius(km, 'planet', 'saturn');
    const innerRadius = kmToScene(ringData.innerRadius);
    const outerRadius = kmToScene(ringData.outerRadius);

    // Create ring geometry (flat ring in XY plane)
    const ringGeometry = new THREE.RingGeometry(
        innerRadius,
        outerRadius,
        64 // segments for smooth ring
    );

    // Create ring material
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: ringData.color,
        opacity: ringData.opacity,
        transparent: true,
        side: THREE.DoubleSide, // Visible from both sides
        depthWrite: false // Prevent z-fighting issues
    });

    // For neon style, add some glow
    if (styleConfig.name === 'Neon/Cyberpunk') {
        ringMaterial.emissive = new THREE.Color(ringData.color);
        ringMaterial.emissiveIntensity = 0.5;
    }

    // Create ring mesh
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.name = 'Saturn-Rings';

    // Rotate rings to lie in planet's equatorial plane
    // Saturn's rings are aligned with its equatorial plane, tilted by Saturn's axial tilt
    ringMesh.rotation.x = Math.PI / 2; // Rotate from XY plane to XZ plane

    // Apply same axial tilt as Saturn
    if (planetData.tilt) {
        ringMesh.rotation.z = planetData.tilt * DEG_TO_RAD;
    }

    // Add rings as child of Saturn (so they follow Saturn's position)
    planetMesh.add(ringMesh);

    console.log('✅ Saturn rings created');
}

/**
 * Update all planet positions and rotations
 * Supports both simplified circular orbits and accurate Keplerian mechanics
 * @param {number} deltaTime - Time since last frame in milliseconds
 * @param {number} simulationTime - Current simulation time in milliseconds
 */
export function updatePlanets(deltaTime, simulationTime) {
    // Convert deltaTime from milliseconds to seconds for rotation calculations
    const deltaTimeSeconds = deltaTime / 1000;

    Object.keys(PLANETS).forEach(planetKey => {
        const planetMesh = planetMeshes[planetKey];
        if (!planetMesh) return;

        if (useAccurateOrbits) {
            // ACCURATE KEPLERIAN ORBITAL MECHANICS
            // Calculate current date from simulation time
            const currentDate = new Date(J2000_EPOCH.getTime() + simulationTime);

            // Get real 3D position using Keplerian elements
            const pos = calculatePlanetPosition(planetKey, currentDate);

            // Convert from AU to scene units
            const x = pos.x * auToScene(1);
            const y = pos.y * auToScene(1);
            const z = pos.z * auToScene(1);

            // Update mesh position (with Y as vertical axis in 3D space)
            planetMesh.position.set(x, y, z);
        } else {
            // SIMPLIFIED CIRCULAR ORBITS (original fast implementation)
            // Use cached orbital data (OPTIMIZED - avoids recalculating constants)
            const cached = cachedOrbitalData[planetKey];
            const angle = startAngles[planetKey] + (simulationTime / cached.periodMs) * TWO_PI;

            // Calculate position on circular orbit (XZ plane)
            const x = Math.cos(angle) * cached.orbitRadiusScene;
            const z = Math.sin(angle) * cached.orbitRadiusScene;

            // Update mesh position
            planetMesh.position.set(x, 0, z);
        }

        // Update planet rotation on its axis (using cached rotation speed)
        // Skip rotation if performance level is ultra-low (optimization)
        if (isRotationEnabled()) {
            const cached = cachedOrbitalData[planetKey];
            planetMesh.rotation.y += cached.rotationSpeedPerSec * deltaTimeSeconds;
        }
    });
}

/**
 * Update planet appearance based on visual style
 * @param {Object} styleConfig - New style configuration
 */
export function updatePlanetsStyle(styleConfig) {
    currentStyle = styleConfig;

    Object.keys(PLANETS).forEach(planetKey => {
        const planetData = PLANETS[planetKey];
        const planetMesh = planetMeshes[planetKey];

        if (!planetMesh) return;

        // Update material
        const newMaterial = createPlanetMaterial(planetData, styleConfig);
        planetMesh.material.dispose();
        planetMesh.material = newMaterial;
    });

    console.log(`✅ Planets style updated to: ${styleConfig.name}`);
}

/**
 * Get a specific planet mesh
 * @param {string} planetKey - Planet identifier (e.g., 'earth')
 * @returns {THREE.Mesh|null}
 */
export function getPlanet(planetKey) {
    return planetMeshes[planetKey] || null;
}

/**
 * Get all planet meshes
 * @returns {Object<string, THREE.Mesh>}
 */
export function getAllPlanets() {
    return planetMeshes;
}

/**
 * Get current position of a planet
 * @param {string} planetKey - Planet identifier (e.g., 'earth')
 * @returns {THREE.Vector3|null}
 */
export function getPlanetPosition(planetKey) {
    const planet = planetMeshes[planetKey];
    return planet ? planet.position.clone() : null;
}

/**
 * Get planet data by key
 * @param {string} planetKey - Planet identifier (e.g., 'earth')
 * @returns {Object|null}
 */
export function getPlanetData(planetKey) {
    return PLANETS[planetKey] || null;
}

/**
 * Get planet radius in scene units
 * @param {string} planetKey - Planet identifier (e.g., 'earth')
 * @returns {number}
 */
export function getPlanetRadius(planetKey) {
    const planetData = PLANETS[planetKey];
    return planetData ? scaleRadius(planetData.radius, 'planet', planetKey) : 0;
}

/**
 * Get planet orbit radius in scene units
 * @param {string} planetKey - Planet identifier (e.g., 'earth')
 * @returns {number}
 */
export function getPlanetOrbitRadius(planetKey) {
    const planetData = PLANETS[planetKey];
    return planetData ? auToScene(planetData.orbitRadius) : 0;
}

/**
 * Set custom starting angle for a planet
 * @param {string} planetKey - Planet identifier
 * @param {number} angle - Starting angle in radians
 */
export function setPlanetStartAngle(planetKey, angle) {
    if (startAngles.hasOwnProperty(planetKey)) {
        startAngles[planetKey] = angle;
    }
}

/**
 * Dispose of a single planet's resources
 * @param {string} planetKey - Planet identifier
 */
function disposePlanet(planetKey) {
    const planetMesh = planetMeshes[planetKey];
    if (planetMesh) {
        removeFromScene(planetMesh);
        planetMesh.geometry.dispose();
        planetMesh.material.dispose();
        delete planetMeshes[planetKey];
    }
}

/**
 * Dispose of all planet resources
 */
export function disposePlanets() {
    Object.keys(planetMeshes).forEach(planetKey => {
        disposePlanet(planetKey);
    });
}

/**
 * Clean up and remove all planets
 */
export function removePlanets() {
    disposePlanets();
    console.log('✅ All planets removed');
}

/**
 * Remove a specific planet
 * @param {string} planetKey - Planet identifier
 */
export function removePlanet(planetKey) {
    disposePlanet(planetKey);
    console.log(`✅ Planet removed: ${planetKey}`);
}

/**
 * Check if a planet exists
 * @param {string} planetKey - Planet identifier
 * @returns {boolean}
 */
export function hasPlanet(planetKey) {
    return planetMeshes.hasOwnProperty(planetKey) && planetMeshes[planetKey] !== null;
}

/**
 * Get number of planets currently rendered
 * @returns {number}
 */
export function getPlanetCount() {
    return Object.keys(planetMeshes).length;
}

/**
 * Set orbital mechanics mode
 * @param {boolean} accurate - True for accurate Keplerian orbits, false for simplified circular
 */
export function setAccurateOrbits(accurate) {
    useAccurateOrbits = accurate;
    console.log(`🌍 Orbital mechanics: ${accurate ? 'ACCURATE (Keplerian)' : 'SIMPLIFIED (Circular)'}`);
}

/**
 * Get current orbital mechanics mode
 * @returns {boolean} True if using accurate orbits
 */
export function isUsingAccurateOrbits() {
    return useAccurateOrbits;
}

/**
 * Toggle between accurate and simplified orbital mechanics
 * @returns {boolean} New state
 */
export function toggleOrbitalMode() {
    useAccurateOrbits = !useAccurateOrbits;
    console.log(`🌍 Orbital mechanics: ${useAccurateOrbits ? 'ACCURATE (Keplerian)' : 'SIMPLIFIED (Circular)'}`);
    return useAccurateOrbits;
}

// Export default object
export default {
    initPlanets,
    updatePlanets,
    updatePlanetsStyle,
    getPlanet,
    getAllPlanets,
    getPlanetPosition,
    getPlanetData,
    getPlanetRadius,
    getPlanetOrbitRadius,
    setPlanetStartAngle,
    removePlanets,
    removePlanet,
    hasPlanet,
    getPlanetCount,
    setAccurateOrbits,
    isUsingAccurateOrbits,
    toggleOrbitalMode
};
