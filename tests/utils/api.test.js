/**
 * Tests for api.js utility module
 */
import { describe, test, expect, jest } from '@jest/globals';

describe('ISS API Integration', () => {
  test('should export issAPI object', async () => {
    const apiModule = await import('../../src/utils/api.js');
    expect(apiModule.issAPI).toBeDefined();
  });

  test('issAPI should have required methods', async () => {
    const { issAPI } = await import('../../src/utils/api.js');
    expect(typeof issAPI.fetchPosition).toBe('function');
    expect(typeof issAPI.startPolling).toBe('function');
    expect(typeof issAPI.stopPolling).toBe('function');
  });

  test('issAPI should have getLastPosition method', async () => {
    const { issAPI } = await import('../../src/utils/api.js');
    expect(typeof issAPI.getLastPosition).toBe('function');
  });

  test('should return position data in correct format', async () => {
    const { issAPI } = await import('../../src/utils/api.js');

    // Get last known position (may be mock data initially)
    const position = issAPI.getLastPosition();

    expect(position).toHaveProperty('latitude');
    expect(position).toHaveProperty('longitude');
    expect(typeof position.latitude).toBe('number');
    expect(typeof position.longitude).toBe('number');
  });

  test('latitude should be between -90 and 90', async () => {
    const { issAPI } = await import('../../src/utils/api.js');
    const position = issAPI.getLastPosition();

    expect(position.latitude).toBeGreaterThanOrEqual(-90);
    expect(position.latitude).toBeLessThanOrEqual(90);
  });

  test('longitude should be between -180 and 180', async () => {
    const { issAPI } = await import('../../src/utils/api.js');
    const position = issAPI.getLastPosition();

    expect(position.longitude).toBeGreaterThanOrEqual(-180);
    expect(position.longitude).toBeLessThanOrEqual(180);
  });
});
