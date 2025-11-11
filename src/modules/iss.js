/**
 * ISS (International Space Station) Module
 * Real-time ISS tracking with API integration, position updates, and orbital trail
 */

import { addToScene, removeFromScene } from '../core/scene.js';
import { issAPI } from '../utils/api.js';
import { geographicToScenePosition } from '../utils/coordinates.js';
import { COLORS, ISS_ORBIT_ALTITUDE, SCALE } from '../utils/constants.js';
import { scaleRadius } from '../utils/constants.js';
import { getCachedSphereGeometry } from '../utils/geometryCache.js';

// Module state
let issMesh = null;
let issTrail = null;
let issUpdateInterval = null;
let trailPositions = []; // Store last 50 positions for trail
const MAX_TRAIL_POINTS = 50;
let currentPosition = null;
let earthPosition = { x: 0, y: 0, z: 0 }; // Track Earth's position for relative positioning

/**
 * Initialize ISS visualization
 * @param {Object} styleConfig - Visual style configuration from STYLES
 * @returns {Object} ISS mesh and trail objects
 */
export function initISS(styleConfig) {
    console.log('🛰️ Initializing ISS module...');

    // Create ISS mesh
    issMesh = createISSMesh(styleConfig);
    addToScene(issMesh);

    // Create trail line
    issTrail = createISSTrail(styleConfig);
    addToScene(issTrail);

    // Start fetching ISS position from API
    startISSTracking();

    console.log('✅ ISS module initialized');

    return { mesh: issMesh, trail: issTrail };
}

/**
 * Create ISS mesh (simple sphere for now, can be replaced with detailed model)
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Mesh} ISS mesh
 */
function createISSMesh(styleConfig) {
    // Get sphere geometry from cache (larger radius for better visibility)
    const geometry = getCachedSphereGeometry(3, 4, 4);

    // Create material based on visual style
    const material = new THREE.MeshStandardMaterial({
        color: COLORS.ISS_COLOR,
        emissive: COLORS.ISS_COLOR,
        emissiveIntensity: styleConfig.name === 'Neon/Cyberpunk' ? 2.0 : 0.5,
        metalness: 0.8,
        roughness: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Scale ISS for visibility (massively enlarged)
    const issRadius = scaleRadius(10, 'iss'); // Approximate ISS size ~10m → scaled up
    mesh.scale.set(issRadius, issRadius, issRadius);

    mesh.name = 'ISS';
    mesh.userData = {
        type: 'iss',
        isTrackable: true
    };

    return mesh;
}

/**
 * Create ISS orbital trail (line showing recent positions)
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Line} Trail line
 */
function createISSTrail(styleConfig) {
    // Create buffer geometry for the trail
    const geometry = new THREE.BufferGeometry();

    // Initialize with empty positions (will be updated dynamically)
    const positions = new Float32Array(MAX_TRAIL_POINTS * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 0); // Don't draw anything initially

    // Create material for trail
    const material = new THREE.LineBasicMaterial({
        color: COLORS.ISS_TRAIL,
        opacity: styleConfig.name === 'Neon/Cyberpunk' ? 0.8 : 0.5,
        transparent: true,
        linewidth: 2 // Note: linewidth > 1 only works with WebGLRenderer on Windows
    });

    const trail = new THREE.Line(geometry, material);
    trail.name = 'ISS-Trail';
    trail.userData = {
        type: 'iss-trail'
    };

    return trail;
}

/**
 * Start tracking ISS position from API
 * Fetches position every 5 seconds and updates visualization
 */
function startISSTracking() {
    console.log('📡 Starting ISS tracking...');

    // Fetch initial position immediately
    updateISSPosition();

    // Set up automatic updates every 5 seconds
    issUpdateInterval = issAPI.startAutoUpdate(5000);

    // Register callback for position updates
    issAPI.onUpdate((position) => {
        currentPosition = position;
        updateISSVisualization();
    });

    console.log('✅ ISS tracking started (updates every 5 seconds)');
}

/**
 * Stop ISS tracking (cleanup)
 */
export function stopISSTracking() {
    if (issUpdateInterval) {
        issAPI.stopAutoUpdate(issUpdateInterval);
        issUpdateInterval = null;
        console.log('🛑 ISS tracking stopped');
    }
}

/**
 * Update ISS position from API
 */
async function updateISSPosition() {
    try {
        const position = await issAPI.fetchISSPosition();
        currentPosition = position;
        updateISSVisualization();

        // Log position for debugging
        if (position.isMock) {
            console.log('🛰️ ISS Mock Position:', position.latitude.toFixed(2), position.longitude.toFixed(2));
        } else {
            console.log('🛰️ ISS Real Position:', position.latitude.toFixed(2), position.longitude.toFixed(2));
        }
    } catch (error) {
        console.error('❌ Failed to update ISS position:', error);
    }
}

/**
 * Update ISS mesh position and trail based on current position
 */
function updateISSVisualization() {
    if (!currentPosition || !issMesh) return;

    // Convert geographic coordinates to 3D scene position
    const scenePos = geographicToScenePosition(
        currentPosition.latitude,
        currentPosition.longitude,
        ISS_ORBIT_ALTITUDE
    );

    // Add Earth's current position (ISS orbits relative to Earth)
    const worldPos = {
        x: earthPosition.x + scenePos.x,
        y: earthPosition.y + scenePos.y,
        z: earthPosition.z + scenePos.z
    };

    // Update ISS mesh position
    issMesh.position.set(worldPos.x, worldPos.y, worldPos.z);

    // Update trail
    updateTrail(worldPos);
}

/**
 * Update ISS trail with new position
 * @param {Object} position - New position {x, y, z}
 */
function updateTrail(position) {
    if (!issTrail) return;

    // Add new position to trail array
    trailPositions.push({ x: position.x, y: position.y, z: position.z });

    // Keep only last MAX_TRAIL_POINTS positions
    if (trailPositions.length > MAX_TRAIL_POINTS) {
        trailPositions.shift(); // Remove oldest position
    }

    // Update trail geometry
    const geometry = issTrail.geometry;
    const positions = geometry.attributes.position.array;

    // Fill positions array with trail points
    for (let i = 0; i < trailPositions.length; i++) {
        const point = trailPositions[i];
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
    }

    // Update geometry
    geometry.attributes.position.needsUpdate = true;
    geometry.setDrawRange(0, trailPositions.length);
}

/**
 * Update ISS animation (called every frame)
 * @param {number} deltaTime - Time since last frame in seconds
 * @param {number} simulationTime - Current simulation time in milliseconds
 * @param {Object} earthPos - Earth's current position {x, y, z}
 */
export function updateISS(deltaTime, simulationTime, earthPos) {
    // Update Earth position tracking
    if (earthPos) {
        earthPosition = earthPos;
    }

    // Recalculate ISS position relative to new Earth position
    if (currentPosition && issMesh) {
        updateISSVisualization();
    }

    // Optional: Add slow rotation for visual interest
    if (issMesh) {
        issMesh.rotation.y += deltaTime * 0.5; // Slow rotation
    }
}

/**
 * Get current ISS position
 * @returns {Object|null} Current ISS position or null if not yet fetched
 */
export function getISSPosition() {
    return currentPosition;
}

/**
 * Get ISS mesh for external access (e.g., camera focus)
 * @returns {THREE.Mesh|null} ISS mesh
 */
export function getISSMesh() {
    return issMesh;
}

/**
 * Get ISS API status
 * @returns {Object} API status information
 */
export function getISSStatus() {
    return issAPI.getStatus();
}

/**
 * Clear ISS trail
 */
export function clearISSTrail() {
    trailPositions = [];
    if (issTrail) {
        const geometry = issTrail.geometry;
        geometry.setDrawRange(0, 0);
        geometry.attributes.position.needsUpdate = true;
    }
    console.log('🧹 ISS trail cleared');
}

/**
 * Toggle ISS trail visibility
 * @param {boolean} visible - Whether trail should be visible
 */
export function setISSTrailVisible(visible) {
    if (issTrail) {
        issTrail.visible = visible;
    }
}

/**
 * Update ISS visual style
 * @param {Object} styleConfig - New style configuration
 */
export function updateISSStyle(styleConfig) {
    if (!issMesh || !issTrail) return;

    // Update ISS mesh material
    const material = issMesh.material;
    material.emissiveIntensity = styleConfig.name === 'Neon/Cyberpunk' ? 2.0 : 0.5;

    // Update trail material
    const trailMaterial = issTrail.material;
    trailMaterial.opacity = styleConfig.name === 'Neon/Cyberpunk' ? 0.8 : 0.5;

    console.log('🎨 ISS style updated to:', styleConfig.name);
}

/**
 * Dispose ISS resources (cleanup)
 */
export function disposeISS() {
    console.log('🧹 Disposing ISS module...');

    // Stop tracking
    stopISSTracking();

    // Remove from scene
    if (issMesh) {
        removeFromScene(issMesh);
        // Don't dispose cached geometry - it's shared and managed by geometryCache
        issMesh.material.dispose();
        issMesh = null;
    }

    if (issTrail) {
        removeFromScene(issTrail);
        // Trail geometry is unique (not cached), so dispose it
        issTrail.geometry.dispose();
        issTrail.material.dispose();
        issTrail = null;
    }

    // Clear trail data
    trailPositions = [];
    currentPosition = null;

    console.log('✅ ISS module disposed');
}

// Export all functions
export default {
    initISS,
    updateISS,
    disposeISS,
    getISSPosition,
    getISSMesh,
    getISSStatus,
    clearISSTrail,
    setISSTrailVisible,
    updateISSStyle,
    stopISSTracking
};
