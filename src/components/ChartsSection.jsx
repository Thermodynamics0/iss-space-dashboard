import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useISS } from '../hooks/useISS';
import { useNews } from '../hooks/useNews';
import ISSMap from './ISSMap';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_COLORS = ['#63b3ed','#9f7aea','#f6ad55','#68d391','#fc8181'];
const CAT_LABELS = ['Technology','Science','General','Health','Business'];

export default function ChartsSection() {
  const { speedHistory, position, history, speed } = useISS();
  const { distribution } = useNews();

  const speedData = {
    labels: speedHistory.map(s => s.time),
    datasets: [{
      label: 'ISS Speed (km/h)',
      data: speedHistory.map(s => s.speed),
      fill: true,
      borderColor: '#63b3ed',
      backgroundColor: 'rgba(99,179,237,0.1)',
      pointBackgroundColor: '#63b3ed',
      pointRadius: 3,
      tension: 0.4,
    }],
  };

  const pieData = {
    labels: CAT_LABELS,
    datasets: [{
      data: Object.values(distribution),
      backgroundColor: CHART_COLORS.map(c => c + 'cc'),
      borderColor: CHART_COLORS,
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const chartOptions = (title, yLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } },
      title: { display: false },
      tooltip: { backgroundColor: '#1a2035', titleColor: '#e2e8f0', bodyColor: '#94a3b8', borderColor: '#63b3ed33', borderWidth: 1 },
    },
    scales: yLabel ? {
      x: { ticks: { color: '#64748b', maxTicksLimit: 6, font: { size: 11 } }, grid: { color: '#ffffff0a' } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#ffffff0a' }, title: { display: true, text: yLabel, color: '#64748b' } },
    } : undefined,
  });

  return (
    <div>
      <div className="section-title" style={{ marginBottom: '1.5rem' }}>
        <span className="section-title-icon">📊</span>
        Analytics & Visualizations
      </div>

      <div className="charts-grid">
        {/* Speed Chart */}
        <div className="chart-card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div style={{ fontWeight:600, display:'flex', alignItems:'center', gap:'0.5rem' }}>
              ⚡ ISS Speed Over Time
            </div>
            <span className="badge badge-blue">Last {speedHistory.length} readings</span>
          </div>
          {speedHistory.length < 2 ? (
            <div className="loading-overlay" style={{ height: 240 }}>
              <div className="spinner" />
              <span style={{ fontSize:'0.85rem' }}>Collecting speed data...</span>
            </div>
          ) : (
            <div style={{ height: 240 }}>
              <Line data={speedData} options={chartOptions('Speed Chart', 'km/h')} />
            </div>
          )}
        </div>

        {/* Doughnut Chart */}
        <div className="chart-card">
          <div style={{ fontWeight:600, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            📰 Articles by Category
          </div>
          <div style={{ height: 240, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Doughnut
              data={pieData}
              options={{
                ...chartOptions('Category Distribution'),
                plugins: {
                  ...chartOptions('Category Distribution').plugins,
                  legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, padding: 12 } },
                },
                cutout: '65%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Map in charts too */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span>🗺️</span>
          <span style={{ fontWeight:600 }}>ISS Live Map</span>
          {position && (
            <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
              ⚡ {speed} km/h · {history.length} tracked
            </span>
          )}
        </div>
        <div style={{ height: 380 }}>
          <ISSMap position={position} history={history} />
        </div>
      </div>
    </div>
  );
}
