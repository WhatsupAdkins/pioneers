// Items, Day 1: the Editor's gift and the deed to Myre Farm.
// Fields: name, text (shown in the inventory), eat (hearts restored by eating), gift (may be
// given to an NPC), sell (the Mercantile's price). Icons share the id (art/icons.js for Day 1, art/days/dayNN.js after).
export const items = {
  bread: { name: 'Panem et caseum morsu', text: 'Bread and cheese, from the Editor. Eating it restores 3 hearts.', eat: 3, gift: true },
  deed: { name: 'Deed: Upper Foglands', text: 'The Myre Farm plot, Upper Foglands. Signed, stamped, and hers.' },
};
