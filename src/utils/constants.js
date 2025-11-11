/**
 * Constants - Physical and astronomical constants
 * All units and scaling factors for the visualization
 */

// ========== ASTRONOMICAL CONSTANTS ==========

export const ASTRONOMICAL_UNIT = 149597870.7; // km - Distance from Earth to Sun
export const EARTH_RADIUS = 6371; // km
export const SUN_RADIUS = 695700; // km
export const MOON_RADIUS = 1737.4; // km

// ISS Orbital Parameters
export const ISS_ORBIT_ALTITUDE = 408; // km (average altitude above Earth)
export const ISS_ORBITAL_SPEED = 27600; // km/h (approximate)
export const ISS_ORBITAL_PERIOD = 92.68; // minutes per orbit

// ========== PLANETARY DATA ==========
// Orbital distances in AU, radii in km, periods in Earth days

export const PLANETS = {
    mercury: {
        name: "Mercury",
        color: 0xaaaaaa, // Light gray (visible against dark space)
        radius: 2439.7, // km
        orbitRadius: 0.387, // AU
        orbitPeriod: 87.97, // days
        rotationPeriod: 58.6, // days
        tilt: 0.034 // degrees
    },
    venus: {
        name: "Venus",
        color: 0xffc649,
        radius: 6051.8, // km
        orbitRadius: 0.723, // AU
        orbitPeriod: 224.70, // days
        rotationPeriod: -243, // days (retrograde)
        tilt: 177.4 // degrees
    },
    earth: {
        name: "Earth",
        color: 0x4a90e2,
        radius: 6371, // km
        orbitRadius: 1.0, // AU (by definition)
        orbitPeriod: 365.25, // days
        rotationPeriod: 1, // days
        tilt: 23.44 // degrees
    },
    mars: {
        name: "Mars",
        color: 0xdc4d3a,
        radius: 3389.5, // km
        orbitRadius: 1.524, // AU
        orbitPeriod: 686.98, // days
        rotationPeriod: 1.026, // days
        tilt: 25.19 // degrees
    }
};

export const MOON = {
    name: "Moon",
    color: 0xaaaaaa,
    radius: 1737.4, // km
    orbitRadius: 384400, // km from Earth
    orbitPeriod: 27.32, // days
    rotationPeriod: 27.32 // days (tidally locked)
};

// ========== SCENE SCALING ==========
// These factors make objects visible while maintaining relative proportions

export const SCALE = {
    // Scene units per AU (makes solar system fit in view)
    AU_TO_SCENE: 500, // Optimal spacing: Mercury orbit at 193 units

    // Planet size multipliers (for visibility)
    PLANET_SIZE: 1500, // Balanced planet visibility
    MOON_SIZE: 1000,
    SUN_SIZE: 40, // Best compromise: Sun radius = 93 units, Mercury = 193 units (2.07x ratio - looks great!)
    ISS_SIZE: 50000, // Very large so it's visible as a dot

    // Orbit line thickness
    ORBIT_LINE_WIDTH: 2
};

// ========== RENDERING SETTINGS ==========

export const RENDER = {
    // Camera
    FOV: 45, // Field of view in degrees
    NEAR: 0.1, // Near clipping plane
    FAR: 10000, // Far clipping plane
    DEFAULT_CAMERA_POSITION: { x: 0, y: 500, z: 1200 }, // Camera position for optimal view of balanced system

    // Performance
    TARGET_FPS: 60,
    ANTI_ALIASING: true,
    PIXEL_RATIO: Math.min(window.devicePixelRatio, 2), // Cap at 2x for performance

    // Geometry detail
    SPHERE_SEGMENTS: 32, // Segments for sphere geometry (lower = better performance)
    ORBIT_SEGMENTS: 128, // Segments for orbital paths

    // Effects
    ENABLE_SHADOWS: false, // Shadows are expensive
    ENABLE_BLOOM: true, // Glow effects
    ENABLE_PARTICLES: true // Particle systems
};

// ========== SIMULATION SETTINGS ==========

export const SIMULATION = {
    DEFAULT_TIME_SPEED: 100000, // 100,000x real-time (very fast orbits for testing)
    MIN_TIME_SPEED: 1,
    MAX_TIME_SPEED: 500000,
    PAUSED_SPEED: 0
};

// ========== API SETTINGS ==========

export const API = {
    ISS_URL: 'http://api.open-notify.org/iss-now.json',
    UPDATE_INTERVAL: 5000, // milliseconds (5 seconds)
    TIMEOUT: 10000, // Request timeout
    RETRY_DELAY: 10000 // Delay before retry on error
};

// ========== COLORS ==========

export const COLORS = {
    SUN: 0xfdb813,
    BACKGROUND: 0x000000,
    ORBIT_LINE: 0x555555,
    ISS_COLOR: 0xff6b6b,
    ISS_TRAIL: 0xff3838,
    LABEL_COLOR: '#ffffff',
    GRID_COLOR: 0x333333
};

// ========== VISUAL STYLES ==========

export const STYLES = {
    realistic: {
        name: "Realistic",
        background: 0x000510,
        sunGlow: true,
        planetTextures: true,
        starfield: true,
        atmosphereGlow: true,
        orbitOpacity: 0.3
    },
    cartoon: {
        name: "Stylized/Cartoon",
        background: 0x87ceeb,
        sunGlow: true,
        planetTextures: false,
        starfield: false,
        atmosphereGlow: false,
        orbitOpacity: 0.6,
        flatShading: true
    },
    neon: {
        name: "Neon/Cyberpunk",
        background: 0x000000,
        sunGlow: true,
        planetTextures: false,
        starfield: false,
        atmosphereGlow: true,
        orbitOpacity: 1.0,
        glowIntensity: 2.0,
        trailsEnabled: true
    },
    minimalist: {
        name: "Minimalist/Abstract",
        background: 0xf5f5f5,
        sunGlow: false,
        planetTextures: false,
        starfield: false,
        atmosphereGlow: false,
        orbitOpacity: 0.4,
        wireframe: false
    }
};

// ========== MATH HELPERS ==========

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;
export const TWO_PI = Math.PI * 2;

// ========== CONVERSION HELPERS ==========

/**
 * Convert days to milliseconds
 */
export function daysToMs(days) {
    return days * 24 * 60 * 60 * 1000;
}

/**
 * Convert AU to scene units
 */
export function auToScene(au) {
    return au * SCALE.AU_TO_SCENE;
}

/**
 * Convert km to scene units (for local scales like Earth-Moon)
 */
export function kmToScene(km) {
    return (km / ASTRONOMICAL_UNIT) * SCALE.AU_TO_SCENE;
}

/**
 * Scale radius for visibility
 */
export function scaleRadius(radiusKm, type = 'planet') {
    const scale = type === 'sun' ? SCALE.SUN_SIZE :
                  type === 'moon' ? SCALE.MOON_SIZE :
                  type === 'iss' ? SCALE.ISS_SIZE :
                  SCALE.PLANET_SIZE;

    return kmToScene(radiusKm * scale);
}

// Export all as default for convenience
export default {
    ASTRONOMICAL_UNIT,
    EARTH_RADIUS,
    SUN_RADIUS,
    MOON_RADIUS,
    ISS_ORBIT_ALTITUDE,
    ISS_ORBITAL_SPEED,
    ISS_ORBITAL_PERIOD,
    PLANETS,
    MOON,
    SCALE,
    RENDER,
    SIMULATION,
    API,
    COLORS,
    STYLES,
    DEG_TO_RAD,
    RAD_TO_DEG,
    TWO_PI,
    daysToMs,
    auToScene,
    kmToScene,
    scaleRadius
};
