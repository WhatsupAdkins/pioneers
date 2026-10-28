// presetDay(n): the canon opening of day n (GAME-PLAN-DAYS §A.1, §A.2): every earlier
// registered day played the way the book tells it. game/script/index.js supplies the walk;
// this file only holds the hook, so a day module can export its presetDayNN() without
// importing the registry (which imports the day modules).
let walk = null;

export function usePresetWalk(fn) {
  walk = fn;
}

export function presetDay(n) {
  if (!walk) throw new Error('presetDay: load game/script/index.js first');
  return walk(n);
}
