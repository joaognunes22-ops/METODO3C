// Build de produção: copia src/ → dist/, versiona CSS/JS por hash (cache imutável)
// e valida referências locais, links de checkout e ausência de segredos.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname, relative, extname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');
const CHECKOUT = 'https://pay.cakto.com.br/z5yir23_1318125';

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const errors = [];

rmSync(dist, { recursive: true, force: true });
const rename = {};
for (const file of walk(src)) {
  const rel = relative(src, file).split('\\').join('/');
  let out = rel;
  if (['.css', '.js'].includes(extname(rel))) {
    const h = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10);
    out = rel.replace(/(\.[a-z]+)$/, `.${h}$1`);
    rename[rel] = out;
  }
  mkdirSync(dirname(join(dist, out)), { recursive: true });
  copyFileSync(file, join(dist, out));
}

// Entradas segmentadas para anúncios: /mulher e /homem pulam a pergunta inicial.
const quizHtml = readFileSync(join(dist, 'index.html'), 'utf8');
for (const [g, title] of [['mulher', 'Jornada Florescer'], ['homem', 'Jornada Reconstruir']]) {
  writeFileSync(join(dist, `${g}.html`), quizHtml
    .replace('<html lang="pt-BR" translate="no">', `<html lang="pt-BR" translate="no" data-g="${g}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>Método Recomeço 30 Premium — ${title}</title>`));
}

for (const page of ['index.html', 'oferta.html', 'receba.html', 'mulher.html', 'homem.html']) {
  let html = readFileSync(join(dist, page), 'utf8');
  for (const [from, to] of Object.entries(rename)) html = html.split(`"${from}"`).join(`"${to}"`);
  writeFileSync(join(dist, page), html);
  // Referências locais precisam existir.
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"#:]+?)(?:[?#][^"]*)?"/g)) {
    if (!existsSync(join(dist, ref))) errors.push(`${page}: referência ausente ${ref}`);
  }
}

// O checkout oficial deve ser o único destino de pagamento.
const cfg = readFileSync(join(dist, rename['js/config.js']), 'utf8');
if (!cfg.includes(`CHECKOUT_URL: '${CHECKOUT}'`)) errors.push('config.js: checkout oficial ausente ou alterado');
for (const f of walk(dist)) {
  if (!/\.(html|js|css)$/.test(f)) continue;
  const t = readFileSync(f, 'utf8');
  const pays = [...t.matchAll(/https?:\/\/pay\.[^'"\s)]+/g)].map((m) => m[0]);
  for (const p of pays) if (p !== CHECKOUT) errors.push(`${basename(f)}: checkout inesperado ${p}`);
  if (/service_role|sb_secret_|eyJhbGciOi|SUPABASE_[A-Z_]*KEY|sk_live|-----BEGIN/i.test(t)) errors.push(`${basename(f)}: possível segredo exposto`);
  if (/utmify|grandesdescobertas|tynk\.ai|chatecom|pushState/i.test(t)) errors.push(`${basename(f)}: resquício de código de terceiros`);
}

if (errors.length) { console.error('BUILD FALHOU:\n- ' + errors.join('\n- ')); process.exit(1); }
const size = walk(dist).reduce((s, f) => s + statSync(f).size, 0);
console.log(`Build OK → dist/ (${walk(dist).length} arquivos, ${(size / 1024).toFixed(1)} KB)`);
