// The valley road on Day 8 (GAME-PLAN-DAYS §B Day 8 beat 2): Day 5's road with a track forking
// north near its east end, through the frost, to Eidetic Bluffs. The Bluffs get no map: the
// gate is the map's edge and its sign (the `bluffs-gate` exit is handled by
// game/script/day08.js). From the Foglands the way is the Foglands road west, the Verdant
// Valley track north, through the valley, and east along this road; it comes out at home.
import { validateMap } from './grid.js';
import road from './day05-valley-road.js';

export const forkX = 47;
const ground = road.ground.map((row) => row.slice());
const props = road.props.map((row) => row.slice());
ground[4][forkX] = 'dirt-road';
ground[4][forkX + 1] = 'dirt-road';
for (let y = 0; y < 4; y++) {
  ground[y][forkX] = 'dirt-road-w';
  ground[y][forkX + 1] = 'dirt-road-e';
  for (let x = forkX - 1; x <= forkX + 2; x++) props[y][x] = '';
}
props[3][forkX - 1] = 'fence-post';
props[3][forkX + 2] = 'fence-post';
props[1][forkX + 2] = 'sign-post';

export default validateMap({
  ...road,
  from: 8,
  ground,
  props,
  objects: [...road.objects, { id: 'bluffs-sign', x: forkX + 2, y: 1, w: 1, h: 1, type: 'sign' }],
  spawns: { ...road.spawns, 'from-bluffs': { x: forkX, y: 2, face: 'down' } },
  exits: [...road.exits, { x: forkX, y: 0, w: 2, h: 1, to: 'bluffs-gate', spawn: 'from-bluffs' }],
});
