// World helpers for Days 7 and 8 (archive/PARALLEL-RULES.md §2: mixins that take the WorldScene, so
// game/world.js stays untouched). Swimming, the sea's two-frame swell, an NPC that keeps
// pace with Emily, plain images (a baby in a cradle, the cave's shimmer) that go away with the
// map, and a stylesheet loader for a day's own CSS.
import { tileIndex } from '../../art/register.js';
import { tileSize } from '../../art/index.js';
import { spawnPoint } from '../player.js';

// Emily in the water: head and shoulders (emily-swim), slower than walking. The player keeps
// whatever rig object it is given; world.setRiding() puts the walking rig back.
export const swimSpeed = 46;
const swimRig = {
  texture: 'emily-swim',
  idle: (face) => `${face}-0`,
  anim: (face) => `emily-swim-walk-${face}`,
  speed: swimSpeed,
  body: { w: 12, h: 8 },
};

export function setSwimming(world, on) {
  const player = world.player;
  if (!player?.sprite) return; // the headless walk-through (check-days.mjs) has no sprites
  if (!on) {
    world.setRiding(false);
    return;
  }
  player.rig = swimRig;
  const { sprite } = player;
  sprite.anims.stop();
  sprite.setTexture(swimRig.texture, swimRig.idle(player.face));
  sprite.body.setSize(swimRig.body.w, swimRig.body.h);
  sprite.body.setOffset((sprite.width - swimRig.body.w) / 2, sprite.height - swimRig.body.h);
}

// The open sea's two frames swap every 600 ms, like the shore water (world.swapWater only
// knows water-a/b). Stops by itself when the map changes.
export function swellDeepWater(world) {
  const map = world.map;
  if (!world.time?.addEvent) return () => {};
  const cells = [];
  map.ground.forEach((row, y) => row.forEach((name, x) => {
    if (name === 'water-deep-a' || name === 'water-deep-b') cells.push({ x, y, a: name === 'water-deep-a' });
  }));
  if (!cells.length) return () => {};
  const a = tileIndex('water-deep-a');
  const b = tileIndex('water-deep-b');
  const event = world.time.addEvent({
    delay: 600,
    loop: true,
    callback: () => {
      if (world.map !== map || !world.groundLayer) {
        event.remove();
        return;
      }
      for (const cell of cells) {
        cell.a = !cell.a;
        world.groundLayer.putTileAt(cell.a ? a : b, cell.x, cell.y);
      }
    },
  });
  return () => event.remove();
}

// An image standing on a tile (feet on its lower edge), destroyed with the map.
export function placeImage(world, key, frame, tile, { dx = 0, dy = 0, depth } = {}) {
  if (!world.add?.image) return null;
  const point = spawnPoint(tile);
  const image = world.add.image(point.x + dx, point.y + dy, key, frame).setOrigin(0.5, 1);
  image.setDepth(depth ?? image.y);
  world.mapObjects.push(image);
  return image;
}

// A looping sprite on a tile (the cave's shimmer), destroyed with the map.
export function placeSprite(world, key, anim, tile, { depth } = {}) {
  if (!world.add?.sprite) return null;
  const sprite = world.add.sprite(tile.x * tileSize, tile.y * tileSize, key).setOrigin(0, 0);
  sprite.setDepth(depth ?? (tile.y + 1) * tileSize + 1);
  if (anim && !world.reducedMotion) sprite.play(anim);
  world.mapObjects.push(sprite);
  return sprite;
}

// Keeps an NPC a little behind Emily (LQ swimming beside his mother). The NPC never blocks.
// Returns a stop function; it also stops when the NPC or the map goes.
export function follow(world, npc, { gap = 18, speed = 52 } = {}) {
  if (!npc?.sprite || !world.events?.on) return () => {};
  npc.sprite.body.enable = false;
  const map = world.map;
  let active = true;
  const step = (time, delta) => {
    if (!active || npc.gone || world.map !== map || !npc.sprite.active) {
      world.events.off('update', step);
      return;
    }
    if (npc.walking) return;
    const player = world.player.sprite;
    const face = world.player.face;
    const side = face === 'right' ? -1 : 1; // behind her: east of her when she swims west
    const tx = player.x + (face === 'up' || face === 'down' ? 0 : side * gap);
    const ty = player.y + (face === 'up' ? gap : face === 'down' ? -gap : 2);
    const dx = tx - npc.sprite.x;
    const dy = ty - npc.sprite.y;
    const distance = Math.hypot(dx, dy);
    const sheet = npc.sprite.texture.key;
    if (distance < 2) {
      npc.sprite.anims.stop();
      npc.sprite.setFrame(`${face}-0`);
      return;
    }
    const move = Math.min(distance, (speed * delta) / 1000 * (distance > 48 ? 2 : 1));
    npc.sprite.x += (dx / distance) * move;
    npc.sprite.y += (dy / distance) * move;
    const dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    npc.facing = dir;
    npc.sprite.anims.play(`${sheet}-walk-${dir}`, true);
  };
  world.events.on('update', step);
  return () => {
    active = false;
    world.events.off('update', step);
  };
}

// A day's own stylesheet (game/css/dayNN.css), added once.
export function useStylesheet(href) {
  if (typeof document === 'undefined') return;
  const url = new URL(href, import.meta.url).href;
  if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => link.href === url)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.append(link);
}
