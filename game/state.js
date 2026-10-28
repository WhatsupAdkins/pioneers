// The whole game state is one plain object, saved whole to localStorage (GAME-PLAN §6,
// GAME-PLAN-DAYS §A.2). Version 2 carries every day; version-1 saves are ignored.
//
// This file knows no particular day. Each day module (game/script/dayNN.js) brings its own
// start point, season, flags and `canon` (what the book says happened that day);
// game/script/index.js chains them into presetState(n) and advanceDay(), using enterDay() here.
export const saveKey = 'pioneers.save';
export const unlockKey = 'pioneers.unlocked';
export const stateVersion = 2;
export const inventorySlots = 12;

// The shared shape; flags are added by each day as it is entered (enterDay).
export function createState() {
  return {
    version: stateVersion,
    day: 1,
    dayComplete: false,
    season: 'spring',
    week: 0, // porch Rests within the day
    map: 'friendship',
    spawn: 'from-train',
    clock: 6, // hours; the day starts at 06:00
    hearts: 10,
    heartsMax: 10,
    purse: 100,
    inventory: [], // [{ id, count }]
    skips: 0,
    skipped: {},
    giftsGiven: 0,
    // one-off events within a day (reset each morning); marks.hint survives across days
    marks: { hint: {} },
    farm: { plots: [], grown: 0, harvests: 0, rocks: 0, carrotGrown: false, carrotEaten: false },
    store: { built: false, name: 'Friendship Books', stock: { books: 0, cards: 0, games: 0 }, weeksOpen: 0, gold: 0 },
    go: { played: 0, won: 0, lost: 0, lastResult: null },
    companions: { alabaster: 0, daedalus: 0 },
    flags: {},
  };
}

// Adds a day's flags with their defaults, keeping any already set (an older save, or a
// flag a later day shares). Counters default to 0, so `+= 1` never meets undefined.
export function ensureDayFlags(state, day) {
  for (const [flag, value] of Object.entries(day?.flags ?? {})) {
    if (!(flag in state.flags)) state.flags[flag] = structuredClone(value);
  }
  return state;
}

// The morning of `day` (a day module, or { n } for one not built yet): its number, season and
// starting point, full hearts, the day-scoped marks cleared (first-time hints are kept).
export function enterDay(state, day) {
  state.day = day.n;
  state.dayComplete = false;
  state.season = day.season ?? state.season;
  state.map = day.start?.map ?? state.map;
  state.spawn = day.start?.spawn ?? state.spawn;
  state.clock = 6;
  state.week = 0;
  state.hearts = state.heartsMax;
  state.marks = { hint: { ...(state.marks?.hint ?? {}) } };
  return ensureDayFlags(state, day);
}

export function save(state, storage = globalThis.localStorage) {
  try {
    storage.setItem(saveKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// A missing, unreadable, old or foreign save counts as no save.
export function load(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(saveKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && data.version === stateVersion && data.flags && Array.isArray(data.inventory) ? data : null;
  } catch {
    return null;
  }
}

// The highest day the player may start from Day select (at least 1).
export function unlockedDay(storage = globalThis.localStorage) {
  try {
    return Math.max(1, Number.parseInt(storage?.getItem(unlockKey) ?? '1', 10) || 1);
  } catch {
    return 1;
  }
}

export function unlockDay(day, storage = globalThis.localStorage) {
  try {
    if (day > unlockedDay(storage)) storage.setItem(unlockKey, String(day));
  } catch {
    // private mode: Day select simply stays where it was
  }
}

export function set(state, flag, value = true) {
  state.flags[flag] = value;
  return state;
}

export function has(state, flag) {
  return Boolean(state.flags[flag]);
}
