// World helpers for Day 10 (archive/PARALLEL-RULES.md §2): the "brazen sham" look laid over Friendship
// once the chat is over (GAME-PLAN-DAYS §B Day 10 beat 2): a 1 px grid over every tile at
// alpha 0.25, the colours 30% desaturated, the mist stopped where it was; Alabaster on their
// knees; Emily taken apart pixel by pixel (the Editor's dissolve, game/npc.js).
// Every function is a no-op on a stand-in world (check-days.mjs).
import { tileSize } from '../../art/index.js';
import { createNpc } from '../npc.js';

const gridDepth = 9450; // over the world, under the mist (9500) and the sky (9600)
const gridKey = 'day10-grid';
const live = (world) => typeof world?.add?.tileSprite === 'function' && Array.isArray(world.mapObjects);

function gridTexture(world) {
  if (world.textures.exists(gridKey)) return;
  const texture = world.textures.createCanvas(gridKey, tileSize, tileSize);
  const context = texture.getContext();
  context.fillStyle = '#211f2b';
  context.fillRect(0, 0, tileSize, 1);
  context.fillRect(0, 0, 1, tileSize);
  texture.refresh();
}

// Lays the sham over the current map. Call again after every map change (the grid is a map
// object and goes with the map); the filter and the stopped mist stay until clearSham().
export function applySham(world) {
  if (!live(world)) return;
  gridTexture(world);
  world.shamGrid?.active && world.shamGrid.destroy();
  const grid = world.add.tileSprite(0, 0, world.map.width * tileSize, world.map.height * tileSize, gridKey)
    .setOrigin(0, 0).setDepth(gridDepth).setAlpha(0.25);
  world.mapObjects.push(grid);
  world.shamGrid = grid;
  world.game.canvas.style.filter = 'saturate(0.7)';
  const mist = world.mist;
  if (mist && !Object.prototype.hasOwnProperty.call(mist, 'tilePositionX')) {
    const still = mist.tilePositionX;
    // the scene drifts the mist by setting tilePositionX; hold it where it is
    Object.defineProperty(mist, 'tilePositionX', { configurable: true, get: () => still, set: () => {} });
  }
}

export function clearSham(world) {
  if (!live(world)) return;
  world.shamGrid?.active && world.shamGrid.destroy();
  world.shamGrid = null;
  world.game.canvas.style.filter = '';
  if (world.mist && Object.prototype.hasOwnProperty.call(world.mist, 'tilePositionX')) delete world.mist.tilePositionX;
}

// Alabaster lowers themself to their knees: the standing sprite gives way to the kneeling
// frame, drawn at the same feet position (both are 16×24, anchored bottom-centre).
export function kneel(world, npcKey) {
  const npc = world?.npc?.(npcKey);
  if (!npc?.sprite?.active || typeof world.add?.image !== 'function') return;
  const { sprite } = npc;
  sprite.setVisible(false);
  world.kneeling?.active && world.kneeling.destroy();
  world.kneeling = world.add.image(Math.round(sprite.x), Math.round(sprite.y), 'alabaster-kneel', 'kneel')
    .setOrigin(0.5, 1).setDepth(sprite.depth);
  world.mapObjects.push(world.kneeling);
}

// Emily disappears, pixel by pixel, where she stands.
export async function dissolveEmily(world, ms = 1800) {
  const player = world?.player;
  if (!player?.sprite?.active || typeof world.add?.image !== 'function') return;
  const sprite = player.sprite;
  const ghost = createNpc(world, { key: 'emily', tile: world.playerTile(), face: player.face, reducedMotion: world.reducedMotion });
  ghost.sprite.setFrame(sprite.frame.name);
  ghost.sprite.setPosition(Math.round(sprite.x), Math.round(sprite.y)).setDepth(sprite.depth);
  sprite.setVisible(false);
  await ghost.dissolve(ms);
}
