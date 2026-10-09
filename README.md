# game_pd_ui

**FIELD** — an accessible, themable UI design system for 3D shooters (HUD + front end), based on modern FPS patterns.

- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — the deliverable: principles, mood dials and four themes (Operator, Spartan,
  Arena, Dread), colour/type/space/motion tokens, HUD architecture, components, input, accessibility floors,
  what to do in each game state, engine handoff (Unity, Unreal, Godot), pre-flight checklist, agent prompt guide.
- `index.html` + `showcase.css` + `showcase.js` — live showcase of every HUD and front-end element (GitHub Pages
  root). Theme, location + time of day, colour-vision simulation, controller/keyboard glyphs, text size and
  reduced motion are switchable; HUD events (hit, kill, damage, reload, ability, ping, capture, scoreboard) are live.
  Colours load from `tokens.json` (`python scripts/export_tokens.py` after editing the spec).
- `scenes/` — 10 gameplay backgrounds (urban city, grassy field, desert, forest, beach town × day/night), generated with
  Krea 2 Turbo, first-person eye level, no HUD/text, saved as 1376×768 JPEG.
- `weapon/` — day/night first-person arms + rifle cut-outs (Krea, transparent WebP) composited under the HUD.
- `scripts/scene_contrast.js` + `.py` — renders the HUD over all 10 scenes × 4 themes with the weapon, scores every
  element against the real pixels behind it (halo not counted) and flags HUD modules that sit on the weapon.
- `scripts/check_contrast.py` — reads the token block in DESIGN_SYSTEM.md; checks WCAG contrast on every backing
  (incl. worst-case bright scene) and friend/enemy/objective separation under protan/deutan/tritan simulation.
- `scripts/build_specimen.py` — renders `specimen/index.html` (sample HUD per theme on snow and night scenes);
  `specimen/specimen.png` is the current capture.

```
python scripts/check_contrast.py      # exit 0 = pass
python scripts/build_specimen.py
```
