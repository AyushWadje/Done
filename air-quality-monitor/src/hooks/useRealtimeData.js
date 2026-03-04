import { useState, useEffect, useCallback, useMemo } from 'react';
import { generateCurrentAQI, generate24HourTimeline, generateWeeklyTrend } from '../utils/airQualityData';
import { generateHealthMetrics, generate24HourHealthTimeline, generateUserProfile } from '../utils/healthData';
import {
  calculateLungImpactScore,
  calculateDiseaseRisks,
  generateAlerts,
  generatePreventiveSuggestions,
  generatePublicHealthData,
  generateDemographicData,
  generateMonthlyTrends,
} from '../utils/riskEngine';

export function useRealtimeData(updateInterval = 4000) {
  const [airQuality, setAirQuality] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [healthTimeline, setHealthTimeline] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [lungImpact, setLungImpact] = useState(null);
  const [diseaseRisks, setDiseaseRisks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [publicHealth, setPublicHealth] = useState([]);
  const [demographics, setDemographics] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const userProfile = useMemo(() => generateUserProfile(), []);

  const refreshData = useCallback(() => {
    const aq = generateCurrentAQI('moderate');
    setAirQuality(aq);

    const health = generateHealthMetrics(aq.aqi);
    setHealthMetrics(health);

    const tl = generate24HourTimeline('moderate');
    setTimeline(tl);

    const htl = generate24HourHealthTimeline(tl);
    setHealthTimeline(htl);

    const wt = generateWeeklyTrend('moderate');
    setWeeklyTrend(wt);

    const impact = calculateLungImpactScore(aq.aqi, health, userProfile);
    setLungImpact(impact);

    const risks = calculateDiseaseRisks(aq.aqi, health, userProfile);
    setDiseaseRisks(risks);

    const al = generateAlerts(impact, risks, aq.aqi, health);
    setAlerts(al);

    const sug = generatePreventiveSuggestions(impact, aq.aqi);
    setSuggestions(sug);

    setPublicHealth(generatePublicHealthData());
    setDemographics(generateDemographicData());
    setMonthlyTrends(generateMonthlyTrends());

    setLastUpdated(new Date());
  }, [userProfile]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, updateInterval);
    return () => clearInterval(interval);
  }, [refreshData, updateInterval]);

  return {
    airQuality,
    healthMetrics,
    timeline,
    healthTimeline,
    weeklyTrend,
    lungImpact,
    diseaseRisks,
    alerts,
    suggestions,
    publicHealth,
    demographics,
    monthlyTrends,
    userProfile,
    lastUpdated,
    refreshData,
  };
}
