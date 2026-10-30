# WordCraft Academy: Approved Plan

Approved by the owner on 2026-10-30 after planning Stages 1–5. Product truth lives in `PRODUCT.md`; the owner's briefs are `CLAUDE.md` and `DESIGN-BRIEF.md`.

## Decisions

| Area | Decision |
|---|---|
| Users | Several local profiles on one device (kids / teens / adults); level is separate from age group |
| Privacy | No accounts, no tracking, no ads. Data stays in the browser; export/import backup moves it |
| Feedback | Rule-based first, hint before answer. Optional AI later, only with consent |
| Language | English only |
| Hosting | GitHub + Vercel (free) |
| Reminder | At MVP release, plan syncing between phone and laptop |

## Learning rules

- **Knowledge buttons:** I know → Known · I have seen → Learning · I don't know → Unfamiliar (automatic) · I want to practise → Learning + today's review.
- **Mastered** is earned only through Review: correct recall without hints on 3 different days, first and last at least 7 days apart. A wrong answer returns the word to Learning.
- **Spaced repetition (Leitner):** boxes 0–5 wait 0, 1, 3, 7, 14, 30 days. Correct → up one box; wrong → box 1; "Guessed" → same box.
- **Streak:** one missed day per week does not break it. Days use the learner's local date.
- **Pronunciation:** simple respelling + IPA; 🔊 uses the browser's built-in speech.

## Design: "The Annotated Notebook"

- Highlighter colors reserved for word states: yellow = unfamiliar, blue = learning, green = known, violet = mastered. Always paired with a text label.
- Navy sidebar, cool light page, light and dark mode. Kids mode changes text size, corner radius and highlight weight.
- Fonts (self-hosted): Atkinson Hyperlegible Next (interface), Literata (words and example sentences), JetBrains Mono (code terms).
- Standard, familiar controls. No paper textures or fake notebook decoration.
- Navigation: sidebar (desktop) → icon rail (tablet) → bottom tabs Today · Words · Practice · Write · More (phone).
- Interactive preview: https://claude.ai/artifact/2aX6wHUY5f5LQE9tYcR3Pg

## Technology

React + TypeScript + Vite · plain CSS + CSS Modules + tokens · React Router · Zustand · localStorage with `schemaVersion` · Vitest + Playwright · Vercel.

```
src/
  styles/      tokens.css, global.css
  components/  shared pieces (Highlight, KnowledgeButtons, Toast, AppShell)
  features/    one folder per section (today, explore, words, review, sentences, writing, developer, progress, settings, onboarding)
  logic/       pure rules (spacedRepetition, mastery, writingChecker, wordSearch, streak)
  data/        vocabulary and exercise content as typed .ts files
  store/       learnerStore, backup (export / import / migrations)
  types.ts
```

Folders are created in the step that first puts a file in them (Git does not save empty folders).

## Roadmap

| Phase | Steps |
|---|---|
| 0 · Setup | 1. Project + Git ✅ · 2. Design tokens + app shell ✅ · 3. Deploy to Vercel |
| 1 · Core loop | 4. First 50 words · 5. Profiles + saved data · 6. Explore + word page · 7. Knowledge buttons + My Words · 8. Review · 9. Today dashboard |
| Checkpoint | Owner uses the app for a few days; fix what feels wrong |
| 2 · Finish MVP | 10. Sentence Builder · 11. Writing Studio · 12. Developer English · 13. Backup export/import · 14. Grow to 150–200 words · 15. Quality check → MVP release |
| 3–4 · Later | Communication Academy, challenges, offline mode, optional AI, cross-device sync |

MVP extras approved: `??stuck??` marker (Writing Studio), "My sentence" per word, daily goal, word of the day, dark mode.

## Known risks

1. Safari on iPhone may delete site data after ~7 days unused → request persistent storage, backup reminders, home-screen install later.
2. Rule-based feedback is limited → say so in the UI; grow the rule list.
3. Content workload → Claude drafts, owner reviews, TypeScript checks structure.
4. Data shape changes → `schemaVersion` + migrations in `store/backup.ts`.
5. Word tiles must work with tap and keyboard, not drag only.
6. Vercel deep links need a rewrite rule.

## Working agreement

For every step: say what will be built and which files change → wait for approval on big changes → test logic and check in a real browser → explain important code simply → report honestly what was and wasn't tested.
