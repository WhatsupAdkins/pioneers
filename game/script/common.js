// Helpers every day script shares: running a beat with control locked, talking, hearts,
// items, first-time hints and the HUD goal line. A day script calls createDayKit(ctx) once.
import { addItem, itemDefs } from '../inventory.js';

export function createDayKit(ctx) {
  const { state, world, dialogue, hud } = ctx;
  let busy = false;

  const kit = {
    get busy() {
      return busy;
    },

    // Runs one beat with Emily frozen; beats never overlap.
    async beat(run) {
      if (busy || ctx.ended) return;
      busy = true;
      world.setControl(false);
      try {
        await run();
      } finally {
        busy = false;
        if (!ctx.ended) world.setControl(true);
        kit.refreshGoal();
      }
    },

    // A conversation; `hour` moves the clock on (GAME-PLAN §6). Resolves with the value of
    // the last choice picked, if any.
    async talk(id, { hour = false } = {}) {
      const value = await dialogue.run(id);
      if (hour) {
        state.clock = Math.min(23, state.clock + 1);
        world.setSky(state.clock);
      }
      return value;
    },

    loseHearts(n = 1) {
      state.hearts = Math.max(0, state.hearts - n);
      hud.update(state);
      ctx.sound?.play('heart');
      if (state.hearts === 0) hud.toast('You need rest.', 2500);
    },

    gainHearts(n) {
      state.hearts = Math.min(state.heartsMax, state.hearts + n);
      hud.update(state);
      ctx.sound?.play('heart');
    },

    give(id, n = 1, label = itemDefs[id].name) {
      if (addItem(state, id, n)) {
        hud.toast(`${label}${n > 1 ? ` ×${n}` : ''}: in your inventory`, 2500);
        return true;
      }
      hud.toast('Your inventory is full.', 2500);
      return false;
    },

    // A toast the first time a mechanic shows up (state.marks.hint survives across days).
    hint(name, text, ms = 5200) {
      state.marks.hint ??= {};
      if (state.marks.hint[name]) return false;
      state.marks.hint[name] = true;
      hud.toast(text, ms);
      return true;
    },

    // The HUD's "Now:" line. A day passes a function so the goal follows the state.
    goalOf: null,
    refreshGoal() {
      if (ctx.ended || !kit.goalOf) return;
      hud.setGoal(kit.goalOf());
    },
  };
  return kit;
}
