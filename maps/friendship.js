// Friendship, the town (GAME-PLAN §5). 48×28 tiles of 16 px.
// ground and props are written as 2-character codes (legends below) so the layout can be
// edited by eye; collision is derived from tile kinds by maps/grid.js, never written here.
//
//   y 0–5   conifer belt, closes the north edge
//   y 6–12  north side: MERCANTILE (west) · THE MIRROR with its lamp · open lot · two
//           townhouses and DR. DAEDALUS · OPTOMETRY (there all along, unnoticed until Day 3:
//           no doors here, maps/day03-friendship.js adds them) · STABLES + pen
//   y 13–15 main street, cobbled square with the Hutch in the middle; east end exits
//   y 16–22 depot, platform along y 20–21, ramp at its east end down to the path north
//   y 23–24 rails, full width
//   y 25–27 frost, crocus clumps, a few stones
import { decodeGrid, validateMap } from './grid.js';

const groundLegend = {
  g1: 'grass-a', g2: 'grass-b', fr: 'frost-grass', cr: 'crocus-grass',
  rd: 'dirt-road', rn: 'dirt-road-n', rs: 'dirt-road-s', pu: 'puddle', cb: 'cobble',
  pk: 'platform-plank', pe: 'platform-edge', ra: 'platform-ramp-a', rb: 'platform-ramp-b',
  fa: 'platform-ramp-face-a', fb: 'platform-ramp-face-b', tn: 'rail-n', ts: 'rail-s',
};

const propLegend = {
  '..': '', ba: 'barrel', cx: 'crate', fh: 'fence-h', fv: 'fence-v', fp: 'fence-post',
  sp: 'sign-post', rk: 'rock-small',
};

const width = 48;
const height = 28;

const groundRows = [
    'g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g1 g2 g2 g2 g2 g2 g1 g2 g1 g2 g2 g1 g2 g1 g2 g2 g2 g2 g1 g2 g2 g2 g1 g2 g2 g2 g1 g2 g2 g2 g2 g1 g2 g1 g1 g1 g2 g2',
    'g1 g2 g2 g2 g2 g1 g1 g2 g2 g1 g1 g2 g2 g2 g2 g2 g1 g2 g2 g2 g1 g2 g2 g2 g1 g2 g2 g1 g1 g1 g2 g2 g1 g2 g2 g2 g1 g1 g1 g2 g1 g1 g1 g1 g2 g2 g1 g2',
    'g1 g2 g1 g2 g1 g2 g1 g2 g2 g2 g1 g1 g1 g2 g1 g2 g2 g1 g2 g2 g1 g2 g2 g2 g2 g2 g2 g2 g2 g2 g2 g1 g1 g1 g1 g2 g2 g2 g1 g2 g1 g2 g1 g2 g2 g2 g2 g2',
    'g2 g2 g2 g1 g2 g2 g1 g1 g2 g1 g1 g1 g2 g1 g2 g2 g1 g2 g2 g2 g2 g2 g2 g1 g2 g2 g2 g2 g2 g2 g1 g2 g2 g2 g1 g2 g2 g2 g2 g1 g1 g2 g1 g2 g2 g2 g2 g2',
    'g1 g2 g2 g1 g1 g2 g2 g2 g2 g2 g2 g1 g1 g1 g2 g1 g2 g2 g2 g2 g2 g2 g2 g2 g1 g2 g2 g1 g2 g1 g2 g2 g2 g1 g1 g2 g1 g2 g2 g2 g2 g1 g2 g2 g2 g1 g1 g2',
    'g2 g2 g2 g2 g2 g1 g2 g2 g2 g2 g2 g2 g2 g1 g2 g2 g2 g2 g2 g2 g1 g2 g2 g2 g2 g2 g1 g2 g2 g2 g2 g2 g2 g1 g1 g2 g2 g2 g2 g2 g2 g1 g2 g2 g2 g2 g1 g2',
    'g2 g2 g2 g2 g2 g2 g2 g1 g2 g2 g2 g2 g2 g2 g1 g2 g1 g2 g2 g1 g2 g1 g2 g1 g2 g1 g2 g1 g2 g1 g2 g1 g2 g2 g2 g2 g2 g1 g2 g2 g2 g2 g2 g1 g2 g2 g1 g2',
    'g1 g2 g2 g2 g2 g2 g2 g2 g1 g2 g2 g1 g1 g1 g2 g1 g2 g1 g2 g1 g2 g2 g2 g2 g1 g1 g1 g2 g2 g1 g2 g2 g2 g2 g2 g2 g2 g2 g2 g1 g2 g2 g2 g1 g2 g2 g2 g2',
    'g1 g1 g1 g2 g1 g1 g2 g2 g1 g2 g2 g1 g1 g1 g2 g1 g1 g2 g1 g1 g1 g1 g1 g1 g2 g1 g2 g2 g2 g1 g1 g1 g2 g1 g1 g1 g2 g1 g2 g1 g1 g1 g1 g2 g2 g1 g1 g1',
    'g1 g2 g1 g2 g1 g1 g2 g2 g2 g1 g1 g2 g2 g1 g1 g1 g2 g1 g2 g2 g2 g2 g1 g2 g1 g1 g2 g2 g1 g1 g2 g1 g1 g1 g1 g2 g1 g1 g1 g1 g1 g1 g2 g2 g2 g1 g1 g2',
    'g1 g1 g1 g1 g2 g1 g1 g2 g2 g1 g2 g2 g2 g1 g2 g1 g1 g1 g2 g1 g2 g1 g1 g1 g2 g1 g1 g1 g1 g1 g1 g2 g1 g2 g2 g1 g2 g2 g2 g1 g1 g2 g2 g1 g2 g2 g1 g1',
    'g1 g1 g1 g1 g1 g1 g2 g1 g2 g1 g1 g1 g1 g1 g1 g1 g2 g1 g1 g2 g2 g1 g2 g1 g2 g1 g2 g1 g2 g1 g2 g1 g2 g2 g1 g1 g1 g2 g1 g1 g1 g1 g2 g1 g2 g2 g1 g1',
    'g1 g2 g2 pk pk pk pk pk pk g1 g1 g1 g2 pk pk pk pk pk pk g1 cb cb cb cb cb cb cb cb cb cb g1 g1 g2 g1 g2 g1 rd rd rd rd rd g1 g2 g2 g1 g1 g1 g1',
    'rn rn rn rd rd rd rd rd rd rn rn rn rn rd rd rd rd rd rd rn cb cb cb cb cb cb cb cb cb cb rn pu rn rn rn rn rd rd rd rd rd rn rn rn rn rn rn rn',
    'rd rd rd rd rd rd rd rd rd pu rd rd rd rd rd rd rd rd rd rd cb cb cb cb cb cb cb cb cb cb rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd',
    'rs rs rs rs rs rs rs rs rs rs rs rs rd rd rs rs rs rs rs rs cb cb cb cb cb cb cb cb cb cb rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs',
    'g1 g1 g1 g1 g1 g1 g2 g2 g1 g2 g2 g1 rd rd g2 g2 g1 g2 g1 g1 cb cb cb cb cb cb cb cb cb cb g1 g2 g1 g1 g1 g2 g1 g1 g1 g1 g1 g1 g1 g1 g2 g1 g2 g2',
    'g1 g2 g1 g1 g2 g1 g2 g1 g1 g1 g1 g1 rd rd g1 g2 g1 g2 g2 g1 g1 g1 g2 g1 g2 g1 g2 g1 g2 g2 g1 g1 g1 g1 g2 g1 g2 g2 g1 g1 g1 g2 g1 g1 g1 g1 g1 g2',
    'g2 g1 g1 g1 g1 g1 g1 g1 g1 g1 g2 g2 rd rd g2 g1 g1 g2 g2 g1 g1 g1 g2 g2 g2 g2 g1 g2 g1 g1 g1 g2 g2 g1 g2 g2 g1 g1 g1 g2 g2 g1 g2 g1 g1 g2 g2 g2',
    'g2 g2 g1 g1 g1 g2 g1 g1 g1 g2 g1 g1 rd rd g1 g2 g1 g2 g1 g2 g1 g2 g1 g2 g2 g1 g2 g1 g2 g1 g1 g1 g1 g2 g1 g1 g2 g1 g2 g2 g1 g1 g1 g2 g1 g1 g1 g1',
    'pk pk pk pk pk pk pk pk pk pk ra rb rd rd g2 g1 g1 g1 g1 g2 g2 g2 g1 g1 g1 g1 g1 g1 g2 g2 g2 g1 g1 g2 g1 g1 g1 g1 g1 g1 g1 g1 g2 g2 g1 g2 g1 g1',
    'pk pk pk pk pk pk pk pk pk pk ra rb rd rd g2 g1 g2 g1 g2 g2 g2 g1 g1 g1 g2 g1 g1 g1 g1 g1 g2 g1 g2 g1 g1 g2 g1 g1 g2 g1 g2 g1 g1 g2 g1 g1 g2 g1',
    'pe pe pe pe pe pe pe pe pe pe fa fb fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr',
    'tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn tn',
    'ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts ts',
    'fr fr cr cr fr fr cr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr',
    'fr fr fr cr fr fr fr cr fr fr fr fr fr fr fr fr cr cr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr',
    'fr fr fr fr cr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr fr fr',
];

const propRows = [
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. fp fh fh fp .. .. .. .. .. .. .. .. fp .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. cx .. .. .. .. ba .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ba cx .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. cx ba .. .. .. .. .. sp .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. ba .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    'ba .. .. .. .. .. .. fh fh fh fh fh .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rk .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. .. .. .. .. ..',
    '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
];

// Conifer belt: five staggered rows of 2×2 trees; the y = 4 row seals the north edge.
const forest = [];
for (let y = 0; y <= 4; y++) {
  for (let x = y % 2 ? -1 : 0; x < width; x += 2) forest.push({ name: 'conifer', x, y });
}

export default validateMap({
  id: 'friendship',
  name: 'FRIENDSHIP',
  mist: 0,
  wind: [0.06, 450],
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'friendship ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'friendship props'),
  blocks: [
    ...forest,
    { name: 'conifer', x: 0, y: 7 },
    { name: 'conifer', x: 1, y: 9 },
    { name: 'conifer', x: 10, y: 6 },
    { name: 'conifer', x: 44, y: 6 },
    { name: 'conifer', x: 46, y: 8 },
    { name: 'conifer', x: 44, y: 10 },
    { name: 'mercantile', x: 4, y: 8 },
    { name: 'mirror', x: 14, y: 7 },
    { name: 'lamp-post', x: 17, y: 11 },
    { name: 'hutch', x: 24, y: 13 },
    { name: 'townhouse', x: 25, y: 9 },
    { name: 'townhouse-b', x: 27, y: 9 },
    { name: 'optometry', x: 29, y: 8 },
    { name: 'stables', x: 36, y: 8 },
    { name: 'pen', x: 41, y: 10 },
    { name: 'depot', x: 1, y: 16 },
    { name: 'conifer', x: 17, y: 17 },
    { name: 'conifer', x: 26, y: 19 },
    { name: 'conifer', x: 33, y: 17 },
    { name: 'conifer', x: 39, y: 19 },
    { name: 'conifer', x: 45, y: 16 },
    { name: 'conifer', x: 44, y: 19 },
  ],
  objects: [
    { id: 'mercantile-door', x: 5, y: 11, w: 2, h: 1, type: 'door' },
    { id: 'mirror-door', x: 16, y: 11, w: 1, h: 1, type: 'door' },
    { id: 'hutch', x: 24, y: 13, w: 2, h: 2, type: 'board' },
    { id: 'stable-pen', x: 41, y: 10, w: 3, h: 2, type: 'shop' },
    // full height, so the gift cannot be walked around (the plan's sketch covered only the street)
    { id: 'editor-intercept', x: 33, y: 6, w: 1, h: 22, type: 'trigger', once: true },
  ],
  spawns: {
    'from-train': { x: 4, y: 21, face: 'down' },
    'from-east': { x: 46, y: 14, face: 'left' },
  },
  exits: [{ x: 47, y: 13, w: 1, h: 3, to: 'foglands-road', spawn: 'from-west' }],
});
