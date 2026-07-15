import { describe, it, expect } from 'vitest';
import { metersToBoops, isCyclingActivity } from './boops.js';

describe('isCyclingActivity', () => {
  it('recognizes common cycling type strings, case-insensitively', () => {
    expect(isCyclingActivity('cycling')).toBe(true);
    expect(isCyclingActivity('Cycling')).toBe(true);
    expect(isCyclingActivity('biking')).toBe(true);
    expect(isCyclingActivity('mountain bike')).toBe(true);
  });

  it('treats running, walking, and missing/unrecognized types as non-cycling', () => {
    expect(isCyclingActivity('running')).toBe(false);
    expect(isCyclingActivity('walking')).toBe(false);
    expect(isCyclingActivity(null)).toBe(false);
    expect(isCyclingActivity(undefined)).toBe(false);
    expect(isCyclingActivity('hiking')).toBe(false);
  });
});

describe('metersToBoops', () => {
  it('gives 1 boop per 10 meters for running/walking', () => {
    expect(metersToBoops(100, 'running')).toBe(10);
    expect(metersToBoops(100, 'walking')).toBe(10);
  });

  it('uses the base rate when no activity type is given', () => {
    expect(metersToBoops(100, null)).toBe(10);
    expect(metersToBoops(100, undefined)).toBe(10);
  });

  it('halves the rate for cycling activities', () => {
    expect(metersToBoops(100, 'cycling')).toBe(5);
    expect(metersToBoops(1000, 'biking')).toBe(50);
  });

  it('rounds any fractional boop up, in the user\'s favor', () => {
    expect(metersToBoops(101, 'running')).toBe(11); // 10.1 -> 11
    expect(metersToBoops(1, 'running')).toBe(1); // 0.1 -> 1
    expect(metersToBoops(11, 'cycling')).toBe(1); // 0.55 -> 1
  });

  it('gives 0 boops for 0 or negative distance', () => {
    expect(metersToBoops(0, 'running')).toBe(0);
    expect(metersToBoops(-5, 'running')).toBe(0);
  });
});
