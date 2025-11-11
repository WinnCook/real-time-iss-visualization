/**
 * Scene Module - Three.js Scene Initialization
 * Sets up the 3D scene with lighting and background
 */

import { COLORS, RENDER } from '../utils/constants.js';

/**
 * The main Three.js scene
 * @type {THREE.Scene}
 */
export let scene;

/**
 * Initialize the Three.js scene with lights and background
 * @returns {THREE.Scene} The initialized scene
 */
export function initScene() {
    // Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.BACKGROUND);

    // Add fog for depth perception (optional, can be disabled for performance)
    // scene.fog = new THREE.FogExp2(COLORS.BACKGROUND, 0.0008);

    // Add ambient light (soft global illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    ambientLight.name = 'AmbientLight';
    scene.add(ambientLight);

    // Add directional light (simulates sunlight from the sun's position)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(0, 0, 0); // At sun's position (origin)
    sunLight.name = 'SunLight';

    // Configure shadows if enabled
    if (RENDER.ENABLE_SHADOWS) {
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
    }

    scene.add(sunLight);

    // Add point light at sun for better glow effect
    const sunPointLight = new THREE.PointLight(0xfdb813, 2, 500);
    sunPointLight.position.set(0, 0, 0);
    sunPointLight.name = 'SunPointLight';
    scene.add(sunPointLight);

    console.log('✅ Scene initialized');
    return scene;
}

/**
 * Update scene background color
 * @param {number} color - Hex color value (e.g., 0x000000)
 */
export function setSceneBackground(color) {
    if (scene) {
        scene.background = new THREE.Color(color);
    }
}

/**
 * Add an object to the scene
 * @param {THREE.Object3D} object - Object to add
 */
export function addToScene(object) {
    if (scene && object) {
        scene.add(object);
    }
}

/**
 * Remove an object from the scene
 * @param {THREE.Object3D} object - Object to remove
 */
export function removeFromScene(object) {
    if (scene && object) {
        scene.remove(object);
    }
}

/**
 * Get an object from the scene by name
 * @param {string} name - Name of the object
 * @returns {THREE.Object3D|undefined}
 */
export function getSceneObject(name) {
    if (scene) {
        return scene.getObjectByName(name);
    }
    return undefined;
}

/**
 * Clear all objects from the scene (except lights and camera)
 */
export function clearScene() {
    if (scene) {
        const objectsToRemove = [];
        scene.traverse((object) => {
            if (object.type === 'Mesh' || object.type === 'Line' || object.type === 'Points') {
                objectsToRemove.push(object);
            }
        });

        objectsToRemove.forEach(obj => {
            scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
    }
}

/**
 * Update scene lights based on visual style
 * @param {Object} styleConfig - Style configuration object
 */
export function updateSceneLights(styleConfig) {
    if (!scene) return;

    const ambientLight = scene.getObjectByName('AmbientLight');
    const sunLight = scene.getObjectByName('SunLight');

    if (ambientLight && sunLight) {
        // Adjust lighting based on style
        if (styleConfig.name === 'Neon/Cyberpunk') {
            ambientLight.intensity = 0.1;
            sunLight.intensity = 0.5;
        } else if (styleConfig.name === 'Minimalist/Abstract') {
            ambientLight.intensity = 0.8;
            sunLight.intensity = 0.8;
        } else {
            ambientLight.intensity = 0.3;
            sunLight.intensity = 1.5;
        }
    }
}

// Export scene as default
export default {
    scene,
    initScene,
    setSceneBackground,
    addToScene,
    removeFromScene,
    getSceneObject,
    clearScene,
    updateSceneLights
};
