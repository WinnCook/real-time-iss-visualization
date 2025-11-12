/**
 * Time Management Module
 * Handles simulation time acceleration, delta time, and pause/play functionality
 */

import { SIMULATION, daysToMs } from './constants.js';

/**
 * Time manager class for simulation time control
 */
class TimeManager {
    constructor() {
        // Real-world time tracking
        this.lastRealTime = Date.now();
        this.currentRealTime = Date.now();

        // Simulation time tracking
        this.simulationTime = 0; // milliseconds since simulation start
        this.timeSpeed = SIMULATION.DEFAULT_TIME_SPEED;
        this.isPaused = false;

        // Delta time for smooth animation
        this.deltaTime = 0; // Real milliseconds between frames
        this.simulationDelta = 0; // Accelerated milliseconds for physics

        // Performance tracking
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = Date.now();
    }

    /**
     * Update time on each animation frame
     * Call this at the start of your render loop
     */
    update() {
        // Calculate real delta time
        this.currentRealTime = Date.now();
        this.deltaTime = this.currentRealTime - this.lastRealTime;
        this.lastRealTime = this.currentRealTime;

        // Calculate simulation delta time
        if (!this.isPaused) {
            this.simulationDelta = this.deltaTime * this.timeSpeed;
            this.simulationTime += this.simulationDelta;
        } else {
            this.simulationDelta = 0;
        }

        // Update FPS counter
        this.frameCount++;
        const fpsDelta = this.currentRealTime - this.lastFpsUpdate;
        if (fpsDelta >= 1000) { // Update FPS every second
            this.fps = Math.round((this.frameCount / fpsDelta) * 1000);
            this.frameCount = 0;
            this.lastFpsUpdate = this.currentRealTime;
        }
    }

    /**
     * Get current simulation time in milliseconds
     * @returns {number} Simulation time since start
     */
    getSimulationTime() {
        return this.simulationTime;
    }

    /**
     * Get current simulation time in days
     * @returns {number} Simulation time in days
     */
    getSimulationDays() {
        return this.simulationTime / daysToMs(1);
    }

    /**
     * Get delta time for current frame (in real milliseconds)
     * @returns {number} Time since last frame
     */
    getDeltaTime() {
        return this.deltaTime;
    }

    /**
     * Get simulation delta time (accelerated time for physics)
     * @returns {number} Accelerated time since last frame
     */
    getSimulationDelta() {
        return this.simulationDelta;
    }

    /**
     * Get current time speed multiplier
     * @returns {number} Current speed (1x to 50,000x)
     */
    getTimeSpeed() {
        return this.timeSpeed;
    }

    /**
     * Set time speed multiplier
     * @param {number} speed - New speed (will be clamped to valid range)
     */
    setTimeSpeed(speed) {
        this.timeSpeed = Math.max(
            SIMULATION.MIN_TIME_SPEED,
            Math.min(SIMULATION.MAX_TIME_SPEED, speed)
        );
    }

    /**
     * Get current FPS
     * @returns {number} Frames per second
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Check if simulation is paused
     * @returns {boolean} True if paused
     */
    isPausedState() {
        return this.isPaused;
    }

    /**
     * Pause the simulation
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Resume the simulation
     */
    play() {
        this.isPaused = false;
        // Reset last time to prevent time jump
        this.lastRealTime = Date.now();
    }

    /**
     * Toggle pause/play state
     */
    togglePause() {
        if (this.isPaused) {
            this.play();
        } else {
            this.pause();
        }
    }

    /**
     * Reset simulation time to zero
     */
    reset() {
        this.simulationTime = 0;
        this.lastRealTime = Date.now();
        this.currentRealTime = Date.now();
        this.deltaTime = 0;
        this.simulationDelta = 0;
    }

    /**
     * Set simulation time to a specific value
     * @param {number} timeMs - Time in milliseconds
     */
    setSimulationTime(timeMs) {
        this.simulationTime = timeMs;
    }

    /**
     * Reset simulation time to current real-world time
     * This is used for "Real-Time View" to show actual planet positions right now
     */
    resetToCurrentTime() {
        // J2000 epoch: January 1, 2000, 12:00 UTC
        const J2000_EPOCH = new Date('2000-01-01T12:00:00Z');

        // Set simulation time to milliseconds since J2000 epoch
        this.simulationTime = Date.now() - J2000_EPOCH.getTime();

        console.log('⏰ Simulation time reset to current real-world time');
        console.log(`   Simulation time: ${this.formatSimulationTime()} since J2000 epoch`);
    }

    /**
     * Format current simulation time as human-readable string
     * @returns {string} Formatted time string (e.g., "123.4 days")
     */
    formatSimulationTime() {
        const days = this.getSimulationDays();

        if (days < 1) {
            const hours = days * 24;
            if (hours < 1) {
                const minutes = hours * 60;
                return `${minutes.toFixed(1)} minutes`;
            }
            return `${hours.toFixed(1)} hours`;
        } else if (days < 365) {
            return `${days.toFixed(1)} days`;
        } else {
            const years = days / 365.25;
            return `${years.toFixed(2)} years`;
        }
    }

    /**
     * Format time speed as human-readable string
     * @returns {string} Formatted speed (e.g., "500x")
     */
    formatTimeSpeed() {
        if (this.timeSpeed >= 1000) {
            return `${(this.timeSpeed / 1000).toFixed(1)}kx`;
        }
        return `${this.timeSpeed}x`;
    }
}

// Create singleton instance
const timeManager = new TimeManager();

// Export singleton and class
export { timeManager, TimeManager };
export default timeManager;
