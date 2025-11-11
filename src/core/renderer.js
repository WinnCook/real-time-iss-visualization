/**
 * Renderer Module - WebGL Renderer Configuration
 * Sets up the Three.js WebGL renderer with optimal settings
 */

import { RENDER } from '../utils/constants.js';

/**
 * The main WebGL renderer
 * @type {THREE.WebGLRenderer}
 */
export let renderer;

/**
 * The canvas element
 * @type {HTMLCanvasElement}
 */
export let canvas;

/**
 * Initialize the WebGL renderer
 * @param {HTMLElement} container - Container element for the canvas
 * @returns {THREE.WebGLRenderer}
 */
export function initRenderer(container) {
    // Create WebGL renderer
    renderer = new THREE.WebGLRenderer({
        antialias: RENDER.ANTI_ALIASING,
        alpha: false, // No transparency needed for space background
        powerPreference: 'high-performance' // Prefer dedicated GPU
    });

    // Set size to fill window
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Set pixel ratio for high-DPI displays (capped for performance)
    renderer.setPixelRatio(RENDER.PIXEL_RATIO);

    // Enable shadows if configured
    if (RENDER.ENABLE_SHADOWS) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
    }

    // Set output color space for better colors (r152+ uses outputColorSpace instead of outputEncoding)
    if (renderer.outputColorSpace !== undefined) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else {
        // Fallback for older Three.js versions
        renderer.outputEncoding = THREE.sRGBEncoding;
    }

    // Set tone mapping for HDR-like rendering
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Get the canvas element
    canvas = renderer.domElement;

    // Add canvas to container
    if (container) {
        container.appendChild(canvas);
    } else {
        // Default to canvas-container if no container specified
        const defaultContainer = document.getElementById('canvas-container');
        if (defaultContainer) {
            defaultContainer.appendChild(canvas);
        } else {
            document.body.appendChild(canvas);
        }
    }

    console.log('✅ WebGL Renderer initialized');
    console.log(`   - Size: ${window.innerWidth}x${window.innerHeight}`);
    console.log(`   - Pixel Ratio: ${RENDER.PIXEL_RATIO}`);
    console.log(`   - Anti-aliasing: ${RENDER.ANTI_ALIASING}`);
    console.log(`   - Shadows: ${RENDER.ENABLE_SHADOWS}`);

    return renderer;
}

/**
 * Handle window resize - update renderer size
 */
export function onWindowResize() {
    if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        console.log(`📐 Renderer resized to: ${window.innerWidth}x${window.innerHeight}`);
    }
}

/**
 * Render a frame
 * @param {THREE.Scene} scene - The scene to render
 * @param {THREE.Camera} camera - The camera to render from
 */
export function render(scene, camera) {
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

/**
 * Get renderer info (useful for performance monitoring)
 * @returns {Object} Renderer information
 */
export function getRendererInfo() {
    if (!renderer) return null;

    return {
        memory: renderer.info.memory,
        render: renderer.info.render,
        programs: renderer.info.programs
    };
}

/**
 * Update renderer settings
 * @param {Object} settings - Settings to update
 */
export function updateRendererSettings(settings) {
    if (!renderer) return;

    if (settings.pixelRatio !== undefined) {
        renderer.setPixelRatio(settings.pixelRatio);
    }

    if (settings.toneMappingExposure !== undefined) {
        renderer.toneMappingExposure = settings.toneMappingExposure;
    }

    if (settings.toneMapping !== undefined) {
        renderer.toneMapping = settings.toneMapping;
    }

    if (settings.shadowMapEnabled !== undefined) {
        renderer.shadowMap.enabled = settings.shadowMapEnabled;
    }
}

/**
 * Set renderer clear color (background color)
 * @param {number} color - Hex color value
 * @param {number} alpha - Alpha value (0-1)
 */
export function setClearColor(color, alpha = 1) {
    if (renderer) {
        renderer.setClearColor(color, alpha);
    }
}

/**
 * Enable/disable auto-clear
 * @param {boolean} autoClear
 */
export function setAutoClear(autoClear) {
    if (renderer) {
        renderer.autoClear = autoClear;
    }
}

/**
 * Clear the renderer buffers
 * @param {boolean} color - Clear color buffer
 * @param {boolean} depth - Clear depth buffer
 * @param {boolean} stencil - Clear stencil buffer
 */
export function clearRenderer(color = true, depth = true, stencil = true) {
    if (renderer) {
        renderer.clear(color, depth, stencil);
    }
}

/**
 * Dispose of renderer resources
 */
export function disposeRenderer() {
    if (renderer) {
        renderer.dispose();
        console.log('🗑️ Renderer disposed');
    }
}

/**
 * Get the canvas element
 * @returns {HTMLCanvasElement}
 */
export function getCanvas() {
    return canvas;
}

/**
 * Get renderer size
 * @returns {Object} Object with width and height
 */
export function getRendererSize() {
    if (renderer) {
        const size = new THREE.Vector2();
        renderer.getSize(size);
        return { width: size.x, height: size.y };
    }
    return { width: 0, height: 0 };
}

/**
 * Take a screenshot of the current frame
 * @param {string} filename - Filename for the screenshot (default: 'screenshot.png')
 */
export function takeScreenshot(filename = 'screenshot.png') {
    if (renderer && canvas) {
        // Get image data from canvas
        const dataURL = canvas.toDataURL('image/png');

        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        link.click();

        console.log(`📸 Screenshot saved as ${filename}`);
    }
}

// Export renderer as default
export default {
    renderer,
    canvas,
    initRenderer,
    onWindowResize,
    render,
    getRendererInfo,
    updateRendererSettings,
    setClearColor,
    setAutoClear,
    clearRenderer,
    disposeRenderer,
    getCanvas,
    getRendererSize,
    takeScreenshot
};
