import React from 'react';

function AchievementToast({ achievement, onClose }) {
  if (!achievement) return null;

  return (
    <div className="achievement-toast">
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-content">
        <div className="achievement-tag">ACHIEVEMENT UNLOCKED!</div>
        <div className="achievement-title">{achievement.title}</div>
        <div className="achievement-desc">{achievement.description}</div>
      </div>
      <button className="achievement-close" onClick={onClose}>✕</button>
    </div>
  );
}

export default AchievementToast;
