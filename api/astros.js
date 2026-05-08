// Vercel serverless function — proxies astronaut data server-side
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  try {
    const r = await fetch('https://api.open-notify.org/astros.json');
    if (r.ok) {
      const data = await r.json();
      return res.json(data);
    }
  } catch {}

  res.status(503).json({ error: 'Astronaut API unavailable' });
}
