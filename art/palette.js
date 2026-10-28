// Fixed palette (GAME-PLAN §4). One character per colour; '.' is transparent.
// Shared by the browser (art/register.js) and node (tools/export-art.mjs).
export const palette = {
  k: '#211f2b', // ink — outlines, night
  v: '#23212c', // velvet — Emily's coat
  f: '#34303e', // fold — coat folds
  h: '#1a1922', // hair
  s: '#8b919e', // silver — glasses, iron
  S: '#dcaa86', // skin
  d: '#bb836c', // skinShade
  p: '#e7d3a6', // paper — paper, signs
  i: '#f2e2be', // ivory — highlights, frost
  y: '#a3a9c7', // sky — sky, far hills
  l: '#535971', // slate — slate, roofs
  L: '#3a3d52', // slateDark — roof shadow
  w: '#876147', // wood — wooden walls
  W: '#b18a61', // woodLight
  t: '#493731', // timber — dark wood, doors
  b: '#966e61', // brick
  P: '#b6a08a', // plaster
  g: '#d1a56a', // gold — brass, lamps
  G: '#f6cf85', // light — window light
  o: '#9d8981', // soil — dirt road
  O: '#776e7d', // soilShade
  n: '#858397', // stone — stones, cobbles
  N: '#b8abac', // stoneLight
  r: '#c6c8dd', // frost — frosted grass
  m: '#7d8157', // moss — grass
  M: '#a5a077', // mossLight
  e: '#68724f', // leaf — needles
  E: '#4a5845', // leafShade
  c: '#648e91', // sea
  C: '#426e7a', // seaDeep
  a: '#74afd0', // azure — Pixel
  A: '#4984a9', // azureShade
  u: '#a46b49', // rust — the Editor's vest, rust
};

export const paletteNames = {
  k: 'ink', v: 'velvet', f: 'fold', h: 'hair', s: 'silver', S: 'skin', d: 'skinShade',
  p: 'paper', i: 'ivory', y: 'sky', l: 'slate', L: 'slateDark', w: 'wood', W: 'woodLight',
  t: 'timber', b: 'brick', P: 'plaster', g: 'gold', G: 'light', o: 'soil', O: 'soilShade',
  n: 'stone', N: 'stoneLight', r: 'frost', m: 'moss', M: 'mossLight', e: 'leaf', E: 'leafShade',
  c: 'sea', C: 'seaDeep', a: 'azure', A: 'azureShade', u: 'rust',
};

const rgbaCache = { '.': [0, 0, 0, 0] };
for (const [key, hex] of Object.entries(palette)) {
  rgbaCache[key] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)).concat(255);
}

export function rgbaOf(key) {
  return rgbaCache[key];
}

// Checks a text grid and turns it into RGBA bytes. Throws with the asset name and row.
export function rasterize(rows, label, width = rows[0]?.length, height = rows.length) {
  if (rows.length !== height) throw new Error(`${label}: ${rows.length} rows, expected ${height}`);
  const data = new Uint8ClampedArray(width * height * 4);
  rows.forEach((row, y) => {
    if (row.length !== width) throw new Error(`${label}: row ${y} has ${row.length} chars, expected ${width}`);
    for (let x = 0; x < width; x++) {
      const rgba = rgbaCache[row[x]];
      if (!rgba) throw new Error(`${label}: row ${y} col ${x} uses unknown key '${row[x]}'`);
      data.set(rgba, (y * width + x) * 4);
    }
  });
  return { width, height, data };
}
