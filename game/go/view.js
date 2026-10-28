// Tuesday night (GAME-PLAN §9): 9×9 capture Go against Dr. Daedalus, in the DOM.
// Daedalus plays black (her glass stones) and moves first; Emily plays white (the pale
// stones from her field). Arrows move the cursor, Enter or Space places, Esc leaves.
import { createGame, play, pass, resign, black, white } from './engine.js';
import { aiMove, createRng } from './ai.js';
import { drawPortrait } from '../dialogue.js';

const size = 9;
const target = 5;
const columns = 'ABCDEFGHJ';
const levels = [['Easy', 1], ['Normal', 2], ['Hard', 3]];

// From the "Tuesday nights" scene (archive/story-synopsis.js); the rest is authored.
const intro = 'Doctor seeks Gamer. Tuesday nights, eight o’clock. — White is yours: the pale stones from your field. First to capture five.';
const lines = {
  daedalusWins: ['Again next Tuesday?', 'You played the edges well. Next time, the centre.'],
  emilyWins: ['You won. Let me walk you home.', 'Well played. I will be ready next Tuesday.'],
  draw: ['Even. That almost never happens.'],
  resign: ['Already? Next Tuesday, then.'],
};
const refusals = {
  occupied: 'There is already a stone there.',
  suicide: 'That stone would have no liberties. Not allowed.',
  ko: 'Ko: you cannot retake at once. Play elsewhere first.',
  over: 'The game is over.',
  bounds: 'Off the board.',
};

export function createGoView(root, { sound, reducedMotion = false, onClose }) {
  root.innerHTML = `
    <div class="go-board" role="grid" aria-label="Go board, 9 by 9"></div>
    <div class="go-side">
      <div class="go-head">
        <img class="go-portrait" width="48" height="48" alt="" aria-hidden="true">
        <h2 id="go-title" class="go-title">Tuesday night</h2>
      </div>
      <p class="go-line" aria-live="polite"></p>
      <p class="go-score"></p>
      <div class="go-level">Level
        ${levels.map(([name, level]) => `<button type="button" data-level="${level}" aria-pressed="${level === 2}">${name}</button>`).join('')}
      </div>
      <div class="go-actions">
        <button type="button" data-act="pass">Pass</button>
        <button type="button" data-act="resign">Resign</button>
        <button type="button" data-act="again">New game</button>
        <button type="button" data-act="leave">Leave</button>
      </div>
      <p class="go-hint">Arrows move · Enter places · Esc leaves. Daedalus plays black and opens.</p>
    </div>`;
  const board = root.querySelector('.go-board');
  const line = root.querySelector('.go-line');
  const score = root.querySelector('.go-score');
  const portrait = root.querySelector('.go-portrait');
  const points = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'go-point';
      const edges = [x === 0 && 'left', x === size - 1 && 'right', y === 0 && 'top', y === size - 1 && 'bottom'].filter(Boolean);
      if (edges.length) button.dataset.edge = edges.join(' ');
      button.addEventListener('click', () => {
        cursor = { x, y };
        place(x, y);
      });
      board.append(button);
      points.push(button);
    }
  }

  let game = null;
  let rng = null;
  let level = 2;
  let cursor = { x: 4, y: 4 };
  let thinking = false;
  let timer = null;
  let picks = 0;

  const pick = (list) => list[(picks++) % list.length];

  function say(text, mood = 'neutral') {
    line.textContent = text;
    drawPortrait(portrait, mood === 'pleased' ? 'daedalus-pleased' : 'daedalus-neutral');
  }

  function render() {
    const last = game.last && !game.last.pass ? game.last.y * size + game.last.x : -1;
    points.forEach((button, i) => {
      const x = i % size;
      const y = Math.floor(i / size);
      const color = game.board[i];
      let stone = button.querySelector('.go-stone');
      if (color && !stone) {
        stone = document.createElement('span');
        stone.className = 'go-stone';
        button.append(stone);
      }
      if (!color && stone) stone.remove();
      if (stone) stone.dataset.color = String(color);
      button.classList.toggle('is-last', i === last);
      button.classList.toggle('is-cursor', x === cursor.x && y === cursor.y);
      const what = color === black ? 'black stone' : color === white ? 'white stone' : 'empty';
      button.setAttribute('aria-label', `${columns[x]}${size - y}, ${what}`);
      button.disabled = false;
    });
    score.textContent = `Captures — Daedalus ${game.captures[black]} · Emily ${game.captures[white]} · first to ${target}`;
  }

  function finish() {
    clearTimeout(timer);
    thinking = false;
    if (game.reason === 'resign') say(pick(lines.resign));
    else if (game.winner === black) say(pick(lines.daedalusWins), 'pleased');
    else if (game.winner === white) say(pick(lines.emilyWins), 'pleased');
    else say(pick(lines.draw));
    render();
  }

  function after(next) {
    game = next;
    sound?.play('stone');
    render();
    if (game.over) finish();
  }

  function daedalusTurn() {
    if (game.over || game.toMove !== black) return;
    thinking = true;
    timer = setTimeout(() => {
      const move = aiMove(game, level, rng);
      const next = move.pass ? pass(game) : play(game, move.x, move.y);
      thinking = false;
      if (next.error) {
        // never expected (check-go.mjs plays thousands of AI moves), but never stall either
        after(pass(game));
        return;
      }
      if (move.pass) say('I pass.');
      after(next);
    }, reducedMotion ? 0 : 380);
  }

  function place(x, y) {
    if (thinking || game.over || game.toMove !== white) return;
    const next = play(game, x, y);
    if (next.error) {
      say(refusals[next.error] ?? 'Not there.');
      return;
    }
    after(next);
    daedalusTurn();
  }

  function newGame() {
    clearTimeout(timer);
    const seed = 1 + (Date.now() % 100000);
    game = createGame({ size, target, seed });
    rng = createRng(seed);
    cursor = { x: 4, y: 4 };
    say(intro);
    render();
    daedalusTurn();
  }

  root.querySelectorAll('[data-level]').forEach((button) => button.addEventListener('click', () => {
    level = Number(button.dataset.level);
    root.querySelectorAll('[data-level]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
  }));
  root.querySelector('[data-act="pass"]').addEventListener('click', () => {
    if (thinking || game.over || game.toMove !== white) return;
    after(pass(game));
    if (!game.over) daedalusTurn();
  });
  root.querySelector('[data-act="resign"]').addEventListener('click', () => {
    if (game.over) return;
    after(resign(game, white));
  });
  root.querySelector('[data-act="again"]').addEventListener('click', () => newGame());
  root.querySelector('[data-act="leave"]').addEventListener('click', () => close());

  root.addEventListener('keydown', (event) => {
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (event.code in moves && event.target.classList.contains('go-point')) {
      const [dx, dy] = moves[event.code];
      cursor = { x: Math.min(size - 1, Math.max(0, cursor.x + dx)), y: Math.min(size - 1, Math.max(0, cursor.y + dy)) };
      points[cursor.y * size + cursor.x].focus();
      render();
    } else if (event.code === 'Escape') {
      close();
    } else {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  });

  function open() {
    root.hidden = false;
    newGame();
    points[cursor.y * size + cursor.x].focus();
  }

  function close() {
    clearTimeout(timer);
    thinking = false;
    root.hidden = true;
    onClose?.();
  }

  return {
    open,
    close,
    get game() {
      return game;
    },
  };
}
