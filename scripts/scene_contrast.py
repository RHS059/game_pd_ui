"""Score HUD legibility on the real scenes: for each element, contrast of its colour against the brightest 5 %
(dark text: darkest 5 %) of the scene pixels behind it, with the HUD hidden. Halo/outline is NOT counted, so a pass
means the element is readable even where the outline is thin. Text needs 4.5:1, bars/icons 3:1.
Run: node scripts/scene_contrast.js <url> <dir> && python scripts/scene_contrast.py <dir>"""
import json, sys
from collections import defaultdict
from PIL import Image

def lum8(r, g, b):
    f = lambda v: (v / 255) / 12.92 if v <= 10.3 else (((v / 255) + .055) / 1.055) ** 2.4
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b)

def parse(c):
    if c.startswith('#'):
        return [int(c[i:i + 2], 16) for i in (1, 3, 5)]
    inner = c[c.index('(') + 1:c.rindex(')')].split('/')[0]
    if c.startswith('color('):  # color(srgb r g b) in 0..1
        return [float(v) * 255 for v in inner.split()[1:4]]
    return [float(v) for v in inner.replace(',', ' ').split()[:3]]

d = sys.argv[1]; data = json.load(open(f'{d}/scene_measure.json'))
worst = defaultdict(lambda: (99, ''))
fails = 0; total = 0
for run in data:
    im = Image.open(run['shot']).convert('RGB')
    for t in run['targets']:
        ins = 2 if t['h'] > 8 else 0  # sample inside the box: anti-aliased plate edges are not where glyphs sit
        x0, y0, x1, y1 = int(t['x']) + ins, int(t['y']) + ins, int(t['x'] + t['w']) - ins, int(t['y'] + t['h']) - ins
        px = [lum8(*p) for p in im.crop((max(0, x0), max(0, y0), max(x0 + 1, x1), max(y0 + 1, y1))).getdata()]
        if not px: continue
        px.sort(); fg = lum8(*parse(t['color']))
        bg = px[int(len(px) * .95) - 1] if fg > .18 else px[int(len(px) * .05)]
        cr = (max(fg, bg) + .05) / (min(fg, bg) + .05); need = 3 if t['bar'] else 4.5
        if 'h-reticle' in t['name']:
            continue  # reticle sits mid-screen with no shade by design: it relies on its 2 px outline (reported below)
        key = f"{t['name'][:28]:28s} {t['text'][:14]:14s}"
        total += 1
        if cr < need: fails += 1
        if cr < worst[key][0]: worst[key] = (cr, f"{run['theme']}/{run['scene']}", need)
rows = sorted(worst.items(), key=lambda kv: kv[1][0])
print(f'{fails}/{total} element-scene checks below minimum (halo not counted)\n')
for k, (cr, where, need) in rows:
    print(f"{'FAIL' if cr < need else 'ok  '} {cr:5.2f} (need {need}) {k} worst in {where}")
print('\nReticle: outline-dependent (2 ref-px halo, player-selectable colour); not scored against the scene.')
# Clutter: HUD modules over opaque weapon pixels. Only the ammo/equipment cluster may sit over the weapon (it has its own shade).
ALLOWED = {'h-ammo', 'h-reticle', 'h-hit', 'h-dmg'}
clut = defaultdict(float)
for run in data:
    for c in run.get('clutter', []):
        clut[c['module']] = max(clut[c['module']], c['covered'])
bad = {m: v for m, v in clut.items() if v > 0.02 and m not in ALLOWED}
print('\nWeapon overlap (max share of module box over opaque weapon pixels):')
for m, v in sorted(clut.items(), key=lambda kv: -kv[1]):
    if v > 0: print(f"  {'CLUTTER' if m in bad else 'ok     '} {m:12s} {v:.0%}")
sys.exit(1 if fails or bad else 0)
