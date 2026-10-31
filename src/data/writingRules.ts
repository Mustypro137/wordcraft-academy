import type { WritingRule } from '../types'

// Common mistakes the Writing Studio can find. Each phrase is matched as whole words, ignoring capitals.
// Only add phrases that are wrong almost every time, so the checker doesn't "correct" good English.

export const writingRules: WritingRule[] = [
  // Comparing: better, easier, bigger…
  {
    find: ['more good'],
    use: 'better',
    hint: '“Good” has its own word for “more good”.',
    why: 'Good → better → best. Even more natural for a website or a skill: “improve”, as in “I want to improve my website”.',
  },
  {
    find: ['more better', 'much more better'],
    use: 'better',
    hint: '“Better” already means “more good”.',
    why: '“Better” is already a comparing word, so “more” is not needed.',
  },
  { find: ['more bad'], use: 'worse', hint: '“Bad” has its own word for “more bad”.', why: 'Bad → worse → worst.' },
  { find: ['most best', 'the most best'], use: 'the best', hint: '“Best” already means “most good”.', why: '“Best” is already the top level, so “most” is not needed.' },
  { find: ['more easy'], use: 'easier', hint: 'Short words add an ending instead of “more”.', why: 'Words like easy, big and fast add -er: easy → easier.' },
  { find: ['more fast'], use: 'faster', hint: 'Short words add an ending instead of “more”.', why: 'Short words add -er: fast → faster.' },
  { find: ['more big'], use: 'bigger', hint: 'Short words add an ending instead of “more”.', why: 'Short words add -er: big → bigger (the g doubles).' },
  { find: ['more small'], use: 'smaller', hint: 'Short words add an ending instead of “more”.', why: 'Short words add -er: small → smaller.' },
  { find: ['more cheap'], use: 'cheaper', hint: 'Short words add an ending instead of “more”.', why: 'Short words add -er: cheap → cheaper.' },
  { find: ['more nice'], use: 'nicer', hint: 'Short words add an ending instead of “more”.', why: 'Short words add -er: nice → nicer.' },
  { find: ['more quick'], use: 'quicker', hint: 'Short words add an ending instead of “more”.', why: 'Short words add -er: quick → quicker.' },

  // Agree
  { find: ['i am agree', "i'm agree"], use: 'I agree', hint: '“Agree” is a verb, so it doesn’t need “am”.', why: 'We say “I agree”, like “I like” or “I think”. No “am”.' },
  { find: ['are agree'], use: 'agree', hint: '“Agree” is a verb, so it doesn’t need “are”.', why: 'We say “we agree” or “they agree”. No “are”.' },
  { find: ['is agree'], use: 'agrees', hint: '“Agree” is a verb, so it doesn’t need “is”.', why: 'We say “she agrees”. No “is”.' },

  // Verbs that don't need a small word after them
  { find: ['discuss about'], use: 'discuss', hint: '“Discuss” doesn’t need a small word after it.', why: 'Discuss already means “talk about”, so we say “discuss the plan”.' },
  { find: ['return back'], use: 'return', hint: 'One of these two words already says it.', why: '“Return” already means “go back”.' },
  { find: ['revert back'], use: 'reply', hint: 'In emails, there is a simpler word for answering.', why: '“Revert” means “go back to an old state”. To answer a message, say “reply”.' },
  { find: ['repeat again'], use: 'repeat', hint: 'One of these two words already says it.', why: '“Repeat” already means “do or say again”.' },
  { find: ['can able to'], use: 'can', hint: '“Can” and “able to” mean the same thing. Use one.', why: 'Say “I can do it” or “I am able to do it”, not both.' },
  { find: ['could able to'], use: 'could', hint: '“Could” and “able to” mean the same thing. Use one.', why: 'Say “I could do it” or “I was able to do it”, not both.' },
  { find: ['enter into the room', 'enter in the room'], use: 'enter the room', hint: '“Enter” doesn’t need a small word after it.', why: '“Enter” already means “go into”.' },

  // Missing small words
  { find: ['explain me'], use: 'explain to me', hint: 'A small word is missing after “explain”.', why: 'We explain something to someone: “Could you explain it to me?”' },
  { find: ['listen music'], use: 'listen to music', hint: 'A small word is missing after “listen”.', why: 'We listen to something: “I listen to music.”' },
  { find: ['wait you'], use: 'wait for you', hint: 'A small word is missing after “wait”.', why: 'We wait for someone: “I will wait for you.”' },
  { find: ['wait me'], use: 'wait for me', hint: 'A small word is missing after “wait”.', why: 'We wait for someone: “Could you wait for me?”' },
  { find: ['depend of'], use: 'depend on', hint: 'The small word after “depend” is different.', why: 'In English we say “depend on”: “It depends on the price.”' },
  { find: ['depends of'], use: 'depends on', hint: 'The small word after “depends” is different.', why: 'In English we say “depend on”: “It depends on the price.”' },
  { find: ['married with'], use: 'married to', hint: 'The small word after “married” is different.', why: 'We say “She is married to a doctor.”' },
  { find: ['in the internet'], use: 'on the internet', hint: 'The small word before “the internet” is different.', why: 'We say “on the internet” and “online”.' },
  { find: ['in the same time'], use: 'at the same time', hint: 'The small word at the start is different.', why: 'The fixed phrase is “at the same time”.' },
  { find: ["it's depend", 'its depend'], use: 'it depends', hint: 'The verb needs an ending here.', why: 'We say “It depends” or “It depends on…”.' },

  // Do or make, say or tell…
  { find: ['do a mistake'], use: 'make a mistake', hint: 'Mistakes use a different verb.', why: 'In English we “make” mistakes: “Everyone makes mistakes.”' },
  { find: ['did a mistake'], use: 'made a mistake', hint: 'Mistakes use a different verb.', why: 'In English we “make” mistakes: “I made a mistake.”' },
  { find: ['doing a mistake'], use: 'making a mistake', hint: 'Mistakes use a different verb.', why: 'In English we “make” mistakes.' },
  { find: ['make my homework'], use: 'do my homework', hint: 'Homework uses a different verb.', why: 'We “do” homework, tasks and exercises.' },
  { find: ['make homework'], use: 'do homework', hint: 'Homework uses a different verb.', why: 'We “do” homework, tasks and exercises.' },
  { find: ['make a photo'], use: 'take a photo', hint: 'Photos use a different verb.', why: 'We “take” photos and pictures with a camera.' },
  { find: ['say me'], use: 'tell me', hint: 'When you name the person, use a different verb.', why: 'We “tell” someone something, but “say” something: “Tell me” or “Say it again.”' },
  { find: ['said me'], use: 'told me', hint: 'When you name the person, use a different verb.', why: 'We “told” someone something: “She told me the news.”' },
  { find: ['borrow me'], use: 'lend me', hint: 'Think about who gives and who receives.', why: 'You “borrow” from someone; they “lend” to you: “Could you lend me a pen?”' },
  { find: ['learn me'], use: 'teach me', hint: 'Think about who gives the lesson.', why: 'A teacher “teaches” you; you “learn”: “Could you teach me?”' },
  { find: ['open the light'], use: 'turn on the light', hint: 'Lights and machines use a different verb.', why: 'We “turn on” and “turn off” lights, TVs and computers.' },
  { find: ['close the light'], use: 'turn off the light', hint: 'Lights and machines use a different verb.', why: 'We “turn on” and “turn off” lights, TVs and computers.' },

  // Words with no plural
  { find: ['informations'], use: 'information', hint: 'This word has no plural form.', why: '“Information” has no -s. Say “some information” or “a piece of information”.' },
  { find: ['advices'], use: 'advice', hint: 'This word has no plural form.', why: '“Advice” has no -s. Say “some advice” or “a piece of advice”.' },
  { find: ['feedbacks'], use: 'feedback', hint: 'This word has no plural form.', why: '“Feedback” has no -s. Say “some feedback”.' },
  { find: ['softwares'], use: 'software', hint: 'This word has no plural form.', why: '“Software” has no -s. Say “software tools” or “apps”.' },
  { find: ['furnitures'], use: 'furniture', hint: 'This word has no plural form.', why: '“Furniture” has no -s. Say “pieces of furniture”.' },
  { find: ['equipments'], use: 'equipment', hint: 'This word has no plural form.', why: '“Equipment” has no -s.' },

  // Many or much, people are…
  { find: ['much people'], use: 'many people', hint: 'People can be counted.', why: 'Use “many” for things you can count (people, books) and “much” for things you can’t (time, water).' },
  { find: ['much things'], use: 'many things', hint: 'Things can be counted.', why: 'Use “many” for things you can count.' },
  { find: ['people is'], use: 'people are', hint: '“People” means more than one person.', why: '“People” is plural, so it takes “are”: “People are friendly here.”' },
  ...(['he', 'she', 'it'] as const).map((who) => ({
    find: [`${who} don't`],
    use: `${who} doesn't`,
    hint: 'He, she and it use a different form.',
    why: 'With he, she and it, we say “doesn’t”: “It doesn’t work.”',
  })),

  // Phrases that sound unnatural
  { find: ['according to me'], use: 'in my opinion', hint: 'There is a more natural way to give your own opinion.', why: '“According to” is for other people or sources. For yourself, say “in my opinion” or “I think”.' },
  { find: ['for example like'], use: 'for example', hint: 'Two words here say the same thing.', why: '“For example” and “like” do the same job. Use one.' },
  { find: ['have a doubt'], use: 'have a question', hint: 'When you want to ask something, there is a clearer word.', why: 'In English, a “doubt” means you are not sure something is true. To ask something, say “I have a question”.' },
  { find: ['do the needful'], use: 'take care of it', hint: 'This phrase is not used in most countries.', why: '“Do the needful” sounds old-fashioned. Say what you need: “Could you take care of it?”' },
  { find: ['prepone'], use: 'bring forward', hint: 'This word is not used in most countries.', why: 'To move a meeting earlier, say “bring forward”: “Can we bring the meeting forward?”' },
]
