import { useNews, CATEGORIES } from '../hooks/useNews';
import { fmtDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const CAT_ICONS = { technology:'💻', science:'🔬', general:'🌍', health:'❤️', business:'💼' };

function NewsCard({ article }) {
  return (
    <div className="news-card">
      {article.urlToImage
        ? <img className="news-card-img" src={article.urlToImage} alt={article.title} onError={e => { e.target.style.display='none'; }} />
        : <div className="news-card-img-placeholder">
            <span style={{fontSize:'3rem'}}>📰</span>
          </div>
      }
      <div className="news-card-body">
        <div className="news-card-source">
          <span className="badge badge-blue">{article.source?.name || 'Unknown'}</span>
          <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{fmtDate(article.publishedAt)}</span>
        </div>
        <h3 className="news-card-title">{article.title}</h3>
        {article.author && (
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'0.4rem' }}>By {article.author}</div>
        )}
        <p className="news-card-desc">{article.description || 'No description available.'}</p>
        <div className="news-card-footer">
          <a
            href={article.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ textDecoration:'none' }}
          >
            Read More →
          </a>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="news-card">
      <div className="skeleton news-card-img" />
      <div className="news-card-body" style={{gap:'0.75rem', display:'flex', flexDirection:'column'}}>
        <div className="skeleton" style={{height:'1rem', width:'40%'}} />
        <div className="skeleton" style={{height:'1.2rem', width:'90%'}} />
        <div className="skeleton" style={{height:'1.2rem', width:'70%'}} />
        <div className="skeleton" style={{height:'3rem', width:'100%'}} />
        <div className="skeleton" style={{height:'2rem', width:'35%'}} />
      </div>
    </div>
  );
}

export default function NewsSection() {
  const {
    filtered, distribution, category, setCategory,
    search, setSearch, sort, setSort,
    loading, error, refresh
  } = useNews();

  const handleRefresh = () => {
    toast.promise(Promise.resolve(refresh()), {
      loading: 'Refreshing news...',
      success: 'News updated!',
      error: 'Failed to refresh'
    });
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <div className="section-title">
            <span className="section-title-icon">📰</span>
            News Dashboard
          </div>
          <div className="category-tabs">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`cat-tab ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {CAT_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
                {distribution[c] > 0 && <span style={{marginLeft:'4px', opacity:0.7}}>({distribution[c]})</span>}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleRefresh}>🔄 Refresh</button>
      </div>

      <div className="news-controls">
        <div className="search-bar">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)'}} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="source">Sort by Source</option>
        </select>
      </div>

      {error && (
        <div className="error-box" style={{marginBottom:'1rem', padding:'1rem', flexDirection:'row', gap:'1rem'}}>
          <span>⚠️ {error} — Showing cached/demo data</span>
        </div>
      )}

      {loading ? (
        <div className="news-grid">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="loading-overlay">
          <span style={{fontSize:'3rem'}}>🔍</span>
          <p>No articles found for "{search}"</p>
          <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear search</button>
        </div>
      ) : (
        <div className="news-grid">
          {filtered.map((a, i) => <NewsCard key={i} article={a} />)}
        </div>
      )}

      <div style={{marginTop:'1rem', textAlign:'center', color:'var(--text-muted)', fontSize:'0.8rem'}}>
        Showing {filtered.length} articles · Category: {category}
        {!import.meta.env.VITE_NEWS_API_KEY || import.meta.env.VITE_NEWS_API_KEY === 'your_newsapi_key_here'
          ? ' · Demo mode (add VITE_NEWS_API_KEY from gnews.io for live news)'
          : ' · Live data via GNews'}
      </div>
    </div>
  );
}
