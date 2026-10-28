// Helpers shared by the map files, the world scene and tools/export-art.mjs.
import { tiles, tileKinds, blocks, isSolidKind } from '../art/index.js';

// Rows of space-separated codes → 2D array of tile names, via a legend.
export function decodeGrid(rows, legend, width, height, label) {
  if (rows.length !== height) throw new Error(`${label}: ${rows.length} rows, expected ${height}`);
  return rows.map((row, y) => {
    const codes = row.trim().split(/\s+/);
    if (codes.length !== width) throw new Error(`${label}: row ${y} has ${codes.length} cells, expected ${width}`);
    return codes.map((code, x) => {
      if (!(code in legend)) throw new Error(`${label}: unknown code '${code}' at ${x},${y}`);
      return legend[code];
    });
  });
}

export function validateMap(map) {
  const check = (name, where) => {
    if (!tiles[name]) throw new Error(`${map.id}: unknown tile '${name}' at ${where}`);
  };
  map.ground.forEach((row, y) => row.forEach((name, x) => check(name, `ground ${x},${y}`)));
  map.props.forEach((row, y) => row.forEach((name, x) => name && check(name, `props ${x},${y}`)));
  for (const placed of map.blocks) {
    if (!blocks[placed.name]) throw new Error(`${map.id}: unknown block '${placed.name}'`);
  }
  for (const exit of map.exits) {
    if (exit.x < 0 || exit.y < 0 || exit.x + exit.w > map.width || exit.y + exit.h > map.height) {
      throw new Error(`${map.id}: exit to ${exit.to} lies outside the map`);
    }
  }
  return map;
}

// Collision is derived from tile and block kinds (water, cliff, building, fence, tree,
// prop); maps never carry a second hand-written table.
export function collisionGrid(map) {
  const solid = Array.from({ length: map.height }, () => Array(map.width).fill(false));
  const mark = (x, y) => {
    if (x >= 0 && y >= 0 && x < map.width && y < map.height) solid[y][x] = true;
  };
  map.ground.forEach((row, y) => row.forEach((name, x) => isSolidKind(tileKinds[name]) && mark(x, y)));
  map.props.forEach((row, y) => row.forEach((name, x) => name && isSolidKind(tileKinds[name]) && mark(x, y)));
  for (const placed of map.blocks) {
    const block = blocks[placed.name];
    if (!isSolidKind(block.kind)) continue;
    block.solid.forEach((row, dy) => row.forEach((isSolid, dx) => isSolid && mark(placed.x + dx, placed.y + dy)));
  }
  return solid;
}
