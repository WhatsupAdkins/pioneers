// Builds Phaser textures and animations from the text-grid art (GAME-PLAN §4).
// The layout helpers are pure so tools/export-art.mjs can write the same atlas to PNG.
import { rasterize, rgbaOf } from './palette.js';
import { tiles, tileSize, sprites, icons } from './index.js';

// Icons the world canvas draws (the rest are DOM-only, see game/hud.js).
export const worldIcons = ['prompt-e'];

export const tilesetColumns = 16;
export const tileNames = Object.keys(tiles);
export const tilesetSize = {
  width: tilesetColumns * tileSize,
  height: Math.ceil(tileNames.length / tilesetColumns) * tileSize,
};
export const directions = ['down', 'up', 'left', 'right'];
export const walkFps = 8;

const indexByName = new Map(tileNames.map((name, index) => [name, index]));

// Tile indices follow declaration order in art/tiles.js.
export function tileIndex(name) {
  const index = indexByName.get(name);
  if (index === undefined) throw new Error(`Unknown tile '${name}'`);
  return index;
}

export function tilePosition(index) {
  return { x: (index % tilesetColumns) * tileSize, y: Math.floor(index / tilesetColumns) * tileSize };
}

// A 1 px ring around the opaque pixels of `image` ({ width, height, data }), as a texture
// one pixel larger on every side: the highlight on whatever Emily can use.
export function outlineRing(image, rgba = rgbaOf('i')) {
  const width = image.width + 2;
  const height = image.height + 2;
  const data = new Uint8ClampedArray(width * height * 4);
  const opaque = (x, y) => x >= 0 && y >= 0 && x < image.width && y < image.height && image.data[(y * image.width + x) * 4 + 3] > 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sx = x - 1;
      const sy = y - 1;
      if (opaque(sx, sy)) continue;
      if (opaque(sx - 1, sy) || opaque(sx + 1, sy) || opaque(sx, sy - 1) || opaque(sx, sy + 1)) data.set(rgba, (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

export function outlineTexture(scene, key, image) {
  const ring = outlineRing(image);
  const texture = scene.textures.createCanvas(key, ring.width, ring.height);
  texture.getContext().putImageData(new ImageData(ring.data, ring.width, ring.height), 0, 0);
  texture.refresh();
  return texture;
}

export function registerArt(scene) {
  if (scene.textures.exists('tileset')) return;

  for (const name of worldIcons) {
    if (!icons[name]) continue; // drawn later; the world simply shows no prompt
    const art = rasterize(icons[name], `icon ${name}`);
    const texture = scene.textures.createCanvas(name, art.width, art.height);
    texture.getContext().putImageData(new ImageData(art.data, art.width, art.height), 0, 0);
    texture.refresh();
  }

  const sheet = scene.textures.createCanvas('tileset', tilesetSize.width, tilesetSize.height);
  const sheetContext = sheet.getContext();
  tileNames.forEach((name, index) => {
    const { x, y } = tilePosition(index);
    const { data } = rasterize(tiles[name], `tile ${name}`, tileSize, tileSize);
    sheetContext.putImageData(new ImageData(data, tileSize, tileSize), x, y);
    sheet.add(name, 0, x, y, tileSize, tileSize);
  });
  sheet.refresh();

  for (const [key, sprite] of Object.entries(sprites)) {
    const frameNames = Object.keys(sprite.frames);
    const texture = scene.textures.createCanvas(key, sprite.w * frameNames.length, sprite.h);
    const context = texture.getContext();
    frameNames.forEach((frame, i) => {
      const { data } = rasterize(sprite.frames[frame], `${key} ${frame}`, sprite.w, sprite.h);
      context.putImageData(new ImageData(data, sprite.w, sprite.h), i * sprite.w, 0);
      texture.add(frame, 0, i * sprite.w, 0, sprite.w, sprite.h);
    });
    texture.refresh();

    // Three-frame ping-pong walk (the middle frame doubles as the standing pose);
    // two-frame walks (riding) simply alternate.
    for (const direction of directions) {
      if (!sprite.frames[`${direction}-0`] || !sprite.frames[`${direction}-1`]) continue;
      const order = sprite.frames[`${direction}-2`] ? [0, 1, 2, 1] : [0, 1];
      scene.anims.create({
        key: `${key}-walk-${direction}`,
        frames: order.map((n) => ({ key, frame: `${direction}-${n}` })),
        frameRate: walkFps,
        repeat: -1,
      });
    }
    // Other loops a sprite declares, e.g. { key: 'pixel-idle', frames: ['east-0', 'east-1'], fps: 3 }.
    for (const anim of sprite.anims ?? []) {
      scene.anims.create({
        key: anim.key,
        frames: anim.frames.map((frame) => ({ key, frame })),
        frameRate: anim.fps ?? 4,
        repeat: anim.repeat ?? -1,
      });
    }
  }
}
