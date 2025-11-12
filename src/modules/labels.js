/**
 * Labels Module - 2D labels for 3D celestial objects
 * Creates HTML labels that follow objects in 3D space
 */

import { PLANETS } from '../utils/constants.js';

/**
 * Labels container element
 * @type {HTMLElement|null}
 */
let labelsContainer = null;

/**
 * Map of object keys to label elements
 * @type {Object<string, HTMLElement>}
 */
const labelElements = {};

/**
 * Current visibility state
 * @type {boolean}
 */
let isVisible = true;

/**
 * Camera reference (needed for projection)
 * @type {THREE.Camera|null}
 */
let camera = null;

/**
 * Renderer reference (needed for screen dimensions)
 * @type {THREE.WebGLRenderer|null}
 */
let renderer = null;

/**
 * References to 3D objects to label
 * @type {Object}
 */
const objectReferences = {};

/**
 * Initialize labels system
 * @param {THREE.Camera} cam - Camera for projection
 * @param {THREE.WebGLRenderer} rend - Renderer for screen dimensions
 * @returns {HTMLElement} Labels container
 */
export function initLabels(cam, rend) {
    console.log('🏷️ Initializing labels system...');

    camera = cam;
    renderer = rend;

    // Create labels container
    labelsContainer = document.createElement('div');
    labelsContainer.id = 'labels-container';
    labelsContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
    `;
    document.body.appendChild(labelsContainer);

    // Create labels for all celestial objects
    createLabel('sun', 'Sun', '#ffaa00');
    createLabel('mercury', 'Mercury', '#aaaaaa');
    createLabel('venus', 'Venus', '#ffc649');
    createLabel('earth', 'Earth', '#4a90e2');
    createLabel('mars', 'Mars', '#dc4d3a');
    createLabel('moon', 'Moon', '#aaaaaa');
    createLabel('iss', 'ISS', '#ff6b6b');

    console.log('✅ Labels system initialized');
    return labelsContainer;
}

/**
 * Create a single label element
 * @param {string} key - Object identifier
 * @param {string} text - Label text
 * @param {string} color - Label color (hex)
 */
function createLabel(key, text, color) {
    const label = document.createElement('div');
    label.className = 'object-label';
    label.textContent = text;
    label.style.cssText = `
        position: absolute;
        color: ${color};
        background: rgba(0, 0, 0, 0.7);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        font-weight: bold;
        border: 1px solid ${color};
        white-space: nowrap;
        transform: translate(-50%, -50%);
        transition: opacity 0.2s;
    `;

    labelsContainer.appendChild(label);
    labelElements[key] = label;
}

/**
 * Register a 3D object to be labeled
 * @param {string} key - Object identifier (e.g., 'earth', 'sun')
 * @param {THREE.Object3D} object - Three.js object to label
 */
export function registerObject(key, object) {
    objectReferences[key] = object;
}

/**
 * Update all label positions (call every frame)
 * Projects 3D positions to 2D screen coordinates
 */
export function updateLabels() {
    if (!labelsContainer || !camera || !renderer || !isVisible) return;

    const canvas = renderer.domElement;
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    // Temporary vector for projection
    const vector = new THREE.Vector3();

    // Update each label
    Object.keys(labelElements).forEach(key => {
        const label = labelElements[key];
        const object = objectReferences[key];

        if (!object) {
            label.style.display = 'none';
            return;
        }

        // Get object's world position
        object.getWorldPosition(vector);

        // Project to normalized device coordinates (-1 to +1)
        vector.project(camera);

        // Check if object is behind the camera
        if (vector.z > 1) {
            label.style.display = 'none';
            return;
        }

        // Convert to screen coordinates
        const x = (vector.x * 0.5 + 0.5) * canvasWidth;
        const y = (-(vector.y * 0.5) + 0.5) * canvasHeight;

        // Position label
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        label.style.display = 'block';

        // Fade out if very close to camera or far away
        const distance = camera.position.distanceTo(object.position);
        let opacity = 1.0;

        if (distance < 50) {
            opacity = distance / 50; // Fade out when too close
        } else if (distance > 2000) {
            opacity = Math.max(0, 1 - (distance - 2000) / 1000); // Fade out when too far
        }

        label.style.opacity = opacity.toString();
    });
}

/**
 * Set labels visibility
 * @param {boolean} visible - Whether labels should be visible
 */
export function setLabelsVisible(visible) {
    isVisible = visible;

    if (labelsContainer) {
        labelsContainer.style.display = visible ? 'block' : 'none';
    }

    console.log(`🏷️ Labels ${visible ? 'shown' : 'hidden'}`);
}

/**
 * Get current visibility state
 * @returns {boolean}
 */
export function areLabelsVisible() {
    return isVisible;
}

/**
 * Toggle labels visibility
 */
export function toggleLabels() {
    setLabelsVisible(!isVisible);
}

/**
 * Update a specific label's text
 * @param {string} key - Object identifier
 * @param {string} text - New label text
 */
export function updateLabelText(key, text) {
    const label = labelElements[key];
    if (label) {
        label.textContent = text;
    }
}

/**
 * Set visibility for a specific label
 * @param {string} key - Object identifier
 * @param {boolean} visible - Whether label should be visible
 */
export function setLabelVisible(key, visible) {
    const label = labelElements[key];
    if (label) {
        label.style.display = visible ? 'block' : 'none';
    }
}

/**
 * Dispose labels system
 */
export function disposeLabels() {
    if (labelsContainer && labelsContainer.parentNode) {
        labelsContainer.parentNode.removeChild(labelsContainer);
    }

    Object.keys(labelElements).forEach(key => {
        delete labelElements[key];
    });

    Object.keys(objectReferences).forEach(key => {
        delete objectReferences[key];
    });

    labelsContainer = null;
    camera = null;
    renderer = null;

    console.log('✅ Labels system disposed');
}

// Export default object
export default {
    initLabels,
    registerObject,
    updateLabels,
    setLabelsVisible,
    areLabelsVisible,
    toggleLabels,
    updateLabelText,
    setLabelVisible,
    disposeLabels
};
