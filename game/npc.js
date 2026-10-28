// NPCs (GAME-PLAN §8, GAME-PLAN-DAYS §A.4): walk along tile waypoints, face, hold a pose,
// wander a rectangle (stopping when Emily is close), walk up to Emily and talk (say), and the
// Editor's exit — a pixel-by-pixel dissolve (after arrival-scene's scattered pixels).
import { rasterize } from '../art/palette.js';
import { sprites, tileSize } from '../art/index.js';
import { spawnPoint } from './player.js';

const bodySize = { w: 12, h: 8 };

function directionOf(dx, dy) {
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'right' : 'left';
  return dy >= 0 ? 'down' : 'up';
}

export function createNpc(scene, { key, tile, face = 'down', reducedMotion = false }) {
  const start = spawnPoint(tile);
  const sprite = scene.add.sprite(start.x, start.y, key, `${face}-1`).setOrigin(0.5, 1);
  scene.physics.add.existing(sprite);
  sprite.body.setSize(bodySize.w, bodySize.h);
  sprite.body.setOffset((sprite.width - bodySize.w) / 2, sprite.height - bodySize.h);
  sprite.body.setImmovable(true);
  sprite.body.moves = false;
  sprite.setDepth(sprite.y);

  const npc = { key, sprite, face, walking: false, gone: false };

  Object.defineProperty(npc, 'tile', {
    get: () => ({ x: Math.floor(sprite.x / tileSize), y: Math.floor((sprite.y - 1) / tileSize) }),
  });

  npc.face = (direction) => {
    if (npc.gone) return;
    npc.facing = direction;
    sprite.anims.stop();
    sprite.setFrame(`${direction}-1`);
  };
  npc.facing = face;

  npc.pose = (frame) => {
    if (npc.gone) return;
    sprite.anims.stop();
    sprite.setFrame(frame ?? `${npc.facing}-1`);
  };

  // Straight lines between tile centres, one leg at a time. A new walk cancels one in progress.
  let walkId = 0;
  npc.walkPath = async (points, speed = 60) => {
    const id = ++walkId;
    scene.tweens.killTweensOf(sprite);
    npc.walking = true;
    sprite.body.enable = false; // a walking NPC never blocks Emily; a standing one does
    for (const point of points) {
      if (id !== walkId || npc.gone) return;
      const target = spawnPoint(point);
      const dx = target.x - sprite.x;
      const dy = target.y - sprite.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 1) continue;
      const direction = directionOf(dx, dy);
      npc.facing = direction;
      sprite.anims.play(`${sprite.texture.key}-walk-${direction}`, true); // the sheet shown (Day 11 swaps LQ to lq-swim at sea)
      await new Promise((resolve) => {
        scene.tweens.add({
          targets: sprite,
          x: target.x,
          y: target.y,
          duration: (distance / speed) * 1000,
          onUpdate: () => sprite.setDepth(sprite.y),
          onComplete: resolve,
        });
      });
    }
    // the map may have been rebuilt (and this sprite destroyed) while the last tween ran
    if (npc.gone || id !== walkId) return;
    sprite.anims.stop();
    sprite.setFrame(`${npc.facing}-1`);
    sprite.body.enable = true;
    sprite.body.reset(sprite.x, sprite.y);
    npc.walking = false;
  };

  // Toward a neighbouring tile: the facing that looks from `from` to `to`.
  const faceToward = (from, to) => directionOf(to.x - from.x, to.y - from.y);

  // Ambles around `area` ({ x, y, w, h } in tiles) one tile at a time, never onto a solid
  // tile, Emily, another NPC or an `avoid` rectangle; stands still facing Emily while she is
  // within two tiles.
  let wandering = false;
  npc.wander = (area, { seed = 1, speed = 28, avoid = [] } = {}) => {
    wandering = true;
    let rng = seed * 9301 + 49297;
    const rand = () => {
      rng = (rng * 16807) % 2147483647;
      return rng / 2147483647;
    };
    const free = (tile) => tile.x >= area.x && tile.y >= area.y && tile.x < area.x + area.w && tile.y < area.y + area.h
      && !scene.isSolidAt(tile.x, tile.y) && !scene.occupied?.(tile, npc)
      && !avoid.some((r) => tile.x >= r.x && tile.y >= r.y && tile.x < r.x + r.w && tile.y < r.y + r.h);
    const step = async () => {
      if (!wandering || npc.gone) return;
      const here = npc.tile;
      const emily = scene.player ? scene.playerTile() : null;
      if (emily && Math.abs(emily.x - here.x) + Math.abs(emily.y - here.y) <= 2) {
        if (!npc.walking) npc.face(faceToward(here, emily));
        scene.time.delayedCall(500, step);
        return;
      }
      if (rand() < 0.55) {
        const [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rand() * 4)];
        const next = { x: here.x + dx, y: here.y + dy };
        if (free(next)) await npc.walkPath([next], speed);
      }
      if (wandering && !npc.gone) scene.time.delayedCall(700 + rand() * 1800, step);
    };
    scene.time.delayedCall(300 + rand() * 900, step);
  };
  npc.stopWander = () => {
    wandering = false;
  };

  // Walks to the tile in front of Emily, faces her, and runs a dialogue node (the scene's
  // `say` hook). `stand` overrides where to stop.
  npc.say = async (nodeId, { stand, speed = 60 } = {}) => {
    npc.stopWander();
    const emily = scene.playerTile();
    const target = stand ?? [[0, 1], [-1, 0], [1, 0], [0, -1]]
      .map(([dx, dy]) => ({ x: emily.x + dx, y: emily.y + dy }))
      .find((tile) => !scene.isSolidAt(tile.x, tile.y)) ?? emily;
    const from = npc.tile;
    await npc.walkPath([{ x: target.x, y: from.y }, target], speed);
    npc.face(faceToward(target, emily));
    scene.facePlayer(faceToward(emily, target));
    await scene.hooks.say?.(nodeId);
  };

  npc.destroy = () => {
    npc.gone = true;
    wandering = false;
    sprite.destroy();
  };

  // Removes the current frame one pixel at a time, a few pixels drifting up as they go.
  npc.dissolve = (ms = 1400) => new Promise((resolve) => {
    if (reducedMotion) {
      scene.tweens.add({ targets: sprite, alpha: 0, duration: 300, onComplete: () => { npc.destroy(); resolve(); } });
      return;
    }
    const sheet = sprites[key];
    const art = rasterize(sheet.frames[sprite.frame.name], `${key} ${sprite.frame.name}`, sheet.w, sheet.h);
    const textureKey = `${key}-dissolve`;
    if (scene.textures.exists(textureKey)) scene.textures.remove(textureKey);
    const texture = scene.textures.createCanvas(textureKey, sheet.w, sheet.h);
    const context = texture.getContext();
    const image = new ImageData(new Uint8ClampedArray(art.data), sheet.w, sheet.h);
    context.putImageData(image, 0, 0);
    texture.refresh();
    const ghost = scene.add.image(Math.round(sprite.x), Math.round(sprite.y), textureKey).setOrigin(0.5, 1).setDepth(sprite.depth);
    const left = Math.round(sprite.x - sheet.w / 2);
    const top = Math.round(sprite.y - sheet.h);
    npc.destroy();

    const opaque = [];
    for (let i = 0; i < sheet.w * sheet.h; i++) if (image.data[i * 4 + 3]) opaque.push(i);
    let seed = 7;
    for (let i = opaque.length - 1; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [opaque[i], opaque[j]] = [opaque[j], opaque[i]];
    }
    const started = scene.time.now;
    let removed = 0;
    const timer = scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        const due = Math.min(opaque.length, Math.ceil(((scene.time.now - started) / ms) * opaque.length));
        for (; removed < due; removed++) {
          const index = opaque[removed];
          const [r, g, b] = image.data.subarray(index * 4, index * 4 + 3);
          image.data[index * 4 + 3] = 0;
          if (removed % 6 === 0) {
            const mote = scene.add.rectangle(left + (index % sheet.w), top + Math.floor(index / sheet.w), 1, 1, (r << 16) | (g << 8) | b)
              .setOrigin(0, 0).setDepth(ghost.depth + 1);
            scene.tweens.add({ targets: mote, y: mote.y - 10 - (index % 7), alpha: 0, duration: 700, onComplete: () => mote.destroy() });
          }
        }
        context.putImageData(image, 0, 0);
        texture.refresh();
        if (removed >= opaque.length) {
          timer.remove();
          ghost.destroy();
          scene.textures.remove(textureKey);
          resolve();
        }
      },
    });
  });

  return npc;
}
