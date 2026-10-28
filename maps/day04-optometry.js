// Dr. Daedalus's optometry inside (GAME-PLAN-DAYS §B Day 4): 12×8. The front room has the
// glass counter (spectacles on the wall behind it, the doctor between), a shelf of coloured
// glass, the menagerie table with the miniature azure horse, and a glass case; a partition with
// a gap at y 3 leads to the back office: the eye chart and the examination chair.
import { decodeGrid, validateMap } from './grid.js';

const groundLegend = {
  we: 'wall-edge', wp: 'wall-plaster', wl: 'wall-plaster-low', lw: 'lens-wall', ec: 'eye-chart',
  pt: 'partition', tf: 'tile-floor', di: 'door-in',
};
const propLegend = { '..': '', ch: 'exam-chair' };
const width = 12;
const height = 8;
const groundRows = [
  'we wp wp wp wp wp wp pt wp wp wp we',
  'we lw lw lw wl wl wl pt wl ec wl we',
  'we tf tf tf tf tf tf pt tf tf tf we',
  'we tf tf tf tf tf tf tf tf tf tf we',
  'we tf tf tf tf tf tf pt tf tf tf we',
  'we tf tf tf tf tf tf pt tf tf tf we',
  'we tf tf tf tf tf tf pt tf tf tf we',
  'we we we we we di di we we we we we',
];
const propRows = [
  '.. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. ch .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. ..',
  '.. .. .. .. .. .. .. .. .. .. .. ..',
];

export default validateMap({
  id: 'optometry',
  from: 4,
  name: 'DR. DAEDALUS, OPTOMETRY',
  mist: 0,
  wind: [0, 0],
  indoor: true,
  width,
  height,
  ground: decodeGrid(groundRows, groundLegend, width, height, 'optometry ground'),
  props: decodeGrid(propRows, propLegend, width, height, 'optometry props'),
  blocks: [
    { name: 'glass-shelf', x: 4, y: 0 },
    { name: 'optometry-counter', x: 1, y: 3 },
    { name: 'menagerie', x: 4, y: 3 },
    { name: 'glass-case', x: 3, y: 6 },
  ],
  objects: [
    { id: 'counter', x: 1, y: 4, w: 3, h: 1, type: 'counter' },
    { id: 'glass-horse', x: 4, y: 3, w: 2, h: 1, type: 'look' },
    { id: 'glass-case', x: 3, y: 6, w: 2, h: 1, type: 'look' },
    { id: 'glass-shelf', x: 4, y: 1, w: 2, h: 1, type: 'look' },
    { id: 'eye-chart', x: 9, y: 1, w: 1, h: 1, type: 'look' },
  ],
  spawns: {
    door: { x: 5, y: 6, face: 'up' },
    exam: { x: 9, y: 3, face: 'up' },
  },
  exits: [{ x: 5, y: 7, w: 2, h: 1, to: 'friendship', spawn: 'from-optometry' }],
  marks: {
    doctor: { x: 2, y: 2 }, // behind the counter
    patient: { x: 2, y: 5 }, // in front of it
    patientOut: [{ x: 5, y: 5 }, { x: 5, y: 7 }],
    doctorExam: { x: 10, y: 3 }, // beside the chair, with her flashlight
  },
});
