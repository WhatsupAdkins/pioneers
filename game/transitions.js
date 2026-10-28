// Map changes (GAME-PLAN §6): fade out, rebuild at the named spawn, one hour passes, fade in.
export async function changeMap(ctx, mapId, spawnName) {
  const { world, state, hud, sound } = ctx;
  await world.fade('out', 380);
  state.map = mapId;
  state.spawn = spawnName;
  world.enterMap(mapId, spawnName);
  state.clock = Math.min(23, state.clock + 1);
  world.setSky(state.clock);
  hud.setPlace(world.map.name);
  hud.setScreens(null);
  sound?.setPlace(world.map.wind);
  await world.fade('in', 380);
}

// Distance on the road HUD: one "screen" per 20 tiles (GAME-PLAN §8 beat 7).
export const screensFromTown = (tileX) => 1 + Math.floor(tileX / 20);
