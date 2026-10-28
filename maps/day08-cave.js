// The cavern in the mountain (GAME-PLAN-DAYS §B Day 8 beat 6): a 10×8 chamber of floor and
// rock, set in a 20×12 map of solid rock so the screen is filled. Emily comes in at the
// bottom; Daedalus lies where she sheltered from the blizzard (game/script/day08.js).
import { validateMap } from './grid.js';

const width = 20;
const height = 12;
const room = { x: 5, y: 2, w: 10, h: 8 };
const ground = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
  const inside = x > room.x && x < room.x + room.w - 1 && y > room.y && y < room.y + room.h;
  if (y === room.y + room.h - 1 + 1 && (x === 9 || x === 10)) return 'cave-floor'; // the way in
  if (inside && y === room.y + 1) return 'cave-wall-face';
  if (inside) return 'cave-floor';
  return 'cave-wall';
}));
const props = Array.from({ length: height }, () => Array(width).fill(''));

export default validateMap({
  id: 'cave',
  name: 'A CAVERN',
  mist: 0,
  wind: [0.04, 300],
  width,
  height,
  ground,
  props,
  blocks: [],
  objects: [],
  spawns: {
    'from-mouth': { x: 9, y: 9, face: 'up' },
  },
  exits: [{ x: 9, y: 10, w: 2, h: 1, to: 'undiscovered', spawn: 'from-road' }],
  marks: {
    daedalus: { x: 9, y: 5 },
  },
});
