# GapForge — Frontend

An adaptive career-learning platform frontend. React + Vite + Tailwind CSS + React Router + Recharts.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. Click **View Demo** on the home page to instantly load a
scripted student ("Alex") with real skill gaps, so you can jump straight to
`/dashboard` or `/adaptive-roadmap` without going through the full flow.

## Project structure

```
src/
  components/   Shared UI (Button, Card, SkillCard, RoadmapCard, Modal, etc.)
  pages/        One file per route (Home, Profile, Careers, Assessment, ...)
  data/         Sample content: careers, questions, lessons, tasks, demo student
  services/     Mock-backed service layer — mirrors the future REST API 1:1
  utils/        skillCalculations.js — the formulas that drive the adaptive loop
  hooks/        useAppState.js — single localStorage-backed state store
```

## The adaptive loop

Every page reads and writes through `utils/skillCalculations.js`, so a skill
score updated by a quiz or a real-world task automatically:

1. Changes its gap (`requiredScore - currentScore`)
2. Changes its roadmap priority (HIGH / MEDIUM / LOW / COMPLETED)
3. Changes overall career readiness (weighted average, capped per skill)
4. Reorders the roadmap — visible immediately on `/adaptive-roadmap`

See the comments in `skillCalculations.js` for the exact formulas and the
tunable constants (quiz sensitivity, task sensitivity, priority thresholds).

## Connecting a real backend

Each file in `services/` already mirrors an endpoint from the original spec
(e.g. `roadmapService.js` -> `POST /api/roadmap/generate`). Swap the mock
implementation inside each function for a real fetch/apiPost call — no page
component needs to change, since pages only ever call the service functions,
never the data files directly.

## State

All cross-page state (profile, selected career, skills, quiz/task results)
lives in one versioned localStorage key, managed by `hooks/useAppState.js`.
Clearing it (or calling `reset()` from the hook) returns the app to a blank
first-visit state.
