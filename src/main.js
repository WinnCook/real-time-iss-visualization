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
import { initLoadingManager, completeTask, hideLoadingScreen } from './core/loadingManager.js';
import { initTutorial } from './modules/tutorial.js';
import { initTouchIndicator } from './modules/touchIndicator.js';

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
        // Initialize loading manager
        initLoadingManager();

        // Initialize core Three.js infrastructure
        completeTask('Creating scene');
        app.scene = initScene();

        // Get canvas container
        const container = document.getElementById('canvas-container');
        completeTask('Initializing renderer');
        app.renderer = initRenderer(container);

        // Initialize camera (needs renderer's domElement for controls)
        completeTask('Setting up camera');
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
        completeTask('Loading starfield');
        completeTask('Creating sun');
        completeTask('Creating planets');
        completeTask('Creating orbits');
        completeTask('Creating moon');
        completeTask('Initializing ISS');
        app.solarSystem = initSolarSystem({
            camera: app.camera,
            renderer: app.renderer,
            styleConfig: initialStyle
        });

        // Initialize UI system (after all objects created)
        completeTask('Setting up labels');
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
        registerClickableObject('jupiter', getCelestialObject('jupiter'), { type: 'planet', name: 'Jupiter' });
        registerClickableObject('saturn', getCelestialObject('saturn'), { type: 'planet', name: 'Saturn' });
        registerClickableObject('uranus', getCelestialObject('uranus'), { type: 'planet', name: 'Uranus' });
        registerClickableObject('neptune', getCelestialObject('neptune'), { type: 'planet', name: 'Neptune' });
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
        completeTask('Configuring controls');
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

        // Finalize setup
        completeTask('Finalizing setup');

        // Hide loading screen with progress complete
        hideLoadingScreen();

        // Start animation loop
        app.animation.start();

        // Initialize tutorial for first-time users
        initTutorial();

        // Initialize touch indicator for mobile devices
        initTouchIndicator();

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
            completeTask('Loading Three.js library');
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof THREE !== 'undefined') {
                    clearInterval(checkInterval);
                    completeTask('Loading Three.js library');
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
