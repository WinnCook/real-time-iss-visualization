/**
 * Animation Module - Main Animation Loop
 * Manages the render loop with delta time and FPS tracking
 */

import { RENDER } from '../utils/constants.js';
import { timeManager } from '../utils/time.js';

/**
 * Animation loop state
 */
let animationId = null;
let isRunning = false;

/**
 * References to core objects (set during initialization)
 */
let scene = null;
let camera = null;
let renderer = null;
let controls = null;

/**
 * Update callbacks - functions to call each frame
 * @type {Array<Function>}
 */
const updateCallbacks = [];

/**
 * FPS tracking
 */
let fps = 0;
let frameCount = 0;
let lastFpsUpdate = Date.now();
let fpsUpdateInterval = 1000; // Update FPS display every 1 second

/**
 * Delta time tracking
 */
let lastFrameTime = Date.now();
let deltaTime = 0;

/**
 * Initialize the animation loop
 * @param {Object} coreObjects - Object containing scene, camera, renderer, controls
 * @returns {Object} Animation control functions
 */
export function initAnimation(coreObjects) {
    if (!coreObjects.scene || !coreObjects.camera || !coreObjects.renderer) {
        console.error('❌ Animation init failed: Missing required objects');
        return null;
    }

    scene = coreObjects.scene;
    camera = coreObjects.camera;
    renderer = coreObjects.renderer;
    controls = coreObjects.controls;

    console.log('✅ Animation loop initialized');

    return {
        start: startAnimation,
        stop: stopAnimation,
        pause: pauseAnimation,
        resume: resumeAnimation,
        isRunning: () => isRunning,
        getFPS: () => fps,
        getDeltaTime: () => deltaTime,
        addUpdateCallback,
        removeUpdateCallback
    };
}

/**
 * Start the animation loop
 */
export function startAnimation() {
    if (isRunning) {
        console.warn('Animation loop already running');
        return;
    }

    isRunning = true;
    lastFrameTime = Date.now();
    lastFpsUpdate = Date.now();
    frameCount = 0;

    console.log('▶️ Animation loop started');
    animate();
}

/**
 * Stop the animation loop
 */
export function stopAnimation() {
    if (!isRunning) return;

    isRunning = false;

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    console.log('⏹️ Animation loop stopped');
}

/**
 * Pause the animation loop (stops rendering but maintains state)
 */
export function pauseAnimation() {
    if (!isRunning) return;

    isRunning = false;

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    console.log('⏸️ Animation loop paused');
}

/**
 * Resume the animation loop
 */
export function resumeAnimation() {
    if (isRunning) return;

    isRunning = true;
    lastFrameTime = Date.now(); // Reset to prevent time jump

    console.log('▶️ Animation loop resumed');
    animate();
}

/**
 * Main animation loop
 */
function animate() {
    if (!isRunning) return;

    // Request next frame
    animationId = requestAnimationFrame(animate);

    // Calculate delta time (time since last frame)
    const currentTime = Date.now();
    deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    // Update FPS counter
    frameCount++;
    const timeSinceFpsUpdate = currentTime - lastFpsUpdate;
    if (timeSinceFpsUpdate >= fpsUpdateInterval) {
        fps = Math.round((frameCount * 1000) / timeSinceFpsUpdate);
        frameCount = 0;
        lastFpsUpdate = currentTime;

        // Update FPS display in UI
        updateFPSDisplay(fps);
    }

    // Update TimeManager (simulation time)
    timeManager.update(deltaTime);

    // Update orbit controls (for smooth damping)
    if (controls && controls.enableDamping) {
        controls.update();
    }

    // Call all registered update callbacks
    updateCallbacks.forEach(callback => {
        try {
            callback(deltaTime, timeManager.getSimulationTime());
        } catch (error) {
            console.error('Error in update callback:', error);
        }
    });

    // Render the scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

/**
 * Add a callback function to be called each frame
 * @param {Function} callback - Function to call each frame (receives deltaTime and simulationTime)
 */
export function addUpdateCallback(callback) {
    if (typeof callback === 'function' && !updateCallbacks.includes(callback)) {
        updateCallbacks.push(callback);
        console.log(`✅ Update callback added (${updateCallbacks.length} total)`);
    }
}

/**
 * Remove a callback function
 * @param {Function} callback - Function to remove
 */
export function removeUpdateCallback(callback) {
    const index = updateCallbacks.indexOf(callback);
    if (index !== -1) {
        updateCallbacks.splice(index, 1);
        console.log(`🗑️ Update callback removed (${updateCallbacks.length} remaining)`);
    }
}

/**
 * Update FPS display in the UI
 * @param {number} currentFPS - Current FPS value
 */
function updateFPSDisplay(currentFPS) {
    const fpsElement = document.getElementById('fps-counter');
    if (fpsElement) {
        fpsElement.textContent = `FPS: ${currentFPS}`;

        // Color code based on performance
        if (currentFPS >= 55) {
            fpsElement.style.color = '#4ade80'; // Green
        } else if (currentFPS >= 30) {
            fpsElement.style.color = '#fbbf24'; // Yellow
        } else {
            fpsElement.style.color = '#f87171'; // Red
        }
    }
}

/**
 * Get current FPS
 * @returns {number}
 */
export function getFPS() {
    return fps;
}

/**
 * Get current delta time
 * @returns {number}
 */
export function getDeltaTime() {
    return deltaTime;
}

/**
 * Check if animation loop is running
 * @returns {boolean}
 */
export function isAnimationRunning() {
    return isRunning;
}

/**
 * Get animation statistics
 * @returns {Object}
 */
export function getAnimationStats() {
    return {
        fps,
        deltaTime,
        isRunning,
        callbackCount: updateCallbacks.length,
        simulationTime: timeManager.getSimulationTime(),
        timeSpeed: timeManager.getTimeSpeed(),
        isPaused: timeManager.isPausedState()
    };
}

/**
 * Set FPS update interval
 * @param {number} interval - Interval in milliseconds
 */
export function setFpsUpdateInterval(interval) {
    fpsUpdateInterval = Math.max(100, interval); // Min 100ms
}

/**
 * Clear all update callbacks
 */
export function clearUpdateCallbacks() {
    updateCallbacks.length = 0;
    console.log('🗑️ All update callbacks cleared');
}

// Export animation controls as default
export default {
    initAnimation,
    startAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation,
    addUpdateCallback,
    removeUpdateCallback,
    getFPS,
    getDeltaTime,
    isAnimationRunning,
    getAnimationStats,
    setFpsUpdateInterval,
    clearUpdateCallbacks
};
