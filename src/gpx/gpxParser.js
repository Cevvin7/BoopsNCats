import { haversineDistanceMeters } from './haversine.js';

const METERS_PER_MILE = 1609.344;
const METERS_PER_KM = 1000;

/**
 * Distance is summed within each <trkseg> only, not across segment
 * boundaries. A new segment usually means the recording was paused and
 * resumed somewhere else (e.g. driving between two runs), and bridging
 * that gap with a straight line would inflate the distance.
 */
export function parseGpxDistance(gpxText) {
  const doc = new DOMParser().parseFromString(gpxText, 'application/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('That file is not valid GPX/XML.');
  }

  const segments = Array.from(doc.getElementsByTagName('trkseg'));
  if (segments.length === 0) {
    throw new Error('No track segments (<trkseg>) found in this GPX file.');
  }

  // Free-text per the GPX spec (no fixed enum) -- boops.js pattern-matches
  // this for cycling detection, treating anything else (running, walking,
  // or a missing/unrecognized type) as the default rate.
  const activityType = doc.querySelector('trk > type')?.textContent?.trim() || null;

  let totalMeters = 0;
  let pointCount = 0;

  for (const segment of segments) {
    const points = Array.from(segment.getElementsByTagName('trkpt'))
      .map((el) => ({
        lat: parseFloat(el.getAttribute('lat')),
        lon: parseFloat(el.getAttribute('lon')),
      }))
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));

    pointCount += points.length;

    for (let i = 1; i < points.length; i++) {
      totalMeters += haversineDistanceMeters(points[i - 1], points[i]);
    }
  }

  if (pointCount === 0) {
    throw new Error('No valid track points (<trkpt> with lat/lon) found in this GPX file.');
  }

  return {
    meters: totalMeters,
    miles: totalMeters / METERS_PER_MILE,
    km: totalMeters / METERS_PER_KM,
    pointCount,
    activityType,
  };
}
