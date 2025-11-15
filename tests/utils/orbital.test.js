/**
 * Tests for orbital.js utility module
 */
import { describe, test, expect } from '@jest/globals';

describe('Orbital Mechanics', () => {
  test('should export calculateKeplerianPosition function', async () => {
    const orbitalModule = await import('../../src/utils/orbital.js');
    expect(orbitalModule.calculateKeplerianPosition).toBeDefined();
  });

  test('should calculate position at epoch (t=0)', async () => {
    const { calculateKeplerianPosition } = await import('../../src/utils/orbital.js');

    const elements = {
      semiMajorAxis: 1.0, // 1 AU
      eccentricity: 0.0,  // circular orbit
      inclination: 0.0,
      longitudeOfAscendingNode: 0.0,
      argumentOfPeriapsis: 0.0,
      meanAnomalyAtEpoch: 0.0
    };

    const position = calculateKeplerianPosition(elements, 0);

    expect(position).toHaveProperty('x');
    expect(position).toHaveProperty('y');
    expect(position).toHaveProperty('z');
  });

  test('should handle circular orbits correctly', async () => {
    const { calculateKeplerianPosition } = await import('../../src/utils/orbital.js');

    const elements = {
      semiMajorAxis: 1.0,
      eccentricity: 0.0, // perfectly circular
      inclination: 0.0,
      longitudeOfAscendingNode: 0.0,
      argumentOfPeriapsis: 0.0,
      meanAnomalyAtEpoch: 0.0
    };

    const pos1 = calculateKeplerianPosition(elements, 0);
    const pos2 = calculateKeplerianPosition(elements, Math.PI); // 180 degrees later

    // For circular orbit, distance should be constant
    const dist1 = Math.sqrt(pos1.x**2 + pos1.y**2 + pos1.z**2);
    const dist2 = Math.sqrt(pos2.x**2 + pos2.y**2 + pos2.z**2);

    expect(dist1).toBeCloseTo(dist2, 5);
  });

  test('should handle eccentric orbits correctly', async () => {
    const { calculateKeplerianPosition } = await import('../../src/utils/orbital.js');

    const elements = {
      semiMajorAxis: 1.0,
      eccentricity: 0.2, // eccentric orbit
      inclination: 0.0,
      longitudeOfAscendingNode: 0.0,
      argumentOfPeriapsis: 0.0,
      meanAnomalyAtEpoch: 0.0
    };

    const perihelion = calculateKeplerianPosition(elements, 0);
    const aphelion = calculateKeplerianPosition(elements, Math.PI);

    // Distance should vary
    const periDist = Math.sqrt(perihelion.x**2 + perihelion.y**2 + perihelion.z**2);
    const aphDist = Math.sqrt(aphelion.x**2 + aphelion.y**2 + aphelion.z**2);

    expect(periDist).toBeLessThan(aphDist);
  });
});
