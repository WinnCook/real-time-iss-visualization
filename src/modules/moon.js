/**
 * Moon Module - Moon orbital mechanics and rendering
 * Creates and manages the Moon orbiting Earth
 */

import { MOON, RENDER, SCALE, scaleRadius, kmToScene, DEG_TO_RAD, TWO_PI, daysToMs } from '../utils/constants.js';
import { calculateMoonPosition } from '../utils/orbital.js';
import { addToScene, removeFromScene } from '../core/scene.js';

/**
 * Moon mesh object
 * @type {THREE.Mesh|null}
 */
let moonMesh = null;

/**
 * Starting angle for the Moon's orbit (for visual distribution)
 * @type {number}
 */
let startAngle = 0;

/**
 * Current visual style configuration
 * @type {Object}
 */
let currentStyle = null;

/**
 * Initialize the Moon
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Mesh|null} The moon mesh
 */
export function initMoon(styleConfig = {}) {
    currentStyle = styleConfig;

    // Clean up existing moon if any
    disposeMoon();

    // Create the Moon
    createMoon(styleConfig);

    console.log('✅ Moon initialized');
    return moonMesh;
}

/**
 * Create the Moon mesh
 * @param {Object} styleConfig - Visual style configuration
 */
function createMoon(styleConfig) {
    // Calculate moon radius with scaling
    const moonRadius = scaleRadius(MOON.radius, 'moon');

    // Create moon geometry
    const geometry = new THREE.SphereGeometry(
        moonRadius,
        RENDER.SPHERE_SEGMENTS,
        RENDER.SPHERE_SEGMENTS
    );

    // Create moon material based on style
    const material = createMoonMaterial(styleConfig);

    // Create moon mesh
    moonMesh = new THREE.Mesh(geometry, material);
    moonMesh.name = MOON.name;

    // Add to scene
    addToScene(moonMesh);
}

/**
 * Create moon material based on visual style
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Material}
 */
function createMoonMaterial(styleConfig) {
    const color = MOON.color;

    // Check style-specific properties
    const flatShading = styleConfig.flatShading || false;
    const wireframe = styleConfig.wireframe || false;

    // For neon style, add some emissive glow
    const emissive = styleConfig.name === 'Neon/Cyberpunk' ? color : 0x000000;
    const emissiveIntensity = styleConfig.name === 'Neon/Cyberpunk' ? 0.2 : 0;

    // Create material
    // Moon has a slightly rougher surface than planets
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        flatShading: flatShading,
        wireframe: wireframe,
        roughness: 0.9,
        metalness: 0.1
    });

    return material;
}

/**
 * Update Moon position and rotation
 * @param {number} deltaTime - Time since last frame in milliseconds
 * @param {number} simulationTime - Current simulation time in milliseconds
 * @param {THREE.Vector3} earthPosition - Current position of Earth
 */
export function updateMoon(deltaTime, simulationTime, earthPosition) {
    if (!moonMesh || !earthPosition) return;

    // Calculate Moon's orbital position relative to Earth
    const position = calculateMoonPosition(
        simulationTime,
        earthPosition,
        MOON,
        startAngle
    );

    // Update mesh position
    moonMesh.position.set(position.x, position.y, position.z);

    // Implement tidal locking: Moon's rotation matches its orbital position
    // This ensures the same face always points toward Earth
    const periodMs = daysToMs(MOON.orbitPeriod);
    const orbitalAngle = startAngle + (simulationTime / periodMs) * TWO_PI;

    // The Moon's rotation should match its orbital angle to maintain tidal locking
    // We rotate around Y-axis to keep the same face toward Earth
    moonMesh.rotation.y = orbitalAngle;
}

/**
 * Update Moon appearance based on visual style
 * @param {Object} styleConfig - New style configuration
 */
export function updateMoonStyle(styleConfig) {
    currentStyle = styleConfig;

    if (!moonMesh) return;

    // Update material
    const newMaterial = createMoonMaterial(styleConfig);
    moonMesh.material.dispose();
    moonMesh.material = newMaterial;

    console.log(`✅ Moon style updated to: ${styleConfig.name}`);
}

/**
 * Get the Moon mesh
 * @returns {THREE.Mesh|null}
 */
export function getMoon() {
    return moonMesh;
}

/**
 * Get current position of the Moon
 * @returns {THREE.Vector3|null}
 */
export function getMoonPosition() {
    return moonMesh ? moonMesh.position.clone() : null;
}

/**
 * Get Moon data
 * @returns {Object}
 */
export function getMoonData() {
    return MOON;
}

/**
 * Get Moon radius in scene units
 * @returns {number}
 */
export function getMoonRadius() {
    return scaleRadius(MOON.radius, 'moon');
}

/**
 * Get Moon orbit radius in scene units (with scaling applied)
 * @returns {number}
 */
export function getMoonOrbitRadius() {
    return kmToScene(MOON.orbitRadius) * SCALE.MOON_ORBIT_SCALE;
}

/**
 * Set custom starting angle for the Moon
 * @param {number} angle - Starting angle in radians
 */
export function setMoonStartAngle(angle) {
    startAngle = angle;
}

/**
 * Get Moon's starting angle
 * @returns {number}
 */
export function getMoonStartAngle() {
    return startAngle;
}

/**
 * Dispose of the Moon's resources
 */
function disposeMoon() {
    if (moonMesh) {
        removeFromScene(moonMesh);
        moonMesh.geometry.dispose();
        moonMesh.material.dispose();
        moonMesh = null;
    }
}

/**
 * Clean up and remove the Moon
 */
export function removeMoon() {
    disposeMoon();
    console.log('✅ Moon removed');
}

/**
 * Check if Moon exists
 * @returns {boolean}
 */
export function hasMoon() {
    return moonMesh !== null;
}

/**
 * Get distance from Moon to Earth in scene units
 * @param {THREE.Vector3} earthPosition - Current position of Earth
 * @returns {number} Distance in scene units
 */
export function getDistanceToEarth(earthPosition) {
    if (!moonMesh || !earthPosition) return 0;
    return moonMesh.position.distanceTo(earthPosition);
}

/**
 * Calculate Moon's current orbital angle around Earth
 * @param {number} simulationTime - Current simulation time in milliseconds
 * @returns {number} Orbital angle in radians (0 to 2π)
 */
export function getMoonOrbitalAngle(simulationTime) {
    const periodMs = daysToMs(MOON.orbitPeriod);
    const angle = (startAngle + (simulationTime / periodMs) * TWO_PI) % TWO_PI;
    return angle < 0 ? angle + TWO_PI : angle;
}

// Export default object
export default {
    initMoon,
    updateMoon,
    updateMoonStyle,
    getMoon,
    getMoonPosition,
    getMoonData,
    getMoonRadius,
    getMoonOrbitRadius,
    setMoonStartAngle,
    getMoonStartAngle,
    removeMoon,
    hasMoon,
    getDistanceToEarth,
    getMoonOrbitalAngle
};
