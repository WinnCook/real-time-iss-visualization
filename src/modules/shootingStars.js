/**
 * Shooting Stars Module - Occasional shooting star effects across the sky
 * Adds dynamic visual interest to the background
 */

import { addToScene, removeFromScene } from '../core/scene.js';

/**
 * Array of active shooting star objects
 * @type {Array}
 */
let shootingStars = [];

/**
 * Maximum number of shooting stars at once
 */
const MAX_SHOOTING_STARS = 8; // Max concurrent meteors (increased for visibility)

/**
 * Base chance per frame to spawn a new shooting star (0-1)
 * This is multiplied by frequencyMultiplier
 */
const BASE_SPAWN_CHANCE = 0.01; // Base rate - increased 100x for much better visibility

/**
 * Frequency multiplier (0-100 from slider, 0 = off, 100 = very frequent)
 * @type {number}
 */
let frequencyMultiplier = 20; // Default to 20% (low frequency)

/**
 * Current visual style configuration
 * @type {Object}
 */
let currentStyle = null;

/**
 * Whether shooting stars are enabled
 * @type {boolean}
 */
let enabled = true;

/**
 * Initialize shooting stars module
 * @param {Object} styleConfig - Visual style configuration
 */
export function initShootingStars(styleConfig = {}) {
    currentStyle = styleConfig;

    // Shooting stars only in realistic style
    enabled = styleConfig.name === 'Realistic';

    console.log(`✅ Shooting stars initialized (${enabled ? 'enabled' : 'disabled'})`);
}

/**
 * Create a single shooting star (realistic meteor)
 * Real meteor physics: 11-72 km/s velocity, meteors enter from random directions and streak across sky
 */
function createShootingStar() {
    // Spawn VERY far away, well outside visible sphere for realistic entry
    const distance = 10000 + Math.random() * 5000; // 10-15km away

    // Random point on sphere - meteors can come from any direction in space
    const theta = Math.random() * Math.PI * 2; // Azimuth angle
    const phi = Math.acos((Math.random() * 2) - 1); // Polar angle (uniform distribution)

    const startX = distance * Math.sin(phi) * Math.cos(theta);
    const startY = distance * Math.sin(phi) * Math.sin(theta);
    const startZ = distance * Math.cos(phi);

    // Direction: Meteors move in straight lines across the sky
    // Point generally toward the center (origin) with randomness for natural variety
    const centerDirection = new THREE.Vector3(-startX, -startY, -startZ).normalize();

    // Add randomness to direction (up to 30 degree deviation from center-pointing)
    const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
    );

    const velocity = centerDirection.add(randomOffset).normalize();

    // Realistic meteor velocity: 10-70 km/s
    // In our scene units: VERY fast for visibility
    const speed = 1500 + Math.random() * 2000; // units per second (3500 max - very fast!)

    // Create dynamic trail geometry that will grow as meteor moves
    const geometry = new THREE.BufferGeometry();

    // Start with just the meteor head position
    const positions = new Float32Array([
        startX, startY, startZ
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create VERY bright glowing material
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff, // Pure white (very bright)
        opacity: 1.0, // FULL BRIGHTNESS - maximum visibility
        transparent: true,
        blending: THREE.AdditiveBlending,
        linewidth: 5 // MUCH thicker line for maximum visibility
    });

    const trail = new THREE.Line(geometry, material);

    // Add to scene
    addToScene(trail);

    // Create shooting star object with trail history
    // Extended visibility for better viewing experience
    const shootingStar = {
        mesh: trail,
        velocity: velocity.multiplyScalar(speed),
        position: new THREE.Vector3(startX, startY, startZ), // Current position
        trailPositions: [new THREE.Vector3(startX, startY, startZ)], // Array of past positions
        maxTrailLength: 50, // Maximum number of trail points (controls trail length)
        lifetime: 0,
        maxLifetime: 1000 + Math.random() * 3000, // 1-4 seconds (longer for visibility)
        opacity: 1.0 // Match material opacity (full brightness)
    };

    shootingStars.push(shootingStar);
}

/**
 * Update shooting stars (spawn new ones, animate existing ones)
 * @param {number} deltaTime - Time since last frame in milliseconds
 */
// Debug: Track last warning time to avoid spamming console
let lastWarningTime = 0;
const WARNING_INTERVAL = 3000; // Log warnings every 3 seconds max

export function updateShootingStars(deltaTime, timeSpeed = 1) {
    const now = Date.now();

    if (!enabled) {
        // Debug: Log why meteors aren't spawning (throttled)
        if (now - lastWarningTime > WARNING_INTERVAL) {
            console.warn(`🌠 Meteors disabled - Current style: ${currentStyle?.name || 'unknown'} (need Realistic)`);
            lastWarningTime = now;
        }
        return;
    }

    // If frequency is 0, disable shooting stars
    if (frequencyMultiplier === 0) {
        if (now - lastWarningTime > WARNING_INTERVAL) {
            console.warn('🌠 Meteors disabled - Frequency is 0%');
            lastWarningTime = now;
        }
        return;
    }

    const deltaTimeSeconds = deltaTime / 1000;

    // Calculate spawn chance based on:
    // 1. Base spawn chance
    // 2. Frequency multiplier (0-100 from slider)
    // 3. Time speed (faster = more meteors, but still spawn rarely at 1x)
    const frequencyScale = frequencyMultiplier / 20; // At default 20%, scale = 1.0

    // At 1x speed, meteors appear very rarely (1/500th normal rate)
    // As speed increases, spawn rate scales up
    let timeSpeedScale;
    if (timeSpeed === 1) {
        timeSpeedScale = 0.002; // Very rare at real-time speed
    } else {
        timeSpeedScale = Math.min(timeSpeed / 1000, 10); // Cap at 10x for faster speeds
    }

    const scaledSpawnChance = BASE_SPAWN_CHANCE * frequencyScale * timeSpeedScale;

    // Debug: Log spawn parameters every 3 seconds
    if (now - lastWarningTime > WARNING_INTERVAL && shootingStars.length === 0) {
        console.log(`🌠 Meteor spawning active: Style=${currentStyle?.name}, Freq=${frequencyMultiplier}%, Speed=${timeSpeed}x, SpawnChance=${(scaledSpawnChance * 100).toFixed(4)}%`);
        lastWarningTime = now;
    }

    // Spawn new shooting star randomly
    if (shootingStars.length < MAX_SHOOTING_STARS && Math.random() < scaledSpawnChance) {
        createShootingStar();
        console.log(`🌠 Meteor spawned! (Active: ${shootingStars.length}/${MAX_SHOOTING_STARS}, Frequency: ${frequencyMultiplier}%, Speed: ${timeSpeed}x)`);
    }

    // Update existing shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];

        // Scale movement with time speed - but cap it for visual quality
        // At 1x speed, meteors move at full speed (they're fast in real life!)
        // At higher speeds, scale gradually
        let speedScale;
        if (timeSpeed === 1) {
            speedScale = 1.0; // Full speed at real-time
        } else {
            // Use cube root for gradual scaling at higher speeds
            speedScale = Math.pow(timeSpeed / 100000, 0.33);
        }

        // Update position - move meteor head forward
        const movement = star.velocity.clone().multiplyScalar(deltaTimeSeconds * speedScale);
        star.position.add(movement);

        // Add current position to trail history
        star.trailPositions.push(star.position.clone());

        // Limit trail length to prevent infinite growth
        if (star.trailPositions.length > star.maxTrailLength) {
            star.trailPositions.shift(); // Remove oldest position
        }

        // Update trail geometry with all positions
        const positions = new Float32Array(star.trailPositions.length * 3);
        for (let j = 0; j < star.trailPositions.length; j++) {
            const pos = star.trailPositions[j];
            positions[j * 3] = pos.x;
            positions[j * 3 + 1] = pos.y;
            positions[j * 3 + 2] = pos.z;
        }

        // Update geometry
        star.mesh.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        star.mesh.geometry.attributes.position.needsUpdate = true;

        // Update lifetime (also scaled with time speed)
        star.lifetime += deltaTime * speedScale;

        // Fade out near end of life
        const lifeFraction = star.lifetime / star.maxLifetime;
        if (lifeFraction > 0.8) {
            // Fade out in last 20% of lifetime
            const fadeAmount = 1 - ((lifeFraction - 0.8) / 0.2);
            star.mesh.material.opacity = star.opacity * fadeAmount;
        }

        // Remove if expired
        if (star.lifetime >= star.maxLifetime) {
            removeFromScene(star.mesh);
            star.mesh.geometry.dispose();
            star.mesh.material.dispose();
            shootingStars.splice(i, 1);
        }
    }
}

/**
 * Update shooting stars based on visual style
 * @param {Object} styleConfig - New style configuration
 */
export function updateShootingStarsStyle(styleConfig) {
    currentStyle = styleConfig;

    // Enable/disable based on style
    const wasEnabled = enabled;
    enabled = styleConfig.name === 'Realistic';

    // If disabling, remove all existing shooting stars
    if (wasEnabled && !enabled) {
        disposeShootingStars();
    }

    console.log(`✅ Shooting stars ${enabled ? 'enabled' : 'disabled'} for ${styleConfig.name}`);
}

/**
 * Dispose of all shooting stars
 */
export function disposeShootingStars() {
    shootingStars.forEach(star => {
        if (star.mesh) {
            removeFromScene(star.mesh);
            star.mesh.geometry.dispose();
            star.mesh.material.dispose();
        }
    });
    shootingStars = [];
}

/**
 * Set meteor frequency (from slider 0-100)
 * @param {number} frequency - Frequency value 0-100 (0=off, 100=very frequent)
 */
export function setMeteorFrequency(frequency) {
    frequencyMultiplier = Math.max(0, Math.min(100, frequency));
    console.log(`🌠 Meteor frequency set to: ${frequencyMultiplier}% (${getFrequencyLabel(frequencyMultiplier)})`);
}

/**
 * Get frequency label for UI
 * @param {number} freq - Frequency 0-100
 * @returns {string} Label
 */
function getFrequencyLabel(freq) {
    if (freq === 0) return 'Off';
    if (freq < 30) return 'Low';
    if (freq < 60) return 'Moderate';
    return 'High';
}

/**
 * Get current frequency label
 * @returns {string}
 */
export function getMeteorFrequencyLabel() {
    return getFrequencyLabel(frequencyMultiplier);
}

/**
 * Set shooting stars visibility
 * @param {boolean} visible - Whether shooting stars should be visible
 */
export function setShootingStarsVisible(visible) {
    shootingStars.forEach(star => {
        if (star.mesh) {
            star.mesh.visible = visible;
        }
    });
}

// Export default
export default {
    initShootingStars,
    updateShootingStars,
    updateShootingStarsStyle,
    disposeShootingStars,
    setShootingStarsVisible
};
