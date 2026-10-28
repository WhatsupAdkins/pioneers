// Friendship from Day 3 on (GAME-PLAN-DAYS §B Day 3): Day 1's town with the open lot built up.
// West to east along the north side of the square: the lot where Emily builds Friendship
// Books (x 21–24; the block is placed by game/script/day03.js once she builds it), two narrow
// townhouses, and Dr. Daedalus's optometry (x 29–32), three doors down from the bookstore.
// The optometry and the townhouses have stood there all along (maps/friendship.js draws them
// from Day 1, without doors); on Day 3 its door does nothing, because Emily has not noticed it
// yet (Alabaster, L3.40). Day 1's Editor trigger is gone.
import { validateMap } from './grid.js';
import town from './friendship.js';

export const lot = { x: 21, y: 8 }; // Friendship Books, 4×4
export const optometryAt = { x: 29, y: 8 };

const props = town.props.map((row) => row.slice());
for (let x = 21; x <= 32; x++) props[8][x] = ''; // the lot's fence comes down

export const objects = [
  ...town.objects.filter((object) => object.id !== 'editor-intercept'),
  { id: 'store-door', x: 22, y: 11, w: 2, h: 1, type: 'door' },
  { id: 'optometry-door', x: 30, y: 11, w: 2, h: 1, type: 'door' },
];

export const spawns = {
  ...town.spawns,
  'from-store': { x: 22, y: 12, face: 'down' },
  'from-optometry': { x: 30, y: 12, face: 'down' },
  'optometry-porch': { x: 32, y: 12, face: 'left' },
};

export const blocks = town.blocks;

export default validateMap({
  ...town,
  from: 3,
  props,
  blocks,
  objects,
  spawns,
  marks: {
    lot,
    porchBag: { x: 32, y: 11 }, // the sack of rocks on the optometry's porch (Day 4)
  },
});
