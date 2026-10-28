// Myre Farm from Day 3 on: Day 2's farm with the ledger on its little desk beside the porch
// steps (GAME-PLAN-DAYS §B Day 3 beat 2), where Emily sells her equipment, rents the land to
// Alabaster and pays for the store. `by-pixel` is where Emily gets down after riding straight
// from town (game/script/fast-ride.js), beside Pixel's hitch.
import { validateMap } from './grid.js';
import farm from './day02-foglands-farm.js';

export const ledgerAt = { x: 15, y: 9 };
const props = farm.props.map((row) => row.slice());
props[ledgerAt.y][ledgerAt.x] = 'ledger';

export default validateMap({
  ...farm,
  from: 3,
  props,
  objects: [...farm.objects, { id: 'ledger', ...ledgerAt, w: 1, h: 1, type: 'ledger' }],
  spawns: { ...farm.spawns, 'by-pixel': { x: 20, y: 9, face: 'right' } },
});
