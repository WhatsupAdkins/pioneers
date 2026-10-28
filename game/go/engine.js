// Rules of 9×9 capture Go (Atari Go), GAME-PLAN §9: the first side to capture `target`
// stones wins; no suicide; simple ko; two passes in a row end the game on captures.
// Pure functions over plain, JSON-safe data. Nothing here changes its input: every move
// returns a new game object with a new board array, so undo can be added later.

export const black = 1, white = 2;

// A game is plain data:
//   size, target, seed  board size, captures that win, seed kept for the AI's rng
//   board      size*size array, index y*size + x; 0 empty, 1 black, 2 white
//   toMove     colour to play, 1 or 2 (black moves first)
//   captures   {1: n, 2: n}, stones captured BY each colour
//   ko         point index the side to move may not play this turn, or -1
//   passes     passes in a row
//   moveCount  stones and passes played so far
//   last       {x, y, color, captured} (captured = stones lifted) | {pass: true, color} | null
//   over       true once the game has ended
//   winner     1 | 2 | 0 (draw) | null
//   reason     'captures' | 'passes' | 'resign' | null
export function createGame({ size = 9, target = 5, seed = 1 } = {}) {
  if (!Number.isInteger(size) || size < 2) throw new RangeError(`bad board size: ${size}`);
  if (!Number.isInteger(target) || target < 1) throw new RangeError(`bad capture target: ${target}`);
  return {
    size,
    target,
    seed,
    board: new Array(size * size).fill(0),
    toMove: black,
    captures: { [black]: 0, [white]: 0 },
    ko: -1,
    passes: 0,
    moveCount: 0,
    last: null,
    over: false,
    winner: null,
    reason: null,
  };
}

// Plays a stone for the side to move at (x, y).
// Returns the new game, or {error}: 'over' | 'bounds' | 'occupied' | 'ko' | 'suicide'.
export function play(game, x, y) {
  if (game.over) return { error: 'over' };
  const { size, board } = game;
  if (!onBoard(size, x, y)) return { error: 'bounds' };
  const point = y * size + x;
  if (board[point] !== 0) return { error: 'occupied' };
  if (point === game.ko) return { error: 'ko' };
  const color = game.toMove;
  const placed = placeStone(board, size, point, color);
  if (!placed) return { error: 'suicide' };
  const captures = { ...game.captures };
  captures[color] += placed.captured;
  const won = captures[color] >= game.target;
  return {
    ...game,
    board: placed.board,
    toMove: opponent(color),
    captures,
    ko: won ? -1 : placed.ko,
    passes: 0,
    moveCount: game.moveCount + 1,
    last: { x, y, color, captured: placed.captured },
    over: won,
    winner: won ? color : null,
    reason: won ? 'captures' : null,
  };
}

// Passes the turn and clears ko. The second pass in a row ends the game: more captures
// wins, equal captures is a draw. Returns {error: 'over'} on a finished game.
export function pass(game) {
  if (game.over) return { error: 'over' };
  const color = game.toMove;
  const passes = game.passes + 1;
  const over = passes >= 2;
  const byBlack = game.captures[black], byWhite = game.captures[white];
  return {
    ...game,
    board: game.board.slice(),
    toMove: opponent(color),
    captures: { ...game.captures },
    ko: -1,
    passes,
    moveCount: game.moveCount + 1,
    last: { pass: true, color },
    over,
    winner: over ? (byBlack > byWhite ? black : byWhite > byBlack ? white : 0) : null,
    reason: over ? 'passes' : null,
  };
}

// `color` gives up (the side to move when left out) and the other colour wins.
// Returns {error: 'over'} on a finished game.
export function resign(game, color = game.toMove) {
  if (game.over) return { error: 'over' };
  const loser = color === black || color === white ? color : game.toMove;
  return {
    ...game,
    board: game.board.slice(),
    captures: { ...game.captures },
    over: true,
    winner: opponent(loser),
    reason: 'resign',
  };
}

// Every point the side to move may play, as [{x, y}] in board order; [] once the game is over.
export function legalMoves(game) {
  if (game.over) return [];
  const { size, board, toMove, ko } = game;
  const { groupOf, groups } = scanGroups(board, size);
  const near = neighbourTable(size);
  // A stone may go where it touches an empty point, joins a group that keeps another
  // liberty, or takes the last liberty of an enemy group (a capture is never suicide).
  const hasAir = (point) => near[point].some((n) => {
    if (board[n] === 0) return true;
    const libs = groups[groupOf[n]].liberties.length;
    return board[n] === toMove ? libs > 1 : libs === 1;
  });
  const moves = [];
  for (let point = 0; point < board.length; point++) {
    if (board[point] === 0 && point !== ko && hasAir(point)) {
      moves.push({ x: point % size, y: (point - (point % size)) / size });
    }
  }
  return moves;
}

// The group on (x, y) as {color, stones, liberties} with {x, y} points in board order,
// or null on an empty or off-board point.
export function groupAt(game, x, y) {
  const { size, board } = game;
  if (!onBoard(size, x, y) || board[y * size + x] === 0) return null;
  const { color, stones, liberties } = floodGroup(board, size, y * size + x);
  const toPoint = (i) => ({ x: i % size, y: (i - (i % size)) / size });
  return {
    color,
    stones: stones.sort(byNumber).map(toPoint),
    liberties: liberties.sort(byNumber).map(toPoint),
  };
}

// Stones the side to move would capture by playing (x, y); 0 when that move is illegal.
export function capturesIfPlayed(game, x, y) {
  if (game.over || !onBoard(game.size, x, y)) return 0;
  const { size, board } = game;
  const point = y * size + x;
  if (board[point] !== 0 || point === game.ko) return 0;
  const enemy = opponent(game.toMove);
  const counted = new Set();
  let total = 0;
  for (const n of neighbourTable(size)[point]) {
    if (board[n] !== enemy || counted.has(n)) continue;
    const { stones, liberties } = floodGroup(board, size, n);
    for (const stone of stones) counted.add(stone);
    if (liberties.length === 1) total += stones.length; // its last liberty is this point
  }
  return total;
}

// Low-level helper, also used by ai.js: labels every group on a board in one pass.
// groupOf[i] is the group number of point i (-1 when empty); groups[n] is
// {color, stones, liberties} with point indexes.
export function scanGroups(board, size) {
  const near = neighbourTable(size);
  const groupOf = new Array(board.length).fill(-1);
  const seenBy = new Array(board.length).fill(-1); // last group that counted this liberty
  const groups = [];
  for (let start = 0; start < board.length; start++) {
    if (board[start] === 0 || groupOf[start] !== -1) continue;
    const id = groups.length;
    const color = board[start];
    const stones = [start];
    const liberties = [];
    groupOf[start] = id;
    for (let k = 0; k < stones.length; k++) {
      for (const n of near[stones[k]]) {
        if (board[n] === 0) {
          if (seenBy[n] !== id) {
            seenBy[n] = id;
            liberties.push(n);
          }
        } else if (board[n] === color && groupOf[n] === -1) {
          groupOf[n] = id;
          stones.push(n);
        }
      }
    }
    groups.push({ color, stones, liberties });
  }
  return { groupOf, groups };
}

// ------------------------------------------------------------------ internals

const tables = new Map();

// Neighbour indexes of every point, built once per board size.
function neighbourTable(size) {
  let table = tables.get(size);
  if (table) return table;
  table = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const near = [];
      if (y > 0) near.push((y - 1) * size + x);
      if (x > 0) near.push(y * size + x - 1);
      if (x < size - 1) near.push(y * size + x + 1);
      if (y < size - 1) near.push((y + 1) * size + x);
      table.push(near);
    }
  }
  tables.set(size, table);
  return table;
}

// Puts a stone down and lifts the enemy groups it leaves without liberties.
// Returns null for suicide, else the new board, how many stones were lifted and the ko point.
function placeStone(board, size, point, color) {
  const next = board.slice();
  next[point] = color;
  const enemy = opponent(color);
  let captured = 0, lifted = -1;
  for (const n of neighbourTable(size)[point]) {
    if (next[n] !== enemy) continue; // also skips a group lifted a moment ago
    const { stones, liberties } = floodGroup(next, size, n);
    if (liberties.length > 0) continue;
    for (const stone of stones) next[stone] = 0;
    captured += stones.length;
    lifted = stones[0];
  }
  const own = floodGroup(next, size, point);
  if (own.liberties.length === 0) return null; // only possible when nothing was lifted
  // Simple ko: one stone taken by a lone stone whose only liberty is the point it emptied.
  const isKo = captured === 1 && own.stones.length === 1
    && own.liberties.length === 1 && own.liberties[0] === lifted;
  return { board: next, captured, ko: isKo ? lifted : -1 };
}

// The group on `start` with its stones and liberties as point indexes.
function floodGroup(board, size, start) {
  const near = neighbourTable(size);
  const color = board[start];
  const stones = [start];
  const inGroup = new Set(stones);
  const liberties = new Set();
  for (let k = 0; k < stones.length; k++) {
    for (const n of near[stones[k]]) {
      if (board[n] === 0) liberties.add(n);
      else if (board[n] === color && !inGroup.has(n)) {
        inGroup.add(n);
        stones.push(n);
      }
    }
  }
  return { color, stones, liberties: [...liberties] };
}

function onBoard(size, x, y) {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < size && y < size;
}

function opponent(color) {
  return color === black ? white : black;
}

function byNumber(a, b) {
  return a - b;
}
