// HUD (GAME-PLAN §10, GAME-PLAN-DAYS §A.3): hearts and purse top-left, place, season and
// road distance top-right, the "Now:" goal line bottom-left, toasts.
// All DOM; icons are drawn from art/icons.js at one game pixel per icon pixel.
import { rasterize } from '../art/palette.js';
import { icons } from '../art/index.js';

const iconData = new Map();
export function drawIcon(canvas, name) {
  if (!iconData.has(name)) {
    const art = rasterize(icons[name], `icon ${name}`);
    iconData.set(name, new ImageData(art.data, art.width, art.height));
  }
  const image = iconData.get(name);
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext('2d', { willReadFrequently: true }).putImageData(image, 0, 0);
  return canvas;
}

export function iconCanvas(name, className) {
  const canvas = drawIcon(document.createElement('canvas'), name);
  if (className) canvas.className = className;
  canvas.setAttribute('aria-hidden', 'true');
  return canvas;
}

export function createHud(root, toastRoot) {
  const hearts = root.querySelector('.hud-hearts');
  const purse = root.querySelector('.hud-purse');
  const place = root.querySelector('.hud-place');
  const season = root.querySelector('.hud-season');
  const screens = root.querySelector('.hud-screens');
  const goal = root.querySelector('.hud-goal');
  const goalText = root.querySelector('.hud-goal-text');
  purse.prepend(iconCanvas('coin', 'hud-coin'));
  const purseValue = purse.querySelector('.hud-purse-value');
  const heartCanvases = [];
  let toastTimer = null;

  function update(state) {
    while (heartCanvases.length < state.heartsMax) {
      const canvas = iconCanvas('heart-full', 'hud-heart');
      heartCanvases.push(canvas);
      hearts.append(canvas);
    }
    // only heartsMax are shown (Day 3's and Day 6's cap of six hides the rest)
    heartCanvases.forEach((canvas, i) => {
      canvas.style.display = i < state.heartsMax ? '' : 'none';
      drawIcon(canvas, i < state.hearts ? 'heart-full' : 'heart-empty');
    });
    hearts.setAttribute('aria-label', `Hearts ${state.hearts} of ${state.heartsMax}`);
    purseValue.textContent = String(state.purse);
    purse.setAttribute('aria-label', `Purse ${state.purse}`);
  }

  let seasonText = 'EARLY SPRING';
  // The place's name (each map carries its own `name`) and the season under it.
  function setPlace(name, label = seasonText) {
    seasonText = label;
    place.textContent = name ?? '';
    season.textContent = label;
  }

  // "Now: …" — what to do next. An empty text hides the line.
  function setGoal(text) {
    goal.hidden = !text;
    goalText.textContent = text ?? '';
  }

  function setScreens(count) {
    screens.hidden = count === null;
    if (count !== null) screens.textContent = `${count} ${count === 1 ? 'screen' : 'screens'} from town`;
  }

  function toast(text, ms = 2000) {
    toastRoot.textContent = text;
    toastRoot.hidden = false;
    toastRoot.classList.remove('is-fading');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastRoot.classList.add('is-fading');
      toastTimer = setTimeout(() => { toastRoot.hidden = true; }, 600);
    }, ms);
  }

  return {
    update,
    setPlace,
    setScreens,
    setGoal,
    toast,
    show: () => { root.hidden = false; },
    hide: () => { root.hidden = true; },
  };
}
