// Original lines, by id: every registered day's lines/dayNN.js (lines/index.js), merged.
//
// Day 1 (L01–L29) follows the user-supplied adaptation of the chapter's opening
// (arrival-script.js). Later days (L<day>.<n>, GAME-PLAN-DAYS §0) quote the chapter itself.
// A line is either `text`, one verbatim run of the book, or `parts`, verbatim runs of one
// speech with the speech tag between them dropped ("Hmm, a rock," Alabaster Brown said.
// "I had heard…"). joinParts() builds the shown text: a part's closing comma becomes a full
// stop before a new sentence or at the end, and is dropped before a lowercase run, as the
// Day 1 adaptation does ("Is it possible," Emily asked, "to opt out" → "Is it possible to
// opt out"). check-script.mjs finds every text and part in ../source/pioneers-chapter.txt.
//
// speaker: a speaker key (game/dialogue.js and each day's `speakers`); kind: narration |
// world | poem (no speaker).
import * as byDay from './lines/index.js';

export function joinParts(parts) {
  return parts.map((part, i) => {
    if (!part.endsWith(',')) return part;
    const next = parts[i + 1];
    if (next && /^[a-z]/.test(next)) return part.slice(0, -1);
    return `${part.slice(0, -1)}.`;
  }).join(' ');
}

export const lines = {};
for (const [day, module] of Object.entries(byDay)) {
  for (const [id, line] of Object.entries(module.lines)) {
    if (id in lines) throw new Error(`game/script/lines/${day}.js: line ${id} is already defined`);
    lines[id] = line.parts ? { ...line, text: joinParts(line.parts) } : line;
  }
}
