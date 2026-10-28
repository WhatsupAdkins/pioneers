// PIONEERCHAT (GAME-PLAN-DAYS §B Day 10 beat 1): the full-screen private chat, in the DOM.
// Messages arrive one at a time; daedalus84 "types" first. Each of Emily's messages waits
// in the box until the player presses Send. The one alternative is to say nothing ("………"):
// daedalus84 then sends one more line (authored, from `nudge`) and the message is offered
// again, Send only. Emily's own "………" in the book is a message like the others.
// Without a document (check-days.mjs) run() resolves at once, with no silences.
import { ensureCss } from './day09.js';

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
const handles = { emily: 'EMILYBMARXX', daedalus84: 'DAEDALUS84' };

function createChat(frame, { reducedMotion }) {
  const root = document.createElement('section');
  root.className = 'd10-chat';
  root.hidden = true;
  root.setAttribute('aria-label', 'Pioneerchat');
  root.innerHTML = `
    <header class="d10-chat-head"><span>PIONEERCHAT</span><span class="d10-chat-who">daedalus84</span></header>
    <ol class="d10-chat-log" aria-live="polite"></ol>
    <p class="d10-chat-typing" aria-hidden="true"></p>
    <div class="d10-chat-compose" hidden>
      <p class="d10-chat-draft"></p>
      <div class="d10-chat-buttons">
        <button type="button" class="d10-chat-send">1 · Send</button>
        <button type="button" class="d10-chat-silent" title="Say nothing">2 · ………</button>
      </div>
    </div>`;
  frame.append(root);
  const log = root.querySelector('.d10-chat-log');
  const typing = root.querySelector('.d10-chat-typing');
  const compose = root.querySelector('.d10-chat-compose');
  const draft = root.querySelector('.d10-chat-draft');
  const send = root.querySelector('.d10-chat-send');
  const silent = root.querySelector('.d10-chat-silent');

  function post({ from, text }) {
    const item = document.createElement('li');
    item.dataset.from = from;
    if (from === 'system') item.textContent = text;
    else {
      const who = document.createElement('b');
      who.textContent = `${handles[from]}: `;
      item.append(who, document.createTextNode(text));
    }
    log.append(item);
    log.scrollTop = log.scrollHeight;
  }

  async function theyType(text) {
    if (reducedMotion) return;
    typing.textContent = 'daedalus84 is typing…';
    await sleep(Math.min(2600, 700 + text.length * 14));
    typing.textContent = '';
  }

  // Resolves 'send' or 'silent'.
  function ask(text, allowSilence) {
    draft.textContent = text;
    silent.hidden = !allowSilence;
    compose.hidden = false;
    send.focus();
    return new Promise((resolve) => {
      const done = (value) => {
        compose.hidden = true;
        send.onclick = null;
        silent.onclick = null;
        removeEventListener('keydown', onKey, true);
        resolve(value);
      };
      send.onclick = () => done('send');
      silent.onclick = () => done('silent');
      // Keys while a message waits: 1 or Enter sends, 2 stays silent, arrows move between the two.
      function onKey(event) {
        const code = event.code;
        if (event.repeat) {
          event.preventDefault();
          return;
        }
        if (code === 'Digit1' || code === 'Numpad1') done('send');
        else if ((code === 'Digit2' || code === 'Numpad2') && allowSilence) done('silent');
        else if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') done(allowSilence && document.activeElement === silent ? 'silent' : 'send');
        else if (code.startsWith('Arrow') && allowSilence) (document.activeElement === send ? silent : send).focus();
        else return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      addEventListener('keydown', onKey, true);
    });
  }

  return {
    // script: [{ from: 'system' | 'emily' | 'daedalus84', text, quiet? }]. `nudge(n)` gives
    // daedalus84's line for Emily's nth silence. Resolves with { silences }.
    async run(script, { nudge }) {
      log.replaceChildren();
      typing.textContent = '';
      compose.hidden = true;
      root.classList.remove('is-leaving');
      root.hidden = false;
      let silences = 0;
      for (const message of script) {
        if (message.from === 'emily') {
          let answer = await ask(message.text, !message.quiet);
          if (answer === 'silent') {
            const text = nudge(silences);
            silences += 1;
            await sleep(reducedMotion ? 0 : 900);
            await theyType(text);
            post({ from: 'daedalus84', text });
            answer = await ask(message.text, false);
          }
          post(message);
          await sleep(reducedMotion ? 0 : 500);
        } else if (message.from === 'daedalus84') {
          await theyType(message.text);
          post(message);
          await sleep(reducedMotion ? 0 : 250);
        } else {
          post(message);
          await sleep(reducedMotion ? 0 : 900);
        }
      }
      await sleep(reducedMotion ? 300 : 1800);
      root.classList.add('is-leaving');
      await sleep(reducedMotion ? 0 : 900);
      root.hidden = true;
      return { silences };
    },
    get isOpen() {
      return !root.hidden;
    },
  };
}

export function createDay10Ui(ctx) {
  if (typeof document === 'undefined') return { chat: { run: async () => ({ silences: 0 }), isOpen: false } };
  ensureCss('day10');
  const frame = document.getElementById('frame');
  if (!frame.day10Ui) frame.day10Ui = { chat: createChat(frame, ctx) };
  return frame.day10Ui;
}
