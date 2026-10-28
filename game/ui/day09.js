// Day 9's DOM (archive/PARALLEL-RULES.md §2: panels made in JS, CSS in game/css/day09.css):
// - the bedside Go board: one white stone an afternoon, Daedalus answers with black; later
//   the same board, shown above the dialogue, for "a child who was lost at sea";
// - the workshop: four sets, each needing sequoia wood and Daedalus's glass, finished by a Rest;
// - holdLine(): a line typed into a box and held (the day's last line; Day 10's last box).
// Without a document (check-days.mjs) createDay09Ui() returns stand-ins that answer at once.
import { iconCanvas } from '../hud.js';

const size = 9;
const columns = 'ABCDEFGHJ';
const charsPerSecond = 40;
const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

// Inserts a day's stylesheet once (game/css/<name>.css).
export function ensureCss(name) {
  if (typeof document === 'undefined') return;
  const id = `css-${name}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = new URL(`../css/${name}.css`, import.meta.url).href;
  document.head.append(link);
}

// A box near the bottom of the frame, like the dialogue box: `text` typed (or shown whole
// with reduced motion), then held `hold` ms. Resolves with a function that removes the box.
export async function holdLine(frame, text, { hold = 2000, kind = 'narration', reducedMotion = false } = {}) {
  if (typeof document === 'undefined') return () => {};
  ensureCss('day09');
  frame ??= document.getElementById('frame');
  const box = document.createElement('div');
  box.className = 'd9-hold';
  box.dataset.kind = kind;
  box.setAttribute('role', 'status');
  const line = document.createElement('p');
  box.append(line);
  frame.append(box);
  if (reducedMotion) line.textContent = text;
  else {
    for (let i = 1; i <= text.length; i++) {
      line.textContent = text.slice(0, i);
      await sleep(1000 / charsPerSecond);
    }
  }
  await sleep(hold);
  return () => box.remove();
}

// ---------------------------------------------------------------- the bedside board
function createBoard(frame, { reducedMotion }) {
  const root = document.createElement('section');
  root.className = 'd9-board';
  root.hidden = true;
  root.setAttribute('aria-label', 'Go board by the bed');
  root.innerHTML = '<p class="d9-board-title"></p><div class="d9-board-grid" role="grid" aria-label="Go board, 9 by 9"></div><p class="d9-board-hint"></p>';
  frame.append(root);
  const title = root.querySelector('.d9-board-title');
  const hint = root.querySelector('.d9-board-hint');
  const grid = root.querySelector('.d9-board-grid');
  const points = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'd9-point';
      const edges = [x === 0 && 'left', x === size - 1 && 'right', y === 0 && 'top', y === size - 1 && 'bottom'].filter(Boolean);
      if (edges.length) button.dataset.edge = edges.join(' ');
      button.tabIndex = -1;
      grid.append(button);
      points.push(button);
    }
  }
  let cursor = { x: 4, y: 4 };
  let lostTimer = null;

  function render(board, last = -1) {
    points.forEach((button, i) => {
      const color = board[i];
      let stone = button.querySelector('.d9-stone');
      if (color && !stone) {
        stone = document.createElement('span');
        stone.className = 'd9-stone';
        button.append(stone);
      }
      if (!color && stone) stone.remove();
      if (stone) stone.dataset.color = String(color);
      button.classList.toggle('is-last', i === last);
      button.classList.toggle('is-cursor', i === cursor.y * size + cursor.x && !root.classList.contains('is-demo'));
      const what = color === 1 ? 'black stone' : color === 2 ? 'white stone' : 'empty';
      button.setAttribute('aria-label', `${columns[i % size]}${size - Math.floor(i / size)}, ${what}`);
    });
  }

  function stopLost() {
    clearInterval(lostTimer);
    lostTimer = null;
    root.querySelectorAll('.d9-lost').forEach((node) => node.remove());
  }

  return {
    // One white stone. `move(x, y)` returns { error } or { afterWhite, afterBlack, black };
    // resolves with that result, or null when Emily steps away (Esc).
    play(board, { afternoon, move }) {
      stopLost();
      root.classList.remove('is-demo', 'is-grid', 'is-pieces', 'is-god');
      title.textContent = `Afternoon ${afternoon}`;
      hint.textContent = 'Place one white stone · Arrows, Enter · Esc steps away';
      root.hidden = false;
      render(board);
      points[cursor.y * size + cursor.x].focus();
      return new Promise((resolve) => {
        let done = false;
        const finish = (value) => {
          done = true;
          root.removeEventListener('keydown', onKey);
          points.forEach((button) => { button.onclick = null; });
          setTimeout(() => {
            root.hidden = true;
            resolve(value);
          }, value ? (reducedMotion ? 300 : 1100) : 0);
        };
        const place = (x, y) => {
          if (done) return;
          const result = move(x, y);
          if (result.error) {
            hint.textContent = result.error === 'occupied' ? 'There is already a stone there.' : 'Not there.';
            return;
          }
          done = true;
          render(result.afterWhite, y * size + x);
          hint.textContent = '…';
          setTimeout(() => {
            render(result.afterBlack, result.black ? result.black.y * size + result.black.x : -1);
            hint.textContent = '';
            finish(result);
          }, reducedMotion ? 0 : 750);
        };
        points.forEach((button, i) => {
          button.onclick = () => {
            cursor = { x: i % size, y: Math.floor(i / size) };
            place(cursor.x, cursor.y);
          };
        });
        function onKey(event) {
          const steps = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
          if (event.code in steps) {
            const [dx, dy] = steps[event.code];
            cursor = { x: Math.min(size - 1, Math.max(0, cursor.x + dx)), y: Math.min(size - 1, Math.max(0, cursor.y + dy)) };
            points[cursor.y * size + cursor.x].focus();
            if (!done) render(board);
          } else if (event.code === 'Enter' || event.code === 'NumpadEnter' || event.code === 'Space') {
            place(cursor.x, cursor.y);
          } else if (event.code === 'Escape') {
            if (!done) finish(null);
          } else return;
          event.preventDefault();
          event.stopPropagation();
        }
        root.addEventListener('keydown', onKey);
      });
    },

    // The board above the dialogue box, for looking at, not playing.
    show(board) {
      stopLost();
      root.classList.add('is-demo');
      title.textContent = 'Dr. Daedalus’s Go board';
      hint.textContent = '';
      render(board);
      root.hidden = false;
      this.board = board;
    },

    // Beats of the lost-child metaphor (GAME-PLAN-DAYS §B Day 9 beat 4).
    cue(name) {
      if (name === 'grid') root.classList.add('is-grid');
      else if (name === 'pieces') {
        root.classList.remove('is-grid');
        root.classList.add('is-pieces');
      } else if (name === 'lost') {
        // one white stone, the lost child, wanders from point to point across the board
        root.classList.remove('is-pieces');
        stopLost();
        const empty = (i) => !this.board?.[i];
        let at = [40, 31, 22, 13, 4, 0].find(empty) ?? 40;
        let step = 0;
        const walk = [[1, 0], [1, 0], [0, 1], [0, 1], [-1, 0], [0, 1], [1, 0], [1, 0], [0, -1], [1, 0], [0, -1], [0, -1]];
        const mark = document.createElement('span');
        mark.className = 'd9-stone d9-lost';
        mark.dataset.color = '2';
        const put = () => points[at].append(mark);
        put();
        if (!reducedMotion) {
          lostTimer = setInterval(() => {
            for (let tries = 0; tries < walk.length; tries++) {
              const [dx, dy] = walk[step++ % walk.length];
              const x = (at % size) + dx;
              const y = Math.floor(at / size) + dy;
              if (x < 0 || y < 0 || x >= size || y >= size || !empty(y * size + x)) continue;
              at = y * size + x;
              put();
              break;
            }
          }, 420);
        }
      } else if (name === 'god') root.classList.add('is-god');
      else if (name === 'hide') this.hide();
    },

    hide() {
      stopLost();
      root.hidden = true;
      root.classList.remove('is-demo', 'is-grid', 'is-pieces', 'is-god');
    },
  };
}

// ---------------------------------------------------------------- the workshop
function createWorkshop(frame) {
  const root = document.createElement('section');
  root.className = 'panel d9-workshop';
  root.hidden = true;
  root.setAttribute('aria-labelledby', 'd9-workshop-title');
  root.innerHTML = `
    <h2 id="d9-workshop-title">The workshop</h2>
    <p class="d9-workshop-note"></p>
    <ul class="d9-workshop-sets"></ul>
    <p class="d9-workshop-stock"></p>
    <p class="panel-hint">Begin a set · Rest to finish it · Esc leaves</p>
    <div class="panel-actions"><button class="d9-workshop-leave" type="button">Leave</button></div>`;
  frame.append(root);
  const list = root.querySelector('.d9-workshop-sets');
  const note = root.querySelector('.d9-workshop-note');
  const stock = root.querySelector('.d9-workshop-stock');
  const leave = root.querySelector('.d9-workshop-leave');

  return {
    get isOpen() {
      return !root.hidden;
    },
    // sets: [{ id, name, icon }]; made: ids sold; bench: the id being finished, or null.
    // Resolves with the id of the set begun, or null.
    open({ sets, made, bench, wood, glass, price }) {
      note.textContent = bench
        ? `${sets.find((set) => set.id === bench).name} is on the bench. Rest, and it will be finished.`
        : 'Emily carves the board; Dr. Daedalus blows the pieces, one-handed, with LQ at the bellows.';
      stock.textContent = `Sequoia wood ${wood} · Glass pieces ${glass} · Each set sells for ${price}`;
      list.replaceChildren(...sets.map((set) => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.set = set.id;
        const status = made.includes(set.id) ? 'Sold out' : bench === set.id ? 'On the bench' : bench ? 'After the one on the bench' : wood < 1 ? 'Needs sequoia wood' : glass < 1 ? 'Waiting for glass' : 'Begin';
        button.disabled = status !== 'Begin';
        button.append(iconCanvas(set.icon, 'd9-set-icon'));
        const name = document.createElement('span');
        name.className = 'd9-set-name';
        name.textContent = set.name;
        const what = document.createElement('span');
        what.className = 'd9-set-status';
        what.textContent = status;
        button.append(name, what);
        button.setAttribute('aria-label', `${set.name}: ${status}`);
        item.append(button);
        return item;
      }));
      root.hidden = false;
      (list.querySelector('button:not(:disabled)') ?? leave).focus();
      return new Promise((resolve) => {
        const close = (value) => {
          root.hidden = true;
          root.removeEventListener('keydown', onKey);
          list.removeEventListener('click', onClick);
          leave.removeEventListener('click', onLeave);
          resolve(value);
        };
        const onClick = (event) => {
          const button = event.target.closest('button[data-set]');
          if (button && !button.disabled) close(button.dataset.set);
        };
        const onLeave = () => close(null);
        function onKey(event) {
          const buttons = [...root.querySelectorAll('button:not(:disabled)')];
          const at = buttons.indexOf(document.activeElement);
          if (event.code === 'Escape') close(null);
          else if (event.code === 'ArrowDown' || event.code === 'ArrowRight') buttons[(at + 1) % buttons.length]?.focus();
          else if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') buttons[(at - 1 + buttons.length) % buttons.length]?.focus();
          else return;
          event.preventDefault();
          event.stopPropagation();
        }
        root.addEventListener('keydown', onKey);
        list.addEventListener('click', onClick);
        leave.addEventListener('click', onLeave);
      });
    },
  };
}

// ---------------------------------------------------------------- stand-ins (no document)
function headlessUi() {
  return {
    board: {
      // the first point that takes a stone
      play(board, { move }) {
        for (let i = 0; i < size * size; i++) {
          if (board[i]) continue;
          const result = move(i % size, Math.floor(i / size));
          if (!result.error) return Promise.resolve(result);
        }
        return Promise.resolve(null);
      },
      show() {},
      cue() {},
      hide() {},
    },
    workshop: {
      isOpen: false,
      open: ({ sets, made, bench, wood, glass }) => Promise.resolve(bench || wood < 1 || glass < 1 ? null : sets.find((set) => !made.includes(set.id))?.id ?? null),
    },
  };
}

export function createDay09Ui(ctx) {
  if (typeof document === 'undefined') return headlessUi();
  ensureCss('day09');
  const frame = document.getElementById('frame');
  // one set of panels per page, reused when the day is started again
  if (!frame.day09Ui) frame.day09Ui = { board: createBoard(frame, ctx), workshop: createWorkshop(frame) };
  return frame.day09Ui;
}
