import { useTheme } from '../context/ThemeContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { theme, toggle } = useTheme();
  const tabs = [
    { id: 'iss', label: 'ISS Tracker', icon: '🛸' },
    { id: 'news', label: 'News', icon: '📰' },
    { id: 'charts', label: 'Analytics', icon: '📊' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span style={{ fontSize: '1.5rem' }}>🛰️</span>
        <span>ISS Dashboard</span>
      </div>

      <div className="navbar-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="navbar-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={toggle}
          data-tip={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ fontSize: '1.1rem', padding: '0.4rem 0.7rem' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}
