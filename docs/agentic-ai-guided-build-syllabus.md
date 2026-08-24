# LevelShift — Agentic AI Track (Guided-Build Syllabus)

**Status:** Proposal for review. No platform files modified yet.
**Supersedes:** the earlier quiz-oriented `agentic-ai-syllabus.md` (that one used the 8-card format; this one is a guided build-along, which fits your goal better).
**Companion theory:** the 18-chapter textbook in `WORK_HISTORY/agentic AI/`.
**Learner:** you — Java/Spring/QA background, basic Python, on **Windows AND Ubuntu 24.04**.
**Provider stack:** free, OpenAI-compatible (Groq primary, NVIDIA NIM alternate).

---

## 1. The learning model (confirmed with you)

The `.txt` book is the THEORY. LevelShift is a **guided, step-by-step 0→100 hands-on build**: by
following it you construct ONE complete, real agentic AI system on your own machine.

**The per-step loop (the core interaction):**

    1. Read the guided step on LevelShift (what to do + why; links to the theory chapter).
    2. Implement it on your local system (LevelShift shows per-OS commands: Windows / Ubuntu).
    3. Verify it locally by running it (LevelShift states the expected result — "what success looks like").
    4. Come back to LevelShift and MARK IT DONE (self-confirm; streak/progress/timeline update).
    5. Move to the next step (which builds on what you just implemented).

Repeat until the system is built and deployed. LevelShift is **guide + verify-checklist + progress
tracker**. It does NOT run or auto-check your code — the browser sandbox can't execute a local
agent or call LLM APIs. Verification is you running it and confirming the expected output. This is
honest and matches how real guided projects work.

This is backed by 2026 best practice: the biggest failure in agentic-AI learning is doing theory
without a live build; pairing them is what actually produces skill.

---

## 2. The guiding design principles (from research)

1. **ONE continuous project, not 25 disconnected drills.** Every unit advances the SAME codebase.
   You end with one portfolio-worthy system, not scattered snippets.
2. **All four core competencies must be exercised:** orchestration logic, tool-calling/integration,
   memory management, and — the most-skipped — **error-handling & self-correction**. So some steps
   deliberately make you BREAK the agent (a failing tool, a rate limit, an injection attempt) and fix it.
3. **Cross-platform is first-class.** Every command step shows Windows AND Ubuntu 24.04, built on a
   Python virtual environment (`venv`) — the universally recommended baseline. This is exactly where
   self-guided learners get stuck, so it's handled explicitly, not assumed.
4. **Verify every step.** Each build-step defines a concrete "expected result" so you know it worked
   before marking done. (Your QA instinct: no step is "done" without a passing check.)
5. **Deploy at the end.** Production constraints (cost, latency, guardrails, drift) only become real
   when the thing actually runs. The final phase ships the agent as a running service.
6. **Least-agentic-first.** The build grows from a single LLM call → tools → loop → RAG → multi-agent
   → production, so you feel WHY each layer of complexity is added.

---

## 3. The project you will build: "ATLAS" — an Agentic Research & Ops Assistant

A single evolving system. It starts as a one-call script and grows, step by step, into a deployed,
guardrailed, multi-capability agent. Chosen because it naturally exercises all four competencies and
maps onto the most common real agent type (research/Q&A) while leaving room for tools, memory, and
multi-agent.

End state: a locally-built, service-wrapped agent that can answer questions over your own documents
(RAG), use tools, recover from failures, is evaluated and guardrailed, and can hand off to a
specialist sub-agent — runnable on both your Windows and Ubuntu machines.

---

## 4. Phase & unit map

New phases continue after the existing Phase 8 (Playwright): **Phase 9 (Theory) + Phases 10, 11, 12
(guided build).** No gating — all freely accessible via Course Map (theory is recommended-first, not
required). Theory is read; build units advance the ATLAS project and end in a CHECKPOINT.

### PHASE 9 — Agentic AI Theory (the full book, in-app & interactive)
*The complete 18-chapter theory, rendered interactively. Depth = the `.txt` book or MORE, never
briefer. Each chapter = one unit; each unit is split into `theory` cards BY SECTION (option (a)), so
you tap through section by section — full text preserved, paginated for the "one screen = one idea"
feel — ending with the chapter's "Check Your Understanding" as reflection cards.*

| Unit | id | Chapter (source .txt) |
|---|---|---|
| 9.1  | p9u1  | Ch 1 — Foundations: LLMs and Agents |
| 9.2  | p9u2  | Ch 2 — How LLMs Work (tokens, context, temperature) |
| 9.3  | p9u3  | Ch 3 — Talking to an LLM: APIs, Messages & Providers |
| 9.4  | p9u4  | Ch 4 — Prompting as a Discipline |
| 9.5  | p9u5  | Ch 5 — Structured Output |
| 9.6  | p9u6  | Ch 6 — Tools and Function Calling |
| 9.7  | p9u7  | Ch 7 — The Agent Loop: ReAct & Reasoning |
| 9.8  | p9u8  | Ch 8 — Architecture Patterns |
| 9.9  | p9u9  | Ch 9 — Memory & Context |
| 9.10 | p9u10 | Ch 10 — Embeddings & Semantic Search |
| 9.11 | p9u11 | Ch 11 — RAG: Retrieval-Augmented Generation |
| 9.12 | p9u12 | Ch 12 — Frameworks |
| 9.13 | p9u13 | Ch 13 — MCP: Model Context Protocol |
| 9.14 | p9u14 | Ch 14 — Multi-Agent Systems |
| 9.15 | p9u15 | Ch 15 — Evaluation & Testing |
| 9.16 | p9u16 | Ch 16 — Observability & Guardrails |
| 9.17 | p9u17 | Ch 17 — Production & Deployment |
| 9.18 | p9u18 | Ch 18 — Agent Types & Where to Go Next |

Cards here are `theory` (see §6). Each chapter's sections (X.1, X.2, …) become sequential theory
cards; the "Check Your Understanding" questions become reflection cards at the end of the unit.

### PHASE 10 — Environment & Your First Agent
*Build begins. Outcome: a working single-agent ReAct loop on your machine. (Applies theory Ch 1–7.)*

| Unit | id | Build milestone | Ref (Phase 9 ch) |
|---|---|---|---|
| 10.1 | p10u1 | Set up Python + venv on Windows AND Ubuntu; get free API keys (Groq/NIM); store them safely | 2–3 |
| 10.2 | p10u2 | Make your first LLM call; build a tiny provider-agnostic client (swap Groq↔NIM) | 3 |
| 10.3 | p10u3 | Get reliable structured output (validated JSON) | 4–5 |
| 10.4 | p10u4 | Give the model a tool; wire the request→execute→return cycle by hand | 6 |
| 10.5 | p10u5 | Wrap it in the agent LOOP (ReAct) with a step limit + a stopping condition | 7 |
| 10.6 | p10u6 | CHECKPOINT: break a tool on purpose; make the agent recover (errors-as-observations) | 7 |

### PHASE 11 — Knowledge, Structure & Interop
*Outcome: ATLAS gains memory, RAG, and a specialist sub-agent. (Applies theory Ch 8–14.)*

| Unit | id | Build milestone | Ref (Phase 9 ch) |
|---|---|---|---|
| 11.1 | p11u1 | Add conversation memory + trim/summarize long context | 9 |
| 11.2 | p11u2 | Generate embeddings; do a tiny semantic search over sample text | 10 |
| 11.3 | p11u3 | Build a real RAG pipeline over YOUR documents (chunk → embed → store → retrieve) | 11 |
| 11.4 | p11u4 | Turn retrieval into a TOOL (agentic RAG); enforce "answer only from context + cite" | 11 |
| 11.5 | p11u5 | Refactor onto a framework (e.g., LangGraph or a light SDK) and compare to raw | 12 |
| 11.6 | p11u6 | Consume/expose a tool via MCP | 13 |
| 11.7 | p11u7 | Add a supervisor + specialist sub-agent (agent-as-a-tool) | 8, 14 |
| 11.8 | p11u8 | CHECKPOINT: multi-hop question that uses RAG + sub-agent together | 11, 14 |

### PHASE 12 — Trust & Ship It
*Outcome: ATLAS is evaluated, guardrailed, and deployed. (Applies theory Ch 15–18.)*

| Unit | id | Build milestone | Ref (Phase 9 ch) |
|---|---|---|---|
| 12.1 | p12u1 | Build a small eval set; run each case multiple times; measure a pass rate | 15 |
| 12.2 | p12u2 | Add tracing (log every step/tool/observation); inspect a trajectory | 16 |
| 12.3 | p12u3 | Add input/output/action guardrails; defend an injection attempt (break-and-fix) | 16 |
| 12.4 | p12u4 | Add a human-in-the-loop approval gate on a "dangerous" tool | 16 |
| 12.5 | p12u5 | Wrap ATLAS as a local API service (guardrails at the boundary) | 17 |
| 12.6 | p12u6 | Add reliability: retries, timeouts, provider fallback (Groq↔NIM), caps | 17 |
| 12.7 | p12u7 | CAPSTONE: run the full system on both OSes; write a short README; (optional) deploy | 17, 18 |

**Totals:** 4 phases. Phase 9 = 18 theory units (full book, interactive). Phases 10–12 = 21 build
units (~130–160 build-steps). One continuous ATLAS project across the build phases.
Every build-step carries a minor "learned in Phase 9, Ch X" reference back to the in-app theory.

---

## 5. Concept graph & radar (fits existing engines)

New concepts use `"category": "agentic"` in `concepts.json` (enables an "Agentic AI" radar axis).
The dependency graph mirrors the build order (each milestone requires the previous), so spaced-rep,
decay, timeline, and readiness engines work unchanged. (Full `agentic.*` concept list carried over
from the prior syllabus draft, re-pointed to these build units.)

---

## 6. The TWO new card types (the only platform changes)

Both are ADDITIVE and slot into the existing pipeline (Markdown → `build-content.js` → JSON →
`CardRenderer.svelte`) and the existing completion/gating engine (`session.js` `completeCard`) with
no engine rewrite. Existing card types are untouched.

### 6A. `theory` — interactive chapter reading (Phase 9)
Renders the FULL chapter content in-app, split by section (option (a)). Depth equals the `.txt` book
or more — never summarized. Each card is one section; the "Check Your Understanding" items become
reflection cards at the unit's end.

```
{
  "id": "p9u1_s2",
  "type": "theory",
  "content": {
    "heading": "1.2  What an LLM is, in plain words",
    "body": "<full text of section 1.2, verbatim from the .txt or expanded — never shortened>",
    "snippet": "give the model everything so far -> it suggests the next tiny piece ...",
    "snippetExplanation": "What this shows: ... (plain-English, as in the book)",
    "callout": "The single most important idea: an LLM predicts the next chunk of text, repeatedly."
  }
}
```
Rendering (`TheoryCard.svelte`): heading + body (readable prose), optional illustrative snippet with
its "What this shows" explanation, optional callout box. A **"✓ Mark as read"** button calls
`completeCard()` → marks done, unlocks next section. Reflection ("Check Your Understanding") can reuse
the existing explain-back/quiz styling but ungraded, or a simple `theory` card with the questions.

RULE FOR AUTHORING: copy the chapter content faithfully; you may EXPAND for clarity but must NEVER
reduce depth below the `.txt` version. The `.txt` book and Phase 9 hold the same knowledge (two homes).

### 6B. `build_step` — a single guided build action (Phases 10–12)
The current 8-card quiz format doesn't fit a build-along, so `build_step` provides the
read → implement-locally → verify → mark-done flow.

#### What a build_step card contains
```
{
  "id": "p10u1_s3",
  "type": "build_step",
  "content": {
    "goal": "Create and activate a Python virtual environment.",
    "why": "Isolates this project's dependencies. (Learned in Phase 9, Ch 2–3.)",
    "commands": {
      "windows": "python -m venv .venv\n.venv\\Scripts\\Activate.ps1",
      "ubuntu":  "python3 -m venv .venv\nsource .venv/bin/activate"
    },
    "code": null,                       // optional file content to add
    "verify": "Your terminal prompt now shows (.venv) at the start of the line.",
    "troubleshoot": "If activation is blocked on Windows PowerShell, run: Set-ExecutionPolicy -Scope Process RemoteSigned",
    "reference": "Phase 9, Ch 2"
  }
}
```

#### How build_step renders (a new `BuildStepCard.svelte`)
- **GOAL** (what to do) + **WHY** (one line, references the Phase 9 chapter).
- **OS TABS: [ Windows ] [ Ubuntu ]** — shows the right commands per platform (remembers your choice
  in settings; this is the cross-platform requirement made concrete).
- Optional **CODE** block to add to a file (reuses existing CodeCard styling + copy button).
- **VERIFY** box: "You'll know it worked when…" (the expected local result).
- **TROUBLESHOOT** (collapsible): common failure + fix.
- A **"✓ I did this and verified it"** button → calls the existing `completeCard()`, which marks it
  done, persists state, and unlocks the next step (identical gating to today's cards).

### 6C. Why these are small, safe changes
- Additive only: two new `type` values in `CardRenderer.svelte`, two new components
  (`TheoryCard.svelte`, `BuildStepCard.svelte`). All existing card types and engines are untouched.
- Completion/gating/streaks/decay already work via `session.js` — both new cards complete exactly like
  existing cards (via `completeCard()`), just triggered by "Mark as read" / "I verified it" instead of
  a quiz answer.
- Honors "no live execution in browser": theory is read; build verification is user-confirmed. Both
  match the honest flow.

(Optional later enhancement, out of scope for v1: a "paste your output" box on build_step that
self-checks against `verify` — still no code execution, just simple string/pattern comparison.)

---

## 7. Implementation task list (when you approve)

**Platform (small, additive):**
- [ ] Add `theory` and `build_step` parsing to `build-content.js`.
- [ ] Create `TheoryCard.svelte` (heading, full body, optional snippet + explanation, callout,
      "Mark as read" button).
- [ ] Create `BuildStepCard.svelte` (OS tabs, verify box, troubleshoot, "I verified it" button).
- [ ] Register both types in `CardRenderer.svelte` (both interactive: complete on confirm).
- [ ] Add an OS preference (windows/ubuntu) to settings so build_step tabs remember the choice.
- [ ] (Check) `Radar.svelte`: add an "agentic" axis if axes are hard-coded.

**Content:**
- [ ] Author Phase 9 theory: `app/content/phase9-agentic-theory/p9u1..p9u18.md` — full chapter content
      per section, faithful to (or deeper than) the `.txt` book. NEVER briefer.
- [ ] Author build phases: `app/content/phase10..12-*/…` build-step Markdown.
- [ ] Run `node build-content.js`.
- [ ] Add phases 9–12 to `phases.json`; add `agentic.*` concepts to `concepts.json`.

**Verify:**
- [ ] `npm test` green; `npm run build` succeeds; walk one theory unit and one build unit in the
      running app on both OSes.

---

## 8. Suggested rollout (pilot first)

1. Build the `theory` and `build_step` card types.
2. Author a **theory pilot** (Phase 9, Chapter 1 as unit p9u1, full sections) AND a **build pilot**
   (Phase 10, Unit 1: env setup on both OSes). You review the interactive theory feel + the
   cross-platform build flow on real content.
3. Iterate on the formats, then author the remaining Phase 9 chapters, then Phases 10–12.

I won't touch platform files until you say go. When ready, we start with the two card types + the
Phase 9 (Ch 1) and Phase 10 (Unit 1) pilots.
