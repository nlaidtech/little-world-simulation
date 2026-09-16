import React from 'react';

function AqiMeter({ aqi }) {
  if (!aqi) return null;

  // Percentage on 0-300 scale
  const pct = Math.min(100, Math.round((aqi.value / 300) * 100));

  return (
    <div className="aqi-card">
      <div className="aqi-header">
        <div className="aqi-title-group">
          <span className="aqi-icon">🌫️</span>
          <div>
            <div className="aqi-label">Air Quality Index</div>
            <div className="aqi-value-row">
              <span className="aqi-num" style={{ color: aqi.color }}>{aqi.value}</span>
              <span className={`aqi-status-pill ${aqi.badgeClass}`}>{aqi.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="aqi-bar-wrapper">
        <div className="aqi-bar-track">
          <div 
            className="aqi-bar-thumb" 
            style={{ 
              left: `${pct}%`, 
              backgroundColor: aqi.color,
              boxShadow: `0 0 8px ${aqi.color}`
            }} 
          />
        </div>
        <div className="aqi-bar-labels">
          <span>0 Good</span>
          <span>100 Mod</span>
          <span>200 Unhealthy</span>
          <span>300+</span>
        </div>
      </div>

      <div className="aqi-desc">{aqi.description}</div>
    </div>
  );
}

export default AqiMeter;
