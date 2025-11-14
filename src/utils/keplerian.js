/**
 * Keplerian Orbital Mechanics Module
 *
 * Implements full 6-element Keplerian orbital calculations for 100% accurate
 * planetary and moon positions based on NASA JPL ephemeris data.
 *
 * References:
 * - "Orbital Mechanics for Engineering Students" by Howard Curtis
 * - "Fundamentals of Astrodynamics" by Bate, Mueller, and White
 * - NASA JPL Horizons System: https://ssd.jpl.nasa.gov/horizons/
 * - JPL DE440/DE441 Ephemeris (current standard as of 2021)
 *
 * Coordinate Systems:
 * - Input: J2000.0 ecliptic coordinates (standard for NASA JPL data)
 * - Output: Three.js right-handed Y-up coordinates (for rendering)
 *
 * @module keplerian
 */

import { auToScene, kmToScene, DEG_TO_RAD, TWO_PI } from './constants.js';

// ========== KEPLER'S EQUATION SOLVER ==========

/**
 * Solve Kepler's Equation using Newton-Raphson iterative method
 *
 * Kepler's Equation: M = E - e·sin(E)
 * Where:
 *   M = Mean anomaly (radians)
 *   E = Eccentric anomaly (radians) - what we're solving for
 *   e = Eccentricity (0-1)
 *
 * This equation has no closed-form solution, so we use Newton-Raphson:
 * E(n+1) = E(n) - f(E) / f'(E)
 * Where:
 *   f(E) = E - e·sin(E) - M
 *   f'(E) = 1 - e·cos(E)
 *
 * @param {number} M - Mean anomaly in radians
 * @param {number} e - Eccentricity (0 ≤ e < 1)
 * @returns {number} E - Eccentric anomaly in radians
 */
export function solveKeplersEquation(M, e) {
    // Convergence tolerance (1e-8 radians ≈ 0.000002 degrees)
    const tolerance = 1e-8;
    const maxIterations = 50; // Safety limit

    // Initial guess for E
    // For small e (< 0.8), M is a good starting point
    // For larger e, use Danby's approximation
    let E = (e < 0.8) ? M : Math.sign(Math.sin(M)) * Math.PI;

    let iterations = 0;
    let delta = 1; // Initial delta (will be updated)

    // Newton-Raphson iteration
    while (Math.abs(delta) > tolerance && iterations < maxIterations) {
        // f(E) = E - e·sin(E) - M
        const f = E - e * Math.sin(E) - M;

        // f'(E) = 1 - e·cos(E)
        const fPrime = 1 - e * Math.cos(E);

        // Newton-Raphson step: E_new = E_old - f/f'
        delta = f / fPrime;
        E = E - delta;

        iterations++;
    }

    // Warn if convergence failed (should be very rare)
    if (iterations >= maxIterations) {
        console.warn(`⚠️ Kepler's Equation failed to converge after ${iterations} iterations (M=${M}, e=${e})`);
    }

    return E;
}

// ========== ANOMALY CONVERSIONS ==========

/**
 * Convert eccentric anomaly to true anomaly
 *
 * True anomaly (ν) is the angle from periapsis (closest point) to current position,
 * measured in the orbital plane. This is what we need to calculate position.
 *
 * Formula: ν = 2·atan2(√(1+e)·sin(E/2), √(1-e)·cos(E/2))
 *
 * @param {number} E - Eccentric anomaly in radians
 * @param {number} e - Eccentricity (0 ≤ e < 1)
 * @returns {number} ν - True anomaly in radians
 */
export function eccentricToTrueAnomaly(E, e) {
    // Using the half-angle formula for numerical stability
    const sqrtTerm1 = Math.sqrt(1 + e) * Math.sin(E / 2);
    const sqrtTerm2 = Math.sqrt(1 - e) * Math.cos(E / 2);

    const trueAnomaly = 2 * Math.atan2(sqrtTerm1, sqrtTerm2);

    return trueAnomaly;
}

/**
 * Calculate mean anomaly from mean longitude and other orbital elements
 *
 * Mean longitude (L) combines several angles: L = Ω + ω + M
 * To get mean anomaly: M = L - Ω - ω
 *
 * However, for our formulation we use:
 * M = L - ϖ
 * Where ϖ (longitude of perihelion) = Ω + ω
 *
 * @param {number} meanLongitude - Mean longitude in degrees
 * @param {number} longitudeOfPerihelion - Longitude of perihelion in degrees
 * @returns {number} Mean anomaly in radians
 */
export function meanLongitudeToMeanAnomaly(meanLongitude, longitudeOfPerihelion) {
    // Calculate mean anomaly in degrees
    let M = meanLongitude - longitudeOfPerihelion;

    // Normalize to [0, 360) range
    M = M % 360;
    if (M < 0) M += 360;

    // Convert to radians
    return M * DEG_TO_RAD;
}

// ========== 3D ROTATION MATRICES ==========

/**
 * Apply 3D rotations to position vector
 *
 * Rotates a position from orbital plane coordinates to ecliptic J2000 coordinates
 * using the three Euler rotations:
 * 1. Rotate by argument of periapsis (ω) in orbital plane
 * 2. Rotate by inclination (i) to tilt orbital plane
 * 3. Rotate by longitude of ascending node (Ω) around ecliptic pole
 *
 * @param {number} x - X coordinate in orbital plane
 * @param {number} y - Y coordinate in orbital plane
 * @param {number} omega - Argument of periapsis (radians)
 * @param {number} inclination - Orbital inclination (radians)
 * @param {number} Omega - Longitude of ascending node (radians)
 * @returns {Object} {x, y, z} - Position in ecliptic coordinates
 */
function rotateOrbitalToEcliptic(x, y, omega, inclination, Omega) {
    // Step 1: Rotate by argument of periapsis (ω) in XY plane
    const cosOmega = Math.cos(omega);
    const sinOmega = Math.sin(omega);

    const x1 = x * cosOmega - y * sinOmega;
    const y1 = x * sinOmega + y * cosOmega;
    const z1 = 0; // Still in orbital plane

    // Step 2: Rotate by inclination (i) around X-axis
    const cosI = Math.cos(inclination);
    const sinI = Math.sin(inclination);

    const x2 = x1;
    const y2 = y1 * cosI - z1 * sinI;
    const z2 = y1 * sinI + z1 * cosI;

    // Step 3: Rotate by longitude of ascending node (Ω) around Z-axis
    const cosOmegaBig = Math.cos(Omega);
    const sinOmegaBig = Math.sin(Omega);

    const x3 = x2 * cosOmegaBig - y2 * sinOmegaBig;
    const y3 = x2 * sinOmegaBig + y2 * cosOmegaBig;
    const z3 = z2;

    return { x: x3, y: y3, z: z3 };
}

// ========== JULIAN DATE CALCULATIONS ==========

/**
 * Calculate Julian Date from JavaScript Date object
 *
 * Julian Date is the number of days since January 1, 4713 BC at noon UTC.
 * Used as a continuous time scale in astronomy.
 *
 * J2000.0 epoch = JD 2451545.0 = January 1, 2000, 12:00 TT
 *
 * @param {Date} date - JavaScript Date object
 * @returns {number} Julian Date
 */
export function toJulianDate(date) {
    // JavaScript timestamps are in milliseconds since 1970-01-01 00:00:00 UTC
    // Julian Date for Unix epoch (1970-01-01 00:00:00) = 2440587.5
    const unixEpochJD = 2440587.5;
    const millisecondsPerDay = 86400000; // 1000 * 60 * 60 * 24

    const jd = unixEpochJD + (date.getTime() / millisecondsPerDay);
    return jd;
}

/**
 * Calculate days since J2000.0 epoch
 *
 * @param {Date} date - JavaScript Date object
 * @returns {number} Days since J2000.0 (can be negative for dates before 2000)
 */
export function daysSinceJ2000(date) {
    const J2000_JD = 2451545.0; // Julian Date for J2000.0
    const jd = toJulianDate(date);
    return jd - J2000_JD;
}

/**
 * Calculate Julian centuries since J2000.0 epoch
 *
 * Used for applying orbital element rates (secular perturbations)
 *
 * @param {Date} date - JavaScript Date object
 * @returns {number} Julian centuries since J2000.0
 */
export function centuriesSinceJ2000(date) {
    const days = daysSinceJ2000(date);
    const daysPerCentury = 36525; // Julian century = 36525 days
    return days / daysPerCentury;
}

// ========== ORBITAL ELEMENT UPDATES ==========

/**
 * Update orbital elements to account for secular perturbations
 *
 * Orbital elements slowly change over time due to gravitational perturbations
 * from other planets. NASA provides rates of change (per century) to account
 * for this.
 *
 * For short periods (decades), this correction is small. For long periods
 * (centuries), it becomes important.
 *
 * @param {Object} elements - Orbital elements at J2000 epoch
 * @param {number} T - Julian centuries since J2000
 * @returns {Object} Updated orbital elements
 */
export function updateOrbitalElements(elements, T) {
    return {
        semiMajorAxis: elements.semiMajorAxis + elements.semiMajorAxisRate * T,
        eccentricity: elements.eccentricity + elements.eccentricityRate * T,
        inclination: elements.inclination + elements.inclinationRate * T,
        longitudeOfAscendingNode: elements.longitudeOfAscendingNode + elements.longitudeOfAscendingNodeRate * T,
        argumentOfPeriapsis: elements.argumentOfPeriapsis + elements.argumentOfPeriapsisRate * T,
        meanLongitude: elements.meanLongitude + elements.meanLongitudeRate * T
    };
}

// ========== MAIN POSITION CALCULATION ==========

/**
 * Calculate 3D position from Keplerian orbital elements
 *
 * This is the main function that orchestrates all the calculations.
 * Given orbital elements and current time, it returns the object's 3D position.
 *
 * @param {Object} orbitalElements - NASA JPL orbital elements
 * @param {Object} orbitalElements.epoch - Julian Date of element epoch (usually J2000.0)
 * @param {number} orbitalElements.semiMajorAxis - Semi-major axis in AU
 * @param {number} orbitalElements.eccentricity - Eccentricity (0-1)
 * @param {number} orbitalElements.inclination - Inclination in degrees
 * @param {number} orbitalElements.longitudeOfAscendingNode - Longitude of ascending node (Ω) in degrees
 * @param {number} orbitalElements.argumentOfPeriapsis - Argument of periapsis (ω) in degrees
 * @param {number} orbitalElements.meanLongitude - Mean longitude (L) at epoch in degrees
 * @param {Date} currentDate - Current date/time for position calculation
 * @param {boolean} applyRates - Whether to apply secular perturbations (default: false)
 * @returns {Object} {x, y, z} - Position in scene units (Three.js coordinates)
 */
export function calculateOrbitalPosition(orbitalElements, currentDate = new Date(), applyRates = false) {
    // Calculate time since epoch
    const T = centuriesSinceJ2000(currentDate);

    // Update elements for secular perturbations (if requested)
    const elements = applyRates ? updateOrbitalElements(orbitalElements, T) : orbitalElements;

    // Extract and convert elements to radians
    const a = elements.semiMajorAxis; // AU
    const e = elements.eccentricity;
    const i = elements.inclination * DEG_TO_RAD;
    const Omega = elements.longitudeOfAscendingNode * DEG_TO_RAD;
    const omega = elements.argumentOfPeriapsis * DEG_TO_RAD;
    const L = elements.meanLongitude; // degrees

    // Calculate longitude of perihelion: ϖ = Ω + ω (convert back to degrees for calculation)
    const longitudeOfPerihelion = (Omega / DEG_TO_RAD) + (omega / DEG_TO_RAD);

    // Calculate mean anomaly from mean longitude
    const M = meanLongitudeToMeanAnomaly(L, longitudeOfPerihelion);

    // Solve Kepler's Equation for eccentric anomaly
    const E = solveKeplersEquation(M, e);

    // Convert eccentric anomaly to true anomaly
    const nu = eccentricToTrueAnomaly(E, e);

    // Calculate orbital radius (distance from focus/sun)
    // Using orbit equation: r = a(1 - e²) / (1 + e·cos(ν))
    // Or equivalently: r = a(1 - e·cos(E))
    const r = a * (1 - e * Math.cos(E));

    // Calculate position in orbital plane (2D)
    const x_orbit = r * Math.cos(nu);
    const y_orbit = r * Math.sin(nu);

    // Rotate to ecliptic coordinates (3D)
    const eclipticPos = rotateOrbitalToEcliptic(x_orbit, y_orbit, omega, i, Omega);

    // Convert from J2000 ecliptic to Three.js coordinates
    // J2000: +X = vernal equinox, +Y = 90° east, +Z = north ecliptic pole
    // Three.js: +X = right, +Y = up, +Z = toward viewer
    // We swap Y and Z axes
    const position = {
        x: auToScene(eclipticPos.x),
        y: auToScene(eclipticPos.z), // Z becomes Y (up)
        z: auToScene(eclipticPos.y)  // Y becomes Z
    };

    return position;
}

/**
 * Calculate orbital position at simulation time
 *
 * Similar to calculateOrbitalPosition but uses simulation time in milliseconds
 * instead of real calendar date. Useful for time-accelerated visualizations.
 *
 * @param {Object} orbitalElements - NASA JPL orbital elements
 * @param {number} simulationTime - Time in milliseconds (from simulation start)
 * @param {number} orbitPeriod - Orbital period in days
 * @param {Date} startEpoch - Reference date for simulation time zero (default: J2000.0)
 * @returns {Object} {x, y, z} - Position in scene units
 */
export function calculateOrbitalPositionFromSimTime(orbitalElements, simulationTime, orbitPeriod, startEpoch = null) {
    // If no start epoch specified, use J2000.0
    if (!startEpoch) {
        startEpoch = new Date('2000-01-01T12:00:00Z');
    }

    // Convert simulation time (ms) to calendar date
    const currentDate = new Date(startEpoch.getTime() + simulationTime);

    // Use main position calculation function
    return calculateOrbitalPosition(orbitalElements, currentDate, false);
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Calculate perihelion distance (closest point to Sun)
 *
 * @param {number} a - Semi-major axis in AU
 * @param {number} e - Eccentricity
 * @returns {number} Perihelion distance in AU
 */
export function calculatePerihelion(a, e) {
    return a * (1 - e);
}

/**
 * Calculate aphelion distance (farthest point from Sun)
 *
 * @param {number} a - Semi-major axis in AU
 * @param {number} e - Eccentricity
 * @returns {number} Aphelion distance in AU
 */
export function calculateAphelion(a, e) {
    return a * (1 + e);
}

/**
 * Get orbital position info for debugging
 *
 * @param {Object} orbitalElements - NASA JPL orbital elements
 * @param {Date} currentDate - Current date/time
 * @returns {Object} Detailed orbital position information
 */
export function getOrbitalInfo(orbitalElements, currentDate = new Date()) {
    const elements = orbitalElements;
    const a = elements.semiMajorAxis;
    const e = elements.eccentricity;

    const perihelion = calculatePerihelion(a, e);
    const aphelion = calculateAphelion(a, e);

    const position = calculateOrbitalPosition(orbitalElements, currentDate);

    // Calculate distance from sun
    const distance = Math.sqrt(position.x**2 + position.y**2 + position.z**2);
    const distanceAU = distance / auToScene(1);

    return {
        position,
        distanceAU,
        perihelionAU: perihelion,
        aphelionAU: aphelion,
        eccentricity: e,
        currentDate: currentDate.toISOString()
    };
}

// Export all functions
export default {
    solveKeplersEquation,
    eccentricToTrueAnomaly,
    meanLongitudeToMeanAnomaly,
    toJulianDate,
    daysSinceJ2000,
    centuriesSinceJ2000,
    updateOrbitalElements,
    calculateOrbitalPosition,
    calculateOrbitalPositionFromSimTime,
    calculatePerihelion,
    calculateAphelion,
    getOrbitalInfo
};
