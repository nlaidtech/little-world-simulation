import { useRef, useEffect, useCallback, useState } from 'react';
import { 
  TILE_EMPTY, TILE_ROAD, TILE_HOUSE, TILE_MEDIUM, TILE_LARGE, 
  TILE_TREE, TILE_WATER, TILE_BRIDGE, TILE_CHURCH, TILE_FARM, 
  ROWS, COLS, INTERSECTIONS 
} from '../data/cityLayout';
import { TREE_SPECIES } from '../data/treeSpecies';
import { SEASONS } from '../data/seasons';
import { 
  playChurchBellSound, 
  playCowMooSound, 
  playCarHonkSound, 
  playWaterSplashSound 
} from '../utils/audio';

const COLORS = {
  road: '#444444',
  roadMarking: '#f0e68c',
  treeTrunk: '#5c3a21',
  bridge: '#7f8c8d',
  bridgeRailing: '#bdc3c7',
  churchStone: '#95a5a6',
  churchRoof: '#7f8c8d',
  churchSpire: '#d4ac0d',
  barnRed: '#b03a2e',
  barnTrim: '#fdfefe',
  fence: '#8d6e63',
  hay: '#f1c40f',
  snow: '#ecf0f1',
};

const CAR_COLORS = ['#e74c3c', '#f39c12', '#3498db', '#ecf0f1', '#9b59b6', '#1abc9c', '#f1c40f'];
const SHIRT_COLORS = ['#e67e22', '#2ecc71', '#e74c3c', '#9b59b6', '#3498db', '#f39c12'];

function getTreeStage(age) {
  if (age <= 2) return 'seedling';
  if (age <= 8) return 'young';
  if (age <= 18) return 'mature';
  return 'old';
}

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function CityMap({ 
  grid, 
  year, 
  weather = 'rainy', 
  timeOfDay = 'day',
  season = 'summer',
  treeMetadata = {},
  selectedSpecies = 'oak',
  isHeatmapActive = false,
  comparisonMode = 'current',
  activeEvent = null,
  aqi = null,
  onPlantTree, 
  onRemoveTree,
  onHoverTileChange,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoverTile, setHoverTile] = useState(null);
  const [zoom, setZoom] = useState(1.0);

  // Entities and systems
  const carsRef = useRef([]);
  const humansRef = useRef([]);
  const cowsRef = useRef([]);
  const ducksRef = useRef([]);
  const bargeRef = useRef({ y: -4, col: 14.8, speed: 0.015 });
  const rainDropsRef = useRef([]);
  const ripplesRef = useRef([]);
  const splashesRef = useRef([]);
  const plantAnimsRef = useRef([]);
  const leafParticlesRef = useRef([]);
  const clickEffectsRef = useRef([]); // floating notes / splash icons on click
  const smogParticlesRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const waterTimeRef = useRef(0);

  const getBaseTileSize = useCallback(() => {
    if (!containerRef.current) return 36;
    const containerWidth = containerRef.current.clientWidth - 48;
    return Math.max(26, Math.min(50, Math.floor(containerWidth / COLS)));
  }, []);

  const getEffectiveTileSize = useCallback(() => {
    return Math.round(getBaseTileSize() * zoom);
  }, [getBaseTileSize, zoom]);

  // Initialize Cars, Humans, Dogs, Cows, Ducks, and Weather Particles
  useEffect(() => {
    const hRoads = [3, 8, 13];
    const vRoads = [4, 9, 18];

    const initialCars = [];
    hRoads.forEach((row, i) => {
      initialCars.push({
        dir: i % 2 === 0 ? 'right' : 'left',
        row,
        col: Math.random() * (COLS - 3),
        targetSpeed: 0.05 + Math.random() * 0.03,
        currentSpeed: 0.05,
        color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
        type: 'h',
      });
      initialCars.push({
        dir: i % 2 === 0 ? 'right' : 'left',
        row,
        col: (COLS / 2) + Math.random() * (COLS / 2 - 2),
        targetSpeed: 0.04 + Math.random() * 0.03,
        currentSpeed: 0.04,
        color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
        type: 'h',
      });
    });

    vRoads.forEach((col, i) => {
      initialCars.push({
        dir: i % 2 === 0 ? 'down' : 'up',
        row: Math.random() * (ROWS - 3),
        col,
        targetSpeed: 0.045 + Math.random() * 0.025,
        currentSpeed: 0.045,
        color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
        type: 'v',
      });
    });
    carsRef.current = initialCars;

    const initialHumans = [
      { x: 1.5, y: 1.5, vx: 0.015, vy: 0, shirt: SHIRT_COLORS[0], hasDog: true, dogOffset: -0.4, isWaiting: false },
      { x: 3.5, y: 8.5, vx: 0.018, vy: 0, shirt: SHIRT_COLORS[1], hasDog: false, isWaiting: false },
      { x: 12.5, y: 1.5, vx: 0, vy: 0.015, shirt: SHIRT_COLORS[2], hasDog: true, dogOffset: 0.4, isWaiting: false },
      { x: 20.5, y: 9.5, vx: -0.016, vy: 0, shirt: SHIRT_COLORS[3], hasDog: false, isWaiting: false },
      { x: 8.5, y: 14.5, vx: 0.014, vy: 0, shirt: SHIRT_COLORS[4], hasDog: true, dogOffset: -0.35, isWaiting: false },
      { x: 17.5, y: 3.5, vx: -0.015, vy: 0, shirt: SHIRT_COLORS[5], hasDog: true, dogOffset: 0.35, isWaiting: false },
    ];
    humansRef.current = initialHumans;

    const initialCows = [
      { x: 21.2, y: 14.6, chewingPhase: 0, tailPhase: 0.2, dir: 1 },
      { x: 22.4, y: 15.3, chewingPhase: 1.5, tailPhase: 2.1, dir: -1 },
      { x: 20.8, y: 16.4, chewingPhase: 3.2, tailPhase: 0.8, dir: 1 },
      { x: 22.7, y: 17.2, chewingPhase: 0.8, tailPhase: 1.4, dir: -1 },
    ];
    cowsRef.current = initialCows;

    // Swimming river ducks 🦆
    const initialDucks = [
      { x: 14.4, y: 1.2, vx: 0.008, vy: 0.004, phase: 0 },
      { x: 15.2, y: 4.8, vx: -0.006, vy: 0.007, phase: 1.5 },
      { x: 15.7, y: 10.4, vx: 0.005, vy: 0.008, phase: 3.0 },
    ];
    ducksRef.current = initialDucks;

    // Particles (Raindrops or Snowflakes)
    const drops = [];
    for (let i = 0; i < 200; i++) {
      drops.push({
        x: Math.random() * (COLS * 50),
        y: Math.random() * (ROWS * 50),
        speed: 4 + Math.random() * 6,
        length: 10 + Math.random() * 8,
        opacity: 0.2 + Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 1.5,
      });
    }
    rainDropsRef.current = drops;
  }, []);

  const getTrafficSignalState = (time) => {
    const cycle = (time / 1000) % 12;
    if (cycle < 5) {
      return { h: 'green', v: 'red', pedH: 'walk', pedV: 'stop' };
    } else if (cycle < 6.5) {
      return { h: 'yellow', v: 'red', pedH: 'stop', pedV: 'stop' };
    } else if (cycle < 11.5) {
      return { h: 'red', v: 'green', pedH: 'stop', pedV: 'walk' };
    } else {
      return { h: 'red', v: 'yellow', pedH: 'stop', pedV: 'stop' };
    }
  };

  const currentSeason = SEASONS[season] || SEASONS.summer;

  // --- Terrain & Building Subroutines ---
  const drawGrass = (ctx, x, y, size, row, col) => {
    ctx.fillStyle = (row + col) % 2 === 0 ? currentSeason.grass : currentSeason.grassAlt;
    ctx.fillRect(x, y, size, size);
  };

  const drawWater = (ctx, x, y, size, row, col, time) => {
    const grad = ctx.createLinearGradient(x, y, x + size, y + size);
    grad.addColorStop(0, currentSeason.waterColor);
    grad.addColorStop(1, '#3498db');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, size, size);

    ctx.strokeStyle = timeOfDay === 'night' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    const waveOffset = Math.sin(time * 0.003 + row * 0.5 + col * 0.5) * 3;

    ctx.beginPath();
    ctx.arc(x + size * 0.3 + waveOffset, y + size * 0.4, size * 0.2, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + size * 0.7 - waveOffset, y + size * 0.7, size * 0.18, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  };

  const drawBridge = (ctx, x, y, size, grid, row, col) => {
    drawWater(ctx, x, y, size, row, col, waterTimeRef.current);

    ctx.fillStyle = COLORS.bridge;
    ctx.fillRect(x, y + size * 0.1, size, size * 0.8);

    ctx.fillStyle = COLORS.bridgeRailing;
    ctx.fillRect(x, y + size * 0.06, size, size * 0.08);
    ctx.fillRect(x, y + size * 0.86, size, size * 0.08);

    ctx.strokeStyle = COLORS.roadMarking;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, y + size / 2);
    ctx.lineTo(x + size, y + size / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawRoad = (ctx, x, y, size, grid, row, col) => {
    ctx.fillStyle = COLORS.road;
    ctx.fillRect(x, y, size, size);

    ctx.strokeStyle = COLORS.roadMarking;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);

    const isHRoad = (col > 0 && (grid[row]?.[col - 1] === TILE_ROAD || grid[row]?.[col - 1] === TILE_BRIDGE)) ||
                    (col < COLS - 1 && (grid[row]?.[col + 1] === TILE_ROAD || grid[row]?.[col + 1] === TILE_BRIDGE));

    const isVRoad = (row > 0 && grid[row - 1]?.[col] === TILE_ROAD) ||
                    (row < ROWS - 1 && grid[row + 1]?.[col] === TILE_ROAD);

    if (isHRoad) {
      ctx.beginPath();
      ctx.moveTo(x, y + size / 2);
      ctx.lineTo(x + size, y + size / 2);
      ctx.stroke();
    }
    if (isVRoad) {
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y);
      ctx.lineTo(x + size / 2, y + size);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  };

  const drawCrosswalk = (ctx, x, y, size) => {
    ctx.fillStyle = '#ffffff';
    const barWidth = size * 0.12;
    const barGap = size * 0.08;

    for (let bx = x + size * 0.15; bx < x + size * 0.85; bx += (barWidth + barGap)) {
      ctx.fillRect(bx, y + 2, barWidth, size * 0.16);
      ctx.fillRect(bx, y + size - size * 0.18, barWidth, size * 0.16);
    }
    for (let by = y + size * 0.15; by < y + size * 0.85; by += (barWidth + barGap)) {
      ctx.fillRect(x + 2, by, size * 0.16, barWidth);
      ctx.fillRect(x + size - size * 0.18, by, size * 0.16, barWidth);
    }
  };

  const drawTrafficLight = (ctx, x, y, size, signals) => {
    const lx = x + size * 0.82;
    const ly = y + 2;
    const lw = size * 0.18;
    const lh = size * 0.45;

    ctx.fillStyle = '#1c2833';
    ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1;
    ctx.strokeRect(lx, ly, lw, lh);

    const rRadius = lw * 0.35;
    const cx = lx + lw / 2;

    ctx.fillStyle = signals.h === 'red' ? '#e74c3c' : '#4a1510';
    ctx.beginPath();
    ctx.arc(cx, ly + lh * 0.22, rRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = signals.h === 'yellow' ? '#f1c40f' : '#4d3e05';
    ctx.beginPath();
    ctx.arc(cx, ly + lh * 0.52, rRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = signals.h === 'green' ? '#2ecc71' : '#0e3a1f';
    ctx.beginPath();
    ctx.arc(cx, ly + lh * 0.82, rRadius, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBuilding = (ctx, x, y, size, type) => {
    const pad = size * 0.12;
    const bx = x + pad;
    const bw = size - pad * 2;

    let bh, color, roofColor;
    if (type === TILE_HOUSE) {
      bh = size * 0.48;
      color = '#d4a574';
      roofColor = '#964b1d';
    } else if (type === TILE_MEDIUM) {
      bh = size * 0.7;
      color = '#7f8c8d';
      roofColor = '#34495e';
    } else {
      bh = size * 0.88;
      color = '#34495e';
      roofColor = '#1a252f';
    }

    const by = y + size - bh;
    ctx.fillStyle = color;
    ctx.fillRect(bx, by, bw, bh);

    // Roof (with snow dusting in winter!)
    ctx.fillStyle = season === 'winter' ? COLORS.snow : roofColor;
    ctx.fillRect(bx, by, bw, size * 0.1);

    ctx.fillStyle = timeOfDay === 'night' ? '#ffe082' : '#fff9c4';
    const winSize = Math.max(2, size * 0.08);
    const winGap = winSize * 2.2;
    for (let wy = by + size * 0.16; wy < by + bh - winGap; wy += winGap) {
      for (let wx = bx + winGap * 0.8; wx < bx + bw - winSize; wx += winGap) {
        ctx.fillRect(wx, wy, winSize, winSize);
      }
    }
  };

  const drawChurch = (ctx, x, y, size) => {
    const cx = x + size / 2;
    const baseW = size * 0.7;
    const baseH = size * 0.55;
    const baseY = y + size * 0.9 - baseH;

    ctx.fillStyle = COLORS.churchStone;
    ctx.fillRect(cx - baseW / 2, baseY, baseW, baseH);

    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.arc(cx, baseY + baseH - size * 0.15, size * 0.08, Math.PI, 0);
    ctx.lineTo(cx + size * 0.08, baseY + baseH);
    ctx.lineTo(cx - size * 0.08, baseY + baseH);
    ctx.fill();

    ctx.fillStyle = timeOfDay === 'night' ? '#ba68c8' : '#9b59b6';
    ctx.beginPath();
    ctx.arc(cx, baseY + baseH * 0.4, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    const towerW = size * 0.28;
    const towerH = size * 0.4;
    const towerX = cx - towerW / 2;
    const towerY = baseY - towerH;

    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(towerX, towerY, towerW, towerH);

    // Steeple cone (snow capped in winter)
    ctx.fillStyle = season === 'winter' ? COLORS.snow : COLORS.churchRoof;
    ctx.beginPath();
    ctx.moveTo(towerX, towerY);
    ctx.lineTo(cx, towerY - size * 0.35);
    ctx.lineTo(towerX + towerW, towerY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = COLORS.churchSpire;
    ctx.lineWidth = 2;
    const crossTop = towerY - size * 0.35;
    ctx.beginPath();
    ctx.moveTo(cx, crossTop);
    ctx.lineTo(cx, crossTop - size * 0.14);
    ctx.moveTo(cx - size * 0.05, crossTop - size * 0.09);
    ctx.lineTo(cx + size * 0.05, crossTop - size * 0.09);
    ctx.stroke();
  };

  const drawFarm = (ctx, x, y, size) => {
    ctx.fillStyle = season === 'winter' ? '#d0d7d9' : COLORS.pasture;
    ctx.fillRect(x, y, size, size);

    ctx.strokeStyle = COLORS.fence;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);

    const bw = size * 0.6;
    const bh = size * 0.45;
    const bx = x + size * 0.15;
    const by = y + size * 0.35;

    ctx.fillStyle = COLORS.barnRed;
    ctx.fillRect(bx, by, bw, bh);

    // Gambrel roof
    ctx.fillStyle = season === 'winter' ? COLORS.snow : '#78281f';
    ctx.beginPath();
    ctx.moveTo(bx - 2, by);
    ctx.lineTo(bx + bw / 2, by - size * 0.2);
    ctx.lineTo(bx + bw + 2, by);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = COLORS.barnTrim;
    ctx.fillRect(bx + bw * 0.35, by + bh * 0.3, bw * 0.3, bh * 0.7);

    // Silo
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(bx + bw + 2, by - size * 0.1, size * 0.14, bh + size * 0.1);
    ctx.fillStyle = season === 'winter' ? COLORS.snow : '#95a5a6';
    ctx.beginPath();
    ctx.arc(bx + bw + 2 + size * 0.07, by - size * 0.1, size * 0.07, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = COLORS.hay;
    ctx.fillRect(x + size * 0.75, y + size * 0.7, size * 0.15, size * 0.12);
  };

  // --- Seasonal & Species Tree Rendering ---
  // --- Botanical Species & Seasonal Tree Rendering ---
  const drawTree = (ctx, x, y, size, speciesId = 'oak', age = 1, activeAnim = null, time = 0) => {
    const sp = TREE_SPECIES[speciesId] || TREE_SPECIES.oak;
    const stage = getTreeStage(age);

    const cx = x + size / 2;
    const bottom = y + size * 0.9;

    // Growth scale based on age (always clearly reveals species silhouette from planting)
    const growthScale = stage === 'seedling' ? 0.72 : stage === 'young' ? 0.9 : stage === 'mature' ? 1.08 : 1.25;

    ctx.save();

    // Spawn pop-in bounce animation
    if (activeAnim && comparisonMode !== 'before') {
      const progress = Math.min(1, (time - activeAnim.startTime) / activeAnim.duration);
      const scale = Math.max(0, easeOutBack(progress));
      ctx.translate(cx, bottom);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -bottom);
    }

    // Seasonal Color Adjustments
    let mainColor = sp.color;
    let altColor = sp.altColor;
    let accentColor = sp.accentColor;

    if (season === 'autumn') {
      if (sp.id === 'oak') {
        mainColor = '#d35400';
        altColor = '#b9770e';
        accentColor = '#e67e22';
      } else if (sp.id === 'maple') {
        mainColor = '#c0392b';
        altColor = '#922b21';
        accentColor = '#e74c3c';
      } else if (sp.id === 'cherry') {
        mainColor = '#e67e22';
        altColor = '#d35400';
        accentColor = '#f39c12';
      }
    } else if (season === 'spring') {
      if (sp.id === 'cherry') {
        mainColor = '#f8bbd0';
        altColor = '#f48fb1';
        accentColor = '#ffffff';
      } else if (sp.id === 'oak' || sp.id === 'maple') {
        mainColor = '#66bb6a';
        altColor = '#43a047';
        accentColor = '#a5d6a7';
      }
    }

    // ----------------------------------------------------
    // SPECIES 1: 🌲 EVERGREEN PINE (Conical Tiered Geometry)
    // ----------------------------------------------------
    if (sp.id === 'pine') {
      const trunkW = size * 0.08 * growthScale;
      const trunkH = size * 0.35 * growthScale;
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(cx - trunkW / 2, bottom - trunkH, trunkW, trunkH);

      const topY = bottom - size * (0.85 * growthScale);
      const tierH = (bottom - trunkH * 0.7 - topY) / 3;

      // 3 overlapping triangular needle skirts
      // Tier 1 (Bottom skirt - widest)
      const t1Y = bottom - trunkH * 0.6;
      const t1W = size * 0.42 * growthScale;
      ctx.fillStyle = altColor;
      ctx.beginPath();
      ctx.moveTo(cx - t1W, t1Y);
      ctx.lineTo(cx + t1W, t1Y);
      ctx.lineTo(cx, t1Y - tierH * 1.3);
      ctx.closePath();
      ctx.fill();

      // Tier 2 (Middle skirt)
      const t2Y = t1Y - tierH * 0.85;
      const t2W = size * 0.32 * growthScale;
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.moveTo(cx - t2W, t2Y);
      ctx.lineTo(cx + t2W, t2Y);
      ctx.lineTo(cx, t2Y - tierH * 1.3);
      ctx.closePath();
      ctx.fill();

      // Tier 3 (Top crown apex)
      const t3Y = t2Y - tierH * 0.85;
      const t3W = size * 0.22 * growthScale;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(cx - t3W, t3Y);
      ctx.lineTo(cx + t3W, t3Y);
      ctx.lineTo(cx, topY);
      ctx.closePath();
      ctx.fill();

      // Pinecone accents
      if (stage !== 'seedling') {
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(cx - t1W * 0.4, t1Y - 2, 2.5, 3.5);
        ctx.fillRect(cx + t1W * 0.5, t1Y - 3, 2.5, 3.5);
      }

      // Winter Snow Caps on each triangular tier!
      if (season === 'winter') {
        ctx.fillStyle = COLORS.snow;
        // Top tier snow
        ctx.beginPath();
        ctx.moveTo(cx, topY);
        ctx.lineTo(cx - t3W * 0.6, t3Y - tierH * 0.4);
        ctx.lineTo(cx + t3W * 0.6, t3Y - tierH * 0.4);
        ctx.closePath();
        ctx.fill();

        // Middle tier snow edge
        ctx.beginPath();
        ctx.moveTo(cx - t2W, t2Y);
        ctx.lineTo(cx + t2W, t2Y);
        ctx.lineTo(cx + t2W * 0.7, t2Y - 3);
        ctx.lineTo(cx - t2W * 0.7, t2Y - 3);
        ctx.closePath();
        ctx.fill();

        // Bottom tier snow edge
        ctx.beginPath();
        ctx.moveTo(cx - t1W, t1Y);
        ctx.lineTo(cx + t1W, t1Y);
        ctx.lineTo(cx + t1W * 0.7, t1Y - 3);
        ctx.lineTo(cx - t1W * 0.7, t1Y - 3);
        ctx.closePath();
        ctx.fill();
      }

    // ----------------------------------------------------
    // SPECIES 2: 🌸 CHERRY BLOSSOM (Umbrella Weeping Blossom Arch)
    // ----------------------------------------------------
    } else if (sp.id === 'cherry') {
      const trunkH = size * 0.42 * growthScale;
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = Math.max(2, size * 0.08 * growthScale);
      
      // Curved bifurcated trunk
      ctx.beginPath();
      ctx.moveTo(cx, bottom);
      ctx.quadraticCurveTo(cx - 3, bottom - trunkH * 0.6, cx - size * 0.1, bottom - trunkH);
      ctx.moveTo(cx - 2, bottom - trunkH * 0.6);
      ctx.quadraticCurveTo(cx + 2, bottom - trunkH * 0.8, cx + size * 0.12, bottom - trunkH * 1.05);
      ctx.stroke();

      if (season === 'winter') {
        // Delicate bare weeping twigs with frost
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.1, bottom - trunkH);
        ctx.lineTo(cx - size * 0.25, bottom - trunkH - size * 0.1);
        ctx.moveTo(cx + size * 0.12, bottom - trunkH * 1.05);
        ctx.lineTo(cx + size * 0.28, bottom - trunkH - size * 0.12);
        ctx.stroke();

        ctx.fillStyle = COLORS.snow;
        ctx.fillRect(cx - size * 0.12, bottom - trunkH - 2, 4, 2);
        ctx.fillRect(cx + size * 0.1, bottom - trunkH * 1.05 - 2, 4, 2);
      } else {
        // Weeping umbrella canopy of delicate blossom clouds
        const canopyY = bottom - trunkH - size * 0.12 * growthScale;
        const radX = size * 0.38 * growthScale;
        const radY = size * 0.28 * growthScale;

        // Shadow base
        ctx.fillStyle = altColor;
        ctx.beginPath();
        ctx.ellipse(cx, canopyY + size * 0.05, radX * 0.95, radY * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main soft blossom dome
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.ellipse(cx, canopyY, radX, radY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fluffy blossom side lobes
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(cx - radX * 0.5, canopyY + radY * 0.2, radX * 0.45, 0, Math.PI * 2);
        ctx.arc(cx + radX * 0.5, canopyY + radY * 0.2, radX * 0.45, 0, Math.PI * 2);
        ctx.arc(cx, canopyY - radY * 0.35, radX * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Individual white/petal specks
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - radX * 0.3, canopyY - radY * 0.2, 1.8, 0, Math.PI * 2);
        ctx.arc(cx + radX * 0.25, canopyY + radY * 0.1, 1.6, 0, Math.PI * 2);
        ctx.arc(cx + radX * 0.1, canopyY - radY * 0.35, 1.5, 0, Math.PI * 2);
        ctx.arc(cx - radX * 0.45, canopyY + radY * 0.25, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

    // ----------------------------------------------------
    // SPECIES 3: 🍁 AUTUMN MAPLE (5-Lobed Pointed Crown Silhouette)
    // ----------------------------------------------------
    } else if (sp.id === 'maple') {
      const trunkW = size * 0.1 * growthScale;
      const trunkH = size * 0.46 * growthScale;
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(cx - trunkW / 2, bottom - trunkH, trunkW, trunkH);

      if (season === 'winter') {
        // Stately upright bare branches
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = Math.max(1.8, size * 0.05);
        ctx.beginPath();
        ctx.moveTo(cx, bottom - trunkH);
        ctx.lineTo(cx - size * 0.18, bottom - trunkH - size * 0.26);
        ctx.moveTo(cx, bottom - trunkH);
        ctx.lineTo(cx + size * 0.18, bottom - trunkH - size * 0.28);
        ctx.moveTo(cx, bottom - trunkH);
        ctx.lineTo(cx, bottom - trunkH - size * 0.34);
        ctx.stroke();

        ctx.strokeStyle = COLORS.snow;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.08, bottom - trunkH - size * 0.12);
        ctx.lineTo(cx - size * 0.18, bottom - trunkH - size * 0.27);
        ctx.moveTo(cx + size * 0.08, bottom - trunkH - size * 0.14);
        ctx.lineTo(cx + size * 0.18, bottom - trunkH - size * 0.29);
        ctx.stroke();
      } else {
        // Distinct 5-pointed maple crown structure
        const crownY = bottom - trunkH - size * 0.18 * growthScale;
        const crownR = size * 0.34 * growthScale;

        // Base canopy fill
        ctx.fillStyle = altColor;
        ctx.beginPath();
        ctx.arc(cx, crownY, crownR * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // 5 distinct pointed star lobes (Top, Left, Right, Top-Left, Top-Right)
        ctx.fillStyle = mainColor;
        // Central Top Peak
        ctx.beginPath();
        ctx.arc(cx, crownY - crownR * 0.55, crownR * 0.45, 0, Math.PI * 2);
        // Left Lateral Wing
        ctx.arc(cx - crownR * 0.65, crownY + crownR * 0.05, crownR * 0.42, 0, Math.PI * 2);
        // Right Lateral Wing
        ctx.arc(cx + crownR * 0.65, crownY + crownR * 0.05, crownR * 0.42, 0, Math.PI * 2);
        // Upper Left Lobe
        ctx.arc(cx - crownR * 0.42, crownY - crownR * 0.4, crownR * 0.4, 0, Math.PI * 2);
        // Upper Right Lobe
        ctx.arc(cx + crownR * 0.42, crownY - crownR * 0.4, crownR * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Bright highlight center
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(cx, crownY - crownR * 0.15, crownR * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }

    // ----------------------------------------------------
    // SPECIES 4: 🌳 GREAT OAK (Wide Sprawling Majestic Cloud Canopy)
    // ----------------------------------------------------
    } else {
      // Oak: Massive broadleaf canopy with thick flared trunk
      const trunkW = size * 0.14 * growthScale;
      const trunkH = size * 0.44 * growthScale;

      // Root flare
      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.moveTo(cx - trunkW * 0.9, bottom);
      ctx.lineTo(cx - trunkW * 0.5, bottom - trunkH);
      ctx.lineTo(cx + trunkW * 0.5, bottom - trunkH);
      ctx.lineTo(cx + trunkW * 0.9, bottom);
      ctx.closePath();
      ctx.fill();

      if (season === 'winter') {
        // Gnarled wide spreading branches with heavy snow
        ctx.strokeStyle = '#4e342e';
        ctx.lineWidth = Math.max(2, size * 0.06);
        ctx.beginPath();
        ctx.moveTo(cx, bottom - trunkH);
        ctx.lineTo(cx - size * 0.28, bottom - trunkH - size * 0.18);
        ctx.moveTo(cx, bottom - trunkH);
        ctx.lineTo(cx + size * 0.28, bottom - trunkH - size * 0.18);
        ctx.moveTo(cx, bottom - trunkH);
        ctx.lineTo(cx - size * 0.1, bottom - trunkH - size * 0.32);
        ctx.moveTo(cx, bottom - trunkH);
        ctx.lineTo(cx + size * 0.1, bottom - trunkH - size * 0.32);
        ctx.stroke();

        ctx.strokeStyle = COLORS.snow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.05, bottom - trunkH - size * 0.08);
        ctx.lineTo(cx - size * 0.28, bottom - trunkH - size * 0.19);
        ctx.moveTo(cx + size * 0.05, bottom - trunkH - size * 0.08);
        ctx.lineTo(cx + size * 0.28, bottom - trunkH - size * 0.19);
        ctx.stroke();
      } else {
        const crownY = bottom - trunkH - size * 0.12 * growthScale;
        const crownR = size * 0.42 * growthScale;

        // Dark rich backdrop foliage
        ctx.fillStyle = altColor;
        ctx.beginPath();
        ctx.arc(cx, crownY, crownR * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // 6 broad sprawling cloud lobes (massive shade footprint)
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(cx - crownR * 0.55, crownY + crownR * 0.15, crownR * 0.5, 0, Math.PI * 2);
        ctx.arc(cx + crownR * 0.55, crownY + crownR * 0.15, crownR * 0.5, 0, Math.PI * 2);
        ctx.arc(cx - crownR * 0.38, crownY - crownR * 0.45, crownR * 0.48, 0, Math.PI * 2);
        ctx.arc(cx + crownR * 0.38, crownY - crownR * 0.45, crownR * 0.48, 0, Math.PI * 2);
        ctx.arc(cx, crownY - crownR * 0.55, crownR * 0.52, 0, Math.PI * 2);
        ctx.fill();

        // Sunlight dome highlight
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(cx - crownR * 0.15, crownY - crownR * 0.25, crownR * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  // --- River Life: Ducks & Barge ---
  const drawRiverLife = (ctx, tileSize, time) => {
    // 1. Cargo River Barge 🚢
    const barge = bargeRef.current;
    barge.y += barge.speed;
    if (barge.y > ROWS + 2) barge.y = -4;

    const bx = barge.col * tileSize;
    const by = barge.y * tileSize;
    const bw = tileSize * 0.7;
    const bh = tileSize * 1.6;

    ctx.save();
    // Barge shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(bx + 2, by + 4, bw, bh);

    // Vessel hull
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, [10, 10, 4, 4]);
    ctx.fill();

    // Cargo containers
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(bx + bw * 0.15, by + bh * 0.15, bw * 0.7, bh * 0.35);
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(bx + bw * 0.15, by + bh * 0.55, bw * 0.7, bh * 0.3);

    // Pilot cabin
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(bx + bw * 0.2, by + bh * 0.05, bw * 0.6, bh * 0.08);

    // Water wake ripple behind barge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx, by + bh);
    ctx.lineTo(bx - 6, by + bh + 12);
    ctx.moveTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw + 6, by + bh + 12);
    ctx.stroke();

    // 2. River Ducks 🦆
    ducksRef.current.forEach(duck => {
      duck.x += duck.vx;
      duck.y += duck.vy;

      if (duck.x < 14.1 || duck.x > 15.9) duck.vx *= -1;
      if (duck.y < 1.0 || duck.y > ROWS - 1) duck.vy *= -1;

      const dx = duck.x * tileSize;
      const dy = duck.y * tileSize;
      const bob = Math.sin(time * 0.005 + duck.phase) * 1.5;

      // Duck body (Mallard green/brown)
      ctx.fillStyle = '#2e4053';
      ctx.beginPath();
      ctx.ellipse(dx, dy + bob, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Green head
      ctx.fillStyle = '#1e8449';
      ctx.beginPath();
      ctx.arc(dx + (duck.vx > 0 ? 3 : -3), dy - 2 + bob, 2, 0, Math.PI * 2);
      ctx.fill();

      // Yellow bill
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(duck.vx > 0 ? dx + 4.5 : dx - 5.5, dy - 2 + bob, 1.5, 1);
    });

    ctx.restore();
  };

  const drawCars = (ctx, tileSize, signals) => {
    const vCols = [4, 9, 18];
    const hRows = [3, 8, 13];

    carsRef.current.forEach(car => {
      let mustStop = false;

      if (car.type === 'h') {
        if (signals.h === 'red' || signals.h === 'yellow') {
          vCols.forEach(vCol => {
            if (car.dir === 'right') {
              const dist = vCol - car.col;
              if (dist > 0.15 && dist < 1.1) mustStop = true;
            } else if (car.dir === 'left') {
              const dist = car.col - vCol;
              if (dist > 0.15 && dist < 1.1) mustStop = true;
            }
          });
        }
      }

      if (car.type === 'v') {
        if (signals.v === 'red' || signals.v === 'yellow') {
          hRows.forEach(hRow => {
            if (car.dir === 'down') {
              const dist = hRow - car.row;
              if (dist > 0.15 && dist < 1.1) mustStop = true;
            } else if (car.dir === 'up') {
              const dist = car.row - hRow;
              if (dist > 0.15 && dist < 1.1) mustStop = true;
            }
          });
        }
      }

      if (mustStop) {
        car.currentSpeed = Math.max(0, car.currentSpeed - 0.005);
      } else {
        car.currentSpeed = Math.min(car.targetSpeed, car.currentSpeed + 0.003);
      }

      if (car.dir === 'right') {
        car.col += car.currentSpeed;
        if (car.col >= COLS) car.col = -1;
      } else if (car.dir === 'left') {
        car.col -= car.currentSpeed;
        if (car.col < -1) car.col = COLS;
      } else if (car.dir === 'down') {
        car.row += car.currentSpeed;
        if (car.row >= ROWS) car.row = -1;
      } else if (car.dir === 'up') {
        car.row -= car.currentSpeed;
        if (car.row < -1) car.row = ROWS;
      }

      const cx = car.col * tileSize;
      const cy = car.row * tileSize;

      ctx.save();
      if (car.type === 'h') {
        const cw = tileSize * 0.55;
        const ch = tileSize * 0.28;
        const offsetY = car.dir === 'right' ? tileSize * 0.55 : tileSize * 0.18;
        const carY = cy + offsetY;

        if (timeOfDay === 'night' && !isHeatmapActive) {
          const hx = car.dir === 'right' ? cx + cw : cx;
          const beamLen = tileSize * 1.4;
          const beamW = ch * 1.5;

          const beamGrad = ctx.createLinearGradient(
            hx, carY + ch / 2, 
            car.dir === 'right' ? hx + beamLen : hx - beamLen, carY + ch / 2
          );
          beamGrad.addColorStop(0, 'rgba(255, 255, 220, 0.6)');
          beamGrad.addColorStop(1, 'rgba(255, 255, 220, 0)');

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(hx, carY + 2);
          ctx.lineTo(car.dir === 'right' ? hx + beamLen : hx - beamLen, carY - beamW / 2);
          ctx.lineTo(car.dir === 'right' ? hx + beamLen : hx - beamLen, carY + ch + beamW / 2);
          ctx.lineTo(hx, carY + ch - 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(cx, carY + ch - 1, cw, 2);

        ctx.fillStyle = car.color;
        ctx.fillRect(cx, carY, cw, ch);

        ctx.fillStyle = '#81d4fa';
        ctx.fillRect(car.dir === 'right' ? cx + cw * 0.55 : cx + cw * 0.2, carY + 2, cw * 0.25, ch - 4);

        if (car.currentSpeed === 0) {
          ctx.fillStyle = '#ff1744';
          const bx = car.dir === 'right' ? cx : cx + cw - 2;
          ctx.fillRect(bx, carY + 2, 2, ch - 4);
        }

        ctx.fillStyle = '#fff9c4';
        const hx = car.dir === 'right' ? cx + cw - 1 : cx - 1;
        ctx.fillRect(hx, carY + 2, 2, 3);
        ctx.fillRect(hx, carY + ch - 5, 2, 3);
      } else {
        const cw = tileSize * 0.28;
        const ch = tileSize * 0.55;
        const offsetX = car.dir === 'down' ? tileSize * 0.55 : tileSize * 0.18;
        const carX = cx + offsetX;

        if (timeOfDay === 'night' && !isHeatmapActive) {
          const hy = car.dir === 'down' ? cy + ch : cy;
          const beamLen = tileSize * 1.4;
          const beamW = cw * 1.5;

          const beamGrad = ctx.createLinearGradient(
            carX + cw / 2, hy,
            carX + cw / 2, car.dir === 'down' ? hy + beamLen : hy - beamLen
          );
          beamGrad.addColorStop(0, 'rgba(255, 255, 220, 0.6)');
          beamGrad.addColorStop(1, 'rgba(255, 255, 220, 0)');

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(carX + 2, hy);
          ctx.lineTo(carX - beamW / 2, car.dir === 'down' ? hy + beamLen : hy - beamLen);
          ctx.lineTo(carX + cw + beamW / 2, car.dir === 'down' ? hy + beamLen : hy - beamLen);
          ctx.lineTo(carX + cw - 2, hy);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(carX, cy + ch - 1, cw, 2);

        ctx.fillStyle = car.color;
        ctx.fillRect(carX, cy, cw, ch);

        ctx.fillStyle = '#81d4fa';
        ctx.fillRect(carX + 2, car.dir === 'down' ? cy + ch * 0.55 : cy + ch * 0.2, cw - 4, ch * 0.25);

        if (car.currentSpeed === 0) {
          ctx.fillStyle = '#ff1744';
          const by = car.dir === 'down' ? cy : cy + ch - 2;
          ctx.fillRect(carX + 2, by, cw - 4, 2);
        }

        ctx.fillStyle = '#fff9c4';
        const hy = car.dir === 'down' ? cy + ch - 1 : cy - 1;
        ctx.fillRect(carX + 2, hy, 3, 2);
        ctx.fillRect(carX + cw - 5, hy, 3, 2);
      }
      ctx.restore();
    });
  };

  const drawHumansAndDogs = (ctx, tileSize, time, signals) => {
    humansRef.current.forEach(human => {
      const nearHRoad = [3, 8, 13].some(r => Math.abs(human.y - r) < 0.6);
      if (nearHRoad && signals.pedH === 'stop') {
        human.isWaiting = true;
      } else {
        human.isWaiting = false;
        human.x += human.vx;
        human.y += human.vy;
      }

      if (human.x < 0.5 || human.x > COLS - 1) human.vx *= -1;
      if (human.y < 0.5 || human.y > ROWS - 1) human.vy *= -1;

      const px = human.x * tileSize;
      const py = human.y * tileSize;
      const step = human.isWaiting ? 0 : Math.sin(time * 0.012) * 2;

      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(px, py + tileSize * 0.2, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = human.shirt;
      ctx.fillRect(px - 2.5, py - 4, 5, 6);

      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(px, py - 7, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#37474f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px - 1.5, py + 2);
      ctx.lineTo(px - 1.5 + step, py + 6);
      ctx.moveTo(px + 1.5, py + 2);
      ctx.lineTo(px + 1.5 - step, py + 6);
      ctx.stroke();

      if (human.hasDog) {
        const dx = px + (human.dogOffset * tileSize);
        const dy = py + 3;
        const tailWag = Math.sin(time * 0.02) * 2.5;

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(dx, dy + 3, 3, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#c68a4c';
        ctx.fillRect(dx - 3, dy - 2, 6, 3.5);

        ctx.beginPath();
        ctx.arc(dx + 3.5, dy - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#a4682c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dx - 3, dy - 1);
        ctx.lineTo(dx - 5, dy - 4 + tailWag);
        ctx.stroke();

        ctx.strokeStyle = '#8d5622';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dx - 2, dy + 1.5);
        ctx.lineTo(dx - 2, dy + 3.5);
        ctx.moveTo(dx + 2, dy + 1.5);
        ctx.lineTo(dx + 2, dy + 3.5);
        ctx.stroke();
      }
      ctx.restore();
    });
  };

  const drawCows = (ctx, tileSize, time) => {
    cowsRef.current.forEach(cow => {
      const cx = cow.x * tileSize;
      const cy = cow.y * tileSize;

      const chew = Math.sin(time * 0.006 + cow.chewingPhase) * 1.2;
      const tail = Math.sin(time * 0.008 + cow.tailPhase) * 2;

      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 7, cy - 4, 14, 8);

      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy + 1, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 4);
      ctx.lineTo(cx - 5, cy + 7);
      ctx.moveTo(cx - 2, cy + 4);
      ctx.lineTo(cx - 2, cy + 7);
      ctx.moveTo(cx + 2, cy + 4);
      ctx.lineTo(cx + 2, cy + 7);
      ctx.moveTo(cx + 5, cy + 4);
      ctx.lineTo(cx + 5, cy + 7);
      ctx.stroke();

      const hx = cow.dir === 1 ? cx + 7 : cx - 7;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx, cy - 2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(hx, cy - 3, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8bbd0';
      const mx = cow.dir === 1 ? hx + 3 : hx - 3;
      ctx.fillRect(mx - 1.5, cy - 2 + chew, 3, 3);

      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 1;
      const tx = cow.dir === 1 ? cx - 7 : cx + 7;
      ctx.beginPath();
      ctx.moveTo(tx, cy - 1);
      ctx.lineTo(tx - (cow.dir * 4), cy + 2 + tail);
      ctx.stroke();
      ctx.restore();
    });
  };

  const drawWeatherParticles = (ctx, canvasWidth, canvasHeight, tileSize) => {
    if (isHeatmapActive) return;

    // Winter: Falling Snowflakes ❄️ (even when sunny, gentle winter flurries)
    if (season === 'winter') {
      rainDropsRef.current.forEach(drop => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        drop.y += drop.speed * 0.4;
        drop.x += drop.drift;

        if (drop.y > canvasHeight + 10) {
          drop.y = -10;
          drop.x = Math.random() * canvasWidth;
        }
      });
      return;
    }

    if (weather !== 'rainy') return;

    const activeRipples = [];
    ripplesRef.current.forEach(rip => {
      rip.radius += 0.35;
      rip.alpha -= 0.02;
      if (rip.alpha > 0) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
        activeRipples.push(rip);
      }
    });
    ripplesRef.current = activeRipples;

    const activeSplashes = [];
    splashesRef.current.forEach(spl => {
      spl.life++;
      const alpha = Math.max(0, 1 - spl.life / 15);
      if (alpha > 0) {
        ctx.fillStyle = `rgba(200, 230, 255, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(spl.x, spl.y, spl.size * (spl.life / 4), 0, Math.PI * 2);
        ctx.fill();
        activeSplashes.push(spl);
      }
    });
    splashesRef.current = activeSplashes;

    rainDropsRef.current.forEach(drop => {
      ctx.strokeStyle = `rgba(180, 220, 255, ${drop.opacity})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 2, drop.y + drop.length);
      ctx.stroke();

      drop.y += drop.speed;
      drop.x -= 0.6;

      const col = Math.floor(drop.x / tileSize);
      const row = Math.floor(drop.y / tileSize);

      if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        const tile = grid[row]?.[col];

        if (tile === TILE_WATER) {
          if (Math.random() < 0.05) {
            ripplesRef.current.push({ x: drop.x, y: drop.y, radius: 1, alpha: 0.6 });
            drop.y = -drop.length;
            drop.x = Math.random() * canvasWidth;
          }
        } else if (tile === TILE_TREE || tile === TILE_HOUSE || tile === TILE_MEDIUM || tile === TILE_LARGE || tile === TILE_CHURCH || tile === TILE_FARM) {
          if (Math.random() < 0.04) {
            splashesRef.current.push({ x: drop.x, y: drop.y, size: 1.5, life: 0 });
            drop.y = -drop.length;
            drop.x = Math.random() * canvasWidth;
          }
        }
      }

      if (drop.y > canvasHeight + drop.length) {
        drop.y = -drop.length;
        drop.x = Math.random() * canvasWidth;
      }
      if (drop.x < -10) {
        drop.x = canvasWidth + 10;
      }
    });
  };

  const drawLighting = (ctx, width, height, time, tileSize) => {
    if (isHeatmapActive) return;

    if (timeOfDay === 'night') {
      ctx.save();
      ctx.fillStyle = 'rgba(8, 18, 38, 0.68)';
      ctx.fillRect(0, 0, width, height);

      INTERSECTIONS.forEach(inter => {
        const ix = inter.col * tileSize + tileSize / 2;
        const iy = inter.row * tileSize + tileSize / 2;
        const lightGrad = ctx.createRadialGradient(ix, iy, 4, ix, iy, tileSize * 1.5);
        lightGrad.addColorStop(0, 'rgba(255, 235, 120, 0.45)');
        lightGrad.addColorStop(0.5, 'rgba(255, 215, 60, 0.18)');
        lightGrad.addColorStop(1, 'rgba(255, 215, 60, 0)');

        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(ix, iy, tileSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    } else if (weather === 'sunny') {
      ctx.save();
      const sunGlow = ctx.createRadialGradient(width * 0.85, 0, 10, width * 0.85, 0, width * 0.9);
      sunGlow.addColorStop(0, 'rgba(255, 245, 200, 0.28)');
      sunGlow.addColorStop(0.5, 'rgba(255, 225, 140, 0.12)');
      sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, width, height);

      const rayPulse = Math.sin(time * 0.001) * 0.03;
      ctx.fillStyle = `rgba(255, 250, 210, ${0.05 + rayPulse})`;
      ctx.beginPath();
      ctx.moveTo(width * 0.85, 0);
      ctx.lineTo(width * 0.2, height);
      ctx.lineTo(width * 0.45, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  const drawThermalHeatmap = (ctx, effectiveGrid, tileSize) => {
    ctx.save();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * tileSize;
        const y = r * tileSize;
        const tile = effectiveGrid[r][c];

        let heatColor = 'rgba(241, 196, 15, 0.35)';

        if (tile === TILE_LARGE) {
          heatColor = 'rgba(231, 76, 60, 0.72)';
        } else if (tile === TILE_MEDIUM) {
          heatColor = 'rgba(230, 126, 34, 0.65)';
        } else if (tile === TILE_HOUSE) {
          heatColor = 'rgba(243, 156, 18, 0.52)';
        } else if (tile === TILE_ROAD || tile === TILE_BRIDGE) {
          heatColor = 'rgba(211, 84, 0, 0.65)';
        } else if (tile === TILE_WATER) {
          heatColor = 'rgba(41, 128, 185, 0.65)';
        } else if (tile === TILE_TREE) {
          heatColor = 'rgba(26, 188, 156, 0.68)';
        }

        ctx.fillStyle = heatColor;
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = effectiveGrid[r][c];
        if (tile === TILE_TREE || tile === TILE_WATER) {
          const cx = c * tileSize + tileSize / 2;
          const cy = r * tileSize + tileSize / 2;
          const haloRadius = tile === TILE_WATER ? tileSize * 1.6 : tileSize * 2.2;

          const coolHalo = ctx.createRadialGradient(cx, cy, 4, cx, cy, haloRadius);
          coolHalo.addColorStop(0, 'rgba(0, 230, 180, 0.55)');
          coolHalo.addColorStop(0.5, 'rgba(46, 204, 113, 0.25)');
          coolHalo.addColorStop(1, 'rgba(46, 204, 113, 0)');

          ctx.fillStyle = coolHalo;
          ctx.beginPath();
          ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  };

  // Draw floating click text effects (e.g. 🔔, 🐄, 🚗)
  const drawClickEffects = (ctx) => {
    const activeEffects = [];
    clickEffectsRef.current.forEach(eff => {
      eff.y -= 0.8;
      eff.life++;
      const alpha = Math.max(0, 1 - eff.life / 40);

      if (alpha > 0) {
        ctx.save();
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(eff.text, eff.x, eff.y);
        ctx.restore();
        activeEffects.push(eff);
      }
    });
    clickEffectsRef.current = activeEffects;
  };

  const drawSmogParticles = (ctx, width, height, tileSize) => {
    const density = aqi?.smogDensity || (activeEvent?.id === 'smog' ? 60 : 0);
    if (density <= 0) return;

    while (smogParticlesRef.current.length < density) {
      smogParticlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.8),
        radius: tileSize * (1.0 + Math.random() * 1.6),
        vx: 0.15 + Math.random() * 0.2,
        vy: (Math.random() - 0.5) * 0.08,
        alpha: 0.06 + Math.random() * 0.1,
      });
    }
    if (smogParticlesRef.current.length > density) {
      smogParticlesRef.current.length = density;
    }

    ctx.save();
    smogParticlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > width + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) p.y = height + p.radius;
      if (p.y > height + p.radius) p.y = -p.radius;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, `rgba(130, 120, 105, ${p.alpha * 1.5})`);
      grad.addColorStop(0.6, `rgba(150, 140, 120, ${p.alpha * 0.7})`);
      grad.addColorStop(1, 'rgba(150, 140, 120, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  // --- Main Animation Loop ---
  const renderLoop = useCallback((currentTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tileSize = getEffectiveTileSize();

    const expectedWidth = tileSize * COLS;
    const expectedHeight = tileSize * ROWS;

    if (canvas.width !== expectedWidth || canvas.height !== expectedHeight) {
      canvas.width = expectedWidth;
      canvas.height = expectedHeight;
    }

    waterTimeRef.current = currentTime;
    const signals = getTrafficSignalState(currentTime);

    plantAnimsRef.current = plantAnimsRef.current.filter(anim => currentTime - anim.startTime < anim.duration);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const effectiveGrid = grid.map(row => 
      row.map(cell => (comparisonMode === 'before' && cell === TILE_TREE ? TILE_EMPTY : cell))
    );

    // 1. Draw Map Tiles
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * tileSize;
        const y = row * tileSize;
        const tile = effectiveGrid[row][col];

        if (tile === TILE_WATER) {
          drawWater(ctx, x, y, tileSize, row, col, currentTime);
        } else if (tile === TILE_BRIDGE) {
          drawBridge(ctx, x, y, tileSize, effectiveGrid, row, col);
        } else if (tile === TILE_CHURCH) {
          drawGrass(ctx, x, y, tileSize, row, col);
          drawChurch(ctx, x, y, tileSize);
        } else if (tile === TILE_FARM) {
          drawFarm(ctx, x, y, tileSize);
        } else {
          drawGrass(ctx, x, y, tileSize, row, col);

          if (tile === TILE_ROAD) {
            drawRoad(ctx, x, y, tileSize, effectiveGrid, row, col);
            const isInter = INTERSECTIONS.some(i => i.row === row && i.col === col);
            if (isInter) {
              drawCrosswalk(ctx, x, y, tileSize);
              drawTrafficLight(ctx, x, y, tileSize, signals);
            }
          } else if (tile === TILE_HOUSE || tile === TILE_MEDIUM || tile === TILE_LARGE) {
            drawBuilding(ctx, x, y, tileSize, tile);
          } else if (tile === TILE_TREE) {
            const activeAnim = plantAnimsRef.current.find(a => a.row === row && a.col === col);
            const meta = treeMetadata[`${row}_${col}`];
            const speciesId = meta?.species || 'oak';
            const plantedYear = meta?.plantedYear || 1;
            const treeAge = Math.max(1, year - plantedYear + 1);

            drawTree(ctx, x, y, tileSize, speciesId, treeAge, activeAnim, currentTime);
          }
        }

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // 2. River Life: Ducks & Cargo Barge
    drawRiverLife(ctx, tileSize, currentTime);

    // 3. Livestock Pasture
    drawCows(ctx, tileSize, currentTime);

    // 4. Cars
    drawCars(ctx, tileSize, signals);

    // 5. Pedestrians
    drawHumansAndDogs(ctx, tileSize, currentTime, signals);

    // 6. Thermal Heatmap Shader
    if (isHeatmapActive) {
      drawThermalHeatmap(ctx, effectiveGrid, tileSize);
    }

    // 7. Hover Highlight
    if (hoverTile) {
      const hx = hoverTile.col * tileSize;
      const hy = hoverTile.row * tileSize;
      const tileType = effectiveGrid[hoverTile.row]?.[hoverTile.col];

      ctx.lineWidth = 2;
      if (tileType === TILE_EMPTY) {
        ctx.strokeStyle = '#81c784';
        ctx.fillStyle = 'rgba(129, 199, 132, 0.25)';
        ctx.fillRect(hx, hy, tileSize, tileSize);
        ctx.strokeRect(hx + 1, hy + 1, tileSize - 2, tileSize - 2);
      } else if (tileType === TILE_TREE) {
        ctx.strokeStyle = '#ef5350';
        ctx.fillStyle = 'rgba(239, 83, 80, 0.25)';
        ctx.fillRect(hx, hy, tileSize, tileSize);
        ctx.strokeRect(hx + 1, hy + 1, tileSize - 2, tileSize - 2);
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeRect(hx + 1, hy + 1, tileSize - 2, tileSize - 2);
      }
    }

    // 8. Leaf Particles
    const survivingLeaves = [];
    leafParticlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.life++;

      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (alpha > 0) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        survivingLeaves.push(p);
      }
    });
    leafParticlesRef.current = survivingLeaves;

    // 9. Floating Click Effects
    drawClickEffects(ctx);

    // 10. Weather & Seasonal Particles
    drawWeatherParticles(ctx, canvas.width, canvas.height, tileSize);

    // 11. Smog Haze Layer (Active when AQI is elevated)
    drawSmogParticles(ctx, canvas.width, canvas.height, tileSize);

    // 12. Day/Night Lighting Overlay
    drawLighting(ctx, canvas.width, canvas.height, currentTime, tileSize);

    // 13. Climate Crisis Atmospheric Overlay Tint
    if (activeEvent?.skyTint) {
      ctx.save();
      ctx.fillStyle = activeEvent.skyTint;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    animFrameIdRef.current = requestAnimationFrame(renderLoop);
  }, [grid, year, weather, timeOfDay, season, isHeatmapActive, comparisonMode, activeEvent, aqi, getEffectiveTileSize, hoverTile, treeMetadata, currentSeason]);

  useEffect(() => {
    animFrameIdRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [renderLoop]);

  const triggerPlantPop = (row, col) => {
    const tileSize = getEffectiveTileSize();
    const cx = col * tileSize + tileSize / 2;
    const cy = row * tileSize + tileSize / 2;

    plantAnimsRef.current.push({
      row,
      col,
      startTime: performance.now(),
      duration: 450,
    });

    const sp = TREE_SPECIES[selectedSpecies] || TREE_SPECIES.oak;
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.8;
      leafParticlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: sp.leafColors[Math.floor(Math.random() * sp.leafColors.length)],
        size: 2 + Math.random() * 3,
        life: 0,
        maxLife: 32 + Math.floor(Math.random() * 20),
      });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) * (COLS / rect.width));
    const row = Math.floor((e.clientY - rect.top) * (ROWS / rect.height));

    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      const actualType = comparisonMode === 'before' && grid[row][col] === TILE_TREE ? TILE_EMPTY : grid[row][col];
      const info = { row, col, type: actualType };
      setHoverTile({ row, col });
      if (onHoverTileChange) onHoverTileChange(info);
    } else {
      setHoverTile(null);
      if (onHoverTileChange) onHoverTileChange(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverTile(null);
    if (onHoverTileChange) onHoverTileChange(null);
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) * (COLS / rect.width));
    const row = Math.floor((e.clientY - rect.top) * (ROWS / rect.height));

    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    const tileSize = getEffectiveTileSize();
    const clickX = (col + 0.5) * tileSize;
    const clickY = (row + 0.5) * tileSize;
    const tile = grid[row][col];

    // Interactive Landmark Sound Effects
    if (tile === TILE_CHURCH) {
      playChurchBellSound();
      clickEffectsRef.current.push({ x: clickX, y: clickY, text: '🔔 DING DONG' });
      return;
    }
    if (tile === TILE_FARM) {
      playCowMooSound();
      clickEffectsRef.current.push({ x: clickX, y: clickY, text: '🐄 MOOO~' });
      return;
    }
    if (tile === TILE_ROAD || tile === TILE_BRIDGE) {
      playCarHonkSound();
      clickEffectsRef.current.push({ x: clickX, y: clickY, text: '🚗 BEEP BEEP' });
      return;
    }
    if (tile === TILE_WATER) {
      playWaterSplashSound();
      ripplesRef.current.push({ x: clickX, y: clickY, radius: 2, alpha: 0.8 });
      return;
    }

    if (tile === TILE_EMPTY) {
      triggerPlantPop(row, col);
      onPlantTree(row, col, selectedSpecies);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) * (COLS / rect.width));
    const row = Math.floor((e.clientY - rect.top) * (ROWS / rect.height));

    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    if (grid[row][col] === TILE_TREE) {
      onRemoveTree(row, col);
    }
  };

  return (
    <div className="city-map-container" ref={containerRef}>
      <div className="map-view-controls">
        <button 
          onClick={() => setZoom(z => Math.min(1.8, +(z + 0.15).toFixed(2)))} 
          title="Zoom In"
        >
          🔍+
        </button>
        <span className="zoom-badge">{Math.round(zoom * 100)}%</span>
        <button 
          onClick={() => setZoom(z => Math.max(0.7, +(z - 0.15).toFixed(2)))} 
          title="Zoom Out"
        >
          🔍−
        </button>
        <button 
          onClick={() => setZoom(1.0)} 
          title="Reset Zoom"
        >
          ⟲
        </button>
      </div>

      {isHeatmapActive && (
        <div className="thermal-legend-bar">
          <span className="thermal-legend-title">🌡️ Surface Temperature:</span>
          <div className="thermal-gradient-strip">
            <span>🔵 -3°C Cool</span>
            <span>🟢 0°C</span>
            <span>🟡 +2°C</span>
            <span>🔴 +4°C Hot Asphalt</span>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="city-map-canvas"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}

export default CityMap;
