import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import GaugeChart from '../components/GaugeChart';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { getMetricStatus } from '../utils/healthData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dash-card border border-dash-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-dash-muted mb-1">{label}</p>
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

export default function LungHealthDashboard({ airQuality, healthMetrics, lungImpact, healthTimeline, userProfile }) {
  if (!airQuality || !healthMetrics || !lungImpact) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dash-muted text-lg">Loading health data...</div>
      </div>
    );
  }

  const spo2Status = getMetricStatus(healthMetrics.spo2.value, healthMetrics.spo2.normal);
  const hrStatus = getMetricStatus(healthMetrics.heartRate.value, healthMetrics.heartRate.normal);
  const rrStatus = getMetricStatus(healthMetrics.respiratoryRate.value, healthMetrics.respiratoryRate.normal);
  const fev1Status = getMetricStatus(healthMetrics.fev1.value, healthMetrics.fev1.normal);

  const impactRadialData = [
    { name: 'Air Quality', value: lungImpact.components.airQuality, fill: '#3b82f6' },
    { name: 'Oxygenation', value: lungImpact.components.oxygenation, fill: '#06b6d4' },
    { name: 'Lung Capacity', value: lungImpact.components.lungCapacity, fill: '#22c55e' },
    { name: 'Cardiac', value: lungImpact.components.cardiacStress, fill: '#f97316' },
    { name: 'Respiratory', value: lungImpact.components.respiratoryStress, fill: '#a855f7' },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* User Profile Banner */}
      <div className="bg-gradient-to-r from-dash-card via-dash-card to-blue-900/20 border border-dash-border rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-dash-text">{userProfile.name}</h2>
            <p className="text-sm text-dash-muted mt-1">
              Age {userProfile.age} · {userProfile.conditions.join(', ')} · Last checkup: {userProfile.lastCheckup}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {userProfile.conditions.map((c, i) => (
                <StatusBadge key={i} label={c} color="#f97316" size="sm" />
              ))}
              <StatusBadge label={userProfile.riskCategory} color="#ef4444" size="sm" pulse />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono" style={{ color: airQuality.aqiColor }}>{airQuality.aqi}</div>
              <div className="text-xs text-dash-muted">Current AQI</div>
            </div>
            <div className="w-px h-12 bg-dash-border" />
            <div className="text-center">
              <div className="text-3xl font-bold font-mono" style={{ color: lungImpact.color }}>{lungImpact.score}</div>
              <div className="text-xs text-dash-muted">Lung Impact</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Gauges Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lung Impact Score */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6 flex flex-col items-center glow-blue">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Lung Impact Score</h3>
          <GaugeChart value={lungImpact.score} max={100} label={lungImpact.label} color={lungImpact.color} size={180} thickness={14} />
          <p className="text-xs text-dash-muted mt-3 text-center max-w-[200px]">
            AI-computed score combining air quality exposure and respiratory health metrics
          </p>
        </div>

        {/* AQI Gauge */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Air Quality Index</h3>
          <GaugeChart value={airQuality.aqi} max={500} label={airQuality.aqiLabel} color={airQuality.aqiColor} size={180} thickness={14} />
          <p className="text-xs text-dash-muted mt-3 text-center max-w-[200px]">
            {airQuality.location}
          </p>
        </div>

        {/* Breathing Quality */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Breathing Quality</h3>
          <GaugeChart
            value={healthMetrics.fev1.value}
            max={100}
            label="FEV1 Predicted"
            color={fev1Status.color}
            size={180}
            thickness={14}
          />
          <p className="text-xs text-dash-muted mt-3 text-center max-w-[200px]">
            Baseline: {userProfile.baselineFEV1}% · Current: {healthMetrics.fev1.value}%
          </p>
        </div>
      </div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Blood Oxygen"
          value={healthMetrics.spo2.value}
          unit="%"
          status={spo2Status.status}
          statusColor={spo2Status.color}
          subtitle="SpO₂ via pulse oximeter"
        />
        <MetricCard
          title="Heart Rate"
          value={healthMetrics.heartRate.value}
          unit="bpm"
          status={hrStatus.status}
          statusColor={hrStatus.color}
          subtitle="Resting heart rate"
        />
        <MetricCard
          title="Respiratory Rate"
          value={healthMetrics.respiratoryRate.value}
          unit="br/min"
          status={rrStatus.status}
          statusColor={rrStatus.color}
          subtitle="Breaths per minute"
        />
        <MetricCard
          title="Blood Pressure"
          value={`${healthMetrics.bloodPressure.systolic}/${healthMetrics.bloodPressure.diastolic}`}
          unit="mmHg"
          status={healthMetrics.bloodPressure.systolic > 120 ? 'high' : 'normal'}
          statusColor={healthMetrics.bloodPressure.systolic > 120 ? '#ef4444' : '#22c55e'}
          subtitle="Systolic / Diastolic"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lung Score Timeline */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">24-Hour Lung Health Score</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={healthTimeline}>
              <defs>
                <linearGradient id="lungScoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={3} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="lungScore" stroke="#3b82f6" fill="url(#lungScoreGrad)" strokeWidth={2} name="Lung Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Impact Components */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Impact Factor Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={impactRadialData} startAngle={180} endAngle={0}>
              <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={4} />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {impactRadialData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-[10px] text-dash-muted">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SpO2 and Heart Rate Timeline */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Vital Signs Over 24 Hours</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={healthTimeline}>
            <defs>
              <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={3} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="spo2" stroke="#06b6d4" fill="url(#spo2Grad)" strokeWidth={2} name="SpO₂ (%)" />
            <Area type="monotone" dataKey="heartRate" stroke="#f97316" fill="url(#hrGrad)" strokeWidth={2} name="Heart Rate (bpm)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Active Symptoms */}
      <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-dash-muted uppercase tracking-wider mb-4">Active Symptoms Monitor</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {healthMetrics.symptoms.map((symptom) => (
            <div
              key={symptom.id}
              className={`rounded-xl p-3 text-center border transition-all duration-300 ${
                symptom.active
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-dash-card border-dash-border'
              }`}
            >
              <div
                className="text-lg font-bold font-mono"
                style={{ color: symptom.active ? '#ef4444' : '#4b5563' }}
              >
                {symptom.severity.toFixed(1)}
              </div>
              <div className="text-[10px] text-dash-muted mt-1 leading-tight">{symptom.name}</div>
              {symptom.active && (
                <div className="mt-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 pulse-ring" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
