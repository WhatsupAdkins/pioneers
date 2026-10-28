// Day 3, BOOKSTORE TO SELL CARDS AND GAMES (GAME-PLAN-DAYS §B Day 3), autumn. Everything of
// this day in one file: its record for the registry (`day`, at the end), flags, speakers, the
// book's outcome (canonDay03), nodes, beats, the paper (writeDay03) and presetDay03.
//
// Alabaster on the porch: there must be more than farming. The ledger by the steps sells the
// equipment, rents the land to Alabaster and builds the store on the open lot in town. The
// Editor interviews her on opening day. Then the weeks: each week Emily stocks the store at its
// counter and rides home to rest; the store costs her hearts (the cap is six this day) and,
// selling books alone, gold. After the third week Alabaster is waiting in the store with advice:
// cards, and games. Taken, the store is renamed; refused, it stays a bookstore. At the next
// Rest she collapses on her front steps; Alabaster finds her, gives her PioneerAde, and sends
// her to the optometrist. Then the paper.
//
// Node ids: d3.<speaker>.<topic>. Lines quoted from the book are `src` (L3.xx in lines/day03.js);
// everything else is `authored` and only connects. Menu choices are `silent`.
import { changeMap, screensFromTown } from '../transitions.js';
import { createDayKit } from './common.js';
import { addItem, countItem, hasItem, itemDefs, removeItem } from '../inventory.js';
import { inWords } from '../newspaper.js';
import { mapFor } from '../../maps/versions.js';
import { presetDay } from './preset.js';
import { placeBlock, removeBlock } from '../world/day03.js';
import { choosePanel } from '../ui/day03.js';
import { createFastRide, rideNodes } from './fast-ride.js';

export const skipPoints = []; // the book gives Day 3 no Skip; the Editor may still be skipped

export const nodes = [
  // beat 1: on the porch
  { id: 'd3.porch.visitors', src: 'L3.01', next: 'd3.emily.suited' },
  { id: 'd3.emily.suited', speaker: 'emily', src: 'L3.02', next: 'd3.alabaster.farm' },
  { id: 'd3.alabaster.farm', speaker: 'alabaster', src: 'L3.03', next: 'd3.emily.though' },
  { id: 'd3.emily.though', speaker: 'emily', src: 'L3.04', next: 'd3.alabaster.store' },
  { id: 'd3.alabaster.store', speaker: 'alabaster', src: 'L3.05', next: 'd3.alabaster.wine' },
  { id: 'd3.alabaster.wine', speaker: 'alabaster', src: 'L3.06', next: 'd3.emily.shopkeeper' },
  { id: 'd3.emily.shopkeeper', speaker: 'emily', portrait: 'emily-firm', src: 'L3.07' },

  // beat 2: the ledger
  { id: 'd3.ledger.decided', src: 'L3.08' },
  { id: 'd3.ledger.built', src: 'L3.09' },
  { id: 'd3.alabaster.advance', speaker: 'alabaster', text: 'A season in advance. A vintner learns to pay before the harvest.', authored: true },
  { id: 'd3.ledger.short', kind: 'narration', text: 'The purse will not stretch to a building yet. Alabaster’s rent comes in each time she rests.', authored: true },

  // the porch steps
  {
    id: 'd3.rest.ask',
    kind: 'narration',
    text: 'The porch steps. Rest here until morning?',
    authored: true,
    choices: [
      { label: 'Rest until morning', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },

  // beat 3: the interview
  { id: 'd3.interview.opening', src: 'L3.10', next: 'd3.editor.readers' },
  { id: 'd3.editor.readers', speaker: 'editor', src: 'L3.11', next: 'd3.interview.memory' },
  { id: 'd3.interview.memory', src: 'L3.12', next: 'd3.editor.bookstore' },
  { id: 'd3.editor.bookstore', speaker: 'editor', portrait: 'editor-keen', src: 'L3.13', next: 'd3.emily.poet' },
  { id: 'd3.emily.poet', speaker: 'emily', src: 'L3.14', next: 'd3.editor.struggles' },
  { id: 'd3.editor.struggles', speaker: 'editor', src: 'L3.15', next: 'd3.emily.virtual' },
  { id: 'd3.emily.virtual', speaker: 'emily', src: 'L3.16', next: 'd3.editor.virtual' },
  { id: 'd3.editor.virtual', speaker: 'editor', portrait: 'editor-keen', src: 'L3.17', next: 'd3.emily.nearly' },
  { id: 'd3.emily.nearly', speaker: 'emily', portrait: 'emily-firm', src: 'L3.18', next: 'd3.editor.riddles' },
  { id: 'd3.editor.riddles', speaker: 'editor', src: 'L3.19' },

  // beat 4: the weeks
  { id: 'd3.weeks.readers', src: 'L3.20' },
  { id: 'd3.weeks.verge', src: 'L3.21' },
  { id: 'd3.stock.done', kind: 'narration', text: 'The shelves are stocked for the week. The store will see it through while she rests at home.', authored: true },
  { id: 'd3.shelves.books', kind: 'narration', text: 'Books, spines out, in good order. Few of them have moved.', authored: true },
  { id: 'd3.shelves.etc', kind: 'narration', text: 'Books, then greeting cards, then boxed games. The games move.', authored: true },
  // Alabaster's advice, in the store after the third week
  { id: 'd3.advice.cards', src: 'L3.22', next: 'd3.alabaster.addition' },
  { id: 'd3.alabaster.addition', speaker: 'alabaster', src: 'L3.23', next: 'd3.emily.difference' },
  { id: 'd3.emily.difference', speaker: 'emily', src: 'L3.24', next: 'd3.alabaster.cabbage' },
  { id: 'd3.alabaster.cabbage', speaker: 'alabaster', src: 'L3.25', next: 'd3.advice.afterthought' },
  { id: 'd3.advice.afterthought', src: 'L3.26', next: 'd3.alabaster.games' },
  { id: 'd3.alabaster.games', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L3.27', next: 'd3.advice.choice' },
  {
    id: 'd3.advice.choice',
    kind: 'narration',
    text: 'Cards and games, besides the books?',
    authored: true,
    choices: [
      { label: 'Take Alabaster’s advice', authored: true, silent: true, value: 'take', set: { tookAdvice: true } },
      { label: 'Keep to books', authored: true, silent: true, value: 'books', set: { keptToBooks: true } },
    ],
  },
  { id: 'd3.advice.renamed', src: 'L3.28' },
  { id: 'd3.advice.books', kind: 'narration', text: 'She thanked Alabaster, and kept to books.', authored: true },

  // beat 5: on the steps
  { id: 'd3.collapse.living', src: 'L3.29' },
  { id: 'd3.collapse.found', src: 'L3.30', cue: 'roused', next: 'd3.alabaster.baby' },
  { id: 'd3.alabaster.baby', speaker: 'alabaster', src: 'L3.31', next: 'd3.collapse.speechless' },
  { id: 'd3.collapse.speechless', src: 'L3.32', next: 'd3.alabaster.eating' },
  { id: 'd3.alabaster.eating', speaker: 'alabaster', src: 'L3.33', next: 'd3.collapse.can' },
  { id: 'd3.collapse.can', src: 'L3.34', cue: 'can', next: 'd3.alabaster.drink' },
  { id: 'd3.alabaster.drink', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L3.35', cue: 'drink', next: 'd3.emily.pain' },
  { id: 'd3.emily.pain', speaker: 'emily', portrait: 'emily-soft', src: 'L3.36', next: 'd3.collapse.studied' },
  { id: 'd3.collapse.studied', src: 'L3.37', next: 'd3.alabaster.glasses' },
  { id: 'd3.alabaster.glasses', speaker: 'alabaster', src: 'L3.38', next: 'd3.emily.optometrist' },
  { id: 'd3.emily.optometrist', speaker: 'emily', src: 'L3.39', next: 'd3.alabaster.daedalus' },
  { id: 'd3.alabaster.daedalus', speaker: 'alabaster', src: 'L3.40' },

  // town, otherwise
  { id: 'd3.board.look', kind: 'narration', text: 'The town board, with the season’s notices.', authored: true, next: 'd3.board.notices' },
  { id: 'd3.board.notices', kind: 'narration', text: 'APPLES AT THE MERCANTILE   ·   NEIGHBORS: A GIFT GIVEN IS A GIFT OWED', authored: true },
  { id: 'd3.mirror.locked', kind: 'narration', text: 'The door is locked. A card in the window says GONE TO PRESS.', authored: true },
  { id: 'd3.pen.empty', kind: 'narration', text: 'The pen is empty. Pixel is with her.', authored: true },
  { id: 'd3.villager-a.hello', speaker: 'villager-a', text: 'Morning, Miss Marks. Cold one.', authored: true },
  { id: 'd3.villager-b.hello', speaker: 'villager-b', text: 'They say you’re opening a shop. Whatever for?', authored: true },
  {
    id: 'd3.gift.offer',
    kind: 'narration',
    text: 'Give a gift?',
    authored: true,
    choices: [
      { label: 'Give a gift', authored: true, silent: true, value: 'give' },
      { label: 'Not now', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd3.villager-a.thanks', speaker: 'villager-a', text: 'That’s good of you.', authored: true },
  { id: 'd3.villager-b.thanks', speaker: 'villager-b', text: 'How lovely. Thank you.', authored: true },
  { id: 'd3.villager-a.rock', speaker: 'villager-a', text: 'Another rock. I’m building a wall.', authored: true },
  { id: 'd3.villager-b.rock', speaker: 'villager-b', text: 'Oh. Another rock.', authored: true },
  ...rideNodes('d3'),
];

// ---------------------------------------------------------------- the numbers
export const heartsCap = 6; // pregnant: six hearts this day (GAME-PLAN-DAYS §B Day 3 beat 1)
export const equipmentPrice = 30; // the farm equipment, at a 50 percent loss
export const rentAdvance = 20; // Alabaster pays the first season when she signs (2026-10-22)
export const rent = 5; // Alabaster's rent, each Rest after that
export const storeCost = 50; // with the sale and the advance, an empty purse builds at once
export const weekHearts = 3; // what a week behind the counter takes out of her
export const mixes = {
  books: { label: 'Books', note: 'loses 3 a week', gold: -3 },
  cards: { label: 'Books and greeting cards', note: 'breaks even', gold: 0 },
  games: { label: 'Books, cards, and games', note: 'makes 4 a week', gold: 4 },
};
export const storeNames = { plain: 'Friendship Books', etc: 'Friendship Books, Stationery, & Games' };

const squareArea = { x: 20, y: 12, w: 10, h: 5 };
const squareAvoid = [{ x: 24, y: 12, w: 2, h: 3 }];
const villagerStarts = { 'villager-a': { x: 21, y: 15 }, 'villager-b': { x: 28, y: 14 } };

// Emily rides on roads and in town; she gets down at home and indoors.
export const ridesOn = (state, mapId) => Boolean(state.flags.boughtHorse) && (mapId === 'friendship' || mapId === 'foglands-road');

// The store's front in town today: none until built, then plain or renamed.
export const storeFront = (flags) => (!flags.storeBuilt ? null : flags.tookAdvice ? 'friendship-books-etc' : 'friendship-books');

// The HUD's "Now:" line, from the state alone.
export function goalDay03(state) {
  const { flags, store, marks } = state;
  const where = state.map;
  if (flags.collapsed) return 'Good night.';
  if (!flags.storeBuilt) {
    if (where !== 'foglands') return 'The ledger is at home, by the porch steps.';
    if (flags.soldEquipment && flags.rentedLand && state.purse < storeCost) return `Rest on the porch steps: the rent comes in (${state.purse} of ${storeCost}).`;
    return 'Open the ledger by the porch steps.';
  }
  const atStore = where === 'store';
  if (!flags.interviewed) return atStore ? 'Your store.' : where === 'friendship' ? 'Friendship Books is on the square, north side. Go in.' : 'Ride to town: Friendship Books is on the square.';
  if (store.weeksOpen >= 3 && !flags.advised) {
    if (atStore) return 'Alabaster is here.';
    return where === 'friendship' ? 'Go into the store.' : 'Ride to town and open the store.';
  }
  if (!marks.worked) {
    if (atStore) return 'Stock the shelves for the week at the counter.';
    return where === 'friendship' ? 'Go into the store and stock it for the week.' : 'Ride to town and stock the store for the week.';
  }
  if (where === 'foglands') return 'Rest on the porch steps. The week goes by.';
  return 'Ride home to Upper Foglands and rest. The week goes by.';
}

export function createDay03(ctx) {
  const { state, world, dialogue, hud } = ctx;
  const { flags, store, marks } = state;
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  const ride = createFastRide(ctx, kit, 'd3');
  kit.goalOf = () => goalDay03(state);
  const farmMap = mapFor('foglands', 3);
  const townMap = mapFor('friendship', 3);
  const storeMap = mapFor('store', 3);
  state.heartsMax = heartsCap;
  state.hearts = Math.min(state.hearts, heartsCap);

  function showHearts() {
    hud.update(state);
  }

  // ---------------------------------------------------------------- beat 1
  async function wake() {
    showHearts();
    hud.show();
    if (marks.woke) return;
    marks.woke = true;
    if (!ctx.reducedMotion) await world.fade('in', 900);
    world.facePlayer('down');
    await talk('d3.porch.visitors');
    marks.talked = true;
    kit.hint('hearts6', 'Five months along: six hearts at most, this day.', 5200);
    const caller = world.npc('alabaster');
    const path = farmMap.marks.callerPath;
    if (caller) {
      await caller.walkPath([...path].reverse().concat([farmMap.spawns['from-road']]), 55);
      caller.destroy?.();
    }
    kit.hint('ledger', 'The ledger is by the porch steps: face it and press E.', 5200);
  }

  // ---------------------------------------------------------------- beat 2: the ledger
  async function ledger() {
    if (flags.storeBuilt) {
      hud.toast(`${store.name}: ${inWords(store.weeksOpen)} ${store.weeksOpen === 1 ? 'week' : 'weeks'} open. Purse ${state.purse}.`, 3000);
      return;
    }
    if (!marks.decided) {
      marks.decided = true;
      await talk('d3.ledger.decided');
    }
    for (;;) {
      const ready = flags.soldEquipment && flags.rentedLand;
      const pick = await choosePanel({
        title: 'The ledger',
        intro: `Myre Farm. Purse: ${state.purse}.`,
        rows: [
          { value: 'sell', label: 'Sell the farm equipment, at half its price', note: `+${equipmentPrice}`, icon: 'seeds', done: flags.soldEquipment },
          { value: 'rent', label: 'Rent the unused land to Alabaster', note: `+${rentAdvance} now, +${rent} a week`, icon: 'deed', done: flags.rentedLand },
          {
            value: 'build',
            label: 'Build a store in town',
            note: !ready ? 'sell and rent first' : state.purse < storeCost ? `${storeCost}; you have ${state.purse}` : `−${storeCost}`,
            icon: 'coin',
            disabled: !ready || state.purse < storeCost,
          },
        ],
        leave: 'Close',
      });
      if (pick === 'sell') {
        flags.soldEquipment = true;
        state.purse += equipmentPrice;
        hud.update(state);
        ctx.sound?.play('heart');
      } else if (pick === 'rent') {
        flags.rentedLand = true;
        state.purse += rentAdvance;
        hud.update(state);
        ctx.sound?.play('heart');
        await talk('d3.alabaster.advance');
        hud.toast('Alabaster will pay rent each week after this: each time you rest.', 2800);
      } else if (pick === 'build') {
        state.purse -= storeCost;
        flags.storeBuilt = true;
        store.built = true;
        store.name = storeNames.plain;
        hud.update(state);
        await talk('d3.ledger.built');
        kit.hint('store', 'Friendship Books stands on the open lot in town, on the square. Pixel knows the way: face her by the house and press E.', 5600);
        state.marks.hint['fast-ride'] = true; // said just now
        return;
      } else {
        if (flags.soldEquipment && flags.rentedLand && state.purse < storeCost) await talk('d3.ledger.short');
        return;
      }
    }
  }

  // ---------------------------------------------------------------- rest, and the weeks
  // One week behind the counter: its gold and its hearts. Marks the week as seen through.
  function settleWeek() {
    if (!marks.worked) return null;
    const mix = mixes[marks.mix] ?? mixes.books;
    store.weeksOpen += 1;
    store.gold += mix.gold;
    state.purse = Math.max(0, state.purse + mix.gold);
    marks.worked = false;
    return mix;
  }

  async function rest() {
    if ((await talk('d3.rest.ask')) !== 'rest') return;
    if (flags.advised && (state.hearts <= 2 || marks.worked || store.weeksOpen >= 5)) {
      await collapse();
      return;
    }
    await world.fade('out', 500);
    state.week += 1;
    state.hearts = state.heartsMax;
    state.clock = 6;
    world.setSky(state.clock);
    const notes = [];
    if (flags.rentedLand) {
      state.purse += rent;
      notes.push(`rent ${rent}`);
    }
    const week = settleWeek();
    if (week) {
      state.hearts = Math.max(0, state.hearts - weekHearts);
      notes.push(`the store ${week.gold > 0 ? `made ${week.gold}` : week.gold < 0 ? `lost ${-week.gold}` : 'broke even'}`);
    }
    showHearts();
    world.placePlayer('porch');
    state.map = 'foglands';
    state.spawn = 'porch';
    ctx.save?.();
    await world.fade('in', 500);
    hud.toast(`A week goes by${notes.length ? `: ${notes.join(', ')}` : ''}.${week ? ` The store took ${inWords(weekHearts)} hearts.` : ' Hearts restored.'}`, 3600);
    if (week && store.weeksOpen === 1) kit.hint('weeks', 'Each week: stock the store in town, then rest at home. The store wears on her.', 5200);
    if (week && store.weeksOpen === 2) await talk('d3.weeks.readers');
    if (week && store.weeksOpen === 3) await talk('d3.weeks.verge');
  }

  // ---------------------------------------------------------------- beat 3: the store
  async function enterStore() {
    await changeMap(ctx, 'store', 'door');
    if (!flags.interviewed) await interview();
    else if (store.weeksOpen >= 3 && !flags.advised) await advice();
  }

  async function interview() {
    world.placePlayer('counter');
    const editor = world.spawnNpc('editor', storeMap.marks.visitorIn, 'up');
    await editor.walkPath([storeMap.marks.visitorStand, { x: 7, y: 5 }], 50);
    editor.face('right');
    world.facePlayer('left');
    const before = state.skips;
    await talk('d3.interview.opening', { hour: true });
    flags.interviewed = true;
    flags.interviewSkips = state.skips - before;
    await editor.walkPath([storeMap.marks.visitorStand, storeMap.marks.visitorIn, storeMap.exits[0]], 60);
    editor.destroy?.();
    world.facePlayer('up');
    kit.hint('stock', 'Stock the store at the counter, then rest at home: that is a week.', 5200);
  }

  async function advice() {
    world.placePlayer('counter');
    const caller = world.npc('alabaster') ?? world.spawnNpc('alabaster', storeMap.marks.visitorIn, 'up');
    await caller.walkPath([storeMap.marks.visitorStand, { x: 7, y: 5 }], 50);
    caller.face('right');
    world.facePlayer('left');
    const choice = await talk('d3.advice.cards', { hour: true });
    flags.advised = true;
    state.companions.alabaster += 1;
    if (choice === 'take') {
      store.name = storeNames.etc;
      showShelves();
      await talk('d3.advice.renamed');
      kit.hint('mix', 'The counter now offers cards and games as well.', 4200);
    } else {
      await talk('d3.advice.books');
    }
    await caller.walkPath([storeMap.marks.visitorStand, storeMap.marks.visitorIn, storeMap.exits[0]], 55);
    caller.destroy?.();
    world.facePlayer('up');
  }

  async function stock() {
    if (marks.worked) {
      await talk('d3.stock.done');
      return;
    }
    const open = Boolean(flags.tookAdvice);
    const pick = await choosePanel({
      title: store.name,
      intro: `Stock the shelves for the week. Purse: ${state.purse}.`,
      rows: Object.entries(mixes).map(([value, mix]) => ({
        value,
        label: mix.label,
        note: value === 'books' || open ? mix.note : 'not stocked',
        icon: value === 'books' ? 'poem' : value === 'cards' ? 'poem-2' : 'go-board',
        disabled: value !== 'books' && !open,
      })),
      leave: 'Not yet',
      headless: open ? 'games' : 'books',
    });
    if (!pick) return;
    marks.worked = true;
    marks.mix = pick;
    store.stock.books += 1;
    if (pick === 'cards' || pick === 'games') {
      store.stock.cards += 1;
      flags.stockCards = true;
    }
    if (pick === 'games') {
      store.stock.games += 1;
      flags.stockGames = true;
    }
    hud.toast('Stocked for the week. Rest at home to see it through.', 3000);
    ctx.sound?.play('step');
  }

  function showShelves() {
    if (state.map !== 'store' || !flags.tookAdvice) return;
    const [, cards, games] = storeMap.marks.shelves ?? [null, { x: 4, y: 0 }, { x: 7, y: 0 }];
    placeBlock(world, 'shelf-cards', 'shelf-cards', cards);
    placeBlock(world, 'shelf-games', 'shelf-games', games);
  }

  function showStoreFront() {
    if (state.map !== 'friendship') return;
    const front = storeFront(flags);
    if (front) placeBlock(world, 'store-front', front, townMap.marks.lot);
    else removeBlock(world, 'store-front');
  }

  // ---------------------------------------------------------------- beat 5: the steps
  async function collapse() {
    settleWeek();
    if (flags.tookAdvice) await talk('d3.collapse.living');
    await world.fade('out', 900);
    world.placePlayer('porch');
    state.map = 'foglands';
    state.spawn = 'porch';
    state.clock = 19;
    world.setSky(state.clock);
    world.night?.();
    state.hearts = 0;
    showHearts();
    lieDown(true);
    await world.fade('in', 900);
    const from = farmMap.spawns['from-road'];
    const caller = world.spawnNpc('alabaster', from, 'left');
    const path = farmMap.marks.callerPath;
    await caller.walkPath(path, 60);
    caller.face('up');
    await talk('d3.collapse.found', { hour: true });
    flags.collapsed = true;
    flags.heardOfDaedalus = true;
    state.companions.alabaster += 1;
    hud.setGoal('Good night.');
    caller.walkPath([...path].reverse().concat([from]), 55);
    await world.dusk(2000);
    await world.fade('out', 1000);
    ctx.ended = true;
    hud.hide();
    // the cap of six is this day's; tomorrow starts from ten again
    state.heartsMax = 10;
    hud.update(state);
    await ctx.endDay();
  }

  // Emily passed out on the steps: her sprite on its side until Alabaster rouses her.
  function lieDown(down) {
    const sprite = world.player?.sprite;
    if (!sprite?.setAngle) return;
    sprite.setAngle(down ? -90 : 0);
  }

  // ---------------------------------------------------------------- neighbours
  async function villager(key) {
    const npc = world.npc(key);
    npc?.stopWander();
    npc?.face({ up: 'down', down: 'up', left: 'right', right: 'left' }[world.player?.face] ?? 'down');
    await talk(`d3.${key}.hello`);
    const giftable = state.inventory.some((entry) => itemDefs[entry.id].gift);
    if (giftable && !marks[`gave-${key}-${state.week}`] && (await talk('d3.gift.offer')) === 'give') {
      const id = await ctx.inventory.pick({ filter: (item) => Boolean(itemDefs[item].gift) });
      if (id && removeItem(state, id)) {
        marks[`gave-${key}-${state.week}`] = true;
        state.giftsGiven += 1;
        if (id === 'rock') flags.rocksGiven = (flags.rocksGiven ?? 0) + 1;
        await talk(`d3.${key}.${id === 'rock' ? 'rock' : 'thanks'}`);
      }
    }
    if (!npc?.gone) npc?.wander(squareArea, { seed: key === 'villager-a' ? 5 : 9, avoid: squareAvoid });
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
  function roadToll() {
    const riding = ridesOn(state, 'foglands-road');
    kit.loseHearts(riding ? 1 : 2);
    kit.hint('road', riding ? 'The road costs a heart each way on horseback.' : 'The road costs two hearts each way on foot.');
  }

  const objectHandlers = {
    porch: rest,
    ledger,
    'store-door': () => (flags.storeBuilt ? enterStore() : undefined),
    stock,
    shelves: () => talk(flags.tookAdvice ? 'd3.shelves.etc' : 'd3.shelves.books'),
    'mercantile-door': mercantile,
    hutch: () => talk('d3.board.look'),
    'mirror-door': () => talk('d3.mirror.locked'),
    'stable-pen': () => talk('d3.pen.empty'),
  };
  const npcHandlers = {
    'villager-a': () => villager('villager-a'),
    'villager-b': () => villager('villager-b'),
  };
  const handlerFor = (target) => {
    if (target.npc === 'pixel') return ride.handler();
    if (target.npc) return npcHandlers[target.npc] ?? null;
    if (target.id === 'store-door' && !flags.storeBuilt) return null;
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
        if (!marks.talked) {
          const tile = farmMap.marks.callerPath.at(-1);
          world.spawnNpc('alabaster', tile, 'up');
        }
      } else if (mapId === 'friendship') {
        showStoreFront();
        for (const [key, tile] of Object.entries(villagerStarts)) {
          world.spawnNpc(key, tile, 'down').wander(squareArea, { seed: key === 'villager-a' ? 5 : 9, avoid: squareAvoid });
        }
      } else if (mapId === 'store') {
        showShelves();
        if (flags.interviewed && store.weeksOpen >= 3 && !flags.advised) world.spawnNpc('alabaster', storeMap.marks.visitorIn, 'up');
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
      if (name === 'roused') {
        lieDown(false);
        world.facePlayer('down');
      } else if (name === 'can') {
        kit.give('pioneerade', 1, 'PioneerAde');
      } else if (name === 'drink') {
        if (removeItem(state, 'pioneerade')) kit.gainHearts(itemDefs.pioneerade.eat);
      }
    },
  };

  // ---------------------------------------------------------------- headless walk-through
  // The canon route for check-days.mjs, one step per call: the ledger (sell, rent, build), the
  // interview, three weeks of books, Alabaster's advice at the store, a week of games, home,
  // and the collapse on the steps. The first week goes by the road, the rest by Pixel.
  const go = (to, spawn) => () => api.onExit({ to, spawn });
  const toTown = [go('foglands-road', 'from-east'), () => api.onTrigger({ id: 'halfway' }), go('friendship', 'from-east')];
  const toFarm = [go('foglands-road', 'from-west'), () => api.onTrigger({ id: 'halfway' }), go('foglands', 'from-road')];
  const week = (road) => [
    ...(road ? toTown : [() => api.onInteract({ npc: 'pixel' })]),
    () => api.onInteract({ id: 'store-door' }),
    () => api.onInteract({ id: 'stock' }),
    go('friendship', 'from-store'),
    ...(road ? toFarm : [() => api.onInteract({ npc: 'pixel' })]),
    () => api.onInteract({ id: 'porch' }),
  ];
  const route = [
    () => api.start(),
    () => api.onInteract({ id: 'ledger' }),
    ...week(true), ...week(false), ...week(false), ...week(false), // the road once, then Pixel's quick ride
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
// BOOKSTORE TO SELL CARDS AND GAMES. Every sentence authored, in the Editor's voice.
export function writeDay03(state) {
  const { flags, store } = state;
  const body = [];
  if (flags.storeBuilt) {
    const means = [flags.soldEquipment && 'sold her farm equipment at half its worth', flags.rentedLand && 'let her fields to the vintner Alabaster Brown'].filter(Boolean);
    body.push(`Miss Emily B. Marks of Myre Farm has opened a bookstore on the square, the first Friendship has had. To pay for it she ${means.join(' and ')}.`);
  } else {
    body.push('Miss Emily B. Marks of Myre Farm has spoken of opening a bookstore. The lot on the square remains a lot.');
  }
  const skips = flags.interviewSkips ?? 0;
  if (!flags.interviewed) body.push('She has not yet granted this paper an interview.');
  else if (skips === 0) body.push('Asked by this paper why, she said that virtual worlds can help people solve problems in the real one. This paper asked what virtual means and was told: nearly appearing so. Like ourselves.');
  else if (skips < 3) body.push('This paper interviewed the proprietor on opening day. She heard some of our questions out.');
  else body.push('This paper attempted an interview on opening day. The proprietor answered before the questions were finished, when she answered at all.');
  const weeks = store.weeksOpen ?? 0;
  if (weeks > 0) body.push(`In ${inWords(weeks)} ${weeks === 1 ? 'week' : 'weeks'} of trading the store has ${store.gold > 0 ? `cleared ${inWords(store.gold)} gold` : store.gold < 0 ? `lost ${inWords(-store.gold)} gold` : 'neither made nor lost a coin'}. Friendship, it turns out, is not a town of readers.`);
  if (flags.tookAdvice && flags.stockGames) body.push('On the advice of Alabaster Brown it now sells greeting cards and board games besides, and has changed its name to Friendship Books, Stationery, & Games. Amusements sell.');
  else if (flags.tookAdvice) body.push('On the advice of Alabaster Brown it now sells greeting cards besides, and has changed its name to Friendship Books, Stationery, & Games. The games are on order.');
  else if (flags.keptToBooks) body.push('Advised by Alabaster Brown to sell cards and games, the proprietor declined. It remains a bookstore.');
  if (flags.collapsed) body.push('Our vintner reports finding Miss Marks on her own front steps one evening with not a heart to her name. Revived with PioneerAde, she is said to be in want of an optometrist.');
  else body.push('The proprietor keeps long hours and is seldom seen at her farm.');
  body.push(flags.storeBuilt ? 'Walden is in stock, should anyone want it.' : 'This paper will report further, should there be anything to report.');
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Autumn · Year 1',
    headline: 'BOOKSTORE TO SELL CARDS AND GAMES',
    body,
  };
}

// ---------------------------------------------------------------- state
export const flags = {
  soldEquipment: false,
  rentedLand: false,
  storeBuilt: false,
  interviewed: false,
  interviewSkips: 0,
  advised: false,
  tookAdvice: false,
  keptToBooks: false,
  stockCards: false,
  stockGames: false,
  collapsed: false,
  heardOfDaedalus: false,
};

export const speakers = {
  alabaster: { name: 'Alabaster Brown', portrait: 'alabaster-neutral' },
  'villager-a': { name: 'A farmer' },
  'villager-b': { name: 'A townswoman' },
};

// The book's Day 3: the equipment sold and the land let, the store built and interviewed for,
// three weeks of books, Alabaster's advice taken (cards and games, the new name), a fourth
// week, and the collapse on the steps that sends her to Dr. Daedalus.
export function canonDay03(state) {
  Object.assign(state.flags, {
    soldEquipment: true, rentedLand: true, storeBuilt: true, interviewed: true, advised: true, tookAdvice: true,
    stockCards: true, stockGames: true, collapsed: true, heardOfDaedalus: true,
  });
  Object.assign(state.store, {
    built: true, name: storeNames.etc, weeksOpen: 4, gold: 3 * mixes.books.gold + mixes.games.gold,
    stock: { books: 4, cards: 1, games: 1 },
  });
  state.purse += equipmentPrice + rentAdvance - storeCost + 4 * rent + state.store.gold;
  state.companions.alabaster += 2;
  state.heartsMax = 10;
  return state;
}

// Day 3's preset, self-sufficient (PARALLEL-RULES §4): Day 2's outcome is written out here too,
// so the day opens the same however much of the earlier days is registered.
export function presetDay03() {
  const state = presetDay(3);
  Object.assign(state.flags, { boughtHorse: true, horseName: state.flags.horseName || 'Pixel', metAlabaster: true, leftPoem: true });
  if (countItem(state, 'rock') < 3) addItem(state, 'rock', 3 - countItem(state, 'rock'));
  state.heartsMax = 10;
  state.hearts = 10;
  return state;
}

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 3,
  title: 'Friendship Books',
  headline: 'BOOKSTORE TO SELL CARDS AND GAMES',
  season: 'autumn',
  seasonName: 'Autumn',
  goal: 'There must be more than farming.',
  start: { map: 'foglands', spawn: 'porch' },
  flags,
  speakers,
  canon: canonDay03,
  nodes,
  skipPoints,
  create: createDay03,
  write: writeDay03,
  preset: presetDay03,
};
