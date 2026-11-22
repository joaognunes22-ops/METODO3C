# Sementes Kids — Método Semente 3C™ | Vídeo folheando (base limpa)

**Arquivo:** `Sementes_Kids_Folheando_9x16.mp4`. 1080×1920 (9:16), 30 fps, 25,0 s, H.264 + AAC.

O vídeo não tem narração, música, legendas nem texto de anúncio. O áudio traz só sons sutis de papel e o ambiente da sala.

## Páginas usadas (todas do PDF "Sementes Kids - 400 Historinhas", sem alteração)
| Momento | Conteúdo | Página do PDF |
|---|---|---|
| 0–3 s | Capa "Historinhas Bíblicas para Plantar Valores" | 3 |
| 3–8 s | Primeiras histórias: Leãozinho, Ovelhinha, Pintinho | 6, 13, 15 |
| 8–14 s | Variedade: Coelhinho, Texuguinho, Castor, Girafinha | 20, 24, 27, 31 |
| 14–20 s | Atividades: Hora da Conversa, colorir o Leãozinho, labirinto da Ovelhinha, jogo da memória | 7, 193, 204, 251 |
| 20–25 s | Folhas espalhadas na mesa | 6, 13, 24, 251 |

As 8 imagens PNG do ZIP foram conferidas com o PDF e são idênticas. As texturas das páginas foram renderizadas direto do PDF, em 200 dpi.

## Limitações
- **Mão:** não há mão realista no vídeo. Gerar mãos anatomicamente corretas exige modelos de vídeo generativo e GPU, que este ambiente não tem. As folhas se movem como se alguém as levantasse pelo canto, sem nenhuma mão deformada na tela.
- **Resolução:** o vídeo foi produzido em 1080p, não em 4K.
- **Sons de papel:** foram sintetizados, não gravados.

## Projeto
A pasta `projeto/` guarda os arquivos usados para gerar o vídeo:
- `index.html`: a cena em three.js.
- `render.js`: o script de captura com Playwright.
- `foley.py`: o script que gera o áudio.
