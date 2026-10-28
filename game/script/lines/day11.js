// Day 11, BOY REACHES END: the chapter's eleventh section, quoted word for word in source
// order (L11.01–L11.11). A line is `text`, one verbatim run of the book, or `parts`, verbatim
// runs of one speech with the speech tag between them dropped (see ../lines.js).
export const lines = {
  'L11.01': { kind: 'narration', text: 'Some days or months or years later, Emily logged back on to check on LQ. He had aged three years during her absence, and he was now a sturdy boy of eleven.' },
  'L11.02': { speaker: 'lq', parts: ['Mama, where have you been?', 'Mother and I have been worried about you.'] },
  'L11.03': { speaker: 'emily', parts: ['Would you like to go for a swim?'] },
  'L11.04': { kind: 'narration', text: 'Emily and LQ swam out their usual two screens. LQ asked if he could keep swimming, and Emily thought about it for a moment.' },
  'L11.05': { speaker: 'emily', text: 'Why not? You’re much bigger now.' },
  'L11.06': { kind: 'narration', text: 'They swam until they reached the end of the ocean.' },
  'L11.07': { speaker: 'lq', parts: ['It is so peaceful here at the end,'] },
  'L11.08': { speaker: 'emily', parts: ['It is peaceful,'] },
  // "Mama," LQ said. "I'm worried…": two lines, because "Mama," alone first matches earlier in the book
  'L11.09': { speaker: 'lq', parts: ['Mama,'] },
  'L11.10': { speaker: 'lq', text: 'I’m worried. I don’t think I have enough hearts to get back.' },
  'L11.11': { speaker: 'emily', text: 'Don’t worry, my love. You aren’t real, so you can’t die.' },
};
