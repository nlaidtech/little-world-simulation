import React from 'react';

const TopStatusBar = ({
  year,
  season,
  budget,
  annualDividend,
  aqi,
  metrics,
  comparisonMode,
  activeEvent,
  onOpenAnalytics,
  isAnalyticsOpen,
  soundMuted,
  onToggleSound,
  onCycleSeason,
}) => {
  const canopyPct = Number(metrics?.canopy_cover_percent ?? metrics?.canopy_percent ?? 0).toFixed(1);
  const cooling = Number(metrics?.temp_reduction_celsius ?? metrics?.temp_reduction_c ?? 0).toFixed(1);
  const treesCount = metrics?.tree_count ?? metrics?.trees_planted ?? 0;

  const seasonIcons = {
    spring: '🌸 Spring',
    summer: '☀️ Summer',
    autumn: '🍂 Autumn',
    winter: '❄️ Winter',
  };

  return (
    <header className="top-status-bar">
      {/* Brand & City Title */}
      <div className="status-brand">
        <img src="/assets/logo.jpg" alt="Canopy Logo" className="status-logo-img" />
        <div className="status-brand-text">
          <span className="status-brand-title">CANOPY</span>
          <span className="status-brand-badge">SIMULATOR</span>
        </div>
      </div>

      {/* Center Live Metric Pills */}
      <div className="status-metrics-group">
        {/* Treasury Pill */}
        <div className="hud-pill treasury-pill" title="Municipal Green Treasury & Annual Eco-Dividend">
          <span className="pill-icon">🏛️</span>
          <div className="pill-content">
            <span className="pill-label">TREASURY</span>
            <span className="pill-value text-emerald">${Math.round(budget).toLocaleString()}</span>
          </div>
          {annualDividend > 0 && (
            <span className="dividend-tag">+${annualDividend}/yr</span>
          )}
        </div>

        {/* Year & Season Pill */}
        <div 
          className="hud-pill time-pill clickable" 
          onClick={onCycleSeason}
          title="Click to advance season"
        >
          <span className="pill-icon">📅</span>
          <div className="pill-content">
            <span className="pill-label">YEAR {year}</span>
            <span className="pill-value text-amber">{seasonIcons[season] || season}</span>
          </div>
        </div>

        {/* Air Quality Index Pill */}
        <div 
          className="hud-pill aqi-pill" 
          title={`Air Quality Index: ${aqi.value || aqi.aqi} (${aqi.status})`}
        >
          <span className="pill-icon">🍃</span>
          <div className="pill-content">
            <span className="pill-label">AIR QUALITY</span>
            <span className="pill-value" style={{ color: aqi.color }}>
              {aqi.value || aqi.aqi} AQI • {aqi.status}
            </span>
          </div>
        </div>

        {/* Canopy Cover & Trees Pill */}
        <div className="hud-pill canopy-pill" title="Urban Tree Canopy & Tree Population">
          <span className="pill-icon">🌲</span>
          <div className="pill-content">
            <span className="pill-label">CANOPY</span>
            <span className="pill-value text-green">{canopyPct}%</span>
          </div>
          <span className="pill-subtext">({treesCount} trees)</span>
        </div>

        {/* Cooling Offset Pill */}
        <div className="hud-pill cooling-pill" title="Urban Heat Island Cooling Effect">
          <span className="pill-icon">🌡️</span>
          <div className="pill-content">
            <span className="pill-label">UHI OFFSET</span>
            <span className="pill-value text-cyan">-{cooling}°C</span>
          </div>
        </div>
      </div>

      {/* Right Controls Group */}
      <div className="status-actions-group">
        {/* Sound Toggle */}
        <button
          className={`hud-icon-btn ${soundMuted ? 'muted' : ''}`}
          onClick={onToggleSound}
          title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {soundMuted ? '🔇' : '🔊'}
        </button>

        {/* Analytics Drawer Toggle */}
        <button
          className={`hud-analytics-btn ${isAnalyticsOpen ? 'active' : ''}`}
          onClick={onOpenAnalytics}
          title="Toggle Detailed City Analytics"
        >
          <span className="btn-icon">📊</span>
          <span className="btn-text">Analytics</span>
        </button>
      </div>
    </header>
  );
};

export default TopStatusBar;
