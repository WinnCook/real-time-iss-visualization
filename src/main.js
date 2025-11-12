/**
 * Main Application Entry Point
 * Initializes the entire visualization system
 */

import { initScene, addToScene } from './core/scene.js';
import { initCamera, onWindowResize as cameraResize } from './core/camera.js';
import { initRenderer, onWindowResize as rendererResize } from './core/renderer.js';
import { initAnimation, startAnimation, addUpdateCallback, getFPS } from './core/animation.js';
import { timeManager } from './utils/time.js';
import { initSun, updateSun, disposeSun, getSun } from './modules/sun.js';
import { initPlanets, updatePlanets, getPlanetPosition, disposePlanets, getPlanet } from './modules/planets.js';
import { initMoon, updateMoon, disposeMoon, getMoon } from './modules/moon.js';
import { initISS, updateISS, disposeISS, setISSTrailVisible, getISSMesh, registerUICallback } from './modules/iss.js';
import { initOrbits, updateOrbits, disposeOrbits, setOrbitsVisible } from './modules/orbits.js';
import { initStarfield, updateStarfield, disposeStarfield, setStarfieldVisible } from './modules/starfield.js';
import { initLabels, registerObject, updateLabels, setLabelsVisible, disposeLabels } from './modules/labels.js';
import { clearGeometryCache } from './utils/geometryCache.js';
import { initPerformanceSlider, setPerformanceLevel, getPerformanceSettings } from './modules/performanceSlider.js';
import { STYLES } from './utils/constants.js';
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
    sun: null,
    planets: null,
    moon: null,
    iss: null,
    orbits: null,
    starfield: null,
    labels: null,
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
            recreateCelestialObjects(newStyleConfig);
        });

        // Get initial style config
        const initialStyle = getCurrentStyle();

        // Initialize starfield background (first, as it's the backdrop)
        app.starfield = initStarfield(initialStyle);

        // Initialize the sun with current style
        app.sun = initSun(initialStyle);

        // Initialize planets with current style
        app.planets = initPlanets(initialStyle);

        // Initialize orbital paths
        app.orbits = initOrbits(initialStyle);

        // Initialize the moon with current style
        app.moon = initMoon(initialStyle);

        // Initialize the ISS with current style
        app.iss = initISS(initialStyle);

        // Initialize labels system (after all objects are created)
        app.labels = initLabels(app.camera, app.renderer);

        // Register all objects with labels system
        registerObject('sun', getSun());
        registerObject('mercury', getPlanet('mercury'));
        registerObject('venus', getPlanet('venus'));
        registerObject('earth', getPlanet('earth'));
        registerObject('mars', getPlanet('mars'));
        registerObject('moon', getMoon());
        registerObject('iss', getISSMesh());

        // Initialize UI system (after all objects created)
        initUI({
            renderer: app.renderer,
            camera: app.camera,
            scene: app.scene,
            recreateObjects: () => recreateCelestialObjects()
        });

        // Register clickable objects for click-to-focus
        registerClickableObject('sun', getSun(), { type: 'star', name: 'Sun' });
        registerClickableObject('mercury', getPlanet('mercury'), { type: 'planet', name: 'Mercury' });
        registerClickableObject('venus', getPlanet('venus'), { type: 'planet', name: 'Venus' });
        registerClickableObject('earth', getPlanet('earth'), { type: 'planet', name: 'Earth' });
        registerClickableObject('mars', getPlanet('mars'), { type: 'planet', name: 'Mars' });
        registerClickableObject('moon', getMoon(), { type: 'moon', name: 'Moon' });
        registerClickableObject('iss', getISSMesh(), { type: 'spacecraft', name: 'ISS' });

        // Register ISS data callback for UI updates
        registerUICallback((issData) => {
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
            // Update sun animation
            if (app.sun) {
                updateSun(deltaTime, simulationTime);
            }

            // Update planets animation
            if (app.planets) {
                updatePlanets(deltaTime, simulationTime);
            }

            // Update orbital paths (static, but included for consistency)
            if (app.orbits) {
                updateOrbits(deltaTime, simulationTime);
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

            // Update labels positions (project 3D to 2D screen coordinates)
            if (app.labels) {
                updateLabels();
            }

            // Update camera following for locked objects and selected object info
            const earthObject = getPlanet('earth');
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

/**
 * Recreate all celestial objects with new performance settings or style
 * @param {Object} styleConfig - Optional style configuration (uses current style if not provided)
 */
function recreateCelestialObjects(styleConfig = null) {
    console.log('🔄 Recreating celestial objects with new settings...');

    // Dispose existing objects
    if (app.labels) disposeLabels();
    if (app.starfield) disposeStarfield();
    if (app.sun) disposeSun();
    if (app.planets) disposePlanets();
    if (app.orbits) disposeOrbits();
    if (app.moon) disposeMoon();
    if (app.iss) disposeISS();

    // Clear geometry cache to force recreation
    clearGeometryCache();

    // Get current style if not provided
    const currentStyle = styleConfig || getCurrentStyle();

    // Recreate with current style
    app.starfield = initStarfield(currentStyle);
    app.sun = initSun(currentStyle);
    app.planets = initPlanets(currentStyle);
    app.orbits = initOrbits(currentStyle);
    app.moon = initMoon(currentStyle);
    app.iss = initISS(currentStyle);

    // Recreate labels and re-register objects
    app.labels = initLabels(app.camera, app.renderer);
    registerObject('sun', getSun());
    registerObject('mercury', getPlanet('mercury'));
    registerObject('venus', getPlanet('venus'));
    registerObject('earth', getPlanet('earth'));
    registerObject('mars', getPlanet('mars'));
    registerObject('moon', getMoon());
    registerObject('iss', getISSMesh());

    // Re-register clickable objects for click-to-focus
    registerClickableObject('sun', getSun(), { type: 'star', name: 'Sun' });
    registerClickableObject('mercury', getPlanet('mercury'), { type: 'planet', name: 'Mercury' });
    registerClickableObject('venus', getPlanet('venus'), { type: 'planet', name: 'Venus' });
    registerClickableObject('earth', getPlanet('earth'), { type: 'planet', name: 'Earth' });
    registerClickableObject('mars', getPlanet('mars'), { type: 'planet', name: 'Mars' });
    registerClickableObject('moon', getMoon(), { type: 'moon', name: 'Moon' });
    registerClickableObject('iss', getISSMesh(), { type: 'spacecraft', name: 'ISS' });

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
