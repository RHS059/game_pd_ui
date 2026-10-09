"""Render specimen/index.html: a sample HUD per theme over a worst-case bright scene and a dark scene,
using only the tokens in DESIGN_SYSTEM.md. Used for the pre-flight screenshot check."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / 'DESIGN_SYSTEM.md').read_text().split('<!-- TOKENS:BEGIN -->')[1].split('<!-- TOKENS:END -->')[0]
T = json.loads(raw.split('```json')[1].split('```')[0])
FONTS = {'operator': ('Barlow Condensed', 'Barlow'), 'spartan': ('Saira Condensed', 'Saira'),
         'arena': ('Chakra Petch', 'Barlow Semi Condensed'), 'dread': ('IBM Plex Sans Condensed', 'IBM Plex Sans')}
SCENES = {'snow': 'linear-gradient(180deg,#ffffff 0%,#eef3f7 55%,#dfe7ee 100%)',
          'night': 'linear-gradient(180deg,#05070a 0%,#0b1016 60%,#141a20 100%)'}


def hud(name, t, scene):
    d, b = FONTS[name]
    v = ';'.join(f'--{k}:{c}' for k, c in t.items()) + f";--halo:{T['halo']};--scrim-a:{T['scrim_alpha']}"
    return f'''<section class="frame" style="{v};background:{SCENES[scene]};--fd:'{d}';--fb:'{b}'">
 <div class="tag">{name} · {scene}</div>
 <div class="compass"><span>NW</span><span class="m obj">◆A</span><span>N</span><span class="m en">▼</span><span>NE</span></div>
 <div class="feed"><div class="row"><b class="fr">KADE</b> ⟶ <b class="en">VOSS</b></div><div class="row me"><b class="fr">YOU</b> ⟶ <b class="en">RAIN</b></div></div>
 <div class="reticle"></div>
 <div class="prompt"><kbd>X</kbd> Revive Kade</div>
 <div class="health"><div class="lbl">HEALTH</div><div class="bar"><i></i><i></i><i class="crit"></i><i class="off"></i></div><div class="crit-t">CRITICAL</div></div>
 <div class="ammo"><div class="mag">07</div><div class="res">/ 120</div><div class="low">LOW AMMO</div><div class="wpn">M4 · AUTO</div></div>
 <div class="sub"><b class="fr">Kade:</b> Two on the roof, moving to B.</div>
</section>'''


css = '''
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@500;600&family=Barlow+Condensed:wght@600&family=Barlow+Semi+Condensed:wght@500&family=Chakra+Petch:wght@700&family=IBM+Plex+Sans+Condensed:wght@500&family=IBM+Plex+Sans:wght@500&family=Saira+Condensed:wght@600&family=Saira:wght@500&display=swap');
body{margin:0;background:#000;display:grid;grid-template-columns:1fr 1fr;gap:4px}
.frame{position:relative;aspect-ratio:16/9;overflow:hidden;font-family:var(--fb);color:var(--text);font-size:14px}
.frame *{text-shadow:0 0 1px var(--halo),0 0 2px var(--halo),0 0 3px var(--halo),0 2px 4px rgba(0,0,0,.5)}
.tag{position:absolute;left:8px;top:6px;font:600 11px var(--fb);letter-spacing:.08em;text-transform:uppercase;color:var(--text)}
.compass{position:absolute;top:5%;left:50%;transform:translateX(-50%);display:flex;gap:18px;font:600 15px var(--fd);letter-spacing:.06em}
.obj{color:var(--objective)}.en{color:var(--enemy)}.fr{color:var(--friendly)}
.feed{position:absolute;right:5%;top:12%;display:grid;gap:3px}
.row{background:color-mix(in srgb,var(--scrim) calc(var(--scrim-a)*100%),transparent);padding:3px 8px;font:600 13px var(--fd);letter-spacing:.04em}
.row.me{box-shadow:inset 2px 0 0 var(--accent)}
.reticle{position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px;background:var(--text);border-radius:50%;box-shadow:0 0 0 2px var(--halo)}
.prompt{position:absolute;left:50%;top:62%;transform:translateX(-50%);background:color-mix(in srgb,var(--scrim) calc(var(--scrim-a)*100%),transparent);padding:4px 10px;font:600 14px var(--fb)}
kbd{display:inline-block;border:2px solid var(--text);padding:0 5px;margin-right:6px;font:600 12px var(--fd)}
.health{position:absolute;left:5%;bottom:7%}.lbl,.res,.wpn{color:var(--text2);font:600 12px var(--fb);letter-spacing:.08em}
.bar{display:flex;gap:3px;margin:3px 0}.bar i{width:34px;height:8px;background:var(--critical);box-shadow:0 0 0 1.5px var(--halo)}.bar i.off{background:transparent;outline:1.5px solid var(--text2)}
.bar i:not(.crit):not(.off){background:var(--critical)}
.crit-t{color:var(--critical);font:600 13px var(--fd);letter-spacing:.08em}
.ammo{position:absolute;right:5%;bottom:7%;text-align:right}.mag{font:600 46px/1 var(--fd);color:var(--warning);font-variant-numeric:tabular-nums}
.low{color:var(--warning);font:600 12px var(--fd);letter-spacing:.08em}
.sub{position:absolute;left:50%;bottom:16%;transform:translateX(-50%);background:color-mix(in srgb,var(--scrim) calc(var(--scrim-a)*100%),transparent);padding:4px 10px;font:500 15px var(--fb)}
'''
html = '<!doctype html><html><head><meta charset="utf-8"><title>FIELD specimen</title><style>' + css + '</style></head><body>' + \
    ''.join(hud(n, t, s) for n, t in T['themes'].items() for s in SCENES) + '</body></html>'
(ROOT / 'specimen' / 'index.html').write_text(html)
print('specimen/index.html')
