// Vercel serverless function — proxies ISS position APIs server-side
// Tries open-notify first, falls back to wheretheiss.at
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=5');

  // Try open-notify.org (HTTPS)
  try {
    const r = await fetch('https://api.open-notify.org/iss-now.json');
    if (r.ok) {
      const data = await r.json();
      return res.json({
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        timestamp: data.timestamp,
        velocity: 27600, // ISS average speed km/h
      });
    }
  } catch {}

  // Fallback: wheretheiss.at
  try {
    const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (r.ok) {
      const data = await r.json();
      return res.json(data);
    }
  } catch {}

  res.status(503).json({ error: 'ISS API unavailable' });
}
