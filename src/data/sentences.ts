import type { AgeGroup, SentencePattern } from '../types'

// The Sentence Builder patterns. Each pattern has 8 exercises:
// kids see 4, teens see 4 and adults see 4 (some exercises are shared).
// Order matters: the first two each age group sees are "Build it", the next two "Finish it".

const KT: AgeGroup[] = ['kids', 'teens']
const K: AgeGroup[] = ['kids']
const TA: AgeGroup[] = ['teens', 'adults']
const A: AgeGroup[] = ['adults']

export const sentencePatterns: SentencePattern[] = [
  {
    id: 'i-think',
    title: 'I think…',
    shape: [{ text: 'I think' }, { text: 'your opinion', slot: true }],
    whenToUse:
      'Give your opinion. It sounds friendly and polite, because it shows this is what you believe, not a fact.',
    examples: ['I think this design is too busy.', 'I think we should start earlier.', 'I think she is right.'],
    check: { starts: ['I think'] },
    writePrompt: 'What do you think about a game, an app or a website you use? Start with “I think”.',
    exercises: [
      { ages: KT, situation: 'Your friend shows you a new game.', sentence: 'I think this game is really fun.' },
      { ages: K, situation: 'Your teacher asks about the story you read.', sentence: 'I think the story was very funny.' },
      { ages: KT, situation: 'You and your friend are choosing a film.', sentence: 'I think we should watch the new film.' },
      { ages: K, situation: 'Your sister shows you her drawing.', sentence: 'I think your picture is beautiful.' },
      { ages: TA, situation: 'A friend asks what you think of their new website.', sentence: 'I think the text is too small.' },
      { ages: A, situation: 'Your team is planning a new project.', sentence: 'I think we need more time for testing.' },
      { ages: TA, situation: 'Someone asks about a phone you want to buy.', sentence: 'I think this phone is too expensive.' },
      { ages: A, situation: 'A client shows you two logo designs.', sentence: 'I think the second logo looks more professional.' },
    ],
  },
  {
    id: 'i-would-like-to',
    title: 'I want to… / I would like to…',
    shape: [{ text: 'I would like to' }, { text: 'do something', slot: true }],
    whenToUse:
      'Say what you want to do. “I want to” is fine with friends and family. “I would like to” is more polite: use it with teachers, clients and in shops.',
    examples: ['I want to learn how to swim.', 'I would like to change the main picture.', 'I would like to book a table for two.'],
    check: { starts: ['I would like to', 'I want to', "I'd like to"] },
    writePrompt: 'What would you like to learn or do this year? Start with “I would like to” or “I want to”.',
    exercises: [
      { ages: KT, situation: 'Your friend asks about your weekend plans.', sentence: 'I want to play football on Saturday.' },
      { ages: K, situation: 'You are at the library with a book you like.', sentence: 'I would like to borrow this book, please.' },
      { ages: KT, situation: 'Your parents ask about the summer holiday.', sentence: 'I want to visit my cousins in the summer.' },
      { ages: K, situation: 'Your teacher asks about your dream job.', sentence: 'I want to be a doctor one day.' },
      { ages: TA, situation: 'You are talking to a shop assistant.', sentence: 'I would like to return these shoes.' },
      { ages: A, situation: 'You are writing to a client about their website.', sentence: 'I would like to show you the first version.' },
      { ages: TA, situation: 'A friend asks about your plans for the future.', sentence: 'I want to learn how to build websites.' },
      { ages: A, situation: 'You are calling a restaurant.', sentence: 'I would like to book a table for four.' },
    ],
  },
  {
    id: 'i-need-to',
    title: 'I need to…',
    shape: [{ text: 'I need to' }, { text: 'something necessary', slot: true }],
    whenToUse: 'Say that something is necessary or important. Use it for tasks you must do.',
    examples: ['I need to finish this report today.', 'I need to buy some milk.', 'I need to talk to you about the project.'],
    check: { starts: ['I need to'] },
    writePrompt: 'What do you need to do this week? Start with “I need to”.',
    exercises: [
      { ages: KT, situation: 'It is late and you have school tomorrow.', sentence: 'I need to go to bed early.' },
      { ages: K, situation: 'Your friend wants to play, but you have homework.', sentence: 'I need to finish my homework first.' },
      { ages: KT, situation: 'Your phone battery is almost empty.', sentence: 'I need to charge my phone.' },
      { ages: K, situation: 'You are getting ready for the beach.', sentence: 'I need to bring my hat and water.' },
      { ages: TA, situation: 'You forgot the password for your account.', sentence: 'I need to reset my password.' },
      { ages: A, situation: 'A client asks when the website will be ready.', sentence: 'I need to fix two small bugs first.' },
      { ages: TA, situation: 'Your friend asks about your busy morning.', sentence: 'I need to send three emails this morning.' },
      { ages: A, situation: 'There is an important meeting this afternoon.', sentence: 'I need to prepare the slides for the meeting.' },
    ],
  },
  {
    id: 'i-am-trying-to',
    title: 'I am trying to…',
    shape: [{ text: 'I am trying to' }, { text: 'what you are working on', slot: true }],
    whenToUse:
      'Say what you are working on now, especially when it is difficult. It is a great way to start asking for help.',
    examples: ['I am trying to fix a bug in the menu.', 'I am trying to learn ten new words a day.', 'I’m trying to understand this error.'],
    check: { starts: ['I am trying to', "I'm trying to"] },
    writePrompt: 'What are you working on at the moment? Start with “I am trying to”.',
    exercises: [
      { ages: KT, situation: 'Your friend asks why you are so quiet.', sentence: 'I am trying to finish this puzzle.' },
      { ages: K, situation: 'Your mum asks what you are doing with the blocks.', sentence: 'I am trying to build a tall tower.' },
      { ages: KT, situation: 'Your brother is making a lot of noise.', sentence: 'I am trying to read my book.' },
      { ages: K, situation: 'You are learning to ride a bike.', sentence: 'I am trying to ride without help.' },
      { ages: TA, situation: 'You are asking for help in an online forum.', sentence: 'I am trying to install the app on my laptop.' },
      { ages: A, situation: 'You send a message to a developer friend.', sentence: 'I am trying to connect the form to the database.' },
      { ages: TA, situation: 'A friend asks why you study every evening.', sentence: 'I am trying to improve my English writing.' },
      { ages: A, situation: 'You explain a problem to your team.', sentence: 'I am trying to make the page load faster.' },
    ],
  },
  {
    id: 'could-you-help-me',
    title: 'Could you help me…?',
    shape: [{ text: 'Could you help me' }, { text: 'with something / do something', slot: true }, { text: '?' }],
    whenToUse:
      'Ask for help politely. “Could you” is softer than “Can you”, so it works with anyone. Say “help me fix it”, not “help me to fix it” in everyday English.',
    examples: ['Could you help me with this form?', 'Could you help me find the station?', 'Could you help me understand this error?'],
    check: { starts: ['Could you help me'], question: true },
    writePrompt: 'Ask someone for help with something real. Start with “Could you help me” and end with a question mark.',
    exercises: [
      { ages: KT, situation: 'Your homework is very difficult.', sentence: 'Could you help me with my maths homework?' },
      { ages: K, situation: 'Your school bag is very heavy.', sentence: 'Could you help me carry my bag?' },
      { ages: KT, situation: 'It is your first day and you are lost.', sentence: 'Could you help me find my classroom?' },
      { ages: K, situation: 'Your shoelaces are open.', sentence: 'Could you help me tie my shoes?' },
      { ages: TA, situation: 'You are lost in a new city.', sentence: 'Could you help me find the train station?' },
      { ages: A, situation: 'An email from a client is confusing.', sentence: 'Could you help me understand this message?' },
      { ages: TA, situation: 'Your laptop is not working.', sentence: 'Could you help me fix my laptop?' },
      { ages: A, situation: 'It is your first day at a new job.', sentence: 'Could you help me set up my account?' },
    ],
  },
  {
    id: 'the-reason-is',
    title: 'The reason is that…',
    shape: [{ text: 'The reason is that' }, { text: 'why it happened', slot: true }],
    whenToUse:
      'Explain why something happened. It sounds clear and calm, which helps when you describe a problem or say sorry.',
    examples: ['The reason is that the images are very large.', 'The reason is that I was ill yesterday.', 'The reason is that the bus was late.'],
    check: { starts: ['The reason is'] },
    writePrompt: 'Think of something that happened recently. Explain why, starting with “The reason is that”.',
    exercises: [
      { ages: KT, situation: 'Your teacher asks why you were late.', sentence: 'The reason is that the bus was late.' },
      { ages: K, situation: 'Your friend asks why you are sad.', sentence: 'The reason is that I lost my toy.' },
      { ages: KT, situation: 'Your mum asks why you are so tired.', sentence: 'The reason is that I slept badly.' },
      { ages: K, situation: 'Your teacher asks why your shoes are wet.', sentence: 'The reason is that it rained this morning.' },
      { ages: TA, situation: 'A friend asks why you missed the party.', sentence: 'The reason is that I had an exam.' },
      { ages: A, situation: 'A client asks why the website is slow.', sentence: 'The reason is that the images are too large.' },
      { ages: TA, situation: 'Someone asks why you are learning English.', sentence: 'The reason is that I want to work abroad.' },
      { ages: A, situation: 'Your manager asks why the project is late.', sentence: 'The reason is that the client changed the design.' },
    ],
  },
  {
    id: 'what-i-mean-is',
    title: 'What I mean is that…',
    shape: [{ text: 'What I mean is that' }, { text: 'your idea, said more clearly', slot: true }],
    whenToUse:
      'Say something again in a clearer way when someone did not understand you. It keeps the conversation friendly.',
    examples: ['What I mean is that the text is too small.', 'What I mean is that we need more time.', 'What I mean is that I liked the first idea more.'],
    check: { starts: ['What I mean is'] },
    writePrompt: 'Imagine someone did not understand you. Say it again more clearly, starting with “What I mean is that”.',
    exercises: [
      { ages: KT, situation: 'Your friend does not understand your idea for a game.', sentence: 'What I mean is that we play in two teams.' },
      { ages: K, situation: 'Your dad does not understand what you want for dinner.', sentence: 'What I mean is that I want pizza tonight.' },
      { ages: KT, situation: 'Your friend thinks you are angry with them.', sentence: 'What I mean is that I need a short break.' },
      { ages: K, situation: 'Your teacher does not understand your answer.', sentence: 'What I mean is that the cat was hungry.' },
      { ages: TA, situation: 'A friend misunderstands your message about tonight.', sentence: "What I mean is that I can't come today." },
      { ages: A, situation: 'A client is confused by your feedback.', sentence: 'What I mean is that the menu is hard to find.' },
      { ages: TA, situation: 'Your classmate does not understand your plan.', sentence: 'What I mean is that we should share the work.' },
      { ages: A, situation: 'Your team does not understand your suggestion.', sentence: 'What I mean is that we should test on phones first.' },
    ],
  },
  {
    id: 'because-but-so',
    title: 'because, but, so',
    shape: [{ text: 'first idea', slot: true }, { text: 'because / but / so' }, { text: 'second idea', slot: true }],
    whenToUse:
      'Join two ideas in one sentence. “Because” gives a reason, “but” shows a difference, and “so” shows a result. Put a comma before “but” and “so”.',
    examples: [
      'I stayed at home because it was raining.',
      'I like the design, but the button is hard to see.',
      'The site was slow, so we made the images smaller.',
    ],
    check: { contains: ['because', 'but', 'so'] },
    writePrompt: 'Write one sentence with two ideas joined by “because”, “but” or “so”.',
    exercises: [
      { ages: KT, situation: 'Your friend asks why you are so happy today.', sentence: 'I am happy because it is my birthday.' },
      { ages: K, situation: 'You want to play outside, but look at the weather.', sentence: 'I want to play outside, but it is raining.' },
      { ages: KT, situation: 'You were very tired after school.', sentence: 'I was tired, so I went to bed early.' },
      { ages: K, situation: 'You are very hungry before lunch.', sentence: "I am hungry because I didn't eat breakfast." },
      { ages: TA, situation: 'A friend asks what you think of your new phone.', sentence: 'I like the camera, but the battery is weak.' },
      { ages: A, situation: 'You tell your team about a problem you solved.', sentence: 'The login page was broken, so I fixed it.' },
      { ages: TA, situation: 'Someone asks why you are studying tonight.', sentence: 'I am studying because I have an exam tomorrow.' },
      { ages: A, situation: 'You give feedback on a new design.', sentence: 'I like the layout, but the text is too small.' },
    ],
  },
  {
    id: 'questions',
    title: 'Asking questions',
    shape: [{ text: 'Do / Can / What / When…' }, { text: 'you' }, { text: 'the rest of the question', slot: true }, { text: '?' }],
    whenToUse:
      'Ask for information. Put the question word (what, when, how) or do, can or are first, and end with a question mark.',
    examples: ['Do you have time on Friday?', 'When can you send the files?', 'What do you think about this idea?'],
    check: { question: true },
    writePrompt: 'Ask a friend, a teacher or a client a real question. Remember the question mark.',
    exercises: [
      { ages: KT, situation: 'You want to play with a friend after school.', sentence: 'Do you want to play after school?' },
      { ages: K, situation: 'You cannot find your pencil.', sentence: 'Have you seen my blue pencil?' },
      { ages: KT, situation: 'Your friend is back after the weekend.', sentence: 'What did you do at the weekend?' },
      { ages: K, situation: 'You are hungry and want to know about lunch.', sentence: 'When is it time for lunch?' },
      { ages: TA, situation: 'You want to meet a friend this weekend.', sentence: 'Are you free on Saturday afternoon?' },
      { ages: A, situation: 'You need photos from a client for their website.', sentence: 'When can you send me the photos?' },
      { ages: TA, situation: 'Your friend plays the guitar very well.', sentence: 'How did you learn to play the guitar?' },
      { ages: A, situation: 'You want your client’s opinion.', sentence: 'What do you think about the new design?' },
    ],
  },
  {
    id: 'negatives',
    title: 'Saying no: don’t, can’t, isn’t',
    shape: [{ text: 'I / It / We' }, { text: "don't / can't / isn't" }, { text: 'the rest', slot: true }],
    whenToUse:
      'Say that something is not true or not possible. In messages, use the short forms: don’t, can’t, isn’t, didn’t.',
    examples: ['I don’t understand this error.', 'I can’t come to the meeting today.', 'The button isn’t working on phones.'],
    check: { negative: true },
    writePrompt: 'Write about something you don’t like, can’t do, or that isn’t working. Use don’t, can’t, isn’t or didn’t.',
    exercises: [
      { ages: KT, situation: 'Your friend offers you a very hot snack.', sentence: "I don't like spicy food." },
      { ages: K, situation: 'Your friend wants to swim in the deep pool.', sentence: "I can't swim very well yet." },
      { ages: KT, situation: 'Your teacher asks about the homework.', sentence: "I didn't understand the last question." },
      { ages: K, situation: 'Your mum asks why you are not playing with your toy car.', sentence: "My toy car isn't working." },
      { ages: TA, situation: 'A friend asks you to come out tonight.', sentence: "I can't come because I am busy." },
      { ages: A, situation: 'You report a bug to your team.', sentence: "The contact form isn't sending emails." },
      { ages: TA, situation: 'Your friend asks what you thought of a film.', sentence: "I didn't enjoy the ending of the film." },
      { ages: A, situation: 'A client asks about the deadline.', sentence: "We can't finish everything by Friday." },
    ],
  },
]
