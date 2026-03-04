import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatusBadge from '../components/StatusBadge';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dash-card border border-dash-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-dash-muted mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-mono font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const alertTypeStyles = {
  danger: { bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500', text: 'text-red-400', label: 'Critical' },
  warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-500', text: 'text-yellow-400', label: 'Warning' },
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-500', text: 'text-blue-400', label: 'Info' },
};

const urgencyColors = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: '#ef4444' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: '#eab308' },
  low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: '#22c55e' },
};

const riskColors = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

export default function RiskAlerts({ alerts, diseaseRisks, suggestions, lungImpact }) {
  const [alertFilter, setAlertFilter] = useState('all');

  if (!alerts || !diseaseRisks || !lungImpact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dash-muted text-lg">Loading risk data...</div>
      </div>
    );
  }

  const filteredAlerts = alertFilter === 'all'
    ? alerts
    : alerts.filter(a => a.type === alertFilter);

  const dangerCount = alerts.filter(a => a.type === 'danger').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  const diseaseChartData = diseaseRisks.map(d => ({
    name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
    fullName: d.name,
    risk: d.risk,
    color: riskColors[d.riskLevel],
  }));

  return (
    <div className="space-y-6 fade-in">
      {/* Risk Overview Banner */}
      <div className={`rounded-2xl p-5 border ${lungImpact.bgClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-dash-text">Risk Assessment</h2>
              <StatusBadge label={lungImpact.label} color={lungImpact.color} pulse size="lg" />
            </div>
            <p className="text-sm text-dash-muted max-w-xl">
              AI-powered risk analysis based on current air quality conditions, your health metrics, and medical history.
              {dangerCount > 0 && ` ${dangerCount} critical alert${dangerCount > 1 ? 's' : ''} require immediate attention.`}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold font-mono" style={{ color: lungImpact.color }}>{lungImpact.score}</div>
              <div className="text-xs text-dash-muted mt-1">Risk Score</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-dash-muted">{dangerCount} Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-xs text-dash-muted">{warningCount} Warnings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider">Active Alerts</h3>
          <div className="flex gap-1.5">
            {['all', 'danger', 'warning', 'info'].map(filter => (
              <button
                key={filter}
                onClick={() => setAlertFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  alertFilter === filter
                    ? 'bg-dash-accent text-white'
                    : 'text-dash-muted hover:text-dash-text'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const style = alertTypeStyles[alert.type] || alertTypeStyles.info;
            return (
              <div
                key={alert.id}
                className={`${style.bg} border ${style.border} rounded-xl p-4 transition-all hover:scale-[1.005]`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${style.dot} pulse-ring flex-shrink-0`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${style.text}`}>{alert.title}</h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </div>
                      <p className="text-sm text-dash-muted leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-dash-muted whitespace-nowrap">{alert.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disease Risk Chart + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Disease Risk Assessment</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={diseaseChartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="risk" name="Risk" radius={[0, 6, 6, 0]} barSize={20}>
                {diseaseChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-1">Risk Details</h3>
          {diseaseRisks.map((disease, index) => (
            <div key={index} className="bg-dash-card border border-dash-border rounded-xl p-4 hover:border-dash-accent/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-dash-text">{disease.name}</h4>
                <StatusBadge label={`${disease.risk}%`} color={riskColors[disease.riskLevel]} size="sm" />
              </div>
              <div className="w-full bg-dash-border rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${disease.risk}%`,
                    backgroundColor: riskColors[disease.riskLevel],
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-dash-muted">
                <span className="capitalize">{disease.riskLevel} risk</span>
                <span className="flex items-center gap-1">
                  Trend: {disease.trend === 'increasing' ? '▲ Increasing' : '— Stable'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preventive Suggestions */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Preventive Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((suggestion, index) => {
            const urgency = urgencyColors[suggestion.urgency] || urgencyColors.low;
            return (
              <div
                key={index}
                className={`${urgency.bg} border ${urgency.border} rounded-xl p-4 transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dash-card text-dash-muted uppercase">
                    {suggestion.category}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: urgency.dot }}
                  />
                </div>
                <h4 className={`font-semibold text-sm mb-1.5 ${urgency.text}`}>{suggestion.title}</h4>
                <p className="text-xs text-dash-muted leading-relaxed">{suggestion.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
