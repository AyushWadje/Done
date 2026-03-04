// AI Risk Assessment Engine
// Combines air quality + health metrics to estimate lung impact and disease risk

const RISK_LEVELS = [
  { max: 20, label: 'Minimal', color: '#22c55e', bgClass: 'bg-green-500/10 border-green-500/30', textClass: 'text-green-400' },
  { max: 40, label: 'Low', color: '#06b6d4', bgClass: 'bg-cyan-500/10 border-cyan-500/30', textClass: 'text-cyan-400' },
  { max: 60, label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 border-yellow-500/30', textClass: 'text-yellow-400' },
  { max: 80, label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 border-orange-500/30', textClass: 'text-orange-400' },
  { max: 100, label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 border-red-500/30', textClass: 'text-red-400' },
];

const DISEASE_RISKS = [
  { name: 'Asthma Exacerbation', baseRisk: 0.15, aqiWeight: 0.4, healthWeight: 0.3, sensitivityWeight: 0.3 },
  { name: 'COPD Progression', baseRisk: 0.08, aqiWeight: 0.35, healthWeight: 0.35, sensitivityWeight: 0.3 },
  { name: 'Bronchitis', baseRisk: 0.1, aqiWeight: 0.45, healthWeight: 0.25, sensitivityWeight: 0.3 },
  { name: 'Cardiovascular Event', baseRisk: 0.05, aqiWeight: 0.3, healthWeight: 0.4, sensitivityWeight: 0.3 },
  { name: 'Respiratory Infection', baseRisk: 0.12, aqiWeight: 0.35, healthWeight: 0.3, sensitivityWeight: 0.35 },
  { name: 'Lung Function Decline', baseRisk: 0.07, aqiWeight: 0.5, healthWeight: 0.3, sensitivityWeight: 0.2 },
];

export function calculateLungImpactScore(aqi, healthMetrics, userProfile) {
  // Weighted scoring algorithm
  const aqiScore = Math.min(aqi / 300, 1) * 100;

  const spo2Score = healthMetrics.spo2
    ? Math.max(0, (100 - healthMetrics.spo2.value) * 10)
    : 0;

  const fev1Score = healthMetrics.fev1
    ? Math.max(0, (100 - healthMetrics.fev1.value) * 1.5)
    : 0;

  const hrScore = healthMetrics.heartRate
    ? Math.max(0, (healthMetrics.heartRate.value - 80) * 0.8)
    : 0;

  const rrScore = healthMetrics.respiratoryRate
    ? Math.max(0, (healthMetrics.respiratoryRate.value - 16) * 3)
    : 0;

  const sensitivityMultiplier = userProfile?.conditions?.length > 0 ? 1.3 : 1.0;

  const rawScore = (
    aqiScore * 0.35 +
    spo2Score * 0.2 +
    fev1Score * 0.2 +
    hrScore * 0.1 +
    rrScore * 0.15
  ) * sensitivityMultiplier;

  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const riskLevel = RISK_LEVELS.find(r => finalScore <= r.max) || RISK_LEVELS[RISK_LEVELS.length - 1];

  return {
    score: finalScore,
    ...riskLevel,
    components: {
      airQuality: Math.round(aqiScore),
      oxygenation: Math.round(spo2Score),
      lungCapacity: Math.round(fev1Score),
      cardiacStress: Math.round(hrScore),
      respiratoryStress: Math.round(rrScore),
    },
  };
}

export function calculateDiseaseRisks(aqi, healthMetrics, userProfile) {
  const aqiFactor = Math.min(aqi / 300, 1);
  const healthFactor = healthMetrics.fev1
    ? Math.max(0, (100 - healthMetrics.fev1.value) / 60)
    : 0.3;
  const sensitivityFactor = userProfile?.conditions?.length > 0 ? 0.8 : 0.3;

  return DISEASE_RISKS.map(disease => {
    const risk = (
      disease.baseRisk +
      aqiFactor * disease.aqiWeight +
      healthFactor * disease.healthWeight +
      sensitivityFactor * disease.sensitivityWeight
    );

    const normalizedRisk = Math.min(Math.round(risk * 100), 95);
    const trend = Math.random() > 0.5 ? 'increasing' : 'stable';

    return {
      ...disease,
      risk: normalizedRisk,
      trend,
      riskLevel: normalizedRisk < 20 ? 'low' : normalizedRisk < 50 ? 'moderate' : normalizedRisk < 75 ? 'high' : 'critical',
    };
  });
}

export function generateAlerts(lungImpact, diseaseRisks, aqi, healthMetrics) {
  const alerts = [];
  const now = new Date();

  if (aqi > 150) {
    alerts.push({
      id: 'aqi-high',
      type: 'danger',
      title: 'Hazardous Air Quality Detected',
      message: `Current AQI is ${aqi}. Avoid outdoor activities and keep windows closed. Use air purifiers if available.`,
      time: new Date(now - 1000 * 60 * 5).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      priority: 1,
    });
  } else if (aqi > 100) {
    alerts.push({
      id: 'aqi-moderate',
      type: 'warning',
      title: 'Elevated Air Quality Index',
      message: `AQI at ${aqi}. Sensitive individuals should reduce outdoor exposure. Consider wearing an N95 mask outdoors.`,
      time: new Date(now - 1000 * 60 * 12).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      priority: 2,
    });
  }

  if (healthMetrics.spo2 && healthMetrics.spo2.value < 94) {
    alerts.push({
      id: 'spo2-low',
      type: 'danger',
      title: 'Low Blood Oxygen Level',
      message: `SpO₂ at ${healthMetrics.spo2.value}%. This is below normal range. Practice deep breathing exercises. Seek medical attention if persistent.`,
      time: new Date(now - 1000 * 60 * 3).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      priority: 1,
    });
  }

  if (healthMetrics.fev1 && healthMetrics.fev1.value < 75) {
    alerts.push({
      id: 'fev1-low',
      type: 'warning',
      title: 'Reduced Lung Capacity',
      message: `FEV1 at ${healthMetrics.fev1.value}% of predicted. Consider using prescribed bronchodilator. Avoid strenuous activity.`,
      time: new Date(now - 1000 * 60 * 20).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      priority: 2,
    });
  }

  if (healthMetrics.heartRate && healthMetrics.heartRate.value > 100) {
    alerts.push({
      id: 'hr-high',
      type: 'warning',
      title: 'Elevated Heart Rate',
      message: `Heart rate at ${healthMetrics.heartRate.value} bpm. This may be related to respiratory stress from air quality. Rest and monitor.`,
      time: new Date(now - 1000 * 60 * 8).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      priority: 3,
    });
  }

  if (lungImpact.score > 60) {
    alerts.push({
      id: 'lung-impact',
      type: 'danger',
      title: 'High Lung Impact Score',
      message: `Your lung impact score is ${lungImpact.score}/100. Combined air quality and health metrics indicate significant respiratory stress.`,
      time: new Date(now - 1000 * 60 * 1).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      priority: 1,
    });
  }

  const highRiskDiseases = diseaseRisks.filter(d => d.risk > 50);
  if (highRiskDiseases.length > 0) {
    alerts.push({
      id: 'disease-risk',
      type: 'warning',
      title: 'Elevated Disease Risk',
      message: `Increased risk detected for: ${highRiskDiseases.map(d => d.name).join(', ')}. Consult your healthcare provider.`,
      time: new Date(now - 1000 * 60 * 30).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      priority: 2,
    });
  }

  // Always add an informational alert
  alerts.push({
    id: 'daily-summary',
    type: 'info',
    title: 'Daily Health Summary',
    message: 'Your respiratory metrics are being continuously monitored. Stay hydrated and maintain indoor air quality with proper ventilation.',
    time: new Date(now - 1000 * 60 * 60).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    priority: 4,
  });

  return alerts.sort((a, b) => a.priority - b.priority);
}

export function generatePreventiveSuggestions(lungImpact, aqi) {
  const suggestions = [];

  if (aqi > 100) {
    suggestions.push({
      category: 'Environment',
      title: 'Reduce Outdoor Exposure',
      description: 'Limit time outdoors, especially during peak pollution hours (7-9 AM, 5-7 PM). Use air quality apps to plan activities.',
      urgency: aqi > 150 ? 'high' : 'medium',
    });
    suggestions.push({
      category: 'Protection',
      title: 'Use N95/KN95 Mask',
      description: 'Wear a properly fitted N95 or KN95 mask when going outdoors. Regular cloth masks do not filter fine particulate matter.',
      urgency: 'high',
    });
  }

  suggestions.push({
    category: 'Indoor Air',
    title: 'Optimize Indoor Air Quality',
    description: 'Run HEPA air purifiers, keep windows closed during high AQI periods, and maintain humidity between 30-50%.',
    urgency: aqi > 100 ? 'high' : 'low',
  });

  if (lungImpact.score > 40) {
    suggestions.push({
      category: 'Medication',
      title: 'Review Medication Schedule',
      description: 'Ensure rescue inhaler is accessible. Consider preventive use of bronchodilator before any necessary outdoor exposure.',
      urgency: 'medium',
    });
  }

  suggestions.push({
    category: 'Exercise',
    title: aqi > 100 ? 'Move Exercise Indoors' : 'Maintain Physical Activity',
    description: aqi > 100
      ? 'Switch to indoor exercises. Avoid high-intensity workouts that increase respiratory rate and pollutant intake.'
      : 'Continue regular exercise routine. Morning hours typically have better air quality for outdoor activities.',
    urgency: aqi > 100 ? 'medium' : 'low',
  });

  suggestions.push({
    category: 'Hydration',
    title: 'Stay Well Hydrated',
    description: 'Drink at least 8 glasses of water daily. Proper hydration helps maintain mucosal barriers in the respiratory tract.',
    urgency: 'low',
  });

  suggestions.push({
    category: 'Monitoring',
    title: 'Track Symptoms Daily',
    description: 'Log any respiratory symptoms including cough, wheeze, or shortness of breath. Share trends with your healthcare provider.',
    urgency: 'medium',
  });

  return suggestions;
}

export function generatePublicHealthData() {
  const regions = [
    { name: 'Downtown', population: 125000, lat: 40.7128, lng: -74.006 },
    { name: 'Midtown', population: 98000, lat: 40.7549, lng: -73.984 },
    { name: 'Uptown', population: 87000, lat: 40.7831, lng: -73.9712 },
    { name: 'Brooklyn Heights', population: 65000, lat: 40.6958, lng: -73.9936 },
    { name: 'Queens Park', population: 110000, lat: 40.7282, lng: -73.7949 },
    { name: 'Bronx Central', population: 95000, lat: 40.8448, lng: -73.8648 },
    { name: 'Staten Island', population: 45000, lat: 40.5795, lng: -74.1502 },
    { name: 'Jersey City', population: 72000, lat: 40.7178, lng: -74.0431 },
  ];

  return regions.map(region => {
    const baseAqi = 30 + Math.random() * 150;
    const aqi = Math.round(baseAqi);
    const impactFactor = Math.min(aqi / 300, 1);

    const hospitalVisits = Math.round(region.population * 0.0001 * (1 + impactFactor * 3));
    const sensitivePopulation = Math.round(region.population * (0.12 + Math.random() * 0.08));
    const asthmaRate = Math.round((8 + impactFactor * 12 + Math.random() * 4) * 10) / 10;
    const copdRate = Math.round((4 + impactFactor * 8 + Math.random() * 3) * 10) / 10;

    return {
      ...region,
      aqi,
      hospitalVisits,
      sensitivePopulation,
      asthmaRate,
      copdRate,
      riskScore: Math.round(impactFactor * 100),
      trend: Math.random() > 0.4 ? 'improving' : Math.random() > 0.5 ? 'worsening' : 'stable',
    };
  });
}

export function generateDemographicData() {
  return [
    { group: 'Children (0-12)', population: 85000, sensitivePercent: 22, avgExposure: 65, riskLevel: 'high' },
    { group: 'Teens (13-17)', population: 45000, sensitivePercent: 15, avgExposure: 72, riskLevel: 'moderate' },
    { group: 'Adults (18-44)', population: 210000, sensitivePercent: 10, avgExposure: 80, riskLevel: 'moderate' },
    { group: 'Adults (45-64)', population: 165000, sensitivePercent: 18, avgExposure: 68, riskLevel: 'high' },
    { group: 'Seniors (65+)', population: 92000, sensitivePercent: 35, avgExposure: 45, riskLevel: 'critical' },
  ];
}

export function generateMonthlyTrends() {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  return months.map((month, i) => ({
    month,
    avgAqi: Math.round(40 + Math.sin(i * 0.8) * 30 + Math.random() * 20),
    hospitalAdmissions: Math.round(120 + Math.sin(i * 0.8) * 60 + Math.random() * 30),
    asthmaIncidents: Math.round(80 + Math.sin(i * 0.8) * 40 + Math.random() * 20),
    copdExacerbations: Math.round(45 + Math.sin(i * 0.8) * 25 + Math.random() * 15),
    respiratoryComplaints: Math.round(250 + Math.sin(i * 0.8) * 100 + Math.random() * 50),
  }));
}

export { RISK_LEVELS };
