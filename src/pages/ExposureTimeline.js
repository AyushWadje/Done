import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
  ComposedChart,
} from 'recharts';
import StatusBadge from '../components/StatusBadge';
import { getAQIInfo } from '../utils/airQualityData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dash-card border border-dash-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-dash-muted mb-1.5">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-mono font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ExposureTimeline({ timeline, weeklyTrend, airQuality }) {
  const [selectedPollutant, setSelectedPollutant] = useState('aqi');

  if (!timeline || !airQuality) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dash-muted text-lg">Loading exposure data...</div>
      </div>
    );
  }

  const pollutantOptions = [
    { key: 'aqi', label: 'AQI', color: '#3b82f6' },
    { key: 'pm25', label: 'PM2.5', color: '#ef4444' },
    { key: 'pm10', label: 'PM10', color: '#f97316' },
    { key: 'o3', label: 'O₃', color: '#a855f7' },
    { key: 'no2', label: 'NO₂', color: '#eab308' },
  ];

  const selectedOption = pollutantOptions.find(p => p.key === selectedPollutant);

  // Calculate cumulative exposure
  const cumulativeData = timeline.map((point, index) => {
    const cumulative = timeline.slice(0, index + 1).reduce((sum, p) => sum + p.aqi, 0);
    return { ...point, cumulative: Math.round(cumulative / (index + 1)) };
  });

  // Peak and average calculations
  const peakAqi = Math.max(...timeline.map(t => t.aqi));
  const avgAqi = Math.round(timeline.reduce((s, t) => s + t.aqi, 0) / timeline.length);
  const minAqi = Math.min(...timeline.map(t => t.aqi));
  const peakTime = timeline.find(t => t.aqi === peakAqi)?.time || 'N/A';

  // Exposure duration categories
  const goodHours = timeline.filter(t => t.aqi <= 50).length;
  const moderateHours = timeline.filter(t => t.aqi > 50 && t.aqi <= 100).length;
  const unhealthyHours = timeline.filter(t => t.aqi > 100 && t.aqi <= 150).length;
  const dangerousHours = timeline.filter(t => t.aqi > 150).length;

  return (
    <div className="space-y-6 fade-in">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dash-card border border-dash-border rounded-xl p-4">
          <div className="text-xs text-dash-muted uppercase tracking-wider mb-1">Peak AQI</div>
          <div className="text-2xl font-bold font-mono" style={{ color: getAQIInfo(peakAqi).color }}>{peakAqi}</div>
          <div className="text-xs text-dash-muted mt-1">at {peakTime}</div>
        </div>
        <div className="bg-dash-card border border-dash-border rounded-xl p-4">
          <div className="text-xs text-dash-muted uppercase tracking-wider mb-1">24h Average</div>
          <div className="text-2xl font-bold font-mono" style={{ color: getAQIInfo(avgAqi).color }}>{avgAqi}</div>
          <div className="text-xs text-dash-muted mt-1">{getAQIInfo(avgAqi).label}</div>
        </div>
        <div className="bg-dash-card border border-dash-border rounded-xl p-4">
          <div className="text-xs text-dash-muted uppercase tracking-wider mb-1">Minimum AQI</div>
          <div className="text-2xl font-bold font-mono" style={{ color: getAQIInfo(minAqi).color }}>{minAqi}</div>
          <div className="text-xs text-dash-muted mt-1">{getAQIInfo(minAqi).label}</div>
        </div>
        <div className="bg-dash-card border border-dash-border rounded-xl p-4">
          <div className="text-xs text-dash-muted uppercase tracking-wider mb-1">Current</div>
          <div className="text-2xl font-bold font-mono" style={{ color: airQuality.aqiColor }}>{airQuality.aqi}</div>
          <StatusBadge label={airQuality.aqiLabel} color={airQuality.aqiColor} size="sm" pulse />
        </div>
      </div>

      {/* Exposure Duration Breakdown */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Exposure Duration Breakdown (24h)</h3>
        <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-4">
          {goodHours > 0 && (
            <div className="bg-green-500 flex items-center justify-center transition-all" style={{ width: `${(goodHours / 24) * 100}%` }}>
              <span className="text-[10px] font-bold text-white">{goodHours}h</span>
            </div>
          )}
          {moderateHours > 0 && (
            <div className="bg-yellow-500 flex items-center justify-center transition-all" style={{ width: `${(moderateHours / 24) * 100}%` }}>
              <span className="text-[10px] font-bold text-white">{moderateHours}h</span>
            </div>
          )}
          {unhealthyHours > 0 && (
            <div className="bg-orange-500 flex items-center justify-center transition-all" style={{ width: `${(unhealthyHours / 24) * 100}%` }}>
              <span className="text-[10px] font-bold text-white">{unhealthyHours}h</span>
            </div>
          )}
          {dangerousHours > 0 && (
            <div className="bg-red-500 flex items-center justify-center transition-all" style={{ width: `${(dangerousHours / 24) * 100}%` }}>
              <span className="text-[10px] font-bold text-white">{dangerousHours}h</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500" /> Good (0-50): {goodHours}h</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500" /> Moderate (51-100): {moderateHours}h</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500" /> Unhealthy (101-150): {unhealthyHours}h</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Dangerous (151+): {dangerousHours}h</div>
        </div>
      </div>

      {/* Pollutant Selector + Main Timeline */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider">24-Hour Pollutant Timeline</h3>
          <div className="flex gap-1.5">
            {pollutantOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSelectedPollutant(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPollutant === opt.key
                    ? 'text-white'
                    : 'text-dash-muted hover:text-dash-text bg-transparent'
                }`}
                style={selectedPollutant === opt.key ? { backgroundColor: opt.color } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="pollutantGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={selectedOption.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={selectedOption.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={2} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={selectedPollutant}
              stroke={selectedOption.color}
              fill="url(#pollutantGrad)"
              strokeWidth={2.5}
              name={selectedOption.label}
              dot={false}
              activeDot={{ r: 5, fill: selectedOption.color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Multi-Pollutant Comparison */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Multi-Pollutant Comparison</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={3} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={1.5} dot={false} name="PM2.5" />
            <Line type="monotone" dataKey="pm10" stroke="#f97316" strokeWidth={1.5} dot={false} name="PM10" />
            <Line type="monotone" dataKey="o3" stroke="#a855f7" strokeWidth={1.5} dot={false} name="O₃" />
            <Line type="monotone" dataKey="no2" stroke="#eab308" strokeWidth={1.5} dot={false} name="NO₂" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Exposure + AQI Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Cumulative Average Exposure</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={4} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="aqi" name="Hourly AQI" fill="#3b82f620" stroke="#3b82f6" strokeWidth={1}>
                {cumulativeData.map((entry, index) => (
                  <Cell key={index} fill={getAQIInfo(entry.aqi).color + '30'} stroke={getAQIInfo(entry.aqi).color} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="cumulative" stroke="#22c55e" strokeWidth={2} dot={false} name="Running Avg" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">7-Day AQI Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="min" stackId="range" fill="#22c55e40" name="Min AQI" radius={[0, 0, 0, 0]} />
              <Bar dataKey="avg" stackId="range" fill="#3b82f640" name="Avg AQI" radius={[0, 0, 0, 0]} />
              <Bar dataKey="max" fill="#ef444440" name="Max AQI" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pollutant Details Table */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Current Pollutant Readings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dash-border">
                <th className="text-left py-2 px-3 text-dash-muted font-medium">Pollutant</th>
                <th className="text-left py-2 px-3 text-dash-muted font-medium">Value</th>
                <th className="text-left py-2 px-3 text-dash-muted font-medium">Unit</th>
                <th className="text-left py-2 px-3 text-dash-muted font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(airQuality.pollutants).map(([key, pollutant]) => (
                <tr key={key} className="border-b border-dash-border/50 hover:bg-dash-cardHover transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-dash-text">{pollutant.name}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-dash-accent">{pollutant.value}</td>
                  <td className="py-2.5 px-3 text-dash-muted">{pollutant.unit}</td>
                  <td className="py-2.5 px-3 text-dash-muted">{pollutant.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
