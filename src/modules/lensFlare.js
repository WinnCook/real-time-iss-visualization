/**
 * Lens Flare Module - Camera-aware lens flare effects for the sun
 * Creates cinematic lens flare artifacts when looking toward the sun
 */

import { SUN_RADIUS, scaleRadius } from '../utils/constants.js';
import { getCurrentStyleKey } from './styles.js';

// Lens flare configuration per visual style
const STYLE_CONFIGS = {
    realistic: {
        enabled: true,
        intensity: 1.0,
        elements: [
            { size: 700, distance: 0.0, color: [1.0, 1.0, 1.0], opacity: 0.6 }, // Main flare
            { size: 300, distance: 0.4, color: [1.0, 0.75, 0.75], opacity: 0.3 }, // Ghost 1
            { size: 200, distance: 0.6, color: [0.75, 1.0, 0.75], opacity: 0.2 }, // Ghost 2
            { size: 150, distance: 0.8, color: [0.75, 0.75, 1.0], opacity: 0.2 }, // Ghost 3
            { size: 400, distance: 1.2, color: [1.0, 1.0, 1.0], opacity: 0.1 },  // Halo
            { size: 100, distance: -0.3, color: [1.0, 0.8, 0.5], opacity: 0.4 }, // Back ghost
        ]
    },
    cartoon: {
        enabled: true,
        intensity: 0.8,
        elements: [
            { size: 600, distance: 0.0, color: [1.0, 1.0, 0.0], opacity: 0.5 }, // Main flare
            { size: 250, distance: 0.5, color: [1.0, 0.5, 0.0], opacity: 0.3 }, // Orange ghost
            { size: 200, distance: 0.8, color: [1.0, 1.0, 0.5], opacity: 0.2 }, // Yellow ghost
            { size: 350, distance: 1.1, color: [1.0, 1.0, 1.0], opacity: 0.15 }, // Halo
        ]
    },
    neon: {
        enabled: true,
        intensity: 1.2,
        elements: [
            { size: 800, distance: 0.0, color: [1.0, 0.0, 1.0], opacity: 0.7 }, // Main flare (magenta)
            { size: 400, distance: 0.3, color: [0.0, 1.0, 1.0], opacity: 0.4 }, // Cyan ghost
            { size: 300, distance: 0.6, color: [1.0, 0.0, 0.5], opacity: 0.3 }, // Pink ghost
            { size: 250, distance: 0.9, color: [0.5, 0.0, 1.0], opacity: 0.25 }, // Purple ghost
            { size: 500, distance: 1.3, color: [1.0, 1.0, 1.0], opacity: 0.2 },  // White halo
            { size: 150, distance: -0.4, color: [1.0, 1.0, 0.0], opacity: 0.5 }, // Yellow back
        ]
    },
    minimalist: {
        enabled: false, // No lens flares in minimalist style
        intensity: 0,
        elements: []
    }
};

/**
 * Lens flare state
 */
let lensFlareEnabled = true;
let flareSprites = [];
let flareContainer = null;
let camera = null;
let sunMesh = null;
let scene = null;
let renderer = null;

/**
 * Initialize the lens flare system
 * @param {THREE.Camera} cameraRef - The camera to use for calculations
 * @param {THREE.Mesh} sunMeshRef - The sun mesh to track
 * @param {THREE.Scene} sceneRef - The scene for raycasting
 * @param {THREE.WebGLRenderer} rendererRef - The renderer for screen calculations
 */
export function initLensFlare(cameraRef, sunMeshRef, sceneRef, rendererRef) {
    camera = cameraRef;
    sunMesh = sunMeshRef;
    scene = sceneRef;
    renderer = rendererRef;

    // Create container div for flare elements
    flareContainer = document.createElement('div');
    flareContainer.id = 'lens-flare-container';
    flareContainer.style.position = 'fixed';
    flareContainer.style.top = '0';
    flareContainer.style.left = '0';
    flareContainer.style.width = '100%';
    flareContainer.style.height = '100%';
    flareContainer.style.pointerEvents = 'none';
    flareContainer.style.overflow = 'hidden';
    flareContainer.style.zIndex = '5'; // Behind UI but above canvas
    document.body.appendChild(flareContainer);

    createFlareSprites();
}

/**
 * Create flare sprite elements based on current style
 */
function createFlareSprites() {
    // Clear existing sprites
    clearFlareSprites();

    const styleKey = getCurrentStyleKey();
    const config = STYLE_CONFIGS[styleKey];

    if (!config.enabled || !lensFlareEnabled) {
        return;
    }

    // Create sprite elements for each flare
    config.elements.forEach((element, index) => {
        const sprite = document.createElement('div');
        sprite.className = 'lens-flare-sprite';
        sprite.style.position = 'absolute';
        sprite.style.width = element.size + 'px';
        sprite.style.height = element.size + 'px';
        sprite.style.borderRadius = '50%';
        sprite.style.pointerEvents = 'none';
        sprite.style.mixBlendMode = 'screen';
        sprite.style.transform = 'translate(-50%, -50%)';

        // Create gradient background
        const r = Math.floor(element.color[0] * 255);
        const g = Math.floor(element.color[1] * 255);
        const b = Math.floor(element.color[2] * 255);

        sprite.style.background = `radial-gradient(circle,
            rgba(${r},${g},${b},${element.opacity}) 0%,
            rgba(${r},${g},${b},${element.opacity * 0.5}) 30%,
            rgba(${r},${g},${b},0) 70%)`;

        // Add special effects for certain elements
        if (index === 0) {
            // Main flare gets a starburst pattern
            sprite.style.boxShadow = `
                0 0 ${element.size/2}px rgba(${r},${g},${b},${element.opacity * 0.5}),
                0 0 ${element.size}px rgba(${r},${g},${b},${element.opacity * 0.3})
            `;
        }

        sprite.dataset.distance = element.distance;
        sprite.dataset.baseOpacity = element.opacity;
        sprite.style.opacity = '0';
        sprite.style.display = 'none';

        flareContainer.appendChild(sprite);
        flareSprites.push(sprite);
    });
}

/**
 * Clear all flare sprites
 */
function clearFlareSprites() {
    flareSprites.forEach(sprite => {
        if (sprite.parentNode) {
            sprite.parentNode.removeChild(sprite);
        }
    });
    flareSprites = [];
}

/**
 * Update lens flare positions and visibility
 * @param {number} deltaTime - Time since last update
 */
export function updateLensFlare(deltaTime) {
    if (!camera || !sunMesh || !lensFlareEnabled || !flareContainer) {
        return;
    }

    const styleKey = getCurrentStyleKey();
    const config = STYLE_CONFIGS[styleKey];

    if (!config.enabled) {
        hideAllFlares();
        return;
    }

    // Get sun position in screen coordinates
    const sunWorldPos = new THREE.Vector3();
    sunMesh.getWorldPosition(sunWorldPos);

    // Project to screen space
    const sunScreenPos = sunWorldPos.clone();
    sunScreenPos.project(camera);

    // Check if sun is behind camera
    if (sunScreenPos.z > 1) {
        hideAllFlares();
        return;
    }

    // Convert to screen pixels
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const sunX = (sunScreenPos.x * 0.5 + 0.5) * rect.width + rect.left;
    const sunY = (-sunScreenPos.y * 0.5 + 0.5) * rect.height + rect.top;

    // Check if sun is occluded by planets
    const occlusionFactor = checkSunOcclusion(sunWorldPos);

    // Calculate angle factor (how directly we're looking at the sun)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const sunDirection = sunWorldPos.clone().sub(camera.position).normalize();
    const angleFactor = Math.max(0, cameraDirection.dot(sunDirection));

    // Calculate overall intensity
    const intensity = config.intensity * occlusionFactor * angleFactor;

    if (intensity < 0.01) {
        hideAllFlares();
        return;
    }

    // Calculate screen center
    const centerX = rect.width / 2 + rect.left;
    const centerY = rect.height / 2 + rect.top;

    // Update each flare sprite
    flareSprites.forEach((sprite, index) => {
        const distance = parseFloat(sprite.dataset.distance);
        const baseOpacity = parseFloat(sprite.dataset.baseOpacity);

        // Position along the line from sun through screen center
        const flareX = sunX + (centerX - sunX) * distance;
        const flareY = sunY + (centerY - sunY) * distance;

        // Apply position
        sprite.style.left = flareX + 'px';
        sprite.style.top = flareY + 'px';

        // Calculate opacity with fade at screen edges
        const edgeFade = calculateEdgeFade(flareX, flareY, rect);
        const finalOpacity = baseOpacity * intensity * edgeFade;

        sprite.style.opacity = finalOpacity;
        sprite.style.display = finalOpacity > 0.01 ? 'block' : 'none';

        // Add subtle animation
        if (index === 0) {
            // Main flare gets a subtle pulse
            const pulse = 1 + Math.sin(Date.now() * 0.001) * 0.1;
            sprite.style.transform = `translate(-50%, -50%) scale(${pulse})`;
        }
    });
}

/**
 * Check if sun is occluded by planets
 * @param {THREE.Vector3} sunWorldPos - Sun position in world space
 * @returns {number} Occlusion factor (0 = fully occluded, 1 = fully visible)
 */
function checkSunOcclusion(sunWorldPos) {
    if (!scene || !camera) return 1;

    // Perform raycasting from camera to sun
    const raycaster = new THREE.Raycaster();
    const direction = sunWorldPos.clone().sub(camera.position).normalize();

    raycaster.set(camera.position, direction);
    raycaster.far = camera.position.distanceTo(sunWorldPos);

    // Get all objects between camera and sun
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Check if any planet is blocking the sun
    for (let intersect of intersects) {
        const object = intersect.object;

        // Skip the sun itself and non-planet objects
        // Planets have names like "Earth", "Mars", etc.
        if (object === sunMesh || object === sunMesh.parent) {
            continue;
        }

        // Check if it's a planet by name pattern
        const isPlanet = object.name && (
            object.name.includes('Mercury') ||
            object.name.includes('Venus') ||
            object.name.includes('Earth') ||
            object.name.includes('Mars') ||
            object.name.includes('Jupiter') ||
            object.name.includes('Saturn') ||
            object.name.includes('Uranus') ||
            object.name.includes('Neptune')
        );

        if (!isPlanet) {
            continue;
        }

        // Check if intersection is before the sun
        if (intersect.distance < raycaster.far - 1) {
            // Calculate partial occlusion based on planet size
            const planetRadius = object.geometry.parameters.radius || 1;
            const sunRadius = scaleRadius(SUN_RADIUS, 'sun');
            const occlusionAmount = Math.min(1, (planetRadius / sunRadius) * 2);
            return 1 - occlusionAmount;
        }
    }

    return 1; // No occlusion
}

/**
 * Calculate edge fade factor for sprites near screen edges
 * @param {number} x - X position in pixels
 * @param {number} y - Y position in pixels
 * @param {DOMRect} rect - Canvas bounding rect
 * @returns {number} Fade factor (0-1)
 */
function calculateEdgeFade(x, y, rect) {
    const margin = 100; // Pixels from edge to start fading

    const distFromLeft = x - rect.left;
    const distFromRight = rect.right - x;
    const distFromTop = y - rect.top;
    const distFromBottom = rect.bottom - y;

    const minDist = Math.min(distFromLeft, distFromRight, distFromTop, distFromBottom);

    if (minDist < 0) return 0;
    if (minDist > margin) return 1;

    return minDist / margin;
}

/**
 * Hide all flare sprites
 */
function hideAllFlares() {
    flareSprites.forEach(sprite => {
        sprite.style.opacity = '0';
        sprite.style.display = 'none';
    });
}

/**
 * Set lens flare enabled state
 * @param {boolean} enabled - Whether lens flares should be shown
 */
export function setLensFlareEnabled(enabled) {
    lensFlareEnabled = enabled;

    if (!enabled) {
        hideAllFlares();
    } else {
        createFlareSprites();
    }
}

/**
 * Check if lens flares are enabled
 * @returns {boolean} Whether lens flares are enabled
 */
export function isLensFlareEnabled() {
    return lensFlareEnabled;
}

/**
 * Recreate lens flares when visual style changes
 */
export function recreateLensFlare() {
    createFlareSprites();
}

/**
 * Dispose of lens flare system
 */
export function disposeLensFlare() {
    clearFlareSprites();

    if (flareContainer && flareContainer.parentNode) {
        flareContainer.parentNode.removeChild(flareContainer);
    }

    flareContainer = null;
    flareSprites = [];
    camera = null;
    sunMesh = null;
    scene = null;
    renderer = null;
}

// Note: THREE.js is loaded globally from assets/js/three.min.js
// All THREE.js classes (Vector3, Raycaster, etc.) are available via the global THREE object