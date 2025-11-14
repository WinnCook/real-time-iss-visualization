/**
 * Major Moons Module - Orbital mechanics and rendering for Jupiter & Saturn's moons
 * Creates and manages 7 major moons: Io, Europa, Ganymede, Callisto (Jupiter) + Titan, Rhea, Iapetus (Saturn)
 */

import { MAJOR_MOONS, PLANETS, RENDER, scaleRadius, kmToScene, DEG_TO_RAD, TWO_PI, daysToMs, SCALE, getPlanetSizeMode } from '../utils/constants.js';
import { addToScene, removeFromScene } from '../core/scene.js';
import { getCachedSphereGeometry } from '../utils/geometryCache.js';
import { isRotationEnabled } from './performanceSlider.js';

/**
 * THREE.js is loaded globally from CDN
 */
const THREE = window.THREE;

/**
 * Moon mesh objects keyed by moon name
 * @type {Object<string, THREE.Mesh>}
 */
const moonMeshes = {};

/**
 * Starting angles for each moon (for visual distribution around parent planet)
 * @type {Object<string, number>}
 */
const startAngles = {
    io: 0,
    europa: Math.PI / 2,
    ganymede: Math.PI,
    callisto: (3 * Math.PI) / 2,
    titan: 0,
    rhea: Math.PI / 3,
    iapetus: (2 * Math.PI) / 3
};

/**
 * Current visual style configuration
 * @type {Object}
 */
let currentStyle = null;

/**
 * Cached orbital data for performance optimization
 * @type {Object}
 */
const cachedOrbitalData = {};

/**
 * Reference to planet meshes (will be set by solarSystem.js)
 * @type {Object}
 */
let planetMeshesRef = null;

/**
 * Initialize all major moons
 * @param {Object} styleConfig - Visual style configuration
 * @param {Object} planetMeshes - Reference to planet mesh objects
 * @returns {Object} Object containing all moon meshes
 */
export async function initMajorMoons(styleConfig = {}, planetMeshes = {}) {
    currentStyle = styleConfig;
    planetMeshesRef = planetMeshes;

    // Clean up existing moons if any
    disposeMajorMoons();

    // Create each moon
    for (const moonKey of Object.keys(MAJOR_MOONS)) {
        const moonData = MAJOR_MOONS[moonKey];
        await createMoon(moonKey, moonData, styleConfig);

        // Pre-calculate and cache orbital data for this moon (OPTIMIZATION)
        // Real mode: Apply SAME 100x scale as parent planets for accurate proportions
        // Enlarged mode: Apply 50x scaling for visibility
        const sizeMode = getPlanetSizeMode();
        const orbitScale = sizeMode === 'real' ? 100 : SCALE.MAJOR_MOON_ORBIT_SCALE;

        const orbitRadiusScene = kmToScene(moonData.orbitRadius) * orbitScale;

        // DEBUG: Log cached data creation
        console.log(`\n🌙 Caching ${moonData.name} orbital data:`);
        console.log(`  Mode: ${sizeMode}, Scale: ${orbitScale}`);
        console.log(`  Orbit radius (km): ${moonData.orbitRadius}`);
        console.log(`  Orbit radius (scene): ${orbitRadiusScene.toFixed(4)}`);

        cachedOrbitalData[moonKey] = {
            orbitRadiusScene: orbitRadiusScene,
            periodMs: daysToMs(moonData.orbitPeriod),
            rotationSpeedPerSec: (Math.PI * 2) / (moonData.rotationPeriod * 24 * 60 * 60)
        };
    }

    console.log('\n✅ Major Moons initialized: Io, Europa, Ganymede, Callisto (Jupiter) + Titan, Rhea, Iapetus (Saturn)');
    return moonMeshes;
}

/**
 * Create a single moon mesh
 * @param {string} moonKey - Moon identifier (e.g., 'io')
 * @param {Object} moonData - Moon configuration data
 * @param {Object} styleConfig - Visual style configuration
 */
async function createMoon(moonKey, moonData, styleConfig) {
    // Calculate moon radius with scaling (scaleRadius already handles the multiplier)
    const moonRadius = scaleRadius(moonData.radius, 'moon');

    // Get cached moon geometry (reuse if possible)
    const geometry = getCachedSphereGeometry(
        moonRadius,
        RENDER.SPHERE_SEGMENTS,
        RENDER.SPHERE_SEGMENTS
    );

    // Create moon material based on style
    const material = createMoonMaterial(moonKey, moonData, styleConfig);

    // Create moon mesh
    const moonMesh = new THREE.Mesh(geometry, material);
    moonMesh.name = moonData.name;

    // Add to scene
    addToScene(moonMesh);

    // Store reference
    moonMeshes[moonKey] = moonMesh;
}

/**
 * Create moon material based on visual style
 * @param {string} moonKey - Moon identifier (e.g., 'io')
 * @param {Object} moonData - Moon configuration data
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Material}
 */
function createMoonMaterial(moonKey, moonData, styleConfig) {
    const color = moonData.color;

    // Check style-specific properties
    const flatShading = styleConfig.flatShading || false;
    const wireframe = styleConfig.wireframe || false;

    // For neon style, add some emissive glow
    const emissive = styleConfig.name === 'Neon/Cyberpunk' ? color : 0x000000;
    const emissiveIntensity = styleConfig.name === 'Neon/Cyberpunk' ? 0.3 : 0;

    // SOLID COLOR MATERIAL (textures for moons can be added in future)
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        flatShading: flatShading,
        wireframe: wireframe,
        roughness: 0.8,
        metalness: 0.1
    });

    return material;
}

/**
 * Update all moon positions and rotations
 * @param {number} deltaTime - Time since last frame in milliseconds
 * @param {number} simulationTime - Current simulation time in milliseconds
 */
export function updateMajorMoons(deltaTime, simulationTime) {
    // Convert deltaTime from milliseconds to seconds for rotation calculations
    const deltaTimeSeconds = deltaTime / 1000;

    Object.keys(MAJOR_MOONS).forEach(moonKey => {
        const moonMesh = moonMeshes[moonKey];
        if (!moonMesh) return;

        const moonData = MAJOR_MOONS[moonKey];
        const parentPlanetKey = moonData.parentPlanet;
        const parentPlanetMesh = planetMeshesRef?.[parentPlanetKey];

        if (!parentPlanetMesh) {
            console.warn(`⚠️ Parent planet ${parentPlanetKey} not found for moon ${moonKey}`);
            return;
        }

        // Get parent planet's current position
        const parentPosition = parentPlanetMesh.position;

        // Calculate moon's orbital position relative to parent planet
        const cached = cachedOrbitalData[moonKey];
        const angle = startAngles[moonKey] + (simulationTime / cached.periodMs) * TWO_PI;

        // Calculate position on circular orbit (XZ plane around parent)
        const localX = Math.cos(angle) * cached.orbitRadiusScene;
        const localZ = Math.sin(angle) * cached.orbitRadiusScene;

        // Set moon position = parent position + local orbit offset
        moonMesh.position.set(
            parentPosition.x + localX,
            parentPosition.y, // Same Y as parent (moons orbit in equatorial plane)
            parentPosition.z + localZ
        );

        // DEBUG: Log actual distance for first update of Callisto
        if (moonKey === 'callisto' && simulationTime < 100) {
            const actualDistance = Math.sqrt(localX * localX + localZ * localZ);
            console.log(`\n🔍 Callisto actual position check:`);
            console.log(`  Cached orbit radius: ${cached.orbitRadiusScene.toFixed(4)}`);
            console.log(`  Actual distance from Jupiter: ${actualDistance.toFixed(4)}`);
            console.log(`  Match: ${Math.abs(cached.orbitRadiusScene - actualDistance) < 0.01 ? '✅ YES' : '❌ NO'}`);
        }

        // Update moon rotation on its axis (using cached rotation speed)
        // Skip rotation if performance level is ultra-low (optimization)
        if (isRotationEnabled()) {
            moonMesh.rotation.y += cached.rotationSpeedPerSec * deltaTimeSeconds;
        }

        // Update world matrix so labels can get correct positions
        moonMesh.updateMatrixWorld(true);
    });
}

/**
 * Get moon mesh by key
 * @param {string} moonKey - Moon identifier (e.g., 'io')
 * @returns {THREE.Mesh|null}
 */
export function getMoonMesh(moonKey) {
    return moonMeshes[moonKey] || null;
}

/**
 * Get all moon meshes
 * @returns {Object} Object containing all moon meshes
 */
export function getAllMoonMeshes() {
    return moonMeshes;
}

/**
 * Clean up and dispose all moon resources
 */
export function disposeMajorMoons() {
    Object.values(moonMeshes).forEach(moonMesh => {
        if (moonMesh) {
            // Remove from scene
            removeFromScene(moonMesh);

            // Dispose geometry and material
            if (moonMesh.geometry) moonMesh.geometry.dispose();
            if (moonMesh.material) moonMesh.material.dispose();
        }
    });

    // Clear the moon meshes object
    Object.keys(moonMeshes).forEach(key => delete moonMeshes[key]);
}

/**
 * Update planet size mode (enlarged vs real proportions)
 * This is called when the user toggles between size modes
 * @param {string} mode - 'enlarged' or 'real'
 */
export async function updateMoonSizeMode(mode) {
    console.log(`🌙 Updating major moons for ${mode.toUpperCase()} size mode...`);

    if (currentStyle && planetMeshesRef) {
        // Rebuild all moons with new size mode
        await initMajorMoons(currentStyle, planetMeshesRef);
        console.log('✅ Major moons rebuilt for new size mode');
    }
}

/**
 * Update moon appearance based on visual style
 * @param {Object} styleConfig - New style configuration
 */
export function updateMoonsStyle(styleConfig) {
    currentStyle = styleConfig;

    Object.keys(MAJOR_MOONS).forEach(moonKey => {
        const moonData = MAJOR_MOONS[moonKey];
        const moonMesh = moonMeshes[moonKey];

        if (!moonMesh) return;

        // Update material
        const newMaterial = createMoonMaterial(moonKey, moonData, styleConfig);
        moonMesh.material.dispose();
        moonMesh.material = newMaterial;
    });

    console.log(`✅ Major moons style updated to: ${styleConfig.name}`);
}

export default {
    initMajorMoons,
    updateMajorMoons,
    getMoonMesh,
    getAllMoonMeshes,
    disposeMajorMoons,
    updateMoonSizeMode,
    updateMoonsStyle
};
