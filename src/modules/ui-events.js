/**
 * UI Events Module - Click Handlers, Keyboard Shortcuts, and Camera Controls
 * Manages raycasting, click-to-focus, keyboard shortcuts, and camera locking
 * Extracted from monolithic ui.js for better maintainability
 */

import { timeManager } from '../utils/time.js';
import { resetCamera, controls as cameraControls } from '../core/camera.js';
import { setOrbitsVisible } from './orbits.js';
import { setLabelsVisible } from './labels.js';
import { setISSTrailVisible } from './iss.js';
import { setStarfieldVisible } from './starfield.js';
import { captureScreenshot } from '../utils/screenshot.js';
import { getPlanetSizeMode } from '../utils/constants.js';
import { addEarthReferencePoints, removeEarthReferencePoints } from '../utils/earthDebug.js';
import { playFocusSound } from '../utils/sounds.js';
import { updateSelectedObjectInfo, clearSelectedObjectInfo } from './ui-panels.js';

/**
 * References to app state (set during initialization)
 */
let appRenderer = null;
let appCamera = null;
let appScene = null;

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
 * Earth debug markers state
 */
let earthDebugMarkersVisible = false;

/**
 * Initialize events module
 * @param {Object} options - Initialization options
 * @param {THREE.Renderer} options.renderer - Three.js renderer
 * @param {THREE.Camera} options.camera - Three.js camera
 * @param {THREE.Scene} options.scene - Three.js scene
 */
export function initEvents(options) {
    appRenderer = options.renderer;
    appCamera = options.camera;
    appScene = options.scene;

    // Initialize raycaster for click detection
    raycaster = new THREE.Raycaster();

    // Set up all event listeners
    setupCameraControls();
    setupClickToFocus();
    setupObjectDropdown();
    setupKeyboardShortcuts();

    console.log('✅ UI Events initialized');
}

/**
 * Setup camera controls
 */
function setupCameraControls() {
    console.log('🚨🚨🚨 SETUP CAMERA CONTROLS CALLED 🚨🚨🚨');

    // Reset camera button
    const resetCameraBtn = document.getElementById('reset-camera');
    console.log('  Reset button:', resetCameraBtn);
    if (resetCameraBtn) {
        resetCameraBtn.addEventListener('click', () => {
            unlockCamera();
            resetCamera();
            console.log('🎥 Camera reset');
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
 * Setup click-to-focus raycasting
 */
function setupClickToFocus() {
    const canvas = appRenderer?.domElement;
    if (!canvas) {
        console.warn('⚠️ Cannot setup click-to-focus: renderer not available');
        return;
    }

    // Track mouse position to distinguish click from drag
    let mouseDownPos = null;
    const DRAG_THRESHOLD = 5; // pixels - if mouse moves more than this, it's a drag not a click

    canvas.addEventListener('mousedown', (event) => {
        mouseDownPos = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener('mouseup', (event) => {
        if (!mouseDownPos) return;

        // Calculate how far mouse moved since mousedown
        const dx = event.clientX - mouseDownPos.x;
        const dy = event.clientY - mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Reset mouseDownPos
        mouseDownPos = null;

        // If mouse moved significantly, user was dragging (rotating camera), not clicking
        if (distance > DRAG_THRESHOLD) {
            return; // Don't trigger focus on drag
        }

        // This was a genuine click (not a drag) - perform raycasting
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update raycaster
        raycaster.setFromCamera(mouse, appCamera);

        // Get all clickable objects
        const objects = Array.from(clickableObjects.values());

        // Calculate intersections (recursive: true to detect child meshes like Saturn's rings)
        const intersects = raycaster.intersectObjects(objects, true);

        if (intersects.length > 0) {
            // Find the registered parent object (traverse up if we hit a child mesh)
            let clickedObject = intersects[0].object;

            // If we hit a child object (like Saturn's rings), find the registered parent
            while (clickedObject && !clickedObject.userData.key) {
                clickedObject = clickedObject.parent;
            }

            if (clickedObject && clickedObject.userData.key) {
                handleObjectClick(clickedObject);
            }
        }
    });

    console.log('✅ Click-to-focus raycasting enabled (drag-aware)');
}

/**
 * Setup object dropdown selector
 */
function setupObjectDropdown() {
    const dropdown = document.getElementById('object-dropdown');
    if (!dropdown) {
        console.warn('⚠️ Cannot setup object dropdown: element not found');
        return;
    }

    dropdown.addEventListener('change', (e) => {
        const selectedKey = e.target.value;

        if (!selectedKey) {
            // User selected the placeholder option
            return;
        }

        console.log(`🎯 Dropdown selected: ${selectedKey}`);

        // Get the object from clickableObjects
        const object = clickableObjects.get(selectedKey);

        if (object) {
            // Trigger the same click handler
            handleObjectClick(object);
        } else {
            console.warn(`⚠️ Object not found in clickableObjects: ${selectedKey}`);
        }

        // Reset dropdown to placeholder after selection (optional)
        // e.target.value = '';
    });

    console.log('✅ Object dropdown selector enabled');
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (event) => {
        // Don't trigger if user is typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = event.key.toLowerCase();

        switch (key) {
            case ' ': // Space - Play/Pause
                event.preventDefault();
                const playPauseBtn = document.getElementById('play-pause');
                if (playPauseBtn) playPauseBtn.click();
                break;

            case 'r': // R - Reset Camera
                event.preventDefault();
                unlockCamera();
                resetCamera();
                console.log('⌨️ Keyboard: Camera reset');
                break;

            case 'escape': // ESC - Unlock Camera (already handled but documented here)
                unlockCamera();
                break;

            case 'h': // H - Show Help
            case '?':
                event.preventDefault();
                const helpModal = document.getElementById('help-modal');
                if (helpModal) {
                    helpModal.classList.remove('hidden');
                    console.log('⌨️ Keyboard: Help opened');
                }
                break;

            case 'o': // O - Toggle Orbits
                event.preventDefault();
                const orbitsToggle = document.getElementById('toggle-orbits');
                if (orbitsToggle) {
                    orbitsToggle.checked = !orbitsToggle.checked;
                    setOrbitsVisible(orbitsToggle.checked);
                    console.log(`⌨️ Keyboard: Orbits ${orbitsToggle.checked ? 'ON' : 'OFF'}`);
                }
                break;

            case 'l': // L - Toggle Labels
                event.preventDefault();
                const labelsToggle = document.getElementById('toggle-labels');
                if (labelsToggle) {
                    labelsToggle.checked = !labelsToggle.checked;
                    setLabelsVisible(labelsToggle.checked);
                    console.log(`⌨️ Keyboard: Labels ${labelsToggle.checked ? 'ON' : 'OFF'}`);
                }
                break;

            case 't': // T - Toggle Trails
                event.preventDefault();
                const trailsToggle = document.getElementById('toggle-trails');
                if (trailsToggle) {
                    trailsToggle.checked = !trailsToggle.checked;
                    setISSTrailVisible(trailsToggle.checked);
                    console.log(`⌨️ Keyboard: Trails ${trailsToggle.checked ? 'ON' : 'OFF'}`);
                }
                break;

            case 's': // S - Toggle Stars
                event.preventDefault();
                const starsToggle = document.getElementById('toggle-stars');
                if (starsToggle) {
                    starsToggle.checked = !starsToggle.checked;
                    setStarfieldVisible(starsToggle.checked);
                    console.log(`⌨️ Keyboard: Stars ${starsToggle.checked ? 'ON' : 'OFF'}`);
                }
                break;

            case 'd': // D - Toggle Earth Debug Markers (for texture verification)
                event.preventDefault();
                toggleEarthDebugMarkers();
                break;

            case '1': // 1 - Realistic Style
                event.preventDefault();
                clickStyleButton('realistic');
                break;

            case '2': // 2 - Cartoon Style
                event.preventDefault();
                clickStyleButton('cartoon');
                break;

            case '3': // 3 - Neon Style
                event.preventDefault();
                clickStyleButton('neon');
                break;

            case '4': // 4 - Minimalist Style
                event.preventDefault();
                clickStyleButton('minimalist');
                break;

            case 'arrowup': // Arrow Up - Increase Time Speed
                event.preventDefault();
                adjustTimeSpeed(1.5);
                break;

            case 'arrowdown': // Arrow Down - Decrease Time Speed
                event.preventDefault();
                adjustTimeSpeed(0.66);
                break;

            case 'arrowleft': // Arrow Left - Slower preset
                event.preventDefault();
                setTimeSpeedPreset('slower');
                break;

            case 'arrowright': // Arrow Right - Faster preset
                event.preventDefault();
                setTimeSpeedPreset('faster');
                break;

            case 'f': // F - Focus on Earth
                event.preventDefault();
                focusOnObject('earth');
                break;

            case 'i': // I - Focus on ISS
                event.preventDefault();
                focusOnObject('iss');
                break;

            case 'p': // P - Take Screenshot
                event.preventDefault();
                captureScreenshot();
                console.log('⌨️ Keyboard: Screenshot captured');
                break;
        }
    });

    console.log('✅ Keyboard shortcuts enabled');
}

/**
 * Click a style button by key
 * @param {string} styleKey - Style identifier
 */
function clickStyleButton(styleKey) {
    const button = document.querySelector(`[data-style="${styleKey}"]`);
    if (button) {
        button.click();
        console.log(`⌨️ Keyboard: Switched to ${styleKey} style`);
    }
}

/**
 * Adjust time speed by multiplier
 * @param {number} multiplier - Speed multiplier
 */
function adjustTimeSpeed(multiplier) {
    const currentSpeed = timeManager.getTimeSpeed();
    const newSpeed = Math.max(1, Math.min(500000, currentSpeed * multiplier));
    timeManager.setTimeSpeed(newSpeed);

    // Update UI
    const slider = document.getElementById('time-speed');
    const speedValue = document.getElementById('speed-value');
    if (slider) slider.value = newSpeed;
    if (speedValue) speedValue.textContent = `${Math.round(newSpeed)}x`;

    console.log(`⌨️ Keyboard: Time speed ${newSpeed}x`);
}

/**
 * Set time speed to preset
 * @param {string} direction - 'slower' or 'faster'
 */
function setTimeSpeedPreset(direction) {
    const presets = [1000, 10000, 50000, 100000, 500000];
    const currentSpeed = timeManager.getTimeSpeed();

    let newSpeed;
    if (direction === 'faster') {
        // Find next higher preset
        newSpeed = presets.find(p => p > currentSpeed) || presets[presets.length - 1];
    } else {
        // Find next lower preset
        newSpeed = [...presets].reverse().find(p => p < currentSpeed) || presets[0];
    }

    timeManager.setTimeSpeed(newSpeed);

    // Update UI
    const slider = document.getElementById('time-speed');
    const speedValue = document.getElementById('speed-value');
    if (slider) slider.value = newSpeed;
    if (speedValue) speedValue.textContent = `${newSpeed}x`;

    console.log(`⌨️ Keyboard: Time speed ${newSpeed}x`);
}

/**
 * Focus on a specific object by key
 * @param {string} objectKey - Object identifier
 */
function focusOnObject(objectKey) {
    const object = clickableObjects.get(objectKey);
    if (object) {
        handleObjectClick(object);
    } else {
        console.warn(`⚠️ Object not found: ${objectKey}`);
    }
}

/**
 * Toggle Earth debug reference markers for texture orientation verification
 */
function toggleEarthDebugMarkers() {
    earthDebugMarkersVisible = !earthDebugMarkersVisible;

    if (earthDebugMarkersVisible) {
        addEarthReferencePoints();
        console.log('⌨️ Keyboard: Earth debug markers ON (Press D to toggle)');
        console.log('📍 Markers show major cities to verify Earth texture orientation');
    } else {
        removeEarthReferencePoints();
        console.log('⌨️ Keyboard: Earth debug markers OFF');
    }
}

/**
 * Handle object click
 * @param {THREE.Object3D} object - Clicked object
 */
function handleObjectClick(object) {
    const key = object.userData.key;
    if (!key) return;

    console.log(`🎯 Clicked: ${key}`);
    console.log(`   Object:`, object);
    console.log(`   Object name: ${object.name}`);
    console.log(`   Object type: ${object.type}`);
    console.log(`   Is LOD: ${object.isLOD}`);
    playFocusSound();

    // Focus camera on object
    if (appCamera && cameraControls) {
        // Get WORLD position (not local position - ISS is a child of scene!)
        const targetPosition = new THREE.Vector3();
        object.getWorldPosition(targetPosition);
        console.log(`   Target position (getWorldPosition): (${targetPosition.x.toFixed(2)}, ${targetPosition.y.toFixed(2)}, ${targetPosition.z.toFixed(2)})`);
        console.log(`   Object.position: (${object.position.x.toFixed(2)}, ${object.position.y.toFixed(2)}, ${object.position.z.toFixed(2)})`);

        // For LOD objects, also check children
        if (object.isLOD && object.children && object.children.length > 0) {
            console.log(`   LOD has ${object.children.length} children`);
            object.children.forEach((child, i) => {
                const childPos = new THREE.Vector3();
                child.getWorldPosition(childPos);
                console.log(`   Child ${i}: (${childPos.x.toFixed(2)}, ${childPos.y.toFixed(2)}, ${childPos.z.toFixed(2)})`);
            });
        }

        // Calculate optimal camera distance based on object size and type
        let baseRadius = 1;

        // SPECIAL HANDLING FOR ISS (it's a LOD object, not a simple mesh)
        if (key === 'iss') {
            // Get current scale mode to determine appropriate camera distance
            const sizeMode = getPlanetSizeMode();

            // Check if ISS is actually at origin (sun position - indicates ISS not loaded)
            const distanceFromOrigin = Math.sqrt(
                targetPosition.x * targetPosition.x +
                targetPosition.y * targetPosition.y +
                targetPosition.z * targetPosition.z
            );
            if (distanceFromOrigin < 1) {
                console.error(`❌ ISS TOO CLOSE TO ORIGIN (distance: ${distanceFromOrigin.toFixed(4)}) - ISS NOT LOADED YET!`);
                console.error('   Wait a few seconds for ISS API to load position, then try again');
                alert('ISS is still loading. Wait 2-3 seconds and try clicking again.');
                return;
            }

            // SIMPLE APPROACH: Use fixed camera distances that WORK
            console.log(`   🛰️ ISS scale mode: ${sizeMode}`);

            if (sizeMode === 'real') {
                baseRadius = 0.005; // VERY CLOSE for tiny ISS
                console.log(`   🛰️ ISS REAL mode: Using fixed baseRadius = ${baseRadius}`);
            } else {
                baseRadius = 20; // Decent distance for enlarged ISS
                console.log(`   🛰️ ISS ENLARGED mode: Using fixed baseRadius = ${baseRadius}`);
            }
        }
        // Try to get radius from geometry
        else if (object.geometry?.parameters?.radius) {
            baseRadius = object.geometry.parameters.radius;
        }
        // Handle LOD objects (get radius from first child)
        else if (object.isLOD && object.children && object.children[0]) {
            const firstChild = object.children[0];
            if (firstChild.geometry?.parameters?.radius) {
                baseRadius = firstChild.geometry.parameters.radius;
            } else if (firstChild.scale) {
                baseRadius = firstChild.scale.x;
            }
            console.log(`   LOD object detected, baseRadius from child: ${baseRadius}`);
        }
        else if (object.scale) {
            // Use scale as fallback
            baseRadius = object.scale.x;
        }

        // Calculate final camera distance
        let finalCameraDistance;

        if (key === 'iss') {
            // ISS gets DIRECT camera distance - no multipliers, no minimums
            const sizeMode = getPlanetSizeMode();
            if (sizeMode === 'real') {
                finalCameraDistance = 0.05;
                console.log(`   🛰️ ISS REAL mode: Direct camera distance = ${finalCameraDistance} (near plane will be 0.001)`);
            } else {
                finalCameraDistance = 60;
                console.log(`   🛰️ ISS ENLARGED mode: Direct camera distance = ${finalCameraDistance}`);
            }
        } else {
            // PLANETS get multiplier logic
            let zoomMultiplier = 3; // Default - CLOSE UP
            if (key === 'sun') {
                zoomMultiplier = 2.5; // Closer to sun (it's big)
            } else if (key === 'moon') {
                zoomMultiplier = 4; // Close to moon
            } else {
                zoomMultiplier = 3; // Close to planets
            }

            const cameraDistance = baseRadius * zoomMultiplier;
            const minCameraDistance = 3; // Minimum for planets
            finalCameraDistance = Math.max(cameraDistance, minCameraDistance);
            console.log(`   Calculated distance: ${cameraDistance.toFixed(4)} -> final: ${finalCameraDistance.toFixed(4)}`);
        }

        // Calculate camera position offset
        // ISS gets PERFECTLY CENTERED view, planets get angled view
        if (key === 'iss') {
            // PERFECTLY CENTERED - camera directly in front, looking straight at ISS
            cameraOffset = new THREE.Vector3(
                0,  // No side offset - perfectly centered!
                0,  // No vertical offset - perfectly centered!
                finalCameraDistance  // Only distance, straight ahead
            );
            console.log(`   📷 ISS: Using CENTERED camera view (no offset)`);
        } else {
            // Planets get angled view (behind and above)
            cameraOffset = new THREE.Vector3(
                finalCameraDistance * 0.3,  // Slight side offset
                finalCameraDistance * 0.4,  // Above the object
                finalCameraDistance         // Behind the object
            );
        }

        // Set new camera position
        const newCameraPosition = targetPosition.clone().add(cameraOffset);
        appCamera.position.copy(newCameraPosition);

        // CRITICAL: Adjust camera near plane for ISS in real mode
        if (key === 'iss') {
            const sizeMode = getPlanetSizeMode();
            if (sizeMode === 'real') {
                appCamera.near = 0.001;
                appCamera.updateProjectionMatrix();
                console.log(`   📷 Camera near plane reduced to ${appCamera.near} for tiny ISS`);
            } else {
                appCamera.near = 0.1;
                appCamera.updateProjectionMatrix();
                console.log(`   📷 Camera near plane reset to ${appCamera.near}`);
            }
        } else {
            // Reset to default for planets
            appCamera.near = 0.1;
            appCamera.updateProjectionMatrix();
        }

        // Update orbit controls target to follow the object
        cameraControls.target.copy(targetPosition);
        cameraControls.update();

        // Lock onto this object for continuous following
        lockedObject = object;
        lockedObjectKey = key;
        previousObjectPosition = targetPosition.clone(); // Store initial position

        console.log(`📷 Camera locked onto ${key}`);
        console.log(`   Distance: ${finalCameraDistance.toFixed(2)} (baseRadius: ${baseRadius.toFixed(4)})`);
        console.log(`   Camera pos: (${newCameraPosition.x.toFixed(2)}, ${newCameraPosition.y.toFixed(2)}, ${newCameraPosition.z.toFixed(2)})`);
        console.log(`   Looking at: (${targetPosition.x.toFixed(2)}, ${targetPosition.y.toFixed(2)}, ${targetPosition.z.toFixed(2)})`);
    }

    // Update selected object info panel
    import('./solarSystem.js').then(({ getCelestialObject }) => {
        const earthObject = getCelestialObject('earth');
        updateSelectedObjectInfo(key, object, earthObject);
    });
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
 * Re-register all clickable objects (call after objects are recreated)
 */
export function reregisterAllClickableObjects() {
    import('./solarSystem.js').then(({ getCelestialObject }) => {
        // Re-register all celestial objects
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

        // Register Jupiter's Galilean moons
        registerClickableObject('io', getCelestialObject('io'), { type: 'major_moon', name: 'Io', parent: 'Jupiter' });
        registerClickableObject('europa', getCelestialObject('europa'), { type: 'major_moon', name: 'Europa', parent: 'Jupiter' });
        registerClickableObject('ganymede', getCelestialObject('ganymede'), { type: 'major_moon', name: 'Ganymede', parent: 'Jupiter' });
        registerClickableObject('callisto', getCelestialObject('callisto'), { type: 'major_moon', name: 'Callisto', parent: 'Jupiter' });

        // Register Saturn's major moons
        registerClickableObject('titan', getCelestialObject('titan'), { type: 'major_moon', name: 'Titan', parent: 'Saturn' });
        registerClickableObject('rhea', getCelestialObject('rhea'), { type: 'major_moon', name: 'Rhea', parent: 'Saturn' });
        registerClickableObject('iapetus', getCelestialObject('iapetus'), { type: 'major_moon', name: 'Iapetus', parent: 'Saturn' });

        registerClickableObject('iss', getCelestialObject('iss'), { type: 'spacecraft', name: 'ISS' });

        console.log('✅ All clickable objects re-registered (including 7 major moons)');
    });
}

/**
 * Update camera to follow locked object (call every frame)
 * @param {THREE.Object3D} earthObject - Earth object for distance calculations
 */
export function updateCameraFollow(earthObject) {
    // Update camera to follow locked object
    if (lockedObject && cameraControls && previousObjectPosition) {
        // Get WORLD position (critical for objects like ISS that are children of scene)
        const currentObjectPosition = new THREE.Vector3();
        lockedObject.getWorldPosition(currentObjectPosition);

        // Calculate how much the object has moved since last frame
        const delta = new THREE.Vector3().subVectors(currentObjectPosition, previousObjectPosition);

        // Move both camera and target by the same delta
        appCamera.position.add(delta);
        cameraControls.target.add(delta);

        // Update previous position for next frame
        previousObjectPosition.copy(currentObjectPosition);

        // Update controls
        cameraControls.update();
    }

    // Update selected object info with live distances
    if (lockedObject && lockedObjectKey) {
        updateSelectedObjectInfo(lockedObjectKey, lockedObject, earthObject);
    }
}

/**
 * Get currently locked object state (for saving during rebuilds)
 * @returns {Object|null} Locked object state or null
 */
export function getLockedObjectState() {
    if (!lockedObject) return null;

    return {
        key: lockedObjectKey,
        offset: cameraOffset ? cameraOffset.clone() : null
    };
}

/**
 * Set locked object state (for restoring after rebuilds)
 * @param {Object} state - Locked object state
 */
export function setLockedObjectState(state) {
    if (!state || !state.key) return;

    const object = clickableObjects.get(state.key);
    if (object) {
        lockedObject = object;
        lockedObjectKey = state.key;
        if (state.offset) {
            cameraOffset = state.offset.clone();
        }
        // Update camera to follow the object immediately
        const objPos = new THREE.Vector3();
        lockedObject.getWorldPosition(objPos);
        previousObjectPosition = objPos.clone();
        console.log(`🔒 Camera re-locked to ${state.key} after rebuild`);
    }
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
    clearSelectedObjectInfo();
}

/**
 * Refocus camera on currently locked object (after scale mode change)
 * @returns {boolean} True if refocused, false if nothing was locked
 */
export function refocusOnLockedObject() {
    if (!lockedObject || !lockedObjectKey) {
        console.log('📷 No locked object to refocus on');
        return false;
    }

    const objectKey = lockedObjectKey;
    console.log(`📷 Refocusing on locked object: ${objectKey}`);
    console.log(`   Current scale mode: ${getPlanetSizeMode()}`);

    // Get the newly rebuilt object from clickableObjects
    const newObject = clickableObjects.get(objectKey);
    if (!newObject) {
        console.error(`❌ Locked object ${objectKey} not found in clickableObjects!`);
        console.log(`   Available objects: ${Array.from(clickableObjects.keys()).join(', ')}`);
        unlockCamera();
        return false;
    }

    console.log(`   ✅ Found new object:`, newObject);

    // Re-run the focus logic with the new object
    handleObjectClick(newObject);
    return true;
}

/**
 * Get locked object key
 * @returns {string|null} Locked object key or null
 */
export function getLockedObjectKey() {
    return lockedObjectKey;
}

/**
 * Dispose events module (cleanup)
 */
export function disposeEvents() {
    // Clear clickable objects
    clickableObjects.clear();

    // Unlock camera
    unlockCamera();

    // Reset references
    appRenderer = null;
    appCamera = null;
    appScene = null;

    console.log('✅ UI Events disposed');
}
