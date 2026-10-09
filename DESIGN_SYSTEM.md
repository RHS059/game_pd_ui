# FIELD — a UI design system for 3D shooters

FIELD is a design system for first-person and third-person shooters: HUD, front-end menus, loadouts, scoreboards,
progression, store and settings. It draws on the patterns that make modern military and sci-fi shooters (Call of Duty:
Modern Warfare, Halo Infinite, and their peers) readable at speed, and it is built so that one set of components can be
re-themed for a grounded military game, an armoured sci-fi game, a bright competitive arena, or a slow horror game.

This file is the source of truth. Engineers, artists and AI agents should read it before building any screen, and the
token block in section 3 is machine-read by `scripts/check_contrast.py`.

Contents
1. Design read and principles
2. Mood dials and themes
3. Colour
4. Typography
5. Space, shape and grid
6. Layers and HUD architecture
7. HUD components
8. Front-end components
9. Input and focus
10. Motion
11. Sound and haptics pairing
12. Accessibility
13. What to do and when (by game state)
14. Theming and token architecture
15. Engine handoff
16. Pre-flight checklist
17. Agent prompt guide

---

## 1. Design read and principles

Players look at a shooter HUD for a few hundred milliseconds at a time, mostly in peripheral vision, while moving the
camera. Menus are read from a sofa three metres away or a desk 60 cm away, with a controller, mouse or touch. Every rule
here comes from those two conditions.

Principles, in priority order when they conflict:

1. **The world comes first.** The HUD earns every pixel it covers. If a piece of information can live in the world
   (ammo on the weapon model, a waypoint on the objective), or in sound, it should.
2. **Glance, then read.** Combat information must be understood by shape, position and colour in one glance; numbers
   and words confirm it. Menus may ask the player to read.
3. **One meaning per signal.** A colour, shape or sound means one thing everywhere in the game. Enemy orange never
   decorates a button.
4. **Redundant critical feedback.** Anything that can kill the player is shown by at least two channels (visual +
   sound, or visual + haptic), and never by colour alone.
5. **Stable positions.** Elements do not move between matches, modes or menus. Muscle memory is a feature.
6. **Quiet until it matters.** At rest the HUD is low in contrast and motion. Urgency raises contrast, size and motion
   in proportion to the danger.
7. **Instrument, not website.** Panels are cut, bracketed and mounted, like equipment readouts. FIELD has no rounded SaaS cards, no
   gradient buttons and no drop-shadowed tiles floating over the game.

### What makes it look like a game, not an app

| Use | Avoid |
|---|---|
| Chamfered corners (45° cuts), corner brackets, tick marks, hairline rules | Large border radii, pill buttons everywhere, soft card shadows |
| Condensed sans with tabular figures, uppercase labels with tracking | Default system UI fonts, italic serif display type |
| Dark translucent scrims behind text over the world, glyph halos | White cards, frosted glass on every surface |
| Information anchored to screen edges, centre kept clear | Centred hero layouts, three equal feature cards |
| State shown by fill, segment count and position | Status chips stacked on everything |
| Motion that reports a change (damage, pickup, unlock) | Idle loops, hover wobble, decorative shimmer on the HUD |
| Accent colour used on fewer than 10 % of pixels | Accent colour as a background fill |

---

## 2. Mood dials and themes

A theme is chosen by setting four dials, then picking or tuning a preset. Components read the dials; they never
hard-code a mood.

| Dial | 1 | 10 | Drives |
|---|---|---|---|
| `TENSION` | relaxed, generous timings | constant threat | colour temperature of alerts, motion speed, how fast warnings escalate |
| `DIEGESIS` | flat screen overlay | everything lives in the world/visor | visor framing, world-space panels, curvature, scanlines/noise |
| `DENSITY` | minimal HUD | full telemetry | how many HUD modules are on by default, text size floor stays fixed |
| `CHROMA` | near-monochrome | saturated | accent saturation, rarity colours, background tint |

| Preset | Reference feel | TENSION | DIEGESIS | DENSITY | CHROMA | Notes |
|---|---|---|---|---|---|---|
| **Operator** (default) | grounded military, Modern Warfare-like | 6 | 3 | 4 | 3 | White and grey type, warm amber accent, hairline frames, minimal motion |
| **Spartan** | armoured sci-fi, Halo-like | 5 | 7 | 5 | 6 | Visor-curved HUD edges, cyan accent, shield as a separate bar, holographic panels |
| **Arena** | fast competitive, bright | 8 | 2 | 6 | 8 | High-chroma acid accent, big numerals, quick, punchy motion |
| **Dread** | horror / stealth / survival | 9 | 6 | 2 | 2 | Warm desaturated palette, HUD hidden until needed, slow fades, heavy grain allowed in menus only |

Dials never override accessibility floors (section 12): minimum text size, contrast, flash limits and colour
redundancy hold in every theme.

---

## 3. Colour

### 3.1 Roles

| Token | Role | Never use for |
|---|---|---|
| `surface` | Opaque menu background | HUD over the world |
| `raised` | Panels, list rows, cards in menus | |
| `scrim` | Backing behind text blocks drawn over the world (86 % opacity) | Full-screen dimming in combat |
| `text` | Primary text and numerals | |
| `text2` | Secondary text, labels | Critical values |
| `text3` | Tertiary text on opaque surfaces only | Anything over the 3D world |
| `accent` | Brand/theme accent: focus fill, selected tab, primary action | Teams, damage, rarity |
| `friendly` | Teammates, friendly markers, own team score | Buttons, decoration |
| `enemy` | Enemies, enemy markers, enemy score | Own health, decoration |
| `objective` | Objectives, waypoints, neutral/contested points | Warnings |
| `warning` | Own state degraded: low ammo, damaged armour, overheating | Enemies |
| `critical` | Own state about to fail: low health, bleed-out, final seconds | Enemies, errors in menus without danger |
| `success` | Completed, captured, confirmed, revive done | Friendly team |
| `focus` | Focus ring / selection outline | |

Friendly is blue and enemy is orange by default, because red/green fails for about 8 % of men (protan and deutan colour
vision deficiency). Players can swap them. Friend and foe also always differ by shape (section 7.6).

### 3.2 Tokens (machine-read)

Values are sRGB hex. Every text/signal token is verified to meet WCAG 4.5:1 against: both surfaces, the scrim composited
over a pure-white and a pure-black scene, and the glyph halo. `text3` is held to 3:1 on opaque surfaces only, rarity
colours to 3:1 (they mark rules and pips, not text). Friendly, enemy and objective must stay at least ΔE 20 apart under
simulated protanopia, deuteranopia and tritanopia. Run `python scripts/check_contrast.py` after any change.

<!-- TOKENS:BEGIN -->
```json
{
  "halo": "#050708",
  "scrim_alpha": 0.86,
  "themes": {
    "operator": {
      "surface": "#0D1114", "raised": "#161C20", "scrim": "#080B0D",
      "text": "#F2F4F5", "text2": "#B9C1C6", "text3": "#8E989F",
      "accent": "#F2B33D", "friendly": "#4AA8FF", "enemy": "#FF6A3D", "objective": "#F5D547",
      "warning": "#FFB020", "critical": "#FF6464", "success": "#4FD48D", "focus": "#FFFFFF"
    },
    "spartan": {
      "surface": "#071318", "raised": "#0E1E25", "scrim": "#03100F",
      "text": "#E9FBFF", "text2": "#A9D3DC", "text3": "#7FA9B3",
      "accent": "#41E0E8", "friendly": "#5BB8FF", "enemy": "#FF7043", "objective": "#F7D84A",
      "warning": "#FFB547", "critical": "#FF6868", "success": "#5BE39B", "focus": "#FFFFFF"
    },
    "arena": {
      "surface": "#101015", "raised": "#1A1A22", "scrim": "#0A0A0F",
      "text": "#FFFFFF", "text2": "#C4C4D0", "text3": "#9696A6",
      "accent": "#C6FF3D", "friendly": "#4AA8FF", "enemy": "#FF5A5F", "objective": "#FFD23F",
      "warning": "#FFB020", "critical": "#FF6170", "success": "#4FD48D", "focus": "#FFFFFF"
    },
    "dread": {
      "surface": "#0B0B0A", "raised": "#151513", "scrim": "#050505",
      "text": "#E6E1D6", "text2": "#B3AD9F", "text3": "#8E897D",
      "accent": "#C9A66B", "friendly": "#6FB3E8", "enemy": "#EC7550", "objective": "#E8E0A8",
      "warning": "#E0A040", "critical": "#F26464", "success": "#6CC28E", "focus": "#FFFFFF"
    }
  },
  "rarity": {
    "common": "#B9C1C6", "uncommon": "#5FD08A", "rare": "#4DA3FF",
    "epic": "#B57CFF", "legendary": "#FFB23E", "mythic": "#FF5C8A"
  }
}
```
<!-- TOKENS:END -->

### 3.3 Rules

- **Over the world, text needs backing.** HUD glyphs drawn straight over the scene get a 2 px halo (outline) in `halo`
  plus a soft 4 px shadow at 50 %. Blocks of text (killfeed rows, prompts with more than three words, subtitles) sit on
  `scrim` at 86 %. A 60 % scrim over snow or sky drops coloured text to 2–3:1, so never go lighter than 86 %.
- **Non-text signals** (bars, markers, icons, focus rings) need 3:1 against what is behind them (WCAG 1.4.11). The halo
  gives this over any scene.
- **Accent budget:** under 10 % of screen pixels in menus, under 2 % on the HUD at rest.
- **Rarity** always ships with its name and a pip count (1–6), never colour alone.
- **Critical vs enemy** are both warm; keep them apart by context: `critical` only ever describes the player's own
  state, `enemy` only ever describes other players.
- **Colour-vision modes** (protan, deutan, tritan) swap the signal tokens for a tested set; shapes and labels never
  change. Do not apply full-screen colour filters to the HUD as the only option.
- **HDR:** author UI in sRGB, composite at paper-white 200–250 nits; the brightest HUD white must not exceed paper white.
  Expose a UI brightness slider separate from scene brightness.

---

## 4. Typography

### 4.1 Families (all SIL Open Font License)

| Theme | Display / numerals | Body / labels | Mono (telemetry, IDs) |
|---|---|---|---|
| Operator | Barlow Condensed SemiBold | Barlow Medium | JetBrains Mono |
| Spartan | Saira Condensed SemiBold | Saira Medium | JetBrains Mono |
| Arena | Chakra Petch Bold | Barlow Semi Condensed Medium | JetBrains Mono |
| Dread | IBM Plex Sans Condensed Medium | IBM Plex Sans | IBM Plex Mono |

Fallback for every theme: Noto Sans (and Noto Sans CJK / Arabic / Devanagari / Thai) with matching weight. Check the
display face covers every shipping language before you lock the theme; condensed faces often lack Cyrillic or Vietnamese.

Numerals use tabular figures (`tnum`) everywhere a number changes (ammo, timers, scores, damage), so digits do not jitter.

### 4.2 Scale

Sizes are in px at the 1920×1080 couch reference. Multiply by the platform factor (4.3).

| Token | Size | Weight | Case / tracking | Use |
|---|---|---|---|---|
| `num-hero` | 64 | Display SemiBold | — | Ammo in magazine, round timer, big score |
| `display` | 80 | Display SemiBold | Upper, +2 % | Match result, level up, mode title |
| `h1` | 56 | Display SemiBold | Upper, +3 % | Screen titles |
| `h2` | 40 | Display Medium | Upper, +4 % | Section and panel titles |
| `body` | 32 | Body Medium | Sentence | Descriptions, settings help, subtitles default |
| `label` | 28 | Body SemiBold | Upper, +6 % | Buttons, tabs, HUD labels, stat names |
| `small` | 26 | Body Medium | Sentence | Secondary info; hard floor at couch distance |

- **Hard minimum: 26 px at 1080p** at the default scale on console/TV. Nothing smaller ships on a TV build.
- Line length for body copy: 45–75 characters. Line height 1.3 for body, 1.1 for display.
- Uppercase only for short labels (≤ 3 words). Sentences stay in sentence case: uppercase paragraphs read 10–20 %
  slower.
- Localisation: German and Russian run ~30 % longer than English; every label box must survive +35 % width or wrap to
  two lines. Never shrink text below the floor to make it fit.

### 4.3 Platform factors

| Profile | Viewing | Factor | Notes |
|---|---|---|---|
| Couch | TV, 2.5–3 m | 1.00 | Reference |
| Desk | monitor, 0.6 m | 0.80 | Floor becomes 21 px; still offer the text-size slider |
| Handheld | 7–8 in, 800p | 1.15 relative to 1080p layout | Scale by physical size, not pixels |
| 4K | any | ×2 (resolution) | Lay out at 1080p, scale the canvas |

Text size setting: 80–200 % on top of the platform factor, applied live with a preview.

---

## 5. Space, shape and grid

- **Base unit 8 px**, half step 4 px. Spacing tokens: `s1 4`, `s2 8`, `s3 12`, `s4 16`, `s5 24`, `s6 32`, `s7 48`, `s8 64`.
- **Corners:** chamfer, not radius. `cut-s 6 px`, `cut-m 12 px`, `cut-l 20 px` at 45°, usually on one or two diagonal
  corners. Radius tokens exist for round things only (`round-full` for dots, ability rings).
- **Strokes:** `hair 1 px`, `rule 2 px`, `frame 3 px`. Focus ring is 3 px at 3:1 or better on both sides (section 9).
- **Brackets:** corner brackets 12–16 px long mark focus, lock-on and selected items. They imply the box without
  drawing it.
- **Menu grid:** 12 columns, 64 px outer margin inside title-safe, 24 px gutter at 1080p.
- **Elevation in menus** comes from surface step (`surface` → `raised`) and a 1 px top hairline at 8 % white, not drop
  shadows.

---

## 6. Layers and HUD architecture

### 6.1 Four layers

| Layer | Lives | Examples | Rule |
|---|---|---|---|
| Diegetic | In the world, seen by the character | Ammo counter on the gun, wrist map, visor cracks | Preferred when legible at gameplay FOV; always offer a screen fallback |
| Spatial | In 3D space, not seen by the character | Waypoints, ping markers, revive radius, outline on teammates | Distance-scaled, occlusion-aware, clamped to screen edges |
| Meta | On screen, representing the character's state | Damage vignette, low-health desaturation, hit direction | Intensity capped and adjustable; never blocks the reticle |
| Non-diegetic | Flat on screen | Health bar, killfeed, scoreboard, menus | Anchored to safe-zone edges |

### 6.2 Safe zones

- Title-safe: inner 90 % of the screen. All HUD text and critical icons live here.
- Action-safe: inner 93 %. Decorative frames may reach it.
- HUD edge offset setting: 0–10 % extra inset, saved per display.
- Ultrawide: HUD clamps to a 16:9 or 21:9 region by player choice; only the reticle and spatial markers use the full width.

### 6.3 HUD map (16:9)

```
+--------------------------------------------------------------------------+
| [compass / objective strip — top centre]                    [score/time] |
| [minimap / radar                                            [killfeed    |
|  top-left]                                                   top-right]  |
|                                                                          |
| [notification column            ( reticle )         [medals / callouts |
|  left, mid-height]          hitmarkers, damage arcs      right, mid]     |
|                                                                          |
|                        [interaction prompt — below centre]               |
| [squad status]                                                           |
| [health / armour / shield   bottom-left]     [ammo, weapon, equipment    |
|                                               bottom-right]              |
+--------------------------------------------------------------------------+
```

Glance priority, highest first: reticle and hit feedback (centre) → own health/shield → ammo → objective/compass →
squad → score/time → killfeed → notifications. Higher priority sits nearer the centre or the bottom corners.

### 6.4 Density presets

| Preset | Shows by default |
|---|---|
| Minimal | Reticle, hit feedback, health when not full, ammo when not full, objective markers |
| Standard (default) | + compass, minimap, killfeed, score, squad |
| Full | + damage numbers, cooldown numbers, ping numbers, frame/net stats |

Each module also has its own toggle and opacity (0–100 %). Dynamic HUD (fade modules at rest after 3 s) is on by default
for DENSITY ≤ 4 and always switchable off.

---

## 7. HUD components

Each component lists anatomy, states, when to use and what to avoid. Sizes are 1080p couch reference.

### 7.1 Reticle

- Anatomy: centre dot (2–4 px), optional crosshair arms (8–14 px, 2 px stroke, halo), spread indicator.
- States: idle, on-friendly (shape stays, friendly tint), on-enemy (enemy tint + 10 % scale), out-of-range (dims to
  60 %), ADS (hidden for optics), reloading (arms retract).
- Options: colour, size 50–200 %, opacity, shape library (dot, cross, circle, chevron), centre dot always available for
  motion-sick players.
- Do not animate the reticle at rest. Do not put any other element within 120 px of centre except hit feedback.

### 7.2 Hit feedback

- Hitmarker: four diagonal ticks around centre, 120 ms in, 200 ms out. Headshot: larger + tone change. Kill: distinct
  shape (closed X) + distinct sound.
- Damage numbers (optional, off in Operator/Dread): float 24 px up over 600 ms, tabular figures, critical hits in
  `warning`.
- Always pair with sound; offer haptic.

### 7.3 Damage direction

- Arc segments on a ring around the reticle (radius 180–240 px), pointing toward the source, 1.2 s fade.
- Intensity proportional to damage; max opacity 80 %.
- Off-screen threats beyond 90°: arc at the ring edge, never a full-screen red flash.

### 7.4 Health, armour, shield

- Bottom-left, segmented bar: segments make loss readable at a glance (e.g. 1 segment = 25 HP or one armour plate).
- Full: `text2` at low opacity (dynamic HUD may hide). Damaged: `warning` segment edge. Critical (≤ 25 %): `critical`
  fill + slow pulse (1 Hz) + heartbeat audio + optional haptic.
- Shield (Spartan): separate bar above health, `accent` tint, breaks with a crack shape, not just colour.
- Numbers optional beside the bar in tabular figures.
- Do not tint the whole screen red as the only low-health cue; the vignette is capped at 40 % and adjustable.

### 7.5 Ammo and equipment

- Bottom-right: magazine count `num-hero`, reserve `label` in `text2`, weapon name `label`, fire mode icon.
- Low ammo (≤ 25 % mag): number turns `warning` and a short "Low ammo" label appears once. Empty: `critical`, label
  "Reload", the prompt glyph for the reload input.
- Equipment/abilities: square or round slots with cooldown sweep (clockwise fill), input glyph under each, count badge.
  Ready state: brief 180 ms brighten + sound, then static.

### 7.6 Markers and pings

- Shapes carry meaning, colours confirm it:
  - Friendly: chevron/diamond, `friendly`.
  - Enemy: inverted triangle, `enemy`.
  - Objective: square with letter (A/B/C), `objective`; contested shows split fill.
  - Ping: circle with type icon (enemy spotted, loot, go here), colour by type, owner name on focus.
- Size: 24–40 px, scaled by distance between near/far limits; distance label in metres, tabular, ≥ `small`.
- Off-screen: clamp to the title-safe ellipse with a pointer toward the target.
- Occluded: draw at 50 % opacity with a dashed outline.
- Cap simultaneous markers (e.g. 12); prioritise by threat and distance; merge clusters.

### 7.7 Compass and minimap

- Compass strip: 600–800 px wide, top centre, ticks every 15°, cardinal letters `label`, heading in degrees optional.
  Markers ride the strip using the same shapes as 7.6.
- Minimap: 220–280 px, top-left, north-up or rotate (player option), player arrow always centre, enemy pings decay over
  their reveal time. Zoom levels by mode.

### 7.8 Killfeed and callouts

- Top-right column, max 5 rows, each row on `scrim`. Format: `[attacker] [weapon icon] [victim]`, names in team colour,
  the local player's rows highlighted with a 2 px `accent` left rule.
- Row life 5 s, slide in 120 ms, fade out 200 ms. Long names truncate with an ellipsis at 16 characters.
- Medals/callouts: right side, mid-height, icon + `label`, one at a time, queue the rest, never cover the killfeed.

### 7.9 Interaction prompt

- Below centre: input glyph + verb + object ("[X] Revive Kade"). Hold actions show a radial fill around the glyph and
  can be set to toggle/press in settings.
- Appears after 100 ms of aim/proximity to avoid flicker; hides at once when out of range.

### 7.10 Notifications

- Left column, mid-height, max 3, each 3–5 s. Categories: objective, team, system. Same shape language as the rest.
- Critical system messages (disconnect, kick vote) go in a top-centre banner on `scrim`, never a modal mid-combat.

### 7.11 Scoreboard (hold)

- Opens on hold (or toggle), dims the world to 70 % with `scrim`, keeps the HUD reticle visible.
- Two team blocks side by side or stacked; columns: rank, player, score, K/D/A or mode stat, ping/connection bars.
- Local player row: `accent` left rule + `raised` fill. Squad members: small squad marker.
- Read-only by default; focusing a row (bumper/mouse) offers profile, mute, report.

---

## 8. Front-end components

### 8.1 Screen frame

Every menu screen has: title (`h1`) top-left, tab bar under it (bumper glyphs at both ends), content, and a footer action
bar bottom-right listing the active inputs ("[A] Select [B] Back [Y] Inspect"). Back always works and always goes up one
level. Esc/B never quits the game.

### 8.2 Buttons

| Type | Look | When |
|---|---|---|
| Primary | `accent` fill, `surface`-coloured label, `cut-s` on one corner | One per screen: the main next step ("Find match", "Equip") |
| Secondary | 2 px `text2` frame, `text` label | Other actions |
| Quiet | Label only, bracket on focus | Tertiary actions, footer items |
| Destructive | Secondary look + `critical` label; **hold to confirm** (1 s) | Delete loadout, leave party, refund |

All buttons: min 48 px tall at 1080p (64 px on TV builds), label `label` token, input glyph inside or beside on
controller. Disabled buttons stay visible with a reason ("Unlocks at level 12"), never disappear.

### 8.3 Lists, tabs and cyclers

- Vertical lists for settings; each row is label left, control right, help text for the focused row in a fixed panel.
- Cyclers (‹ value ›) instead of dropdowns on controller; dropdowns allowed on PC.
- Tabs: max 7 per bar; overflow becomes a second level, never horizontal scrolling tabs.

### 8.4 Loadout and inventory

- Grid of item tiles (chamfered, 1:1 or 2:1), rarity rule on the bottom edge + pip count, name `label`, small stat line.
- Focused tile: brackets + `raised` lift + preview of the item in 3D on the right.
- Compare: stat bars show current vs candidate with the delta in numbers ("+12") and arrows; better is never shown by
  green alone.
- New items: dot badge until focused once. Badges are cleared by viewing, not by a separate "mark all read" chore.

### 8.5 Progression

- XP bar: thin, full-width or under the player card, segmented per level, gains animate as one fill over 600–900 ms
  with a count-up.
- Unlocks: one card per unlock, queued, each skippable; summarise when there are more than 5.

### 8.6 Store

- Price shown in real currency equivalent where the platform allows; bundle contents listed in full; time-limited
  offers show the actual end time, not a fake countdown loop.
- Purchase requires a confirm step with the final price. No pre-selected add-ons.

### 8.7 Settings

- Categories: Gameplay, Controls, Accessibility (its own top-level tab, never buried), Audio, Video, Interface, Account.
- Every setting: name, current value, one-sentence help, live preview where visual. Restore defaults per category.
- First launch: brightness, subtitles, text size, and colour-vision mode before the first menu.

### 8.8 Modals

- Use only for decisions that block progress (quit with unsaved changes, purchase). Never in combat.
- Title says the decision ("Leave the match?"), body says the consequence, buttons say the outcome ("Leave", "Stay"),
  never "OK/Cancel". Default focus on the safe option.

### 8.9 Loading and matchmaking

- Loading: mode + map name, objective summary, one gameplay tip, progress that moves. Inputs to cancel/back stay live.
- Matchmaking: elapsed time, estimated time when known, party status, cancel always available.

---

## 9. Input and focus

- **Controller first, mouse equal.** Every screen is fully usable with D-pad/stick + A/B, with mouse + keyboard, and
  (where shipped) with touch. No action exists only on hover.
- **Focus:** exactly one focused element, always visible: 3 px `focus` ring or corner brackets, plus `raised` fill. On
  entering a screen, focus lands on the most likely action, or the last focused item when returning.
- Navigation follows the visual grid; stick wraps on lists only. Hold-to-repeat after 400 ms at 8 steps/s.
- **Glyphs** switch to the last-used device within one frame, using the platform's official glyph set. Remapped inputs
  show the remapped glyph.
- **Hold vs toggle:** every hold (sprint, aim, scoreboard, interact, destructive confirm) has a toggle option.
- **Timing:** no menu action needs a press under 300 ms; quick-time prompts offer a slower option or auto-complete.
- Touch: targets ≥ 48 dp, thumb zones at the lower corners, no essential gesture beyond tap/drag.

---

## 10. Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `t-instant` | 0 ms | — | Reduced motion substitute, value changes in combat |
| `t-micro` | 80 ms | out-quad | Hit tick in, glyph swap |
| `t-fast` | 120 ms | out-cubic | Killfeed row in, focus move |
| `t-base` | 180 ms | out-cubic | Panel open, tab change |
| `t-slow` | 280 ms | in-out-cubic | Screen transition, scoreboard |
| `t-reward` | 600–900 ms | out-expo | XP fill, unlock reveal (skippable) |

Rules:
- HUD motion only reports a change of state. Nothing on the HUD loops at rest. Pulses are reserved for `critical` and run
  at ≤ 1 Hz.
- Transitions must not delay input: the next screen accepts input from its first frame.
- Camera shake and weapon sway are world effects; the HUD does not shake with them (option: 0–100 % HUD motion).
- **Reduced motion** (setting, default from OS where available): slides become fades, scale pops become instant, parallax
  and screen-space distortion off, reward animations collapse to a single 180 ms fade.
- **Flashes:** nothing flashes more than 3 times per second; large saturated red flashes are banned (WCAG 2.3.1). Run
  the Harding FPA (or equivalent) test on trailers and flash-heavy effects.

---

## 11. Sound and haptics pairing

| Event | Visual | Sound | Haptic |
|---|---|---|---|
| Hit / headshot / kill | Hitmarker shapes | Distinct tones per tier | Short tick (optional) |
| Taking damage | Direction arc | Impact + direction | Rumble on damage side |
| Low health | Bar `critical` + pulse | Heartbeat, muffled mix | Slow pulse |
| Low / empty ammo | `warning` / `critical` numerals | Click, empty fire | — |
| Ability ready | 180 ms brighten | Ready chime | Single tap |
| Objective change | Marker state + notification | Announcer line + stinger | — |
| Enemy spotted (ping) | Marker | Ping tone + callout voice | — |

Every row has at least two channels. Every sound-only cue has a visual option (e.g. footstep/gunfire direction indicator),
for deaf and hard-of-hearing players.

---

## 12. Accessibility

Floors that no theme may lower:

| Area | Requirement |
|---|---|
| Text size | ≥ 26 px at 1080p on TV builds by default; text-size slider 80–200 % |
| Contrast | Text 4.5:1 on every backing it can appear on (section 3.2); non-text signals 3:1 (WCAG 1.4.3, 1.4.11) |
| Colour | Never the only carrier of meaning; friendly/enemy/objective differ by shape; rarity has names and pips; colour-vision presets + custom colour pickers for team, enemy and reticle |
| Subtitles | On by default at first-launch prompt; default size `body` (32 px) with presets up to 64 px; speaker names in their own colour + name; background scrim at 86 %, adjustable; max 2 lines, ~38 characters per line; direction indicators for off-screen speakers |
| Motion | Reduced-motion mode; HUD motion slider; camera shake and head bob sliders; centre dot option |
| Flashes | ≤ 3 per second; photosensitivity warning only as a supplement, not a fix |
| Input | Full remapping (controller and keyboard), hold/toggle for every hold, aim-assist and stick dead-zone options |
| Timing | Adjustable or removable time limits in menus and non-competitive content |
| Audio | Separate volume for music, effects, voice, UI; mono audio; visual sound indicators |
| Narration | Menu screen-reader/narration (platform TTS) for every focusable element: name, value, state, hint |
| Cognitive | Consistent layout, objective reminder on demand, tutorial replay, plain-language text (grade 7–8) |

Process: test with players with disabilities before beta; run contrast and flash tests on every build that changes UI;
treat accessibility bugs with the same severity scale as functional bugs.

---

## 13. What to do and when (by game state)

| State | HUD | Do | Don't |
|---|---|---|---|
| Spawn / match start | Full HUD fades in over 280 ms; objective callout once | Show mode objective in one line; show loadout name | Block the view with a full-screen intro on respawn |
| Moving, no contact | Dynamic HUD fades modules at rest | Keep compass and objective markers | Animate idle elements |
| Combat | Reticle, hit feedback, health, ammo at full contrast | Raise contrast of what changed; queue non-urgent notifications | Show modals, medals over the reticle, store prompts |
| Low health | `critical` health + heartbeat + vignette ≤ 40 % | Point to cover/heal input glyph | Desaturate the whole screen beyond the player's setting |
| Downed / bleed-out | Timer `critical`, revive prompt for others | Show who is coming to revive, distance, give-up hold input | Hide the killer info |
| Dead / killcam | Killer card: name, weapon, distance, their health left | Skip input visible; respawn timer | Autoplay a store offer |
| Spectating | Spectated player HUD + "Spectating [name]" banner | Bumpers switch player | Show the spectator's own ammo |
| Round/match end | Result `display`, score, then progression queue | Let players skip each card; show the next action | Force 30 s of unskippable rewards |
| Lobby / party | Party list, readiness, mode, loadout | Show voice/mute state per member | Hide the leave-party action |
| Menus | Screen frame (8.1) | Remember last focus; show inputs in footer | Nest menus deeper than 3 levels |
| Store | Prices, contents, end times | Confirm with final price | Fake scarcity timers, pre-selected extras |
| Settings | Category list + help panel + preview | Apply instantly with revert for video changes (15 s countdown) | Bury accessibility options |
| Pause (single-player) | World dimmed via scrim, game paused | Resume as focused default | Pause in online play (offer a menu that does not pause) |
| Error / disconnect | Banner in combat; modal in menus with a retry | Say what happened and what to do next | Show raw error codes alone |

---

## 14. Theming and token architecture

Three tiers:

1. **Primitives:** raw values (`amber-400 #F2B33D`). Never referenced by components.
2. **Semantic tokens:** roles from section 3 (`accent`, `enemy`, `critical`), type and motion tokens. Themes override
   only this tier.
3. **Component tokens:** `hud.health.fill.critical → critical`, `button.primary.bg → accent`. Change these only to give
   one component an exception, and write the reason next to it.

A theme file may change: colours (within the contrast check), font families (within coverage), chamfer sizes, stroke
weights, motion speed multiplier (0.75–1.25), texture overlays in menus, sound set, DIEGESIS framing.

A theme file may not change: signal meanings, marker shapes, HUD positions, minimum sizes, flash limits, focus
visibility, input behaviour.

Adding a theme: copy a preset in the token block, adjust, run `python scripts/check_contrast.py <theme>`, then capture
the pre-flight screenshots (section 16) on the brightest and darkest map.

---

## 15. Engine handoff

- **Units:** author at 1920×1080; scale the canvas by height (`scale = screen_height / 1080 × platform factor × text size`).
  On ultrawide, keep height-based scale and clamp the HUD region (6.2).
- **Tokens:** export the JSON block to:
  - Unity UI Toolkit: USS variables (`--field-accent`) in a theme stylesheet per preset; swap at runtime.
  - Unreal UMG + CommonUI: a `UDataAsset` per theme with linear colours (convert sRGB → linear), `UCommonTextStyle` per
    type token, `UCommonButtonStyle` per button type; input glyphs through CommonInput.
  - Godot: a `Theme` resource per preset; type tokens as theme type variations.
- **Fonts:** SDF/MSDF atlases with outline support for the halo; enable tabular figures; build atlases per language.
- **Shapes:** chamfers as 9-slice sprites or a shared SDF panel shader (cut size, stroke, fill as parameters) so themes
  change shape without new art.
- **Performance budget (HUD, 1080p, mid-range console):** ≤ 1 ms GPU, ≤ 0.5 ms CPU per frame; ≤ 40 draw calls; no
  layout rebuilds per frame for static modules; batch markers; cap overdraw from scrims.
- **Naming:** `hud/<module>/<part>`, `fe/<screen>/<part>`; component tokens mirror these paths.

---

## 16. Pre-flight checklist

Before a screen or HUD module ships:

- [ ] `python scripts/check_contrast.py` passes for every shipped theme.
- [ ] Screenshot on the brightest (snow/sky) and darkest map: every HUD glyph readable with halo/scrim.
- [ ] 1080p TV at 3 m: smallest text ≥ 26 px, read by someone who did not build it.
- [ ] Colour-vision check in the script passes (ΔE ≥ 20 for friend/enemy/objective, protan/deutan/tritan) and screenshots through a CVD filter show rarity still readable by name and pips.
- [ ] Reduced motion on: no slides, pops or parallax remain; no element flashes > 3/s.
- [ ] Controller only, mouse only, (touch only): every action reachable; focus always visible; Back always works.
- [ ] Glyphs switch correctly on device change and after remapping.
- [ ] German and Russian strings fit without going under the type floor.
- [ ] Narration reads name, value and state for every focusable element.
- [ ] No modal, store prompt or medal can cover the reticle in combat.
- [ ] HUD within performance budget.

---

## 17. Agent prompt guide

When an AI agent builds UI from this file:

1. State the design read in one line first: "Building `<screen/module>` for `<game state>`, theme `<preset>`, dials
   `TENSION/DIEGESIS/DENSITY/CHROMA = a/b/c/d`."
2. Use only semantic tokens from section 3 and type tokens from section 4. If a value is missing, add a component token
   with a reason; do not inline hex values.
3. Place HUD modules only in the zones of section 6.3; menus use the screen frame of 8.1.
4. For every state the component has (section 7/8), produce it: idle, focused, pressed, disabled, warning, critical as
   applicable.
5. Run the pre-flight checklist and report each item as pass/fail with evidence (screenshot or command output).

Do not produce: rounded SaaS cards, gradient buttons, glassmorphism over gameplay, centred marketing layouts, emoji as
icons, colour-only status, idle HUD animation, or text below the floor.

Example prompt:

> Build the bottom-right ammo and equipment module for theme Arena, DENSITY 6. States: full, low (≤ 25 %), empty,
> reloading, equipment cooling down and ready. Controller and keyboard glyphs. Tabular figures. Verify contrast with
> the halo and attach screenshots on the snow and night maps.

---

### Sources and references

- WCAG 2.2 — 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast, 2.3.1 Three Flashes.
- Game Accessibility Guidelines (gameaccessibilityguidelines.com) and Xbox Accessibility Guidelines (text display,
  subtitles, input, audio, photosensitivity).
- Screen and HUD catalogues: interfaceingame.com (Call of Duty: Modern Warfare, Halo Infinite), gameuidatabase.com.
- Format: DESIGN.md structure (awesome-design-md); review heuristics from Vercel Web Interface Guidelines, Impeccable
  and Taste Skill anti-pattern lists, adapted for games.
