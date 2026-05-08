import { useState, useEffect, useCallback } from 'react';
import { lsGet, lsSet } from '../utils/helpers';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const CATEGORIES = ['technology', 'science', 'general', 'health', 'business'];

// NewsData.io category mapping
const NEWSDATA_CAT = {
  technology: 'technology',
  science: 'science',
  general: 'top',
  health: 'health',
  business: 'business',
};

// Normalize NewsData.io article to match our card format
function normalizeNewsData(article) {
  return {
    title: article.title,
    description: article.description,
    urlToImage: article.image_url,
    url: article.link,
    publishedAt: article.pubDate,
    author: Array.isArray(article.creator) ? article.creator[0] : article.creator,
    source: { name: article.source_id || 'NewsData' },
  };
}

async function fetchNews(category) {
  const cacheKey = `iss-news-${category}`;
  const cached = lsGet(cacheKey);
  // Use cached data if fresh (15 min) — saves API credits
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.articles;

  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key_here') {
    return getMockNews(category);
  }

  // NewsData.io endpoint — 200 free req/day
  const ndCat = NEWSDATA_CAT[category] || 'top';
  const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&category=${ndCat}&language=en`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`NewsData API error: ${r.status}`);
  const data = await r.json();
  if (data.status !== 'success') throw new Error(data.message || 'NewsData API error');
  const articles = (data.results || [])
    .filter(a => a.title)
    .slice(0, 10)
    .map(normalizeNewsData);
  lsSet(cacheKey, { ts: Date.now(), articles });
  return articles;
}

function getMockNews(category) {
  const items = {
    technology: [
      { title: 'New AI Chip Breaks Speed Records', source:{name:'TechCrunch'}, author:'Jane Doe', publishedAt:'2026-05-08', description:'A revolutionary AI chip has been unveiled, promising 10x performance improvements.', urlToImage:null, url:'#' },
      { title: 'SpaceX Launches Next-Gen Satellite Constellation', source:{name:'Space News'}, author:'John Smith', publishedAt:'2026-05-07', description:'SpaceX added 60 more satellites to its Starlink constellation, expanding global internet coverage.', urlToImage:null, url:'#' },
      { title: 'Quantum Internet Achieved in Lab Tests', source:{name:'Nature'}, author:'Dr. A. Kumar', publishedAt:'2026-05-06', description:'Scientists achieve quantum entanglement over 100km, paving the way for unhackable internet.', urlToImage:null, url:'#' },
      { title: 'Apple Vision Pro 2 Announced', source:{name:'The Verge'}, author:'Casey Newton', publishedAt:'2026-05-05', description:'Apple unveils the next generation of spatial computing with improved battery life and lighter design.', urlToImage:null, url:'#' },
      { title: 'Google DeepMind Solves Protein Folding 2.0', source:{name:'Science Daily'}, author:'Research Team', publishedAt:'2026-05-04', description:'DeepMind extends AlphaFold to predict protein-protein interactions at atomic scale.', urlToImage:null, url:'#' },
    ],
    science: [
      { title: 'James Webb Telescope Finds Exoplanet Atmosphere', source:{name:'NASA'}, author:'NASA Team', publishedAt:'2026-05-08', description:'JWST detects water vapor and carbon dioxide in an Earth-like exoplanet\'s atmosphere.', urlToImage:null, url:'#' },
      { title: 'CRISPR Therapy Cures Rare Genetic Disease', source:{name:'Medical News'}, author:'Dr. Jones', publishedAt:'2026-05-07', description:'A groundbreaking CRISPR treatment has completely eliminated symptoms in 95% of trial patients.', urlToImage:null, url:'#' },
      { title: 'Dark Matter Signal Detected by Underground Lab', source:{name:'Physics Today'}, author:'CERN Team', publishedAt:'2026-05-06', description:'Scientists report the strongest dark matter detection signal ever recorded in deep underground facility.', urlToImage:null, url:'#' },
      { title: 'New Species of Ancient Human Discovered', source:{name:'Science'}, author:'Paleoanthropologists', publishedAt:'2026-05-05', description:'Fossils found in Ethiopia reveal a new branch of the human family tree from 300,000 years ago.', urlToImage:null, url:'#' },
      { title: 'Nuclear Fusion Plant Achieves Net Energy Gain', source:{name:'Energy News'}, author:'ITER Team', publishedAt:'2026-05-04', description:'The ITER fusion reactor achieved Q>1, producing more energy than consumed for 48 continuous hours.', urlToImage:null, url:'#' },
    ],
    general: [
      { title: 'ISS Crew Returns After Record 400-Day Mission', source:{name:'Reuters'}, author:'Space Desk', publishedAt:'2026-05-08', description:'Three astronauts landed safely after setting a new record for continuous time in space aboard the ISS.', urlToImage:null, url:'#' },
      { title: 'Global Climate Summit Reaches Historic Agreement', source:{name:'BBC'}, author:'Climate Reporter', publishedAt:'2026-05-07', description:'196 nations agree to net-zero emissions by 2045 in a landmark climate accord.', urlToImage:null, url:'#' },
      { title: 'Renewable Energy Surpasses Fossil Fuels for First Time', source:{name:'Guardian'}, author:'Energy Editor', publishedAt:'2026-05-06', description:'Solar and wind power generated more electricity than coal and gas globally for the first time in history.', urlToImage:null, url:'#' },
      { title: 'New Undersea Cable Connects 5 Continents', source:{name:'Bloomberg'}, author:'Tech Desk', publishedAt:'2026-05-05', description:'A 45,000 km submarine cable now provides terabit-speed internet connections across the globe.', urlToImage:null, url:'#' },
      { title: 'Electric Aircraft Completes Transatlantic Flight', source:{name:'Aviation Week'}, author:'Flight Desk', publishedAt:'2026-05-04', description:'A hydrogen-electric hybrid aircraft completed the first zero-emission transatlantic crossing.', urlToImage:null, url:'#' },
    ],
    health: [
      { title: 'mRNA Cancer Vaccine Shows 90% Efficacy', source:{name:'Lancet'}, author:'Oncology Team', publishedAt:'2026-05-08', description:'Personalized mRNA vaccines show remarkable efficacy against multiple cancer types in Phase 3 trials.', urlToImage:null, url:'#' },
      { title: 'Alzheimer\'s Drug Slows Disease by 60%', source:{name:'NEJM'}, author:'Medical Team', publishedAt:'2026-05-07', description:'A new monoclonal antibody therapy significantly slows cognitive decline in early Alzheimer\'s patients.', urlToImage:null, url:'#' },
      { title: 'Wearable Device Detects Heart Attack 2 Hours Early', source:{name:'Cardiology News'}, author:'Dr. Patel', publishedAt:'2026-05-06', description:'AI-powered wearable accurately predicts cardiac events before symptoms appear.', urlToImage:null, url:'#' },
      { title: 'WHO Declares End to Long COVID Emergency', source:{name:'WHO'}, author:'WHO Press', publishedAt:'2026-05-05', description:'Effective treatments bring long COVID burden to manageable levels globally.', urlToImage:null, url:'#' },
      { title: 'Sleep Tracking AI Improves Mental Health Outcomes', source:{name:'Sleep Medicine'}, author:'Research', publishedAt:'2026-05-04', description:'AI-driven sleep optimization shows measurable improvements in depression and anxiety scores.', urlToImage:null, url:'#' },
    ],
    business: [
      { title: 'Space Tourism Revenue Hits $10 Billion', source:{name:'Forbes'}, author:'Business Desk', publishedAt:'2026-05-08', description:'Commercial space travel industry reaches new milestone as flights become more affordable.', urlToImage:null, url:'#' },
      { title: 'AI Startup Valued at $100B in 18 Months', source:{name:'WSJ'}, author:'Finance Team', publishedAt:'2026-05-07', description:'A new AI company achieves centacorn status in record time with enterprise AI solutions.', urlToImage:null, url:'#' },
      { title: 'EV Sales Overtake Combustion Cars in Europe', source:{name:'Financial Times'}, author:'Auto Desk', publishedAt:'2026-05-06', description:'Electric vehicles now account for 52% of all new car sales across the European Union.', urlToImage:null, url:'#' },
      { title: 'Crypto Market Cap Reaches $5 Trillion', source:{name:'CoinDesk'}, author:'Crypto Desk', publishedAt:'2026-05-05', description:'Bitcoin and Ethereum lead cryptocurrency market to record valuation amid institutional adoption.', urlToImage:null, url:'#' },
      { title: 'Remote Work Increases Productivity by 23%', source:{name:'HBR'}, author:'Research Team', publishedAt:'2026-05-04', description:'5-year study confirms distributed teams outperform office-only counterparts across key metrics.', urlToImage:null, url:'#' },
    ],
  };
  return items[category] || items.general;
}

export function useNews() {
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [category, setCategory] = useState('technology');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');

  const loadCategory = useCallback(async (cat, force = false) => {
    if (!force) {
      const cacheKey = `iss-news-${cat}`;
      const cached = lsGet(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        setArticles(prev => ({ ...prev, [cat]: cached.articles }));
        return;
      }
    }
    setLoading(prev => ({ ...prev, [cat]: true }));
    setErrors(prev => ({ ...prev, [cat]: null }));
    try {
      const result = await fetchNews(cat);
      setArticles(prev => ({ ...prev, [cat]: result }));
    } catch (e) {
      setErrors(prev => ({ ...prev, [cat]: e.message }));
      const mock = getMockNews(cat);
      setArticles(prev => ({ ...prev, [cat]: mock }));
    } finally {
      setLoading(prev => ({ ...prev, [cat]: false }));
    }
  }, []);

  useEffect(() => {
    CATEGORIES.forEach(c => loadCategory(c));
  }, [loadCategory]);

  const currentArticles = articles[category] || [];
  const filtered = currentArticles
    .filter(a => !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'date') return new Date(b.publishedAt) - new Date(a.publishedAt);
      if (sort === 'source') return (a.source?.name || '').localeCompare(b.source?.name || '');
      return 0;
    });

  const distribution = CATEGORIES.reduce((acc, c) => {
    acc[c] = (articles[c] || []).length;
    return acc;
  }, {});

  return {
    articles, filtered, distribution,
    category, setCategory,
    search, setSearch,
    sort, setSort,
    loading: loading[category],
    error: errors[category],
    refresh: (cat) => loadCategory(cat || category, true)
  };
}
