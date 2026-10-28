// Day 11, BOY REACHES END (GAME-PLAN-DAYS §B Day 11), no season: grey. Everything of this day
// in one file: its record (`day`, at the end), flags, speakers, canon, nodes, beats, the paper
// (writeDay11) and presetDay11.
//
// Emily logs back on and finds LQ eleven years old on the shore. They swim west: two screens
// out (the usual distance, Day 7) LQ asks to keep going, and they swim on eight more to the end
// of the ocean. Every screen past the first costs two hearts, and on this day alone hearts at
// none change nothing (one toast says so). At the end, in the fog, the book's last exchange;
// LQ stays at the end and Emily swims back alone. Then the paper.
//
// Node ids: d11.<speaker>.<topic>. Lines quoted from the book are `src` (L11.xx in lines.js).
import { createDayKit } from './common.js';
import { presetDay } from './preset.js';
import { screenOf, shoreX, screenWidth } from '../../maps/day11-ocean.js';
import { swimSprites, follow, endFog, greyWash } from '../world/day11.js';

const live = typeof document !== 'undefined'; // false in check-days.mjs (no Phaser, no DOM)

export const skipPoints = [];

export const nodes = [
  // beat 1: back on the shore
  { id: 'd11.back.logged', src: 'L11.01', next: 'd11.lq.where' },
  { id: 'd11.lq.where', speaker: 'lq', portrait: 'lq-11', src: 'L11.02', next: 'd11.emily.swim' },
  { id: 'd11.emily.swim', speaker: 'emily', src: 'L11.03' },
  // beat 2: two screens out
  { id: 'd11.swim.two', src: 'L11.04', next: 'd11.emily.bigger' },
  { id: 'd11.emily.bigger', speaker: 'emily', portrait: 'emily-soft', src: 'L11.05' },
  // the end of the ocean
  { id: 'd11.swim.end', src: 'L11.06', next: 'd11.lq.peaceful' },
  { id: 'd11.lq.peaceful', speaker: 'lq', portrait: 'lq-11', src: 'L11.07', next: 'd11.emily.peaceful' },
  { id: 'd11.emily.peaceful', speaker: 'emily', portrait: 'emily-soft', src: 'L11.08', next: 'd11.lq.mama' },
  { id: 'd11.lq.mama', speaker: 'lq', portrait: 'lq-11', src: 'L11.09', next: 'd11.lq.worried' },
  { id: 'd11.lq.worried', speaker: 'lq', portrait: 'lq-11', src: 'L11.10', next: 'd11.emily.real' },
  { id: 'd11.emily.real', speaker: 'emily', portrait: 'emily-soft', src: 'L11.11' },
];

export const heartsPerScreen = 2;
export const twoScreens = 3; // entering screen 3 means two screens are behind them
const backFromEnd = 2; // screens Emily swims back before the day ends (she leaves him there)

export function goalDay11(state) {
  const { flags, marks } = state;
  if (flags.lqStayed) return 'Swim back alone: east, toward the shore.';
  if (marks.askedToKeepSwimming) return 'Keep swimming west, to the end of the ocean.';
  if (marks.swimming) return 'Swim west with LQ: two screens out.';
  return 'Check on LQ.';
}

export function createDay11(ctx) {
  const { state, world, hud } = ctx;
  const { flags, marks } = state;
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  kit.goalOf = () => goalDay11(state);
  let lq = null;
  const stops = [];
  const stopAll = () => { while (stops.length) stops.pop()(); };

  function showScreens(screen) {
    hud.setScreens(screen > 0 ? screen : null);
    if (live && screen > 0) {
      const label = document.querySelector('#hud .hud-screens');
      if (label) label.textContent = `${screen} ${screen === 1 ? 'screen' : 'screens'} out`;
    }
  }

  // Hearts at none do nothing today (GAME-PLAN-DAYS §0: Day 11 breaks the rule on purpose).
  function spendHearts(n) {
    state.hearts = Math.max(0, state.hearts - n);
    hud.update(state);
    ctx.sound?.play('heart');
    if (state.hearts === 0 && !marks.heartsGone) {
      marks.heartsGone = true;
      hud.toast('Hearts: 0. Keep swimming.', 3600);
    }
  }

  function startSwimming() {
    marks.swimming = true;
    if (!live || !world.add?.graphics) return;
    stops.push(swimSprites(world, { inWater: (x) => state.map === 'ocean' && x < shoreX * 16, lq: () => lq }));
    if (lq && !flags.lqStayed) stops.push(follow(world, lq, { lag: 26 }));
    // fog from screen 8 (140 tiles out), thickest at the end (196 tiles out)
    stops.push(endFog(world, (x) => {
      const out = shoreX - x / 16;
      return out < 140 ? 0 : 0.1 + Math.min(1, (out - 140) / 56) * 0.52;
    }));
  }

  // ---------------------------------------------------------------- beat 1
  async function wake() {
    hud.update(state);
    hud.show();
    if (live && world.add?.rectangle) stops.push(greyWash(world));
    lq = world.spawnNpc('lq-11', world.map?.spawns?.['lq-shore'] ?? { x: 202, y: 6 }, 'right');
    if (!marks.woke) {
      marks.woke = true;
      if (!ctx.reducedMotion) await world.fade('in', 900);
      await talk('d11.back.logged');
    }
    world.facePlayer?.('left');
    lq.face?.('left');
    startSwimming();
    kit.hint('swim11', 'Swim west. LQ follows. Each screen past the first costs hearts.', 5200);
  }

  // ---------------------------------------------------------------- beat 2
  async function twoScreensOut() {
    marks.askedToKeepSwimming = true;
    await talk('d11.swim.two');
  }

  async function theEnd() {
    flags.reachedEnd = true;
    stopAll();
    if (live && world.add?.graphics) {
      stops.push(greyWash(world));
      stops.push(endFog(world, () => 0.5));
      stops.push(swimSprites(world, { inWater: (x) => x < shoreX * 16, lq: () => lq }));
    }
    world.facePlayer('left');
    if (lq && !lq.gone) {
      const at = world.playerTile();
      const beside = { x: at.x + 1, y: at.y > 1 ? at.y - 1 : at.y + 1 };
      await lq.walkPath?.([beside], 50);
      lq.face('left');
    }
    await talk('d11.swim.end');
    flags.lqStayed = true;
    marks.endX = world.playerTile().x;
    kit.hint('back11', 'He stays. Swim back east.', 3200);
  }

  async function leave() {
    ctx.ended = true;
    stopAll();
    hud.setGoal('');
    if (!ctx.reducedMotion) await world.dusk?.(1600);
    await world.fade('out', 1200);
    hud.hide();
    hud.setScreens(null);
    await ctx.endDay();
  }

  const api = {
    start: () => beat(wake),
    get busy() {
      return kit.busy;
    },

    mapBuilt() {
      kit.refreshGoal();
    },

    onTile({ x, map }) {
      if (map !== 'ocean' || ctx.ended) return undefined;
      const screen = screenOf(x);
      showScreens(screen);
      if (!marks.swimming) return undefined;
      const farthest = marks.farthest ?? 0;
      if (screen > farthest && !flags.lqStayed) {
        marks.farthest = screen;
        flags.screensOut = Math.max(flags.screensOut ?? 0, screen);
        if (screen >= 2) spendHearts(heartsPerScreen);
      }
      if (screen >= twoScreens && !marks.askedToKeepSwimming && !kit.busy) return beat(twoScreensOut);
      if (flags.lqStayed && x >= (marks.endX ?? 4) + backFromEnd * screenWidth) return beat(leave);
      kit.refreshGoal();
      return undefined;
    },

    onTrigger(object) {
      if (object.id === 'end' && !flags.reachedEnd) return beat(theEnd);
      return undefined;
    },

    onExit() {
      return undefined;
    },

    canInteract(target) {
      return Boolean(target.npc === 'lq-11' && !ctx.ended);
    },

    onInteract(target) {
      if (target.npc !== 'lq-11') return undefined;
      return beat(async () => {
        if (flags.lqStayed) await talk('d11.lq.peaceful');
        else if (marks.swimming) hud.toast('LQ is right behind you. Swim west.', 2400);
      });
    },
  };

  // ---------------------------------------------------------------- headless walk-through
  // The canon route for check-days.mjs: the shore, ten screens out, the end, two screens back.
  const at = (x) => () => api.onTile({ x, y: 6, map: 'ocean' });
  const route = [
    () => api.start(),
    ...Array.from({ length: 10 }, (_, i) => at(shoreX - 5 - i * screenWidth)),
    () => api.onTrigger({ id: 'end' }),
    at(150), // two screens back from wherever she stopped
  ];
  api.debugAdvance = async () => {
    const step = route.shift();
    if (!step) return false;
    await step();
    return true;
  };
  return api;
}

// ---------------------------------------------------------------- the paper
// BOY REACHES END. Every sentence authored, in the Editor's voice.
export function writeDay11(state) {
  const { flags } = state;
  const missus = flags.married === false ? 'Miss Emily B. Marks' : 'Mrs. Emily Marks Daedalus';
  const out = flags.screensOut ?? 0;
  const body = [
    `Ludo Quintus, known to all as LQ, son of Dr. Daedalus and ${missus}, is eleven now, and sturdy.`,
    'His mother had been absent from Friendship for some days or months or years. This paper could not establish which. She came back this week and took the boy swimming.',
  ];
  if (flags.reachedEnd) {
    body.push('They did not turn at two screens, as is the custom and as the shore expects. They swam on, ten screens out, to the end of the ocean, where the sea gives out and the fog stands up like a wall.');
  } else if (out >= 3) {
    body.push('They did not turn at two screens, as is the custom. How far they went, this paper cannot say.');
  } else {
    body.push('They swam out the usual two screens.');
  }
  const she = flags.married === false ? 'Miss Marks' : 'Mrs. Daedalus';
  if (flags.lqStayed) body.push(`${she} swam back alone. The boy has stayed at the end of the ocean. It is peaceful there, she says.`);
  else body.push('Both came home before dark.');
  body.push('No one in Friendship has hearts enough to swim that far and back. This paper asked her how it was done. She said nothing that could be printed.');
  body.push(flags.lqStayed ? 'The boy is not real, his mother says, and so he cannot come to harm. This paper reports it as it was told.' : 'This paper wishes the family a quiet season.');
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'No season · Some years on',
    headline: 'BOY REACHES END',
    body,
  };
}

// ---------------------------------------------------------------- state
// The first five are what Days 6–10 leave behind in the book (Run 4–6 set them). They are
// here with their canon values so a Day 11 started on this branch has them; a save that already
// carries them keeps its own (game/state.js ensureDayFlags). archive/PARALLEL-RULES.md §4.
export const prerequisites = { married: true, lqBorn: true, amputation: true, fifthGame: true, leftFriendship: true };
export const flags = {
  ...prerequisites,
  reachedEnd: false,
  lqStayed: false,
  screensOut: 0,
};

// LQ's default portrait is left to Day 7 (Run 5, 'lq-neutral'); every Day 11 node names 'lq-11'.
export const speakers = {
  lq: { name: 'LQ' },
};

// The book's Day 11: ten screens out, the end of the ocean, LQ stays there.
export function canonDay11(state) {
  Object.assign(state.flags, { reachedEnd: true, lqStayed: true, screensOut: 10 });
  return state;
}

export function presetDay11() {
  const state = presetDay(11);
  Object.assign(state.flags, prerequisites);
  return state;
}

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 11,
  title: 'Emily has left',
  headline: 'BOY REACHES END',
  season: 'grey',
  seasonName: 'No season',
  goal: 'Check on LQ.',
  start: { map: 'ocean', spawn: 'shore' },
  flags,
  speakers,
  canon: canonDay11,
  nodes,
  skipPoints,
  create: createDay11,
  write: writeDay11,
  preset: presetDay11,
};
