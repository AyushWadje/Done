// Wearable Health Data Simulation
// Simulates realistic respiratory and cardiovascular metrics

const HEALTH_RANGES = {
  spo2: { min: 88, max: 100, unit: '%', name: 'Blood Oxygen (SpO₂)', normal: { min: 95, max: 100 } },
  heartRate: { min: 55, max: 140, unit: 'bpm', name: 'Heart Rate', normal: { min: 60, max: 100 } },
  respiratoryRate: { min: 10, max: 30, unit: 'breaths/min', name: 'Respiratory Rate', normal: { min: 12, max: 20 } },
  fev1: { min: 40, max: 100, unit: '%', name: 'FEV1 (Lung Capacity)', normal: { min: 80, max: 100 } },
  peakFlow: { min: 200, max: 700, unit: 'L/min', name: 'Peak Expiratory Flow', normal: { min: 400, max: 700 } },
  bloodPressureSys: { min: 90, max: 180, unit: 'mmHg', name: 'Systolic BP', normal: { min: 90, max: 120 } },
  bloodPressureDia: { min: 60, max: 110, unit: 'mmHg', name: 'Diastolic BP', normal: { min: 60, max: 80 } },
};

const SYMPTOMS = [
  { id: 'cough', name: 'Coughing', severity: 0 },
  { id: 'wheeze', name: 'Wheezing', severity: 0 },
  { id: 'shortness', name: 'Shortness of Breath', severity: 0 },
  { id: 'chest', name: 'Chest Tightness', severity: 0 },
  { id: 'fatigue', name: 'Fatigue', severity: 0 },
  { id: 'headache', name: 'Headache', severity: 0 },
  { id: 'irritation', name: 'Eye/Throat Irritation', severity: 0 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function generateHealthMetrics(aqiLevel = 100) {
  // AQI impacts health metrics — higher AQI degrades health
  const impactFactor = Math.min(aqiLevel / 300, 1);

  const spo2 = clamp(
    Math.round((99 - impactFactor * 8 + (Math.random() * 2 - 1)) * 10) / 10,
    HEALTH_RANGES.spo2.min,
    HEALTH_RANGES.spo2.max
  );

  const heartRate = clamp(
    Math.round(72 + impactFactor * 30 + (Math.random() * 10 - 5)),
    HEALTH_RANGES.heartRate.min,
    HEALTH_RANGES.heartRate.max
  );

  const respiratoryRate = clamp(
    Math.round(15 + impactFactor * 8 + (Math.random() * 4 - 2)),
    HEALTH_RANGES.respiratoryRate.min,
    HEALTH_RANGES.respiratoryRate.max
  );

  const fev1 = clamp(
    Math.round((95 - impactFactor * 35 + (Math.random() * 6 - 3)) * 10) / 10,
    HEALTH_RANGES.fev1.min,
    HEALTH_RANGES.fev1.max
  );

  const peakFlow = clamp(
    Math.round(550 - impactFactor * 250 + (Math.random() * 40 - 20)),
    HEALTH_RANGES.peakFlow.min,
    HEALTH_RANGES.peakFlow.max
  );

  const bloodPressureSys = clamp(
    Math.round(115 + impactFactor * 25 + (Math.random() * 10 - 5)),
    HEALTH_RANGES.bloodPressureSys.min,
    HEALTH_RANGES.bloodPressureSys.max
  );

  const bloodPressureDia = clamp(
    Math.round(75 + impactFactor * 15 + (Math.random() * 6 - 3)),
    HEALTH_RANGES.bloodPressureDia.min,
    HEALTH_RANGES.bloodPressureDia.max
  );

  const symptoms = SYMPTOMS.map(s => ({
    ...s,
    severity: clamp(Math.round(impactFactor * 5 * (0.5 + Math.random()) * 10) / 10, 0, 5),
    active: impactFactor > 0.2 && Math.random() < impactFactor * 0.8,
  }));

  return {
    spo2: { value: spo2, ...HEALTH_RANGES.spo2 },
    heartRate: { value: heartRate, ...HEALTH_RANGES.heartRate },
    respiratoryRate: { value: respiratoryRate, ...HEALTH_RANGES.respiratoryRate },
    fev1: { value: fev1, ...HEALTH_RANGES.fev1 },
    peakFlow: { value: peakFlow, ...HEALTH_RANGES.peakFlow },
    bloodPressure: {
      systolic: bloodPressureSys,
      diastolic: bloodPressureDia,
      unit: 'mmHg',
      name: 'Blood Pressure',
    },
    symptoms,
    timestamp: new Date().toISOString(),
  };
}

export function generate24HourHealthTimeline(aqiTimeline) {
  return aqiTimeline.map((aqiPoint) => {
    const impactFactor = Math.min(aqiPoint.aqi / 300, 1);
    return {
      time: aqiPoint.time,
      hour: aqiPoint.hour,
      spo2: clamp(Math.round((99 - impactFactor * 8 + (Math.random() * 2 - 1)) * 10) / 10, 88, 100),
      heartRate: clamp(Math.round(72 + impactFactor * 30 + (Math.random() * 10 - 5)), 55, 140),
      respiratoryRate: clamp(Math.round(15 + impactFactor * 8 + (Math.random() * 4 - 2)), 10, 30),
      fev1: clamp(Math.round((95 - impactFactor * 35 + (Math.random() * 6 - 3)) * 10) / 10, 40, 100),
      lungScore: clamp(Math.round((100 - impactFactor * 55 + (Math.random() * 8 - 4))), 20, 100),
      aqi: aqiPoint.aqi,
    };
  });
}

export function getMetricStatus(value, normalRange) {
  if (value >= normalRange.min && value <= normalRange.max) return { status: 'normal', color: '#22c55e' };
  if (value < normalRange.min) return { status: 'low', color: '#eab308' };
  return { status: 'high', color: '#ef4444' };
}

export function generateUserProfile() {
  return {
    name: 'Alex Rivera',
    age: 34,
    conditions: ['Mild Asthma', 'Seasonal Allergies'],
    medications: ['Albuterol (as needed)', 'Fluticasone daily'],
    riskCategory: 'Sensitive Individual',
    lastCheckup: '2026-02-15',
    baselineFEV1: 92,
    baselineSpO2: 98,
  };
}

export { HEALTH_RANGES, SYMPTOMS };
