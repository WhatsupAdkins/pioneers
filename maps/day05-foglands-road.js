// The Foglands road from Day 5 on (GAME-PLAN-DAYS §B Day 5 beat 2): Day 2's road (with the
// vineyard track south) and a second track forking north at x 8–9, through a gap in the
// field fence, to Verdant Valley, with a sign.
import { validateMap } from './grid.js';
import road from './day02-foglands-road.js';

const ground = road.ground.map((row) => row.slice());
const props = road.props.map((row) => row.slice());
ground[4][8] = 'dirt-road';
ground[4][9] = 'dirt-road';
for (let y = 0; y < 4; y++) {
  ground[y][8] = 'dirt-road-w';
  ground[y][9] = 'dirt-road-e';
}
for (let y = 0; y < 4; y++) for (let x = 7; x <= 10; x++) props[y][x] = '';
props[3][7] = 'fence-post';
props[3][10] = 'fence-post';
props[2][11] = 'sign-post';

export default validateMap({
  ...road,
  from: 5,
  ground,
  props,
  spawns: { ...road.spawns, 'from-valley': { x: 8, y: 3, face: 'down' } },
  exits: [...road.exits, { x: 8, y: 0, w: 2, h: 1, to: 'verdant-valley', spawn: 'from-road' }],
});
