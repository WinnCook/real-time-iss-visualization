/**
 * Main Application Entry Point
 * Initializes the entire visualization system
 */

import { initScene, addToScene } from './core/scene.js';
import { initCamera, onWindowResize as cameraResize } from './core/camera.js';
import { initRenderer, onWindowResize as rendererResize } from './core/renderer.js';
import { initAnimation, startAnimation, addUpdateCallback } from './core/animation.js';
import { timeManager } from './utils/time.js';
import { initSun, updateSun, disposeSun } from './modules/sun.js';
import { initPlanets, updatePlanets, getPlanetPosition, disposePlanets } from './modules/planets.js';
import { initMoon, updateMoon, disposeMoon } from './modules/moon.js';
import { initISS, updateISS, disposeISS } from './modules/iss.js';
import { clearGeometryCache } from './utils/geometryCache.js';
import { initPerformanceSlider, setPerformanceLevel, getPerformanceSettings } from './modules/performanceSlider.js';
import { STYLES } from './utils/constants.js';

/**
 * Application state
 */
const app = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    animation: null,
    sun: null,
    planets: null,
    moon: null,
    iss: null,
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

        // Initialize the sun with realistic style
        app.sun = initSun(STYLES.realistic);

        // Initialize planets with realistic style
        app.planets = initPlanets(STYLES.realistic);

        // Initialize the moon with realistic style
        app.moon = initMoon(STYLES.realistic);

        // Initialize the ISS with realistic style
        app.iss = initISS(STYLES.realistic);

        // Set up window resize handler
        window.addEventListener('resize', onWindowResize);

        // Initialize TimeManager
        timeManager.setTimeSpeed(100000); // Default 100,000x speed for visible orbits

        // Initialize Performance Slider System
        initPerformanceSlider(50); // Default 50% (balanced)

        // Register update callbacks
        addUpdateCallback((deltaTime, simulationTime) => {
            // Update sun animation
            if (app.sun) {
                updateSun(deltaTime, simulationTime);
            }

            // Update planets animation
            if (app.planets) {
                updatePlanets(deltaTime, simulationTime);
            }

            // Update moon animation (needs Earth's position)
            if (app.moon) {
                const earthPosition = getPlanetPosition('earth');
                if (earthPosition) {
                    updateMoon(deltaTime, simulationTime, earthPosition);
                }
            }

            // Update ISS animation (needs Earth's position)
            if (app.iss) {
                const earthPosition = getPlanetPosition('earth');
                if (earthPosition) {
                    updateISS(deltaTime, simulationTime, earthPosition);
                }
            }
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

/**
 * Recreate all celestial objects with new performance settings
 */
function recreateCelestialObjects() {
    console.log('🔄 Recreating celestial objects with new settings...');

    // Dispose existing objects
    if (app.sun) disposeSun();
    if (app.planets) disposePlanets();
    if (app.moon) disposeMoon();
    if (app.iss) disposeISS();

    // Clear geometry cache to force recreation
    clearGeometryCache();

    // Recreate with current style
    app.sun = initSun(STYLES.realistic);
    app.planets = initPlanets(STYLES.realistic);
    app.moon = initMoon(STYLES.realistic);
    app.iss = initISS(STYLES.realistic);

    console.log('✅ Celestial objects recreated');
}

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
 * Set up UI event handlers (placeholder - will be moved to ui.js later)
 */
function setupUIHandlers() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('play-pause');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (timeManager.isPausedState()) {
                timeManager.play();
                playPauseBtn.textContent = '⏸ Pause';
            } else {
                timeManager.pause();
                playPauseBtn.textContent = '▶️ Play';
            }
        });
    }

    // Time speed slider
    const timeSpeedSlider = document.getElementById('time-speed');
    const speedValue = document.getElementById('speed-value');
    if (timeSpeedSlider && speedValue) {
        // Set initial values
        timeSpeedSlider.value = 100000;
        speedValue.textContent = '100000x';

        timeSpeedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            timeManager.setTimeSpeed(speed);
            speedValue.textContent = `${speed}x`;
        });
    }

    // Preset speed buttons
    const presetButtons = document.querySelectorAll('.preset-speeds button');
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const speed = parseInt(button.dataset.speed);
            timeManager.setTimeSpeed(speed);
            if (timeSpeedSlider) timeSpeedSlider.value = speed;
            if (speedValue) speedValue.textContent = `${speed}x`;
        });
    });

    // Reset camera button
    const resetCameraBtn = document.getElementById('reset-camera');
    if (resetCameraBtn) {
        resetCameraBtn.addEventListener('click', () => {
            // Import and use resetCamera from camera.js
            import('./core/camera.js').then(({ resetCamera }) => {
                resetCamera();
            });
        });
    }

    // Help modal
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeModal = document.querySelector('.close-modal');

    if (helpButton && helpModal) {
        helpButton.addEventListener('click', () => {
            helpModal.classList.remove('hidden');
        });
    }

    if (closeModal && helpModal) {
        closeModal.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });
    }

    // Close modal when clicking outside
    if (helpModal) {
        window.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.add('hidden');
            }
        });
    }

    // Performance Slider with debouncing for object recreation
    const performanceSlider = document.getElementById('performance-slider');
    const performanceValue = document.getElementById('performance-value');
    const presetDescription = document.getElementById('preset-description');
    let sliderDebounceTimer = null;

    if (performanceSlider && performanceValue) {
        performanceSlider.addEventListener('input', (e) => {
            const level = parseInt(e.target.value);

            // Update performance level immediately (renderer settings only)
            if (app.renderer) {
                const settings = setPerformanceLevel(level, app.renderer);

                // Update display
                performanceValue.textContent = `${settings.description}`;
            }

            // Debounce object recreation (wait 500ms after user stops moving slider)
            clearTimeout(sliderDebounceTimer);
            sliderDebounceTimer = setTimeout(() => {
                console.log(`🎨 Recreating objects for performance level: ${level}%`);
                recreateCelestialObjects();
            }, 500);
        });

        // Set initial value
        const initialSettings = getPerformanceSettings(50);
        performanceValue.textContent = `${initialSettings.description}`;
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

    // Set up UI handlers
    setupUIHandlers();

    // Initialize the application
    init();
});

// Export app state for debugging
window.APP = app;

console.log('✅ Main.js loaded');
