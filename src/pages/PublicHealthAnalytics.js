import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import StatusBadge from '../components/StatusBadge';
import { getAQIInfo } from '../utils/airQualityData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dash-card border border-dash-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-dash-muted mb-1.5">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-mono font-semibold" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#3b82f6', '#06b6d4', '#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7', '#ec4899'];

export default function PublicHealthAnalytics({ publicHealth, demographics, monthlyTrends }) {
  const totalPopulation = useMemo(() =>
    publicHealth ? publicHealth.reduce((sum, r) => sum + r.population, 0) : 0,
    [publicHealth]
  );

  const totalHospitalVisits = useMemo(() =>
    publicHealth ? publicHealth.reduce((sum, r) => sum + r.hospitalVisits, 0) : 0,
    [publicHealth]
  );

  const avgRegionalAqi = useMemo(() =>
    publicHealth ? Math.round(publicHealth.reduce((sum, r) => sum + r.aqi, 0) / publicHealth.length) : 0,
    [publicHealth]
  );

  const totalSensitive = useMemo(() =>
    publicHealth ? publicHealth.reduce((sum, r) => sum + r.sensitivePopulation, 0) : 0,
    [publicHealth]
  );

  const populationPieData = useMemo(() =>
    demographics ? demographics.map((d, i) => ({
      name: d.group,
      value: d.population,
      fill: COLORS[i % COLORS.length],
    })) : [],
    [demographics]
  );

  const radarData = useMemo(() =>
    demographics ? demographics.map(d => ({
      group: d.group.split(' ')[0],
      sensitivePercent: d.sensitivePercent,
      avgExposure: d.avgExposure,
      riskIndex: d.riskLevel === 'critical' ? 90 : d.riskLevel === 'high' ? 70 : d.riskLevel === 'moderate' ? 45 : 20,
    })) : [],
    [demographics]
  );

  const scatterData = useMemo(() =>
    publicHealth ? publicHealth.map(r => ({
      x: r.aqi,
      y: r.hospitalVisits,
      z: r.population / 1000,
      name: r.name,
    })) : [],
    [publicHealth]
  );

  if (!publicHealth || !demographics || !monthlyTrends) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dash-muted text-lg">Loading public health data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dash-card border border-dash-border rounded-xl p-4">
          <div className="text-xs text-dash-muted uppercase tracking-wider mb-1">Total Population</div>
          <div className="text-2xl font-bold font-mono text-dash-text">{(totalPopulation / 1000).toFixed(0)}K</div>
          <div className="text-xs text-dash-muted mt-1">Monitored regions</div>
        </div>
        <div className="bg-dash-card border border-dash-border rounded-xl p-4">
          <div className="text-xs text-dash-muted uppercase tracking-wider mb-1">Regional Avg AQI</div>
          <div className="text-2xl font-bold font-mono" style={{ color: getAQIInfo(avgRegionalAqi).color }}>{avgRegionalAqi}</div>
          <StatusBadge label={getAQIInfo(avgRegionalAqi).label} color={getAQIInfo(avgRegionalAqi).color} size="sm" />
        </div>
        <div className="bg-dash-card border border-dash-border rounded-xl p-4">
          <div className="text-xs text-dash-muted uppercase tracking-wider mb-1">Hospital Visits</div>
          <div className="text-2xl font-bold font-mono text-red-400">{totalHospitalVisits}</div>
          <div className="text-xs text-dash-muted mt-1">Respiratory-related (24h)</div>
        </div>
        <div className="bg-dash-card border border-dash-border rounded-xl p-4">
          <div className="text-xs text-dash-muted uppercase tracking-wider mb-1">Sensitive Population</div>
          <div className="text-2xl font-bold font-mono text-orange-400">{(totalSensitive / 1000).toFixed(0)}K</div>
          <div className="text-xs text-dash-muted mt-1">{((totalSensitive / totalPopulation) * 100).toFixed(1)}% of total</div>
        </div>
      </div>

      {/* Regional AQI Map (Table-based) + Hospital Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Data */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Regional Air Quality Overview</h3>
          <div className="space-y-2">
            {publicHealth.sort((a, b) => b.aqi - a.aqi).map((region, index) => {
              const aqiInfo = getAQIInfo(region.aqi);
              return (
                <div key={index} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-dash-cardHover transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: aqiInfo.color + '20', color: aqiInfo.color }}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-dash-text truncate">{region.name}</span>
                      <span className="font-mono font-bold text-sm" style={{ color: aqiInfo.color }}>{region.aqi}</span>
                    </div>
                    <div className="w-full bg-dash-border rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((region.aqi / 300) * 100, 100)}%`, backgroundColor: aqiInfo.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-dash-muted">{(region.population / 1000).toFixed(0)}K pop</span>
                      <span className="text-[10px] text-dash-muted">{region.hospitalVisits} hospital visits</span>
                      <StatusBadge label={region.trend} color={region.trend === 'improving' ? '#22c55e' : region.trend === 'worsening' ? '#ef4444' : '#94a3b8'} size="sm" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AQI vs Hospital Visits Scatter */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">AQI vs Hospital Visits Correlation</h3>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
              <XAxis type="number" dataKey="x" name="AQI" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'AQI', position: 'bottom', fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="Hospital Visits" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} name="Population (K)" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-dash-muted text-center mt-2">Bubble size represents population. Higher AQI correlates with more hospital visits.</p>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">6-Month Health Impact Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyTrends}>
            <defs>
              <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="asthmaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="copdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Area type="monotone" dataKey="hospitalAdmissions" stroke="#ef4444" fill="url(#admGrad)" strokeWidth={2} name="Hospital Admissions" />
            <Area type="monotone" dataKey="asthmaIncidents" stroke="#f97316" fill="url(#asthmaGrad)" strokeWidth={2} name="Asthma Incidents" />
            <Area type="monotone" dataKey="copdExacerbations" stroke="#a855f7" fill="url(#copdGrad)" strokeWidth={2} name="COPD Exacerbations" />
            <Area type="monotone" dataKey="respiratoryComplaints" stroke="#3b82f6" fill="url(#respGrad)" strokeWidth={2} name="Respiratory Complaints" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Demographics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Population Distribution Pie */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Population Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={populationPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {populationPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {populationPieData.map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-[10px] text-dash-muted">{item.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demographic Risk Radar */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Demographic Risk Profile</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2e3f" />
              <PolarAngleAxis dataKey="group" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <Radar name="Sensitive %" dataKey="sensitivePercent" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
              <Radar name="Avg Exposure" dataKey="avgExposure" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Radar name="Risk Index" dataKey="riskIndex" stroke="#eab308" fill="#eab308" fillOpacity={0.2} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Disease Rate by Region */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Disease Rates by Region</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={publicHealth.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
              <Bar dataKey="asthmaRate" fill="#f97316" name="Asthma %" barSize={8} radius={[0, 4, 4, 0]} />
              <Bar dataKey="copdRate" fill="#a855f7" name="COPD %" barSize={8} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demographic Details Table */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Demographic Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dash-border">
                <th className="text-left py-2.5 px-3 text-dash-muted font-medium">Age Group</th>
                <th className="text-left py-2.5 px-3 text-dash-muted font-medium">Population</th>
                <th className="text-left py-2.5 px-3 text-dash-muted font-medium">Sensitive %</th>
                <th className="text-left py-2.5 px-3 text-dash-muted font-medium">Avg Exposure</th>
                <th className="text-left py-2.5 px-3 text-dash-muted font-medium">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {demographics.map((demo, index) => {
                const riskColor = demo.riskLevel === 'critical' ? '#ef4444' : demo.riskLevel === 'high' ? '#f97316' : demo.riskLevel === 'moderate' ? '#eab308' : '#22c55e';
                return (
                  <tr key={index} className="border-b border-dash-border/50 hover:bg-dash-cardHover transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-dash-text">{demo.group}</td>
                    <td className="py-2.5 px-3 font-mono text-dash-text">{demo.population.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-dash-border rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${demo.sensitivePercent}%` }} />
                        </div>
                        <span className="font-mono text-dash-muted">{demo.sensitivePercent}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-dash-muted">{demo.avgExposure}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge label={demo.riskLevel} color={riskColor} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly AQI vs Admissions */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Monthly AQI vs Hospital Admissions</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Line yAxisId="left" type="monotone" dataKey="avgAqi" stroke="#3b82f6" strokeWidth={2.5} name="Avg AQI" dot={{ r: 4, fill: '#3b82f6' }} />
            <Line yAxisId="right" type="monotone" dataKey="hospitalAdmissions" stroke="#ef4444" strokeWidth={2.5} name="Hospital Admissions" dot={{ r: 4, fill: '#ef4444' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
