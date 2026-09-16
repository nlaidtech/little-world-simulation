import React from 'react';

function CanopyGrid({ canopyPercent }) {
  const totalCells = 100;
  const filledCells = Math.round(Math.max(0, Math.min(100, canopyPercent || 0)));

  const cells = Array.from({ length: totalCells }, (_, i) => i < filledCells);

  return (
    <div className="canopy-grid-container card">
      <h3>Canopy Cover: {filledCells}%</h3>
      <div className="canopy-grid">
        {cells.map((isFilled, idx) => (
          <div 
            key={idx} 
            className={`grid-cell ${isFilled ? 'filled' : 'empty'}`}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default CanopyGrid;
