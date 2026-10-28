// World helpers for Day 8 (PARALLEL-RULES §2: mixins that take the WorldScene). The blizzard:
// driven snow across the screen and a white-out beyond six tiles of Emily. And the dusk: the
// sky darkening by a fraction the day script sets as its real-time clock runs.
import { tileSize } from '../../art/index.js';

const whiteoutDepth = 9550; // over the mist (9500), under the sky tint (9600)
const flakeDepth = 9560;
export const visibleTiles = 6;

// A canvas the size of two screens: clear within `radius` px of its centre, frost-white
// beyond, in four hard steps (no smooth gradient: it is a pixel game).
function whiteoutTexture(world, key, radius) {
  if (world.textures.exists(key)) return key;
  const width = 640;
  const height = 360;
  const texture = world.textures.createCanvas(key, width, height);
  const context = texture.getContext();
  const image = context.createImageData(width, height);
  const steps = [[radius, 0], [radius + 10, 90], [radius + 22, 165], [radius + 36, 215], [Infinity, 238]];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const d = Math.hypot(x - width / 2 + 0.5, y - height / 2 + 0.5);
      const alpha = steps.find(([r]) => d < r)[1];
      const i = (y * width + x) * 4;
      image.data[i] = 0xc6;
      image.data[i + 1] = 0xc8;
      image.data[i + 2] = 0xdd;
      image.data[i + 3] = alpha;
    }
  }
  context.putImageData(image, 0, 0);
  texture.refresh();
  return key;
}

// Starts the storm; `heavy` false is the thaw (lighter snow, no white-out). Returns stop().
// It lives over every map until stopped (map changes do not clear it).
export function startBlizzard(world, { heavy = true } = {}) {
  if (!world.add?.image || !world.textures) return () => {};
  const parts = [];
  if (heavy) {
    const key = whiteoutTexture(world, 'd08-whiteout', visibleTiles * tileSize);
    const veil = world.add.image(0, 0, key).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(whiteoutDepth);
    parts.push(veil);
    const place = () => {
      const sprite = world.player?.sprite;
      if (!sprite || !veil.active) return;
      const view = world.cameras.main.worldView;
      veil.setPosition(Math.round(sprite.x - view.x), Math.round(sprite.y - 12 - view.y));
    };
    world.events.on('postupdate', place);
    parts.push({ destroy: () => world.events.off('postupdate', place) });
    place();
  }
  if (!world.reducedMotion) {
    const emitter = world.add.particles(0, 0, 'blizzard-flake', {
      frame: ['flake-0', 'flake-1'],
      x: { min: -40, max: 360 },
      y: { min: -20, max: -4 },
      lifespan: 2600,
      speedX: heavy ? { min: -150, max: -90 } : { min: -50, max: -20 },
      speedY: heavy ? { min: 90, max: 150 } : { min: 40, max: 70 },
      quantity: heavy ? 3 : 1,
      frequency: heavy ? 22 : 90,
    });
    emitter.setScrollFactor(0).setDepth(flakeDepth);
    parts.push(emitter);
  }
  return () => parts.splice(0).forEach((part) => part.destroy());
}

// Dusk over Undiscovered Friendship: t from 0 (the sun just down) to 1 (no light left).
export function setDusk(world, t) {
  if (!world.sky?.setFillStyle) return;
  world.sky.setAlpha(1);
  world.sky.setFillStyle(0x211f2b, 0.18 + Math.min(1, Math.max(0, t)) * 0.6);
}

// The cave's mouth at dusk (2026-10-22): the sprite on the rock face, and the same shimmer once
// more as an overlay above every character and the dusk tint (under the E bubble), added on
// and pulsing, so Pixel or a passer-by can never hide it from any side. Returns { destroy }.
const mouthGlowDepth = 9650; // over the sky tint (9600), under the E bubble (9700)
export function showCaveMouth(world, spot) {
  if (!world.add?.sprite) return null;
  const parts = [];
  const make = (depth) => {
    const sprite = world.add.sprite(spot.x * tileSize, spot.y * tileSize, 'cave-mouth').setOrigin(0, 0).setDepth(depth);
    if (!world.reducedMotion) sprite.play('cave-mouth-shimmer');
    else sprite.setFrame('shimmer-1');
    world.mapObjects?.push(sprite);
    parts.push(sprite);
    return sprite;
  };
  make((spot.y + 1) * tileSize + 1);
  const glow = make(mouthGlowDepth).setBlendMode('ADD');
  if (world.reducedMotion) glow.setAlpha(0.6);
  else {
    glow.setAlpha(0.35);
    parts.push(world.tweens.add({ targets: glow, alpha: 0.9, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }));
  }
  return {
    destroy: () => parts.splice(0).forEach((part) => (part.remove ? part.remove() : part.active && part.destroy())),
  };
}
