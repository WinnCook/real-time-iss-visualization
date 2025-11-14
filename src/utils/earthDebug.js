/**
 * Earth Texture Orientation Debug Helper
 * Visualizes reference points on Earth to verify texture orientation
 */

import { getEarthSurfacePosition } from './coordinates.js';
import { addToScene, removeFromScene } from '../core/scene.js';

// THREE.js is loaded globally from CDN
const THREE = window.THREE;

// Store debug markers
let debugMarkers = [];

/**
 * Create a visible marker at a geographic location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} label - Marker label
 * @param {number} color - Marker color
 * @returns {THREE.Group} Marker group
 */
export function createLocationMarker(lat, lon, label, color = 0xff0000) {
    const position = getEarthSurfacePosition(lat, lon);

    // Create marker sphere
    const geometry = new THREE.SphereGeometry(2, 8, 8);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9
    });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.set(position.x, position.y, position.z);

    // Create label sprite
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = 'bold 24px Arial';
    context.textAlign = 'center';
    context.fillText(label, 128, 50);
    context.fillText(`${lat.toFixed(1)}°, ${lon.toFixed(1)}°`, 128, 80);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 5, 1);
    sprite.position.copy(marker.position);
    sprite.position.multiplyScalar(1.2); // Offset above surface

    const group = new THREE.Group();
    group.add(marker);
    group.add(sprite);
    group.userData = { label, lat, lon };

    addToScene(group);
    debugMarkers.push(group);

    return group;
}

/**
 * Add reference points for major cities and landmarks
 */
export function addEarthReferencePoints() {
    console.log('🌍 Adding Earth reference markers for texture orientation verification...');

    if (!THREE) {
        console.error('❌ THREE.js not available! Cannot create debug markers.');
        return;
    }

    try {
        // Prime Meridian / Greenwich, UK
        createLocationMarker(51.5, 0.0, 'Prime Meridian', 0xff0000);

        // New York City, USA
        createLocationMarker(40.7, -74.0, 'NYC', 0x00ff00);

        // Tokyo, Japan
        createLocationMarker(35.7, 139.7, 'Tokyo', 0x0000ff);

        // Sydney, Australia
        createLocationMarker(-33.9, 151.2, 'Sydney', 0xffff00);

        // South Pole
        createLocationMarker(-90.0, 0.0, 'South Pole', 0xff00ff);

        // North Pole
        createLocationMarker(90.0, 0.0, 'North Pole', 0x00ffff);

        // Equator at Prime Meridian
        createLocationMarker(0.0, 0.0, 'Equator/PM', 0xffffff);

        // Los Angeles, USA
        createLocationMarker(34.1, -118.2, 'LA', 0xff8800);

        console.log(`✅ Added ${debugMarkers.length} reference markers to scene`);
    } catch (error) {
        console.error('❌ Error creating debug markers:', error);
    }
}

/**
 * Remove all debug markers
 */
export function removeEarthReferencePoints() {
    debugMarkers.forEach(marker => removeFromScene(marker));
    debugMarkers = [];
    console.log('🗑️ Removed all Earth reference markers');
}

/**
 * Log ISS position vs expected texture location
 * @param {number} lat - ISS latitude
 * @param {number} lon - ISS longitude
 */
export function verifyISSTexturePosition(lat, lon) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛰️  ISS POSITION VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Reported Position: ${lat.toFixed(2)}° lat, ${lon.toFixed(2)}° lon`);

    // Determine expected location with better coverage
    let expectedLocation = 'Ocean/Remote Area';

    // North America
    if (lat > 15 && lat < 72 && lon > -170 && lon < -50) {
        expectedLocation = 'North America (USA/Canada/Mexico)';
    }
    // South America
    else if (lat > -55 && lat < 15 && lon > -82 && lon < -34) {
        expectedLocation = 'South America';
    }
    // Europe
    else if (lat > 35 && lat < 72 && lon > -10 && lon < 40) {
        expectedLocation = 'Europe';
    }
    // Africa
    else if (lat > -35 && lat < 37 && lon > -18 && lon < 52) {
        expectedLocation = 'Africa';
    }
    // Asia (East)
    else if (lat > 20 && lat < 55 && lon > 100 && lon < 150) {
        expectedLocation = 'East Asia (China/Japan/Korea)';
    }
    // Asia (South/Southeast)
    else if (lat > -10 && lat < 40 && lon > 60 && lon < 150) {
        expectedLocation = 'Asia (India/Southeast Asia)';
    }
    // Australia
    else if (lat > -45 && lat < -10 && lon > 110 && lon < 180) {
        expectedLocation = 'Australia';
    }
    // Russia (North Asia)
    else if (lat > 50 && lon > 30 && lon < 180) {
        expectedLocation = 'Russia/Northern Asia';
    }

    console.log(`Expected Texture Region: ${expectedLocation}`);
    console.log('');
    console.log('📍 VERIFICATION STEPS:');
    console.log('1. Press D to toggle Earth reference markers');
    console.log('2. Click ISS to zoom in on it');
    console.log('3. Check if ISS appears over the expected region on Earth texture');
    console.log('4. Red marker = Prime Meridian (UK), Green = NYC, Blue = Tokyo');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

export default {
    createLocationMarker,
    addEarthReferencePoints,
    removeEarthReferencePoints,
    verifyISSTexturePosition
};
