/**
 * Atmosphere Module - Atmospheric glow effects for planets
 * Implements Fresnel-based rim lighting for realistic atmospheric halos
 */

import { PLANETS, scaleRadius } from '../utils/constants.js';
import { addToScene, removeFromScene, getScene } from '../core/scene.js';
import { getCurrentStyleKey } from './styles.js';

/**
 * Atmosphere configurations for each visual style
 * @type {Object}
 */
const STYLE_CONFIGS = {
    realistic: {
        earth: {
            color: [0.3, 0.6, 1.0], // Blue atmosphere
            intensity: 1.0,
            falloff: 3.0,
            scale: 1.03 // Slightly larger than planet
        },
        venus: {
            color: [0.9, 0.8, 0.5], // Yellow-orange atmosphere
            intensity: 0.8,
            falloff: 2.5,
            scale: 1.025
        },
        mars: {
            color: [0.8, 0.5, 0.3], // Dusty red atmosphere
            intensity: 0.3,
            falloff: 4.0,
            scale: 1.02
        }
    },
    cartoon: {
        earth: {
            color: [0.2, 0.6, 1.0],
            intensity: 0.6,
            falloff: 2.0,
            scale: 1.04
        },
        venus: {
            color: [1.0, 0.9, 0.3],
            intensity: 0.5,
            falloff: 2.0,
            scale: 1.03
        },
        mars: {
            color: [1.0, 0.3, 0.2],
            intensity: 0.3,
            falloff: 2.0,
            scale: 1.025
        }
    },
    neon: {
        earth: {
            color: [0.2, 0.8, 1.0],
            intensity: 1.5,
            falloff: 2.5,
            scale: 1.05
        },
        venus: {
            color: [1.0, 1.0, 0.0],
            intensity: 1.2,
            falloff: 2.0,
            scale: 1.04
        },
        mars: {
            color: [1.0, 0.2, 0.5],
            intensity: 0.8,
            falloff: 2.5,
            scale: 1.03
        }
    },
    minimalist: {
        earth: {
            color: [0.5, 0.7, 1.0],
            intensity: 0.3,
            falloff: 5.0,
            scale: 1.02
        },
        venus: {
            color: [0.8, 0.8, 0.6],
            intensity: 0.2,
            falloff: 4.0,
            scale: 1.015
        },
        mars: {
            color: [0.8, 0.6, 0.5],
            intensity: 0.15,
            falloff: 5.0,
            scale: 1.01
        }
    }
};

/**
 * Vertex shader for atmospheric glow
 * @type {string}
 */
const ATMOSPHERE_VERTEX_SHADER = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
    }
`;

/**
 * Fragment shader for atmospheric glow with Fresnel effect
 * @type {string}
 */
const ATMOSPHERE_FRAGMENT_SHADER = `
    uniform vec3 glowColor;
    uniform float intensity;
    uniform float falloff;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), falloff);

        // Add subtle inner glow for depth
        float innerGlow = pow(abs(dot(vNormal, viewDir)), 3.0) * 0.3;
        fresnel = fresnel + innerGlow;

        gl_FragColor = vec4(glowColor, fresnel * intensity);
    }
`;

/**
 * Storage for atmosphere meshes
 * @type {Map<string, THREE.Mesh>}
 */
const atmospheres = new Map();

/**
 * Whether atmosphere effects are enabled
 * @type {boolean}
 */
let atmosphereEnabled = true;

/**
 * Three.js library reference (loaded dynamically)
 * @type {Object}
 */
let THREE = null;

/**
 * Initialize the atmosphere module
 * @param {Object} threeLib - Three.js library reference
 */
export function initAtmosphere(threeLib) {
    THREE = threeLib;
    console.log('🌍 Atmosphere module initialized');
}

/**
 * Create atmospheric glow for a planet
 * @param {string} planetName - Name of the planet
 * @param {THREE.Mesh} planetMesh - The planet mesh to add atmosphere to
 * @returns {THREE.Mesh|null} The atmosphere mesh or null if not applicable
 */
export function createAtmosphere(planetName, planetMesh) {
    if (!THREE || !atmosphereEnabled) return null;

    const currentStyle = getCurrentStyleKey();
    const styleConfig = STYLE_CONFIGS[currentStyle];

    // Check if this planet has atmosphere in current style
    if (!styleConfig || !styleConfig[planetName]) {
        return null;
    }

    const config = styleConfig[planetName];
    const planetData = PLANETS[planetName];
    if (!planetData) return null;

    // Create atmosphere geometry (slightly larger sphere)
    const atmosphereRadius = scaleRadius(planetData.radiusKm) * config.scale;
    const geometry = new THREE.SphereGeometry(atmosphereRadius, 32, 32);

    // Create shader material with Fresnel effect
    const material = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: new THREE.Color(...config.color) },
            intensity: { value: config.intensity },
            falloff: { value: config.falloff }
        },
        vertexShader: ATMOSPHERE_VERTEX_SHADER,
        fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    const atmosphereMesh = new THREE.Mesh(geometry, material);
    atmosphereMesh.name = `${planetName}_atmosphere`;

    // Store the atmosphere mesh
    atmospheres.set(planetName, atmosphereMesh);

    // Add to scene
    const scene = getScene();
    if (scene) {
        addToScene(atmosphereMesh);
    }

    return atmosphereMesh;
}

/**
 * Update atmosphere position to follow planet
 * @param {string} planetName - Name of the planet
 * @param {THREE.Vector3} position - New position for the atmosphere
 */
export function updateAtmospherePosition(planetName, position) {
    const atmosphere = atmospheres.get(planetName);
    if (atmosphere && position) {
        atmosphere.position.copy(position);
    }
}

/**
 * Update atmosphere style when visual style changes
 */
export function updateAtmosphereStyle() {
    const currentStyle = getCurrentStyleKey();
    const styleConfig = STYLE_CONFIGS[currentStyle];

    if (!styleConfig) return;

    atmospheres.forEach((mesh, planetName) => {
        const config = styleConfig[planetName];
        if (config && mesh.material.uniforms) {
            mesh.material.uniforms.glowColor.value = new THREE.Color(...config.color);
            mesh.material.uniforms.intensity.value = config.intensity;
            mesh.material.uniforms.falloff.value = config.falloff;
        }
    });
}

/**
 * Toggle atmosphere visibility
 * @param {boolean} visible - Whether atmospheres should be visible
 */
export function setAtmosphereVisible(visible) {
    atmosphereEnabled = visible;
    atmospheres.forEach(mesh => {
        mesh.visible = visible;
    });
}

/**
 * Check if atmosphere is enabled
 * @returns {boolean} Whether atmosphere effects are enabled
 */
export function isAtmosphereEnabled() {
    return atmosphereEnabled;
}

/**
 * Remove atmosphere for a specific planet
 * @param {string} planetName - Name of the planet
 */
export function removeAtmosphere(planetName) {
    const atmosphere = atmospheres.get(planetName);
    if (atmosphere) {
        removeFromScene(atmosphere);
        if (atmosphere.geometry) atmosphere.geometry.dispose();
        if (atmosphere.material) atmosphere.material.dispose();
        atmospheres.delete(planetName);
    }
}

/**
 * Dispose all atmosphere resources
 */
export function disposeAtmospheres() {
    atmospheres.forEach((mesh, planetName) => {
        removeAtmosphere(planetName);
    });
    atmospheres.clear();
    console.log('🌍 Atmosphere resources disposed');
}

/**
 * Get atmosphere mesh for a planet
 * @param {string} planetName - Name of the planet
 * @returns {THREE.Mesh|null} The atmosphere mesh or null
 */
export function getAtmosphere(planetName) {
    return atmospheres.get(planetName) || null;
}

/**
 * Check if a planet should have atmosphere in current style
 * @param {string} planetName - Name of the planet
 * @returns {boolean} Whether the planet should have atmosphere
 */
export function shouldHaveAtmosphere(planetName) {
    const currentStyle = getCurrentStyleKey();
    const styleConfig = STYLE_CONFIGS[currentStyle];
    return styleConfig && styleConfig[planetName] !== undefined;
}

/**
 * Get atmosphere configuration for a planet
 * @param {string} planetName - Name of the planet
 * @returns {Object|null} Atmosphere configuration or null
 */
export function getAtmosphereConfig(planetName) {
    const currentStyle = getCurrentStyleKey();
    const styleConfig = STYLE_CONFIGS[currentStyle];
    return styleConfig ? styleConfig[planetName] || null : null;
}