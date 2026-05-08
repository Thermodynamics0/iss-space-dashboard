import https from 'https';
import * as satellite from 'satellite.js';

// Cache TLE data (valid for ~6 hours)
let tleCache = null;
let tleCacheTime = 0;
const TLE_TTL = 6 * 60 * 60 * 1000;

function get(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'ISSDashboard/1.0' },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location, timeoutMs).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

async function getTLE() {
  if (tleCache && Date.now() - tleCacheTime < TLE_TTL) return tleCache;
  // CelesTrak — allows server-side access
  const raw = await get('https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE');
  const lines = raw.trim().split('\n').map(l => l.trim().replace(/\r/g, ''));
  if (lines.length >= 3) {
    tleCache = { name: lines[0], tle1: lines[1], tle2: lines[2] };
    tleCacheTime = Date.now();
    return tleCache;
  }
  throw new Error('Invalid TLE data');
}

function propagate(tle, date) {
  const satrec = satellite.twoline2satrec(tle.tle1, tle.tle2);
  const posVel = satellite.propagate(satrec, date);
  if (!posVel || !posVel.position) throw new Error('Propagation failed');
  const gmst = satellite.gstime(date);
  const geo = satellite.eciToGeodetic(posVel.position, gmst);
  const velocity = posVel.velocity;
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2) * 3600; // km/h
  return {
    latitude: parseFloat(satellite.degreesLat(geo.latitude).toFixed(4)),
    longitude: parseFloat(satellite.degreesLong(geo.longitude).toFixed(4)),
    altitude: parseFloat((geo.height).toFixed(2)),
    velocity: Math.round(speed),
    timestamp: Math.floor(date.getTime() / 1000),
    source: 'celestrak-sgp4',
  };
}

// Math fallback
function getMathFallback() {
  const now = Math.floor(Date.now() / 1000);
  const PERIOD = 92.68 * 60;
  const INC = 51.6 * (Math.PI / 180);
  const t = now % PERIOD;
  const angle = (2 * Math.PI * t) / PERIOD;
  const lat = Math.asin(Math.sin(INC) * Math.sin(angle)) * (180 / Math.PI);
  const lon = ((((angle * 180) / Math.PI) - ((now / 86164) * 360)) % 360 + 360) % 360 - 180;
  return { latitude: parseFloat(lat.toFixed(4)), longitude: parseFloat(lon.toFixed(4)), altitude: 408, velocity: 27600, timestamp: now, source: 'mathematical-model' };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=5');

  // Real SGP4 position via CelesTrak TLE
  try {
    const tle = await getTLE();
    const result = propagate(tle, new Date());
    return res.json(result);
  } catch (e) {
    console.error('CelesTrak/SGP4 failed:', e.message);
  }

  return res.json(getMathFallback());
}
