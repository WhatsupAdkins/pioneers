// Friendship Books from Day 7 on: Day 3's store with the Xyzzy portal on the back wall, right
// of the shelves (Day 6 brings it, game/world/day06.js portalSpots.store; from here on it is
// part of the room). It goes to the farmhouse at Upper Foglands.
import { validateMap } from './grid.js';
import store from './day03-store.js';

export const portalAt = { x: 10, y: 0 };

export default validateMap({
  ...store,
  from: 7,
  blocks: [...store.blocks, { name: 'portal', ...portalAt }],
  objects: [...store.objects, { id: 'portal', x: portalAt.x, y: portalAt.y + 1, w: 1, h: 1, type: 'portal' }],
  spawns: { ...store.spawns, portal: { x: portalAt.x, y: portalAt.y + 2, face: 'down' } },
});
