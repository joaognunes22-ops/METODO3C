# MPS_Flipbook_9x16

Vídeo flipbook 3D do **Meu Pequeno Singular** — 1080×1920 (9:16), H.264 High, 30 fps, 27,0 s, sem áudio, `+faststart`.

## Conteúdo (ordem do `MPS_Kit_Completo.pdf`)
Biblioteca de Atividades (pág. 28–551 do kit) seguida dos Bônus 1–5 (pág. 552–590). Cada página aparece uma única vez.

| tempo | o que aparece |
|---|---|
| 0–2,6 s | capa → abre |
| 2,6–4,4 s | Como usar · **Sumário por trilha** (zoom) |
| 4,4–6,5 s | Trilha Olhar Atento · OA-001 com Simplificado / Padrão / Ampliado (zoom) |
| 6,5–17,5 s | folhear acelerando, com pausas nas aberturas: Lembrar, Pensar, Mãos em Ação (zoom MA-001), Palavras, Passo a Passo, Sentir, Brincar e Criar |
| 17,5–24,5 s | índice completo → capas dos Bônus 1–5 → últimas páginas (Guia da Família) |
| 25–27 s | o livro fecha na capa |

Não entram no vídeo: Comece Aqui, Bússola, Cartela e Mapa (pág. 1–27 do kit), que ficam antes da capa da Biblioteca.

## Como renderizar de novo
1. `pdftoppm -r 100 -jpeg` das páginas 28–590 para `web/lo/` e `-r 200` dos destaques para `web/hi/` (nomes `p-NNN.jpg`).
2. `npm install three@0.170.0` em `web/`, com `cena_flipbook.html` salvo como `web/index.html`.
3. `node render.js web frames 30`, depois ffmpeg (libx264, CRF 15, yuv420p, `-an`).

---

# MPS_Flipbook_Cinematic_9x16 (versão cinematográfica)

1080×1920 (9:16), H.264 High, 30 fps, 27,0 s (810 quadros), sem áudio. Mesmas 563 páginas (28–590 do kit), em ordem, cada uma uma vez; capa repetida só no fechamento.

**Cena (three.js, renderização por software):** mesa de carvalho claro com textura fotográfica (ambientCG *Wood048*, CC0: cor + normal + rugosidade), luz de janela lateral quente com sombras suaves (VSM), luz ambiente de estúdio (RoomEnvironment), sombra de contato, 4 lápis de cor modelados, miolo de ~18 mm com papel de microtextura, profundidade de campo (BokehPass) e correção de cor quente no ffmpeg.

| tempo | plano |
|---|---|
| 0–3 s | E: livro fechado em ângulo baixo, luz rasante, dolly-in na capa |
| 3–6 s | a capa abre → A: vista superior do sumário |
| 6–10 s | OA-001: C close na ilustração → D percorre Simplificado / Padrão / Ampliado |
| 10–17 s | B: folhear em 45° pelas 8 trilhas · A: MA-001 · diagonal lateral até Brincar e Criar |
| 17–21,5 s | índice → capas dos Bônus 1, 2, 3 |
| 21,5–24 s | destaque premium: Cartões da Calma (pág. 575–576), 50° com luz rasante e travelling lateral |
| 24–25,7 s | Bônus 4 → capa do Guia da Família → páginas finais (589 \| 590) |
| 25,7–27 s | o livro fecha; a câmera recua sobre a capa |

Arquivos: `projeto_cinematic/cena_cinematic.html` (cena), `render.js` (captura; `PORT`, `START`, `END` para dividir), `wood_*.jpg` (texturas da mesa → `web/tex/`). Páginas: `lo/` 100 dpi, `hi/` 200 dpi, `xhi/` 300 dpi (28, 30, 32, 224, 552, 557, 574, 575, 576, 582). Cor final: `eq=contrast=1.03:saturation=1.05:brightness=0.012,colorbalance=rs=0.02:gs=0.006:bs=-0.025:rh=0.006:bh=-0.01,vignette=angle=PI/9,noise=alls=2:allf=t`.
