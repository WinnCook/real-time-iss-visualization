/**
 * Tests for time.js utility module
 */
import { describe, test, expect, beforeEach } from '@jest/globals';

describe('Time Management', () => {
  test('should export TimeManager class', async () => {
    const timeModule = await import('../../src/utils/time.js');
    expect(timeModule.TimeManager).toBeDefined();
  });

  test('TimeManager should initialize with default speed', async () => {
    const { TimeManager } = await import('../../src/utils/time.js');
    const tm = new TimeManager();
    expect(tm.getTimeSpeed()).toBe(100000); // Default from constants
  });

  test('TimeManager should allow speed changes', async () => {
    const { TimeManager } = await import('../../src/utils/time.js');
    const tm = new TimeManager();
    tm.setTimeSpeed(5000);
    expect(tm.getTimeSpeed()).toBe(5000);
  });

  test('TimeManager should pause and resume', async () => {
    const { TimeManager } = await import('../../src/utils/time.js');
    const tm = new TimeManager();
    tm.pause();
    expect(tm.isPaused()).toBe(true);
    tm.resume();
    expect(tm.isPaused()).toBe(false);
  });

  test('TimeManager should calculate elapsed time correctly', async () => {
    const { TimeManager } = await import('../../src/utils/time.js');
    const tm = new TimeManager();
    tm.setTimeSpeed(1000);

    const startTime = tm.getSimulationTime();
    // Simulate frame update
    tm.update(16); // 16ms frame
    const endTime = tm.getSimulationTime();

    expect(endTime).toBeGreaterThan(startTime);
  });
});
