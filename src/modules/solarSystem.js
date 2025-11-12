/**
 * Solar System Orchestrator Module
 * Manages all celestial objects (Sun, Planets, Moon, ISS, Orbits, Starfield, Labels)
 * Provides unified interface for initialization, updates, and disposal
 */

import { initSun, updateSun, disposeSun, getSun } from './sun.js';
import { initPlanets, updatePlanets, getPlanetPosition, disposePlanets, getPlanet } from './planets.js';
import { initMoon, updateMoon, disposeMoon, getMoon } from './moon.js';
import { initISS, updateISS, disposeISS, getISSMesh, registerUICallback } from './iss.js';
import { initOrbits, updateOrbits, disposeOrbits } from './orbits.js';
import { initStarfield, updateStarfield, disposeStarfield } from './starfield.js';
import { initLabels, registerObject, updateLabels, disposeLabels } from './labels.js';
import { clearGeometryCache } from '../utils/geometryCache.js';
import { getCurrentStyle } from './styles.js';

/**
 * Solar system state
 */
const solarSystemState = {
    sun: null,
    planets: null,
    moon: null,
    iss: null,
    orbits: null,
    starfield: null,
    labels: null,
    camera: null,
    renderer: null,
    isInitialized: false
};

/**
 * Initialize the entire solar system with all celestial objects
 * @param {Object} config - Configuration object
 * @param {THREE.Camera} config.camera - Camera reference for labels
 * @param {THREE.WebGLRenderer} config.renderer - Renderer reference for labels
 * @param {Object} config.styleConfig - Visual style configuration (optional, uses current style if not provided)
 * @returns {Object} Solar system state
 */
export function initSolarSystem(config) {
    console.log('🌌 Initializing Solar System...');

    const { camera, renderer, styleConfig = null } = config;

    // Store camera and renderer references
    solarSystemState.camera = camera;
    solarSystemState.renderer = renderer;

    // Get current style or use provided one
    const currentStyle = styleConfig || getCurrentStyle();

    // Initialize starfield background (first, as it's the backdrop)
    solarSystemState.starfield = initStarfield(currentStyle);
    console.log('  ✓ Starfield initialized');

    // Initialize the sun
    solarSystemState.sun = initSun(currentStyle);
    console.log('  ✓ Sun initialized');

    // Initialize planets (Mercury, Venus, Earth, Mars)
    solarSystemState.planets = initPlanets(currentStyle);
    console.log('  ✓ Planets initialized');

    // Initialize orbital paths
    solarSystemState.orbits = initOrbits(currentStyle);
    console.log('  ✓ Orbits initialized');

    // Initialize the moon
    solarSystemState.moon = initMoon(currentStyle);
    console.log('  ✓ Moon initialized');

    // Initialize the ISS
    solarSystemState.iss = initISS(currentStyle);
    console.log('  ✓ ISS initialized');

    // Initialize labels system (after all objects are created)
    solarSystemState.labels = initLabels(camera, renderer);
    console.log('  ✓ Labels initialized');

    // Register all objects with labels system
    registerAllObjects();

    solarSystemState.isInitialized = true;
    console.log('✅ Solar System fully initialized');

    return solarSystemState;
}

/**
 * Register all celestial objects with the labels system
 */
function registerAllObjects() {
    registerObject('sun', getSun());
    registerObject('mercury', getPlanet('mercury'));
    registerObject('venus', getPlanet('venus'));
    registerObject('earth', getPlanet('earth'));
    registerObject('mars', getPlanet('mars'));
    registerObject('moon', getMoon());
    registerObject('iss', getISSMesh());
}

/**
 * Update all celestial objects (called every frame)
 * @param {number} deltaTime - Time since last frame in seconds
 * @param {number} simulationTime - Current simulation time in milliseconds
 */
export function updateSolarSystem(deltaTime, simulationTime) {
    if (!solarSystemState.isInitialized) return;

    // Update sun animation
    if (solarSystemState.sun) {
        updateSun(deltaTime, simulationTime);
    }

    // Update planets animation
    if (solarSystemState.planets) {
        updatePlanets(deltaTime, simulationTime);
    }

    // Update orbital paths (static, but included for consistency)
    if (solarSystemState.orbits) {
        updateOrbits(deltaTime, simulationTime);
    }

    // Update moon animation (needs Earth's position)
    if (solarSystemState.moon) {
        const earthPosition = getPlanetPosition('earth');
        if (earthPosition) {
            updateMoon(deltaTime, simulationTime, earthPosition);
        }
    }

    // Update ISS animation (needs Earth's position)
    if (solarSystemState.iss) {
        const earthPosition = getPlanetPosition('earth');
        if (earthPosition) {
            updateISS(deltaTime, simulationTime, earthPosition);
        }
    }

    // Update labels positions (project 3D to 2D screen coordinates)
    if (solarSystemState.labels) {
        updateLabels();
    }
}

/**
 * Dispose all celestial objects (cleanup)
 */
export function disposeSolarSystem() {
    console.log('🧹 Disposing Solar System...');

    if (solarSystemState.labels) {
        disposeLabels();
        solarSystemState.labels = null;
    }

    if (solarSystemState.starfield) {
        disposeStarfield();
        solarSystemState.starfield = null;
    }

    if (solarSystemState.iss) {
        disposeISS();
        solarSystemState.iss = null;
    }

    if (solarSystemState.moon) {
        disposeMoon();
        solarSystemState.moon = null;
    }

    if (solarSystemState.orbits) {
        disposeOrbits();
        solarSystemState.orbits = null;
    }

    if (solarSystemState.planets) {
        disposePlanets();
        solarSystemState.planets = null;
    }

    if (solarSystemState.sun) {
        disposeSun();
        solarSystemState.sun = null;
    }

    solarSystemState.isInitialized = false;
    console.log('✅ Solar System disposed');
}

/**
 * Recreate all celestial objects with new settings (style or performance)
 * @param {Object} styleConfig - Optional style configuration (uses current style if not provided)
 */
export function recreateSolarSystem(styleConfig = null) {
    console.log('🔄 Recreating Solar System with new settings...');

    // Dispose existing objects
    disposeSolarSystem();

    // Clear geometry cache to force recreation
    clearGeometryCache();

    // Get current style if not provided
    const currentStyle = styleConfig || getCurrentStyle();

    // Recreate with current style
    if (solarSystemState.camera && solarSystemState.renderer) {
        initSolarSystem({
            camera: solarSystemState.camera,
            renderer: solarSystemState.renderer,
            styleConfig: currentStyle
        });
    } else {
        console.error('❌ Cannot recreate solar system: camera or renderer not set');
    }

    console.log('✅ Solar System recreated');
}

/**
 * Get a specific celestial object
 * @param {string} name - Object name (sun, mercury, venus, earth, mars, moon, iss)
 * @returns {THREE.Mesh|null} The requested object or null
 */
export function getCelestialObject(name) {
    switch (name.toLowerCase()) {
        case 'sun':
            return getSun();
        case 'mercury':
        case 'venus':
        case 'earth':
        case 'mars':
            return getPlanet(name.toLowerCase());
        case 'moon':
            return getMoon();
        case 'iss':
            return getISSMesh();
        default:
            console.warn(`Unknown celestial object: ${name}`);
            return null;
    }
}

/**
 * Get all planet objects
 * @returns {Object} Object with planet names as keys and meshes as values
 */
export function getAllPlanets() {
    return {
        mercury: getPlanet('mercury'),
        venus: getPlanet('venus'),
        earth: getPlanet('earth'),
        mars: getPlanet('mars')
    };
}

/**
 * Get Earth's position (commonly needed by Moon and ISS)
 * @returns {Object|null} Earth position {x, y, z} or null
 */
export function getEarthPosition() {
    return getPlanetPosition('earth');
}

/**
 * Register UI callback for ISS data updates
 * @param {Function} callback - Callback function to receive ISS data
 */
export function registerISSCallback(callback) {
    registerUICallback(callback);
}

/**
 * Get solar system state (for debugging)
 * @returns {Object} Current solar system state
 */
export function getSolarSystemState() {
    return {
        isInitialized: solarSystemState.isInitialized,
        hasSun: !!solarSystemState.sun,
        hasPlanets: !!solarSystemState.planets,
        hasMoon: !!solarSystemState.moon,
        hasISS: !!solarSystemState.iss,
        hasOrbits: !!solarSystemState.orbits,
        hasStarfield: !!solarSystemState.starfield,
        hasLabels: !!solarSystemState.labels
    };
}

// Export default object with all functions
export default {
    initSolarSystem,
    updateSolarSystem,
    disposeSolarSystem,
    recreateSolarSystem,
    getCelestialObject,
    getAllPlanets,
    getEarthPosition,
    registerISSCallback,
    registerAllObjects,
    getSolarSystemState
};
