// The thirteen days (GAME-PLAN §15, GAME-PLAN-DAYS §A.1). The listing below names every day
// for Day select; a built day's own record (`day` in game/script/dayNN.js, registered in
// game/script/days.js) replaces its row and adds `create`, `nodes`, `write` and the rest.
// Nothing here changes when a day is added.
import { createState, enterDay } from '../state.js';
import { addSpeakers } from '../dialogue.js';
import { usePresetWalk } from './preset.js';
import * as built from './days.js';

const listing = {
  1: { title: 'Welcome, Stranger', headline: 'HOMESTEADER SIGHTED IN UPPER FOGLANDS', season: 'spring', seasonName: 'Early spring' },
  2: { title: 'A gift of rocks', headline: 'LOCAL WOMAN SHARES GIFT OF ROCKS', season: 'summer', seasonName: 'Summer' },
  3: { title: 'Friendship Books', headline: 'BOOKSTORE TO SELL CARDS AND GAMES', season: 'autumn', seasonName: 'Autumn', goal: 'There must be more than farming.' },
  4: { title: 'All the pixels', headline: 'NEW OPTOMETRIST ACCEPTS INTERESTING TRADES', season: 'autumn', seasonName: 'Autumn', goal: 'See the optometrist, three doors down.' },
  5: { title: 'Tuesday nights', headline: 'DOCTOR SEEKS GAMER', season: 'autumn', seasonName: 'Autumn', goal: 'Read the board. Tuesday, 8 p.m.' },
  6: { title: 'Because', headline: 'WEDDING ANNOUNCEMENT', season: 'winter', seasonName: 'Winter', goal: 'Decide.' },
  7: { title: 'Seventeen pixels', headline: 'DOCTOR AND WIFE ARE HAPPY; BORED', season: 'spring', seasonName: 'Spring', goal: 'Teach him to swim.' },
  8: { title: 'The blizzard', headline: 'SPECIAL EVENT: SUPER BLIZZARD TERRORIZES FRIENDSHIP', season: 'winter', seasonName: 'Late winter', goal: 'She’ll be back when she recharges.' },
  9: { title: 'A stone at a time', headline: 'LOCAL DOCTOR, WIFE TO SELL GAMES FOR THE HOLIDAYS', season: 'winter', seasonName: 'Winter', goal: 'Set down a white stone.' },
  10: { title: 'The fifth game', headline: 'PIONEERCHAT', season: 'winter', seasonName: 'Winter', goal: 'Is it you?' },
  11: { title: 'Emily has left', headline: 'BOY REACHES END', season: 'grey', seasonName: 'No season', goal: 'Check on LQ.' },
  12: { title: 'Breaker of Horses', headline: 'GROOMING, SHODDING, HORSE TAMING, AND OTHER SERVICES OF AN EQUESTRIAN NATURE', season: 'autumn', seasonName: 'Autumn', goal: 'Get Pixel shod before you go.' },
  13: { title: 'The will', headline: 'LOCAL MERCHANT’S WILL READ', season: 'spring', seasonName: 'Spring', goal: 'Set your affairs in order.' },
};

export const lastDay = 13;
export const days = {};
for (const [n, row] of Object.entries(listing)) days[n] = { n: Number(n), ...row };
for (const [file, module] of Object.entries(built)) {
  const record = module.day;
  if (!record?.n || !record.create) throw new Error(`game/script/${file}.js: export a \`day\` record with n and create`);
  days[record.n] = { ...days[record.n], ...record };
  addSpeakers(record.speakers);
}

export const isBuilt = (n) => Boolean(days[n]?.create);
export const allNodes = Object.values(days).flatMap((day) => day.nodes ?? []);

// The canon opening of day n: Day 1's morning, then each earlier day's book outcome (`canon`)
// and the next morning. A day not built yet contributes nothing.
export function presetState(n = 1) {
  const state = enterDay(createState(), days[1]);
  for (let d = 1; d < n; d++) {
    days[d]?.canon?.(state);
    enterDay(state, days[d + 1] ?? { n: d + 1 });
  }
  return state;
}
usePresetWalk(presetState);

// A real save, from a finished day to the next morning.
export function advanceDay(state) {
  return enterDay(state, days[state.day + 1] ?? { n: state.day + 1 });
}

export const newGame = () => presetState(1);
