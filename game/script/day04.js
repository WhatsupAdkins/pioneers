// Day 4, NEW OPTOMETRIST ACCEPTS INTERESTING TRADES (GAME-PLAN-DAYS §B Day 4), autumn.
// Everything of this day in one file: its record for the registry (`day`, at the end), flags,
// speakers, the book's outcome (canonDay04), nodes, beats, the paper (writeDay04), presetDay04.
//
// Morning in town. In the optometry Dr. Daedalus is with a patient; Emily browses, picks up
// the crystal horse, and the doctor brays. The long conversation of the book follows, with one
// choice (ask where she comes from, or not) and the eye chart in the back office. Outside, Go
// cannot be found: order a set and wait, or (the book) make it. The sequoia comes down for its
// wood, the board is carved at the workbench (spectacles, her name, or both), and taken back.
// The doctor will make the black stones of glass and wants ten rocks for the white; once they
// are brought she finishes the glass heart. That night, a poem; in the morning it is left under
// the sack of rocks on her porch, or kept. Then the paper.
//
// Node ids: d4.<speaker>.<topic>. Lines quoted from the book are `src` (L4.xx in lines/day04.js);
// everything else is `authored` and only connects. Menu choices are `silent`.
import { changeMap, screensFromTown } from '../transitions.js';
import { createDayKit } from './common.js';
import { addItem, countItem, hasItem, itemDefs, removeItem } from '../inventory.js';
import { inWords } from '../newspaper.js';
import { mapFor } from '../../maps/versions.js';
import { rocks as farmRocks, sequoiaAt } from '../../maps/day04-foglands-farm.js';
import { presetDay } from './preset.js';
import { placeBlock, removeBlock } from '../world/day03.js';
import { choosePanel, eyeChart } from '../ui/day03.js';
import { createFastRide, rideNodes } from './fast-ride.js';

export const skipPoints = []; // the book gives Day 4 no Skip; the doctor may still be skipped
export const poemLines = ['L4.77', 'L4.78', 'L4.79', 'L4.80', 'L4.81']; // typed line by line

export const nodes = [
  // beat 1: the optometry
  { id: 'd4.office.browsing', src: 'L4.01', next: 'd4.office.glass' },
  { id: 'd4.office.glass', src: 'L4.02' },
  { id: 'd4.counter.busy', kind: 'narration', text: 'Dr. Daedalus is with a patient. The glass, meanwhile, is there to be looked at.', authored: true },
  { id: 'd4.shelf.look', kind: 'narration', text: 'Bottles, bowls and vases, in every colour glass will take.', authored: true },
  { id: 'd4.case.look', kind: 'narration', text: 'A bowl, a vase, a pair of spectacles too small for anyone.', authored: true },
  { id: 'd4.chart.look', kind: 'narration', text: 'The eye chart. The last lines are very small.', authored: true },
  { id: 'd4.horse.picked', src: 'L4.03', next: 'd4.daedalus.neigh' },
  { id: 'd4.daedalus.neigh', src: 'L4.04', next: 'd4.horse.started' },
  { id: 'd4.horse.started', src: 'L4.05', cue: 'patient', next: 'd4.daedalus.likes' },
  { id: 'd4.daedalus.likes', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L4.06', next: 'd4.emily.simulacrum' },
  { id: 'd4.emily.simulacrum', speaker: 'emily', src: 'L4.07', next: 'd4.daedalus.friends' },
  { id: 'd4.daedalus.friends', speaker: 'daedalus', src: 'L4.08', next: 'd4.emily.spelling' },
  { id: 'd4.emily.spelling', speaker: 'emily', portrait: 'emily-firm', src: 'L4.09', next: 'd4.horse.returned' },
  { id: 'd4.horse.returned', src: 'L4.10', next: 'd4.daedalus.amuse' },
  { id: 'd4.daedalus.amuse', speaker: 'daedalus', src: 'L4.11', next: 'd4.look.dressed' },
  { id: 'd4.look.dressed', src: 'L4.12', next: 'd4.look.circles' },
  { id: 'd4.look.circles', src: 'L4.13', next: 'd4.emily.origin' },
  {
    id: 'd4.emily.origin',
    speaker: 'emily',
    choices: [
      { src: 'L4.14', value: 'ask', set: { askedOrigin: true }, next: 'd4.daedalus.question' },
      { label: 'Say nothing of it.', authored: true, silent: true, value: 'quiet' },
    ],
  },
  { id: 'd4.daedalus.question', speaker: 'daedalus', portrait: 'daedalus-low', src: 'L4.15', next: 'd4.emily.forget' },
  { id: 'd4.emily.forget', speaker: 'emily', src: 'L4.16' },
  // the back office
  { id: 'd4.exam.chart', src: 'L4.17' },
  { id: 'd4.daedalus.horsename', speaker: 'daedalus', src: 'L4.18', next: 'd4.emily.portmanteau' },
  { id: 'd4.emily.portmanteau', speaker: 'emily', src: 'L4.19', next: 'd4.exam.repeated' },
  { id: 'd4.exam.repeated', src: 'L4.20', next: 'd4.daedalus.clever' },
  { id: 'd4.daedalus.clever', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L4.21', next: 'd4.emily.invented' },
  { id: 'd4.emily.invented', speaker: 'emily', src: 'L4.22', next: 'd4.daedalus.restate' },
  { id: 'd4.daedalus.restate', speaker: 'daedalus', src: 'L4.23', next: 'd4.emily.screen' },
  { id: 'd4.emily.screen', speaker: 'emily', src: 'L4.24', next: 'd4.daedalus.screens' },
  { id: 'd4.daedalus.screens', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L4.25' },
  // only when Emily asked where the doctor comes from
  { id: 'd4.secret.smiled', src: 'L4.26', next: 'd4.secret.tongue' },
  { id: 'd4.secret.tongue', src: 'L4.27' },
  { id: 'd4.emily.alabaster', speaker: 'emily', src: 'L4.28', next: 'd4.daedalus.prescription' },
  { id: 'd4.daedalus.prescription', speaker: 'daedalus', src: 'L4.29', next: 'd4.daedalus.menu' },
  { id: 'd4.daedalus.menu', speaker: 'daedalus', src: 'L4.30', next: 'd4.exam.paused' },
  { id: 'd4.exam.paused', src: 'L4.31', next: 'd4.daedalus.pregnant' },
  { id: 'd4.daedalus.pregnant', speaker: 'daedalus', src: 'L4.32', next: 'd4.emily.no' },
  { id: 'd4.emily.no', speaker: 'emily', portrait: 'emily-firm', src: 'L4.33', next: 'd4.daedalus.apologies' },
  { id: 'd4.daedalus.apologies', speaker: 'daedalus', src: 'L4.34', next: 'd4.exam.laughed' },
  { id: 'd4.exam.laughed', src: 'L4.35', next: 'd4.emily.months' },
  { id: 'd4.emily.months', speaker: 'emily', portrait: 'emily-soft', src: 'L4.36', next: 'd4.daedalus.time' },
  { id: 'd4.daedalus.time', speaker: 'daedalus', src: 'L4.37', next: 'd4.emily.know' },
  { id: 'd4.emily.know', speaker: 'emily', src: 'L4.38', next: 'd4.daedalus.days' },
  { id: 'd4.daedalus.days', speaker: 'daedalus', src: 'L4.39', next: 'd4.emily.days' },
  { id: 'd4.emily.days', speaker: 'emily', src: 'L4.40', next: 'd4.daedalus.glasses' },
  { id: 'd4.daedalus.glasses', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L4.41', next: 'd4.emily.usage' },
  { id: 'd4.emily.usage', speaker: 'emily', portrait: 'emily-firm', src: 'L4.42', next: 'd4.daedalus.vision' },
  { id: 'd4.daedalus.vision', speaker: 'daedalus', src: 'L4.43', next: 'd4.emily.owe' },
  { id: 'd4.emily.owe', speaker: 'emily', src: 'L4.44', next: 'd4.trade.proposed' },
  { id: 'd4.trade.proposed', src: 'L4.45', next: 'd4.daedalus.go' },
  { id: 'd4.daedalus.go', speaker: 'daedalus', src: 'L4.46', next: 'd4.trade.heard' },
  { id: 'd4.trade.heard', src: 'L4.47', next: 'd4.emily.sidequest' },
  { id: 'd4.emily.sidequest', speaker: 'emily', src: 'L4.48', next: 'd4.daedalus.weeks' },
  { id: 'd4.daedalus.weeks', speaker: 'daedalus', portrait: 'daedalus-low', src: 'L4.49' },
  { id: 'd4.counter.lenses', kind: 'narration', text: 'Dr. Daedalus is bent over her lenses.', authored: true },

  // beat 2: finding Go
  { id: 'd4.go.channels', src: 'L4.50', next: 'd4.go.choice' },
  {
    id: 'd4.go.choice',
    kind: 'narration',
    text: 'A board of nineteen lines by nineteen, and stones.',
    authored: true,
    choices: [
      { label: 'Make the board herself', authored: true, silent: true, value: 'make' },
      { label: 'Order a set, and wait', authored: true, silent: true, value: 'order', set: { boardOrdered: true } },
    ],
  },
  { id: 'd4.go.decided', src: 'L4.51' },
  { id: 'd4.go.ordered', kind: 'narration', text: 'She wrote away for an edition through her usual channels, and settled in to wait.', authored: true },
  { id: 'd4.go.none', kind: 'narration', text: 'Word came back: there was no Go to be had in Friendship, at any price.', authored: true, next: 'd4.go.decided' },
  { id: 'd4.sequoia.look', kind: 'narration', text: 'The great sequoia. It was here before the farm was.', authored: true },
  { id: 'd4.sequoia.felled', src: 'L4.52' },
  { id: 'd4.bench.idle', kind: 'narration', text: 'The workbench, and her tools. There is nothing on it yet.', authored: true },
  {
    id: 'd4.bench.pattern',
    kind: 'narration',
    text: 'Sequoia wood, cut and planed. What to carve on the sides?',
    authored: true,
    choices: [
      { label: 'Spectacles, and Dr. Daedalus’s name', authored: true, silent: true, value: 'both' },
      { label: 'A pattern of spectacles', authored: true, silent: true, value: 'spectacles' },
      { label: 'Dr. Daedalus’s name', authored: true, silent: true, value: 'name' },
    ],
  },
  { id: 'd4.bench.both', src: 'L4.53' },
  { id: 'd4.bench.spectacles', kind: 'narration', text: 'She added a secret drawer for storing pieces, and carved a pattern of spectacles on the sides.', authored: true },
  { id: 'd4.bench.name', kind: 'narration', text: 'She added a secret drawer for storing pieces, and carved Dr. Daedalus’s name on the sides.', authored: true },

  // beat 3: the board delivered
  { id: 'd4.return.sculpture', src: 'L4.54' },
  { id: 'd4.present.vulnerable', src: 'L4.55', next: 'd4.emily.glass' },
  { id: 'd4.emily.glass', speaker: 'emily', portrait: 'emily-soft', src: 'L4.56', next: 'd4.present.considered' },
  { id: 'd4.present.considered', src: 'L4.57', next: 'd4.daedalus.board' },
  { id: 'd4.daedalus.board', speaker: 'daedalus', src: 'L4.58', next: 'd4.present.agreed' },
  { id: 'd4.present.agreed', src: 'L4.59', next: 'd4.daedalus.settled' },
  { id: 'd4.daedalus.settled', speaker: 'daedalus', portrait: 'daedalus-pleased', src: 'L4.60', next: 'd4.emily.imperfect' },
  { id: 'd4.emily.imperfect', speaker: 'emily', src: 'L4.61', next: 'd4.daedalus.diversion' },
  { id: 'd4.daedalus.diversion', speaker: 'daedalus', src: 'L4.62' },
  { id: 'd4.counter.rocks', kind: 'narration', text: 'Dr. Daedalus looks up from the glass. Ten rocks, for the white stones.', authored: true },
  { id: 'd4.rocks.sack', kind: 'narration', text: 'She brought the rocks in a sack, and Dr. Daedalus had her set it down on the porch.', authored: true },

  // beat 4: the crystal heart
  { id: 'd4.emily.making', speaker: 'emily', src: 'L4.63', next: 'd4.daedalus.prize' },
  { id: 'd4.daedalus.prize', speaker: 'daedalus', src: 'L4.64', next: 'd4.emily.determined' },
  { id: 'd4.emily.determined', speaker: 'emily', src: 'L4.65', next: 'd4.daedalus.gifts' },
  { id: 'd4.daedalus.gifts', speaker: 'daedalus', src: 'L4.66', next: 'd4.emily.town' },
  { id: 'd4.emily.town', speaker: 'emily', portrait: 'emily-firm', src: 'L4.67', next: 'd4.heart.shook' },
  { id: 'd4.heart.shook', src: 'L4.68', next: 'd4.emily.fishy' },
  { id: 'd4.emily.fishy', speaker: 'emily', portrait: 'emily-firm', src: 'L4.69', next: 'd4.daedalus.cynical' },
  { id: 'd4.daedalus.cynical', speaker: 'daedalus', src: 'L4.70', next: 'd4.heart.finished' },
  { id: 'd4.heart.finished', src: 'L4.71', next: 'd4.daedalus.minor' },
  { id: 'd4.daedalus.minor', speaker: 'daedalus', portrait: 'daedalus-low', src: 'L4.72', next: 'd4.heart.held' },
  { id: 'd4.heart.held', src: 'L4.73', cue: 'heart', next: 'd4.daedalus.warm' },
  { id: 'd4.daedalus.warm', speaker: 'daedalus', portrait: 'daedalus-low', src: 'L4.74', next: 'd4.heart.moved' },
  { id: 'd4.heart.moved', src: 'L4.75' },
  { id: 'd4.counter.after', kind: 'narration', text: 'Dr. Daedalus has gone back to her lenses.', authored: true },

  // the night, and the morning
  {
    id: 'd4.rest.ask',
    kind: 'narration',
    text: 'The porch steps. Rest here until morning?',
    authored: true,
    choices: [
      { label: 'Rest until morning', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd4.night.poem', src: 'L4.76' },
  {
    id: 'd4.poem.choice',
    kind: 'narration',
    text: 'The poem, folded small.',
    authored: true,
    choices: [
      { label: 'Leave it under the sack of rocks, in the morning', authored: true, silent: true, value: 'leave', set: { leftPoem2: true } },
      { label: 'Keep it', authored: true, silent: true, value: 'keep' },
    ],
  },
  { id: 'd4.poem.left', src: 'L4.82' },
  { id: 'd4.poem.kept', kind: 'narration', text: 'She kept the poem, and in the morning went down to her store as on any other day.', authored: true },

  // town, otherwise
  { id: 'd4.board.look', kind: 'narration', text: 'The town board, with the season’s notices.', authored: true, next: 'd4.board.notices' },
  { id: 'd4.board.notices', kind: 'narration', text: 'NEW OPTOMETRIST: INTERESTING TRADES ACCEPTED   ·   NEIGHBORS: A GIFT GIVEN IS A GIFT OWED', authored: true },
  { id: 'd4.mirror.locked', kind: 'narration', text: 'The door is locked. A card in the window says GONE TO PRESS.', authored: true },
  { id: 'd4.pen.empty', kind: 'narration', text: 'The pen is empty. Pixel is with her.', authored: true },
  { id: 'd4.store.look', kind: 'narration', text: 'Her own store. It can mind itself this morning.', authored: true },
  { id: 'd4.villager-a.hello', speaker: 'villager-a', text: 'You’ve been to the new doctor? Everything looks sharper after, they say.', authored: true },
  { id: 'd4.villager-b.hello', speaker: 'villager-b', text: 'Good day, Miss Marks.', authored: true },
  {
    id: 'd4.gift.offer',
    kind: 'narration',
    text: 'Give a gift?',
    authored: true,
    choices: [
      { label: 'Give a gift', authored: true, silent: true, value: 'give' },
      { label: 'Not now', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd4.villager-a.thanks', speaker: 'villager-a', text: 'That’s good of you.', authored: true },
  { id: 'd4.villager-b.thanks', speaker: 'villager-b', text: 'How lovely. Thank you.', authored: true },
  { id: 'd4.villager-a.rock', speaker: 'villager-a', text: 'A rock. Of course.', authored: true },
  { id: 'd4.villager-b.rock', speaker: 'villager-b', text: 'Oh. A rock.', authored: true },
  ...rideNodes('d4'),
];

// ---------------------------------------------------------------- the numbers
export const rocksWanted = 10; // for the white stones
export const fellingHearts = 3;
export const ordersWait = 1; // Rests before the order comes back empty (was 2 until 2026-10-22)
export const chartLines = ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D'];

const squareArea = { x: 20, y: 12, w: 10, h: 5 };
const squareAvoid = [{ x: 24, y: 12, w: 2, h: 3 }];
const villagerStarts = { 'villager-a': { x: 21, y: 15 }, 'villager-b': { x: 28, y: 14 } };

export const ridesOn = (state, mapId) => Boolean(state.flags.boughtHorse) && (mapId === 'friendship' || mapId === 'foglands-road');

// The HUD's "Now:" line, from the state alone.
export function goalDay04(state) {
  const { flags, map } = state;
  const town = map === 'friendship';
  const inside = map === 'optometry';
  const farm = map === 'foglands';
  const toOptometry = inside ? 'Talk to Dr. Daedalus across the counter.' : town ? 'The optometry: three doors down from your store.' : 'Ride to town, to the optometry.';
  if (flags.gotHeart) return farm ? 'Rest on the porch steps.' : 'Go home to Upper Foglands and rest.';
  if (!flags.examined) {
    if (inside) return 'The doctor is busy. Look at the glass while you wait.';
    return 'See the optometrist, three doors down.';
  }
  if (!flags.goDecided) return town ? 'Go is not to be had in town.' : 'Find Dr. Daedalus a game of Go.';
  if (flags.boardOrdered && !flags.orderFailed) return farm ? 'Rest on the porch steps while the order comes.' : 'Go home and wait for the order.';
  if (!flags.boardMade) {
    if (!hasItem(state, 'wood')) return farm ? 'Fell the sequoia, west of the house, for its wood.' : 'Ride home to Myre Farm: the sequoia.';
    return farm ? 'Carve the board at the workbench, west of the porch.' : 'Ride home to the workbench.';
  }
  if (!flags.boardGiven) return toOptometry;
  if (!flags.stonesDelivered) {
    const have = countItem(state, 'rock');
    if (have >= rocksWanted) return toOptometry;
    return farm ? `Gather rocks on the farm for the white stones (${have} of ${rocksWanted}).` : `Ride home for rocks (${have} of ${rocksWanted}).`;
  }
  return toOptometry;
}

export function createDay04(ctx) {
  const { state, world, dialogue, hud } = ctx;
  const { flags, marks } = state;
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  const ride = createFastRide(ctx, kit, 'd4');
  kit.goalOf = () => goalDay04(state);
  const farmMap = mapFor('foglands', 4);
  const townMap = mapFor('friendship', 4);
  const officeMap = mapFor('optometry', 4);
  marks.picked ??= {};

  // ---------------------------------------------------------------- start
  async function wake() {
    hud.update(state);
    hud.show();
    if (marks.woke) return;
    marks.woke = true;
    if (!ctx.reducedMotion) await world.fade('in', 900);
    kit.hint('optometry', 'The optometry is three doors east of your store.', 5200);
  }

  // ---------------------------------------------------------------- beat 1: the optometry
  async function enterOptometry() {
    await changeMap(ctx, 'optometry', 'door');
    if (!flags.examined && !marks.browsed) {
      marks.browsed = true;
      await talk('d4.office.browsing');
    } else if (hasItem(state, 'go-board') && !flags.boardGiven && !marks.returned) {
      marks.returned = true;
      await talk('d4.return.sculpture');
    }
  }

  async function horse() {
    if (flags.examined) {
      hud.toast('The little azure horse, back in the menagerie.', 2400);
      return;
    }
    const daedalus = world.npc('daedalus');
    world.facePlayer('up');
    // through the choice: asked, the conversation runs on to "I forget myself!"
    await talk('d4.horse.picked', { hour: true });
    await exam(daedalus);
    flags.examined = true;
    state.companions.daedalus += 1;
  }

  async function exam() {
    await talk('d4.exam.chart');
    await world.fade('out', 400);
    world.placePlayer('exam');
    world.spawnNpc('daedalus', officeMap.marks.doctorExam, 'left');
    await world.fade('in', 400);
    const pick = await choosePanel({
      title: 'The eye chart',
      intro: 'Which is the last line she can read clearly?',
      body: eyeChart(chartLines),
      rows: [2, 3, 4, 5].map((line) => ({ value: line, label: `Line ${line}: ${chartLines[line - 1]}` })),
      leave: 'None of them',
      headless: 3,
    });
    flags.eyeLine = pick ?? 1;
    world.facePlayer('right');
    await talk('d4.daedalus.horsename');
    if (flags.askedOrigin) await talk('d4.secret.smiled');
    await talk('d4.emily.alabaster', { hour: true });
    await world.fade('out', 400);
    world.spawnNpc('daedalus', officeMap.marks.doctor, 'down');
    await world.fade('in', 400);
  }

  async function counter() {
    if (!flags.examined) {
      if (world.npc('villager-b')) return talk('d4.counter.busy');
      return horse();
    }
    if (hasItem(state, 'go-board') && !flags.boardGiven) {
      await talk('d4.present.vulnerable', { hour: true });
      removeItem(state, 'go-board');
      flags.boardGiven = true;
      if (countItem(state, 'rock') < rocksWanted) {
        kit.hint('rocks', `Ten rocks for the white stones. Myre Farm has plenty lying about: face one and press E.`, 5200);
        return undefined;
      }
    }
    if (flags.boardGiven && !flags.stonesDelivered) {
      if (countItem(state, 'rock') < rocksWanted) return talk('d4.counter.rocks');
      return deliver();
    }
    return talk(flags.gotHeart ? 'd4.counter.after' : 'd4.counter.lenses');
  }

  async function deliver() {
    await talk('d4.rocks.sack');
    removeItem(state, 'rock', rocksWanted);
    flags.stonesDelivered = true;
    await talk('d4.emily.making', { hour: true });
    flags.gotHeart = true;
    state.companions.daedalus += 1;
    kit.hint('home', 'Home to Upper Foglands, and rest.', 4200);
  }

  // ---------------------------------------------------------------- beat 2: finding Go
  async function decideGo() {
    const choice = await talk('d4.go.channels');
    flags.goDecided = true;
    if (choice === 'order') {
      await talk('d4.go.ordered');
      kit.hint('order', 'The order will take a while: rest at home and see.', 4200);
    } else {
      await talk('d4.go.decided');
    }
  }

  async function sequoia() {
    if (flags.sequoiaCut) return undefined;
    if (!flags.goDecided || (flags.boardOrdered && !flags.orderFailed)) return talk('d4.sequoia.look');
    if (state.hearts < fellingHearts) {
      hud.toast(`Felling the sequoia takes ${inWords(fellingHearts)} hearts. Rest first.`, 2800);
      return undefined;
    }
    await world.fade('out', 700);
    flags.sequoiaCut = true;
    removeBlock(world, 'sequoia');
    kit.loseHearts(fellingHearts);
    ctx.sound?.play('step');
    await world.fade('in', 700);
    kit.give('wood', 1, 'Sequoia wood');
    await talk('d4.sequoia.felled');
    return undefined;
  }

  async function workbench() {
    if (!hasItem(state, 'wood')) return talk('d4.bench.idle');
    const pattern = await talk('d4.bench.pattern');
    removeItem(state, 'wood');
    flags.boardMade = true;
    flags.boardPattern = pattern ?? 'both';
    kit.give('go-board', 1, 'Go board');
    await talk(`d4.bench.${flags.boardPattern}`);
    return undefined;
  }

  async function rock(target) {
    if (marks.picked[target.id]) return;
    const count = farmRocks.find((r) => r.id === target.id)?.count ?? 1;
    if (!kit.give('rock', count, count > 1 ? 'Rocks' : 'Rock')) return;
    marks.picked[target.id] = true;
    world.removeProp(target.id);
    if (flags.boardGiven) kit.hint('rockcount', `Rocks: ${countItem(state, 'rock')} of ${rocksWanted}.`, 2400);
  }

  // ---------------------------------------------------------------- rest, the night, the morning
  async function rest() {
    if ((await talk('d4.rest.ask')) !== 'rest') return;
    if (flags.gotHeart) {
      await night();
      return;
    }
    await world.fade('out', 500);
    state.week += 1;
    state.hearts = state.heartsMax;
    state.clock = 6;
    world.setSky(state.clock);
    hud.update(state);
    world.placePlayer('porch');
    state.map = 'foglands';
    state.spawn = 'porch';
    ctx.save?.();
    await world.fade('in', 500);
    hud.toast('You rest. Hearts restored.', 2400);
    if (flags.boardOrdered && !flags.orderFailed) {
      flags.orderRests = (flags.orderRests ?? 0) + 1;
      if (flags.orderRests >= ordersWait) {
        flags.orderFailed = true;
        await talk('d4.go.none');
      }
    }
  }

  async function night() {
    await world.fade('out', 800);
    world.placePlayer('porch');
    state.clock = 21;
    world.night?.();
    await world.fade('in', 800);
    await talk('d4.night.poem');
    await dialogue.poem(poemLines);
    kit.give('poem-2', 1, 'A second poem');
    const choice = await talk('d4.poem.choice');
    if (choice === 'leave') {
      await world.fade('out', 900);
      state.clock = 7;
      await changeMap(ctx, 'friendship', 'optometry-porch');
      removeItem(state, 'poem-2');
      state.giftsGiven += 1;
      world.placeProp('rock-bag', townMap.marks.porchBag, 'rock-bag-poem');
      await talk('d4.poem.left');
    } else {
      await talk('d4.poem.kept');
    }
    hud.setGoal('');
    await world.fade('out', 1000);
    ctx.ended = true;
    hud.hide();
    await ctx.endDay();
  }

  // ---------------------------------------------------------------- neighbours
  async function villager(key) {
    const npc = world.npc(key);
    npc?.stopWander();
    npc?.face({ up: 'down', down: 'up', left: 'right', right: 'left' }[world.player?.face] ?? 'down');
    await talk(`d4.${key}.hello`);
    const giftable = state.inventory.some((entry) => itemDefs[entry.id].gift);
    if (giftable && !marks[`gave-${key}`] && (await talk('d4.gift.offer')) === 'give') {
      const id = await ctx.inventory.pick({ filter: (item) => Boolean(itemDefs[item].gift) });
      if (id && removeItem(state, id)) {
        marks[`gave-${key}`] = true;
        state.giftsGiven += 1;
        if (id === 'rock') flags.rocksGiven = (flags.rocksGiven ?? 0) + 1;
        await talk(`d4.${key}.${id === 'rock' ? 'rock' : 'thanks'}`);
      }
    }
    if (!npc?.gone) npc?.wander(squareArea, { seed: key === 'villager-a' ? 4 : 8, avoid: squareAvoid });
  }

  async function mercantile() {
    await ctx.shop.open({
      title: 'The Mercantile',
      greeting: 'Apples are in. We still take turnips and cheese.',
      items: [
        { id: 'turnip', price: 2, mode: 'sell' },
        { id: 'cheese', price: 2, mode: 'sell' },
      ],
    });
    hud.update(state);
  }

  // ---------------------------------------------------------------- moving about
  async function leave(exit) {
    const fromOffice = state.map === 'optometry';
    await changeMap(ctx, exit.to, exit.spawn);
    if (fromOffice && flags.examined && !flags.goDecided) await decideGo();
  }

  function roadToll() {
    const riding = ridesOn(state, 'foglands-road');
    kit.loseHearts(riding ? 1 : 2);
  }

  const objectHandlers = {
    'optometry-door': enterOptometry,
    'store-door': () => talk('d4.store.look'),
    counter,
    'glass-horse': horse,
    'glass-shelf': () => talk('d4.shelf.look'),
    'glass-case': () => talk('d4.case.look'),
    'eye-chart': () => talk('d4.chart.look'),
    sequoia,
    workbench,
    porch: rest,
    'mercantile-door': mercantile,
    hutch: () => talk('d4.board.look'),
    'mirror-door': () => talk('d4.mirror.locked'),
    'stable-pen': () => talk('d4.pen.empty'),
  };
  const npcHandlers = {
    'villager-a': () => villager('villager-a'),
    'villager-b': () => (state.map === 'friendship' ? villager('villager-b') : talk('d4.counter.busy')),
    daedalus: counter,
  };
  const handlerFor = (target) => {
    if (target.npc === 'pixel') return ride.handler();
    if (target.npc) return npcHandlers[target.npc] ?? null;
    if (target.type === 'rock') return marks.picked[target.id] ? null : () => rock(target);
    if (target.id === 'sequoia' && flags.sequoiaCut) return null;
    return objectHandlers[target.id] ?? null;
  };

  const api = {
    start: () => beat(wake),
    get busy() {
      return kit.busy;
    },

    mapBuilt(mapId) {
      world.setRiding(ridesOn(state, mapId) && !ride.afoot(mapId));
      ride.mapBuilt(mapId);
      if (mapId === 'foglands') {
        if (flags.boughtHorse) world.showPixel(farmMap.marks.hitch, 'west');
        if (!flags.sequoiaCut) placeBlock(world, 'sequoia', 'sequoia', sequoiaAt);
        for (const r of farmRocks) if (!marks.picked[r.id]) world.placeProp(r.id, r, r.tile);
      } else if (mapId === 'friendship') {
        if (flags.keptToBooks) placeBlock(world, 'store-front', 'friendship-books', townMap.marks.lot);
        if (flags.stonesDelivered) world.placeProp('rock-bag', townMap.marks.porchBag, flags.leftPoem2 ? 'rock-bag-poem' : 'rock-bag');
        for (const [key, tile] of Object.entries(villagerStarts)) {
          world.spawnNpc(key, tile, 'down').wander(squareArea, { seed: key === 'villager-a' ? 4 : 8, avoid: squareAvoid });
        }
      } else if (mapId === 'optometry') {
        world.spawnNpc('daedalus', officeMap.marks.doctor, 'down');
        if (!flags.examined && !marks.patientGone) world.spawnNpc('villager-b', officeMap.marks.patient, 'up');
      }
      kit.refreshGoal();
    },

    onTile({ x, map }) {
      if (map === 'foglands-road') hud.setScreens(screensFromTown(x));
    },

    onTrigger(object) {
      if (object.id === 'halfway') roadToll();
    },

    onExit(exit) {
      return beat(() => leave(exit));
    },

    canInteract(target) {
      return Boolean(handlerFor(target));
    },

    onInteract(target) {
      const handler = handlerFor(target);
      return handler ? beat(() => handler(target)) : undefined;
    },

    async cue(name) {
      if (name === 'patient') {
        const patient = world.npc('villager-b');
        marks.patientGone = true;
        if (patient) patient.walkPath(officeMap.marks.patientOut, 60).then(() => patient.destroy?.());
      } else if (name === 'heart') {
        kit.give('glass-heart', 1, 'A glass heart');
      }
    },
  };

  // ---------------------------------------------------------------- headless walk-through
  // The canon route for check-days.mjs: the optometry and the horse (the exam, the trade), the
  // board made (or, on a variant, ordered first and waited for), the sequoia, the workbench, the
  // board taken back, rocks gathered, the rocks and the heart, the night and the poem.
  const go = (to, spawn) => () => api.onExit({ to, spawn });
  const toTown = [go('foglands-road', 'from-east'), () => api.onTrigger({ id: 'halfway' }), go('friendship', 'from-east')];
  const toFarm = [go('foglands-road', 'from-west'), () => api.onTrigger({ id: 'halfway' }), go('foglands', 'from-road')];
  const byPixel = [() => api.onInteract({ npc: 'pixel' })];
  const route = [
    () => api.start(),
    () => api.onInteract({ id: 'optometry-door' }),
    () => api.onInteract({ id: 'glass-horse' }),
    go('friendship', 'from-optometry'),
    ...byPixel, // Pixel waits outside the store: straight home
    async () => {
      while (flags.boardOrdered && !flags.orderFailed) await api.onInteract({ id: 'porch' });
    },
    () => api.onInteract({ id: 'sequoia' }),
    () => api.onInteract({ id: 'workbench' }),
    ...byPixel,
    () => api.onInteract({ id: 'optometry-door' }),
    () => api.onInteract({ id: 'counter' }),
    go('friendship', 'from-optometry'),
    ...byPixel,
    ...farmRocks.slice(0, 7).map((r) => () => api.onInteract({ ...r })),
    ...toTown,
    () => api.onInteract({ id: 'optometry-door' }),
    () => api.onInteract({ id: 'counter' }),
    go('friendship', 'from-optometry'),
    ...toFarm,
    () => api.onInteract({ id: 'porch' }),
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
// NEW OPTOMETRIST ACCEPTS INTERESTING TRADES. Every sentence authored, in the Editor's voice.
const ordinals = ['first', 'second', 'third', 'fourth', 'fifth'];
export function writeDay04(state) {
  const { flags } = state;
  const body = [];
  body.push('Dr. Edna Daedalus, optometrist, keeps a shop on the square, three doors down from Friendship Books, Etc. She grinds lenses, blows glass for her own amusement, and accepts interesting trades.');
  if (flags.examined) body.push(`Miss Emily B. Marks has been examined there and read the chart to the ${ordinals[(flags.eyeLine ?? 1) - 1] ?? 'first'} line. New glasses are promised in a couple of days, whatever days are.`);
  else body.push('Miss Emily B. Marks has been seen outside the optometry, but not, as yet, inside it.');
  if (flags.examined) body.push(flags.askedOrigin
    ? 'Miss Marks is said to have asked the doctor where she comes from. This paper reminds its readers that nobody here comes from anywhere.'
    : 'The two are said to have got on, which in Friendship is news.');
  const carved = { both: 'spectacles and the doctor’s name', spectacles: 'a pattern of spectacles', name: 'the doctor’s name' }[flags.boardPattern] ?? 'spectacles and the doctor’s name';
  if (flags.boardMade) {
    body.push(`${flags.boardOrdered ? 'Having sent away for a set of Go and been told there was none' : 'Unable to find a set of Go for sale'}, Miss Marks made the doctor a board herself, from the great sequoia of Myre Farm, which no longer stands. It is carved with ${carved}.`);
  } else if (flags.boardOrdered) {
    body.push('Miss Marks has sent away for a set of Go. This paper wishes her luck.');
  }
  if (flags.stonesDelivered) body.push('The black stones will be glass. The white will be rocks from Upper Foglands, a sack of which now sits on the optometry’s porch.');
  else if (flags.boardGiven) body.push('The doctor is to make the stones; the white ones, we hear, await a delivery of rocks.');
  const gifts = state.giftsGiven ?? 0;
  const standing = gifts >= 6 ? 'a favorite' : gifts >= 3 ? 'in contention, though rocks may count for less' : 'not yet in contention';
  body.push(`On another matter: the doctor is at work on a glass prize for the most charitable person in Friendship. By this paper’s count Miss Marks has given ${inWords(gifts)} ${gifts === 1 ? 'gift' : 'gifts'}, which makes her ${standing}.`);
  if (flags.gotHeart) body.push(flags.leftPoem2 ? 'A heart of glass was seen leaving the optometry in Miss Marks’s hands. Something folded has since been seen under the sack on the porch.' : 'A heart of glass was seen leaving the optometry in Miss Marks’s hands.');
  body.push('The optometry is open daily. Its hours are posted on the door.');
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Autumn · Year 1',
    headline: 'NEW OPTOMETRIST ACCEPTS INTERESTING TRADES',
    body,
  };
}

// ---------------------------------------------------------------- state
export const flags = {
  examined: false,
  askedOrigin: false,
  eyeLine: 0,
  goDecided: false,
  boardOrdered: false,
  orderRests: 0,
  orderFailed: false,
  sequoiaCut: false,
  boardMade: false,
  boardPattern: '',
  boardGiven: false,
  stonesDelivered: false,
  gotHeart: false,
  leftPoem2: false,
};

export const speakers = {
  daedalus: { name: 'Dr. Daedalus', portrait: 'daedalus-neutral' },
  'villager-a': { name: 'A farmer' },
  'villager-b': { name: 'A townswoman' },
};

// The book's Day 4: the horse, the question asked, the exam; the board made from the sequoia
// and carved with spectacles and her name; ten rocks for the white stones; the glass heart;
// the poem left under the sack on the optometry's porch.
export function canonDay04(state) {
  Object.assign(state.flags, {
    examined: true, askedOrigin: true, eyeLine: 3, goDecided: true, sequoiaCut: true, boardMade: true, boardPattern: 'both',
    boardGiven: true, stonesDelivered: true, gotHeart: true, leftPoem2: true,
  });
  state.companions.daedalus += 2;
  state.giftsGiven += 1;
  const rocks = countItem(state, 'rock');
  if (rocks > 2) removeItem(state, 'rock', rocks - 2);
  if (!hasItem(state, 'glass-heart')) addItem(state, 'glass-heart');
  return state;
}

// Day 4's preset, self-sufficient (archive/PARALLEL-RULES.md §4): Day 3's outcome written out here too.
export function presetDay04() {
  const state = presetDay(4);
  Object.assign(state.flags, { boughtHorse: true, horseName: state.flags.horseName || 'Pixel', storeBuilt: true, tookAdvice: true, collapsed: true, heardOfDaedalus: true });
  state.store.built = true;
  state.store.name = 'Friendship Books, Stationery, & Games';
  state.heartsMax = 10;
  state.hearts = 10;
  return state;
}

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 4,
  title: 'All the pixels',
  headline: 'NEW OPTOMETRIST ACCEPTS INTERESTING TRADES',
  season: 'autumn',
  seasonName: 'Autumn',
  goal: 'See the optometrist, three doors down.',
  start: { map: 'friendship', spawn: 'from-store' },
  flags,
  speakers,
  canon: canonDay04,
  nodes,
  skipPoints,
  extraLines: [...poemLines, 'L4.14'], // the verse, and Emily's question (said through a choice)
  create: createDay04,
  write: writeDay04,
  preset: presetDay04,
};
