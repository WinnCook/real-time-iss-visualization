/**
 * Asteroid Belt Module - Procedural asteroid belt between Mars and Jupiter
 * Uses THREE.InstancedMesh for efficient rendering of 10,000+ asteroids
 */

import { ASTEROID_BELT, auToScene, TWO_PI, DEG_TO_RAD } from '../utils/constants.js';
import { addToScene, removeFromScene } from '../core/scene.js';

/**
 * THREE.js is loaded globally from CDN
 */
const THREE = window.THREE;

/**
 * Asteroid belt instance mesh and data
 */
let asteroidBelt = null;
let asteroidData = []; // Store orbital data for each asteroid
let isVisible = true;
let currentStyle = null;

/**
 * Initialize asteroid belt with procedural distribution
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.InstancedMesh} The asteroid belt mesh
 */
export function initAsteroidBelt(styleConfig = {}) {
    console.log('☄️ Initializing Asteroid Belt...');
    currentStyle = styleConfig;

    // Clean up existing asteroid belt if any
    disposeAsteroidBelt();

    // Create geometry for a single asteroid (will be instanced thousands of times)
    // Use IcosahedronGeometry for irregular, rocky appearance
    const asteroidGeometry = new THREE.IcosahedronGeometry(1, 0); // radius 1, detail level 0 (low-poly for performance)

    // Create material based on visual style
    const asteroidMaterial = createAsteroidMaterial(styleConfig);

    // Create instanced mesh (1 draw call for all asteroids!)
    const asteroidCount = ASTEROID_BELT.asteroidCount;
    asteroidBelt = new THREE.InstancedMesh(
        asteroidGeometry,
        asteroidMaterial,
        asteroidCount
    );

    // Enable frustum culling for better performance
    asteroidBelt.frustumCulled = true;

    // Generate asteroid positions and properties
    generateAsteroidDistribution();

    // Add to scene
    addToScene(asteroidBelt);

    console.log(`✅ Asteroid Belt initialized with ${asteroidCount.toLocaleString()} asteroids`);
    return asteroidBelt;
}

/**
 * Create material for asteroids based on visual style
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Material}
 */
function createAsteroidMaterial(styleConfig) {
    const color = ASTEROID_BELT.color;

    // Check style-specific properties
    const flatShading = styleConfig.flatShading || true; // Asteroids look better with flat shading
    const wireframe = styleConfig.wireframe || false;

    // For neon style, add some emissive glow
    const emissive = styleConfig.name === 'Neon/Cyberpunk' ? color : 0x000000;
    const emissiveIntensity = styleConfig.name === 'Neon/Cyberpunk' ? 0.2 : 0;

    // Create material
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        flatShading: flatShading,
        wireframe: wireframe,
        roughness: 0.9,  // Rocky surface
        metalness: 0.1   // Not metallic
    });

    return material;
}

/**
 * Generate procedural distribution of asteroids in torus shape
 * Distributes asteroids between 2.2 - 3.2 AU with gaussian density peak at 2.7 AU
 */
function generateAsteroidDistribution() {
    const dummy = new THREE.Object3D(); // Temporary object for matrix calculations
    const matrix = new THREE.Matrix4();

    asteroidData = []; // Reset asteroid data

    const {
        innerRadius,
        outerRadius,
        centerRadius,
        thickness,
        minPeriod,
        maxPeriod,
        minSize,
        maxSize,
        asteroidCount
    } = ASTEROID_BELT;

    // Convert AU to scene units
    const innerRadiusScene = auToScene(innerRadius);
    const outerRadiusScene = auToScene(outerRadius);
    const centerRadiusScene = auToScene(centerRadius);
    const thicknessScene = auToScene(thickness);

    for (let i = 0; i < asteroidCount; i++) {
        // Use gaussian distribution for radial distance (peak at center)
        // This creates realistic density distribution (more asteroids in middle)
        const radius = gaussianRandom(centerRadiusScene, (outerRadiusScene - innerRadiusScene) / 4);
        const clampedRadius = Math.max(innerRadiusScene, Math.min(outerRadiusScene, radius));

        // Random angle around the Sun (uniform distribution)
        const angle = Math.random() * TWO_PI;

        // Random vertical offset (gaussian distribution, flatter in middle)
        const verticalOffset = gaussianRandom(0, thicknessScene / 4);

        // Calculate XYZ position
        const x = Math.cos(angle) * clampedRadius;
        const y = verticalOffset;
        const z = Math.sin(angle) * clampedRadius;

        // Random size (power law distribution - more small asteroids than large)
        const sizeRandom = Math.pow(Math.random(), 2); // Biased toward small
        const size = minSize + sizeRandom * (maxSize - minSize);

        // Random rotation for variety
        const rotationX = Math.random() * TWO_PI;
        const rotationY = Math.random() * TWO_PI;
        const rotationZ = Math.random() * TWO_PI;

        // Set transformation
        dummy.position.set(x, y, z);
        dummy.rotation.set(rotationX, rotationY, rotationZ);
        dummy.scale.setScalar(size);
        dummy.updateMatrix();

        // Apply matrix to instanced mesh
        asteroidBelt.setMatrixAt(i, dummy.matrix);

        // Calculate orbital period based on radius (Kepler's 3rd law: P² ∝ a³)
        // Closer asteroids orbit faster
        const radiusAU = clampedRadius / auToScene(1);
        const periodYears = minPeriod + (radiusAU - innerRadius) / (outerRadius - innerRadius) * (maxPeriod - minPeriod);

        // Store asteroid data for animation
        asteroidData.push({
            startAngle: angle,
            radius: clampedRadius,
            verticalOffset: y,
            size: size, // Store size for later use
            rotationX: rotationX, // Store initial rotation
            rotationY: rotationY,
            rotationZ: rotationZ,
            periodMs: periodYears * 365.25 * 24 * 60 * 60 * 1000, // Convert years to milliseconds
            rotationSpeed: (Math.random() - 0.5) * 0.0001 // Slow tumbling rotation
        });
    }

    // IMPORTANT: Tell Three.js to update the instance matrix
    asteroidBelt.instanceMatrix.needsUpdate = true;

    // Debug: Log first asteroid position
    const testMatrix = new THREE.Matrix4();
    asteroidBelt.getMatrixAt(0, testMatrix);
    const testPos = new THREE.Vector3();
    testPos.setFromMatrixPosition(testMatrix);
    console.log(`☄️ First asteroid positioned at: (${testPos.x.toFixed(1)}, ${testPos.y.toFixed(1)}, ${testPos.z.toFixed(1)})`);
    console.log(`☄️ Expected range: ${innerRadiusScene.toFixed(0)} to ${outerRadiusScene.toFixed(0)} scene units`);
}

/**
 * Gaussian random number generator (Box-Muller transform)
 * @param {number} mean - Mean value
 * @param {number} stdDev - Standard deviation
 * @returns {number} Random number from gaussian distribution
 */
function gaussianRandom(mean = 0, stdDev = 1) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(TWO_PI * u2);
    return z0 * stdDev + mean;
}

/**
 * Update asteroid belt orbital motion
 * @param {number} deltaTime - Time since last frame in milliseconds
 * @param {number} simulationTime - Current simulation time in milliseconds
 */
export function updateAsteroidBelt(deltaTime, simulationTime) {
    if (!asteroidBelt || !isVisible) return;

    const dummy = new THREE.Object3D();
    const deltaSeconds = deltaTime / 1000;

    // Update each asteroid's orbital position
    for (let i = 0; i < asteroidData.length; i++) {
        const asteroid = asteroidData[i];

        // Calculate current angle based on orbital period
        const angle = asteroid.startAngle + (simulationTime / asteroid.periodMs) * TWO_PI;

        // Calculate position
        const x = Math.cos(angle) * asteroid.radius;
        const z = Math.sin(angle) * asteroid.radius;
        const y = asteroid.verticalOffset;

        // Calculate tumbling rotation (accumulate over time)
        const rotX = asteroid.rotationX + (simulationTime * asteroid.rotationSpeed * 0.001);
        const rotY = asteroid.rotationY + (simulationTime * asteroid.rotationSpeed * 0.0007);
        const rotZ = asteroid.rotationZ + (simulationTime * asteroid.rotationSpeed * 0.0005);

        // Set transformation
        dummy.position.set(x, y, z);
        dummy.rotation.set(rotX, rotY, rotZ);
        dummy.scale.setScalar(asteroid.size);
        dummy.updateMatrix();

        // Set new matrix
        asteroidBelt.setMatrixAt(i, dummy.matrix);
    }

    // Update instance matrix
    asteroidBelt.instanceMatrix.needsUpdate = true;
}

/**
 * Toggle asteroid belt visibility
 * @param {boolean} visible - Whether belt should be visible
 */
export function setAsteroidBeltVisible(visible) {
    isVisible = visible;
    if (asteroidBelt) {
        asteroidBelt.visible = visible;
        console.log(`☄️ Asteroid Belt ${visible ? 'shown' : 'hidden'}`);
    }
}

/**
 * Get asteroid belt visibility state
 * @returns {boolean} Whether belt is currently visible
 */
export function isAsteroidBeltVisible() {
    return isVisible;
}

/**
 * Update asteroid belt appearance based on visual style
 * @param {Object} styleConfig - New style configuration
 */
export function updateAsteroidBeltStyle(styleConfig) {
    if (!asteroidBelt) return;

    currentStyle = styleConfig;

    // Update material
    const newMaterial = createAsteroidMaterial(styleConfig);
    asteroidBelt.material.dispose();
    asteroidBelt.material = newMaterial;

    console.log(`✅ Asteroid Belt style updated to: ${styleConfig.name}`);
}

/**
 * Clean up and dispose asteroid belt resources
 */
export function disposeAsteroidBelt() {
    if (asteroidBelt) {
        // Remove from scene
        removeFromScene(asteroidBelt);

        // Dispose geometry and material
        if (asteroidBelt.geometry) asteroidBelt.geometry.dispose();
        if (asteroidBelt.material) asteroidBelt.material.dispose();

        asteroidBelt = null;
    }

    asteroidData = [];
}

export default {
    initAsteroidBelt,
    updateAsteroidBelt,
    setAsteroidBeltVisible,
    isAsteroidBeltVisible,
    updateAsteroidBeltStyle,
    disposeAsteroidBelt
};
