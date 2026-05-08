import { useState, useEffect, useRef, useCallback } from 'react';
import { calcSpeed, getNearestLocation } from '../utils/helpers';

const ISS_LOCATION_URL = 'https://api.open-notify.org/iss-now.json';
const ISS_PEOPLE_URL = 'https://api.open-notify.org/astros.json';
const PROXY_LOCATION = '/api/iss/iss-now.json';
const PROXY_PEOPLE = '/api/iss/astros.json';

async function fetchISS(url, fallback) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error();
    return await r.json();
  } catch {
    try {
      const r2 = await fetch(fallback);
      if (!r2.ok) throw new Error();
      return await r2.json();
    } catch {
      throw new Error('ISS API unreachable');
    }
  }
}

export function useISS() {
  const [position, setPosition] = useState(null);
  const [history, setHistory] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [location, setLocation] = useState('Tracking...');
  const [people, setPeople] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevPos = useRef(null);

  const fetchPosition = useCallback(async () => {
    try {
      const data = await fetchISS(PROXY_LOCATION, ISS_LOCATION_URL);
      const lat = parseFloat(data.iss_position.latitude);
      const lon = parseFloat(data.iss_position.longitude);
      const ts = data.timestamp || Math.floor(Date.now() / 1000);
      const pos = { lat, lon, ts };

      if (prevPos.current) {
        const spd = calcSpeed(prevPos.current, pos);
        setSpeed(Math.round(spd));
        setSpeedHistory(prev => [...prev.slice(-29), {
          time: new Date(ts * 1000).toLocaleTimeString(),
          speed: Math.round(spd)
        }]);
      }
      prevPos.current = pos;
      setPosition(pos);
      setHistory(prev => [...prev.slice(-14), pos]);
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
      const data = await fetchISS(PROXY_PEOPLE, ISS_PEOPLE_URL);
      setPeople(data);
    } catch {}
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
