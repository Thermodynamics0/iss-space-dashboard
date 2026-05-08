// Haversine formula – distance in km between two lat/lon points
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Speed in km/h between two positions (with timestamps in seconds)
export function calcSpeed(pos1, pos2) {
  const dist = haversine(pos1.lat, pos1.lon, pos2.lat, pos2.lon);
  const dtHours = Math.abs(pos2.ts - pos1.ts) / 3600;
  if (dtHours === 0) return 0;
  return dist / dtHours;
}

// LocalStorage helpers
export function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
export function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// Format date
export function fmtDate(str) {
  try {
    return new Date(str).toLocaleDateString('en-US', {
      month:'short', day:'numeric', year:'numeric'
    });
  } catch { return str; }
}

// Nearest city/ocean (simple approximation using known regions)
export function getNearestLocation(lat, lon) {
  // Major ocean regions
  if (lon >= -180 && lon <= -30 && lat >= -60 && lat <= 70) return 'Atlantic Ocean';
  if (lon >= 30 && lon <= 150 && lat >= -60 && lat <= 30) return 'Indian Ocean';
  if ((lon >= 150 || lon <= -100) && lat >= -60 && lat <= 60) return 'Pacific Ocean';
  if (lat > 66) return 'Arctic Ocean';
  if (lat < -60) return 'Southern Ocean';

  // Rough continental regions
  if (lat >= 25 && lat <= 70 && lon >= -130 && lon <= -60) return 'North America';
  if (lat >= -55 && lat <= 15 && lon >= -85 && lon <= -30) return 'South America';
  if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) return 'Europe';
  if (lat >= -35 && lat <= 37 && lon >= -20 && lon <= 55) return 'Africa';
  if (lat >= 10 && lat <= 75 && lon >= 40 && lon <= 150) return 'Asia';
  if (lat >= -50 && lat <= -10 && lon >= 110 && lon <= 155) return 'Australia';
  return `${Math.abs(lat).toFixed(1)}°${lat>=0?'N':'S'}, ${Math.abs(lon).toFixed(1)}°${lon>=0?'E':'W'}`;
}

// Truncate text
export function truncate(str, n = 120) {
  return str && str.length > n ? str.slice(0, n) + '...' : str;
}
