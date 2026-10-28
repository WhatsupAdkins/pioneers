// Day 9, LOCAL DOCTOR, WIFE TO SELL GAMES FOR THE HOLIDAYS (GAME-PLAN-DAYS §B Day 9), winter
// into Christmas. The headline is authored: the book gives this stretch none. Everything of
// this day in one file: its record (`day`, at the end), flags, canonDay09, nodes,
// beats, the paper (writeDay09) and presetDay09.
//
// Daedalus will not leave her bedroom. Each afternoon Emily sets down one white stone on the
// board by the bed and Daedalus cannot help answering with black; each Rest the table stands
// a tile nearer the door, and on the fourth afternoon Daedalus gets up and walks to it. Weeks
// later Emily proposes making games: four sets, each a length of sequoia (Emily) and a set of
// glass pieces (Daedalus) finished overnight, every one sold. Then the lost child on the Go
// board, Christmas morning, Ludo Quintus, and "Fifth game." Then the paper.
//
// Node ids: d9.<speaker>.<topic>. Book lines are `src` (L9.xx); the rest is `authored`.
//
// Where things are: the bedroom (maps/day09-bedroom.js) opens into Dr. Daedalus's library in
// Verdant Valley (maps/day07-daedalus-house.js); the portal in the library's back wall goes
// to the farmhouse at Upper Foglands, where the sequoia gives the wood; the farm's other
// portal goes to Friendship Books, whose counter is the workshop (with a Rest of its own, so a
// set is begun and finished in one place).
import { changeMap, screensFromTown } from '../transitions.js';
import { createDayKit } from './common.js';
import { createHitchRide, hitchNodes, hitchRoutes } from './fast-ride.js';
import { addItem, countItem, removeItem } from '../inventory.js';
import { inWords } from '../newspaper.js';
import { mapFor } from '../../maps/versions.js';
import { placeTable, tableSpot } from '../../maps/day09-bedroom.js';
import { presetDay } from './preset.js';
import { createGame, play, black, white } from '../go/engine.js';
import { aiMove, createRng } from '../go/ai.js';
import { createDay09Ui, holdLine } from '../ui/day09.js';
import { placeSprite, removeSprite } from '../world/day09.js';
import { portalLink, travelByPortal } from '../world/day06.js';
import { ridesOn } from './day02.js';
import { lines } from './lines.js';

export const skipPoints = []; // the book gives Day 9 no Skip
export const lastLine = 'L9.43'; // "Fifth game.": typed and held by holdLine(), not a node

export const ritualDays = 4;
export const setPrice = 15;
export const gameSets = [
  { id: 'chinese-checkers', name: 'Chinese checkers', icon: 'set-chinese-checkers' },
  { id: 'checkers', name: 'Checkers', icon: 'set-checkers' },
  { id: 'chess', name: 'Chess', icon: 'set-chess' },
  { id: 'go', name: 'Go', icon: 'set-go' },
];
const boardSize = 9;

export const nodes = [
  // beat 1: the bedroom
  { id: 'd9.room.recovery', src: 'L9.01', next: 'd9.emily.happen' },
  { id: 'd9.emily.happen', speaker: 'emily', src: 'L9.02', next: 'd9.daedalus.leave-me' },
  { id: 'd9.daedalus.leave-me', speaker: 'daedalus', src: 'L9.03', next: 'd9.emily.possible' },
  { id: 'd9.emily.possible', speaker: 'emily', portrait: 'emily-firm', src: 'L9.04', next: 'd9.daedalus.swim' },
  { id: 'd9.daedalus.swim', speaker: 'daedalus', src: 'L9.05', next: 'd9.emily.whom' },
  { id: 'd9.emily.whom', speaker: 'emily', src: 'L9.06', next: 'd9.room.pieces' },
  { id: 'd9.room.pieces', src: 'L9.07' },

  // beat 2: a stone an afternoon
  { id: 'd9.daedalus.no-play', speaker: 'daedalus', src: 'L9.08' },
  { id: 'd9.go.and-yet', src: 'L9.09' },
  { id: 'd9.go.farther', src: 'L9.10' },
  { id: 'd9.go.too-far', kind: 'narration', text: 'The board is too far from the bed to reach.', authored: true },
  { id: 'd9.go.joined', src: 'L9.11' },
  { id: 'd9.go.one-a-day', kind: 'narration', text: 'One stone an afternoon. The next can wait for tomorrow.', authored: true },
  { id: 'd9.go.later', kind: 'narration', text: 'The game goes on, a stone an afternoon.', authored: true },
  { id: 'd9.bed.lying', kind: 'narration', text: 'She has turned toward the wall.', authored: true },
  { id: 'd9.bed.empty', kind: 'narration', text: 'The bed is made.', authored: true },
  { id: 'd9.room.nightstand', kind: 'narration', text: 'Her spectacles, and a lens she was grinding before the blizzard.', authored: true },
  { id: 'd9.room.window', kind: 'narration', text: 'Snow, and the light going early.', authored: true },
  {
    id: 'd9.rest.ask',
    kind: 'narration',
    text: 'Let the afternoon pass?',
    authored: true,
    choices: [
      { label: 'Rest until tomorrow', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd9.rest.not-yet', kind: 'narration', text: 'Not yet. The board by the bed is waiting for a white stone.', authored: true },

  // the store's counter: the workshop, and a Rest of its own
  {
    id: 'd9.store.workshop',
    kind: 'narration',
    text: 'The counter at Friendship Books, cleared for a workbench.',
    authored: true,
    choices: [
      { label: 'Work at the bench', authored: true, silent: true, value: 'bench' },
      { label: 'Rest until tomorrow', authored: true, silent: true, value: 'rest' },
      { label: 'Not now', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd9.store.quiet', kind: 'narration', text: 'The day book, the bell, the cash box. Nobody has come in for a book all winter.', authored: true },
  {
    id: 'd9.sequoia.ask',
    kind: 'narration',
    text: 'The great sequoia. A length of it would make a board.',
    authored: true,
    choices: [
      { label: 'Cut a length (1 heart)', authored: true, silent: true, value: 'cut' },
      { label: 'Not now', authored: true, silent: true, value: 'no' },
    ],
  },

  // beat 3: the proposal
  { id: 'd9.room.weeks', src: 'L9.12', next: 'd9.emily.christmas' },
  { id: 'd9.emily.christmas', speaker: 'emily', src: 'L9.13', next: 'd9.emily.craft' },
  { id: 'd9.emily.craft', speaker: 'emily', src: 'L9.14', next: 'd9.emily.apprentice' },
  { id: 'd9.emily.apprentice', speaker: 'emily', src: 'L9.15', next: 'd9.daedalus.patronizing' },
  { id: 'd9.daedalus.patronizing', speaker: 'daedalus', src: 'L9.16' },
  { id: 'd9.daedalus.glassworks', kind: 'narration', text: 'Dr. Daedalus is blowing glass pieces, one-handed, with LQ at the bellows.', authored: true },
  { id: 'd9.games.sold', src: 'L9.17' },

  // beat 4: the lost child
  { id: 'd9.emily.missed', speaker: 'emily', portrait: 'emily-soft', src: 'L9.18', next: 'd9.daedalus.before' },
  { id: 'd9.daedalus.before', speaker: 'daedalus', src: 'L9.19', next: 'd9.emily.brothers' },
  { id: 'd9.emily.brothers', speaker: 'emily', src: 'L9.20', next: 'd9.daedalus.tell' },
  { id: 'd9.daedalus.tell', speaker: 'daedalus', src: 'L9.21', next: 'd9.emily.at-sea' },
  { id: 'd9.emily.at-sea', speaker: 'emily', src: 'L9.22', next: 'd9.daedalus.hard' },
  { id: 'd9.daedalus.hard', speaker: 'daedalus', src: 'L9.23', next: 'd9.room.pointed' },
  { id: 'd9.room.pointed', src: 'L9.24', cue: 'board-show', next: 'd9.emily.world' },
  { id: 'd9.emily.world', speaker: 'emily', src: 'L9.25', cue: 'grid', next: 'd9.emily.person' },
  { id: 'd9.emily.person', speaker: 'emily', src: 'L9.26', cue: 'pieces', next: 'd9.daedalus.hands' },
  { id: 'd9.daedalus.hands', speaker: 'daedalus', src: 'L9.27', next: 'd9.emily.lost-child' },
  { id: 'd9.emily.lost-child', speaker: 'emily', src: 'L9.28', cue: 'lost', next: 'd9.emily.god' },
  { id: 'd9.emily.god', speaker: 'emily', src: 'L9.29', cue: 'god', next: 'd9.room.reached' },
  { id: 'd9.room.reached', src: 'L9.30', next: 'd9.daedalus.love' },
  { id: 'd9.daedalus.love', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L9.31' },
  { id: 'd9.daedalus.carving', kind: 'narration', text: 'She is carving something small, and turns it face down when you come near.', authored: true },

  // beat 5: Christmas
  { id: 'd9.xmas.morning', src: 'L9.32', next: 'd9.xmas.board' },
  { id: 'd9.xmas.board', src: 'L9.33', next: 'd9.xmas.carved' },
  { id: 'd9.xmas.carved', src: 'L9.34', next: 'd9.daedalus.title' },
  { id: 'd9.daedalus.title', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L9.35', next: 'd9.xmas.asked' },
  { id: 'd9.xmas.asked', src: 'L9.36', cue: 'gift', next: 'd9.lq.easy' },
  { id: 'd9.lq.easy', speaker: 'lq', src: 'L9.37', next: 'd9.emily.why' },
  { id: 'd9.emily.why', speaker: 'emily', src: 'L9.38', next: 'd9.lq.name' },
  { id: 'd9.lq.name', speaker: 'lq', src: 'L9.39', next: 'd9.xmas.naming' },
  { id: 'd9.xmas.naming', src: 'L9.40', next: 'd9.emily.quintus' },
  { id: 'd9.emily.quintus', speaker: 'emily', src: 'L9.41', next: 'd9.xmas.knew' },
  { id: 'd9.xmas.knew', src: 'L9.42' },
  // Pixel at the hitch: face her and press E to ride (fast-ride.js)
  ...hitchNodes('d9', ['to-town']),
];

// ---------------------------------------------------------------- the board, as data
// The bedside game is one game of Go played a move a day: Emily (white) opens, Daedalus
// (black) answers with the engine's level-1 move (game/go/ai.js), seeded by the move count.
export const emptyBoard = () => new Array(boardSize * boardSize).fill(0);

export function bedsideMove(board, x, y) {
  const stones = board.filter(Boolean).length;
  const game = { ...createGame({ size: boardSize, target: boardSize * boardSize, seed: 9 }), board: board.slice(), toMove: white, moveCount: stones };
  const afterWhite = play(game, x, y);
  if (afterWhite.error) return { error: afterWhite.error };
  const move = aiMove(afterWhite, 1, createRng(90 + stones));
  const afterBlack = move.pass ? afterWhite : play(afterWhite, move.x, move.y);
  return {
    afterWhite: afterWhite.board,
    afterBlack: afterBlack.error ? afterWhite.board : afterBlack.board,
    black: move.pass || afterBlack.error ? null : { x: move.x, y: move.y },
  };
}

// Where the day stands, from the state alone.
export function phaseOf(state) {
  const { flags } = state;
  const d9 = state.marks.d9 ?? {};
  if (flags.fifthGame) return 'done';
  if (flags.heardLostChild) return 'christmas';
  if (flags.setsMade >= gameSets.length) return 'lost-child';
  if (d9.proposed) return 'workshop';
  if (flags.stonesPlaced >= ritualDays) return 'weeks';
  return 'ritual';
}

// The HUD's "Now:" line (GAME-PLAN-DAYS §A.3).
// The way to a place from wherever Emily is (the bedroom, the library, the farm, the store).
const wayTo = {
  bedroom: { 'daedalus-house': 'the bedroom door in the back wall', foglands: 'the portal on the right, beside the farmhouse, goes to her library', store: 'the portal on the back wall goes home' },
  foglands: { bedroom: 'the door, bottom right, into the library', 'daedalus-house': 'the portal in the back wall goes to the farm', store: 'the portal on the back wall goes home' },
  store: { bedroom: 'the door, bottom right, into the library', 'daedalus-house': 'the portal in the back wall goes to the farm', foglands: 'the portal on the left, beside the farmhouse' },
};
const way = (state, place) => wayTo[place]?.[state.map] ?? '';

export function goalDay09(state) {
  const d9 = state.marks.d9 ?? {};
  const at = state.map;
  const inside = at === 'bedroom';
  switch (phaseOf(state)) {
    case 'ritual':
      if (d9.stoneToday) return inside ? 'Let the afternoon pass: sit in the armchair by the window.' : at === 'foglands' ? 'Rest on the porch steps until tomorrow.' : `Go back to Dr. Daedalus: ${way(state, 'bedroom')}.`;
      return inside ? 'Set down a white stone on the board by the bed.' : `Go back to Dr. Daedalus: ${way(state, 'bedroom')}.`;
    case 'weeks':
      return inside ? 'Rest in the armchair. Weeks pass.' : at === 'foglands' ? 'Rest on the porch steps. Weeks pass.' : `Go back to Dr. Daedalus: ${way(state, 'bedroom')}.`;
    case 'workshop': {
      const left = gameSets.length - (state.flags.setsMade ?? 0);
      if (d9.bench) return at === 'store' ? 'A set is on the bench. Rest at the counter, and it will be finished.' : `A set is on the bench at the store: ${way(state, 'store')}.`;
      if (countItem(state, 'wood') > 0) return at === 'store' ? `Begin a set at the counter: ${inWords(left)} to go.` : `Take the wood to the workshop at the store: ${way(state, 'store')}.`;
      if (at === 'foglands') return `Cut lengths of the sequoia, west of the house: one a set, ${inWords(left)} to go.`;
      return `Wood for the boards: the sequoia at Upper Foglands (${way(state, 'foglands')}).`;
    }
    case 'lost-child':
      return inside ? 'Every board sold. Sit with Dr. Daedalus at the Go table.' : `Every board sold. Go back to Dr. Daedalus: ${way(state, 'bedroom')}.`;
    case 'christmas':
      return 'It is almost Christmas. Rest.';
    default:
      return 'Merry Christmas.';
  }
}

export function createDay09(ctx) {
  const { state, world, hud } = ctx;
  const { flags, marks } = state;
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  kit.goalOf = () => goalDay09(state);
  const ui = createDay09Ui(ctx);
  const farmMap = mapFor('foglands', 9);
  const d9 = (marks.d9 ??= { board: emptyBoard(), stoneToday: false, proposed: false, glass: 0, bench: null, made: [], stand: null, saidFarther: false });
  placeTable(state.week); // before the world builds the bedroom

  const daedalusKey = () => 'daedalus';

  // ---------------------------------------------------------------- the bedroom
  function showDaedalus() {
    if (state.map !== 'bedroom') return;
    if (!flags.daedalusUp) {
      // drawn over the bed block, whose base is row 5
      placeSprite(world, 'daedalus-bed', 'daedalus-bed', 'lying', { x: 5, y: 3 }, { depth: 5 * 16 + 1 });
      return;
    }
    removeSprite(world, 'daedalus-bed');
    const stand = d9.stand ?? standBeside(tableSpot(ritualDays - 1), null);
    const npc = world.spawnNpc(daedalusKey(), stand, faceToward(stand, tableSpot(state.week)));
    return npc;
  }

  function faceToward(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'right' : 'left';
    return dy >= 0 ? 'down' : 'up';
  }

  // A free tile beside the table for Daedalus, not where Emily stands.
  function standBeside(table, emily) {
    const options = [{ x: table.x - 1, y: table.y }, { x: table.x, y: table.y - 1 }, { x: table.x + 1, y: table.y }, { x: table.x, y: table.y + 1 }];
    return options.find((tile) => !(emily && tile.x === emily.x && tile.y === emily.y) && !world.isSolidAt?.(tile.x, tile.y)) ?? options[0];
  }

  async function opening() {
    hud.update(state);
    hud.show();
    if (marks.d9opened) return;
    marks.d9opened = true;
    if (!ctx.reducedMotion) await world.fade('in', 900);
    await talk('d9.room.recovery');
    kit.hint('d9-stone', 'Face the Go table and press E to set down a white stone. One a day.', 5600);
  }

  // Beat 2: one white stone; Daedalus answers. On the fourth afternoon she gets up first.
  async function table() {
    const phase = phaseOf(state);
    if (phase === 'lost-child') return lostChild();
    if (phase !== 'ritual') return talk(phase === 'christmas' || phase === 'done' ? 'd9.daedalus.carving' : 'd9.go.later');
    if (d9.stoneToday) return talk('d9.go.one-a-day');
    const n = flags.stonesPlaced;
    if (n === 0) await talk('d9.daedalus.no-play');
    if (n === ritualDays - 1 && !flags.daedalusUp) {
      await talk('d9.go.too-far');
      await getUp();
    }
    const result = await ui.board.play(d9.board, { afternoon: n + 1, move: (x, y) => bedsideMove(d9.board, x, y) });
    if (!result) return undefined;
    d9.board = result.afterBlack;
    d9.stoneToday = true;
    flags.stonesPlaced = n + 1;
    ctx.sound?.play('stone');
    if (n === 0) await talk('d9.go.and-yet');
    if (n === ritualDays - 1) await talk('d9.go.joined');
    kit.hint('d9-rest', 'Rest in the armchair by the window to let the afternoon pass.', 5200);
    ctx.save?.();
    return undefined;
  }

  // Daedalus gets out of bed and walks to the board.
  async function getUp() {
    flags.daedalusUp = true;
    state.companions.daedalus += 1;
    removeSprite(world, 'daedalus-bed');
    const out = mapFor('bedroom', 9).marks.daedalusOut;
    const spot = tableSpot(state.week);
    const stand = standBeside(spot, world.playerTile?.());
    d9.stand = stand;
    const npc = world.spawnNpc(daedalusKey(), out, 'down');
    await npc.walkPath?.([{ x: out.x, y: stand.y }, stand], 34);
    npc.face?.(faceToward(stand, spot));
  }

  async function bed() {
    await talk(flags.daedalusUp ? 'd9.bed.empty' : 'd9.bed.lying');
  }

  async function daedalus() {
    const phase = phaseOf(state);
    if (phase === 'lost-child') return lostChild();
    if (phase === 'ritual') return table();
    return talk(phase === 'workshop' ? 'd9.daedalus.glassworks' : phase === 'weeks' ? 'd9.go.later' : 'd9.daedalus.carving');
  }

  // ---------------------------------------------------------------- Rest
  async function rest() {
    const phase = phaseOf(state);
    if (phase === 'ritual' && !d9.stoneToday) {
      await talk('d9.rest.not-yet');
      return;
    }
    if ((await talk('d9.rest.ask')) !== 'rest') return;
    await world.fade('out', 500);
    state.week += 1;
    state.hearts = state.heartsMax;
    state.clock = 13;
    world.setSky(state.clock);
    d9.stoneToday = false;
    let sold = null;
    if (d9.proposed) {
      if (d9.bench) {
        sold = gameSets.find((set) => set.id === d9.bench);
        d9.made.push(d9.bench);
        d9.bench = null;
        flags.setsMade += 1;
        state.purse += setPrice;
        state.store.gold += setPrice;
      }
      d9.glass = Math.min(d9.glass + 1, gameSets.length - flags.setsMade); // Daedalus blows a set overnight
    }
    placeTable(state.week);
    if (state.map === 'bedroom') {
      world.enterMap('bedroom', 'chair');
      state.spawn = 'chair';
    } else if (state.map === 'store') {
      world.placePlayer('counter');
      state.spawn = 'counter';
    } else {
      world.placePlayer('porch');
      state.map = 'foglands';
      state.spawn = 'porch';
    }
    hud.update(state);
    ctx.save?.();
    await world.fade('in', 500);

    if (phase === 'ritual' && !d9.saidFarther) {
      d9.saidFarther = true;
      await talk('d9.go.farther');
    } else if (phase === 'ritual') {
      hud.toast('Hearts restored. The board stands a little nearer the door.', 3000);
    } else if (phase === 'weeks') {
      await proposal();
    } else if (phase === 'christmas') {
      await christmas();
    } else if (sold) {
      const more = flags.setsMade < gameSets.length ? ' Dr. Daedalus has blown the next set of pieces.' : '';
      hud.toast(`${sold.name}: on the shelf in the morning, sold out by noon. +${setPrice}.${more}`, 4200);
      if (flags.setsMade >= gameSets.length) await talk('d9.games.sold');
    } else {
      hud.toast('You rest. Hearts restored.', 2500);
    }
  }

  // ---------------------------------------------------------------- beat 3: the proposal
  async function proposal() {
    if (state.map !== 'bedroom') await changeMap(ctx, 'bedroom', 'bedside');
    await talk('d9.room.weeks');
    d9.proposed = true;
    d9.glass = 1;
    hud.setGoal(goalDay09(state));
    kit.hint('d9-workshop', 'The workshop is the counter at Friendship Books. A set needs a length of the sequoia at Upper Foglands (the portal in the library goes there); Dr. Daedalus makes the glass. Rest at the counter to finish it.', 8000);
  }

  // ---------------------------------------------------------------- the store's counter: the workshop
  async function counter() {
    if (phaseOf(state) !== 'workshop') return talk('d9.store.quiet');
    const choice = await talk('d9.store.workshop');
    if (choice === 'bench') await workshop();
    else if (choice === 'rest') await rest();
    return undefined;
  }

  async function workshop() {
    const id = await ui.workshop.open({ sets: gameSets, made: d9.made, bench: d9.bench, wood: countItem(state, 'wood'), glass: d9.glass, price: setPrice });
    if (!id) return;
    if (!removeItem(state, 'wood')) return;
    d9.glass -= 1;
    d9.bench = id;
    const set = gameSets.find((entry) => entry.id === id);
    hud.toast(`${set.name}: the board carved, the pieces laid in. Rest, and it will be finished.`, 3600);
    ctx.save?.();
  }

  async function sequoia() {
    if (state.hearts < 1) {
      hud.toast('Too tired. Rest on the porch steps.', 2500);
      return;
    }
    if ((await talk('d9.sequoia.ask')) !== 'cut') return;
    kit.loseHearts(1);
    ctx.sound?.play('step');
    kit.give('wood', 1, 'Sequoia wood');
  }

  // ---------------------------------------------------------------- beat 4: the lost child
  async function lostChild() {
    await talk('d9.emily.missed');
    ui.board.hide();
    flags.heardLostChild = true;
    state.companions.daedalus += 1;
    ctx.save?.();
  }

  // ---------------------------------------------------------------- beat 5: Christmas
  async function christmas() {
    if (state.map !== 'bedroom') await changeMap(ctx, 'bedroom', 'bedside');
    hud.setGoal('');
    state.clock = 8;
    world.setSky(state.clock);
    world.spawnNpc('lq-8', { x: 7, y: 6 }, 'up');
    await talk('d9.xmas.morning');
    // the last line is typed, then held two seconds before the screen goes black
    const close = await holdLine(null, lines[lastLine].text, { hold: 2000, reducedMotion: ctx.reducedMotion });
    flags.fifthGame = true;
    hud.setGoal('');
    await world.fade('out', ctx.reducedMotion ? 1 : 1400);
    close();
    ctx.ended = true;
    hud.hide();
    await ctx.endDay();
  }

  // ---------------------------------------------------------------- moving about
  async function leave(exit) {
    await changeMap(ctx, exit.to, exit.spawn);
  }

  const objectHandlers = {
    'go-table': table,
    bed,
    armchair: rest,
    nightstand: () => talk('d9.room.nightstand'),
    window: () => talk('d9.room.window'),
    'window-east': () => talk('d9.room.window'),
    porch: rest,
    stock: counter,
    'bedroom-door': () => changeMap(ctx, 'bedroom', 'from-door'),
    sequoia: () => (phaseOf(state) === 'workshop' ? sequoia() : undefined),
  };
  // Pixel at the hitch: E rides between the farm and town (fast-ride.js).
  const hitch = createHitchRide(ctx, kit, 'd9', { foglands: hitchRoutes.toTown(0) });
  const handlerFor = (target) => {
    if (target.npc === 'pixel') return hitch.handler();
    if (target.npc) {
      if (target.npc === daedalusKey() && state.map === 'bedroom') return daedalus;
      return null;
    }
    if (target.id === 'sequoia' && phaseOf(state) !== 'workshop') return null;
    if (portalLink(state.map, target.id)) return () => travelByPortal(ctx, target.id);
    return objectHandlers[target.id] ?? null;
  };

  const api = {
    start: () => beat(opening),
    get busy() {
      return kit.busy;
    },

    mapBuilt(mapId) {
      world.setRiding(ridesOn(state, mapId));
      if (mapId === 'bedroom') showDaedalus();
      else if (mapId === 'foglands' && flags.boughtHorse && farmMap?.marks?.hitch) world.showPixel(farmMap.marks.hitch, 'west');
      if (mapId === 'foglands') hitch.hint();
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
      if (name === 'board-show') ui.board.show(d9.board);
      else if (name === 'gift') kit.give('ludo-quintus', 1, 'Ludo Quintus');
      else ui.board.cue(name);
    },
  };

  // ---------------------------------------------------------------- headless walk-through
  // The canon route for check-days.mjs: four afternoons at the board, the proposal, out
  // through the library and its portal to the sequoia (four lengths), the farm's portal to the
  // store, four sets (bench, Rest), back the same way, the lost child, Christmas, the paper.
  const at = (id) => () => api.onInteract({ id });
  const go = (to, spawn) => () => api.onExit({ to, spawn });
  const set = () => [() => beat(workshop), () => beat(rest)];
  const route = [
    () => api.start(),
    at('go-table'), at('armchair'),
    at('go-table'), at('armchair'),
    at('go-table'), at('armchair'),
    at('go-table'), at('armchair'), // the fourth Rest: weeks pass, the proposal
    go('daedalus-house', 'from-bedroom'), at('portal-house'),
    at('sequoia'), at('sequoia'), at('sequoia'), at('sequoia'),
    at('portal'),
    ...set(), ...set(), ...set(), ...set(),
    at('portal'), at('portal-house'), at('bedroom-door'),
    at('go-table'), // the lost child
    at('armchair'), // Christmas, and the paper
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
// LOCAL DOCTOR, WIFE TO SELL GAMES FOR THE HOLIDAYS (authored, like every sentence of it).
// It does not say what Quintus means.
export function writeDay09(state) {
  const { flags } = state;
  const stones = flags.stonesPlaced ?? 0;
  const sets = flags.setsMade ?? 0;
  const body = [];
  body.push('Dr. Edna Daedalus, whose misfortune in the great blizzard this paper reported with regret, has not been seen at her practice since.');
  if (flags.daedalusUp) body.push('She is, however, out of bed. Her wife tells us the cure was a game of Go, played one stone an afternoon, the board a little nearer the door each day.');
  else if (stones > 0) body.push(`The doctor keeps to her room. Her wife plays Go with her there, ${stones === 1 ? 'one stone' : `${inWords(stones)} stones`} so far.`);
  else body.push('The doctor keeps to her room and receives no one.');
  if (sets >= 4) body.push('This season the couple went into business as Daedalus & Marks Games: carved boards and hand-blown pieces, for Chinese checkers, checkers, chess, and Go.');
  else if (sets > 0) body.push(`This season the couple went into business as Daedalus & Marks Games, with ${inWords(sets)} ${sets === 1 ? 'set' : 'sets'} of carved boards and hand-blown pieces so far.`);
  else body.push('Word that the couple mean to sell games for the holidays has not yet produced a game.');
  if (sets > 0) body.push(`Every board they made was sold before the glass had cooled: ${sets * setPrice} in gold, all told.`);
  else body.push('Friendship Books reports its shelf for games is waiting.');
  body.push(flags.heardLostChild
    ? 'Asked what games she made before she came to Friendship, Mrs. Marks said only that they were not the sort this paper would understand.'
    : 'Mrs. Marks is said to have made games before she came to Friendship. She has not said what kind.');
  body.push(flags.fifthGame
    ? 'On Christmas morning the doctor and their son gave her a game of their own making, a road from Massachusetts to California. They tell us it is named for the boy.'
    : 'The family will keep Christmas at home.');
  body.push('Orders for next season may be left at Friendship Books.');
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Winter · Christmas',
    headline: 'LOCAL DOCTOR, WIFE TO SELL GAMES FOR THE HOLIDAYS',
    body,
  };
}

// ---------------------------------------------------------------- state
export const flags = {
  stonesPlaced: 0,
  daedalusUp: false,
  setsMade: 0,
  heardLostChild: false,
  fifthGame: false,
};

// What Day 9 stands on from Days 5–8. Their canon sets all of it; checks/day09.mjs asserts
// that presetState(9) has every one.
export const priorFlags = {
  married: true,
  portalBuilt: true,
  lqBorn: true,
  daedalusLeft: true,
  horseReturned: true,
  foundCave: true,
  amputation: true,
};


// The book's Day 9: four afternoons at the board, Daedalus up, four sets sold, the lost
// child, and Ludo Quintus on Christmas morning.
export function canonDay09(state) {
  Object.assign(state.flags, { stonesPlaced: 4, daedalusUp: true, setsMade: 4, heardLostChild: true, fifthGame: true });
  state.companions.daedalus += 2;
  state.purse += gameSets.length * setPrice;
  state.store.gold += gameSets.length * setPrice;
  if (!countItem(state, 'ludo-quintus')) addItem(state, 'ludo-quintus');
  return state;
}

export const presetDay09 = () => presetDay(9);

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 9,
  title: 'A stone at a time',
  headline: 'LOCAL DOCTOR, WIFE TO SELL GAMES FOR THE HOLIDAYS',
  season: 'winter',
  seasonName: 'Winter',
  goal: 'Set down a white stone.',
  start: { map: 'bedroom', spawn: 'bedside' },
  flags,
  canon: canonDay09,
  nodes,
  skipPoints,
  extraLines: [lastLine],
  create: createDay09,
  write: writeDay09,
  preset: presetDay09,
};
