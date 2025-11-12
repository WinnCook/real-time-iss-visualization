/**
 * UI Module - User Interface Controls and Event Handlers
 * Manages all UI interactions, info panels, and user input
 */

import { timeManager } from '../utils/time.js';
import { resetCamera, controls as cameraControls } from '../core/camera.js';
import { setupStyleButtonListeners } from './styles.js';
import { setOrbitsVisible } from './orbits.js';
import { setLabelsVisible } from './labels.js';
import { setISSTrailVisible } from './iss.js';
import { setStarfieldVisible } from './starfield.js';
import { setPerformanceLevel, getPerformanceSettings } from './performanceSlider.js';

/**
 * References to app state (set during initialization)
 */
let appRenderer = null;
let appCamera = null;
let appScene = null;
let recreateObjectsCallback = null;

/**
 * Raycaster for click detection
 */
let raycaster = null;
let mouse = new THREE.Vector2();

/**
 * Clickable objects registry
 */
const clickableObjects = new Map();

/**
 * Currently locked/followed object
 */
let lockedObject = null;
let lockedObjectKey = null;
let cameraOffset = null;
let previousObjectPosition = null;

/**
 * Performance slider debounce timer
 */
let sliderDebounceTimer = null;

/**
 * ISS data cache for info panel
 */
let issDataCache = {
    position: { lat: 0, lon: 0 },
    altitude: 0,
    velocity: 27600, // km/h (approximate orbital speed)
    lastUpdate: null
};

/**
 * Initialize the UI system
 * @param {Object} options - Initialization options
 * @param {THREE.Renderer} options.renderer - Three.js renderer
 * @param {THREE.Camera} options.camera - Three.js camera
 * @param {THREE.Scene} options.scene - Three.js scene
 * @param {Function} options.recreateObjects - Callback to recreate celestial objects
 */
export function initUI(options) {
    appRenderer = options.renderer;
    appCamera = options.camera;
    appScene = options.scene;
    recreateObjectsCallback = options.recreateObjects;

    // Initialize raycaster for click detection
    raycaster = new THREE.Raycaster();

    // Set up all event listeners
    setupAllEventListeners();

    console.log('✅ UI system initialized');
}

/**
 * Set up all UI event listeners
 */
function setupAllEventListeners() {
    // Style buttons (handled by styles.js)
    setupStyleButtonListeners();

    // Time controls
    setupTimeControls();

    // Camera controls
    setupCameraControls();

    // Performance controls
    setupPerformanceControls();

    // Display toggles
    setupDisplayToggles();

    // Help modal
    setupHelpModal();

    // Click-to-focus
    setupClickToFocus();

    console.log('✅ All UI event listeners attached');
}

/**
 * Setup time speed controls
 */
function setupTimeControls() {
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
}

/**
 * Setup camera controls
 */
function setupCameraControls() {
    // Reset camera button
    const resetCameraBtn = document.getElementById('reset-camera');
    if (resetCameraBtn) {
        resetCameraBtn.addEventListener('click', () => {
            // Unlock from any followed object first
            unlockCamera();
            // Then reset to default position
            resetCamera();
            console.log('🎥 Camera reset to default position');
        });
    }

    // Escape key to unlock camera
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lockedObject) {
            unlockCamera();
            console.log('🔓 Camera unlocked (Escape pressed)');
        }
    });

    // Right-click to unlock camera
    const canvas = appRenderer?.domElement;
    if (canvas) {
        canvas.addEventListener('contextmenu', (e) => {
            if (lockedObject) {
                e.preventDefault();
                unlockCamera();
                console.log('🔓 Camera unlocked (right-click)');
                return false;
            }
        });
    }
}

/**
 * Setup performance slider
 */
function setupPerformanceControls() {
    const performanceSlider = document.getElementById('performance-slider');
    const performanceValue = document.getElementById('performance-value');

    if (performanceSlider && performanceValue) {
        performanceSlider.addEventListener('input', (e) => {
            const level = parseInt(e.target.value);

            // Update performance level immediately (renderer settings only)
            if (appRenderer) {
                const settings = setPerformanceLevel(level, appRenderer);

                // Update display
                performanceValue.textContent = `${settings.description}`;
            }

            // Debounce object recreation (wait 500ms after user stops moving slider)
            clearTimeout(sliderDebounceTimer);
            sliderDebounceTimer = setTimeout(() => {
                console.log(`🎨 Recreating objects for performance level: ${level}%`);
                if (recreateObjectsCallback) {
                    recreateObjectsCallback();
                }
            }, 500);
        });

        // Set initial value
        const initialSettings = getPerformanceSettings(50);
        performanceValue.textContent = `${initialSettings.description}`;
    }
}

/**
 * Setup display toggle checkboxes
 */
function setupDisplayToggles() {
    // Orbits toggle
    const toggleOrbits = document.getElementById('toggle-orbits');
    if (toggleOrbits) {
        toggleOrbits.addEventListener('change', (e) => {
            setOrbitsVisible(e.target.checked);
            console.log(`🌐 Orbits ${e.target.checked ? 'shown' : 'hidden'}`);
        });
    }

    // Trails toggle (ISS trail)
    const toggleTrails = document.getElementById('toggle-trails');
    if (toggleTrails) {
        toggleTrails.addEventListener('change', (e) => {
            setISSTrailVisible(e.target.checked);
            console.log(`✨ Trails ${e.target.checked ? 'shown' : 'hidden'}`);
        });
    }

    // Labels toggle
    const toggleLabels = document.getElementById('toggle-labels');
    if (toggleLabels) {
        toggleLabels.addEventListener('change', (e) => {
            setLabelsVisible(e.target.checked);
            console.log(`🏷️ Labels ${e.target.checked ? 'shown' : 'hidden'}`);
        });
    }

    // Stars toggle
    const toggleStars = document.getElementById('toggle-stars');
    if (toggleStars) {
        toggleStars.addEventListener('change', (e) => {
            setStarfieldVisible(e.target.checked);
            console.log(`⭐ Stars ${e.target.checked ? 'shown' : 'hidden'}`);
        });
    }
}

/**
 * Setup help modal
 */
function setupHelpModal() {
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
}

/**
 * Setup click-to-focus raycasting
 */
function setupClickToFocus() {
    const canvas = appRenderer?.domElement;
    if (!canvas) {
        console.warn('⚠️ Cannot setup click-to-focus: renderer not available');
        return;
    }

    canvas.addEventListener('click', (event) => {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update raycaster
        raycaster.setFromCamera(mouse, appCamera);

        // Get all clickable objects
        const objects = Array.from(clickableObjects.values());

        // Calculate intersections
        const intersects = raycaster.intersectObjects(objects, false);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            handleObjectClick(clickedObject);
        }
    });

    console.log('✅ Click-to-focus raycasting enabled');
}

/**
 * Register an object as clickable
 * @param {string} key - Object identifier (e.g., 'earth', 'iss')
 * @param {THREE.Object3D} object - Three.js mesh object
 * @param {Object} metadata - Additional metadata about the object
 */
export function registerClickableObject(key, object, metadata = {}) {
    if (!object) {
        console.warn(`⚠️ Cannot register ${key}: object is null`);
        return;
    }

    object.userData = {
        ...object.userData,
        key: key,
        ...metadata
    };

    clickableObjects.set(key, object);
}

/**
 * Handle object click
 * @param {THREE.Object3D} object - Clicked object
 */
function handleObjectClick(object) {
    const key = object.userData.key;
    if (!key) return;

    console.log(`🎯 Clicked: ${key}`);

    // Focus camera on object
    if (appCamera && cameraControls && object.position) {
        const targetPosition = object.position.clone();

        // Calculate optimal camera distance based on object size and type
        let baseRadius = 1;

        // Try to get radius from geometry
        if (object.geometry?.parameters?.radius) {
            baseRadius = object.geometry.parameters.radius;
        } else if (object.scale) {
            // Use scale as fallback
            baseRadius = object.scale.x;
        }

        // Different zoom distances for different object types
        let zoomMultiplier = 5; // Default
        if (key === 'sun') {
            zoomMultiplier = 3; // Closer to sun (it's big)
        } else if (key === 'iss') {
            zoomMultiplier = 20; // Much closer to ISS (it's small)
        } else if (key === 'moon') {
            zoomMultiplier = 8; // Medium distance for moon
        } else {
            zoomMultiplier = 6; // Good distance for planets
        }

        const cameraDistance = baseRadius * zoomMultiplier;

        // Calculate camera position offset (behind and above the object)
        cameraOffset = new THREE.Vector3(
            cameraDistance * 0.3,  // Slight side offset
            cameraDistance * 0.4,  // Above the object
            cameraDistance         // Behind the object
        );

        // Set new camera position
        const newCameraPosition = targetPosition.clone().add(cameraOffset);
        appCamera.position.copy(newCameraPosition);

        // Update orbit controls target to follow the object
        cameraControls.target.copy(targetPosition);
        cameraControls.update();

        // Lock onto this object for continuous following
        lockedObject = object;
        lockedObjectKey = key;
        previousObjectPosition = targetPosition.clone(); // Store initial position

        console.log(`📷 Camera locked onto ${key} at distance ${cameraDistance.toFixed(1)}`);
    }

    // Update selected object info panel
    updateSelectedObjectInfo(key, object);
}

/**
 * Update selected object info panel
 * @param {string} key - Object key
 * @param {THREE.Object3D} object - Object mesh
 * @param {THREE.Object3D} earthObject - Earth object for distance calculation
 */
function updateSelectedObjectInfo(key, object, earthObject = null) {
    const selectedInfo = document.getElementById('selected-info');
    if (!selectedInfo) return;

    const name = object.name || key;

    // Use REAL astronomical distances, not visual scene distances
    // Visual scene mixes scales (planets are 1500x larger for visibility)

    // Real distances in miles (from astronomical data)
    const realDistances = {
        sun: { fromSun: 0, fromEarth: 92955807 }, // Sun is 1 AU from Earth
        mercury: { fromSun: 35983095, fromEarth: null }, // 0.387 AU from Sun
        venus: { fromSun: 67237910, fromEarth: null }, // 0.723 AU from Sun
        earth: { fromSun: 92955807, fromEarth: 0 }, // 1 AU from Sun (by definition)
        mars: { fromSun: 141637725, fromEarth: null }, // 1.524 AU from Sun
        moon: { fromSun: 92955807, fromEarth: 238855 }, // ~239,000 miles from Earth
        iss: { fromSun: 92955807, fromEarth: 254 } // ~254 miles from Earth (408 km)
    };

    const distances = realDistances[key] || { fromSun: 0, fromEarth: 0 };

    // Calculate dynamic Earth distance for planets (changes as they orbit)
    let earthDistanceHTML = '';
    if (key !== 'earth' && key !== 'iss' && key !== 'moon' && earthObject) {
        // For planets, calculate actual distance based on their orbital positions
        // 1 scene unit in orbital space = 1 AU / (SCALE.AU_TO_SCENE / 500) = 1 AU / 1 = 1 AU
        // Wait, SCALE.AU_TO_SCENE = 500, so 500 scene units = 1 AU
        // Therefore: 1 scene unit = 1/500 AU = 185,911.6 miles
        const SCENE_UNITS_TO_MILES = 185911.6;

        // For planets, use scene distances (they're on the same AU scale)
        const visualDistance = object.position.distanceTo(earthObject.position);
        const distanceFromEarthMiles = visualDistance * SCENE_UNITS_TO_MILES;

        earthDistanceHTML = `
            <div class="info-row">
                <span class="info-label">From Earth:</span>
                <span>${formatDistance(distanceFromEarthMiles)}</span>
            </div>
        `;
    } else if (key !== 'earth' && distances.fromEarth !== null) {
        // For ISS and Moon, use fixed real distances
        earthDistanceHTML = `
            <div class="info-row">
                <span class="info-label">From Earth:</span>
                <span>${formatDistance(distances.fromEarth)}</span>
            </div>
        `;
    }

    selectedInfo.innerHTML = `
        <p><strong>${name}</strong> <span style="color: #4a90e2;">🔒 Locked</span></p>
        <div class="info-row">
            <span class="info-label">From Sun:</span>
            <span>${formatDistance(distances.fromSun)}</span>
        </div>
        ${earthDistanceHTML}
        <p style="font-size: 11px; color: #888; margin-top: 8px;">
            Camera follows this object. Use mouse to rotate view.<br>
            ESC or right-click to unlock.
        </p>
    `;
}

/**
 * Format distance in miles with appropriate units
 * @param {number} miles - Distance in miles
 * @returns {string} Formatted distance string
 */
function formatDistance(miles) {
    if (miles < 1000) {
        return `${miles.toFixed(1)} mi`;
    } else if (miles < 1000000) {
        return `${(miles / 1000).toFixed(1)}K mi`;
    } else {
        return `${(miles / 1000000).toFixed(2)}M mi`;
    }
}

/**
 * Update FPS counter
 * @param {number} fps - Current FPS value
 */
export function updateFPS(fps) {
    const fpsCounter = document.getElementById('fps-counter');
    if (fpsCounter) {
        fpsCounter.textContent = `FPS: ${Math.round(fps)}`;
    }
}

/**
 * Update ISS info panel with real-time data
 * @param {Object} issData - ISS data from API
 * @param {Object} issData.position - Geographic position {lat, lon}
 * @param {number} issData.altitude - Altitude in km
 * @param {number} issData.timestamp - Unix timestamp (optional)
 */
export function updateISSInfo(issData) {
    if (!issData) return;

    // Update cache - use current time in milliseconds for lastUpdate
    issDataCache = {
        position: issData.position || issDataCache.position,
        altitude: issData.altitude || issDataCache.altitude,
        velocity: issDataCache.velocity, // Keep constant (orbital speed)
        lastUpdate: Date.now() // Always use current time when data arrives
    };

    // Update UI elements
    const positionEl = document.getElementById('iss-position');
    const altitudeEl = document.getElementById('iss-altitude');
    const velocityEl = document.getElementById('iss-velocity');
    const updateTimeEl = document.getElementById('iss-update-time');

    if (positionEl) {
        const lat = issDataCache.position.lat.toFixed(2);
        const lon = issDataCache.position.lon.toFixed(2);
        const latDir = issDataCache.position.lat >= 0 ? 'N' : 'S';
        const lonDir = issDataCache.position.lon >= 0 ? 'E' : 'W';
        positionEl.textContent = `${Math.abs(lat)}°${latDir}, ${Math.abs(lon)}°${lonDir}`;
    }

    if (altitudeEl) {
        altitudeEl.textContent = `${Math.round(issDataCache.altitude)} km`;
    }

    if (velocityEl) {
        velocityEl.textContent = `${issDataCache.velocity.toLocaleString()} km/h`;
    }

    // Update the "time ago" display
    updateISSTimeDisplay();
}

/**
 * Update the ISS "last update" time display (call periodically)
 */
function updateISSTimeDisplay() {
    const updateTimeEl = document.getElementById('iss-update-time');

    if (updateTimeEl && issDataCache.lastUpdate) {
        const now = Date.now();
        const secondsAgo = Math.floor((now - issDataCache.lastUpdate) / 1000);

        if (secondsAgo < 0) {
            // Shouldn't happen, but just in case
            updateTimeEl.textContent = 'just now';
        } else if (secondsAgo < 60) {
            updateTimeEl.textContent = `${secondsAgo}s ago`;
        } else if (secondsAgo < 3600) {
            const minutesAgo = Math.floor(secondsAgo / 60);
            updateTimeEl.textContent = `${minutesAgo}m ago`;
        } else {
            const hoursAgo = Math.floor(secondsAgo / 3600);
            updateTimeEl.textContent = `${hoursAgo}h ago`;
        }
    }
}

/**
 * Update ISS info panel with status message
 * @param {string} message - Status message
 */
export function setISSInfoStatus(message) {
    const positionEl = document.getElementById('iss-position');
    if (positionEl) {
        positionEl.textContent = message;
    }
}

/**
 * Update camera following and selected object info (call every frame)
 * @param {THREE.Object3D} earthObject - Earth object for distance calculations
 */
export function updateCameraFollow(earthObject) {
    // Update camera to follow locked object
    if (lockedObject && cameraControls && previousObjectPosition) {
        const currentObjectPosition = lockedObject.position.clone();

        // Calculate how much the object has moved since last frame
        const delta = new THREE.Vector3().subVectors(currentObjectPosition, previousObjectPosition);

        // Move both camera and target by the same delta
        // This maintains the camera's relative position to the object
        appCamera.position.add(delta);
        cameraControls.target.add(delta);

        // Update previous position for next frame
        previousObjectPosition.copy(currentObjectPosition);

        // Update controls (this respects user's rotation/zoom inputs)
        cameraControls.update();
    }

    // Update selected object info with live distances
    if (lockedObject && lockedObjectKey) {
        updateSelectedObjectInfo(lockedObjectKey, lockedObject, earthObject);
    }

    // Update ISS "time ago" display (counts up continuously)
    updateISSTimeDisplay();
}

/**
 * Unlock camera from currently followed object
 */
export function unlockCamera() {
    if (lockedObject) {
        console.log(`📷 Camera unlocked from ${lockedObjectKey || 'object'}`);
    }

    lockedObject = null;
    lockedObjectKey = null;
    cameraOffset = null;
    previousObjectPosition = null;

    // Clear selected object info panel
    const selectedInfo = document.getElementById('selected-info');
    if (selectedInfo) {
        selectedInfo.innerHTML = '<p>Click any planet or the ISS to see details</p>';
    }
}

/**
 * Dispose UI system (cleanup)
 */
export function disposeUI() {
    // Clear clickable objects
    clickableObjects.clear();

    // Unlock camera
    unlockCamera();

    // Clear debounce timer
    if (sliderDebounceTimer) {
        clearTimeout(sliderDebounceTimer);
        sliderDebounceTimer = null;
    }

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
    updateFPS,
    updateISSInfo,
    setISSInfoStatus,
    updateCameraFollow,
    unlockCamera,
    disposeUI
};
