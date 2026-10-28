// Day 12, the Breaker of Horses (GAME-PLAN-DAYS §B Day 12), autumn. Everything of this day in
// one file: its record (`day`, at the end), flags, speakers, canon, nodes, beats, the paper
// (writeDay12) and presetDay12.
//
// Emily remembers the ranch she passed in the blizzard and sets out to get Pixel shod before she
// leaves Friendship. Undiscovered Friendship is blank on the larger map (M); its roads double
// back, and the gate is no longer where Day 8 found it. At sunset she rides through the ranch to
// the white A-frame house and rings the bell. The man in the white hat: the book's exchange,
// a bargain over horseshoes (three materials), a kiss on the cheek or a handshake, and then
// either the question about The Iliad (he takes off his hat and recites Andromache, slowly) or
// goodbye. Pixel is shod; the paper prints the sign in full.
//
// Node ids: d12.<speaker>.<topic>. Lines quoted from the book are `src` (L12.xx in lines.js);
// everything else is `authored` and only connects.
import { changeMap } from '../transitions.js';
import { createDayKit } from './common.js';
import { presetDay } from './preset.js';
import { removeItem } from '../inventory.js';
import { drawPortrait } from '../dialogue.js';
import { lines as bookLines } from './lines/day12.js';
import { bigMap } from '../../art/days/day12.js';
import { rasterize } from '../../art/palette.js';
import { textGrid } from '../../art/glyphs.js';

const live = typeof document !== 'undefined'; // false in check-days.mjs (no Phaser, no DOM)

export const skipPoints = [];
export const recitalLine = 'L12.21'; // typed slowly in its own box (recite below)
export const closingLine = 'L12.25'; // printed at the foot of the paper
export const recitalSpeed = 28; // characters a second (the dialogue's usual is 40)

export const nodes = [
  // beat 1: what she remembers
  { id: 'd12.memory.blizzard', src: 'L12.01', next: 'd12.memory.stopped' },
  { id: 'd12.memory.stopped', src: 'L12.02', next: 'd12.memory.sign' },
  { id: 'd12.memory.sign', src: 'L12.03', next: 'd12.memory.shod' },
  { id: 'd12.memory.shod', src: 'L12.04' },
  // beat 2: the larger map, the roads
  { id: 'd12.map.unmarked', src: 'L12.05' },
  { id: 'd12.fence.look', kind: 'narration', text: 'A plain fence where the gate stood in the blizzard, and a sign-post with nothing on it. The track round the mountain runs on, north and west.', authored: true },
  // the ranch
  { id: 'd12.ranch.gates', src: 'L12.06', next: 'd12.ranch.path' },
  { id: 'd12.ranch.path', src: 'L12.07' },
  // beat 3: the bell
  { id: 'd12.bell.rang', src: 'L12.08' },
  { id: 'd12.breaker.looks', src: 'L12.09', next: 'd12.breaker.ryu' },
  { id: 'd12.breaker.ryu', src: 'L12.10', next: 'd12.breaker.tipped' },
  { id: 'd12.breaker.tipped', src: 'L12.11', cue: 'tip', next: 'd12.breaker.howdy' },
  { id: 'd12.breaker.howdy', speaker: 'breaker', src: 'L12.12' },
  { id: 'd12.bargain.arranged', src: 'L12.13', next: 'd12.hand.offer' },
  {
    id: 'd12.hand.offer',
    kind: 'narration',
    text: 'He offers his hand.',
    authored: true,
    choices: [
      { label: 'Kiss him on the cheek', authored: true, silent: true, value: 'kiss', set: { kissedCheek: true }, next: 'd12.hand.kissed' },
      { label: 'Shake his hand', authored: true, silent: true, value: 'shake', set: { kissedCheek: false }, next: 'd12.hand.shook' },
    ],
  },
  { id: 'd12.hand.kissed', src: 'L12.14', next: 'd12.breaker.price' },
  { id: 'd12.breaker.price', speaker: 'breaker', src: 'L12.15', next: 'd12.emily.miss' },
  { id: 'd12.hand.shook', kind: 'narration', text: 'She shook it.', authored: true, next: 'd12.emily.miss' },
  { id: 'd12.emily.miss', speaker: 'emily', portrait: 'emily-soft', src: 'L12.16', next: 'd12.breaker.blush' },
  { id: 'd12.breaker.blush', speaker: 'breaker', src: 'L12.17', next: 'd12.emily.ask' },
  {
    id: 'd12.emily.ask',
    speaker: 'emily',
    choices: [
      { src: 'L12.18', value: 'iliad', set: { askedIliad: true }, next: 'd12.breaker.iliad' },
      { label: 'Say goodbye', authored: true, silent: true, value: 'bye', set: { askedIliad: false }, next: 'd12.emily.good' },
    ],
  },
  { id: 'd12.breaker.iliad', speaker: 'breaker', src: 'L12.19', next: 'd12.breaker.hat' },
  { id: 'd12.breaker.hat', src: 'L12.20', cue: 'hat-off' },
  // (L12.21, the recitation, is typed by recite())
  { id: 'd12.breaker.bowed', src: 'L12.22', cue: 'bow', next: 'd12.emily.good' },
  { id: 'd12.emily.good', speaker: 'emily', src: 'L12.23', next: 'd12.breaker.bye' },
  { id: 'd12.breaker.bye', speaker: 'breaker', src: 'L12.24' },
  { id: 'd12.pixel.shod', kind: 'narration', text: 'Pixel’s new shoes ring on the stone path.', authored: true },
];

// The bargain (authored, short): three materials, and one round of haggling.
export const shoeTiers = [
  { id: 'iron', label: 'Plain iron', price: 6 },
  { id: 'steel', label: 'Steel, with calks for ice', price: 12 },
  { id: 'silver', label: 'Silver nails, for show', price: 30 },
];
export const haggled = (price) => Math.max(1, Math.round((price * 2) / 3));
const tierPhrase = { iron: 'plain iron', steel: 'steel with calks for the ice', silver: 'silver nails', spare: 'plain iron' };

// Emily rides here; she gets down at the house.
const ridesOn = (state, mapId) => Boolean(state.flags.boughtHorse) && (mapId === 'undiscovered' || (mapId === 'ranch' && !state.marks.dismounted));

export function goalDay12(state) {
  const { flags, marks } = state;
  if (flags.shod) return 'Ride home.';
  if (state.map === 'ranch') return marks.dismounted ? 'Speak with him.' : 'Ride up the stone path to the house and ring the bell.';
  if (flags.foundRanch) return 'The ranch gate is at the far east, at the end of the long loop south.';
  return marks.sawMap ? 'Find the ranch gate. The roads double back.' : 'Find the ranch. Press M for the larger map.';
}

// ---------------------------------------------------------------- DOM (live only)
function ensureCss() {
  if (document.querySelector('link[data-day="12"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'game/css/day12.css';
  link.dataset.day = '12';
  document.head.append(link);
}

// The larger map, as a canvas: bigMap's coarse rows expanded through their patterns, with the
// known places lettered. Undiscovered Friendship stays blank paper.
function bigMapCanvas() {
  const { cell, scale, rows, patterns, labels } = bigMap;
  const twice = (line) => [...line].map((ch) => ch.repeat(scale)).join('');
  const pixels = rows.flatMap((row) => Array.from({ length: cell * scale }, (_, py) => twice([...row].map((code) => patterns[code][Math.floor(py / scale)]).join(''))));
  const grid = pixels.map((line) => [...line]);
  for (const { text, x, y, ink } of labels) {
    textGrid(text, ink).forEach((line, dy) => [...line].forEach((ch, dx) => { if (ch !== '.' && grid[y + dy]?.[x + dx]) grid[y + dy][x + dx] = ch; }));
  }
  const art = rasterize(grid.map((line) => line.join('')), 'day12 big map');
  const canvas = document.createElement('canvas');
  canvas.width = art.width;
  canvas.height = art.height;
  canvas.getContext('2d').putImageData(new ImageData(art.data, art.width, art.height), 0, 0);
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'The larger map of Friendship: the town, the Foglands road, Upper Foglands and the vineyard. The east is blank.');
  return canvas;
}

function panel(className, title, { heading = true } = {}) {
  ensureCss();
  const root = document.createElement('section');
  root.className = `panel ${className}`;
  root.setAttribute('aria-label', title);
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = title;
    root.append(h2);
  }
  document.getElementById('frame').append(root);
  return root;
}

// Resolves when M, Esc, Enter or the Close button closes it.
function showBigMap(mapId) {
  const root = panel('d12-map', 'The larger map', { heading: false });
  const frame = document.createElement('div');
  frame.className = 'd12-map-frame';
  frame.append(bigMapCanvas());
  const at = bigMap.here[mapId];
  if (at) {
    const here = document.createElement('span');
    here.className = 'd12-here';
    here.style.left = `${(at[0] / 256) * 100}%`;
    here.style.top = `${(at[1] / 144) * 100}%`;
    here.title = 'You are here';
    frame.append(here);
  }
  const hint = document.createElement('p');
  hint.className = 'panel-hint';
  hint.textContent = 'You are the blinking mark · M, Esc or a click closes';
  root.append(frame, hint);
  root.tabIndex = -1;
  root.focus();
  const close = root;
  return new Promise((resolve) => {
    const done = () => {
      removeEventListener('keydown', onKey, true);
      root.remove();
      resolve();
    };
    const onKey = (event) => {
      if (!['KeyM', 'Escape', 'Enter', 'Space'].includes(event.code)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) done();
    };
    addEventListener('keydown', onKey, true);
    close.addEventListener('click', done);
  });
}

// The bargain: three materials at his prices, one round of haggling. Resolves { tier, price, haggled }.
function showBargain(purse) {
  const root = panel('d12-bargain', 'Shodding');
  const intro = document.createElement('p');
  intro.textContent = 'Four shoes for Pixel. Materials and prices:';
  const list = document.createElement('div');
  list.className = 'd12-bargain-rows';
  const note = document.createElement('p');
  note.className = 'd12-bargain-note';
  note.setAttribute('role', 'status');
  const purseLine = document.createElement('p');
  purseLine.textContent = `In your purse: ${purse}`;
  const actions = document.createElement('div');
  actions.className = 'panel-actions';
  const haggle = document.createElement('button');
  haggle.type = 'button';
  haggle.textContent = 'Haggle (H)';
  actions.append(haggle);
  const hint = document.createElement('p');
  hint.className = 'panel-hint';
  hint.textContent = '1–3 or Enter to agree · H to haggle';
  root.append(intro, list, purseLine, note, actions, hint);
  let lowered = false;
  return new Promise((resolve) => {
    const priceOf = (tier) => (lowered ? haggled(tier.price) : tier.price);
    const finish = (result) => {
      removeEventListener('keydown', onKey, true);
      root.remove();
      resolve(result);
    };
    const draw = () => {
      const rows = shoeTiers.map((tier, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerHTML = '<span></span><span class="d12-bargain-price"></span>';
        button.children[0].textContent = `${i + 1}. ${tier.label}`;
        button.children[1].textContent = String(priceOf(tier));
        button.disabled = priceOf(tier) > purse;
        button.addEventListener('click', () => finish({ tier: tier.id, price: priceOf(tier), haggled: lowered }));
        return button;
      });
      if (rows.every((button) => button.disabled)) {
        const spare = document.createElement('button');
        spare.type = 'button';
        spare.innerHTML = '<span>4. All you have, for plain iron</span><span class="d12-bargain-price"></span>';
        spare.children[1].textContent = String(purse);
        spare.addEventListener('click', () => finish({ tier: 'spare', price: purse, haggled: lowered }));
        rows.push(spare);
      }
      list.replaceChildren(...rows);
      haggle.disabled = lowered;
      (rows.find((button) => !button.disabled) ?? haggle).focus();
    };
    const onKey = (event) => {
      const digit = /^(Digit|Numpad)([1-4])$/.exec(event.code);
      if (!digit && event.code !== 'KeyH' && event.code !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.repeat) return;
      if (event.code === 'KeyH') haggle.click();
      if (digit) list.children[Number(digit[2]) - 1]?.click();
    };
    haggle.addEventListener('click', () => {
      if (lowered) return;
      lowered = true;
      note.textContent = 'He scratches his jaw and comes down a little.';
      draw();
    });
    addEventListener('keydown', onKey, true);
    draw();
  });
}

// L12.21 in the dialogue box, typed at recitalSpeed; Space or Enter completes it, then closes.
// S skips it (cut at a dash), as any NPC line may be.
function recite(state, reducedMotion) {
  const root = document.getElementById('dialogue');
  const el = {
    portrait: root.querySelector('.dialogue-portrait'),
    speaker: root.querySelector('.dialogue-speaker'),
    text: root.querySelector('.dialogue-text'),
    choices: root.querySelector('.dialogue-choices'),
    skip: root.querySelector('.dialogue-skip'),
    more: root.querySelector('.dialogue-more'),
    live: root.querySelector('.dialogue-live'),
  };
  const full = bookLines[recitalLine].text;
  root.dataset.kind = 'speech';
  el.speaker.textContent = speakers.breaker.name;
  el.portrait.hidden = false;
  drawPortrait(el.portrait, 'breaker-hatless');
  el.choices.hidden = true;
  el.skip.hidden = false;
  el.more.hidden = true;
  el.live.textContent = `${speakers.breaker.name}: ${full}`;
  root.hidden = false;
  return new Promise((resolve) => {
    let shown = reducedMotion ? full.length : 0;
    let timer = null;
    const typed = () => shown >= full.length;
    const paint = () => { el.text.textContent = full.slice(0, shown); el.more.hidden = !typed(); };
    const tick = () => {
      shown += 1;
      paint();
      if (!typed()) timer = setTimeout(tick, 1000 / recitalSpeed);
    };
    const finish = () => {
      clearTimeout(timer);
      removeEventListener('keydown', onKey, true);
      root.removeEventListener('click', onClick, true);
      el.skip.removeEventListener('click', onSkip, true);
      root.hidden = true;
      el.text.textContent = '';
      resolve();
    };
    const advance = () => {
      if (!typed()) { clearTimeout(timer); shown = full.length; paint(); return; }
      finish();
    };
    const skip = () => {
      clearTimeout(timer);
      if (!typed()) {
        el.text.textContent = `${full.slice(0, shown).trimEnd()}—`;
        state.skips += 1;
        state.skipped[recitalLine] = true;
      }
      setTimeout(finish, 500);
    };
    const onKey = (event) => {
      if (!['Space', 'Enter', 'NumpadEnter', 'KeyS', 'KeyE', 'Escape', 'KeyI'].includes(event.code)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.repeat) return;
      if (event.code === 'KeyS') skip();
      else if (event.code !== 'KeyE' && event.code !== 'Escape' && event.code !== 'KeyI') advance();
    };
    const onClick = (event) => {
      event.stopImmediatePropagation();
      if (event.target === el.skip) return;
      advance();
    };
    const onSkip = (event) => { event.stopImmediatePropagation(); skip(); };
    addEventListener('keydown', onKey, true);
    root.addEventListener('click', onClick, true);
    el.skip.addEventListener('click', onSkip, true);
    paint();
    if (!typed()) timer = setTimeout(tick, 1000 / recitalSpeed);
  });
}

// One M key handler for the page, aimed at whichever Day 12 is running.
let mapKeyTarget = null;
if (live) {
  addEventListener('keydown', (event) => {
    if (event.code !== 'KeyM' || event.repeat || !mapKeyTarget) return;
    const overlay = ['dialogue', 'menu', 'inventory', 'market', 'shop', 'paper', 'day-card', 'day-select', 'text-page', 'howto', 'title', 'go']
      .some((id) => document.getElementById(id)?.hidden === false) || document.querySelector('.d12-bargain, .d12-map');
    if (overlay) return;
    event.preventDefault();
    mapKeyTarget();
  });
}

export function createDay12(ctx) {
  const { state, world, hud } = ctx;
  const { flags, marks } = state;
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  kit.goalOf = () => goalDay12(state);
  let breaker = null;

  // ---------------------------------------------------------------- beat 1
  async function wake() {
    hud.update(state);
    hud.show();
    if (!marks.woke) {
      marks.woke = true;
      if (!ctx.reducedMotion) await world.fade('in', 900);
      await talk('d12.memory.blizzard');
      kit.hint('bigmap', 'Press M for the larger map.', 5200);
    }
  }

  // ---------------------------------------------------------------- beat 2: the map, the roads
  async function openMap() {
    if (live) await showBigMap(state.map);
    if (!marks.sawMap) {
      marks.sawMap = true;
      await talk('d12.map.unmarked');
    }
  }

  async function arrive() {
    if (!marks.sawMap) {
      marks.sawMap = true;
      await talk('d12.map.unmarked');
    }
    flags.foundRanch = true;
    await talk('d12.ranch.gates');
  }

  // ---------------------------------------------------------------- beat 3: the bell
  async function bell() {
    if (flags.shod) return;
    marks.dismounted = true;
    if (flags.boughtHorse) {
      world.setRiding(false);
      world.showPixel(world.map?.marks?.hitch ?? { x: 17, y: 8 }, 'west');
    }
    world.placePlayer('step');
    world.facePlayer('up');
    ctx.sound?.play('blip');
    breaker = world.spawnNpc('breaker', world.map?.marks?.breaker ?? { x: 15, y: 6 }, 'down');
    await talk('d12.bell.rang');
    await talk('d12.breaker.looks', { hour: true });
    flags.metBreaker = true;

    // the bargain
    const deal = live ? await showBargain(state.purse) : { tier: 'steel', price: haggled(12), haggled: true };
    state.purse -= deal.price;
    flags.shoeTier = deal.tier;
    flags.shoePrice = deal.price;
    flags.haggled = deal.haggled;
    hud.update(state);
    kit.give('horseshoes');
    // the arrangement, the hand, and what she asks (the last choice's value)
    const asked = await talk('d12.bargain.arranged');
    if (asked === 'iliad') {
      // (d12.breaker.hat took the hat off)
      if (live) await recite(state, ctx.reducedMotion);
      await talk('d12.breaker.bowed');
    }
    // the shoes go on
    removeItem(state, 'horseshoes');
    flags.shod = true;
    breaker?.pose?.('down-1');
    await world.fade('out', 500);
    breaker?.destroy?.();
    breaker = null;
    if (flags.boughtHorse) {
      world.showPixel(null);
      world.setRiding(true);
    }
    await world.fade('in', 500);
    await talk('d12.pixel.shod');
    await leave();
  }

  async function leave() {
    ctx.ended = true;
    hud.setGoal('');
    if (!ctx.reducedMotion) await world.dusk?.(1800);
    await world.fade('out', 1000);
    hud.hide();
    mapKeyTarget = null;
    await ctx.endDay();
  }

  const api = {
    start: () => beat(wake),
    get busy() {
      return kit.busy;
    },

    // the M key (and the headless route)
    openMap: () => beat(openMap),

    mapBuilt(mapId) {
      mapKeyTarget = () => !ctx.ended && api.openMap();
      world.setRiding(ridesOn(state, mapId));
      if (mapId === 'ranch') {
        state.clock = Math.max(state.clock, 18);
        world.setSky(state.clock);
        if (marks.dismounted && flags.boughtHorse && !flags.shod) world.showPixel(world.map?.marks?.hitch ?? { x: 17, y: 8 }, 'west');
      }
      kit.refreshGoal();
    },

    onTile() {},

    onTrigger(object) {
      if (object.id === 'way-back' && !ctx.ended) hud.toast('Friendship is behind you. The ranch is somewhere ahead.', 2600);
    },

    onExit(exit) {
      return beat(async () => {
        await changeMap(ctx, exit.to, exit.spawn);
        if (exit.to === 'ranch' && !flags.foundRanch) await arrive();
      });
    },

    canInteract(target) {
      if (ctx.ended) return false;
      return target.id === 'bell' ? !flags.shod : target.id === 'old-fence';
    },

    onInteract(target) {
      if (target.id === 'bell') return beat(bell);
      if (target.id === 'old-fence') return beat(() => talk('d12.fence.look'));
      return undefined;
    },

    cue(name) {
      if (!breaker || breaker.gone) return;
      if (name === 'tip') {
        breaker.pose('down-tip');
        setTimeout(() => !breaker?.gone && breaker?.pose('down-1'), 900);
      } else if (name === 'hat-off') {
        breaker.pose('down-hatless');
      } else if (name === 'bow') {
        breaker.pose('down-bow');
        setTimeout(() => !breaker?.gone && breaker?.pose('down-1'), 1100);
      }
    },
  };

  // ---------------------------------------------------------------- headless walk-through
  // The canon route for check-days.mjs: the memory, the map, the gate, the bell (steel, haggled;
  // the kiss; The Iliad), the paper.
  const route = [
    () => api.start(),
    () => api.openMap(),
    () => api.onInteract({ id: 'old-fence', type: 'look' }),
    () => api.onExit({ to: 'ranch', spawn: 'gate' }),
    () => api.onInteract({ id: 'bell', type: 'door' }),
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
// The headline is the ranch's sign in full. Every sentence authored, in the Editor's voice,
// except the last, which is the book's (L12.25).
export const signText = 'BREAKER OF HORSES: GROOMING, SHODDING, HORSE TAMING, AND OTHER SERVICES OF AN EQUESTRIAN NATURE. NO HORSE TOO DIFFICULT.';

export function writeDay12(state) {
  const { flags } = state;
  const horse = flags.horseName || 'Pixel';
  const who = flags.married === false ? 'Miss Emily B. Marks' : 'Mrs. Emily Marks Daedalus';
  const she = flags.married === false ? 'Miss Marks' : 'Mrs. Daedalus';
  const body = [];
  body.push(`A ranch that appears on no map this paper keeps has been found again in Undiscovered Friendship, by ${who} and her azure mare, ${horse}.`);
  body.push(flags.foundRanch
    ? 'She reports anfractuous roads, a great deal of backtracking, a plain fence where she remembered a gate, and the gate itself at last, at sunset, at the far end of a road that seemed to lead nowhere.'
    : 'She reports anfractuous roads and a great deal of backtracking.');
  if (flags.shod) {
    const price = flags.shoePrice ?? 0;
    body.push(`${horse} has been shod, in ${tierPhrase[flags.shoeTier] ?? 'iron'}, for ${price} gold${flags.haggled ? ', after some discussion of materials and prices' : ', at the asking price'}.`);
  } else {
    body.push(`${horse} went unshod.`);
  }
  body.push(flags.kissedCheek
    ? `The proprietor, a gentleman in his sixties in a white hat, reports that ${she} kissed him on the cheek, and that it did not lower the price.`
    : `The proprietor, a gentleman in his sixties in a white hat, reports that they shook hands on it, as is done.`);
  body.push(flags.askedIliad
    ? 'She asked him about a book. He answered at some length, with his hat off, in a voice this paper is told was not his own. The Mirror keeps no copy of the book in question.'
    : 'She asked him nothing further, and he offered nothing further.');
  body.push(bookLines[closingLine].text);
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Autumn · Undiscovered Friendship',
    headline: signText,
    body,
  };
}

// ---------------------------------------------------------------- state
// sawBreaker is Day 8's (Run 5): the ranch passed in the blizzard. reachedEnd and lqStayed are
// Day 11's. They are here with their canon values so Day 12 started on this branch has them; a
// save that already carries them keeps its own (PARALLEL-RULES §4).
export const prerequisites = { reachedEnd: true, lqStayed: true, sawBreaker: true };
export const flags = {
  sawBreaker: true,
  foundRanch: false,
  metBreaker: false,
  kissedCheek: false,
  askedIliad: false,
  shod: false,
  shoeTier: '',
  shoePrice: 0,
  haggled: false,
};

export const speakers = {
  breaker: { name: 'Breaker of Horses', portrait: 'breaker-neutral' },
};

// The book's Day 12: the ranch found, a bargain struck, the kiss, The Iliad, Pixel shod.
export function canonDay12(state) {
  Object.assign(state.flags, { foundRanch: true, metBreaker: true, kissedCheek: true, askedIliad: true, shod: true, shoeTier: 'steel', shoePrice: haggled(12), haggled: true });
  state.purse = Math.max(0, state.purse - haggled(12));
  return state;
}

export function presetDay12() {
  const state = presetDay(12);
  Object.assign(state.flags, prerequisites);
  return state;
}

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 12,
  title: 'Breaker of Horses',
  headline: signText,
  season: 'autumn',
  seasonName: 'Autumn',
  goal: 'Get Pixel shod before you go.',
  start: { map: 'undiscovered', spawn: 'from-road' },
  flags,
  speakers,
  canon: canonDay12,
  nodes,
  skipPoints,
  extraLines: [recitalLine, closingLine, 'L12.18'], // L12.18 is spoken as a choice
  create: createDay12,
  write: writeDay12,
  preset: presetDay12,
};
