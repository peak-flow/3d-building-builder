export type RoofStyle = 'flat' | 'pitched' | 'dome' | 'pyramid';
export type BuildingStyle = 'rectangular' | 'stepped' | 'tapered';
export type WindowStyle = 'none' | 'grid' | 'sparse';

/** Maximum value for the random seed (32-bit unsigned integer). */
export const MAX_SEED = 0xffffffff;

export interface BuildingParams {
  // Base dimensions
  width: number;       // metres (4–40)
  depth: number;       // metres (4–40)
  floors: number;      // number of floors (1–30)
  floorHeight: number; // metres per floor (2.5–5)

  // Shape
  buildingStyle: BuildingStyle;
  stepsCount: number;  // how many setback tiers (2–6, used when style=stepped/tapered)

  // Roof
  roofStyle: RoofStyle;
  roofHeight: number;  // metres (1–10)

  // Details
  windowStyle: WindowStyle;
  hasAntenna: boolean;
  antennaHeight: number; // metres (2–20)
  hasBalcony: boolean;

  // Aesthetics
  seed: number;
}

export const DEFAULT_PARAMS: BuildingParams = {
  width: 12,
  depth: 12,
  floors: 8,
  floorHeight: 3,
  buildingStyle: 'rectangular',
  stepsCount: 3,
  roofStyle: 'flat',
  roofHeight: 3,
  windowStyle: 'grid',
  hasAntenna: false,
  antennaHeight: 6,
  hasBalcony: false,
  seed: 42,
};

export function randomParams(seed?: number): BuildingParams {
  // Simple seeded pseudo-random number generator (mulberry32)
  const s = seed ?? Math.floor(Math.random() * MAX_SEED);
  let state = s >>> 0;
  function rand(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / MAX_SEED;
  }

  const buildingStyles: BuildingStyle[] = ['rectangular', 'stepped', 'tapered'];
  const roofStyles: RoofStyle[] = ['flat', 'pitched', 'dome', 'pyramid'];
  const windowStyles: WindowStyle[] = ['none', 'grid', 'sparse'];

  return {
    width: Math.round((rand() * 36 + 4) * 2) / 2,
    depth: Math.round((rand() * 36 + 4) * 2) / 2,
    floors: Math.round(rand() * 29 + 1),
    floorHeight: Math.round((rand() * 2.5 + 2.5) * 4) / 4,
    buildingStyle: buildingStyles[Math.floor(rand() * buildingStyles.length)],
    stepsCount: Math.round(rand() * 4 + 2),
    roofStyle: roofStyles[Math.floor(rand() * roofStyles.length)],
    roofHeight: Math.round((rand() * 9 + 1) * 2) / 2,
    windowStyle: windowStyles[Math.floor(rand() * windowStyles.length)],
    hasAntenna: rand() > 0.5,
    antennaHeight: Math.round((rand() * 18 + 2) * 2) / 2,
    hasBalcony: rand() > 0.6,
    seed: s,
  };
}
