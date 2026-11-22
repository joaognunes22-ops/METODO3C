// uso: node render.js <dirWeb> <dirSaida> <fps> [lista de tempos para teste]
const { chromium } = require('playwright'); const fs = require('fs'); const http = require('http'); const path = require('path');
const [web, out, fpsS, ...times] = process.argv.slice(2); const fps = +fpsS;
const types = {'.html':'text/html','.js':'text/javascript','.jpg':'image/jpeg','.glb':'model/gltf-binary'};
const srv = http.createServer((q, r) => { const f = path.join(web, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, {'Content-Type': types[path.extname(f)] || 'application/octet-stream'}); r.end(d); } }); }).listen(+(process.env.PORT || 8765));
(async () => {
  fs.mkdirSync(out, {recursive: true});
  const b = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl']});
  const p = await b.newPage({viewport: {width: 1080, height: 1920}, deviceScaleFactor: 1});
  p.on('console', m => console.log('[page]', m.text())); p.on('pageerror', e => console.log('[err]', e.message));
  await p.goto(`http://localhost:${process.env.PORT || 8765}/index.html`); await p.waitForFunction('window.ready === true', null, {timeout: 60000});
  const dur = await p.evaluate('window.DURATION');
  const list = times.length ? times.map(Number) : [...Array(Math.round(dur * fps)).keys()].map(i => i / fps);
  let i = 0; const t0 = Date.now();
  const S0 = +(process.env.START || 0), S1 = +(process.env.END || 1e9);
  for (const t of list) {
    if (!times.length && (i < S0 || i >= S1)) { i++; continue; }
    const name = times.length ? `t${t.toFixed(2)}.png` : `f${String(i).padStart(4, '0')}.png`;
    if (!times.length && fs.existsSync(path.join(out, name))) { i++; continue; }
    const info = await p.evaluate(t => window.renderAt(t), t);
    const data = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
    fs.writeFileSync(path.join(out, name), Buffer.from(data.split(',')[1], 'base64'));
    if (i % 30 === 0 || times.length) console.log(i, t.toFixed(2), JSON.stringify(info), ((Date.now() - t0) / 1000).toFixed(0) + 's');
    i++;
  }
  await b.close(); srv.close(); console.log('FIM');
})();
