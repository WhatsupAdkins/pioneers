// Day 8, SPECIAL EVENT: SUPER BLIZZARD TERRORIZES FRIENDSHIP: the chapter's section from "At
// the end of March" to "The amputation could not be avoided.", quoted word for word in source
// order (L8.01–L8.26). A line is `text`, one verbatim run of the book, or `parts`, verbatim
// runs of one speech with the speech tag between them dropped (see ../lines.js).
// The Editor's "Ms. Marks," and the rest of his sentence are two lines (L8.11, L8.12): joined
// by the parts rule the vocative would lose its comma.
export const lines = {
  'L8.01': { kind: 'narration', text: 'At the end of March, Daedalus went to Eidetic Bluffs to perform eye examinations for the settlement’s school.' },
  'L8.02': { speaker: 'emily', parts: ['It takes an entire day to get to the Bluffs,', 'If they want glasses so badly, why shouldn’t they come to you?'] },
  'L8.03': { speaker: 'daedalus', parts: ['It is thirty children, Em,', 'What if it was LQ who could not see?'] },
  'L8.04': { speaker: 'emily', text: 'You are soft-hearted.' },
  'L8.05': { kind: 'narration', text: 'The blizzard began not long after Daedalus had left for the Bluffs.' },
  'L8.06': { kind: 'narration', text: 'Emily didn’t worry too much about the doctor because the worst that happened in Friendship was that one ran out of hearts. Even if Daedalus had gotten caught in the storm, eventually, the doctor would recharge and then she would return.' },
  'L8.07': { kind: 'narration', text: 'Three days after the blizzard, Daedalus still had not returned.' },
  'L8.08': { kind: 'narration', text: 'The snow had begun to thaw, so Emily left Ludo Quintus with Alabaster, and she rode out to Eidetic Bluffs, where they informed her that Daedalus had never arrived.' },
  'L8.09': { kind: 'narration', text: 'On the fourth day, Daedalus’s horse returned to the stable in the Valley without her mistress.' },
  'L8.10': { kind: 'narration', text: 'Emily spoke to the Editor, and despite her aversion to posting, she had him put a notice on the Friendship Hutch about Daedalus’s disappearance.' },
  'L8.11': { speaker: 'editor', text: 'Ms. Marks,' },
  'L8.12': { speaker: 'editor', text: 'there are times when people leave our world without explanation. We must—' },
  'L8.13': { speaker: 'emily', text: 'Skip.' },
  'L8.14': { kind: 'narration', text: 'On the fifth day, Emily searched again. This time, she took only roads she had never been on before. This led her to southwestern Undiscovered Friendship, where the land was cheap and sere.' },
  'L8.15': { kind: 'narration', text: 'She rode past several ranches, an aviary, an exotic plant nursery, a piano store, a spa, a small amusement park, a museum devoted to old technology, a horse breaker, an arcade, a casino, an explosives warehouse, and other businesses that were too large, anachronistic, or aesthetically inappropriate to be contained downtown.' },
  'L8.16': { kind: 'narration', text: 'No one that she encountered had seen Daedalus.' },
  'L8.17': { kind: 'narration', text: 'At the arcade, a man in a seersucker suit suggested she try the caves, as people sometimes took refuge in them.' },
  'L8.18': { speaker: 'seersucker', parts: ['It’s hard to find the entrance,', 'Some people say it moves.'] },
  'L8.19': { kind: 'narration', text: 'She circled the perimeter of the mountain. The sun had gone down, but some light remained. She decided she would search until the light was gone before turning back.' },
  'L8.20': { speaker: 'daedalus', text: 'I’m here.' },
  'L8.21': { speaker: 'emily', text: 'I’m coming!' },
  'L8.22': { kind: 'narration', text: 'Emily turned Pixel around, and they backtracked slowly. She spotted an oddly shimmering place in the rocks. She dismounted her horse and she walked through the nebula, into a cavern.' },
  'L8.23': { kind: 'narration', text: 'Inside was Daedalus, barely alive and her right hand a disturbing shade of black. Daedalus said her horse had been spooked and had thrown her, just as the blizzard had begun. She had gone into the cave for shelter.' },
  'L8.24': { speaker: 'daedalus', parts: ['I think there may be an injury to my hand,'] },
  'L8.25': { kind: 'narration', text: 'Emily nursed Daedalus through recovery. Before long, it became clear to Emily that if Daedalus were to survive, her hand would need to be amputated.' },
  'L8.26': { kind: 'narration', text: 'The amputation could not be avoided.' },
};
