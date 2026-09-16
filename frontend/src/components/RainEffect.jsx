import { useRef, useEffect, useCallback } from 'react';
import { TILE_TREE, ROWS, COLS } from '../data/cityLayout';

function RainEffect({ grid, width, height }) {
  const canvasRef = useRef(null);
  const dropsRef = useRef([]);
  const animRef = useRef(null);

  const initDrops = useCallback((w, h) => {
    const drops = [];
    for (let i = 0; i < 120; i++) {
      drops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 2 + Math.random() * 3,
        length: 8 + Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.25,
      });
    }
    dropsRef.current = drops;
  }, []);

  useEffect(() => {
    if (width && height) {
      initDrops(width, height);
    }
  }, [width, height, initDrops]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const tileW = width / COLS;
    const tileH = height / ROWS;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      dropsRef.current.forEach((drop) => {
        // Draw raindrop
        ctx.strokeStyle = `rgba(150, 200, 255, ${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
        ctx.stroke();

        // Move drop
        drop.y += drop.speed;
        drop.x -= 0.5;

        // Check if drop hits a tree canopy — draw splash
        const col = Math.floor(drop.x / tileW);
        const row = Math.floor(drop.y / tileH);
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS && grid[row]?.[col] === TILE_TREE) {
          // Splash on canopy
          if (drop.y % tileH > tileH * 0.3 && drop.y % tileH < tileH * 0.6) {
            ctx.fillStyle = `rgba(150, 220, 255, ${drop.opacity + 0.1})`;
            ctx.beginPath();
            ctx.arc(drop.x, drop.y, 2, 0, Math.PI * 2);
            ctx.fill();
            // Reset drop
            drop.y = -drop.length;
            drop.x = Math.random() * width;
          }
        }

        // Reset if off screen
        if (drop.y > height + drop.length) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
        if (drop.x < -10) {
          drop.x = width + 5;
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [grid, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="rain-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        width: width || 0,
        height: height || 0,
      }}
    />
  );
}

export default RainEffect;
