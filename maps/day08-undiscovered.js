// Southwestern Undiscovered Friendship on Day 8 (GAME-PLAN-DAYS §B Day 8 beat 4): 64×40 of
// sere land. Two roads of businesses "too large, anachronistic, or aesthetically inappropriate
// to be contained downtown": ranches, an aviary, a nursery, pianos, a spa, a museum of old
// technology, amusements, explosives along the north road; a ranch, the padlocked gate of the
// horse breaker, the arcade and a casino along the south road. North, the mountain, ringed by
// a track; the cave's mouth opens at one of three places on its rock face (`cave-0…2`), chosen
// by game/script/day08.js. The road east goes back to the Foglands road.
// Day 12 (Run 7) has its own version of this place, with the breaker's gate elsewhere.
import { validateMap } from './grid.js';

const width = 64;
const height = 40;
const ground = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => ((x * 7 + y * 13) % 5 === 0 ? 'sere-b' : 'sere-a')));
const props = Array.from({ length: height }, () => Array(width).fill(''));
const fill = (x0, y0, w, h, name) => {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) ground[y][x] = name;
};

// the mountain, its snowy crown and the face along its foot
export const mountain = { x: 18, y: 4, w: 28, h: 12 };
fill(mountain.x, mountain.y, mountain.w, mountain.h, 'mountain-rock');
fill(28, 7, 8, 4, 'mountain-snow');
fill(mountain.x, mountain.y + mountain.h - 1, mountain.w, 1, 'mountain-face');
// the track round it, and down to the north road. On the track Emily goes on foot ("She
// dismounted her horse"): game/script/day08.js gets her down when she steps onto it and Pixel
// waits at `marks.hitch`, beside the spur where it meets the track.
export const track = { x: 16, y: 2, w: 32, h: 16 };
fill(16, 2, 32, 2, 'dirt-road');
fill(16, 16, 32, 2, 'dirt-road');
fill(16, 2, 2, 16, 'dirt-road');
fill(46, 2, 2, 16, 'dirt-road');
fill(30, 18, 2, 11, 'dirt-road');
// the north road (to the Foglands road, east) and the south road, joined at the east
fill(0, 29, 64, 2, 'dirt-road');
fill(0, 37, 62, 2, 'dirt-road');
fill(60, 31, 2, 6, 'dirt-road');

for (const [x, y, name] of [
  [3, 3, 'rock-cluster'], [8, 12, 'rock-small'], [11, 6, 'rock-cluster'], [5, 20, 'rock-small'], [12, 18, 'rock-cluster'],
  [52, 6, 'rock-small'], [57, 12, 'rock-cluster'], [53, 19, 'rock-small'], [60, 3, 'rock-cluster'], [39, 21, 'rock-small'],
  [24, 21, 'rock-cluster'], [2, 34, 'rock-small'], [22, 35, 'rock-cluster'], [33, 33, 'rock-small'], [55, 34, 'rock-cluster'],
]) props[y][x] = name;

// Storefronts: [block, x] on the north road (y 25) and the south road (y 33). Each door is
// the two middle cells of the block's bottom row, as at the Mercantile.
const north = [['shop-ranch', 1], ['shop-aviary', 6], ['shop-nursery', 11], ['shop-pianos', 16], ['shop-spa', 21],
  ['shop-museum', 35], ['shop-amusements', 43], ['shop-explosives', 48], ['shop-ranch', 53]];
const south = [['shop-ranch', 3], ['shop-arcade', 40], ['shop-casino', 46]];
const shops = [...north.map(([name, x]) => ({ name, x, y: 25 })), ...south.map(([name, x]) => ({ name, x, y: 33 }))];
const doors = shops.map(({ name, x, y }, i) => ({ id: `door-${name.slice(5)}${name === 'shop-ranch' ? `-${i}` : ''}`, x: x + 1, y: y + 3, w: 2, h: 1, type: 'door', shop: name.slice(5) }));

// the three places the cave's mouth may open, each a rock tile beside the track
export const caveSpots = [
  { id: 'cave-0', x: 24, y: 15, w: 1, h: 1, type: 'cave', approach: { x: 24, y: 16, face: 'up' } },
  { id: 'cave-1', x: 18, y: 9, w: 1, h: 1, type: 'cave', approach: { x: 17, y: 9, face: 'right' } },
  { id: 'cave-2', x: 40, y: 4, w: 1, h: 1, type: 'cave', approach: { x: 40, y: 3, face: 'down' } },
];

export default validateMap({
  id: 'undiscovered',
  from: 8,
  name: 'UNDISCOVERED FRIENDSHIP',
  mist: 0.08,
  wind: [0.12, 380],
  width,
  height,
  ground,
  props,
  blocks: [
    ...shops,
    { name: 'museum-billboard', x: 32, y: 23 },
    { name: 'breaker-gate', x: 10, y: 34 },
    { name: 'bare-tree', x: 6, y: 8 },
    { name: 'bare-tree', x: 55, y: 9 },
    { name: 'bare-tree', x: 9, y: 21 },
    { name: 'bare-tree', x: 50, y: 20 },
  ],
  objects: [
    ...doors,
    { id: 'breaker-gate', x: 12, y: 36, w: 4, h: 1, type: 'gate' },
    ...caveSpots,
  ],
  spawns: {
    'from-road': { x: 61, y: 29, face: 'left' },
  },
  exits: [{ x: 63, y: 29, w: 1, h: 2, to: 'foglands-road', spawn: 'from-undiscovered' }],
  marks: {
    seersucker: { x: 44, y: 37 }, // outside the arcade
    hitch: { x: 28, y: 18 }, // where Pixel waits while Emily walks the track (west of the spur, facing it)
  },
});
