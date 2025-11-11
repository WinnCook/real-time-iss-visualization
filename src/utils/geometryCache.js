/**
 * Geometry Cache Module - Efficient geometry reuse
 * Caches sphere geometries to avoid recreating them on every frame or preset change
 */

/**
 * Geometry cache - stores sphere geometries by segment count
 * @type {Map<string, THREE.SphereGeometry>}
 */
const geometryCache = new Map();

/**
 * Get or create a sphere geometry with the specified parameters
 * @param {number} radius - Sphere radius
 * @param {number} widthSegments - Number of horizontal segments
 * @param {number} heightSegments - Number of vertical segments
 * @returns {THREE.SphereGeometry}
 */
export function getCachedSphereGeometry(radius, widthSegments, heightSegments = widthSegments) {
    // Create cache key based on parameters
    const key = `sphere_${radius}_${widthSegments}_${heightSegments}`;

    // Return cached geometry if it exists
    if (geometryCache.has(key)) {
        return geometryCache.get(key);
    }

    // Create new geometry and cache it
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    geometryCache.set(key, geometry);

    console.log(`📦 Cached new geometry: ${key}`);
    return geometry;
}

/**
 * Clear geometries with specific segment count (for preset changes)
 * @param {number} segments - Segment count to clear (or null to clear all)
 */
export function clearGeometryCache(segments = null) {
    if (segments === null) {
        // Clear all
        geometryCache.forEach(geo => geo.dispose());
        geometryCache.clear();
        console.log('🗑️ Cleared entire geometry cache');
    } else {
        // Clear specific segment count
        const keysToDelete = [];
        geometryCache.forEach((geo, key) => {
            if (key.includes(`_${segments}_`)) {
                geo.dispose();
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => geometryCache.delete(key));
        console.log(`🗑️ Cleared ${keysToDelete.length} geometries with ${segments} segments`);
    }
}

/**
 * Get cache statistics
 * @returns {Object}
 */
export function getGeometryCacheStats() {
    return {
        count: geometryCache.size,
        keys: Array.from(geometryCache.keys())
    };
}

export default {
    getCachedSphereGeometry,
    clearGeometryCache,
    getGeometryCacheStats
};
