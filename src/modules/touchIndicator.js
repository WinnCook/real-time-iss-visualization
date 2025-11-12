/**
 * Touch Indicator Module - Shows touch gesture instructions on mobile devices
 * Provides visual feedback for touch interactions
 */

/**
 * Touch indicator element
 */
let touchIndicator = null;
let isDismissed = false;

/**
 * Check if device supports touch
 * @returns {boolean} True if touch is supported
 */
function isTouchDevice() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
}

/**
 * Check if user has dismissed the indicator before
 * @returns {boolean} True if dismissed
 */
function wasIndicatorDismissed() {
    return localStorage.getItem('touchIndicatorDismissed') === 'true';
}

/**
 * Mark indicator as dismissed
 */
function markIndicatorDismissed() {
    localStorage.setItem('touchIndicatorDismissed', 'true');
}

/**
 * Initialize touch indicator
 */
export function initTouchIndicator() {
    // Only show on touch devices that haven't dismissed it
    if (!isTouchDevice() || wasIndicatorDismissed()) {
        console.log('✅ Touch indicator skipped (not touch device or already dismissed)');
        return;
    }

    console.log('📱 Initializing touch indicator for mobile device');

    // Create touch indicator overlay
    touchIndicator = document.createElement('div');
    touchIndicator.id = 'touch-indicator';
    touchIndicator.className = 'touch-indicator';
    touchIndicator.innerHTML = `
        <div class="touch-indicator-content">
            <h3>📱 Touch Controls</h3>
            <div class="touch-gestures">
                <div class="gesture">
                    <div class="gesture-icon">☝️</div>
                    <div class="gesture-text">
                        <strong>One Finger</strong>
                        <p>Drag to rotate view</p>
                    </div>
                </div>
                <div class="gesture">
                    <div class="gesture-icon">✌️</div>
                    <div class="gesture-text">
                        <strong>Two Fingers</strong>
                        <p>Pinch to zoom<br>Drag to pan</p>
                    </div>
                </div>
                <div class="gesture">
                    <div class="gesture-icon">👆</div>
                    <div class="gesture-text">
                        <strong>Tap Objects</strong>
                        <p>Focus camera</p>
                    </div>
                </div>
            </div>
            <button id="dismiss-touch-indicator" class="touch-indicator-btn">
                Got it!
            </button>
        </div>
    `;

    document.body.appendChild(touchIndicator);

    // Add dismiss button listener
    const dismissBtn = document.getElementById('dismiss-touch-indicator');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', dismissTouchIndicator);
    }

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        if (!isDismissed) {
            dismissTouchIndicator();
        }
    }, 8000);

    // Show indicator with fade-in
    setTimeout(() => {
        if (touchIndicator) {
            touchIndicator.classList.add('visible');
        }
    }, 100);

    console.log('✅ Touch indicator shown');
}

/**
 * Dismiss touch indicator
 */
export function dismissTouchIndicator() {
    if (!touchIndicator || isDismissed) return;

    isDismissed = true;
    markIndicatorDismissed();

    touchIndicator.classList.remove('visible');

    setTimeout(() => {
        if (touchIndicator && touchIndicator.parentNode) {
            touchIndicator.parentNode.removeChild(touchIndicator);
            touchIndicator = null;
        }
    }, 300);

    console.log('✅ Touch indicator dismissed');
}

/**
 * Reset touch indicator (for testing)
 */
export function resetTouchIndicator() {
    localStorage.removeItem('touchIndicatorDismissed');
    console.log('✅ Touch indicator reset');
}

// Export default object
export default {
    initTouchIndicator,
    dismissTouchIndicator,
    resetTouchIndicator
};
