import { useState, useEffect, useRef, useCallback } from 'react';
import CityMap from './components/CityMap';
import StatsPanel from './components/StatsPanel';
import TimeControls from './components/TimeControls';
import TreeSpeciesBar from './components/TreeSpeciesBar';
import TileTooltip from './components/TileTooltip';
import AchievementToast from './components/AchievementToast';
import ClimateEventBanner from './components/ClimateEventBanner';
import { simulate } from './api';
import { INITIAL_LAYOUT, TILE_EMPTY, TILE_TREE, TREES_PER_TILE, CITY_AREA_KM2, ROWS, COLS } from './data/cityLayout';
import { ACHIEVEMENTS } from './data/achievements';
import { TREE_SPECIES } from './data/treeSpecies';
import { CLIMATE_EVENTS } from './data/climateEvents';
import { calculateEconomicSavings } from './utils/economic';
import { calculateAQI } from './utils/aqi';
import { playPlantSound, playRemoveSound, playAchievementSound, toggleSound, isSoundEnabled } from './utils/audio';
import './App.css';

function deepCopyGrid(grid) {
  return grid.map(row => [...row]);
}

function countTrees(grid) {
  let count = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === TILE_TREE) count++;
    }
  }
  return count;
}

function App() {
  const [grid, setGrid] = useState(() => deepCopyGrid(INITIAL_LAYOUT));
  const [year, setYear] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [treeType, setTreeType] = useState('broadleaf');
  const [weather, setWeather] = useState('sunny'); // 'sunny' | 'rainy'
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day' | 'night'
  const [season, setSeason] = useState('summer'); // 'spring' | 'summer' | 'autumn' | 'winter'
  const [selectedSpecies, setSelectedSpecies] = useState('oak');
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('current'); // 'current' | 'before'
  const [budget, setBudget] = useState(10000);
  const [activeEvent, setActiveEvent] = useState(null);
  const [treeMetadata, setTreeMetadata] = useState({});
  const [hoveredTileInfo, setHoveredTileInfo] = useState(null);
  const [results, setResults] = useState(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [currentToast, setCurrentToast] = useState(null);
  const [soundMuted, setSoundMuted] = useState(!isSoundEnabled());

  const timerRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const prevYearRef = useRef(year);

  const tileTrees = countTrees(grid);
  const totalTrees = tileTrees * TREES_PER_TILE;

  // Calculate annual municipal eco-dividend from social ROI
  const ecoSavings = calculateEconomicSavings(results);
  const annualDividend = Math.round(ecoSavings.totalSavings * 0.05);
  const aqi = calculateAQI(results, activeEvent);

  // Award annual dividends when the timeline advances
  useEffect(() => {
    if (year > prevYearRef.current) {
      const yearsPassed = year - prevYearRef.current;
      if (annualDividend > 0) {
        setBudget(b => b + (annualDividend * yearsPassed));
      }
    }
    prevYearRef.current = year;
  }, [year, annualDividend]);

  // Fetch simulation results when trees, year, or treeType change
  useEffect(() => {
    if (totalTrees === 0) {
      setResults({
        co2_kg: 0, co2_tons: 0, cars_removed: 0,
        pollutants_kg: 0, stormwater_liters: 0, stormwater_m3: 0,
        olympic_pools: 0, temp_reduction_c: 0, canopy_fraction: 0, canopy_percent: 0
      });
      return;
    }

    const fetchResults = async () => {
      try {
        const data = await simulate({
          trees_planted: totalTrees,
          city_area_km2: CITY_AREA_KM2,
          years_since_planting: year,
          tree_type: treeType.charAt(0).toUpperCase() + treeType.slice(1),
        });
        setResults(data);
      } catch (err) {
        console.error('Simulation failed:', err);
      }
    };

    const timeout = setTimeout(fetchResults, 150);
    return () => clearTimeout(timeout);
  }, [totalTrees, year, treeType]);

  // Check achievements whenever results, totalTrees, or year updates
  useEffect(() => {
    const stats = {
      treeCount: totalTrees,
      year,
      results,
    };

    ACHIEVEMENTS.forEach(ach => {
      if (!unlockedAchievements.includes(ach.id) && ach.check(stats)) {
        setUnlockedAchievements(prev => [...prev, ach.id]);
        playAchievementSound();

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setCurrentToast(ach);
        toastTimeoutRef.current = setTimeout(() => {
          setCurrentToast(null);
        }, 4500);
      }
    });
  }, [totalTrees, year, results, unlockedAchievements]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setYear(prev => {
          if (prev >= 30) {
            setIsPlaying(false);
            return 30;
          }
          return prev + 1;
        });
      }, 2000 / speed);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed]);

  const handlePlantTree = useCallback((row, col, speciesId) => {
    const sp = TREE_SPECIES[speciesId || 'oak'];
    const cost = sp?.cost || 50;

    if (budget < cost) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setCurrentToast({
        id: 'low-budget',
        title: 'Treasury Depleted!',
        description: `Planting ${sp.name} requires $${cost}. City fund has only $${Math.round(budget)}. Advance timeline to earn eco-dividends!`,
        icon: '💸'
      });
      toastTimeoutRef.current = setTimeout(() => setCurrentToast(null), 4000);
      return;
    }

    setGrid(prev => {
      if (prev[row][col] !== TILE_EMPTY) return prev;
      const next = deepCopyGrid(prev);
      next[row][col] = TILE_TREE;
      return next;
    });

    setTreeMetadata(prev => ({
      ...prev,
      [`${row}_${col}`]: {
        species: speciesId || 'oak',
        plantedYear: year,
      }
    }));

    setBudget(b => Math.max(0, b - cost));
    playPlantSound();
  }, [year, budget]);

  const handleRemoveTree = useCallback((row, col) => {
    setGrid(prev => {
      if (prev[row][col] !== TILE_TREE) return prev;
      const next = deepCopyGrid(prev);
      next[row][col] = TILE_EMPTY;
      return next;
    });

    setTreeMetadata(prev => {
      const copy = { ...prev };
      const meta = copy[`${row}_${col}`];
      const sp = TREE_SPECIES[meta?.species || 'oak'];
      const refund = Math.round((sp?.cost || 50) * 0.5);
      setBudget(b => b + refund);
      delete copy[`${row}_${col}`];
      return copy;
    });

    playRemoveSound();
  }, []);

  const handleToggleSound = () => {
    const enabled = toggleSound();
    setSoundMuted(!enabled);
  };

  const handleToggleWeather = () => {
    setWeather(prev => (prev === 'rainy' ? 'sunny' : 'rainy'));
  };

  const handleToggleTimeOfDay = () => {
    setTimeOfDay(prev => (prev === 'day' ? 'night' : 'day'));
  };

  const handleToggleHeatmap = () => {
    setIsHeatmapActive(prev => !prev);
  };

  const handleToggleComparison = () => {
    setComparisonMode(prev => (prev === 'current' ? 'before' : 'current'));
  };

  const handleCycleSeason = () => {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    setSeason(prev => {
      const idx = seasons.indexOf(prev);
      return seasons[(idx + 1) % seasons.length];
    });
  };

  const handleTriggerCrisis = () => {
    const events = Object.values(CLIMATE_EVENTS);
    const next = events[Math.floor(Math.random() * events.length)];
    setActiveEvent(next);
  };

  const handleResolveCrisis = (isSuccess) => {
    if (!activeEvent) return;

    if (isSuccess) {
      setBudget(b => b + activeEvent.grant);
      playAchievementSound();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setCurrentToast({
        id: 'crisis-success',
        title: 'City Resilient! 🛡️',
        description: `Canopy successfully mitigated the ${activeEvent.name}! Received +$${activeEvent.grant.toLocaleString()} Federal Resilience Grant!`,
        icon: '🎉'
      });
    } else {
      setBudget(b => Math.max(0, b - activeEvent.damagePenalty));
      playRemoveSound();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setCurrentToast({
        id: 'crisis-damage',
        title: 'Damage Incurred ⚠️',
        description: `Defenses insufficient for ${activeEvent.name}. Emergency municipal repairs cost -$${activeEvent.damagePenalty.toLocaleString()}.`,
        icon: '⚠️'
      });
    }
    toastTimeoutRef.current = setTimeout(() => setCurrentToast(null), 4500);
    setActiveEvent(null);
  };

  return (
    <div className={`game-container ${timeOfDay}-mode season-${season} ${isHeatmapActive ? 'heatmap-mode' : ''} ${activeEvent ? `event-${activeEvent.id}` : ''}`}>
      {/* Toast popup */}
      <AchievementToast 
        achievement={currentToast} 
        onClose={() => setCurrentToast(null)} 
      />

      {/* Climate Crisis Emergency Modal */}
      {activeEvent && (
        <ClimateEventBanner
          event={activeEvent}
          results={results}
          onResolve={handleResolveCrisis}
          onDismiss={() => setActiveEvent(null)}
        />
      )}

      {/* Left sidebar — Stats & Achievements */}
      <aside className="game-sidebar">
        <div className="game-logo">
          <img src="/assets/logo.jpg" alt="Canopy" className="game-logo-img" />
          <div>
            <h1>Canopy</h1>
            <span className="game-tagline">Living City Simulator</span>
          </div>
        </div>
        <StatsPanel
          results={results}
          treeCount={totalTrees}
          year={year}
          treeType={treeType}
          comparisonMode={comparisonMode}
          budget={budget}
          annualDividend={annualDividend}
          activeEvent={activeEvent}
          onTriggerCrisis={handleTriggerCrisis}
          onTreeTypeChange={setTreeType}
          unlockedAchievements={unlockedAchievements}
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
        />
      </aside>

      {/* Main area — Map + Controls */}
      <main className="game-main">
        {/* Top Tree Species Selection Bar */}
        <TreeSpeciesBar
          selectedSpecies={selectedSpecies}
          onSelectSpecies={setSelectedSpecies}
          budget={budget}
        />

        <div className="map-wrapper">
          <CityMap
            grid={grid}
            year={year}
            weather={weather}
            timeOfDay={timeOfDay}
            season={season}
            treeMetadata={treeMetadata}
            selectedSpecies={selectedSpecies}
            isHeatmapActive={isHeatmapActive}
            comparisonMode={comparisonMode}
            activeEvent={activeEvent}
            aqi={aqi}
            onPlantTree={handlePlantTree}
            onRemoveTree={handleRemoveTree}
            onHoverTileChange={setHoveredTileInfo}
          />
        </div>

        {/* Hover Inspector Tooltip HUD */}
        <TileTooltip 
          tileInfo={hoveredTileInfo} 
          year={year} 
          treeMetadata={treeMetadata} 
        />

        <TimeControls
          year={year}
          isPlaying={isPlaying}
          speed={speed}
          weather={weather}
          timeOfDay={timeOfDay}
          season={season}
          isHeatmapActive={isHeatmapActive}
          comparisonMode={comparisonMode}
          onYearChange={setYear}
          onPlayPause={() => setIsPlaying(prev => !prev)}
          onSpeedChange={setSpeed}
          onToggleWeather={handleToggleWeather}
          onToggleTimeOfDay={handleToggleTimeOfDay}
          onToggleHeatmap={handleToggleHeatmap}
          onToggleComparison={handleToggleComparison}
          onCycleSeason={handleCycleSeason}
        />
      </main>
    </div>
  );
}

export default App;
