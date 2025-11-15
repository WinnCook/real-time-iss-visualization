/**
 * Tests for coordinates.js utility module
 */
import { describe, test, expect } from '@jest/globals';

describe('Coordinate Conversions', () => {
  test('should export geographicToScenePosition function', async () => {
    const coordModule = await import('../../src/utils/coordinates.js');
    expect(coordModule.geographicToScenePosition).toBeDefined();
  });

  test('should convert latitude 0, longitude 0 to equator position', async () => {
    const { geographicToScenePosition } = await import('../../src/utils/coordinates.js');
    const result = geographicToScenePosition(0, 0, 0);

    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
    expect(result).toHaveProperty('z');
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    expect(typeof result.z).toBe('number');
  });

  test('should handle north pole correctly', async () => {
    const { geographicToScenePosition } = await import('../../src/utils/coordinates.js');
    const result = geographicToScenePosition(90, 0, 0);

    expect(result.y).toBeGreaterThan(0); // North pole should be positive Y
  });

  test('should handle south pole correctly', async () => {
    const { geographicToScenePosition } = await import('../../src/utils/coordinates.js');
    const result = geographicToScenePosition(-90, 0, 0);

    expect(result.y).toBeLessThan(0); // South pole should be negative Y
  });

  test('should handle altitude correctly', async () => {
    const { geographicToScenePosition } = await import('../../src/utils/coordinates.js');
    const seaLevel = geographicToScenePosition(0, 0, 0);
    const elevated = geographicToScenePosition(0, 0, 400000); // ISS altitude ~400km

    // Distance from origin should be greater with altitude
    const seaLevelDist = Math.sqrt(seaLevel.x**2 + seaLevel.y**2 + seaLevel.z**2);
    const elevatedDist = Math.sqrt(elevated.x**2 + elevated.y**2 + elevated.z**2);

    expect(elevatedDist).toBeGreaterThan(seaLevelDist);
  });
});
