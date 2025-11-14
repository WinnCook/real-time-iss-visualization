/**
 * Orbital Elements - Real Keplerian orbital elements from NASA JPL
 * Source: https://ssd.jpl.nasa.gov/planets/approx_pos.html
 * Epoch: J2000 (January 1, 2000, 12:00 TT)
 *
 * NOTE: This module now uses orbital elements from constants.js (PLANETS.orbitalElements)
 * The data below is kept for backward compatibility but should be migrated.
 *
 * @deprecated Use PLANETS.orbitalElements from constants.js instead
 */

/**
 * Keplerian orbital elements for planets (DEPRECATED - use constants.js)
 * All angles in degrees, distances in AU
 * @deprecated
 */
export const ORBITAL_ELEMENTS = {
    mercury: {
        // Semi-major axis (AU)
        a: 0.38709927,
        // Eccentricity (0 = circle, <1 = ellipse)
        e: 0.20563593,
        // Inclination to ecliptic (degrees)
        i: 7.00497902,
        // Longitude of ascending node (degrees)
        Omega: 48.33076593,
        // Longitude of perihelion (degrees)
        varpi: 77.45779628,
        // Mean longitude (degrees)
        L: 252.25032350,

        // Rates of change per century (for approximation)
        aDot: 0.00000037,
        eDot: 0.00001906,
        iDot: -0.00594749,
        OmegaDot: -0.12534081,
        varpiDot: 0.16047689,
        LDot: 149472.67411175
    },
    venus: {
        a: 0.72333566,
        e: 0.00677672,
        i: 3.39467605,
        Omega: 76.67984255,
        varpi: 131.60246718,
        L: 181.97909950,

        aDot: 0.00000390,
        eDot: -0.00004107,
        iDot: -0.00078890,
        OmegaDot: -0.27769418,
        varpiDot: 0.00268329,
        LDot: 58517.81538729
    },
    earth: {
        a: 1.00000261,
        e: 0.01671123,
        i: -0.00001531,
        Omega: 0.0,
        varpi: 102.93768193,
        L: 100.46457166,

        aDot: 0.00000562,
        eDot: -0.00004392,
        iDot: -0.01294668,
        OmegaDot: 0.0,
        varpiDot: 0.32327364,
        LDot: 35999.37244981
    },
    mars: {
        a: 1.52371034,
        e: 0.09339410,
        i: 1.84969142,
        Omega: 49.55953891,
        varpi: -23.94362959,
        L: -4.55343205,

        aDot: 0.00001847,
        eDot: 0.00007882,
        iDot: -0.00813131,
        OmegaDot: -0.29257343,
        varpiDot: 0.44441088,
        LDot: 19140.30268499
    },
    jupiter: {
        a: 5.20288700,
        e: 0.04838624,
        i: 1.30439695,
        Omega: 100.47390909,
        varpi: 14.72847983,
        L: 34.39644051,

        aDot: -0.00011607,
        eDot: -0.00013253,
        iDot: -0.00183714,
        OmegaDot: 0.20469106,
        varpiDot: 0.21252668,
        LDot: 3034.74612775
    },
    saturn: {
        a: 9.53667594,
        e: 0.05386179,
        i: 2.48599187,
        Omega: 113.66242448,
        varpi: 92.59887831,
        L: 49.95424423,

        aDot: -0.00125060,
        eDot: -0.00050991,
        iDot: 0.00193609,
        OmegaDot: -0.28867794,
        varpiDot: -0.41897216,
        LDot: 1222.49362201
    },
    uranus: {
        a: 19.18916464,
        e: 0.04725744,
        i: 0.77263783,
        Omega: 74.01692503,
        varpi: 170.95427630,
        L: 313.23810451,

        aDot: -0.00196176,
        eDot: -0.00004397,
        iDot: -0.00242939,
        OmegaDot: 0.04240589,
        varpiDot: 0.40805281,
        LDot: 428.48202785
    },
    neptune: {
        a: 30.06992276,
        e: 0.00859048,
        i: 1.77004347,
        Omega: 131.78422574,
        varpi: 44.96476227,
        L: -55.12002969,

        aDot: 0.00026291,
        eDot: 0.00005105,
        iDot: 0.00035372,
        OmegaDot: -0.00508664,
        varpiDot: -0.32241464,
        LDot: 218.45945325
    }
};

/**
 * Calculate Julian Day Number from Date
 * @param {Date} date - JavaScript Date object
 * @returns {number} Julian Day Number
 */
export function dateToJulian(date) {
    const time = date.getTime();
    const days = time / (1000 * 60 * 60 * 24);
    // January 1, 1970 = JD 2440587.5
    return days + 2440587.5;
}

/**
 * Calculate centuries since J2000.0
 * @param {Date} date - JavaScript Date object
 * @returns {number} Julian centuries since J2000
 */
export function centuriesSinceJ2000(date) {
    const jd = dateToJulian(date);
    // J2000.0 = JD 2451545.0 (January 1, 2000, 12:00 TT)
    return (jd - 2451545.0) / 36525.0;
}

/**
 * Calculate current orbital elements for a planet
 * @param {string} planetKey - Planet identifier
 * @param {Date} date - Date for calculation (default: now)
 * @returns {Object} Current orbital elements
 */
export function getCurrentElements(planetKey, date = new Date()) {
    const elements = ORBITAL_ELEMENTS[planetKey];
    if (!elements) {
        console.error(`No orbital elements for planet: ${planetKey}`);
        return null;
    }

    const T = centuriesSinceJ2000(date);

    return {
        a: elements.a + elements.aDot * T,
        e: elements.e + elements.eDot * T,
        i: elements.i + elements.iDot * T,
        Omega: elements.Omega + elements.OmegaDot * T,
        varpi: elements.varpi + elements.varpiDot * T,
        L: elements.L + elements.LDot * T
    };
}

/**
 * Calculate planet position in 3D space using Keplerian elements
 * @param {string} planetKey - Planet identifier
 * @param {Date} date - Date for calculation
 * @returns {Object} Position {x, y, z} in AU
 */
export function calculatePlanetPosition(planetKey, date = new Date()) {
    const elem = getCurrentElements(planetKey, date);
    if (!elem) return { x: 0, y: 0, z: 0 };

    // Convert to radians
    const toRad = Math.PI / 180;
    const i = elem.i * toRad;
    const Omega = elem.Omega * toRad;
    const varpi = elem.varpi * toRad;
    const L = elem.L * toRad;

    // Argument of perihelion
    const omega = varpi - Omega;

    // Mean anomaly
    let M = L - varpi;

    // Normalize to [0, 2π]
    M = M % (2 * Math.PI);
    if (M < 0) M += 2 * Math.PI;

    // Solve Kepler's equation for eccentric anomaly (E)
    // M = E - e*sin(E)
    let E = M;
    for (let iteration = 0; iteration < 10; iteration++) {
        const deltaE = (M - (E - elem.e * Math.sin(E))) / (1 - elem.e * Math.cos(E));
        E += deltaE;
        if (Math.abs(deltaE) < 1e-6) break;
    }

    // True anomaly
    const nu = 2 * Math.atan2(
        Math.sqrt(1 + elem.e) * Math.sin(E / 2),
        Math.sqrt(1 - elem.e) * Math.cos(E / 2)
    );

    // Distance from sun
    const r = elem.a * (1 - elem.e * Math.cos(E));

    // Position in orbital plane
    const xOrbit = r * Math.cos(nu);
    const yOrbit = r * Math.sin(nu);

    // Rotate to ecliptic coordinates
    const cosOmega = Math.cos(omega);
    const sinOmega = Math.sin(omega);
    const cosi = Math.cos(i);
    const sini = Math.sin(i);
    const cosOmegaNode = Math.cos(Omega);
    const sinOmegaNode = Math.sin(Omega);

    const x = (cosOmegaNode * cosOmega - sinOmegaNode * sinOmega * cosi) * xOrbit +
              (-cosOmegaNode * sinOmega - sinOmegaNode * cosOmega * cosi) * yOrbit;

    const y = (sinOmegaNode * cosOmega + cosOmegaNode * sinOmega * cosi) * xOrbit +
              (-sinOmegaNode * sinOmega + cosOmegaNode * cosOmega * cosi) * yOrbit;

    const z = (sinOmega * sini) * xOrbit + (cosOmega * sini) * yOrbit;

    return { x, y, z };
}

// Export default object
export default {
    ORBITAL_ELEMENTS,
    dateToJulian,
    centuriesSinceJ2000,
    getCurrentElements,
    calculatePlanetPosition
};
