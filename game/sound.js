// Synthesised sound (GAME-PLAN §11, after film-sound.js): wind, footsteps, hooves, UI
// blips and the Go stone. Off by default; the choice is kept in localStorage. The audio
// context is only created after a user gesture, so browsers never block or warn.
const storageKey = 'pioneers.sound';
const quietWind = [0.06, 450]; // a map's `wind` is [gain, lowpass Hz]; this when it has none

export function createSound() {
  let context = null;
  let master = null;
  let wind = null;
  let filter = null;
  let enabled = false;
  let windLevel = quietWind;
  try {
    enabled = localStorage.getItem(storageKey) === 'on';
  } catch {
    enabled = false;
  }

  function ensure() {
    if (context) return context;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return null;
    context = new Audio();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 17;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 16807) % 2147483647;
      data[i] = (seed / 2147483647 * 2 - 1) * 0.35;
    }
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    wind = context.createGain();
    noise.connect(filter);
    filter.connect(wind);
    wind.connect(master);
    noise.start();
    applyPlace();
    return context;
  }

  function applyPlace() {
    if (!context) return;
    const [gain, frequency] = windLevel;
    wind.gain.setTargetAtTime(gain, context.currentTime, 0.4);
    filter.frequency.setTargetAtTime(frequency, context.currentTime, 0.4);
  }

  async function apply() {
    if (!enabled && !context) return;
    if (!ensure()) return;
    if (context.state === 'suspended') await context.resume();
    master.gain.setTargetAtTime(enabled ? 0.45 : 0, context.currentTime, 0.15);
  }

  function hit(frequency, length, volume, type = 'triangle') {
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.35), now + length);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + length);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + length + 0.01);
  }

  const voices = {
    step: () => hit(90, 0.08, 0.14, 'square'),
    hoof: () => { hit(160, 0.06, 0.15); setTimeout(() => enabled && context && hit(110, 0.06, 0.12), 70); },
    blip: () => hit(520, 0.035, 0.09, 'square'),
    skip: () => hit(720, 0.05, 0.11, 'square'),
    stone: () => { hit(1300, 0.025, 0.16); hit(190, 0.07, 0.12); },
    heart: () => hit(330, 0.14, 0.09, 'sine'),
  };

  // A pending "on" from a previous visit waits for the first gesture.
  const gesture = () => {
    removeEventListener('pointerdown', gesture, true);
    removeEventListener('keydown', gesture, true);
    apply();
  };
  if (enabled) {
    addEventListener('pointerdown', gesture, true);
    addEventListener('keydown', gesture, true);
  }

  return {
    get enabled() {
      return enabled;
    },
    async toggle() {
      enabled = !enabled;
      try {
        localStorage.setItem(storageKey, enabled ? 'on' : 'off');
      } catch {
        // the toggle still works for this visit
      }
      await apply();
      return enabled;
    },
    play(name) {
      if (enabled && context && context.state === 'running') voices[name]?.();
    },
    setPlace(level) {
      windLevel = level ?? quietWind;
      applyPlace();
    },
  };
}
