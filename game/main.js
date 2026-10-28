// Boot (GAME-PLAN §3, §8, §10; GAME-PLAN-DAYS §A.1): title screen, integer scaling, Phaser
// wiring, the day loop and the keyboard router. Phaser draws the world only; every UI lives
// in the DOM. A day comes from game/script/index.js by state.day; when it ends, its paper is
// shown, the save moves to the next morning and that day's card offers Begin.
import { save, load, unlockedDay, unlockDay, ensureDayFlags } from './state.js';
import { WorldScene } from './world.js';
import { rasterize } from '../art/palette.js';
import { textGrid } from '../art/glyphs.js';
import { lines } from './script/lines.js';
import { days, allNodes, isBuilt, presetState, advanceDay, newGame } from './script/index.js';
import { createDialogue } from './dialogue.js';
import { createHud } from './hud.js';
import { createInventory, itemDefs } from './inventory.js';
import { createShop } from './shop.js';
import { createNewspaper } from './newspaper.js';
import { createMenu, createHowTo, createTextPage, createDayCard, createDaySelect } from './menu.js';
import { createSound } from './sound.js';
import { createGoView } from './go/view.js';

export const view = { width: 320, height: 180 };

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const frame = $('frame');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// One logical pixel must cover a whole number of device pixels, or columns come out
// unequal (compact-cast/README.md). On a 1× screen this is the plan's formula,
// zoom = max(1, floor(min(stageW / 320, stageH / 180))).
export function fitZoom(stageWidth, stageHeight, dpr = 1) {
  const device = Math.max(1, Math.floor(Math.min((stageWidth * dpr) / view.width, (stageHeight * dpr) / view.height)));
  return { device, css: device / dpr };
}

function layout(game) {
  const dpr = window.devicePixelRatio || 1;
  const { device, css } = fitZoom(stage.clientWidth, stage.clientHeight, dpr);
  const width = view.width * css;
  const height = view.height * css;
  const snap = (value) => Math.round(value * dpr) / dpr; // keep the frame on device pixels
  Object.assign(frame.style, {
    left: `${snap((stage.clientWidth - width) / 2)}px`,
    top: `${snap((stage.clientHeight - height) / 2)}px`,
    width: `${width}px`,
    height: `${height}px`,
  });
  frame.style.setProperty('--px', `${css}px`);
  frame.dataset.zoom = String(device);
  if (game && game.scale.zoom !== css) game.scale.setZoom(css);
  return css;
}

// Pixel lettering from the 5×7 glyph font, drawn into a canvas (one canvas pixel per glyph pixel).
function drawLettering(canvas, text, key, pad = 0) {
  const art = rasterize(textGrid(text, key), `lettering ${text}`);
  canvas.width = art.width + pad;
  canvas.height = art.height;
  canvas.getContext('2d', { willReadFrequently: true }).putImageData(new ImageData(art.data, art.width, art.height), 0, 0);
}

function boot() {
  // 47 px of lettering in a 48 px canvas: at 3× it centres on a whole pixel in 320.
  drawLettering($('title-logo'), 'PIONEERS', 'p', 1);
  drawLettering($('paper-masthead'), 'THE FRIENDSHIP MIRROR', 'k', 1);
  const zoom = layout(null);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: frame,
    width: view.width,
    height: view.height,
    backgroundColor: '#211f2b',
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.NONE, zoom },
    physics: { default: 'arcade', arcade: { debug: false } },
    audio: { noAudio: true },
    scene: [WorldScene],
  });
  addEventListener('resize', () => layout(game));

  let world = null;
  let state = null;
  let day = null;
  let ctx = null;
  let playing = false;
  const getState = () => state;

  const sound = createSound();
  const hud = createHud($('hud'), $('toast'));
  const dialogue = createDialogue({
    root: $('dialogue'),
    captionRoot: $('caption'),
    lines,
    getState,
    reducedMotion,
    hooks: {
      line: () => sound.play('blip'),
      sound: (name) => sound.play(name),
      cue: (name, node) => day?.cue?.(name, node),
      skip: () => {
        sound.play('skip');
        world?.playerPose('skip');
        setTimeout(() => world?.playerPose(null), 900);
      },
    },
  });
  dialogue.setNodes(allNodes);
  const inventory = createInventory({
    root: $('inventory'),
    getState,
    onChange: (id) => {
      hud.update(state);
      sound.play('heart');
      hud.toast(id === 'bread' ? 'Bread and cheese. You feel better.' : `${itemDefs[id].name}. You feel better.`);
    },
    onOpen: () => world?.setControl(false),
    onClose: () => world?.setControl(!day?.busy),
  });
  const shop = createShop($('shop'), $('market'), { onChange: () => hud.update(state) });
  const newspaper = createNewspaper($('paper'));
  const dayCard = createDayCard($('day-card'));
  const textPage = createTextPage($('text-page'), { lines, days });
  const howTo = createHowTo($('howto'));
  const menu = createMenu($('menu'), {
    onResume: () => world?.setControl(true),
    onInventory: () => inventory.open(),
    onHowTo: () => howTo.open(),
    onText: () => textPage.open(),
    onSound: () => sound.toggle(),
    onTitle: () => location.reload(),
  });
  menu.setSound(sound.enabled);
  const go = createGoView($('go'), { sound, reducedMotion, onClose: () => showTitle() });

  const title = $('title');
  const showTitle = () => {
    title.hidden = false;
    $('new-game').focus();
  };
  const hideTitle = () => {
    title.hidden = true;
  };
  const daySelect = createDaySelect($('day-select'), { days, onPick: (n) => offerDay(n, presetState(n)) });

  game.events.once('world-ready', (scene) => {
    world = scene;
    $('new-game').disabled = false;
    $('new-game').textContent = 'New game';
    $('day-select-open').disabled = false;
    $('tuesday').disabled = false;
    $('text-source').disabled = false;
    $('continue').disabled = !load();
    $('new-game').focus();
  });

  // Phaser captures arrow keys globally; release them while a text field is in use.
  async function withTyping(run) {
    world.input.keyboard.disableGlobalCapture();
    try {
      return await run();
    } finally {
      world.input.keyboard.enableGlobalCapture();
    }
  }

  async function startDay(fresh) {
    if (ctx) ctx.ended = true; // a day replaced mid-way stops reacting
    state = ensureDayFlags(fresh, days[fresh.day]); // a save from before this day's flags existed
    playing = true;
    hideTitle();
    const info = days[state.day];
    ctx = {
      state,
      world,
      dialogue,
      hud,
      sound,
      inventory,
      reducedMotion,
      ended: false,
      shop: {
        horse: (current) => withTyping(() => shop.horse(current)),
        open: (options) => shop.open({ ...options, state }),
      },
      save: () => save(state),
      endDay: () => endDay(),
    };
    day = info.create(ctx);
    world.begin(state, {
      reducedMotion,
      onTile: (tile) => day.onTile?.(tile),
      onTrigger: (object) => day.onTrigger?.(object),
      onExit: (exit) => day.onExit?.(exit),
      onMapBuilt: (mapId) => day.mapBuilt?.(mapId),
      onStep: (kind) => sound.play(kind),
      canInteract: (target) => day.canInteract?.(target) ?? true,
      say: (id) => dialogue.run(id),
    });
    hud.update(state);
    hud.setPlace(world.map.name, (info.seasonName ?? state.season).toUpperCase());
    hud.setGoal(info.goal);
    hud.setScreens(null);
    sound.setPlace(world.map.wind);
    await day.start();
  }

  // The paper, the save, and the next morning's card.
  async function endDay() {
    playing = false;
    hud.setGoal('');
    // day10: a day may end without a paper (`paper: false`, write returns null)
    const paper = days[state.day].write(state);
    if (paper) await newspaper.show(paper);
    state.dayComplete = true;
    unlockDay(state.day + 1);
    save(state);
    advanceDay(state);
    save(state);
    await offerDay(state.day, state);
  }

  // A day's card; Begin starts it from `from` (a preset, or the save moved to that morning).
  async function offerDay(n, from) {
    hideTitle();
    const choice = await dayCard.show({ day: n, info: days[n], built: isBuilt(n) });
    if (choice === 'begin' && isBuilt(n)) await startDay(from);
    else if (playing || state) location.reload();
    else showTitle();
  }

  $('new-game').addEventListener('click', () => world && startDay(newGame()));
  $('continue').addEventListener('click', async () => {
    const saved = load();
    if (!saved || !world) return;
    if (saved.dayComplete) advanceDay(saved);
    if (isBuilt(saved.day)) await startDay(saved);
    else await offerDay(saved.day, saved);
  });
  $('day-select-open').addEventListener('click', () => world && daySelect.open(unlockedDay()));
  $('tuesday').addEventListener('click', () => {
    hideTitle();
    go.open();
  });
  $('text-source').addEventListener('click', () => textPage.open());

  const overlayOpen = () => dialogue.isOpen || inventory.isOpen || shop.isOpen || menu.isOpen || textPage.isOpen
    || howTo.isOpen || dayCard.isOpen || daySelect.isOpen || day?.busy;

  // Game keys while walking: E / Space use, I inventory, Esc pause. Overlays that are open
  // (dialogue, inventory, shop, menus) take their keys first and stop them.
  addEventListener('keydown', (event) => {
    if (!playing || event.repeat || !world) return;
    if (!title.hidden) return; // Day 13's end card can hand back to the title while a day is still "playing"
    if (overlayOpen()) return;
    if (event.target instanceof HTMLInputElement) return;
    if (event.code === 'KeyE' || event.code === 'Space') {
      const target = world.facingTarget();
      if (target && (day.canInteract?.(target) ?? true)) day.onInteract(target);
    } else if (event.code === 'KeyI') {
      inventory.open();
    } else if (event.code === 'Escape') {
      world.setControl(false);
      menu.open();
    } else {
      return;
    }
    event.preventDefault();
  });

  // Inspection handle for verification in the browser console; the game never reads it.
  // startDay(n) opens day n from its canon preset, skipping the title.
  globalThis.pioneers = {
    game,
    go,
    days,
    get state() { return state; },
    get world() { return world; },
    get day() { return day; },
    startDay: (n) => (isBuilt(n) && world ? startDay(presetState(n)) : Promise.reject(new Error(`Day ${n} is not built`))),
  };
}

try {
  if (!window.Phaser) throw new Error('Phaser did not load');
  boot();
} catch (error) {
  $('load-error').hidden = false;
  throw error;
}
