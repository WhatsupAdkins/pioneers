// Dr. Daedalus's library from Day 7 on: Day 5's room with two things in its back wall. The
// door to her bedroom (Day 9 opens there, maps/day09-bedroom.js), and the portal "between
// their houses" (L7.02), whose other end stands beside the farmhouse at Upper Foglands.
import { validateMap } from './grid.js';
import house from './day05-daedalus-house.js';

export const bedroomDoor = { x: 8, y: 2 }; // the block's top tile; Emily faces (8, 3) from (8, 4)
export const portalAt = { x: 14, y: 2 };

export default validateMap({
  ...house,
  from: 7,
  blocks: [
    ...house.blocks,
    { name: 'dh-door', ...bedroomDoor },
    { name: 'portal', ...portalAt },
  ],
  objects: [
    ...house.objects,
    { id: 'bedroom-door', x: bedroomDoor.x, y: bedroomDoor.y + 1, w: 1, h: 1, type: 'door' },
    { id: 'portal-house', x: portalAt.x, y: portalAt.y + 1, w: 1, h: 1, type: 'portal' },
  ],
  spawns: {
    ...house.spawns,
    'from-bedroom': { x: bedroomDoor.x, y: bedroomDoor.y + 2, face: 'down' },
    'portal-house': { x: portalAt.x, y: portalAt.y + 2, face: 'down' },
  },
});
