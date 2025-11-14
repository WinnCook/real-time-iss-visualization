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
        orbitRadius: 0.387, // AU (simplified - use orbitalElements for accuracy)
        orbitPeriod: 87.97, // days
        rotationPeriod: 58.6, // days
        tilt: 0.034, // degrees

        // ACCURATE ORBITAL ELEMENTS (J2000.0 Epoch - January 1, 2000, 12:00 TT)
        // Source: NASA JPL DE440/DE441 Ephemeris, "Explanatory Supplement to Astronomical Almanac"
        // Reference: Mean ecliptic and equinox of J2000
        orbitalElements: {
            epoch: 2451545.0, // Julian Date for J2000.0 (2000-Jan-01.5 TT)

            // Orbital elements at epoch
            semiMajorAxis: 0.38709927, // AU - Average distance from Sun
            eccentricity: 0.20563593, // 0-1 scale (0.206 = highly elliptical orbit!)
            inclination: 7.00497902, // degrees - Tilt relative to ecliptic (highest of all planets!)
            longitudeOfAscendingNode: 48.33076593, // degrees (Ω) - Where orbit crosses ecliptic upward
            argumentOfPeriapsis: 29.12703035, // degrees (ω) - Orientation of ellipse in orbital plane
            meanLongitude: 252.25032350, // degrees (L) - Position at epoch

            // Rates of change (per Julian century from J2000.0)
            // These account for gravitational perturbations over time
            semiMajorAxisRate: 0.00000037, // AU/century
            eccentricityRate: 0.00001906, // per century
            inclinationRate: -0.00594749, // degrees/century
            longitudeOfAscendingNodeRate: -0.12534081, // degrees/century
            argumentOfPeriapsisRate: 0.16047689, // degrees/century
            meanLongitudeRate: 149472.67411175 // degrees/century (derived from period)
        }
    },
    venus: {
        name: "Venus",
        color: 0xffc649,
        radius: 6051.8, // km
        orbitRadius: 0.723, // AU (simplified)
        orbitPeriod: 224.70, // days
        rotationPeriod: -243, // days (retrograde)
        tilt: 177.4, // degrees

        orbitalElements: {
            epoch: 2451545.0,
            semiMajorAxis: 0.72333566, // AU
            eccentricity: 0.00677672, // Very circular orbit (0.007)
            inclination: 3.39467605, // degrees
            longitudeOfAscendingNode: 76.67984255, // degrees (Ω)
            argumentOfPeriapsis: 54.89293244, // degrees (ω)
            meanLongitude: 181.97909950, // degrees (L)
            semiMajorAxisRate: 0.00000390,
            eccentricityRate: -0.00004107,
            inclinationRate: -0.00078890,
            longitudeOfAscendingNodeRate: -0.27769418,
            argumentOfPeriapsisRate: 0.05086002,
            meanLongitudeRate: 58517.81538729
        }
    },
    earth: {
        name: "Earth",
        color: 0x4a90e2,
        radius: 6371, // km
        orbitRadius: 1.0, // AU (by definition - simplified)
        orbitPeriod: 365.25, // days
        rotationPeriod: 1, // days
        tilt: 23.44, // degrees

        orbitalElements: {
            epoch: 2451545.0,
            semiMajorAxis: 1.00000261, // AU (Earth-Moon barycenter)
            eccentricity: 0.01671123, // Nearly circular (0.017)
            inclination: 0.00001531, // degrees - By definition, ecliptic is based on Earth
            longitudeOfAscendingNode: -11.26064, // degrees (Ω) - Negative value
            argumentOfPeriapsis: 114.20783, // degrees (ω) - Also called longitude of perihelion - Ω
            meanLongitude: 100.46457166, // degrees (L)
            semiMajorAxisRate: 0.00000562,
            eccentricityRate: -0.00004392,
            inclinationRate: -0.01294668,
            longitudeOfAscendingNodeRate: 0.05739699,
            argumentOfPeriapsisRate: 0.31831144,
            meanLongitudeRate: 35999.37244981
        }
    },
    mars: {
        name: "Mars",
        color: 0xdc4d3a,
        radius: 3389.5, // km
        orbitRadius: 1.524, // AU (simplified)
        orbitPeriod: 686.98, // days
        rotationPeriod: 1.026, // days
        tilt: 25.19, // degrees

        orbitalElements: {
            epoch: 2451545.0,
            semiMajorAxis: 1.52371034, // AU
            eccentricity: 0.09339410, // Noticeably elliptical (0.093)
            inclination: 1.84969142, // degrees
            longitudeOfAscendingNode: 49.55953891, // degrees (Ω)
            argumentOfPeriapsis: 286.50210402, // degrees (ω)
            meanLongitude: -4.55343205, // degrees (L) - Negative value
            semiMajorAxisRate: 0.00001847,
            eccentricityRate: 0.00007882,
            inclinationRate: -0.00813131,
            longitudeOfAscendingNodeRate: -0.29257343,
            argumentOfPeriapsisRate: 0.29528966,
            meanLongitudeRate: 19140.30268499
        }
    },
    jupiter: {
        name: "Jupiter",
        color: 0xc88b3a, // Orange-tan with bands
        radius: 69911, // km (largest planet)
        orbitRadius: 5.2, // AU (simplified)
        orbitPeriod: 4333, // days (11.86 years)
        rotationPeriod: 0.41, // days (fastest rotation - 9.9 hours)
        tilt: 3.13, // degrees

        orbitalElements: {
            epoch: 2451545.0,
            semiMajorAxis: 5.20288700, // AU
            eccentricity: 0.04838624, // Slight ellipse (0.048)
            inclination: 1.30439695, // degrees
            longitudeOfAscendingNode: 100.47390909, // degrees (Ω)
            argumentOfPeriapsis: 273.86716699, // degrees (ω)
            meanLongitude: 34.39644051, // degrees (L)
            semiMajorAxisRate: -0.00011607,
            eccentricityRate: -0.00013253,
            inclinationRate: -0.00183714,
            longitudeOfAscendingNodeRate: 0.20469106,
            argumentOfPeriapsisRate: 0.21252668,
            meanLongitudeRate: 3034.74612775
        }
    },
    saturn: {
        name: "Saturn",
        color: 0xead6b8, // Pale golden yellow
        radius: 58232, // km (second largest)
        orbitRadius: 9.54, // AU (simplified)
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
        },

        orbitalElements: {
            epoch: 2451545.0,
            semiMajorAxis: 9.53667594, // AU
            eccentricity: 0.05386179, // Slight ellipse (0.054)
            inclination: 2.48599187, // degrees
            longitudeOfAscendingNode: 113.66242448, // degrees (Ω)
            argumentOfPeriapsis: 339.39214853, // degrees (ω)
            meanLongitude: 49.95424423, // degrees (L)
            semiMajorAxisRate: -0.00125060,
            eccentricityRate: -0.00050991,
            inclinationRate: 0.00193609,
            longitudeOfAscendingNodeRate: -0.28867794,
            argumentOfPeriapsisRate: -0.41897216,
            meanLongitudeRate: 1222.49362201
        }
    },
    uranus: {
        name: "Uranus",
        color: 0x4fd0e7, // Cyan/ice blue
        radius: 25362, // km
        orbitRadius: 19.19, // AU (simplified)
        orbitPeriod: 30687, // days (84 years)
        rotationPeriod: -0.72, // days (17.2 hours, retrograde)
        tilt: 97.77, // degrees (extreme tilt - rotates on its side!)

        orbitalElements: {
            epoch: 2451545.0,
            semiMajorAxis: 19.18916464, // AU
            eccentricity: 0.04725744, // Slight ellipse (0.047)
            inclination: 0.77263783, // degrees
            longitudeOfAscendingNode: 74.01692503, // degrees (Ω)
            argumentOfPeriapsis: 96.99898605, // degrees (ω)
            meanLongitude: 313.23810451, // degrees (L)
            semiMajorAxisRate: -0.00196176,
            eccentricityRate: -0.00004397,
            inclinationRate: -0.00242939,
            longitudeOfAscendingNodeRate: 0.04240589,
            argumentOfPeriapsisRate: 0.40805281,
            meanLongitudeRate: 428.48202785
        }
    },
    neptune: {
        name: "Neptune",
        color: 0x4166f5, // Deep blue
        radius: 24622, // km
        orbitRadius: 30.07, // AU (farthest planet - simplified)
        orbitPeriod: 60190, // days (164.8 years)
        rotationPeriod: 0.67, // days (16.1 hours)
        tilt: 28.32, // degrees

        orbitalElements: {
            epoch: 2451545.0,
            semiMajorAxis: 30.06992276, // AU
            eccentricity: 0.00859048, // Very circular (0.009)
            inclination: 1.77004347, // degrees
            longitudeOfAscendingNode: 131.78422574, // degrees (Ω)
            argumentOfPeriapsis: 276.33550814, // degrees (ω)
            meanLongitude: -55.12002969, // degrees (L) - Negative value
            semiMajorAxisRate: 0.00026291,
            eccentricityRate: 0.00005105,
            inclinationRate: 0.00035372,
            longitudeOfAscendingNodeRate: -0.00508664,
            argumentOfPeriapsisRate: -0.32241464,
            meanLongitudeRate: 218.45945325
        }
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

// ========== ASTEROID BELT ==========
// Main asteroid belt between Mars and Jupiter
// Based on real astronomical data

export const ASTEROID_BELT = {
    // Orbital parameters (in AU)
    innerRadius: 2.2,      // AU (inner edge, just beyond Mars at 1.52 AU)
    outerRadius: 3.2,      // AU (outer edge, before Jupiter at 5.2 AU)
    centerRadius: 2.7,     // AU (peak density at ~2.7 AU)

    // Vertical thickness (in AU)
    thickness: 0.6,        // AU (±0.3 AU from ecliptic plane)

    // Orbital periods (in Earth years)
    minPeriod: 3.5,        // years (inner edge orbits faster)
    maxPeriod: 6.0,        // years (outer edge orbits slower)
    avgPeriod: 4.6,        // years (average asteroid orbital period)

    // Visual properties
    asteroidCount: 15000,  // Number of asteroids to render (balance: detail vs performance)
    minSize: 0.3,          // scene units (smallest asteroids)
    maxSize: 2.5,          // scene units (largest asteroids)
    color: 0x8b7355,       // Brownish-gray (carbonaceous chondrite color)

    // Notable large asteroids (optional for future clickable feature)
    notableAsteroids: {
        ceres: { name: "Ceres", radius: 473, orbitRadius: 2.77 },      // Dwarf planet
        vesta: { name: "Vesta", radius: 262.7, orbitRadius: 2.36 },    // Largest asteroid
        pallas: { name: "Pallas", radius: 256, orbitRadius: 2.77 },
        hygiea: { name: "Hygiea", radius: 217, orbitRadius: 3.14 }
    }
};

// ========== MAJOR MOONS ==========
// Jupiter's Galilean Moons and Saturn's Major Moons
// Orbital distances are in km from parent planet, periods in Earth days

export const MAJOR_MOONS = {
    // Jupiter's Galilean Moons (discovered by Galileo in 1610)
    io: {
        name: "Io",
        color: 0xffcc00, // Yellow-orange (volcanic sulfur)
        radius: 1821.6, // km (slightly larger than Earth's Moon)
        orbitRadius: 421700, // km from Jupiter
        orbitPeriod: 1.769, // days
        rotationPeriod: 1.769, // days (tidally locked)
        parentPlanet: 'jupiter',
        description: "Most volcanically active body in the solar system"
    },
    europa: {
        name: "Europa",
        color: 0xd4e4f7, // Pale blue-white (icy surface)
        radius: 1560.8, // km
        orbitRadius: 671034, // km from Jupiter
        orbitPeriod: 3.551, // days
        rotationPeriod: 3.551, // days (tidally locked)
        parentPlanet: 'jupiter',
        description: "Subsurface ocean, potential for life"
    },
    ganymede: {
        name: "Ganymede",
        color: 0xb8b8b8, // Gray-brown (largest moon in solar system)
        radius: 2634.1, // km (larger than Mercury!)
        orbitRadius: 1070412, // km from Jupiter
        orbitPeriod: 7.155, // days
        rotationPeriod: 7.155, // days (tidally locked)
        parentPlanet: 'jupiter',
        description: "Largest moon in solar system, has magnetic field"
    },
    callisto: {
        name: "Callisto",
        color: 0x8b7355, // Dark brownish-gray (heavily cratered)
        radius: 2410.3, // km
        orbitRadius: 1882709, // km from Jupiter
        orbitPeriod: 16.689, // days
        rotationPeriod: 16.689, // days (tidally locked)
        parentPlanet: 'jupiter',
        description: "Most heavily cratered object in solar system"
    },

    // Saturn's Major Moons
    titan: {
        name: "Titan",
        color: 0xffa500, // Orange (thick atmosphere with haze)
        radius: 2574.7, // km (second largest moon in solar system)
        orbitRadius: 1221870, // km from Saturn
        orbitPeriod: 15.945, // days
        rotationPeriod: 15.945, // days (tidally locked)
        parentPlanet: 'saturn',
        description: "Only moon with thick atmosphere, lakes of methane"
    },
    rhea: {
        name: "Rhea",
        color: 0xe0e0e0, // Light gray (icy surface)
        radius: 763.8, // km
        orbitRadius: 527108, // km from Saturn
        orbitPeriod: 4.518, // days
        rotationPeriod: 4.518, // days (tidally locked)
        parentPlanet: 'saturn',
        description: "Second-largest moon of Saturn, icy composition"
    },
    iapetus: {
        name: "Iapetus",
        color: 0x696969, // Medium gray (two-toned surface)
        radius: 734.5, // km
        orbitRadius: 3560820, // km from Saturn
        orbitPeriod: 79.321, // days
        rotationPeriod: 79.321, // days (tidally locked)
        parentPlanet: 'saturn',
        description: "Two-toned surface: one bright side, one dark side"
    }
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
    ISS_SIZE: 10000, // Much smaller - visible but not overwhelming

    // Moon orbit scaling (needed because planets are scaled up 1500x but Moon orbit uses real km distance)
    // This ensures Moon is visible outside Earth's scaled-up surface
    MOON_ORBIT_SCALE: 50, // Makes Moon orbit ~64 units (vs Earth radius of ~32 units)

    // Major moons (Jupiter & Saturn) size and orbit scaling
    MAJOR_MOON_SIZE: 800, // Slightly smaller than Earth's Moon for visual hierarchy
    MAJOR_MOON_ORBIT_SCALE: 50, // Same as Earth's Moon for consistent spacing

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
    FAR: 100000, // Far clipping plane (increased for realistic star distances)
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
    ISS_URL: 'https://api.open-notify.org/iss-now.json', // SECURITY FIX: Changed to HTTPS
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
            // Real ISS: 109m = 0.109 km, Earth radius: 6,371 km
            // In real mode, Earth radius = 2.13 scene units
            //
            // COMPROMISE: Make ISS 0.2% of Earth's radius for visibility
            // 0.2% of 2.13 = 0.00426 scene units
            // Scale factor = 0.00426 / 20 = 0.000213
            //
            // This is still 100x bigger than reality but at least visible
            return 0.0003; // Tiny but visible marker
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
    ASTEROID_BELT,
    MAJOR_MOONS,
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
