// City grid layout — 24 rows × 32 columns (768 tiles)
// 0 = empty grass (plantable)
// 1 = road
// 2 = small building (house)
// 3 = medium building (apartments/offices)
// 4 = large building (skyscraper)
// 5 = tree (planted)
// 6 = river / water
// 7 = bridge (road over water)
// 8 = church (cathedral / steeple)
// 9 = farm / barn (with livestock pasture)
// 10 = park bench (resting spot)
// 11 = water fountain plaza (interactive centerpiece)
// 12 = children playground (swings & slide)

export const TILE_EMPTY = 0;
export const TILE_ROAD = 1;
export const TILE_HOUSE = 2;
export const TILE_MEDIUM = 3;
export const TILE_LARGE = 4;
export const TILE_TREE = 5;
export const TILE_WATER = 6;
export const TILE_BRIDGE = 7;
export const TILE_CHURCH = 8;
export const TILE_FARM = 9;
export const TILE_BENCH = 10;
export const TILE_FOUNTAIN = 11;
export const TILE_PLAYGROUND = 12;

export const ROWS = 24;
export const COLS = 32;

export const TREES_PER_TILE = 500;
export const CITY_AREA_KM2 = 35;

// Key road intersections where traffic signals are installed:
export const INTERSECTIONS = [
  { row: 4, col: 6 },
  { row: 4, col: 14 },
  { row: 4, col: 24 },
  { row: 11, col: 6 },
  { row: 11, col: 14 },
  { row: 11, col: 24 },
  { row: 18, col: 6 },
  { row: 18, col: 14 },
  { row: 18, col: 24 },
];

export const INITIAL_LAYOUT = [
  // Row 0 - Northern suburbs, historic cathedral district & river start
  [0, 2, 0, 0, 0, 2, 1, 0, 0, 8, 0, 0, 0, 2, 1, 0, 0, 6, 6, 0, 0, 2, 0, 0, 1, 0, 2, 0, 0, 2, 0, 0],
  // Row 1 - Upper residential gardens
  [0, 0, 2, 0, 2, 0, 1, 0, 2, 0, 2, 0, 0, 0, 1, 0, 6, 6, 0, 0, 2, 0, 2, 0, 1, 0, 0, 2, 0, 0, 2, 0],
  // Row 2 - Quiet neighborhood streets
  [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 1, 0, 6, 6, 0, 3, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 2],
  // Row 3 - North civic park with bench
  [0, 0, 2, 0, 0, 0, 1, 0, 10, 0, 0, 0, 0, 0, 1, 6, 6, 0, 0, 0, 0, 3, 0, 0, 1, 0, 0, 2, 0, 2, 0, 0],
  // Row 4 - NORTH ARTERIAL HIGHWAY (Bridges across river cols 17-18)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // Row 5 - Midtown highrises & riverside trail
  [0, 0, 3, 0, 0, 0, 1, 0, 4, 0, 0, 4, 0, 0, 1, 0, 0, 6, 6, 0, 10, 0, 3, 0, 1, 0, 4, 0, 0, 3, 0, 0],
  // Row 6 - Commercial towers & waterfront promenade
  [0, 3, 0, 0, 4, 0, 1, 4, 0, 4, 0, 0, 4, 0, 1, 0, 6, 6, 0, 0, 0, 0, 0, 0, 1, 0, 0, 4, 0, 0, 0, 3],
  // Row 7 - School district in west (playground at col 2)
  [0, 0, 12, 0, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 1, 0, 6, 6, 0, 0, 4, 0, 4, 0, 1, 3, 0, 0, 4, 0, 0, 0],
  // Row 8 - West neighborhood & downtown core
  [2, 0, 0, 2, 0, 0, 1, 4, 0, 0, 0, 4, 0, 3, 1, 6, 6, 0, 0, 0, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 4, 0],
  // Row 9 - South midtown & riverside greenspace
  [0, 2, 0, 0, 0, 0, 1, 0, 4, 0, 4, 0, 0, 0, 1, 6, 6, 0, 0, 3, 0, 3, 0, 0, 1, 0, 0, 3, 0, 0, 0, 0],
  // Row 10 - Central Park entry promenade with benches
  [0, 0, 0, 0, 2, 0, 1, 0, 10, 0, 0, 0, 10, 0, 1, 0, 6, 6, 0, 0, 0, 0, 0, 0, 1, 0, 3, 0, 0, 3, 0, 0],
  // Row 11 - CENTRAL GRAND AVENUE (Bridges across river cols 16-17)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // Row 12 - CENTRAL PARK COMMONS (Lush green sanctuary & benches)
  [0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 6, 6, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0],
  // Row 13 - Park Lake & Promenade
  [0, 0, 0, 3, 0, 0, 1, 0, 10, 0, 0, 0, 10, 0, 1, 6, 6, 0, 0, 0, 0, 4, 0, 0, 1, 0, 4, 0, 0, 4, 0, 0],
  // Row 14 - GRAND FOUNTAIN PLAZA (Centerpiece at col 10)
  [0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 11, 0, 0, 0, 1, 6, 6, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3],
  // Row 15 - South Park gardens & benches
  [0, 0, 0, 0, 0, 0, 1, 0, 10, 0, 0, 0, 10, 0, 1, 0, 6, 6, 0, 3, 0, 0, 3, 0, 1, 0, 3, 0, 0, 3, 0, 0],
  // Row 16 - Historic second chapel & waterfront path
  [0, 2, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 6, 6, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  // Row 17 - Suburban South transition
  [0, 0, 0, 2, 0, 0, 1, 0, 2, 0, 8, 0, 2, 0, 1, 0, 0, 6, 6, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  // Row 18 - SOUTH PARKWAY HIGHWAY (Bridges across river cols 17-18)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // Row 19 - South suburbs & farm border
  [0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 6, 6, 0, 0, 0, 0, 0, 1, 0, 0, 9, 0, 0, 0, 0],
  // Row 20 - South school playground & farm barn
  [0, 0, 0, 12, 0, 0, 1, 0, 2, 0, 0, 2, 0, 0, 1, 0, 0, 6, 6, 0, 0, 0, 0, 0, 1, 0, 9, 0, 0, 9, 0, 0],
  // Row 21 - Residential gardens & livestock pasture
  [0, 2, 0, 0, 10, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 6, 6, 0, 0, 0, 0, 1, 0, 0, 0, 9, 0, 0, 0],
  // Row 22 - Grazing cows pasture
  [0, 0, 0, 2, 0, 0, 1, 0, 2, 0, 0, 2, 0, 0, 1, 0, 0, 0, 6, 6, 0, 0, 0, 0, 1, 0, 9, 0, 0, 0, 9, 0],
  // Row 23 - Southern city limits
  [0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 6, 6, 0, 0, 0, 0, 1, 0, 0, 9, 0, 9, 0, 0],
];
