import { useISS } from '../hooks/useISS';
import ISSMap from './ISSMap';
import toast from 'react-hot-toast';

export default function ISSSection() {
  const { position, history, speed, speedHistory, location, people, loading, error, refresh } = useISS();

  const handleRefresh = async () => {
    toast.promise(refresh(), {
      loading: 'Fetching ISS position...',
      success: 'Position updated!',
      error: 'Failed to update position',
    });
  };

  const stats = [
    { label: 'Latitude', value: position ? `${position.lat.toFixed(4)}°` : '—', icon: '📍', sub: 'Current position' },
    { label: 'Longitude', value: position ? `${position.lon.toFixed(4)}°` : '—', icon: '🌐', sub: 'Current position' },
    { label: 'Speed', value: speed ? `${speed.toLocaleString()}` : '—', icon: '⚡', sub: 'km/h' },
    { label: 'Location', value: location, icon: '🗺️', sub: `${history.length}/15 positions` },
  ];

  return (
    <div>
      {/* Stats Row */}
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-title">
            <span className="section-title-icon">🛸</span>
            ISS Live Tracker
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="pulse-dot" />
            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Live</span>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleRefresh} disabled={loading}>
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {error && (
        <div className="error-box" style={{ marginBottom: '1rem' }}>
          <span>⚠️ {error}</span>
          <button className="btn btn-ghost btn-sm" onClick={refresh}>Retry</button>
        </div>
      )}

      <div className="iss-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value mono">
              {loading && !position ? <span className="skeleton" style={{ height: '2rem', display: 'block', width: '80%' }} /> : s.value}
            </span>
            <span className="stat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="map-chart-row">
        {/* Map */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🗺️</span>
            <span style={{ fontWeight: 600 }}>Live Map</span>
            {position && (
              <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>
                Updated {new Date().toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="map-container" style={{ borderRadius: 0, border: 'none' }}>
            <ISSMap position={position} history={history} />
          </div>
        </div>

        {/* People in space */}
        <div className="card">
          <div className="section-title">
            <span className="section-title-icon">👨‍🚀</span>
            People in Space
            {people && (
              <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
                {people.number} total
              </span>
            )}
          </div>
          {!people ? (
            <div className="loading-overlay" style={{ padding: '2rem' }}>
              <div className="spinner" />
              <span style={{ fontSize: '0.85rem' }}>Loading crew data...</span>
            </div>
          ) : (
            <div className="astronaut-list">
              {people.people?.map((p, i) => (
                <div key={i} className="astronaut-item">
                  <div className="astronaut-avatar">
                    {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🚀 {p.craft}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
