/**
 * Geospatial helpers for the map/home experience. Pure functions — no I/O — so
 * they can run identically on native and web and inside selectors.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6_371_000;

/** Great-circle distance between two coordinates, in meters. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Human distance label, e.g. "120 m" or "1.4 km". Never exposes a coordinate. */
export function formatDistance(meters: number): string {
  if (meters < 950) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Deterministic privacy fuzz. Offsets a report's coordinate by up to ~35 m based
 * on a hash of its id, so the map never pinpoints an exact location while pins
 * stay stable across renders.
 */
export function fuzzCoordinate(point: LatLng, seed: string): LatLng {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u1 = ((h >>> 0) & 0xffff) / 0xffff - 0.5;
  const u2 = ((h >>> 16) & 0xffff) / 0xffff - 0.5;
  const meters = 35;
  const dLat = (u1 * meters) / 111_320;
  const dLng = (u2 * meters) / (111_320 * Math.cos((point.lat * Math.PI) / 180));
  return { lat: point.lat + dLat, lng: point.lng + dLng };
}
