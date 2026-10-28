// Friendship Cemetery (GAME-PLAN-DAYS §B Day 13 beat 4), 16×12, in the trees north of town:
// an iron fence with its gate at the foot, old headstones in rows, two yews, and at the top of
// the path Emily's stone, new. Early spring: frost on the grass, where the crocus will come up.
// Day 13 reaches it by a cut from the square (the plan's road north from town would mean a new
// version of `friendship`, which other branches also change; see the Day 13 notes in VERIFICATION.md).
import { decodeGrid, validateMap } from './grid.js';

const groundLegend = { fg: 'frost-grass', rd: 'dirt-road' };
const propLegend = { '..': '', fh: 'iron-fence-h', fv: 'iron-fence-v', hs: 'headstone', es: 'emily-stone' };

const width = 16;
const height = 12;

const groundRows = [
  'fg fg fg fg fg fg fg fg fg fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg fg fg fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg fg fg fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg fg fg fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg rd fg fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg rd fg fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg rd fg fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg rd fg fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg rd fg fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg rd fg fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg rd rd fg fg fg fg fg fg fg',
  'fg fg fg fg fg fg fg rd rd fg fg fg fg fg fg fg',
];

const propRows = [
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. fh fh fh fh fh fh fh fh fh fh fh fh fh fh ..',
  '.. fv .. .. .. .. .. .. .. .. .. .. .. .. fv ..',
  '.. fv .. hs .. hs .. es .. .. hs .. hs .. fv ..',
  '.. fv .. .. .. .. .. .. .. .. .. .. .. .. fv ..',
  '.. fv .. hs .. hs .. .. .. hs .. .. hs .. fv ..',
  '.. fv .. .. .. .. .. .. .. .. .. .. .. .. fv ..',
  '.. fv .. .. .. hs .. .. .. hs .. .. .. .. fv ..',
  '.. fv .. .. .. .. .. .. .. .. .. .. .. .. fv ..',
  '.. fv .. .. .. .. .. .. .. .. .. .. .. .. fv ..',
  '.. fh fh fh fh fh fh .. .. fh fh fh fh fh fh ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
];

export default validateMap({
  id: 'cemetery',
  from: 13,
  name: 'FRIENDSHIP CEMETERY',
  mist: 0.16,
  wind: [0.07, 300],
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'cemetery ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'cemetery props'),
  blocks: [
    { name: 'conifer', x: -1, y: -1 },
    { name: 'conifer', x: 3, y: -1 },
    { name: 'conifer', x: 10, y: -1 },
    { name: 'conifer', x: 14, y: -1 },
    { name: 'yew', x: 2, y: 8 },
    { name: 'yew', x: 11, y: 8 },
    { name: 'conifer', x: -1, y: 4 },
    { name: 'conifer', x: -1, y: 9 },
    { name: 'conifer', x: 15, y: 3 },
    { name: 'conifer', x: 15, y: 9 },
  ],
  objects: [
    { id: 'emily-stone', x: 7, y: 3, w: 1, h: 1, type: 'stone' },
  ],
  spawns: {
    gate: { x: 7, y: 10, face: 'up' },
    stone: { x: 7, y: 4, face: 'up' },
  },
  exits: [],
  marks: {
    stone: { x: 7, y: 3 },
    // where the crocus comes up through the frost, in order
    crocus: [{ x: 6, y: 3 }, { x: 8, y: 3 }, { x: 6, y: 4 }, { x: 8, y: 4 }, { x: 6, y: 2 }, { x: 8, y: 2 }],
  },
});
