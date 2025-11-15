/**
 * Solar System Orchestrator Module
 * Manages all celestial objects (Sun, Planets, Moon, ISS, Orbits, Starfield, Labels)
 * Provides unified interface for initialization, updates, and disposal
 */

import { initSun, updateSun, disposeSun, getSun, initSunLensFlare } from './sun.js';
import { initPlanets, updatePlanets, getPlanetPosition, disposePlanets, getPlanet } from './planets.js';
import { initMoon, updateMoon, disposeMoon, getMoon } from './moon.js';
import { initMajorMoons, updateMajorMoons, disposeMajorMoons, getMoonMesh } from './moons.js';
import { initAsteroidBelt, updateAsteroidBelt, disposeAsteroidBelt, setAsteroidBeltVisible, isAsteroidBeltVisible } from './asteroidBelt.js';
import { initISS, updateISS, disposeISS, getISSMesh, registerUICallback, updateModuleLabels, setModuleLabelsEnabled } from './iss.js';
import { initOrbits, updateOrbits, disposeOrbits, initMoonOrbit, updateMoonOrbit, initMajorMoonOrbits, updateMajorMoonOrbits, disposeMajorMoonOrbits } from './orbits.js';
import { initStarfield, updateStarfield, disposeStarfield } from './starfield.js';
import { initLabels, registerObject, registerObjectGetter, updateLabels, disposeLabels } from './labels.js';
import { initShootingStars, updateShootingStars, disposeShootingStars } from './shootingStars.js';
import { initOrbitalMarkers, setOrbitalMarkersVisible, areOrbitalMarkersVisible, disposeOrbitalMarkers } from './orbitalMarkers.js';
import { clearGeometryCache } from '../utils/geometryCache.js';
import { getCurrentStyle } from './styles.js';
import { timeManager } from '../utils/time.js';
import { getPlanetSizeMode } from '../utils/constants.js';

/**
 * Solar system state
 */
const solarSystemState = {
    sun: null,
    planets: null,
    moon: null,
    majorMoons: null,
    asteroidBelt: null,
    iss: null,
    orbits: null,
    orbitalMarkers: null,
    starfield: null,
    labels: null,
    camera: null,
    renderer: null,
    isInitialized: false,
    moonOrbitInitialized: false
};

/**
 * Initialize the entire solar system with all celestial objects (ASYNC for 3D models)
 * @param {Object} config - Configuration object
 * @param {THREE.Camera} config.camera - Camera reference for labels
 * @param {THREE.WebGLRenderer} config.renderer - Renderer reference for labels
 * @param {Object} config.styleConfig - Visual style configuration (optional, uses current style if not provided)
 * @returns {Promise<Object>} Solar system state
 */
export async function initSolarSystem(config) {
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

    // Initialize shooting stars (occasional meteors)
    initShootingStars(currentStyle);
    console.log('  ✓ Shooting stars initialized');

    // Initialize the sun
    solarSystemState.sun = initSun(currentStyle);
    console.log('  ✓ Sun initialized');

    // Initialize lens flare for sun (needs camera and renderer)
    if (camera && renderer) {
        initSunLensFlare(camera, renderer);
        console.log('  ✓ Lens flare initialized');
    }

    // Initialize planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)
    solarSystemState.planets = await initPlanets(currentStyle);
    console.log('  ✓ Planets initialized');

    // Initialize major moons (Jupiter & Saturn moons - needs planet meshes)
    solarSystemState.majorMoons = await initMajorMoons(currentStyle, solarSystemState.planets);
    console.log('  ✓ Major Moons initialized (Io, Europa, Ganymede, Callisto + Titan, Rhea, Iapetus)');

    // Initialize asteroid belt (between Mars and Jupiter)
    solarSystemState.asteroidBelt = initAsteroidBelt(currentStyle);
    console.log('  ✓ Asteroid Belt initialized (15,000 asteroids between Mars and Jupiter)');

    // Initialize orbital paths
    solarSystemState.orbits = initOrbits(currentStyle);
    console.log('  ✓ Orbits initialized');

    // Initialize orbital markers (perihelion/aphelion)
    solarSystemState.orbitalMarkers = initOrbitalMarkers(currentStyle);
    console.log('  ✓ Orbital markers initialized (perihelion/aphelion points)');

    // Initialize the moon
    solarSystemState.moon = initMoon(currentStyle);
    console.log('  ✓ Moon initialized');

    // Initialize the ISS (ASYNC - loads 3D model)
    solarSystemState.iss = await initISS(currentStyle);
    console.log('  ✓ ISS initialized (3D model loaded)');

    // Initialize labels system (after all objects are created)
    solarSystemState.labels = initLabels(camera, renderer);
    console.log('  ✓ Labels initialized');

    // Register object getter with labels system (ROBUST: labels will never break!)
    // Labels will dynamically fetch objects each frame, so they work even if objects are recreated
    registerObjectGetter(getCelestialObject);
    console.log('  ✓ Labels configured with dynamic object fetching');

    solarSystemState.isInitialized = true;
    console.log('✅ Solar System fully initialized');

    return solarSystemState;
}

/**
 * DEPRECATED: No longer needed with new robust label system
 * Kept for backwards compatibility
 */
function registerAllObjects() {
    // No longer needed - labels now use getCelestialObject dynamically
}

/**
 * Update all celestial objects (called every frame)
 * @param {number} deltaTime - Time since last frame in seconds
 * @param {number} simulationTime - Current simulation time in milliseconds
 */
export function updateSolarSystem(deltaTime, simulationTime) {
    if (!solarSystemState.isInitialized) return;

    // Get current time speed for scaling animations
    const timeSpeed = timeManager.getTimeSpeed();

    // Update starfield to follow camera (skybox effect)
    if (solarSystemState.starfield && solarSystemState.camera) {
        updateStarfield(deltaTime, simulationTime, solarSystemState.camera);
    }

    // Update sun animation
    if (solarSystemState.sun) {
        updateSun(deltaTime, simulationTime);
    }

    // Update shooting stars (spawn and animate meteors, scaled with time speed)
    updateShootingStars(deltaTime, timeSpeed);

    // Update planets animation
    if (solarSystemState.planets) {
        updatePlanets(deltaTime, simulationTime);
    }

    // Update major moons animation (Jupiter & Saturn moons)
    if (solarSystemState.majorMoons) {
        updateMajorMoons(deltaTime, simulationTime);
    }

    // Update asteroid belt orbital motion
    if (solarSystemState.asteroidBelt) {
        updateAsteroidBelt(deltaTime, simulationTime);
    }

    // Update orbital paths (static, but included for consistency)
    if (solarSystemState.orbits) {
        updateOrbits(deltaTime, simulationTime);
    }

    // Update moon animation (needs Earth's position)
    if (solarSystemState.moon) {
        const earthPosition = getPlanetPosition('earth');
        if (earthPosition) {
            // Initialize Moon orbit on first frame if not done yet (ensures Earth is positioned correctly)
            if (!solarSystemState.moonOrbitInitialized) {
                const planetSizeMode = getPlanetSizeMode();
                const styleConfig = getCurrentStyle();
                console.log(`🚨 CREATING MOON ORBIT - Mode: ${planetSizeMode}`);
                initMoonOrbit(styleConfig, earthPosition, planetSizeMode);

                // Also initialize major moon orbits (Jupiter & Saturn moons)
                initMajorMoonOrbits(styleConfig, solarSystemState.planets);

                solarSystemState.moonOrbitInitialized = true;
                console.log('  ✓ Moon orbit initialized on first frame at Earth position');
            }

            updateMoon(deltaTime, simulationTime, earthPosition);
            // Also update Moon's orbit position to follow Earth
            updateMoonOrbit(earthPosition);
        }
    }

    // Update major moon orbits to follow parent planets
    if (solarSystemState.majorMoons && solarSystemState.planets) {
        updateMajorMoonOrbits(solarSystemState.planets);
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

    // Update ISS module labels positions
    if (solarSystemState.iss && solarSystemState.camera) {
        updateModuleLabels(solarSystemState.camera);
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

    // Dispose shooting stars
    disposeShootingStars();

    if (solarSystemState.iss) {
        disposeISS();
        solarSystemState.iss = null;
    }

    if (solarSystemState.moon) {
        disposeMoon();
        solarSystemState.moon = null;
    }

    if (solarSystemState.majorMoons) {
        disposeMajorMoons();
        solarSystemState.majorMoons = null;
    }

    if (solarSystemState.asteroidBelt) {
        disposeAsteroidBelt();
        solarSystemState.asteroidBelt = null;
    }

    if (solarSystemState.orbits) {
        disposeOrbits();
        solarSystemState.orbits = null;
    }

    // TEMPORARY: Commented out to debug
    // if (solarSystemState.orbitalMarkers) {
    //     disposeOrbitalMarkers();
    //     solarSystemState.orbitalMarkers = null;
    // }

    if (solarSystemState.planets) {
        disposePlanets();
        solarSystemState.planets = null;
    }

    if (solarSystemState.sun) {
        disposeSun();
        solarSystemState.sun = null;
    }

    solarSystemState.isInitialized = false;
    solarSystemState.moonOrbitInitialized = false;
    console.log('✅ Solar System disposed');
}

/**
 * Recreate all celestial objects with new settings (style or performance) - ASYNC
 * @param {Object} styleConfig - Optional style configuration (uses current style if not provided)
 * @returns {Promise<void>}
 */
export async function recreateSolarSystem(styleConfig = null) {
    console.log('🔄 Recreating Solar System with new settings...');

    // Dispose existing objects
    disposeSolarSystem();

    // Clear geometry cache to force recreation
    clearGeometryCache();

    // Get current style if not provided
    const currentStyle = styleConfig || getCurrentStyle();

    // Recreate with current style (ASYNC - waits for ISS model)
    if (solarSystemState.camera && solarSystemState.renderer) {
        await initSolarSystem({
            camera: solarSystemState.camera,
            renderer: solarSystemState.renderer,
            styleConfig: currentStyle
        });

        // Re-register all objects as clickable (needed after recreation)
        // Use dynamic import to avoid circular dependency
        import('./ui.js').then(({ reregisterAllClickableObjects }) => {
            reregisterAllClickableObjects();
        });
    } else {
        console.error('❌ Cannot recreate solar system: camera or renderer not set');
    }

    console.log('✅ Solar System recreated');
}

/**
 * Get a specific celestial object
 * @param {string} name - Object name (sun, planets, moon, major moons, iss)
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
        case 'jupiter':
        case 'saturn':
        case 'uranus':
        case 'neptune':
            return getPlanet(name.toLowerCase());
        case 'moon':
            return getMoon();
        case 'io':
        case 'europa':
        case 'ganymede':
        case 'callisto':
        case 'titan':
        case 'rhea':
        case 'iapetus':
            return getMoonMesh(name.toLowerCase());
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
        mars: getPlanet('mars'),
        jupiter: getPlanet('jupiter'),
        saturn: getPlanet('saturn'),
        uranus: getPlanet('uranus'),
        neptune: getPlanet('neptune')
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
 * Toggle ISS module labels visibility
 * @param {boolean} enabled - Whether module labels should be visible
 */
export function toggleISSModuleLabels(enabled) {
    setModuleLabelsEnabled(enabled);
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
        hasMajorMoons: !!solarSystemState.majorMoons,
        hasAsteroidBelt: !!solarSystemState.asteroidBelt,
        hasISS: !!solarSystemState.iss,
        hasOrbits: !!solarSystemState.orbits,
        hasStarfield: !!solarSystemState.starfield,
        hasLabels: !!solarSystemState.labels
    };
}

/**
 * Toggle asteroid belt visibility
 * @param {boolean} visible - Whether belt should be visible
 */
export function toggleAsteroidBelt(visible) {
    setAsteroidBeltVisible(visible);
}

/**
 * Toggle orbital markers (perihelion/aphelion) visibility
 * @param {boolean} visible - Whether markers should be visible
 */
export function toggleOrbitalMarkers(visible) {
    // TEMPORARY: Commented out to debug
    // setOrbitalMarkersVisible(visible);
    console.log('Orbital markers temporarily disabled for debugging');
}

/**
 * Get orbital markers visibility state
 * @returns {boolean}
 */
export function getOrbitalMarkersVisible() {
    // TEMPORARY: Commented out to debug
    // return areOrbitalMarkersVisible();
    return false;
}

/**
 * Get asteroid belt visibility state
 * @returns {boolean} Whether belt is visible
 */
export function getAsteroidBeltVisibility() {
    return isAsteroidBeltVisible();
}

/**
 * Reset Moon orbit initialization (used when planet size mode changes)
 * This will cause the Moon orbit to be recreated on the next update frame
 */
export function resetMoonOrbitInitialization() {
    solarSystemState.moonOrbitInitialized = false;
    // Dispose major moon orbits so they get recreated with correct scale
    disposeMajorMoonOrbits();
    // Don't call dispose on Moon orbit - just reset flag
    console.log('🔄 Moon orbits (Earth + major moons) will be recreated with new size mode');
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
    getSolarSystemState,
    toggleAsteroidBelt,
    getAsteroidBeltVisibility,
    resetMoonOrbitInitialization
};
