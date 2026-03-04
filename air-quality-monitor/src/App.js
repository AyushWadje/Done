import React, { useState } from 'react';
import { useRealtimeData } from './hooks/useRealtimeData';
import LungHealthDashboard from './pages/LungHealthDashboard';
import ExposureTimeline from './pages/ExposureTimeline';
import RiskAlerts from './pages/RiskAlerts';
import PublicHealthAnalytics from './pages/PublicHealthAnalytics';
import StatusBadge from './components/StatusBadge';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Lung Health', shortLabel: 'Health' },
  { id: 'exposure', label: 'Exposure Timeline', shortLabel: 'Exposure' },
  { id: 'alerts', label: 'Risk & Alerts', shortLabel: 'Alerts' },
  { id: 'analytics', label: 'Public Health', shortLabel: 'Public' },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const data = useRealtimeData(5000);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <LungHealthDashboard
            airQuality={data.airQuality}
            healthMetrics={data.healthMetrics}
            lungImpact={data.lungImpact}
            healthTimeline={data.healthTimeline}
            userProfile={data.userProfile}
          />
        );
      case 'exposure':
        return (
          <ExposureTimeline
            timeline={data.timeline}
            weeklyTrend={data.weeklyTrend}
            airQuality={data.airQuality}
          />
        );
      case 'alerts':
        return (
          <RiskAlerts
            alerts={data.alerts}
            diseaseRisks={data.diseaseRisks}
            suggestions={data.suggestions}
            lungImpact={data.lungImpact}
          />
        );
      case 'analytics':
        return (
          <PublicHealthAnalytics
            publicHealth={data.publicHealth}
            demographics={data.demographics}
            monthlyTrends={data.monthlyTrends}
          />
        );
      default:
        return null;
    }
  };

  const dangerAlerts = data.alerts?.filter(a => a.type === 'danger').length || 0;

  return (
    <div className="min-h-screen bg-dash-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dash-bg/80 backdrop-blur-xl border-b border-dash-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c4-4 8-7.5 8-12a8 8 0 10-16 0c0 4.5 4 8 8 12z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-dash-text leading-tight">AirLung</h1>
                <p className="text-[10px] text-dash-muted leading-tight">Real-Time Respiratory Monitor</p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="hidden md:flex items-center gap-3">
              {data.airQuality && (
                <StatusBadge
                  label={`AQI ${data.airQuality.aqi}`}
                  color={data.airQuality.aqiColor}
                  pulse
                  size="sm"
                />
              )}
              {data.lungImpact && (
                <StatusBadge
                  label={`Impact: ${data.lungImpact.label}`}
                  color={data.lungImpact.color}
                  size="sm"
                />
              )}
              {dangerAlerts > 0 && (
                <StatusBadge
                  label={`${dangerAlerts} Alert${dangerAlerts > 1 ? 's' : ''}`}
                  color="#ef4444"
                  pulse
                  size="sm"
                />
              )}
              <div className="text-[10px] text-dash-muted font-mono">
                Updated {data.lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 -mb-px overflow-x-auto pb-px">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === item.id
                    ? 'text-dash-accent border-dash-accent'
                    : 'text-dash-muted border-transparent hover:text-dash-text hover:border-dash-border'
                }`}
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
                {item.id === 'alerts' && dangerAlerts > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full">
                    {dangerAlerts}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="border-t border-dash-border mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-dash-muted">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-ring" />
              <span>System Online · Real-time monitoring active</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Data refreshes every 5s</span>
              <span>·</span>
              <span>AI Risk Engine v2.4</span>
              <span>·</span>
              <span>AirLung Monitor &copy; 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
