/**
 * Visual Styles Module - Manages visual style switching and theming
 * Coordinates style changes across all visualization modules
 */

import { STYLES } from '../utils/constants.js';
import { scene } from '../core/scene.js';

/**
 * Current active style key
 * @type {string}
 */
let currentStyleKey = 'realistic';

/**
 * Current active style configuration
 * @type {Object}
 */
let currentStyleConfig = STYLES.realistic;

/**
 * Callback function to recreate celestial objects when style changes
 * This is set by the main application
 * @type {Function|null}
 */
let recreateObjectsCallback = null;

/**
 * Initialize the styles system
 * @param {string} initialStyle - Initial style key (default: 'realistic')
 * @param {Function} recreateCallback - Callback to recreate objects on style change
 */
export function initStyles(initialStyle = 'realistic', recreateCallback = null) {
    currentStyleKey = initialStyle;
    currentStyleConfig = STYLES[initialStyle];
    recreateObjectsCallback = recreateCallback;

    // Apply initial style to scene
    applyStyleToScene(currentStyleConfig);

    console.log(`✅ Styles system initialized with '${initialStyle}' style`);
}

/**
 * Get the current active style key
 * @returns {string} Current style key
 */
export function getCurrentStyleKey() {
    return currentStyleKey;
}

/**
 * Get the current active style configuration
 * @returns {Object} Current style config
 */
export function getCurrentStyle() {
    return currentStyleConfig;
}

/**
 * Get a specific style configuration by key
 * @param {string} styleKey - Style key (e.g., 'realistic', 'cartoon', 'neon', 'minimalist')
 * @returns {Object|null} Style configuration or null if not found
 */
export function getStyle(styleKey) {
    return STYLES[styleKey] || null;
}

/**
 * Get all available style keys
 * @returns {string[]} Array of style keys
 */
export function getAvailableStyles() {
    return Object.keys(STYLES);
}

/**
 * Switch to a new visual style
 * @param {string} newStyleKey - The style key to switch to
 * @returns {boolean} True if style was changed, false if already active or invalid
 */
export function switchStyle(newStyleKey) {
    // Validate style exists
    if (!STYLES[newStyleKey]) {
        console.error(`❌ Invalid style key: ${newStyleKey}`);
        return false;
    }

    // Check if already active
    if (newStyleKey === currentStyleKey) {
        console.log(`ℹ️ Style '${newStyleKey}' is already active`);
        return false;
    }

    console.log(`🎨 Switching style from '${currentStyleKey}' to '${newStyleKey}'...`);

    // Update current style
    currentStyleKey = newStyleKey;
    currentStyleConfig = STYLES[newStyleKey];

    // Apply new style to scene
    applyStyleToScene(currentStyleConfig);

    // Recreate all celestial objects with new style
    if (recreateObjectsCallback) {
        recreateObjectsCallback(currentStyleConfig);
    }

    // Update UI to reflect active style
    updateStyleButtons(newStyleKey);

    console.log(`✅ Style switched to '${newStyleKey}'`);
    return true;
}

/**
 * Apply style configuration to the Three.js scene
 * @param {Object} styleConfig - Style configuration object
 */
function applyStyleToScene(styleConfig) {
    if (!scene) {
        console.warn('⚠️ Scene not available for style application');
        return;
    }

    // Update scene background color
    scene.background = new THREE.Color(styleConfig.background);

    // Additional scene-level style properties can be applied here
    // For example: fog, ambient light adjustments, etc.

    console.log(`🎨 Applied style to scene - Background: #${styleConfig.background.toString(16).padStart(6, '0')}`);
}

/**
 * Update UI style buttons to show active state
 * @param {string} activeStyleKey - The active style key
 */
function updateStyleButtons(activeStyleKey) {
    const styleButtons = document.querySelectorAll('.style-btn');

    styleButtons.forEach(button => {
        const buttonStyle = button.getAttribute('data-style');

        if (buttonStyle === activeStyleKey) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

/**
 * Get material configuration for a specific object type based on current style
 * This helper function provides style-aware material properties
 *
 * @param {string} objectType - Type of object ('sun', 'planet', 'moon', 'iss', etc.)
 * @param {number} baseColor - Base color for the object
 * @returns {Object} Material configuration object
 */
export function getMaterialConfig(objectType, baseColor) {
    const style = currentStyleConfig;
    const config = {
        color: baseColor,
        roughness: 0.8,
        metalness: 0.2,
        flatShading: false,
        wireframe: false,
        emissive: 0x000000,
        emissiveIntensity: 0
    };

    // Style-specific material adjustments
    switch (currentStyleKey) {
        case 'realistic':
            // Realistic: Use textures if available, subtle materials
            config.roughness = 0.9;
            config.metalness = 0.1;
            break;

        case 'cartoon':
            // Cartoon: Flat shading, bright colors, no metalness
            config.flatShading = style.flatShading || false;
            config.roughness = 1.0;
            config.metalness = 0.0;
            break;

        case 'neon':
            // Neon: Glowing emissive materials, high intensity
            config.emissive = baseColor;
            config.emissiveIntensity = (style.glowIntensity || 1.0) * 0.5;
            config.roughness = 0.3;
            config.metalness = 0.8;
            break;

        case 'minimalist':
            // Minimalist: Clean, simple materials, optional wireframe
            config.roughness = 0.5;
            config.metalness = 0.5;
            config.wireframe = style.wireframe || false;
            break;
    }

    return config;
}

/**
 * Get glow/atmosphere configuration for an object based on current style
 * @param {string} objectType - Type of object ('sun', 'planet', 'moon')
 * @returns {Object|null} Glow configuration or null if glow should not be applied
 */
export function getGlowConfig(objectType) {
    const style = currentStyleConfig;

    // Check if glow is enabled for this style
    if (objectType === 'sun' && !style.sunGlow) {
        return null;
    }

    if (objectType === 'planet' && !style.atmosphereGlow) {
        return null;
    }

    // Return glow configuration
    return {
        enabled: true,
        intensity: style.glowIntensity || 1.0,
        scale: objectType === 'sun' ? 1.5 : 1.2
    };
}

/**
 * Get orbit line configuration based on current style
 * @returns {Object} Orbit configuration
 */
export function getOrbitConfig() {
    const style = currentStyleConfig;

    return {
        opacity: style.orbitOpacity || 0.3,
        visible: true
    };
}

/**
 * Check if trails should be enabled for current style
 * @returns {boolean} True if trails should be enabled
 */
export function areTrailsEnabled() {
    return currentStyleConfig.trailsEnabled || false;
}

/**
 * Check if starfield should be visible for current style
 * @returns {boolean} True if starfield should be visible
 */
export function isStarfieldEnabled() {
    return currentStyleConfig.starfield !== false; // Default to true unless explicitly false
}

/**
 * Setup UI event listeners for style buttons
 * This should be called after the DOM is loaded
 */
export function setupStyleButtonListeners() {
    const styleButtons = document.querySelectorAll('.style-btn');

    styleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const styleKey = button.getAttribute('data-style');
            if (styleKey) {
                switchStyle(styleKey);
            }
        });
    });

    console.log('✅ Style button listeners attached');
}

/**
 * Dispose the styles system (cleanup)
 */
export function disposeStyles() {
    // Remove event listeners if needed
    const styleButtons = document.querySelectorAll('.style-btn');
    styleButtons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });

    recreateObjectsCallback = null;
    console.log('✅ Styles system disposed');
}

// Export default for convenience
export default {
    initStyles,
    getCurrentStyleKey,
    getCurrentStyle,
    getStyle,
    getAvailableStyles,
    switchStyle,
    getMaterialConfig,
    getGlowConfig,
    getOrbitConfig,
    areTrailsEnabled,
    isStarfieldEnabled,
    setupStyleButtonListeners,
    disposeStyles
};
