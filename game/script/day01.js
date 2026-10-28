// Day 1, "Welcome, Stranger" (GAME-PLAN §8): everything of this day in one file: its record
// for the registry (`day`, at the end), flags, the book's outcome (canonDay01), dialogue nodes,
// the beats that run them, the paper (writeDay01) and its canon preset (presetDay01).
// Node ids: d1.<speaker>.<topic>. A node quotes an original line by `src` (game/script/lines.js)
// or carries `authored: true` text written for the game; authored lines only connect beats.
// Skippable NPC lines record state.skips / state.skipped; the three book Skip points route
// to Emily's original reply through `onSkip`, every other skip gets a plain "Skip."
import { lines } from './lines.js';
import { changeMap, screensFromTown } from '../transitions.js';
import { createDayKit } from './common.js';
import { addItem, removeItem, countItem } from '../inventory.js';
import { inWords } from '../newspaper.js';
import { presetDay } from './preset.js';

export const nodes = [
  // beat 3: the first conversation
  { id: 'd1.editor.who', speaker: 'editor', text: 'And who might you be, stranger?', authored: true, next: 'd1.emily.name' },
  { id: 'd1.emily.name', speaker: 'emily', src: 'L04', next: 'd1.editor.spouse' },
  { id: 'd1.editor.spouse', speaker: 'editor', portrait: 'editor-keen', src: 'L05', next: 'd1.emily.miss' },
  { id: 'd1.emily.miss', speaker: 'emily', portrait: 'emily-firm', src: 'L06', next: 'd1.editor.comely' },
  { id: 'd1.editor.comely', speaker: 'editor', portrait: 'editor-keen', src: 'L07', next: 'd1.editor.pair' },
  { id: 'd1.editor.pair', speaker: 'editor', src: 'L08', next: 'd1.editor.staying' },
  { id: 'd1.editor.staying', speaker: 'editor', src: 'L09', next: 'd1.emily.cliff' },
  { id: 'd1.emily.cliff', speaker: 'emily', src: 'L10', next: 'd1.editor.rocks' },
  { id: 'd1.editor.rocks', speaker: 'editor', portrait: 'editor-keen', src: 'L11', next: 'd1.editor.gossip' },
  // Skip point 1
  { id: 'd1.editor.gossip', speaker: 'editor', src: 'L12', skippable: true, onSkip: 'd1.emily.skip1', next: 'd1.editor.gossip-cont' },
  { id: 'd1.editor.gossip-cont', speaker: 'editor', text: '—times, and will no doubt call on you.', authored: true, next: 'd1.editor.board' },
  { id: 'd1.emily.skip1', speaker: 'emily', portrait: 'emily-firm', src: 'L13', next: 'd1.editor.board' },
  { id: 'd1.editor.board', speaker: 'editor', src: 'L14', next: 'd1.editor.post' },
  { id: 'd1.editor.post', speaker: 'editor', portrait: 'editor-keen', src: 'L15', next: 'd1.emily.optout' },
  {
    id: 'd1.emily.optout',
    speaker: 'emily',
    choices: [
      { label: lines.L16.text, src: 'L16', set: { optOutAsked: true }, next: 'd1.editor.closer' },
      { label: 'Very well.', authored: true, next: 'd1.editor.closer' },
    ],
  },
  // As in the book, the Editor ignores the question and carries on.
  { id: 'd1.editor.closer', speaker: 'editor', src: 'L17', next: 'd1.editor.valley' },
  // Skip point 2
  { id: 'd1.editor.valley', speaker: 'editor', portrait: 'editor-keen', src: 'L18', skippable: true, onSkip: 'd1.emily.skip2', next: 'd1.editor.valley-cont' },
  { id: 'd1.editor.valley-cont', speaker: 'editor', text: '—family.', authored: true, next: 'd1.editor.stables' },
  { id: 'd1.emily.skip2', speaker: 'emily', portrait: 'emily-firm', src: 'L19', next: 'd1.editor.stables' },
  { id: 'd1.editor.stables', speaker: 'editor', text: 'The stables are at the east end of the street.', authored: true },

  // beat 4: things to look at
  { id: 'd1.board.look', kind: 'narration', text: 'The town board. Two old notices, curling at the corners, and one pinned up this morning.', authored: true, set: { readBoard: true }, next: 'd1.board.old' },
  { id: 'd1.board.old', kind: 'narration', text: 'LOST: ONE GOAT, ANSWERS TO NOTHING.   ·   WELL WATER: BOIL FIRST.', authored: true, next: 'd1.board.new' },
  { id: 'd1.board.new', kind: 'narration', text: 'HOMESTEADER SIGHTED IN UPPER FOGLANDS — story to follow', authored: true },
  { id: 'd1.mercantile.closed', kind: 'narration', text: 'Closed. Back Tuesday.', authored: true },
  { id: 'd1.editor.setting-type', speaker: 'editor', text: 'I’m setting the type, Miss Marks.', authored: true },
  { id: 'd1.mirror.dark', kind: 'narration', text: 'No one answers.', authored: true },

  // beat 5: the gift
  { id: 'd1.gift.asks', src: 'L20', next: 'd1.editor.here' },
  { id: 'd1.editor.here', speaker: 'editor', portrait: 'editor-keen', src: 'L21', cue: 'offer', next: 'd1.editor.gift' },
  { id: 'd1.editor.gift', speaker: 'editor', portrait: 'editor-keen', src: 'L22', next: 'd1.emily.what' },
  { id: 'd1.emily.what', speaker: 'emily', src: 'L23', next: 'd1.editor.dish' },
  // Skip point 3
  { id: 'd1.editor.dish', speaker: 'editor', portrait: 'editor-keen', src: 'L24', skippable: true, onSkip: 'd1.emily.skip3', next: 'd1.editor.dish-cont' },
  { id: 'd1.editor.dish-cont', speaker: 'editor', text: '—country, where no one left the house without bread, cheese, and a little something to say about both.', authored: true },
  { id: 'd1.emily.skip3', speaker: 'emily', portrait: 'emily-firm', src: 'L25', set: { skippedGift: true } },
  { id: 'd1.editor.gone', src: 'L26' },

  // beat 6: the stables
  { id: 'd1.horse.named', src: 'L27' },
  { id: 'd1.pen.empty', kind: 'narration', text: 'The pen is empty now.', authored: true },

  // beat 8: Upper Foglands
  { id: 'd1.foglands.edge', src: 'L29' },
];

export const skipPoints = ['d1.editor.gossip', 'd1.editor.valley', 'd1.editor.dish'];

const platformTiles = new Set(['platform-plank', 'platform-ramp-a', 'platform-ramp-b']);
const mirrorStep = { x: 16, y: 12 }; // where the Editor stands, in front of The Mirror's door
const penFront = { x: 44, y: 12 }; // Pixel waits outside the pen
const streetRow = 15; // the clear row the Editor walks along
const hint = 'Arrows to walk · E to look · S to skip';

// The HUD's "Now:" line for each stretch of the day (GAME-PLAN-DAYS §A.3).
export function goalDay01(state) {
  const flags = state.flags;
  if (state.map === 'foglands') return 'Find the boundary stake on your plot.';
  if (state.map === 'foglands-road') return flags.boughtHorse ? 'Ride east to Upper Foglands.' : 'Walk east to Upper Foglands.';
  if (state.map === 'vineyard') return 'Head back to the road. Upper Foglands is east.';
  if (!flags.metEditor) return 'Step off the platform into town.';
  if (!flags.gotBread) return 'Find the stables, at the east end of the street.';
  if (!flags.boughtHorse) return 'Buy a horse at the stables, or set off east on foot.';
  return 'Ride east out of town, to Upper Foglands.';
}

export function createDay01(ctx) {
  const { state, world, dialogue, hud } = ctx;
  const flags = state.flags;
  const marks = state.marks;
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  kit.goalOf = () => goalDay01(state);

  function loseHeart() {
    kit.loseHearts(1);
  }

  // ---------------------------------------------------------------- beat 1
  async function coldOpen() {
    hud.hide();
    world.setPlayerVisible(false);
    if (ctx.reducedMotion) {
      world.setPlayerVisible(true);
    } else {
      await world.fade('out', 1);
      await dialogue.caption('L01', { hold: 2400 });
      world.fade('in', 700);
      await world.trainArrive();
      await world.stepOffTrain();
      await world.lookAt({ x: 4, y: 26 }, { zoom: 2 });
      await dialogue.caption('L02', { hold: 3200 });
      await world.lookAtPlayer();
      world.trainDepart();
    }
    hud.update(state);
    hud.setPlace(world.map.name);
    hud.show();
    hud.toast(hint, 6000);
  }

  // ---------------------------------------------------------------- beat 2–3
  async function welcome() {
    flags.metEditor = true;
    await dialogue.caption('L03', { kind: 'world', hold: 2000 });
    const editor = world.npc('editor') ?? world.spawnNpc('editor', mirrorStep, 'down');
    const here = world.playerTile();
    const stand = { x: here.x, y: here.y - 1 };
    await editor.walkPath([{ x: mirrorStep.x, y: streetRow }, { x: stand.x, y: streetRow }, stand], 60);
    editor.face('down');
    world.facePlayer('up');
    await talk('d1.editor.who', { hour: true });
    // He walks back to his door while Emily is free to go.
    editor.walkPath([{ x: stand.x, y: streetRow }, { x: mirrorStep.x, y: streetRow }, mirrorStep], 60)
      .then(() => !editor.gone && editor.face('down'));
  }

  // ---------------------------------------------------------------- beat 5
  async function gift() {
    const editor = world.npc('editor');
    if (!editor) return;
    const here = world.playerTile();
    const stand = { x: here.x - 1, y: here.y };
    const from = editor.tile;
    await editor.walkPath([{ x: from.x, y: streetRow }, { x: stand.x, y: streetRow }, stand], 110);
    editor.face('right');
    world.facePlayer('left');
    await talk('d1.gift.asks', { hour: true });
    flags.gotBread = true;
    kit.give('bread', 1, 'Panem et caseum morsu');
    await editor.dissolve();
    await talk('d1.editor.gone');
    kit.hint('inventory', 'I opens your inventory. Eating the bread restores hearts.');
  }

  // ---------------------------------------------------------------- beat 6
  async function stables() {
    if (flags.boughtHorse) {
      await talk('d1.pen.empty');
      return;
    }
    const result = await ctx.shop.horse(state);
    if (!result.bought) {
      hud.toast('Perhaps later.');
      return;
    }
    state.purse -= 60;
    flags.boughtHorse = true;
    flags.horseName = result.name;
    hud.update(state);
    world.showPixel(null);
    world.setRiding(true);
    await talk('d1.horse.named');
  }

  // ---------------------------------------------------------------- beat 7–8
  async function leave(exit) {
    if (state.map === 'friendship' && exit.to === 'foglands-road' && !flags.boughtHorse) {
      flags.walkedHome = true;
      if (!marks.leftTown) {
        marks.leftTown = true;
        loseHeart();
      }
    }
    const arriving = exit.to === 'foglands';
    await changeMap(ctx, exit.to, exit.spawn);
    if (arriving && !flags.boughtHorse && !marks.arrived) {
      marks.arrived = true;
      loseHeart();
    }
    if (arriving && !marks.sawEdge) {
      marks.sawEdge = true;
      await talk('d1.foglands.edge');
    }
  }

  async function stake() {
    await dialogue.caption('L28', { kind: 'world', hold: 2400 });
    kit.give('deed', 1, 'Deed: Upper Foglands');
    flags.arrivedHome = true;
    await world.dusk(2200);
    await world.fade('out', 1000);
    ctx.ended = true;
    hud.hide();
    await ctx.endDay();
  }

  // ---------------------------------------------------------------- E targets
  const objectHandlers = {
    hutch: () => talk('d1.board.look'),
    'mercantile-door': () => talk('d1.mercantile.closed'),
    'mirror-door': () => talk(world.npc('editor') ? 'd1.editor.setting-type' : 'd1.mirror.dark'),
    'stable-pen': stables,
    stake,
  };
  const npcHandlers = {
    editor: () => talk('d1.editor.setting-type'),
    pixel: stables,
  };
  const handlerFor = (target) => (target.npc ? npcHandlers[target.npc] : objectHandlers[target.id]);

  const api = {
    start: () => beat(coldOpen),
    get busy() {
      return kit.busy;
    },

    // Actors that belong to a map are rebuilt with it.
    mapBuilt(mapId) {
      kit.refreshGoal();
      if (mapId !== 'friendship') return;
      if (!flags.gotBread) world.spawnNpc('editor', mirrorStep, 'down');
      if (!flags.boughtHorse) world.showPixel(penFront);
    },

    onTile({ x, ground, map }) {
      if (map === 'foglands-road') hud.setScreens(screensFromTown(x));
      if (map === 'friendship' && !flags.metEditor && !platformTiles.has(ground)) return beat(welcome);
      return undefined;
    },

    onTrigger(object) {
      if (object.id === 'editor-intercept' && flags.metEditor && !flags.gotBread) return beat(gift);
      if (object.id === 'halfway' && !marks.halfway) {
        marks.halfway = true;
        loseHeart();
      }
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

    // Dialogue cues: the Editor holds out the bread.
    cue(name) {
      if (name === 'offer') world.npc('editor')?.pose('offer');
    },
  };

  // Headless walk-through for check-days.mjs: the canon route, one beat per call.
  const route = [
    () => api.start(),
    () => api.onTile({ x: 12, y: 15, ground: 'dirt-road', map: 'friendship' }),
    () => api.onInteract({ id: 'hutch' }),
    () => api.onTrigger({ id: 'editor-intercept' }),
    () => api.onInteract({ id: 'stable-pen' }),
    () => api.onExit({ to: 'foglands-road', spawn: 'from-west' }),
    () => api.onTrigger({ id: 'halfway' }),
    () => api.onExit({ to: 'foglands', spawn: 'from-road' }),
    () => api.onInteract({ id: 'stake' }),
  ];
  api.debugAdvance = async () => {
    const step = route.shift();
    if (!step) return false;
    await step();
    return true;
  };
  return api;
}

// ---------------------------------------------------------------- state
export const flags = {
  metEditor: false,
  optOutAsked: false,
  readBoard: false,
  gotBread: false,
  ateBread: false,
  skippedGift: false,
  boughtHorse: false,
  horseName: '',
  walkedHome: false,
  arrivedHome: false,
};

// The book's Day 1: she Skips the Editor at all three of the book's points, asks to opt out,
// takes the bread (and eats it), buys the azure mare and names her Pixel, rides home.
export function canonDay01(state) {
  Object.assign(state.flags, {
    metEditor: true,
    optOutAsked: true,
    gotBread: true,
    ateBread: true,
    skippedGift: true,
    boughtHorse: true,
    horseName: 'Pixel',
    arrivedHome: true,
  });
  state.skips = 3;
  state.skipped = { L12: true, L18: true, L24: true };
  state.purse = 40;
  removeItem(state, 'bread', countItem(state, 'bread'));
  if (!countItem(state, 'deed')) addItem(state, 'deed');
  return state;
}

export const presetDay01 = () => presetDay(1);

// ---------------------------------------------------------------- the paper
// HOMESTEADER SIGHTED IN UPPER FOGLANDS. Every sentence authored, in the Editor's voice.
export function writeDay01(state) {
  const flags = state.flags;
  const skips = state.skips ?? 0;
  const body = [];
  body.push('A Stranger stepped off the morning train and gave her name as Miss Emily B. Marks. She travels alone, and intends, she says, to stay that way.');
  if (skips >= 3) body.push(`The newcomer declined this paper’s hospitality on no fewer than ${inWords(skips)} occasions.`);
  else if (skips === 0) body.push('She listened to every word, which is more than most do.');
  else body.push(`She cut this reporter short ${skips === 1 ? 'only once' : 'twice'}, which in Friendship counts as restraint.`);
  if (flags.optOutAsked) body.push('She inquired whether she might be left out of this notice. She may not.');
  body.push(flags.readBoard
    ? 'She was seen studying the town board, where this notice was first announced.'
    : 'She walked past the town board without a glance; this paper has taken the liberty of reading it to her.');
  if (flags.gotBread && flags.ateBread) body.push('She accepted a panem et caseum morsu from this reporter and ate it, we are told, with evident appreciation.');
  else if (flags.gotBread) body.push('She accepted a panem et caseum morsu from this reporter. It remains uneaten. It keeps.');
  if (flags.skippedGift) body.push('For the record, the dish is my grandparents’ recipe from the old country: bread, cheese, and the patience to hear about both.');
  if (flags.boughtHorse) body.push(`She departed on an azure mare she calls ${flags.horseName || 'Pixel'}.`);
  else if (flags.walkedHome) body.push('She set off for the Foglands on foot, against all advice.');
  else body.push('She was last seen heading east, by means this paper could not establish.');
  body.push('No one has kept a farm in Upper Foglands for as long as anyone can recall. This paper wishes her luck. She will need it.');
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Early spring · Year 1',
    headline: 'HOMESTEADER SIGHTED IN UPPER FOGLANDS',
    body,
  };
}

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 1,
  title: 'Welcome, Stranger',
  headline: 'HOMESTEADER SIGHTED IN UPPER FOGLANDS',
  season: 'spring',
  seasonName: 'Early spring',
  goal: 'Find your plot in Upper Foglands.',
  start: { map: 'friendship', spawn: 'from-train' },
  flags,
  canon: canonDay01,
  nodes,
  skipPoints,
  create: createDay01,
  write: writeDay01,
  preset: presetDay01,
};
