import { useEffect, useRef } from 'react';

// Dynamically load Leaflet to avoid SSR issues
let L = null;

export default function ISSMap({ position, history }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const pathRef = useRef(null);
  const leafletLoaded = useRef(false);

  useEffect(() => {
    const initMap = async () => {
      if (!leafletLoaded.current) {
        L = (await import('leaflet')).default;
        leafletLoaded.current = true;
      }
      if (!mapInstanceRef.current && mapRef.current) {
        const map = L.map(mapRef.current, {
          center: [0, 0],
          zoom: 2,
          minZoom: 1,
          maxZoom: 8,
          zoomControl: true,
          scrollWheelZoom: true,
        });
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          { attribution: '© CARTO', maxZoom: 19 }
        ).addTo(map);
        mapInstanceRef.current = map;
      }
    };
    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !position || !L) return;
    const { lat, lon } = position;

    // Custom ISS icon
    const issIcon = L.divIcon({
      html: `<div style="font-size:2rem;filter:drop-shadow(0 0 8px #63b3ed);animation:spin 4s linear infinite;">🛸</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      className: '',
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    } else {
      markerRef.current = L.marker([lat, lon], { icon: issIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>🛸 ISS</b><br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`);
    }
    mapInstanceRef.current.panTo([lat, lon], { animate: true, duration: 1 });

    // Draw path
    if (history && history.length > 1) {
      const latlngs = history.map(p => [p.lat, p.lon]);
      if (pathRef.current) {
        pathRef.current.setLatLngs(latlngs);
      } else {
        pathRef.current = L.polyline(latlngs, {
          color: '#63b3ed',
          weight: 2,
          opacity: 0.7,
          dashArray: '6 4',
        }).addTo(mapInstanceRef.current);
      }
      // Add small dots for history
      history.forEach((p, i) => {
        if (i < history.length - 1) {
          L.circleMarker([p.lat, p.lon], {
            radius: 3,
            color: '#9f7aea',
            fillColor: '#9f7aea',
            fillOpacity: 0.6,
          }).addTo(mapInstanceRef.current)
            .bindPopup(`Position ${i + 1}<br>Lat: ${p.lat.toFixed(3)}<br>Lon: ${p.lon.toFixed(3)}`);
        }
      });
    }
  }, [position, history]);

  return <div ref={mapRef} id="iss-map" style={{ height: '100%', width: '100%' }} />;
}
