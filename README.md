# ISS Space Dashboard 🛸

A full-stack space dashboard featuring:
- **Live ISS Tracking** — Real-time ISS position updated every 15 seconds with Haversine speed calculation
- **Interactive Map** — Leaflet.js map with path history and custom markers
- **News Dashboard** — 5 categories, search, sort, localStorage caching (15 min)
- **AI Chatbot** — Mistral-7B via HuggingFace, answers ONLY from dashboard data
- **Analytics Charts** — Speed line chart + news doughnut chart (Chart.js)
- **Dark/Light Mode** — Persisted in localStorage
- **Responsive** — Mobile, tablet, desktop

## Setup

```bash
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_NEWS_API_KEY` | From newsapi.org |
| `VITE_HF_TOKEN` | HuggingFace API token |

> **Note:** Both are optional — the app works in demo mode without them.

## Deployment (Vercel)

```bash
npm i -g vercel
vercel login
vercel --prod
```

Add env vars in Vercel dashboard before deploying.

## Tech Stack

- React + Vite
- Leaflet.js (maps)
- Chart.js / react-chartjs-2 (charts)
- Mistral-7B-Instruct-v0.2 (AI via HuggingFace)
- NewsAPI.org (news)
- open-notify.org (ISS data)
