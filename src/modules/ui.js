/**
 * UI Module - Main Coordinator for User Interface
 * Coordinates all UI sub-modules: controls, panels, events, modals
 * REFACTORED: Reduced from 1,623 LOC to ~200 LOC by splitting into 4 modules
 * VERSION: 2.0.0 - Modular Architecture
 */

console.log('✅ UI.JS LOADED - VERSION 2.0.0 (Modular)');

// Import sub-modules
import { initControls, disposeControls } from './ui-controls.js';
import {
    initPanels,
    updateFPS,
    updateSimulationDate,
    updateISSInfo,
    setISSInfoStatus,
    updateISSTimeDisplay,
    updateSelectedObjectInfo,
    clearSelectedObjectInfo,
    showNotification,
    disposePanels
} from './ui-panels.js';
import {
    initEvents,
    registerClickableObject,
    reregisterAllClickableObjects,
    updateCameraFollow,
    getLockedObjectState,
    setLockedObjectState,
    unlockCamera,
    refocusOnLockedObject,
    getLockedObjectKey,
    disposeEvents
} from './ui-events.js';
import {
    initModals,
    updateRealTimeViewButtonState,
    disposeModals
} from './ui-modals.js';
import { setupStyleButtonListeners } from './styles.js';
import { initSounds, setSoundsEnabled, isSoundsEnabled } from '../utils/sounds.js';

/**
 * References to app state (set during initialization)
 */
let appRenderer = null;
let appCamera = null;
let appScene = null;
let recreateObjectsCallback = null;

/**
 * Initialize the UI system
 * Coordinates all sub-modules
 * @param {Object} options - Initialization options
 * @param {THREE.Renderer} options.renderer - Three.js renderer
 * @param {THREE.Camera} options.camera - Three.js camera
 * @param {THREE.Scene} options.scene - Three.js scene
 * @param {Function} options.recreateObjects - Callback to recreate celestial objects
 */
export function initUI(options) {
    console.log('🎨 Initializing UI system (modular architecture)...');

    // Store references
    appRenderer = options.renderer;
    appCamera = options.camera;
    appScene = options.scene;
    recreateObjectsCallback = options.recreateObjects;

    // Initialize sound system
    initSounds();

    // Initialize all sub-modules
    initControls({
        renderer: appRenderer,
        recreateObjects: recreateObjectsCallback,
        updateRealTimeViewButton: updateRealTimeViewButtonState,
        getLockedObjectState: getLockedObjectState,
        setLockedObjectState: setLockedObjectState
    });

    initPanels();

    initEvents({
        renderer: appRenderer,
        camera: appCamera,
        scene: appScene
    });

    initModals();

    // Set up style button listeners (handled by styles.js)
    setupStyleButtonListeners();

    // Update sound toggle checkbox state
    const soundToggle = document.getElementById('toggle-sounds');
    if (soundToggle) {
        soundToggle.checked = isSoundsEnabled();
    }

    console.log('✅ UI system initialized (4 sub-modules loaded)');
}

/**
 * Export all public functions for backwards compatibility
 * This ensures existing code continues to work without changes
 */

// From ui-panels.js
export {
    updateFPS,
    updateSimulationDate,
    updateISSInfo,
    setISSInfoStatus,
    updateSelectedObjectInfo,
    clearSelectedObjectInfo,
    showNotification
};

// From ui-events.js
export {
    registerClickableObject,
    reregisterAllClickableObjects,
    updateCameraFollow,
    unlockCamera,
    refocusOnLockedObject,
    getLockedObjectKey
};

// From ui-modals.js
export {
    updateRealTimeViewButtonState
};

/**
 * Dispose UI system (cleanup)
 * Disposes all sub-modules
 */
export function disposeUI() {
    console.log('🧹 Disposing UI system...');

    // Dispose all sub-modules
    disposeControls();
    disposePanels();
    disposeEvents();
    disposeModals();

    // Reset references
    appRenderer = null;
    appCamera = null;
    appScene = null;
    recreateObjectsCallback = null;

    console.log('✅ UI system disposed');
}

// Export default for convenience
export default {
    initUI,
    registerClickableObject,
    reregisterAllClickableObjects,
    updateFPS,
    updateSimulationDate,
    updateISSInfo,
    setISSInfoStatus,
    updateCameraFollow,
    unlockCamera,
    refocusOnLockedObject,
    getLockedObjectKey,
    updateRealTimeViewButtonState,
    disposeUI
};
