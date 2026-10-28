// The Foglands road (GAME-PLAN §5): a 64×12 strip from Friendship east to Upper Foglands.
// West to east: fields and fences, a long conifer stretch, rocks thickening, then frost.
// Mist rises with x (game/world.js). The halfway trigger costs a heart (GAME-PLAN §6).
// From Day 2 a track forks south to the vineyard (maps/day02-foglands-road.js).
import { decodeGrid, validateMap } from './grid.js';

const groundLegend = {
  g1: 'grass-a', g2: 'grass-b', fr: 'frost-grass', cr: 'crocus-grass',
  rd: 'dirt-road', rn: 'dirt-road-n', rs: 'dirt-road-s',
};

const propLegend = {
  '..': '', fh: 'fence-h', fp: 'fence-post', rk: 'rock-small', rc: 'rock-cluster',
};

const width = 64;
const height = 12;

const groundRows = [
  'g1 g2 g1 g1 g1 g2 g2 g1 g1 g1 g2 g1 g2 g1 g2 g2 g2 g1 g1 g2 g2 g2 g2 g2 g2 g1 g1 g2 g2 g1 g1 g2 g2 g1 g1 g2 g1 g1 g2 g2 g1 g1 fr fr fr fr fr fr cr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr',
  'g1 g1 g2 g1 g1 g2 g1 g1 g1 g1 g1 g1 g1 g2 g1 g2 g1 g1 g1 g1 g1 g2 g2 g2 g1 g2 g1 g1 g1 g1 g1 g1 g2 g2 g2 g1 g1 g2 g1 g2 g2 g2 g2 g1 fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr',
  'g1 g1 g1 g2 g2 g2 g1 g1 g1 g2 g2 g1 g1 g1 g1 g2 g2 g2 g2 g1 g1 g1 g2 g1 g2 g1 g1 g1 g1 g2 g1 g2 g2 g1 g2 g1 g1 g2 g2 g1 g1 g2 g1 g1 cr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr',
  'g2 g1 g2 g2 g2 g2 g2 g2 g2 g2 g1 g2 g1 g2 g2 g2 g1 g2 g1 g2 g2 g2 g2 g1 g2 g2 g2 g1 g1 g2 g2 g2 g2 g1 g1 g1 g2 g2 g2 g2 g2 g1 fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr fr',
  'rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn rn',
  'rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd',
  'rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd',
  'rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs rs',
  'g2 g1 g2 g1 g2 g2 g2 g1 g1 g2 g2 g2 g1 g1 g2 g1 g2 g1 g2 g1 g1 g1 g2 g1 g1 g2 g1 g1 g1 g2 g2 g1 g1 g2 g2 g1 g2 g2 g1 g1 fr fr fr fr cr cr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr cr fr',
  'g2 g1 g2 g1 g1 g2 g1 g2 g2 g1 g1 g1 g2 g2 g1 g2 g2 g2 g1 g1 g1 g2 g2 g1 g1 g1 g2 g1 g1 g2 g1 g2 g2 g1 g2 g1 g2 g1 g2 g1 g2 g2 fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr cr fr fr fr fr fr fr',
  'g2 g2 g2 g2 g1 g1 g1 g2 g1 g2 g2 g2 g2 g1 g2 g2 g1 g1 g1 g2 g2 g2 g2 g1 g1 g2 g1 g1 g1 g1 g1 g2 g1 g2 g2 g2 g1 g1 g2 g2 g1 g1 g1 g1 fr fr fr fr fr fr fr fr fr fr fr fr cr fr cr fr fr fr fr fr',
  'g1 g2 g1 g1 g1 g1 g2 g1 g1 g2 g1 g1 g1 g2 g2 g2 g1 g1 g2 g1 g1 g1 g1 g1 g1 g1 g2 g2 g1 g1 g2 g1 g1 g1 g1 g1 g2 g1 g2 g1 g1 fr fr fr cr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr',
];

const propRows = [
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. rk .. rc .. .. rc rk .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. rc .. .. rk .. rk rk rc .. rk rk .. .. .. .. .. ..',
  '.. .. fp fh fh fh fh fh fh fh fh fh fh fh fp .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. .. .. rc .. .. .. .. rk .. .. .. .. .. rc rc .. .. rk rc rk .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. fp fh fh fh fh fh fh fh fh fh fh fh fp .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. .. rc .. .. .. .. rc .. .. rc .. .. rc .. rc rk .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. .. .. rc .. .. .. rc .. .. .. .. rk .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. rc .. .. .. rk .. .. .. .. .. .. .. rc .. .. rk rk .. rc .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
];

export default validateMap({
  id: 'foglands-road',
  name: 'THE FOGLANDS ROAD',
  mist: [0, 0.35], // thickening from the west edge to the east
  wind: [0.1, 650],
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'foglands-road ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'foglands-road props'),
  blocks: [
    { name: 'conifer', x: 16, y: -1 },
    { name: 'conifer', x: 17, y: 1 },
    { name: 'conifer', x: 16, y: 8 },
    { name: 'conifer', x: 17, y: 10 },
    { name: 'conifer', x: 18, y: -1 },
    { name: 'conifer', x: 19, y: 0 },
    { name: 'conifer', x: 18, y: 8 },
    { name: 'conifer', x: 19, y: 9 },
    { name: 'conifer', x: 20, y: -1 },
    { name: 'conifer', x: 21, y: 1 },
    { name: 'conifer', x: 20, y: 8 },
    { name: 'conifer', x: 21, y: 10 },
    { name: 'conifer', x: 22, y: -1 },
    { name: 'conifer', x: 23, y: 0 },
    { name: 'conifer', x: 22, y: 8 },
    { name: 'conifer', x: 23, y: 9 },
    { name: 'conifer', x: 24, y: -1 },
    { name: 'conifer', x: 25, y: 1 },
    { name: 'conifer', x: 24, y: 8 },
    { name: 'conifer', x: 25, y: 10 },
    { name: 'conifer', x: 26, y: -1 },
    { name: 'conifer', x: 27, y: 0 },
    { name: 'conifer', x: 26, y: 8 },
    { name: 'conifer', x: 27, y: 9 },
    { name: 'conifer', x: 28, y: -1 },
    { name: 'conifer', x: 29, y: 1 },
    { name: 'conifer', x: 28, y: 8 },
    { name: 'conifer', x: 29, y: 10 },
    { name: 'conifer', x: 30, y: -1 },
    { name: 'conifer', x: 31, y: 0 },
    { name: 'conifer', x: 30, y: 8 },
    { name: 'conifer', x: 31, y: 9 },
    { name: 'conifer', x: 32, y: -1 },
    { name: 'conifer', x: 33, y: 1 },
    { name: 'conifer', x: 32, y: 8 },
    { name: 'conifer', x: 33, y: 10 },
    { name: 'conifer', x: 34, y: -1 },
    { name: 'conifer', x: 35, y: 0 },
    { name: 'conifer', x: 34, y: 8 },
    { name: 'conifer', x: 35, y: 9 },
    { name: 'bare-tree', x: 40, y: 0 },
    { name: 'bare-tree', x: 47, y: 9 },
    { name: 'bare-tree', x: 55, y: 0 },
  ],
  objects: [
    { id: 'halfway', x: 32, y: 0, w: 1, h: 12, type: 'trigger', once: true },
  ],
  spawns: {
    'from-west': { x: 1, y: 6, face: 'right' },
    'from-east': { x: 62, y: 6, face: 'left' },
  },
  exits: [
    { x: 0, y: 4, w: 1, h: 4, to: 'friendship', spawn: 'from-east' },
    { x: 63, y: 4, w: 1, h: 4, to: 'foglands', spawn: 'from-road' },
  ],
});
