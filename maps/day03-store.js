// Friendship Books inside (GAME-PLAN-DAYS §B Day 3): 12×8. Three bookcases against the back
// wall (the second and third become cards and games once the store is renamed; game/script/
// day03.js lays those over), a rug, the counter with the week's stock (E on its front), and
// the door at the foot of the room. The camera centres the small room (game/world/day03.js).
import { decodeGrid, validateMap } from './grid.js';

const groundLegend = {
  we: 'wall-edge', wp: 'wall-plank', ww: 'wall-wainscot', fl: 'wood-floor', ru: 'rug', di: 'door-in',
};
const width = 12;
const height = 8;
const groundRows = [
  'we wp wp wp wp wp wp wp wp wp wp we',
  'we ww ww ww ww ww ww ww ww ww ww we',
  'we fl fl fl fl fl fl fl fl fl fl we',
  'we fl fl fl fl fl fl fl fl fl fl we',
  'we fl fl ru ru ru ru fl fl fl fl we',
  'we fl fl ru ru ru ru fl fl fl fl we',
  'we fl fl fl fl fl fl fl fl fl fl we',
  'we we we we we di di we we we we we',
];
const empty = Array.from({ length: height }, () => Array(width).fill(''));

export const shelves = [{ x: 1, y: 0 }, { x: 4, y: 0 }, { x: 7, y: 0 }]; // books, then cards, games

export default validateMap({
  id: 'store',
  from: 3,
  name: 'FRIENDSHIP BOOKS',
  mist: 0,
  wind: [0, 0],
  indoor: true,
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'store ground'),
  props: empty,
  blocks: [
    ...shelves.map((at) => ({ name: 'shelf-books', ...at })),
    { name: 'store-counter', x: 7, y: 3 },
  ],
  objects: [
    { id: 'stock', x: 7, y: 4, w: 3, h: 1, type: 'counter' },
    { id: 'shelves', x: 1, y: 1, w: 8, h: 1, type: 'shelf' },
  ],
  spawns: {
    door: { x: 5, y: 6, face: 'up' },
    counter: { x: 8, y: 5, face: 'up' },
  },
  exits: [{ x: 5, y: 7, w: 2, h: 1, to: 'friendship', spawn: 'from-store' }],
  marks: {
    shelves,
    visitorIn: { x: 6, y: 6 }, // where a caller comes in
    visitorStand: { x: 6, y: 5 }, // and stands, beside Emily at the counter
  },
});
