// City grid layout — 18 rows × 24 columns
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

export const ROWS = 18;
export const COLS = 24;

export const TREES_PER_TILE = 500;
export const CITY_AREA_KM2 = 25;

// Key road intersections where traffic lights are installed:
export const INTERSECTIONS = [
  { row: 3, col: 4 },
  { row: 3, col: 9 },
  { row: 3, col: 18 },
  { row: 8, col: 4 },
  { row: 8, col: 9 },
  { row: 8, col: 18 },
  { row: 13, col: 4 },
  { row: 13, col: 9 },
  { row: 13, col: 18 },
];

export const INITIAL_LAYOUT = [
  // Row 0 - Northern suburbs & pastures
  [0, 0, 2, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 6, 6, 0, 0, 1, 0, 0, 2, 0, 0],
  // Row 1 - Church in historic square (col 7)
  [0, 2, 0, 0, 1, 0, 3, 8, 0, 1, 0, 2, 0, 6, 6, 0, 0, 0, 1, 0, 2, 0, 2, 0],
  // Row 2
  [0, 0, 0, 2, 1, 0, 0, 0, 0, 1, 0, 0, 6, 6, 0, 0, 3, 0, 1, 0, 0, 0, 0, 0],
  // Row 3 - North Highway (Traffic Lights at cols 4, 9, 18)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // Row 4 - Downtown Highrises
  [0, 0, 0, 0, 1, 0, 4, 0, 0, 1, 0, 6, 6, 0, 0, 0, 0, 0, 1, 0, 3, 0, 0, 0],
  // Row 5
  [0, 3, 0, 0, 1, 4, 0, 4, 0, 1, 6, 6, 0, 0, 0, 4, 0, 0, 1, 0, 0, 3, 0, 0],
  // Row 6
  [0, 0, 4, 0, 1, 0, 4, 0, 0, 1, 6, 6, 0, 0, 3, 0, 4, 0, 1, 0, 0, 0, 0, 0],
  // Row 7
  [0, 0, 0, 0, 1, 4, 0, 3, 0, 1, 0, 6, 6, 0, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0],
  // Row 8 - Central Avenue (Traffic Lights at cols 4, 9, 18)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // Row 9
  [0, 0, 3, 0, 1, 0, 0, 0, 0, 1, 0, 0, 6, 6, 0, 0, 0, 0, 1, 0, 0, 3, 0, 0],
  // Row 10 - Second church near riverbank (col 12)
  [0, 2, 0, 0, 1, 0, 3, 0, 3, 1, 0, 0, 8, 6, 6, 0, 3, 0, 1, 0, 2, 0, 0, 0],
  // Row 11
  [0, 0, 0, 2, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 6, 6, 0, 0, 1, 0, 0, 2, 0, 0],
  // Row 12
  [0, 0, 2, 0, 1, 0, 2, 0, 2, 1, 0, 0, 0, 0, 6, 6, 0, 0, 1, 0, 0, 0, 2, 0],
  // Row 13 - South Parkway (Traffic Lights at cols 4, 9, 18)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1],
  // Row 14 - Farm District Starts in Southeast (Cols 20-23)
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 6, 6, 0, 1, 0, 9, 0, 0, 0],
  // Row 15 - Red Barn and Livestock pasture
  [0, 2, 0, 0, 1, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 6, 6, 0, 1, 0, 0, 9, 0, 0],
  // Row 16 - Farm Pasture
  [0, 0, 0, 2, 1, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 6, 6, 1, 0, 9, 0, 0, 0],
  // Row 17 - South Pasture
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 6, 6, 1, 0, 0, 9, 0, 0],
];
