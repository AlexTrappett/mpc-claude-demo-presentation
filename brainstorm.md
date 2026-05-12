# VERY COOL DEMO — Brainstorm / Plan

A single-page local web app: 16 light-up drum pads styled after the Akai MPC Live III, playable with keyboard or mouse/touch.

---

## Tech stack

- **Plain HTML + CSS + JavaScript.** No framework, no build step, no `npm`.
- Three files at the project root:
  - `index.html` — entry point
  - `style.css` — all styling
  - `script.js` — pad logic, audio, keyboard handling
- Existing assets stay where they are: `src/images/pads.jpg` (design reference only — not embedded in the page), `src/sounds/*.wav` (loaded by the app).
- Run locally by either:
  - Double-click `index.html` to open in a browser, OR
  - `python3 -m http.server` in the project root, then visit `http://localhost:8000`
  - (The `http.server` route is safer — some browsers block `<audio>` loading over `file://`.)

---

## Pad layout & key mapping

4×4 grid. Top visual row corresponds to the top row of the keyboard. Each pad maps 1:1 to a key, and each key maps 1:1 to its matching sound file.

| Visual row | Keys              | Sound files                            |
| ---------- | ----------------- | -------------------------------------- |
| Top        | `1` `2` `3` `4`   | `1.wav` `2.wav` `3.wav` `4.wav`        |
| 2nd        | `Q` `W` `E` `R`   | `Q.wav` `W.wav` `E.wav` `R.wav`        |
| 3rd        | `A` `S` `D` `F`   | `A.wav` `S.wav` `D.wav` `F.wav`        |
| Bottom     | `Z` `X` `C` `V`   | `Z.wav` `X.wav` `C.wav` `V.wav`        |

Each pad displays its key prominently (e.g. big "Q"), centered. No other pad text.

---

## Pad colors

Match the reference image pad-by-pad — a mosaic of teal/cyan, hot pink/magenta, electric blue, and yellow neon borders distributed across the 4×4 grid. Each pad's color is hard-coded so the look matches the MPC photo.

---

## Light-up / press animation

- **Resting state:** dim border glow in the pad's color, dark interior.
- **On press (key or click/touch):** instant flash — pad fills with its color, border halos hard with a `box-shadow` glow, slight scale-down (~98%) for a "pressed" feel.
- **On release:** fades back to dim resting state over **~250ms**.
- **Held key/mouse:** pad stays lit (full bright) for as long as the key is held; fade begins on release.

---

## Sound behavior

- **Preload all 16 sounds** on page load so the first press has no delay.
- **Rapid presses → restart from beginning + allow overlap.** A drum roll on `Q` plays multiple overlapping copies of `Q.wav`. Implementation: `new Audio()` per press (or clone a preloaded audio node), so each instance plays independently.
- **Held key → fires once.** OS key-repeat (`event.repeat === true`) is ignored. No machine-gun re-trigger.
- **Click + touch parity.** Mouse `mousedown` and `touchstart` behave identically to a `keydown` for that pad. Releasing the mouse/touch behaves like `keyup`.

---

## Visual style — dark synthwave neon

- **Background:** near-black (`#0a0a0f`), possibly with a very subtle radial gradient or dim grid pattern so it's not perfectly flat.
- **Page layout:** centered column — title at top, pad grid in the middle, legend below.
- **Pad chassis:** a dark frame around the 4×4 grid echoing the MPC's black surround, with appropriate inner padding and rounded corners. Pads have rounded squares with thick neon borders, matching the photo proportions.
- **Mobile-friendly:** the grid scales down on small screens (uses `vmin`-based sizing) rather than reflowing.

### Title

- Text: **VERY VERY COOL DEMO**
- Font: **Orbitron** (loaded from Google Fonts), bold, wide letter-spacing.
- Size: large (~60–80px on desktop, scaled down on mobile).
- Color: white-ish core text with a layered **cyan/teal (`#00f0ff`) neon glow** via stacked `text-shadow`s (multiple shadows with increasing blur radii for the proper neon-sign halo).
- Optional subtle flicker animation (occasional brightness dip) for extra cool factor.

### Legend (below the pads)

- One-line hint: *"Press the keys on your keyboard or click the pads to play sounds."*
- A small visual keymap below the hint, laid out as 4 rows of stylized **keycap graphics** (rounded rectangles with the letter inside, slight shadow so they look like keys), matching the pad layout:
  ```
  [1] [2] [3] [4]
  [Q] [W] [E] [R]
  [A] [S] [D] [F]
  [Z] [X] [C] [V]
  ```
- Styled subtly — dim cyan or muted gray so it supports the pads, doesn't compete with them.

---

## File structure

```
Claude-Talk-Demo/
├── index.html        ← new
├── style.css         ← new
├── script.js         ← new
├── brainstorm.md     ← this file
├── claude.md         ← existing
└── src/
    ├── images/
    │   └── pads.jpg  ← reference only, not embedded
    └── sounds/
        ├── 1.wav ... 4.wav
        ├── Q.wav W.wav E.wav R.wav
        ├── A.wav S.wav D.wav F.wav
        └── Z.wav X.wav C.wav V.wav
```

---

## Default assumptions (not explicitly asked — flag if any are wrong)

- **No volume control / mute** — just plays at the sample's native volume.
- **No effects** (reverb, filters, etc.) — clean playback.
- **No recording or sequencer** — pure "press to play."
- **No persistent state** — refresh resets everything (nothing to persist anyway).
- **No favicon** — can add a quick neon-square SVG favicon if you want polish.
- **No analytics, no tracking, no external calls** beyond loading the Orbitron font from Google Fonts (offline-capable if we self-host the font, but Google Fonts CDN is simplest).
- **Browser target:** modern Chrome/Safari/Firefox/Edge. No IE11. Uses standard `Audio` API, `keydown`/`keyup`, CSS Grid, `box-shadow` glow.

---

## Build order (when you say "go")

1. Scaffold `index.html` with title, pad grid container, and legend.
2. Write `style.css` — dark theme, Orbitron title with cyan glow, 4×4 grid with per-pad colors, pressed-state animation, keycap legend styling.
3. Write `script.js` — preload sounds, wire up `keydown`/`keyup` (filtering `event.repeat`), wire up `mousedown`/`mouseup` + `touchstart`/`touchend`, trigger sound + visual flash on press, remove pressed state on release.
4. Open in a browser, mash some keys, confirm it feels good.

---

## Open questions / things to confirm before building

- None — all major design decisions resolved. Any "default assumption" above that's wrong, call it out and we'll adjust before writing code.
