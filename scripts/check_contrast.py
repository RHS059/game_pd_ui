"""Verify the colour tokens in DESIGN_SYSTEM.md (read from its TOKENS block): WCAG contrast of every text/signal token against
(a) the solid surfaces and (b) the HUD backing scrim (86 % opacity) composited over the worst-case scene (pure white and pure black), and
(c) the glyph halo (outline) used for HUD text drawn straight over the world. text3 is menu-only (opaque surfaces).
Run: python scripts/check_contrast.py [theme]   (exit 1 if any required pair fails)"""
import json, sys
from pathlib import Path

DOC = Path(__file__).resolve().parents[1] / 'DESIGN_SYSTEM.md'
_raw = DOC.read_text().split('<!-- TOKENS:BEGIN -->')[1].split('<!-- TOKENS:END -->')[0]
TOKENS = json.loads(_raw.split('```json')[1].split('```')[0])
THEMES = {n: {**t, 'scrim': (t['scrim'], TOKENS['scrim_alpha'])} for n, t in TOKENS['themes'].items()}
HALO = TOKENS['halo']  # 2 px outline + soft shadow behind every HUD glyph drawn over the world
TEXT = ['text', 'text2', 'text3', 'accent', 'friendly', 'enemy', 'objective', 'warning', 'critical', 'success', 'focus']
MIN = {'text3': 3.0}  # text3 is large-text/secondary only; everything else is held to 4.5


def rgb(h): h = h.lstrip('#'); return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
def lum(c): return sum(w * (v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4) for w, v in zip((0.2126, 0.7152, 0.0722), c))
def ratio(a, b): la, lb = sorted((lum(a), lum(b)), reverse=True); return (la + 0.05) / (lb + 0.05)
def over(top, alpha, bottom): return [alpha * t + (1 - alpha) * b for t, b in zip(top, bottom)]


# Colour-vision simulation in linear sRGB: protan/deutan per Vienot et al. 1999, tritan per Machado et al. 2009 (severity 1).
CVD = {'protan': [[0.11238, 0.88762, 0], [0.11238, 0.88762, 0], [0.00401, -0.00401, 1]],
       'deutan': [[0.29275, 0.70725, 0], [0.29275, 0.70725, 0], [-0.02234, 0.02234, 1]],
       'tritan': [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]]}
PAIRS = [('friendly', 'enemy'), ('friendly', 'objective'), ('enemy', 'objective')]
MIN_DE = 20  # CIE76 delta-E: clearly different at a glance


def lin(c): return [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
def lab(l):
    x = 0.4124 * l[0] + 0.3576 * l[1] + 0.1805 * l[2]; y = 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]
    z = 0.0193 * l[0] + 0.1192 * l[1] + 0.9505 * l[2]
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x / 0.9505), f(y), f(z / 1.089)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))
def sim(h, m): l = lin(rgb(h)); return [max(0, min(1, sum(m[i][j] * l[j] for j in range(3)))) for i in range(3)]
def de(a, b): return sum((p - q) ** 2 for p, q in zip(a, b)) ** .5


def check(name, t):
    fails, rows = [], []
    s_hex, a = t['scrim']
    backs = {'surface': rgb(t['surface']), 'raised': rgb(t['raised']),
             'scrim/white-scene': over(rgb(s_hex), a, [1, 1, 1]), 'scrim/black-scene': over(rgb(s_hex), a, [0, 0, 0]),
             'halo': rgb(HALO)}
    for k in TEXT:
        # text3 is menu-only: never placed over the 3D world, so only opaque surfaces apply.
        r = {b: ratio(rgb(t[k]), v) for b, v in backs.items() if k != 'text3' or b in ('surface', 'raised')}
        need = MIN.get(k, 4.5)
        worst = min(r.values())
        rows.append((k, t[k], r, worst >= need, need))
        if worst < need:
            fails.append(f'{name}.{k} {t[k]} worst {worst:.2f} < {need}')
    print(f'\n## {name}\n| token | hex | ' + ' | '.join(backs) + ' | min |\n|---|---|' + '---|' * len(backs) + '---|')
    for k, h, r, ok, need in rows:
        print(f"| {k} | {h} | " + ' | '.join(f'{r[b]:.2f}' if b in r else 'n/a' for b in backs) + f" | {'ok' if ok else 'FAIL'} ≥{need} |")
    # signal pairs that must be told apart by more than hue
    fe = ratio(rgb(t['friendly']), rgb(t['enemy']))
    print(f'friendly vs enemy luminance ratio: {fe:.2f} (shape + label carry the difference; colour alone never does)')
    for cvd, m in [('normal', [[1, 0, 0], [0, 1, 0], [0, 0, 1]])] + list(CVD.items()):
        ds = {f'{a}/{b}': de(lab(sim(t[a], m)), lab(sim(t[b], m))) for a, b in PAIRS}
        print(f'{cvd:7s} ' + '  '.join(f'{k} dE {v:.0f}' for k, v in ds.items()))
        fails += [f'{name} {cvd} {k} dE {v:.1f} < {MIN_DE}' for k, v in ds.items() if v < MIN_DE]
    for k, h in TOKENS['rarity'].items():  # non-text (rules, pips): 3:1 on opaque surfaces
        w = min(ratio(rgb(h), backs['surface']), ratio(rgb(h), backs['raised']))
        if w < 3:
            fails.append(f'{name}.rarity.{k} {h} worst {w:.2f} < 3.0')
    return fails


if __name__ == '__main__':
    names = sys.argv[1:] or list(THEMES)
    fails = [f for n in names for f in check(n, THEMES[n])]
    print('\nFAIL:\n' + '\n'.join(fails) if fails else '\nPASS: every text/signal token meets its minimum on every backing')
    sys.exit(1 if fails else 0)
