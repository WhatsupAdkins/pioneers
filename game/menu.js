// Esc pause menu, How to play, Text & source, Day select and the day card
// (GAME-PLAN §8–§10, GAME-PLAN-DAYS §A.1, §A.3).
import { speakerNames } from './dialogue.js';

// A small modal: focus moves in on open and back out on close; Esc closes.
function modal(root, { onClose } = {}) {
  let returnFocus = null;
  const api = {
    open() {
      returnFocus = document.activeElement;
      root.hidden = false;
      root.querySelector('button:not(:disabled), [tabindex]')?.focus();
    },
    close() {
      if (root.hidden) return;
      root.hidden = true;
      onClose?.();
      returnFocus?.focus?.();
    },
    get isOpen() {
      return !root.hidden;
    },
  };
  root.addEventListener('keydown', (event) => {
    if (event.code !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    api.close();
  });
  return api;
}

export function createMenu(root, { onResume, onInventory, onHowTo, onText, onSound, onTitle }) {
  const menu = modal(root, { onClose: onResume });
  const sound = root.querySelector('[data-act="sound"]');
  root.querySelector('[data-act="resume"]').addEventListener('click', () => menu.close());
  root.querySelector('[data-act="inventory"]').addEventListener('click', () => { menu.close(); onInventory(); });
  root.querySelector('[data-act="howto"]').addEventListener('click', () => onHowTo());
  root.querySelector('[data-act="text"]').addEventListener('click', () => onText());
  sound.addEventListener('click', async () => {
    const on = await onSound();
    sound.textContent = `Sound: ${on ? 'on' : 'off'}`;
    sound.setAttribute('aria-pressed', String(on));
  });
  root.querySelector('[data-act="title"]').addEventListener('click', () => onTitle());
  return {
    ...menu,
    setSound(on) {
      sound.textContent = `Sound: ${on ? 'on' : 'off'}`;
      sound.setAttribute('aria-pressed', String(on));
    },
  };
}

export function createHowTo(root) {
  const page = modal(root);
  root.querySelector('.howto-close').addEventListener('click', () => page.close());
  return page;
}

// Day 1 quotes lines L01–L29; later days quote L<day>.<n>.
export const lineDay = (id) => (/^L\d\d$/.test(id) ? 1 : Number(id.match(/^L(\d+)\./)?.[1]));

// Every quoted line by day, then the connective lines written for the game.
export function createTextPage(root, { lines, days }) {
  const list = root.querySelector('.text-lines');
  const authored = root.querySelector('.text-authored');
  const page = modal(root);
  root.querySelector('.text-close').addEventListener('click', () => page.close());
  const label = (entry) => (entry.speaker ? speakerNames[entry.speaker] ?? entry.speaker : entry.kind === 'world' ? 'On screen' : 'Narration');
  const heading = (text) => {
    const item = document.createElement('li');
    item.className = 'text-day';
    item.textContent = text;
    return item;
  };
  const built = Object.entries(days).filter(([, day]) => day.create);
  const quoted = [];
  const written = [];
  for (const [n, day] of built) {
    quoted.push(heading(`Day ${n} · ${day.headline}`));
    for (const [id, line] of Object.entries(lines)) {
      if (lineDay(id) !== Number(n)) continue;
      const item = document.createElement('li');
      item.innerHTML = '<span class="text-id"></span><strong></strong><span class="text-line"></span>';
      item.children[0].textContent = id;
      item.children[1].textContent = label(line);
      item.children[2].textContent = line.text;
      quoted.push(item);
    }
    written.push(heading(`Day ${n}`));
    const seen = new Set();
    const add = (entry) => {
      const key = `${entry.speaker}|${entry.text}`;
      if (seen.has(key)) return;
      seen.add(key);
      const item = document.createElement('li');
      item.innerHTML = '<strong></strong><span class="text-line"></span>';
      item.children[0].textContent = label(entry);
      item.children[1].textContent = entry.text;
      written.push(item);
    };
    for (const node of day.nodes) {
      if (node.authored) add({ speaker: node.speaker, kind: node.kind, text: node.text });
      for (const choice of node.choices ?? []) if (choice.authored) add({ speaker: node.speaker, text: choice.label });
    }
  }
  written.push(heading('Every day'));
  written.push((() => {
    const item = document.createElement('li');
    item.innerHTML = '<strong>Emily</strong><span class="text-line">Skip.</span>';
    return item;
  })());
  list.replaceChildren(...quoted);
  authored.replaceChildren(...written);
  return page;
}

// The card between days: "Day 2 · Summer", its title, the book's headline for it and the
// day's aim. Resolves 'begin' or 'back'. A day not built yet only offers Back to title.
export function createDayCard(root) {
  const card = modal(root);
  const over = root.querySelector('.card-over');
  const title = root.querySelector('#card-title');
  const headline = root.querySelector('.card-headline');
  const goal = root.querySelector('.card-goal');
  const note = root.querySelector('.card-note');
  const begin = root.querySelector('.card-begin');
  const back = root.querySelector('.card-back');
  let settle = null;
  const finish = (value) => {
    if (!settle) return;
    const resolve = settle;
    settle = null;
    card.close();
    resolve(value);
  };
  begin.addEventListener('click', () => finish('begin'));
  back.addEventListener('click', () => finish('back'));
  root.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') finish('back');
  });
  return {
    show({ day, info, built }) {
      over.textContent = `Day ${day} · ${info.seasonName}`;
      title.textContent = info.title;
      headline.textContent = info.headline;
      goal.textContent = built ? `Now: ${info.goal}` : '';
      goal.hidden = !built;
      note.hidden = built;
      note.textContent = built ? '' : 'Not yet. This day arrives in a later version; your progress is saved.';
      begin.hidden = !built;
      card.open();
      (built ? begin : back).focus();
      return new Promise((resolve) => { settle = resolve; });
    },
    get isOpen() {
      return card.isOpen;
    },
  };
}

// Day select on the title: every day, unlocked ones enabled (GAME-PLAN-DAYS §A.1).
export function createDaySelect(root, { days, onPick }) {
  const list = root.querySelector('.days-list');
  const page = modal(root);
  root.querySelector('.days-close').addEventListener('click', () => page.close());
  return {
    open(unlocked) {
      list.replaceChildren(...Object.entries(days).map(([n, day]) => {
        const button = document.createElement('button');
        button.type = 'button';
        const day1 = Number(n);
        const open = Boolean(day.create) && day1 <= unlocked;
        button.disabled = !open;
        button.innerHTML = '<span class="days-n"></span><span class="days-title"></span><span class="days-state"></span>';
        button.children[0].textContent = `Day ${n}`;
        button.children[1].textContent = day.title;
        // a day may add a note of its own once reached (Day 6: "Ending A")
        const note = open ? day.selectNote?.() ?? '' : '';
        button.children[2].textContent = !day.create ? 'later version' : day1 > unlocked ? 'locked' : `${day.seasonName}${note ? ` · ${note}` : ''}`;
        button.setAttribute('aria-label', `Day ${n}, ${day.title}${open ? (note ? `, ${note}` : '') : day.create ? ', locked' : ', not built yet'}`);
        button.addEventListener('click', () => {
          page.close();
          onPick(day1);
        });
        const item = document.createElement('li');
        item.append(button);
        return item;
      }));
      page.open();
    },
    close: () => page.close(),
    get isOpen() {
      return page.isOpen;
    },
  };
}
