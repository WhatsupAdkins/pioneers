// Day 2, LOCAL WOMAN SHARES GIFT OF ROCKS (GAME-PLAN-DAYS §B Day 2), summer. Everything of
// this day in one file: its record for the registry (`day`, at the end), flags, speakers, the
// book's outcome (canonDay02), nodes, beats, the paper (writeDay02) and presetDay02.
//
// Myre Farm: till, sow, water and Rest; the first six crops come up rocks and later ones are
// carrots a third of the time (fixed sequence, cropFor below). Neighbours in town give
// turnips and cheese and expect something back. The first carrot goes on a white plate on
// the porch, or is eaten; kept, it becomes a poem. A poem or a rock is left at Alabaster
// Brown's vineyard, and after the next Rest Alabaster calls. Then the paper.
//
// Node ids: d2.<speaker>.<topic>. Lines quoted from the book are `src` (L2.xx in lines.js);
// everything else is `authored` and only connects. Choices that work like menus ("Rest",
// "Give a gift") are `silent`: picked, not spoken.
import { changeMap, screensFromTown } from '../transitions.js';
import { createDayKit } from './common.js';
import { addItem, countItem, hasItem, itemDefs, removeItem } from '../inventory.js';
import { inWords } from '../newspaper.js';
import { mapFor } from '../../maps/versions.js';
import { presetDay } from './preset.js';
import { createHitchRide, hitchNodes, hitchRoutes } from './fast-ride.js';

export const skipPoints = []; // the book gives Day 2 no Skip
export const poemLines = ['L2.08', 'L2.09', 'L2.10', 'L2.11']; // typed line by line, not as nodes

export const nodes = [
  // beat 1: the farm in the morning
  { id: 'd2.wake.solitude', src: 'L2.01', next: 'd2.wake.survival' },
  { id: 'd2.wake.survival', src: 'L2.02' },

  // the porch steps
  {
    id: 'd2.rest.ask',
    kind: 'narration',
    text: 'The porch steps. Rest here until morning?',
    authored: true,
    choices: [
      { label: 'Rest until morning', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },

  // beat 3: neighbours in town
  { id: 'd2.villager-a.hello', speaker: 'villager-a', text: 'You’re the one up in the Foglands. Here—a turnip, for your table.', authored: true },
  { id: 'd2.villager-b.hello', speaker: 'villager-b', text: 'Welcome to Friendship, Miss. A block of cheese, from my own cellar.', authored: true },
  { id: 'd2.villager-a.again', speaker: 'villager-a', text: 'Fine day for it, Miss.', authored: true },
  { id: 'd2.villager-b.again', speaker: 'villager-b', text: 'Good day, Miss Marks.', authored: true },
  { id: 'd2.gifting.custom', src: 'L2.03' },
  {
    id: 'd2.gift.offer',
    kind: 'narration',
    text: 'Return the kindness?',
    authored: true,
    choices: [
      { label: 'Give a gift', authored: true, silent: true, value: 'give' },
      { label: 'Not now', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd2.villager-a.rock', speaker: 'villager-a', text: 'A rock. Well. I have a few of those already.', authored: true },
  { id: 'd2.villager-b.rock', speaker: 'villager-b', text: 'Oh. A rock. How… thoughtful.', authored: true },
  { id: 'd2.villager-a.thanks', speaker: 'villager-a', text: 'That’s good of you.', authored: true },
  { id: 'd2.villager-b.thanks', speaker: 'villager-b', text: 'How lovely. Thank you.', authored: true },
  { id: 'd2.gifting.rocks', src: 'L2.04' },

  // town, otherwise
  { id: 'd2.board.look', kind: 'narration', text: 'The town board, with the season’s notices.', authored: true, next: 'd2.board.notices' },
  { id: 'd2.board.notices', kind: 'narration', text: 'MERCANTILE OPEN · SEEDS FIVE APIECE   ·   NEIGHBORS: A GIFT GIVEN IS A GIFT OWED', authored: true },
  { id: 'd2.mirror.locked', kind: 'narration', text: 'The door is locked. A card in the window says GONE TO PRESS.', authored: true },

  // Pixel at the farm hitch or the vineyard gate: face her and press E to ride
  ...hitchNodes('d2', ['to-town', 'home']),

  // beat 4: the carrot
  { id: 'd2.carrot.cried', src: 'L2.05' },
  { id: 'd2.carrot.steps', src: 'L2.06', next: 'd2.carrot.choice' },
  {
    id: 'd2.carrot.choice',
    kind: 'narration',
    text: 'The carrot, on its white plate.',
    authored: true,
    choices: [
      { label: 'Keep it on the plate', authored: true, silent: true, value: 'keep' },
      { label: 'Eat the carrot', authored: true, silent: true, value: 'eat', set: { carrotEaten: true } },
    ],
  },
  { id: 'd2.carrot.dear', src: 'L2.07' },
  { id: 'd2.carrot.pilgrimage', src: 'L2.12' },
  { id: 'd2.carrot.eaten', kind: 'narration', text: 'It was good. It was only a carrot.', authored: true },

  // beat 5: the vineyard
  {
    id: 'd2.cabin.both',
    kind: 'narration',
    text: 'No one answers. A slab of stone serves for a doorstep.',
    authored: true,
    choices: [
      { label: 'Leave the poem under a rock', authored: true, silent: true, value: 'poem', set: { leftPoem: true } },
      { label: 'Leave a rock', authored: true, silent: true, value: 'rock', set: { leftRock: true } },
      { label: 'Not now', authored: true, silent: true, value: 'no' },
    ],
  },
  {
    id: 'd2.cabin.rock',
    kind: 'narration',
    text: 'No one answers. A slab of stone serves for a doorstep.',
    authored: true,
    choices: [
      { label: 'Leave a rock', authored: true, silent: true, value: 'rock', set: { leftRock: true } },
      { label: 'Not now', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd2.cabin.poem-only', kind: 'narration', text: 'No one answers. The poem would blow away on the slab; it needs a rock to hold it down.', authored: true },
  { id: 'd2.cabin.empty', kind: 'narration', text: 'No one answers. A slab of stone serves for a doorstep.', authored: true },
  { id: 'd2.cabin.left', kind: 'narration', text: 'The gift is still on the slab.', authored: true },
  { id: 'd2.gift.poem', src: 'L2.13' },
  { id: 'd2.gift.rock', kind: 'narration', text: 'No one was home. She left a rock on the slab, with the customary note.', authored: true },

  // beat 6: Alabaster calls
  { id: 'd2.alabaster.calls', src: 'L2.14' },
  { id: 'd2.alabaster.rock', speaker: 'alabaster', src: 'L2.15', next: 'd2.alabaster.collection' },
  { id: 'd2.alabaster.collection', speaker: 'alabaster', src: 'L2.16', next: 'd2.alabaster.warn' },
  { id: 'd2.alabaster.warn', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L2.17', next: 'd2.emily.friends' },
  { id: 'd2.emily.friends', speaker: 'emily', src: 'L2.18', next: 'd2.alabaster.pairs' },
  { id: 'd2.alabaster.pairs', speaker: 'alabaster', src: 'L2.19', next: 'd2.alabaster.property' },
  { id: 'd2.alabaster.property', speaker: 'alabaster', src: 'L2.20', next: 'd2.alabaster.pockets' },
  { id: 'd2.alabaster.pockets', src: 'L2.21', cue: 'pockets', next: 'd2.alabaster.wine' },
  { id: 'd2.alabaster.wine', speaker: 'alabaster', src: 'L2.22', next: 'd2.emily.pregnant' },
  { id: 'd2.emily.pregnant', speaker: 'emily', src: 'L2.23', next: 'd2.alabaster.decant' },
  { id: 'd2.alabaster.decant', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L2.24', next: 'd2.emily.meant' },
  { id: 'd2.emily.meant', speaker: 'emily', portrait: 'emily-firm', src: 'L2.25', next: 'd2.alabaster.hearts' },
  { id: 'd2.alabaster.hearts', speaker: 'alabaster', src: 'L2.26', next: 'd2.emily.bother' },
  { id: 'd2.emily.bother', speaker: 'emily', portrait: 'emily-firm', src: 'L2.27', next: 'd2.alabaster.prickly' },
  { id: 'd2.alabaster.prickly', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L2.28', next: 'd2.alabaster.infinite' },
  { id: 'd2.alabaster.infinite', speaker: 'alabaster', src: 'L2.29' },
  // only when the poem was left under the rock
  { id: 'd2.parting.poem', src: 'L2.30', next: 'd2.emily.poem' },
  { id: 'd2.emily.poem', speaker: 'emily', portrait: 'emily-soft', src: 'L2.31', next: 'd2.alabaster.poem' },
  { id: 'd2.alabaster.poem', speaker: 'alabaster', src: 'L2.32', next: 'd2.alabaster.laughed' },
  { id: 'd2.alabaster.laughed', src: 'L2.33', next: 'd2.alabaster.advert' },
  { id: 'd2.alabaster.advert', speaker: 'alabaster', portrait: 'alabaster-dry', src: 'L2.34', next: 'd2.alabaster.obtuse' },
  { id: 'd2.alabaster.obtuse', speaker: 'alabaster', src: 'L2.35' },
  // a rock alone
  { id: 'd2.parting.rock', kind: 'narration', text: 'They parted for the evening, and Alabaster took the rock home.', authored: true },
];

// ---------------------------------------------------------------- the farm, as data
export const plotTiles = {
  bare: 'plot-bare',
  tilled: 'plot-tilled',
  sown: 'plot-sown',
  watered: 'plot-watered',
};
export const plotTile = (plot) => (plot.stage === 'ready' ? `plot-ready-${plot.crop === 'carrot' ? 'carrot' : 'rock'}` : plotTiles[plot.stage]);

// What the nth crop to come up turns out to be: rocks for the first six, then a carrot about
// one time in three, always in the same order (the 7th and 8th crops are carrots).
export function cropFor(n) {
  if (n < 6) return 'rock';
  return (Math.imul(n, 2654435761) >>> 0) % 3 === 0 ? 'carrot' : 'rock';
}

export const waterPerDraw = 4;
const villagerGifts = { 'villager-a': 'turnip', 'villager-b': 'cheese' };
const squareArea = { x: 20, y: 12, w: 10, h: 5 }; // the cobbled square, where neighbors amble
const squareAvoid = [{ x: 24, y: 12, w: 2, h: 3 }]; // the Hutch (its roof row can be walked behind)
const villagerStarts = { 'villager-a': { x: 21, y: 15 }, 'villager-b': { x: 28, y: 13 } };
const penFront = { x: 44, y: 12 };

export function farmPlotsFor(map) {
  return map.objects.filter((object) => object.type === 'plot').map(({ x, y }) => ({ x, y, stage: 'bare', crop: null }));
}

// Emily rides on roads and in town; she gets down on her own farm and at the vineyard.
export const ridesOn = (state, mapId) => Boolean(state.flags.boughtHorse) && (mapId === 'friendship' || mapId === 'foglands-road');

// The HUD's "Now:" line (GAME-PLAN-DAYS §A.3), from the state alone.
export function goalDay02(state) {
  const { flags, farm } = state;
  const count = (stage) => farm.plots.filter((plot) => plot.stage === stage).length;
  const growing = count('sown') + count('watered') + count('ready');
  if (flags.metAlabaster) return 'Good night.';
  if (flags.leftPoem || flags.leftRock) return state.map === 'foglands' ? 'Rest on the porch steps. Someone may call.' : 'Go home to Upper Foglands and rest.';
  if (farm.carrotGrown || (hasItem(state, 'rock') && farm.harvests >= 6)) {
    const poem = hasItem(state, 'poem');
    const rock = hasItem(state, 'rock');
    if (state.map === 'vineyard') return rock ? 'Leave a gift at the cabin door.' : 'Bring a rock to weigh the gift down.';
    if (poem && !rock) return 'Harvest a rock to weigh the poem down.';
    if (poem) return 'Take the poem to your nearest neighbor: the vineyard track, south off the Foglands road.';
    if (rock && farm.carrotGrown) return 'Take a rock to your nearest neighbor: the vineyard track, south off the Foglands road.';
  }
  if (state.map === 'friendship') {
    if (!hasItem(state, 'seeds') && !growing) return state.purse >= 5 ? 'Buy seeds at the Mercantile, west along the street.' : 'Sell a turnip or some cheese at the Mercantile, then buy seeds.';
    return 'Ride home to Upper Foglands, east out of town.';
  }
  if (state.map === 'foglands-road') return hasItem(state, 'seeds') || growing ? 'Upper Foglands is east.' : 'Friendship is west; seeds are sold there.';
  if (state.map === 'vineyard') return 'No one is home. The farm is back up the track and east.';
  if (count('ready')) return 'Harvest the ready plots.';
  if (count('watered') && !count('sown')) return 'Rest on the porch steps; watered plots come up overnight.';
  if (count('sown')) return hasItem(state, 'water') ? 'Water the sown plots.' : 'Draw water at the well, then water the sown plots.';
  if (hasItem(state, 'seeds')) return count('tilled') ? 'Sow seeds in the tilled plots.' : 'Till a plot: face the bare earth and press E.';
  if (count('watered')) return 'Rest on the porch steps; watered plots come up overnight.';
  return state.purse >= 5 ? 'Ride to town for seeds: the Mercantile, at the west end of the street.' : 'Sell something at the Mercantile in town, then buy seeds.';
}

export function createDay02(ctx) {
  const { state, world, dialogue, hud } = ctx;
  const { flags, farm, marks } = state;
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  kit.goalOf = () => goalDay02(state);
  const farmMap = mapFor('foglands', 2);
  const vineyardMap = mapFor('vineyard', 2);
  if (!farm.plots.length) farm.plots = farmPlotsFor(farmMap);
  const plotAt = (tile) => farm.plots.find((plot) => plot.x === tile.x && plot.y === tile.y);

  function showPlot(plot) {
    if (state.map === 'foglands') world.setGroundTile(plot.x, plot.y, plotTile(plot));
  }

  // ---------------------------------------------------------------- beat 1
  async function wake() {
    hud.update(state);
    hud.show();
    if (!marks.woke) {
      marks.woke = true;
      if (!ctx.reducedMotion) await world.fade('in', 900);
      await talk('d2.wake.solitude');
      kit.hint('plots', 'Plots: face the bare earth and press E to till, then sow, water, and harvest. Work costs hearts.', 6000);
      setTimeout(() => !ctx.ended && kit.hint('rest', 'Rest on the porch steps to recover hearts and let crops grow.', 5200), 6400);
    }
  }

  // ---------------------------------------------------------------- beat 2: the farm
  function tired() {
    hud.toast('Too tired. Rest on the porch steps.', 2500);
  }

  async function workPlot(plot) {
    if (plot.stage === 'bare') {
      if (state.hearts < 1) return tired();
      plot.stage = 'tilled';
      kit.loseHearts(1);
      ctx.sound?.play('step');
    } else if (plot.stage === 'tilled') {
      if (!removeItem(state, 'seeds')) {
        hud.toast('You have no seeds. The Mercantile in town sells them.', 2800);
        return undefined;
      }
      plot.stage = 'sown';
      kit.hint('water', 'Sown. Draw water at the well and water it.');
    } else if (plot.stage === 'sown') {
      if (!hasItem(state, 'water')) {
        hud.toast('Nothing to water it with. Draw water at the well.', 2800);
        return undefined;
      }
      if (state.hearts < 1) return tired();
      removeItem(state, 'water');
      plot.stage = 'watered';
      kit.loseHearts(1);
    } else if (plot.stage === 'watered') {
      hud.toast('Watered. Rest, and it will come up.', 2200);
      return undefined;
    } else if (plot.stage === 'ready') {
      return harvest(plot);
    }
    showPlot(plot);
    return undefined;
  }

  async function harvest(plot) {
    const crop = plot.crop === 'carrot' ? 'carrot' : 'rock';
    const first = crop === 'carrot' && !farm.carrotGrown;
    if (!first && !kit.give(crop)) return;
    plot.stage = 'tilled';
    plot.crop = null;
    farm.harvests += 1;
    if (crop === 'rock') farm.rocks += 1;
    showPlot(plot);
    if (first) await carrot();
    else if (crop === 'rock') kit.hint('rocks', 'A rock. The farm grows these best. They make a gift, of a kind.');
  }

  async function well() {
    const have = countItem(state, 'water');
    if (have >= waterPerDraw) {
      hud.toast('The can is full.');
      return;
    }
    kit.give('water', waterPerDraw - have, 'Well water');
    kit.hint('well', 'Each measure of well water waters one sown plot.');
  }

  async function rest() {
    const choice = await talk('d2.rest.ask');
    if (choice !== 'rest') return;
    const visiting = (flags.leftPoem || flags.leftRock) && !flags.metAlabaster;
    await world.fade('out', 500);
    state.week += 1;
    state.hearts = state.heartsMax;
    state.clock = 6;
    world.setSky(state.clock);
    let grew = 0;
    for (const plot of farm.plots) {
      if (plot.stage !== 'watered') continue;
      plot.crop = cropFor(farm.grown);
      farm.grown += 1;
      plot.stage = 'ready';
      showPlot(plot);
      grew += 1;
    }
    hud.update(state);
    world.placePlayer('porch');
    state.map = 'foglands';
    state.spawn = 'porch';
    ctx.save?.();
    await world.fade('in', 500);
    if (visiting) {
      await alabaster();
      return;
    }
    hud.toast(grew ? `You rest. Hearts restored, and ${inWords(grew)} ${grew === 1 ? 'plot has' : 'plots have'} come up.` : 'You rest. Hearts restored.', 3200);
  }

  // ---------------------------------------------------------------- beat 3: neighbours
  async function villager(key) {
    const npc = world.npc(key);
    npc?.stopWander();
    npc?.face({ up: 'down', down: 'up', left: 'right', right: 'left' }[world.player?.face] ?? 'down');
    const met = `gave-${key}-${state.week}`;
    if (!marks[met]) {
      marks[met] = true;
      await talk(`d2.${key}.hello`);
      kit.give(villagerGifts[key]);
      if (!marks.sawGifting) {
        marks.sawGifting = true;
        await talk('d2.gifting.custom');
      }
    } else {
      await talk(`d2.${key}.again`);
    }
    const giftable = state.inventory.some((entry) => itemDefs[entry.id].gift);
    if (giftable && (await talk('d2.gift.offer')) === 'give') {
      const id = await ctx.inventory.pick({ filter: (item) => Boolean(itemDefs[item].gift) });
      if (id && removeItem(state, id)) {
        state.giftsGiven += 1;
        if (id === 'rock') {
          flags.rocksGiven += 1;
          await talk(`d2.${key}.rock`);
          if (flags.rocksGiven === 1) await talk('d2.gifting.rocks');
        } else {
          await talk(`d2.${key}.thanks`);
        }
      }
    }
    if (!npc?.gone) npc?.wander(squareArea, { seed: key === 'villager-a' ? 3 : 7, avoid: squareAvoid });
  }

  async function mercantile() {
    const result = await ctx.shop.open({
      title: 'The Mercantile',
      greeting: 'Open again. Seeds are five apiece, and we take turnips and cheese.',
      items: [
        { id: 'seeds', price: 5, mode: 'buy' },
        { id: 'turnip', price: 2, mode: 'sell' },
        { id: 'cheese', price: 2, mode: 'sell' },
      ],
    });
    hud.update(state);
    if (result?.bought?.seeds) {
      flags.boughtSeeds = true;
      kit.hint('seeds', 'Seeds: one packet sows one tilled plot.');
    }
  }

  async function stables() {
    if (flags.boughtHorse) {
      await talk('d1.pen.empty');
      return;
    }
    const result = await ctx.shop.horse(state);
    if (!result.bought) return;
    state.purse -= 60;
    flags.boughtHorse = true;
    flags.horseName = result.name;
    hud.update(state);
    world.showPixel(null);
    world.setRiding(true);
    await talk('d1.horse.named');
  }

  // ---------------------------------------------------------------- beat 4: the carrot
  async function carrot() {
    farm.carrotGrown = true;
    await talk('d2.carrot.cried');
    await world.fade('out', 600);
    world.placePlayer('porch');
    world.placeProp('plate', farmMap.marks.plate, 'white-plate');
    state.clock = 21;
    world.night();
    const stop = world.fireflies(farmMap.marks.callerPath.at(-1));
    await world.fade('in', 900);
    const choice = await talk('d2.carrot.steps');
    if (choice === 'eat') {
      farm.carrotEaten = true;
      flags.carrotEaten = true;
      world.removeProp('plate');
      kit.gainHearts(5);
      await talk('d2.carrot.eaten');
    } else {
      await talk('d2.carrot.dear');
      await dialogue.poem(poemLines);
      kit.give('poem', 1, 'A poem');
      await talk('d2.carrot.pilgrimage');
    }
    await world.fade('out', 700);
    stop?.();
    state.clock = 7;
    world.setSky(state.clock);
    await world.fade('in', 700);
    kit.hint('vineyard', 'Your nearest neighbor: the vineyard track forks south off the Foglands road, past the conifers.', 6000);
  }

  // ---------------------------------------------------------------- beat 5: the vineyard
  async function cabin() {
    if (flags.leftPoem || flags.leftRock) {
      await talk('d2.cabin.left');
      return;
    }
    const poem = hasItem(state, 'poem');
    const rock = hasItem(state, 'rock');
    if (!rock) {
      await talk(poem ? 'd2.cabin.poem-only' : 'd2.cabin.empty');
      return;
    }
    const choice = await talk(poem ? 'd2.cabin.both' : 'd2.cabin.rock');
    if (choice === 'poem') {
      removeItem(state, 'poem');
      removeItem(state, 'rock');
      await talk('d2.gift.poem');
    } else if (choice === 'rock') {
      removeItem(state, 'rock');
      await talk('d2.gift.rock');
    } else {
      return;
    }
    state.giftsGiven += 1;
    world.placeProp('gift', vineyardMap.marks.gift, 'rock-small');
  }

  // ---------------------------------------------------------------- beat 6: Alabaster calls
  async function alabaster() {
    await talk('d2.alabaster.calls');
    const from = farmMap.spawns['from-road'];
    const caller = world.spawnNpc('alabaster', from, 'left');
    const path = farmMap.marks.callerPath;
    await caller.walkPath(path, 55);
    caller.face('up');
    world.facePlayer('down');
    await talk('d2.alabaster.rock', { hour: true });
    await talk(flags.leftPoem ? 'd2.parting.poem' : 'd2.parting.rock');
    flags.metAlabaster = true;
    state.companions.alabaster += 1;
    hud.setGoal('Good night.');
    caller.walkPath([...path].reverse().concat([from]), 55);
    await world.dusk(2000);
    await world.fade('out', 1000);
    ctx.ended = true;
    hud.hide();
    await ctx.endDay();
  }

  // ---------------------------------------------------------------- moving about
  async function leave(exit) {
    await changeMap(ctx, exit.to, exit.spawn);
  }

  // Pixel at the farm hitch and the vineyard gate: E rides to town or home (fast-ride.js).
  const hitch = createHitchRide(ctx, kit, 'd2', { foglands: hitchRoutes.toTown(), vineyard: hitchRoutes.home() });

  function roadToll() {
    const riding = ridesOn(state, 'foglands-road');
    kit.loseHearts(riding ? 1 : 2);
    kit.hint('road', riding ? 'The road costs a heart each way on horseback.' : 'The road costs two hearts each way on foot.');
  }

  // ---------------------------------------------------------------- E targets
  const objectHandlers = {
    porch: rest,
    well,
    'mercantile-door': mercantile,
    hutch: () => talk('d2.board.look'),
    'mirror-door': () => talk('d2.mirror.locked'),
    'stable-pen': stables,
    'cabin-door': cabin,
    slab: cabin,
  };
  const npcHandlers = {
    'villager-a': () => villager('villager-a'),
    'villager-b': () => villager('villager-b'),
    pixel: () => (state.map === 'friendship' && !flags.boughtHorse ? stables() : undefined),
  };
  const handlerFor = (target) => {
    if (target.npc === 'pixel') {
      if (state.map === 'friendship') return flags.boughtHorse ? null : npcHandlers.pixel;
      return hitch.handler();
    }
    if (target.npc) return npcHandlers[target.npc];
    if (target.type === 'plot') return () => workPlot(plotAt(target));
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
        farm.plots.forEach(showPlot);
        if (flags.boughtHorse) world.showPixel(farmMap.marks.hitch, 'west');
        hitch.hint();
        if (farm.carrotGrown && !farm.carrotEaten) world.placeProp('plate', farmMap.marks.plate, 'white-plate');
      } else if (mapId === 'friendship') {
        for (const [key, tile] of Object.entries(villagerStarts)) {
          world.spawnNpc(key, tile, 'down').wander(squareArea, { seed: key === 'villager-a' ? 3 : 7, avoid: squareAvoid });
        }
        if (!flags.boughtHorse) world.showPixel(penFront);
      } else if (mapId === 'vineyard') {
        if (flags.boughtHorse) world.showPixel(vineyardMap.marks.hitch, 'west');
        if (flags.leftPoem || flags.leftRock) world.placeProp('gift', vineyardMap.marks.gift, 'rock-small');
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
      return handler ? beat(handler) : undefined;
    },

    cue(name) {
      if (name === 'pockets') world.npc('alabaster')?.pose('pockets');
    },
  };

  // ---------------------------------------------------------------- headless walk-through
  // The canon route for check-days.mjs, one step per call: seeds in town, four plots twice,
  // the carrot kept and the poem written, three rocks for the neighbours, the poem left at
  // the vineyard, Rest, Alabaster, the paper.
  const plot = (i) => ({ type: 'plot', ...farm.plots[i] });
  const fourPlots = (times) => Array.from({ length: times }, () => [0, 1, 2, 3].map((i) => () => api.onInteract(plot(i)))).flat();
  const go = (to, spawn) => () => api.onExit({ to, spawn });
  const route = [
    () => api.start(),
    go('foglands-road', 'from-east'), () => api.onTrigger({ id: 'halfway' }), go('friendship', 'from-east'),
    () => api.onInteract({ id: 'mercantile-door' }),
    () => api.onInteract({ npc: 'villager-a' }),
    () => api.onInteract({ npc: 'villager-b' }),
    go('foglands-road', 'from-west'), () => api.onTrigger({ id: 'halfway' }), go('foglands', 'from-road'),
    () => api.onInteract({ id: 'well' }),
    ...fourPlots(3), // till, sow, water
    () => api.onInteract({ id: 'porch' }),
    () => api.onInteract({ id: 'well' }),
    ...fourPlots(3), // harvest four rocks, sow, water
    () => api.onInteract({ id: 'porch' }),
    ...fourPlots(1), // harvest: rock, rock, the carrot (kept, a poem), a second carrot
    go('foglands-road', 'from-east'), () => api.onTrigger({ id: 'halfway' }), go('friendship', 'from-east'),
    () => api.onInteract({ npc: 'villager-a' }),
    () => api.onInteract({ npc: 'villager-b' }),
    () => api.onInteract({ npc: 'villager-a' }),
    go('foglands-road', 'from-west'), () => api.onTrigger({ id: 'halfway' }), go('vineyard', 'from-road'),
    () => api.onInteract({ id: 'slab' }),
    go('foglands-road', 'from-vineyard'), go('foglands', 'from-road'),
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
// LOCAL WOMAN SHARES GIFT OF ROCKS. Every sentence authored, in the Editor's voice.
export function writeDay02(state) {
  const { flags, farm } = state;
  const rocks = flags.rocksGiven ?? 0;
  const body = [];
  body.push('Miss Emily B. Marks, who came in on the spring train, has spent the summer at Myre Farm in Upper Foglands, a plot this paper warned her about.');
  if (rocks === 0) body.push('Rumors that she hands the townsfolk rocks could not be confirmed. Those we asked report nothing heavier than a nod.');
  else if (rocks < 3) body.push(`${rocks === 1 ? 'One resident reports' : 'Two residents report'} receiving a rock from her by way of thanks. This paper has seen it. It is a rock.`);
  else body.push(`No fewer than ${inWords(rocks)} residents have received a rock from her. It is, she maintains, what the farm produces.`);
  if (farm.carrotGrown && farm.carrotEaten) body.push('Word reaches us that she grew a carrot, and ate it, which is more or less what carrots are for.');
  else if (farm.carrotGrown) body.push('She is said to have grown a carrot, which she keeps on a white plate and does not eat. This paper does not pretend to understand it.');
  else body.push('Of carrots, turnips, or any other vegetable, the Foglands has so far yielded none.');
  if (flags.leftPoem) body.push('She called on Alabaster Brown, who was out, and left a rock on the step with a paper folded beneath it. Our vintner took the rock for the gift.');
  else if (flags.leftRock) body.push('She called on Alabaster Brown, who was out, and left a rock on the step.');
  else body.push('She has yet to call on her nearest neighbor.');
  body.push(flags.metAlabaster
    ? 'Alabaster Brown returned the call. The two are said to be friends, a word that in Friendship covers a great deal.'
    : 'Her nearest neighbor has not returned a call that was never paid.');
  body.push('Upper Foglands has never fed anyone. This paper is glad to be proved partly wrong.');
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Summer · Year 1',
    headline: 'LOCAL WOMAN SHARES GIFT OF ROCKS',
    body,
  };
}

// ---------------------------------------------------------------- state
export const flags = {
  rocksGiven: 0,
  carrotEaten: false,
  leftPoem: false,
  leftRock: false,
  metAlabaster: false,
  boughtSeeds: false,
};

// Who speaks for the first time today (game/dialogue.js adds them; all may be Skipped).
export const speakers = {
  alabaster: { name: 'Alabaster Brown', portrait: 'alabaster-neutral' },
  'villager-a': { name: 'A farmer' },
  'villager-b': { name: 'A townswoman' },
};

// The book's Day 2: rocks for the neighbors, a carrot kept on the plate, a poem left under a
// rock, and Alabaster calls.
export function canonDay02(state) {
  Object.assign(state.flags, { rocksGiven: 3, leftPoem: true, metAlabaster: true, boughtSeeds: true });
  state.giftsGiven += 3;
  state.companions.alabaster += 1;
  Object.assign(state.farm, { grown: 8, harvests: 7, rocks: 3, carrotGrown: true });
  state.week = 3;
  const rocks = countItem(state, 'rock');
  if (rocks < 3) addItem(state, 'rock', 3 - rocks);
  return state;
}

export const presetDay02 = () => presetDay(2);

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 2,
  title: 'A gift of rocks',
  headline: 'LOCAL WOMAN SHARES GIFT OF ROCKS',
  season: 'summer',
  seasonName: 'Summer',
  goal: 'Grow something. Give something.',
  start: { map: 'foglands', spawn: 'porch' },
  flags,
  speakers,
  canon: canonDay02,
  nodes,
  skipPoints,
  extraLines: poemLines,
  create: createDay02,
  write: writeDay02,
  preset: presetDay02,
};
