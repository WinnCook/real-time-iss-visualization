/**
 * Camera Module - Camera Setup and Orbit Controls
 * Manages the perspective camera and user interaction controls
 */

import { RENDER } from '../utils/constants.js';

/**
 * The main perspective camera
 * @type {THREE.PerspectiveCamera}
 */
export let camera;

/**
 * TrackballControls for camera manipulation (unlimited rotation)
 * @type {THREE.TrackballControls}
 */
export let controls;

/**
 * Initialize the camera and trackball controls
 * @param {HTMLElement} domElement - The canvas element for controls
 * @returns {Object} Object containing camera and controls
 */
export function initCamera(domElement) {
    // Create perspective camera
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(
        RENDER.FOV,
        aspect,
        RENDER.NEAR,
        RENDER.FAR
    );

    // Set initial camera position
    camera.position.set(
        RENDER.DEFAULT_CAMERA_POSITION.x,
        RENDER.DEFAULT_CAMERA_POSITION.y,
        RENDER.DEFAULT_CAMERA_POSITION.z
    );

    // Camera looks at origin (where the sun is)
    camera.lookAt(0, 0, 0);

    console.log('✅ Camera initialized at position:', camera.position);

    // Initialize trackball controls if domElement is provided
    if (domElement && typeof THREE.TrackballControls !== 'undefined') {
        initControls(domElement);
    }

    return { camera, controls };
}

/**
 * Initialize TrackballControls for camera manipulation (TRULY UNLIMITED ROTATION)
 * @param {HTMLElement} domElement - The canvas element
 * @returns {THREE.TrackballControls}
 */
export function initControls(domElement) {
    if (!camera) {
        console.error('Camera must be initialized before controls');
        return null;
    }

    // Create TrackballControls - NO ROTATION LIMITS BY DESIGN
    controls = new THREE.TrackballControls(camera, domElement);

    // Configure controls for smooth, unlimited rotation
    controls.rotateSpeed = 1.5;          // Rotation sensitivity
    controls.zoomSpeed = 1.2;            // Zoom sensitivity
    controls.panSpeed = 0.8;             // Pan sensitivity

    controls.noZoom = false;             // Enable zoom
    controls.noPan = false;              // Enable pan
    controls.noRotate = false;           // Enable rotation

    controls.staticMoving = false;       // Enable momentum/inertia
    controls.dynamicDampingFactor = 0.15; // Smooth damping with momentum

    controls.minDistance = 0;            // NO FUCKING LIMIT - ZOOM TO INFINITY!
    controls.maxDistance = 999999;       // Maximum zoom distance (see full solar system)

    // TrackballControls has NO angle limits - you can spin infinitely in ANY direction!
    console.log('🎮 TrackballControls initialized - TRULY UNLIMITED ROTATION');
    console.log('   ✅ No polar angle limits (can rotate past poles)');
    console.log('   ✅ No azimuth limits (infinite horizontal rotation)');
    console.log('   ✅ Can spin continuously in any direction');

    return controls;
}

/**
 * Handle window resize - update camera aspect ratio
 */
export function onWindowResize() {
    if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

/**
 * Reset camera to default position
 */
export function resetCamera() {
    if (camera && controls) {
        camera.position.set(
            RENDER.DEFAULT_CAMERA_POSITION.x,
            RENDER.DEFAULT_CAMERA_POSITION.y,
            RENDER.DEFAULT_CAMERA_POSITION.z
        );
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.reset();
        console.log('🎥 Camera reset to default position');
    }
}

/**
 * Focus camera on a specific object
 * @param {THREE.Object3D} object - Object to focus on
 * @param {number} distance - Distance from object (default: 20)
 */
export function focusOnObject(object, distance = 20) {
    if (!camera || !controls || !object) return;

    // Get object's world position
    const objectPosition = new THREE.Vector3();
    object.getWorldPosition(objectPosition);

    // Set controls target to object position (TrackballControls DOES have target)
    controls.target.copy(objectPosition);

    // Calculate camera position (offset from object)
    const direction = new THREE.Vector3()
        .subVectors(camera.position, objectPosition)
        .normalize();

    camera.position.copy(objectPosition).add(direction.multiplyScalar(distance));

    console.log(`🎯 Camera focused on: ${object.name || 'object'}`);
}

/**
 * Smooth camera transition to a target
 * @param {THREE.Vector3} targetPosition - Target position for camera
 * @param {THREE.Vector3} lookAtPosition - Position to look at
 * @param {number} duration - Transition duration in ms (default: 1000)
 */
export function animateCameraTo(targetPosition, lookAtPosition, duration = 1000) {
    if (!camera || !controls) return;

    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out function
        const eased = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

        // Interpolate camera position
        camera.position.lerpVectors(startPosition, targetPosition, eased);

        // Interpolate controls target
        controls.target.lerpVectors(startTarget, lookAtPosition, eased);

        controls.update();

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

/**
 * Update controls (call this every frame - TrackballControls ALWAYS needs update)
 */
export function updateControls() {
    if (controls) {
        controls.update();
    }
}

/**
 * Get camera position
 * @returns {THREE.Vector3}
 */
export function getCameraPosition() {
    return camera ? camera.position.clone() : new THREE.Vector3();
}

/**
 * Get camera target (where camera is looking)
 * @returns {THREE.Vector3}
 */
export function getCameraTarget() {
    return controls ? controls.target.clone() : new THREE.Vector3();
}

/**
 * Enable/disable camera controls
 * @param {boolean} enabled
 */
export function setControlsEnabled(enabled) {
    if (controls) {
        controls.enabled = enabled;
    }
}

// Export camera and controls as default
export default {
    camera,
    controls,
    initCamera,
    initControls,
    onWindowResize,
    resetCamera,
    focusOnObject,
    animateCameraTo,
    updateControls,
    getCameraPosition,
    getCameraTarget,
    setControlsEnabled
};
