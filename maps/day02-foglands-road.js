// The Foglands road from Day 2 on (GAME-PLAN-DAYS §B Day 2 beat 5): Day 1's road with a track
// forking south past the conifers, at x 44–45, to Alabaster Brown's vineyard, and a sign.
import { validateMap } from './grid.js';
import road from './foglands-road.js';

const ground = road.ground.map((row) => row.slice());
const props = road.props.map((row) => row.slice());
ground[7][44] = 'dirt-road';
ground[7][45] = 'dirt-road';
for (let y = 8; y < road.height; y++) {
  ground[y][44] = 'dirt-road-w';
  ground[y][45] = 'dirt-road-e';
}
for (let y = 7; y < road.height; y++) for (let x = 43; x <= 46; x++) props[y][x] = '';
props[8][46] = 'sign-post';

export default validateMap({
  ...road,
  from: 2,
  ground,
  props,
  spawns: { ...road.spawns, 'from-vineyard': { x: 44, y: 8, face: 'up' } },
  exits: [...road.exits, { x: 44, y: 11, w: 2, h: 1, to: 'vineyard', spawn: 'from-road' }],
});
