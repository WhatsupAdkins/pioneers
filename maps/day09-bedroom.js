// Dr. Daedalus's bedroom (GAME-PLAN-DAYS §B Day 9 beat 1): a 10×8 room inside a 20×12 map
// (the dark around it fills the view). The bed against the back wall, the nightstand beside
// it, an armchair under the window (Rest), and the door in the front wall, bottom right.
// The Go table starts by the bed and stands one tile nearer the door each afternoon:
// placeTable() moves it (props and the table object) before the map is built again.
// The room is in Dr. Daedalus's house in Verdant Valley: its door opens into her library
// (maps/day07-daedalus-house.js), whose back-wall door leads back in.
import { decodeGrid, validateMap } from './grid.js';

const groundLegend = {
  vo: 'bedroom-void', cp: 'bedroom-cap', wt: 'bedroom-wall-top', wi: 'bedroom-window', ws: 'bedroom-wainscot',
  fa: 'bedroom-floor-a', fb: 'bedroom-floor-b', dr: 'bedroom-door',
};

const propLegend = { '..': '', ns: 'nightstand', ac: 'armchair' };

const width = 20;
const height = 12;

const groundRows = [
  'vo vo vo vo cp cp cp cp cp cp cp cp cp cp cp cp vo vo vo vo',
  'vo vo vo vo cp wt wt wt wi wt wt wt wi wt wt cp vo vo vo vo',
  'vo vo vo vo cp ws ws ws ws ws ws ws ws ws ws cp vo vo vo vo',
  'vo vo vo vo cp fa fb fa fa fb fa fa fb fa fa cp vo vo vo vo',
  'vo vo vo vo cp fb fa fa fb fa fa fb fa fa fb cp vo vo vo vo',
  'vo vo vo vo cp fa fa fb fa fa fb fa fa fb fa cp vo vo vo vo',
  'vo vo vo vo cp fa fb fa fa fb fa fa fb fa fa cp vo vo vo vo',
  'vo vo vo vo cp fb fa fa fb fa fa fb fa fa fb cp vo vo vo vo',
  'vo vo vo vo cp fa fa fb fa fa fb fa fa fb fa cp vo vo vo vo',
  'vo vo vo vo cp fa fb fa fa fb fa fa fb fa fa cp vo vo vo vo',
  'vo vo vo vo cp cp cp cp cp cp cp cp dr cp cp cp vo vo vo vo',
  'vo vo vo vo vo vo vo vo vo vo vo vo vo vo vo vo vo vo vo vo',
];

const propRows = [
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. ns .. .. .. .. .. .. ac .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
];

// Where the Go table stands after n afternoons: beside the bed, then one tile at a time
// toward the door (12, 10). From the fourth afternoon on it stays at the last spot.
export const tableSpots = [{ x: 6, y: 4 }, { x: 7, y: 5 }, { x: 8, y: 6 }, { x: 9, y: 7 }];
export const tableSpot = (afternoons) => tableSpots[Math.min(Math.max(0, afternoons), tableSpots.length - 1)];

const map = validateMap({
  id: 'bedroom',
  from: 9,
  name: 'DR. DAEDALUS',
  mist: 0,
  wind: [0.02, 300],
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'bedroom ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'bedroom props'),
  blocks: [{ name: 'bed', x: 5, y: 3 }],
  objects: [
    { id: 'bed', x: 5, y: 3, w: 1, h: 2, type: 'bed' },
    { id: 'go-table', ...tableSpots[0], w: 1, h: 1, type: 'board' },
    { id: 'armchair', x: 13, y: 3, w: 1, h: 1, type: 'rest' },
    { id: 'nightstand', x: 6, y: 3, w: 1, h: 1, type: 'look' },
    { id: 'window', x: 8, y: 2, w: 1, h: 1, type: 'look' },
    { id: 'window-east', x: 12, y: 2, w: 1, h: 1, type: 'look' },
  ],
  spawns: {
    bedside: { x: 7, y: 4, face: 'left' },
    chair: { x: 13, y: 4, face: 'up' },
    'from-door': { x: 12, y: 9, face: 'up' },
  },
  exits: [{ x: 12, y: 10, w: 1, h: 1, to: 'daedalus-house', spawn: 'from-bedroom' }],
  marks: {
    daedalusOut: { x: 5, y: 5 }, // where she steps out of bed
  },
});

// Puts the table at its spot for `afternoons`: the prop on the grid and the object Emily uses.
export function placeTable(afternoons) {
  const spot = tableSpot(afternoons);
  for (const { x, y } of tableSpots) map.props[y][x] = '';
  map.props[spot.y][spot.x] = 'go-table';
  Object.assign(map.objects.find((object) => object.id === 'go-table'), spot);
  return spot;
}
placeTable(0);

export default map;
