// World helpers for Day 6 (PARALLEL-RULES §2): snow over the scene, and the places where the
// day's new blocks stand. Blocks and objects are added after a map is built
// (game/world/day05.js placeBlock / addObject), so the maps themselves stay as they are.
import { placeBlock, addObject } from './day05.js';

// Where the Xyzzy portal stands, by map: the block's top tile, the object Emily faces, the
// tile she steps out onto, and the spawn the cut uses. The book's portal "connected Emily's
// store to her house" (L6.28): one end beside the farmhouse, the other on the store's back
// wall, right of the shelves. `to` is where each end leads.
export const portalSpots = {
  foglands: { block: { x: 17, y: 7 }, object: { x: 17, y: 8 }, out: { x: 17, y: 9 }, spawn: 'porch', to: 'store' },
  store: { block: { x: 10, y: 0 }, object: { x: 10, y: 1 }, out: { x: 10, y: 2 }, spawn: 'door', to: 'foglands' },
};

// From Day 7 on the portals are part of the maps (maps/day07-foglands-farm.js, -store.js,
// -daedalus-house.js): by map and object id, the map and spawn each one leads to. The farm has
// two, the store's (L6.28) and the one "between their houses" (L7.02).
export const portalLinks = {
  foglands: { portal: ['store', 'portal'], 'portal-house': ['daedalus-house', 'portal-house'] },
  store: { portal: ['foglands', 'portal'] },
  'daedalus-house': { 'portal-house': ['foglands', 'portal-house'] },
};
export const portalLink = (mapId, objectId) => (mapId === undefined ? null : portalLinks[mapId]?.[objectId] ?? null);

// Steps through a portal: a quick fade, no hearts, no hour (unlike a door or a road).
export async function travelByPortal(ctx, objectId) {
  const link = portalLink(ctx.state.map, objectId);
  if (!link) return false;
  const [to, spawn] = link;
  const { world, state, hud, sound } = ctx;
  sound?.play('step');
  await world.fade('out', 300);
  state.map = to;
  state.spawn = spawn;
  world.enterMap(to, spawn);
  world.setSky(state.clock);
  hud.setPlace(world.map.name);
  hud.setScreens(null);
  sound?.setPlace(world.map.wind);
  await world.fade('in', 300);
  return true;
}

// The hedge maze in the garden east of the house (x 20–25, y 11–14): in at one foot (x 21 or
// 24, both clear of the farm's rocks), round the top lane (y 12), out at the other.
export const mazeSpot = { x: 20, y: 11 };
export const mazeTriggers = [
  { id: 'maze-top', x: 22, y: 12, w: 2, h: 1, type: 'trigger' },
  { id: 'maze-out', x: 21, y: 15, w: 4, h: 1, type: 'trigger' },
];

export function showPortal(world, mapId, { lit = false } = {}) {
  const spot = portalSpots[mapId];
  if (!spot) return [];
  const images = placeBlock(world, lit ? 'portal-lit' : 'portal', spot.block);
  addObject(world, { id: 'portal', ...spot.object, w: 1, h: 1, type: 'portal' });
  return images;
}

export function showMaze(world) {
  placeBlock(world, 'hedge-maze', mazeSpot);
  for (const trigger of mazeTriggers) addObject(world, trigger);
}

// Snowflakes falling over the view (screen space, under the mist). They outlast map changes;
// call the returned stop() when the snow should end (the day's end).
export function startSnow(world, { count = 46, reducedMotion = false } = {}) {
  if (typeof world.add?.image !== 'function') return () => {};
  let seed = 23;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const flakes = [];
  for (let i = 0; i < count; i++) {
    const x = rand() * 320;
    const y = rand() * 180;
    const image = world.add.image(Math.round(x), Math.round(y), 'snowflake', i % 3 ? 'flake-1' : 'flake-0').setOrigin(0, 0).setScrollFactor(0).setDepth(9450);
    flakes.push({ image, x, y, speed: 14 + rand() * 12, drift: 3 + rand() * 4 });
  }
  // one step per frame, in game pixels per second; whole pixels on screen
  const step = (time, delta) => {
    const dt = Math.min(delta, 50) / 1000;
    for (const flake of flakes) {
      flake.y += flake.speed * dt;
      flake.x -= flake.drift * dt;
      if (flake.y > 182) {
        flake.y = -4;
        flake.x = rand() * 330;
      }
      if (flake.x < -4) flake.x += 330;
      flake.image.setPosition(Math.round(flake.x), Math.round(flake.y));
    }
  };
  if (!reducedMotion) world.events.on('update', step);
  return () => {
    world.events.off('update', step);
    flakes.forEach((flake) => flake.image.destroy());
    flakes.length = 0;
  };
}
