import type { AgeGroup, WritingSituation } from '../types'

// Writing Studio tasks. Each age group sees the ones tagged with it, in this order.

const ALL: AgeGroup[] = ['kids', 'teens', 'adults']
const KT: AgeGroup[] = ['kids', 'teens']
const TA: AgeGroup[] = ['teens', 'adults']
const K: AgeGroup[] = ['kids']
const A: AgeGroup[] = ['adults']

export const writingSituations: WritingSituation[] = [
  {
    id: 'message-friend',
    title: 'Message to a friend',
    ages: ALL,
    task: 'Tell a friend about your weekend, and ask about theirs.',
    starters: ['On Saturday I…', 'I want to…', 'What did you…?'],
  },
  {
    id: 'note-family',
    title: 'Note to your family',
    ages: K,
    task: 'Ask your family if you can do something fun this weekend. Say why you want to do it.',
    starters: ['Could we…?', 'I would like to…', 'The reason is that…'],
  },
  {
    id: 'message-teacher',
    title: 'Message to your teacher',
    ages: KT,
    task: 'You missed a lesson. Say sorry, and ask what you need to do to catch up.',
    starters: ['I am sorry that…', 'Could you help me…?', 'I need to…'],
  },
  {
    id: 'ask-question',
    title: 'Asking a question',
    ages: ALL,
    task: 'Ask someone for help with something you are learning. Say what you already tried.',
    starters: ['I am trying to…', 'Could you help me…?', 'What should I…?'],
  },
  {
    id: 'explain-problem',
    title: 'Explaining a problem',
    ages: ALL,
    task: 'Something isn’t working: a game, a phone or a website. Explain what happens and what you tried.',
    starters: ['I am trying to…', 'When I…, it…', 'I tried…, but…'],
  },
  {
    id: 'give-opinion',
    title: 'Giving your opinion',
    ages: ALL,
    task: 'Write what you think about an app, a film or a game. Give at least one reason.',
    starters: ['I think…', 'The reason is that…', 'I like…, but…'],
  },
  {
    id: 'email-client',
    title: 'Email to a client',
    ages: A,
    task: 'The website will be two days late. Explain why, say sorry, and suggest a new date.',
    starters: ['I am writing to let you know that…', 'The reason is that…', 'Would … work for you?'],
  },
  {
    id: 'professional-message',
    title: 'Professional message',
    ages: A,
    task: 'Ask a colleague for feedback on something you made. Be polite and clear about what you need.',
    starters: ['Could you take a look at…?', 'I would like to know…', 'Thank you for…'],
  },
  {
    id: 'project-requirements',
    title: 'Project requirements',
    ages: TA,
    task: 'Describe a simple website you want someone to build: its pages, its features and who it is for.',
    starters: ['I need a website that…', 'Users should be able to…', 'The home page should…'],
  },
  {
    id: 'website-description',
    title: 'Website description',
    ages: TA,
    task: 'Write two or three sentences for the home page of a small business, like a café or a shop.',
    starters: ['We are…', 'We help…', 'Visit us…'],
  },
  {
    id: 'prompt-claude-code',
    title: 'Prompt for Claude Code',
    ages: TA,
    task: 'Write a clear request for Claude Code: what to build, where it goes, and how to check that it works.',
    starters: ['Add a … to …', 'It should…', 'When you finish, check that…'],
  },
  {
    id: 'linkedin-post',
    title: 'LinkedIn post',
    ages: A,
    task: 'Share something you learned this week, and what you will do next with it.',
    starters: ['This week I learned…', 'What surprised me was…', 'Next, I want to…'],
  },
]

export const situationsById = new Map(writingSituations.map((s) => [s.id, s]))
