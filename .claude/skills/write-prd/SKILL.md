---
name: write-prd
description: Turn the current conversation into a polished Product Requirements Document saved as prd.md. Use this skill whenever the user asks for a "PRD", "product requirements doc", "product spec", "feature spec", "requirements document", or says things like "write this up as a spec", "turn our discussion into a PRD", "document what we just designed", or "draft requirements for this feature". Also use proactively when the user has spent several turns scoping a feature, product, or initiative and the natural next step is a written specification — even if they didn't say the letters "PRD". The output is always a single prd.md file written to the working directory.
---

# Write PRD

This skill takes the substance of the current conversation — the problem, the users, the proposed solution, the constraints already discussed — and produces a single `prd.md` file using a structured template grounded in modern product-spec best practices.

The conversation is the source of truth. Most of the raw material is already in the thread: someone described a problem, sketched a solution, batted around edge cases, mentioned constraints, named users. The job is to extract that, organize it under the template, and fill remaining gaps explicitly rather than inventing answers.

## Workflow

### 1. Read the conversation as source material

Before writing anything, scan the conversation end-to-end and pull out:

- **The problem or opportunity** — what's broken, missing, or being asked for, and why now
- **Who it's for** — users, customers, internal teams, personas mentioned
- **The proposed solution** — features, behaviors, flows discussed
- **Constraints** — deadlines, platforms, team size, tech stack, regulatory, budget
- **Decisions already made** — choices the user has settled, even casually ("we're not doing X")
- **Open questions** — anything raised but not resolved
- **Success signals** — metrics, outcomes, "we'll know it worked if…" statements

Treat hedges and asides as data. "I think maybe we'd want…" is a decision-in-progress worth recording in the open questions section, not a confirmed requirement.

### 2. Identify gaps before writing

A PRD is not useful if it papers over missing information with plausible-sounding filler. Before drafting, check whether the conversation supplies enough to fill these critical sections honestly:

- Problem statement (the *why*)
- Target user (the *who*)
- At least one success metric (the *how we know it worked*)
- Scope boundary — what's in, what's out

If any of these is genuinely missing — not just thin, but missing — ask the user one round of targeted questions before drafting. Don't ask about things the conversation already answered. Don't ask more than three questions. If the user prefers to proceed with gaps, mark them clearly as `[OPEN]` in the document rather than fabricating content.

### 3. Draft the PRD using the template below

Write `prd.md` to the current working directory. Use the template structure exactly — section order matters because it walks the reader from *why* to *what* to *how we'll know* in the order they need it. Keep sections that don't apply but mark them `N/A` with a one-line reason, rather than deleting them; reviewers expect the structure.

### 4. Present the file

After writing, give the user a one-paragraph summary of what's in the doc and which sections have `[OPEN]` markers needing follow-up. Don't dump the full PRD back into chat — they can open the file.

## PRD template

Use this exact structure for `prd.md`:

```markdown
# [Product / Feature Name]

**Author:** [name or "TBD"]
**Status:** Draft
**Last updated:** [YYYY-MM-DD]
**Stakeholders:** [eng lead, design lead, PM, etc. — or "TBD"]

## 1. TL;DR

Two to four sentences. What is this, who is it for, why are we doing it now. A busy exec should be able to read only this section and know whether to keep reading.

## 2. Background and problem

What is the problem or opportunity? What evidence do we have that it's real — user research, support tickets, data, competitive pressure, strategic bet? Why is now the right time to address it? What happens if we don't?

## 3. Goals

Bulleted list of outcomes this work is trying to achieve. Outcomes, not features. "Reduce time-to-first-value for new users" is a goal; "add an onboarding wizard" is a solution.

## 4. Non-goals

What this work explicitly is *not* trying to do. This section prevents scope creep and saves more arguments than any other section in the doc. Be specific: "Not redesigning the settings page", "Not supporting mobile in v1", "Not targeting enterprise admins".

## 5. Target users and use cases

Who will use this and in what situations. Include a primary persona and, if relevant, secondary personas. Describe two or three concrete use cases or user stories in the form "As a [user], I want to [action] so that [outcome]."

## 6. Requirements

Functional requirements, grouped by area or user flow. Mark each as **P0** (must ship), **P1** (should ship), or **P2** (nice to have). Avoid implementation detail — describe *what* must be true, not *how* to build it.

### 6.1 [Area / Flow name]

- **P0** — [Requirement statement, written as a testable assertion about the system's behavior]
- **P1** — [Requirement statement]

### 6.2 [Next area]

...

## 7. User experience

How users encounter and move through this. Link to mockups or Figma if they exist; otherwise describe key screens, states, and flows in prose. Call out edge cases: empty states, error states, loading, offline, permissions denied.

## 8. Non-functional requirements

Constraints that aren't features but matter: performance budgets, accessibility (WCAG level), security and privacy obligations, localization, browser/OS support, compliance (GDPR, SOC 2, etc.).

## 9. Success metrics

How we'll know this worked. Each metric should have a baseline, a target, and a measurement window. Pair leading indicators (adoption, engagement) with lagging ones (retention, revenue) where possible. Include a *guardrail* metric — something that should *not* regress.

| Metric | Baseline | Target | Window |
|---|---|---|---|
| [e.g., D7 retention for new signups] | [current %] | [target %] | [30 days post-launch] |

## 10. Dependencies and risks

Other teams, services, or work this depends on. Known risks and mitigation plans. Be honest about the things most likely to slip the date or sink the project.

## 11. Open questions

Decisions not yet made. Each item should name the question, who needs to decide, and by when. Items marked `[OPEN]` in earlier sections roll up here.

## 12. Milestones

Rough phasing. Not a project plan — a sequence of meaningful checkpoints with approximate dates. "Internal alpha — end of Q3", "Public beta — mid Q4", etc.

## Appendix

Links to research, prior docs, related PRDs, mockups, technical design docs. Anything supporting but not load-bearing for the main read.
```

## Writing best practices

These shape *how* sections are filled in. Apply them throughout the document.

**Lead with why, then what, then how-we-measure.** A reader should never finish a PRD wondering why the work is worth doing. The TL;DR and background sections carry that weight — don't shortchange them in favor of a long requirements list.

**Write requirements as testable assertions about the system.** A good requirement is something QA could write a test against. "Users can reset their password via email" is testable. "The password reset experience is delightful" is not.

**Distinguish requirements from solutions.** "The system surfaces unread messages on launch" is a requirement. "Add a red badge in the top-right corner" is a design decision that belongs in the UX section or a separate design doc. Mixing them locks in solutions prematurely and makes the doc fragile to design changes.

**Use priorities to express trade-offs honestly.** If everything is P0, nothing is. Force yourself to identify what gets cut if the deadline tightens. The P1/P2 list is often where the most useful conversation happens.

**Name non-goals aggressively.** Most disputes during a project come from someone assuming a thing was in scope. Pre-empting those with explicit non-goals is among the highest-leverage things a PRD does.

**Make success measurable.** If a goal can't be tied to a metric, either it's not really a goal or the team hasn't thought hard enough about what success looks like. Push for at least one quantitative success metric, even if it's imperfect — "directionally measurable" beats "purely vibes".

**Surface unknowns instead of hiding them.** A PRD with a clear "open questions" section beats one that papers over uncertainty. Reviewers can help resolve listed unknowns; they can't help resolve unknowns the doc pretends don't exist.

**Match the doc's weight to the stakes.** A two-week feature doesn't need a fifteen-page PRD. For smaller scopes, sections like dependencies, non-functional requirements, and milestones can shrink to a sentence each — but keep the structure so readers know what they're looking at.

**Use plain language.** Avoid jargon, internal codenames without definition, and adjectives that hide ambiguity ("seamless", "robust", "intuitive"). If a sentence sounds confident but doesn't constrain anything, cut it.

## Example: extracting a PRD from a thin conversation

**User in conversation:** "We keep losing new users in the first session. Half of them never come back. I want to add some kind of guided tour, but only for first-timers. Should ship before the holiday push."

**What ends up where:**

- TL;DR: short paragraph naming the drop-off problem and the guided-tour intervention, plus the holiday-push timing
- Background: the half-of-users-don't-return observation goes here, flagged `[OPEN]` if no data source was named
- Goals: "Reduce first-session abandonment for new users"
- Non-goals: "Not redesigning onboarding for existing users" (inferred from "only for first-timers")
- Requirements: P0 — system detects first-time users; P0 — guided tour surfaces on first session; P1 — users can dismiss and not see it again
- Success metrics: D1 and D7 retention for new signups, with baselines marked `[OPEN]` if not provided
- Open questions: "What's the actual D7 retention baseline?", "Which screens does the tour cover?", "Who owns content?"
- Milestones: "Ships before holiday push" → roughly translated to a calendar checkpoint, flagged for confirmation

Notice that the PRD is *more structured* than the conversation but doesn't invent specifics. Where the conversation was thin, the PRD names what's missing instead of guessing.

## Final check before saving

Before writing the file, scan the draft for these failure modes:

- Are there any requirements that are actually solutions in disguise? Move them or rewrite.
- Are there any adjectives doing the work of specifications? ("Fast", "easy", "intuitive" → replace with a measurable claim or move to UX prose.)
- Is the non-goals section non-empty? If it is empty, you almost certainly missed something — re-scan the conversation for "we're not going to…" statements.
- Does every goal have at least one corresponding success metric? If not, either add a metric or demote the goal.
- Are all `[OPEN]` markers also listed in the open questions section?

Then write `prd.md` and report back.