/**
 * API Integration Module
 * Handles ISS position API requests with error handling and retry logic
 */

import { API, ISS_ORBIT_ALTITUDE } from './constants.js';

/**
 * ISS API Manager class
 * Handles fetching, caching, and error recovery for ISS position data
 */
class ISSAPIManager {
    constructor() {
        this.lastPosition = null; // Cache last known position
        this.lastUpdateTime = 0; // Timestamp of last successful update
        this.isUpdating = false; // Prevent concurrent requests
        this.errorCount = 0; // Track consecutive errors
        this.maxErrorCount = 5; // Max errors before falling back to mock data
        this.updateCallbacks = []; // Callbacks to notify on position update
    }

    /**
     * Fetch current ISS position from API
     * @returns {Promise<Object>} ISS position data {latitude, longitude, altitude, timestamp}
     */
    async fetchISSPosition() {
        // Prevent concurrent requests
        if (this.isUpdating) {
            return this.lastPosition;
        }

        this.isUpdating = true;

        try {
            console.log(`🌐 fetchISSPosition: Starting fetch to ${API.ISS_URL}`);
            console.log(`⏱️ Timeout set to ${API.TIMEOUT}ms`);

            // BUG FIX: Use Promise.race to guarantee timeout works
            // AbortController doesn't always work reliably in all environments
            const fetchPromise = (async () => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.log('⏰ Fetch timeout! Aborting...');
                    controller.abort();
                }, API.TIMEOUT);

                try {
                    console.log('📡 Calling fetch()...');
                    const response = await fetch(API.ISS_URL, {
                        signal: controller.signal,
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    clearTimeout(timeoutId);
                    return response;
                } catch (error) {
                    clearTimeout(timeoutId);
                    throw error;
                }
            })();

            // Timeout promise that rejects after API.TIMEOUT
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Fetch timeout (Promise.race)'));
                }, API.TIMEOUT);
            });

            // Race between fetch and timeout
            console.log('🏁 Racing fetch vs timeout...');
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            console.log('✅ Fetch won the race!');

            // Check if response is OK
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse JSON response
            const data = await response.json();

            // Validate response structure
            if (!data.iss_position || !data.timestamp) {
                throw new Error('Invalid API response structure');
            }

            // Extract and format position data
            const position = {
                latitude: parseFloat(data.iss_position.latitude),
                longitude: parseFloat(data.iss_position.longitude),
                altitude: ISS_ORBIT_ALTITUDE, // API doesn't provide altitude, use constant
                timestamp: data.timestamp * 1000, // Convert to milliseconds
                message: data.message || 'success'
            };

            // Validate coordinates
            if (isNaN(position.latitude) || isNaN(position.longitude)) {
                throw new Error('Invalid coordinate data');
            }

            // Update cache
            this.lastPosition = position;
            this.lastUpdateTime = Date.now();
            this.errorCount = 0; // Reset error count on success

            // Notify callbacks
            this.notifyCallbacks(position);

            return position;

        } catch (error) {
            this.errorCount++;
            console.error(`ISS API Error (${this.errorCount}/${this.maxErrorCount}):`, error.message);

            // If we have a cached position, return it
            if (this.lastPosition) {
                console.warn('Using cached ISS position');
                // BUG FIX: Notify callbacks with cached position
                this.notifyCallbacks(this.lastPosition);
                return this.lastPosition;
            }

            // If too many errors, use mock data
            if (this.errorCount >= this.maxErrorCount) {
                console.warn('Too many API errors, using mock ISS data');
                const mockPosition = this.getMockPosition();

                // BUG FIX: Notify callbacks with mock position so ISS actually moves
                this.notifyCallbacks(mockPosition);

                return mockPosition;
            }

            throw error;

        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * Get mock ISS position for offline/fallback mode
     * Simulates ISS orbit using simple circular motion
     * @returns {Object} Mock ISS position
     */
    getMockPosition() {
        const now = Date.now();
        const orbitPeriodMs = 92.68 * 60 * 1000; // ~93 minutes
        const angle = (now / orbitPeriodMs) * Math.PI * 2;

        // Simulate circular orbit at 51.6° inclination
        const inclination = 51.6;
        const latitude = Math.sin(angle) * inclination;
        const longitude = ((now / orbitPeriodMs) * 360) % 360 - 180;

        return {
            latitude: latitude,
            longitude: longitude,
            altitude: ISS_ORBIT_ALTITUDE,
            timestamp: now,
            message: 'mock data (API unavailable)',
            isMock: true
        };
    }

    /**
     * Get the last known ISS position (from cache)
     * @returns {Object|null} Last position or null if never fetched
     */
    getLastPosition() {
        return this.lastPosition;
    }

    /**
     * Get time since last successful update
     * @returns {number} Milliseconds since last update
     */
    getTimeSinceLastUpdate() {
        return Date.now() - this.lastUpdateTime;
    }

    /**
     * Check if cached position is stale
     * @param {number} maxAge - Maximum age in milliseconds (default: API.UPDATE_INTERVAL * 3)
     * @returns {boolean} True if position is stale
     */
    isPositionStale(maxAge = API.UPDATE_INTERVAL * 3) {
        if (!this.lastPosition) return true;
        return this.getTimeSinceLastUpdate() > maxAge;
    }

    /**
     * Register a callback to be notified when position updates
     * @param {Function} callback - Function to call with new position data
     */
    onUpdate(callback) {
        if (typeof callback === 'function') {
            this.updateCallbacks.push(callback);
        }
    }

    /**
     * Unregister an update callback
     * @param {Function} callback - Callback to remove
     */
    offUpdate(callback) {
        const index = this.updateCallbacks.indexOf(callback);
        if (index > -1) {
            this.updateCallbacks.splice(index, 1);
        }
    }

    /**
     * Notify all registered callbacks with new position data
     * @private
     * @param {Object} position - Position data to send to callbacks
     */
    notifyCallbacks(position) {
        console.log(`📢 Notifying ${this.updateCallbacks.length} callback(s) with position:`, position);
        this.updateCallbacks.forEach(callback => {
            try {
                callback(position);
            } catch (error) {
                console.error('Error in ISS update callback:', error);
            }
        });
    }

    /**
     * Start automatic position updates at regular interval
     * @param {number} interval - Update interval in milliseconds (default: API.UPDATE_INTERVAL)
     * @returns {number} Interval ID (for clearInterval)
     */
    startAutoUpdate(interval = API.UPDATE_INTERVAL) {
        // Fetch immediately
        this.fetchISSPosition().catch(error => {
            console.error('Initial ISS fetch failed:', error);
        });

        // Then set up interval
        return setInterval(() => {
            this.fetchISSPosition().catch(error => {
                console.error('ISS update failed:', error);
            });
        }, interval);
    }

    /**
     * Stop automatic updates
     * @param {number} intervalId - Interval ID from startAutoUpdate
     */
    stopAutoUpdate(intervalId) {
        clearInterval(intervalId);
    }

    /**
     * Reset error counter (useful after network recovery)
     */
    resetErrors() {
        this.errorCount = 0;
    }

    /**
     * Get API status information
     * @returns {Object} Status object with error count, cache info, etc.
     */
    getStatus() {
        return {
            hasPosition: !!this.lastPosition,
            lastUpdateTime: this.lastUpdateTime,
            timeSinceUpdate: this.getTimeSinceLastUpdate(),
            isStale: this.isPositionStale(),
            errorCount: this.errorCount,
            isHealthy: this.errorCount < this.maxErrorCount,
            isUpdating: this.isUpdating
        };
    }
}

// Create singleton instance
const issAPI = new ISSAPIManager();

// Export singleton and class
export { issAPI, ISSAPIManager };
export default issAPI;
