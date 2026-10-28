// Day 13, LOCAL MERCHANT’S WILL READ (GAME-PLAN-DAYS §B Day 13), early spring again. Everything
// of this day in one file: its record (`day`, at the end), flags, speakers, canon, nodes, beats,
// the paper (writeDay13) and presetDay13.
//
// Emily finds the Editor outside the Mirror. Sam's Ceremonies (Divorce, Will, Funeral): only the
// Will can be chosen. In Bequests she leaves the farm, the store, and Pixel with the glass horse
// to Alabaster Brown or Dr. Daedalus (the book: farm and store to Alabaster, Pixel to Daedalus).
// In the square, before Alabaster, Daedalus (one sleeve empty), Pixel and the town, the Editor
// reads the will in six parts, with the names as she chose. The Mirror prints it. Then the
// cemetery: her headstone, four seconds of it, the crocus through the frost (Day 1's), and the
// closing card. Every day is open from Day select after that; Text & source lists every line.
//
// Unlike the other days this one does not end with the paper and a next morning (there is no
// Day 14): it shows its own paper after the reading and ends on its own card. Only headless
// (check-days.mjs) does it call ctx.endDay(), so the check can read the paper.
//
// Node ids: d13.<speaker>.<topic>. Lines quoted from the book are `src` (L13.xx in lines.js).
import { changeMap } from '../transitions.js';
import { createDayKit } from './common.js';
import { presetDay } from './preset.js';
import { createNewspaper } from '../newspaper.js';
import { unlockDay } from '../state.js';
import { lines as bookLines } from './lines/day13.js';

const live = typeof document !== 'undefined'; // false in check-days.mjs (no Phaser, no DOM)

export const skipPoints = [];
export const stoneLines = ['L13.14', 'L13.15', 'L13.16']; // shown on the headstone card
export const stoneHold = 4000; // ms the headstone stays (GAME-PLAN-DAYS §B Day 13 beat 4)

// ---------------------------------------------------------------- the will
// Who gets what: 'alabaster' or 'daedalus', for the farm, the store, and Pixel with the glass horse.
export const canonBequests = { farm: 'alabaster', store: 'alabaster', pixel: 'daedalus' };
const code = (b) => ['farm', 'store', 'pixel'].map((k) => b[k][0]).join(''); // e.g. 'aad'
export const isCanon = (b) => code(b) === code(canonBequests);

// The bequest sentence for any division, in the book's own form ("To my friend, Alabaster Brown,
// I bequeath …. To my wife, Dr. Daedalus, I leave …."). The book's division is L13.07 itself.
export function bequestText(b) {
  const phrase = (who) => {
    const farm = b.farm === who;
    const store = b.store === who;
    const property = farm && store ? 'my farm, my store, and both their contents' : farm ? 'my farm and its contents' : store ? 'my store and its contents' : '';
    const horse = b.pixel === who ? 'my horse, Pixel, and the glass simulacrum of same' : '';
    return [property, horse].filter(Boolean).join(', as well as ');
  };
  const out = [];
  const toAlabaster = phrase('alabaster');
  const toDaedalus = phrase('daedalus');
  if (toAlabaster) out.push(`To my friend, Alabaster Brown, I bequeath ${toAlabaster}.`);
  if (toDaedalus) out.push(`To my wife, Dr. Daedalus, I leave ${toDaedalus}.`);
  return out.join(' ');
}

export const bequestNodeId = (b) => (isCanon(b) ? 'd13.will.bequest' : `d13.will.bequest-${code(b)}`);
const allDivisions = [];
for (const farm of ['alabaster', 'daedalus']) for (const store of ['alabaster', 'daedalus']) for (const pixel of ['alabaster', 'daedalus']) allDivisions.push({ farm, store, pixel });

export const nodes = [
  // beat 1: the Editor, and Sam's ceremonies
  { id: 'd13.sam.leave', src: 'L13.01', next: 'd13.sam.healthier' },
  { id: 'd13.sam.healthier', src: 'L13.02', next: 'd13.sam.ceremonies' },
  { id: 'd13.sam.ceremonies', src: 'L13.03', next: 'd13.editor.ceremony' },
  { id: 'd13.editor.ceremony', speaker: 'editor', text: 'A ceremony, then. The Mirror keeps the book of them.', authored: true },
  { id: 'd13.editor.again', speaker: 'editor', text: 'The book of ceremonies is open whenever you are ready.', authored: true },
  { id: 'd13.mirror.door', kind: 'narration', text: 'The Editor is out front.', authored: true },
  // beat 3: the reading, in six parts
  { id: 'd13.will.read', src: 'L13.04', next: 'd13.will.son' },
  { id: 'd13.will.son', speaker: 'editor', src: 'L13.05', next: 'd13.will.avatar' },
  { id: 'd13.will.avatar', speaker: 'editor', src: 'L13.06' },
  { id: 'd13.will.bequest', speaker: 'editor', src: 'L13.07' },
  ...allDivisions.filter((b) => !isCanon(b)).map((b) => ({ id: `d13.will.bequest-${code(b)}`, speaker: 'editor', text: bequestText(b), authored: true })),
  { id: 'd13.will.regret', speaker: 'editor', src: 'L13.08', next: 'd13.will.deceit' },
  { id: 'd13.will.deceit', speaker: 'editor', src: 'L13.09', next: 'd13.will.gentle' },
  { id: 'd13.will.gentle', speaker: 'editor', src: 'L13.10', next: 'd13.will.folded' },
  { id: 'd13.will.folded', src: 'L13.11', next: 'd13.editor.riddles' },
  { id: 'd13.editor.riddles', speaker: 'editor', portrait: 'editor-keen', src: 'L13.12' },
  // beat 4: the cemetery
  { id: 'd13.stone.placed', src: 'L13.13' },
];

export const ceremonies = [
  { id: 'divorce', label: 'Divorce', note: 'Not that. She is not leaving Dr. Daedalus. She is leaving Friendship.' },
  { id: 'will', label: 'Will', note: 'Leave what she has, and say what she wishes to say.' },
  { id: 'funeral', label: 'Funeral', note: 'A funeral is for the ones left behind to hold. It is not hers to plan.' },
];

export function goalDay13(state) {
  const { flags, marks } = state;
  if (flags.chapterComplete) return '';
  if (state.map === 'cemetery') return marks.sawStone ? '' : 'Walk up the path to the new headstone.';
  if (flags.willWritten) return '';
  return 'Set your affairs in order. The Editor is outside the Mirror.';
}

// ---------------------------------------------------------------- DOM (live only)
function ensureCss() {
  if (document.querySelector('link[data-day="13"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'game/css/day13.css';
  link.dataset.day = '13';
  document.head.append(link);
}

function panel(className, title) {
  ensureCss();
  const root = document.createElement('section');
  root.className = `panel ${className}`;
  root.setAttribute('aria-label', title);
  const heading = document.createElement('h2');
  heading.textContent = title;
  root.append(heading);
  document.getElementById('frame').append(root);
  return root;
}

const make = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
};

// Sam's Ceremonies. Resolves 'will', or null on Esc. Divorce and Funeral only say why not.
function showCeremonies() {
  const root = panel('d13-ceremonies', 'Ceremonies');
  const intro = make('p', '', 'Friendship records three:');
  const list = make('div', 'd13-list');
  const note = make('p', 'd13-note');
  note.setAttribute('role', 'status');
  const hint = make('p', 'panel-hint', '↑↓ choose · Enter · Esc leaves');
  root.append(intro, list, note, hint);
  return new Promise((resolve) => {
    const finish = (value) => {
      removeEventListener('keydown', onKey, true);
      root.remove();
      resolve(value);
    };
    const buttons = ceremonies.map((ceremony, i) => {
      const button = make('button', '', `${i + 1}. ${ceremony.label}`);
      button.type = 'button';
      if (ceremony.id !== 'will') button.setAttribute('aria-disabled', 'true');
      const explain = () => { note.textContent = ceremony.note; };
      button.addEventListener('focus', explain);
      button.addEventListener('mouseenter', explain);
      button.addEventListener('click', () => (ceremony.id === 'will' ? finish('will') : explain()));
      list.append(button);
      return button;
    });
    const onKey = (event) => {
      const at = buttons.indexOf(document.activeElement);
      let handled = true;
      if (event.code === 'ArrowDown') buttons[(at + 1) % buttons.length].focus();
      else if (event.code === 'ArrowUp') buttons[(at + buttons.length - 1) % buttons.length].focus();
      else if (/^(Digit|Numpad)[1-3]$/.test(event.code)) buttons[Number(event.code.slice(-1)) - 1].click();
      else if (event.code === 'Escape') finish(null);
      else if (event.code === 'Enter' || event.code === 'Space') { if (!event.repeat) buttons[Math.max(0, at)].click(); }
      else handled = false;
      if (handled) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    addEventListener('keydown', onKey, true);
    buttons[1].focus();
  });
}

// Bequests: each of three things to Alabaster or Daedalus, the book's division first.
// Resolves the division, or null on Esc.
function showBequests(state) {
  const root = panel('d13-bequests', 'Bequests');
  const horse = state.flags.horseName || 'Pixel';
  const things = [
    { key: 'farm', label: 'Myre Farm, and its contents' },
    { key: 'store', label: `${state.store?.name || 'Friendship Books'}, and its contents` },
    { key: 'pixel', label: `${horse}, and the glass horse` },
  ];
  const heirs = [['alabaster', 'Alabaster Brown'], ['daedalus', 'Dr. Daedalus']];
  const choice = { ...canonBequests };
  const rows = things.map((thing) => {
    const row = make('div', 'd13-row');
    row.append(make('span', 'd13-row-name', thing.label));
    const buttons = heirs.map(([who, name]) => {
      const button = make('button', '', name);
      button.type = 'button';
      button.addEventListener('click', () => { choice[thing.key] = who; current = rows.findIndex((r) => r.thing === thing); draw(); });
      row.append(button);
      return { who, button };
    });
    return { thing, row, buttons };
  });
  let current = 0;
  const actions = make('div', 'panel-actions');
  const sign = make('button', '', 'Sign the will');
  sign.type = 'button';
  actions.append(sign);
  const hint = make('p', 'panel-hint', '↑↓ choose a bequest · ←→ choose who · Enter signs · Esc leaves');
  root.append(...rows.map((r) => r.row), actions, hint);
  function draw() {
    rows.forEach((r, i) => {
      r.row.classList.toggle('is-current', i === current);
      r.buttons.forEach(({ who, button }) => button.setAttribute('aria-pressed', String(choice[r.thing.key] === who)));
    });
  }
  draw();
  sign.focus();
  return new Promise((resolve) => {
    const finish = (value) => {
      removeEventListener('keydown', onKey, true);
      root.remove();
      resolve(value);
    };
    sign.addEventListener('click', () => finish({ ...choice }));
    const onKey = (event) => {
      let handled = true;
      if (event.code === 'ArrowDown') current = (current + 1) % rows.length;
      else if (event.code === 'ArrowUp') current = (current + rows.length - 1) % rows.length;
      else if (event.code === 'ArrowLeft') choice[rows[current].thing.key] = 'alabaster';
      else if (event.code === 'ArrowRight') choice[rows[current].thing.key] = 'daedalus';
      else if (event.code === 'Escape') return finish(null);
      else if (event.code === 'Enter' || event.code === 'Space') {
        if (!event.repeat && (document.activeElement === sign || !root.contains(document.activeElement))) sign.click();
        else if (!event.repeat) document.activeElement.click();
      } else handled = false;
      if (handled) { event.preventDefault(); event.stopImmediatePropagation(); draw(); }
      return undefined;
    };
    addEventListener('keydown', onKey, true);
  });
}

// The Mirror's page for the reading (main.js's paper element, with the button saying "Go on").
async function showPaper(paper) {
  const root = document.getElementById('paper');
  const button = root.querySelector('.paper-sleep');
  const label = button.textContent;
  button.textContent = 'Go on';
  await createNewspaper(root).show(paper);
  button.textContent = label;
}

// The headstone, full screen, held; then it fades. Keys do nothing while it stands.
function showStone(hold) {
  ensureCss();
  const root = make('section', 'd13-stone');
  root.setAttribute('aria-label', 'Headstone');
  const face = make('div', 'd13-stone-face');
  face.setAttribute('aria-live', 'polite');
  for (const id of stoneLines) face.append(make('p', '', bookLines[id].text));
  root.append(face);
  document.getElementById('frame').append(root);
  return new Promise((resolve) => {
    setTimeout(() => {
      root.classList.add('is-leaving');
      setTimeout(() => { root.remove(); resolve(); }, 900);
    }, hold);
  });
}

// The closing card (authored). Stays until one of its buttons is used.
function showEnding() {
  const root = panel('d13-ending', 'Pioneers');
  root.append(make('p', 'd13-ends', 'The chapter ends.'), make('p', '', 'Return to any day, or leave the world here.'));
  const actions = make('div', 'panel-actions');
  const buttons = [['days', 'Day select'], ['text', 'Text & source'], ['leave', 'Leave the world here']].map(([value, label]) => {
    const button = make('button', '', label);
    button.type = 'button';
    button.dataset.value = value;
    actions.append(button);
    return button;
  });
  root.append(actions);
  buttons[0].focus();
  const title = document.getElementById('title');
  return new Promise((resolve) => {
    buttons[0].addEventListener('click', () => {
      root.remove();
      title.hidden = false;
      document.getElementById('day-select-open').click();
      resolve('days');
    });
    buttons[1].addEventListener('click', () => document.getElementById('text-source').click());
    buttons[2].addEventListener('click', () => {
      root.remove();
      resolve('leave');
      location.reload();
    });
  });
}

export function createDay13(ctx) {
  const { state, world, hud } = ctx;
  const { flags, marks } = state;
  const kit = createDayKit(ctx);
  const { beat, talk } = kit;
  kit.goalOf = () => goalDay13(state);
  const editorStand = { x: 16, y: 12 };

  // ---------------------------------------------------------------- beat 1
  async function wake() {
    hud.update(state);
    if (flags.chapterComplete) {
      await ending();
      return;
    }
    hud.show();
    if (!marks.woke) {
      marks.woke = true;
      if (!ctx.reducedMotion) await world.fade('in', 900);
      kit.hint('will13', 'The Editor is outside the Mirror, at the west end of the street.', 5200);
    }
  }

  async function ceremony() {
    if (!marks.heardSam) {
      marks.heardSam = true;
      await talk('d13.sam.leave');
    } else {
      await talk('d13.editor.again');
    }
    const picked = live ? await showCeremonies() : 'will';
    if (picked !== 'will') return;
    const division = live ? await showBequests(state) : { ...canonBequests };
    if (!division) return;
    flags.bequests = division;
    flags.willWritten = true;
    await reading();
  }

  // ---------------------------------------------------------------- beat 3: the square
  async function reading() {
    await world.fade('out', 700);
    world.setPlayerVisible?.(false);
    world.spawnNpc('editor', { x: 22, y: 15 }, 'right');
    world.spawnNpc('alabaster', { x: 27, y: 14 }, 'left');
    world.spawnNpc('daedalus-onehand', { x: 27, y: 16 }, 'left');
    if (flags.boughtHorse) world.showPixel({ x: 28, y: 12 }, 'west');
    if (live && world.cameras) {
      const camera = world.cameras.main;
      camera.stopFollow();
      camera.centerOn(25 * 16, 15 * 16);
    }
    await world.fade('in', 700);
    await talk('d13.will.read');
    await talk(bequestNodeId(flags.bequests));
    await talk('d13.will.regret');
    if (live) await showPaper(writeDay13(state));
    // the cemetery, north of town in the trees
    state.clock = 7;
    await changeMap(ctx, 'cemetery', 'gate');
    world.setPlayerVisible?.(true);
    if (live) world.player.sprite.setAlpha(0.6); // she has left; only the visit is left
    ctx.save?.();
  }

  // ---------------------------------------------------------------- beat 4: the stone
  async function stone() {
    if (marks.sawStone) return;
    marks.sawStone = true;
    world.facePlayer('up');
    await talk('d13.stone.placed');
    hud.setGoal('');
    if (live) await showStone(stoneHold);
    world.setPlayerVisible?.(false); // she has gone; the stone and the crocus are left
    // the crocus through the frost, as on the first morning
    const map = world.map;
    if (live && world.cameras) {
      await world.lookAt(map.marks.stone, { zoom: 2 });
      for (const at of map.marks.crocus) {
        world.setGroundTile(at.x, at.y, 'crocus-sprout');
        await new Promise((resolve) => setTimeout(resolve, ctx.reducedMotion ? 60 : 380));
      }
      for (const at of map.marks.crocus) {
        world.setGroundTile(at.x, at.y, 'crocus-grass');
        await new Promise((resolve) => setTimeout(resolve, ctx.reducedMotion ? 60 : 300));
      }
      await new Promise((resolve) => setTimeout(resolve, 1600));
    }
    flags.chapterComplete = true;
    unlockDay(13);
    ctx.save?.();
    await ending();
  }

  async function ending() {
    ctx.ended = true;
    hud.setGoal('');
    hud.hide();
    if (live) await showEnding();
    else await ctx.endDay(); // check-days.mjs collects the paper here; the game showed it after the reading
  }

  const api = {
    start: () => beat(wake),
    get busy() {
      return kit.busy;
    },

    mapBuilt(mapId) {
      world.setRiding(false);
      if (mapId === 'friendship' && !flags.willWritten) world.spawnNpc('editor', editorStand, 'down');
      kit.refreshGoal();
    },

    onTile() {},
    onTrigger() {},
    onExit() {
      return undefined;
    },

    canInteract(target) {
      if (ctx.ended) return false;
      if (target.npc === 'editor') return !flags.willWritten;
      return target.id === 'emily-stone' ? !marks.sawStone : target.id === 'mirror-door';
    },

    onInteract(target) {
      if (target.npc === 'editor' && !flags.willWritten) return beat(ceremony);
      if (target.id === 'emily-stone') return beat(stone);
      if (target.id === 'mirror-door') return beat(() => talk('d13.mirror.door'));
      return undefined;
    },
  };

  // ---------------------------------------------------------------- headless walk-through
  // The canon route for check-days.mjs: the Editor, the Will with the book's division, the
  // reading, the stone (and the paper, which the game shows right after the reading).
  const route = [
    () => api.start(),
    () => api.onInteract({ npc: 'editor' }),
    () => api.onInteract({ id: 'emily-stone', type: 'stone' }),
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
// LOCAL MERCHANT’S WILL READ. Every sentence authored, in the Editor's voice.
const heirName = { alabaster: 'Alabaster Brown', daedalus: 'Dr. Daedalus' };
export function writeDay13(state) {
  const { flags } = state;
  const b = flags.bequests ?? canonBequests;
  const horse = flags.horseName || 'Pixel';
  const who = flags.married === false ? 'Miss Emily B. Marks' : 'Mrs. Emily Marks Daedalus';
  const body = [];
  if (!flags.willWritten) {
    body.push(`${who}, of Myre Farm and Friendship Books, has not been seen in town this spring.`);
    body.push('No will has been lodged with this paper. The Mirror keeps the book of ceremonies, and the book is open.');
    body.push('Her farm and her store stand as she left them. Her mare is fed by whoever passes.');
  } else {
    body.push(`The will of ${who}, of Myre Farm and Friendship Books, was read in the town square this morning by the Editor of this paper.`);
    const gets = (who2) => [b.farm === who2 && 'the farm', b.store === who2 && 'the store', b.pixel === who2 && `${horse}, the azure mare, with a glass likeness of her`].filter(Boolean);
    const lines = ['alabaster', 'daedalus'].map((heir) => {
      const list = gets(heir);
      if (!list.length) return '';
      const named = list.length === 1 ? list[0] : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`;
      return `${named.charAt(0).toUpperCase()}${named.slice(1)} ${list.length === 1 ? 'goes' : 'go'} to ${heirName[heir]}.`;
    }).filter(Boolean);
    body.push(lines.join(' '));
    body.push('The deceased cites a severe intestinal distress, and the absence of her son, who has swum out to seek the end of the sea.');
    body.push('Dr. Daedalus and Alabaster Brown attended. Neither would speak to this paper. The mare stood quietly through the whole of it.');
    body.push('A headstone is to be placed in Friendship Cemetery, north of town in the trees.');
  }
  body.push('Friendship thanks her for her custom, her store, and her rocks.');
  return {
    masthead: 'THE FRIENDSHIP MIRROR',
    date: 'Early spring · The last edition of her story',
    headline: 'LOCAL MERCHANT’S WILL READ',
    body,
  };
}

// ---------------------------------------------------------------- state
// shod and foundRanch are Day 12's, here with their canon values so Day 13 started on this
// branch has them; a save that already carries them keeps its own (PARALLEL-RULES §4).
export const prerequisites = { shod: true, foundRanch: true };
export const flags = {
  willWritten: false,
  bequests: { ...canonBequests },
  chapterComplete: false,
};

export const speakers = {};

// The book's Day 13. (Nothing comes after it; the canon is here for completeness.)
export function canonDay13(state) {
  Object.assign(state.flags, { willWritten: true, bequests: { ...canonBequests }, chapterComplete: true });
  return state;
}

export function presetDay13() {
  const state = presetDay(13);
  Object.assign(state.flags, prerequisites);
  return state;
}

// ---------------------------------------------------------------- the registry's record
export const day = {
  n: 13,
  title: 'The will',
  headline: 'LOCAL MERCHANT’S WILL READ',
  season: 'spring',
  seasonName: 'Early spring',
  goal: 'Set your affairs in order.',
  start: { map: 'friendship', spawn: 'from-east' },
  flags,
  speakers,
  canon: canonDay13,
  nodes,
  skipPoints,
  extraLines: stoneLines,
  create: createDay13,
  write: writeDay13,
  preset: presetDay13,
};
