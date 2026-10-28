// DOM dialogue runner (GAME-PLAN §7): portrait, speaker, typewriter text, Skip, choices.
// Keys while open: Space/Enter advance (first press completes the line), S skips an NPC
// line, 1–4 pick a choice. Esc does nothing here. Phaser never sees these keys.
import { rasterize } from '../art/palette.js';
import { portraits } from '../art/index.js';

// Day 1's speakers; each later day adds its own (`speakers` in game/script/dayNN.js).
export const speakerNames = { emily: 'Emily', editor: 'The Editor', daedalus: 'Dr. Daedalus' };
const defaultPortrait = { emily: 'emily-neutral', editor: 'editor-neutral', daedalus: 'daedalus-neutral' };
const charsPerSecond = 40;
// Everyone but Emily can be Skipped (GAME-PLAN §6).
const npcSpeakers = new Set(['editor', 'daedalus']);

// { key: { name, portrait?, skippable? } } from a day module.
export function addSpeakers(list = {}) {
  for (const [key, speaker] of Object.entries(list)) {
    speakerNames[key] = speaker.name;
    if (speaker.portrait) defaultPortrait[key] = speaker.portrait;
    if (speaker.skippable !== false && key !== 'emily') npcSpeakers.add(key);
  }
}
const genericSkip = { id: 'skip', speaker: 'emily', portrait: 'emily-firm', text: 'Skip.', authored: true };

// Portraits are shown as <img> from a data URL, not as a live canvas: Chromium composited
// the 96×96 portrait canvas a second time, as a transparent hole at the top left.
const portraitUrls = new Map();
export function portraitUrl(id) {
  if (!portraitUrls.has(id)) {
    const art = rasterize(portraits[id], `portrait ${id}`, 48, 48);
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    canvas.getContext('2d', { willReadFrequently: true }).putImageData(new ImageData(art.data, 48, 48), 0, 0);
    portraitUrls.set(id, canvas.toDataURL('image/png'));
  }
  return portraitUrls.get(id);
}

export function drawPortrait(img, id) {
  const url = portraitUrl(id);
  if (img.getAttribute('src') !== url) img.src = url;
}

// Text for a node or choice: an original line (src) or an authored connective line.
export function lineText(entry, lines, state) {
  const text = entry.src ? lines[entry.src].text : entry.text ?? entry.label;
  return text.replace(/Pixel/g, state?.flags?.horseName || 'Pixel');
}

export function createDialogue({ root, captionRoot, lines, getState, reducedMotion = false, hooks = {} }) {
  const el = {
    portrait: root.querySelector('.dialogue-portrait'),
    speaker: root.querySelector('.dialogue-speaker'),
    text: root.querySelector('.dialogue-text'),
    choices: root.querySelector('.dialogue-choices'),
    skip: root.querySelector('.dialogue-skip'),
    more: root.querySelector('.dialogue-more'),
    live: root.querySelector('.dialogue-live'),
  };
  let nodes = new Map();
  let pending = null; // resolver for the current wait
  let typing = null; // { full, shown, timer, resolve }
  let isOpen = false;

  function setNodes(list) {
    nodes = new Map(list.map((node) => [node.id, node]));
  }

  function settle(value) {
    const resolve = pending;
    pending = null;
    resolve?.(value);
  }

  // Types `full` after `prefix` (already on screen; the poem keeps earlier lines).
  function typeText(full, prefix = '') {
    el.text.textContent = prefix;
    el.more.hidden = true;
    if (reducedMotion) {
      el.text.textContent = prefix + full;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      typing = { full, prefix, shown: 0, resolve };
      const step = () => {
        if (!typing) return;
        typing.shown += 1;
        el.text.textContent = prefix + full.slice(0, typing.shown);
        if (typing.shown >= full.length) finishTyping();
        else typing.timer = setTimeout(step, 1000 / charsPerSecond);
      };
      typing.timer = setTimeout(step, 1000 / charsPerSecond);
    });
  }

  function finishTyping(cutAt) {
    if (!typing) return;
    clearTimeout(typing.timer);
    const { full, prefix, resolve } = typing;
    // A skip mid-line cuts the speaker off with a dash, unless the line already ends at one.
    el.text.textContent = prefix + (cutAt === undefined || full.endsWith('—') ? full : `${full.slice(0, cutAt).trimEnd()}—`);
    typing = null;
    resolve();
  }

  function present(entry) {
    const speaker = entry.speaker ?? (entry.src ? lines[entry.src].speaker : undefined);
    const kind = entry.kind ?? (entry.src ? lines[entry.src].kind : undefined) ?? (speaker ? 'speech' : 'narration');
    root.dataset.kind = kind;
    el.speaker.textContent = speaker ? speakerNames[speaker] : '';
    const wanted = speaker ? entry.portrait ?? defaultPortrait[speaker] : null;
    const portrait = wanted && portraits[wanted] ? wanted : null;
    el.portrait.hidden = !portrait;
    if (portrait) drawPortrait(el.portrait, portrait);
    el.choices.replaceChildren();
    el.choices.hidden = true;
    const skippable = npcSpeakers.has(speaker) && entry.skippable !== false && !entry.choices;
    el.skip.hidden = !skippable;
    return { speaker, skippable };
  }

  // Resolves with the next input: 'advance', 'skip' or { choice }.
  function wait() {
    return new Promise((resolve) => {
      pending = resolve;
    });
  }

  async function sayLine(entry) {
    const info = present(entry);
    hooks.line?.(entry, info);
    const full = lineText(entry, lines, getState());
    // Screen readers get the whole line once, not every typed character.
    el.live.textContent = info.speaker ? `${speakerNames[info.speaker]}: ${full}` : full;
    const typed = typeText(full);
    // During typing: advance completes the line, skip cuts it.
    while (typing) {
      const input = await Promise.race([typed.then(() => 'typed'), wait()]);
      if (input === 'typed') break;
      if (input === 'advance') finishTyping();
      if (input === 'skip' && info.skippable) {
        finishTyping(typing?.shown ?? 0);
        return 'skip';
      }
    }
    el.more.hidden = false;
    for (;;) {
      const input = await wait();
      if (input === 'advance') return 'advance';
      if (input === 'skip' && info.skippable) return 'skip';
    }
  }

  async function show(node) {
    const state = getState();
    if (node.set) Object.assign(state.flags, node.set);
    if (node.cue) await hooks.cue?.(node.cue, node);
    if (node.choices) {
      present(node);
      // A choice node may carry a prompt line above the buttons.
      el.text.textContent = node.text || node.src ? lineText(node, lines, state) : '';
      el.more.hidden = true;
      el.choices.hidden = false;
      node.choices.forEach((choice, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${i + 1}. ${lineText(choice, lines, state)}`;
        button.addEventListener('click', () => settle({ choice: i }));
        el.choices.append(button);
      });
      let picked;
      while (picked === undefined) {
        const input = await wait();
        if (input?.choice !== undefined && node.choices[input.choice]) picked = node.choices[input.choice];
      }
      if (picked.set) Object.assign(state.flags, picked.set);
      hooks.sound?.('blip');
      if (picked.value !== undefined) lastValue = picked.value;
      // A menu choice ("Give a gift", "Rest") is picked, not said aloud.
      if (!picked.silent) await sayLine({ ...picked, speaker: node.speaker, portrait: picked.portrait ?? node.portrait });
      return picked.next;
    }
    const result = await sayLine(node);
    if (result === 'skip') {
      state.skips += 1;
      state.skipped[node.src ?? node.id] = true;
      hooks.skip?.(node);
      if (node.onSkip) return node.onSkip;
      await sayLine(genericSkip);
      return node.next;
    }
    return node.next;
  }

  function open() {
    isOpen = true;
    root.hidden = false;
  }

  function close() {
    isOpen = false;
    root.hidden = true;
    el.text.textContent = '';
  }

  // Runs a conversation from a node id until a node has no `next`. Resolves with the
  // `value` of the last choice picked that carries one (undefined if none).
  let lastValue;
  async function run(startId) {
    open();
    lastValue = undefined;
    try {
      let id = startId;
      while (id) {
        const node = nodes.get(id);
        if (!node) throw new Error(`dialogue: no node '${id}'`);
        id = await show(node);
      }
      return lastValue;
    } finally {
      close();
    }
  }

  // Lines of verse typed one after another in the same box (GAME-PLAN-DAYS §B Day 2 beat 4);
  // Space finishes a line early, and closes the box once the last one is shown.
  async function poem(ids, { pause = 700 } = {}) {
    open();
    try {
      root.dataset.kind = 'poem';
      el.speaker.textContent = '';
      el.portrait.hidden = true;
      el.skip.hidden = true;
      el.choices.hidden = true;
      el.live.textContent = ids.map((id) => lines[id].text).join(' ');
      let shown = '';
      for (const id of ids) {
        const text = lineText({ src: id }, lines, getState());
        const typed = typeText(text, shown);
        while (typing) {
          const input = await Promise.race([typed.then(() => 'typed'), wait()]);
          if (input === 'typed') break;
          if (input === 'advance') finishTyping();
        }
        shown += `${text}\n`;
        if (!reducedMotion) await new Promise((resolve) => setTimeout(resolve, pause));
      }
      el.more.hidden = false;
      while ((await wait()) !== 'advance');
    } finally {
      close();
    }
  }

  // A timed caption: narration over the scene, or big world text ("Welcome, Stranger.").
  function caption(entry, { kind, hold = 2400 } = {}) {
    const text = typeof entry === 'string' ? (lines[entry] ? lines[entry].text : entry) : lineText(entry, lines, getState());
    const resolvedKind = kind ?? (typeof entry === 'string' && lines[entry] ? lines[entry].kind : 'narration');
    captionRoot.textContent = text;
    captionRoot.dataset.kind = resolvedKind;
    captionRoot.hidden = false;
    captionRoot.classList.remove('is-leaving');
    return new Promise((resolve) => {
      setTimeout(() => {
        if (reducedMotion) {
          captionRoot.hidden = true;
          resolve();
          return;
        }
        captionRoot.classList.add('is-leaving');
        setTimeout(() => {
          captionRoot.hidden = true;
          resolve();
        }, 450);
      }, hold);
    });
  }

  function onKey(event) {
    if (!isOpen) return;
    const code = event.code;
    if (event.repeat && (code === 'Space' || code === 'Enter' || code === 'KeyS')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    let handled = true;
    if (code === 'Space' || code === 'Enter' || code === 'NumpadEnter') settle('advance');
    else if (code === 'KeyS') settle('skip');
    else if (/^(Digit|Numpad)[1-4]$/.test(code)) settle({ choice: Number(code.slice(-1)) - 1 });
    else if (code === 'Escape' || code === 'KeyE' || code === 'KeyI') {
      // swallowed: no menu, inventory or interaction while someone is talking
    } else handled = false;
    if (handled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  addEventListener('keydown', onKey, true);
  root.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    settle('advance');
  });
  el.skip.addEventListener('click', (event) => {
    event.stopPropagation();
    settle('skip');
  });

  return {
    setNodes,
    run,
    poem,
    caption,
    get isOpen() {
      return isOpen;
    },
  };
}
