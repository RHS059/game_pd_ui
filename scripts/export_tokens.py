"""Write tokens.json (for the showcase page) from the TOKENS block in DESIGN_SYSTEM.md, the single source of truth."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / 'DESIGN_SYSTEM.md').read_text().split('<!-- TOKENS:BEGIN -->')[1].split('<!-- TOKENS:END -->')[0]
tokens = json.loads(raw.split('```json')[1].split('```')[0])
(ROOT / 'tokens.json').write_text(json.dumps(tokens, indent=1))
print('tokens.json:', ', '.join(tokens['themes']))
