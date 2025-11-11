/**
 * Performance Module - Performance Preset System
 * Allows users to toggle between Quality, Balanced, and Performance modes
 */

import { PERFORMANCE_PRESETS, DEFAULT_PERFORMANCE_PRESET, RENDER } from '../utils/constants.js';

/**
 * Current active preset
 * @type {string}
 */
let currentPreset = DEFAULT_PERFORMANCE_PRESET;

/**
 * Callback functions to notify when preset changes
 * @type {Array<Function>}
 */
const presetChangeCallbacks = [];

/**
 * Initialize performance system
 * @param {string} initialPreset - Initial preset to apply (default: BALANCED)
 */
export function initPerformance(initialPreset = DEFAULT_PERFORMANCE_PRESET) {
    currentPreset = initialPreset;
    console.log(`✅ Performance system initialized with preset: ${PERFORMANCE_PRESETS[currentPreset].name}`);
    return currentPreset;
}

/**
 * Get current performance preset
 * @returns {string} Current preset name (QUALITY, BALANCED, or PERFORMANCE)
 */
export function getCurrentPreset() {
    return currentPreset;
}

/**
 * Get current preset configuration
 * @returns {Object} Preset configuration object
 */
export function getCurrentPresetConfig() {
    return PERFORMANCE_PRESETS[currentPreset];
}

/**
 * Switch to a different performance preset
 * @param {string} presetName - Preset name (QUALITY, BALANCED, or PERFORMANCE)
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer to update
 * @returns {boolean} Success status
 */
export function switchPreset(presetName, renderer) {
    if (!PERFORMANCE_PRESETS[presetName]) {
        console.error(`❌ Invalid preset: ${presetName}`);
        return false;
    }

    const preset = PERFORMANCE_PRESETS[presetName];
    console.log(`🔄 Switching to ${preset.name} preset...`);

    // Update current preset
    currentPreset = presetName;

    // Apply renderer settings
    if (renderer) {
        applyRendererSettings(renderer, preset);
    }

    // Update RENDER constants (for new geometry created after this point)
    updateRenderConstants(preset);

    // Notify all listeners
    notifyPresetChange(presetName, preset);

    console.log(`✅ Performance preset switched to: ${preset.name}`);
    console.log(`   - Sphere segments: ${preset.sphereSegments}`);
    console.log(`   - Pixel ratio: ${preset.pixelRatio}`);
    console.log(`   - Anti-aliasing: ${preset.antiAliasing}`);
    console.log(`   - Target FPS: ${preset.targetFPS}`);

    return true;
}

/**
 * Apply renderer-specific settings from preset
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer
 * @param {Object} preset - Preset configuration
 */
function applyRendererSettings(renderer, preset) {
    // Update pixel ratio
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, preset.pixelRatio));

    // Update tone mapping
    switch (preset.toneMapping) {
        case 'ACESFilmic':
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            break;
        case 'Linear':
            renderer.toneMapping = THREE.LinearToneMapping;
            break;
        case 'None':
        default:
            renderer.toneMapping = THREE.NoToneMapping;
            break;
    }

    // Note: Anti-aliasing cannot be changed without recreating the renderer
    // It's set during initialization only
}

/**
 * Update RENDER constants to reflect new preset
 * @param {Object} preset - Preset configuration
 */
function updateRenderConstants(preset) {
    RENDER.SPHERE_SEGMENTS = preset.sphereSegments;
    RENDER.ORBIT_SEGMENTS = preset.orbitSegments;
    RENDER.PIXEL_RATIO = preset.pixelRatio;
    RENDER.ANTI_ALIASING = preset.antiAliasing;
    RENDER.TARGET_FPS = preset.targetFPS;
}

/**
 * Register a callback to be notified when preset changes
 * @param {Function} callback - Function to call when preset changes (receives presetName, presetConfig)
 */
export function onPresetChange(callback) {
    if (typeof callback === 'function' && !presetChangeCallbacks.includes(callback)) {
        presetChangeCallbacks.push(callback);
    }
}

/**
 * Unregister a preset change callback
 * @param {Function} callback - Callback to remove
 */
export function offPresetChange(callback) {
    const index = presetChangeCallbacks.indexOf(callback);
    if (index !== -1) {
        presetChangeCallbacks.splice(index, 1);
    }
}

/**
 * Notify all registered callbacks of preset change
 * @param {string} presetName - New preset name
 * @param {Object} presetConfig - New preset configuration
 */
function notifyPresetChange(presetName, presetConfig) {
    presetChangeCallbacks.forEach(callback => {
        try {
            callback(presetName, presetConfig);
        } catch (error) {
            console.error('Error in preset change callback:', error);
        }
    });
}

/**
 * Get all available presets
 * @returns {Object} All performance presets
 */
export function getAllPresets() {
    return PERFORMANCE_PRESETS;
}

/**
 * Get preset by name
 * @param {string} presetName - Preset name
 * @returns {Object|null} Preset configuration or null if not found
 */
export function getPreset(presetName) {
    return PERFORMANCE_PRESETS[presetName] || null;
}

/**
 * Check if a preset exists
 * @param {string} presetName - Preset name to check
 * @returns {boolean}
 */
export function hasPreset(presetName) {
    return PERFORMANCE_PRESETS.hasOwnProperty(presetName);
}

/**
 * Get performance statistics and recommendations
 * @param {number} currentFPS - Current frames per second
 * @returns {Object} Performance analysis
 */
export function analyzePerformance(currentFPS) {
    const preset = getCurrentPresetConfig();
    const targetFPS = preset.targetFPS;

    let recommendation = null;
    let status = 'good';

    if (currentFPS < targetFPS * 0.7) {
        // Below 70% of target FPS
        status = 'poor';
        if (currentPreset === 'QUALITY') {
            recommendation = 'BALANCED';
        } else if (currentPreset === 'BALANCED') {
            recommendation = 'PERFORMANCE';
        } else {
            recommendation = null; // Already on lowest preset
        }
    } else if (currentFPS < targetFPS * 0.9) {
        // Below 90% of target FPS
        status = 'fair';
        if (currentPreset === 'QUALITY') {
            recommendation = 'BALANCED';
        }
    }

    return {
        currentFPS,
        targetFPS,
        currentPreset,
        status,
        recommendation,
        message: getPerformanceMessage(status, recommendation)
    };
}

/**
 * Get human-readable performance message
 * @param {string} status - Performance status
 * @param {string|null} recommendation - Recommended preset
 * @returns {string}
 */
function getPerformanceMessage(status, recommendation) {
    if (status === 'good') {
        return 'Performance is good!';
    } else if (status === 'fair') {
        return recommendation
            ? `Performance is fair. Consider switching to ${PERFORMANCE_PRESETS[recommendation].name} preset.`
            : 'Performance is fair.';
    } else {
        return recommendation
            ? `Performance is poor. Switch to ${PERFORMANCE_PRESETS[recommendation].name} preset for better FPS.`
            : 'Performance is poor. Already using lowest preset.';
    }
}

/**
 * Check if FPS throttling is enabled for current preset
 * @returns {boolean}
 */
export function isFPSThrottleEnabled() {
    const preset = getCurrentPresetConfig();
    return preset.fpsThrottle === true;
}

/**
 * Get target FPS for throttling
 * @returns {number}
 */
export function getTargetFPS() {
    return getCurrentPresetConfig().targetFPS;
}

/**
 * Calculate minimum frame time (in ms) for FPS throttling
 * @returns {number} Minimum milliseconds per frame
 */
export function getMinFrameTime() {
    const targetFPS = getTargetFPS();
    return 1000 / targetFPS;
}

// Export default object
export default {
    initPerformance,
    getCurrentPreset,
    getCurrentPresetConfig,
    switchPreset,
    onPresetChange,
    offPresetChange,
    getAllPresets,
    getPreset,
    hasPreset,
    analyzePerformance,
    isFPSThrottleEnabled,
    getTargetFPS,
    getMinFrameTime
};
