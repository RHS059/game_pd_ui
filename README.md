# game_pd_ui

**FIELD** — an accessible, themable UI design system for 3D shooters (HUD + front end), based on modern FPS patterns.

- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — the deliverable: principles, mood dials and four themes (Operator, Spartan,
  Arena, Dread), colour/type/space/motion tokens, HUD architecture, components, input, accessibility floors,
  what to do in each game state, engine handoff (Unity, Unreal, Godot), pre-flight checklist, agent prompt guide.
- `scripts/check_contrast.py` — reads the token block in DESIGN_SYSTEM.md; checks WCAG contrast on every backing
  (incl. worst-case bright scene) and friend/enemy/objective separation under protan/deutan/tritan simulation.
- `scripts/build_specimen.py` — renders `specimen/index.html` (sample HUD per theme on snow and night scenes);
  `specimen/specimen.png` is the current capture.

```
python scripts/check_contrast.py      # exit 0 = pass
python scripts/build_specimen.py
```
