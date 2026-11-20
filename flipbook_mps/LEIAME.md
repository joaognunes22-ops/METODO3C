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
