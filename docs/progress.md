# LevelShift — Build Progress & Session Tracker

## Current Status

| Field | Value |
|-------|-------|
| **Overall Status** | ✅ COMPLETE — SDET track + Playwright + full Agentic AI track (Phases 9–12) |
| **Live URL** | Netlify (connected to GitHub repo) |
| **Repo** | git@github.com:iamsubhamsarkar/levelshift.git (private) |
| **Last Updated** | 2026-08-24 |
| **Content Totals** | 97 units, 780 cards across 12 phases |
| **Tests** | 90 passing (6 files) · `npm run build` green |

---

## What Is This

LevelShift is a self-hosted, static SPA that began as an Amazon SDET-1 interview-prep tool and now also teaches a complete **Agentic AI** track. Card-based micro-learning with gamification, spaced repetition, and punishment mechanics. Built with Svelte 4 + Vite + Tailwind CSS. No backend — all data in localStorage.

The Agentic AI track pairs an in-app **18-chapter theory book** (Phase 9) with a **guided, 0→100 hands-on build** (Phases 10–12) in which the learner constructs one continuous agent project ("ATLAS") on their own machine, with per-OS (Windows / Ubuntu) commands and a verify-and-mark-done flow.

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
- **97 units across 12 phases, 780 cards total**
- Phase 1: Java Core (8 units) — OOP from variables to integration
- Phase 2: Collections & Generics (5 units)
- Phase 3: Exceptions + Java 8 (5 units)
- Phase 4: DSA Essentials (6 units)
- Phase 5: REST Assured (10 units)
- Phase 6: API Testing Strategy (5 units)
- Phase 7: Selenium WebDriver (9 units)
- Phase 8: Playwright + TypeScript (10 units)
- **Phase 9: Agentic AI — Theory (18 units)** — the full 18-chapter book, interactive
- **Phase 10: Agentic AI — Environment & Your First Agent (6 units)** — ATLAS begins
- **Phase 11: Agentic AI — Knowledge, Structure & Interop (8 units)** — memory, RAG, framework, MCP, multi-agent
- **Phase 12: Agentic AI — Trust & Ship It (7 units)** — eval, tracing, guardrails, HITL, service, reliability, capstone

### Card Types

**SDET track (8-step teaching methodology)**
1. HOOK — curiosity trigger, never a definition
2. FAIL_FIRST — code challenge before teaching (with model answer + Wandbox execution)
3. ANALOGY — real-world mapping
4. CODE — shortest working example with annotation
5. BREAK_IT — predict behavior (multiple choice)
6. CONTRAST — side-by-side comparison (multiple choice)
7. EXPLAIN_BACK — fill-in-the-blanks (60%) or pick-best-answer (40%)
8. CONNECT — where concept appears in future frameworks

**Agentic AI track (2 additive card types)**
9. THEORY — interactive chapter reading (Phase 9). Full chapter content split by section, rendered as a colorful one-pager (TheoryPage.svelte); "Mark as read" completes it. Faithful to (or expanded from) the source `.txt` book — never briefer.
10. BUILD_STEP — a single guided build action (Phases 10–12). Goal + why + Windows/Ubuntu command tabs + optional code + "you'll know it worked when…" verify + troubleshoot + a "Learned in Phase 9, Ch X" reference. "I did this and verified it" completes it.

Both new types are additive: they slot into the existing Markdown → `build-content.js` → JSON → `CardRenderer.svelte` pipeline and the existing completion/gating engine. No engine rewrites; existing card types untouched.

### Components (28 Svelte components)
- Dashboard, CourseMap, LearnView, CardDeck, CardRenderer
- HookCard, FailFirstCard, AnalogyCard, CodeCard, BreakItCard, ContrastCard, ExplainBackCard, ConnectCard
- **TheoryCard, TheoryPage, BuildStepCard** (Agentic AI track)
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
    ├── content/                    # Source markdown (12 phase dirs)
    │   ├── phase1-java-core/
    │   ├── phase2-collections/
    │   ├── phase3-exceptions-java8/
    │   ├── phase4-dsa/
    │   ├── phase5-rest-assured/
    │   ├── phase6-api-strategy/
    │   ├── phase7-selenium/
    │   ├── phase8-playwright/
    │   ├── phase9-agentic-theory/   # Phase 9: 18 theory units (p9u1..p9u18)
    │   ├── phase10-agentic-build/   # Phase 10: 6 build units
    │   ├── phase11-agentic-build/   # Phase 11: 8 build units
    │   └── phase12-agentic-build/   # Phase 12: 7 build units
    ├── public/
    │   ├── favicon.svg
    │   └── sw.js                   # Service worker
    └── src/
        ├── App.svelte              # Root + hash router
        ├── main.js                 # Entry + SW registration
        ├── app.css                 # Tailwind + custom styles
        └── lib/
            ├── components/         # 28 Svelte components
            ├── engines/            # 7 algorithm modules + __tests__/
            ├── stores/             # progress.js, session.js
            ├── utils/              # storage.js, dates.js, code-runner.js, sounds.js
            └── data/
                ├── phases.json     # All 12 phases + 97 unit metadata
                ├── concepts.json   # 200+ concepts (incl. 104 agentic.*) with dependency graph
                └── cards/          # Built JSON (97 unit files across 12 phase dirs)
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
- [x] Dark/light theme toggle — *done (feature/ai-theme-pwa)*
- [x] AI-powered hints (free LLM API) — *done: "Ask Atlas" BYOK Gemini (feature/ai-theme-pwa)*
- [x] PWA install prompt — *done (feature/ai-theme-pwa)*
- [~] Notification reminders — *local/in-app reminder done; true background Push deferred to backend phase*
- [ ] Analytics (anonymous usage tracking) — *deferred to backend phase*
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

### Session 4 — 2026-08-24

Completed the full **Agentic AI track** (Phases 9–12), authored from the 18-chapter source book in `WORK_HISTORY/agentic AI/`. (Phase 8 Playwright, 10 units, was already present from prior work.)

**Content authored (37 new units):**
- **Phase 9 — Theory (17 new units, p9u2–p9u18):** Chapters 2–18 rendered as interactive, section-by-section `theory` cards plus a "Check your understanding" reflection card. Faithful to (or expanded from) the source `.txt`, never briefer. p9u1 (Ch 1) pre-existed.
- **Phase 10 — First Agent (5 new units, p10u2–p10u6):** first LLM call + provider-agnostic client, validated structured output (pydantic), tool wiring by hand, ReAct loop with step limit + repeated-call guard, error recovery. p10u1 (env setup) pre-existed.
- **Phase 11 — Knowledge/Interop (8 units, p11u1–p11u8):** conversation memory + trim/summarize, embeddings + semantic search, real RAG pipeline over the user's docs, agentic RAG (retrieval as a tool), framework refactor (Strands) + hidden-prompt inspection, MCP server/consume, supervisor + specialist sub-agent, multi-hop checkpoint.
- **Phase 12 — Trust & Ship (7 units, p12u1–p12u7):** eval set + pass rate, tracing (traces/spans), guardrails + prompt-injection defense, human-in-the-loop approval gate, FastAPI service, reliability (retry/backoff, timeouts, provider fallback, idempotency), capstone (run on both OSes, requirements.txt, README via the six-question recipe).

All Phase 10–12 build units advance ONE continuous project, **ATLAS** (an Agentic Research & Ops Assistant), with per-OS Windows/Ubuntu command tabs and a verify-and-mark-done flow. Design honors "no live execution in browser": theory is read; build verification is user-confirmed.

**Platform changes (additive only):**
- Two new card types wired end to end: `theory` (→ `TheoryCard.svelte` / `TheoryPage.svelte` one-pager) and `build_step` (→ `BuildStepCard.svelte` with OS tabs). Parsers added to `build-content.js`; both registered in `CardRenderer.svelte`. (These were already scaffolded from a prior pilot; this session authored all the content behind them.)
- `phases.json`: registered every new unit (Phase 9 = 18, 10 = 6, 11 = 8, 12 = 7).
- `concepts.json`: added agentic concepts (**104 total** `agentic.*`) with `category: "agentic"` and a full prereq dependency graph mirroring the learning/build order — feeds the existing spaced-rep, decay, timeline, and Radar engines unchanged. The Radar "Agentic AI" axis and the Settings `osPreference` toggle were already wired.

**Verification (all green):**
- `node build-content.js` → 97 units, 780 cards, exit 0.
- `npm test` → 90/90 passing (6 files).
- `npm run build` → succeeds; all 39 agentic unit chunks bundle (dynamic imports resolve).
- Concept graph checked: no cycles (DFS), all prereqs resolve, every agentic concept's unit exists in `phases.json`.
- Parser pitfall found & fixed: prose after a fenced snippet must live in `snippetExplanation`, not a stray field (a `body2:` mistake was corrected in p9u5/p9u6/p9u7/p9u16).

**Known pre-existing (not from this session):** 12 `apistrategy.*` teaches in Phase 6 reference unregistered concepts — left untouched (out of scope, avoids risking existing Phase 6).

### Session 5 — 2026-08-25 — AI help, theme toggle, PWA + reminders (branch: `feature/ai-theme-pwa`)

Implemented four of the "Potential Future Work" items on a dedicated branch to protect `main`. All additive; no engine or content rewrites.

**1. Light/dark theme toggle**
- Converted the Tailwind palette to CSS variables. `tailwind.config.js` colors now resolve to `rgb(var(--token) / <alpha-value>)`, so every existing `surface-*` / `text-*` / `accent-*` class works in both themes without touching components.
- `app.css`: dark tokens on `:root`, light (GitHub-light) palette under `html.light`. Scrollbar + selection colors are now theme-aware vars.
- `index.html` runs an inline pre-paint script that reads `localStorage['levelshift_theme']` and applies `.light` before mount (no flash).
- New `src/lib/utils/theme.js` (`theme` store, `toggleTheme`, `setTheme`, `initTheme`; own storage key; keeps `theme-color` meta in sync). Toggle button (☀️/🌙) sits next to the gear in the Dashboard header.

**2. AI help — "Ask Atlas" (Bring Your Own Key, Google Gemini)**
- Opt-in only. Off by default. New `src/lib/utils/ai.js`:
  - Key stored in its OWN key `levelshift_ai_key`, deliberately **excluded from the Export/Import backup** so users never leak it.
  - Uses `gemini-2.5-flash-lite` on the free tier (best free RPD/RPM; Pro has ~0 free quota after Dec-2025 cuts).
  - Builds tutor context **locally** from the current card's JSON (`describeCard`, per card type) plus brief sibling-card context — no extra "summarize" AI call.
  - `buildSystemInstruction` grounds Atlas as a tutor and **injects the current date/time** (the model is stateless), and instructs it to guide rather than dump quiz answers.
  - `testApiKey` validates a pasted key with a tiny call; human-readable errors for 400/403/429/5xx.
- `Settings.svelte`: "Ask Atlas" card — enable toggle (`userSettings.aiEnabled`), step-by-step guide to get a free key at aistudio.google.com/app/apikey, key input with show/hide, Save&Test, remove.
- New `AskAtlas.svelte`: floating 🛰️ button + slide-up panel, rendered only when `aiEnabled && hasApiKey`. Wired into `LearnView` for both the card-deck and theory one-pager branches, so it appears on every card. Ctrl/⌘+Enter to send.

**3. PWA install**
- New `public/manifest.webmanifest` (standalone, SVG icon), linked in `index.html`, cached by `sw.js` (bumped to `levelshift-v2`, `.webmanifest` added to the static matcher).
- New `src/lib/utils/pwa.js` captures `beforeinstallprompt` and exposes `canInstall`/`isInstalled` stores + `promptInstall`/`dismissInstall` (remembers "not now"). New `InstallPrompt.svelte` banner, mounted in `App.svelte`; `initPwa()` runs on boot.

**4. Daily reminder (local)**
- New `src/lib/utils/reminders.js` (`reminderSettings` in own key `levelshift_reminder`; permission helpers; `shouldNudgeToday`; `maybeFireLocalReminder`).
- `App.svelte` shows an in-app nudge on the dashboard when the user hasn't studied today, and fires a tab-open local `Notification` if enabled + permitted. `Settings.svelte` has a Daily Reminder card (toggle, time picker, permission-aware messaging).
- **True background push (app closed) is intentionally deferred** to the backend phase — a static site cannot deliver it reliably.

**Verification (all green):**
- `node build-content.js` → 97 units, 780 cards.
- `npm test` → 90/90 passing.
- `npm run build` → success; `manifest.webmanifest` present + linked in `dist`, theme boot script present. Dev server boots (HTTP 200), serves manifest. Only warning is the pre-existing `Card.svelte` unused `index` export (not from this work).
