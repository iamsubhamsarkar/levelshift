# LevelShift Integration Syllabus — Agentic AI Track

**Status:** Proposal for review (no platform files modified yet)
**Author basis:** the 15-chapter textbook in `WORK_HISTORY/agentic AI/`
**Target reader:** Java/Spring/QA dev with basic Python
**Provider stack:** free OpenAI-compatible APIs (Groq primary, NVIDIA NIM alternate)

---

## 1. Goal

Add agentic AI as a first-class learning track inside LevelShift, using the
platform's existing architecture unchanged:

- Content authored as Markdown in `app/content/`, compiled to JSON by
  `build-content.js` (edit Markdown, never the JSON).
- The existing 8-step card methodology per unit:
  `HOOK → FAIL_FIRST → ANALOGY → CODE → BREAK_IT → CONTRAST → EXPLAIN_BACK → CONNECT`.
- Wired into `phases.json` (phase/unit metadata) and `concepts.json`
  (concept + dependency graph) so spaced-rep, decay, radar, and gamification
  engines treat it like any other track.

This maps the textbook's 15 chapters onto **3 new phases (9, 10, 11)** and
**~26 units**, continuing after the existing Phase 8 (Playwright).

---

## 2. Key design decisions (confirming earlier discussion)

| Decision | Choice | Rationale |
|---|---|---|
| Phase numbering | Start at **Phase 9** | Phases 1-8 already exist (8 = Playwright, `p8uN`). |
| New concept `category` | `"agentic"` | New radar axis; existing categories are java/dsa/api/selenium/etc. |
| Code language in cards | **Python** (agent code) | Agentic AI is Python-centric; contrasts nicely with the Java track. |
| In-browser execution | **Read + run-locally** (no live exec of agent code in the sandbox) | Wandbox runs Java and cannot make network calls to LLM APIs. Agent code that calls Groq/NIM must run in a companion local project. FAIL_FIRST cards use non-networked Python logic or show-answer/self-rate (an existing fallback mode). |
| Content philosophy | Pre-authored, factual | Honors LevelShift's "little to no AI / no AI-generated content" principle. |
| Card quiz rule | Quiz only tests concepts explicitly taught earlier in the same/prior unit | Matches the platform's content-audit rule (fill_blank answers must appear verbatim in a prior CODE/ANALOGY card). |

### 2.1 Code-execution nuance for FAIL_FIRST cards
FAIL_FIRST cards normally run learner code and check `expected` output. Since we
can't execute networked agent code in-browser, agentic FAIL_FIRST cards use ONE
of:
- **Pure-logic Python** that runs offline (e.g., "parse this tool-call JSON and
  return the function name") — still executable if Python exec is added, or
  self-rated.
- **Show-answer + self-rate** (existing offline fallback) for anything that
  requires an LLM call.
- **fill_blank / pick_best** interactive cards (the platform's preferred
  low-friction types) for concept checks.

This keeps every unit fully usable without changing the execution engine. A
future enhancement (out of scope here) could add Python execution to
`code-runner.js` for the offline-safe subset.

---

## 3. Phase & unit map (Phases 9–11)

Naming mirrors existing conventions: unit IDs `p9u1`, `p10u1`, … ; each unit has
`cards` (10, or 12 for integration units) and `minutes` (20–35). Integration
units at the end of each phase act as the platform's "invisible review"
capstones (they pull concepts from earlier units).

### PHASE 9 — Agentic AI Foundations
*Subtitle:* "From LLM calls to your first tool-using agent"
*Covers textbook chapters 1–5.*

| Unit | id | Title | cards | min | Textbook |
|---|---|---|---|---|---|
| 9.1 | p9u1 | What Is an Agent? (LLMs, tokens, the loop) | 10 | 20 | Ch 1 |
| 9.2 | p9u2 | Calling an LLM (Groq/NIM, messages, roles) | 10 | 25 | Ch 2 |
| 9.3 | p9u3 | Prompting & Structured Output (JSON, Pydantic) | 10 | 25 | Ch 3 |
| 9.4 | p9u4 | Tools & Function Calling (the request/execute cycle) | 10 | 30 | Ch 4 |
| 9.5 | p9u5 | The Agent Loop (ReAct, step limits, errors) | 10 | 30 | Ch 5 |
| 9.6 | p9u6 | Foundations Integration Challenge | 12 | 35 | Ch 1–5 |

### PHASE 10 — Building Real Agents
*Subtitle:* "Architecture, knowledge, frameworks, and interoperability"
*Covers textbook chapters 6–10.*

| Unit | id | Title | cards | min | Textbook |
|---|---|---|---|---|---|
| 10.1 | p10u1 | Architecture Patterns (workflow vs agent) | 10 | 25 | Ch 6 |
| 10.2 | p10u2 | Routing, Chaining & Parallelization | 10 | 25 | Ch 6 |
| 10.3 | p10u3 | Memory & Context Management | 10 | 25 | Ch 7 |
| 10.4 | p10u4 | Embeddings & RAG (retrieval-augmented) | 10 | 30 | Ch 7 |
| 10.5 | p10u5 | Agentic RAG (retrieval as a tool) | 10 | 25 | Ch 7 |
| 10.6 | p10u6 | Frameworks (LangGraph/CrewAI/Strands/Agents SDK/Spring AI) | 10 | 25 | Ch 8 |
| 10.7 | p10u7 | MCP — Model Context Protocol | 10 | 25 | Ch 9 |
| 10.8 | p10u8 | Multi-Agent Systems (topologies, agents-as-tools) | 10 | 30 | Ch 10 |
| 10.9 | p10u9 | Building Agents Integration Challenge | 12 | 35 | Ch 6–10 |

### PHASE 11 — Production-Grade & Applied Agents
*Subtitle:* "Evaluate, secure, ship, and build every agent type"
*Covers textbook chapters 11–15.*

| Unit | id | Title | cards | min | Textbook |
|---|---|---|---|---|---|
| 11.1 | p11u1 | Evaluating Agents (non-determinism, eval harness) | 10 | 25 | Ch 11 |
| 11.2 | p11u2 | Trajectory Testing & LLM-as-Judge | 10 | 25 | Ch 11 |
| 11.3 | p11u3 | Observability (traces, spans, monitoring) | 10 | 25 | Ch 12 |
| 11.4 | p11u4 | Guardrails & Prompt Injection Defense | 10 | 30 | Ch 12 |
| 11.5 | p11u5 | Human-in-the-Loop & Responsible AI | 10 | 20 | Ch 12 |
| 11.6 | p11u6 | Production: Serving, Cost & Latency | 10 | 25 | Ch 13 |
| 11.7 | p11u7 | Reliability & Deployment (Bedrock/Strands/Spring AI) | 10 | 25 | Ch 13 |
| 11.8 | p11u8 | Agent Types Cookbook I (research, coding, data) | 10 | 30 | Ch 14 |
| 11.9 | p11u9 | Agent Types Cookbook II (automation, browser, voice) | 10 | 30 | Ch 14 |
| 11.10 | p11u10 | Capstone: Build & Ship an Agent | 12 | 35 | Ch 15 |

**Totals:** 3 phases, 25 units (6 + 9 + 10), ~254 cards.
New `totalUnits` in phases.json = current (57) + 25 = **82**.

---

## 4. Concept IDs & dependency graph (for concepts.json)

All new concepts use `"category": "agentic"`. Prereqs use `agentic.*` IDs and,
where natural, existing IDs (e.g., `oop.interfaces` maps to "tool interface"
intuition; but to keep the new track self-contained and avoid forcing learners
through all of Java first, cross-track prereqs are kept minimal/optional).

### Phase 9 concepts
```
agentic.llm_basics        p9u1  prereqs: []
agentic.tokens_context    p9u1  prereqs: [agentic.llm_basics]
agentic.agent_definition  p9u1  prereqs: [agentic.tokens_context]
agentic.api_call          p9u2  prereqs: [agentic.llm_basics]
agentic.messages_roles    p9u2  prereqs: [agentic.api_call]
agentic.providers         p9u2  prereqs: [agentic.api_call]           (Groq/NIM, OpenAI-compatible)
agentic.prompting         p9u3  prereqs: [agentic.messages_roles]
agentic.structured_output p9u3  prereqs: [agentic.prompting]
agentic.schema_validation p9u3  prereqs: [agentic.structured_output]  (Pydantic)
agentic.tools_concept     p9u4  prereqs: [agentic.structured_output]
agentic.function_calling  p9u4  prereqs: [agentic.tools_concept]
agentic.tool_cycle        p9u4  prereqs: [agentic.function_calling]   (user->tool_calls->tool->final)
agentic.tool_security     p9u4  prereqs: [agentic.tool_cycle]
agentic.react_loop        p9u5  prereqs: [agentic.tool_cycle]
agentic.loop_limits       p9u5  prereqs: [agentic.react_loop]         (step caps, stop condition)
agentic.error_recovery    p9u5  prereqs: [agentic.react_loop]         (errors as observations)
agentic.foundations_integration p9u6 prereqs: [agentic.react_loop, agentic.schema_validation, agentic.tool_security, agentic.loop_limits]
```

### Phase 10 concepts
```
agentic.workflow_vs_agent p10u1 prereqs: [agentic.react_loop]
agentic.least_agentic     p10u1 prereqs: [agentic.workflow_vs_agent]
agentic.pattern_routing   p10u2 prereqs: [agentic.workflow_vs_agent]
agentic.pattern_chaining  p10u2 prereqs: [agentic.workflow_vs_agent]
agentic.pattern_parallel  p10u2 prereqs: [agentic.workflow_vs_agent]
agentic.memory_types      p10u3 prereqs: [agentic.messages_roles]
agentic.context_mgmt      p10u3 prereqs: [agentic.memory_types]       (truncation/summarization)
agentic.embeddings        p10u4 prereqs: [agentic.memory_types]
agentic.rag_pipeline      p10u4 prereqs: [agentic.embeddings]
agentic.chunking          p10u4 prereqs: [agentic.rag_pipeline]
agentic.agentic_rag       p10u5 prereqs: [agentic.rag_pipeline, agentic.tool_cycle]
agentic.vector_stores     p10u5 prereqs: [agentic.rag_pipeline]
agentic.frameworks        p10u6 prereqs: [agentic.react_loop, agentic.pattern_routing]
agentic.framework_choice  p10u6 prereqs: [agentic.frameworks]
agentic.mcp_concept       p10u7 prereqs: [agentic.tool_cycle]
agentic.mcp_serverclient  p10u7 prereqs: [agentic.mcp_concept]
agentic.mcp_security      p10u7 prereqs: [agentic.mcp_serverclient, agentic.tool_security]
agentic.multiagent_when   p10u8 prereqs: [agentic.least_agentic]
agentic.agent_as_tool     p10u8 prereqs: [agentic.multiagent_when, agentic.tool_cycle]
agentic.topologies        p10u8 prereqs: [agentic.agent_as_tool]      (supervisor/pipeline/parallel)
agentic.building_integration p10u9 prereqs: [agentic.agentic_rag, agentic.topologies, agentic.mcp_serverclient, agentic.framework_choice]
```

### Phase 11 concepts
```
agentic.eval_mindset      p11u1 prereqs: [agentic.react_loop]         (non-determinism)
agentic.eval_dataset      p11u1 prereqs: [agentic.eval_mindset]
agentic.eval_harness      p11u1 prereqs: [agentic.eval_dataset]       (multi-run pass rate)
agentic.trajectory_eval   p11u2 prereqs: [agentic.eval_harness, agentic.react_loop]
agentic.llm_judge         p11u2 prereqs: [agentic.eval_dataset]
agentic.observability     p11u3 prereqs: [agentic.react_loop]
agentic.traces_spans      p11u3 prereqs: [agentic.observability]
agentic.guardrails        p11u4 prereqs: [agentic.tool_security]
agentic.prompt_injection  p11u4 prereqs: [agentic.guardrails]         (direct + indirect)
agentic.least_privilege   p11u4 prereqs: [agentic.prompt_injection]
agentic.hitl              p11u5 prereqs: [agentic.guardrails]
agentic.responsible_ai    p11u5 prereqs: [agentic.hitl]
agentic.serving           p11u6 prereqs: [agentic.react_loop]         (FastAPI service)
agentic.cost_latency      p11u6 prereqs: [agentic.serving]            (caching, model routing)
agentic.reliability       p11u7 prereqs: [agentic.serving]            (retries/fallback/idempotency)
agentic.deployment        p11u7 prereqs: [agentic.reliability]        (Bedrock/Strands/Spring AI)
agentic.type_research     p11u8 prereqs: [agentic.agentic_rag]
agentic.type_coding       p11u8 prereqs: [agentic.react_loop, agentic.tool_security]
agentic.type_data         p11u8 prereqs: [agentic.tool_cycle, agentic.least_privilege]
agentic.type_automation   p11u9 prereqs: [agentic.hitl, agentic.reliability]
agentic.type_browser      p11u9 prereqs: [agentic.type_automation, agentic.prompt_injection]
agentic.type_voice        p11u9 prereqs: [agentic.react_loop]
agentic.capstone          p11u10 prereqs: [agentic.type_research, agentic.eval_harness, agentic.guardrails, agentic.serving]
```

**Radar note:** with `category: "agentic"`, the skill radar can gain an
"Agentic AI" axis alongside Java/DSA/API/Selenium. Verify `Radar.svelte` derives
axes from concept categories (if it hard-codes the 5 axes, that component needs a
small update — flagged as a code task in §6).

---

## 5. Per-unit card blueprint (authoring guide)

Each unit's Markdown follows the existing frontmatter + 8 sections. Example
skeleton for **p9u4 (Tools & Function Calling)** to lock the pattern:

```
---
unit: p9u4
title: Tools & Function Calling
teaches: [agentic.tools_concept, agentic.function_calling, agentic.tool_cycle, agentic.tool_security]
requires: [agentic.structured_output]
---

## HOOK
question: The model says "call get_weather(city='Tokyo')". Who actually runs that function?
```python
# The LLM did NOT run anything. It only asked. Guess what runs it...
```

## FAIL_FIRST
prompt: Given the model's tool request JSON, return the function name (offline, no LLM needed).
```python
call = {"name": "get_weather", "arguments": '{"city": "Tokyo"}'}
# Return the function name the model wants to call:
```
```python
call = {"name": "get_weather", "arguments": '{"city": "Tokyo"}'}
print(call["name"])
```
hint: It's a dict key.
expected: get_weather

## ANALOGY
A tool call is like the model handing you a filled-out order form (Command pattern):
it writes WHICH function and WHICH arguments, but YOUR code is the kitchen that cooks it.

## CODE
```python
# The model REQUESTS; your code EXECUTES, then returns the result.
if msg.tool_calls:
    name = call.function.name            # which function
    args = json.loads(call.function.arguments)  # its arguments
    result = TOOLS[name](**args)         # YOUR code runs it
```
highlight: [4]
annotation: The four-message cycle is user -> assistant(tool_calls) -> tool(result) -> assistant(final). The model never executes code; it emits a structured request and your runtime dispatches it.

## BREAK_IT
setup:
```python
result = TOOLS[name](**args)   # args came from the model
```
modification: The model hallucinated args = {"city": 12345}
question: What's the safe thing to do before running the tool?
options: [Run it anyway, Validate args against a schema first, Trust the model, Retry blindly]
correct: 1
explanation: Model-supplied arguments are UNTRUSTED input. Validate them (e.g., with Pydantic) before executing — exactly like validating a REST request body.

## CONTRAST
label: Two ways the model can respond:
codeA:
```python
msg.content = "It will rain in Tokyo."     # direct text answer
```
codeB:
```python
msg.tool_calls = [get_weather(city="Tokyo")]  # a tool request
```
question: Which response means "run my code and give me the result"?
options: [A, B, Both, Neither]
correct: 1
explanation: finish_reason == "tool_calls" signals the model wants a tool run. Text content is a final answer; tool_calls is a request for your code to act.

## EXPLAIN_BACK
mode: fill_blank
prompt: How does function calling actually work?
sentence: The model only _____ a tool call; _____ code executes it, then the result is returned as a _____ message.
blanks: [requests, your, tool]
distractors: [runs, the model's, system]

## CONNECT
text: In Phase 11 you'll wrap tools behind guardrails and human approval:
```python
if needs_human_approval(name):   # e.g., delete_records, refund
    await get_approval()
```
note: Today's "validate model args" habit is the seed of the security you'll build for production agents.
```

The other 24 units follow the same blueprint, drawing content directly from the
corresponding textbook chapter. The `expected`-based FAIL_FIRST cards always use
offline-runnable Python (parsing, dict/list ops, string logic) so no LLM/network
call is needed to check them.

---

## 6. Implementation task list (when you approve)

**Content (per unit — 25 units):**
- [ ] Author `app/content/phase9-agentic-foundations/p9u1..p9u6.md`
- [ ] Author `app/content/phase10-building-agents/p10u1..p10u9.md`
- [ ] Author `app/content/phase11-production-agents/p11u1..p11u10.md`
- [ ] Run `node build-content.js` to generate `src/lib/data/cards/phase9|10|11/*.json`

**Data wiring:**
- [ ] Add phases 9–11 to `phases.json`; update `totalUnits` 57 → 82.
- [ ] Add all `agentic.*` concepts to `concepts.json` with the graph in §4.

**Code (small, verify first):**
- [ ] Check `Radar.svelte` / scoring: does it derive skill axes from concept
      `category`? If the 5 axes are hard-coded, add an "agentic" axis.
- [ ] Confirm CourseMap renders new phases automatically (it reads phases.json).
- [ ] Confirm FAIL_FIRST offline/self-rate path works for Python cards
      (Wandbox runs Java; our Python FAIL_FIRST are offline-checkable or
      self-rated — verify the show-answer fallback).
- [ ] (Optional, future) add offline Python execution to `code-runner.js`.

**Verify:**
- [ ] `npm test` still green.
- [ ] `npm run build` succeeds.
- [ ] Manually walk one unit per new phase in the running app.

---

## 7. Suggested build order (pilot first)

1. **Pilot: author Phase 9 only** (6 units), wire phases.json + concepts.json,
   build, and walk it in the app. You review the feel and the Python/FAIL_FIRST
   approach on real content.
2. Iterate on tone/format from the pilot.
3. Author Phase 10, then Phase 11.
4. Radar/scoring axis update + final build/test pass.

This de-risks the effort: you see and approve a complete phase before ~250 cards
are written.

---

## 8. Open questions for you

1. **Phase count:** 3 phases / 25 units as above — good, or do you want it
   split differently (e.g., 4 phases for shorter phases)?
2. **Python execution:** ship with offline-checkable FAIL_FIRST + self-rate (no
   engine change) now, or invest in adding Python to `code-runner.js` first?
3. **Radar axis:** add a dedicated "Agentic AI" radar axis (needs a small
   `Radar.svelte` check), or fold it under an existing axis for v1?
4. **Cross-track prereqs:** keep the agentic track self-contained (my default),
   or require some Java/collections units as prereqs since examples reference
   OOP/JSON concepts?

Answer these and I'll start the Phase 9 pilot.
