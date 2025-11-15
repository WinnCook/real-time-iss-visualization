/**
 * Animation Module - Main Animation Loop
 * Manages the render loop with delta time and FPS tracking
 */

import { RENDER } from '../utils/constants.js';
import { timeManager } from '../utils/time.js';
import { isFPSThrottleEnabled, getMinFrameTime } from '../modules/performanceSlider.js';

/**
 * Animation loop state
 */
let animationId = null;
let isRunning = false;

/**
 * FPS throttling state
 */
let lastRenderTime = 0;

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

    // Reset TimeManager to prevent time jump from initialization delay
    timeManager.reset();

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

    // FPS Throttling - Skip rendering if not enough time has passed
    const currentTime = Date.now();
    if (isFPSThrottleEnabled()) {
        const minFrameTime = getMinFrameTime();
        const timeSinceLastRender = currentTime - lastRenderTime;

        if (timeSinceLastRender < minFrameTime) {
            // Not enough time has passed, skip this frame
            return;
        }
    }
    lastRenderTime = currentTime;

    // Calculate delta time (time since last frame)
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

    // Update controls (TrackballControls needs update() called every frame)
    if (controls) {
        controls.update();
    }

    // Call all registered update callbacks with improved error handling
    // Note: Using traditional for loop instead of forEach to handle index changes during iteration
    for (let i = updateCallbacks.length - 1; i >= 0; i--) {
        const callback = updateCallbacks[i];
        try {
            callback(deltaTime, timeManager.getSimulationTime());
            // Reset error count on successful execution
            if (callback.errorCount) {
                callback.errorCount = 0;
            }
        } catch (error) {
            // Track error count per callback
            callback.errorCount = (callback.errorCount || 0) + 1;

            // Only log first few errors to avoid console spam
            if (callback.errorCount <= 3) {
                console.error(`⚠️ Error in update callback #${i} (${callback.errorCount}/3):`, error);
                console.error('Stack trace:', error.stack);
            } else if (callback.errorCount === 4) {
                console.error(`❌ Callback #${i} disabled after 3 consecutive errors. Last error:`, error);
                // Remove the problematic callback
                updateCallbacks.splice(i, 1);
                console.warn('🗑️ Removed problematic callback from animation loop');

                // Notify user of critical error
                notifyErrorBoundary('Animation Error', `A system component encountered repeated errors and was disabled to prevent crashes.`);
            }
        }
    }

    // Render the scene with error boundary
    try {
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    } catch (error) {
        console.error('❌ CRITICAL: Render error:', error);
        console.error('Stack trace:', error.stack);

        // Attempt recovery by stopping animation
        stopAnimation();
        notifyErrorBoundary('Render Error', 'Critical rendering error. Please refresh the page.');
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
 * Notify user of error boundary events
 * Creates a user-visible notification for critical errors
 * @param {string} title - Error title
 * @param {string} message - Error message
 */
function notifyErrorBoundary(title, message) {
    // Try to use the UI panels notification system
    try {
        // Dynamic import to avoid circular dependencies
        import('../modules/ui-panels.js').then(module => {
            module.showNotification(title, message);
        }).catch(() => {
            // Fallback: Create notification directly
            createErrorNotification(title, message);
        });
    } catch (error) {
        // Fallback: Create notification directly
        createErrorNotification(title, message);
    }
}

/**
 * Create error notification directly (fallback method)
 * @param {string} title - Error title
 * @param {string} message - Error message
 */
function createErrorNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(220, 38, 38, 0.95);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        opacity: 0;
        transform: translateX(20px);
        transition: all 0.3s ease;
    `;
    notification.innerHTML = `
        <strong style="display: block; margin-bottom: 8px; font-size: 14px;">❌ ${escapeHTML(title)}</strong>
        <p style="margin: 0; font-size: 13px; line-height: 1.4;">${escapeHTML(message)}</p>
    `;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Hide and remove after 8 seconds (longer for errors)
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 8000);
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
