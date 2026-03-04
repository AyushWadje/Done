module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'lung': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'aqi': {
          good: '#22c55e',
          moderate: '#eab308',
          unhealthy1: '#f97316',
          unhealthy2: '#ef4444',
          veryUnhealthy: '#a855f7',
          hazardous: '#7f1d1d',
        },
        'dash': {
          bg: '#0f1117',
          card: '#1a1d27',
          cardHover: '#22263a',
          border: '#2a2e3f',
          text: '#e2e8f0',
          muted: '#94a3b8',
          accent: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
