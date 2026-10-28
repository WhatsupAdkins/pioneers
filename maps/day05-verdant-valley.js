// Verdant Valley (GAME-PLAN-DAYS §B Day 5 beat 2): 28×16, north off the Foglands road. Dr.
// Daedalus's Spanish-style house at the head of the track, a skinny palm either side of its
// front and bougainvillea at the corners; other farmhouses and their fields close by
// ("disgustingly crowded", Alabaster says on Day 6). The track comes up from the south; a
// second road runs east, the long way to the Foglands (maps/day05-valley-road.js).
import { decodeGrid, validateMap } from './grid.js';

const groundLegend = {
  g1: 'grass-a', g2: 'grass-b', rd: 'dirt-road', rw: 'dirt-road-w', re: 'dirt-road-e',
  rn: 'dirt-road-n', rs: 'dirt-road-s', ff: 'vv-field',
};

const propLegend = {
  '..': '', fh: 'fence-h', fp: 'fence-post', fv: 'fence-v', bo: 'vv-bougainvillea', rk: 'rock-small', sp: 'sign-post',
};

const width = 28;
const height = 16;

const groundRows = [
  'g2 g1 g2 g1 g1 g2 g1 g1 g1 g2 g1 g1 g1 g1 g2 g1 g1 g1 g2 g1 g1 g2 g1 g1 g1 g2 g1 g1',
  'g1 g1 g1 g2 g1 g1 g1 g2 g1 g1 g1 g2 g1 g1 g1 g1 g2 g1 g1 g1 g2 g1 g1 g1 g2 g1 g1 g2',
  'g1 g2 g1 g1 g1 g1 g2 g1 g1 g1 g2 g1 g1 g2 g1 g1 g1 g1 g1 g2 g1 g1 g1 g2 g1 g1 g1 g1',
  'g1 g1 g1 g1 g2 g1 g1 g1 g2 g1 g1 g1 g1 g1 g1 g2 g1 g1 g2 g1 g1 g1 g1 g1 g1 g2 g1 g1',
  'g2 g1 g1 g2 g1 g1 g1 g1 g1 g1 g1 g1 g1 g1 g1 g1 g1 g2 g1 g1 g1 g1 g2 g1 g1 g1 g1 g2',
  'g1 g1 g2 g1 g1 g1 g2 g1 g1 g1 g1 g1 g1 g1 g1 g1 g1 g1 g1 g1 g2 g1 g1 g1 g1 g1 g2 g1',
  'g1 g2 g1 g1 g1 g2 g1 g1 g1 g2 g1 g1 g1 g1 g1 g1 g2 g1 g1 g1 g1 g1 g1 g1 g2 g1 g1 g1',
  'g1 g1 g1 g2 g1 g1 g1 g1 g1 g1 g1 g1 rw re g1 g1 g1 g1 g2 g1 g1 g2 g1 g1 g1 g1 g1 g1',
  'g2 g1 g1 g1 g1 g1 g2 g1 g1 g1 g1 g1 rw rd rn rn rn rn rn rn rn rn rn rn rn rn rn rn',
  'g1 g1 g2 g1 g2 g1 g1 g1 g2 g1 g1 g1 rw rd rs rs rs rs rs rs rs rs rs rs rs rs rs rs',
  'g1 ff ff ff ff ff ff ff g1 g1 g2 g1 rw re g1 g1 g1 g2 g1 g1 g1 g1 g1 g1 g1 g1 g2 g1',
  'g1 ff ff ff ff ff ff ff g1 g1 g1 g1 rw re g1 g1 g1 g1 ff ff ff ff ff ff ff ff g1 g1',
  'g2 ff ff ff ff ff ff ff g1 g2 g1 g1 rw re g1 g1 g2 g1 ff ff ff ff ff ff ff ff g1 g2',
  'g1 ff ff ff ff ff ff ff g1 g1 g1 g1 rw re g1 g1 g1 g1 ff ff ff ff ff ff ff ff g1 g1',
  'g1 g1 g2 g1 g1 g1 g2 g1 g1 g1 g1 g2 rw re g1 g1 g1 g1 ff ff ff ff ff ff ff ff g1 g1',
  'g2 g1 g1 g1 g2 g1 g1 g1 g1 g2 g1 g1 rw re g1 g2 g1 g1 g1 g1 g2 g1 g1 g1 g1 g1 g1 g2',
];

const propRows = [
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. bo .. .. .. .. .. .. .. .. bo .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  'fp fh fh fh fh fh fh fh fp .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. sp .. .. ..',
  'fv .. .. .. .. .. .. .. fv .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..',
  'fv .. .. .. .. .. .. .. fv .. .. .. .. .. .. .. .. fp fh fh fh fh fh fh fh fh fp ..',
  'fv .. .. .. .. .. .. .. fv .. .. .. .. .. .. .. .. fv .. .. .. .. .. .. .. .. fv ..',
  'fv .. .. .. .. .. .. .. fv .. .. .. .. .. .. .. .. fv .. .. .. .. .. .. .. .. fv ..',
  'fp fh fh fh fh fh fh fh fp .. .. .. .. .. .. rk .. fv .. .. .. .. .. .. .. .. fv ..',
  '.. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. fp fh fh fh fh fh fh fh fh fp ..',
];

export default validateMap({
  id: 'verdant-valley',
  from: 5,
  name: 'VERDANT VALLEY',
  mist: 0.04,
  wind: [0.05, 420],
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'verdant-valley ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'verdant-valley props'),
  blocks: [
    { name: 'conifer', x: -1, y: 1 },
    { name: 'conifer', x: 26, y: 0 },
    { name: 'conifer', x: 7, y: -1 },
    { name: 'farmhouse', x: 2, y: 4 },
    { name: 'cabin', x: 20, y: 3 },
    { name: 'vv-house', x: 10, y: 3 },
    { name: 'vv-palm', x: 9, y: 4 },
    { name: 'vv-palm', x: 16, y: 4 },
  ],
  objects: [
    { id: 'house-door', x: 12, y: 6, w: 2, h: 1, type: 'door' },
    { id: 'valley-sign', x: 24, y: 9, w: 1, h: 1, type: 'sign' },
    { id: 'arrive', x: 11, y: 10, w: 4, h: 1, type: 'trigger' },
  ],
  spawns: {
    'from-road': { x: 12, y: 14, face: 'up' },
    door: { x: 12, y: 7, face: 'down' },
    'from-valley-road': { x: 26, y: 8, face: 'left' },
  },
  exits: [
    { x: 12, y: 15, w: 2, h: 1, to: 'foglands-road', spawn: 'from-valley' },
    { x: 27, y: 8, w: 1, h: 2, to: 'valley-road', spawn: 'from-valley' },
  ],
  marks: {
    doorway: { x: 13, y: 7 }, // where the doctor waits
    hitch: { x: 14, y: 12 }, // Pixel, by the track
  },
});
