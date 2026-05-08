import https from 'https';
import http from 'http';

// Fetch via built-in http/https module
function get(url, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ISSDashboard/1.0)',
        'Accept': 'application/json',
      },
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location, timeoutMs).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('Invalid JSON')); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 100)}`));
        }
      });
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

// Mathematical ISS position (real orbital parameters)
function getMathematicalISS() {
  const now = Math.floor(Date.now() / 1000);
  const PERIOD = 92.68 * 60;
  const INCLINATION = 51.6 * (Math.PI / 180);
  const t = now % PERIOD;
  const angle = (2 * Math.PI * t) / PERIOD;
  const lat = Math.asin(Math.sin(INCLINATION) * Math.sin(angle)) * (180 / Math.PI);
  const lonRaw = (angle * 180) / Math.PI - ((now / 86164) * 360 % 360);
  const lon = ((lonRaw + 180) % 360) - 180;
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

  // 1. Try open-notify directly
  try {
    const data = await get('http://api.open-notify.org/iss-now.json');
    return res.json({
      latitude: parseFloat(data.iss_position.latitude),
      longitude: parseFloat(data.iss_position.longitude),
      timestamp: data.timestamp,
      velocity: 27600,
      source: 'open-notify',
    });
  } catch (e1) {
    console.log('open-notify failed:', e1.message);
  }

  // 2. Try wheretheiss.at
  try {
    const data = await get('https://api.wheretheiss.at/v1/satellites/25544');
    return res.json({ ...data, source: 'wheretheiss' });
  } catch (e2) {
    console.log('wheretheiss failed:', e2.message);
  }

  // 3. Try corsproxy.io as relay
  try {
    const encoded = encodeURIComponent('https://api.open-notify.org/iss-now.json');
    const data = await get(`https://corsproxy.io/?${encoded}`);
    return res.json({
      latitude: parseFloat(data.iss_position.latitude),
      longitude: parseFloat(data.iss_position.longitude),
      timestamp: data.timestamp,
      velocity: 27600,
      source: 'corsproxy-open-notify',
    });
  } catch (e3) {
    console.log('corsproxy failed:', e3.message);
  }

  // 4. Mathematical model — always works
  return res.json(getMathematicalISS());
}
