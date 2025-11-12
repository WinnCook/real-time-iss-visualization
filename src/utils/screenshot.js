/**
 * Screenshot Module - Capture and download visualization screenshots
 * Allows users to save current view as PNG image
 */

/**
 * Renderer reference
 */
let renderer = null;

/**
 * Initialize screenshot system
 * @param {THREE.WebGLRenderer} rendererInstance - Three.js renderer
 */
export function initScreenshot(rendererInstance) {
    renderer = rendererInstance;
    console.log('✅ Screenshot system initialized');
}

/**
 * Capture screenshot and download as PNG
 * @param {string} filename - Optional custom filename (default: auto-generated with timestamp)
 */
export function captureScreenshot(filename = null) {
    if (!renderer) {
        console.error('❌ Screenshot failed: Renderer not initialized');
        return;
    }

    try {
        // Generate filename with timestamp if not provided
        if (!filename) {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
            filename = `iss-tracker-${timestamp}.png`;
        }

        // Ensure filename ends with .png
        if (!filename.endsWith('.png')) {
            filename += '.png';
        }

        // Get canvas data as base64 PNG
        const canvas = renderer.domElement;
        const dataURL = canvas.toDataURL('image/png');

        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show flash effect
        showCaptureFlash();

        console.log(`📸 Screenshot saved: ${filename}`);
        return true;

    } catch (error) {
        console.error('❌ Screenshot capture failed:', error);
        return false;
    }
}

/**
 * Show flash effect when screenshot is captured
 */
function showCaptureFlash() {
    const flash = document.createElement('div');
    flash.className = 'screenshot-flash';
    document.body.appendChild(flash);

    // Trigger animation
    setTimeout(() => {
        flash.classList.add('active');
    }, 10);

    // Remove after animation
    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, 400);
}

/**
 * Capture screenshot with high resolution (2x or 4x)
 * @param {number} scale - Resolution multiplier (2 or 4)
 * @param {string} filename - Optional custom filename
 */
export function captureHighResScreenshot(scale = 2, filename = null) {
    if (!renderer) {
        console.error('❌ Screenshot failed: Renderer not initialized');
        return;
    }

    try {
        const canvas = renderer.domElement;
        const originalWidth = canvas.width;
        const originalHeight = canvas.height;

        // Temporarily increase canvas resolution
        renderer.setSize(originalWidth * scale, originalHeight * scale, false);

        // Render at high resolution
        renderer.render(renderer.scene, renderer.camera);

        // Capture screenshot
        const result = captureScreenshot(filename || `iss-tracker-highres-${scale}x.png`);

        // Restore original resolution
        renderer.setSize(originalWidth, originalHeight, false);

        console.log(`📸 High-res screenshot captured (${scale}x)`);
        return result;

    } catch (error) {
        console.error('❌ High-res screenshot failed:', error);
        return false;
    }
}

/**
 * Copy screenshot to clipboard (modern browsers only)
 */
export async function copyScreenshotToClipboard() {
    if (!renderer) {
        console.error('❌ Screenshot failed: Renderer not initialized');
        return false;
    }

    try {
        const canvas = renderer.domElement;

        // Convert canvas to blob
        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });

        // Copy to clipboard
        if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);

            console.log('📋 Screenshot copied to clipboard');
            showCopyNotification();
            return true;
        } else {
            console.warn('⚠️ Clipboard API not supported in this browser');
            return false;
        }

    } catch (error) {
        console.error('❌ Copy to clipboard failed:', error);
        return false;
    }
}

/**
 * Show notification when screenshot is copied
 */
function showCopyNotification() {
    const notification = document.createElement('div');
    notification.className = 'screenshot-notification';
    notification.textContent = '📋 Screenshot copied to clipboard!';
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);

    // Hide and remove
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}

// Export default object
export default {
    initScreenshot,
    captureScreenshot,
    captureHighResScreenshot,
    copyScreenshotToClipboard
};
