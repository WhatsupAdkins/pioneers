// Day 5, DOCTOR SEEKS GAMER (GAME-PLAN-DAYS §B Day 5), autumn into winter. Everything of
// this day in one file: its record for the registry (`day`, at the end), flags, the book's
// outcome (canonDay05), nodes, beats, the paper (writeDay05) and presetDay05.
//
// The advertisement on the town board; a Rest to Tuesday night; the ride north off the
// Foglands road to Verdant Valley, where Dr. Daedalus waits in her doorway; Go explained in
// her library and three real games (game/go/view.js, Normal level), won or lost; then the
// Tuesdays of the fall, one per Rest, each played or skipped, until Emily wins one (or the
// fourth Tuesday is reached; the fall always runs into December). The doctor walks her home the long way, past the
// bison, and proposes in the Foglands mist: "Let me think." (the book's road, Day 6) or "Yes."
//
// Node ids: d5.<speaker>.<topic>. Lines quoted from the book are `src` (L5.xx in lines.js);
// everything else is `authored` and only connects. Choices that work like menus ("Rest",
// "Play") are `silent`: picked, not spoken.
import { changeMap, screensFromTown } from '../transitions.js';
import { createDayKit } from './common.js';
import { createFastRide, rideNodes } from './fast-ride.js';
import { inWords } from '../newspaper.js';
import { mapFor } from '../../maps/versions.js';
import { presetDay } from './preset.js';
import { lines } from './lines.js';
import { plotTile } from './day02.js';
import { createGoView } from '../go/view.js';
import { white } from '../go/engine.js';
import { follow, grazeBison, kneel, npcKey, placeEmily, spawnDaedalus } from '../world/day05.js';

export const skipPoints = []; // the book gives Day 5 no Skip
export const adLine = 'L5.26';
const months = ['October', 'November', 'December', 'December'];

export const nodes = [
  // beat 1: the town board
  { id: 'd5.board.ad', src: 'L5.01', set: { sawAd: true }, next: 'd5.board.notice' },
  { id: 'd5.board.notice', src: 'L5.02' },

  // the porch steps
  {
    id: 'd5.rest.ask',
    kind: 'narration',
    text: 'The porch steps. Rest here until morning?',
    authored: true,
    choices: [
      { label: 'Rest until morning', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },
  {
    id: 'd5.rest.tuesday',
    kind: 'narration',
    text: 'The porch steps. Rest until Tuesday evening?',
    authored: true,
    choices: [
      { label: 'Rest until Tuesday', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd5.rest.tonight', kind: 'narration', text: 'It is Tuesday evening. Verdant Valley, at 8 p.m.', authored: true },

  // beat 2: Tuesday night
  { id: 'd5.ride.tuesday', src: 'L5.03' },
  { id: 'd5.door.closed', kind: 'narration', text: 'No one answers. A card in the window reads TUESDAYS, 8 P.M.', authored: true },
  { id: 'd5.sign.valley', kind: 'narration', text: 'EAST: UPPER FOGLANDS, THE LONG WAY.', authored: true },
  { id: 'd5.arrive.doorway', src: 'L5.04', next: 'd5.daedalus.welcome' },
  { id: 'd5.daedalus.welcome', speaker: 'daedalus', src: 'L5.05', next: 'd5.arrive.unsurprised' },
  { id: 'd5.arrive.unsurprised', src: 'L5.06', next: 'd5.arrive.house' },
  { id: 'd5.arrive.house', src: 'L5.07', next: 'd5.emily.flora' },
  { id: 'd5.emily.flora', speaker: 'emily', src: 'L5.08' },
  { id: 'd5.library.waves', src: 'L5.09', next: 'd5.daedalus.rules' },
  { id: 'd5.daedalus.rules', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L5.10', next: 'd5.library.stones' },
  { id: 'd5.library.stones', src: 'L5.11', next: 'd5.emily.programmer' },
  { id: 'd5.emily.programmer', speaker: 'emily', src: 'L5.12', next: 'd5.daedalus.diviner' },
  { id: 'd5.daedalus.diviner', speaker: 'daedalus', src: 'L5.13', next: 'd5.emily.where' },
  { id: 'd5.emily.where', speaker: 'emily', src: 'L5.14', next: 'd5.daedalus.superstitious' },
  { id: 'd5.daedalus.superstitious', speaker: 'daedalus', src: 'L5.15', next: 'd5.library.hesitated' },
  { id: 'd5.library.hesitated', src: 'L5.16', next: 'd5.daedalus.no-gift' },
  { id: 'd5.daedalus.no-gift', speaker: 'daedalus', src: 'L5.17' },

  // beat 3: after the three games (one of four, by how many Emily won)
  { id: 'd5.games.lost-three', src: 'L5.18' },
  { id: 'd5.games.won-one', kind: 'narration', text: 'Emily lost two of the first three games, and won the other.', authored: true },
  { id: 'd5.games.won-two', kind: 'narration', text: 'Emily won two of the first three games, which surprised them both.', authored: true },
  { id: 'd5.games.won-three', kind: 'narration', text: 'Emily won the first three games. The doctor said nothing about it at all.', authored: true },
  { id: 'd5.emily.heading-back', speaker: 'emily', src: 'L5.19', next: 'd5.daedalus.walk-you' },
  { id: 'd5.emily.heading-back-won', speaker: 'emily', text: 'I should be heading back to Foglands now. I have won enough for one evening.', authored: true, next: 'd5.daedalus.walk-you' },
  { id: 'd5.daedalus.walk-you', speaker: 'daedalus', src: 'L5.20', next: 'd5.emily.far' },
  { id: 'd5.emily.far', speaker: 'emily', src: 'L5.21', next: 'd5.daedalus.worry' },
  { id: 'd5.daedalus.worry', speaker: 'daedalus', src: 'L5.22', next: 'd5.emily.dont' },
  { id: 'd5.emily.dont', speaker: 'emily', portrait: 'emily-firm', src: 'L5.23', next: 'd5.daedalus.next-tuesday' },
  { id: 'd5.daedalus.next-tuesday', speaker: 'daedalus', src: 'L5.24', next: 'd5.emily.edna' },
  { id: 'd5.emily.edna', speaker: 'emily', src: 'L5.25' },
  // (the advertisement, L5.26, crosses the screen here)
  { id: 'd5.daedalus.prefer', speaker: 'daedalus', src: 'L5.27', next: 'd5.emily.syllables' },
  { id: 'd5.emily.syllables', speaker: 'emily', src: 'L5.28' },
  { id: 'd5.ride.home', kind: 'narration', text: 'She rode home to Upper Foglands in the dark.', authored: true },

  // beat 4: the Tuesdays of the fall
  {
    id: 'd5.rest.week',
    kind: 'narration',
    text: 'The porch steps. Rest until next Tuesday?',
    authored: true,
    choices: [
      { label: 'Rest until Tuesday', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd5.tuesday.october', kind: 'world', text: 'A Tuesday in October.', authored: true },
  { id: 'd5.tuesday.november', kind: 'world', text: 'A Tuesday in November.', authored: true },
  { id: 'd5.tuesday.december', kind: 'world', text: 'A Tuesday in December.', authored: true },
  {
    id: 'd5.tuesday.choice',
    kind: 'narration',
    text: 'Tuesday night. The Go table in Verdant Valley.',
    authored: true,
    choices: [
      { label: 'Play', authored: true, silent: true, value: 'play' },
      { label: 'Skip the game', authored: true, silent: true, value: 'skip' },
    ],
  },
  { id: 'd5.tuesday.skipped', kind: 'narration', text: 'Emily stayed home. The board would keep until next Tuesday.', authored: true },
  { id: 'd5.tuesday.lost', kind: 'narration', text: 'She rode home, and the week went by.', authored: true },
  { id: 'd5.montage.fall', src: 'L5.29' },
  { id: 'd5.montage.december', src: 'L5.30' },
  { id: 'd5.montage.forced', kind: 'narration', text: 'In December she won.', authored: true },
  { id: 'd5.montage.again', kind: 'narration', text: 'In December she beat Daedalus again.', authored: true },

  // beat 5: the walk home
  { id: 'd5.walk.insisted', src: 'L5.31' },
  { id: 'd5.daedalus.why', speaker: 'daedalus', src: 'L5.32', next: 'd5.emily.suits' },
  { id: 'd5.emily.suits', speaker: 'emily', portrait: 'emily-firm', src: 'L5.33', next: 'd5.daedalus.curious' },
  { id: 'd5.daedalus.curious', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L5.34', next: 'd5.emily.privacy' },
  { id: 'd5.emily.privacy', speaker: 'emily', src: 'L5.35' },
  { id: 'd5.walk.silence', src: 'L5.36', next: 'd5.emily.easy' },
  { id: 'd5.emily.easy', speaker: 'emily', src: 'L5.37', next: 'd5.emily.partner-died' },
  { id: 'd5.emily.partner-died', speaker: 'emily', src: 'L5.38', next: 'd5.emily.losses' },
  { id: 'd5.emily.losses', speaker: 'emily', src: 'L5.39', next: 'd5.daedalus.partner' },
  { id: 'd5.daedalus.partner', speaker: 'daedalus', src: 'L5.40', next: 'd5.emily.of-a-sort' },
  { id: 'd5.emily.of-a-sort', speaker: 'emily', src: 'L5.41', next: 'd5.daedalus.helpmate' },
  { id: 'd5.daedalus.helpmate', speaker: 'daedalus', src: 'L5.42', next: 'd5.emily.yes' },
  { id: 'd5.emily.yes', speaker: 'emily', src: 'L5.43' },
  { id: 'd5.walk.field', src: 'L5.44' },
  { id: 'd5.emily.field', speaker: 'emily', src: 'L5.45', next: 'd5.bison.choice' },
  {
    id: 'd5.bison.choice',
    kind: 'narration',
    text: 'The bison look up from the grass.',
    authored: true,
    choices: [
      { label: 'Let them sniff her hand', authored: true, silent: true, value: 'sniff', set: { bisonPetted: true } },
      { label: 'Walk on', authored: true, silent: true, value: 'walk' },
    ],
  },
  { id: 'd5.walk.sniff', src: 'L5.46', next: 'd5.emily.oregon' },
  { id: 'd5.emily.oregon', speaker: 'emily', src: 'L5.47', next: 'd5.daedalus.yes' },
  { id: 'd5.daedalus.yes', speaker: 'daedalus', src: 'L5.48', next: 'd5.emily.protected' },
  { id: 'd5.emily.protected', speaker: 'emily', portrait: 'emily-soft', src: 'L5.49' },
  { id: 'd5.bison.grazing', kind: 'narration', text: 'The bison go on grazing.', authored: true },
  { id: 'd5.bison.sign', kind: 'narration', text: 'DO NOT SHOOT THE BISON.', authored: true },
  { id: 'd5.walk.ahead', kind: 'narration', text: 'Upper Foglands is east, the doctor says.', authored: true },

  // beat 6: the proposal
  { id: 'd5.walk.mists', src: 'L5.50', next: 'd5.daedalus.proposal' },
  { id: 'd5.daedalus.proposal', speaker: 'daedalus', src: 'L5.51', next: 'd5.emily.go-on' },
  { id: 'd5.emily.go-on', speaker: 'emily', src: 'L5.52', next: 'd5.daedalus.partner-to-you' },
  { id: 'd5.daedalus.partner-to-you', speaker: 'daedalus', src: 'L5.53', next: 'd5.walk.knee' },
  { id: 'd5.walk.knee', src: 'L5.54', cue: 'kneel', next: 'd5.daedalus.propose' },
  { id: 'd5.daedalus.propose', speaker: 'daedalus', src: 'L5.55', next: 'd5.emily.marriage' },
  { id: 'd5.emily.marriage', speaker: 'emily', src: 'L5.56', next: 'd5.daedalus.name' },
  { id: 'd5.daedalus.name', speaker: 'daedalus', src: 'L5.57', next: 'd5.emily.mean' },
  { id: 'd5.emily.mean', speaker: 'emily', src: 'L5.58', next: 'd5.daedalus.long-game' },
  { id: 'd5.daedalus.long-game', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L5.59', next: 'd5.emily.answer' },
  {
    id: 'd5.emily.answer',
    speaker: 'emily',
    choices: [
      { label: 'Let me think.', authored: true, value: 'think', set: { proposalPending: true, acceptedAtOnce: false } },
      { label: 'Yes.', authored: true, value: 'yes', set: { acceptedAtOnce: true, proposalPending: false } },
    ],
  },
  { id: 'd5.walk.think', kind: 'narration', text: 'The doctor stood, and did not ask again.', authored: true },
  { id: 'd5.walk.accepted', kind: 'narration', text: 'The doctor stood up out of the mist, still holding her hand.', authored: true },
  ...rideNodes('d5'),
];
const byId = new Map(nodes.map((node) => [node.id, node]));

// Emily rides on roads and in town; she gets down at home and in the valley.
export const ridesOn = (state, mapId) => Boolean(state.flags.boughtHorse) && (mapId === 'friendship' || mapId === 'foglands-road');

// The HUD's "Now:" line (GAME-PLAN-DAYS §A.3), from the state alone.
export function goalDay05(state) {
  const { flags } = state;
  const at = state.map;
  if (flags.walkedHome) return 'Good night.';
  if (flags.wonGo) return 'Walk home with Daedalus, east to the Foglands.';
  if (at === 'daedalus-house') return 'Tuesday night, at the Go table.';
  if (flags.firstTuesday) return at === 'foglands' ? 'Rest on the porch steps until next Tuesday.' : 'Go home to Upper Foglands and rest until Tuesday.';
  if (flags.tuesdayEve) {
    if (at === 'verdant-valley') return 'Dr. Daedalus’s house, at the head of the track.';
    return 'Tuesday, 8 p.m.: Verdant Valley, north off the Foglands road, west of the woods.';
  }
  if (flags.sawAd) return at === 'foglands' ? 'Rest on the porch steps until Tuesday evening.' : 'Go home to Upper Foglands and rest until Tuesday.';
  return at === 'friendship' ? 'Read the board in the square.' : 'Ride to town and read the board.';
}

// ---------------------------------------------------------------- the Go table (DOM)
// The Tuesday-night board from the title (game/go/view.js), in a second panel of its own so
// the title's board keeps its state. The level stays Normal; New game is hidden; Leave
// becomes "Go on" once the game is over. Leaving early counts as a loss.
let story = null;
const hasDom = () => typeof document !== 'undefined' && Boolean(document.getElementById('frame'));

function useCss() {
  if (!hasDom() || document.querySelector('link[data-day="05"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../css/day05.css', import.meta.url).href;
  link.dataset.day = '05';
  document.head.append(link);
}

function storyBoard(ctx) {
  if (story) return story;
  const root = document.createElement('section');
  root.className = 'go day05-go';
  root.hidden = true;
  document.getElementById('frame').append(root);
  let done = null;
  const view = createGoView(root, { sound: ctx.sound, reducedMotion: ctx.reducedMotion, onClose: () => done?.() });
  const heading = root.querySelector('.go-title');
  heading.id = 'day05-go-title';
  root.setAttribute('aria-labelledby', heading.id);
  root.querySelector('.go-level').hidden = true;
  root.querySelector('[data-act="again"]').hidden = true;
  story = { root, view, heading, leave: root.querySelector('[data-act="leave"]'), onDone: (fn) => { done = fn; } };
  return story;
}

// Inspection handle for verification in the browser (the game never reads it).
export const storyView = () => story?.view ?? null;

// Day 7's bedside game uses the same board (game/script/day07.js).
export function playOnBoard(ctx, title) {
  const board = storyBoard(ctx);
  board.heading.textContent = title;
  board.leave.textContent = 'Leave';
  return new Promise((resolve) => {
    const watch = setInterval(() => {
      if (board.view.game?.over) board.leave.textContent = 'Go on';
    }, 200);
    board.onDone(() => {
      clearInterval(watch);
      board.onDone(null);
      const game = board.view.game;
      if (!game?.over) resolve('lost');
      else resolve(game.winner === white ? 'won' : game.winner ? 'lost' : 'draw');
    });
    board.view.open();
  });
}

export function createDay05(ctx) {
  const { state, world, dialogue, hud } = ctx;
  const { flags, marks } = state;
  useCss();
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  const ride = createFastRide(ctx, kit, 'd5');
  kit.goalOf = () => goalDay05(state);
  const farmMap = mapFor('foglands', state.day);
  const valleyMap = mapFor('verdant-valley', state.day);
  const houseMap = mapFor('daedalus-house', state.day);
  const roadMap = mapFor('valley-road', state.day);
  const doctor = () => world.npc(npcKey(world));
  let follower = null;
  let standUp = null;
  // Without a browser (check-days.mjs) the games are decided by this list, in order.
  const headlessGames = ['lost', 'lost', 'lost', 'lost', 'lost', 'won'];

  async function playGo(title) {
    const result = hasDom() ? await playOnBoard(ctx, title) : headlessGames.shift() ?? 'lost';
    state.go.played += 1;
    if (result === 'won') state.go.won += 1;
    else state.go.lost += 1;
    state.go.lastResult = result;
    hud.update(state);
    return result;
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

  function winter() {
    state.season = 'winter';
    world.setSeason('winter');
    hud.setPlace(world.map?.name, 'WINTER');
  }

  // ---------------------------------------------------------------- beat 1: the board
  async function wake() {
    hud.update(state);
    hud.show();
    if (!marks.woke) {
      marks.woke = true;
      if (!ctx.reducedMotion) await world.fade('in', 900);
      kit.hint('day5', 'Autumn. Something new is pinned to the board in town.', 4200);
    }
  }

  async function board() {
    if (flags.sawAd) await talk('d5.board.notice');
    else await talk('d5.board.ad');
  }

  // ---------------------------------------------------------------- the porch
  async function rest() {
    if (flags.wonGo) return undefined;
    if (flags.firstTuesday) return tuesday();
    if (flags.tuesdayEve && !flags.firstTuesday) {
      await talk('d5.rest.tonight');
      return undefined;
    }
    const choice = await talk(flags.sawAd ? 'd5.rest.tuesday' : 'd5.rest.ask');
    if (choice !== 'rest') return undefined;
    await world.fade('out', 500);
    state.week += 1;
    state.hearts = state.heartsMax;
    hud.update(state);
    world.placePlayer('porch');
    state.map = 'foglands';
    state.spawn = 'porch';
    if (flags.sawAd) {
      flags.tuesdayEve = true;
      state.clock = 19;
      world.setSky(state.clock);
      ctx.save?.();
      await world.fade('in', 500);
      await talk('d5.ride.tuesday');
      kit.hint('valley', 'Verdant Valley: the track north off the Foglands road, at its west end, before the woods.', 6000);
      return undefined;
    }
    state.clock = 6;
    world.setSky(state.clock);
    ctx.save?.();
    await world.fade('in', 500);
    hud.toast('You rest. Hearts restored.', 2600);
    return undefined;
  }

  // ---------------------------------------------------------------- beats 2–3: the first Tuesday
  async function arrive() {
    marks.arrived = true;
    const doc = doctor();
    doc?.face('down');
    world.facePlayer('up');
    await talk('d5.arrive.doorway', { hour: true });
    await world.fade('out', 500);
    cutTo('daedalus-house', 'table', 20);
    await world.fade('in', 500);
    await talk('d5.library.waves');
    kit.hint('go', 'Go: you play white. Put a stone on a crossing; surround stones to capture them. First to five captures wins.', 6500);
    let wins = 0;
    for (let n = 1; n <= 3; n++) {
      if ((await playGo(`Tuesday night · game ${n} of 3`)) === 'won') wins += 1;
    }
    flags.firstThreeWins = wins;
    await talk(['d5.games.lost-three', 'd5.games.won-one', 'd5.games.won-two', 'd5.games.won-three'][wins]);
    await talk(wins >= 2 ? 'd5.emily.heading-back-won' : 'd5.emily.heading-back');
    await dialogue.caption(adLine, { kind: 'ad', hold: 2800 });
    await talk('d5.daedalus.prefer');
    flags.firstTuesday = true;
    state.companions.daedalus += 1;
    await talk('d5.ride.home');
    await world.fade('out', 600);
    cutTo('foglands', 'porch', 23);
    ctx.save?.();
    await world.fade('in', 600);
    kit.hint('tuesdays', 'Every Rest on the porch steps is a week, and every week has a Tuesday.', 5200);
  }

  // ---------------------------------------------------------------- beat 4: the Tuesdays of the fall
  async function tuesday() {
    const choice = await talk('d5.rest.week');
    if (choice !== 'rest') return;
    await world.fade('out', 500);
    state.week += 1;
    flags.montageWeeks += 1;
    const week = flags.montageWeeks;
    state.hearts = state.heartsMax;
    hud.update(state);
    if (week >= 3 && state.season !== 'winter') winter();
    world.placePlayer('porch');
    state.clock = 19;
    world.setSky(state.clock);
    await world.fade('in', 500);
    const month = months[Math.min(week, months.length) - 1];
    await dialogue.caption(byId.get(`d5.tuesday.${month.toLowerCase()}`).text, { kind: 'world', hold: 1500 });
    let won = false;
    const skipped = (await talk('d5.tuesday.choice')) === 'skip';
    if (skipped) {
      flags.skippedTuesdays += 1;
      await talk('d5.tuesday.skipped');
    } else {
      await world.fade('out', 400);
      cutTo('daedalus-house', 'table', 20);
      await world.fade('in', 400);
      won = (await playGo(`A Tuesday in ${month}`)) === 'won';
    }
    // The fall runs into December (the third Tuesday): a win from then on ends it; on the
    // fourth Tuesday it ends anyway. Wins in October and November are kept for the paper.
    const before = flags.firstThreeWins + flags.montageWins;
    if (won) flags.montageWins += 1;
    if (week >= 3 && (won || week >= 4)) {
      await december({ forced: !won, before, skipped });
      return;
    }
    if (state.map !== 'foglands') await talk('d5.tuesday.lost');
    await world.fade('out', 500);
    cutTo('foglands', 'porch', 7);
    ctx.save?.();
    await world.fade('in', 500);
    hud.toast('Morning. Next Tuesday, Verdant Valley.', 2600);
  }

  async function december({ forced, before, skipped = false }) {
    await talk('d5.montage.fall');
    if (forced) {
      // the December game is played after all: a game, and a Tuesday not stayed home
      flags.forcedWin = true;
      state.go.played += 1;
      state.go.won += 1;
      if (skipped) flags.skippedTuesdays = Math.max(0, flags.skippedTuesdays - 1);
      await talk('d5.montage.forced');
    } else if (before > 0) {
      await talk('d5.montage.again');
    } else {
      await talk('d5.montage.december');
    }
    flags.wonGo = true;
    if (state.season !== 'winter') winter();
    await world.fade('out', 700);
    cutTo('valley-road', 'from-valley', 21);
    ctx.save?.();
    await world.fade('in', 700);
    await talk('d5.walk.insisted');
    kit.hint('walk', 'Walk east with the doctor. The Foglands are three screens off.', 5000);
  }

  // ---------------------------------------------------------------- beats 5–6: the walk home
  async function walkStretch(id) {
    const mark = `walk-${id}`;
    if (marks[mark] || !flags.wonGo || flags.walkedHome) return;
    marks[mark] = true;
    const doc = doctor();
    if (doc && !doc.walking) doc.face('right');
    if (id === 'why') await talk('d5.daedalus.why');
    if (id === 'silence') await talk('d5.walk.silence');
    if (id === 'field') {
      await talk('d5.walk.field');
      kit.hint('bison', 'The bison are behind the fence, north of the road.', 4000);
    }
  }

  async function bisonFence() {
    if (!flags.wonGo || flags.walkedHome || marks.bison) {
      await talk('d5.bison.grazing');
      return;
    }
    marks.bison = true;
    world.facePlayer('up');
    if ((await talk('d5.emily.field')) === 'sniff') await talk('d5.walk.sniff');
  }

  async function proposal() {
    if (marks['walk-fog'] || !flags.wonGo || flags.walkedHome) return;
    marks['walk-fog'] = true;
    follower?.stop();
    const doc = doctor();
    const at = world.playerTile();
    placeEmily(world, at, 'left'); // on the tile's centre, so the doctor kneels a full tile west
    if (doc) {
      await doc.walkPath([{ x: at.x - 1, y: at.y }], 64);
      doc.face('right');
    }
    world.facePlayer('left');
    const answer = await talk('d5.walk.mists', { hour: true });
    standUp?.();
    standUp = null;
    await talk(answer === 'yes' ? 'd5.walk.accepted' : 'd5.walk.think');
    flags.walkedHome = true;
    state.companions.daedalus += 1;
    hud.setGoal('Good night.');
    await world.dusk(1600);
    await world.fade('out', 900);
    ctx.ended = true;
    hud.hide();
    markPaper();
    await ctx.endDay();
  }

  // The paper's last paragraph is the advertisement; game/css/day05.css sets it as a strip.
  function markPaper() {
    if (!hasDom()) return;
    const paper = document.getElementById('paper');
    paper.dataset.ad = 'day05';
    paper.querySelector('.paper-sleep')?.addEventListener('click', () => delete paper.dataset.ad, { once: true });
  }

  // ---------------------------------------------------------------- moving about
  async function leave(exit) {
    if (exit.to === 'valley-road' && !(flags.wonGo && !flags.walkedHome)) {
      hud.toast('The long way to the Foglands. Ride home by the Foglands road.', 2800);
      return;
    }
    if (state.map === 'valley-road' && exit.to === 'verdant-valley') {
      await talk('d5.walk.ahead');
      return;
    }
    await changeMap(ctx, exit.to, exit.spawn);
  }

  function roadToll() {
    const riding = ridesOn(state, 'foglands-road');
    kit.loseHearts(riding ? 1 : 2);
    kit.hint('road', riding ? 'The road costs a heart each way on horseback.' : 'The road costs two hearts each way on foot.');
  }

  // ---------------------------------------------------------------- E targets
  const objectHandlers = {
    porch: rest,
    hutch: board,
    'house-door': () => talk('d5.door.closed'),
    'valley-sign': () => talk('d5.sign.valley'),
    'bison-fence': bisonFence,
    'bison-sign': () => talk('d5.bison.sign'),
  };
  const handlerFor = (target) => (target.npc === 'pixel' ? ride.handler() : target.npc ? null : objectHandlers[target.id]);

  const api = {
    start: () => beat(wake),
    get busy() {
      return kit.busy;
    },

    mapBuilt(mapId) {
      world.setRiding(ridesOn(state, mapId) && !ride.afoot(mapId));
      ride.mapBuilt(mapId);
      follower = null;
      if (mapId === 'foglands') {
        state.farm.plots.forEach((plot) => world.setGroundTile(plot.x, plot.y, plotTile(plot)));
        if (flags.boughtHorse) world.showPixel(farmMap.marks.hitch, 'west');
      } else if (mapId === 'verdant-valley') {
        if (flags.boughtHorse) world.showPixel(valleyMap.marks.hitch, 'west');
        if (flags.tuesdayEve && !flags.firstTuesday) spawnDaedalus(world, valleyMap.marks.doorway, 'down');
      } else if (mapId === 'daedalus-house') {
        spawnDaedalus(world, houseMap.marks.seat, 'down');
      } else if (mapId === 'valley-road') {
        grazeBison(world, roadMap.marks.bison);
        if (flags.wonGo && !flags.walkedHome) follower = follow(spawnDaedalus(world, roadMap.marks.follower, 'right'));
      }
      kit.refreshGoal();
    },

    onTile(tile) {
      if (tile.map === 'foglands-road') hud.setScreens(screensFromTown(tile.x));
      if (tile.map === 'valley-road') follower?.update(tile);
    },

    onTrigger(object) {
      if (object.id === 'halfway') roadToll();
      else if (object.id === 'arrive' && flags.tuesdayEve && !flags.firstTuesday && !marks.arrived) return beat(arrive);
      else if (object.id === 'walk-fog') return beat(proposal);
      else if (object.id.startsWith('walk-')) return beat(() => walkStretch(object.id.slice(5)));
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

    cue(name) {
      if (name === 'kneel') standUp = kneel(world, doctor(), 'right');
    },
  };

  // ---------------------------------------------------------------- headless walk-through
  // The canon route for check-days.mjs, one step per call: the board, Rest to Tuesday, the
  // ride north, three games lost, three Tuesdays (lost, lost, won in December), the walk
  // home with the bison, the proposal. Choices come from the route (checks/day05.mjs).
  const go = (to, spawn) => () => api.onExit({ to, spawn });
  const route = [
    () => api.start(),
    () => api.onInteract({ npc: 'pixel' }), // Pixel's quick ride to town, and back
    () => api.onInteract({ id: 'hutch' }),
    () => api.onInteract({ npc: 'pixel' }),
    () => api.onInteract({ id: 'porch' }),
    go('foglands-road', 'from-east'), go('verdant-valley', 'from-road'),
    () => api.onTrigger({ id: 'arrive' }),
    () => api.onInteract({ id: 'porch' }),
    () => api.onInteract({ id: 'porch' }),
    () => api.onInteract({ id: 'porch' }),
    () => api.onInteract({ id: 'porch' }), // a fourth Tuesday, only if the third was not won
    () => api.onTrigger({ id: 'walk-why' }),
    () => api.onTrigger({ id: 'walk-silence' }),
    () => api.onTrigger({ id: 'walk-field' }),
    () => api.onInteract({ id: 'bison-fence' }),
    () => api.onTrigger({ id: 'walk-fog' }),
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
// DOCTOR SEEKS GAMER. Every sentence authored, in the Editor's voice, except the last
// paragraph: the advertisement that interrupts the book's scene (L5.26), printed at the foot.
export function writeDay05(state) {
  const { flags, go } = state;
  const body = [];
  body.push('An advertisement on this town’s board, seeking a Gamer of sharp intellect for Tuesday nights in Verdant Valley, has had exactly one reply.');
  const first = flags.firstThreeWins ?? 0;
  body.push(first === 0
    ? 'Miss Emily B. Marks of Upper Foglands rode out to Dr. Daedalus’s on the first Tuesday and lost three games of Go, each by less than the one before.'
    : `Miss Emily B. Marks of Upper Foglands rode out to Dr. Daedalus’s on the first Tuesday and took ${inWords(first)} of three games of Go. The doctor has not been heard to mention it.`);
  const played = go.played ?? 0;
  const won = go.won ?? 0;
  body.push(`By this paper’s count the two have sat down to ${inWords(played)} ${played === 1 ? 'game' : 'games'} this season, of which Miss Marks has won ${inWords(won)}.`);
  const skipped = flags.skippedTuesdays ?? 0;
  if (skipped) body.push(`She stayed home on ${inWords(skipped)} ${skipped === 1 ? 'Tuesday' : 'Tuesdays'}, weather permitting or not.`);
  body.push(flags.forcedWin
    ? 'In December, at the last, the doctor lost. Readers may draw their own conclusions.'
    : 'In December she beat the doctor outright, which the doctor is said to have taken well.');
  body.push(flags.bisonPetted
    ? 'The doctor then walked her home the long way. A witness reports the pair at the bison fence, where Miss Marks let the animals sniff her hand. The bison remain protected.'
    : 'The doctor then walked her home the long way, past the bison, which remain protected.');
  body.push(flags.acceptedAtOnce
    ? 'Something is said to have been proposed in the mist at the Foglands line, and accepted before the mist could lift.'
    : 'Something is said to have been proposed in the mist at the Foglands line. The answer, if there is one, has not reached this office.');
  body.push(lines[adLine].text);
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Autumn into winter · Year 1',
    headline: 'DOCTOR SEEKS GAMER',
    body,
  };
}

// ---------------------------------------------------------------- state
export const flags = {
  sawAd: false,
  tuesdayEve: false,
  firstTuesday: false,
  firstThreeWins: 0,
  montageWeeks: 0,
  montageWins: 0,
  skippedTuesdays: 0,
  forcedWin: false,
  wonGo: false,
  bisonPetted: false,
  walkedHome: false,
  acceptedAtOnce: false,
  proposalPending: false,
};

// The book's Day 5: the advertisement answered, three games lost, the fall's Tuesdays until
// a win in December, the bison, and a proposal left open.
export function canonDay05(state) {
  Object.assign(state.flags, {
    sawAd: true, tuesdayEve: true, firstTuesday: true, firstThreeWins: 0, montageWeeks: 3, montageWins: 1, wonGo: true,
    bisonPetted: true, walkedHome: true, proposalPending: true, acceptedAtOnce: false,
  });
  Object.assign(state.go, { played: state.go.played + 6, won: state.go.won + 1, lost: state.go.lost + 5, lastResult: 'won' });
  state.companions.daedalus += 2;
  state.week += 4;
  return state;
}

export const presetDay05 = () => presetDay(5);

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 5,
  title: 'Tuesday nights',
  headline: 'DOCTOR SEEKS GAMER',
  season: 'autumn',
  seasonName: 'Autumn',
  goal: 'Read the board. Tuesday, 8 p.m.',
  start: { map: 'foglands', spawn: 'porch' },
  flags,
  canon: canonDay05,
  nodes,
  skipPoints,
  extraLines: [adLine],
  create: createDay05,
  write: writeDay05,
  preset: presetDay05,
};
