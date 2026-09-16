import React from 'react';

function ControlPanel({ inputs, onChange }) {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === 'range' || type === 'number') {
      parsedValue = Number(value);
    }
    onChange({ ...inputs, [name]: parsedValue });
  };

  return (
    <div className="control-panel card">
      <h2>Simulation Parameters</h2>
      
      <div className="input-group">
        <label>
          Trees planted: <span>{inputs.trees_planted.toLocaleString()}</span>
        </label>
        <input 
          type="range" 
          name="trees_planted" 
          min="0" 
          max="100000" 
          step="100" 
          value={inputs.trees_planted} 
          onChange={handleChange} 
        />
      </div>

      <div className="input-group">
        <label>
          City area (km²): <span>{inputs.city_area_km2}</span>
        </label>
        <input 
          type="range" 
          name="city_area_km2" 
          min="0.5" 
          max="100" 
          step="0.5" 
          value={inputs.city_area_km2} 
          onChange={handleChange} 
        />
      </div>

      <div className="input-group">
        <label>
          Years since planting: <span>{inputs.years_since_planting}</span>
        </label>
        <input 
          type="range" 
          name="years_since_planting" 
          min="0" 
          max="30" 
          step="1" 
          value={inputs.years_since_planting} 
          onChange={handleChange} 
        />
      </div>

      <div className="input-group">
        <label>Tree type:</label>
        <select name="tree_type" value={inputs.tree_type} onChange={handleChange}>
          <option value="Broadleaf">Broadleaf</option>
          <option value="Conifer">Conifer</option>
        </select>
      </div>
    </div>
  );
}

export default ControlPanel;
