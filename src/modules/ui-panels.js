/**
 * UI Panels Module - Info Panels and Status Displays
 * Manages FPS counter, ISS info, selected object info, and notifications
 * Extracted from monolithic ui.js for better maintainability
 */

import { timeManager } from '../utils/time.js';
import { escapeHTML } from '../utils/htmlSanitizer.js';

/**
 * ISS data cache for info panel
 */
let issDataCache = {
    position: { lat: 0, lon: 0 },
    altitude: 0,
    velocity: 27600, // km/h (approximate orbital speed)
    lastUpdate: null
};

/**
 * Initialize panels module
 */
export function initPanels() {
    console.log('✅ UI Panels initialized');
}

/**
 * Update FPS counter
 * @param {number} fps - Current FPS value
 */
export function updateFPS(fps) {
    const fpsCounter = document.getElementById('fps-counter');
    if (fpsCounter) {
        fpsCounter.textContent = `FPS: ${Math.round(fps)}`;
    }
}

/**
 * Update the simulation date display
 */
export function updateSimulationDate() {
    const dateDisplay = document.getElementById('simulation-date');
    if (dateDisplay) {
        dateDisplay.textContent = timeManager.formatSimulationDate();
    }
}

/**
 * Update ISS info panel with real-time data
 * @param {Object} issData - ISS data from API
 * @param {Object} issData.position - Geographic position {lat, lon}
 * @param {number} issData.altitude - Altitude in km
 * @param {number} issData.timestamp - Unix timestamp (optional)
 */
export function updateISSInfo(issData) {
    if (!issData) return;

    // Update cache - use current time in milliseconds for lastUpdate
    issDataCache = {
        position: issData.position || issDataCache.position,
        altitude: issData.altitude || issDataCache.altitude,
        velocity: issDataCache.velocity, // Keep constant (orbital speed)
        lastUpdate: Date.now() // Always use current time when data arrives
    };

    // Update UI elements
    const positionEl = document.getElementById('iss-position');
    const altitudeEl = document.getElementById('iss-altitude');
    const velocityEl = document.getElementById('iss-velocity');
    const updateTimeEl = document.getElementById('iss-update-time');

    if (positionEl) {
        const lat = issDataCache.position.lat.toFixed(2);
        const lon = issDataCache.position.lon.toFixed(2);
        const latDir = issDataCache.position.lat >= 0 ? 'N' : 'S';
        const lonDir = issDataCache.position.lon >= 0 ? 'E' : 'W';
        positionEl.textContent = `${Math.abs(lat)}°${latDir}, ${Math.abs(lon)}°${lonDir}`;
    }

    if (altitudeEl) {
        altitudeEl.textContent = `${Math.round(issDataCache.altitude)} km`;
    }

    if (velocityEl) {
        velocityEl.textContent = `${issDataCache.velocity.toLocaleString()} km/h`;
    }

    // Update the "time ago" display
    updateISSTimeDisplay();
}

/**
 * Update the ISS "last update" time display (call periodically)
 */
export function updateISSTimeDisplay() {
    const updateTimeEl = document.getElementById('iss-update-time');

    if (updateTimeEl && issDataCache.lastUpdate) {
        const now = Date.now();
        const secondsAgo = Math.floor((now - issDataCache.lastUpdate) / 1000);

        if (secondsAgo < 0) {
            // Shouldn't happen, but just in case
            updateTimeEl.textContent = 'just now';
        } else if (secondsAgo < 60) {
            updateTimeEl.textContent = `${secondsAgo}s ago`;
        } else if (secondsAgo < 3600) {
            const minutesAgo = Math.floor(secondsAgo / 60);
            updateTimeEl.textContent = `${minutesAgo}m ago`;
        } else {
            const hoursAgo = Math.floor(secondsAgo / 3600);
            updateTimeEl.textContent = `${hoursAgo}h ago`;
        }
    }
}

/**
 * Update ISS info panel with status message
 * @param {string} message - Status message
 */
export function setISSInfoStatus(message) {
    const positionEl = document.getElementById('iss-position');
    if (positionEl) {
        positionEl.textContent = message;
    }
}

/**
 * Update selected object info panel
 * @param {string} key - Object key
 * @param {THREE.Object3D} object - Object mesh
 * @param {THREE.Object3D} earthObject - Earth object for distance calculation
 */
export function updateSelectedObjectInfo(key, object, earthObject = null) {
    const selectedInfo = document.getElementById('selected-info');
    if (!selectedInfo) return;

    const name = object.name || key;

    // Use REAL astronomical distances, not visual scene distances
    // Visual scene mixes scales (planets are 1500x larger for visibility)

    // Real distances in miles (from astronomical data)
    const realDistances = {
        sun: { fromSun: 0, fromEarth: 92955807 }, // Sun is 1 AU from Earth
        mercury: { fromSun: 35983095, fromEarth: null }, // 0.387 AU from Sun
        venus: { fromSun: 67237910, fromEarth: null }, // 0.723 AU from Sun
        earth: { fromSun: 92955807, fromEarth: 0 }, // 1 AU from Sun (by definition)
        mars: { fromSun: 141637725, fromEarth: null }, // 1.524 AU from Sun
        moon: { fromSun: 92955807, fromEarth: 238855 }, // ~239,000 miles from Earth
        iss: { fromSun: 92955807, fromEarth: 254 } // ~254 miles from Earth (408 km)
    };

    const distances = realDistances[key] || { fromSun: 0, fromEarth: 0 };

    // Calculate dynamic Earth distance for planets (changes as they orbit)
    let earthDistanceHTML = '';
    if (key !== 'earth' && key !== 'iss' && key !== 'moon' && earthObject) {
        // For planets, calculate actual distance based on their orbital positions
        // 1 scene unit in orbital space = 1 AU / (SCALE.AU_TO_SCENE / 500) = 1 AU / 1 = 1 AU
        // Wait, SCALE.AU_TO_SCENE = 500, so 500 scene units = 1 AU
        // Therefore: 1 scene unit = 1/500 AU = 185,911.6 miles
        const SCENE_UNITS_TO_MILES = 185911.6;

        // For planets, use scene distances (they're on the same AU scale)
        const visualDistance = object.position.distanceTo(earthObject.position);
        const distanceFromEarthMiles = visualDistance * SCENE_UNITS_TO_MILES;

        earthDistanceHTML = `
            <div class="info-row">
                <span class="info-label">From Earth:</span>
                <span>${formatDistance(distanceFromEarthMiles)}</span>
            </div>
        `;
    } else if (key !== 'earth' && distances.fromEarth !== null) {
        // For ISS and Moon, use fixed real distances
        earthDistanceHTML = `
            <div class="info-row">
                <span class="info-label">From Earth:</span>
                <span>${formatDistance(distances.fromEarth)}</span>
            </div>
        `;
    }

    // SECURITY FIX: Escape name to prevent XSS attacks
    const safeName = escapeHTML(name);
    selectedInfo.innerHTML = `
        <p><strong>${safeName}</strong> <span style="color: #4a90e2;">🔒 Locked</span></p>
        <div class="info-row">
            <span class="info-label">From Sun:</span>
            <span>${formatDistance(distances.fromSun)}</span>
        </div>
        ${earthDistanceHTML}
        <p style="font-size: 11px; color: #888; margin-top: 8px;">
            Camera follows this object. Use mouse to rotate view.<br>
            ESC or right-click to unlock.
        </p>
    `;
}

/**
 * Clear selected object info panel
 */
export function clearSelectedObjectInfo() {
    const selectedInfo = document.getElementById('selected-info');
    if (selectedInfo) {
        selectedInfo.innerHTML = '<p>Click any planet or the ISS to see details</p>';
    }
}

/**
 * Format distance in miles with appropriate units
 * @param {number} miles - Distance in miles
 * @returns {string} Formatted distance string
 */
function formatDistance(miles) {
    if (miles < 1000) {
        return `${miles.toFixed(1)} mi`;
    } else if (miles < 1000000) {
        return `${(miles / 1000).toFixed(1)}K mi`;
    } else {
        return `${(miles / 1000000).toFixed(2)}M mi`;
    }
}

/**
 * Show a notification to the user
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
export function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'realtime-notification';
    // SECURITY FIX: Escape HTML to prevent XSS attacks
    const safeTitle = escapeHTML(title);
    const safeMessage = escapeHTML(message);
    notification.innerHTML = `
        <strong>${safeTitle}</strong>
        <p>${safeMessage}</p>
    `;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);

    // Hide and remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Dispose panels module (cleanup)
 */
export function disposePanels() {
    // Reset ISS data cache
    issDataCache = {
        position: { lat: 0, lon: 0 },
        altitude: 0,
        velocity: 27600,
        lastUpdate: null
    };

    console.log('✅ UI Panels disposed');
}
