// The ocean off Myre Farm (GAME-PLAN-DAYS §B Day 7): 200×12, ten screens of open water west of
// the shore steps, thickening into fog, and at the far west the fog wall: "a sort of fog, and
// then a nothingness that is like a wall". Emily swims west from the east edge; a screen is
// 20 tiles (game/script/day07.js counts them from the shore).
import { validateMap } from './grid.js';

const width = 200;
const height = 12;
const ground = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
  if (x <= 1) return 'fog-wall';
  if (x === width - 1) return 'shore-steps';
  return (x * 7 + y * 3) % 5 === 0 ? 'water-deep-b' : 'water-deep-a';
}));
const props = Array.from({ length: height }, () => Array(width).fill(''));

export default validateMap({
  id: 'ocean',
  from: 7,
  name: 'THE OCEAN',
  mist: [0.75, 0.05], // fog thickens toward the end of the sea
  wind: [0.12, 420],
  width,
  height,
  ground,
  props,
  blocks: [],
  objects: [],
  spawns: {
    'from-shore': { x: 197, y: 6, face: 'left' },
  },
  exits: [{ x: 199, y: 0, w: 1, h: 12, to: 'foglands', spawn: 'from-shore' }],
});
