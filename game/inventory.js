// Inventory (GAME-PLAN §6, GAME-PLAN-DAYS §A.5): 12 slots of stackable items, I toggles.
// Item definitions live per day in game/items/dayNN.js.
// state.inventory is [{ id, count }]. Keyboard: arrows move, Enter/E uses (or gives, in
// pick mode), I or Esc closes. The pure helpers below are shared with the day scripts and
// the node check scripts.
import { drawIcon } from './hud.js';
import { inventorySlots } from './state.js';
import * as byDay from './items/index.js';

export const slotCount = inventorySlots;

// Every registered day's items (game/items/index.js), by id.
export const itemDefs = {};
for (const [day, module] of Object.entries(byDay)) {
  for (const [id, def] of Object.entries(module.items)) {
    if (id in itemDefs) throw new Error(`game/items/${day}.js: item '${id}' is already defined`);
    itemDefs[id] = def;
  }
}

export function countItem(state, id) {
  return state.inventory.find((entry) => entry.id === id)?.count ?? 0;
}

export function hasItem(state, id) {
  return countItem(state, id) > 0;
}

// Adds n of an item: onto its stack, or into a free slot. False when there is no room.
export function addItem(state, id, n = 1) {
  if (!itemDefs[id]) throw new Error(`Unknown item '${id}'`);
  const slot = state.inventory.find((entry) => entry.id === id);
  if (slot) {
    slot.count += n;
    return true;
  }
  if (state.inventory.length >= slotCount) return false;
  state.inventory.push({ id, count: n });
  return true;
}

export function removeItem(state, id, n = 1) {
  const slot = state.inventory.find((entry) => entry.id === id);
  if (!slot || slot.count < n) return false;
  slot.count -= n;
  if (slot.count === 0) state.inventory.splice(state.inventory.indexOf(slot), 1);
  return true;
}

// Eating: hearts up to the maximum. The bread also marks the Day 1 flag.
export function useItem(state, id) {
  const def = itemDefs[id];
  if (!def?.eat || !removeItem(state, id)) return false;
  state.hearts = Math.min(state.heartsMax, state.hearts + def.eat);
  if (id === 'bread') state.flags.ateBread = true;
  return true;
}

export function createInventory({ root, getState, onChange, onOpen, onClose }) {
  const heading = root.querySelector('#inventory-title');
  const grid = root.querySelector('.inventory-grid');
  const title = root.querySelector('.inventory-name');
  const text = root.querySelector('.inventory-text');
  const action = root.querySelector('.inventory-action');
  const hint = root.querySelector('.panel-hint');
  const slots = Array.from({ length: slotCount }, (_, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'inventory-slot';
    const count = document.createElement('span');
    count.className = 'inventory-count';
    button.append(document.createElement('canvas'), count);
    button.addEventListener('click', () => select(i));
    button.addEventListener('focus', () => select(i, false));
    grid.append(button);
    return button;
  });
  let selected = 0;
  let isOpen = false;
  let picking = null; // { filter, verb, resolve } while choosing a gift

  const verbFor = (id) => {
    if (!id) return null;
    if (picking) return picking.filter(id) ? picking.verb : null;
    return itemDefs[id].eat ? 'Eat' : null;
  };

  function render() {
    const state = getState();
    slots.forEach((slot, i) => {
      const entry = state.inventory[i];
      const canvas = slot.querySelector('canvas');
      const count = slot.querySelector('.inventory-count');
      canvas.hidden = !entry;
      if (entry) drawIcon(canvas, entry.id);
      count.textContent = entry && entry.count > 1 ? String(entry.count) : '';
      slot.setAttribute('aria-label', entry ? `${itemDefs[entry.id].name}${entry.count > 1 ? `, ${entry.count}` : ''}` : 'Empty slot');
      slot.classList.toggle('is-selected', i === selected);
      slot.classList.toggle('is-dim', Boolean(picking && entry && !picking.filter(entry.id)));
    });
    const id = state.inventory[selected]?.id;
    title.textContent = id ? itemDefs[id].name : 'Empty';
    text.textContent = id ? itemDefs[id].text : '';
    const verb = verbFor(id);
    action.hidden = !verb;
    if (verb) action.textContent = verb;
  }

  function select(i, focus = true) {
    selected = i;
    render();
    if (focus) slots[i].focus();
  }

  function use() {
    const state = getState();
    const id = state.inventory[selected]?.id;
    if (!id) return;
    if (picking) {
      if (!picking.filter(id)) return;
      const { resolve } = picking;
      picking = null;
      close();
      resolve(id);
      return;
    }
    if (useItem(state, id)) {
      onChange?.(id);
      render();
    }
  }

  function show(label, hintText) {
    heading.textContent = label;
    hint.textContent = hintText;
    isOpen = true;
    root.hidden = false;
    onOpen?.();
    select(0);
  }

  function open() {
    if (isOpen) return;
    show('Inventory', 'Arrows choose · Enter uses · I closes');
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    root.hidden = true;
    if (picking) {
      const { resolve } = picking;
      picking = null;
      resolve(null);
    }
    onClose?.();
  }

  // Choose one item (e.g. a gift). Resolves with its id, or null if closed without one.
  function pick({ filter = () => true, verb = 'Give', label = 'Give a gift' } = {}) {
    if (isOpen) close();
    return new Promise((resolve) => {
      picking = { filter, verb, resolve };
      show(label, `Arrows choose · Enter ${verb.toLowerCase()}s · Esc keeps it`);
    });
  }

  action.addEventListener('click', use);
  addEventListener('keydown', (event) => {
    if (!isOpen) return;
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 };
    if (event.code in moves) select((selected + moves[event.code] + slotCount) % slotCount);
    else if (event.code === 'Enter' || event.code === 'Space' || event.code === 'KeyE') use();
    else if (event.code === 'KeyI' || event.code === 'Escape') close();
    else return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  return {
    open,
    close,
    pick,
    render,
    toggle: () => (isOpen ? close() : open()),
    get isOpen() {
      return isOpen;
    },
  };
}
