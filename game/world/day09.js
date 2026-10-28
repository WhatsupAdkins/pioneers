// World helpers for Days 9 and 10 (PARALLEL-RULES §2: a day's new world abilities live in
// game/world/dayNN.js as functions that take the WorldScene, not in game/world.js).
// Every function is a no-op on a stand-in world (check-days.mjs), which has no Phaser.
import { tileSize } from '../../art/index.js';

const live = (world) => typeof world?.add?.image === 'function' && Array.isArray(world.mapObjects);

export const hasTexture = (world, key) => Boolean(world?.textures?.exists?.(key));

// A sprite frame laid on the map at a tile's top-left (Daedalus in bed over the bed block),
// gone when the map is rebuilt. `depth` defaults to just above anything standing on that row.
export function placeSprite(world, key, texture, frame, tile, { depth } = {}) {
  if (!live(world) || !hasTexture(world, texture)) return null;
  removeSprite(world, key);
  const image = world.add.image(tile.x * tileSize, tile.y * tileSize, texture, frame).setOrigin(0, 0);
  image.setDepth(depth ?? (tile.y + 1) * tileSize + 1);
  world.mapObjects.push(image);
  world.daySprites ??= new Map();
  world.daySprites.set(key, image);
  return image;
}

export function removeSprite(world, key) {
  const image = world?.daySprites?.get?.(key);
  if (!image) return;
  if (image.active) image.destroy();
  world.daySprites.delete(key);
}
