// Myre Farm from Day 2 on (GAME-PLAN-DAYS §B Day 2): the same Upper Foglands as Day 1 (same
// id, so the road and the HUD find it), now with Emily's house, its porch and steps (Rest),
// a 4×3 garden of plots, a well, the great sequoia (cut on Day 4), and Pixel by the path.
// The sea and the cliffs are Day 1's rows unchanged; maps/versions.js picks this version by day.
import { decodeGrid, validateMap } from './grid.js';
import { groundLegend as foglandsLegend, groundRows as foglandsRows } from './foglands.js';

const groundLegend = { ...foglandsLegend, pb: 'plot-bare', st: 'steps' };

const propLegend = {
  '..': '', fh: 'fence-h', fv: 'fence-v', fp: 'fence-post', rk: 'rock-small', rc: 'rock-cluster', sk: 'stake',
};

const width = 32;
const height = 24;

// Day 1's ground, then the farm laid over it.
const cells = foglandsRows.map((row) => row.trim().split(/\s+/));
const put = (x, y, code) => { cells[y][x] = code; };
export const plotArea = { x: 12, y: 12, w: 4, h: 3 };
for (let y = plotArea.y; y < plotArea.y + plotArea.h; y++) {
  for (let x = plotArea.x; x < plotArea.x + plotArea.w; x++) put(x, y, 'pb');
}
put(14, 9, 'st');
for (let x = 14; x <= 17; x++) put(x, 10, 'rd'); // from the steps east…
for (let y = 10; y <= 16; y++) { put(16, y, 'rd'); put(17, y, 'rd'); } // …and down to the road
const groundRows = cells.map((row) => row.join(' '));

const propRows = [
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. .. .. rk .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. sk .. .. .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. rk .. .. .. .. fp .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. ..',
  '.. .. .. .. .. .. .. .. rc .. .. fv .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. fv .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. fv .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. rk fp fh fh fh fh .. .. .. .. rk .. .. .. .. rc .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. rc .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. rc .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. rk .. .. .. .. .. .. .. .. .. .. .. rk .. rk .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
];

const plots = [];
for (let y = plotArea.y; y < plotArea.y + plotArea.h; y++) {
  for (let x = plotArea.x; x < plotArea.x + plotArea.w; x++) {
    plots.push({ id: `plot-${plots.length}`, x, y, w: 1, h: 1, type: 'plot' });
  }
}

export default validateMap({
  id: 'foglands',
  from: 2,
  name: 'UPPER FOGLANDS',
  mist: 0.25,
  wind: [0.14, 850],
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'foglands@2 ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'foglands@2 props'),
  blocks: [
    { name: 'sequoia', x: 6, y: 5 },
    { name: 'farmhouse', x: 13, y: 5 },
    { name: 'porch', x: 13, y: 7 },
    { name: 'well', x: 19, y: 10 },
    { name: 'bare-tree', x: 25, y: 7 },
    { name: 'bare-tree', x: 6, y: 16 },
    { name: 'bare-tree', x: 27, y: 19 },
  ],
  objects: [
    { id: 'porch', x: 14, y: 9, w: 1, h: 1, type: 'rest' },
    ...plots,
    { id: 'well', x: 19, y: 11, w: 1, h: 1, type: 'well' },
    { id: 'sequoia', x: 7, y: 8, w: 1, h: 1, type: 'tree' },
  ],
  spawns: {
    'from-road': { x: 30, y: 17, face: 'left' },
    porch: { x: 14, y: 9, face: 'down' },
  },
  exits: [{ x: 31, y: 16, w: 1, h: 4, to: 'foglands-road', spawn: 'from-east' }],
  // Where things stand (used by game/script/day02.js).
  marks: {
    hitch: { x: 21, y: 9 }, // Pixel, facing west
    plate: { x: 13, y: 9 },
    callerPath: [{ x: 16, y: 17 }, { x: 16, y: 10 }, { x: 14, y: 10 }], // a visitor up from the road
  },
});
