import { describe, it, expect } from 'vitest';
import { metersToBoops } from './boops.js';

describe('metersToBoops', () => {
  it('gives 1 boop per whole meter', () => {
    expect(metersToBoops(100)).toBe(100);
  });

  it('rounds any fractional meter up to the next boop', () => {
    expect(metersToBoops(100.1)).toBe(101);
    expect(metersToBoops(0.01)).toBe(1);
  });

  it('gives 0 boops for 0 or negative distance', () => {
    expect(metersToBoops(0)).toBe(0);
    expect(metersToBoops(-5)).toBe(0);
  });
});
