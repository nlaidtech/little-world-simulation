import React from 'react';
import { TREE_SPECIES } from '../data/treeSpecies';

function TreeSpeciesBar({ selectedSpecies, onSelectSpecies, budget = 10000 }) {
  return (
    <div className="tree-species-bar">
      <span className="species-bar-label">Plant Tool:</span>
      <div className="species-buttons-group">
        {Object.values(TREE_SPECIES).map((species) => {
          const isSelected = selectedSpecies === species.id;
          const canAfford = budget >= species.cost;
          return (
            <button
              key={species.id}
              className={`species-btn ${isSelected ? 'active' : ''} ${!canAfford ? 'unaffordable' : ''}`}
              onClick={() => onSelectSpecies(species.id)}
              style={{
                borderColor: isSelected ? species.color : 'transparent',
              }}
              title={`${species.name} ($${species.cost}): ${species.description}${!canAfford ? ' — Insufficient Funds!' : ''}`}
            >
              <span className="species-icon">{species.icon}</span>
              <span className="species-name">{species.name}</span>
              <span className="species-cost-tag">${species.cost}</span>
              <span className="species-badge">{species.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TreeSpeciesBar;
