/**
 * UI Modals Module - Help Modal, Buttons, and Special Features
 * Manages modal dialogs, screenshot, share, and real-time view features
 * Extracted from monolithic ui.js for better maintainability
 */

import { timeManager } from '../utils/time.js';
import { showTutorial } from './tutorial.js';
import { captureScreenshot } from '../utils/screenshot.js';
import { copyShareableURL } from '../utils/urlState.js';
import { playClickSound, playScreenshotSound } from '../utils/sounds.js';
import { showNotification } from './ui-panels.js';

/**
 * Initialize modals module
 */
export function initModals() {
    setupHelpModal();
    setupScreenshotButton();
    setupShareButton();
    setupRealTimeViewButton();

    console.log('✅ UI Modals initialized');
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

    // Restart Tutorial button
    const restartTutorialBtn = document.getElementById('restart-tutorial-btn');
    if (restartTutorialBtn && helpModal) {
        restartTutorialBtn.addEventListener('click', () => {
            helpModal.classList.add('hidden');
            showTutorial();
            console.log('🎓 Tutorial restarted from help menu');
        });
    }
}

/**
 * Setup screenshot button
 */
function setupScreenshotButton() {
    const screenshotButton = document.getElementById('screenshot-button');
    if (screenshotButton) {
        screenshotButton.addEventListener('click', () => {
            playScreenshotSound();
            captureScreenshot();
        });
    }
}

/**
 * Setup share button
 */
function setupShareButton() {
    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.addEventListener('click', () => {
            playClickSound();
            // Get app state using controlled API (more secure)
            if (window.getShareState) {
                const shareState = window.getShareState();
                copyShareableURL(shareState);
            } else {
                console.warn('Share state API not available');
            }
        });
    }
}

/**
 * Setup Real-Time View button
 */
function setupRealTimeViewButton() {
    const realtimeBtn = document.getElementById('realtime-view-btn');
    if (realtimeBtn) {
        realtimeBtn.addEventListener('click', () => {
            playClickSound();

            // Set time speed to 1x (real-time)
            timeManager.setTimeSpeed(1);
            const slider = document.getElementById('time-speed');
            const speedValue = document.getElementById('speed-value');
            if (slider) slider.value = 1;
            if (speedValue) speedValue.textContent = '1x';

            // Reset simulation time to current real time
            timeManager.resetToCurrentTime();

            console.log('🌎 Real-Time View activated: Accurate orbits + 1x speed + current positions');

            // Update button state
            updateRealTimeViewButtonState();

            // Show notification
            showNotification('🌎 Real-Time View Activated',
                'Showing actual planet positions right now at 1x speed. Planets will appear stationary.');
        });

        // Set initial button state
        updateRealTimeViewButtonState();
    }
}

/**
 * Update Real-Time View button state based on current time speed
 * Button is highlighted and non-clickable when at 1x speed
 */
export function updateRealTimeViewButtonState() {
    const realtimeBtn = document.getElementById('realtime-view-btn');
    if (!realtimeBtn) {
        console.warn('Real-Time View button not found');
        return;
    }

    const currentSpeed = timeManager.getTimeSpeed();
    const isRealTime = currentSpeed === 1;

    console.log(`🔄 Updating Real-Time View button state: speed=${currentSpeed}, isRealTime=${isRealTime}`);

    if (isRealTime) {
        // At 1x speed - highlight button and make it non-clickable
        realtimeBtn.classList.add('active');
        realtimeBtn.style.pointerEvents = 'none';
        realtimeBtn.style.opacity = '1';
        realtimeBtn.style.background = '#4a90e2';
        realtimeBtn.style.color = '#ffffff';
        realtimeBtn.style.border = '2px solid #4a90e2';
    } else {
        // Not at 1x speed - make button black and clickable
        realtimeBtn.classList.remove('active');
        realtimeBtn.style.pointerEvents = 'auto';
        realtimeBtn.style.opacity = '1';
        realtimeBtn.style.background = '#1a1a1a';
        realtimeBtn.style.color = '#ffffff';
        realtimeBtn.style.border = '2px solid #333';
    }
}

/**
 * Dispose modals module (cleanup)
 */
export function disposeModals() {
    console.log('✅ UI Modals disposed');
}
