# VERY VERY COOL DEMO — Browser-based 16-Pad Drum Sampler

**Author:** Alex Trappett
**Status:** Draft
**Last updated:** 2026-05-12
**Stakeholders:** Alex Trappett (sole owner) — `[OPEN]` whether any other reviewers/audience are expected (e.g., talk attendees)

## 1. TL;DR

A single-page local web app that renders a 4×4 grid of light-up drum pads modeled on the Akai MPC Live III. Each pad maps to a keyboard key in a standard `1234 / QWER / ASDF / ZXCV` layout; pressing a key (or clicking/tapping a pad) plays its bundled `.wav` sound and triggers a neon flash animation. It is built with plain HTML, CSS, and JavaScript — no framework, no build step — and runs locally for personal use, likely as a live demo artifact.

## 2. Background and problem

The repo is named `Claude-Talk-Demo` and the project's `claude.md` describes the work as "a simple web app that will run locally on my machine." The intent is to produce a self-contained, visually striking, and tactile interactive page — the kind of thing that demos well in person and is fun to mash on. The MPC reference image (`src/images/pads.jpg`) and 16 pre-named `.wav` files (`1, 2, 3, 4, Q, W, E, R, A, S, D, F, Z, X, C, V`) under `src/sounds/` indicate the substrate is already in place; the missing piece is the front-end glue. Building now resolves an unfinished demo asset before it's needed for whatever the "talk" portion of the repo name implies.

`[OPEN]` — exact use context (live talk? screencap? casual side project?) is not stated, so success criteria are scoped to "works well as a stand-alone interactive demo."

## 3. Goals

- Deliver a working, single-page, browser-based 16-pad sampler that responds to both keyboard and pointer/touch input.
- Make the interface feel **tactile and responsive** — pressing a pad should feel as close to a real drum pad as the web allows (no audible lag, immediate visual feedback).
- Make the interface **look cool** — match the dark, neon-mosaic aesthetic of the MPC Live III reference, with a prominent neon-glow title.
- Keep the implementation **simple and inspectable** — three flat files at the repo root, no build tooling, no dependencies beyond a Google Font.

## 4. Non-goals

- **Not** a sequencer or step recorder. No saving, looping, BPM, or timeline.
- **Not** a music production tool. No volume control, no per-pad gain, no effects (reverb, filter, etc.), no mixing.
- **Not** multi-bank or expandable. Exactly 16 pads, exactly 16 sounds, hard-coded.
- **Not** velocity-sensitive. All presses play at the sample's native volume.
- **Not** persistent. No local storage, no user accounts, no settings that survive a refresh.
- **Not** networked. No backend, no analytics, no telemetry. The only external request is the Google Fonts stylesheet for Orbitron.
- **Not** legacy-browser compatible. Targets current Chrome/Safari/Firefox/Edge. No IE11.
- **Not** mobile-first, but mobile-functional. Layout scales down on small screens; touch input is supported.

## 5. Target users and use cases

**Primary persona:** the project owner (Alex), running the page locally on macOS in a modern browser, possibly while presenting or demoing to an audience.

**Secondary persona (implied):** demo viewers — people watching over the owner's shoulder or via screen share. They see the page but don't directly interact with it.

**Use cases:**

- *As the demo runner, I want to press keyboard keys and hear/see the corresponding pad fire, so that the page feels like a real instrument when shown live.*
- *As the demo runner, I want to mash a single key rapidly (drum-roll style) and have each press produce an overlapping sound, so that the page feels responsive rather than gated.*
- *As a first-time viewer who has been handed the keyboard, I want to see the key mapping clearly on screen, so that I can start playing within seconds without instruction.*

## 6. Requirements

### 6.1 Pad grid rendering

- **P0** — The page renders exactly 16 pads arranged in a 4×4 grid.
- **P0** — Each pad displays its assigned keyboard key (one of `1 2 3 4 Q W E R A S D F Z X C V`) prominently and centered.
- **P0** — Each pad has a distinct neon border color, with the 16 colors collectively matching the mosaic distribution of the reference image (`src/images/pads.jpg`).
- **P0** — At rest, each pad shows a dim glow in its assigned color over a dark interior.
- **P1** — The grid is enclosed in a dark "chassis" frame echoing the MPC's matte-black surround.
- **P1** — The grid scales proportionally (no reflow) on viewports down to ~360px wide.

### 6.2 Pad-to-key-to-sound mapping

- **P0** — Pad-to-key mapping is top-to-bottom by visual row: top row → `1 2 3 4`; second row → `Q W E R`; third row → `A S D F`; bottom row → `Z X C V`.
- **P0** — Each key plays its identically-named sound file from `src/sounds/` (`1.wav` for `1`, `Q.wav` for `Q`, etc.).
- **P0** — All 16 sounds are preloaded so the first press of any pad does not stall to fetch audio.

### 6.3 Input handling

- **P0** — A `keydown` for any of the 16 mapped keys triggers the pad's press behavior (sound + visual).
- **P0** — A `keyup` for any mapped key ends the held-press visual state.
- **P0** — OS key-repeat events (`event.repeat === true`) are ignored — holding a key does not re-trigger the sound.
- **P0** — A `mousedown` or `touchstart` on a pad triggers identical press behavior to its corresponding key.
- **P0** — A `mouseup`, `mouseleave`, or `touchend` on a pad ends the held-press visual state.
- **P1** — Keys that are not in the 16-pad set produce no effect (no errors, no console noise).

### 6.4 Sound behavior

- **P0** — Each press starts playback of its sound from the beginning of the sample.
- **P0** — Pressing the same pad while its sound is still playing creates an additional overlapping playback instance — instances do not interrupt each other.
- **P1** — The page does not block on the browser's audio autoplay policy; the first user gesture is sufficient to enable audio in browsers that defer it.

### 6.5 Visual feedback

- **P0** — On press, the pad immediately flashes to its full neon color with a halo glow (`box-shadow` style) and a slight scale-down (~98%) to suggest a physical press.
- **P0** — On release, the pad fades back to its dim resting state over approximately **250 ms**.
- **P0** — While the key/click/touch is held, the pad remains in the fully-lit pressed state — the fade only begins on release.

### 6.6 Title and legend

- **P0** — The page displays the title **VERY VERY COOL DEMO** above the pad grid.
- **P0** — A legend below the pad grid explains the interaction model: a single-line hint (e.g., "Press the keys on your keyboard or click the pads to play sounds.") plus a 4×4 visual keymap rendered as stylized keycap graphics matching the pad layout.

## 7. User experience

The page loads with the title visible at the top (cyan-glowing Orbitron text against a near-black background), the 4×4 pad grid centered below it in its dark chassis, and the legend (instruction line + keycap-style keymap) anchored beneath the grid.

A user can immediately:

- Press any of the 16 mapped keys → that pad flashes and plays its sample.
- Click or tap a pad → identical effect.
- Hold a key → pad stays bright until release; sound plays once.
- Mash a key → overlapping plays of that sample, no choppiness.

**Edge cases:**

- *Audio gated by browser autoplay policy:* the first user interaction (any keypress or click) implicitly satisfies the gesture requirement, so sounds work from the first press onward without an explicit "click to enable audio" prompt.
- *Mouse-down on a pad, mouse-dragged off:* releasing the held state must still happen — handled via `mouseleave` in addition to `mouseup`.
- *Multiple keys held simultaneously:* each pad maintains its own held state independently; the grid supports any number of concurrent presses.
- *Tab/window loses focus mid-press:* `[OPEN]` — current intent is to release any held visual state on `blur` so pads don't appear stuck-lit after Cmd-Tab. To be confirmed during implementation.
- *Mobile/touch:* pads remain operable; layout scales via `vmin` units.
- *Network failure on Google Fonts:* the title falls back to a system sans-serif. The page remains fully functional, just slightly less stylized.
- *Empty/error states:* none meaningful — the app has no data dependencies beyond bundled static files.

Design reference: `src/images/pads.jpg` is the canonical visual target. The image is used solely as a designer reference and is **not** embedded in the page.

## 8. Non-functional requirements

- **Performance:** first press → audible sound latency under ~50 ms on a modern laptop. No perceptible animation jank during a sustained 10-press-per-second drum roll.
- **Footprint:** total page weight (excluding `.wav` samples) under ~50 KB. Sample files are already on disk and total ~8.5 MB; they are loaded lazily-but-eagerly on page init.
- **Accessibility:** `[OPEN]` — pads are operable via keyboard by definition; ARIA/screen-reader semantics for the pad buttons are not specified yet. Reasonable default is to render pads as `<button>` elements with accessible names equal to their key labels, and to mark the grid as `role="group"` with an accessible label.
- **Browser support:** latest two stable versions of Chrome, Safari, Firefox, Edge on desktop; Safari on iOS and Chrome on Android for touch.
- **Security/privacy:** no user data is collected. The only outbound request is the Google Fonts CSS for Orbitron; the page can optionally self-host the font to make the app fully offline-capable.
- **Compliance:** N/A — personal local project, no regulated data.
- **Localization:** N/A — English-only title and legend; sound files are non-linguistic.

## 9. Success metrics

Because this is a personal demo project, success is primarily qualitative. Quantitative targets below are directional and should be validated by the owner during use.

| Metric | Baseline | Target | Window |
|---|---|---|---|
| Owner subjectively rates the page as "looks cool" | n/a | "Yes" | At first demo |
| First-press audio latency (perceived) | n/a (new build) | Indistinguishable from instant (<50 ms) | First session |
| Drum-roll feel (mashing one key ~10×/sec produces audible overlapping plays, no dropouts) | n/a | Passes informal test | First session |
| Guardrail: page remains responsive (no UI freeze) under sustained mashing | Baseline good | No regression | First session |
| `[OPEN]` Audience reaction during live demo, if applicable | n/a | `[OPEN]` | `[OPEN]` |

If this is shown in a presentation context, a more meaningful success metric would be qualitative audience response — but that's outside the scope of what the artifact itself can guarantee.

## 10. Dependencies and risks

**Dependencies:**

- Source assets already present in the repo: `src/sounds/*.wav` (16 files), `src/images/pads.jpg` (1 file, reference only).
- Google Fonts CDN for the Orbitron typeface (with system-sans fallback if blocked).
- A modern browser. No backend, no API, no database, no other team.

**Risks:**

- *Browser autoplay policy may delay first sound until first user gesture.* Mitigation: design assumes the first user gesture is itself a pad press, which satisfies the policy organically.
- *Loading 16 ~530 KB `.wav` files eagerly may be slow on weak connections.* Mitigation: app is local, served from disk — irrelevant in practice. If deployed remotely later, switch to lazy-load on first press of each pad.
- *Visual styling targets may not perfectly match the MPC reference photo without iteration.* Mitigation: the per-pad colors and overall vibe are explicitly cited as the target; iterate after first build using the reference image side-by-side.
- *Self-hosting the Orbitron font is an optional polish step that, if skipped, leaves the app dependent on Google Fonts for full visual fidelity offline.*

## 11. Open questions

- `[OPEN]` What is the actual use context — live talk? Screencap? Purely personal? Affects which polish items (favicon, offline font, etc.) are worth doing.
- `[OPEN]` Should the page handle window blur by releasing any held pad visuals? Default assumption is yes; confirm during implementation.
- `[OPEN]` Should we self-host Orbitron to make the app fully offline-capable, or accept the Google Fonts CDN dependency?
- `[OPEN]` Are accessibility semantics (ARIA labels on pads, screen-reader operability) in scope, or out of scope for a personal demo?
- `[OPEN]` Audience-reaction success metric — meaningful only if there's an actual audience, which is not confirmed.

## 12. Milestones

This is a single-developer, single-day-ish scope. Phasing is informal.

- **M1 — Scaffold (target: same day as build start)**: `index.html`, `style.css`, `script.js` created at repo root. Grid renders with placeholder colors and labels. No audio yet.
- **M2 — Audio working (target: same session)**: Keyboard + click + touch all trigger correct sample with overlap, key-repeat ignored.
- **M3 — Visual polish (target: same session)**: Per-pad colors match reference image; flash + 250ms fade tuned to feel right; title and legend styled.
- **M4 — Demo-ready (target: same session)**: Owner mashes pads, confirms "looks cool and feels right." Any tweaks from M3 settled.

## Appendix

- **Reference image:** `src/images/pads.jpg` — Akai MPC Live III pad face. The canonical visual target. Not embedded in the page.
- **Sound assets:** `src/sounds/*.wav` — 16 pre-named samples, one per mapped key.
- **Brainstorm document:** `brainstorm.md` — the design decisions extracted from the grill-me Q&A, including the rationale for each chosen option vs. alternatives considered.
- **Project context:** `claude.md` — repo-level instructions ("simple web app that will run locally on my machine").
