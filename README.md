# Claude Talk Demo — Browser-based 16-Pad Drum Sampler

A single-page web app that renders a 4×4 grid of light-up drum pads modeled on the Akai MPC Live III. Each pad maps to a keyboard key (`1234 / QWER / ASDF / ZXCV`) and plays a bundled `.wav` when pressed. Plain HTML, CSS, and JavaScript — no framework, no build step.

This repo is also the **demo artifact for a Claude talk** showing an end-to-end workflow: **Research → Build → Implement → Review**, driven by Claude Code, Task Master, and the Superpowers plugin.

## The demo workflow

1. **Research → `brainstorm.md`**
   Started with an open-ended conversation with Claude to explore the idea, scope, and constraints. The output is captured in [brainstorm.md](brainstorm.md).

2. **Build the spec → `prd.md`**
   Took the brainstorm and turned it into a polished Product Requirements Document using the `write-prd` skill. The output is [prd.md](prd.md) — goals, non-goals, users, requirements, and open questions.

3. **Break down work → Task Master**
   Used [Task Master AI](https://github.com/eyaltoledano/claude-task-master) to parse the PRD into discrete tasks and subtasks, stored in [.taskmaster/tasks/tasks.json](.taskmaster/tasks/tasks.json). This gives Claude a concrete checklist to work through instead of a vague spec.

4. **Implement → loop + TDD with Superpowers**
   Looped through the task list, implementing each one with **test-driven development** via the [Superpowers plugin](https://github.com/obra/superpowers)'s `test-driven-development` skill: write the failing test first, then the code to make it pass. Tests live in [tests/](tests/).

5. **Review**
   Reviewed the resulting code and verified the app behaves as the PRD describes before shipping.

## Running it

```bash
npm install
npm test          # run the vitest test suite
```

Then open [index.html](index.html) directly in a modern browser (Chrome, Safari, Firefox, or Edge) and start mashing pads.

## Project layout

```
.
├── index.html          # the page
├── style.css           # neon MPC styling
├── script.js           # pad + audio + animation logic
├── src/
│   ├── images/         # MPC reference image
│   └── sounds/         # 16 .wav samples (1234/QWER/ASDF/ZXCV)
├── tests/              # vitest specs
├── brainstorm.md       # step 1: open-ended exploration
├── prd.md              # step 2: product requirements
└── .taskmaster/        # step 3: generated task breakdown
```

## What this is *not*

Not a sequencer, not a DAW, not multi-bank, not velocity-sensitive, not persistent, not networked. Sixteen pads, sixteen sounds, hard-coded — that's the whole product. See [prd.md](prd.md) §4 for the full non-goals list.
