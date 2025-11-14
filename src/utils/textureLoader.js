/**
 * Texture Loader Utility
 * Handles loading and caching of planet textures
 */

import * as THREE from 'three';

// Texture cache to avoid reloading same textures
const textureCache = new Map();

// Loading manager for tracking progress
let loadingManager = null;

/**
 * Set loading manager for texture loading progress tracking
 * @param {THREE.LoadingManager} manager - Three.js loading manager
 */
export function setTextureLoadingManager(manager) {
    loadingManager = manager;
}

/**
 * Load a texture from URL with caching
 * @param {string} url - Path to texture file
 * @param {Object} options - Texture options (wrapS, wrapT, etc.)
 * @returns {Promise<THREE.Texture>} Loaded texture
 */
export function loadTexture(url, options = {}) {
    // Check cache first
    if (textureCache.has(url)) {
        console.log(`  📦 Using cached texture: ${url}`);
        return Promise.resolve(textureCache.get(url));
    }

    return new Promise((resolve, reject) => {
        const loader = loadingManager
            ? new THREE.TextureLoader(loadingManager)
            : new THREE.TextureLoader();

        console.log(`  🎨 Loading texture: ${url}`);

        loader.load(
            url,
            (texture) => {
                // Apply options
                if (options.wrapS) texture.wrapS = options.wrapS;
                if (options.wrapT) texture.wrapT = options.wrapT;
                if (options.repeat) texture.repeat.set(options.repeat.x, options.repeat.y);
                if (options.anisotropy !== undefined) {
                    texture.anisotropy = options.anisotropy;
                }

                // Default settings for planet textures
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;

                // Cache the texture
                textureCache.set(url, texture);

                console.log(`  ✅ Texture loaded: ${url}`);
                resolve(texture);
            },
            undefined, // onProgress (handled by loading manager)
            (error) => {
                console.error(`  ❌ Failed to load texture: ${url}`, error);
                reject(error);
            }
        );
    });
}

/**
 * Load planet texture set (color, normal, specular maps)
 * @param {string} planetName - Name of planet (lowercase)
 * @param {Object} maps - Which maps to load {color: true, normal: true, specular: true}
 * @returns {Promise<Object>} Object with loaded textures
 */
export async function loadPlanetTextures(planetName, maps = { color: true }) {
    const textures = {};
    const basePath = 'assets/textures/planets';

    try {
        // Load color/albedo map
        if (maps.color) {
            textures.color = await loadTexture(`${basePath}/${planetName}_color.jpg`, {
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.ClampToEdgeWrapping,
                anisotropy: 4
            });
        }

        // Load normal map (bump mapping)
        if (maps.normal) {
            try {
                textures.normal = await loadTexture(`${basePath}/${planetName}_normal.jpg`, {
                    wrapS: THREE.RepeatWrapping,
                    wrapT: THREE.ClampToEdgeWrapping
                });
            } catch (e) {
                console.log(`  ⚠️ No normal map for ${planetName} (optional)`);
            }
        }

        // Load specular map (shininess - Earth oceans)
        if (maps.specular) {
            try {
                textures.specular = await loadTexture(`${basePath}/${planetName}_specular.jpg`, {
                    wrapS: THREE.RepeatWrapping,
                    wrapT: THREE.ClampToEdgeWrapping
                });
            } catch (e) {
                console.log(`  ⚠️ No specular map for ${planetName} (optional)`);
            }
        }

        console.log(`✅ Planet textures loaded for ${planetName}`);
        return textures;

    } catch (error) {
        console.error(`❌ Failed to load textures for ${planetName}:`, error);
        return null;
    }
}

/**
 * Load Saturn ring texture
 * @returns {Promise<THREE.Texture>} Ring texture with transparency
 */
export async function loadSaturnRingTexture() {
    try {
        const texture = await loadTexture('assets/textures/planets/saturn_ring.png', {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            anisotropy: 4
        });
        return texture;
    } catch (error) {
        console.error('❌ Failed to load Saturn ring texture:', error);
        return null;
    }
}

/**
 * Clear texture cache (for memory management)
 */
export function clearTextureCache() {
    textureCache.forEach(texture => {
        texture.dispose();
    });
    textureCache.clear();
    console.log('🧹 Texture cache cleared');
}

/**
 * Get texture cache stats
 * @returns {Object} Cache statistics
 */
export function getTextureCacheStats() {
    return {
        count: textureCache.size,
        urls: Array.from(textureCache.keys())
    };
}

export default {
    setTextureLoadingManager,
    loadTexture,
    loadPlanetTextures,
    loadSaturnRingTexture,
    clearTextureCache,
    getTextureCacheStats
};
