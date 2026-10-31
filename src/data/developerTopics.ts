import type { DeveloperTopic } from '../types'

// Developer English topics. Each sentence is the kind of thing developers really write,
// with its technical words explained in plain English.

export const developerTopics: DeveloperTopic[] = [
  {
    id: 'html-css',
    title: 'HTML & CSS',
    summary: 'The building blocks of web pages, and how they look.',
    wordIds: ['element', 'attribute', 'style', 'layout', 'responsive', 'accessibility'],
    sentences: [
      {
        kind: 'Project requirement',
        text: 'Make the layout responsive and style the buttons like the design.',
        plain: 'Arrange the page so it fits every screen, and make the buttons look like the design.',
        terms: {
          layout: 'how things are arranged on the page',
          responsive: 'fits phones, tablets and computers',
          style: 'set how it looks with CSS',
        },
      },
      {
        kind: 'Bug report',
        text: 'The image element is missing an alt attribute.',
        plain: 'The picture has no text description, so screen readers cannot describe it.',
        terms: {
          element: 'one building block of the page',
          attribute: 'extra information written inside the tag',
        },
      },
      {
        kind: 'Prompt for Claude Code',
        text: 'Check every page for accessibility problems, then fix the layout on small screens.',
        plain: 'Make sure everyone, including people with disabilities, can use the site. Then fix how it looks on phones.',
        terms: {
          accessibility: 'everyone can use it, including people with disabilities',
          layout: 'how things are arranged on the page',
        },
      },
    ],
    task: 'Ask a developer to change how the contact page looks on phones.',
  },
  {
    id: 'javascript',
    title: 'JavaScript',
    summary: 'The code that makes pages react when people click and type.',
    wordIds: ['variable', 'function', 'event', 'error', 'console', 'bug', 'debug'],
    sentences: [
      {
        kind: 'Prompt for Claude Code',
        text: 'Add a click event to the button that calls the save function.',
        plain: 'When someone clicks the button, run the code that saves.',
        terms: {
          event: 'something that happens on the page, like a click',
          function: 'a named piece of code that does one job',
        },
      },
      {
        kind: 'Bug report',
        text: 'The console shows an error when the variable is empty.',
        plain: 'A problem message appears in the browser tools when nothing is stored yet.',
        terms: {
          console: 'the panel where code messages appear',
          error: 'a problem message',
          variable: 'a name in code that stores a value',
        },
      },
      {
        kind: 'Team message',
        text: "I'm trying to debug this bug, but the function never runs.",
        plain: "I'm looking for the cause of this problem, but that piece of code never starts.",
        terms: {
          debug: 'find and fix the cause of a problem',
          bug: 'a mistake in the code',
          function: 'a named piece of code that does one job',
        },
      },
    ],
    task: 'Explain a problem to a teammate: a button on your page does nothing when you click it.',
  },
  {
    id: 'git',
    title: 'Git & GitHub',
    summary: 'Saving versions of your code and working together in a team.',
    wordIds: ['repository', 'commit', 'branch', 'merge', 'pull-request', 'review'],
    sentences: [
      {
        kind: 'Team message',
        text: 'Create a new branch, commit your changes, and open a pull request.',
        plain: 'Start a separate line of work, save your changes with a note, then ask the team to check them.',
        terms: {
          branch: 'a separate line of work',
          commit: 'save your changes with a short note',
          'pull-request': 'a request for teammates to check your changes',
        },
      },
      {
        kind: 'Team message',
        text: 'Please review my pull request before we merge it.',
        plain: 'Please check my changes before we add them to the main code.',
        terms: {
          review: 'look carefully and check',
          'pull-request': 'a request for teammates to check your changes',
          merge: 'join the changes into the main code',
        },
      },
      {
        kind: 'Prompt for Claude Code',
        text: 'Look at the last commit in this repository and explain what it changed.',
        plain: 'Look at the newest saved change in the project and tell me what it did.',
        terms: {
          commit: 'one saved set of changes',
          repository: 'the project folder, with all its history',
        },
      },
    ],
    task: 'Ask a teammate to check your changes before they go into the main code.',
  },
  {
    id: 'apis',
    title: 'APIs & data',
    summary: 'How apps ask servers for data, and where they keep it.',
    wordIds: ['api', 'request', 'response', 'endpoint', 'database'],
    sentences: [
      {
        kind: 'Project requirement',
        text: 'The app sends a request to the weather API and shows the response.',
        plain: 'The app asks a weather service for the forecast and shows what comes back.',
        terms: {
          request: 'a message asking for data',
          api: 'rules that let two programs talk to each other',
          response: 'what the server sends back',
        },
      },
      {
        kind: 'Bug report',
        text: 'The orders endpoint returns an empty response.',
        plain: 'When we ask for the list of orders, nothing comes back.',
        terms: {
          endpoint: 'one address of the API that does one job',
          response: 'what the server sends back',
        },
      },
      {
        kind: 'Prompt for Claude Code',
        text: 'Save every message from the contact form in the database.',
        plain: 'Keep every message people send through the form.',
        terms: {
          database: 'where the app keeps its information',
        },
      },
    ],
    task: 'Describe what should happen when someone sends the contact form on your website.',
  },
  {
    id: 'ui-ux',
    title: 'UI/UX design',
    summary: 'How an app looks, and how easy it is to use.',
    wordIds: ['component', 'navigation', 'user-flow', 'feature', 'feedback', 'accessibility'],
    sentences: [
      {
        kind: 'Project requirement',
        text: 'Implement a responsive navigation component.',
        plain: 'Build a menu that works on phones and computers, and that can be used on every page.',
        terms: {
          implement: 'build or add something',
          responsive: 'adapts to different screen sizes',
          navigation: 'the part that helps users move around a website',
          component: 'a reusable part of an interface',
        },
      },
      {
        kind: 'Design feedback',
        text: 'The sign-up user flow is too long: users give up at step four.',
        plain: 'Signing up takes too many steps, so people stop before the end.',
        terms: {
          'user-flow': 'the steps a person takes to finish a task',
        },
      },
      {
        kind: 'Message to a client',
        text: 'Thanks for your feedback. I will add the new feature to the navigation.',
        plain: 'Thanks for your comments. I will add the new part to the menu.',
        terms: {
          feedback: 'comments that help make the work better',
          feature: 'a part of a product that does something useful',
          navigation: 'the menus and links',
        },
      },
    ],
    task: 'Ask a designer to make the menu easier to use on phones.',
  },
  {
    id: 'deployment',
    title: 'Deployment',
    summary: 'Putting a website online, and keeping it there.',
    wordIds: ['deploy', 'build', 'environment', 'domain', 'hosting'],
    sentences: [
      {
        kind: 'Team message',
        text: "The build failed, so we can't deploy today.",
        plain: "Turning the code into the final files didn't work, so we can't put the site online today.",
        terms: {
          build: 'turning the code into the final files',
          deploy: 'put it online for real users',
        },
      },
      {
        kind: 'Message to a client',
        text: 'Your site is live on the new domain, and hosting is free for the first year.',
        plain: 'People can now visit your site at its new address, and keeping it online costs nothing this year.',
        terms: {
          domain: 'the name people type to visit the site',
          hosting: 'the service that keeps the site online',
        },
      },
      {
        kind: 'Prompt for Claude Code',
        text: 'Check that the app works in the test environment before you deploy it.',
        plain: 'Try the app in a safe test place first, then put it online.',
        terms: {
          environment: 'the place where the code runs',
          deploy: 'put it online for real users',
        },
      },
    ],
    task: 'Tell a client that their website will go online next week, and at which address.',
  },
  {
    id: 'ai',
    title: 'AI & Claude Code',
    summary: 'Writing clear prompts and working with an AI coding assistant.',
    wordIds: ['prompt', 'context', 'model', 'instruction', 'review', 'refactor'],
    sentences: [
      {
        kind: 'Tip for better prompts',
        text: 'Give the model enough context: what the app does and who uses it.',
        plain: 'Tell the AI the background: what your app is for and who it is for.',
        terms: {
          model: 'the AI system that writes the answers',
          context: 'background information that helps it understand',
        },
      },
      {
        kind: 'Prompt for Claude Code',
        text: 'Review this component and suggest how to improve its accessibility.',
        plain: 'Check this part of the page and tell me how to make it usable for everyone.',
        terms: {
          review: 'look carefully and check',
          component: 'a reusable part of the interface',
          improve: 'make it better',
          accessibility: 'everyone can use it, including people with disabilities',
        },
      },
      {
        kind: 'Prompt for Claude Code',
        text: 'Follow these instructions: refactor the function, then run the tests.',
        plain: 'Do these steps: make the code cleaner without changing what it does, then test it.',
        terms: {
          instruction: 'a sentence that says exactly what to do',
          refactor: 'make code cleaner without changing what it does',
          function: 'a named piece of code that does one job',
        },
      },
    ],
    task: 'Write a prompt asking Claude Code to add a dark mode to your website. Give it some context.',
  },
  {
    id: 'freelancing',
    title: 'Freelancing',
    summary: 'Talking with clients about work, money and time.',
    wordIds: ['client', 'requirement', 'estimate', 'deadline', 'deliver', 'budget', 'feedback'],
    sentences: [
      {
        kind: 'Message to a client',
        text: 'Could you send me the requirements, so I can give you an estimate?',
        plain: 'Could you tell me exactly what you need, so I can tell you how long it takes and what it costs?',
        terms: {
          requirement: 'something the project must have or do',
          estimate: 'a careful guess of time or cost',
        },
      },
      {
        kind: 'Message to a client',
        text: 'I can deliver the first version before the deadline.',
        plain: 'I can give you the first version before the last day we agreed.',
        terms: {
          deliver: 'give the finished work',
          deadline: 'the last day to finish',
        },
      },
      {
        kind: 'Message to a client',
        text: "The new feature is outside the budget, but I'm happy to send a price for it.",
        plain: "The new part costs more than we planned, but I can tell you how much it would be.",
        terms: {
          feature: 'a part of a product that does something useful',
          budget: 'the money planned for the project',
        },
      },
    ],
    task: 'Write to a new client: ask what they need, and when they need it.',
  },
]

export const topicsById = new Map(developerTopics.map((t) => [t.id, t]))
