// Daedalus's side of the board (GAME-PLAN §9): a capture-Go player with three levels.
//   1  takes the biggest capture, else a random move that leans toward the centre
//   2  level 1, plus: pulls its own group out of atari, else plays on a liberty of the
//      enemy group with the fewest liberties
//   3  level 2 with one ply of lookahead: no self-atari unless it captures, no move that
//      lets the opponent capture next turn when a safe move exists, safe ataris first.
//      Among the safe moves it also reads ladders: it shores up groups a ladder would
//      catch and prefers ataris the opponent cannot escape.
// The same game and the same rng sequence always give the same move.
import { black, white, play, legalMoves, groupAt, scanGroups } from './engine.js';

// mulberry32: a small seeded generator returning numbers in [0, 1).
export function createRng(seed = 1) {
  let state = Number(seed) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A move for the side to move: {x, y}, or {pass: true} only when no move is legal.
// Without an rng the choice is seeded from the game itself (its seed and move count).
export function aiMove(game, level = 2, rng = createRng(game.seed * 7919 + game.moveCount)) {
  const moves = legalMoves(game);
  if (moves.length === 0) return { pass: true };
  const view = survey(game, moves);
  const tier = Math.min(3, Math.max(1, Math.round(Number(level)) || 1));
  const point = [levelOne, levelTwo, levelThree][tier - 1](view, rng);
  return { x: point % view.size, y: (point - (point % view.size)) / view.size };
}

// ------------------------------------------------------------------ levels

function levelOne(view, rng) {
  return biggestCapture(view, rng) ?? leanCentre(view.legal, view.size, rng);
}

function levelTwo(view, rng) {
  return biggestCapture(view, rng)
    ?? escape(view)
    ?? pressure(view, view.legal, rng)
    ?? leanCentre(view.legal, view.size, rng);
}

function levelThree(view, rng) {
  const options = view.legal.map((point) => lookAhead(view, point)).filter(Boolean);
  if (options.length === 0) return levelTwo(view, rng);
  const wins = options.filter((o) => o.wins);
  if (wins.length) return pickBest(wins, (o) => o.captured, rng).point;
  // Self-atari is only flagged on moves that capture nothing.
  let pool = options.filter((o) => !o.selfAtari);
  if (pool.length === 0) pool = options;
  // Fewest stones the opponent could take next turn (none: the safe moves, when there are
  // any), then fewest left in atari, then fewest that a ladder could still catch.
  const weak = weakGroups(view);
  for (const o of pool) o.ladder = ladderRisk(o, weak);
  pool = keepBest(pool, (o) => [-o.loss, -o.exposed, -o.ladder]);
  for (const o of pool) o.sure = sureStones(o);
  const takes = pool.filter((o) => o.captured > 0);
  if (takes.length) return pickBest(takes, (o) => [o.captured, o.sure, o.atariPoints, o.ownLibs], rng).point;
  const ataris = pool.filter((o) => o.ataris > 0);
  if (ataris.length) return pickBest(ataris, (o) => [o.sure, o.atariPoints, o.atariStones, o.ownLibs], rng).point;
  const byPoint = new Map(pool.map((o) => [o.point, o]));
  const points = [...byPoint.keys()];
  return pressure(view, points, rng, (point) => byPoint.get(point).ownLibs)
    ?? leanCentre(points, view.size, rng);
}

// ------------------------------------------------------------------ pieces

// What every level needs to know about the position before it chooses.
function survey(game, moves) {
  const { board, size, toMove } = game;
  const { groups } = scanGroups(board, size);
  const gain = new Array(board.length).fill(0); // stones a move on each point would capture
  for (const g of groups) {
    if (g.color !== toMove && g.liberties.length === 1) gain[g.liberties[0]] += g.stones.length;
  }
  return {
    game,
    size,
    legal: moves.map(({ x, y }) => y * size + x),
    gain,
    mine: groups.filter((g) => g.color === toMove),
    theirs: groups.filter((g) => g.color !== toMove),
  };
}

function biggestCapture(view, rng) {
  const takes = view.legal.filter((point) => view.gain[point] > 0);
  return takes.length ? pickBest(takes, (point) => view.gain[point], rng) : null;
}

// Extends a group out of atari when that leaves it two or more liberties, largest group first.
function escape(view) {
  const legal = new Set(view.legal);
  const inAtari = view.mine.filter((g) => g.liberties.length === 1)
    .sort((a, b) => b.stones.length - a.stones.length);
  for (const g of inAtari) {
    const point = g.liberties[0];
    if (legal.has(point) && libertiesAfter(view, point) >= 2) return point;
  }
  return null;
}

// Plays on a liberty of the enemy group with the fewest liberties (the bigger group on a
// tie), taking the liberty that leaves the new stone the most liberties.
function pressure(view, points, rng, libsOf = (point) => libertiesAfter(view, point)) {
  const allowed = new Set(points);
  const targets = [...view.theirs].sort((a, b) =>
    a.liberties.length - b.liberties.length || b.stones.length - a.stones.length);
  for (const g of targets) {
    const spots = g.liberties.filter((point) => allowed.has(point));
    if (spots.length) return pickBest(spots, libsOf, rng);
  }
  return null;
}

// Liberties of the group the new stone would belong to; -1 if the move is illegal.
function libertiesAfter(view, point) {
  const x = point % view.size, y = (point - x) / view.size;
  const next = play(view.game, x, y);
  return next.error ? -1 : groupAt(next, x, y).liberties.length;
}

// One ply ahead: play the move, then see what the opponent could take in reply and
// which enemy groups are left in atari.
function lookAhead(view, point) {
  const { game, size } = view;
  const me = game.toMove;
  const next = play(game, point % size, (point - (point % size)) / size);
  if (next.error) return null;
  const captured = next.last.captured;
  if (next.over) return { point, wins: true, captured };
  const { groupOf, groups } = scanGroups(next.board, size);
  const lossAt = new Map(); // reply point → own stones it would take
  const atariPoints = new Set();
  const atariGroups = [];
  let loss = 0, exposed = 0, atariStones = 0;
  for (const g of groups) {
    if (g.liberties.length !== 1) continue;
    const at = g.liberties[0];
    if (g.color === me) {
      if (at === next.ko) continue; // the opponent may not retake the ko at once
      const taken = (lossAt.get(at) ?? 0) + g.stones.length;
      lossAt.set(at, taken);
      loss = Math.max(loss, taken);
      exposed += g.stones.length;
    } else {
      atariGroups.push(g);
      atariStones += g.stones.length;
      atariPoints.add(at);
    }
  }
  const own = groups[groupOf[point]];
  return {
    point,
    next,
    wins: false,
    captured,
    loss, // most own stones one reply could take
    exposed, // all own stones left in atari
    ownGroup: groupOf[point],
    groupOf,
    ownLibs: own.liberties.length,
    ownStones: own.stones.length,
    selfAtari: own.liberties.length === 1 && captured === 0,
    atariGroups,
    ataris: atariGroups.length,
    atariStones,
    atariPoints: atariPoints.size, // two or more: the opponent cannot save them all
  };
}

// Own groups with two liberties that the opponent could ladder if it moved now.
function weakGroups(view) {
  const { game } = view;
  const theirTurn = { ...game, toMove: game.toMove === black ? white : black, ko: -1 };
  return view.mine.filter((g) => g.liberties.length === 2 && canCapture(theirTurn, g.stones[0]));
}

// Own stones a ladder could still catch after the move: the new stone's group when it has
// two liberties, and each weak group the move neither joins nor relieves by capturing.
function ladderRisk(o, weak) {
  let risk = o.ownLibs === 2 && canCapture(o.next, o.point) ? o.ownStones : 0;
  for (const w of weak) {
    if (o.groupOf[w.stones[0]] === o.ownGroup) continue; // joined: judged as the new group
    if (o.captured === 0 || canCapture(o.next, w.stones[0])) risk += w.stones.length;
  }
  return risk;
}

// Enemy stones left in atari that cannot get away.
function sureStones(o) {
  let total = 0;
  for (const g of o.atariGroups) if (!canEscape(o.next, g.stones[0])) total += g.stones.length;
  return total;
}

// ------------------------------------------------------------------ ladder reading

const readDepth = 12; // ataris read ahead
const readBudget = 80; // moves tried per reading, so odd positions stay quick

// True if the side to move can capture the group on `point` by a chain of ataris.
// Out of depth or budget it assumes the group gets away.
function canCapture(game, point, depth = readDepth, budget = { left: readBudget }) {
  const { groupOf, groups } = scanGroups(game.board, game.size);
  if (groupOf[point] === -1) return true; // already taken
  const { liberties } = groups[groupOf[point]];
  if (liberties.length === 1) return !playAt(game, liberties[0], budget).error; // fails only on ko
  if (liberties.length > 2 || depth === 0) return false;
  for (const at of liberties) {
    if (budget.left <= 0) return false;
    const next = playAt(game, at, budget);
    if (!next.error && (next.over || !canEscape(next, point, depth - 1, budget))) return true;
  }
  return false;
}

// True if the side to move can save its group on `point` (in atari): by extending to three
// liberties, or to two that cannot be laddered, or by capturing an attacker in atari.
function canEscape(game, point, depth = readDepth, budget = { left: readBudget }) {
  const { size } = game;
  const { groupOf, groups } = scanGroups(game.board, size);
  if (groupOf[point] === -1) return false;
  const own = groups[groupOf[point]];
  if (own.liberties.length >= 2) return true;
  const tries = new Set(own.liberties);
  for (const stone of own.stones) {
    for (const n of neighbours(stone, size)) {
      const g = groups[groupOf[n]];
      if (g && g.color !== own.color && g.liberties.length === 1) tries.add(g.liberties[0]);
    }
  }
  for (const at of tries) {
    if (budget.left <= 0) return true;
    const next = playAt(game, at, budget);
    if (next.error) continue;
    if (next.over) return true; // the capture won the game
    const after = scanGroups(next.board, size);
    const libs = after.groups[after.groupOf[point]].liberties.length;
    if (libs >= 3 || (libs === 2 && !canCapture(next, point, depth, budget))) return true;
  }
  return false;
}

function playAt(game, point, budget) {
  budget.left -= 1;
  return play(game, point % game.size, (point - (point % game.size)) / game.size);
}

function neighbours(point, size) {
  const x = point % size, near = [];
  if (point >= size) near.push(point - size);
  if (x > 0) near.push(point - 1);
  if (x < size - 1) near.push(point + 1);
  if (point < size * (size - 1)) near.push(point + size);
  return near;
}

// ------------------------------------------------------------------ choosing

// A random point, weighted toward the centre: (1 + c - d)² where d is the ring distance
// from the centre c, so the centre of a 9×9 board is 25 times as likely as an edge point.
function leanCentre(points, size, rng) {
  const c = (size - 1) / 2;
  const weights = points.map((point) => {
    const x = point % size, y = (point - x) / size;
    return (1 + c - Math.max(Math.abs(x - c), Math.abs(y - c))) ** 2;
  });
  let r = rng() * weights.reduce((sum, w) => sum + w, 0);
  for (let i = 0; i < points.length; i++) {
    r -= weights[i];
    if (r < 0) return points[i];
  }
  return points[points.length - 1];
}

// The items with the highest score; scores are numbers or arrays compared in order.
function keepBest(items, score) {
  let best = [], top = null;
  for (const item of items) {
    const s = [].concat(score(item));
    const order = top === null ? 1 : compare(s, top);
    if (order > 0) {
      best = [item];
      top = s;
    } else if (order === 0) best.push(item);
  }
  return best;
}

// One of the highest-scoring items, ties broken by the rng.
function pickBest(items, score, rng) {
  const best = keepBest(items, score);
  return best.length === 1 ? best[0] : best[Math.min(best.length - 1, Math.floor(rng() * best.length))];
}

function compare(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  return 0;
}
