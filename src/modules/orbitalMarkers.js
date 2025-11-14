/**
 * Orbital Markers Module - Perihelion and Aphelion Visualization
 *
 * Adds visual markers to show:
 * - Perihelion: Closest point to the Sun (where planet moves fastest)
 * - Aphelion: Farthest point from the Sun (where planet moves slowest)
 *
 * These markers help visualize the elliptical nature of orbits.
 */

import { PLANETS, auToScene, DEG_TO_RAD } from '../utils/constants.js';
import { addToScene, removeFromScene } from '../core/scene.js';
import { calculatePlanetPosition, getCurrentElements } from '../utils/orbitalElements.js';

/**
 * THREE.js is loaded globally from CDN
 */
const THREE = window.THREE;

/**
 * Perihelion marker meshes (closest point to Sun)
 * @type {Object<string, THREE.Mesh>}
 */
const perihelionMarkers = {};

/**
 * Aphelion marker meshes (farthest point from Sun)
 * @type {Object<string, THREE.Mesh>}
 */
const aphelionMarkers = {};

/**
 * Visibility state
 * @type {boolean}
 */
let markersVisible = false;

/**
 * Current visual style
 * @type {Object}
 */
let currentStyle = null;

/**
 * Initialize orbital markers for all planets
 * @param {Object} styleConfig - Visual style configuration
 */
export function initOrbitalMarkers(styleConfig = {}) {
    console.log('🎯 Initializing orbital markers (perihelion/aphelion)...');

    currentStyle = styleConfig;

    // Clean up existing markers
    disposeOrbitalMarkers();

    // Create markers for each planet
    Object.keys(PLANETS).forEach(planetKey => {
        createPlanetMarkers(planetKey, PLANETS[planetKey]);
    });

    // Start hidden by default
    setOrbitalMarkersVisible(false);

    console.log('✅ Orbital markers initialized (hidden by default)');
}

/**
 * Create perihelion and aphelion markers for a planet
 * @param {string} planetKey - Planet identifier
 * @param {Object} planetData - Planet configuration
 */
function createPlanetMarkers(planetKey, planetData) {
    // Get orbital elements
    const elem = getCurrentElements(planetKey, new Date('2000-01-01T12:00:00Z')); // J2000 epoch

    if (!elem) {
        console.warn(`No orbital elements for ${planetKey}`);
        return;
    }

    // Calculate perihelion and aphelion distances
    const a = elem.a; // Semi-major axis (AU)
    const e = elem.e; // Eccentricity

    const perihelionDistance = a * (1 - e); // Closest point
    const aphelionDistance = a * (1 + e);   // Farthest point

    // Calculate positions
    // Perihelion is at true anomaly = 0° (along major axis toward Sun)
    // Aphelion is at true anomaly = 180° (along major axis away from Sun)

    const perihelionPos = calculatePositionAtAnomaly(elem, 0); // 0 radians
    const aphelionPos = calculatePositionAtAnomaly(elem, Math.PI); // π radians

    // Create perihelion marker (green - GO, closest/fastest)
    const perihelionMarker = createMarker(
        perihelionPos,
        0x00ff00, // Green
        `${planetData.name} Perihelion`,
        planetData.color
    );
    perihelionMarkers[planetKey] = perihelionMarker;
    addToScene(perihelionMarker);

    // Create aphelion marker (red - STOP, farthest/slowest)
    const aphelionMarker = createMarker(
        aphelionPos,
        0xff0000, // Red
        `${planetData.name} Aphelion`,
        planetData.color
    );
    aphelionMarkers[planetKey] = aphelionMarker;
    addToScene(aphelionMarker);

    console.log(`  ✓ ${planetData.name}: Perihelion=${perihelionDistance.toFixed(3)} AU, Aphelion=${aphelionDistance.toFixed(3)} AU`);
}

/**
 * Calculate position at a specific true anomaly
 * @param {Object} elem - Orbital elements
 * @param {number} trueAnomaly - True anomaly in radians
 * @returns {Object} {x, y, z} position in scene units
 */
function calculatePositionAtAnomaly(elem, trueAnomaly) {
    // Convert to radians
    const i = elem.i * DEG_TO_RAD;
    const Omega = elem.Omega * DEG_TO_RAD;
    const varpi = elem.varpi * DEG_TO_RAD;
    const omega = varpi - Omega; // Argument of perihelion

    const nu = trueAnomaly;

    // Calculate distance at this true anomaly
    const r = elem.a * (1 - elem.e * elem.e) / (1 + elem.e * Math.cos(nu));

    // Position in orbital plane
    const xOrbit = r * Math.cos(nu);
    const yOrbit = r * Math.sin(nu);

    // Rotate to ecliptic coordinates
    const cosOmega = Math.cos(omega);
    const sinOmega = Math.sin(omega);
    const cosi = Math.cos(i);
    const sini = Math.sin(i);
    const cosOmegaNode = Math.cos(Omega);
    const sinOmegaNode = Math.sin(Omega);

    const x = (cosOmegaNode * cosOmega - sinOmegaNode * sinOmega * cosi) * xOrbit +
              (-cosOmegaNode * sinOmega - sinOmegaNode * cosOmega * cosi) * yOrbit;

    const y = (sinOmegaNode * cosOmega + cosOmegaNode * sinOmega * cosi) * xOrbit +
              (-sinOmegaNode * sinOmega + cosOmegaNode * cosOmega * cosi) * yOrbit;

    const z = (sinOmega * sini) * xOrbit + (cosOmega * sini) * yOrbit;

    // Convert to scene units
    return {
        x: x * auToScene(1),
        y: y * auToScene(1),
        z: z * auToScene(1)
    };
}

/**
 * Create a single marker sphere
 * @param {Object} position - {x, y, z} position
 * @param {number} color - Marker color (green for perihelion, red for aphelion)
 * @param {string} name - Marker name
 * @param {number} planetColor - Planet's color for optional ring
 * @returns {THREE.Group} Marker group
 */
function createMarker(position, color, name, planetColor) {
    const markerGroup = new THREE.Group();
    markerGroup.name = name;

    // Small sphere marker
    const sphereGeometry = new THREE.SphereGeometry(3, 8, 8);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: color,
        opacity: 0.8,
        transparent: true
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    markerGroup.add(sphere);

    // Add a ring around it for better visibility
    const ringGeometry = new THREE.RingGeometry(5, 7, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        opacity: 0.6,
        transparent: true,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Make ring horizontal
    markerGroup.add(ring);

    // Position the marker
    markerGroup.position.set(position.x, position.y, position.z);

    // Store metadata
    markerGroup.userData = {
        type: 'orbital_marker',
        markerType: color === 0x00ff00 ? 'perihelion' : 'aphelion',
        name: name
    };

    return markerGroup;
}

/**
 * Toggle orbital markers visibility
 * @param {boolean} visible - Whether markers should be visible
 */
export function setOrbitalMarkersVisible(visible) {
    markersVisible = visible;

    // Update all perihelion markers
    Object.values(perihelionMarkers).forEach(marker => {
        if (marker) marker.visible = visible;
    });

    // Update all aphelion markers
    Object.values(aphelionMarkers).forEach(marker => {
        if (marker) marker.visible = visible;
    });

    console.log(`🎯 Orbital markers ${visible ? 'shown' : 'hidden'}`);
}

/**
 * Get current visibility state
 * @returns {boolean}
 */
export function areOrbitalMarkersVisible() {
    return markersVisible;
}

/**
 * Update marker appearance based on visual style
 * @param {Object} styleConfig - New style configuration
 */
export function updateOrbitalMarkersStyle(styleConfig) {
    currentStyle = styleConfig;

    // Recreate markers with new style
    disposeOrbitalMarkers();
    initOrbitalMarkers(styleConfig);
    setOrbitalMarkersVisible(markersVisible);
}

/**
 * Dispose of all orbital markers
 */
export function disposeOrbitalMarkers() {
    // Dispose perihelion markers
    Object.values(perihelionMarkers).forEach(marker => {
        if (marker) {
            removeFromScene(marker);
            marker.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    });

    // Dispose aphelion markers
    Object.values(aphelionMarkers).forEach(marker => {
        if (marker) {
            removeFromScene(marker);
            marker.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    });

    // Clear objects
    Object.keys(perihelionMarkers).forEach(key => delete perihelionMarkers[key]);
    Object.keys(aphelionMarkers).forEach(key => delete aphelionMarkers[key]);
}

/**
 * Get info about orbital markers for a planet
 * @param {string} planetKey - Planet identifier
 * @returns {Object} Marker information
 */
export function getOrbitalMarkerInfo(planetKey) {
    const elem = getCurrentElements(planetKey, new Date('2000-01-01T12:00:00Z'));

    if (!elem) return null;

    const a = elem.a;
    const e = elem.e;

    return {
        perihelionDistance: a * (1 - e),
        aphelionDistance: a * (1 + e),
        eccentricity: e,
        semiMajorAxis: a,
        distanceDifference: a * 2 * e
    };
}

// Export all functions
export default {
    initOrbitalMarkers,
    setOrbitalMarkersVisible,
    areOrbitalMarkersVisible,
    updateOrbitalMarkersStyle,
    disposeOrbitalMarkers,
    getOrbitalMarkerInfo
};
