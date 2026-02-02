# Tumorra Horse Racing Lay Strategy Platform

A sophisticated betting strategy platform that analyzes UK & Ireland horse racing data to identify profitable lay betting opportunities on favorites.

## 🎯 Strategy Overview

### Core Strategy: "Smart Favorite Lay"

Based on historical analysis of UK & Ireland racing, this strategy lays (bets against) favorites under specific conditions that have historically shown positive expected value.

### Key Strategy Rules

1. **Odds Range Filter**: Only lay favorites between 2.0 - 4.5 (BSP)
   - Favorites under 2.0: Win too often, liability too high
   - Favorites over 4.5: Not true "favorites" - market uncertainty

2. **Race Type Selection**:
   - ✅ Flat races (non-handicap): Best EV
   - ✅ National Hunt non-handicaps: Good EV
   - ⚠️ Handicap races: Reduced stake (favorites less reliable)
   - ❌ Apprentice/Amateur races: Exclude (too unpredictable)

3. **Field Size Rules**:
   - Minimum 6 runners (more competition = more upsets)
   - Maximum 20 runners (too chaotic beyond this)
   - Sweet spot: 8-14 runners

4. **Going Conditions**:
   - Soft/Heavy going: INCREASE stake by 20% (favorites struggle)
   - Good to Firm: Standard stake
   - Firm: REDUCE stake by 20% (fast ground favors form)

5. **Course Factors**:
   - Left-handed tracks: Standard
   - Right-handed tracks: Standard
   - Figure-8/Unique (Chester, Epsom): INCREASE stake 15% (track specialists often upset)

6. **Seasonal Adjustments**:
   - Jan-Mar: Reduce stakes 10% (winter National Hunt favors known horses)
   - Apr-Jun: Flat season start - standard stakes
   - Jul-Aug: Peak season - standard stakes
   - Sep-Nov: Jumps return - standard stakes
   - December: Holiday period - reduce stakes 15%

### Stake Management (Kelly Criterion Modified)

- **Base Stake**: 0.5% of bankroll per lay
- **Maximum Liability**: 2% of bankroll per race
- **Daily Loss Limit**: 5% of bankroll
- **Weekly Loss Limit**: 10% of bankroll

### Expected Performance (Based on Historical Data)

- **Strike Rate**: Favorites win ~30-35% of qualifying races
- **Average BSP of Favorites**: 2.8-3.2
- **Expected ROI**: 3-8% on turnover
- **Maximum Drawdown Target**: < 15% of bankroll

## 🏗️ Project Structure

```
horse-lay-strategy/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── public/
│   └── package.json
│
├── backend/                  # Python FastAPI
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Core configuration
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
```

## 🚀 Deployment

### Frontend (Cloudflare Pages)
1. Connect GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Build output: `dist`
4. Environment variables in Cloudflare dashboard

### Backend (Google Cloud Run)
1. Build Docker image
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Configure environment variables

## 📊 Data Integration

The platform connects to:
- Betfair Historical Data (CSV/JSON)
- BigQuery for data warehouse
- Real-time Betfair API (optional)

## 🔧 Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 📈 Dashboard Features

1. **Strategy Performance**: Real-time P&L tracking
2. **Race Analysis**: Filter and view qualifying races
3. **Backtesting**: Test strategy against historical data
4. **Risk Management**: Monitor exposure and limits
5. **Bet Tracker**: Log and track all bets

## ⚠️ Risk Disclaimer

This software is for educational and research purposes. Gambling involves risk of loss. Past performance does not guarantee future results. Always gamble responsibly.

---

Built for the Tumorra Project | CapExure Limited
