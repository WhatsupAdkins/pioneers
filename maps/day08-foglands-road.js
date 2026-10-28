// The Foglands road on Day 8 (GAME-PLAN-DAYS §B Day 8): Day 5's road (the vineyard track
// south, the Verdant Valley track north at x 8–9) with one more fork: south, near town, a road
// Emily has never taken, to southwestern Undiscovered Friendship. (The track to Eidetic
// Bluffs forks off the valley road, maps/day08-valley-road.js.)
import { validateMap } from './grid.js';
import road from './day05-foglands-road.js';

const ground = road.ground.map((row) => row.slice());
const props = road.props.map((row) => row.slice());
// south: x 4–5, from the road (y 7) to the edge
for (let y = 8; y < road.height; y++) {
  ground[y][4] = 'dirt-road-w';
  ground[y][5] = 'dirt-road-e';
  props[y][4] = '';
  props[y][5] = '';
}
props[8][3] = 'fence-post';
props[8][6] = 'fence-post';

export default validateMap({
  ...road,
  from: 8,
  ground,
  props,
  spawns: {
    ...road.spawns,
    'from-undiscovered': { x: 4, y: 9, face: 'up' },
  },
  exits: [
    ...road.exits,
    { x: 4, y: 11, w: 2, h: 1, to: 'undiscovered', spawn: 'from-road' },
  ],
});
