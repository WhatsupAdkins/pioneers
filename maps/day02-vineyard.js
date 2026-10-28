// Alabaster Brown's vineyard (GAME-PLAN-DAYS §B Day 2 beat 5): 24×16, south off the Foglands
// road. Trellised vine rows either side of the track, which parts round the log cabin and
// meets again at its door, where a slab of stone serves for a step; wine barrels, and a small
// heap of rocks beside the door (Alabaster's collection).
import { decodeGrid, validateMap } from './grid.js';

const groundLegend = {
  g1: 'grass-a', g2: 'grass-b', rd: 'dirt-road', rw: 'dirt-road-w', re: 'dirt-road-e', ss: 'stone-slab',
};

const propLegend = {
  '..': '', fh: 'fence-h', fp: 'fence-post', vr: 'vine-row', wb: 'wine-barrel', rk: 'rock-small', rc: 'rock-cluster',
};

const width = 24;
const height = 16;

const groundRows = [
  'g2 g1 g2 g1 g2 g2 g2 g2 g1 g1 g1 rw re g1 g1 g1 g1 g1 g1 g2 g1 g2 g1 g1',
  'g2 g1 g1 g1 g1 g1 g1 g1 g1 g2 g2 rw re g1 g1 g1 g1 g1 g1 g1 g1 g1 g1 g2',
  'g2 g2 g1 g1 g2 g1 g1 g1 g1 g1 g1 rw re g1 g1 g1 g1 g2 g2 g1 g2 g2 g2 g1',
  'g1 g1 g1 g1 g1 g2 g1 g1 g1 g1 g2 rw re g1 g1 g2 g1 g1 g1 g2 g1 g1 g1 g2',
  'g1 g1 g1 g2 g1 g2 g1 g1 g1 g1 g1 rw re g2 g1 g1 g1 g2 g2 g1 g1 g1 g1 g1',
  'g1 g1 g2 g2 g1 g1 g1 g1 g2 g2 g1 rw re g1 g1 g1 g1 g2 g1 g2 g2 g1 g1 g1',
  'g2 g1 g1 g2 g2 g1 g1 g1 g2 g2 g1 rw re g2 g1 g1 g1 g2 g1 g1 g1 g1 g1 g2',
  'g2 g1 g2 g1 g1 g1 g1 g1 g1 rd rd rd rd rd rd g1 g2 g1 g1 g2 g2 g1 g1 g1',
  'g1 g1 g1 g1 g1 g1 g2 g1 g2 rd g1 g1 g1 g1 rd g2 g2 g2 g1 g1 g1 g2 g2 g2',
  'g1 g1 g1 g2 g2 g2 g1 g1 g1 rd g2 g1 g1 g2 rd g2 g1 g1 g2 g1 g1 g2 g1 g1',
  'g1 g2 g2 g2 g1 g1 g1 g2 g1 rd g1 g1 g1 g2 rd g1 g1 g2 g1 g2 g1 g1 g1 g1',
  'g1 g2 g1 g2 g2 g2 g1 g1 g2 rd rd ss ss rd rd g2 g2 g1 g2 g1 g1 g1 g2 g1',
  'g2 g2 g1 g1 g2 g1 g2 g2 g1 rd rd rd rd rd rd g1 g1 g1 g1 g2 g1 g1 g1 g1',
  'g1 g2 g2 g1 g2 g1 g1 g2 g1 g1 g1 g1 g1 g1 g1 g2 g2 g1 g1 g2 g2 g1 g1 g1',
  'g2 g2 g1 g2 g1 g1 g1 g1 g1 g2 g2 g2 g1 g1 g1 g1 g2 g1 g2 g1 g1 g1 g2 g1',
  'g1 g2 g1 g1 g1 g1 g2 g2 g2 g1 g1 g2 g2 g1 g1 g1 g1 g1 g1 g1 g2 g1 g1 g1',
];

const propRows = [
  'fh fh fh fh fh fh fh fh fh fh fp .. .. fp fh fh fh fh fh fh fh fh fh fh',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. vr vr vr vr vr vr vr .. .. .. .. .. .. vr vr vr vr vr vr vr .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. vr vr vr vr vr vr vr .. .. .. .. .. .. vr vr vr vr vr vr vr .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. vr vr vr vr vr vr vr .. .. .. .. .. .. vr vr vr vr vr vr vr .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. wb wb .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. wb .. .. .. .. .. .. .. .. wb .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. .. .. .. .. .. ..',
  '.. .. .. rk .. .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. rk .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
];

// Trees close the sides and the foot of the map.
const trees = [];
for (let y = 1; y < height; y += 2) trees.push({ name: 'conifer', x: -1, y }, { name: 'conifer', x: width - 1, y });
for (let x = 1; x < width - 1; x += 2) trees.push({ name: 'conifer', x, y: height - 2 });

export default validateMap({
  id: 'vineyard',
  from: 2,
  name: 'BROWN VINEYARD',
  mist: 0.12,
  wind: [0.08, 520],
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'vineyard ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'vineyard props'),
  blocks: [
    ...trees,
    { name: 'cabin', x: 10, y: 8 },
  ],
  objects: [
    { id: 'cabin-door', x: 11, y: 10, w: 2, h: 1, type: 'door' },
    { id: 'slab', x: 11, y: 11, w: 2, h: 1, type: 'gift' },
  ],
  spawns: {
    'from-road': { x: 11, y: 1, face: 'down' },
  },
  exits: [{ x: 11, y: 0, w: 2, h: 1, to: 'foglands-road', spawn: 'from-vineyard' }],
  marks: {
    gift: { x: 12, y: 11 }, // where a left rock shows on the slab
    hitch: { x: 13, y: 1 }, // Pixel waits by the gate, facing west
  },
});
