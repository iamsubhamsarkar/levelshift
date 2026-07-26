# LevelShift — Requirements Document

## 1. Overview

**Project Name:** LevelShift  
**Purpose:** A self-hosted, static learning platform for SDET-1 role transition preparation  
**Target User:** Single user — lazy working professional with short attention span (reels-damaged brain)  
**Hosting:** Netlify (free tier, static site)  
**Data Safety:** Zero company/internal data. All content is generic SDET skills.  
**AI Policy:** Little to no AI. If included, must be free LLM API with high token limits (e.g., Gemini 2.0 Flash).

---

## 2. Core Requirements

### 2.1 Learning Content

| ID | Requirement |
|----|-------------|
| R-01 | Platform teaches 5 topic areas in priority order: Java Core → DSA Basics → REST Assured → REST API Concepts → Selenium WebDriver |
| R-02 | Content structured as 7 Phases, ~47 units total |
| R-03 | Each unit = 15-30 minutes max, achievable after a workday |
| R-04 | Each unit composed of 10-12 cards (micro-lessons) |
| R-05 | One card = one screen = one idea. No scrolling for core content. |
| R-06 | Content is Amazon SDET-1 level — covers OOP, Collections, Streams, Design Patterns, Selenium POM, REST Assured framework building, DSA basics (array/string/hashmap problems) |

### 2.2 Teaching Methodology

| ID | Requirement |
|----|-------------|
| R-07 | Every concept follows the pattern: HOOK → FAIL FIRST → ANALOGY → CODE → BREAK IT → CONTRAST → EXPLAIN BACK → CONNECT |
| R-08 | HOOK: Start with curiosity trigger (puzzle/mystery code), never a definition |
| R-09 | FAIL FIRST: User attempts before being taught (productive failure) |
| R-10 | ANALOGY: Real-world one-liner mapping concept to daily life |
| R-11 | CODE: Shortest working example (5-8 lines), key line highlighted/annotated |
| R-12 | BREAK IT: "What happens if I change X?" — predict-then-reveal |
| R-13 | CONTRAST: Side-by-side comparison of similar-but-different concepts |
| R-14 | EXPLAIN BACK: User types explanation in own words, then sees model answer |
| R-15 | CONNECT: Shows where concept appears in user's future project/framework |

### 2.3 Invisible Review System

| ID | Requirement |
|----|-------------|
| R-16 | No explicit "review" label ever shown to user |
| R-17 | New exercises require old concepts to solve (dependency-based) |
| R-18 | Exercises escalate in dependency depth (Module 5 exercises pull from Modules 1-4) |
| R-19 | Scenario chains: multi-day arcs building on same codebase |
| R-20 | Bug-fix challenges that span multiple modules |
| R-21 | Starter code that requires understanding of past concepts to complete |
| R-22 | Platform silently tracks memory strength per concept (SM-2 algorithm) |
| R-23 | When a concept decays, system quietly prioritizes exercises that reinforce it |
| R-24 | "Daily Puzzle" disguised as fresh challenge for concepts that can't be naturally embedded |

### 2.4 Reward & Punishment System (Consistency-Based)

| ID | Requirement |
|----|-------------|
| R-25 | Skill Radar (spider chart) showing proficiency in 5 topic areas |
| R-26 | Skills RUST if not practiced in 3+ days — radar visibly shrinks |
| R-27 | Interview Countdown with target date + dynamic Readiness Score |
| R-28 | Features lock when readiness drops (below 70% = interview mode locked, below 50% = Prove challenges locked) |
| R-29 | GitHub-style heatmap of daily activity — grey gaps visible, 3+ consecutive misses turn RED |
| R-30 | Longest streak counter resets permanently on break (old records in trophy case) |
| R-31 | Decay Log — scrolling feed showing "things you're forgetting" with dropping percentages |
| R-32 | Mock Interview Blackout — requires 5-day active streak to unlock, credits earned/lost |
| R-33 | Ghost Replay — shows personal best vs current performance per challenge |
| R-34 | Readiness Report — exportable one-page snapshot of current state |
| R-35 | Streak Freeze — earn 1 per 7-day streak, max stockpile 2, protects 1 day of absence |

### 2.5 Dynamic Completion Timeline

| ID | Requirement |
|----|-------------|
| R-36 | Recalculates daily based on rolling 7-day activity pace |
| R-37 | Shows 3 projected dates: best case / current pace / worst case |
| R-38 | Missing a day pushes timeline by 1.5x (not 1:1 — includes decay recovery) |
| R-39 | Weekly shift report every Monday showing days gained/lost |
| R-40 | "Tired day" mode (5-10 min quick challenge) prevents penalty, keeps streak alive |
| R-41 | Weekend rest days (opt-in, no penalty, no decay, timeline pauses) |
| R-42 | Vacation freeze (earned: 1 day per 10 active days, max 7 days bank) |
| R-43 | Burst mode: multiple units in one session = timeline jumps forward |

### 2.6 Progress & Persistence

| ID | Requirement |
|----|-------------|
| R-44 | All progress stored in browser localStorage |
| R-45 | Platform remembers: completed units, current position, streak data, scores, timeline, memory strengths |
| R-46 | "Continue where you left off" — opens to last active position |
| R-47 | Suggests next action: new lesson vs overdue review vs daily puzzle |
| R-48 | Export/Import JSON button for backup or device migration |
| R-49 | No login, no account, no server required |

### 2.7 Code Execution

| ID | Requirement |
|----|-------------|
| R-50 | In-browser code execution for practice exercises |
| R-51 | Must support Java (primary language of curriculum) |
| R-52 | Use free external API: Piston API or Judge0 Community Edition |
| R-53 | Fallback for offline/rate-limited: show-answer mode with self-rating |
| R-54 | For lighter exercises: client-side validation (fill-in-blank, multiple choice, drag-drop) |

---

## 3. UI/UX Requirements

### 3.1 Visual Design

| ID | Requirement |
|----|-------------|
| R-55 | Dark mode default (#0d1117 background, #161b22 cards) |
| R-56 | High contrast syntax highlighting (Monokai/Dracula theme) |
| R-57 | Card-based UI — everything is a card, not a page |
| R-58 | Developer aesthetic — no cutesy graphics, no gardens, no cartoon characters |
| R-59 | Accent colors: electric blue/green for progress, red only for warnings/decay |

### 3.2 Short Attention Span Design

| ID | Requirement |
|----|-------------|
| R-60 | One screen = one thing. Never scroll for core content. |
| R-61 | Visual/code FIRST, text SECOND on every card |
| R-62 | Instant feedback < 1 second on all interactions (green/red flash, animations) |
| R-63 | Micro-progress indicators everywhere (XP ticking, bars filling, cards flying away) |
| R-64 | Timer visible on challenge cards (creates urgency) |
| R-65 | Session progress always visible ("3 of 8 cards remaining") |
| R-66 | Maximum 10-12 cards per unit — then DONE, celebrate |
| R-67 | Keyboard-only navigation supported (Enter = submit, Arrow = next, Esc = menu) |

### 3.3 Dashboard

| ID | Requirement |
|----|-------------|
| R-68 | Shows: current streak, heatmap, skill radar, timeline, decay log |
| R-69 | Primary CTA: "Continue" button — one click to resume learning |
| R-70 | Secondary: "Quick Challenge" for tired days |
| R-71 | Readiness Score and Interview Countdown always visible |
| R-72 | Daily commitment selector: Full focus / Normal / Tired mode |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| R-73 | Page load < 2 seconds on average connection |
| R-74 | Works offline for content (service worker caching) — code execution needs network |
| R-75 | Mobile responsive (usable on phone, but optimized for laptop) |
| R-76 | No external dependencies that require payment |
| R-77 | Total site size < 5MB (excluding cached API responses) |
| R-78 | localStorage usage < 2MB (well within 5-10MB browser limit) |
| R-79 | Deployable via `git push` to Netlify (auto-build) |
| R-80 | Content authoring: JSON/Markdown files — easy to add new units without code changes |

---

## 5. Out of Scope

- User accounts / authentication
- Backend server / database
- Multiplayer / leaderboards
- AI-generated explanations (content is pre-authored)
- Mobile app (web only)
- Payment / monetization
- Amazon internal data of any kind

---

## 6. Success Criteria

| Metric | Target |
|--------|--------|
| Daily session completion rate | >80% of days attempted |
| Time to complete one unit | 15-30 minutes |
| Concepts retained after 2 weeks (self-test) | >70% correct on random recall |
| Platform load time | < 2 seconds |
| Days to complete all 47 units (at 1 unit/day) | ~47-60 days |
| Readiness score before interview | >80% |
