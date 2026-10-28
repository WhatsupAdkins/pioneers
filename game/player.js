// Emily (GAME-PLAN §6): an arcade body at her feet, four facings, on foot 60 px/s or riding
// Pixel at 110 px/s. The most recently pressed arrow wins, so movement stays on one axis.
import { tileSize } from '../art/index.js';

export const walkSpeed = 60;
export const rideSpeed = 110;
const rigs = {
  walk: { texture: 'emily', idle: (face) => `${face}-1`, anim: (face) => `emily-walk-${face}`, speed: walkSpeed, body: { w: 12, h: 8 } },
  ride: { texture: 'emily-riding', idle: (face) => `${face}-0`, anim: (face) => `emily-riding-walk-${face}`, speed: rideSpeed, body: { w: 16, h: 8 } },
};
const keyNames = { up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT' };
const velocityOf = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// Feet position for a spawn tile: centred, standing on the lower part of the tile.
export function spawnPoint(tile) {
  return { x: tile.x * tileSize + tileSize / 2, y: tile.y * tileSize + tileSize - 1 };
}

export function createPlayer(scene, { x, y, face = 'down', isSolidAt, onStep }) {
  const sprite = scene.physics.add.sprite(x, y, 'emily', `${face}-1`);
  sprite.setOrigin(0.5, 1);
  sprite.setCollideWorldBounds(true);
  sprite.setDepth(sprite.y);

  const player = { sprite, face, enabled: false, rig: rigs.walk, pose: null };
  const keys = scene.input.keyboard.addKeys(keyNames);
  const held = [];
  for (const [direction, key] of Object.entries(keys)) {
    key.on('down', () => {
      const at = held.indexOf(direction);
      if (at >= 0) held.splice(at, 1);
      held.push(direction);
      // A tap shorter than a frame still turns her to face that way.
      if (player.enabled) {
        player.face = direction;
        if (!sprite.anims.isPlaying) sprite.setFrame(player.rig.idle(direction));
      }
    });
  }
  let last = { x: sprite.x, y: sprite.y };
  let lastFrame = null;

  function fitBody() {
    const { w, h } = player.rig.body;
    sprite.body.setSize(w, h);
    sprite.body.setOffset((sprite.width - w) / 2, sprite.height - h);
  }
  fitBody();

  // When a step is blocked by a corner that at most half the body overlaps,
  // slide sideways into the open lane instead of sticking.
  function cornerAssist(direction) {
    const body = sprite.body;
    const { w, h } = player.rig.body;
    const speed = player.rig.speed;
    const [dx, dy] = velocityOf[direction];
    if (dx !== 0) {
      const tx = Math.floor((dx > 0 ? body.right + 1 : body.left - 1) / tileSize);
      const top = Math.floor(body.top / tileSize);
      const bottom = Math.floor((body.bottom - 1) / tileSize);
      if (top === bottom) return;
      const topSolid = isSolidAt(tx, top), bottomSolid = isSolidAt(tx, bottom);
      if (topSolid === bottomSolid) return;
      const overlap = topSolid ? (top + 1) * tileSize - body.top : body.bottom - bottom * tileSize;
      if (overlap * 2 > h) return;
      body.setVelocityY(topSolid ? speed : -speed);
      return;
    }
    const ty = Math.floor((dy > 0 ? body.bottom + 1 : body.top - 1) / tileSize);
    const left = Math.floor(body.left / tileSize);
    const right = Math.floor((body.right - 1) / tileSize);
    if (left === right) return;
    const leftSolid = isSolidAt(left, ty), rightSolid = isSolidAt(right, ty);
    if (leftSolid === rightSolid) return;
    const overlap = leftSolid ? (left + 1) * tileSize - body.left : body.right - right * tileSize;
    if (overlap * 2 > w) return;
    body.setVelocityX(leftSolid ? speed : -speed);
  }

  player.setEnabled = (enabled) => {
    player.enabled = enabled;
    held.length = 0;
    sprite.body.setVelocity(0, 0);
    if (!enabled) sprite.anims.stop();
  };

  player.setRig = (name) => {
    player.rig = rigs[name];
    sprite.anims.stop();
    sprite.setTexture(player.rig.texture, player.rig.idle(player.face));
    fitBody();
  };

  // A held frame such as 'skip' or 'interact' (walking rig only); null returns to normal.
  player.setPose = (frame) => {
    player.pose = player.rig === rigs.walk ? frame : null;
  };

  player.place = (point, face) => {
    sprite.body.reset(point.x, point.y);
    player.face = face ?? player.face;
    sprite.anims.stop();
    sprite.setFrame(player.rig.idle(player.face));
    sprite.setDepth(sprite.y);
    last = { x: sprite.x, y: sprite.y };
  };

  player.turn = (face) => {
    player.face = face;
    if (!sprite.anims.isPlaying) sprite.setFrame(player.rig.idle(face));
  };

  // Called from the scene's update; the velocity set here moves her on the next physics step.
  player.update = () => {
    for (let i = held.length - 1; i >= 0; i--) if (!keys[held[i]].isDown) held.splice(i, 1);
    const direction = player.enabled ? held[held.length - 1] : undefined;
    const body = sprite.body;
    body.setVelocity(0, 0);
    if (direction) {
      const [dx, dy] = velocityOf[direction];
      body.setVelocity(dx * player.rig.speed, dy * player.rig.speed);
      player.face = direction;
      const blocked = (dx > 0 && body.blocked.right) || (dx < 0 && body.blocked.left)
        || (dy > 0 && body.blocked.down) || (dy < 0 && body.blocked.up);
      if (blocked) cornerAssist(direction);
    }
  };

  // Called on the scene's postupdate, once physics has moved the sprite: the animation
  // follows real movement (none when pushing a wall) and depth follows the feet.
  player.postUpdate = () => {
    if (player.scripted) {
      // a cutscene is moving and animating her; only keep depth in step
      sprite.setDepth(sprite.y);
      last = { x: sprite.x, y: sprite.y };
      return;
    }
    const moved = Math.abs(sprite.x - last.x) + Math.abs(sprite.y - last.y) > 0.01;
    if (moved && player.enabled) {
      sprite.anims.play(player.rig.anim(player.face), true);
      const frame = sprite.frame.name;
      if (frame !== lastFrame && !frame.endsWith('-1')) onStep?.(player.rig === rigs.ride ? 'hoof' : 'step');
      lastFrame = frame;
    } else {
      sprite.anims.stop();
      sprite.setFrame(player.pose ?? player.rig.idle(player.face));
      lastFrame = null;
    }
    sprite.setDepth(sprite.y);
    last = { x: sprite.x, y: sprite.y };
  };

  return player;
}
