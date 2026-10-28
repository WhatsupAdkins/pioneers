// World helpers added for Days 3 and 4 (PARALLEL-RULES §2: a mixin, not an edit of world.js).
// Each takes the WorldScene. In the node checks the world is a stand-in, so every helper
// does nothing there.
//   placeBlock / removeBlock: a block that comes and goes within a day (the bookstore once it is
//     built, the renamed sign, the shelves of cards and games, the sequoia before the felling),
//     with its collision. Gone when the map is rebuilt, like world.placeProp.
// (Centring a small room and showing only heartsMax hearts moved into world.buildMap and
// hud.update in Run 8.)
import { blocks, tileSize, isSolidKind } from '../../art/index.js';

const live = (world) => typeof world?.add?.image === 'function' && Array.isArray(world.solid);
const placed = new WeakMap(); // world → { built, items: Map(key → { images, cells }) }

// The blocks placed since the map was last built (buildMap replaces world.mapObjects).
function registry(world) {
  let entry = placed.get(world);
  if (!entry || entry.built !== world.mapObjects) {
    entry = { built: world.mapObjects, items: new Map() };
    placed.set(world, entry);
  }
  return entry.items;
}

export function removeBlock(world, key) {
  if (!live(world)) return;
  const items = registry(world);
  const item = items.get(key);
  if (!item) return;
  item.images.forEach((image) => image.destroy());
  for (const { x, y } of item.cells) {
    world.solid[y][x] = false;
    world.collideLayer.removeTileAt(x, y);
  }
  items.delete(key);
}

export function placeBlock(world, key, name, at) {
  if (!live(world)) return;
  removeBlock(world, key);
  const block = blocks[name];
  if (!block) throw new Error(`placeBlock: unknown block '${name}'`);
  const base = (at.y + block.h) * tileSize;
  const images = [];
  block.tiles.forEach((row, cy) => row.forEach((tile, cx) => {
    if (!tile) return;
    const image = world.add.image((at.x + cx) * tileSize, (at.y + cy) * tileSize, 'tileset', tile).setOrigin(0, 0).setDepth(base);
    images.push(image);
    world.mapObjects.push(image);
  }));
  const cells = [];
  if (isSolidKind(block.kind)) {
    block.solid.forEach((row, dy) => row.forEach((solid, dx) => {
      const x = at.x + dx;
      const y = at.y + dy;
      if (!solid || world.solid[y]?.[x] !== false) return;
      world.solid[y][x] = true;
      world.collideLayer.putTileAt(0, x, y);
      cells.push({ x, y });
    }));
  }
  registry(world).set(key, { images, cells });
}
