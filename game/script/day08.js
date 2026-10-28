// Day 8, SPECIAL EVENT: SUPER BLIZZARD TERRORIZES FRIENDSHIP (GAME-PLAN-DAYS §B Day 8), late
// winter. Everything of this day in one file: its record for the registry (`day`, at the end),
// flags, speakers, the book's outcome (canonDay08), nodes, beats, the paper (writeDay08) and
// presetDay08.
//
// Daedalus rides out for Eidetic Bluffs; the blizzard comes down (six tiles of sight, wind).
// Three Rests; on the third day Emily rides to the Bluffs gate: no doctor came. The fourth
// day the horse comes home alone; the Editor posts a notice, and may be Skipped. The fifth
// day, a road never taken: Undiscovered Friendship, a door at a time, until the man in
// seersucker at the arcade mentions the caves. Then dusk: 90 seconds of real light, and the
// cave's mouth shows itself only in the last 20, at one of three places on the mountain.
// Missed, Emily rides home and searches again after the next Rest, and the mouth has moved.
// Found: Daedalus, her right hand black. Home, the nursing, and one button.
//
// Node ids: d8.<speaker>.<topic>. Lines quoted from the book are `src` (L8.xx in
// lines/day08.js); everything else is `authored` and only connects. Menu choices are `silent`.
import { changeMap } from '../transitions.js';
import { createDayKit } from './common.js';
import { createHitchRide, hitchNodes, hitchRoutes } from './fast-ride.js';
import { mapFor } from '../../maps/versions.js';
import { inWords } from '../newspaper.js';
import { presetDay } from './preset.js';
import { ridesOn } from './day07.js';
import { portalLink, travelByPortal } from '../world/day06.js';
import { caveSpots, track } from '../../maps/day08-undiscovered.js';
import { placeImage, useStylesheet } from '../world/day07.js';
import { setDusk, showCaveMouth, startBlizzard } from '../world/day08.js';

export const skipPoints = ['d8.editor.must'];
export const duskSeconds = 90;
export const shimmerSeconds = 20; // the mouth shows itself only in the last 20 seconds
export const hearRadius = 10; // tiles: "I'm here." carries this far at the end of dusk
export const blizzardWind = [0.32, 520];

// Which of the three places the cave opens at, for the nth search (0, 1, …): a fixed seed,
// then a different place each evening ("Some people say it moves").
export const caveSeed = 7;
export const caveFor = (search) => caveSpots[((Math.imul(caveSeed, 2654435761) >>> 0) + search) % caveSpots.length];

// One sentence at each door in Undiscovered Friendship.
export const shopLines = {
  ranch: 'A rancher leaning on the rail. No one has seen the doctor.',
  aviary: 'Inside, a thousand birds and one keeper. He has not seen the doctor.',
  nursery: 'Ferns and orchids under glass. No one has seen the doctor.',
  pianos: 'A man tuning a piano, one key at a time. He has not seen the doctor.',
  spa: 'Steam and closed doors. No one has seen the doctor.',
  museum: 'Engines under glass, and a guard asleep. No one has seen the doctor.',
  amusements: 'The carousel turns for nobody. No one has seen the doctor.',
  explosives: 'A sign: NO OPEN FLAMES. The clerk has not seen the doctor.',
  casino: 'Cards, and the sound of dice. No one has seen the doctor.',
};

export const nodes = [
  // beat 1: departure
  { id: 'd8.leave.march', src: 'L8.01', next: 'd8.emily.grumbled' },
  { id: 'd8.emily.grumbled', speaker: 'emily', portrait: 'emily-firm', src: 'L8.02', next: 'd8.daedalus.children' },
  { id: 'd8.daedalus.children', speaker: 'daedalus', src: 'L8.03', next: 'd8.emily.soft' },
  { id: 'd8.emily.soft', speaker: 'emily', portrait: 'emily-soft', src: 'L8.04' },
  // beat 2: the blizzard
  { id: 'd8.storm.began', src: 'L8.05', next: 'd8.storm.recharge' },
  { id: 'd8.storm.recharge', src: 'L8.06' },
  {
    id: 'd8.rest.ask',
    kind: 'narration',
    text: 'The porch steps. Rest here until morning?',
    authored: true,
    choices: [
      { label: 'Rest until morning', authored: true, silent: true, value: 'rest' },
      { label: 'Not yet', authored: true, silent: true, value: 'no' },
    ],
  },
  { id: 'd8.storm.three', src: 'L8.07' },
  { id: 'd8.bluffs.far', kind: 'narration', text: 'The road to Eidetic Bluffs: a whole day’s ride, into the storm. She’ll be back when she recharges.', authored: true },
  { id: 'd8.bluffs.sign', kind: 'narration', text: 'EIDETIC BLUFFS · A DAY’S RIDE NORTH', authored: true },
  { id: 'd8.bluffs.gate', kind: 'narration', text: 'The gate of Eidetic Bluffs, and the settlement school beyond it.', authored: true, next: 'd8.teacher.none' },
  { id: 'd8.teacher.none', speaker: 'teacher', text: 'No doctor came.', authored: true, next: 'd8.bluffs.never' },
  { id: 'd8.bluffs.never', src: 'L8.08' },
  { id: 'd8.bluffs.done', kind: 'narration', text: 'The Bluffs have nothing more to tell her.', authored: true },
  // beat 3: the horse, the Editor, the Hutch
  { id: 'd8.horse.returned', src: 'L8.09' },
  { id: 'd8.editor.notice', src: 'L8.10', next: 'd8.editor.marks' },
  { id: 'd8.editor.marks', speaker: 'editor', portrait: 'editor-neutral', src: 'L8.11', next: 'd8.editor.must' },
  { id: 'd8.editor.must', speaker: 'editor', portrait: 'editor-neutral', src: 'L8.12', skippable: true, onSkip: 'd8.emily.skip', next: 'd8.editor.carry' },
  { id: 'd8.emily.skip', speaker: 'emily', portrait: 'emily-firm', src: 'L8.13' },
  { id: 'd8.editor.carry', speaker: 'editor', portrait: 'editor-neutral', text: '—let them go, and carry on. I shall post your notice all the same.', authored: true },
  { id: 'd8.editor.posted', speaker: 'editor', text: 'Your notice is on the Hutch, Ms. Marks.', authored: true },
  { id: 'd8.hutch.missing', kind: 'narration', text: 'MISSING · DR. EDNA DAEDALUS, OPTOMETRIST, OF THE VALLEY · LAST SEEN ON THE ROAD TO EIDETIC BLUFFS · ANY WORD TO THE MIRROR', authored: true },
  { id: 'd8.hutch.old', kind: 'narration', text: 'The town board, snowed over. Nothing about the doctor.', authored: true },
  { id: 'd8.mirror.closed', kind: 'narration', text: 'The Mirror is shut against the storm.', authored: true },
  // beat 4: the search
  { id: 'd8.search.fifth', src: 'L8.14' },
  { id: 'd8.search.not-yet', kind: 'narration', text: 'A road she has never taken. Not yet.', authored: true },
  { id: 'd8.search.past', src: 'L8.15' },
  { id: 'd8.shop.ranch', kind: 'narration', text: shopLines.ranch, authored: true },
  { id: 'd8.shop.aviary', kind: 'narration', text: shopLines.aviary, authored: true },
  { id: 'd8.shop.nursery', kind: 'narration', text: shopLines.nursery, authored: true },
  { id: 'd8.shop.pianos', kind: 'narration', text: shopLines.pianos, authored: true },
  { id: 'd8.shop.spa', kind: 'narration', text: shopLines.spa, authored: true },
  { id: 'd8.shop.museum', kind: 'narration', text: shopLines.museum, authored: true },
  { id: 'd8.shop.amusements', kind: 'narration', text: shopLines.amusements, authored: true },
  { id: 'd8.shop.explosives', kind: 'narration', text: shopLines.explosives, authored: true },
  { id: 'd8.shop.casino', kind: 'narration', text: shopLines.casino, authored: true },
  { id: 'd8.breaker.locked', kind: 'narration', text: 'BREAKER OF HORSES. The gate is padlocked, and no one comes when she calls.', authored: true },
  { id: 'd8.arcade.none', src: 'L8.16', next: 'd8.arcade.caves' },
  { id: 'd8.arcade.caves', src: 'L8.17', next: 'd8.seersucker.moves' },
  { id: 'd8.seersucker.moves', speaker: 'seersucker', src: 'L8.18' },
  { id: 'd8.seersucker.again', speaker: 'seersucker', text: 'The caves, ma’am. Before the light goes.', authored: true },
  // beat 5: dusk
  { id: 'd8.dusk.circled', src: 'L8.19' },
  { id: 'd8.dusk.gone', kind: 'narration', text: 'The light was gone. Emily turned Pixel for home. She would search again tomorrow.', authored: true },
  { id: 'd8.dusk.backtracked', src: 'L8.22' },
  // beat 6: the cave
  { id: 'd8.cave.inside', src: 'L8.23', next: 'd8.daedalus.hand' },
  { id: 'd8.daedalus.hand', speaker: 'daedalus', src: 'L8.24' },
  { id: 'd8.home.nursed', src: 'L8.25', next: 'd8.daedalus.rather' },
  // the book reports this exchange in indirect speech; split into a question and an answer,
  // in its own words
  { id: 'd8.daedalus.rather', speaker: 'daedalus', text: 'I would rather be dead than lacking my hand.', authored: true, next: 'd8.emily.both' },
  { id: 'd8.emily.both', speaker: 'emily', portrait: 'emily-firm', text: 'You would be dead if you had both hands.', authored: true, next: 'd8.home.button' },
  {
    // not a choice: a rite. One button, the book's sentence turned to the present.
    id: 'd8.home.button',
    kind: 'narration',
    text: '',
    authored: true,
    choices: [{ label: 'The amputation cannot be avoided.', authored: true, silent: true, value: 'amputate', set: { amputation: true } }],
  },
  { id: 'd8.home.amputation', src: 'L8.26' },
  // Pixel at the hitch: face her and press E to ride (fast-ride.js)
  ...hitchNodes('d8', ['to-town']),
];

export function goalDay08(state) {
  const { flags, marks } = state;
  const rests = marks.rests ?? 0;
  if (marks.ending) return 'Good night.';
  if (flags.foundCave) return 'Bring her home.';
  if (state.map === 'undiscovered') {
    if (marks.dusk && !marks.dusk.over) return 'Circle the mountain. Search until the light is gone.';
    if (!flags.arcadeHint) return 'Ask at the doors. Someone may have seen her.';
  }
  if (rests < 3) return state.map === 'foglands' ? 'Rest on the porch steps. She’ll be back when she recharges.' : 'Go home and rest out the storm.';
  if (!flags.bluffsChecked) {
    if (state.map === 'valley-road') return 'Eidetic Bluffs: the track north, near the east end of the valley road.';
    if (state.map === 'verdant-valley') return 'Ride on east, past the house: the valley road.';
    if (state.map === 'foglands-road') return 'Eidetic Bluffs: the Verdant Valley track north, near the town end, then the valley road east.';
    return 'Ride to Eidetic Bluffs: the Foglands road west, through Verdant Valley, then the valley road east.';
  }
  if (rests < 4) return state.map === 'foglands' ? 'Rest on the porch steps.' : 'Ride home and rest.';
  if (!marks.noticePosted) return state.map === 'friendship' ? 'Speak to the Editor at the Mirror.' : 'Ride to town: ask the Editor to post a notice.';
  if (rests < 5) return state.map === 'foglands' ? 'Rest on the porch steps.' : 'Ride home and rest.';
  if (!marks.searchReady) return state.map === 'foglands' ? 'Rest, and search again.' : 'Ride home and rest; search again tomorrow.';
  if (state.map === 'foglands-road') return 'Take the road you have never taken: south, near the town end.';
  return 'Search where you have never been: the Foglands road west, then the road south.';
}

// The Light meter at dusk: four bars, emptying as the 90 seconds run out.
function createLightMeter() {
  const hud = typeof document !== 'undefined' ? document.getElementById('hud') : null;
  if (!hud) return { update() {}, remove() {} };
  useStylesheet('../css/day07.css');
  const meter = document.createElement('p');
  meter.className = 'd08-light';
  hud.append(meter);
  return {
    update(left) {
      const bars = Math.ceil((left / duskSeconds) * 4);
      meter.textContent = `Light: ${'▮'.repeat(bars)}${'▯'.repeat(4 - bars)}`;
      meter.setAttribute('aria-label', `Light left: ${bars} of 4`);
    },
    remove: () => meter.remove(),
  };
}

export function createDay08(ctx) {
  const { state, world, dialogue, hud } = ctx;
  const { flags, marks } = state;
  useStylesheet('../css/day07.css');
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  kit.goalOf = () => goalDay08(state);
  const farmMap = mapFor('foglands', 8);
  const caveMap = mapFor('cave', 8);
  const undiscoveredMap = mapFor('undiscovered', 8);
  let stopStorm = null;
  let storming = null; // 'heavy' | 'light' | null
  let meter = null;
  let timer = null;
  let shimmer = null;

  // ---------------------------------------------------------------- the storm
  const stormFor = () => {
    if (!flags.daedalusLeft || ['undiscovered', 'cave'].includes(state.map)) return null;
    const rests = marks.rests ?? 0;
    if (rests < 3) return 'heavy';
    if (rests === 3) return 'light';
    return null;
  };
  function weather() {
    const want = stormFor();
    if (want !== storming) {
      stopStorm?.();
      stopStorm = want ? startBlizzard(world, { heavy: want === 'heavy' }) : null;
      storming = want;
    }
    ctx.sound?.setPlace(want === 'heavy' ? blizzardWind : world.map?.wind);
  }
  function stopWeather() {
    stopStorm?.();
    stopStorm = null;
    storming = null;
  }

  // ---------------------------------------------------------------- beat 1: departure
  async function wake() {
    hud.update(state);
    hud.show();
    if (marks.woke) return;
    marks.woke = true;
    const rider = world.spawnNpc('daedalus-horse', farmMap.marks.rider, 'left');
    world.facePlayer('down');
    if (!ctx.reducedMotion) await world.fade('in', 700);
    await talk('d8.leave.march');
    flags.daedalusLeft = true;
    await rider.walkPath(farmMap.marks.riderPath, 70);
    rider.destroy?.();
    await talk('d8.storm.began');
    weather();
    kit.hint('storm', 'The blizzard: you can see six tiles. Rest out the storm on the porch steps.', 5200);
  }

  // ---------------------------------------------------------------- Rest: the days after
  const dayCards = ['The first day after the blizzard began', 'The second day', 'The third day', 'The fourth day', 'The fifth day'];
  async function rest() {
    const rests = marks.rests ?? 0;
    if (rests === 3 && !flags.bluffsChecked) return hud.toast('First, ride out to Eidetic Bluffs.', 2600);
    if (rests === 4 && !marks.noticePosted) return hud.toast('First, ask the Editor to post a notice.', 2600);
    if (rests >= 5 && marks.searchReady) return hud.toast('Not while there is a road you have never taken.', 2600);
    const choice = await talk('d8.rest.ask');
    if (choice !== 'rest') return undefined;
    await world.fade('out', 500);
    marks.rests = rests + 1;
    state.week += 1;
    state.hearts = state.heartsMax;
    state.clock = 6;
    world.setSky(state.clock);
    hud.update(state);
    world.placePlayer('porch');
    if (marks.rests >= 5) marks.searchReady = true;
    showFarm();
    weather();
    ctx.save?.();
    await world.fade('in', 500);
    await dialogue.caption(dayCards[marks.rests - 1] ?? 'Another day of searching', { kind: 'world', hold: 1600 });
    if (marks.rests === 3) await talk('d8.storm.three');
    else if (marks.rests === 4) await talk('d8.horse.returned');
    else if (marks.rests === 5) await talk('d8.search.fifth');
    return undefined;
  }

  function showFarm() {
    if (state.map !== 'foglands') return;
    world.npc('lq-8')?.destroy();
    if ((marks.rests ?? 0) < 3) world.spawnNpc('lq-8', farmMap.marks.lq, 'down'); // then he goes to Alabaster's
  }

  // ---------------------------------------------------------------- the Bluffs
  async function bluffs() {
    const rests = marks.rests ?? 0;
    if (rests < 3) await talk('d8.bluffs.far');
    else if (flags.bluffsChecked) await talk('d8.bluffs.done');
    else {
      await world.fade('out', 600);
      await world.fade('in', 600);
      await talk('d8.bluffs.gate', { hour: true });
      flags.bluffsChecked = true;
    }
    world.placePlayer('from-bluffs');
  }

  // ---------------------------------------------------------------- the Editor and the Hutch
  async function editor() {
    if ((marks.rests ?? 0) < 4) return talk('d8.mirror.closed');
    if (marks.noticePosted) return talk('d8.editor.posted');
    const npc = world.npc('editor');
    npc?.face('down');
    world.facePlayer('up');
    await talk('d8.editor.notice', { hour: true });
    flags.skippedEditorDay8 = Boolean(state.skipped['L8.12']);
    marks.noticePosted = true;
    flags.horseReturned = true;
    kit.hint('notice', 'The notice is on the Hutch.', 3000);
    return undefined;
  }
  const hutch = () => talk(marks.noticePosted ? 'd8.hutch.missing' : 'd8.hutch.old');

  // ---------------------------------------------------------------- beat 4: the search
  async function enterUndiscovered() {
    if (!marks.sawPast) {
      marks.sawPast = true;
      await talk('d8.search.past');
    }
    if (flags.arcadeHint && marks.searchReady) await startDusk();
  }

  async function door(target) {
    const shop = target.shop;
    if (shop === 'arcade') return arcade();
    marks.doors = { ...(marks.doors ?? {}), [target.id]: true };
    return talk(`d8.shop.${shop}`);
  }

  async function breaker() {
    flags.sawBreaker = true;
    await talk('d8.breaker.locked');
  }

  async function arcade() {
    marks.doors = { ...(marks.doors ?? {}), 'door-arcade': true };
    if (flags.arcadeHint) {
      await talk('d8.seersucker.again');
      return;
    }
    world.npc('seersucker')?.face('down');
    await talk('d8.arcade.none');
    flags.arcadeHint = true;
    await startDusk();
  }

  // ---------------------------------------------------------------- beat 5: dusk
  async function startDusk() {
    if (!marks.searchReady || (marks.dusk && !marks.dusk.over)) return;
    marks.dusk = { elapsed: 0, spot: caveFor(flags.searches).id, heard: false, over: false };
    flags.searches += 1;
    setDusk(world, 0);
    meter?.remove();
    meter = createLightMeter();
    meter.update(duskSeconds);
    await talk('d8.dusk.circled');
    kit.hint('dusk', 'Ninety seconds of light. Circle the mountain on its track.', 4000);
    clearInterval(timer);
    let last = Date.now();
    timer = setInterval(() => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      if (ctx.ended) {
        clearInterval(timer);
        return;
      }
      if (kit.busy || !world.player?.enabled || world.map?.id !== 'undiscovered') return;
      tick(dt);
    }, 250);
  }

  // The dusk clock: dt seconds of light pass. The headless walk-through calls this directly.
  function tick(dt) {
    const dusk = marks.dusk;
    if (!dusk || dusk.over) return undefined;
    dusk.elapsed = Math.min(duskSeconds, dusk.elapsed + dt);
    const left = duskSeconds - dusk.elapsed;
    setDusk(world, dusk.elapsed / duskSeconds);
    meter?.update(left);
    const spot = caveSpots.find((candidate) => candidate.id === dusk.spot);
    if (left <= shimmerSeconds && !dusk.shown) {
      dusk.shown = true;
      shimmer = showCaveMouth(world, spot);
    }
    if (dusk.shown && !dusk.heard && world.playerTile) {
      const at = world.playerTile();
      if (Math.abs(at.x - spot.x) + Math.abs(at.y - spot.y) <= hearRadius) {
        dusk.heard = true;
        dialogue.caption('L8.20', { kind: 'narration', hold: 1800 }).then(() => !ctx.ended && dialogue.caption('L8.21', { kind: 'narration', hold: 1600 }));
      }
    }
    if (left <= 0) return beat(lightGone);
    return undefined;
  }

  function endDusk() {
    clearInterval(timer);
    timer = null;
    meter?.remove();
    meter = null;
    shimmer?.destroy?.();
    shimmer = null;
    if (marks.dusk) marks.dusk.over = true;
  }

  async function lightGone() {
    endDusk();
    marks.searchReady = false;
    await talk('d8.dusk.gone');
    await changeMap(ctx, 'foglands', 'porch');
    state.clock = 21;
    world.setSky(state.clock);
  }

  // ---------------------------------------------------------------- on foot round the mountain
  // "She dismounted her horse and she walked through the nebula": on the mountain's track
  // Emily goes on foot and Pixel waits where the spur meets it; back down the spur, she rides.
  const onTrack = ({ x, y }) => x >= track.x && x < track.x + track.w && y >= track.y && y < track.y + track.h;
  function dismountOnTrack(tile) {
    if (tile.map !== 'undiscovered' || !flags.boughtHorse) return;
    if (onTrack(tile) && !marks.afoot) {
      marks.afoot = true;
      world.setRiding(false);
      world.showPixel(undiscoveredMap.marks.hitch, 'east');
      kit.hint('afoot8', 'She gets down: the track round the mountain is walked. Pixel waits at the foot of it.', 4200);
    } else if (marks.afoot && tile.y >= track.y + track.h + 1) {
      marks.afoot = false;
      world.showPixel(null);
      world.setRiding(true);
    }
  }

  const caveOpen = (target) => marks.dusk && !marks.dusk.over && marks.dusk.shown && target.id === marks.dusk.spot;

  // ---------------------------------------------------------------- beat 6: the cave
  async function cave() {
    endDusk();
    flags.foundCave = true;
    await talk('d8.dusk.backtracked');
    await changeMap(ctx, 'cave', 'from-mouth');
    kit.refreshGoal();
    await talk('d8.cave.inside');
    await world.fade('out', ctx.reducedMotion ? 1 : 1600);
    stopWeather();
    state.map = 'foglands';
    state.spawn = 'porch';
    world.enterMap('foglands', 'porch');
    hud.setPlace(world.map.name);
    state.clock = 20;
    world.night?.();
    await talk('d8.home.nursed');
    await talk('d8.home.amputation');
    flags.amputation = true;
    marks.ending = true;
    hud.setGoal('Good night.');
    ctx.ended = true;
    hud.hide();
    await ctx.endDay();
  }

  // ---------------------------------------------------------------- moving about
  async function leave(exit) {
    if (exit.to === 'bluffs-gate') return bluffs();
    if (exit.to === 'undiscovered' && !marks.searchReady) {
      await talk('d8.search.not-yet');
      world.placePlayer('from-undiscovered');
      return undefined;
    }
    if (state.map === 'undiscovered' && marks.dusk && !marks.dusk.over) {
      endDusk(); // riding off gives the evening up
      marks.searchReady = false;
    }
    await changeMap(ctx, exit.to, exit.spawn);
    if (exit.to === 'undiscovered') await enterUndiscovered();
    return undefined;
  }

  const objectHandlers = {
    porch: rest,
    'mirror-door': editor,
    hutch,
    'bluffs-sign': () => talk('d8.bluffs.sign'),
    'breaker-gate': breaker,
  };
  const npcHandlers = {
    editor,
    seersucker: arcade,
  };
  // Pixel at the hitch: E rides between the farm and town (fast-ride.js).
  const hitch = createHitchRide(ctx, kit, 'd8', { foglands: hitchRoutes.toTown(0) });
  const handlerFor = (target) => {
    if (target.npc === 'pixel') return hitch.handler();
    if (target.npc) return npcHandlers[target.npc] ?? null;
    if (target.type === 'door' && target.shop) return () => door(target);
    if (target.type === 'cave') return caveOpen(target) ? cave : null;
    if (portalLink(state.map, target.id)) return () => travelByPortal(ctx, target.id);
    return objectHandlers[target.id] ?? null;
  };

  const api = {
    start: () => beat(wake),
    get busy() {
      return kit.busy;
    },

    mapBuilt(mapId) {
      world.setRiding(ridesOn(state, mapId) || (Boolean(flags.boughtHorse) && (mapId === 'verdant-valley' || mapId === 'valley-road')));
      if (mapId === 'foglands') {
        showFarm();
        if (flags.boughtHorse) world.showPixel(farmMap.marks.hitch, 'west');
        hitch.hint();
      } else if (mapId === 'friendship') {
        if ((marks.rests ?? 0) >= 4) world.spawnNpc('editor', { x: 16, y: 12 }, 'down');
      } else if (mapId === 'undiscovered') {
        marks.afoot = false; // she always rides in from the road
        world.spawnNpc('seersucker', undiscoveredMap.marks.seersucker, 'down');
      } else if (mapId === 'cave') {
        placeImage(world, 'daedalus-lying', 'down-1', caveMap.marks.daedalus);
        world.facePlayer('up');
      }
      if (mapId !== 'undiscovered') world.setSky(state.clock);
      else if (marks.dusk && !marks.dusk.over) setDusk(world, marks.dusk.elapsed / duskSeconds);
      weather();
      kit.refreshGoal();
    },

    onExit(exit) {
      return beat(() => leave(exit));
    },

    onTile(tile) {
      dismountOnTrack(tile);
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
  // The route for check-days.mjs: departure, three Rests, the Bluffs, a fourth Rest, the
  // Editor and the Hutch, a fifth Rest, the road never taken, a door, the breaker's gate, the
  // arcade. The first evening runs out of light (Emily rides home on her own); a Rest, back
  // again, and on the second evening the moved mouth is found in its last 20 seconds.
  const go = (to, spawn) => () => api.onExit({ to, spawn });
  const porch = () => api.onInteract({ id: 'porch' });
  const light = (seconds) => () => (state.map === 'undiscovered' ? tick(seconds) : undefined);
  const openCave = () => (marks.dusk?.shown ? api.onInteract(caveSpots.find((spot) => spot.id === marks.dusk.spot)) : undefined);
  const route = [
    () => api.start(),
    porch, porch, porch,
    go('foglands-road', 'from-east'), go('verdant-valley', 'from-road'), go('valley-road', 'from-valley'), go('bluffs-gate', 'from-bluffs'), go('foglands', 'from-road'),
    porch,
    go('foglands-road', 'from-east'), go('friendship', 'from-east'),
    () => api.onInteract({ npc: 'editor' }), () => api.onInteract({ id: 'hutch' }),
    go('foglands-road', 'from-west'), go('foglands', 'from-road'),
    porch,
    go('foglands-road', 'from-east'), go('undiscovered', 'from-road'),
    () => api.onInteract({ id: 'door-aviary', type: 'door', shop: 'aviary' }),
    () => api.onInteract({ id: 'breaker-gate' }),
    () => api.onInteract({ npc: 'seersucker' }),
    light(60), light(31), // the first evening: the light runs out
    porch,
    go('foglands-road', 'from-east'), go('undiscovered', 'from-road'), // dusk starts on arrival
    light(75), openCave,
  ];
  api.debugAdvance = async () => {
    const step = route.shift();
    if (!step) return false;
    await step();
    return true;
  };
  api.debugTick = tick;
  return api;
}

// ---------------------------------------------------------------- the paper
// SPECIAL EVENT: SUPER BLIZZARD TERRORIZES FRIENDSHIP. Every sentence authored, in the Editor's
// voice.
export function writeDay08(state) {
  const { flags } = state;
  const searches = flags.searches ?? 0;
  const body = [];
  body.push('The worst storm in living memory came down on Friendship at the end of March, in the hour after Dr. Edna Daedalus set out for Eidetic Bluffs to examine the eyes of thirty schoolchildren.');
  body.push(flags.bluffsChecked
    ? 'When the snow thawed, Ms. Marks rode to the Bluffs herself. The doctor had never arrived.'
    : 'For three days nothing could be learned of the doctor, at the Bluffs or anywhere else.');
  if (flags.skippedEditorDay8) body.push('On the fourth day the doctor’s horse came home without her. This paper posted a notice at the Hutch for Ms. Marks, who did not care to hear the rest of what this paper had to say.');
  else if (flags.horseReturned) body.push('On the fourth day the doctor’s horse came home without her. This paper posted a notice at the Hutch, and offered Ms. Marks what comfort it could.');
  else body.push('On the fourth day the doctor’s horse came home without her.');
  const clues = [flags.arcadeHint && 'a man at the arcade spoke of caves', flags.sawBreaker && 'the horse breaker’s gate was found padlocked'].filter(Boolean);
  body.push(`Ms. Marks searched the unmapped country to the southwest ${searches <= 1 ? 'by the last light of one evening' : `on ${inWords(searches)} evenings`}${clues.length ? `, where ${clues.join(' and ')}` : ''}.`);
  if (flags.foundCave && flags.amputation) body.push('She found the doctor in a cave in the mountain, alive. The doctor’s right hand could not be saved, and was removed. Dr. Daedalus is recovering at home.');
  else if (flags.foundCave) body.push('She found the doctor in a cave in the mountain, alive.');
  else body.push('The doctor has not been found. Any word should be brought to this paper.');
  body.push('The worst that happens in Friendship, we have always said, is that one runs out of hearts. This paper will say it less often.');
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Late winter · Year 5',
    headline: 'SPECIAL EVENT: SUPER BLIZZARD TERRORIZES FRIENDSHIP',
    body,
  };
}

// ---------------------------------------------------------------- state
export const flags = {
  daedalusLeft: false,
  bluffsChecked: false,
  horseReturned: false,
  skippedEditorDay8: false,
  arcadeHint: false,
  sawBreaker: false,
  searches: 0,
  foundCave: false,
  amputation: false,
};

export const speakers = {
  seersucker: { name: 'A man in seersucker', portrait: 'seersucker-neutral' },
  teacher: { name: 'The schoolteacher' },
};

// The book's Day 8: no Skip, one evening's search, the arcade's hint, the cave, the hand.
export function canonDay08(state) {
  Object.assign(state.flags, {
    daedalusLeft: true, bluffsChecked: true, horseReturned: true, arcadeHint: true, sawBreaker: true, searches: 1, foundCave: true, amputation: true,
  });
  state.week = 5;
  return state;
}

export const presetDay08 = () => presetDay(8);

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 8,
  title: 'The blizzard',
  headline: 'SPECIAL EVENT: SUPER BLIZZARD TERRORIZES FRIENDSHIP',
  season: 'winter',
  seasonName: 'Late winter',
  goal: 'She’ll be back when she recharges.',
  start: { map: 'foglands', spawn: 'porch' },
  flags,
  speakers,
  canon: canonDay08,
  nodes,
  skipPoints,
  extraLines: ['L8.20', 'L8.21'], // called out as captions at the end of dusk
  create: createDay08,
  write: writeDay08,
  preset: presetDay08,
};
