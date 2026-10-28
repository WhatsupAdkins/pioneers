// Friendship from Day 4 on: Day 3's town with Friendship Books, Stationery, & Games standing on
// the lot (the book's outcome of Day 3). game/script/day04.js lays the plain FRIENDSHIP BOOKS
// front over it when Emily kept to books on Day 3.
import { validateMap } from './grid.js';
import town, { lot } from './day03-friendship.js';

export default validateMap({
  ...town,
  from: 4,
  blocks: [...town.blocks, { name: 'friendship-books-etc', ...lot }],
});
