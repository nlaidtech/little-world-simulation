import React from 'react';

function ResultCard({ title, value, unit, equivalent, iconSrc, iconEmoji, accentColor }) {
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
    : value;

  return (
    <div className="result-card card" style={{ borderTop: `4px solid ${accentColor || '#2E7D32'}` }}>
      <div className="card-header">
        {iconSrc ? (
          <img src={iconSrc} alt="" className="card-icon-img" />
        ) : (
          <span className="icon">{iconEmoji}</span>
        )}
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        <div className="value-container">
          <span className="value" style={{ color: accentColor || '#2E7D32' }}>{formattedValue}</span>
          <span className="unit">{unit}</span>
        </div>
        {equivalent && <div className="equivalent">{equivalent}</div>}
      </div>
    </div>
  );
}

export default ResultCard;
