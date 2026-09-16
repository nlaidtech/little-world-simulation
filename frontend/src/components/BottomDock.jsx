import React from 'react';
import { TREE_SPECIES } from '../data/treeSpecies';
import { SEASONS } from '../data/seasons';

const BottomDock = ({
  year,
  isPlaying,
  speed,
  weather,
  timeOfDay,
  season,
  isHeatmapActive,
  comparisonMode,
  selectedSpecies,
  budget,
  onYearChange,
  onPlayPause,
  onSpeedChange,
  onToggleWeather,
  onToggleTimeOfDay,
  onToggleHeatmap,
  onToggleComparison,
  onCycleSeason,
  onSelectSpecies,
}) => {
  const currentSeasonData = SEASONS[season] || SEASONS.summer;

  return (
    <footer className="bottom-dock-container">
      <div className="bottom-dock">
        {/* Left Wing: Timeline & Playback Engine */}
        <div className="dock-section dock-timeline">
          <button
            className={`dock-play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={onPlayPause}
            title={isPlaying ? 'Pause Timeline' : 'Start Simulation'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className="dock-speed-pills">
            {[1, 2, 5].map(s => (
              <button
                key={s}
                className={`dock-speed-btn ${speed === s ? 'active' : ''}`}
                onClick={() => onSpeedChange(s)}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="dock-scrubber-group">
            <span className="dock-year-label">Yr {year}</span>
            <input
              type="range"
              min={0}
              max={30}
              value={year}
              onChange={e => onYearChange(Number(e.target.value))}
              className="dock-slider"
              title="Timeline Scrubber (Years 0 to 30)"
            />
            <span className="dock-year-max">30</span>
          </div>
        </div>

        {/* Center Deck: Botanical Nursery (Species Selection) */}
        <div className="dock-section dock-species-deck">
          <div className="dock-species-label">
            <span>NURSERY</span>
          </div>
          <div className="dock-species-cards">
            {Object.values(TREE_SPECIES).map((species, idx) => {
              const isSelected = selectedSpecies === species.id;
              const canAfford = budget >= species.cost;

              return (
                <button
                  key={species.id}
                  className={`species-card ${isSelected ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
                  onClick={() => canAfford && onSelectSpecies(species.id)}
                  title={`${species.name} — ${species.description} (Cost: $${species.cost})`}
                >
                  <span className="species-hotkey">{idx + 1}</span>
                  <div className="species-swatch" style={{ background: species.color }} />
                  <div className="species-meta">
                    <span className="species-title">{species.name}</span>
                    <span className="species-cost">${species.cost}</span>
                  </div>
                  {species.badge && <span className="species-badge">{species.badge}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Wing: Environmental & Atmospheric Viewport Controls */}
        <div className="dock-section dock-toggles">
          {/* Weather Toggle */}
          <button
            className={`dock-toggle-btn ${weather === 'rainy' ? 'active-rain' : 'active-sun'}`}
            onClick={onToggleWeather}
            title={weather === 'rainy' ? 'Set Sunny Weather' : 'Set Rainstorm'}
          >
            {weather === 'rainy' ? '🌧️ Rain' : '☀️ Sun'}
          </button>

          {/* Day / Night Toggle */}
          <button
            className={`dock-toggle-btn ${timeOfDay === 'night' ? 'active-night' : 'active-day'}`}
            onClick={onToggleTimeOfDay}
            title={timeOfDay === 'night' ? 'Set Daytime' : 'Set Nighttime'}
          >
            {timeOfDay === 'night' ? '🌙 Night' : '☀️ Day'}
          </button>

          {/* Season Cycle Button */}
          <button
            className="dock-toggle-btn active-season"
            onClick={onCycleSeason}
            title="Cycle Season (Spring → Summer → Autumn → Winter)"
          >
            {currentSeasonData.icon} {currentSeasonData.name}
          </button>

          {/* Thermal Heatmap Toggle */}
          <button
            className={`dock-toggle-btn ${isHeatmapActive ? 'active-heat' : ''}`}
            onClick={onToggleHeatmap}
            title="Toggle Urban Heat Island Thermal Shader"
          >
            🌡️ Heat
          </button>

          {/* 0-Tree Baseline Comparer */}
          <button
            className={`dock-toggle-btn ${comparisonMode === 'before' ? 'active-baseline' : ''}`}
            onClick={onToggleComparison}
            title="Toggle 0-Tree Baseline vs Forested Simulation"
          >
            {comparisonMode === 'before' ? '⚖️ 0-Trees' : '🌲 Forest'}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default BottomDock;
