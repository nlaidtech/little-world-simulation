import { useState } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';
import { calculateEconomicSavings } from '../utils/economic';
import { calculateAQI } from '../utils/aqi';
import AqiMeter from './AqiMeter';

function StatsPanel({ 
  results, 
  treeCount, 
  year, 
  treeType, 
  comparisonMode = 'current',
  budget = 10000,
  annualDividend = 0,
  activeEvent = null,
  onTriggerCrisis,
  onTreeTypeChange, 
  unlockedAchievements,
  soundMuted,
  onToggleSound 
}) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showEconomicBreakdown, setShowEconomicBreakdown] = useState(true);

  const isBeforeMode = comparisonMode === 'before';

  const fmt = (n, decimals = 1) => {
    if (n == null) return '—';
    return Number(n).toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  const fmtMoney = (n) => {
    return '$' + Math.round(n || 0).toLocaleString();
  };

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  // Calculate economic valuation
  const eco = calculateEconomicSavings(isBeforeMode ? null : results);
  // Calculate Air Quality Index
  const aqi = calculateAQI(isBeforeMode ? null : results, activeEvent);

  return (
    <div className="stats-panel">
      <div className="panel-header-row">
        <h2>🌳 City Stats</h2>
        <button 
          className={`sound-toggle-btn ${soundMuted ? 'muted' : ''}`}
          onClick={onToggleSound}
          title={soundMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {soundMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Municipal Green Treasury Card */}
      <div className="treasury-card">
        <div className="treasury-header">
          <span className="treasury-icon">🏛️</span>
          <div className="treasury-info">
            <span className="treasury-label">Municipal Treasury</span>
            <div className="treasury-balance-row">
              <span className={`treasury-balance ${budget < 200 ? 'low-funds' : ''}`}>
                ${Math.round(budget).toLocaleString()}
              </span>
              <span className="treasury-dividend" title="Annual eco-dividends earned from carbon credits and avoided infrastructure repair costs">
                +{fmtMoney(annualDividend)}/yr
              </span>
            </div>
          </div>
        </div>
      </div>

      {isBeforeMode && (
        <div className="comparison-alert-banner">
          ⚠️ Viewing 0-Tree Baseline (Before Urban Forestry)
        </div>
      )}

      {/* Climate Crisis Action Trigger Button */}
      <div className="crisis-launcher-row">
        <button 
          className={`crisis-btn ${activeEvent ? 'active' : ''}`}
          onClick={onTriggerCrisis}
          title="Simulate or respond to an extreme municipal climate emergency"
        >
          {activeEvent ? `⚠️ Active: ${activeEvent.name}` : '⚡ Simulate Climate Crisis'}
        </button>
      </div>

      <div className="stat-row highlight">
        <span className="stat-label">Trees Planted</span>
        <span className="stat-value">{isBeforeMode ? '0' : treeCount.toLocaleString()}</span>
      </div>

      <div className="stat-row">
        <span className="stat-label">Year</span>
        <span className="stat-value">{year}</span>
      </div>

      <div className="stat-row">
        <span className="stat-label">Tree Type</span>
        <select 
          value={treeType} 
          onChange={(e) => onTreeTypeChange(e.target.value)}
          className="tree-type-select"
        >
          <option value="broadleaf">🌳 Broadleaf</option>
          <option value="conifer">🌲 Conifer</option>
        </select>
      </div>

      <hr className="stat-divider" />

      {/* Economic ROI Card */}
      <div className="economic-card">
        <div 
          className="economic-header"
          onClick={() => setShowEconomicBreakdown(b => !b)}
          style={{ cursor: 'pointer' }}
        >
          <div className="eco-title-group">
            <span className="eco-icon">💵</span>
            <div>
              <div className="eco-label">Annual Eco-Savings</div>
              <div className="eco-value">{fmtMoney(eco.totalSavings)}/yr</div>
            </div>
          </div>
          <span className="eco-chevron">{showEconomicBreakdown ? '▲' : '▼'}</span>
        </div>

        {showEconomicBreakdown && (
          <div className="economic-details">
            <div className="eco-subrow">
              <span>⚡ AC Cooling Energy:</span>
              <span className="eco-subvalue">{fmtMoney(eco.coolingSavings)}</span>
            </div>
            <div className="eco-subrow">
              <span>💧 Flood & Drainage:</span>
              <span className="eco-subvalue">{fmtMoney(eco.stormwaterSavings)}</span>
            </div>
            <div className="eco-subrow">
              <span>🏥 Clean Air & Health:</span>
              <span className="eco-subvalue">{fmtMoney(eco.healthcareSavings)}</span>
            </div>
            <div className="eco-subrow">
              <span>🌿 Carbon Social Value:</span>
              <span className="eco-subvalue">{fmtMoney(eco.carbonSavings)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Air Quality Index Meter */}
      <AqiMeter aqi={aqi} />

      <hr className="stat-divider" />

      <div className="stat-row green">
        <span className="stat-label">🌿 CO₂ Absorbed</span>
        <span className="stat-value">{isBeforeMode ? '0 t/yr' : `${fmt(results?.co2_tons)} t/yr`}</span>
      </div>
      {!isBeforeMode && results?.cars_removed > 0 && (
        <div className="stat-equivalent">≈ {fmt(results.cars_removed)} cars removed</div>
      )}

      <div className="stat-row teal">
        <span className="stat-label">💨 Pollutants</span>
        <span className="stat-value">{isBeforeMode ? '0 kg/yr' : `${fmt(results?.pollutants_kg)} kg/yr`}</span>
      </div>

      <div className="stat-row blue">
        <span className="stat-label">💧 Stormwater</span>
        <span className="stat-value">{isBeforeMode ? '0 m³/yr' : `${fmt(results?.stormwater_m3)} m³/yr`}</span>
      </div>
      {!isBeforeMode && results?.olympic_pools > 0.01 && (
        <div className="stat-equivalent">≈ {fmt(results.olympic_pools, 2)} Olympic pools</div>
      )}

      <div className="stat-row orange">
        <span className="stat-label">🌡️ Cooling</span>
        <span className="stat-value">{isBeforeMode ? '0.0°C' : `−${fmt(results?.temp_reduction_c)}°C`}</span>
      </div>

      <hr className="stat-divider" />

      <div className="stat-row">
        <span className="stat-label">Canopy Cover</span>
        <span className="stat-value">{isBeforeMode ? '0.0%' : `${fmt(results?.canopy_percent)}%`}</span>
      </div>
      <div className="canopy-bar">
        <div 
          className="canopy-bar-fill" 
          style={{ width: `${isBeforeMode ? 0 : Math.min(100, results?.canopy_percent || 0)}%` }}
        />
      </div>

      <hr className="stat-divider" />

      {/* Achievements Section */}
      <div className="achievements-section">
        <button 
          className="achievements-toggle" 
          onClick={() => setShowAchievements(prev => !prev)}
        >
          <span className="trophy-badge">🏆 Goals & Badges ({unlockedCount}/{totalCount})</span>
          <span>{showAchievements ? '▲' : '▼'}</span>
        </button>

        {showAchievements && (
          <div className="achievements-list">
            {ACHIEVEMENTS.map(item => {
              const isUnlocked = unlockedAchievements.includes(item.id);
              return (
                <div 
                  key={item.id} 
                  className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-item-icon">{item.icon}</div>
                  <div className="achievement-item-text">
                    <div className="achievement-item-title">
                      {item.title} {isUnlocked && <span className="check">✓</span>}
                    </div>
                    <div className="achievement-item-desc">{item.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsPanel;
