import https from 'https';

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

const MOCK_ASTRONAUTS = {
  number: 7,
  people: [
    { name: 'Oleg Kononenko', craft: 'ISS' },
    { name: 'Nikolai Chub', craft: 'ISS' },
    { name: 'Tracy C. Dyson', craft: 'ISS' },
    { name: 'Matthew Dominick', craft: 'ISS' },
    { name: 'Michael Barratt', craft: 'ISS' },
    { name: 'Jeanette Epps', craft: 'ISS' },
    { name: 'Alexander Grebenkin', craft: 'ISS' },
  ],
  message: 'success',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  try {
    const data = await get('https://api.open-notify.org/astros.json');
    return res.json(data);
  } catch (e) {}

  // Fallback with known ISS crew
  return res.json(MOCK_ASTRONAUTS);
}
