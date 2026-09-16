import React from 'react';

function ClimateEventBanner({ 
  event, 
  results, 
  onResolve, 
  onDismiss 
}) {
  if (!event) return null;

  const isSuccess = event.checkSuccess(results);
  const progress = event.getProgress(results);

  return (
    <div className={`climate-event-modal-overlay ${event.ambientEffect}`}>
      <div className="climate-event-modal">
        <div className="event-modal-header">
          <div className="event-modal-title-row">
            <span className="event-modal-icon">{event.icon}</span>
            <div>
              <span className="event-modal-badge">{event.badge}</span>
              <h3>{event.name}</h3>
            </div>
          </div>
          <button className="event-modal-close" onClick={onDismiss}>✕</button>
        </div>

        <p className="event-modal-tagline">“{event.tagline}”</p>
        <p className="event-modal-desc">{event.description}</p>

        <div className="event-readiness-card">
          <div className="readiness-header">
            <span>City Canopy Defense: <strong>{event.targetMetric}</strong></span>
            <span className={`readiness-status ${isSuccess ? 'ready' : 'vulnerable'}`}>
              {isSuccess ? '🛡️ DEFENDED' : '⚠️ VULNERABLE'}
            </span>
          </div>
          <div className="readiness-bar-track">
            <div 
              className={`readiness-bar-fill ${isSuccess ? 'success' : 'warning'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="readiness-outcome-note">
            {isSuccess ? (
              <span className="outcome-text green">
                ✨ Canopy defense thresholds met! Assess damage now to claim the <strong>+${event.grant.toLocaleString()}</strong> Municipal Resilience Grant!
              </span>
            ) : (
              <span className="outcome-text orange">
                ⚠️ Defenses insufficient. Plant more trees or risk incurring <strong>-${event.damagePenalty.toLocaleString()}</strong> in emergency cleanup costs.
              </span>
            )}
          </div>
        </div>

        <div className="event-modal-actions">
          <button 
            className={`event-action-btn ${isSuccess ? 'claim-grant' : 'accept-penalty'}`}
            onClick={() => onResolve(isSuccess)}
          >
            {isSuccess ? `🎉 Secure City & Collect +$${event.grant.toLocaleString()}` : `⚡ Resolve Crisis (-$${event.damagePenalty.toLocaleString()} Damages)`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClimateEventBanner;
