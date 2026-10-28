// All the game's art: the base files (Day 1 and the shared season grass, the E prompt) with
// every registered day's art (art/days/index.js) merged over them. Import art from here, not
// from the base files. A day may only add names, never redefine one.
import { singleTiles, singleKinds, blockArt, sliceTileset } from './tiles.js';
import { sprites as baseSprites } from './sprites.js';
import { portraits as basePortraits } from './portraits.js';
import { icons as baseIcons } from './icons.js';
import * as days from './days/index.js';

export { tileSize, collideKinds, isSolidKind } from './tiles.js';

const dayArt = Object.entries(days); // [['day02', module], …] in day order

function merge(base, key) {
  const out = { ...base };
  for (const [day, art] of dayArt) {
    for (const [name, value] of Object.entries(art[key] ?? {})) {
      if (name in out) throw new Error(`art/days/${day}.js: ${key} '${name}' is already defined`);
      out[name] = value;
    }
  }
  return out;
}

export const { tiles, tileKinds, blocks } = sliceTileset(merge(singleTiles, 'tiles'), merge(singleKinds, 'tileKinds'), merge(blockArt, 'blocks'));
export const sprites = merge(baseSprites, 'sprites');
export const portraits = merge(basePortraits, 'portraits');
export const icons = merge(baseIcons, 'icons');
