# LevelShift — Build Progress & Session Tracker

## Current Status

| Field | Value |
|-------|-------|
| **Overall Status** | ✅ COMPLETE — 98/98 tasks done |
| **Live URL** | Netlify (connected to GitHub repo) |
| **Repo** | git@github.com:iamsubhamsarkar/levelshift.git (private) |
| **Last Updated** | 2026-07-26 |

---

## What Is This

LevelShift is a self-hosted, static SPA for Amazon SDET-1 interview preparation. Card-based micro-learning with gamification, spaced repetition, and punishment mechanics. Built with Svelte 4 + Vite + Tailwind CSS. No backend — all data in localStorage.

---

## Tech Stack

| Component | Choice |
|-----------|--------|
| Framework | Svelte 4 + Vite |
| Styling | Tailwind CSS (dark mode) |
| Code Execution | Wandbox API (free, no auth) |
| Hosting | Netlify (free tier, auto-deploy from GitHub) |
| Data | localStorage (no server, no auth) |
| Tests | Vitest (90 tests, 6 test files) |

---

## What's Built (Everything)

### Content
- **48 units across 7 phases, 412 cards total**
- Phase 1: Java Core (8 units) — OOP from variables to integration
- Phase 2: Collections & Generics (5 units)
- Phase 3: Exceptions + Java 8 (5 units)
- Phase 4: DSA Essentials (6 units)
- Phase 5: REST Assured (10 units)
- Phase 6: API Testing Strategy (5 units)
- Phase 7: Selenium WebDriver (9 units)

### Card Types (8-step teaching methodology)
1. HOOK — curiosity trigger, never a definition
2. FAIL_FIRST — code challenge before teaching (with model answer + Wandbox execution)
3. ANALOGY — real-world mapping
4. CODE — shortest working example with annotation
5. BREAK_IT — predict behavior (multiple choice)
6. CONTRAST — side-by-side comparison (multiple choice)
7. EXPLAIN_BACK — fill-in-the-blanks (60%) or pick-best-answer (40%)
8. CONNECT — where concept appears in future frameworks

### Components (25 Svelte components)
- Dashboard, CourseMap, LearnView, CardDeck, CardRenderer
- HookCard, FailFirstCard, AnalogyCard, CodeCard, BreakItCard, ContrastCard, ExplainBackCard, ConnectCard
- Heatmap, Radar, Timeline, DecayLog, GhostReplay
- ReadinessReport, WeeklyReport, QuickChallenge, Settings, Onboarding
- Card (base wrapper)

### Engines (7 modules)
- `spaced-rep.js` — SM-2 algorithm
- `decay.js` — exponential memory decay
- `timeline.js` — dynamic completion calculator
- `scoring.js` — XP, streaks, readiness, interview credits
- `punishment.js` — feature locks, heatmap colors, consequences, ghost replay, streak freeze
- `dependency.js` — invisible review (concept dependency resolver, daily puzzle)
- `gamification.js` — orchestrator (runs on app load, processes missed days)

### Features
- ✅ Ghost replay (compare current vs personal best)
- ✅ Readiness report (exportable HTML)
- ✅ Streak freeze (earn/spend, auto-apply)
- ✅ Red heatmap squares (3+ consecutive misses)
- ✅ Feature locking (interview mode, prove mode)
- ✅ Weekly shift report modal
- ✅ Course Map (free navigation to any phase/unit)
- ✅ Mobile responsive
- ✅ Service worker (offline content caching)
- ✅ Sound effects toggle (Web Audio API)
- ✅ Onboarding walkthrough (4 steps)
- ✅ Card navigation gating (must complete current card before Next unlocks)
- ✅ Card state persistence (answers saved when navigating back/forward)
- ✅ Code execution via Wandbox API (Java 22)
- ✅ Export/Import JSON backup

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Wandbox API (not Piston) | Piston went whitelist-only Feb 2026. Wandbox is free, no auth, Java 22. |
| No unit locking in Course Map | User wanted free navigation to any phase/unit |
| fill_blank + pick_best (not typing) | User is lazy/short-attention-span — tapping > typing |
| 60% fill_blank, 40% pick_best | Weighted toward keyword recall over multiple choice |
| Content audit: quiz only tests taught concepts | Every blank answer must appear word-for-word in a prior CODE/ANALOGY card |
| Card gating within units | Can't skip to card 6 without completing card 5 (but can go backward freely) |
| Non-interactive cards auto-complete | Hook, Analogy, Code, Connect unlock Next immediately on view |
| Netlify hosting (not GitHub Pages) | Simpler, supports SPA redirects natively, free tier |
| `netlify.toml` in repo root | Netlify only reads config from root, not subdirectories |

---

## File Structure

```
LevelShift/
├── netlify.toml                    # Netlify build config (MUST be in root)
├── start.sh                        # Local dev launch script
├── .gitignore
├── docs/
│   ├── requirements.md
│   ├── design.md
│   ├── tasks.md
│   └── progress.md                 # ← THIS FILE
└── app/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── build-content.js            # Markdown → JSON compiler
    ├── content/                    # Source markdown (7 phase dirs)
    │   ├── phase1-java-core/
    │   ├── phase2-collections/
    │   ├── phase3-exceptions-java8/
    │   ├── phase4-dsa/
    │   ├── phase5-rest-assured/
    │   ├── phase6-api-strategy/
    │   └── phase7-selenium/
    ├── public/
    │   ├── favicon.svg
    │   └── sw.js                   # Service worker
    └── src/
        ├── App.svelte              # Root + hash router
        ├── main.js                 # Entry + SW registration
        ├── app.css                 # Tailwind + custom styles
        └── lib/
            ├── components/         # 25 Svelte components
            ├── engines/            # 7 algorithm modules + __tests__/
            ├── stores/             # progress.js, session.js
            ├── utils/              # storage.js, dates.js, code-runner.js, sounds.js
            └── data/
                ├── phases.json     # All 7 phases + 48 unit metadata
                ├── concepts.json   # 100+ concepts with dependency graph
                └── cards/          # Built JSON (48 unit files)
```

---

## How To Work On This

```bash
# Start dev server
cd LevelShift && ./start.sh
# Or manually:
cd app && npm install --registry https://registry.npmjs.org && npm run dev

# Rebuild content after editing markdown
cd app && node build-content.js

# Run tests
cd app && npm test

# Production build
cd app && npm run build
# Output: app/dist/
```

---

## Known Issues / Gotchas

1. **npm registry**: Corporate .npmrc may interfere. Use `--registry https://registry.npmjs.org` if npm install fails.
2. **Wandbox API**: Free but no SLA. If it goes down, app falls back to offline mode (show answer + self-rate).
3. **`netlify.toml` location**: MUST be in repo root, not inside `app/`. Netlify ignores it otherwise.
4. **Vite base path**: Must be `/` for Netlify. Do NOT add `base: '/levelshift/'` — that's only for GitHub Pages subpath hosting.
5. **Content edits**: Edit markdown in `app/content/`, then run `node build-content.js` to regenerate JSON. Don't edit JSON directly.
6. **Card state**: Session store (`session.js`) tracks `cardStates` and `highestUnlocked` for navigation gating. Non-interactive cards auto-complete via `CardRenderer.svelte` onMount.

---

## Potential Future Work

- [ ] More content (practice problems, mock interviews)
- [ ] Dark/light theme toggle
- [ ] AI-powered hints (free LLM API)
- [ ] Notification reminders (Push API)
- [ ] PWA install prompt
- [ ] Analytics (anonymous usage tracking)
- [ ] Community features (if ever multi-user)

---

## Session History

### Session 1 — 2026-07-23

Built entire platform from scratch in one day:
- Designed requirements, architecture, task breakdown
- Built all scaffolding, data layer, engines, card components, dashboard
- Authored Phase 1 content (8 units)
- Code execution client (Piston API)

### Session 2 — 2026-07-23 (continued)

- Fixed Dashboard Svelte compilation error (`class:` directive with `/`)
- Completed all remaining 23 tasks:
  - Gamification (ghost replay, readiness report, streak freeze, punishment triggers, weekly report)
  - Content authoring (Phases 2-7, 40 units, 332 cards)
  - Unit tests (90 tests, all passing)
  - Polish (mobile responsive, service worker, meta tags, onboarding, sound effects)
- Fixed bug: `getHeatmapColor` future-date logic was inverted
- Switched code execution from dead Piston API to Wandbox API
- Fixed "Show Model Answer" button (added solutionCode to content + always-visible button)

### Session 3 — 2026-07-25/26

- **EXPLAIN_BACK redesign**: Replaced typing-based Q&A with fill-in-the-blanks (60%) and pick-best-answer (40%)
- **Content quality audit**: Found 83 issues where quiz cards tested untaught concepts. Fixed ALL:
  - Enriched CODE annotations and ANALOGY text to explicitly state concepts before quiz
  - Converted all 48 legacy EXPLAIN_BACK cards to interactive format
  - Rewrote CONTRAST/BREAK_IT explanations to use only previously taught terms
- **Navigation fixes**:
  - Card gating: must complete current card before Next unlocks
  - Card state persistence: answers saved when navigating back/forward
  - Non-interactive cards auto-complete on view
- **Course Map**: New full-course navigation screen (all phases/units freely accessible)
- **Netlify deployment fixed**: Moved `netlify.toml` to repo root, removed GitHub Pages config
- **GitHub repo**: Connected, pushed, deployed live
- Model answers shortened (was 400-600 chars → now 100-150 chars)
