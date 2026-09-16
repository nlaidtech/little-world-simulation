import React from 'react';
import ResultCard from './ResultCard';

function Dashboard({ results, loading }) {
  if (!results && !loading) {
    return <div className="dashboard-loading">Adjust the sliders to see simulation results...</div>;
  }

  if (!results && loading) {
    return <div className="dashboard-loading">Calculating...</div>;
  }

  return (
    <div className={`dashboard ${loading ? 'dashboard-updating' : ''}`}>
      <ResultCard 
        title="CO₂ Absorbed" 
        value={results.co2_tons} 
        unit="tons/year" 
        equivalent={`≈ ${results.cars_removed.toFixed(1)} cars removed from roads`} 
        iconSrc="/assets/icon_co2.jpg"
        accentColor="#2E7D32"
      />
      <ResultCard 
        title="Pollutants Filtered" 
        value={results.pollutants_kg} 
        unit="kg/year" 
        equivalent="PM, NO₂, SO₂, O₃ removed"
        iconSrc="/assets/icon_pollutants.jpg"
        accentColor="#00897B"
      />
      <ResultCard 
        title="Stormwater Intercepted" 
        value={results.stormwater_m3} 
        unit="m³/year" 
        equivalent={`≈ ${results.olympic_pools.toFixed(2)} Olympic pools`} 
        iconEmoji="💧"
        accentColor="#1976D2"
      />
      <ResultCard 
        title="City Cooling" 
        value={results.temp_reduction_c} 
        unit="°C reduction" 
        equivalent="Urban heat island offset"
        iconEmoji="🌡️"
        accentColor="#E65100"
      />
    </div>
  );
}

export default Dashboard;
