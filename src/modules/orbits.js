/**
 * Orbits Module - Orbital path visualization
 * Creates and manages orbital path lines for all planets
 */

import { PLANETS, SCALE, auToScene } from '../utils/constants.js';
import { addToScene, removeFromScene } from '../core/scene.js';

/**
 * Orbit line objects keyed by planet name
 * @type {Object<string, THREE.LineLoop>}
 */
const orbitLines = {};

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
    // Calculate orbit radius in scene units
    const orbitRadius = auToScene(planetData.orbitRadius);

    // Create circular path geometry
    const points = [];
    for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
        const angle = (i / ORBIT_SEGMENTS) * Math.PI * 2;
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        points.push(new THREE.Vector3(x, 0, z));
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
    let opacity = 0.3; // Default opacity
    let linewidth = SCALE.ORBIT_LINE_WIDTH;

    if (styleConfig.name === 'Neon/Cyberpunk') {
        opacity = 0.6; // More visible in neon style
        linewidth = 2;
    } else if (styleConfig.name === 'Minimalist/Abstract') {
        opacity = 0.5; // Clean, visible lines
        linewidth = 1;
    } else if (styleConfig.name === 'Cartoon/Stylized') {
        opacity = 0.4;
        linewidth = 2;
    } else {
        // Realistic style - subtle orbit lines
        opacity = 0.2;
        linewidth = 1;
    }

    // Create line material
    const material = new THREE.LineBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: true,
        linewidth: linewidth,
        depthWrite: false // Prevent z-fighting with other transparent objects
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
 * Toggle visibility of all orbital paths
 * @param {boolean} visible - Whether orbits should be visible
 */
export function setOrbitsVisible(visible) {
    orbitsVisible = visible;

    Object.values(orbitLines).forEach(orbitLine => {
        orbitLine.visible = visible;
    });

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
 * Dispose of all orbital path resources
 */
export function disposeOrbits() {
    Object.keys(orbitLines).forEach(planetKey => {
        disposeOrbit(planetKey);
    });
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
    getOrbitCount
};
