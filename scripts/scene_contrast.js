// Measures every HUD text/bar element against the real scene pixels behind it, in all 10 scenes.
// Usage: node scripts/scene_contrast.js <base-url> <out-dir>   (writes <out-dir>/scene_measure.json + raw PNGs)
const {chromium} = require('playwright');
const SCENES = ['city', 'field', 'desert', 'forest', 'beach'].flatMap(l => ['day', 'night'].map(t => [l, t]));
(async () => {
  const [url, out] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1920, height: 1300}});
  await p.goto(url); await p.waitForTimeout(2500);
  await p.evaluate(() => { document.querySelector('.top').style.position = 'static'; document.body.dataset.density = 'standard'; });
  const result = [];
  for (const theme of ['operator', 'spartan', 'arena', 'dread']) for (const [loc, tod] of SCENES) {
    await p.selectOption('#theme', theme); await p.selectOption('#scene', loc); await p.selectOption('#tod', tod); await p.waitForTimeout(400);
    // Targets: elements that draw text or bars straight over the world (not on their own scrim panel).
    const targets = await p.evaluate(() => {
      const vp = document.querySelector('#vp'), r0 = vp.getBoundingClientRect(); const out = [];
      const sel = '.ticks span, .heading, .h-score span, .h-squad b, .h-squad span, .h-squad i, .lbl, .seg i, .crit-t, .mag, .res, .wpn, .h-marker .mtxt, .h-offscreen, .h-reticle i, .h-reticle b';
      for (const el of vp.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect(); if (!r.width || getComputedStyle(el).display === 'none' || el.closest('[hidden]')) continue;
        const cs = getComputedStyle(el); const bar = el.matches('.seg i, .h-squad i, .h-reticle i, .h-reticle b');
        out.push({name: el.className || el.tagName + ' ' + (el.parentElement.className || ''), text: el.textContent.trim().slice(0, 18), bar,
          color: bar ? (cs.backgroundColor.match(/, 0\)|\/ 0\)|transparent/) ? getComputedStyle(document.documentElement).getPropertyValue('--text2').trim() : cs.backgroundColor) : cs.color, x: r.left - r0.left, y: r.top - r0.top, w: r.width, h: r.height});
      }
      return out;
    });
    await p.evaluate(() => document.body.classList.add('measure'));
    const shot = `${out}/raw_${theme}_${loc}_${tod}.png`; await (await p.$('#vp')).screenshot({path: shot});
    await p.evaluate(() => document.body.classList.remove('measure'));
    // Clutter: share of each HUD module's box covered by opaque weapon pixels (alpha > 0.5).
    const clutter = await p.evaluate(async () => {
      const vp = document.querySelector('#vp'), vm = document.querySelector('#vm'); await vm.decode();
      const r0 = vp.getBoundingClientRect(), rv = vm.getBoundingClientRect();
      const c = document.createElement('canvas'); c.width = Math.round(rv.width); c.height = Math.round(rv.height);
      const g = c.getContext('2d'); g.drawImage(vm, 0, 0, c.width, c.height); const a = g.getImageData(0, 0, c.width, c.height).data;
      const out = [];
      for (const el of vp.querySelectorAll(':scope > [class^=h-]')) {
        const r = el.getBoundingClientRect(); if (!r.width || el.hidden || getComputedStyle(el).display === 'none') continue;
        let hit = 0, n = 0;
        for (let y = Math.max(r.top, rv.top); y < Math.min(r.bottom, rv.bottom); y += 2) for (let x = Math.max(r.left, rv.left); x < Math.min(r.right, rv.right); x += 2) {
          n++; if (a[((Math.floor(y - rv.top) * c.width) + Math.floor(x - rv.left)) * 4 + 3] > 127) hit++; }
        const total = Math.ceil(r.width / 2) * Math.ceil(r.height / 2);
        out.push({module: el.getAttribute('class').split(' ')[0], covered: +(hit / total).toFixed(3)});
      }
      return out;
    });
    result.push({theme, scene: `${loc}_${tod}`, shot, targets, clutter});
  }
  require('fs').writeFileSync(`${out}/scene_measure.json`, JSON.stringify(result));
  await b.close();
})();
