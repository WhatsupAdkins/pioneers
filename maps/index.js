// Registry of maps (GAME-PLAN §5, GAME-PLAN-DAYS §A): one line per map file. Day 1's three
// are the base; a later day's maps are maps/dayNN-<name>.js. A new version of an existing place
// keeps its id and sets `from: <day>` (maps/versions.js picks the latest that applies). To add
// maps, create the files and add (or uncomment) their lines; keep the blank lines between
// entries so branches merge cleanly. Look maps up with mapFor() from maps/versions.js.

export { default as friendship } from './friendship.js';

export { default as foglandsRoad } from './foglands-road.js';

export { default as foglands } from './foglands.js';

// Day 2
export { default as day02FoglandsRoad } from './day02-foglands-road.js';

export { default as day02FoglandsFarm } from './day02-foglands-farm.js';

export { default as day02Vineyard } from './day02-vineyard.js';

// Day 3
export { default as day03Friendship } from './day03-friendship.js';

export { default as day03Store } from './day03-store.js';

export { default as day03FoglandsFarm } from './day03-foglands-farm.js';

// Day 4
export { default as day04Friendship } from './day04-friendship.js';

export { default as day04Optometry } from './day04-optometry.js';

export { default as day04FoglandsFarm } from './day04-foglands-farm.js';

// Day 5
export { default as day05FoglandsRoad } from './day05-foglands-road.js';

export { default as day05VerdantValley } from './day05-verdant-valley.js';

export { default as day05DaedalusHouse } from './day05-daedalus-house.js';

export { default as day05ValleyRoad } from './day05-valley-road.js';

// Day 6: export { default as day06<Name> } from './day06-<name>.js';

// Day 7
export { default as day07FoglandsFarm } from './day07-foglands-farm.js';

export { default as day07Ocean } from './day07-ocean.js';

export { default as day07DaedalusHouse } from './day07-daedalus-house.js';

export { default as day07Store } from './day07-store.js';

// Day 8
export { default as day08FoglandsRoad } from './day08-foglands-road.js';

export { default as day08Undiscovered } from './day08-undiscovered.js';

export { default as day08Cave } from './day08-cave.js';

export { default as day08ValleyRoad } from './day08-valley-road.js';

// Day 9
export { default as day09Bedroom } from './day09-bedroom.js';

// Day 10: export { default as day10<Name> } from './day10-<name>.js';

// Day 11
export { default as day11Ocean } from './day11-ocean.js';

// Day 12
export { default as day12Undiscovered } from './day12-undiscovered.js';

export { default as day12Ranch } from './day12-ranch.js';

// Day 13
export { default as day13Cemetery } from './day13-cemetery.js';
