import { useState, useEffect, useRef, useCallback } from 'react';
import { getNearestLocation } from '../utils/helpers';

// Our own Vercel serverless proxies — no CORS, no rate limits from browser
const ISS_POSITION_URL = '/api/iss';
const ISS_PEOPLE_URL = '/api/astros';

export function useISS() {
  const [position, setPosition] = useState(null);
  const [history, setHistory] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [location, setLocation] = useState('Tracking...');
  const [people, setPeople] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosition = useCallback(async () => {
    try {
      const r = await fetch(ISS_POSITION_URL);
      if (!r.ok) throw new Error(`ISS API error: ${r.status}`);
      const data = await r.json();

      const lat = parseFloat(data.latitude);
      const lon = parseFloat(data.longitude);
      const ts = data.timestamp || Math.floor(Date.now() / 1000);
      // velocity is already in km/h from wheretheiss.at
      const spd = Math.round(data.velocity || 0);
      const pos = { lat, lon, ts };

      setPosition(pos);
      setSpeed(spd);
      setHistory(prev => [...prev.slice(-14), pos]);
      setSpeedHistory(prev => [...prev.slice(-29), {
        time: new Date(ts * 1000).toLocaleTimeString(),
        speed: spd
      }]);
      setLocation(getNearestLocation(lat, lon));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPeople = useCallback(async () => {
    try {
      const r = await fetch(ISS_PEOPLE_URL);
      if (!r.ok) throw new Error();
      const data = await r.json();
      setPeople(data);
    } catch {
      // silently fail — non-critical
    }
  }, []);

  useEffect(() => {
    fetchPosition();
    fetchPeople();
    const interval = setInterval(fetchPosition, 15000);
    const peopleInterval = setInterval(fetchPeople, 300000);
    return () => { clearInterval(interval); clearInterval(peopleInterval); };
  }, [fetchPosition, fetchPeople]);

  return {
    position, history, speed, speedHistory, location,
    people, loading, error, refresh: fetchPosition
  };
}
