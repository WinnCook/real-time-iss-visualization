/**
 * ISS (International Space Station) Module
 * Real-time ISS tracking with API integration, position updates, and orbital trail
 * VERSION: CACHE_BUSTER_20250113001
 * BRIGHT FALLBACK ENABLED FOR VISIBILITY
 */

console.log('🚨🚨🚨 ISS.JS LOADED - VERSION CACHE_BUSTER_20250113001 🚨🚨🚨');
console.log('🚨🚨🚨 BRIGHT FALLBACK ENABLED 🚨🚨🚨');

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
let uiUpdateCallback = null; // Callback to update UI with ISS data
let solarPanels = []; // Store references to solar panels for rotation
let issModelLoaded = false; // Track if 3D model loaded successfully

/**
 * Initialize ISS visualization (async to load 3D model)
 * @param {Object} styleConfig - Visual style configuration from STYLES
 * @returns {Promise<Object>} ISS mesh and trail objects
 */
export async function initISS(styleConfig) {
    console.log('🛰️ Initializing ISS module...');

    // Clean up existing ISS if any
    disposeISS();

    // Create ISS mesh (load 3D model)
    issMesh = await loadISSModel(styleConfig);
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
 * Load ISS 3D model from GLB file
 * @param {Object} styleConfig - Visual style configuration
 * @returns {Promise<THREE.Group>} ISS mesh group
 */
async function loadISSModel(styleConfig) {
    return new Promise((resolve, reject) => {
        // Create a group to hold the model
        const issGroup = new THREE.Group();

        // Create GLTF loader
        console.log('🔍 Checking for GLTFLoader...');
        console.log('  THREE.GLTFLoader exists?', typeof THREE.GLTFLoader);

        if (typeof THREE.GLTFLoader === 'undefined') {
            console.error('❌ GLTFLoader not available! Falling back to simple geometry.');
            const fallbackISS = createFallbackISS(styleConfig);
            issGroup.add(fallbackISS);
            issGroup.name = 'ISS';
            issGroup.userData = { type: 'iss', isTrackable: true };
            resolve(issGroup);
            return;
        }

        const loader = new THREE.GLTFLoader();
        console.log('✅ GLTFLoader instantiated');

        console.log('🛰️ Loading ISS 3D model from assets/models/ISS_stationary.glb...');

        // Load the ISS model
        loader.load(
            'assets/models/ISS_stationary.glb',
            // On load success
            (gltf) => {
                console.log('✅ ISS model loaded successfully');
                issModelLoaded = true;

                // Add the loaded model to the group
                const model = gltf.scene;
                issGroup.add(model);

                // Find solar panels in the model for animation
                solarPanels = [];
                model.traverse((child) => {
                    // Look for meshes that might be solar panels
                    // (Naming depends on the model structure - we'll find them by position/size)
                    if (child.isMesh) {
                        // Apply material based on visual style
                        if (child.material) {
                            // Enhance materials for visual styles
                            if (styleConfig.name === 'Neon/Cyberpunk') {
                                child.material.emissiveIntensity = 1.5;
                            }
                            // Store panels for rotation (we'll identify them later)
                            if (child.name.toLowerCase().includes('panel') ||
                                child.name.toLowerCase().includes('solar') ||
                                child.name.toLowerCase().includes('array')) {
                                solarPanels.push(child);
                                console.log(`  Found solar panel: ${child.name}`);
                            }
                        }
                    }
                });

                // Scale the model appropriately
                // Real ISS is ~109m × 73m = 0.109km × 0.073km
                // Use appropriate radius for both enlarged and real modes
                const issScale = scaleRadius(3, 'iss'); // Reasonable size in both modes
                issGroup.scale.set(issScale, issScale, issScale);

                // Set group properties
                issGroup.name = 'ISS';
                issGroup.userData = {
                    type: 'iss',
                    isTrackable: true
                };

                console.log(`  Scaled ISS model by ${issScale}x`);
                console.log(`  Found ${solarPanels.length} solar panel meshes`);

                resolve(issGroup);
            },
            // On progress
            (xhr) => {
                const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                console.log(`  Loading ISS model: ${percent}%`);
            },
            // On error
            (error) => {
                console.error('❌ Error loading ISS model:', error);
                console.log('  Falling back to simple geometry...');

                // Fallback: Create simple iconic geometry if model fails to load
                const fallbackISS = createFallbackISS(styleConfig);
                issGroup.add(fallbackISS);

                resolve(issGroup);
            }
        );
    });
}

/**
 * Create fallback ISS geometry (simple iconic design)
 * Used if 3D model fails to load
 * @param {Object} styleConfig - Visual style configuration
 * @returns {THREE.Group} Simple ISS geometry
 */
function createFallbackISS(styleConfig) {
    console.log('🔧 Creating FALLBACK ISS geometry (3D model failed to load)');
    const group = new THREE.Group();

    // MAKE IT SUPER OBVIOUS - BRIGHT YELLOW BODY
    const bodyGeometry = new THREE.CylinderGeometry(3, 3, 18, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFF00, // BRIGHT YELLOW
        emissive: 0xFFFF00,
        emissiveIntensity: 1.0
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    group.add(body);

    // BRIGHT CYAN SOLAR PANELS
    const panelGeometry = new THREE.BoxGeometry(25, 8, 0.5);
    const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0x00FFFF, // BRIGHT CYAN
        emissive: 0x00FFFF,
        emissiveIntensity: 0.8
    });

    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.set(-8, 0, 0);
    leftPanel.name = 'ISS-Panel-Left';
    group.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.set(8, 0, 0);
    rightPanel.name = 'ISS-Panel-Right';
    group.add(rightPanel);

    solarPanels = [leftPanel, rightPanel];
    console.log('✅ Fallback ISS: BRIGHT YELLOW body + CYAN panels (solar panels stored)');

    return group;
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
        updateISSVisualization(true); // Pass true - this is new API data
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
        updateISSVisualization(true); // Pass true - this is new API data

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
 * @param {boolean} isNewData - Whether this is new API data (not just a visual update)
 */
function updateISSVisualization(isNewData = false) {
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

    // Notify UI of ISS data update ONLY when we get new API data
    if (isNewData && uiUpdateCallback && currentPosition) {
        uiUpdateCallback({
            position: {
                lat: currentPosition.latitude,
                lon: currentPosition.longitude
            },
            altitude: ISS_ORBIT_ALTITUDE,
            timestamp: currentPosition.timestamp || Math.floor(Date.now() / 1000)
        });
    }
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
 * Rotate solar panels to face the sun for maximum power generation
 * @param {THREE.Group} issGroup - The ISS group mesh
 */
function rotateSolarPanelsToSun(issGroup) {
    if (!solarPanels || solarPanels.length === 0) {
        console.log('⚠️ No solar panels found to rotate');
        return;
    }

    console.log(`🔄 Rotating ${solarPanels.length} solar panels toward sun`);

    // Sun is at origin (0, 0, 0)
    const sunPosition = new THREE.Vector3(0, 0, 0);

    // Rotate each solar panel to face the sun
    solarPanels.forEach((panel, index) => {
        if (!panel || !panel.isObject3D) {
            console.log(`  Panel ${index}: invalid`);
            return;
        }

        // Simple approach: just make the panel look at the sun
        // The panel's -Z axis will point toward the sun
        panel.lookAt(sunPosition);
        console.log(`  Panel ${index}: rotated`);
    });
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

        // Orient ISS to stay parallel to Earth's surface
        // Calculate vector from Earth to ISS (radial direction - "up" from Earth's surface)
        const radial = new THREE.Vector3(
            issMesh.position.x - earthPosition.x,
            issMesh.position.y - earthPosition.y,
            issMesh.position.z - earthPosition.z
        ).normalize();

        // Calculate orbital tangent (direction of motion, perpendicular to radial in XZ plane)
        // ISS moves counterclockwise when viewed from above (positive Y)
        const tangent = new THREE.Vector3(-radial.z, 0, radial.x).normalize();

        // Set ISS orientation: body points in direction of orbital motion, panels face radially
        // We want the cylinder body (which is along local X axis after rotation) to point tangentially
        // Create a rotation matrix that aligns the ISS with orbital motion
        const up = new THREE.Vector3(0, 1, 0); // World up
        const quaternion = new THREE.Quaternion();

        // Make ISS "look" in the tangent direction with "up" being world up
        // This keeps it flying forward with solar panels perpendicular to Earth
        const matrix = new THREE.Matrix4();
        matrix.lookAt(issMesh.position,
                     new THREE.Vector3().addVectors(issMesh.position, tangent),
                     radial);
        quaternion.setFromRotationMatrix(matrix);
        issMesh.quaternion.copy(quaternion);

        // SOLAR PANEL ROTATION: Rotate panels to face the sun
        rotateSolarPanelsToSun(issMesh);

        // Update world matrix so labels can get correct positions
        issMesh.updateMatrixWorld(true);
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
    console.log('🔍 getISSMesh() called, returning:', issMesh);
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
 * Register a callback for UI updates when ISS data changes
 * @param {Function} callback - Function to call with ISS data
 */
export function registerUICallback(callback) {
    uiUpdateCallback = callback;
    console.log('✅ ISS UI callback registered');
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

        // Dispose of ISS group and all its children (body + solar panels)
        issMesh.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                child.material.dispose();
            }
        });

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
    stopISSTracking,
    registerUICallback
};
