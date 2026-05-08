# 🛸 ISS Space Dashboard

**Live Demo:** https://iss-dashboard-beta.vercel.app  
**GitHub:** https://github.com/Thermodynamics0/iss-space-dashboard

A real-time space dashboard featuring ISS live tracking, news, an AI chatbot, and data visualizations.

---

## 🚀 Features

### Part 1 — ISS Live Tracker
- Real-time ISS position via **CelesTrak TLE + SGP4 propagation** (same method as NASA)
- Updates every **15 seconds** automatically
- Interactive **Leaflet.js map** with custom ISS marker and trajectory path (last 15 positions)
- Displays: Latitude, Longitude, Speed (km/h), Location name
- **People in Space** section with crew names and spacecraft
- Manual refresh button + live indicator

### Part 2 — News Dashboard
- **5 categories:** Technology, Science, General, Health, Business
- **10 articles per category** via NewsData.io API
- Each card shows: Title, Source, Author, Date, Image, Description, Read More link
- **Search bar** to filter articles
- **Sort** by date or source
- **15-minute localStorage cache** to save API credits
- Skeleton loading states + error handling

### Part 3 — AI Chatbot
- Floating button (bottom-right corner) 
- Powered by **Mistral-7B-Instruct-v0.2** via HuggingFace Inference API
- **Restricted to dashboard data only** (ISS + News) — no internet knowledge
- Typing indicator, 30-message localStorage history, clear chat option
- Suggested questions for quick start

### Part 4 — Charts & Visualizations
- **ISS Speed Line Chart** — last 30 readings over time (Chart.js)
- **News Doughnut Chart** — articles per category, color-coded
- **ISS Live Map** — Leaflet.js with zoom, path, and marker tooltip

### Part 5 — UI/UX
- ☀️/🌙 **Dark/Light mode toggle** (persisted in localStorage)
- **Fully responsive** — mobile, tablet, desktop
- Skeleton loaders + spinners
- Toast notifications (react-hot-toast)
- Animated star background

---

## 🤖 AI Model Used

**`mistralai/Mistral-7B-Instruct-v0.2`** via HuggingFace Inference API

**Why Mistral-7B?**
- Open-source and freely available via HuggingFace
- Instruction-tuned — follows system prompts strictly (critical for data-restricted chatbot)
- Efficient 7B parameter model with strong instruction following
- Supports the `[INST]` prompt format for clean context injection
- Ideal for constrained-context applications where the model must NOT use external knowledge

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Maps | Leaflet.js |
| Charts | Chart.js + react-chartjs-2 |
| ISS Tracking | CelesTrak TLE + satellite.js (SGP4) |
| News API | NewsData.io |
| AI | Mistral-7B via HuggingFace |
| Styling | Vanilla CSS (custom design system) |
| Deployment | Vercel (serverless functions) |

---

## 🔧 Setup

```bash
git clone https://github.com/Thermodynamics0/iss-space-dashboard
cd iss-space-dashboard
npm install
cp .env.example .env
# Fill in your API keys in .env
npm run dev
```

## Environment Variables

| Variable | Source | Required |
|---|---|---|
| `VITE_NEWS_API_KEY` | [newsdata.io](https://newsdata.io) | For live news |
| `VITE_HF_TOKEN` | [huggingface.co](https://huggingface.co/settings/tokens) | For Mistral-7B AI |

> Both are optional — the app works in demo mode without them.

---

## 📦 Deployment (Vercel)

```bash
npm i -g vercel
vercel login
vercel --prod
```

Add env vars in Vercel dashboard → Project Settings → Environment Variables.
