/**
 * Orbits Module - Orbital path visualization
 * Creates and manages orbital path lines for all planets and the Moon
 */

import { PLANETS, SCALE, auToScene, MOON, kmToScene } from '../utils/constants.js';
import { addToScene, removeFromScene } from '../core/scene.js';
import { isUsingAccurateOrbits } from './planets.js';
import { calculatePlanetPosition } from '../utils/orbitalElements.js';

/**
 * Orbit line objects keyed by planet name
 * @type {Object<string, THREE.LineLoop>}
 */
const orbitLines = {};

/**
 * Moon orbit line (Earth-relative)
 * @type {THREE.LineLoop|null}
 */
let moonOrbitLine = null;

/**
 * Current visual style configuration
 * @type {Object}
 */
let currentStyle = null;

/**
 * Current visibility state for orbits
 * @type {boolean}
 */
let orbitsVisible = true;

/**
 * Number of segments to use for orbital path circles
 * Higher = smoother circles, but more expensive to render
 */
const ORBIT_SEGMENTS = 128;

/**
 * Initialize orbital path visualization for all planets
 * @param {Object} styleConfig - Visual style configuration from STYLES
 * @returns {Object} Object containing all orbit line objects
 */
export function initOrbits(styleConfig = {}) {
    console.log('🌐 Initializing orbital paths...');

    currentStyle = styleConfig;

    // Clean up existing orbits if any
    disposeOrbits();

    // Create orbital path for each planet
    Object.keys(PLANETS).forEach(planetKey => {
        const planetData = PLANETS[planetKey];
        createOrbit(planetKey, planetData, styleConfig);
    });

    console.log('✅ Orbital paths initialized for: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune');
    return orbitLines;
}

/**
 * Create a single orbital path line
 * @param {string} planetKey - Planet identifier (e.g., 'mercury')
 * @param {Object} planetData - Planet configuration data
 * @param {Object} styleConfig - Visual style configuration
 */
function createOrbit(planetKey, planetData, styleConfig) {
    const points = [];

    // Check if using accurate Keplerian orbits
    if (isUsingAccurateOrbits()) {
        // ACCURATE ELLIPTICAL ORBIT - sample actual planet positions over one orbit period
        const orbitPeriodDays = planetData.orbitPeriod; // days
        const epochDate = new Date('2000-01-01T12:00:00Z'); // J2000 epoch

        // Sample 256 points along the orbit for smooth ellipse
        const numSamples = 256;
        for (let i = 0; i <= numSamples; i++) {
            // Time fraction through orbit (0 to 1)
            const fraction = i / numSamples;
            // Calculate date at this fraction of orbit
            const daysOffset = fraction * orbitPeriodDays;
            const sampleDate = new Date(epochDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);

            // Get accurate position using Keplerian elements
            const pos = calculatePlanetPosition(planetKey, sampleDate);

            // Convert from AU to scene units
            const x = pos.x * auToScene(1);
            const y = pos.y * auToScene(1);
            const z = pos.z * auToScene(1);

            points.push(new THREE.Vector3(x, y, z));
        }
    } else {
        // SIMPLIFIED CIRCULAR ORBIT in XZ plane
        const orbitRadius = auToScene(planetData.orbitRadius);

        for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
            const angle = (i / ORBIT_SEGMENTS) * Math.PI * 2;
            const x = Math.cos(angle) * orbitRadius;
            const z = Math.sin(angle) * orbitRadius;
            points.push(new THREE.Vector3(x, 0, z));
        }
    }

    // Create buffer geometry from points
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create material based on style
    const material = createOrbitMaterial(planetData, styleConfig);

    // Create line loop (closed circle)
    const orbitLine = new THREE.LineLoop(geometry, material);
    orbitLine.name = `${planetData.name}-Orbit`;
    orbitLine.userData = {
        type: 'orbit',
        planetKey: planetKey
    };

    // Disable frustum culling to prevent disappearing at certain camera angles
    orbitLine.frustumCulled = false;

    // Set render order to ensure orbits render properly
    // Lower values render first, higher values render later
    // Render orbits before transparent objects but after opaque ones
    orbitLine.renderOrder = 1;

    // Add to scene
    addToScene(orbitLine);

    // Store reference
    orbitLines[planetKey] = orbitLine;
}

/**
 * Create orbit line material based on visual style
 * @param {Object} planetData - Planet configuration data
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.LineBasicMaterial}
 */
function createOrbitMaterial(planetData, styleConfig) {
    // Use planet color but make it semi-transparent
    const color = planetData.color;

    // Adjust opacity and appearance based on style
    // INCREASED all opacities for better visibility
    let opacity = 0.6; // Default opacity (increased from 0.3)
    let linewidth = 3; // Thicker lines (note: linewidth > 1 may not work on all platforms)

    if (styleConfig.name === 'Neon/Cyberpunk') {
        opacity = 0.8; // More visible in neon style
        linewidth = 4;
    } else if (styleConfig.name === 'Minimalist/Abstract') {
        opacity = 0.7; // Clean, visible lines
        linewidth = 3;
    } else if (styleConfig.name === 'Cartoon/Stylized') {
        opacity = 0.7;
        linewidth = 4;
    } else {
        // Realistic style - more visible orbit lines
        opacity = 0.5; // Increased from 0.2
        linewidth = 3;
    }

    // Create line material with better rendering settings
    const material = new THREE.LineBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        linewidth: linewidth,
        depthWrite: false, // Prevent z-fighting with other transparent objects
        depthTest: true    // Ensure proper depth testing so orbits render in correct order
    });

    return material;
}

/**
 * Update orbital paths (currently static, no animation needed)
 * This function exists for consistency with other modules
 * @param {number} deltaTime - Time since last frame in milliseconds
 * @param {number} simulationTime - Current simulation time in milliseconds
 */
export function updateOrbits(deltaTime, simulationTime) {
    // Orbital paths are static circles, no updates needed
    // This function exists for consistency with other modules
    // Future: Could animate dashed line patterns or add orbital direction indicators
}

/**
 * Update orbital path appearance based on visual style
 * @param {Object} styleConfig - New style configuration
 */
export function updateOrbitsStyle(styleConfig) {
    currentStyle = styleConfig;

    Object.keys(PLANETS).forEach(planetKey => {
        const planetData = PLANETS[planetKey];
        const orbitLine = orbitLines[planetKey];

        if (!orbitLine) return;

        // Update material
        const newMaterial = createOrbitMaterial(planetData, styleConfig);
        orbitLine.material.dispose();
        orbitLine.material = newMaterial;
    });

    console.log(`✅ Orbital paths style updated to: ${styleConfig.name}`);
}

/**
 * Toggle visibility of all orbital paths (including Moon orbit)
 * @param {boolean} visible - Whether orbits should be visible
 */
export function setOrbitsVisible(visible) {
    orbitsVisible = visible;

    Object.values(orbitLines).forEach(orbitLine => {
        orbitLine.visible = visible;
    });

    // Also toggle Moon orbit visibility
    if (moonOrbitLine) {
        moonOrbitLine.visible = visible;
    }

    console.log(`🌐 Orbital paths ${visible ? 'shown' : 'hidden'}`);
}

/**
 * Get current visibility state of orbits
 * @returns {boolean}
 */
export function areOrbitsVisible() {
    return orbitsVisible;
}

/**
 * Toggle orbital path visibility (on/off)
 */
export function toggleOrbits() {
    setOrbitsVisible(!orbitsVisible);
}

/**
 * Get a specific orbit line
 * @param {string} planetKey - Planet identifier (e.g., 'earth')
 * @returns {THREE.LineLoop|null}
 */
export function getOrbit(planetKey) {
    return orbitLines[planetKey] || null;
}

/**
 * Get all orbit lines
 * @returns {Object<string, THREE.LineLoop>}
 */
export function getAllOrbits() {
    return orbitLines;
}

/**
 * Set visibility for a specific orbit
 * @param {string} planetKey - Planet identifier
 * @param {boolean} visible - Whether orbit should be visible
 */
export function setOrbitVisible(planetKey, visible) {
    const orbit = orbitLines[planetKey];
    if (orbit) {
        orbit.visible = visible;
    }
}

/**
 * Dispose of a single orbit's resources
 * @param {string} planetKey - Planet identifier
 */
function disposeOrbit(planetKey) {
    const orbitLine = orbitLines[planetKey];
    if (orbitLine) {
        removeFromScene(orbitLine);
        orbitLine.geometry.dispose();
        orbitLine.material.dispose();
        delete orbitLines[planetKey];
    }
}

/**
 * Dispose of all orbital path resources (including Moon orbit)
 */
export function disposeOrbits() {
    Object.keys(orbitLines).forEach(planetKey => {
        disposeOrbit(planetKey);
    });
    disposeMoonOrbit();
    console.log('✅ All orbital paths disposed');
}

/**
 * Remove all orbits from scene
 */
export function removeOrbits() {
    disposeOrbits();
}

/**
 * Check if orbits are initialized
 * @returns {boolean}
 */
export function hasOrbits() {
    return Object.keys(orbitLines).length > 0;
}

/**
 * Get number of orbits currently rendered
 * @returns {number}
 */
export function getOrbitCount() {
    return Object.keys(orbitLines).length;
}

/**
 * Initialize Moon orbit visualization
 * @param {Object} styleConfig - Visual style configuration
 * @param {THREE.Vector3} earthPosition - Current Earth position
 * @param {string} planetSizeMode - Planet size mode ('real' or 'enlarged')
 */
export function initMoonOrbit(styleConfig, earthPosition = null, planetSizeMode = 'enlarged') {
    // Clean up existing Moon orbit
    disposeMoonOrbit();

    if (!earthPosition) {
        earthPosition = new THREE.Vector3(0, 0, 0); // Default to origin if Earth not available
    }

    // Calculate Moon orbit radius based on planet size mode
    let orbitRadiusScene;

    if (planetSizeMode === 'enlarged') {
        // In enlarged mode: apply 50x scale to make visible around giant planets
        orbitRadiusScene = kmToScene(MOON.orbitRadius) * SCALE.MOON_ORBIT_SCALE;
        console.log(`🌙 Moon orbit ENLARGED: ${orbitRadiusScene.toFixed(2)} scene units [LARGE]`);
    } else {
        // In real mode: NO extra scaling, use accurate proportions
        orbitRadiusScene = kmToScene(MOON.orbitRadius);
        console.log(`🌙 Moon orbit REAL: ${orbitRadiusScene.toFixed(2)} scene units [TINY]`);
    }

    // Create circle geometry for Moon's orbit around Earth
    const points = [];
    for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
        const angle = (i / ORBIT_SEGMENTS) * Math.PI * 2;
        const x = Math.cos(angle) * orbitRadiusScene;
        const z = Math.sin(angle) * orbitRadiusScene;
        // Moon orbits in XZ plane relative to Earth
        points.push(new THREE.Vector3(x, 0, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create material (similar style to planet orbits but dimmer)
    const material = new THREE.LineBasicMaterial({
        color: MOON.color,
        opacity: 0.4, // Slightly dimmer than planet orbits
        transparent: true,
        linewidth: 2,
        depthWrite: false,
        depthTest: true
    });

    moonOrbitLine = new THREE.LineLoop(geometry, material);
    moonOrbitLine.name = 'Moon-Orbit';
    moonOrbitLine.userData = {
        type: 'orbit',
        objectKey: 'moon'
    };

    // Position at Earth's location
    moonOrbitLine.position.copy(earthPosition);

    // Disable frustum culling
    moonOrbitLine.frustumCulled = false;
    moonOrbitLine.renderOrder = 1;

    // Set visibility based on current orbits visibility state
    moonOrbitLine.visible = orbitsVisible;

    addToScene(moonOrbitLine);

    console.log(`✅ Moon orbit initialized at Earth position (${earthPosition.x.toFixed(0)}, ${earthPosition.y.toFixed(0)}, ${earthPosition.z.toFixed(0)})`);
}

/**
 * Update Moon orbit position to follow Earth
 * @param {THREE.Vector3} earthPosition - Current Earth position
 */
export function updateMoonOrbit(earthPosition) {
    if (!moonOrbitLine || !earthPosition) return;

    // Update Moon orbit position to match Earth's position
    moonOrbitLine.position.copy(earthPosition);
}

/**
 * Dispose Moon orbit
 */
export function disposeMoonOrbit() {
    if (moonOrbitLine) {
        removeFromScene(moonOrbitLine);
        moonOrbitLine.geometry.dispose();
        moonOrbitLine.material.dispose();
        moonOrbitLine = null;
        console.log('✅ Moon orbit disposed');
    }
}

/**
 * Get Moon orbit line
 * @returns {THREE.LineLoop|null}
 */
export function getMoonOrbit() {
    return moonOrbitLine;
}

// Export default object
export default {
    initOrbits,
    updateOrbits,
    updateOrbitsStyle,
    setOrbitsVisible,
    areOrbitsVisible,
    toggleOrbits,
    getOrbit,
    getAllOrbits,
    setOrbitVisible,
    disposeOrbits,
    removeOrbits,
    hasOrbits,
    getOrbitCount,
    initMoonOrbit,
    updateMoonOrbit,
    disposeMoonOrbit,
    getMoonOrbit
};
