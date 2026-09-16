const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function localSimulate(trees, area_km2, years, tree_type) {
  const isBroadleaf = (tree_type || 'broadleaf').toLowerCase() === 'broadleaf';
  const tau = isBroadleaf ? 6 : 10;
  const maturity = 1 - Math.exp(-years / tau);
  const effectiveTrees = trees * maturity;

  const co2_kg = effectiveTrees * 21.8;
  const co2_tons = co2_kg / 1000.0;
  const cars_removed = co2_tons / 4.6;

  const pollutant_mult = isBroadleaf ? 1.0 : 1.15;
  const pollutants_kg = effectiveTrees * 1.15 * pollutant_mult;

  const stormwater_liters = effectiveTrees * 5000;
  const stormwater_m3 = stormwater_liters / 1000.0;
  const olympic_pools = stormwater_liters / 2500000;

  const canopy_m2 = isBroadleaf ? 20 : 13;
  const total_canopy_m2 = effectiveTrees * canopy_m2;
  const area_m2 = area_km2 * 1000000;
  const canopy_fraction = Math.min(1.0, total_canopy_m2 / area_m2);
  const canopy_percent = canopy_fraction * 100.0;

  const temp_reduction_c = 4.0 * (1 - Math.exp(-3 * canopy_fraction));

  return {
    co2_kg: +co2_kg.toFixed(2),
    co2_tons: +co2_tons.toFixed(2),
    cars_removed: +cars_removed.toFixed(2),
    pollutants_kg: +pollutants_kg.toFixed(2),
    stormwater_liters: +stormwater_liters.toFixed(2),
    stormwater_m3: +stormwater_m3.toFixed(2),
    olympic_pools: +olympic_pools.toFixed(2),
    temp_reduction_c: +temp_reduction_c.toFixed(1),
    canopy_fraction: +canopy_fraction.toFixed(4),
    canopy_percent: +canopy_percent.toFixed(2),
  };
}

export async function simulate(params) {
  const payload = {
    trees: params.trees_planted,
    area_km2: params.city_area_km2,
    years: params.years_since_planting,
    tree_type: params.tree_type.toLowerCase(),
  };

  try {
    const response = await fetch(`${API_URL}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Simulation failed');
    return await response.json();
  } catch {
    // Offline / standalone fallback for instant web deployment
    return localSimulate(payload.trees, payload.area_km2, payload.years, payload.tree_type);
  }
}

