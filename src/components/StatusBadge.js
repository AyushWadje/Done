import React from 'react';

export default function StatusBadge({ label, color, pulse = false, size = 'md' }) {
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizes[size]}`}
      style={{ backgroundColor: `${color}15`, color }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${pulse ? 'pulse-ring' : ''}`}
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
