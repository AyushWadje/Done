import React from 'react';

export default function MetricCard({ title, value, unit, status, statusColor, subtitle, trend, className = '' }) {
  return (
    <div className={`bg-dash-card border border-dash-border rounded-xl p-4 hover:border-dash-accent/30 transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-dash-muted uppercase tracking-wider">{title}</span>
        {status && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
          >
            {status}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono" style={{ color: statusColor || '#e2e8f0' }}>
          {value}
        </span>
        {unit && <span className="text-sm text-dash-muted">{unit}</span>}
        {trend && (
          <span className={`text-xs ml-auto font-medium ${trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-dash-muted'}`}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-dash-muted mt-1.5">{subtitle}</p>}
    </div>
  );
}
