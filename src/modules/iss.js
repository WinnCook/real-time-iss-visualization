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
import { verifyISSTexturePosition } from '../utils/earthDebug.js';
import { escapeHTML } from '../utils/htmlSanitizer.js';

// Module state
let issMesh = null; // Will be THREE.LOD object
let issDetailedModel = null; // Store detailed model reference
let issSimpleModel = null; // Store simple model reference
let issTrail = null;
let issUpdateInterval = null;
let trailPositions = []; // Store last 50 positions for trail
const MAX_TRAIL_POINTS = 50;
let currentPosition = null;
let earthPosition = { x: 0, y: 0, z: 0 }; // Track Earth's position for relative positioning
let uiUpdateCallback = null; // Callback to update UI with ISS data
let solarPanelsDetailed = []; // Solar panels from detailed 3D model
let solarPanelsSimple = []; // Solar panels from simple fallback model
let issModelLoaded = false; // Track if 3D model loaded successfully
let moduleLabels = []; // HTML label elements for ISS modules
let moduleLabelsEnabled = false; // Toggle for module labels

// LOD distance thresholds (in scene units)
const LOD_DISTANCES = {
    DETAILED: 0,      // 0-500 units: Show detailed model
    SIMPLE: 500       // 500+ units: Show simple fallback
};

// ISS Module positions (approximate, relative to center)
// These are rough estimates based on typical ISS layout
const ISS_MODULES = [
    { name: 'Zvezda (Service)', position: { x: 15, y: 0, z: 0 }, color: '#ff6b6b' },
    { name: 'Zarya (FGB)', position: { x: 10, y: 0, z: 0 }, color: '#4ecdc4' },
    { name: 'Destiny (US Lab)', position: { x: 0, y: 0, z: 0 }, color: '#45b7d1' },
    { name: 'Harmony (Node 2)', position: { x: -5, y: 0, z: 0 }, color: '#96ceb4' },
    { name: 'Columbus (EU Lab)', position: { x: -10, y: 0, z: 2 }, color: '#ffeaa7' },
    { name: 'Kibo (Japan)', position: { x: -10, y: 0, z: -2 }, color: '#dfe6e9' }
];

/**
 * Initialize ISS visualization (async to load 3D model)
 * @param {Object} styleConfig - Visual style configuration from STYLES
 * @returns {Promise<Object>} ISS mesh and trail objects
 */
export async function initISS(styleConfig) {
    console.log('🛰️ Initializing ISS module with LOD system...');

    // Clean up existing ISS if any
    disposeISS();

    // Create LOD object
    const issLOD = new THREE.LOD();
    issLOD.name = 'ISS-LOD';
    issLOD.userData = {
        type: 'iss',
        isTrackable: true
    };

    // Load detailed 3D model (Level 0 - close range)
    issDetailedModel = await loadISSModel(styleConfig);
    issLOD.addLevel(issDetailedModel, LOD_DISTANCES.DETAILED);
    console.log(`  LOD Level 0 (detailed): 0-${LOD_DISTANCES.SIMPLE} units`);

    // Create simple fallback model (Level 1 - far range)
    issSimpleModel = createFallbackISS(styleConfig);
    issLOD.addLevel(issSimpleModel, LOD_DISTANCES.SIMPLE);
    console.log(`  LOD Level 1 (simple): ${LOD_DISTANCES.SIMPLE}+ units`);

    // Set the LOD object as the main ISS mesh
    issMesh = issLOD;

    // BUG FIX: Set INITIAL position using mock data immediately
    // Don't wait for API - it might be unreachable and ISS will be stuck at origin (0,0,0)
    const initialMockPosition = issAPI.getMockPosition();
    currentPosition = initialMockPosition;
    console.log(`🛰️ ISS initial mock position: lat=${initialMockPosition.latitude.toFixed(2)}, lon=${initialMockPosition.longitude.toFixed(2)}`);

    // Position ISS immediately so it's not stuck in the sun
    updateISSVisualization(false);
    console.log(`🛰️ ISS positioned at mock location - will be updated by API if available`);

    addToScene(issMesh);

    // Create trail line
    issTrail = createISSTrail(styleConfig);
    addToScene(issTrail);

    // Start fetching ISS position from API (async - will update position)
    startISSTracking();

    // Create module labels (hidden by default)
    createModuleLabels();

    console.log('✅ ISS module initialized with 2-level LOD system');

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

                // Find solar panels in the model for animation (detailed model)
                solarPanelsDetailed = [];
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
                                solarPanelsDetailed.push(child);
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

                // Set group properties (LOD parent will handle userData)
                issGroup.name = 'ISS-Detailed';

                console.log(`  Scaled ISS model by ${issScale}x`);
                console.log(`  Found ${solarPanelsDetailed.length} solar panel meshes`);

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

    // Store simple model panels
    solarPanelsSimple = [leftPanel, rightPanel];
    console.log('✅ Fallback ISS: BRIGHT YELLOW body + CYAN panels (simple solar panels stored)');

    group.name = 'ISS-Simple';
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
        console.log('🔔 ISS callback triggered with position:', position);
        currentPosition = position;
        console.log('📍 currentPosition set, calling updateISSVisualization...');
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
    console.log('🚀 updateISSPosition() called - fetching from API...');
    try {
        console.log('📞 Calling issAPI.fetchISSPosition()...');
        const position = await issAPI.fetchISSPosition();
        console.log('📦 Received position from API:', position);
        currentPosition = position;
        console.log('✅ currentPosition set, calling updateISSVisualization...');
        updateISSVisualization(true); // Pass true - this is new API data

        // Log position for debugging
        if (position.isMock) {
            console.log('🛰️ ISS Mock Position:', position.latitude.toFixed(2), position.longitude.toFixed(2));
        } else {
            console.log('🛰️ ISS Real Position:', position.latitude.toFixed(2), position.longitude.toFixed(2));
        }
    } catch (error) {
        console.error('❌ Failed to update ISS position:', error);
        console.error('❌ Error stack:', error.stack);
    }
}

/**
 * Update ISS mesh position and trail based on current position
 * @param {boolean} isNewData - Whether this is new API data (not just a visual update)
 */
function updateISSVisualization(isNewData = false) {
    console.log('🎬 updateISSVisualization called - currentPosition:', currentPosition, 'issMesh:', !!issMesh);
    if (!currentPosition || !issMesh) {
        console.warn('⚠️ Cannot update ISS visualization - currentPosition:', !!currentPosition, 'issMesh:', !!issMesh);
        return;
    }

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

        // DEBUG: Verify ISS texture position alignment
        verifyISSTexturePosition(currentPosition.latitude, currentPosition.longitude);
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
function rotateSolarPanelsToSun(issLOD) {
    // Check which LOD level is currently active
    const currentLevel = issLOD.getCurrentLevel();

    // Select appropriate panel array based on LOD level
    const panels = (currentLevel === 0) ? solarPanelsDetailed : solarPanelsSimple;

    if (!panels || panels.length === 0) {
        return; // No panels found yet (model still loading)
    }

    // Sun is at origin (0, 0, 0)
    const sunPosition = new THREE.Vector3(0, 0, 0);

    // Rotate each solar panel to face the sun
    panels.forEach((panel) => {
        if (!panel || !panel.isObject3D) return;

        // Make the panel look at the sun
        // The panel's -Z axis will point toward the sun
        panel.lookAt(sunPosition);
    });
}

/**
 * Create ISS module labels (HTML elements positioned in 3D space)
 */
function createModuleLabels() {
    console.log('🏷️ Creating ISS module labels...');

    // Remove existing labels if any
    disposeModuleLabels();

    // Create HTML labels for each module
    ISS_MODULES.forEach((module, index) => {
        const label = document.createElement('div');
        label.className = 'iss-module-label';
        label.id = `iss-module-${index}`;
        // SECURITY NOTE: ISS_MODULES is a hardcoded constant, but we escape for defense in depth
        const safeName = escapeHTML(module.name);
        const safeColor = escapeHTML(module.color);
        label.innerHTML = `<span style="border-left: 3px solid ${safeColor}; padding-left: 0.5rem;">${safeName}</span>`;
        label.style.position = 'absolute';
        label.style.color = 'rgba(255, 255, 255, 0.9)';
        label.style.fontSize = '0.75rem';
        label.style.fontWeight = '500';
        label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        label.style.padding = '0.25rem 0.5rem';
        label.style.borderRadius = '4px';
        label.style.pointerEvents = 'none';
        label.style.whiteSpace = 'nowrap';
        label.style.display = 'none'; // Hidden by default
        label.style.zIndex = '1000';

        document.body.appendChild(label);
        moduleLabels.push({
            element: label,
            module: module
        });
    });

    console.log(`✅ Created ${moduleLabels.length} ISS module labels`);
}

/**
 * Update ISS module label positions (called every frame)
 * @param {THREE.Camera} camera - The camera object
 */
export function updateModuleLabels(camera) {
    if (!moduleLabelsEnabled || !issMesh || moduleLabels.length === 0) {
        // Hide all labels if disabled
        moduleLabels.forEach(({ element }) => {
            element.style.display = 'none';
        });
        return;
    }

    // Only show labels when ISS is close (detailed model visible)
    const currentLevel = issMesh.getCurrentLevel();
    if (currentLevel !== 0) {
        // Far away, hide labels
        moduleLabels.forEach(({ element }) => {
            element.style.display = 'none';
        });
        return;
    }

    // Update each label position
    moduleLabels.forEach(({ element, module }) => {
        // Calculate world position of module (relative to ISS position)
        const moduleWorldPos = new THREE.Vector3(
            issMesh.position.x + module.position.x,
            issMesh.position.y + module.position.y,
            issMesh.position.z + module.position.z
        );

        // Project to screen coordinates
        const screenPos = moduleWorldPos.clone().project(camera);

        // Check if behind camera
        if (screenPos.z > 1) {
            element.style.display = 'none';
            return;
        }

        // Convert to pixel coordinates
        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

        // Position label
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.display = 'block';

        // Fade based on distance from camera
        const distance = camera.position.distanceTo(moduleWorldPos);
        const opacity = Math.max(0, Math.min(1, 1 - (distance - 100) / 400));
        element.style.opacity = opacity;
    });
}

/**
 * Toggle ISS module labels on/off
 * @param {boolean} enabled - Whether labels should be visible
 */
export function setModuleLabelsEnabled(enabled) {
    moduleLabelsEnabled = enabled;
    console.log(`🏷️ ISS module labels ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Dispose module labels (cleanup)
 */
function disposeModuleLabels() {
    moduleLabels.forEach(({ element }) => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
    moduleLabels = [];
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
    trailPositions.length = 0; // MEMORY FIX: Clear array properly to prevent memory leaks
    currentPosition = null;

    // Clear solar panel references
    // MEMORY FIX: Clear arrays completely to ensure garbage collection
    solarPanelsDetailed.length = 0;
    solarPanelsSimple.length = 0;

    // Clear model references
    issDetailedModel = null;
    issSimpleModel = null;

    // Dispose module labels
    disposeModuleLabels();

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
    registerUICallback,
    updateModuleLabels,
    setModuleLabelsEnabled
};
