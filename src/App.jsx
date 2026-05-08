import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ISSSection from './components/ISSSection';
import NewsSection from './components/NewsSection';
import ChartsSection from './components/ChartsSection';
import Chatbot from './components/Chatbot';
import { useISS } from './hooks/useISS';
import { useNews } from './hooks/useNews';

// Stars background
function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,
    dur: Math.random() * 4 + 2,
    op: Math.random() * 0.5 + 0.2,
    delay: Math.random() * 4,
  }));
  return (
    <div className="stars-bg">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size,
          '--dur': `${s.dur}s`, '--op': s.op,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}

function AppInner() {
  const [activeTab, setActiveTab] = useState('iss');
  const issData = useISS();
  const { articles } = useNews();

  return (
    <div className="app-wrapper" style={{ position: 'relative' }}>
      <Stars />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="main-content">
          {activeTab === 'iss' && <ISSSection />}
          {activeTab === 'news' && <NewsSection />}
          {activeTab === 'charts' && <ChartsSection />}
        </main>
        <Chatbot issData={issData} newsData={articles} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
