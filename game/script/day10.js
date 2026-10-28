// Day 10, PIONEERCHAT (GAME-PLAN-DAYS §B Day 10), winter. No paper: the day ends with a
// text box, "Emily has left Friendship.", and goes straight to Day 11's card. Everything of
// this day in one file: its record (`day`, at the end), flags, speakers, canonDay10, nodes,
// beats, writeDay10 (null) and presetDay10.
//
// The private chat with daedalus84, message by message: each of Emily's is sent with Send;
// saying nothing ("………") makes daedalus84 write once more (authored) before her message is
// offered again. Then Friendship, seen for what it is: a 1 px grid over every tile, the
// colours drained by 30%, the mist stopped. Down the hill to Alabaster's; "Sadie."; Emily
// comes apart pixel by pixel.
//
// Node ids: d10.<speaker>.<topic>. Book lines are `src` (L10.xx); the rest is `authored`.
import { changeMap, screensFromTown } from '../transitions.js';
import { createDayKit } from './common.js';
import { createHitchRide, hitchNodes, hitchRoutes } from './fast-ride.js';
import { mapFor } from '../../maps/versions.js';
import { presetDay } from './preset.js';
import { lines } from './lines.js';
import { ridesOn } from './day02.js';
import { holdLine } from '../ui/day09.js';
import { createDay10Ui } from '../ui/day10.js';
import { applySham, clearSham, dissolveEmily, kneel } from '../world/day10.js';

export const skipPoints = []; // the book gives Day 10 no Skip

// The chat log, L10.01–L10.22, in order; shown by game/ui/day10.js, not by the dialogue box.
export const chatLines = Array.from({ length: 22 }, (_, i) => `L10.${String(i + 1).padStart(2, '0')}`);
export const disappearLine = 'L10.37';
export const leftLine = 'L10.38';
// Emily's own "………" (L10.20) is the one message with no alternative.
const quietLines = new Set(['L10.20']);

export function chatScript() {
  return chatLines.map((id) => {
    const line = lines[id];
    return { id, from: line.speaker ?? 'system', text: line.text, quiet: quietLines.has(id) };
  });
}

// What daedalus84 writes when Emily says nothing (authored; the nth silence takes the nth).
export const nudges = ['d10.daedalus84.still-there', 'd10.daedalus84.wait', 'd10.daedalus84.say', 'd10.daedalus84.here'];

export const nodes = [
  // beat 1: the chat (shown on the chat screen; listed here so Text & source names them)
  { id: 'd10.emily.silence', speaker: 'emily', text: '………', authored: true },
  { id: 'd10.daedalus84.still-there', speaker: 'daedalus84', text: 'Are you still there?', authored: true },
  { id: 'd10.daedalus84.wait', speaker: 'daedalus84', text: 'Take your time. I’ll wait.', authored: true },
  { id: 'd10.daedalus84.say', speaker: 'daedalus84', text: 'Please say something.', authored: true },
  { id: 'd10.daedalus84.here', speaker: 'daedalus84', text: 'I’m still here.', authored: true },

  // beat 2: the sham
  { id: 'd10.world.sham', src: 'L10.23' },
  { id: 'd10.world.ride', src: 'L10.24' },
  { id: 'd10.cabin.knock', kind: 'narration', text: 'A slab of stone for a doorstep. Knock?', authored: true, choices: [
    { label: 'Knock', authored: true, silent: true, value: 'knock' },
    { label: 'Not yet', authored: true, silent: true, value: 'no' },
  ] },

  // beat 3: Alabaster
  { id: 'd10.alabaster.door', src: 'L10.25', next: 'd10.emily.edna' },
  { id: 'd10.emily.edna', speaker: 'emily', portrait: 'emily-firm', src: 'L10.26', next: 'd10.alabaster.any' },
  { id: 'd10.alabaster.any', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L10.27', next: 'd10.emily.before' },
  { id: 'd10.emily.before', speaker: 'emily', src: 'L10.28', next: 'd10.alabaster.nodded' },
  { id: 'd10.alabaster.nodded', src: 'L10.29', next: 'd10.alabaster.rarity' },
  { id: 'd10.alabaster.rarity', speaker: 'alabaster', src: 'L10.30', next: 'd10.emily.looked' },
  { id: 'd10.emily.looked', src: 'L10.31', next: 'd10.emily.sam' },
  { id: 'd10.emily.sam', speaker: 'emily', src: 'L10.32', next: 'd10.alabaster.who' },
  { id: 'd10.alabaster.who', speaker: 'alabaster', src: 'L10.33', next: 'd10.emily.as-well' },
  { id: 'd10.emily.as-well', speaker: 'emily', src: 'L10.34', next: 'd10.alabaster.knees' },
  { id: 'd10.alabaster.knees', src: 'L10.35', cue: 'kneel', next: 'd10.alabaster.sadie' },
  { id: 'd10.alabaster.sadie', speaker: 'alabaster', src: 'L10.36' },
  // Pixel at the hitch: face her and press E to ride (fast-ride.js)
  ...hitchNodes('d10', ['to-vineyard', 'home']),
];

export function goalDay10(state) {
  const d10 = state.marks.d10 ?? {};
  if (!d10.chatDone) return '';
  if (state.flags.leftFriendship) return '';
  if (state.map === 'vineyard') return 'Knock at Alabaster’s door.';
  if (state.map === 'friendship') return 'Alabaster’s vineyard: east along the Foglands road, then the track south.';
  return 'Ride down the hill to Alabaster’s: the vineyard track, south off the Foglands road.';
}

export function createDay10(ctx) {
  const { state, world, dialogue, hud } = ctx;
  const { flags, marks } = state;
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  kit.goalOf = () => goalDay10(state);
  const ui = createDay10Ui(ctx);
  const farmMap = mapFor('foglands', 10);
  const vineyardMap = mapFor('vineyard', 10);
  const d10 = (marks.d10 ??= { chatDone: false, rode: false });

  // ---------------------------------------------------------------- beat 1: the chat
  async function chat() {
    hud.hide();
    if (!d10.chatDone) {
      const nudgeText = (n) => nodes.find((node) => node.id === nudges[n % nudges.length]).text;
      const { silences } = await ui.chat.run(chatScript(), { nudge: nudgeText });
      flags.chatSilences = silences;
      d10.chatDone = true;
      ctx.save?.();
    }
    // beat 2: back in the world, which is not what it was
    applySham(world);
    hud.update(state);
    hud.show();
    if (!d10.saidSham) {
      d10.saidSham = true;
      await talk('d10.world.sham');
    }
  }

  // ---------------------------------------------------------------- beat 3: Alabaster
  async function door() {
    if ((await talk('d10.cabin.knock')) !== 'knock') return;
    const emily = world.playerTile?.() ?? { x: 11, y: 12 };
    const slab = vineyardMap.objects.find((object) => object.id === 'slab');
    // Alabaster steps out onto the slab beside Emily, not in her column, where her sprite would hide them
    const spots = [{ x: slab.x, y: slab.y }, { x: slab.x + 1, y: slab.y }];
    const stand = spots.find((tile) => tile.x !== emily.x) ?? spots.find((tile) => tile.y !== emily.y) ?? spots[0];
    const dx = emily.x - stand.x;
    const dy = emily.y - stand.y;
    const toEmily = dy > 0 ? 'down' : dy < 0 ? 'up' : dx > 0 ? 'right' : 'left';
    const toAlabaster = dx === 0 ? (dy > 0 ? 'up' : 'down') : dx > 0 ? 'left' : 'right';
    world.spawnNpc('alabaster', stand, toEmily);
    world.facePlayer(toAlabaster);
    await talk('d10.alabaster.door');
    state.companions.alabaster += 1;

    // Emily comes apart where she stands, and the box says so.
    hud.setGoal('');
    await Promise.all([
      dissolveEmily(world, ctx.reducedMotion ? 300 : 2000),
      dialogue.caption(disappearLine, { hold: ctx.reducedMotion ? 600 : 2600 }),
    ]);
    flags.leftFriendship = true;
    const close = await holdLine(null, lines[leftLine].text, { hold: 3000, kind: 'world', reducedMotion: ctx.reducedMotion });
    await world.fade('out', ctx.reducedMotion ? 1 : 900);
    close();
    clearSham(world);
    world.setPlayerVisible?.(true); // Day 11 starts with her back
    ctx.ended = true;
    hud.hide();
    await ctx.endDay(); // no paper (day.paper is false): straight to Day 11's card
  }

  // ---------------------------------------------------------------- moving about
  async function leave(exit) {
    await changeMap(ctx, exit.to, exit.spawn);
    if (exit.to === 'foglands-road' && !d10.rode) {
      d10.rode = true;
      await talk('d10.world.ride');
    }
  }

  const objectHandlers = { 'cabin-door': door, slab: door };
  // Pixel at the hitch: E rides between the farm and the vineyard (fast-ride.js).
  const hitch = createHitchRide(ctx, kit, 'd10', { foglands: hitchRoutes.toVineyard(), vineyard: hitchRoutes.home() }, {
    open: () => d10.chatDone && !flags.leftFriendship,
    after: async (route) => {
      if (route.to !== 'vineyard' || d10.rode) return;
      d10.rode = true;
      await talk('d10.world.ride');
    },
  });
  const handlerFor = (target) => {
    if (target.npc === 'pixel') return hitch.handler();
    return d10.chatDone && !flags.leftFriendship && !target.npc && state.map === 'vineyard' ? objectHandlers[target.id] : null;
  };

  const api = {
    start: () => beat(chat),
    get busy() {
      return kit.busy;
    },

    mapBuilt(mapId) {
      world.setRiding(ridesOn(state, mapId));
      if (d10.chatDone) applySham(world);
      if (mapId === 'foglands' && flags.boughtHorse && farmMap?.marks?.hitch) world.showPixel(farmMap.marks.hitch, 'west');
      if (mapId === 'foglands') hitch.hint();
      if (mapId === 'vineyard' && flags.boughtHorse && vineyardMap?.marks?.hitch) world.showPixel(vineyardMap.marks.hitch, 'west');
      kit.refreshGoal();
    },

    onTile({ x, map }) {
      if (map === 'foglands-road') hud.setScreens(screensFromTown(x));
    },

    onExit(exit) {
      return beat(() => leave(exit));
    },

    canInteract(target) {
      return Boolean(handlerFor(target));
    },

    onInteract(target) {
      const handler = handlerFor(target);
      return handler ? beat(handler) : undefined;
    },

    cue(name) {
      if (name === 'kneel') kneel(world, 'alabaster');
    },
  };

  // ---------------------------------------------------------------- headless walk-through
  const go = (to, spawn) => () => api.onExit({ to, spawn });
  const route = [
    () => api.start(),
    go('foglands-road', 'from-east'),
    go('vineyard', 'from-road'),
    () => api.onInteract({ id: 'slab' }),
  ];
  api.debugAdvance = async () => {
    const step = route.shift();
    if (!step) return false;
    await step();
    return true;
  };
  return api;
}

// No paper today (GAME-PLAN-DAYS §B Day 10): `day.paper` is false and the day writes nothing.
export function writeDay10() {
  return null;
}

// ---------------------------------------------------------------- state
export const flags = {
  chatSilences: 0,
  leftFriendship: false,
};

export const speakers = {
  daedalus84: { name: 'daedalus84' },
};

// The book's Day 10: every message sent, none withheld, and Emily gone from Friendship.
export function canonDay10(state) {
  Object.assign(state.flags, { chatSilences: 0, leftFriendship: true });
  state.companions.alabaster += 1;
  return state;
}

export const presetDay10 = () => presetDay(10);

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 10,
  title: 'The fifth game',
  headline: 'PIONEERCHAT',
  season: 'winter',
  seasonName: 'Winter',
  goal: 'Is it you?',
  start: { map: 'foglands', spawn: 'porch' },
  paper: false,
  flags,
  speakers,
  canon: canonDay10,
  nodes,
  skipPoints,
  extraLines: [...chatLines, disappearLine, leftLine],
  create: createDay10,
  write: writeDay10,
  preset: presetDay10,
};
