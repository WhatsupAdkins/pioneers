// Day 6, WEDDING ANNOUNCEMENT (GAME-PLAN-DAYS §B Day 6), winter. Everything of this day in
// one file: its record for the registry (`day`, at the end), flags, the book's outcome
// (canonDay06), nodes, beats, the paper (writeDay06), Ending A and presetDay06.
//
// Emily talks the proposal over with Alabaster at the vineyard; that night she dreams of her
// pixelated child (the womb, drawn in art/days/day06.js); for weeks she avoids the doctor,
// with six hearts at most and the road costing two each way; then Daedalus brings the Xyzzy
// portal, and Alabaster tries it. On the porch steps Emily decides: marry Daedalus (the book:
// the wedding in the square, the snow, the glass flowers, the hedge maze) or leave
// Friendship (Ending A, "A SHORTER GAME", which returns to the title). If Day 5 ended with
// "Yes.", the day opens on the wedding. The paper is the book's announcement.
//
// Node ids: d6.<speaker>.<topic>. Lines quoted from the book are `src` (L6.xx in lines.js);
// everything else is `authored` and only connects.
import { changeMap, screensFromTown } from '../transitions.js';
import { createDayKit } from './common.js';
import { createHitchRide, hitchNodes, hitchRoutes } from './fast-ride.js';
import { addItem, hasItem } from '../inventory.js';
import { mapFor } from '../../maps/versions.js';
import { presetDay } from './preset.js';
import { lines } from './lines.js';
import { plotTile } from './day02.js';
import { unlockDay } from '../state.js';
import { drawIcon } from '../hud.js';
import { npcKey, placeBlock, placeEmily, spawnDaedalus } from '../world/day05.js';
import { portalSpots, showMaze, showPortal, startSnow } from '../world/day06.js';

// Two of Alabaster's lines are the day's Skip points: the twelve marriages (cut at the dash,
// as Emily cuts them off in the book) and al-Khwarizmi.
export const skipPoints = ['d6.alabaster.done-it', 'd6.alabaster.al-khwarizmi'];
export const announcement = ['L6.39', 'L6.40', 'L6.41', 'L6.42', 'L6.43'];
export const endingsKey = 'pioneers.endings';

export const nodes = [
  // beat 1: Alabaster
  { id: 'd6.discuss.reasons', src: 'L6.01', next: 'd6.alabaster.crowded' },
  { id: 'd6.alabaster.crowded', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L6.02', next: 'd6.emily.merits' },
  { id: 'd6.emily.merits', speaker: 'emily', portrait: 'emily-firm', src: 'L6.03', next: 'd6.alabaster.objection' },
  { id: 'd6.alabaster.objection', speaker: 'alabaster', src: 'L6.04', next: 'd6.emily.barely' },
  { id: 'd6.emily.barely', speaker: 'emily', src: 'L6.05', next: 'd6.alabaster.done-it' },
  { id: 'd6.alabaster.done-it', speaker: 'alabaster', src: 'L6.06', skippable: true, onSkip: 'd6.emily.twelve', next: 'd6.emily.twelve' },
  { id: 'd6.emily.twelve', speaker: 'emily', portrait: 'emily-firm', src: 'L6.07', next: 'd6.alabaster.no-worse' },
  { id: 'd6.alabaster.no-worse', speaker: 'alabaster', src: 'L6.08', next: 'd6.emily.about-face' },
  { id: 'd6.emily.about-face', speaker: 'emily', src: 'L6.09', next: 'd6.alabaster.pleasure' },
  { id: 'd6.alabaster.pleasure', speaker: 'alabaster', src: 'L6.10', next: 'd6.discuss.stomach' },
  { id: 'd6.discuss.stomach', src: 'L6.11', next: 'd6.alabaster.months' },
  { id: 'd6.alabaster.months', speaker: 'alabaster', src: 'L6.12', next: 'd6.emily.eleven' },
  { id: 'd6.emily.eleven', speaker: 'emily', src: 'L6.13', next: 'd6.alabaster.waiting' },
  { id: 'd6.alabaster.waiting', speaker: 'alabaster', src: 'L6.14', next: 'd6.emily.conventional' },
  { id: 'd6.emily.conventional', speaker: 'emily', portrait: 'emily-firm', src: 'L6.15', next: 'd6.alabaster.force' },
  { id: 'd6.alabaster.force', speaker: 'alabaster', src: 'L6.16', next: 'd6.emily.what-force' },
  { id: 'd6.emily.what-force', speaker: 'emily', src: 'L6.17', next: 'd6.alabaster.algorithm' },
  { id: 'd6.alabaster.algorithm', speaker: 'alabaster', src: 'L6.18', next: 'd6.discuss.spied' },
  { id: 'd6.discuss.spied', src: 'L6.19', next: 'd6.alabaster.al-khwarizmi' },
  { id: 'd6.alabaster.al-khwarizmi', speaker: 'alabaster', src: 'L6.20', skippable: true, onSkip: 'd6.emily.skip', next: 'd6.emily.superstitious' },
  { id: 'd6.emily.skip', speaker: 'emily', portrait: 'emily-firm', text: 'Skip.', authored: true, next: 'd6.emily.superstitious' },
  { id: 'd6.emily.superstitious', speaker: 'emily', src: 'L6.21', next: 'd6.alabaster.maybe' },
  { id: 'd6.alabaster.maybe', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L6.22', next: 'd6.emily.rules' },
  { id: 'd6.emily.rules', speaker: 'emily', portrait: 'emily-firm', src: 'L6.23' },
  { id: 'd6.alabaster.again', speaker: 'alabaster', text: 'Go home, Emily. Sleep on it.', authored: true },
  { id: 'd6.store.quiet', kind: 'narration', text: 'The day book, the bell, the cash box. A quiet week at Friendship Books.', authored: true },

  // the porch steps
  {
    id: 'd6.rest.ask',
    kind: 'narration',
    text: 'The porch steps. Rest here until morning?',
    authored: true,
    choices: [
      { label: 'Rest until morning', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },
  {
    id: 'd6.rest.week',
    kind: 'narration',
    text: 'The porch steps. Let another week go by?',
    authored: true,
    choices: [
      { label: 'Rest a week', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },

  // beats 2–3: the dream, the weeks apart
  { id: 'd6.dream.night', src: 'L6.24' },
  { id: 'd6.avoid.weeks', src: 'L6.25' },

  // beat 4: the portal
  { id: 'd6.portal.came', src: 'L6.26', next: 'd6.daedalus.xyzzy' },
  { id: 'd6.daedalus.xyzzy', speaker: 'daedalus', src: 'L6.27', next: 'd6.portal.installed' },
  { id: 'd6.portal.installed', src: 'L6.28', cue: 'portal' },
  { id: 'd6.portal.dots', kind: 'world', text: '∵', authored: true },
  { id: 'd6.portal.studied', src: 'L6.29', next: 'd6.emily.therefore' },
  { id: 'd6.emily.therefore', speaker: 'emily', src: 'L6.30', next: 'd6.daedalus.because' },
  { id: 'd6.daedalus.because', speaker: 'daedalus', src: 'L6.31', next: 'd6.daedalus.convenience' },
  { id: 'd6.daedalus.convenience', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L6.32' },

  // beat 5: Alabaster tries it
  { id: 'd6.portal.night', src: 'L6.33' },
  { id: 'd6.alabaster.works', speaker: 'alabaster', src: 'L6.34', next: 'd6.portal.decanted' },
  { id: 'd6.portal.decanted', src: 'L6.35' },
  { id: 'd6.alabaster.romantic', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L6.36', next: 'd6.emily.suppose' },
  { id: 'd6.emily.suppose', speaker: 'emily', portrait: 'emily-soft', src: 'L6.37', next: 'd6.alabaster.love' },
  { id: 'd6.alabaster.love', speaker: 'alabaster', src: 'L6.38' },

  // beat 6: the decision
  {
    id: 'd6.decide.choice',
    kind: 'narration',
    text: 'The porch steps. Daedalus is waiting for an answer.',
    authored: true,
    choices: [
      { label: 'Marry Daedalus', authored: true, silent: true, value: 'marry' },
      { label: 'Leave Friendship', authored: true, silent: true, value: 'leave' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },
  {
    id: 'd6.decide.sure',
    kind: 'narration',
    text: 'Leave Friendship, and everything in it?',
    authored: true,
    choices: [
      { label: 'Leave', authored: true, silent: true, value: 'leave' },
      { label: 'Stay', authored: true, silent: true, value: 'stay' },
    ],
  },
  // Ending A
  { id: 'd6.leave.unanswered', kind: 'narration', text: 'Emily left the proposal unanswered and the portal standing by her door.', authored: true, next: 'd6.leave.train' },
  { id: 'd6.leave.train', kind: 'narration', text: 'She rode Pixel to the depot one last time and took the train out of Friendship.', authored: true },
  { id: 'd6.leave.left', kind: 'world', text: 'Emily has left Friendship.', authored: true },
  { id: 'd6.ending.title', kind: 'world', text: 'A SHORTER GAME', authored: true },
  {
    id: 'd6.ending.card',
    kind: 'paper',
    text: 'Miss Emily B. Marks of Upper Foglands has left Friendship by the morning train, with her horse and without a word to this office. Her farm grew rocks. A doctor in Verdant Valley is said to have asked her a question she did not answer. The portal by her door still stands. This paper had meant to wish her luck again; it will keep the type set, in case.',
    authored: true,
  },

  // beat 7: the wedding
  { id: 'd6.wedding.square', kind: 'narration', text: 'They were married in the town square.', authored: true, next: 'd6.wedding.flowers' },
  { id: 'd6.wedding.flowers', kind: 'narration', text: 'Daedalus had blown a dozen flowers from glass for Emily to carry.', authored: true },
  { id: 'd6.editor.gathered', speaker: 'editor', text: 'We are gathered here: the bride, the doctor, the vintner, the horse, and this paper.', authored: true, next: 'd6.editor.married' },
  { id: 'd6.editor.married', speaker: 'editor', portrait: 'editor-keen', cue: 'snow', text: 'By the authority of the Friendship Mirror, which is the only authority this town has ever had: you are married.', authored: true, next: 'd6.daedalus.vow' },
  { id: 'd6.daedalus.vow', speaker: 'daedalus', portrait: 'daedalus-pleased', text: 'No stops, then.', authored: true, next: 'd6.emily.cold' },
  { id: 'd6.emily.cold', speaker: 'emily', portrait: 'emily-soft', text: 'I don’t feel the cold.', authored: true },
  // the hedge maze
  { id: 'd6.maze.gift', kind: 'narration', text: 'In the garden by the house stood the doctor’s wedding gift: a hedge maze, cut in topiary.', authored: true, next: 'd6.emily.why-maze' },
  { id: 'd6.emily.why-maze', speaker: 'emily', text: 'Why a maze?', authored: true, next: 'd6.daedalus.imagine' },
  { id: 'd6.daedalus.imagine', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L6.44' },
  { id: 'd6.maze.top', kind: 'narration', text: 'From the top lane of the maze she could see the house, the sea, and the doctor waiting at the foot.', authored: true },
  // Pixel at the hitch: face her and press E to ride (fast-ride.js)
  ...hitchNodes('d6', ['to-town', 'home']),
];
const byId = new Map(nodes.map((node) => [node.id, node]));

// Emily rides on roads and in town; she gets down at home and at the vineyard.
export const ridesOn = (state, mapId) => Boolean(state.flags.boughtHorse) && (mapId === 'friendship' || mapId === 'foglands-road');

// The HUD's "Now:" line (GAME-PLAN-DAYS §A.3), from the state alone.
export function goalDay06(state) {
  const { flags } = state;
  const at = state.map;
  if (flags.married) {
    if (flags.walkedMaze) return 'Good night.';
    return at === 'foglands' ? 'Walk the hedge maze: in at one foot, round the top, out at the other.' : 'Go home to the hedge maze.';
  }
  if (flags.acceptedAtOnce) return 'The wedding.';
  if (!flags.askedAlabaster) return at === 'vineyard' ? 'Alabaster is by the cabin door.' : 'Talk it over with Alabaster, at the vineyard south off the Foglands road.';
  if (!flags.dreamed) return at === 'foglands' ? 'Rest on the porch steps.' : 'Go home to Upper Foglands and rest.';
  if (!flags.portalBuilt) {
    if (flags.avoidWeeks >= 2) return at === 'store' ? 'Mind the store.' : at === 'friendship' ? 'Friendship Books: the door on the square.' : 'Ride to town and mind the store.';
    const left = Math.max(1, 2 - flags.avoidWeeks);
    return at === 'foglands' ? `Keep to yourself: rest on the porch steps (${left === 1 ? 'one more week' : 'two weeks'}).` : 'Keep to yourself. Go home and rest.';
  }
  return at === 'foglands' ? 'Decide, on the porch steps.' : at === 'store' ? 'Decide. The portal on the back wall goes home.' : 'Decide. Go home to the porch steps.';
}

// ---------------------------------------------------------------- DOM pieces (the browser only)
const hasDom = () => typeof document !== 'undefined' && Boolean(document.getElementById('frame'));

function useCss() {
  if (!hasDom() || document.querySelector('link[data-day="06"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../css/day06.css', import.meta.url).href;
  link.dataset.day = '06';
  document.head.append(link);
}

// The lucid dream: black, and the 32×32 womb with its seventeen-pixel child, flickering.
function showWomb({ reducedMotion }) {
  if (!hasDom()) return { remove() {} };
  const layer = document.createElement('div');
  layer.className = 'day06-dream';
  layer.setAttribute('aria-hidden', 'true');
  const full = drawIcon(document.createElement('canvas'), 'womb');
  const empty = drawIcon(document.createElement('canvas'), 'womb-empty');
  empty.className = 'day06-dream-empty';
  layer.append(full, empty);
  document.getElementById('frame').append(layer);
  let on = true;
  const timer = reducedMotion ? null : setInterval(() => {
    on = !on;
    empty.hidden = on;
  }, 180);
  empty.hidden = true;
  return {
    remove() {
      clearInterval(timer);
      layer.remove();
    },
  };
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// "Emily has left Friendship." on black, then the ending card; resolves on its button.
async function showEndingA({ reducedMotion }) {
  if (!hasDom()) return;
  const frame = document.getElementById('frame');
  const left = document.createElement('p');
  left.className = 'day06-left';
  left.setAttribute('role', 'status');
  left.textContent = byId.get('d6.leave.left').text;
  frame.append(left);
  await pause(reducedMotion ? 1200 : 3000);
  left.textContent = ''; // the black stays behind the card
  const card = document.createElement('section');
  card.className = 'panel day06-ending';
  card.setAttribute('aria-labelledby', 'day06-ending-title');
  card.innerHTML = '<p class="card-over">Ending A</p><h2 id="day06-ending-title"></h2><p class="day06-ending-text"></p><div class="panel-actions"><button type="button">Return to title</button></div>';
  card.querySelector('h2').textContent = byId.get('d6.ending.title').text;
  card.querySelector('.day06-ending-text').textContent = byId.get('d6.ending.card').text;
  frame.append(card);
  const button = card.querySelector('button');
  button.focus();
  await new Promise((resolve) => button.addEventListener('click', resolve, { once: true }));
}

export function readEndings(storage = globalThis.localStorage) {
  try {
    return JSON.parse(storage?.getItem(endingsKey) ?? '{}') ?? {};
  } catch {
    return {};
  }
}

function recordEnding(name, storage = globalThis.localStorage) {
  try {
    storage?.setItem(endingsKey, JSON.stringify({ ...readEndings(storage), [name]: true }));
  } catch {
    // private mode: the mark is simply not kept
  }
}

export function createDay06(ctx) {
  const { state, world, dialogue, hud } = ctx;
  const { flags, marks } = state;
  useCss();
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  kit.goalOf = () => goalDay06(state);
  const farmMap = mapFor('foglands', state.day);
  const vineyardMap = mapFor('vineyard', state.day);
  const storeMap = mapFor('store', state.day);
  const wedding = { emily: { x: 26, y: 15 }, editor: { x: 26, y: 13 }, doctor: { x: 27, y: 15 }, alabaster: { x: 29, y: 15 }, pixel: { x: 22, y: 15 } };
  const mazeDoctor = { x: 23, y: 16 };
  let stopSnow = null;

  function snow(on) {
    if (on && !stopSnow) stopSnow = startSnow(world, { reducedMotion: ctx.reducedMotion });
    if (!on && stopSnow) {
      stopSnow();
      stopSnow = null;
    }
  }

  // A cut inside a beat (the caller fades): rebuild at a spawn, set the clock.
  function cutTo(mapId, spawn, clock = state.clock) {
    state.map = mapId;
    state.spawn = spawn;
    world.enterMap(mapId, spawn);
    state.clock = clock;
    world.setSky(state.clock);
    hud.setPlace(world.map.name);
    hud.setScreens(null);
    ctx.sound?.setPlace(world.map.wind);
  }

  const wait = (ms) => (ctx.reducedMotion || !hasDom() ? Promise.resolve() : pause(ms));

  // ---------------------------------------------------------------- the morning
  async function wake() {
    hud.update(state);
    hud.show();
    if (flags.married && !flags.walkedMaze) snow(true);
    if (marks.woke) return;
    marks.woke = true;
    if (!ctx.reducedMotion) await world.fade('in', 900);
    if (flags.acceptedAtOnce && !flags.married) {
      await marry();
      return;
    }
    kit.hint('day6', 'Winter. The doctor’s proposal is still open. Alabaster gives advice, whether or not it is asked for.', 5200);
  }

  // ---------------------------------------------------------------- beat 1: Alabaster
  async function alabaster() {
    const npc = world.npc('alabaster');
    npc?.face({ up: 'down', down: 'up', left: 'right', right: 'left' }[world.player?.face] ?? 'down');
    if (flags.askedAlabaster) {
      await talk('d6.alabaster.again');
      return;
    }
    await talk('d6.discuss.reasons', { hour: true });
    flags.askedAlabaster = true;
    state.companions.alabaster += 1;
  }

  // ---------------------------------------------------------------- the porch
  async function rest() {
    if (flags.married) return;
    if (flags.alabasterTried) {
      await decide();
      return;
    }
    if (flags.dreamed && !flags.portalBuilt) {
      await weekApart();
      return;
    }
    if ((await talk('d6.rest.ask')) !== 'rest') return;
    if (flags.askedAlabaster) {
      await dream();
      return;
    }
    await world.fade('out', 500);
    state.week += 1;
    state.hearts = state.heartsMax;
    state.clock = 6;
    world.setSky(state.clock);
    world.placePlayer('porch');
    hud.update(state);
    ctx.save?.();
    await world.fade('in', 500);
    hud.toast('You rest. Hearts restored.', 2600);
  }

  // ---------------------------------------------------------------- beats 2–3: the dream, the weeks apart
  async function dream() {
    await world.fade('out', 900);
    state.week += 1;
    const womb = showWomb(ctx);
    await wait(2000);
    await talk('d6.dream.night');
    womb.remove();
    flags.dreamed = true;
    state.heartsMax = 6;
    state.hearts = 6;
    hud.update(state);
    state.clock = 7;
    world.setSky(state.clock);
    world.placePlayer('porch');
    ctx.save?.();
    await world.fade('in', 700);
    await talk('d6.avoid.weeks');
    kit.hint('avoid', 'Six hearts at most, for now, and the road costs two each way.', 6000);
  }

  async function weekApart() {
    if ((await talk('d6.rest.week')) !== 'rest') return;
    await world.fade('out', 500);
    state.week += 1;
    flags.avoidWeeks += 1;
    state.hearts = state.heartsMax;
    state.clock = 7;
    world.setSky(state.clock);
    world.placePlayer('porch');
    hud.update(state);
    ctx.save?.();
    await world.fade('in', 500);
    if (flags.avoidWeeks < 2) {
      hud.toast('A week goes by. You keep away from Verdant Valley.', 3000);
      return;
    }
    hud.toast('Two weeks. Mind the store: Friendship Books, in town.', 3600);
  }

  // The store: after the weeks apart, Daedalus comes to it (L6.26).
  async function enterStore() {
    await changeMap(ctx, 'store', 'door');
    if (flags.avoidWeeks >= 2 && !flags.portalBuilt) await portalScene();
  }

  // ---------------------------------------------------------------- beats 4–5: the portal
  async function portalScene() {
    const { visitorIn } = storeMap.marks;
    const stand = { x: 7, y: 5 }; // beside Emily at the counter
    placeEmily(world, storeMap.spawns.counter, 'left');
    await wait(500);
    const doc = spawnDaedalus(world, { x: visitorIn.x, y: visitorIn.y + 1 }, 'up');
    await doc?.walkPath([{ x: visitorIn.x, y: stand.y }, stand], 50);
    doc?.face('right');
    world.facePlayer('left');
    await talk('d6.portal.came', { hour: true });
    await dialogue.caption(byId.get('d6.portal.dots').text, { kind: 'world', hold: 1600 });
    await talk('d6.portal.studied');
    flags.portalBuilt = true;
    state.companions.daedalus += 1;
    await doc?.walkPath([{ x: visitorIn.x, y: stand.y }, { x: visitorIn.x, y: visitorIn.y + 1 }], 55);
    doc?.destroy?.();
    kit.hint('portal', 'The Xyzzy portal: face it and press E. It goes between the store and home, and costs no hearts.', 6000);
    await alabasterTries();
  }

  async function alabasterTries() {
    await world.fade('out', 600);
    cutTo('foglands', 'porch', 21);
    await world.fade('in', 600);
    await talk('d6.portal.night');
    const from = farmMap.spawns['from-road'];
    const front = portalSpots.foglands.out;
    const al = world.spawnNpc('alabaster', from, 'left');
    await al?.walkPath([{ x: 16, y: 17 }, { x: 16, y: 10 }, { x: 17, y: 10 }, front], 60);
    al?.face('up');
    const glow = placeBlock(world, 'portal-lit', portalSpots.foglands.block);
    al?.sprite?.setVisible?.(false);
    await wait(1000);
    al?.sprite?.setVisible?.(true);
    glow?.forEach((image) => image.destroy());
    await talk('d6.alabaster.works');
    await al?.walkPath([{ x: 17, y: 10 }, { x: 14, y: 10 }], 55);
    al?.face('up');
    world.facePlayer('down');
    await talk('d6.alabaster.romantic');
    flags.alabasterTried = true;
    state.companions.alabaster += 1;
    al?.walkPath([{ x: 16, y: 10 }, { x: 16, y: 17 }, from], 60).then(() => al.destroy?.());
    ctx.save?.();
    kit.hint('decide', 'Decide, on the porch steps.', 4200);
  }

  async function portal() {
    const dest = portalSpots[state.map]?.to;
    if (!dest) return;
    const spot = portalSpots[dest];
    ctx.sound?.play('step');
    await world.fade('out', 300);
    cutTo(dest, spot.spawn);
    placeEmily(world, spot.out, 'down');
    await world.fade('in', 300);
  }

  // ---------------------------------------------------------------- beat 6: the decision
  async function decide() {
    const choice = await talk('d6.decide.choice');
    if (choice === 'marry') await marry();
    else if (choice === 'leave' && (await talk('d6.decide.sure')) === 'leave') await endingA();
  }

  // Ending A: no paper; the ending card, then the title. The save is left at the morning
  // before the decision, so Continue offers the decision again.
  async function endingA() {
    flags.endingA = true;
    await talk('d6.leave.unanswered');
    await world.fade('out', 1200);
    snow(false);
    ctx.ended = true;
    hud.hide();
    hud.setGoal('');
    recordEnding('A');
    unlockDay(6);
    marks.endingCard = true;
    await showEndingA(ctx);
    if (hasDom()) location.reload();
  }

  // ---------------------------------------------------------------- beat 7: the wedding, the maze
  async function marry() {
    flags.married = true;
    flags.proposalPending = false;
    await world.fade('out', 900);
    state.heartsMax = 10;
    state.hearts = 10;
    hud.update(state);
    cutTo('friendship', 'from-east', 11);
    world.setRiding(false);
    placeEmily(world, wedding.emily, 'up');
    world.spawnNpc('editor', wedding.editor, 'down');
    spawnDaedalus(world, wedding.doctor, 'up');
    world.spawnNpc('alabaster', wedding.alabaster, 'left');
    if (flags.boughtHorse) world.showPixel(wedding.pixel, 'east');
    await world.fade('in', 900);
    await talk('d6.wedding.square');
    kit.give('glass-flowers', 1, 'Glass flowers');
    await talk('d6.editor.gathered', { hour: true });
    state.companions.daedalus += 1;
    await world.fade('out', 900);
    cutTo('foglands', 'porch', 15);
    placeEmily(world, { x: 21, y: 16 }, 'up');
    await world.fade('in', 900);
    await talk('d6.maze.gift');
    ctx.save?.();
    kit.hint('maze', 'The hedge maze: in at one foot, round the top lane, and out at the other.', 5200);
  }

  async function mazeTop() {
    if (marks.mazeTop || !flags.married) return;
    marks.mazeTop = true;
    await talk('d6.maze.top');
  }

  async function mazeOut() {
    if (!marks.mazeTop || flags.walkedMaze) return;
    flags.walkedMaze = true;
    hud.setGoal('Good night.');
    const doc = world.npc(npcKey(world));
    doc?.face('up');
    await world.dusk(1800);
    await world.fade('out', 1000);
    snow(false);
    ctx.ended = true;
    hud.hide();
    await ctx.endDay();
  }

  // ---------------------------------------------------------------- moving about
  function roadToll() {
    const riding = ridesOn(state, 'foglands-road');
    const apart = flags.dreamed && !flags.married;
    kit.loseHearts((riding ? 1 : 2) + (apart ? 1 : 0));
    if (apart) kit.hint('road6', 'The commute feels longer than ever: two hearts each way.');
    else kit.hint('road', riding ? 'The road costs a heart each way on horseback.' : 'The road costs two hearts each way on foot.');
  }

  // ---------------------------------------------------------------- E targets
  const objectHandlers = {
    porch: rest,
    portal,
    'store-door': enterStore,
    stock: () => talk('d6.store.quiet'),
  };
  const npcHandlers = { alabaster: () => (state.map === 'vineyard' ? alabaster() : undefined) };
  // Pixel at the hitch: E rides between the farm and town (fast-ride.js).
  const hitch = createHitchRide(ctx, kit, 'd6', { foglands: hitchRoutes.toTown(() => 1 + (flags.dreamed && !flags.married ? 1 : 0)), vineyard: hitchRoutes.home() });
  const handlerFor = (target) => {
    if (target.npc === 'pixel') return hitch.handler();
    if (target.npc) return target.npc === 'alabaster' && state.map === 'vineyard' ? npcHandlers.alabaster : null;
    if (target.id === 'portal' && !flags.portalBuilt) return null;
    if (target.id === 'porch' && flags.married) return null;
    return objectHandlers[target.id];
  };

  const api = {
    start: () => beat(wake),
    get busy() {
      return kit.busy;
    },

    mapBuilt(mapId) {
      world.setRiding(ridesOn(state, mapId));
      if (mapId === 'foglands') {
        state.farm.plots.forEach((plot) => world.setGroundTile(plot.x, plot.y, plotTile(plot)));
        if (flags.boughtHorse) world.showPixel(farmMap.marks.hitch, 'west');
        hitch.hint();
        if (flags.portalBuilt) showPortal(world, 'foglands');
        if (flags.married) {
          showMaze(world);
          if (!flags.walkedMaze) spawnDaedalus(world, mazeDoctor, 'left');
        }
      } else if (mapId === 'store') {
        if (flags.portalBuilt) showPortal(world, 'store');
      } else if (mapId === 'vineyard') {
        if (flags.boughtHorse) world.showPixel(vineyardMap.marks.hitch, 'west');
        if (!flags.married) world.spawnNpc('alabaster', { x: 13, y: 11 }, 'left');
      }
      kit.refreshGoal();
    },

    onTile({ x, map }) {
      if (map === 'foglands-road') hud.setScreens(screensFromTown(x));
    },

    onTrigger(object) {
      if (object.id === 'halfway') roadToll();
      else if (object.id === 'maze-top') return beat(mazeTop);
      else if (object.id === 'maze-out') return beat(mazeOut);
      return undefined;
    },

    onExit(exit) {
      return beat(() => changeMap(ctx, exit.to, exit.spawn));
    },

    canInteract(target) {
      return Boolean(handlerFor(target));
    },

    onInteract(target) {
      const handler = handlerFor(target);
      return handler ? beat(handler) : undefined;
    },

    cue(name) {
      if (name === 'portal' && portalSpots[state.map]) showPortal(world, state.map);
      if (name === 'snow') snow(true);
    },
  };

  // ---------------------------------------------------------------- headless walk-through
  // The canon route for check-days.mjs, one step per call: Alabaster at the vineyard, the
  // dream, two weeks apart, the store and the portal, Alabaster's try, the portal both ways, the
  // decision, the wedding, round the maze. checks/day06.mjs also drives Ending A and the
  // day after "Yes." with its own stand-ins.
  const go = (to, spawn) => () => api.onExit({ to, spawn });
  const route = [
    () => api.start(),
    go('foglands-road', 'from-east'), () => api.onTrigger({ id: 'halfway' }), go('vineyard', 'from-road'),
    () => api.onInteract({ npc: 'alabaster' }),
    go('foglands-road', 'from-vineyard'), go('foglands', 'from-road'),
    () => api.onInteract({ id: 'porch' }), // the dream
    () => api.onInteract({ id: 'porch' }), // a week apart
    () => api.onInteract({ id: 'porch' }), // a second week
    go('foglands-road', 'from-east'), () => api.onTrigger({ id: 'halfway' }), go('friendship', 'from-east'),
    () => api.onInteract({ id: 'store-door' }), // Daedalus brings the portal; Alabaster tries it that night
    () => api.onInteract({ id: 'portal' }), // to the store
    () => api.onInteract({ id: 'portal' }), // and home
    () => api.onInteract({ id: 'porch' }), // the decision
    () => api.onTrigger({ id: 'maze-top' }),
    () => api.onTrigger({ id: 'maze-out' }),
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
// WEDDING ANNOUNCEMENT: the book's announcement (L6.39–L6.43), its middle paragraph split at
// its sentences. After "Yes." on the road, the reason given for the marriage is the one
// sentence written for the game.
export const acceptedAtOnceLine = 'The couple had been playing games of Go since the autumn, and Ms. Marks reported that she accepted the doctor’s proposal on the spot, in the mist at the Foglands line, without stopping to think.';
export function writeDay06(state) {
  const horse = state.flags.horseName || 'Pixel';
  const body = announcement.map((id) => lines[id].text.replace(/Pixel/g, horse));
  if (state.flags.acceptedAtOnce) body[3] = acceptedAtOnceLine;
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Winter · Year 2',
    headline: 'WEDDING ANNOUNCEMENT',
    body,
  };
}

// ---------------------------------------------------------------- state
export const flags = {
  askedAlabaster: false,
  dreamed: false,
  avoidWeeks: 0,
  portalBuilt: false,
  alabasterTried: false,
  married: false,
  walkedMaze: false,
  endingA: false,
};

// The book's Day 6: Alabaster consulted, the dream, the weeks apart, the portal, the
// wedding and the maze.
export function canonDay06(state) {
  Object.assign(state.flags, {
    askedAlabaster: true, dreamed: true, avoidWeeks: 2, portalBuilt: true, alabasterTried: true,
    married: true, walkedMaze: true, proposalPending: false, endingA: false,
  });
  state.heartsMax = 10;
  state.companions.alabaster += 2;
  state.companions.daedalus += 2;
  state.week += 3;
  if (!hasItem(state, 'glass-flowers')) addItem(state, 'glass-flowers');
  return state;
}

export const presetDay06 = () => presetDay(6);

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 6,
  title: 'Because',
  headline: 'WEDDING ANNOUNCEMENT',
  season: 'winter',
  seasonName: 'Winter',
  goal: 'Decide.',
  start: { map: 'foglands', spawn: 'porch' },
  flags,
  canon: canonDay06,
  nodes,
  skipPoints,
  extraLines: announcement,
  create: createDay06,
  write: writeDay06,
  preset: presetDay06,
  // Day select marks Day 6 once Ending A has been reached (game/menu.js reads it)
  selectNote: () => (readEndings().A ? 'Ending A' : ''),
};
