// Day 10 art (GAME-PLAN-DAYS §B Day 10), as text grids in the same formats as the base
// files; keys from art/palette.js, '.' is transparent. art/index.js merges every day's art
// over the base; a name may not be reused. The grid laid over the world and the chat screen
// are drawn in code (game/world/day10.js, game/css/day10.css).

export const tiles = {};
export const tileKinds = {};
export const blocks = {};

export const sprites = {
  // Alabaster Brown on their knees, facing down: Alabaster's own down frame (art/days/day02.js)
  // lowered five pixels, eyes cast down, the legs folded under.
  'alabaster-kneel': {
    w: 16,
    h: 24,
    frames: {
      kneel: [
        '................',
        '................',
        '................',
        '................',
        '................',
        '......lyyl.l....',
        '....lyyrryyyl...',
        '...lyrryyyyyyl..',
        '...lyryyylyyyl..',
        '...lyyylyyyyll..',
        '...lyySSSSSSyl..',
        '...lSdSSSSdSyl..',
        '...ldSSSSSSdyl..',
        '...lySSSddSSyl..',
        '...lyydSSdyyl...',
        '..pplpppiipplp..',
        '..PpPsllllsPpP..',
        '..ipPllLLllPpi..',
        '..SSPllllllPSS..',
        '..dSLsLLLLsLSd..',
        '...llllllllll...',
        '..lllLlllLllll..',
        '..klLlk..klLlk..',
        '..kkkkk..kkkkk..',
      ],
    },
  },
};

export const portraits = {};
export const icons = {};
