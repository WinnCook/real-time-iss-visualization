/**
 * Coordinate Conversion Module
 * Converts between geographic coordinates (lat/lon/alt) and 3D Cartesian coordinates
 */

import { EARTH_RADIUS, DEG_TO_RAD, kmToScene, scaleRadius, getPlanetSizeMode, ISS_ORBIT_ALTITUDE } from './constants.js';

/**
 * Convert geographic coordinates to 3D Cartesian coordinates
 * @param {number} latitude - Latitude in degrees (-90 to 90)
 * @param {number} longitude - Longitude in degrees (-180 to 180)
 * @param {number} altitude - Altitude above Earth's surface in km
 * @returns {Object} 3D position {x, y, z} in scene units
 */
export function geographicToCartesian(latitude, longitude, altitude) {
    // Convert degrees to radians
    const latRad = latitude * DEG_TO_RAD;
    const lonRad = longitude * DEG_TO_RAD;

    // Calculate distance from Earth's center
    const distanceFromCenter = EARTH_RADIUS + altitude;

    // Convert to Cartesian coordinates
    // Using standard spherical coordinate conversion
    // Note: In Three.js, Y is typically "up", so we use Y for latitude
    const x = distanceFromCenter * Math.cos(latRad) * Math.cos(lonRad);
    const y = distanceFromCenter * Math.sin(latRad);
    const z = distanceFromCenter * Math.cos(latRad) * Math.sin(lonRad);

    // Convert from km to scene units
    return {
        x: kmToScene(x),
        y: kmToScene(y),
        z: kmToScene(z)
    };
}

/**
 * Convert geographic coordinates to 3D Cartesian position relative to Earth mesh
 * This version accounts for Earth's scaled radius in the scene
 * @param {number} latitude - Latitude in degrees (-90 to 90)
 * @param {number} longitude - Longitude in degrees (-180 to 180)
 * @param {number} altitude - Altitude above Earth's surface in km
 * @returns {Object} 3D position {x, y, z} in scene units
 */
export function geographicToScenePosition(latitude, longitude, altitude) {
    // Convert degrees to radians
    const latRad = latitude * DEG_TO_RAD;
    const lonRad = longitude * DEG_TO_RAD;

    // Get Earth's scaled radius in scene (for visual consistency)
    const earthSceneRadius = scaleRadius(EARTH_RADIUS, 'planet');

    // Calculate altitude in scene units based on size mode
    const planetSizeMode = getPlanetSizeMode();
    let altitudeScene;

    if (planetSizeMode === 'real') {
        // Real mode: Use actual ISS orbital altitude with same scaling as Earth
        // ISS altitude: 408 km, Earth radius: 6,371 km
        // Real ratio: 408 / 6,371 = 0.064 (6.4% above surface)
        // Apply 100x scale to altitude BEFORE converting to scene units (same as planet scaling)
        altitudeScene = kmToScene(altitude * 100);
    } else {
        // Enlarged mode: Use exaggerated altitude for visibility
        // Scale altitude proportionally to Earth's scaled radius
        altitudeScene = earthSceneRadius * 0.15; // 15% above Earth's surface for visibility
    }

    // Total distance from Earth's center in scene units
    const distanceFromCenter = earthSceneRadius + altitudeScene;

    // Convert to Cartesian coordinates in scene space
    const x = distanceFromCenter * Math.cos(latRad) * Math.cos(lonRad);
    const y = distanceFromCenter * Math.sin(latRad);
    const z = distanceFromCenter * Math.cos(latRad) * Math.sin(lonRad);

    return { x, y, z };
}

/**
 * Convert Cartesian coordinates back to geographic coordinates
 * Useful for debugging and reverse calculations
 * @param {number} x - X coordinate in scene units
 * @param {number} y - Y coordinate in scene units
 * @param {number} z - Z coordinate in scene units
 * @returns {Object} Geographic coordinates {latitude, longitude, altitude}
 */
export function cartesianToGeographic(x, y, z) {
    // Calculate distance from origin
    const distance = Math.sqrt(x * x + y * y + z * z);

    // Calculate latitude (elevation angle)
    const latitude = Math.asin(y / distance) / DEG_TO_RAD;

    // Calculate longitude (azimuth angle)
    const longitude = Math.atan2(z, x) / DEG_TO_RAD;

    // Calculate altitude (distance from Earth's surface)
    const altitude = distance - EARTH_RADIUS;

    return { latitude, longitude, altitude };
}

/**
 * Calculate distance between two geographic coordinates (great circle distance)
 * Uses Haversine formula for accuracy
 * @param {number} lat1 - Latitude of point 1 in degrees
 * @param {number} lon1 - Longitude of point 1 in degrees
 * @param {number} lat2 - Latitude of point 2 in degrees
 * @param {number} lon2 - Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const lat1Rad = lat1 * DEG_TO_RAD;
    const lat2Rad = lat2 * DEG_TO_RAD;
    const deltaLat = (lat2 - lat1) * DEG_TO_RAD;
    const deltaLon = (lon2 - lon1) * DEG_TO_RAD;

    // Haversine formula
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS * c;
}

/**
 * Normalize longitude to -180 to 180 range
 * @param {number} lon - Longitude in degrees
 * @returns {number} Normalized longitude
 */
export function normalizeLongitude(lon) {
    let normalized = lon % 360;
    if (normalized > 180) normalized -= 360;
    if (normalized < -180) normalized += 360;
    return normalized;
}

/**
 * Clamp latitude to -90 to 90 range
 * @param {number} lat - Latitude in degrees
 * @returns {number} Clamped latitude
 */
export function clampLatitude(lat) {
    return Math.max(-90, Math.min(90, lat));
}

/**
 * Get cardinal direction from degrees (0-360)
 * @param {number} degrees - Direction in degrees (0 = North)
 * @returns {string} Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export function degreesToCardinal(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((degrees % 360) / 45)) % 8;
    return directions[index];
}

/**
 * Format latitude for display
 * @param {number} lat - Latitude in degrees
 * @returns {string} Formatted latitude (e.g., "45.5°N")
 */
export function formatLatitude(lat) {
    const hemisphere = lat >= 0 ? 'N' : 'S';
    return `${Math.abs(lat).toFixed(2)}°${hemisphere}`;
}

/**
 * Format longitude for display
 * @param {number} lon - Longitude in degrees
 * @returns {string} Formatted longitude (e.g., "123.4°W")
 */
export function formatLongitude(lon) {
    const hemisphere = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lon).toFixed(2)}°${hemisphere}`;
}

/**
 * Get position on Earth's surface at given lat/lon (altitude = 0)
 * Useful for ground stations or reference points
 * @param {number} latitude - Latitude in degrees
 * @param {number} longitude - Longitude in degrees
 * @returns {Object} 3D position {x, y, z} on Earth's surface
 */
export function getEarthSurfacePosition(latitude, longitude) {
    return geographicToScenePosition(latitude, longitude, 0);
}

// Export all functions
export default {
    geographicToCartesian,
    geographicToScenePosition,
    cartesianToGeographic,
    calculateDistance,
    normalizeLongitude,
    clampLatitude,
    degreesToCardinal,
    formatLatitude,
    formatLongitude,
    getEarthSurfacePosition
};
