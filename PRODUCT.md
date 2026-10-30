# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite, plain CSS with CSS Modules and design tokens, React Router, Zustand, localStorage. Vitest for logic tests, Playwright for browser checks. Hosted on Vercel from GitHub. Chosen with the owner in planning Stage 4 (recommended by Claude, approved by the owner).

## Users

- **Primary:** the owner, a beginner developer and English learner who wants to write natural English for everyday life, client communication and software work (web development, AI, Claude Code).
- **Also:** family members using local profiles on the same device: kids, teenagers and adults. Age group and language level (CEFR A1–C1, plus Professional) are chosen separately.

## Product Purpose

A private English notebook that solves one problem: "I know what I want to say, but I can't find the English words." Learners discover useful vocabulary, mark what they know, practise it with spaced repetition, build sentences and write real messages with help that gives hints before answers. Success means a learner can find, remember and confidently use new words in their own writing.

## Positioning

Vocabulary is tracked as a personal knowledge state (unfamiliar, learning, known, mastered) that follows the word everywhere: in the dictionary, in example sentences and inside the learner's own writing. Mastery is earned through recall, never by clicking a button. Learners can keep writing when stuck (the `??word??` marker) and get a suggestion afterwards.

## Operating Context

- Daily study sessions of 5–30 minutes on laptop and phone, often repeated (review queue, daily goal, streak).
- Writing practice for real situations: WhatsApp messages, emails, client replies, project requirements, prompts for Claude Code.
- Fully private: no accounts, no public profiles, no social feed, no ads, no tracking. Data stays in each browser; phone and laptop are moved with backup files.

## Capabilities and Constraints

- MVP: Today dashboard, Vocabulary Explorer with "find the word I mean" search, word pages with 4 knowledge buttons and "My sentence", My Words (4 collections), spaced-repetition Review, Sentence Builder, Writing Studio with a rule-based checker, Developer English, Progress, Settings (theme, text size, backup).
- English only, no translations.
- No paid APIs. Writing feedback is rule-based; optional AI may be added later only with explicit per-use consent.
- Mastered = correct recall without hints in 3 separate review sessions, first and last at least 7 days apart.
- Not in the MVP: Communication Academy, weekly/monthly challenges, offline mode, cross-device sync (to be raised again at MVP release).

## Brand Commitments

- Name: WordCraft Academy.
- Owner's design brief: `DESIGN-BRIEF.md`. Product brief and workflow: `CLAUDE.md`.
- Approved direction "The Annotated Notebook": four highlighter colors reserved for word states; must not be childish for adults.
- Avoid generic AI dashboard looks, heavy gradients and glassmorphism.

## Evidence on Hand

No vocabulary content exists yet. All words, examples and exercises will be written for the project and reviewed by the owner. Never invent users, testimonials or statistics.

## Product Principles

1. Understand before memorizing; learn words inside real sentences.
2. Hints before answers; never replace the learner's writing.
3. Mistakes get explanations, never punishment.
4. Private by default; nothing leaves the device without consent.
5. Small, useful and finished beats large and unfinished.

## Accessibility & Inclusion

WCAG 2.2 AA. Color is never the only signal for word state. Full keyboard use, visible focus, reduced-motion support, screen-reader announcements for state changes. Readable for children and second-language readers.
