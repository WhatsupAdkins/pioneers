// Myre Farm from Day 4 on (GAME-PLAN-DAYS §B Day 4): the workbench west of the porch; the
// sequoia felled to a stump (game/script/day04.js stands the whole tree over the stump until
// Emily cuts it); and the loose rocks of the farm made gatherable for Dr. Daedalus's white
// stones. Those rocks are drawn by the day that lets Emily pick them up, so later days find the
// ground cleared, as she left it.
import { validateMap } from './grid.js';
import farm from './day03-foglands-farm.js';

const props = farm.props.map((row) => row.slice());
export const rocks = [];
props.forEach((row, y) => row.forEach((name, x) => {
  if (name !== 'rock-small' && name !== 'rock-cluster') return;
  rocks.push({ id: `rock-${rocks.length}`, x, y, w: 1, h: 1, type: 'rock', count: name === 'rock-cluster' ? 2 : 1, tile: name });
  row[x] = '';
}));

export const sequoiaAt = { x: 6, y: 5 };

export default validateMap({
  ...farm,
  from: 4,
  props,
  blocks: [
    ...farm.blocks.map((block) => (block.name === 'sequoia' ? { name: 'sequoia-stump', ...sequoiaAt } : block)),
    { name: 'workbench', x: 11, y: 9 },
  ],
  objects: [
    ...farm.objects,
    { id: 'workbench', x: 11, y: 9, w: 2, h: 1, type: 'workbench' },
    ...rocks.map(({ tile, ...object }) => object),
  ],
});
