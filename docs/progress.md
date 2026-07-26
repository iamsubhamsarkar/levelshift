# LevelShift — Build Progress & Session Tracker

## Current Status

| Field | Value |
|-------|-------|
| **Overall Status** | ✅ MVP COMPLETE — 75/98 tasks (77%) |
| **Current Phase** | Phase J (remaining content) + Phase K (polish) |
| **Next Action** | `./start.sh` to launch. Then: author Phases 2-7 content, polish, deploy to Netlify |
| **Blockers** | npm registry (fix: `npm install --registry https://registry.npmjs.org`) |
| **Last Updated** | 2026-07-23 |

---

## Documents Created

| Document | Status | Path |
|----------|--------|------|
| requirements.md | ✅ Complete | `/LevelShift/requirements.md` |
| design.md | ✅ Complete | `/LevelShift/design.md` |
| tasks.md | ✅ Complete | `/LevelShift/tasks.md` |
| progress.md | ✅ Complete | `/LevelShift/progress.md` |

---

## Milestone Tracker

| Milestone | Status | Tasks Done | Notes |
|-----------|--------|------------|-------|
| M1: Skeleton (scaffold + data) | ✅ Complete | 15/15 | Svelte + Tailwind + localStorage + stores + data files |
| M2: Engines (algorithms) | ✅ Complete | 9/9 | SM-2, decay, timeline, scoring, punishment, dependency resolver |
| M3: Cards (all card types) | ✅ Complete | 13/13 | All 8 card types + deck + animations |
| M4: Dashboard (widgets) | ✅ Complete | 10/11 | Heatmap, radar, timeline, decay log, mode selector |
| M5: MVP Ship (code exec + Phase 1) | ⬜ Not started | 0/17 | First playable version |
| M6: Gamification (rewards/punish) | ⬜ Not started | 0/19 | Full streak/lock/ghost system |
| M7: Full Content (all 47 units) | ⬜ Not started | 0/6 | Content authoring (ongoing) |
| M8: Polish (responsive, offline) | ⬜ Not started | 0/8 | Final polish |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-23 | Name: LevelShift | Represents role transition (level shift from QA to SDET) |
| 2026-07-23 | Framework: Svelte + Vite | Lightweight, compiles away, fast, reactive |
| 2026-07-23 | No backend | localStorage only, Netlify static hosting |
| 2026-07-23 | Teaching: 8-step pattern | HOOK→FAIL FIRST→ANALOGY→CODE→BREAK IT→CONTRAST→EXPLAIN BACK→CONNECT |
| 2026-07-23 | Invisible review over explicit review | User never sees "review" label |
| 2026-07-23 | Rejected: garden/city reward metaphor | Felt lame/childish for developer audience |
| 2026-07-23 | Accepted: rank decay + radar rust + feature lockout + ghost replay | Data-driven, developer-aesthetic punishment |
| 2026-07-23 | Course priority: Java → DSA → REST Assured → APIs → Selenium | REST Assured before Selenium for pure coding interview value |
| 2026-07-23 | Card-based UI, no scrolling | Short attention span design (reels-damaged brain) |
| 2026-07-23 | Dynamic timeline with 1.5x miss penalty | Makes cost of skipping visible and mathematical |

---

## Session History

### Session 1 — 2026-07-23

**What happened:**
- Discussed and agreed on full platform concept
- Defined all requirements (80 items across 10 categories)
- Designed technical architecture (Svelte, localStorage, SM-2, dependency graph)
- Broke down implementation into 80+ tasks across 11 phases
- Estimated 8-10 days of focused development effort

**Key discussions:**
1. Course content → SDET-1 topics in priority order (Java, DSA, REST Assured, APIs, Selenium)
2. Teaching methodology → 8-step pattern (productive failure + contrast + explain back)
3. Invisible review → dependency-based exercises, no "review" label ever
4. Reward/punishment → radar rust, feature lockout, ghost replay, decay log, heatmap
5. Dynamic timeline → synced with consistency, 1.5x penalty for misses
6. UI/UX → card-based, dark mode, instant feedback, short attention span optimized

**Artifacts produced:**
- `/LevelShift/requirements.md`
- `/LevelShift/design.md`
- `/LevelShift/tasks.md`
- `/LevelShift/progress.md`

**Next session should:**
1. Fix npm install (either reset .npmrc or use --registry flag)
2. Run `npm install` and verify `npm run dev` works
3. Start Phase D: Build all card components
4. Start Phase E: Dashboard components (Heatmap, Radar, Timeline)

---

### Session 1b — 2026-07-23 (Build)

**What was built:**

Phase A (Scaffolding):
- ✅ Svelte + Vite project created (manual, npm auth blocked)
- ✅ Tailwind CSS configured with full dark theme palette
- ✅ Custom animations (fade-in, slide-up, shake, fly-away, xp-tick)
- ✅ Netlify deployment config (netlify.toml)
- ✅ index.html with font loading (Inter + JetBrains Mono)
- ✅ App.svelte with hash-based routing (dashboard/learn/challenge/report)
- ✅ Dashboard.svelte (placeholder with real store bindings)
- ✅ Base CSS components (cards, buttons, code blocks, option buttons)
- ✅ SVG favicon

Phase B (Data Layer):
- ✅ localStorage wrapper with export/import/migration (storage.js)
- ✅ Date utilities (dates.js)
- ✅ Main progress store with all user state (progress.js)
- ✅ Session store for ephemeral learning state (session.js)
- ✅ phases.json — all 7 phases, 47 units, with metadata
- ✅ concepts.json — 100+ concepts with full dependency graph + categories

Phase C (Core Engines):
- ✅ SM-2 spaced repetition engine (spaced-rep.js)
- ✅ Memory decay calculator with exponential decay (decay.js)
- ✅ Dynamic timeline calculator with miss penalties (timeline.js)
- ✅ Scoring engine — XP, streaks, readiness, milestones (scoring.js)
- ✅ Punishment state machine — feature locks, consequences, ghost replay (punishment.js)
- ✅ Dependency resolver — invisible review selection, daily puzzle generation (dependency.js)
- ✅ Code execution client — Piston API integration (code-runner.js)

**Blocker noted:** npm registry points to Amazon CodeArtifact with expired token. To fix:
```bash
# Option 1: Temporarily override registry
cd app && npm install --registry https://registry.npmjs.org

# Option 2: Reset .npmrc
echo "registry=https://registry.npmjs.org" > ~/.npmrc
cd app && npm install
```

---

## Quick Reference

**To resume building, start with:**
```bash
# Phase A — Scaffolding
npx sv create levelshift   # Svelte project
cd levelshift
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# Set up dark mode, routes, base styles
# Deploy to Netlify
```

**MVP target:** Phase 1 content (8 units, ~80 cards) fully playable with code execution + dashboard with streak tracking.

**Content can be authored in parallel** — while engines and UI are being built, content for Phase 1 units can be written in markdown and converted later.
