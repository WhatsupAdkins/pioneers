// Shops. horse(): the stables card (GAME-PLAN §8 beat 6), Pixel · azure mare · 60, with a
// name field; resolves { bought, name }. open(): any counter (GAME-PLAN-DAYS §A.5), a list
// of items to buy or sell one at a time; resolves { bought, sold } when the player leaves.
import { rasterize } from '../art/palette.js';
import { sprites } from '../art/index.js';
import { addItem, countItem, itemDefs, removeItem } from './inventory.js';
import { drawIcon } from './hud.js';

export const horsePrice = 60;

export function cleanHorseName(raw) {
  const name = String(raw ?? '').replace(/[^\p{L}\p{N} '\-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 14);
  return name || 'Pixel';
}

// One trade on the state. Returns a short message when it cannot happen.
export function trade(state, { id, price, mode }) {
  if (mode === 'buy') {
    if (state.purse < price) return 'Not enough in your purse.';
    if (!addItem(state, id)) return 'Your inventory is full.';
    state.purse -= price;
    return null;
  }
  if (!removeItem(state, id)) return `You have no ${itemDefs[id].name.toLowerCase()} to sell.`;
  state.purse += price;
  return null;
}

export function createShop(root, marketRoot, { onChange } = {}) {
  const preview = root.querySelector('.shop-preview');
  const input = root.querySelector('.shop-name');
  const buy = root.querySelector('.shop-buy');
  const leave = root.querySelector('.shop-leave');
  const purse = root.querySelector('.shop-purse');
  let settle = null;

  const pixel = sprites.pixel;
  const art = rasterize(pixel.frames['east-0'], 'shop pixel', pixel.w, pixel.h);
  preview.width = pixel.w;
  preview.height = pixel.h;
  preview.getContext('2d', { willReadFrequently: true }).putImageData(new ImageData(art.data, pixel.w, pixel.h), 0, 0);

  function finish(result) {
    root.hidden = true;
    const resolve = settle;
    settle = null;
    resolve?.(result);
  }

  buy.addEventListener('click', () => finish({ bought: true, name: cleanHorseName(input.value) }));
  leave.addEventListener('click', () => finish({ bought: false }));
  root.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') finish({ bought: false });
    else if (event.code === 'Enter' && event.target === input) finish({ bought: true, name: cleanHorseName(input.value) });
    else return;
    event.preventDefault();
    event.stopPropagation();
  });

  // ------------------------------------------------------------ generic counter
  const market = {
    title: marketRoot.querySelector('#market-title'),
    greeting: marketRoot.querySelector('.market-greeting'),
    rows: marketRoot.querySelector('.market-rows'),
    purse: marketRoot.querySelector('.market-purse'),
    note: marketRoot.querySelector('.market-note'),
    leave: marketRoot.querySelector('.market-leave'),
  };
  let session = null; // { state, items, bought, sold, resolve }

  function renderMarket(focusIndex) {
    const { state, items } = session;
    market.rows.replaceChildren(...items.map((item, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'market-row';
      const icon = drawIcon(document.createElement('canvas'), item.id);
      icon.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      const verb = item.mode === 'buy' ? 'Buy' : 'Sell';
      label.textContent = `${verb} ${itemDefs[item.id].name.toLowerCase()} · ${item.price}`;
      const owned = document.createElement('span');
      owned.className = 'market-owned';
      owned.textContent = `have ${countItem(state, item.id)}`;
      button.append(icon, label, owned);
      button.disabled = item.mode === 'buy' ? state.purse < item.price : countItem(state, item.id) === 0;
      button.addEventListener('click', () => {
        const message = trade(state, item);
        if (!message) {
          const tally = item.mode === 'buy' ? session.bought : session.sold;
          tally[item.id] = (tally[item.id] ?? 0) + 1;
          onChange?.(item);
        }
        market.note.textContent = message ?? `${item.mode === 'buy' ? 'Bought' : 'Sold'}: ${itemDefs[item.id].name.toLowerCase()}.`;
        renderMarket(i);
      });
      return button;
    }));
    market.purse.textContent = `Your purse: ${state.purse}`;
    const buttons = [...market.rows.querySelectorAll('button')];
    const target = buttons[focusIndex] && !buttons[focusIndex].disabled ? buttons[focusIndex] : buttons.find((b) => !b.disabled) ?? market.leave;
    target.focus();
  }

  function closeMarket() {
    if (!session) return;
    marketRoot.hidden = true;
    const { bought, sold, resolve } = session;
    session = null;
    resolve({ bought, sold });
  }

  market.leave.addEventListener('click', closeMarket);
  marketRoot.addEventListener('keydown', (event) => {
    if (!session) return;
    const focusable = [...marketRoot.querySelectorAll('button:not(:disabled)')];
    const at = focusable.indexOf(document.activeElement);
    if (event.code === 'Escape') closeMarket();
    else if (event.code === 'ArrowDown' || event.code === 'ArrowRight') focusable[(at + 1) % focusable.length]?.focus();
    else if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') focusable[(at - 1 + focusable.length) % focusable.length]?.focus();
    else return;
    event.preventDefault();
    event.stopPropagation();
  });

  return {
    open({ title, greeting = '', items, state }) {
      market.title.textContent = title;
      market.greeting.textContent = greeting;
      market.note.textContent = '';
      marketRoot.hidden = false;
      return new Promise((resolve) => {
        session = { state, items, bought: {}, sold: {}, resolve };
        renderMarket(0);
      });
    },

    horse(state) {
      purse.textContent = `You have ${state.purse}.`;
      const affordable = state.purse >= horsePrice;
      buy.disabled = !affordable;
      input.value = 'Pixel';
      root.hidden = false;
      (affordable ? input : leave).focus();
      if (affordable) input.select();
      return new Promise((resolve) => { settle = resolve; });
    },
    get isOpen() {
      return !root.hidden || !marketRoot.hidden;
    },
  };
}
