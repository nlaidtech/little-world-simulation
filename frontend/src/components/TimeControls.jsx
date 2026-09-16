import React from 'react';

function TimeControls({ 
  year, 
  isPlaying, 
  speed, 
  weather, 
  timeOfDay = 'day',
  season = 'summer',
  isHeatmapActive,
  comparisonMode,
  onYearChange, 
  onPlayPause, 
  onSpeedChange, 
  onToggleWeather,
  onToggleTimeOfDay, 
  onToggleHeatmap,
  onToggleComparison,
  onCycleSeason,
}) {
  return (
    <div className="time-controls">
      <div className="time-display">
        <span className="year-label">Year</span>
        <span className="year-value">{year}</span>
      </div>

      <div className="time-slider-group">
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="year-slider"
        />
      </div>

      <div className="time-buttons">
        <button 
          className={`play-btn ${isPlaying ? 'playing' : ''}`} 
          onClick={onPlayPause}
          title={isPlaying ? 'Pause' : 'Play Timeline'}
        >
          {isPlaying ? '⏸' : '▶️'}
        </button>

        <div className="speed-group">
          {[1, 2, 5].map((s) => (
            <button
              key={s}
              className={`speed-btn ${speed === s ? 'active' : ''}`}
              onClick={() => onSpeedChange(s)}
              title={`${s}x Simulation Speed`}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Season Cycle Toggle */}
        <button 
          className={`mode-toggle-btn season-btn season-${season}`}
          onClick={onCycleSeason}
          title="Cycle Season (Spring 🌸 / Summer ☀️ / Autumn 🍁 / Winter ❄️)"
        >
          {season === 'spring' && '🌸 Spring'}
          {season === 'summer' && '☀️ Summer'}
          {season === 'autumn' && '🍁 Autumn'}
          {season === 'winter' && '❄️ Winter'}
        </button>

        {/* Thermal Heatmap Toggle */}
        <button 
          className={`mode-toggle-btn heatmap ${isHeatmapActive ? 'active' : ''}`}
          onClick={onToggleHeatmap}
          title="Toggle Urban Heat Island Thermal Heatmap"
        >
          {isHeatmapActive ? '🌡️ Heatmap: ON' : '🌡️ Heatmap'}
        </button>

        {/* Before vs After Comparer */}
        <button 
          className={`mode-toggle-btn compare ${comparisonMode === 'before' ? 'active' : ''}`}
          onClick={onToggleComparison}
          title="Toggle Baseline Comparison (0 Trees vs Current Forested)"
        >
          {comparisonMode === 'before' ? '⚖️ Base: 0 Trees' : '⚖️ Forested'}
        </button>

        {/* Day / Night Toggle */}
        <button 
          className={`time-of-day-btn ${timeOfDay}`}
          onClick={onToggleTimeOfDay}
          title="Toggle Day / Night Cycle"
        >
          {timeOfDay === 'night' ? '🌙 Night' : '☀️ Day'}
        </button>

        {/* Weather Mode Toggle */}
        <button 
          className={`weather-toggle-btn ${weather}`}
          onClick={onToggleWeather}
          title="Click to toggle Weather (Sunny / Rainy)"
        >
          {weather === 'sunny' ? '☀️ Sunny' : '🌧️ Rainy'}
        </button>
      </div>
    </div>
  );
}

export default TimeControls;
