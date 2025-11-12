/**
 * URL State Module - Encode/decode view state in URL for sharing
 * Allows users to share their current view with others
 */

/**
 * Current view state
 */
let currentState = {
    camera: null,
    focus: null,
    timeSpeed: 100000,
    style: 'realistic',
    orbits: true,
    labels: true,
    trails: true,
    stars: true
};

/**
 * Initialize URL state system
 * @param {Object} config - Configuration object
 */
export function initURLState(config = {}) {
    console.log('🔗 URL state system initialized');
}

/**
 * Update current state
 * @param {Object} updates - State updates
 */
export function updateState(updates) {
    currentState = { ...currentState, ...updates };
}

/**
 * Encode current view state to URL parameters
 * @param {Object} state - View state to encode
 * @returns {string} URL with encoded parameters
 */
export function encodeStateToURL(state = currentState) {
    const params = new URLSearchParams();

    // Camera position (rounded to 2 decimals)
    if (state.camera) {
        params.set('cx', state.camera.x.toFixed(2));
        params.set('cy', state.camera.y.toFixed(2));
        params.set('cz', state.camera.z.toFixed(2));
    }

    // Camera target (if focusing on object)
    if (state.target) {
        params.set('tx', state.target.x.toFixed(2));
        params.set('ty', state.target.y.toFixed(2));
        params.set('tz', state.target.z.toFixed(2));
    }

    // Focused object (if any)
    if (state.focus) {
        params.set('focus', state.focus);
    }

    // Time speed
    if (state.timeSpeed) {
        params.set('speed', state.timeSpeed);
    }

    // Visual style
    if (state.style) {
        params.set('style', state.style);
    }

    // Toggle states (only include if false to keep URL shorter)
    if (state.orbits === false) params.set('orbits', '0');
    if (state.labels === false) params.set('labels', '0');
    if (state.trails === false) params.set('trails', '0');
    if (state.stars === false) params.set('stars', '0');

    // Build full URL
    const baseURL = window.location.origin + window.location.pathname;
    const queryString = params.toString();
    return queryString ? `${baseURL}?${queryString}` : baseURL;
}

/**
 * Decode URL parameters to view state
 * @returns {Object|null} Decoded state or null if no parameters
 */
export function decodeStateFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Check if there are any view state parameters
    if (!params.toString()) {
        return null;
    }

    const state = {};

    // Camera position
    if (params.has('cx') && params.has('cy') && params.has('cz')) {
        state.camera = {
            x: parseFloat(params.get('cx')),
            y: parseFloat(params.get('cy')),
            z: parseFloat(params.get('cz'))
        };
    }

    // Camera target
    if (params.has('tx') && params.has('ty') && params.has('tz')) {
        state.target = {
            x: parseFloat(params.get('tx')),
            y: parseFloat(params.get('ty')),
            z: parseFloat(params.get('tz'))
        };
    }

    // Focused object
    if (params.has('focus')) {
        state.focus = params.get('focus');
    }

    // Time speed
    if (params.has('speed')) {
        state.timeSpeed = parseInt(params.get('speed'));
    }

    // Visual style
    if (params.has('style')) {
        state.style = params.get('style');
    }

    // Toggle states (default true if not specified)
    state.orbits = params.get('orbits') !== '0';
    state.labels = params.get('labels') !== '0';
    state.trails = params.get('trails') !== '0';
    state.stars = params.get('stars') !== '0';

    console.log('🔗 Decoded state from URL:', state);
    return state;
}

/**
 * Apply decoded state to the application
 * @param {Object} state - State to apply
 * @param {Object} app - Application references
 */
export function applyStateFromURL(state, app) {
    if (!state) return;

    console.log('🔗 Applying state from URL...');

    // Apply camera position
    if (state.camera && app.camera) {
        app.camera.position.set(state.camera.x, state.camera.y, state.camera.z);
        if (app.controls) {
            app.controls.update();
        }
        console.log('  ✓ Camera position restored');
    }

    // Apply camera target
    if (state.target && app.controls) {
        app.controls.target.set(state.target.x, state.target.y, state.target.z);
        app.controls.update();
        console.log('  ✓ Camera target restored');
    }

    // Apply time speed
    if (state.timeSpeed && app.timeManager) {
        app.timeManager.setTimeSpeed(state.timeSpeed);

        // Update UI
        const slider = document.getElementById('time-speed');
        const speedValue = document.getElementById('speed-value');
        if (slider) slider.value = state.timeSpeed;
        if (speedValue) speedValue.textContent = `${state.timeSpeed}x`;

        console.log(`  ✓ Time speed set to ${state.timeSpeed}x`);
    }

    // Apply visual style
    if (state.style) {
        const styleButton = document.querySelector(`[data-style="${state.style}"]`);
        if (styleButton) {
            styleButton.click();
            console.log(`  ✓ Visual style set to ${state.style}`);
        }
    }

    // Apply toggle states
    const toggleOrbits = document.getElementById('toggle-orbits');
    const toggleLabels = document.getElementById('toggle-labels');
    const toggleTrails = document.getElementById('toggle-trails');
    const toggleStars = document.getElementById('toggle-stars');

    if (toggleOrbits && state.orbits !== undefined) {
        toggleOrbits.checked = state.orbits;
        toggleOrbits.dispatchEvent(new Event('change'));
    }
    if (toggleLabels && state.labels !== undefined) {
        toggleLabels.checked = state.labels;
        toggleLabels.dispatchEvent(new Event('change'));
    }
    if (toggleTrails && state.trails !== undefined) {
        toggleTrails.checked = state.trails;
        toggleTrails.dispatchEvent(new Event('change'));
    }
    if (toggleStars && state.stars !== undefined) {
        toggleStars.checked = state.stars;
        toggleStars.dispatchEvent(new Event('change'));
    }

    console.log('✅ State restored from URL');
}

/**
 * Get shareable URL for current view
 * @param {Object} app - Application references
 * @returns {string} Shareable URL
 */
export function getShareableURL(app) {
    const state = {};

    // Capture current camera position
    if (app.camera) {
        state.camera = {
            x: app.camera.position.x,
            y: app.camera.position.y,
            z: app.camera.position.z
        };
    }

    // Capture current camera target
    if (app.controls) {
        state.target = {
            x: app.controls.target.x,
            y: app.controls.target.y,
            z: app.controls.target.z
        };
    }

    // Capture time speed
    if (app.timeManager) {
        state.timeSpeed = app.timeManager.getTimeSpeed();
    }

    // Capture visual style
    const activeStyleBtn = document.querySelector('.style-btn.active');
    if (activeStyleBtn) {
        state.style = activeStyleBtn.dataset.style;
    }

    // Capture toggle states
    const toggleOrbits = document.getElementById('toggle-orbits');
    const toggleLabels = document.getElementById('toggle-labels');
    const toggleTrails = document.getElementById('toggle-trails');
    const toggleStars = document.getElementById('toggle-stars');

    state.orbits = toggleOrbits ? toggleOrbits.checked : true;
    state.labels = toggleLabels ? toggleLabels.checked : true;
    state.trails = toggleTrails ? toggleTrails.checked : true;
    state.stars = toggleStars ? toggleStars.checked : true;

    return encodeStateToURL(state);
}

/**
 * Copy shareable URL to clipboard
 * @param {Object} app - Application references
 * @returns {Promise<boolean>} True if successful
 */
export async function copyShareableURL(app) {
    try {
        const url = getShareableURL(app);
        await navigator.clipboard.writeText(url);

        showShareNotification('🔗 Shareable link copied to clipboard!');
        console.log('🔗 Shareable URL copied:', url);
        return true;

    } catch (error) {
        console.error('❌ Failed to copy URL:', error);
        showShareNotification('❌ Failed to copy link', true);
        return false;
    }
}

/**
 * Show share notification
 * @param {string} message - Notification message
 * @param {boolean} isError - Whether this is an error message
 */
function showShareNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `share-notification ${isError ? 'error' : ''}`;
    notification.textContent = message;
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
    }, 2500);
}

// Export default object
export default {
    initURLState,
    updateState,
    encodeStateToURL,
    decodeStateFromURL,
    applyStateFromURL,
    getShareableURL,
    copyShareableURL
};
