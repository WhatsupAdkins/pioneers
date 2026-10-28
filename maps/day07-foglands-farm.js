// Myre Farm from Day 7 on (GAME-PLAN-DAYS §B Day 7): Day 4's farm (the ledger, the workbench,
// the sequoia's stump) with what Day 6 left beside the house, the hedge maze and the Xyzzy
// portal to the store, plus the second portal "between their houses" (L7.02) to Dr.
// Daedalus's library; stone steps cut down the western cliff to the sea (the `shore`, where
// Emily takes LQ swimming); and the marks the later days use (LQ's cradle, where LQ and
// Daedalus stand, Daedalus's way out).
import { validateMap } from './grid.js';
import farm from './day04-foglands-farm.js';
import { mazeSpot, portalSpots } from '../game/world/day06.js';

const storePortal = portalSpots.foglands; // block (17, 7), object (17, 8), out (17, 9)
const housePortal = { block: { x: 19, y: 7 }, object: { x: 19, y: 8 }, out: { x: 19, y: 9 } };

const shore = { x: 4, y: 20 };
const ground = farm.ground.map((row) => row.slice());
ground[shore.y][shore.x] = 'shore-steps';

export default validateMap({
  ...farm,
  from: 7,
  ground,
  blocks: [
    ...farm.blocks,
    { name: 'hedge-maze', ...mazeSpot },
    { name: 'portal', ...storePortal.block },
    { name: 'portal', ...housePortal.block },
  ],
  objects: [
    ...farm.objects,
    { id: 'shore', ...shore, w: 1, h: 1, type: 'shore' },
    { id: 'portal', ...storePortal.object, w: 1, h: 1, type: 'portal' },
    { id: 'portal-house', ...housePortal.object, w: 1, h: 1, type: 'portal' },
  ],
  spawns: {
    ...farm.spawns,
    'from-shore': { x: 5, y: 20, face: 'right' },
    portal: { ...storePortal.out, face: 'down' },
    'portal-house': { ...housePortal.out, face: 'down' },
  },
  marks: {
    ...farm.marks,
    cradle: { x: 13, y: 9 }, // beside the porch steps
    lq: { x: 16, y: 11 }, // LQ at eight, waiting by the path
    lqShore: { x: 6, y: 20 }, // LQ beside the steps after a swim
    rider: { x: 18, y: 12 }, // Daedalus on her horse, Day 8
    riderPath: [{ x: 18, y: 17 }, { x: 31, y: 17 }], // and away down the road
  },
});
