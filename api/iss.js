import https from 'https';

// Use built-in https module (works in all Node versions, bypasses fetch issues)
function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 ISS-Dashboard/1.0' },
      timeout: 5000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('Invalid JSON')); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// Mathematical ISS position approximation
// ISS: 51.6° inclination, ~92.68 min period, ~408 km altitude
function getMathematicalISS() {
  const now = Math.floor(Date.now() / 1000);
  const PERIOD = 92.68 * 60; // seconds
  const INCLINATION = 51.6 * (Math.PI / 180);
  const t = now % PERIOD;
  const angle = (2 * Math.PI * t) / PERIOD;
  const lat = Math.asin(Math.sin(INCLINATION) * Math.sin(angle)) * (180 / Math.PI);
  const lonOffset = ((now * (360 / 86164)) % 360); // Earth rotation
  const lon = (((angle * 180) / Math.PI) - lonOffset + 180) % 360 - 180;
  return {
    latitude: parseFloat(lat.toFixed(4)),
    longitude: parseFloat(lon.toFixed(4)),
    timestamp: now,
    velocity: 27600,
    source: 'mathematical-model',
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=5');

  // Try open-notify.org
  try {
    const data = await get('https://api.open-notify.org/iss-now.json');
    return res.json({
      latitude: parseFloat(data.iss_position.latitude),
      longitude: parseFloat(data.iss_position.longitude),
      timestamp: data.timestamp,
      velocity: 27600,
      source: 'open-notify',
    });
  } catch (e) {}

  // Try wheretheiss.at
  try {
    const data = await get('https://api.wheretheiss.at/v1/satellites/25544');
    return res.json({ ...data, source: 'wheretheiss' });
  } catch (e) {}

  // Mathematical model fallback — always works
  return res.json(getMathematicalISS());
}
