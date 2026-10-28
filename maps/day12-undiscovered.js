// Undiscovered Friendship on Day 12 (GAME-PLAN-DAYS §B Day 12 beat 2): Day 8's place
// (maps/day08-undiscovered.js), in autumn, years on. Where the blizzard search found the
// padlocked gate of BREAKER OF HORSES, on the south road (x 10–17, y 34–36), there is only a
// plain fence and an empty sign-post now. The gate stands somewhere else: north-west, behind
// the mountain, at the end of a spur off the track that rings it, so the way there doubles
// back (anfractuous, the book says). Emily comes in from the Foglands road at the east, as on
// Day 8; that way is not a way out today (`way-back`, a toast).
import { validateMap } from './grid.js';
import wild from './day08-undiscovered.js';

const day8Gate = wild.objects.find((object) => object.id === 'breaker-gate'); // x 12–15, y 36
export const oldFence = { x: 10, y: 36, w: 8 };
export const gateAt = { x: 6, y: 0 }; // the ranch-gate block, 8×3; its opening is x 7–12

const ground = wild.ground.map((row) => row.slice());
const props = wild.props.map((row) => row.slice());
const road = (x0, y0, w, h) => {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) ground[y][x] = 'dirt-road';
};
road(8, 2, 8, 2); // the spur west off the track round the mountain
road(8, 0, 3, 2); // and up through the gate
props[3][3] = ''; // a rock where the spur runs out

for (let x = oldFence.x; x < oldFence.x + oldFence.w; x++) props[oldFence.y][x] = 'fence-h';
props[oldFence.y][oldFence.x - 1] = 'sign-post';

export default validateMap({
  ...wild,
  from: 12,
  ground,
  props,
  blocks: [
    ...wild.blocks.filter((block) => block.name !== 'breaker-gate'),
    { name: 'ranch-gate', ...gateAt },
  ],
  objects: [
    ...wild.objects.filter((object) => object !== day8Gate && object.type !== 'cave'),
    { id: 'old-fence', x: oldFence.x - 1, y: oldFence.y, w: oldFence.w + 1, h: 1, type: 'look' },
    { id: 'way-back', x: 63, y: 29, w: 1, h: 2, type: 'trigger' },
  ],
  spawns: {
    'from-road': { x: 61, y: 29, face: 'left' },
    'from-ranch': { x: 9, y: 3, face: 'down' },
  },
  exits: [{ x: gateAt.x + 2, y: gateAt.y, w: 3, h: 1, to: 'ranch', spawn: 'gate' }],
  marks: {
    gate: { x: gateAt.x + 3, y: gateAt.y + 1 },
    day8Gate: { x: day8Gate.x, y: day8Gate.y },
  },
});
