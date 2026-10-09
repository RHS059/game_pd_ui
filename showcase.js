// FIELD showcase. Tokens come from tokens.json (exported from DESIGN_SYSTEM.md); everything else reads CSS variables.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;
let TOKENS = null;
const FALLBACK = { halo: '#050708', scrim_alpha: .86, themes: { operator: { surface: '#0D1114', raised: '#161C20', scrim: '#080B0D', text: '#F2F4F5', text2: '#B9C1C6', text3: '#8E989F', accent: '#F2B33D', friendly: '#4AA8FF', enemy: '#FF6A3D', objective: '#F5D547', warning: '#FFB020', critical: '#FF6464', success: '#4FD48D', focus: '#FFFFFF' } }, rarity: { common: '#B9C1C6', uncommon: '#5FD08A', rare: '#4DA3FF', epic: '#B57CFF', legendary: '#FFB23E', mythic: '#FF5C8A' } };

// ---------- colour maths (same as scripts/check_contrast.py) ----------
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = c => c.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((a, v, i) => a + v * [.2126, .7152, .0722][i], 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
const over = (t, a, b) => t.map((v, i) => a * v + (1 - a) * b[i]);

// ---------- settings ----------
const save = (k, v) => { try { localStorage.setItem('field.' + k, v); } catch {} };
const load = (k, d) => { try { return localStorage.getItem('field.' + k) ?? d; } catch { return d; } };

function applyTheme(name) {
  const t = TOKENS.themes[name] || Object.values(TOKENS.themes)[0];
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(t)) root.setProperty('--' + k, v);
  root.setProperty('--halo', TOKENS.halo); root.setProperty('--scrim-a', TOKENS.scrim_alpha);
  body.dataset.theme = name; save('theme', name); renderSwatches();
}

function bindControls() {
  const theme = $('#theme'), scene = $('#scene'), tod = $('#tod'), cvd = $('#cvd'), input = $('#input'), ts = $('#ts'), rm = $('#rm'), density = $('#density');
  theme.value = load('theme', 'operator'); scene.value = load('loc', 'city'); tod.value = load('tod', 'day'); cvd.value = load('cvd', 'none');
  input.value = load('input', 'kbm'); ts.value = load('ts', '100'); density.value = load('density', 'standard');
  rm.checked = load('rm', matchMedia('(prefers-reduced-motion: reduce)').matches ? '1' : '0') === '1';
  const sync = () => {
    applyTheme(theme.value);
    const sc = `${scene.value}_${tod.value}`; body.dataset.scene = sc; $('.scene').style.backgroundImage = `url(scenes/${sc}.jpg)`;
    save('loc', scene.value); save('tod', tod.value);
    body.className = body.className.replace(/cvd-\w+/g, '').trim(); if (cvd.value !== 'none') body.classList.add('cvd-' + cvd.value); save('cvd', cvd.value);
    setInput(input.value);
    document.documentElement.style.setProperty('--ts', ts.value / 100); $('#tsv').textContent = ts.value + '%'; ts.setAttribute('aria-valuetext', ts.value + ' percent'); save('ts', ts.value);
    body.classList.toggle('rm', rm.checked); body.classList.toggle('rm-off', !rm.checked); save('rm', rm.checked ? '1' : '0');
    body.dataset.density = density.value; save('density', density.value);
  };
  [theme, scene, tod, cvd, input, ts, rm, density].forEach(el => el.addEventListener('input', sync));
  sync();
}

// ---------- input glyphs ----------
function setInput(mode) {
  body.dataset.input = mode; $('#input').value = mode; save('input', mode);
  $$('.glyph').forEach(g => g.textContent = mode === 'pad' ? g.dataset.p : g.dataset.k);
}
addEventListener('gamepadconnected', () => setInput('pad'));
addEventListener('keydown', e => { if (body.dataset.input === 'pad' && !e.repeat && e.key.length === 1) setInput('kbm'); });

// ---------- HUD ----------
const S = { hp: 100, shield: 3, mag: 30, cooldown: 0 };
const BEARINGS = [['NW', 0], ['', 12.5], ['N', 25], ['', 37.5], ['NE', 50], ['', 62.5], ['E', 75], ['', 87.5], ['SE', 100]];
function buildCompass() {
  const t = $('#ticks');
  t.innerHTML = BEARINGS.map(([l, x]) => l ? `<span style="left:${x}%">${l}</span>` : `<i style="left:${x}%"></i>`).join('') +
    `<span class="m obj" style="left:18%;bottom:calc(32*var(--p))">■B</span><span class="m en" style="left:61%;bottom:calc(32*var(--p))">▼</span><span class="m fr" style="left:8%;bottom:calc(32*var(--p))">◆</span>`;
}
const NAMES = ['VOSS', 'RAIN', 'IRONSIDE', 'HALE', 'MOTH', 'KESTREL'];
function feed(att, vic, me) {
  const ol = $('#feed'), li = document.createElement('li');
  if (me) li.className = 'me';
  li.innerHTML = `<b class="${att[1]}">${att[0]}</b> ⟶ <b class="${vic[1]}">${vic[0]}</b>`;
  ol.prepend(li); while (ol.children.length > 5) ol.lastElementChild.remove();
  setTimeout(() => { li.classList.add('out'); setTimeout(() => li.remove(), 220); }, 5000);
}
function note(text, cls = '') {
  const n = $('#notes'), d = document.createElement('div'); d.className = cls; d.textContent = text;
  n.append(d); while (n.children.length > 3) n.firstElementChild.remove(); setTimeout(() => d.remove(), 4000);
}
function hitmark(kind) { const h = $('#hit'); h.className = 'h-hit'; void h.offsetWidth; h.classList.add('show'); if (kind) h.classList.add(kind); }
function renderHealth() {
  const hp = $('#hp'), segs = $$('i', hp), filled = Math.ceil(S.hp / 25);
  segs.forEach((s, i) => s.classList.toggle('gone', i >= filled));
  $$('#shield i').forEach((s, i) => s.classList.toggle('gone', i >= S.shield));
  $('#hpn').textContent = S.hp;
  const box = $('#health'); box.classList.toggle('warn', S.hp <= 50 && S.hp > 25); box.classList.toggle('crit', S.hp <= 25);
  $('#critT').hidden = S.hp > 25; $('#vign').classList.toggle('on', S.hp <= 25);
}
function renderAmmo() {
  const m = $('#mag'); m.textContent = String(S.mag).padStart(2, '0');
  m.classList.toggle('low', S.mag > 0 && S.mag <= 7); m.classList.toggle('empty', S.mag === 0);
  const low = $('#low'); low.hidden = S.mag > 7; low.textContent = S.mag === 0 ? 'RELOAD' : 'LOW AMMO';
}
const EVENTS = {
  hit: () => hitmark(),
  head: () => hitmark('head'),
  kill: () => { hitmark('kill'); feed(['YOU', 'fr'], [NAMES[Math.random() * NAMES.length | 0], 'en'], true); },
  dmg: () => {
    const d = $('#dmg'); d.style.setProperty('--dir', (Math.random() * 360 | 0) + 'deg'); d.classList.remove('show'); void d.getBoundingClientRect(); d.classList.add('show');
    if (S.shield > 0) S.shield--; else S.hp = Math.max(5, S.hp - 25); renderHealth();
  },
  fire: () => { const r = $('#ret'); r.classList.add('spread'); setTimeout(() => r.classList.remove('spread'), 260); S.mag = Math.max(0, S.mag - 8); renderAmmo(); },
  reload: () => { S.mag = 30; renderAmmo(); },
  ability: () => {
    if (S.cooldown) return; const slot = $('#eq2'); slot.classList.remove('ready'); S.cooldown = 1; const t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / 4000); slot.style.setProperty('--cd', 1 - k);
      if (k < 1) requestAnimationFrame(step); else { S.cooldown = 0; slot.classList.add('ready'); setTimeout(() => slot.classList.remove('ready'), 600); } };
    requestAnimationFrame(step);
  },
  ping: () => { const p = $('#ping'); p.hidden = false; note('Kade pinged an enemy'); clearTimeout(p._t); p._t = setTimeout(() => p.hidden = true, 5000); },
  cap: () => { note('Objective B captured', 'ok'); const m = $('#medal'); m.textContent = 'POINT SECURED'; m.hidden = false; clearTimeout(m._t); m._t = setTimeout(() => m.hidden = true, 2500); },
  board: btn => { const b = $('#board'), open = b.hidden; b.hidden = !open; btn.setAttribute('aria-pressed', open); },
  heal: () => { Object.assign(S, { hp: 100, shield: 3, mag: 30 }); renderHealth(); renderAmmo(); },
};
function buildBoard() {
  const rows = [['1', 'Kade', 2140, '18 / 6 / 4', 3, 'fr'], ['2', 'You', 1985, '16 / 7 / 6', 3, 'me'], ['3', 'Morrow', 1610, '12 / 9 / 8', 2, 'fr'],
    ['1', 'Voss', 2010, '17 / 8 / 3', 3, 'en'], ['2', 'Rain', 1720, '14 / 10 / 5', 1, 'en']];
  $('#boardBody').innerHTML = rows.map(([n, p, s, k, b, c]) => `<tr class="${c === 'me' ? 'me' : ''}"><td>${n}</td><td class="${c === 'me' ? 'fr' : c}">${p}</td><td>${s}</td><td>${k}</td><td class="bars" aria-label="${b} of 3 bars">${'▮'.repeat(b)}${'▯'.repeat(3 - b)}</td></tr>`).join('');
}
function bindHud() {
  $$('.events button').forEach(b => b.addEventListener('click', () => EVENTS[b.dataset.ev](b)));
  addEventListener('keydown', e => { if (e.key === 'Tab' && e.shiftKey && e.altKey) EVENTS.board($('[data-ev=board]')); });
  const prompt = $('.h-prompt');
  const start = e => { if (e.type === 'keydown' && (e.key.toLowerCase() !== 'e' || e.repeat || e.target.closest('input,select'))) return; prompt.classList.add('holding'); prompt._t = setTimeout(() => { note('Kade revived', 'ok'); prompt.classList.remove('holding'); }, 1000); };
  const stop = e => { if (e.type === 'keyup' && e.key.toLowerCase() !== 'e') return; clearTimeout(prompt._t); prompt.classList.remove('holding'); };
  addEventListener('keydown', start); addEventListener('keyup', stop);
  buildCompass(); buildBoard(); renderHealth(); renderAmmo();
  feed(['KADE', 'fr'], ['VOSS', 'en']); feed(['RAIN', 'en'], ['ASH', 'fr']);
}

// ---------- front end ----------
const ITEMS = [['M4A1', 'Assault rifle', 'legendary', 5, true], ['AK-74', 'Assault rifle', 'epic', 4], ['MP7', 'SMG', 'rare', 3, true],
  ['Kilo 141', 'Assault rifle', 'uncommon', 2], ['HDR', 'Sniper', 'mythic', 6], ['M19', 'Pistol', 'common', 1]];
function buildFrontEnd() {
  const r = TOKENS.rarity;
  $('#tiles').innerHTML = ITEMS.map(([n, t, rar, pips, isNew], i) => `<button class="tile" style="--r:${r[rar]}" aria-pressed="${i === 0}" aria-label="${n}, ${t}, ${rar}, ${pips} of 6">
    <span class="art" aria-hidden="true"></span>${isNew ? '<span class="new" aria-hidden="true"></span>' : ''}<span class="pips" aria-hidden="true">${'<i></i>'.repeat(pips)}${'<i class="o"></i>'.repeat(6 - pips)}</span>
    <b>${n}</b><small>${t} · ${rar[0].toUpperCase() + rar.slice(1)}</small></button>`).join('');
  $$('.tile').forEach(b => b.addEventListener('click', () => { $$('.tile').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); b.querySelector('.new')?.remove(); }));
  const stats = [['Damage', 62, 71], ['Range', 58, 52], ['Fire rate', 74, 66], ['Handling', 70, 61], ['Recoil ctrl', 66, 54]];
  $('#cmp').innerHTML = stats.map(([n, a, b]) => { const d = b - a; return `<div class="cmp-row"><span>${n}</span><div class="cmp-bar" style="--a:${a};--b:${b}"><i></i><b></b></div><em class="${d > 0 ? 'up' : 'dn'}">${d > 0 ? '▲ +' : '▼ '}${d}</em></div>`; }).join('');
  $$('.tabs [role=tab]').forEach(t => t.addEventListener('click', () => $$('.tabs [role=tab]').forEach(x => x.setAttribute('aria-selected', x === t))));
  // hold to confirm (pointer + Enter/Space)
  const del = $('#del');
  const down = e => { if (e.type === 'keydown' && (e.repeat || !['Enter', ' '].includes(e.key))) return; e.preventDefault(); del.classList.add('holding'); del._t = setTimeout(() => { del.classList.add('done'); $('.t', del).textContent = 'Loadout deleted'; }, 1000); };
  const up = () => { clearTimeout(del._t); del.classList.remove('holding'); };
  del.addEventListener('pointerdown', down); del.addEventListener('keydown', down);
  ['pointerup', 'pointerleave', 'keyup', 'blur'].forEach(ev => del.addEventListener(ev, up));
  // settings help + controls
  $$('.row').forEach(r => { const show = () => $('#help').textContent = r.dataset.help; r.addEventListener('focusin', show); r.addEventListener('mouseenter', show); });
  $$('.switch').forEach(s => s.addEventListener('click', () => { const on = s.getAttribute('aria-checked') !== 'true'; s.setAttribute('aria-checked', on); s.textContent = on ? 'On' : 'Off'; }));
  const CYC = { 'Subtitle size': ['Small', 'Medium', 'Large', 'Extra large'], 'Colour-vision mode': ['Off', 'Protanopia', 'Deuteranopia', 'Tritanopia'], 'Aim input': ['Hold', 'Toggle'] };
  $$('.cycler').forEach(c => { const opts = CYC[c.parentElement.firstElementChild.textContent]; const val = $('b', c); const [prev, next] = $$('button', c);
    const go = d => { val.textContent = opts[(opts.indexOf(val.textContent) + d + opts.length) % opts.length]; };
    prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1)); });
  $('.row input[type=range]').addEventListener('input', e => $$('.viewport [class^=h-]').forEach(el => el.style.opacity = e.target.value / 100));
  // xp
  let xp = 7450; $('#xpbtn').addEventListener('click', () => { xp = (xp + 1800) % 10000; $('#xpfill').style.setProperty('--v', xp / 10000); $('#xpn').textContent = `${xp.toLocaleString('en').replace(',', ' ')} / 10 000 XP`; });
  // modal
  const dlg = $('#modal'); $('#openModal').addEventListener('click', () => dlg.showModal());
  $$('button', dlg).forEach(b => b.addEventListener('click', () => dlg.close(b.value)));
  // matchmaking timer
  const t0 = Date.now(); setInterval(() => { const s = (Date.now() - t0) / 1000 | 0; $('#mmt').textContent = `${s / 60 | 0}:${String(s % 60).padStart(2, '0')}`; }, 1000);
}

// ---------- tokens ----------
function renderSwatches() {
  const t = TOKENS.themes[body.dataset.theme]; if (!t) return;
  const world = over(rgb(t.scrim), TOKENS.scrim_alpha, [1, 1, 1]);
  const keys = ['text', 'text2', 'text3', 'accent', 'friendly', 'enemy', 'objective', 'warning', 'critical', 'success'];
  $('#sw').innerHTML = keys.map(k => { const c = rgb(t[k]); const a = ratio(c, rgb(t.surface)), w = ratio(c, world);
    return `<div class="sw"><div class="chip" style="color:${t[k]}">Aa 07</div><b>${k}</b><span>${t[k]}</span><span>surface ${a.toFixed(1)}:1</span><span>${k === 'text3' ? 'menus only' : `over world ${w.toFixed(1)}:1`}</span></div>`; }).join('') +
    Object.entries(TOKENS.rarity).map(([k, v]) => `<div class="sw"><div class="chip" style="box-shadow:inset 0 -4px 0 ${v}">${k}</div><b>rarity.${k}</b><span>${v}</span><span>surface ${ratio(rgb(v), rgb(t.surface)).toFixed(1)}:1 (non-text)</span></div>`).join('');
}
function buildTypeMotion() {
  const T = [['num-hero', 64, 'fd', ''], ['display', 80, 'fd', 'up'], ['h1', 56, 'fd', 'up'], ['h2', 40, 'fd', 'up'], ['body', 32, 'fb', ''], ['label', 28, 'fb', 'up'], ['small', 26, 'fb', '']];
  $('#type').innerHTML = T.map(([n, px, f, c]) => `<div><span style="font:600 calc(${px * .55}px*var(--ts)) var(--${f});${c ? 'text-transform:uppercase;letter-spacing:.05em' : ''}">${n === 'num-hero' ? '07 / 120' : n === 'body' ? 'Two on the roof' : n}</span><small>${n} · ${px}px</small></div>`).join('');
  const M = [['t-micro', 80], ['t-fast', 120], ['t-base', 180], ['t-slow', 280], ['t-reward', 800]];
  $('#motion').innerHTML = M.map(([n, ms]) => `<button style="--d:${ms}ms" aria-label="Play ${n}, ${ms} milliseconds"><span>${n} ${ms}ms</span><i style="transition:transform ${ms}ms var(--ease)"></i></button>`).join('');
  $$('#motion button').forEach(b => b.addEventListener('click', () => b.classList.toggle('go')));
}

// ---------- boot ----------
// Preload the other scenes so switching is instant.
addEventListener('load', () => ['city', 'field', 'desert', 'forest', 'beach'].forEach(l => ['day', 'night'].forEach(t => { new Image().src = `scenes/${l}_${t}.jpg`; })));
(async () => {
  try { TOKENS = await (await fetch('tokens.json', { cache: 'no-cache' })).json(); } catch { TOKENS = FALLBACK; }
  bindControls(); bindHud(); buildFrontEnd(); buildTypeMotion(); setInput(body.dataset.input);
})();
