// THE FRIENDSHIP MIRROR (GAME-PLAN §8 beat 9): the DOM page. It shows whatever paper a day's
// writer returns ({ masthead, date, headline, body }); each writer is writeDayNN(state) in
// game/script/dayNN.js, pure, so check-script.mjs can try every flag combination.

const numberWords = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
export const inWords = (n) => numberWords[n] ?? String(n);


export function createNewspaper(root) {
  const date = root.querySelector('.paper-date');
  const headline = root.querySelector('.paper-headline');
  const body = root.querySelector('.paper-body');
  const sleep = root.querySelector('.paper-sleep');
  return {
    show(paper) {
      date.textContent = paper.date;
      headline.textContent = paper.headline;
      body.replaceChildren(...paper.body.map((sentence) => {
        const p = document.createElement('p');
        p.textContent = sentence;
        return p;
      }));
      root.hidden = false;
      sleep.focus();
      return new Promise((resolve) => {
        sleep.addEventListener('click', () => {
          root.hidden = true;
          resolve();
        }, { once: true });
      });
    },
  };
}
