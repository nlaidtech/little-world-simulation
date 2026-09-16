// EPA Air Quality Index (AQI) Calculation Model
export function calculateAQI(results, activeEvent = null) {
  // Baseline city without trees: AQI around 165 (Unhealthy for Sensitive Groups / Unhealthy)
  const baseAQI = 165;
  const filteredKg = results?.pollutants_kg || 0;
  const canopyPct = results?.canopy_percent || 0;

  // Each kg of pollutant removed reduces raw AQI points
  // 3,000 kg filtered reduces AQI by ~110 points
  const reductionFromFiltering = Math.min(100, (filteredKg / 3000) * 100);
  const reductionFromCanopy = Math.min(30, (canopyPct / 30) * 30);

  let currentAQI = Math.max(15, Math.round(baseAQI - reductionFromFiltering - reductionFromCanopy));

  // Climate Event pollution spikes
  if (activeEvent?.id === 'smog') {
    currentAQI = Math.min(300, currentAQI + 85);
  } else if (activeEvent?.id === 'heatwave') {
    currentAQI = Math.min(300, currentAQI + 30);
  }

  // EPA Standard Color and Rating Bands
  let status = 'Good';
  let color = '#2ecc71';
  let badgeClass = 'aqi-good';
  let description = 'Air quality is satisfactory and poses little to no risk.';

  if (currentAQI <= 50) {
    status = 'Good';
    color = '#2ecc71';
    badgeClass = 'aqi-good';
    description = 'Clean forest air. Safe for all outdoor activities.';
  } else if (currentAQI <= 100) {
    status = 'Moderate';
    color = '#f1c40f';
    badgeClass = 'aqi-moderate';
    description = 'Acceptable air quality with minor particulate haze.';
  } else if (currentAQI <= 150) {
    status = 'Unhealthy (Sensitive)';
    color = '#e67e22';
    badgeClass = 'aqi-sensitive';
    description = 'Older adults, children, and people with asthma may feel effects.';
  } else if (currentAQI <= 200) {
    status = 'Unhealthy';
    color = '#e74c3c';
    badgeClass = 'aqi-unhealthy';
    description = 'Everyone may begin to experience respiratory irritation.';
  } else if (currentAQI <= 300) {
    status = 'Very Unhealthy';
    color = '#8e44ad';
    badgeClass = 'aqi-very-unhealthy';
    description = 'Health alert: significant health risk across the city.';
  } else {
    status = 'Hazardous';
    color = '#78281f';
    badgeClass = 'aqi-hazardous';
    description = 'Emergency conditions. Avoid all outdoor activity.';
  }

  // Smog particle count (0 to 60 particles depending on AQI)
  const smogDensity = currentAQI > 70 ? Math.min(70, Math.floor((currentAQI - 70) * 0.45)) : 0;

  return {
    value: currentAQI,
    status,
    color,
    badgeClass,
    description,
    smogDensity,
  };
}
