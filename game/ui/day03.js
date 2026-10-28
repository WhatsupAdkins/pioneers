// A small choice panel for Days 3 and 4 (PARALLEL-RULES §2: built here in JS, not in
// index.html; styles in game/css/day03.css): the ledger on the porch, the store's stock for the
// week, the eye chart. It looks like the Mercantile's counter (.panel .market). Keys: 1–9 pick
// a row, arrows move, Enter/Space take the focused button, Esc leaves.
// Outside a browser (the node checks) open() picks `headless` or the first row that may be.
import { iconCanvas } from '../hud.js';

let cssAdded = false;
function addCss() {
  if (cssAdded) return;
  cssAdded = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../css/day03.css', import.meta.url).href;
  document.head.append(link);
}

// rows: [{ value, label, note?, icon?, disabled?, done? }]; body: an element shown above them.
// Resolves with the picked row's value, or null when left.
export function choosePanel({ title, intro = '', rows, body = null, leave = 'Close', hint = '', headless }) {
  if (typeof document === 'undefined') {
    return Promise.resolve(headless !== undefined ? headless : rows.find((row) => !row.disabled && !row.done)?.value ?? null);
  }
  addCss();
  const root = document.createElement('section');
  root.className = `panel market day03-panel${body ? ' has-body' : ''}`;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', title);
  const heading = document.createElement('h2');
  heading.textContent = title;
  root.append(heading);
  if (intro) {
    const p = document.createElement('p');
    p.className = 'market-greeting';
    p.textContent = intro;
    root.append(p);
  }
  if (body) root.append(body);
  const list = document.createElement('div');
  list.className = 'market-rows';
  root.append(list);
  const tip = document.createElement('p');
  tip.className = 'panel-hint';
  tip.textContent = hint || `1–${rows.length} choose · Enter takes · Esc: ${leave.toLowerCase()}`;
  root.append(tip);
  const actions = document.createElement('div');
  actions.className = 'panel-actions';
  const leaveButton = document.createElement('button');
  leaveButton.type = 'button';
  leaveButton.textContent = leave;
  actions.append(leaveButton);
  root.append(actions);

  return new Promise((resolve) => {
    const finish = (value) => {
      removeEventListener('keydown', onKey, true);
      root.remove();
      resolve(value);
    };
    const buttons = rows.map((row, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `market-row day03-row${row.done ? ' is-done' : ''}${row.icon ? '' : ' is-plain'}`;
      if (row.icon) button.append(iconCanvas(row.icon));
      const label = document.createElement('span');
      label.textContent = `${i + 1}. ${row.label}`;
      const note = document.createElement('span');
      note.className = 'market-owned';
      note.textContent = row.done ? 'done' : row.note ?? '';
      button.append(label, note);
      button.disabled = Boolean(row.disabled || row.done);
      button.addEventListener('click', () => finish(row.value));
      list.append(button);
      return button;
    });
    leaveButton.addEventListener('click', () => finish(null));
    const focusable = () => [...root.querySelectorAll('button:not(:disabled)')];
    function onKey(event) {
      const code = event.code;
      const digit = /^(Digit|Numpad)([1-9])$/.exec(code);
      if (digit) {
        const button = buttons[Number(digit[2]) - 1];
        if (button && !button.disabled) button.click();
      } else if (code === 'Escape') finish(null);
      else if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') {
        if (root.contains(document.activeElement) && document.activeElement.tagName === 'BUTTON') document.activeElement.click();
      } else if (code === 'ArrowDown' || code === 'ArrowUp' || code === 'ArrowLeft' || code === 'ArrowRight') {
        const all = focusable();
        const at = all.indexOf(document.activeElement);
        const step = code === 'ArrowDown' || code === 'ArrowRight' ? 1 : -1;
        all[(at + step + all.length) % all.length]?.focus();
      } else if (code === 'KeyE' || code === 'KeyI' || code === 'KeyS') {
        // swallowed while the panel is open
      } else return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    addEventListener('keydown', onKey, true);
    document.getElementById('frame').append(root);
    (buttons.find((button) => !button.disabled) ?? leaveButton).focus();
  });
}

// The eye chart (Day 4): five lines of letters, each smaller than the last.
export function eyeChart(lines) {
  if (typeof document === 'undefined') return null;
  addCss();
  const chart = document.createElement('div');
  chart.className = 'day04-chart';
  chart.setAttribute('aria-hidden', 'true');
  lines.forEach((text, i) => {
    const line = document.createElement('p');
    line.className = `day04-chart-line day04-chart-${i + 1}`;
    line.textContent = text;
    chart.append(line);
  });
  return chart;
}
