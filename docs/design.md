# LevelShift — Technical Design Document

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NETLIFY (CDN)                            │
│                    Static Site Hosting                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ serves
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                            │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   UI     │  │  Engine  │  │  Data    │  │ External │      │
│  │  Layer   │  │  Layer   │  │  Layer   │  │   APIs   │      │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤      │
│  │ Cards    │  │ Teaching │  │ local    │  │ Piston/  │      │
│  │ Dashboard│  │ Spaced   │  │ Storage  │  │ Judge0   │      │
│  │ Radar    │  │ Rep      │  │ JSON     │  │ (code    │      │
│  │ Heatmap  │  │ Timeline │  │ Export/  │  │  exec)   │      │
│  │ Modals   │  │ Scoring  │  │ Import   │  │          │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Architecture Type:** Single-page application (SPA), fully client-side  
**Backend:** None (all logic runs in the browser)  
**State Management:** localStorage + in-memory state during session  

---

## 2. Tech Stack Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | **Svelte** | Compiles to vanilla JS, tiny bundle, no virtual DOM overhead, reactive by default. Faster than React for this use case. |
| Styling | **Tailwind CSS** | Utility-first, dark mode built-in, fast prototyping, small final CSS (purged) |
| Build Tool | **Vite** | Fast dev server, optimized production builds, native Svelte support |
| Code Execution | **Piston API** (primary) / **Judge0 CE** (fallback) | Free, supports Java, no self-hosting needed |
| Charts | **Chart.js** or custom SVG | Radar chart + heatmap. Lightweight. |
| Animations | **CSS transitions + Svelte transitions** | Native, no library needed |
| Hosting | **Netlify** | Free tier, auto-deploy from Git, CDN, HTTPS |
| Content Format | **JSON files** | Structured, easy to parse, easy to author |

---

## 3. Directory Structure

```
levelshift/
├── public/
│   └── favicon.svg
├── src/
│   ├── app.html
│   ├── App.svelte                  # Root component + router
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Card.svelte         # Single learning card
│   │   │   ├── CardDeck.svelte     # Card navigation/progression
│   │   │   ├── Dashboard.svelte    # Main dashboard
│   │   │   ├── Heatmap.svelte      # GitHub-style contribution grid
│   │   │   ├── Radar.svelte        # Skill spider chart
│   │   │   ├── Timeline.svelte     # Dynamic completion timeline
│   │   │   ├── DecayLog.svelte     # Scrolling decay notifications
│   │   │   ├── CodeEditor.svelte   # Code input + execution
│   │   │   ├── ExplainBack.svelte  # Text input for Feynman flip
│   │   │   ├── ProgressBar.svelte  # Micro-progress indicator
│   │   │   ├── Timer.svelte        # Challenge timer
│   │   │   └── Modal.svelte        # Reusable modal
│   │   ├── engines/
│   │   │   ├── spaced-rep.js       # SM-2 algorithm implementation
│   │   │   ├── timeline.js         # Dynamic completion calculator
│   │   │   ├── scoring.js          # XP, streak, readiness math
│   │   │   ├── decay.js            # Memory strength decay calculator
│   │   │   ├── dependency.js       # Invisible review: concept dependency resolver
│   │   │   └── punishment.js       # Reward/punishment state machine
│   │   ├── stores/
│   │   │   ├── progress.js         # Svelte store: user progress state
│   │   │   ├── settings.js         # Svelte store: user preferences
│   │   │   └── session.js          # Svelte store: current session state
│   │   ├── data/
│   │   │   ├── phases.json         # Phase/unit metadata
│   │   │   ├── cards/              # Individual card content per unit
│   │   │   │   ├── phase1/
│   │   │   │   │   ├── unit01.json
│   │   │   │   │   ├── unit02.json
│   │   │   │   │   └── ...
│   │   │   │   ├── phase2/
│   │   │   │   └── ...
│   │   │   ├── concepts.json       # Concept registry + dependency graph
│   │   │   └── analogies.json      # Analogy bank per concept
│   │   └── utils/
│   │       ├── storage.js          # localStorage wrapper + export/import
│   │       ├── code-runner.js      # Piston/Judge0 API client
│   │       ├── dates.js            # Date/time utilities
│   │       └── animations.js       # Animation helpers
│   └── routes/
│       ├── +page.svelte            # Dashboard (home)
│       ├── learn/+page.svelte      # Learning card deck view
│       ├── challenge/+page.svelte  # Daily puzzle / quick challenge
│       └── report/+page.svelte     # Readiness report view
├── content/                         # Raw content authoring (pre-build)
│   ├── phase1-java-core/
│   ├── phase2-collections/
│   ├── phase3-java8-exceptions/
│   ├── phase4-dsa/
│   ├── phase5-rest-assured/
│   ├── phase6-api-testing/
│   └── phase7-selenium/
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── vite.config.js
└── netlify.toml
```

---

## 4. Data Models

### 4.1 Card Schema (unit JSON)

```json
{
  "unitId": "phase1_unit03",
  "title": "Classes & Objects",
  "phase": 1,
  "unit": 3,
  "estimatedMinutes": 25,
  "teaches": ["oop.classes", "oop.constructors", "oop.this"],
  "requires": ["basics.methods", "basics.types"],
  "cards": [
    {
      "id": "p1u3_c1",
      "type": "hook",
      "content": {
        "question": "This code creates a Dog. But where does the name come from?",
        "code": "Dog rex = new Dog(\"Rex\");\nSystem.out.println(rex.name);",
        "options": null
      }
    },
    {
      "id": "p1u3_c2",
      "type": "fail_first",
      "content": {
        "prompt": "Create a class Car with a 'brand' field. Make new Car(\"Toyota\") work.",
        "starterCode": "class Car {\n  // your code here\n}",
        "validationMode": "code_execution",
        "testCase": "Car c = new Car(\"Toyota\"); System.out.println(c.brand);"
      }
    },
    {
      "id": "p1u3_c3",
      "type": "analogy",
      "content": {
        "text": "A class is a blueprint. An object is the actual house built from it. You can build 100 houses from one blueprint.",
        "visual": "blueprint_to_house.svg"
      }
    },
    {
      "id": "p1u3_c4",
      "type": "code",
      "content": {
        "code": "class Dog {\n    String name;\n    \n    Dog(String name) {\n        this.name = name;  // ← key line\n    }\n}\n\nDog rex = new Dog(\"Rex\");",
        "highlight": [4],
        "annotation": "'this.name' = the object's field. 'name' = the parameter passed in."
      }
    },
    {
      "id": "p1u3_c5",
      "type": "break_it",
      "content": {
        "setup": "Dog rex = new Dog(\"Rex\");",
        "modification": "What if the constructor didn't have 'this.'?\nDog(String name) { name = name; }",
        "question": "What is rex.name now?",
        "options": ["Rex", "null", "Error"],
        "correct": 1,
        "explanation": "Without 'this.', you're assigning the parameter to itself. The field stays null."
      }
    },
    {
      "id": "p1u3_c6",
      "type": "contrast",
      "content": {
        "label": "Which creates an object?",
        "codeA": "Dog rex;",
        "codeB": "Dog rex = new Dog(\"Rex\");",
        "question": "Which line actually creates a Dog in memory?",
        "options": ["A only", "B only", "Both", "Neither"],
        "correct": 1,
        "explanation": "A declares a variable. B creates the object. Without 'new', no object exists."
      }
    },
    {
      "id": "p1u3_c7",
      "type": "explain_back",
      "content": {
        "prompt": "Interview asks: 'What is a constructor and why do we need it?'",
        "modelAnswer": "A constructor is a special method that runs when 'new' creates an object. We need it to set up the object's initial state — without it, all fields would be null/zero. It ensures objects are valid from the moment they're created."
      }
    },
    {
      "id": "p1u3_c8",
      "type": "connect",
      "content": {
        "text": "In REST Assured (Phase 5), you'll create POJO classes exactly like this:",
        "code": "class User {\n    String name;\n    int age;\n    User(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n}",
        "note": "Then pass them as request bodies. Today's concept = Phase 5's foundation."
      }
    }
  ]
}
```

### 4.2 User Progress Schema (localStorage)

```json
{
  "version": 1,
  "user": {
    "startDate": "2026-07-25",
    "interviewDate": "2026-09-15",
    "weekendRest": true,
    "dailyMode": "normal"
  },
  "progress": {
    "completedUnits": ["phase1_unit01", "phase1_unit02"],
    "currentUnit": "phase1_unit03",
    "currentCard": 4,
    "totalXP": 340
  },
  "streak": {
    "current": 7,
    "longest": 7,
    "longestHistory": [7],
    "lastActiveDate": "2026-08-01",
    "freezesAvailable": 1,
    "freezesUsed": []
  },
  "heatmap": {
    "2026-07-25": { "units": 1, "minutes": 22, "mode": "normal" },
    "2026-07-26": { "units": 1, "minutes": 18, "mode": "tired" },
    "2026-07-27": null,
    "2026-07-28": { "units": 2, "minutes": 45, "mode": "full" }
  },
  "concepts": {
    "oop.classes": { "strength": 82, "lastPracticed": "2026-08-01", "repetitions": 3, "easeFactor": 2.6, "interval": 7, "nextReview": "2026-08-08" },
    "oop.constructors": { "strength": 65, "lastPracticed": "2026-07-30", "repetitions": 2, "easeFactor": 2.3, "interval": 3, "nextReview": "2026-08-02" },
    "collections.hashmap": { "strength": 34, "lastPracticed": "2026-07-26", "repetitions": 1, "easeFactor": 2.1, "interval": 1, "nextReview": "2026-07-27" }
  },
  "interviewCredits": {
    "available": 2,
    "lastEarned": "2026-08-01"
  },
  "ghostRecords": {
    "phase1_unit03_prove": { "bestTime": 83, "bestScore": 95, "date": "2026-07-28" }
  },
  "timeline": {
    "estimatedCompletion": "2026-09-05",
    "rollingPace": 1.2,
    "bestCase": "2026-08-28",
    "worstCase": "2026-09-20"
  }
}
```

### 4.3 Concept Dependency Graph

```json
{
  "concepts": {
    "basics.types": { "phase": 1, "unit": 1, "prereqs": [] },
    "basics.methods": { "phase": 1, "unit": 2, "prereqs": ["basics.types"] },
    "oop.classes": { "phase": 1, "unit": 3, "prereqs": ["basics.methods"] },
    "oop.encapsulation": { "phase": 1, "unit": 4, "prereqs": ["oop.classes"] },
    "oop.inheritance": { "phase": 1, "unit": 5, "prereqs": ["oop.encapsulation"] },
    "oop.polymorphism": { "phase": 1, "unit": 6, "prereqs": ["oop.inheritance"] },
    "oop.abstractions": { "phase": 1, "unit": 7, "prereqs": ["oop.polymorphism"] },
    "collections.list": { "phase": 2, "unit": 1, "prereqs": ["oop.classes"] },
    "collections.hashmap": { "phase": 2, "unit": 2, "prereqs": ["oop.classes", "oop.encapsulation"] },
    "collections.sorting": { "phase": 2, "unit": 3, "prereqs": ["collections.list", "oop.abstractions"] },
    "java8.lambdas": { "phase": 3, "unit": 2, "prereqs": ["oop.abstractions"] },
    "java8.streams": { "phase": 3, "unit": 3, "prereqs": ["java8.lambdas", "collections.list"] },
    "restassured.basics": { "phase": 5, "unit": 2, "prereqs": ["basics.methods"] },
    "restassured.pojos": { "phase": 5, "unit": 5, "prereqs": ["oop.classes", "oop.encapsulation", "restassured.basics"] },
    "restassured.datadriven": { "phase": 5, "unit": 7, "prereqs": ["collections.list", "collections.hashmap", "java8.streams", "restassured.basics"] },
    "selenium.pom": { "phase": 7, "unit": 4, "prereqs": ["oop.inheritance", "oop.encapsulation", "oop.abstractions"] }
  }
}
```

---

## 5. Engine Designs

### 5.1 SM-2 Spaced Repetition Engine

```javascript
function calculateNextReview(concept, rating) {
  // rating: 0=forgot, 1=hard, 2=good, 3=easy
  let { repetitions, easeFactor, interval } = concept;

  if (rating < 1) {
    // Forgot — reset
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);

    repetitions++;
  }

  // Adjust ease factor
  easeFactor = easeFactor + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  // Calculate memory strength (0-100%)
  const daysSinceReview = 0; // just reviewed
  const strength = Math.min(100, Math.round((repetitions / 5) * 100));

  return { repetitions, easeFactor, interval, strength, nextReview: addDays(today(), interval) };
}
```

### 5.2 Memory Decay Calculator

```javascript
function calculateDecay(concept, today) {
  const daysSince = daysBetween(concept.lastPracticed, today);
  const halfLife = concept.interval * concept.easeFactor; // stronger memories decay slower

  // Exponential decay
  const retention = Math.exp(-0.5 * daysSince / halfLife);
  const currentStrength = Math.round(concept.strength * retention);

  return Math.max(0, Math.min(100, currentStrength));
}
```

### 5.3 Timeline Calculator

```javascript
function calculateTimeline(progress, heatmap) {
  const remaining = TOTAL_UNITS - progress.completedUnits.length;
  const last7Days = getLast7DaysActivity(heatmap);
  const rollingPace = last7Days.totalUnits / 7; // units per day average

  const missedDays = last7Days.missedDays;
  const penaltyFactor = 1 + (missedDays * 0.5 / 7); // 1.5x per missed day proportionally

  const currentPace = Math.max(0.1, rollingPace / penaltyFactor);
  const bestPace = 2; // 2 units/day
  const worstPace = Math.max(0.1, currentPace * 0.6);

  return {
    bestCase: addDays(today(), Math.ceil(remaining / bestPace)),
    currentPace: addDays(today(), Math.ceil(remaining / currentPace)),
    worstCase: addDays(today(), Math.ceil(remaining / worstPace)),
    rollingPace: currentPace
  };
}
```

### 5.4 Invisible Review: Dependency Resolver

```javascript
function selectExerciseVariant(currentUnit, conceptStrengths) {
  const weakConcepts = Object.entries(conceptStrengths)
    .filter(([id, data]) => data.strength < 50 && currentUnit.requires?.includes(id))
    .sort((a, b) => a[1].strength - b[1].strength);

  if (weakConcepts.length > 0) {
    // Pick exercise variant that USES the weakest prerequisite concept
    const targetConcept = weakConcepts[0][0];
    const variant = currentUnit.exerciseVariants?.find(v => v.reinforces.includes(targetConcept));
    return variant || currentUnit.defaultExercise;
  }

  return currentUnit.defaultExercise;
}
```

### 5.5 Punishment State Machine

```javascript
const PUNISHMENT_RULES = {
  streakBreak: (missed) => ({
    1: { xpLoss: 20, timelinePenalty: 1.5, action: 'warn' },
    2: { xpLoss: 50, timelinePenalty: 3.5, action: 'heatmap_red' },
    3: { xpLoss: 100, timelinePenalty: 5.5, action: 'lock_interview_credits', streakReset: true },
    7: { xpLoss: 200, timelinePenalty: 12, action: 'lock_prove_mode' }
  })[Math.min(missed, 7)],

  readinessThresholds: {
    80: { unlock: ['interview_mode', 'prove_mode', 'all'] },
    70: { lock: ['interview_mode'], message: 'Interview mode locked. Practice to recover.' },
    50: { lock: ['prove_mode'], message: 'Prove challenges locked. Readiness critical.' },
    30: { lock: ['prove_mode', 'interview_mode'], message: 'At this rate, you will not be ready.' }
  }
};
```

---

## 6. UI Component Architecture

### 6.1 Card Types & Components

| Card Type | Component | Interaction |
|-----------|-----------|-------------|
| hook | `HookCard.svelte` | Read only → auto-advance |
| fail_first | `FailFirstCard.svelte` | Code editor → submit → show result |
| analogy | `AnalogyCard.svelte` | Read + optional visual → advance |
| code | `CodeCard.svelte` | Highlighted code block → advance |
| break_it | `BreakItCard.svelte` | Multiple choice prediction → reveal |
| contrast | `ContrastCard.svelte` | Side-by-side + selection → reveal |
| explain_back | `ExplainBackCard.svelte` | Text input → submit → show model |
| connect | `ConnectCard.svelte` | Read + future code preview → advance |

### 6.2 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  LEVELSHIFT                    🔥 7 day streak    ⚡ 340 XP  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │   CONTINUE LEARNING     │  │   SKILL RADAR            │ │
│  │   Phase 1 > Unit 3      │  │      Java(72%)           │ │
│  │   Card 5 of 8           │  │     /    \               │ │
│  │                         │  │   DSA    REST Assured    │ │
│  │   [ Resume → ]          │  │     \    /               │ │
│  │                         │  │   Selenium  APIs         │ │
│  └─────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │   TIMELINE              │  │   HEATMAP                │ │
│  │   🟢 Best:  Aug 28     │  │   ■■■■■□□■■■■□□■■       │ │
│  │   🟡 Pace:  Sep 5      │  │   (last 30 days)         │ │
│  │   🔴 Worst: Sep 20     │  │                          │ │
│  │   ████████░░░░ 19%     │  │   Longest: 7 days        │ │
│  └─────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   DECAY LOG                                          │  │
│  │   ⚠️  HashMap internals: 78% → 65% (2 days ago)     │  │
│  │   ⚠️  Builder Pattern: 70% → 52% (3 days ago)       │  │
│  │   🔴 Explicit Waits: CRITICAL — below 40%           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ Quick Challenge│  │ Mock Interview│  │   Report      │  │
│  │   (5 min)     │  │   🔒 (need 5d)│  │   Export      │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Card Deck Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1 > Unit 3: Classes & Objects    ●●●●●○○○  5/8      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [ CARD CONTENT ]                          │
│                                                             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ← Back                                    ⏱ 18s    Next → │
│                    [Keyboard: ← Enter →]                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. API Integration

### 7.1 Code Execution (Piston API)

```javascript
async function executeCode(code, language = 'java') {
  const response = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: language,
      version: '*',
      files: [{ name: 'Main.java', content: wrapInMainClass(code) }]
    })
  });

  const result = await response.json();
  return {
    output: result.run?.stdout || '',
    error: result.run?.stderr || '',
    exitCode: result.run?.code || 0
  };
}
```

### 7.2 Fallback: Offline Mode

When API is unavailable (offline/rate-limited):
- Code challenges switch to "show answer" mode
- User writes code → clicks "Check" → sees correct answer → self-rates (Got it / Close / Missed it)
- Self-rating feeds into SM-2 just like real execution

---

## 8. Content Authoring Workflow

```
1. Author writes unit content in /content/phaseN/ as structured markdown
2. Build script (content-builder.js) converts to JSON in /src/lib/data/cards/
3. Svelte app loads JSON at runtime
4. Deploy to Netlify via git push
```

Content format (author-friendly):
```markdown
---
unit: phase1_unit03
title: Classes & Objects
teaches: [oop.classes, oop.constructors, oop.this]
requires: [basics.methods, basics.types]
---

## HOOK
This code creates a Dog. But where does the name come from?
```java
Dog rex = new Dog("Rex");
System.out.println(rex.name);
```

## FAIL_FIRST
Create a class Car with a 'brand' field. Make `new Car("Toyota")` work.
```java
class Car {
  // your code here
}
```

## ANALOGY
A class is a blueprint. An object is the actual house built from it.

[...continues for each card type...]
```

---

## 9. Deployment & Build

### 9.1 Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

### 9.2 Build Pipeline

```
git push → Netlify detects → runs `npm run build` → deploys /dist → live in ~30 seconds
```

---

## 10. Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| First paint | < 1s | Static HTML + minimal CSS |
| Interactive | < 2s | Svelte compiles away framework overhead |
| Bundle size | < 200KB (gzipped) | Tree-shaking, no heavy libraries |
| Content load | < 500ms per unit | Lazy-load unit JSON on navigation |
| Total site | < 5MB | Purged CSS, compressed JSON, SVG visuals |
