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
const MAX_SHOOTING_STARS = 3;

/**
 * Chance per frame to spawn a new shooting star (0-1)
 */
const SPAWN_CHANCE = 0.0005; // About 1 every 2000 frames at 60fps = every ~33 seconds

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
 * Create a single shooting star
 */
function createShootingStar() {
    // Random starting position in the far distance
    const distance = 5000 + Math.random() * 3000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    const startX = distance * Math.sin(phi) * Math.cos(theta);
    const startY = distance * Math.sin(phi) * Math.sin(theta);
    const startZ = distance * Math.cos(phi);

    // Create trail geometry (a line)
    const trailLength = 200 + Math.random() * 300;
    const geometry = new THREE.BufferGeometry();

    // Trail has start and end points
    const positions = new Float32Array([
        0, 0, 0,                    // Trail start (at star position)
        -trailLength, 0, 0          // Trail end (behind star)
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create glowing material
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.8,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    const trail = new THREE.Line(geometry, material);

    // Random velocity direction (generally moving across sky)
    const speed = 100 + Math.random() * 200; // units per second
    const velocityTheta = Math.random() * Math.PI * 2;
    const velocityPhi = Math.PI / 4 + Math.random() * Math.PI / 4; // Somewhat downward

    const velocity = new THREE.Vector3(
        speed * Math.sin(velocityPhi) * Math.cos(velocityTheta),
        speed * Math.sin(velocityPhi) * Math.sin(velocityTheta),
        speed * Math.cos(velocityPhi)
    );

    // Point trail in direction of motion
    trail.lookAt(velocity);

    // Set starting position
    trail.position.set(startX, startY, startZ);

    // Add to scene
    addToScene(trail);

    // Create shooting star object
    const shootingStar = {
        mesh: trail,
        velocity: velocity,
        lifetime: 0,
        maxLifetime: 2000 + Math.random() * 3000, // 2-5 seconds
        opacity: 0.8
    };

    shootingStars.push(shootingStar);
}

/**
 * Update shooting stars (spawn new ones, animate existing ones)
 * @param {number} deltaTime - Time since last frame in milliseconds
 */
export function updateShootingStars(deltaTime) {
    if (!enabled) return;

    const deltaTimeSeconds = deltaTime / 1000;

    // Spawn new shooting star randomly
    if (shootingStars.length < MAX_SHOOTING_STARS && Math.random() < SPAWN_CHANCE) {
        createShootingStar();
    }

    // Update existing shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];

        // Update position
        star.mesh.position.add(
            star.velocity.clone().multiplyScalar(deltaTimeSeconds)
        );

        // Update lifetime
        star.lifetime += deltaTime;

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
