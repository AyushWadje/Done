// Air Quality Sensor Simulation
// Simulates realistic air quality data with temporal patterns

const POLLUTANT_RANGES = {
  pm25: { min: 2, max: 300, unit: 'μg/m³', name: 'PM2.5', description: 'Fine Particulate Matter' },
  pm10: { min: 5, max: 500, unit: 'μg/m³', name: 'PM10', description: 'Coarse Particulate Matter' },
  o3: { min: 10, max: 200, unit: 'ppb', name: 'O₃', description: 'Ozone' },
  no2: { min: 5, max: 150, unit: 'ppb', name: 'NO₂', description: 'Nitrogen Dioxide' },
  so2: { min: 1, max: 100, unit: 'ppb', name: 'SO₂', description: 'Sulfur Dioxide' },
  co: { min: 0.1, max: 15, unit: 'ppm', name: 'CO', description: 'Carbon Monoxide' },
};

const AQI_BREAKPOINTS = [
  { max: 50, label: 'Good', color: '#22c55e', bgColor: 'bg-green-500', textColor: 'text-green-400', recommendation: 'Air quality is satisfactory. Enjoy outdoor activities.' },
  { max: 100, label: 'Moderate', color: '#eab308', bgColor: 'bg-yellow-500', textColor: 'text-yellow-400', recommendation: 'Acceptable quality. Sensitive individuals should limit prolonged outdoor exertion.' },
  { max: 150, label: 'Unhealthy for Sensitive', color: '#f97316', bgColor: 'bg-orange-500', textColor: 'text-orange-400', recommendation: 'Sensitive groups may experience health effects. Reduce prolonged outdoor exertion.' },
  { max: 200, label: 'Unhealthy', color: '#ef4444', bgColor: 'bg-red-500', textColor: 'text-red-400', recommendation: 'Everyone may begin to experience health effects. Avoid prolonged outdoor exertion.' },
  { max: 300, label: 'Very Unhealthy', color: '#a855f7', bgColor: 'bg-purple-500', textColor: 'text-purple-400', recommendation: 'Health alert: everyone may experience serious health effects. Stay indoors.' },
  { max: 500, label: 'Hazardous', color: '#991b1b', bgColor: 'bg-red-900', textColor: 'text-red-300', recommendation: 'Health emergency. Entire population affected. Avoid all outdoor activity.' },
];

function getTimeOfDayFactor(hour) {
  // Rush hours (7-9, 17-19) have higher pollution
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) return 1.4;
  // Midday moderate
  if (hour >= 10 && hour <= 16) return 1.0;
  // Night lower
  return 0.6;
}

function addNoise(value, noisePercent = 0.08) {
  const noise = value * noisePercent * (Math.random() * 2 - 1);
  return value + noise;
}

export function generateCurrentAQI(baseLevel = 'moderate') {
  const hour = new Date().getHours();
  const timeFactor = getTimeOfDayFactor(hour);

  const baseLevels = {
    good: 0.15,
    moderate: 0.35,
    unhealthy: 0.6,
    hazardous: 0.85,
  };

  const base = baseLevels[baseLevel] || 0.35;

  const pollutants = {};
  Object.entries(POLLUTANT_RANGES).forEach(([key, range]) => {
    const rawValue = range.min + (range.max - range.min) * base * timeFactor;
    pollutants[key] = {
      value: Math.round(addNoise(Math.min(rawValue, range.max)) * 10) / 10,
      ...range,
    };
  });

  const aqi = Math.round(addNoise(base * timeFactor * 300, 0.05));
  const clampedAqi = Math.max(0, Math.min(500, aqi));
  const aqiInfo = AQI_BREAKPOINTS.find(b => clampedAqi <= b.max) || AQI_BREAKPOINTS[AQI_BREAKPOINTS.length - 1];

  return {
    aqi: clampedAqi,
    aqiLabel: aqiInfo.label,
    aqiColor: aqiInfo.color,
    aqiBgColor: aqiInfo.bgColor,
    aqiTextColor: aqiInfo.textColor,
    recommendation: aqiInfo.recommendation,
    pollutants,
    timestamp: new Date().toISOString(),
    location: 'Downtown Monitoring Station',
    coordinates: { lat: 40.7128, lng: -74.006 },
  };
}

export function generate24HourTimeline(baseLevel = 'moderate') {
  const now = new Date();
  const data = [];

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now);
    time.setHours(now.getHours() - i, 0, 0, 0);
    const hour = time.getHours();
    const timeFactor = getTimeOfDayFactor(hour);

    const baseLevels = { good: 0.15, moderate: 0.35, unhealthy: 0.6, hazardous: 0.85 };
    const base = baseLevels[baseLevel] || 0.35;

    const aqi = Math.round(addNoise(base * timeFactor * 300, 0.12));
    const clampedAqi = Math.max(10, Math.min(500, aqi));

    const pm25 = Math.round(addNoise(POLLUTANT_RANGES.pm25.min + (POLLUTANT_RANGES.pm25.max - POLLUTANT_RANGES.pm25.min) * base * timeFactor, 0.12) * 10) / 10;
    const pm10 = Math.round(addNoise(POLLUTANT_RANGES.pm10.min + (POLLUTANT_RANGES.pm10.max - POLLUTANT_RANGES.pm10.min) * base * timeFactor, 0.12) * 10) / 10;
    const o3 = Math.round(addNoise(POLLUTANT_RANGES.o3.min + (POLLUTANT_RANGES.o3.max - POLLUTANT_RANGES.o3.min) * base * timeFactor, 0.12) * 10) / 10;
    const no2 = Math.round(addNoise(POLLUTANT_RANGES.no2.min + (POLLUTANT_RANGES.no2.max - POLLUTANT_RANGES.no2.min) * base * timeFactor, 0.12) * 10) / 10;

    const aqiInfo = AQI_BREAKPOINTS.find(b => clampedAqi <= b.max) || AQI_BREAKPOINTS[AQI_BREAKPOINTS.length - 1];

    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      hour,
      aqi: clampedAqi,
      pm25: Math.max(2, pm25),
      pm10: Math.max(5, pm10),
      o3: Math.max(10, o3),
      no2: Math.max(5, no2),
      label: aqiInfo.label,
      color: aqiInfo.color,
      timestamp: time.toISOString(),
    });
  }

  return data;
}

export function generateWeeklyTrend(baseLevel = 'moderate') {
  const data = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dayVariation = 0.8 + Math.random() * 0.4;

    const baseLevels = { good: 0.15, moderate: 0.35, unhealthy: 0.6, hazardous: 0.85 };
    const base = baseLevels[baseLevel] || 0.35;

    const avgAqi = Math.round(base * dayVariation * 250);
    const maxAqi = Math.round(avgAqi * (1.2 + Math.random() * 0.3));
    const minAqi = Math.round(avgAqi * (0.5 + Math.random() * 0.2));

    data.push({
      day: days[date.getDay()],
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avg: Math.max(10, Math.min(500, avgAqi)),
      max: Math.max(15, Math.min(500, maxAqi)),
      min: Math.max(5, Math.min(500, minAqi)),
    });
  }

  return data;
}

export function getAQIInfo(aqi) {
  return AQI_BREAKPOINTS.find(b => aqi <= b.max) || AQI_BREAKPOINTS[AQI_BREAKPOINTS.length - 1];
}

export { POLLUTANT_RANGES, AQI_BREAKPOINTS };
