// Testes ponta a ponta com o Chromium/Playwright pré-instalado.
// Executa o quiz completo com respostas diferentes nas duas jornadas, valida o
// resultado, os links de checkout (com UTMs), a página de vendas, imagens,
// erros de console e ausência de rolagem horizontal no celular e no desktop.
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.env.SHOTS || join(root, 'test-results');
mkdirSync(shots, { recursive: true });

const PORT = 4174;
const BASE = `http://localhost:${PORT}`;
const CHECKOUT = 'https://pay.cakto.com.br/z5yir23_1318125';
const server = await serve(join(root, 'dist'), PORT);
const browser = await chromium.launch();

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } };

const SCENARIOS = [
  { name: 'florescer-celular', device: 'iPhone 13', path: ['saudade', 'recente', 'perfil', 'muitas', 'muito', 'abalada', 'florescer', 'autoestima'],
    expect: ['a saudade', 'a insegurança', 'várias vezes ao dia', 'término é recente', 'rotina está pesando', 'recuperar sua autoestima'] },
  { name: 'reconstruir-celular', device: 'Pixel 7', path: ['medo', 'vaivem', 'mensagem', 'asvezes', 'ok', 'boa', 'reconstruir', 'impulso'],
    expect: ['o medo de que essa história nunca mais volte', 'os pensamentos sobre essa pessoa', 'de vez em quando', 'vai e volta', 'impulso é muito comum', 'parar de agir por impulso'] },
  { name: 'florescer-desktop', viewport: { width: 1366, height: 860 }, path: ['seguir', 'longo', 'isolar', 'rara', 'automatico', 'futuro', 'florescer', 'clareza'],
    expect: ['a dificuldade de seguir em frente', 'a incerteza sobre o futuro', 'raramente', 'tempo, sozinho', 'ter clareza'] },
  { name: 'reconstruir-desktop', viewport: { width: 1366, height: 860 }, path: ['substituido', 'meses', 'conversas', 'diaria', 'alguns', 'oscila', 'reconstruir', 'paz'],
    expect: ['outra pessoa ocupou o seu lugar', 'a oscilação da sua autoestima', 'pelo menos uma vez por dia', 'rotina está pesando', 'paz para dormir'] }
];

async function newPage(s) {
  const ctx = await browser.newContext(s.device ? { ...devices[s.device] } : { viewport: s.viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => problems.push('requestfailed: ' + r.url()));
  // Nunca navegar para o checkout real durante os testes.
  await page.route('https://pay.cakto.com.br/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>checkout-mock</title>' }));
  return { ctx, page, problems };
}

async function noHorizontalScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
}

async function imagesLoaded(page) {
  return page.evaluate(() => [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.src));
}

for (const s of SCENARIOS) {
  console.log(`\n▶ ${s.name}`);
  const { ctx, page, problems } = await newPage(s);
  await page.goto(`${BASE}/index.html?fast=1&utm_source=facebook&utm_campaign=teste_${s.name}&utm_content=ad1`);

  const first = await page.locator('.bubble--host').first().innerText();
  ok(first.includes('Oi, eu sou a Cláudia'), 'abertura da Cláudia exibida');

  for (let i = 0; i < s.path.length; i++) {
    const btn = page.locator(`.choice[data-value="${s.path[i]}"]`);
    await btn.waitFor({ state: 'visible' });
    await btn.click();
    const pct = Number(await page.locator('.progress').getAttribute('aria-valuenow'));
    if (i === s.path.length - 1) ok(pct === 100, 'barra de progresso chega a 100%');
  }
  await page.locator('#result').waitFor();
  ok((await page.locator('.bubble--guest').count()) === s.path.length, 'cada resposta aparece como bolha do visitante');

  const resultText = await page.locator('#result').innerText();
  for (const e of s.expect) ok(resultText.includes(e), `resultado reflete a resposta: "${e}"`);
  const journey = s.path[6];
  ok(await page.locator(`.journey-card--${journey}`).isVisible(), `jornada indicada = ${journey}`);
  ok(!/\d+\s?%|diagnóstico de|compatibilidade/i.test(resultText.replace('Não é diagnóstico', '')), 'sem percentuais/diagnósticos inventados');

  const co = new URL(await page.locator('#cta-checkout').getAttribute('href'));
  ok(co.origin + co.pathname === CHECKOUT, 'CTA do resultado → checkout oficial Cakto');
  ok(co.searchParams.get('utm_source') === 'facebook' && co.searchParams.get('utm_campaign') === `teste_${s.name}`, 'UTMs preservadas no checkout');

  ok(await noHorizontalScroll(page), 'quiz sem rolagem horizontal');
  ok((await imagesLoaded(page)).length === 0, 'imagens do quiz carregadas');
  await page.screenshot({ path: join(shots, `${s.name}-resultado.png`), fullPage: false });

  // Botão "Recomeçar" reinicia a conversa.
  // (testado só no primeiro cenário para não alongar o tempo)
  if (s.name === 'florescer-celular') {
    const { page: p2, ctx: c2 } = await newPage(s);
    await p2.goto(`${BASE}/index.html?fast=1`);
    await p2.locator('.choice[data-value="saudade"]').click();
    await p2.locator('#restart').click();
    await p2.locator('.choice[data-value="saudade"]').waitFor();
    ok((await p2.locator('.bubble--guest').count()) === 0, 'botão Recomeçar reinicia o quiz');
    await c2.close();
  }

  // Resultado → página de vendas
  await page.locator('#cta-plano').click();
  await page.waitForURL(/oferta\.html/);
  const url = new URL(page.url());
  ok(url.searchParams.get('j') === journey && url.searchParams.get('utm_source') === 'facebook', 'quiz → oferta leva jornada e UTMs');
  ok((await page.evaluate(() => document.documentElement.dataset.theme)) === journey, `tema visual da oferta = ${journey}`);
  ok(await page.locator('#personal').isVisible(), 'oferta mostra o foco escolhido no quiz');
  ok(await page.locator(`.journey--${journey} .journey__mark`).isVisible(), 'jornada indicada destacada na oferta');

  const hrefs = await page.locator('[data-checkout]').evaluateAll((as) => as.map((a) => a.href));
  ok(hrefs.length >= 5 && hrefs.every((h) => h.startsWith(CHECKOUT + '?') && h.includes('utm_source=facebook')), `todos os ${hrefs.length} CTAs de compra → checkout oficial com UTMs`);
  const ctaTexts = await page.locator('a.btn[data-checkout]').allInnerTexts();
  ok(ctaTexts.filter((t) => /QUERO COMEÇAR MEU RECOMEÇO/i.test(t)).length >= 3, 'CTA "QUERO COMEÇAR MEU RECOMEÇO" presente');
  const body = await page.locator('body').innerText();
  ok(/R\$\s?19,90/.test(body) && /PAGAMENTO ÚNICO/i.test(body) && /Sem mensalidades/i.test(body), 'oferta: R$ 19,90, pagamento único, sem mensalidades');
  ok(!/reconquist|garantid[oa] que|volta em \d+ dias/i.test(body), 'sem promessas de reconquista garantida');

  // FAQ abre/fecha
  const d = page.locator('.faq details').first();
  await d.locator('summary').click();
  ok(await d.evaluate((e) => e.open), 'FAQ abre ao clicar');

  // CTA fixo no celular aparece após rolar
  await page.evaluate(() => window.scrollTo(0, document.querySelector('#jornadas').offsetTop));
  await page.waitForTimeout(500);
  ok(await page.locator('#sticky.is-visible').count() === 1, 'CTA fixo aparece durante a rolagem');

  // Clique real num CTA navega para o checkout (mockado)
  await page.evaluate(() => window.scrollTo(0, 0));
  await Promise.all([page.waitForURL(/pay\.cakto\.com\.br/), page.locator('.hero__btn').click()]);
  ok(page.url().startsWith(CHECKOUT + '?'), 'clique no CTA abre o checkout oficial');
  await page.goBack();
  await page.waitForURL(/oferta\.html/);
  ok(true, 'botão Voltar retorna à oferta (sem sequestro de histórico)');

  ok(await noHorizontalScroll(page), 'oferta sem rolagem horizontal');
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
  ok((await imagesLoaded(page)).length === 0, 'imagens da oferta carregadas');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(shots, `${s.name}-oferta.png`), fullPage: true });

  ok(problems.length === 0, 'console sem erros/avisos' + (problems.length ? ': ' + problems.join(' | ') : ''));
  await ctx.close();
}

// Oferta acessada direto (sem quiz): tema neutro e CTAs funcionando.
console.log('\n▶ oferta-direta');
{
  const { ctx, page, problems } = await newPage({ viewport: { width: 320, height: 640 } });
  await page.goto(`${BASE}/oferta.html`);
  ok((await page.evaluate(() => document.documentElement.dataset.theme)) === 'neutro', 'tema neutro sem quiz');
  ok(await page.locator('#personal').isHidden(), 'sem resumo quando não houve quiz');
  const hrefs = await page.locator('[data-checkout]').evaluateAll((as) => as.map((a) => a.href));
  ok(hrefs.every((h) => h === CHECKOUT), 'CTAs → checkout oficial (sem parâmetros extras)');
  ok(await noHorizontalScroll(page), 'sem rolagem horizontal em tela de 320–375px');
  await page.screenshot({ path: join(shots, 'oferta-direta.png'), fullPage: false });
  ok(problems.length === 0, 'console sem erros/avisos' + (problems.length ? ': ' + problems.join(' | ') : ''));
  await ctx.close();
}

// Modo real (sem ?fast): confirma a emulação de digitação.
console.log('\n▶ ritmo-de-digitação');
{
  const { ctx, page } = await newPage({ device: 'iPhone 13' });
  await page.goto(`${BASE}/index.html`);
  await page.locator('.choice').first().waitFor({ timeout: 15000 });
  const t0 = Date.now();
  await page.locator('.choice[data-value="saudade"]').click();
  await page.locator('.typing').first().waitFor({ timeout: 3000 });
  ok(true, 'indicador "digitando" aparece entre mensagens');
  await page.locator('.choice[data-value="recente"]').waitFor({ timeout: 15000 });
  const dt = Date.now() - t0;
  ok(dt > 1000 && dt < 9000, `próxima pergunta em ${dt} ms (ritmo natural, sem demora excessiva)`);
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${pass} verificações passaram, ${fail} falharam.`);
process.exit(fail ? 1 : 0);
