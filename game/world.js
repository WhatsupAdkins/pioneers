// WorldScene (GAME-PLAN §3, §5): the Phaser canvas only. Builds a map from maps/*.js (the
// version for the current day), places Emily and NPCs, sorts depth by the feet line, and runs
// the camera, sky tint, mist, water, seasons and the train. It shows the E prompt over Emily
// when she faces something usable (GAME-PLAN-DAYS §A.3). It reports what happens (tile,
// trigger, exit) and the day script decides.
import { registerArt, tileIndex, outlineTexture } from '../art/register.js';
import { rasterize } from '../art/palette.js';
import { blocks, tiles, tileSize, sprites } from '../art/index.js';
import { mapFor } from '../maps/versions.js';
import { collisionGrid } from '../maps/grid.js';
import { createPlayer, spawnPoint } from './player.js';
import { createNpc } from './npc.js';

const view = { width: 320, height: 180 };
const groundDepth = -1;
const fireflyDepth = 9400;
const mistDepth = 9500;
const skyDepth = 9600;
const promptDepth = 9700;
const fadeColour = [0x21, 0x1f, 0x2b];
const steps = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// Mist per map (GAME-PLAN §5): a map's `mist` is an alpha, or [west, east] to thicken along x.
function mistAlpha(mist, x, width) {
  if (!Array.isArray(mist)) return mist ?? 0;
  const t = Math.min(1, Math.max(0, x / width));
  return mist[0] + (mist[1] - mist[0]) * t;
}

// Seasons swap ground tiles (GAME-PLAN-DAYS §A.4). A list alternates by position.
// Swaps whose tile is not drawn yet are skipped.
const seasonGround = {
  spring: {},
  summer: { 'frost-grass': ['grass-a', 'grass-b'], 'crocus-grass': 'grass-b' },
  autumn: { 'grass-a': 'autumn-grass', 'grass-b': 'autumn-grass', 'frost-grass': 'autumn-grass', 'crocus-grass': 'autumn-grass' },
  winter: { 'grass-a': 'snow-grass', 'grass-b': 'snow-grass', 'frost-grass': 'snow-grass', 'crocus-grass': 'snow-grass' },
};

const inRect = (rect, tile) => tile.x >= rect.x && tile.x < rect.x + (rect.w ?? 1) && tile.y >= rect.y && tile.y < rect.y + (rect.h ?? 1);

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('world');
    this.map = null;
    this.player = null;
    this.npcs = new Map();
    this.hooks = {};
    this.reducedMotion = false;
    this.season = 'spring';
    this.day = 1;
    this.groundOverrides = new Map(); // 'x,y' → tile name, for plots and the like
    this.outlines = new Map(); // texture cache for target outlines
  }

  create() {
    registerArt(this);
    this.mist = this.add.tileSprite(0, 0, view.width, view.height, 'mist', 'tile-0')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(mistDepth).setAlpha(0);
    this.sky = this.add.rectangle(0, 0, view.width, view.height, 0x000000, 0)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(skyDepth);
    // The E prompt over Emily and the 1 px outline on what she faces (GAME-PLAN-DAYS §A.3).
    this.prompt = this.textures.exists('prompt-e')
      ? this.add.image(0, 0, 'prompt-e').setOrigin(0.5, 1).setDepth(promptDepth).setVisible(false)
      : null;
    this.outline = this.add.image(0, 0, '__DEFAULT').setOrigin(0, 0).setAlpha(0.6).setVisible(false);
    this.promptKey = null;
    this.buildMap('friendship');
    this.events.on('postupdate', () => this.afterPhysics());
    this.time.addEvent({ delay: 600, loop: true, callback: () => this.swapWater() });
    this.time.addEvent({ delay: 160, loop: true, callback: () => { if (!this.reducedMotion) this.mist.tilePositionX += 1; } });
    this.game.events.emit('world-ready', this);
  }

  buildMap(id) {
    const map = mapFor(id, this.day);
    if (!map) throw new Error(`Unknown map '${id}'`);
    this.map = map;
    this.mapObjects?.forEach((object) => object.destroy());
    this.mapObjects = [];
    this.extraProps = new Map();
    this.groundOverrides = new Map();
    this.stopFireflies?.();
    this.npcs.forEach((npc) => npc.destroy());
    this.npcs.clear();
    this.tilemap?.destroy();
    this.clearPrompt();
    const keep = (object) => {
      this.mapObjects.push(object);
      return object;
    };

    const tilemap = this.make.tilemap({
      data: map.ground.map((row, y) => row.map((name, x) => tileIndex(this.seasonal(name, x, y)))),
      tileWidth: tileSize,
      tileHeight: tileSize,
    });
    const tileset = tilemap.addTilesetImage('tileset', 'tileset', tileSize, tileSize, 0, 0);
    this.groundLayer = keep(tilemap.createLayer(0, tileset, 0, 0)).setDepth(groundDepth);
    this.tilemap = tilemap;

    // Collision lives on an invisible layer derived from tile kinds (maps/grid.js).
    this.solid = collisionGrid(map);
    const collide = keep(tilemap.createBlankLayer('collide', tileset, 0, 0, map.width, map.height));
    this.solid.forEach((row, y) => row.forEach((isSolid, x) => isSolid && collide.putTileAt(0, x, y)));
    collide.setCollision(0).setVisible(false);
    this.collideLayer = collide;

    // Water tiles swap frames every 600 ms.
    this.water = [];
    map.ground.forEach((row, y) => row.forEach((name, x) => {
      if (name === 'water-a' || name === 'water-b') this.water.push({ x, y, a: name === 'water-a' });
    }));

    // Props and blocks stand on their base line: depth = the y where they meet the ground.
    map.props.forEach((row, y) => row.forEach((name, x) => {
      if (name) keep(this.add.image(x * tileSize, y * tileSize, 'tileset', name).setOrigin(0, 0).setDepth((y + 1) * tileSize));
    }));
    for (const placed of map.blocks) {
      const block = blocks[placed.name];
      const base = (placed.y + block.h) * tileSize;
      block.tiles.forEach((row, cy) => row.forEach((name, cx) => {
        if (name) keep(this.add.image((placed.x + cx) * tileSize, (placed.y + cy) * tileSize, 'tileset', name).setOrigin(0, 0).setDepth(base));
      }));
    }

    const width = map.width * tileSize;
    const height = map.height * tileSize;
    this.physics.world.setBounds(0, 0, width, height);
    const camera = this.cameras.main;
    // a room smaller than the 320×180 view is centred in it, not pinned top-left
    const viewW = Math.max(width, 320);
    const viewH = Math.max(height, 180);
    camera.setBounds(Math.round((width - viewW) / 2), Math.round((height - viewH) / 2), viewW, viewH).setRoundPixels(true).setZoom(1);
    const look = spawnPoint(map.spawns['from-train'] ?? Object.values(map.spawns)[0]);
    camera.centerOn(look.x, look.y - tileSize);
  }

  // The ground tile shown for a map cell in the current season.
  seasonal(name, x, y) {
    const swap = seasonGround[this.season]?.[name];
    const to = Array.isArray(swap) ? swap[(x * 7 + y * 3) % swap.length] : swap;
    return to && tiles[to] ? to : name;
  }

  setSeason(season) {
    this.season = season;
    if (!this.groundLayer) return;
    this.map.ground.forEach((row, y) => row.forEach((name, x) => {
      if (this.groundOverrides.has(`${x},${y}`) || name === 'water-a' || name === 'water-b') return;
      this.groundLayer.putTileAt(tileIndex(this.seasonal(name, x, y)), x, y);
    }));
  }

  // Replaces one ground cell until the map is rebuilt (plot stages, a cleared path).
  setGroundTile(x, y, name) {
    this.groundOverrides.set(`${x},${y}`, name);
    this.groundLayer.putTileAt(tileIndex(name), x, y);
  }

  // A loose prop placed by a day (a plate on the porch); gone when the map is rebuilt.
  placeProp(key, tile, name) {
    this.extraProps.get(key)?.destroy();
    const image = this.add.image(tile.x * tileSize, tile.y * tileSize, 'tileset', name).setOrigin(0, 0).setDepth((tile.y + 1) * tileSize);
    this.extraProps.set(key, image);
    this.mapObjects.push(image);
    return image;
  }

  removeProp(key) {
    this.extraProps.get(key)?.destroy();
    this.extraProps.delete(key);
  }

  // Twelve fireflies drifting around a point (GAME-PLAN-DAYS §B Day 2 beat 4).
  fireflies(center, count = 12) {
    this.stopFireflies?.();
    const flies = [];
    let seed = 11;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const origin = spawnPoint(center);
    for (let i = 0; i < count; i++) {
      const x = Math.round(origin.x + (rand() - 0.5) * 120);
      const y = Math.round(origin.y - 10 + (rand() - 0.5) * 70);
      const fly = this.add.sprite(x, y, 'firefly', 'glow-0').setDepth(fireflyDepth);
      if (!this.reducedMotion) {
        fly.play({ key: 'firefly-blink', startFrame: i % 2 });
        this.tweens.add({
          targets: fly,
          x: x + Math.round((rand() - 0.5) * 40),
          y: y + Math.round((rand() - 0.5) * 24),
          duration: 1800 + rand() * 2200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          onUpdate: () => fly.setPosition(Math.round(fly.x), Math.round(fly.y)),
        });
      }
      flies.push(fly);
    }
    this.stopFireflies = () => {
      flies.forEach((fly) => fly.destroy());
      this.stopFireflies = null;
    };
    return this.stopFireflies;
  }

  swapWater() {
    if (!this.water?.length || !this.groundLayer) return;
    const a = tileIndex('water-a');
    const b = tileIndex('water-b');
    for (const cell of this.water) {
      cell.a = !cell.a;
      this.groundLayer.putTileAt(cell.a ? a : b, cell.x, cell.y);
    }
  }

  // ---------------------------------------------------------------- play
  begin(state, hooks = {}) {
    this.state = state;
    this.hooks = hooks;
    this.reducedMotion = Boolean(hooks.reducedMotion);
    this.day = state.day ?? 1;
    this.season = state.season ?? 'spring';
    this.player?.setRig('walk');
    this.cameras.main.resetFX(); // a day that ended faded out must not start black
    this.enterMap(state.map, state.spawn);
    this.setSky(state.clock);
  }

  enterMap(id, spawnName) {
    this.buildMap(id);
    const spawn = this.map.spawns[spawnName];
    if (!spawn) throw new Error(`${id}: unknown spawn '${spawnName}'`);
    const point = spawnPoint(spawn);
    if (!this.player) {
      this.player = createPlayer(this, {
        ...point,
        face: spawn.face,
        isSolidAt: (x, y) => this.isSolidAt(x, y),
        onStep: (kind) => this.hooks.onStep?.(kind),
      });
    }
    this.player.place(point, spawn.face);
    this.playerCollider?.destroy();
    this.playerCollider = this.physics.add.collider(this.player.sprite, this.collideLayer);
    this.cameras.main.setZoom(1).startFollow(this.player.sprite, true);
    this.inside = new Set();
    this.lastTile = this.playerTile();
    this.updateMist();
    this.hooks.onMapBuilt?.(id);
  }

  isSolidAt(x, y) {
    const map = this.map;
    return x < 0 || y < 0 || x >= map.width || y >= map.height || this.solid[y][x];
  }

  groundAt(x, y) {
    return this.groundOverrides.get(`${x},${y}`) ?? this.map.ground[y]?.[x];
  }

  playerTile() {
    const sprite = this.player.sprite;
    return { x: Math.floor(sprite.x / tileSize), y: Math.floor((sprite.y - 1) / tileSize) };
  }

  setControl(enabled) {
    this.player?.setEnabled(enabled);
  }

  // The NPC or map object one tile ahead of Emily (or under her), for E / Space.
  facingTarget() {
    if (!this.player) return null;
    const tile = this.playerTile();
    const [dx, dy] = steps[this.player.face];
    const ahead = { x: tile.x + dx, y: tile.y + dy };
    for (const npc of this.npcs.values()) {
      if (npc.walking || npc.gone) continue;
      const at = npc.tile;
      if (ahead.y === at.y && ahead.x >= at.x && ahead.x < at.x + (npc.w ?? 1)) return { npc: npc.key };
    }
    const usable = this.map.objects.filter((object) => object.type !== 'trigger');
    return usable.find((object) => inRect(object, ahead)) ?? usable.find((object) => inRect(object, tile)) ?? null;
  }

  update() {
    this.player?.update();
  }

  // ---------------------------------------------------------------- the E prompt
  clearPrompt() {
    this.prompt?.setVisible(false);
    this.outline?.setVisible(false);
    this.promptKey = null;
  }

  // Opaque pixels of what stands on a map object's rectangle (props and blocks), clipped to
  // it; a bare rectangle (a plot, a doorway) is treated as filled, so it gets a frame.
  objectMask(object) {
    const w = (object.w ?? 1) * tileSize;
    const h = (object.h ?? 1) * tileSize;
    const mask = { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
    const stamp = (art, left, top) => {
      for (let y = 0; y < art.height; y++) {
        for (let x = 0; x < art.width; x++) {
          const mx = left + x;
          const my = top + y;
          if (mx < 0 || my < 0 || mx >= w || my >= h) continue;
          const s = (y * art.width + x) * 4;
          if (art.data[s + 3]) mask.data.set(art.data.subarray(s, s + 4), (my * w + mx) * 4);
        }
      }
    };
    for (let ty = object.y; ty < object.y + (object.h ?? 1); ty++) {
      for (let tx = object.x; tx < object.x + (object.w ?? 1); tx++) {
        const prop = this.map.props[ty]?.[tx];
        if (prop) stamp(rasterize(tiles[prop], `tile ${prop}`), (tx - object.x) * tileSize, (ty - object.y) * tileSize);
      }
    }
    for (const placed of this.map.blocks) {
      const block = blocks[placed.name];
      if (placed.x >= object.x + (object.w ?? 1) || placed.x + block.w <= object.x) continue;
      if (placed.y >= object.y + (object.h ?? 1) || placed.y + block.h <= object.y) continue;
      stamp(rasterize(block.rows, `block ${placed.name}`), (placed.x - object.x) * tileSize, (placed.y - object.y) * tileSize);
    }
    let opaque = false;
    for (let i = 3; i < mask.data.length; i += 4) if (mask.data[i]) { opaque = true; break; }
    if (!opaque) mask.data.fill(255);
    return mask;
  }

  // Shows the E prompt and the outline for the target Emily faces, or hides them.
  updatePrompt() {
    const player = this.player;
    if (!player?.enabled || !player.sprite.visible) {
      this.clearPrompt();
      return;
    }
    const target = this.facingTarget();
    if (!target || !(this.hooks.canInteract?.(target) ?? true)) {
      this.clearPrompt();
      return;
    }
    const sprite = player.sprite;
    this.prompt?.setPosition(Math.round(sprite.x), Math.round(sprite.y - sprite.height - 2)).setVisible(true);

    if (target.npc) {
      const npc = this.npcs.get(target.npc);
      const frame = npc?.sprite?.frame?.name;
      if (!npc?.sprite?.active || !frame) {
        this.outline.setVisible(false);
        return;
      }
      const key = `outline:${npc.sprite.texture.key}:${frame}`;
      if (!this.textures.exists(key)) {
        const sheet = sprites[npc.sprite.texture.key];
        outlineTexture(this, key, rasterize(sheet.frames[frame], `${key}`, sheet.w, sheet.h));
      }
      const flip = npc.sprite.flipX;
      this.outline.setTexture(key).setFlipX(flip)
        .setPosition(Math.round(npc.sprite.x - npc.sprite.width / 2) - 1, Math.round(npc.sprite.y - npc.sprite.height) - 1)
        .setDepth(npc.sprite.depth + 0.5)
        .setVisible(true);
      this.promptKey = key;
      return;
    }
    const key = `outline:${this.map.id}@${this.map.from ?? 1}:${target.id}`;
    if (this.promptKey !== key) {
      if (!this.textures.exists(key)) outlineTexture(this, key, this.objectMask(target));
      this.outline.setTexture(key).setFlipX(false)
        .setPosition(target.x * tileSize - 1, target.y * tileSize - 1)
        .setDepth((target.y + (target.h ?? 1)) * tileSize + 0.5)
        .setVisible(true);
      this.promptKey = key;
    }
  }

  afterPhysics() {
    if (!this.player) return;
    this.player.postUpdate();
    this.npcs.forEach((npc) => npc.sprite?.active && npc.sprite.setDepth(npc.sprite.y));
    this.updatePrompt();
    const tile = this.playerTile();
    if (tile.x !== this.lastTile?.x || tile.y !== this.lastTile?.y) {
      this.lastTile = tile;
      if (this.player.enabled) this.reportTile(tile);
    }
    this.updateMist();
  }

  reportTile(tile) {
    this.hooks.onTile?.({ ...tile, ground: this.groundAt(tile.x, tile.y), map: this.map.id });
    for (const object of this.map.objects) {
      if (object.type !== 'trigger') continue;
      const now = inRect(object, tile);
      if (now && !this.inside.has(object.id)) {
        this.inside.add(object.id);
        this.hooks.onTrigger?.(object);
      } else if (!now) this.inside.delete(object.id);
    }
    const exit = this.map.exits.find((zone) => inRect(zone, tile));
    if (exit) this.hooks.onExit?.(exit);
  }

  updateMist() {
    const width = this.map.width * tileSize;
    const x = this.player ? this.player.sprite.x : 0;
    this.mist.setAlpha(mistAlpha(this.map.mist, x, width));
  }

  // ---------------------------------------------------------------- actors
  spawnNpc(key, tile, face = 'down') {
    this.npcs.get(key)?.destroy();
    const npc = createNpc(this, { key, tile, face, reducedMotion: this.reducedMotion });
    if (this.player) this.physics.add.collider(this.player.sprite, npc.sprite);
    this.npcs.set(key, npc);
    return npc;
  }

  npc(key) {
    const npc = this.npcs.get(key);
    return npc && !npc.gone ? npc : null;
  }

  // Whether a tile holds Emily or an NPC other than `except` (for wandering).
  occupied(tile, except) {
    const emily = this.player ? this.playerTile() : null;
    if (emily && emily.x === tile.x && emily.y === tile.y) return true;
    for (const npc of this.npcs.values()) {
      if (npc === except || npc.gone) continue;
      const at = npc.tile;
      if (at.y === tile.y && tile.x >= at.x && tile.x < at.x + (npc.w ?? 1)) return true;
    }
    return false;
  }

  // Pixel stands somewhere (outside the pen until bought; by the house later): an actor,
  // not a walker. She covers two tiles, `tile` and the one east of it; west faces left.
  showPixel(tile, face = 'east') {
    this.npcs.get('pixel')?.destroy();
    if (!tile) return;
    const point = spawnPoint(tile);
    const sprite = this.add.sprite(point.x + tileSize / 2, point.y, 'pixel', 'east-0').setOrigin(0.5, 1).setDepth(point.y);
    sprite.setFlipX(face === 'west');
    sprite.play('pixel-idle');
    const actor = {
      key: 'pixel',
      sprite,
      w: 2, // she covers two tiles; either one answers E
      walking: false,
      gone: false,
      tile: { ...tile },
      destroy: () => { actor.gone = true; sprite.destroy(); },
    };
    this.npcs.set('pixel', actor);
  }

  setRiding(riding) {
    this.player.setRig(riding ? 'ride' : 'walk');
  }

  facePlayer(face) {
    this.player.turn(face);
  }

  // Puts Emily on a named spawn of the current map (a cut, e.g. back on the porch steps).
  placePlayer(spawnName) {
    const spawn = this.map.spawns[spawnName];
    if (!spawn) throw new Error(`${this.map.id}: unknown spawn '${spawnName}'`);
    this.player.place(spawnPoint(spawn), spawn.face);
    this.lastTile = this.playerTile();
  }

  playerPose(frame) {
    this.player.setPose(frame);
  }

  setPlayerVisible(visible) {
    this.player.sprite.setVisible(visible);
  }

  // ---------------------------------------------------------------- camera, sky
  fade(direction, ms = 400) {
    const camera = this.cameras.main;
    return new Promise((resolve) => {
      const done = direction === 'out' ? 'camerafadeoutcomplete' : 'camerafadeincomplete';
      camera.once(done, () => resolve());
      // force: a new fade replaces one still running, so the promise always settles
      if (direction === 'out') camera.fade(Math.max(1, ms), ...fadeColour, true);
      else camera.fadeFrom(Math.max(1, ms), ...fadeColour, true);
    });
  }

  // A cut (fade out, move, fade in) instead of a pan or zoom tween: zoom stays an integer.
  async lookAt(tile, { zoom = 1 } = {}) {
    await this.fade('out', 260);
    const camera = this.cameras.main;
    camera.stopFollow();
    camera.setZoom(zoom);
    camera.centerOn(tile.x * tileSize, tile.y * tileSize);
    await this.fade('in', 260);
  }

  async lookAtPlayer() {
    await this.fade('out', 260);
    this.cameras.main.setZoom(1).startFollow(this.player.sprite, true);
    await this.fade('in', 260);
  }

  // Sky tint from the clock (GAME-PLAN §6): warm from 16:00, blue-grey by 19:00.
  setSky(hour) {
    if (hour < 16) this.sky.setFillStyle(0xf6cf85, 0);
    else if (hour < 19) this.sky.setFillStyle(0xf6cf85, 0.08 + (hour - 16) * 0.04);
    else this.sky.setFillStyle(0x3a3d52, 0.38);
  }

  // A summer night over the scene (the carrot on the porch steps), deeper than the clock's tint.
  night() {
    this.sky.setAlpha(1);
    this.sky.setFillStyle(0x211f2b, 0.55);
  }

  dusk(ms = 2000) {
    this.sky.setFillStyle(0x3a3d52, this.sky.fillColor === 0x3a3d52 ? this.sky.fillAlpha : 0);
    return new Promise((resolve) => {
      if (this.reducedMotion) {
        this.sky.setAlpha(1);
        this.sky.setFillStyle(0x3a3d52, 0.42);
        resolve();
        return;
      }
      this.tweens.addCounter({
        from: this.sky.fillAlpha,
        to: 0.42,
        duration: ms,
        onUpdate: (tween) => this.sky.setFillStyle(0x3a3d52, tween.getValue()),
        onComplete: resolve,
      });
    });
  }

  // ---------------------------------------------------------------- the train
  trainArrive(ms = 4200) {
    const y = 24 * tileSize + 7; // wheel bottoms (row 39) on the lower rail
    const train = this.add.sprite(-170, y, 'train', 'right-0').setOrigin(0, 1).setDepth(y);
    this.train = train;
    this.trainPuffs = this.time.addEvent({ delay: 280, loop: true, callback: () => this.puff() });
    return new Promise((resolve) => {
      this.tweens.add({
        targets: train,
        x: 33, // the coach door (sprite x 35–43) stops over the from-train tile
        duration: ms,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.trainPuffs.remove();
          resolve();
        },
      });
    });
  }

  puff() {
    const train = this.train;
    if (!train?.active) return;
    const steam = this.add.sprite(Math.round(train.x) + this.trainStack.x, train.y - this.trainStack.y, 'steam', 'puff-0')
      .setDepth(train.depth + 1);
    steam.play('steam-puff');
    this.tweens.add({ targets: steam, y: steam.y - 18, x: steam.x - 8, alpha: 0, duration: 1100, onComplete: () => steam.destroy() });
  }

  trainDepart(ms = 6500) {
    const train = this.train;
    if (!train?.active) return;
    this.trainPuffs = this.time.addEvent({ delay: 220, loop: true, callback: () => this.puff() });
    this.tweens.add({
      targets: train,
      x: this.map.width * tileSize + 20,
      duration: ms,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.trainPuffs.remove();
        train.destroy();
        this.train = null;
      },
    });
  }

  // Emily steps off the train onto the platform at the from-train spawn.
  stepOffTrain() {
    const player = this.player;
    const end = spawnPoint(this.map.spawns['from-train']);
    player.sprite.body.enable = false;
    player.scripted = true;
    player.sprite.setVisible(true);
    player.sprite.setPosition(end.x, end.y + 12);
    player.face = 'up';
    player.sprite.play('emily-walk-up');
    return new Promise((resolve) => {
      this.tweens.add({
        targets: player.sprite,
        y: end.y,
        duration: 700,
        onUpdate: () => player.sprite.setDepth(player.sprite.y),
        onComplete: () => {
          player.sprite.body.enable = true;
          player.scripted = false;
          player.place(end, 'down');
          resolve();
        },
      });
    });
  }
}

// Where steam leaves the locomotive, relative to the train sprite's bottom-left corner.
WorldScene.prototype.trainStack = { x: 146, y: 38 };
