# AirLung — Real-Time Air Quality Monitoring & Lung Impact System

A comprehensive real-time air quality monitoring and respiratory health assessment system that combines simulated air quality sensor data, wearable health metrics, and AI-powered risk models to estimate lung impact and disease risk.

## Features

### 1. Personal Lung Health Dashboard
- **Real-time vital signs**: SpO₂, heart rate, respiratory rate, blood pressure
- **Lung Impact Score**: AI-computed composite score combining air quality exposure and health metrics
- **FEV1 Breathing Quality Gauge**: Lung capacity monitoring with baseline comparison
- **24-hour health timeline**: Lung score, SpO₂, and heart rate trends
- **Impact factor breakdown**: Radial chart showing contribution of each risk component
- **Active symptoms monitor**: Real-time symptom tracking with severity indicators

### 2. Pollution Exposure Timeline
- **24-hour pollutant timeline**: Interactive chart with pollutant selector (AQI, PM2.5, PM10, O₃, NO₂)
- **Exposure duration breakdown**: Visual bar showing hours spent in each AQI category
- **Multi-pollutant comparison**: Overlay chart comparing all pollutant levels
- **Cumulative exposure tracking**: Running average with hourly AQI bars
- **7-day AQI trend**: Weekly min/avg/max comparison
- **Current pollutant readings table**: Detailed breakdown of all measured pollutants

### 3. Risk Alerts & Preventive Suggestions
- **AI-powered risk assessment**: Real-time risk scoring with severity classification
- **Active alerts system**: Filterable alerts (Critical, Warning, Info) with timestamps
- **Disease risk assessment**: Horizontal bar chart + detailed cards for 6 disease categories
- **Preventive recommendations**: Categorized suggestions (Environment, Protection, Medication, Exercise, Hydration, Monitoring)

### 4. Public Health Analytics Panel
- **Regional air quality overview**: Ranked list of 8 monitored regions with AQI, trends, and hospital visits
- **AQI vs Hospital Visits correlation**: Scatter plot showing population-weighted correlation
- **6-month health impact trends**: Multi-area chart tracking hospital admissions, asthma incidents, COPD exacerbations
- **Population distribution**: Pie chart by age demographic
- **Demographic risk radar**: Multi-axis radar comparing sensitivity, exposure, and risk index
- **Disease rates by region**: Comparative bar chart for asthma and COPD rates
- **Monthly AQI vs admissions**: Dual-axis line chart showing correlation over time

## Tech Stack

- **React 18** — UI framework
- **Tailwind CSS 3.4** — Utility-first styling with custom dark theme
- **Recharts** — Data visualization (Area, Bar, Line, Pie, Radar, Scatter, Radial charts)
- **Custom AI Risk Engine** — Weighted scoring algorithm combining AQI + health metrics

## Architecture

```
src/
├── App.js                          # Main app with navigation
├── hooks/
│   └── useRealtimeData.js          # Real-time data hook (5s refresh)
├── utils/
│   ├── airQualityData.js           # Air quality sensor simulation
│   ├── healthData.js               # Wearable health data simulation
│   └── riskEngine.js               # AI risk assessment engine
├── components/
│   ├── GaugeChart.js               # SVG semi-circular gauge
│   ├── MetricCard.js               # Vital sign metric card
│   └── StatusBadge.js              # Status indicator badge
└── pages/
    ├── LungHealthDashboard.js      # Personal health dashboard
    ├── ExposureTimeline.js         # Pollution exposure timeline
    ├── RiskAlerts.js               # Risk alerts & suggestions
    └── PublicHealthAnalytics.js    # Public health analytics
```

## Getting Started

```bash
cd air-quality-monitor
npm install
npm start
```

The app runs at `http://localhost:3000` with real-time data updates every 5 seconds.

## Data Simulation

All data is realistically simulated with:
- **Temporal patterns**: Rush hour pollution spikes (7-9 AM, 5-7 PM)
- **AQI-health correlation**: Higher AQI degrades SpO₂, FEV1, increases heart rate
- **Weighted risk scoring**: AI engine combines 5 factors with sensitivity multipliers
- **Disease risk modeling**: 6 disease categories with AQI, health, and sensitivity weights

## Design

- Dark medical-grade dashboard aesthetic
- Responsive layout (mobile → desktop)
- Real-time animations and transitions
- Color-coded severity system (green → yellow → orange → red → purple)
- Google Fonts: Inter (UI) + JetBrains Mono (data)
