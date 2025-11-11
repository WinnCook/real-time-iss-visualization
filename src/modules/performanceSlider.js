/**
 * Performance Slider Module - Continuous quality adjustment
 * Maps slider value (0-100) to dynamic performance settings
 */

import { RENDER } from '../utils/constants.js';

/**
 * Current performance level (0-100)
 * @type {number}
 */
let currentLevel = 50;

/**
 * Performance settings change callbacks
 * @type {Array<Function>}
 */
const changeCallbacks = [];

/**
 * Performance level presets for reference
 */
const LEVEL_PRESETS = {
    ULTRA_LOW: 0,      // 🐌 Absolute minimum - 15 FPS cap
    LOW: 25,           // 🥔 Potato mode - 20 FPS cap
    MEDIUM: 50,        // ⚡ Balanced - 30 FPS cap
    HIGH: 75,          // ✨ Good quality - 45 FPS cap
    ULTRA_HIGH: 100    // 💎 Maximum quality - 60 FPS cap
};

/**
 * Initialize performance slider system
 * @param {number} initialLevel - Initial performance level (0-100)
 */
export function initPerformanceSlider(initialLevel = 50) {
    currentLevel = initialLevel;
    console.log(`✅ Performance slider initialized at level: ${initialLevel}%`);
    return currentLevel;
}

/**
 * Get current performance level
 * @returns {number} Current level (0-100)
 */
export function getCurrentLevel() {
    return currentLevel;
}

/**
 * Interpolate a value based on performance level
 * @param {number} minValue - Value at level 0
 * @param {number} maxValue - Value at level 100
 * @param {number} level - Current performance level (0-100)
 * @returns {number} Interpolated value
 */
function interpolate(minValue, maxValue, level) {
    return minValue + (maxValue - minValue) * (level / 100);
}

/**
 * Get dynamic performance settings based on slider level
 * @param {number} level - Performance level (0-100)
 * @returns {Object} Performance settings
 */
export function getPerformanceSettings(level = currentLevel) {
    // Sphere segments: 3 (ultra low) to 32 (ultra high) - AGGRESSIVELY LOW!
    const sphereSegments = Math.round(interpolate(3, 32, level));

    // Orbit segments: 12 (ultra low) to 128 (ultra high)
    const orbitSegments = Math.round(interpolate(12, 128, level));

    // Pixel ratio: 0.3 (ultra low) to 2.0 (ultra high) - VERY LOW!
    const pixelRatio = interpolate(0.3, 2.0, level);

    // Target FPS: 12 (ultra low) to 60 (ultra high) - Cap at 12 FPS for smoothness
    const targetFPS = Math.round(interpolate(12, 60, level));

    // FPS throttle: enabled for level < 80
    const fpsThrottle = level < 80;

    // Tone mapping
    let toneMapping;
    if (level >= 75) {
        toneMapping = 'ACESFilmic'; // High quality
    } else if (level >= 50) {
        toneMapping = 'Linear'; // Medium quality
    } else {
        toneMapping = 'None'; // Low quality
    }

    // Anti-aliasing: enabled only for level >= 60
    const antiAliasing = level >= 60;

    // Planet rotation: disabled for ultra-low performance (level < 15)
    const enableRotation = level >= 15;

    // Get description
    const description = getDescriptionForLevel(level);

    return {
        level,
        sphereSegments,
        orbitSegments,
        pixelRatio,
        targetFPS,
        fpsThrottle,
        toneMapping,
        antiAliasing,
        enableRotation,
        description
    };
}

/**
 * Get human-readable description for performance level
 * @param {number} level - Performance level (0-100)
 * @returns {string}
 */
function getDescriptionForLevel(level) {
    if (level === 0) return '🐌 Ultra Low - 3 segments, 12 FPS';
    if (level < 20) return '🥔 Potato - 3-6 segments, 15 FPS';
    if (level < 40) return '⚡ Low - 6-12 segments, 20 FPS';
    if (level < 60) return '⚖️ Balanced - 12-20 segments, 30 FPS';
    if (level < 80) return '✨ High - 20-28 segments, 45 FPS';
    return '💎 Ultra High - 28-32 segments, 60 FPS';
}

/**
 * Set performance level and apply settings
 * @param {number} level - Performance level (0-100)
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer to update
 * @returns {Object} Applied settings
 */
export function setPerformanceLevel(level, renderer) {
    currentLevel = Math.max(0, Math.min(100, level));
    const settings = getPerformanceSettings(currentLevel);

    console.log(`🔄 Performance level: ${currentLevel}%`);
    console.log(`   - Sphere segments: ${settings.sphereSegments}`);
    console.log(`   - Pixel ratio: ${settings.pixelRatio.toFixed(2)}`);
    console.log(`   - Target FPS: ${settings.targetFPS}`);
    console.log(`   - FPS throttle: ${settings.fpsThrottle}`);
    console.log(`   - Rotation: ${settings.enableRotation}`);

    // Apply renderer settings
    if (renderer) {
        applyRendererSettings(renderer, settings);
    }

    // Update RENDER constants
    updateRenderConstants(settings);

    // Notify callbacks
    notifyChange(settings);

    return settings;
}

/**
 * Apply renderer-specific settings
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer
 * @param {Object} settings - Performance settings
 */
function applyRendererSettings(renderer, settings) {
    // Update pixel ratio
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.pixelRatio));

    // Update tone mapping
    switch (settings.toneMapping) {
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
}

/**
 * Update RENDER constants
 * @param {Object} settings - Performance settings
 */
function updateRenderConstants(settings) {
    RENDER.SPHERE_SEGMENTS = settings.sphereSegments;
    RENDER.ORBIT_SEGMENTS = settings.orbitSegments;
    RENDER.PIXEL_RATIO = settings.pixelRatio;
    RENDER.ANTI_ALIASING = settings.antiAliasing;
    RENDER.TARGET_FPS = settings.targetFPS;
}

/**
 * Register a callback for performance changes
 * @param {Function} callback - Callback function
 */
export function onPerformanceChange(callback) {
    if (typeof callback === 'function' && !changeCallbacks.includes(callback)) {
        changeCallbacks.push(callback);
    }
}

/**
 * Unregister a callback
 * @param {Function} callback - Callback to remove
 */
export function offPerformanceChange(callback) {
    const index = changeCallbacks.indexOf(callback);
    if (index !== -1) {
        changeCallbacks.splice(index, 1);
    }
}

/**
 * Notify all callbacks of settings change
 * @param {Object} settings - New settings
 */
function notifyChange(settings) {
    changeCallbacks.forEach(callback => {
        try {
            callback(settings);
        } catch (error) {
            console.error('Error in performance change callback:', error);
        }
    });
}

/**
 * Check if FPS throttling is enabled
 * @returns {boolean}
 */
export function isFPSThrottleEnabled() {
    const settings = getPerformanceSettings(currentLevel);
    return settings.fpsThrottle;
}

/**
 * Get minimum frame time for throttling
 * @returns {number} Milliseconds per frame
 */
export function getMinFrameTime() {
    const settings = getPerformanceSettings(currentLevel);
    return 1000 / settings.targetFPS;
}

/**
 * Check if planet rotation is enabled
 * @returns {boolean}
 */
export function isRotationEnabled() {
    const settings = getPerformanceSettings(currentLevel);
    return settings.enableRotation;
}

// Export default
export default {
    initPerformanceSlider,
    getCurrentLevel,
    getPerformanceSettings,
    setPerformanceLevel,
    onPerformanceChange,
    offPerformanceChange,
    isFPSThrottleEnabled,
    getMinFrameTime,
    isRotationEnabled,
    LEVEL_PRESETS
};
