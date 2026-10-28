// World helpers for Days 5 and 6 (PARALLEL-RULES §2: new world abilities live here as
// functions that take the WorldScene, so game/world.js stays untouched).
//
// - npcKey / spawnDaedalus: Dr. Daedalus walks as the 'daedalus' sprite (12 frames,
//   art/days/day04.js).
// - follow: an NPC that keeps one tile behind Emily (the walk home).
// - kneel: swaps an NPC for the 'daedalus-kneel' pose and back.
// - grazeBison: the pasture's bison, as decoration.
// - placeBlock / addObject: a block (portal, hedge maze) or a usable object that a day adds
//   after the map is built; solid cells join the collision layer until the map is rebuilt.
import { blocks, tileSize } from '../../art/index.js';
import { spawnPoint } from '../player.js';

export const npcKey = () => 'daedalus';

export function spawnDaedalus(world, tile, face = 'down') {
  return world.spawnNpc('daedalus', tile, face);
}

// The NPC walks to the tile Emily just left, each time she enters a new one; it never walks
// onto her. update(tile) is called from the day's onTile hook.
export function follow(npc, speed = 64) {
  let last = null;
  let active = true;
  return {
    update(tile) {
      if (!active || npc.gone) return;
      if (last && (last.x !== tile.x || last.y !== tile.y)) npc.walkPath([last], speed);
      last = { x: tile.x, y: tile.y };
    },
    stop() {
      active = false;
    },
    get active() {
      return active;
    },
  };
}

// Down on one knee, facing `face` ('right' or 'left'); returns a function that stands her up.
export function kneel(world, npc, face = 'right') {
  if (!npc?.sprite?.active || typeof world.add?.image !== 'function') return () => {};
  const sprite = npc.sprite;
  const image = world.add.image(Math.round(sprite.x), Math.round(sprite.y), 'daedalus-kneel', 'right-0')
    .setOrigin(0.5, 1).setDepth(sprite.depth).setFlipX(face === 'left');
  world.mapObjects?.push(image);
  sprite.setVisible(false);
  return () => {
    image.destroy();
    if (sprite.active) sprite.setVisible(true);
  };
}

// The bison behind the pasture fence: [x, y, facing] feet tiles from the map's marks.
export function grazeBison(world, spots = []) {
  if (typeof world.add?.sprite !== 'function') return;
  spots.forEach(([x, y, face], i) => {
    const point = spawnPoint({ x, y });
    const bison = world.add.sprite(point.x + tileSize / 2, point.y, 'bison', 'graze-0').setOrigin(0.5, 1).setDepth(point.y);
    bison.setFlipX(face === 'east');
    bison.play({ key: 'bison-graze', startFrame: i % 3 });
    world.mapObjects?.push(bison);
  });
}

// Draws a block at `at` after the map is built (returns its images). Each block row stands on its own base line,
// so Emily can walk between rows (the maze); `solid` cells join the collision layer.
export function placeBlock(world, name, at) {
  const block = blocks[name];
  if (!block) throw new Error(`placeBlock: unknown block '${name}'`);
  if (typeof world.add?.image !== 'function') return [];
  const images = [];
  block.tiles.forEach((row, cy) => row.forEach((tile, cx) => {
    if (!tile) return;
    const image = world.add.image((at.x + cx) * tileSize, (at.y + cy) * tileSize, 'tileset', tile)
      .setOrigin(0, 0).setDepth((at.y + cy + 1) * tileSize);
    world.mapObjects?.push(image);
    images.push(image);
  }));
  block.solid.forEach((row, dy) => row.forEach((isSolid, dx) => {
    const x = at.x + dx;
    const y = at.y + dy;
    if (!isSolid || !world.solid?.[y] || x < 0 || x >= world.map.width) return;
    world.solid[y][x] = true;
    world.collideLayer?.putTileAt(0, x, y);
  }));
  // so the E outline (world.objectMask) finds the block's pixels
  world.map = { ...world.map, blocks: [...world.map.blocks, { name, x: at.x, y: at.y }] };
  return images;
}

// A usable object or a trigger that exists only from now until the map is rebuilt.
export function addObject(world, object) {
  if (!world.map?.objects) return;
  world.map = { ...world.map, objects: [...world.map.objects.filter((o) => o.id !== object.id), object] };
}

// Puts Emily on a tile of the map now shown (a cut inside a beat).
export function placeEmily(world, tile, face = 'down') {
  if (typeof world.player?.place !== 'function') return;
  world.player.place(spawnPoint(tile), face);
  world.lastTile = world.playerTile();
}
