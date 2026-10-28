// Items, Day 4 (from the §A.5 item list, Run 2): the second poem, the Go board, the glass heart and horse;
// Run 3 added the sequoia's wood.
// Fields: name, text (shown in the inventory), eat (hearts restored by eating), gift (may be
// given to an NPC), sell (the Mercantile's price). Icons share the id (art/icons.js for Day 1, art/days/dayNN.js after).
export const items = {
  'poem-2': { name: 'A second poem', text: 'Folded small and tied with a thread.' },
  'go-board': { name: 'Go board', text: 'Nineteen lines by nineteen, carved by hand.' },
  'glass-heart': { name: 'Glass heart', text: 'Still warm.' },
  wood: { name: 'Sequoia wood', text: 'From the great sequoia of Myre Farm. Enough for a board.' },
  'glass-horse': { name: 'Glass horse', text: 'A little azure mare in glass.', gift: true },
};
