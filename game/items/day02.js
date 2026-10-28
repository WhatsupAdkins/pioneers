// Items, Day 2: what the farm and the neighbors trade in, and the poem.
// Fields: name, text (shown in the inventory), eat (hearts restored by eating), gift (may be
// given to an NPC), sell (the Mercantile's price). Icons share the id (art/icons.js for Day 1, art/days/dayNN.js after).
export const items = {
  rock: { name: 'Rock', text: 'What the farm grows best. Grey, honest, heavy.', gift: true },
  turnip: { name: 'Turnip', text: 'A gift from a neighbor. Eating it restores 1 heart.', eat: 1, gift: true, sell: 2 },
  cheese: { name: 'Block of cheese', text: 'A gift from a neighbor. Eating it restores 2 hearts.', eat: 2, gift: true, sell: 2 },
  seeds: { name: 'Seeds', text: 'From the Mercantile. One packet sows one tilled plot.' },
  water: { name: 'Well water', text: 'Drawn at the well. Each measure waters one sown plot.' },
  carrot: { name: 'Carrot', text: 'Grown in the Foglands, against the odds. Eating it restores 2 hearts.', eat: 2, gift: true },
  poem: { name: 'A poem', text: 'In certain seasons, / We may be nourished by / The idea of the carrot / More than the carrot itself.' },
  wine: { name: 'Wine', text: 'From the vineyard.', gift: true },
};
