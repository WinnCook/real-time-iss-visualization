/**
 * Starfield Module - Background star field
 * Creates a realistic starfield with thousands of stars at varying distances and brightness
 */

import { addToScene, removeFromScene } from '../core/scene.js';

/**
 * Starfield mesh (THREE.Points)
 * @type {THREE.Points|null}
 */
let starfield = null;

/**
 * Current visibility state
 * @type {boolean}
 */
let isVisible = true;

/**
 * Current visual style configuration
 * @type {Object}
 */
let currentStyle = null;

/**
 * Number of stars to generate
 */
const STAR_COUNT = 15000;

/**
 * Star field radius (how far away stars are)
 */
const STAR_FIELD_RADIUS = 8000;

/**
 * Initialize the starfield
 * @param {Object} styleConfig - Visual style configuration from STYLES
 * @returns {THREE.Points} Starfield points mesh
 */
export function initStarfield(styleConfig = {}) {
    console.log('⭐ Initializing starfield...');

    currentStyle = styleConfig;

    // Clean up existing starfield if any
    disposeStarfield();

    // Create starfield
    starfield = createStarfield(styleConfig);
    addToScene(starfield);

    console.log(`✅ Starfield initialized with ${STAR_COUNT} stars`);
    return starfield;
}

/**
 * Create starfield mesh with thousands of stars
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Points} Starfield points mesh
 */
function createStarfield(styleConfig) {
    // Create buffer geometry for stars
    const geometry = new THREE.BufferGeometry();

    // Arrays for star positions and colors
    const positions = [];
    const colors = [];
    const sizes = [];

    // Generate random stars distributed in a sphere
    for (let i = 0; i < STAR_COUNT; i++) {
        // Random position on sphere surface (with some depth variation)
        const theta = Math.random() * Math.PI * 2; // Azimuth angle
        const phi = Math.acos((Math.random() * 2) - 1); // Polar angle (uniform distribution)

        // Distance variation (stars at different depths)
        const distance = STAR_FIELD_RADIUS * (0.8 + Math.random() * 0.2);

        // Convert spherical to Cartesian coordinates
        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.sin(phi) * Math.sin(theta);
        const z = distance * Math.cos(phi);

        positions.push(x, y, z);

        // Star color variation (most stars white, some slightly blue or yellow)
        const colorVariation = Math.random();
        let r, g, b;

        if (colorVariation < 0.7) {
            // 70% white stars
            r = g = b = 1.0;
        } else if (colorVariation < 0.85) {
            // 15% blue-white stars (hot)
            r = 0.7 + Math.random() * 0.3;
            g = 0.8 + Math.random() * 0.2;
            b = 1.0;
        } else {
            // 15% yellow-white stars (cooler)
            r = 1.0;
            g = 0.8 + Math.random() * 0.2;
            b = 0.6 + Math.random() * 0.3;
        }

        colors.push(r, g, b);

        // Star size variation (magnitude/brightness)
        // Realistic distribution: most stars small, few bright ones
        const brightness = Math.pow(Math.random(), 3); // Cubic distribution favors smaller stars
        const size = 1.0 + brightness * 3.0; // Size range 1-4
        sizes.push(size);
    }

    // Set geometry attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Create material based on style
    const material = createStarfieldMaterial(styleConfig);

    // Create points mesh
    const points = new THREE.Points(geometry, material);
    points.name = 'Starfield';
    points.userData = {
        type: 'starfield'
    };

    return points;
}

/**
 * Create starfield material based on visual style
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.PointsMaterial}
 */
function createStarfieldMaterial(styleConfig) {
    // Adjust appearance based on style
    let size = 2.0;
    let opacity = 0.8;
    let sizeAttenuation = true; // Stars get smaller with distance

    if (styleConfig.name === 'Neon/Cyberpunk') {
        size = 3.0; // Bigger, glowier stars
        opacity = 0.9;
    } else if (styleConfig.name === 'Minimalist/Abstract') {
        size = 1.5; // Smaller, subtle stars
        opacity = 0.6;
    } else if (styleConfig.name === 'Cartoon/Stylized') {
        size = 2.5;
        opacity = 0.7;
    } else {
        // Realistic
        size = 2.0;
        opacity = 0.8;
    }

    const material = new THREE.PointsMaterial({
        size: size,
        vertexColors: true, // Use per-vertex colors
        transparent: true,
        opacity: opacity,
        sizeAttenuation: sizeAttenuation,
        depthWrite: false, // Don't write to depth buffer (stars are background)
        blending: THREE.AdditiveBlending // Stars glow
    });

    return material;
}

/**
 * Update starfield (currently static, no animation)
 * @param {number} deltaTime - Time since last frame in milliseconds
 * @param {number} simulationTime - Current simulation time in milliseconds
 */
export function updateStarfield(deltaTime, simulationTime) {
    // Starfield is static, no updates needed
    // Could add slow rotation or twinkling effect here in the future
}

/**
 * Update starfield appearance based on visual style
 * @param {Object} styleConfig - New style configuration
 */
export function updateStarfieldStyle(styleConfig) {
    currentStyle = styleConfig;

    if (!starfield) return;

    // Update material
    const newMaterial = createStarfieldMaterial(styleConfig);
    starfield.material.dispose();
    starfield.material = newMaterial;

    console.log(`✅ Starfield style updated to: ${styleConfig.name}`);
}

/**
 * Toggle starfield visibility
 * @param {boolean} visible - Whether starfield should be visible
 */
export function setStarfieldVisible(visible) {
    isVisible = visible;

    if (starfield) {
        starfield.visible = visible;
    }

    console.log(`⭐ Starfield ${visible ? 'shown' : 'hidden'}`);
}

/**
 * Get current visibility state
 * @returns {boolean}
 */
export function isStarfieldVisible() {
    return isVisible;
}

/**
 * Toggle starfield visibility (on/off)
 */
export function toggleStarfield() {
    setStarfieldVisible(!isVisible);
}

/**
 * Get starfield mesh
 * @returns {THREE.Points|null}
 */
export function getStarfield() {
    return starfield;
}

/**
 * Dispose starfield resources
 */
export function disposeStarfield() {
    if (starfield) {
        removeFromScene(starfield);
        starfield.geometry.dispose();
        starfield.material.dispose();
        starfield = null;
        console.log('✅ Starfield disposed');
    }
}

/**
 * Check if starfield is initialized
 * @returns {boolean}
 */
export function hasStarfield() {
    return starfield !== null;
}

// Export default object
export default {
    initStarfield,
    updateStarfield,
    updateStarfieldStyle,
    setStarfieldVisible,
    isStarfieldVisible,
    toggleStarfield,
    getStarfield,
    disposeStarfield,
    hasStarfield
};
