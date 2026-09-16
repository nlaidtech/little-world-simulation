const API_URL = 'http://localhost:8000';

export async function simulate(params) {
  // Transform frontend field names to match backend API
  const payload = {
    trees: params.trees_planted,
    area_km2: params.city_area_km2,
    years: params.years_since_planting,
    tree_type: params.tree_type.toLowerCase(),
  };

  const response = await fetch(`${API_URL}/api/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Simulation failed');
  return response.json();
}
