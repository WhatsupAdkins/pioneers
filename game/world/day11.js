// World helpers for Day 11 (archive/PARALLEL-RULES.md §2: a day's new world methods live in
// game/world/dayNN.js and take the scene). Each returns a stop() that removes what it made.
//
// swimSprites: Emily and LQ in the water use Run 5's swimming sprites (emily-swim, lq-swim).
// follow: an NPC trails Emily along the path she swam, a few steps behind.
// endFog: fog that thickens over the last screens before the end of the ocean (Run 5's
//   fog-wall tiles stand at screen 10, maps/day11-ocean.js).
import { setSwimming } from './day07.js';

// Emily and LQ swim with the head-and-shoulders sprites of Day 7 (emily-swim, lq-swim) while
// they are off the sand, and walk on it (LQ as lq-11). inWater(x) takes a sprite's x in pixels.
export function swimSprites(world, { inWater, lq = () => null }) {
  const tick = () => {
    const player = world.player;
    if (player?.sprite?.active) {
      const swimming = player.rig?.texture === 'emily-swim';
      const wet = inWater(player.sprite.x);
      if (wet && !swimming) setSwimming(world, true);
      else if (!wet && swimming) world.setRiding(false);
    }
    const npc = lq();
    const sprite = npc?.sprite;
    if (sprite?.active && !npc.gone) {
      const want = inWater(sprite.x) ? 'lq-swim' : 'lq-11';
      if (sprite.texture.key !== want) {
        sprite.anims.stop();
        sprite.setTexture(want, `${npc.facing ?? 'left'}-1`);
      }
    }
  };
  world.events.on('postupdate', tick);
  return () => world.events.off('postupdate', tick);
}

// The NPC stands where Emily stood `lag` moves ago and walks on only while she moves.
export function follow(world, npc, { lag = 22 } = {}) {
  const trail = [];
  const sprite = npc.sprite;
  sprite.body.enable = false; // he never blocks her
  let facing = npc.facing ?? 'right';
  const idle = () => {
    sprite.anims.stop();
    sprite.setFrame(`${facing}-1`);
  };
  const tick = () => {
    const emily = world.player?.sprite;
    if (!emily?.active || npc.gone) return;
    const here = { x: Math.round(emily.x), y: Math.round(emily.y) };
    const last = trail.at(-1);
    if (last && last.x === here.x && last.y === here.y) return idle();
    trail.push(here);
    if (trail.length <= lag) return idle();
    const to = trail.shift();
    const dx = to.x - sprite.x;
    const dy = to.y - sprite.y;
    if (Math.abs(dx) + Math.abs(dy) >= 0.5) {
      facing = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      npc.facing = facing;
      sprite.anims.play(`${sprite.texture.key}-walk-${facing}`, true);
    }
    sprite.setPosition(to.x, to.y);
    sprite.setDepth(sprite.y);
    return undefined;
  };
  world.events.on('postupdate', tick);
  return () => {
    world.events.off('postupdate', tick);
    if (npc.gone) return;
    idle();
    sprite.body.enable = true;
    sprite.body.reset(sprite.x, sprite.y);
  };
}

// alphaAt(x) gives the fog's alpha for Emily's x (in pixels).
export function endFog(world, alphaAt) {
  const fog = world.add.tileSprite(0, 0, 320, 180, 'mist', 'tile-0').setOrigin(0, 0).setScrollFactor(0).setDepth(9450).setAlpha(0);
  const update = () => {
    const emily = world.player?.sprite;
    if (!emily) return;
    fog.setAlpha(alphaAt(emily.x));
    if (!world.reducedMotion) fog.tilePositionX = Math.round(world.time.now / 90);
  };
  world.events.on('postupdate', update);
  return () => {
    world.events.off('postupdate', update);
    fog.destroy();
  };
}

// A grey wash over the whole view: Day 11 has no season.
export function greyWash(world, alpha = 0.18) {
  const wash = world.add.rectangle(0, 0, 320, 180, 0x8b919e, alpha).setOrigin(0, 0).setScrollFactor(0).setDepth(9420);
  return () => wash.destroy();
}
