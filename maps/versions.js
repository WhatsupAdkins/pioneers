// Looks maps up by id and day. Every map registered in maps/index.js is a version of a place
// (by id); a version with `from: n` replaces the earlier ones from day n on.
import * as registered from './index.js';

export const mapVersions = {};
for (const map of Object.values(registered)) (mapVersions[map.id] ??= []).push(map);
for (const versions of Object.values(mapVersions)) versions.sort((a, b) => (a.from ?? 1) - (b.from ?? 1));

// The first version of every map, by id.
export const maps = Object.fromEntries(Object.entries(mapVersions).map(([id, versions]) => [id, versions[0]]));

export function mapFor(id, day = 1) {
  const versions = mapVersions[id];
  if (!versions) return undefined;
  let pick = versions[0];
  for (const map of versions) if ((map.from ?? 1) <= day) pick = map;
  return pick;
}

// Every version of every map, for tools/export-art.mjs.
export const allMaps = Object.values(mapVersions).flat();
