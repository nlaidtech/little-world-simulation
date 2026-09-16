import React from 'react';
import { 
  TILE_EMPTY, TILE_ROAD, TILE_HOUSE, TILE_MEDIUM, TILE_LARGE, 
  TILE_TREE, TILE_WATER, TILE_BRIDGE, TILE_CHURCH, TILE_FARM,
  TILE_BENCH, TILE_FOUNTAIN, TILE_PLAYGROUND
} from '../data/cityLayout';
import { TREE_SPECIES } from '../data/treeSpecies';

function TileTooltip({ tileInfo, year, treeMetadata }) {
  if (!tileInfo) return null;

  const { row, col, type } = tileInfo;
  let title = '';
  let subtitle = '';
  let badge = '';
  let icon = '';

  if (type === TILE_EMPTY) {
    icon = '🌱';
    title = 'Open Green Space';
    subtitle = 'Lush soil ready for planting trees.';
    badge = 'Plantable';
  } else if (type === TILE_TREE) {
    const key = `${row}_${col}`;
    const treeData = treeMetadata[key] || { species: 'oak', plantedYear: 1 };
    const sp = TREE_SPECIES[treeData.species] || TREE_SPECIES.oak;
    const treeAge = Math.max(0, year - (treeData.plantedYear || 0));

    // Approximate mature fraction for tooltip
    const maturity = 1 - Math.exp(-treeAge / sp.tau);
    const co2Kg = (500 * maturity * 21.8).toFixed(1);
    const waterL = (500 * maturity * 5000 / 1000).toFixed(0);

    icon = sp.icon;
    title = `${sp.name} Grove`;
    subtitle = `Age: ${treeAge} yrs • Absorbs ~${co2Kg} kg CO₂/yr • Intercepts ~${waterL} m³ rain`;
    badge = sp.badge;
  } else if (type === TILE_ROAD) {
    icon = '🛣️';
    title = 'City Boulevard';
    subtitle = 'Asphalt roadway with marked pedestrian crosswalks.';
    badge = 'Roadway';
  } else if (type === TILE_BRIDGE) {
    icon = '🌉';
    title = 'Riverway Highway Bridge';
    subtitle = 'Reinforced concrete bridge crossing the city river.';
    badge = 'Infrastructure';
  } else if (type === TILE_WATER) {
    icon = '🌊';
    title = 'Grand River';
    subtitle = 'Natural waterway flowing through the city center.';
    badge = 'Natural Water';
  } else if (type === TILE_HOUSE) {
    icon = '🏡';
    title = 'Suburban Neighborhood';
    subtitle = 'Single-family homes with gardens and sidewalks.';
    badge = 'Residential';
  } else if (type === TILE_MEDIUM) {
    icon = '🏢';
    title = 'Mid-Rise Commercial Center';
    subtitle = 'Local businesses, offices, and apartment complexes.';
    badge = 'Commercial';
  } else if (type === TILE_LARGE) {
    icon = '🏙️';
    title = 'Downtown Highrise Tower';
    subtitle = 'Metropolitan glass skyscraper forming the urban heat island.';
    badge = 'Downtown';
  } else if (type === TILE_CHURCH) {
    icon = '⛪';
    title = 'Cathedral of St. Jude';
    subtitle = 'Historic stone cathedral with bell tower and golden cross.';
    badge = 'Heritage';
  } else if (type === TILE_FARM) {
    icon = '🚜';
    title = 'Sunnybrook Farm Pasture';
    subtitle = 'Red timber barn with silo and 4 grazing Holstein cows 🐄.';
    badge = 'Agriculture';
  } else if (type === TILE_BENCH) {
    icon = '🪑';
    title = 'Park Bench Promenade';
    subtitle = 'Comfortable cedar bench under the leafy urban canopy where citizens read and rest.';
    badge = 'Park Amenity';
  } else if (type === TILE_FOUNTAIN) {
    icon = '⛲';
    title = 'Grand Plaza Water Fountain';
    subtitle = 'Tiered civic water fountain cooling the surrounding plaza with refreshing mist.';
    badge = 'Civic Landmark';
  } else if (type === TILE_PLAYGROUND) {
    icon = '🎠';
    title = 'Community Playground';
    subtitle = 'Neighborhood schoolyard with swings, slide, and shade trees for children.';
    badge = 'Recreation';
  }

  return (
    <div className="tile-tooltip-hud">
      <div className="tooltip-icon">{icon}</div>
      <div className="tooltip-details">
        <div className="tooltip-header">
          <span className="tooltip-title">{title}</span>
          <span className="tooltip-coord">[{row}, {col}]</span>
          {badge && <span className="tooltip-badge">{badge}</span>}
        </div>
        <div className="tooltip-sub">{subtitle}</div>
      </div>
    </div>
  );
}

export default TileTooltip;
