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
 * OrbitControls for camera manipulation
 * @type {THREE.OrbitControls}
 */
export let controls;

/**
 * Initialize the camera and orbit controls
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

    // Initialize orbit controls if domElement is provided
    if (domElement && typeof THREE.OrbitControls !== 'undefined') {
        initControls(domElement);
    }

    return { camera, controls };
}

/**
 * Initialize OrbitControls for camera manipulation
 * @param {HTMLElement} domElement - The canvas element
 * @returns {THREE.OrbitControls}
 */
export function initControls(domElement) {
    if (!camera) {
        console.error('Camera must be initialized before controls');
        return null;
    }

    // Create OrbitControls
    controls = new THREE.OrbitControls(camera, domElement);

    // Configure controls
    controls.enableDamping = true; // Smooth camera movements
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10; // Minimum zoom (close to sun)
    controls.maxDistance = 50000; // Maximum zoom (see entire solar system including Neptune at 30 AU)
    controls.maxPolarAngle = Math.PI; // Allow full vertical rotation
    controls.enableZoom = true; // Enable mouse wheel zoom
    controls.zoomSpeed = 1.0; // Zoom sensitivity

    // Enhanced touch controls for mobile
    controls.touches = {
        ONE: THREE.TOUCH.ROTATE,        // One finger: rotate
        TWO: THREE.TOUCH.DOLLY_PAN      // Two fingers: pinch zoom + pan
    };
    controls.enablePan = true;           // Enable panning with two fingers
    controls.panSpeed = 1.0;             // Pan sensitivity
    controls.rotateSpeed = 0.8;          // Rotation sensitivity (slightly slower for better control)

    // Set initial target (look at origin)
    controls.target.set(0, 0, 0);
    controls.update();

    console.log('✅ OrbitControls initialized');
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
 * Reset camera to default position and target
 */
export function resetCamera() {
    if (camera && controls) {
        camera.position.set(
            RENDER.DEFAULT_CAMERA_POSITION.x,
            RENDER.DEFAULT_CAMERA_POSITION.y,
            RENDER.DEFAULT_CAMERA_POSITION.z
        );
        controls.target.set(0, 0, 0);
        controls.update();
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

    // Set controls target to object position
    controls.target.copy(objectPosition);

    // Calculate camera position (offset from object)
    const direction = new THREE.Vector3()
        .subVectors(camera.position, objectPosition)
        .normalize();

    camera.position.copy(objectPosition).add(direction.multiplyScalar(distance));

    controls.update();
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
 * Update controls (call this every frame if damping is enabled)
 */
export function updateControls() {
    if (controls && controls.enableDamping) {
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
