import { describe, it, expect } from 'vitest';
import { haversineDistanceMeters } from './haversine.js';

describe('haversineDistanceMeters', () => {
  it('returns 0 for identical points', () => {
    const p = { lat: 40.0, lon: -105.0 };
    expect(haversineDistanceMeters(p, p)).toBeCloseTo(0, 6);
  });

  it('matches a known distance: 1 degree of latitude is ~111.19km', () => {
    const a = { lat: 0, lon: 0 };
    const b = { lat: 1, lon: 0 };
    expect(haversineDistanceMeters(a, b)).toBeCloseTo(111195, -2);
  });

  it('matches a known real-world distance (NYC to Philadelphia, ~130km)', () => {
    const nyc = { lat: 40.7128, lon: -74.006 };
    const philly = { lat: 39.9526, lon: -75.1652 };
    const meters = haversineDistanceMeters(nyc, philly);
    expect(meters).toBeGreaterThan(125000);
    expect(meters).toBeLessThan(135000);
  });
});
