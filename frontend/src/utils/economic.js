// Economic valuation model based on USDA Forest Service & EPA i-Tree research data
export function calculateEconomicSavings(results) {
  if (!results) {
    return {
      totalSavings: 0,
      carbonSavings: 0,
      healthcareSavings: 0,
      stormwaterSavings: 0,
      coolingSavings: 0,
    };
  }

  // 1. Social Cost of Carbon (EPA figure: ~$190 per metric ton CO2)
  const carbonSavings = (results.co2_tons || 0) * 190;

  // 2. Public Healthcare Savings (~$8.50 per kg of PM2.5, NO2, O3 removed)
  const healthcareSavings = (results.pollutants_kg || 0) * 8.5;

  // 3. Stormwater Drainage & Flood Mitigation (~$2.80 per m³ intercepted)
  const stormwaterSavings = (results.stormwater_m3 || 0) * 2.8;

  // 4. City-wide AC Electricity Savings (~$85,000 per 1°C cooling for 25 km² area)
  const coolingSavings = (results.temp_reduction_c || 0) * 85000;

  const totalSavings = carbonSavings + healthcareSavings + stormwaterSavings + coolingSavings;

  return {
    totalSavings: Math.round(totalSavings),
    carbonSavings: Math.round(carbonSavings),
    healthcareSavings: Math.round(healthcareSavings),
    stormwaterSavings: Math.round(stormwaterSavings),
    coolingSavings: Math.round(coolingSavings),
  };
}
