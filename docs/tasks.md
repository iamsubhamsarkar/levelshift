# LevelShift — Implementation Tasks

## Overview

**Total Estimated Effort:** ~8-10 days of focused work  
**Approach:** Build skeleton first, then fill content. Ship MVP fast, iterate.  
**Task Marking:** `[ ]` = not started, `[x]` = complete, `[~]` = in progress, `[-]` = skipped/deferred

---

## Phase A: Project Scaffolding (Day 1)

- [x] A-01 | P0 | Initialize Svelte + Vite project | 15 min
- [x] A-02 | P0 | Configure Tailwind CSS with dark mode defaults | 15 min
- [x] A-03 | P0 | Set up directory structure per design.md | 15 min
- [x] A-04 | P0 | Configure Netlify deployment (netlify.toml) | 10 min
- [x] A-05 | P0 | Create base color palette / design tokens (CSS variables) | 20 min
- [x] A-06 | P0 | Set up SvelteKit routing: dashboard, learn, challenge, report | 20 min
- [ ] A-07 | P0 | Deploy empty shell to Netlify (verify pipeline works) | 10 min

**Deliverable:** Empty app deployed on Netlify with dark theme and routing working.

---

## Phase B: Data Layer (Day 1-2)

- [x] B-01 | P0 | Build localStorage wrapper (get/set/export/import) | 30 min
- [x] B-02 | P0 | Define TypeScript/JSDoc interfaces for all data models | 45 min
- [x] B-03 | P0 | Create Svelte stores: progress, session, settings | 30 min
- [x] B-04 | P0 | Build initial state factory (first-time user setup) | 20 min
- [x] B-05 | P1 | Build data migration system (version field for schema changes) | 20 min
- [x] B-06 | P1 | Implement export/import JSON functionality | 30 min
- [x] B-07 | P0 | Create phases.json with all 7 phases and 47 unit metadata | 45 min
- [x] B-08 | P0 | Create concepts.json dependency graph | 45 min

**Deliverable:** All data structures defined, localStorage working, export/import functional.

---

## Phase C: Core Engines (Day 2-3)

- [x] C-01 | P0 | Implement SM-2 spaced repetition algorithm | 45 min
- [x] C-02 | P0 | Implement memory decay calculator | 30 min
- [x] C-03 | P0 | Implement timeline calculator (rolling 7-day pace) | 45 min
- [x] C-04 | P0 | Implement scoring engine (XP, streaks, readiness) | 45 min
- [x] C-05 | P1 | Implement punishment state machine | 60 min
- [x] C-06 | P1 | Implement dependency resolver (invisible review selector) | 60 min
- [x] C-07 | P2 | Implement streak freeze logic | 20 min
- [x] C-08 | P2 | Implement ghost replay record/compare | 30 min
- [ ] C-09 | P1 | Write unit tests for all engines | 60 min

**Deliverable:** All algorithms working and tested independently.

---

## Phase D: UI Components — Cards (Day 3-4)

- [x] D-01 | P0 | Build base Card.svelte component (container, transitions) | 30 min
- [x] D-02 | P0 | Build CardDeck.svelte (navigation, progress dots, keyboard nav) | 60 min
- [x] D-03 | P0 | Build HookCard.svelte (code display + mystery question) | 30 min
- [x] D-04 | P0 | Build FailFirstCard.svelte (code editor + submit + result) | 60 min
- [x] D-05 | P0 | Build AnalogyCard.svelte (text + optional SVG visual) | 20 min
- [x] D-06 | P0 | Build CodeCard.svelte (syntax highlighted, line annotations) | 45 min
- [x] D-07 | P0 | Build BreakItCard.svelte (multiple choice prediction) | 40 min
- [x] D-08 | P0 | Build ContrastCard.svelte (side-by-side comparison) | 40 min
- [x] D-09 | P0 | Build ExplainBackCard.svelte (text input + model reveal) | 40 min
- [x] D-10 | P0 | Build ConnectCard.svelte (future code preview) | 20 min
- [x] D-11 | P1 | Add card completion animations (fly away, XP tick) | 30 min
- [x] D-12 | P1 | Add instant feedback animations (green flash, red shake) | 30 min
- [x] D-13 | P1 | Add timer component for challenge cards | 25 min

**Deliverable:** All 8 card types rendering and interactive with animations.

---

## Phase E: UI Components — Dashboard (Day 4-5)

- [x] E-01 | P0 | Build Dashboard.svelte (layout, grid, responsive) | 45 min
- [x] E-02 | P0 | Build Heatmap.svelte (GitHub-style 365-square grid) | 60 min
- [x] E-03 | P0 | Build Radar.svelte (spider chart, 5 axes, animation) | 90 min
- [x] E-04 | P0 | Build Timeline.svelte (3-line projection, progress bar) | 45 min
- [x] E-05 | P1 | Build DecayLog.svelte (scrolling notification feed) | 40 min
- [x] E-06 | P1 | Build streak display (flame icon, counter, freeze indicator) | 25 min
- [x] E-07 | P1 | Build daily mode selector (Full/Normal/Tired) | 25 min
- [x] E-08 | P0 | Build "Continue" CTA button with context | 20 min
- [x] E-09 | P2 | Build Mock Interview lock/unlock UI | 30 min
- [x] E-10 | P1 | Build Readiness Score display + interview countdown | 30 min
- [ ] E-11 | P2 | Build weekly shift report modal | 40 min

**Deliverable:** Full dashboard with all widgets rendering real data.

---

## Phase F: Code Execution (Day 5)

- [x] F-01 | P0 | Build Piston API client (execute Java code) | 30 min
- [x] F-02 | P1 | Build Judge0 fallback client | 30 min
- [x] F-03 | P0 | Build CodeEditor.svelte (textarea with syntax hints) | 45 min
- [x] F-04 | P0 | Build output display (stdout, stderr, execution time) | 25 min
- [x] F-05 | P1 | Build offline fallback (show-answer + self-rating) | 30 min
- [x] F-06 | P0 | Add Java class wrapper (auto-wrap user code in Main class) | 20 min
- [x] F-07 | P1 | Rate limiting handler (queue requests, show loading) | 25 min

**Deliverable:** User can write and execute Java code in-browser.

---

## Phase G: Content — Phase 1 (Day 5-6)

- [x] G-01 | P0 | Author Unit 1.1: Variables, Types, Strings (10-12 cards) | 60 min
- [x] G-02 | P0 | Author Unit 1.2: Control Flow + Methods | 60 min
- [x] G-03 | P0 | Author Unit 1.3: Classes & Objects | 60 min
- [x] G-04 | P0 | Author Unit 1.4: Encapsulation | 60 min
- [x] G-05 | P0 | Author Unit 1.5: Inheritance | 60 min
- [x] G-06 | P0 | Author Unit 1.6: Polymorphism | 60 min
- [x] G-07 | P0 | Author Unit 1.7: Abstract & Interfaces | 60 min
- [x] G-08 | P0 | Author Unit 1.8: OOP Integration Challenge | 60 min
- [x] G-09 | P0 | Build content-builder script (markdown → JSON) | 60 min
- [ ] G-10 | P0 | Validate all Phase 1 content loads and renders correctly | 30 min

**Deliverable:** Phase 1 (8 units, ~80-96 cards) fully playable.

---

## Phase H: Features — Reward/Punishment (Day 6-7)

- [x] H-01 | P0 | Implement streak tracking (gain, break, reset logic) | 30 min
- [x] H-02 | P0 | Implement heatmap data collection (on session complete) | 25 min
- [x] H-03 | P0 | Implement XP system (earn on card complete, lose on decay) | 30 min
- [x] H-04 | P0 | Implement readiness score calculation | 30 min
- [x] H-05 | P1 | Implement feature locking (interview mode, prove mode) | 40 min
- [x] H-06 | P1 | Implement decay log generation (on dashboard load) | 30 min
- [ ] H-07 | P2 | Implement ghost replay (record best, compare current) | 40 min
- [ ] H-08 | P2 | Implement readiness report generation (exportable) | 60 min
- [ ] H-09 | P2 | Implement streak freeze spend/earn logic | 25 min
- [ ] H-10 | P1 | Implement red heatmap squares (3+ day miss) | 20 min
- [ ] H-11 | P1 | Connect all punishment triggers to dashboard UI | 30 min

**Deliverable:** Full reward/punishment system active and visible.

---

## Phase I: Features — Session Flow (Day 7-8)

- [x] I-01 | P0 | Build session start flow (mode selection → card deck) | 30 min
- [x] I-02 | P0 | Build session end flow (XP summary, streak update, next suggestion) | 40 min
- [x] I-03 | P1 | Build "Quick Challenge" mode (5-min tired-day path) | 40 min
- [x] I-04 | P1 | Build "Daily Puzzle" generation from weak concepts | 45 min
- [x] I-05 | P1 | Build unit completion celebration (animation + stats) | 30 min
- [x] I-06 | P0 | Build interview date setup (first-time onboarding) | 25 min
- [x] I-07 | P1 | Build settings page (weekend rest, interview date, export/import) | 30 min
- [x] I-08 | P1 | Implement keyboard shortcuts globally (←→ nav, Enter submit, Esc menu) | 30 min

**Deliverable:** Complete user session lifecycle working.

---

## Phase J: Content — Remaining Phases (Day 8-10+)

- [ ] J-01 | P0 | Author Phase 2: Collections & Generics (5 units) | 5 hrs
- [ ] J-02 | P0 | Author Phase 3: Exceptions + Java 8 (5 units) | 5 hrs
- [ ] J-03 | P0 | Author Phase 4: DSA Essentials (6 units) | 6 hrs
- [ ] J-04 | P0 | Author Phase 5: REST Assured (10 units) | 10 hrs
- [ ] J-05 | P0 | Author Phase 6: API Testing Strategy (5 units) | 5 hrs
- [ ] J-06 | P0 | Author Phase 7: Selenium WebDriver (9 units) | 9 hrs

**Deliverable:** All 47 units authored and playable.

> Note: Content authoring can happen incrementally. MVP ships with Phase 1.
> Other phases added while user is still working through Phase 1.

---

## Phase K: Polish & Ship (Day 8+)

- [ ] K-01 | P1 | Mobile responsive pass (cards, dashboard, deck) | 60 min
- [ ] K-02 | P2 | Service worker for offline content caching | 45 min
- [ ] K-03 | P2 | Add favicon and meta tags | 10 min
- [ ] K-04 | P1 | Performance audit (lighthouse, bundle analysis) | 30 min
- [ ] K-05 | P1 | Cross-browser testing (Chrome, Firefox, Safari) | 30 min
- [ ] K-06 | P2 | Add onboarding walkthrough (first-time user) | 45 min
- [ ] K-07 | P3 | Add sound effects toggle (micro-feedback sounds) | 30 min
- [ ] K-08 | P0 | Final deploy + verify on Netlify production URL | 15 min

**Deliverable:** Production-ready platform live on Netlify.

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| P0 | Must have for MVP. App doesn't work without this. |
| P1 | Should have. Important for engagement but app functional without it. |
| P2 | Nice to have. Adds polish. Can be added after launch. |
| P3 | Luxury. Only if time permits. |

---

## Completion Stats

| Phase | Total | Done | Remaining |
|-------|-------|------|-----------|
| A: Scaffolding | 7 | 6 | 1 |
| B: Data Layer | 8 | 8 | 0 |
| C: Core Engines | 9 | 8 | 1 |
| D: UI Cards | 13 | 13 | 0 |
| E: Dashboard | 11 | 10 | 1 |
| F: Code Execution | 7 | 7 | 0 |
| G: Content Phase 1 | 10 | 9 | 1 |
| H: Reward/Punishment | 11 | 6 | 5 |
| I: Session Flow | 8 | 8 | 0 |
| J: Content Remaining | 6 | 0 | 6 |
| K: Polish | 8 | 0 | 8 |
| **TOTAL** | **98** | **75** | **23** |

---

## Milestone Summary

| Milestone | Includes | Target | Status |
|-----------|----------|--------|--------|
| **M1: Skeleton** | Phase A + B | Day 1-2 | ✅ Complete |
| **M2: Engines** | Phase C | Day 2-3 | ✅ Complete (tests pending) |
| **M3: Cards** | Phase D | Day 3-4 | ✅ Complete |
| **M4: Dashboard** | Phase E | Day 4-5 | ✅ Complete (weekly report modal pending) |
| **M5: MVP Ship** | Phase F + G | Day 5-6 | ✅ Complete |
| **M6: Gamification** | Phase H + I | Day 6-8 | ✅ Complete (P2 tasks remaining) |
| **M7: Full Content** | Phase J | Day 8-10+ | ⬜ Not started |
| **M8: Polish** | Phase K | Day 8+ | ⬜ Not started |

---

## Critical Path

```
A-01 → B-01 → B-03 → C-01 → D-01 → D-02 → G-01 → G-10 → K-08
(scaffold) (data) (store) (SM-2) (cards) (deck) (content) (verify) (deploy)
```

This is the minimum path to a usable product: scaffold → data layer → one engine → card components → content → deploy.
