import React from 'react';

export default function GaugeChart({ value, max = 100, label, color, size = 160, thickness = 12 }) {
  const radius = (size - thickness) / 2;
  const circumference = Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M ${thickness / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${size / 2}`}
          fill="none"
          stroke="#2a2e3f"
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${thickness / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - thickness / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          className="font-mono"
          fill={color}
          fontSize={size * 0.18}
          fontWeight="700"
        >
          {value}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 14}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={size * 0.075}
          fontWeight="400"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
