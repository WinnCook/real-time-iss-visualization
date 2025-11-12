/**
 * Main Application Entry Point
 * Initializes the entire visualization system
 */

import { initScene } from './core/scene.js';
import { initCamera, onWindowResize as cameraResize } from './core/camera.js';
import { initRenderer, onWindowResize as rendererResize } from './core/renderer.js';
import { initAnimation, addUpdateCallback, getFPS } from './core/animation.js';
import { timeManager } from './utils/time.js';
import { initSolarSystem, updateSolarSystem, recreateSolarSystem, getCelestialObject, registerISSCallback } from './modules/solarSystem.js';
import { initPerformanceSlider } from './modules/performanceSlider.js';
import { initStyles, getCurrentStyle } from './modules/styles.js';
import { initUI, registerClickableObject, updateFPS, updateISSInfo, updateCameraFollow } from './modules/ui.js';

/**
 * Application state
 */
const app = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    animation: null,
    solarSystem: null,
    isInitialized: false
};

/**
 * Initialize the application
 */
async function init() {
    console.log('🚀 Initializing Real-Time ISS Tracker...');

    try {
        // Initialize core Three.js infrastructure
        app.scene = initScene();

        // Get canvas container
        const container = document.getElementById('canvas-container');
        app.renderer = initRenderer(container);

        // Initialize camera (needs renderer's domElement for controls)
        const cameraResult = initCamera(app.renderer.domElement);
        app.camera = cameraResult.camera;
        app.controls = cameraResult.controls;

        // Initialize animation loop
        app.animation = initAnimation({
            scene: app.scene,
            camera: app.camera,
            renderer: app.renderer,
            controls: app.controls
        });

        // Initialize styles system (before creating any visual objects)
        initStyles('realistic', (newStyleConfig) => {
            recreateSolarSystem(newStyleConfig);
        });

        // Get initial style config
        const initialStyle = getCurrentStyle();

        // Initialize solar system with all celestial objects
        app.solarSystem = initSolarSystem({
            camera: app.camera,
            renderer: app.renderer,
            styleConfig: initialStyle
        });

        // Initialize UI system (after all objects created)
        initUI({
            renderer: app.renderer,
            camera: app.camera,
            scene: app.scene,
            recreateObjects: () => recreateSolarSystem()
        });

        // Register clickable objects for click-to-focus
        registerClickableObject('sun', getCelestialObject('sun'), { type: 'star', name: 'Sun' });
        registerClickableObject('mercury', getCelestialObject('mercury'), { type: 'planet', name: 'Mercury' });
        registerClickableObject('venus', getCelestialObject('venus'), { type: 'planet', name: 'Venus' });
        registerClickableObject('earth', getCelestialObject('earth'), { type: 'planet', name: 'Earth' });
        registerClickableObject('mars', getCelestialObject('mars'), { type: 'planet', name: 'Mars' });
        registerClickableObject('moon', getCelestialObject('moon'), { type: 'moon', name: 'Moon' });
        registerClickableObject('iss', getCelestialObject('iss'), { type: 'spacecraft', name: 'ISS' });

        // Register ISS data callback for UI updates
        registerISSCallback((issData) => {
            updateISSInfo(issData);
        });

        // Set up window resize handler
        window.addEventListener('resize', onWindowResize);

        // Initialize TimeManager
        timeManager.setTimeSpeed(100000); // Default 100,000x speed for visible orbits

        // Initialize Performance Slider System
        initPerformanceSlider(50); // Default 50% (balanced)

        // Register update callbacks
        addUpdateCallback((deltaTime, simulationTime) => {
            // Update entire solar system (all celestial objects)
            if (app.solarSystem) {
                updateSolarSystem(deltaTime, simulationTime);
            }

            // Update camera following for locked objects and selected object info
            const earthObject = getCelestialObject('earth');
            if (earthObject) {
                updateCameraFollow(earthObject);
            }

            // Update FPS counter in UI
            updateFPS(getFPS());
        });

        // Hide loading screen
        hideLoadingScreen();

        // Start animation loop
        app.animation.start();

        app.isInitialized = true;
        console.log('✅ Application initialized successfully!');
        console.log('   - Scene ready');
        console.log('   - Camera and controls ready');
        console.log('   - Renderer ready');
        console.log('   - Animation loop started');

    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

/**
 * Handle window resize
 */
function onWindowResize() {
    cameraResize();
    rendererResize();
}

// Note: recreateCelestialObjects is now handled by recreateSolarSystem() in solarSystem.js
// The function is imported and called from the solar system orchestrator module

/**
 * Hide loading screen with fade out
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        const content = loadingScreen.querySelector('.loading-content');
        if (content) {
            content.innerHTML = `
                <h1>❌ Error</h1>
                <p style="color: #f87171;">${message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
                    Reload Page
                </button>
            `;
        }
    }
}

/**
 * Wait for Three.js to load before initializing
 */
function waitForThree() {
    return new Promise((resolve) => {
        if (typeof THREE !== 'undefined') {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof THREE !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
        }
    });
}

/**
 * Application startup
 */
window.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM loaded, waiting for Three.js...');

    // Wait for Three.js to be available
    await waitForThree();
    console.log('✅ Three.js loaded');

    // Initialize the application (includes UI initialization)
    init();
});

// Export app state for debugging
window.APP = app;

console.log('✅ Main.js loaded');
