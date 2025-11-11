/**
 * Orbital Mechanics Module
 * Kepler orbital calculations for planetary motion
 */

import { TWO_PI, daysToMs, auToScene, kmToScene, SCALE } from './constants.js';

/**
 * Calculate orbital position at given time for circular orbit
 * @param {number} simulationTime - Current simulation time in milliseconds
 * @param {number} orbitRadius - Radius of orbit in scene units
 * @param {number} orbitPeriod - Orbital period in days
 * @param {number} startAngle - Starting angle offset in radians (default 0)
 * @returns {Object} Position {x, y, z}
 */
export function calculateOrbitalPosition(simulationTime, orbitRadius, orbitPeriod, startAngle = 0) {
    // Calculate current angle based on time
    const periodMs = daysToMs(orbitPeriod);
    const angle = startAngle + (simulationTime / periodMs) * TWO_PI;

    // Calculate position on circular orbit (orbits in XZ plane)
    return {
        x: Math.cos(angle) * orbitRadius,
        y: 0, // Planar orbit (no inclination in basic model)
        z: Math.sin(angle) * orbitRadius
    };
}

/**
 * Calculate orbital position for a planet at given time
 * Handles conversion from AU to scene units
 * @param {number} simulationTime - Current simulation time in milliseconds
 * @param {Object} planetData - Planet data with orbitRadius (AU) and orbitPeriod (days)
 * @param {number} startAngle - Starting angle offset in radians (default 0)
 * @returns {Object} Position {x, y, z}
 */
export function calculatePlanetPosition(simulationTime, planetData, startAngle = 0) {
    const orbitRadiusScene = auToScene(planetData.orbitRadius);
    return calculateOrbitalPosition(
        simulationTime,
        orbitRadiusScene,
        planetData.orbitPeriod,
        startAngle
    );
}

/**
 * Calculate Moon's position relative to Earth
 * @param {number} simulationTime - Current simulation time in milliseconds
 * @param {Object} earthPosition - Earth's current position {x, y, z}
 * @param {Object} moonData - Moon data with orbitRadius (km) and orbitPeriod (days)
 * @param {number} startAngle - Starting angle offset in radians (default 0)
 * @returns {Object} Position {x, y, z}
 */
export function calculateMoonPosition(simulationTime, earthPosition, moonData, startAngle = 0) {
    // Apply MOON_ORBIT_SCALE to make Moon visible outside Earth's scaled-up surface
    // Without this, Moon would be inside Earth since planets are scaled 1500x but orbit distance is real km
    const orbitRadiusScene = kmToScene(moonData.orbitRadius) * SCALE.MOON_ORBIT_SCALE;
    const periodMs = daysToMs(moonData.orbitPeriod);
    const angle = startAngle + (simulationTime / periodMs) * TWO_PI;

    // Calculate Moon's position relative to Earth
    return {
        x: earthPosition.x + Math.cos(angle) * orbitRadiusScene,
        y: earthPosition.y,
        z: earthPosition.z + Math.sin(angle) * orbitRadiusScene
    };
}

/**
 * Calculate orbital velocity at a point
 * For circular orbits: v = 2πr / T
 * @param {number} orbitRadius - Radius of orbit (any units)
 * @param {number} orbitPeriod - Orbital period in days
 * @returns {number} Orbital velocity (same units as radius per millisecond)
 */
export function calculateOrbitalVelocity(orbitRadius, orbitPeriod) {
    const periodMs = daysToMs(orbitPeriod);
    const circumference = TWO_PI * orbitRadius;
    return circumference / periodMs;
}

/**
 * Calculate mean orbital angular velocity (radians per millisecond)
 * @param {number} orbitPeriod - Orbital period in days
 * @returns {number} Angular velocity in radians per millisecond
 */
export function calculateAngularVelocity(orbitPeriod) {
    const periodMs = daysToMs(orbitPeriod);
    return TWO_PI / periodMs;
}

/**
 * Calculate the angle (phase) of an orbit at given time
 * @param {number} simulationTime - Current simulation time in milliseconds
 * @param {number} orbitPeriod - Orbital period in days
 * @param {number} startAngle - Starting angle offset in radians (default 0)
 * @returns {number} Current orbital angle in radians (0 to 2π)
 */
export function calculateOrbitalAngle(simulationTime, orbitPeriod, startAngle = 0) {
    const periodMs = daysToMs(orbitPeriod);
    const angle = (startAngle + (simulationTime / periodMs) * TWO_PI) % TWO_PI;
    return angle < 0 ? angle + TWO_PI : angle;
}

/**
 * Calculate position on an elliptical orbit (for future use)
 * Uses Kepler's equation for true anomaly
 * @param {number} simulationTime - Current simulation time in milliseconds
 * @param {number} semiMajorAxis - Semi-major axis (average orbital radius)
 * @param {number} eccentricity - Orbital eccentricity (0 = circular, <1 = ellipse)
 * @param {number} orbitPeriod - Orbital period in days
 * @param {number} longitudeOfPerihelion - Angle to perihelion in radians
 * @returns {Object} Position {x, y, z}
 */
export function calculateEllipticalOrbit(
    simulationTime,
    semiMajorAxis,
    eccentricity,
    orbitPeriod,
    longitudeOfPerihelion = 0
) {
    // Mean anomaly (angle if orbit were circular)
    const periodMs = daysToMs(orbitPeriod);
    const meanAnomaly = (simulationTime / periodMs) * TWO_PI;

    // Solve Kepler's equation iteratively to get eccentric anomaly
    let eccentricAnomaly = meanAnomaly;
    for (let i = 0; i < 5; i++) {
        eccentricAnomaly = meanAnomaly + eccentricity * Math.sin(eccentricAnomaly);
    }

    // Calculate true anomaly (actual angle in orbit)
    const trueAnomaly = 2 * Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
        Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
    );

    // Calculate distance from focus (orbital radius at this point)
    const radius = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));

    // Calculate position
    const angle = trueAnomaly + longitudeOfPerihelion;
    return {
        x: Math.cos(angle) * radius,
        y: 0,
        z: Math.sin(angle) * radius
    };
}

/**
 * Generate an array of points for an orbital path
 * Useful for rendering orbit lines
 * @param {number} orbitRadius - Radius of circular orbit in scene units
 * @param {number} segments - Number of line segments (default 128)
 * @returns {Array} Array of {x, y, z} positions
 */
export function generateOrbitPath(orbitRadius, segments = 128) {
    const points = [];
    const angleStep = TWO_PI / segments;

    for (let i = 0; i <= segments; i++) {
        const angle = i * angleStep;
        points.push({
            x: Math.cos(angle) * orbitRadius,
            y: 0,
            z: Math.sin(angle) * orbitRadius
        });
    }

    return points;
}

/**
 * Generate orbital path for a planet (converts from AU)
 * @param {number} orbitRadiusAU - Orbital radius in AU
 * @param {number} segments - Number of line segments (default 128)
 * @returns {Array} Array of {x, y, z} positions
 */
export function generatePlanetOrbitPath(orbitRadiusAU, segments = 128) {
    const orbitRadiusScene = auToScene(orbitRadiusAU);
    return generateOrbitPath(orbitRadiusScene, segments);
}

/**
 * Calculate time until next orbital event (e.g., reaching a certain angle)
 * @param {number} currentAngle - Current orbital angle in radians
 * @param {number} targetAngle - Target angle in radians
 * @param {number} orbitPeriod - Orbital period in days
 * @returns {number} Time until target angle in milliseconds
 */
export function timeToOrbitalEvent(currentAngle, targetAngle, orbitPeriod) {
    let deltaAngle = targetAngle - currentAngle;
    if (deltaAngle < 0) deltaAngle += TWO_PI;

    const periodMs = daysToMs(orbitPeriod);
    return (deltaAngle / TWO_PI) * periodMs;
}

/**
 * Check if two orbiting bodies are in conjunction (aligned on same side of sun)
 * @param {number} angle1 - Orbital angle of first body in radians
 * @param {number} angle2 - Orbital angle of second body in radians
 * @param {number} threshold - Angular threshold in radians (default π/12 = 15°)
 * @returns {boolean} True if bodies are in conjunction
 */
export function isConjunction(angle1, angle2, threshold = Math.PI / 12) {
    const diff = Math.abs(angle1 - angle2);
    return diff < threshold || diff > (TWO_PI - threshold);
}

/**
 * Check if two orbiting bodies are in opposition (on opposite sides)
 * @param {number} angle1 - Orbital angle of first body in radians
 * @param {number} angle2 - Orbital angle of second body in radians
 * @param {number} threshold - Angular threshold in radians (default π/12 = 15°)
 * @returns {boolean} True if bodies are in opposition
 */
export function isOpposition(angle1, angle2, threshold = Math.PI / 12) {
    const diff = Math.abs(angle1 - angle2);
    const halfCircle = Math.PI;
    return Math.abs(diff - halfCircle) < threshold;
}

// Export all functions
export default {
    calculateOrbitalPosition,
    calculatePlanetPosition,
    calculateMoonPosition,
    calculateOrbitalVelocity,
    calculateAngularVelocity,
    calculateOrbitalAngle,
    calculateEllipticalOrbit,
    generateOrbitPath,
    generatePlanetOrbitPath,
    timeToOrbitalEvent,
    isConjunction,
    isOpposition
};
