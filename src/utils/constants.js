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
    },
    jupiter: {
        name: "Jupiter",
        color: 0xc88b3a, // Orange-tan with bands
        radius: 69911, // km (largest planet)
        orbitRadius: 5.2, // AU
        orbitPeriod: 4333, // days (11.86 years)
        rotationPeriod: 0.41, // days (fastest rotation - 9.9 hours)
        tilt: 3.13 // degrees
    },
    saturn: {
        name: "Saturn",
        color: 0xead6b8, // Pale golden yellow
        radius: 58232, // km (second largest)
        orbitRadius: 9.54, // AU
        orbitPeriod: 10759, // days (29.46 years)
        rotationPeriod: 0.45, // days (10.7 hours)
        tilt: 26.73, // degrees
        // Ring system (unique to Saturn in our visualization)
        rings: {
            innerRadius: 74500, // km (inner edge of visible rings)
            outerRadius: 140220, // km (outer edge of A ring)
            thickness: 30, // km (very thin!)
            color: 0xc9b18f, // Dusty tan color
            opacity: 0.8
        }
    },
    uranus: {
        name: "Uranus",
        color: 0x4fd0e7, // Cyan/ice blue
        radius: 25362, // km
        orbitRadius: 19.19, // AU
        orbitPeriod: 30687, // days (84 years)
        rotationPeriod: -0.72, // days (17.2 hours, retrograde)
        tilt: 97.77 // degrees (extreme tilt - rotates on its side!)
    },
    neptune: {
        name: "Neptune",
        color: 0x4166f5, // Deep blue
        radius: 24622, // km
        orbitRadius: 30.07, // AU (farthest planet)
        orbitPeriod: 60190, // days (164.8 years)
        rotationPeriod: 0.67, // days (16.1 hours)
        tilt: 28.32 // degrees
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

    // Planet size multipliers (for visibility with realistic proportions)
    // Tiered scaling: smaller multiplier for larger planets to show size differences
    PLANET_SIZE_ROCKY: 1500,      // Rocky planets (Mercury, Venus, Earth, Mars) - keep visible
    PLANET_SIZE_GAS_GIANT: 250,   // Gas giants (Jupiter, Saturn) - scaled down so they don't dominate
    PLANET_SIZE_ICE_GIANT: 450,   // Ice giants (Uranus, Neptune) - medium scaling
    PLANET_SIZE: 1500,             // Legacy - still used by scaleRadius for backward compatibility
    MOON_SIZE: 1000,
    SUN_SIZE: 60, // Increased from 40 for better prominence
    ISS_SIZE: 30000, // Reduced from 50000 - large enough to be visible but not overwhelming

    // Moon orbit scaling (needed because planets are scaled up 1500x but Moon orbit uses real km distance)
    // This ensures Moon is visible outside Earth's scaled-up surface
    MOON_ORBIT_SCALE: 50, // Makes Moon orbit ~64 units (vs Earth radius of ~32 units)

    // Orbit line thickness
    ORBIT_LINE_WIDTH: 2,

    // Planet size categories for realistic proportional scaling
    PLANET_CATEGORIES: {
        mercury: 'rocky',
        venus: 'rocky',
        earth: 'rocky',
        mars: 'rocky',
        jupiter: 'gas_giant',
        saturn: 'gas_giant',
        uranus: 'ice_giant',
        neptune: 'ice_giant'
    }
};

// ========== RENDERING SETTINGS ==========

export const RENDER = {
    // Camera
    FOV: 45, // Field of view in degrees
    NEAR: 0.1, // Near clipping plane
    FAR: 20000, // Far clipping plane (increased for outer planets)
    DEFAULT_CAMERA_POSITION: { x: 0, y: 2000, z: 4000 }, // Camera position for full solar system view

    // Performance (default to BALANCED preset)
    TARGET_FPS: 60,
    ANTI_ALIASING: true,
    PIXEL_RATIO: 1.5, // Default to balanced

    // Geometry detail (default to BALANCED preset)
    SPHERE_SEGMENTS: 16, // Segments for sphere geometry (lower = better performance)
    ORBIT_SEGMENTS: 128, // Segments for orbital paths

    // Effects
    ENABLE_SHADOWS: false, // Shadows are expensive
    ENABLE_BLOOM: true, // Glow effects
    ENABLE_PARTICLES: true // Particle systems
};

// ========== PERFORMANCE PRESETS ==========
// Three performance modes: Quality (best visuals), Balanced (default), Performance (max FPS)

export const PERFORMANCE_PRESETS = {
    QUALITY: {
        name: 'Quality',
        description: 'Best visuals - For powerful PCs (45+ FPS)',
        sphereSegments: 32,      // High detail spheres
        orbitSegments: 128,      // Smooth orbit lines
        antiAliasing: true,      // Smooth edges
        pixelRatio: 2.0,         // High-DPI displays
        toneMapping: 'ACESFilmic', // Cinematic tone mapping
        targetFPS: 45
    },
    BALANCED: {
        name: 'Balanced',
        description: 'Good visuals + performance - Recommended (60 FPS)',
        sphereSegments: 16,      // Medium detail spheres
        orbitSegments: 96,       // Good orbit lines
        antiAliasing: true,      // Smooth edges
        pixelRatio: 1.5,         // Moderate high-DPI
        toneMapping: 'Linear',   // Simple tone mapping
        targetFPS: 60
    },
    PERFORMANCE: {
        name: 'Performance',
        description: 'Maximum FPS - For older devices (60+ FPS)',
        sphereSegments: 12,      // Low detail spheres
        orbitSegments: 64,       // Simplified orbit lines
        antiAliasing: false,     // No anti-aliasing
        pixelRatio: 1.0,         // Standard resolution
        toneMapping: 'None',     // No tone mapping
        targetFPS: 60
    },
    POTATO: {
        name: 'Potato',
        description: 'Ultra-low mode - For ancient hardware (30 FPS)',
        sphereSegments: 8,       // Minimal detail spheres
        orbitSegments: 32,       // Minimal orbit lines
        antiAliasing: false,     // No anti-aliasing
        pixelRatio: 0.75,        // Lower resolution
        toneMapping: 'None',     // No tone mapping
        targetFPS: 30,
        fpsThrottle: true        // Enable FPS throttling
    }
};

// Default performance preset
export const DEFAULT_PERFORMANCE_PRESET = 'BALANCED';

// ========== CAMERA PRESETS ==========
// Different camera positions for viewing different regions of the solar system

export const CAMERA_PRESETS = {
    INNER_SYSTEM: {
        name: 'Inner System',
        description: 'View Sun to Mars (inner planets)',
        position: { x: 0, y: 500, z: 1200 },
        target: { x: 0, y: 0, z: 0 }
    },
    OUTER_SYSTEM: {
        name: 'Outer System',
        description: 'View Jupiter to Neptune (outer planets)',
        position: { x: 0, y: 3000, z: 8000 },
        target: { x: 2500, y: 0, z: 0 }
    },
    FULL_SYSTEM: {
        name: 'Full System',
        description: 'View entire solar system (all 8 planets)',
        position: { x: 0, y: 2000, z: 4000 },
        target: { x: 0, y: 0, z: 0 }
    },
    TOP_DOWN: {
        name: 'Top Down',
        description: 'Bird\'s eye view of orbital plane',
        position: { x: 0, y: 5000, z: 0 },
        target: { x: 0, y: 0, z: 0 }
    }
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
 * Planet size mode: 'enlarged' (exaggerated for visibility) or 'real' (actual proportions)
 * @type {string}
 */
let planetSizeMode = 'enlarged';

/**
 * Set planet size mode
 * @param {string} mode - 'enlarged' or 'real'
 */
export function setPlanetSizeMode(mode) {
    if (mode === 'enlarged' || mode === 'real') {
        planetSizeMode = mode;
        console.log(`🌍 Planet size mode: ${mode.toUpperCase()}`);
    }
}

/**
 * Get current planet size mode
 * @returns {string} 'enlarged' or 'real'
 */
export function getPlanetSizeMode() {
    return planetSizeMode;
}

/**
 * Scale radius for visibility
 */
export function scaleRadius(radiusKm, type = 'planet', planetKey = null) {
    let scale;

    // In 'real' mode, use accurate proportional scaling
    if (planetSizeMode === 'real') {
        if (type === 'planet' || type === 'sun' || type === 'moon') {
            // Use 100x scale for real mode - makes Earth ~2 scene units radius
            // This shows accurate proportions while keeping objects visible when zoomed in
            scale = 100;
        } else if (type === 'iss') {
            // ISS model is built 20 units wide - we need to return a SCALE FACTOR
            // Real ISS: ~109m wide, Earth diameter: ~12,742km
            // Real ratio: 109m / 12,742,000m = 0.0000085 (truly microscopic!)
            // Earth diameter in real mode: ~4.26 scene units
            // Target ISS as tiny marker: ~0.02 scene units wide (0.5% of Earth)
            // Scale factor needed: 0.02 / 20 = 0.001
            return 0.001; // ISS model scaled to 0.02 scene units wide
        }
    } else {
        // Enlarged mode - use exaggerated scaling for visibility
        if (type === 'sun') {
            scale = SCALE.SUN_SIZE;
        } else if (type === 'moon') {
            scale = SCALE.MOON_SIZE;
        } else if (type === 'iss') {
            scale = SCALE.ISS_SIZE; // Keep ISS very exaggerated in enlarged mode
        } else if (type === 'planet' && planetKey) {
            // Use tiered scaling based on planet category
            const category = SCALE.PLANET_CATEGORIES[planetKey];
            if (category === 'rocky') {
                scale = SCALE.PLANET_SIZE_ROCKY;
            } else if (category === 'gas_giant') {
                scale = SCALE.PLANET_SIZE_GAS_GIANT;
            } else if (category === 'ice_giant') {
                scale = SCALE.PLANET_SIZE_ICE_GIANT;
            } else {
                scale = SCALE.PLANET_SIZE; // fallback
            }
        } else {
            scale = SCALE.PLANET_SIZE; // fallback
        }
    }

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
    PERFORMANCE_PRESETS,
    DEFAULT_PERFORMANCE_PRESET,
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
