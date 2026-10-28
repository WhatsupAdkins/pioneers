// Day 7, DOCTOR AND WIFE ARE HAPPY; BORED (GAME-PLAN-DAYS §B Day 7), spring into summer.
// Everything of this day in one file: its record for the registry (`day`, at the end), flags,
// speakers, the book's outcome (canonDay07), nodes, beats, the paper (writeDay07) and
// presetDay07.
//
// The day opens on the BIRTH ANNOUNCEMENT, printed as a card. LQ lies in his cradle by the
// porch, seventeen pixels. Two Rests and he is eight. At the shore steps Emily takes him
// swimming: every screen crossed, out or back, costs a heart, and LQ's hearts follow hers.
// Two screens out he asks about the end of the sea; then Emily turns back, or keeps going
// until her hearts run out and she wakes on the porch. That night, Daedalus; perhaps a game
// of Go. Then Alabaster at the vineyard, boredom, happiness, engines. Then the paper.
//
// Node ids: d7.<speaker>.<topic>. Lines quoted from the book are `src` (L7.xx in
// lines/day07.js); everything else is `authored` and only connects. Menu choices are `silent`.
import { changeMap } from '../transitions.js';
import { createDayKit } from './common.js';
import { createHitchRide, hitchNodes, hitchRoutes } from './fast-ride.js';
import { mapFor } from '../../maps/versions.js';
import { inWords } from '../newspaper.js';
import { iconCanvas } from '../hud.js';
import { presetDay } from './preset.js';
import { playOnBoard } from './day05.js';
import { portalLink, travelByPortal } from '../world/day06.js';
import { follow, placeImage, setSwimming, swellDeepWater, useStylesheet } from '../world/day07.js';
import { lines as day07Lines } from './lines/day07.js';

const birthText = day07Lines['L7.01'].text; // printed on the card that opens the day

export const skipPoints = []; // the book gives Day 7 no Skip

export const nodes = [
  // beat 1: the birth
  { id: 'd7.wake.residences', src: 'L7.02', next: 'd7.wake.sprite' },
  { id: 'd7.wake.sprite', src: 'L7.03' },
  { id: 'd7.grow.brief', src: 'L7.04' },
  { id: 'd7.grow.doll', src: 'L7.05', next: 'd7.emily.carrot' },
  { id: 'd7.emily.carrot', speaker: 'emily', portrait: 'emily-soft', src: 'L7.06' },
  {
    id: 'd7.rest.ask',
    kind: 'narration',
    text: 'The porch steps. Rest here until morning?',
    authored: true,
    choices: [
      { label: 'Rest until morning', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },

  // beat 2: the swim
  { id: 'd7.swim.taught', src: 'L7.07', next: 'd7.emily.hearts' },
  { id: 'd7.emily.hearts', speaker: 'emily', src: 'L7.08', next: 'd7.lq.yes' },
  { id: 'd7.lq.yes', speaker: 'lq', src: 'L7.09', next: 'd7.swim.two' },
  { id: 'd7.swim.two', src: 'L7.10' },
  { id: 'd7.lq.screens', speaker: 'lq', src: 'L7.11', next: 'd7.emily.deep' },
  { id: 'd7.emily.deep', speaker: 'emily', src: 'L7.12', next: 'd7.lq.know' },
  { id: 'd7.lq.know', speaker: 'lq', src: 'L7.13', next: 'd7.emily.swum' },
  { id: 'd7.emily.swum', speaker: 'emily', src: 'L7.14', next: 'd7.lq.end' },
  { id: 'd7.lq.end', speaker: 'lq', src: 'L7.15', next: 'd7.emily.fog' },
  { id: 'd7.emily.fog', speaker: 'emily', src: 'L7.16', next: 'd7.lq.nodded' },
  { id: 'd7.lq.nodded', src: 'L7.17', next: 'd7.lq.frightening' },
  { id: 'd7.lq.frightening', speaker: 'lq', src: 'L7.18', next: 'd7.emily.nothing' },
  { id: 'd7.emily.nothing', speaker: 'emily', src: 'L7.19', next: 'd7.lq.see' },
  { id: 'd7.lq.see', speaker: 'lq', src: 'L7.20', next: 'd7.emily.why' },
  { id: 'd7.emily.why', speaker: 'emily', src: 'L7.21', next: 'd7.lq.never' },
  { id: 'd7.lq.never', speaker: 'lq', src: 'L7.22', next: 'd7.emily.oneday' },
  { id: 'd7.emily.oneday', speaker: 'emily', src: 'L7.23', next: 'd7.swim.choice' },
  {
    id: 'd7.swim.choice',
    kind: 'narration',
    text: 'Two screens out. Half your hearts, or more, to get home.',
    authored: true,
    choices: [
      { label: 'Turn back', authored: true, silent: true, value: 'back', set: { taughtSwim: true } },
      { label: 'Keep going', authored: true, silent: true, value: 'on', set: { wentTooFar: true } },
    ],
  },
  { id: 'd7.lq.alone', kind: 'narration', text: 'LQ turned for the shore, as he had been told.', authored: true },
  { id: 'd7.swim.drowned', kind: 'narration', text: 'She woke on the porch steps. LQ had swum home by himself and was waiting for her, quite unharmed.', authored: true },

  // beat 3: the pillow
  { id: 'd7.night.reported', src: 'L7.24', next: 'd7.emily.make' },
  { id: 'd7.emily.make', speaker: 'emily', src: 'L7.25', next: 'd7.daedalus.natural' },
  { id: 'd7.daedalus.natural', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L7.26', next: 'd7.night.board' },
  {
    id: 'd7.night.board',
    kind: 'narration',
    text: 'The Go board.',
    authored: true,
    choices: [
      { label: 'Play a game', authored: true, silent: true, value: 'go' },
      { label: 'Not tonight', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd7.night.marriage', src: 'L7.27' },

  // beat 4: boredom
  { id: 'd7.emily.more', speaker: 'emily', src: 'L7.28', next: 'd7.alabaster.boredom' },
  { id: 'd7.alabaster.boredom', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L7.29', next: 'd7.emily.suppose' },
  { id: 'd7.emily.suppose', speaker: 'emily', src: 'L7.30', next: 'd7.alabaster.sighed' },
  { id: 'd7.alabaster.sighed', src: 'L7.31', next: 'd7.alabaster.game' },
  { id: 'd7.alabaster.game', speaker: 'alabaster', src: 'L7.32', next: 'd7.emily.what' },
  { id: 'd7.emily.what', speaker: 'emily', src: 'L7.33', next: 'd7.alabaster.pastime' },
  { id: 'd7.alabaster.pastime', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L7.34', next: 'd7.emily.pastime' },
  {
    id: 'd7.emily.pastime',
    kind: 'narration',
    text: 'A new pastime.',
    authored: true,
    choices: [
      { label: 'Tell Alabaster about the engines', authored: true, silent: true, value: 'engines', set: { toldEngines: true }, next: 'd7.emily.built' },
      { label: 'Say nothing', authored: true, silent: true, value: 'quiet', next: 'd7.vineyard.quiet' },
    ],
  },
  { id: 'd7.emily.built', speaker: 'emily', src: 'L7.35', next: 'd7.alabaster.never' },
  { id: 'd7.alabaster.never', speaker: 'alabaster', src: 'L7.36', next: 'd7.emily.engines' },
  { id: 'd7.emily.engines', speaker: 'emily', src: 'L7.37', next: 'd7.alabaster.promethean' },
  { id: 'd7.alabaster.promethean', speaker: 'alabaster', src: 'L7.38' },
  { id: 'd7.vineyard.quiet', kind: 'narration', text: 'Emily said nothing more. They finished the wine and watched the vines.', authored: true },
  { id: 'd7.vineyard.later', kind: 'narration', text: 'Alabaster is out among the vines. Come back after the swim.', authored: true },
  { id: 'd7.alabaster.again', speaker: 'alabaster', text: 'Go home, Emily. Find a pastime.', authored: true },
  // Pixel at the hitch: face her and press E to ride (fast-ride.js)
  ...hitchNodes('d7', ['to-town', 'home']),
];

// ---------------------------------------------------------------- the sea, as numbers
export const oceanWidth = 200;
export const screenTiles = 20;
// Screens out from the shore: 0 on the steps (the last column), 1 for the nearest twenty
// tiles of water, … 10 at the fog wall.
export const screenOf = (x) => (x >= oceanWidth - 1 ? 0 : 1 + Math.floor((oceanWidth - 2 - x) / screenTiles));
export const askAt = { screen: 2, x: 168 }; // LQ stops halfway across the second screen

// Emily rides on roads and in town; on foot at home and at the vineyard; swims at sea.
export const ridesOn = (state, mapId) => Boolean(state.flags.boughtHorse) && ['friendship', 'foglands-road', 'undiscovered'].includes(mapId);

export function goalDay07(state) {
  const { flags, marks } = state;
  if (marks.ending) return 'Good night.';
  if (state.map === 'ocean') {
    if (!marks.asked) return 'Swim west with LQ, two screens out. Mind your hearts.';
    return flags.wentTooFar && !flags.taughtSwim ? 'Keep swimming west.' : 'Swim back to the shore, east.';
  }
  if (!marks.grown) return marks.rests === 1 ? 'Rest on the porch steps again.' : 'Rest on the porch steps.';
  if (!marks.swum) return state.map === 'foglands' ? 'Teach LQ to swim: the stone steps down to the sea, west of the house.' : 'Go home: LQ is waiting to swim.';
  if (!marks.pillow) return state.map === 'foglands' ? 'Rest on the porch steps.' : 'Go home and rest.';
  if (state.map === 'vineyard') return 'Talk to Alabaster.';
  if (state.map === 'foglands-road') return 'The vineyard track forks south, past the conifers.';
  return 'Call on Alabaster at the vineyard: the Foglands road west, then the track south.';
}

// The Go board on the bedside table: Day 5's story board (game/script/day05.js playOnBoard),
// a second panel beside the title's, so the title's game keeps its state. Headless, no game.
async function playGo(ctx) {
  if (typeof document === 'undefined' || !document.getElementById('frame')) return null;
  return playOnBoard(ctx, 'Bedside · a game before sleep');
}

// The BIRTH ANNOUNCEMENT, printed on a card before the day (the paper's look, a Begin button).
async function birthCard(ctx, text) {
  const paper = typeof document !== 'undefined' ? document.getElementById('paper') : null;
  if (!paper) return;
  useStylesheet('../css/day07.css');
  const card = paper.cloneNode(true);
  card.id = 'd7-birth';
  card.classList.add('d07-announcement');
  card.setAttribute('aria-labelledby', 'd7-birth-headline');
  const mast = card.querySelector('canvas');
  const source = paper.querySelector('canvas');
  mast.removeAttribute('id');
  mast.width = source.width;
  mast.height = source.height;
  mast.getContext('2d').drawImage(source, 0, 0);
  card.querySelector('.paper-date').textContent = 'Spring · The Valley and the Foglands';
  const headline = card.querySelector('.paper-headline');
  headline.id = 'd7-birth-headline';
  headline.textContent = 'BIRTH ANNOUNCEMENT';
  const body = card.querySelector('.paper-body');
  body.style.columns = '1'; // one short notice: no columns (also in day07.css, which may still be loading)
  const p = document.createElement('p');
  p.textContent = text;
  body.replaceChildren(p);
  const button = card.querySelector('.paper-sleep');
  button.textContent = 'Begin';
  card.hidden = false;
  paper.after(card);
  button.focus();
  await new Promise((resolve) => button.addEventListener('click', resolve, { once: true }));
  card.remove();
}

// The swimming HUD: the Half line among Emily's hearts, LQ's hearts, and how far out.
function createSwimHud(state) {
  const hud = typeof document !== 'undefined' ? document.getElementById('hud') : null;
  if (!hud) return { update() {}, remove() {} };
  useStylesheet('../css/day07.css');
  const hearts = hud.querySelector('.hud-hearts');
  const half = document.createElement('span');
  half.className = 'd07-half';
  half.setAttribute('aria-hidden', 'true');
  const panel = document.createElement('div');
  panel.className = 'd07-swim';
  panel.innerHTML = '<p class="d07-out"></p><div class="d07-lq"><span>LQ</span><span class="d07-lq-hearts" role="img"></span></div>';
  hud.append(panel);
  const out = panel.querySelector('.d07-out');
  const lqHearts = panel.querySelector('.d07-lq-hearts');
  return {
    update(screen, withLq) {
      const canvases = hearts.querySelectorAll('canvas');
      const at = canvases[Math.floor(state.heartsMax / 2) - 1];
      if (at && half.previousSibling !== at) at.after(half);
      out.textContent = screen === 0 ? 'At the shore' : `${screen} ${screen === 1 ? 'screen' : 'screens'} out`;
      lqHearts.replaceChildren(...Array.from({ length: state.heartsMax }, (_, i) => iconCanvas(i < state.hearts ? 'heart-full' : 'heart-empty')));
      lqHearts.setAttribute('aria-label', `LQ's hearts ${state.hearts} of ${state.heartsMax}`);
      panel.querySelector('.d07-lq').hidden = !withLq;
    },
    remove() {
      half.remove();
      panel.remove();
    },
  };
}

export function createDay07(ctx) {
  const { state, world, dialogue, hud } = ctx;
  const { flags, marks } = state;
  useStylesheet('../css/day07.css');
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  kit.goalOf = () => goalDay07(state);
  const farmMap = mapFor('foglands', 7);
  let swimHud = null;
  let stopFollow = null;
  let lqInWater = false;

  // ---------------------------------------------------------------- beat 1: LQ
  function showLq() {
    if (state.map !== 'foglands') return;
    world.removeProp('cradle');
    if (!marks.grown) {
      world.placeProp('cradle', farmMap.marks.cradle, 'cradle');
      placeImage(world, 'lq-baby', 'down-1', farmMap.marks.cradle, { dy: -4, depth: (farmMap.marks.cradle.y + 1) * 16 + 1 });
    } else {
      world.spawnNpc('lq-8', farmMap.marks.lq, 'down');
    }
  }

  async function wake() {
    hud.update(state);
    hud.show();
    if (marks.woke) return;
    marks.woke = true;
    if (!ctx.reducedMotion) await world.fade('in', 700);
    await world.lookAt(farmMap.marks.cradle, { zoom: 3 });
    await talk('d7.wake.residences');
    await world.lookAtPlayer();
    kit.hint('rest7', 'Rest on the porch steps: days pass, and LQ grows.', 4200);
  }

  async function rest() {
    if (marks.swum && marks.pillow) {
      hud.toast('Alabaster is expecting you at the vineyard.', 2600);
      return;
    }
    if (marks.grown && !marks.swum) {
      hud.toast('LQ wants to swim first: the stone steps, west of the house.', 2600);
      return;
    }
    const choice = await talk('d7.rest.ask');
    if (choice !== 'rest') return;
    if (marks.swum) {
      await pillow();
      return;
    }
    await world.fade('out', 500);
    marks.rests = (marks.rests ?? 0) + 1;
    state.week += 1;
    state.hearts = state.heartsMax;
    state.clock = 6;
    world.setSky(state.clock);
    hud.update(state);
    world.placePlayer('porch');
    if (marks.rests >= 2) {
      marks.grown = true;
      flags.lqBorn = true;
      state.season = 'summer';
      world.setSeason('summer');
      hud.setPlace(world.map.name, 'SUMMER');
    }
    showLq();
    ctx.save?.();
    await world.fade('in', 500);
    if (marks.rests === 1) await talk('d7.grow.brief');
    else if (marks.rests === 2) {
      await talk('d7.grow.doll');
      kit.hint('swim', 'The stone steps west of the house go down to the sea.', 4200);
    }
  }

  // ---------------------------------------------------------------- beat 2: the swim
  async function shore() {
    if (!marks.grown) {
      hud.toast('The sea is cold, and LQ is seventeen pixels. Not yet.', 2600);
      return;
    }
    if (marks.swum) {
      hud.toast('Enough swimming for one day.', 2200);
      return;
    }
    await talk('d7.swim.taught');
    marks.swimScreen = 0;
    marks.swimFurthest = 0;
    lqInWater = true;
    await changeMap(ctx, 'ocean', 'from-shore');
    kit.hint('swimhearts', 'Every screen you cross costs a heart, going out and coming back. Use no more than half.', 6000);
  }

  function enterOcean() {
    setSwimming(world, true);
    swellDeepWater(world);
    swimHud?.remove();
    swimHud = createSwimHud(state);
    hud.setScreens(null);
    if (lqInWater) {
      const lq = world.spawnNpc('lq-swim', { x: oceanWidth - 2, y: 6 }, 'left');
      stopFollow = follow(world, lq);
    }
    crossTo(screenOf(oceanWidth - 3)); // into the water: the first screen
  }

  // Emily crosses into another screen: a heart, out or back. At zero, out at sea, she sinks.
  function crossTo(screen) {
    if (screen === marks.swimScreen) return;
    marks.swimScreen = screen;
    marks.swimFurthest = Math.max(marks.swimFurthest ?? 0, screen);
    kit.loseHearts(1);
    swimHud?.update(screen, lqInWater);
    if (marks.asked && flags.taughtSwim && screen > askAt.screen) flags.wentTooFar = true;
    if (state.hearts === 0 && screen > 0) return beat(drown);
    return undefined;
  }

  async function ask() {
    marks.asked = true;
    stopFollow?.();
    const lq = world.npc('lq-swim');
    lq?.face('right');
    world.facePlayer('right');
    const choice = await talk('d7.lq.screens');
    if (choice === 'on') {
      await talk('d7.lq.alone');
      lqInWater = false;
      swimHud?.update(marks.swimScreen, false);
      lq?.walkPath([{ x: oceanWidth - 2, y: 6 }], 60).then(() => lq?.destroy());
      world.facePlayer('left');
    } else {
      flags.taughtSwim = true;
      if (lq) stopFollow = follow(world, lq);
    }
  }

  async function drown() {
    stopFollow?.();
    marks.drowned = true;
    await world.fade('out', ctx.reducedMotion ? 1 : 1400);
    await dialogue.caption('You ran out of hearts.', { kind: 'world', hold: 2200 });
    lqInWater = false;
    swimHud?.remove();
    swimHud = null;
    state.map = 'foglands';
    state.spawn = 'porch';
    world.enterMap('foglands', 'porch');
    state.hearts = 3;
    state.clock = Math.min(23, state.clock + 3);
    world.setSky(state.clock);
    hud.update(state);
    hud.setPlace(world.map.name);
    ctx.sound?.setPlace(world.map.wind);
    marks.swum = true;
    await world.fade('in', 900);
    await talk('d7.swim.drowned');
  }

  async function backAshore(exit) {
    stopFollow?.();
    swimHud?.remove();
    swimHud = null;
    lqInWater = false;
    marks.swum = true;
    await changeMap(ctx, exit.to, exit.spawn);
    if (!marks.pillow) kit.hint('pillow', 'Rest on the porch steps. Daedalus comes through the portal at night.', 4200);
  }

  // ---------------------------------------------------------------- beat 3: the pillow
  async function pillow() {
    await world.fade('out', 700);
    state.clock = 22;
    world.night();
    world.placePlayer('porch');
    state.hearts = state.heartsMax;
    hud.update(state);
    state.week += 1;
    const choice = await talk('d7.night.reported');
    if (choice === 'go') {
      flags.playedGoDay7 = true;
      state.go.played += 1;
      const result = await playGo(ctx);
      if (result === 'won') state.go.won += 1;
      else if (result) state.go.lost += 1;
      state.go.lastResult = result ?? state.go.lastResult;
    }
    await talk('d7.night.marriage');
    marks.pillow = true;
    state.clock = 7;
    world.setSky(state.clock);
    ctx.save?.();
    await world.fade('in', 700);
    kit.hint('vineyard7', 'Alabaster’s vineyard: the Foglands road west, the track south past the conifers.', 5200);
  }

  // ---------------------------------------------------------------- beat 4: boredom
  async function alabaster() {
    if (!marks.pillow) {
      await talk('d7.vineyard.later');
      return;
    }
    if (marks.ending) return;
    const npc = world.npc('alabaster');
    npc?.face('left');
    world.facePlayer('right');
    await talk('d7.emily.more', { hour: true });
    marks.ending = true;
    state.companions.alabaster += 1;
    hud.setGoal('Good night.');
    await world.dusk(1800);
    await world.fade('out', 900);
    ctx.ended = true;
    hud.hide();
    await ctx.endDay();
  }

  // ---------------------------------------------------------------- moving about
  async function leave(exit) {
    if (state.map === 'ocean') {
      await backAshore(exit);
      return;
    }
    await changeMap(ctx, exit.to, exit.spawn);
  }

  const objectHandlers = {
    porch: rest,
    shore,
    'cabin-door': () => talk('d7.alabaster.again'),
  };
  const npcHandlers = {
    alabaster: () => (marks.ending ? talk('d7.alabaster.again') : alabaster()),
  };
  // Pixel at the hitch: E rides between the farm and town (fast-ride.js).
  const hitch = createHitchRide(ctx, kit, 'd7', { foglands: hitchRoutes.toTown(0), vineyard: hitchRoutes.home() });
  const handlerFor = (target) => {
    if (target.npc === 'pixel') return hitch.handler();
    if (target.npc) return npcHandlers[target.npc] ?? null;
    if (portalLink(state.map, target.id)) return () => travelByPortal(ctx, target.id);
    return objectHandlers[target.id] ?? null;
  };

  const api = {
    start: async () => {
      if (!marks.announced) {
        marks.announced = true;
        await birthCard(ctx, birthText);
      }
      return beat(wake);
    },
    get busy() {
      return kit.busy;
    },

    mapBuilt(mapId) {
      if (mapId === 'ocean') enterOcean();
      else world.setRiding(ridesOn(state, mapId));
      if (mapId !== 'ocean') {
        swimHud?.remove();
        swimHud = null;
      }
      if (mapId === 'foglands') {
        showLq();
        if (flags.boughtHorse) world.showPixel(farmMap.marks.hitch, 'west');
        hitch.hint();
      } else if (mapId === 'vineyard') {
        const vineyard = mapFor('vineyard', 7);
        if (flags.boughtHorse) world.showPixel(vineyard.marks.hitch, 'west');
        if (marks.pillow) world.spawnNpc('alabaster', { x: 13, y: 12 }, 'left');
      }
      if (state.season === 'summer') world.setSeason('summer');
      kit.refreshGoal();
    },

    onTile({ x, map }) {
      if (map !== 'ocean' || kit.busy || ctx.ended) return undefined;
      const sinking = crossTo(screenOf(x));
      if (sinking) return sinking;
      if (!marks.asked && lqInWater && marks.swimScreen === askAt.screen && x <= askAt.x) return beat(ask);
      return undefined;
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
  };

  // ---------------------------------------------------------------- headless walk-through
  // The canon route for check-days.mjs: two Rests, the swim two screens out and back, the
  // pillow and a game of Go, the vineyard. A route that picks 'Keep going' swims west until
  // the hearts run out; the swim steps that no longer apply are passed over.
  const go = (to, spawn) => () => api.onExit({ to, spawn });
  const swimTo = (x) => () => (state.map === 'ocean' ? api.onTile({ x, map: 'ocean' }) : undefined);
  const swimOn = (x) => () => (state.map === 'ocean' && flags.wentTooFar && !flags.taughtSwim ? api.onTile({ x, map: 'ocean' }) : undefined);
  const route = [
    () => api.start(),
    () => api.onInteract({ id: 'porch' }),
    () => api.onInteract({ id: 'porch' }),
    () => api.onInteract({ id: 'shore' }),
    swimTo(185), swimTo(170), swimTo(165), // two screens out: LQ asks
    ...[150, 130, 110, 90, 70, 50, 30, 10].map(swimOn), // only if Emily kept going
    () => (state.map === 'ocean' && flags.taughtSwim ? api.onTile({ x: 185, map: 'ocean' }) : undefined),
    () => (state.map === 'ocean' ? api.onExit({ to: 'foglands', spawn: 'from-shore' }) : undefined),
    () => api.onInteract({ id: 'porch' }),
    go('foglands-road', 'from-east'), go('vineyard', 'from-road'),
    () => api.onInteract({ npc: 'alabaster' }),
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
// DOCTOR AND WIFE ARE HAPPY; BORED. Every sentence authored, in the Editor's voice.
export function writeDay07(state) {
  const { flags, marks } = state;
  const furthest = marks.swimFurthest ?? 0;
  const body = [];
  body.push('Dr. Daedalus and Ms. Marks report that their son, Ludo Quintus, has grown in two seasons from seventeen square pixels to the size of a boy of eight. The household continues to keep two houses and one portal between them.');
  if (marks.drowned) body.push(`Ms. Marks swam ${inWords(furthest)} screens out to sea this week, ran out of hearts, and was found on her own porch steps. The boy swam home by himself, which is more than his mother managed.`);
  else if (flags.wentTooFar) body.push(`Ms. Marks swam ${inWords(furthest)} screens out to sea, farther than she tells her son is wise, and came home on what hearts she had left.`);
  else if (flags.taughtSwim) body.push('Ms. Marks has taught the boy to swim. They go exactly two screens out, and then they come back. This paper commends the arithmetic.');
  else body.push('The boy has yet to be taught to swim, though he lives within sight of the sea.');
  body.push(flags.playedGoDay7
    ? 'The doctor and her wife were seen at their Go board late into the night. Neither would give this paper the score.'
    : 'The Go board stayed in its box one evening this week, which those who know the couple will find remarkable.');
  body.push(flags.toldEngines
    ? 'At the vineyard, Ms. Marks confided to Alabaster Brown that she once built engines, one of which made the light of the sun. This paper would like to see it.'
    : 'At the vineyard, Ms. Marks told Alabaster Brown that there must be more to life. Alabaster Brown said that this is what most of us call happiness.');
  body.push('Friendship wishes the family well, and something to do.');
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Summer · Year 3',
    headline: 'DOCTOR AND WIFE ARE HAPPY; BORED',
    body,
  };
}

// ---------------------------------------------------------------- state
export const flags = {
  lqBorn: false,
  taughtSwim: false,
  wentTooFar: false,
  playedGoDay7: false,
  toldEngines: false,
};

export const speakers = {
  lq: { name: 'LQ', portrait: 'lq-neutral' },
  alabaster: { name: 'Alabaster Brown', portrait: 'alabaster-neutral' },
};

// The book's Day 7: LQ grows, learns to swim two screens out and back, the Go board comes
// out at night, and Emily tells Alabaster about the engines.
export function canonDay07(state) {
  Object.assign(state.flags, { lqBorn: true, taughtSwim: true, playedGoDay7: true, toldEngines: true });
  state.go.played += 1;
  state.companions.alabaster += 1;
  state.week = 3;
  return state;
}

export const presetDay07 = () => presetDay(7);

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 7,
  title: 'Seventeen pixels',
  headline: 'DOCTOR AND WIFE ARE HAPPY; BORED',
  season: 'spring',
  seasonName: 'Spring',
  goal: 'Teach him to swim.',
  start: { map: 'foglands', spawn: 'porch' },
  flags,
  speakers,
  canon: canonDay07,
  nodes,
  skipPoints,
  extraLines: ['L7.01'], // printed on the birth announcement card
  create: createDay07,
  write: writeDay07,
  preset: presetDay07,
};
