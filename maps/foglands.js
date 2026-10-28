// Upper Foglands (GAME-PLAN §5): 32×24. The sea and its cliffs close the north and west;
// the road comes in from the east. Myre Farm sits north of centre: a broken ring of fence,
// rocks everywhere, crocuses, and the boundary stake that ends the day.
import { decodeGrid, validateMap } from './grid.js';

export const groundLegend = {
  wa: 'water-a', wb: 'water-b', cn: 'cliff-n', cw: 'cliff-w', cc: 'cliff-nw',
  fr: 'frost-grass', g2: 'grass-b', cr: 'crocus-grass', rd: 'dirt-road',
};

const propLegend = {
  '..': '', fh: 'fence-h', fv: 'fence-v', fp: 'fence-post', rk: 'rock-small', rc: 'rock-cluster', sk: 'stake',
};

const width = 32;
const height = 24;

export const groundRows = [
  'wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb',
  'wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa',
  'wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb',
  'wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa wb wa',
  'wa wb wa wb cc cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn cn',
  'wb wa wb wa cw fr fr fr fr fr cr fr fr cr fr fr fr fr fr cr cr fr fr fr fr fr fr fr fr fr fr fr',
  'wa wb wa wb cw fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr',
  'wb wa wb wa cw fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr cr fr fr fr fr fr fr fr fr fr',
  'wa wb wa wb cw cr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr fr fr',
  'wb wa wb wa cw fr fr fr fr fr fr fr fr fr fr fr cr fr fr cr fr fr fr fr fr fr cr fr fr fr fr cr',
  'wa wb wa wb cw fr fr fr cr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr fr',
  'wb wa wb wa cw fr fr fr fr fr cr cr fr fr fr fr fr fr fr fr cr fr cr fr fr fr fr fr fr fr fr fr',
  'wa wb wa wb cw fr fr cr fr cr cr fr fr fr fr fr fr fr cr fr cr fr fr fr fr fr fr fr fr fr fr cr',
  'wb wa wb wa cw fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr fr fr fr fr fr fr fr',
  'wa wb wa wb cw fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr cr fr fr fr fr fr fr fr fr fr fr',
  'wb wa wb wa cw fr fr fr fr fr fr fr fr fr fr rd rd fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr',
  'wa wb wa wb cw fr fr fr fr fr fr fr fr fr fr rd rd rd fr fr fr fr fr fr fr fr fr fr fr fr fr fr',
  'wb wa wb wa cw fr fr fr fr fr fr fr cr fr fr rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd',
  'wa wb wa wb cw cr fr fr fr fr fr cr fr fr fr rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd rd',
  'wb wa wb wa cw fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr',
  'wa wb wa wb cw fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr fr fr fr',
  'wb wa wb wa cw fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr cr fr fr fr fr fr fr fr',
  'wa wb wa wb cw fr fr fr fr cr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr fr cr',
  'wb wa wb wa cw cr fr fr fr fr fr fr fr fr fr fr fr fr fr cr fr fr fr fr fr fr fr fr fr fr fr fr',
];

const propRows = [
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. ..',
  '.. .. .. .. .. .. .. .. .. fp fh fh .. .. fh fh fh fh fh .. fh fh fp .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. fv rc .. .. rk .. rc rk rc .. .. .. rc fv .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. rc .. .. .. .. rc .. .. rk .. rk rc .. .. rk fv .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. fv rc rk rk .. rk sk .. rc rk .. .. rk .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. fv .. .. .. .. .. .. .. rc rc .. .. .. fv .. .. .. .. rc .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. rc rc .. rk rk .. .. rk .. rk .. rc fv .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. fv .. rc rk rc .. .. .. .. .. rk .. .. fv .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. fp fh fh fh fh fh .. .. fh fh fh .. fh fp .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. rc .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. rc .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. rk .. .. .. .. .. .. .. .. .. .. .. rk .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
];

export default validateMap({
  id: 'foglands',
  name: 'UPPER FOGLANDS',
  mist: 0.25,
  wind: [0.14, 850],
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'foglands ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'foglands props'),
  blocks: [
    { name: 'bare-tree', x: 25, y: 7 },
    { name: 'bare-tree', x: 6, y: 16 },
    { name: 'bare-tree', x: 27, y: 19 },
  ],
  objects: [
    { id: 'stake', x: 15, y: 10, w: 1, h: 1, type: 'stake' },
  ],
  spawns: {
    'from-road': { x: 30, y: 17, face: 'left' },
  },
  exits: [{ x: 31, y: 16, w: 1, h: 4, to: 'foglands-road', spawn: 'from-east' }],
});
