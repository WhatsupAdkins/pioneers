// Dr. Daedalus's library (GAME-PLAN-DAYS §B Day 5 beat 2): a 12×8 room (x 4–15, y 2–9) in a
// 20×12 map so it fills the view; the rest is dark. Wallpaper printed with oriental waves,
// two bookshelves, a tea table, and the Go table in the middle: the doctor sits north of it,
// Emily south. The mat at the foot is the way out.
import { decodeGrid, validateMap } from './grid.js';

const groundLegend = { vd: 'dh-void', wt: 'dh-wall-top', wl: 'dh-wall', fl: 'dh-floor', mt: 'dh-mat' };
const propLegend = { '..': '', te: 'dh-tea' };

const width = 20;
const height = 12;
const room = (row) => `vd vd vd vd ${row} vd vd vd vd`;
const groundRows = [
  'vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd',
  'vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd',
  room('wt wt wt wt wt wt wt wt wt wt wt wt'),
  room('wl wl wl wl wl wl wl wl wl wl wl wl'),
  room('fl fl fl fl fl fl fl fl fl fl fl fl'),
  room('fl fl fl fl fl fl fl fl fl fl fl fl'),
  room('fl fl fl fl fl fl fl fl fl fl fl fl'),
  room('fl fl fl fl fl fl fl fl fl fl fl fl'),
  room('fl fl fl fl fl fl fl fl fl fl fl fl'),
  room('fl fl fl fl fl mt mt fl fl fl fl fl'),
  'vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd',
  'vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd vd',
];
const blank = '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..';
const propRows = [blank, blank, blank, blank,
  blank,
  '.. .. .. .. .. .. te .. .. .. .. .. .. .. .. .. .. .. .. ..',
  blank, blank, blank, blank, blank, blank];

export default validateMap({
  id: 'daedalus-house',
  from: 5,
  name: 'VERDANT VALLEY',
  mist: 0,
  wind: [0.02, 300],
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'daedalus-house ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'daedalus-house props'),
  blocks: [
    { name: 'dh-shelf', x: 5, y: 2 },
    { name: 'dh-shelf', x: 12, y: 2 },
    { name: 'dh-go-table', x: 9, y: 5 },
  ],
  objects: [
    { id: 'go-table', x: 9, y: 6, w: 2, h: 1, type: 'table' },
    { id: 'tea', x: 6, y: 5, w: 1, h: 1, type: 'prop' },
    { id: 'shelf', x: 12, y: 3, w: 2, h: 1, type: 'prop' },
  ],
  spawns: {
    table: { x: 9, y: 7, face: 'up' },
    'from-door': { x: 9, y: 8, face: 'up' },
  },
  exits: [{ x: 9, y: 9, w: 2, h: 1, to: 'verdant-valley', spawn: 'door' }],
  marks: {
    seat: { x: 9, y: 4 }, // the doctor's side of the board
  },
});
