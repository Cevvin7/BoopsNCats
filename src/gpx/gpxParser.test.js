import { describe, it, expect } from 'vitest';
import { parseGpxDistance } from './gpxParser.js';
import { haversineDistanceMeters } from './haversine.js';

function gpxWithSegments(segments, { type } = {}) {
  const trksegXml = segments
    .map(
      (points) =>
        `<trkseg>${points
          .map((p) => `<trkpt lat="${p.lat}" lon="${p.lon}"></trkpt>`)
          .join('')}</trkseg>`,
    )
    .join('');
  const typeXml = type ? `<type>${type}</type>` : '';
  return `<?xml version="1.0"?><gpx><trk>${typeXml}${trksegXml}</trk></gpx>`;
}

describe('parseGpxDistance', () => {
  it('sums consecutive-point distance within a single segment', () => {
    const points = [
      { lat: 0, lon: 0 },
      { lat: 0.001, lon: 0 },
      { lat: 0.002, lon: 0.001 },
    ];
    const expectedMeters =
      haversineDistanceMeters(points[0], points[1]) +
      haversineDistanceMeters(points[1], points[2]);

    const result = parseGpxDistance(gpxWithSegments([points]));

    expect(result.meters).toBeCloseTo(expectedMeters, 6);
    expect(result.pointCount).toBe(3);
    expect(result.km).toBeCloseTo(expectedMeters / 1000, 9);
    expect(result.miles).toBeCloseTo(expectedMeters / 1609.344, 9);
  });

  it('does not bridge the gap between two separate segments', () => {
    const segmentA = [
      { lat: 0, lon: 0 },
      { lat: 0.001, lon: 0 },
    ];
    // Far away from segmentA — if the parser bridged segments, this jump
    // would dominate the total.
    const segmentB = [
      { lat: 45, lon: 45 },
      { lat: 45.001, lon: 45 },
    ];

    const expectedMeters =
      haversineDistanceMeters(segmentA[0], segmentA[1]) +
      haversineDistanceMeters(segmentB[0], segmentB[1]);

    const result = parseGpxDistance(gpxWithSegments([segmentA, segmentB]));

    expect(result.meters).toBeCloseTo(expectedMeters, 6);
  });

  it('reads the activity type from <trk><type> when present', () => {
    const points = [
      { lat: 0, lon: 0 },
      { lat: 0.001, lon: 0 },
    ];
    const result = parseGpxDistance(gpxWithSegments([points], { type: 'cycling' }));
    expect(result.activityType).toBe('cycling');
  });

  it('gives a null activity type when <type> is absent', () => {
    const points = [
      { lat: 0, lon: 0 },
      { lat: 0.001, lon: 0 },
    ];
    const result = parseGpxDistance(gpxWithSegments([points]));
    expect(result.activityType).toBeNull();
  });

  it('throws a friendly error for malformed XML', () => {
    expect(() => parseGpxDistance('<gpx><trk>')).toThrow();
  });

  it('throws a friendly error when there are no track segments', () => {
    expect(() => parseGpxDistance('<gpx></gpx>')).toThrow(/trkseg/);
  });

  it('throws a friendly error when a segment has no valid points', () => {
    expect(() => parseGpxDistance('<gpx><trk><trkseg></trkseg></trk></gpx>')).toThrow(/trkpt/);
  });
});
