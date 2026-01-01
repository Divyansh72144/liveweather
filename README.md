# 🌍 Hazard Map

Global weather visualization dashboard displaying real-time weather data for 500+ cities on an interactive map.

## 🏗️ Architecture

```mermaid
graph TB
    subgraph FRONTEND ["🎨 FRONTEND"]
        APP["React App (Vite + React 19)<br/>━━━━━━━━━━━━━━━━━━━━<br/>• App.jsx - State management<br/>• WeatherMap.jsx - Leaflet map<br/>• Sidebar.jsx - City list + search<br/>• Custom hooks - Gestures<br/>• Utilities - API, timezone, weather"]
    end

    subgraph BACKEND ["⚡ BACKEND API"]
        API["Vercel Serverless Functions<br/>━━━━━━━━━━━━━━━━━━━━<br/>• GET /api/weather - Fetch all cities<br/>• GET /api/health - Cache status<br/>• POST /api/prewarm-cache - Refresh cache"]
    end

    subgraph CACHE ["💾 DATA CACHE"]
        REDIS["Upstash Redis<br/>━━━━━━━━━━━━━━━━━━━━<br/>• 500 cities weather data<br/>• 24-hour TTL<br/>• Global edge distribution"]
    end

    subgraph EXTERNAL ["🌍 EXTERNAL"]
        OPEN["Open-Meteo API<br/>━━━━━━━━━━━━━━━━━━━━<br/>• Weather data source"]
        CRON["cron-job.org<br/>━━━━━━━━━━━━━━━━━━━━<br/>• Triggers every 24 hours"]
    end

    APP -->|"1. GET /api/weather"| API
    API -->|"2. Read cache"| REDIS
    REDIS -->|"3. Return data"| API
    API -->|"4. JSON response"| APP

    CRON -->|"5. Trigger refresh"| API
    API -->|"6. Fetch fresh data"| OPEN
    OPEN -->|"7. Weather data"| API
    API -->|"8. Update cache"| REDIS

    style APP fill:#61dafb,color:#fff
    style API fill:#000,color:#fff
    style REDIS fill:#dc3545,color:#fff
    style OPEN fill:#28a745,color:#fff
    style CRON fill:#ffc107,color:#000
```

## ✨ Features

- Interactive map with marker clustering
- Real-time weather data (temperature, wind, conditions)
- Search, filter, and sort cities
- Mobile-optimized with smooth gestures
- Accurate local time for each city

## 🚀 Tech Stack

**Frontend:** React 19, Vite 7, Leaflet, tz-lookup
**Backend:** Vercel Serverless, Upstash Redis
**Data:** Open-Meteo API (free, no API key needed)

## 📦 Setup

```bash
npm install
npm run dev
```

## 📂 Project Structure

```
src/
├── components/       # React components
├── hooks/           # Custom gesture hooks
├── services/        # API client
├── utils/           # Helper functions
├── data/            # City data
└── App.jsx          # Main app
```

## 🔄 How It Works

1. **Cron** → Refreshes cache every 24 hours
2. **Frontend** → Fetches cached weather from API
3. **Users** → Browse map, search cities, see weather

## 🛠️ Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

---

**Built with React + Vite + Leaflet**
