# Implementation Plan: Living City Expansion — Wide Map & Human Interactions

Expand the simulator into a living, real-life city sandbox: widening the city map, introducing real-life city zones (boulevards, parks, plaza with fountain, schoolyard, outdoor cafes), and populating it with intelligent interactive humans who react to trees, shade, weather, and each other.

---

## 1. Wider Map Layout (24 Rows × 32 Columns = 768 Tiles)

We will expand the city from `18 × 24` to a wide, expansive **`24 × 32`** grid:
- **Central Promenade & City Park**: Wide green commons with park benches, pathways, and pond.
- **Historic Downtown & Civic Plaza**: Cathedral, town hall plaza with a fountain.
- **Riverside Waterfront**: Embankment road with docks, boats, and river trail.
- **Suburban Neighborhoods & School**: Houses with gardens, playgrounds, school zone.
- **Agricultural & Farm Outskirts**: Red barn, pastures with grazing cattle and fences.
- **Expanded Road Network**: Ring road, avenues with working traffic intersections.

---

## 2. Realistic & Interactive Human Simulation

Humans will feel alive with authentic daily behaviors and direct interactions with trees:

### A. Living Human Behaviors & Archetypes
1. **Tree Shade Seekers ☀️🌳**: On hot sunny days or during heatwaves, pedestrians actively seek nearby tree tiles to stand or sit under to cool off!
2. **Park Bench Sitters 🪑**: Pedestrians walk to park benches and sit down to read or relax.
3. **Conversations / Chatting Groups 💬**: When two pedestrians cross paths, they stop to chat with speech bubbles (`"Love the fresh air!"`, `"So cool under these oaks!"`, `"Great day for a walk!"`, `"Nice dog!"`).
4. **Joggers & Walkers 🏃‍♂️🚶‍♀️**: Different speeds with animated leg strides; joggers run along tree-lined boulevards and park loops.
5. **Dog Walkers 🐕**: Dogs wag tails, sniff tree trunks, and follow owners.
6. **Rain Reactions ☔**: In rainy weather, pedestrians pop open colorful umbrellas and walk briskly towards buildings or dense tree canopies!

### B. Interactive Click Reactions 👆
- Clicking on any human triggers:
  - A friendly wave animation
  - A real-life speech bubble showing their thoughts on the city's trees and air quality!
  - Audio greeting or reaction chime.

---

## User Review Required

> [!IMPORTANT]
> Expanding to **24 × 32** tiles expands the grid size by ~77% (from 432 tiles to 768 tiles). The existing tree planting, eco-metrics, and API will seamlessly support this width with auto-scaling tile sizes and smooth panning/zooming.

---

## Proposed Changes

### 1. `frontend/src/data/cityLayout.js`
- Expand `ROWS = 24`, `COLS = 32`.
- Update `CITY_AREA_KM2 = 35` to reflect the wider metropolitan area.
- Add new tile types: `TILE_BENCH = 10`, `TILE_FOUNTAIN = 11`, `TILE_PLAYGROUND = 12`.
- Create rich, organic 24×32 map matrix with districts, waterfront, avenues, and park plazas.

### 2. `frontend/src/components/CityMap.jsx`
- Upgrade human simulation system:
  - Increase human population from 6 to 24+ diverse citizens.
  - State machine for humans: `walking`, `sitting`, `chatting`, `seeking_shade`, `waving`.
  - Umbrella rendering when raining.
  - Park benches, fountain with water ripples, and playgrounds.
  - Dynamic speech bubble renderer over citizens.
  - Shade attraction algorithm: humans calculate distance to nearest planted tree and gravitate towards shade when sunny.
  - Click-to-inspect citizen: clicking a person displays their name, mood, and current thought!

### 3. `frontend/src/App.css`
- Ensure map wrapper handles the wider 24×32 grid with responsive scrolling, smooth zoom, and speech bubble styling.

---

## Verification Plan

### Automated Verification
- Run node syntax check on `cityLayout.js` and `CityMap.jsx`.
- Verify Vite compiles cleanly without warnings.

### Manual Verification
- View map in browser at `http://localhost:5173`.
- Confirm the 24×32 grid renders with all new districts (fountain plaza, park benches, schoolyard, farm).
- Observe humans walking, stopping to talk in pairs, opening umbrellas when raining, and seeking shade under planted trees.
- Click on citizens to see speech bubbles and interactive thoughts.
