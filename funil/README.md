# Funil — Método Recomeço 30 Premium

Anúncio → **Quiz conversacional (Cláudia)** → **Resultado personalizado** → **Oferta** → **Checkout Cakto** → acesso ao app.

Site estático (HTML/CSS/JS puro, sem dependências, ~130 KB). Projeto **independente**: não toca no aplicativo publicado em `metodo-recomeco-30.joaognunes22.workers.dev`, no Supabase nem no webhook.

```
funil/
├── src/
│   ├── index.html        quiz conversacional + tela de resultado
│   ├── oferta.html       página de vendas (tema Florescer / Reconstruir / neutro)
│   ├── css/              base.css (tokens e temas), quiz.css, oferta.css
│   ├── js/config.js      checkout oficial + repasse de UTMs (único lugar com o link)
│   ├── js/quiz.js        motor do chat, perguntas, reações e resultado
│   ├── js/oferta.js      CTAs, resumo do quiz, CTA fixo no celular
│   ├── img/              foto da Cláudia (fornecida por você), favicon
│   └── _headers          cabeçalhos de segurança/cache (Cloudflare Pages)
└── scripts/              build.mjs, serve.mjs, test.mjs
```

## Comandos

```bash
npm run build      # gera dist/ (assets versionados por hash) e valida links, checkout e segredos
npm run dev        # servidor local de src/ em http://localhost:5173
npm test           # build + testes ponta a ponta no Chromium (Playwright)
```

## Dois roteiros: mulher e homem

A primeira pergunta da Cláudia é "você é mulher ou homem?". A resposta muda as cores do chat e leva a um roteiro próprio de 8 perguntas:

| | Mulher → Jornada Florescer | Homem → Jornada Reconstruir |
|---|---|---|
| Cores | rosé, creme, sálvia, dourado | azul-marinho, grafite, areia, dourado (chat escuro) |
| Temas | saudade dele, ser substituída, comparação, medo de ser esquecida, culpa, limites, autonomia | saudade dela, medo de perder de vez, ela com outro, ciúme, aprovação, ansiedade, respeito próprio, controle |
| Oferta | `oferta.html?j=florescer` | `oferta.html?j=reconstruir` |

Links diretos para anúncios segmentados (pulam a pergunta inicial e já abrem com as cores certas):

- `/mulher.html` (ou `/mulher` no Cloudflare Pages)
- `/homem.html` (ou `/homem`)
- Em desenvolvimento: `index.html?g=mulher` / `index.html?g=homem`

Os textos de cada roteiro ficam em `src/js/quiz.js`, nos objetos `MULHER` e `HOMEM`.

`?fast=1` no quiz zera os atrasos de digitação (uso em testes).

## Checkout

Todo elemento com `data-checkout` aponta para `https://pay.cakto.com.br/z5yir23_1318125`. Parâmetros `utm_*`, `src`, `sck`, `xcod`, `fbclid`, `gclid` e `ttclid` da URL de entrada são guardados na sessão e repassados do quiz para a oferta e para o checkout. Preço e produto continuam definidos só na Cakto.

## Publicação gratuita (Cloudflare Pages)

Use um projeto **novo** do Pages, separado do Worker do app.

1. `npm run build`
2. Pelo painel: Workers & Pages → Create → Pages → *Upload assets* → envie a pasta `funil/dist`.
   Ou via CLI (gratuito):
   ```bash
   npx wrangler pages deploy dist --project-name metodo-recomeco-30-funil
   ```
3. Ou conecte este repositório ao Pages: diretório raiz `funil`, comando `npm run build`, saída `dist`.

URL do anúncio: `https://<projeto>.pages.dev/?utm_source=...&utm_campaign=...`
Se quiser, aponte um domínio próprio no Pages. O domínio atual do app continua o mesmo.

## Telas do aplicativo

A seção "Por dentro do aplicativo" usa mockups em CSS (identificados como ilustração na página). Para usar capturas reais, substitua o conteúdo de cada `.phone__screen` em `oferta.html` por `<img src="img/app-tela-N.webp" alt="...">`.
