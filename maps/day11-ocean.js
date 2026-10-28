// The ocean of Day 11 (GAME-PLAN-DAYS §B Day 11), 220×12: ten screens of grey sea west of a
// strip of sand, and at the far west the end of the ocean, a wall of nothing (`end-void`).
// One screen is 20 tiles (game/transitions.js). Screen 1 is x 180–199 next to the shore
// (x 200); screen 10 is x 0–19, where the fog thickens (game/world/day11.js) and the void
// stands at x 0–2, behind two columns of Day 7's fog wall (x 4–5). LQ and Emily start on the
// sand. The `end` trigger sits just short of the void. Rows are generated (a sea has no
// landmarks); the tiles are in art/days/day11.js. Same id as Day 7's sea (maps/day07-ocean.js,
// from 7): this version replaces it from Day 11 on.
import { validateMap } from './grid.js';

const width = 220;
const height = 12;
export const shoreX = 200;
export const screenWidth = 20;

// Screens out from the shore: 0 on the sand, 1 just off it, 10 at the end.
export const screenOf = (x) => (x >= shoreX ? 0 : 1 + Math.floor((shoreX - 1 - x) / screenWidth));

const ground = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
  if (x <= 2) return 'end-void';
  if (x === 3) return 'end-void-edge';
  if (x <= 5) return 'fog-wall';
  if (x < shoreX) return (x * 7 + y * 5) % 11 < 4 ? 'grey-sea-b' : 'grey-sea-a';
  if (x === shoreX) return 'grey-shore';
  return 'grey-sand';
}));

const props = Array.from({ length: height }, () => Array(width).fill(''));
for (const [x, y] of [[206, 1], [213, 3], [209, 9], [216, 7], [218, 10], [211, 0]]) props[y][x] = 'rock-small';
props[5][217] = 'rock-cluster';

export default validateMap({
  id: 'ocean',
  from: 11,
  name: 'THE OCEAN',
  mist: 0.06,
  wind: [0.1, 380],
  width,
  height,
  ground,
  props,
  blocks: [],
  objects: [
    { id: 'end', x: 4, y: 0, w: 3, h: height, type: 'trigger' },
  ],
  spawns: {
    shore: { x: 204, y: 6, face: 'left' },
    'lq-shore': { x: 202, y: 6, face: 'right' },
  },
  exits: [],
  marks: {
    endBeside: { x: 5, y: 5 }, // where LQ comes up beside Emily at the end
  },
});
