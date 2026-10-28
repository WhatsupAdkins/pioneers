// The valley road (GAME-PLAN-DAYS §B Day 5 beat 5): 60×12, the long way from Verdant Valley
// east to Upper Foglands, walked once, in December, with the doctor. Fields give way to a
// fenced pasture of bison along the north side (x 22–41) with its sign, DO NOT SHOOT THE
// BISON; then rocks and frost, and the mist thickens toward the Foglands. Triggers across the
// road start each stretch of the conversation (game/script/day05.js).
import { decodeGrid, validateMap } from './grid.js';

const width = 60;
const height = 12;

const groundLegend = {
  g1: 'grass-a', g2: 'grass-b', fr: 'frost-grass', cr: 'crocus-grass',
  rd: 'dirt-road', rn: 'dirt-road-n', rs: 'dirt-road-s',
};
const propLegend = {
  '..': '', fh: 'fence-h', fp: 'fence-post', fv: 'fence-v', rk: 'rock-small', rc: 'rock-cluster',
};

// Ground by column band: grass west, frost from x 44, a crocus here and there.
const grassAt = (x, y) => {
  const h = (Math.imul(x * 31 + y * 17, 2654435761) >>> 0) % 100;
  if (x >= 44 + (y % 3)) return h < 6 ? 'cr' : 'fr';
  return h < 38 ? 'g2' : 'g1';
};
const groundRows = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
  if (y === 4) return 'rn';
  if (y === 5 || y === 6) return 'rd';
  if (y === 7) return 'rs';
  return grassAt(x, y);
}).join(' '));

const props = Array.from({ length: height }, () => Array(width).fill('..'));
// the pasture: fence along y 3 with posts, closed at its west and east ends
for (let x = 22; x <= 41; x++) props[3][x] = x === 22 || x === 41 ? 'fp' : 'fh';
for (let y = 0; y < 3; y++) { props[y][22] = 'fv'; props[y][41] = 'fv'; }
// fields and fences west of it, rocks thickening east
for (let x = 2; x <= 12; x++) props[9][x] = x === 2 || x === 12 ? 'fp' : 'fh';
const rocks = [[46, 2, 'rk'], [49, 9, 'rc'], [51, 1, 'rk'], [53, 10, 'rk'], [55, 2, 'rc'], [57, 9, 'rk'], [47, 10, 'rk'], [58, 1, 'rk'], [44, 9, 'rc']];
for (const [x, y, name] of rocks) props[y][x] = name;
const propRows = props.map((row) => row.join(' '));

export default validateMap({
  id: 'valley-road',
  from: 5,
  name: 'THE VALLEY ROAD',
  mist: [0.04, 0.5],
  wind: [0.12, 700],
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'valley-road ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'valley-road props'),
  blocks: [
    { name: 'bison-sign', x: 17, y: 2 },
    { name: 'conifer', x: 3, y: -1 },
    { name: 'conifer', x: 6, y: 0 },
    { name: 'conifer', x: 14, y: 9 },
    { name: 'conifer', x: 16, y: 10 },
    { name: 'bare-tree', x: 43, y: 0 },
    { name: 'bare-tree', x: 50, y: 9 },
    { name: 'conifer', x: 26, y: 9 },
    { name: 'conifer', x: 34, y: 10 },
  ],
  objects: [
    { id: 'bison-fence', x: 23, y: 3, w: 18, h: 1, type: 'fence' },
    { id: 'bison-sign', x: 17, y: 3, w: 4, h: 1, type: 'sign' },
    { id: 'walk-why', x: 5, y: 0, w: 1, h: 12, type: 'trigger' },
    { id: 'walk-silence', x: 13, y: 0, w: 1, h: 12, type: 'trigger' },
    { id: 'walk-field', x: 21, y: 0, w: 1, h: 12, type: 'trigger' },
    { id: 'walk-fog', x: 52, y: 0, w: 1, h: 12, type: 'trigger' },
  ],
  spawns: {
    'from-valley': { x: 2, y: 5, face: 'right' },
    'from-foglands': { x: 57, y: 5, face: 'left' },
  },
  exits: [
    { x: 0, y: 4, w: 1, h: 4, to: 'verdant-valley', spawn: 'from-valley-road' },
    { x: 59, y: 4, w: 1, h: 4, to: 'foglands', spawn: 'from-road' },
  ],
  marks: {
    // where the bison graze (tile of each one's feet, west end); a dozen or so
    bison: [[24, 1, 'west'], [27, 2, 'east'], [30, 0, 'west'], [33, 2, 'west'], [36, 1, 'east'], [38, 2, 'west'], [25, 3, 'east']].slice(0, 6),
    follower: { x: 1, y: 5 }, // the doctor starts a step behind
  },
});
