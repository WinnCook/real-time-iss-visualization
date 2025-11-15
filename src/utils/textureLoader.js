/**
 * Texture Loader Utility
 *
 * Handles asynchronous loading of planet and moon textures with:
 * - Progress tracking for loading screen updates
 * - Error handling with fallback to solid colors
 * - Texture caching to avoid reloading
 * - Proper texture settings (anisotropy, wrapping, etc.)
 *
 * Usage:
 *   const textures = await loadAllTextures(onProgress);
 *   const earthTexture = textures.earth;
 */

import * as THREE from '../../../assets/js/three.module.js';

/**
 * Texture cache to avoid reloading
 * @type {Map<string, THREE.Texture>}
 */
const textureCache = new Map();

/**
 * Three.js TextureLoader instance (shared for all loads)
 */
const loader = new THREE.TextureLoader();

/**
 * Load a single texture with error handling
 *
 * @param {string} path - Path to texture file
 * @param {string} name - Name of the celestial body (for logging)
 * @returns {Promise<THREE.Texture|null>} Loaded texture or null on error
 */
export async function loadTexture(path, name) {
    // Check cache first
    if (textureCache.has(path)) {
        console.log(`=� Using cached texture: ${name}`);
        return textureCache.get(path);
    }

    return new Promise((resolve) => {
        loader.load(
            path,
            // onLoad callback
            (texture) => {
                // Configure texture settings for optimal quality
                texture.anisotropy = 16; // Maximum anisotropic filtering for sharp textures
                texture.wrapS = THREE.ClampToEdgeWrapping; // Prevent seam at poles
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.minFilter = THREE.LinearMipmapLinearFilter; // Smooth when far away
                texture.magFilter = THREE.LinearFilter; // Smooth when close
                texture.generateMipmaps = true; // Generate mipmaps for better performance
                texture.needsUpdate = true;

                // Cache the loaded texture
                textureCache.set(path, texture);

                console.log(` Loaded texture: ${name} (${path})`);
                resolve(texture);
            },
            // onProgress callback (optional, used by loader internally)
            undefined,
            // onError callback
            (error) => {
                console.error(`L Failed to load texture: ${name} (${path})`, error);
                resolve(null); // Return null instead of rejecting to allow graceful fallback
            }
        );
    });
}

/**
 * Load all planet and moon textures
 *
 * @param {Object} texturePaths - Object mapping body names to texture paths
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<Object>} Object with loaded textures (keys: body names)
 */
export async function loadAllTextures(texturePaths, onProgress = null) {
    const textureNames = Object.keys(texturePaths);
    const totalTextures = textureNames.length;
    let loadedCount = 0;

    const textures = {};

    console.log(`=� Starting texture loading: ${totalTextures} textures`);

    // Load all textures in parallel for faster loading
    const loadPromises = textureNames.map(async (name) => {
        const path = texturePaths[name];
        const texture = await loadTexture(path, name);

        textures[name] = texture;
        loadedCount++;

        // Report progress
        if (onProgress) {
            onProgress(loadedCount, totalTextures);
        }

        return { name, texture };
    });

    // Wait for all textures to finish loading
    await Promise.all(loadPromises);

    console.log(` Texture loading complete: ${loadedCount}/${totalTextures} loaded`);

    return textures;
}

/**
 * Clear texture cache (useful for memory management)
 */
export function clearTextureCache() {
    textureCache.forEach((texture, path) => {
        texture.dispose();
        console.log(`=� Disposed texture: ${path}`);
    });
    textureCache.clear();
    console.log(' Texture cache cleared');
}

/**
 * Get texture from cache
 *
 * @param {string} path - Path to texture file
 * @returns {THREE.Texture|null} Cached texture or null
 */
export function getCachedTexture(path) {
    return textureCache.get(path) || null;
}

/**
 * Check if texture is in cache
 *
 * @param {string} path - Path to texture file
 * @returns {boolean} True if texture is cached
 */
export function isTextureCached(path) {
    return textureCache.has(path);
}

/**
 * Get cache statistics
 *
 * @returns {Object} Cache stats (count, paths)
 */
export function getTextureStats() {
    return {
        count: textureCache.size,
        paths: Array.from(textureCache.keys())
    };
}

// Export for use in other modules
export default {
    loadTexture,
    loadAllTextures,
    clearTextureCache,
    getCachedTexture,
    isTextureCached,
    getTextureStats
};
