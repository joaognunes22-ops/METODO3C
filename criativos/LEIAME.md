# MPS_Criativo_01_UGC_Final

1080×1920 (9:16) · H.264 High · 30 fps · AAC 48 kHz · **35,000 s** (1050 quadros) · narração a −14,8 LUFS · sem música.

## Narração
Original de 41,2 s. Pausas encurtadas (7 pausas entre frases de 0,36–0,49 s → 0,22 s; 10 micropausas → 0,12 s) = 38,9 s; depois `atempo` 1,118× (tom preservado) = 34,8 s. Nenhuma palavra cortada (conferido por nova transcrição do vídeo final).

## Cenas
| tempo | fala | imagem |
|---|---|---|
| 0–5,1 | hook | vídeo B (menino, peneira e bolinhas) |
| 5,1–12,4 | dor | vídeo A (mãos do adulto, menina animada) + vídeo B (se afasta) |
| 12,4–15,4 | "E o pior?" | vídeo A, ponto de vista dos pais |
| 15,4–19,1 | virada | Ft3 → L4 (dissolvência de 0,4 s) |
| 19,1–21,3 | produto | Ft1 (capa) |
| 21,3–25,0 | 500 atividades / 3 níveis | Ft2 descendo até Simplificado/Padrão/Ampliado + selos |
| 25,0–28,6 | casa/escola, ritmo | L3, L1 |
| 28,6–31,5 | R$ 9,90 | Ft4 (kit + capas dos bônus) |
| 31,5–35,0 | CTA | fechamento do flipbook cinematográfico + cartão final |

Não usadas: L2 e L5 (mostram páginas que não existem no PDF).

`projeto_ugc/`: `audio.py` (narração), `words_map.py` (tempos das legendas), `compose.py` (montagem).

---

# MPS_Criativo_01_UGC_Versao_Profissional

Mesma narração, legendas, oferta e CTA; 1080×1920, H.264 + AAC, 30 fps, 35,000 s.

- **Fotos estáticas** (antes: zoom de 7–10 % + deslocamento com aceleração em todas; Ft2 com +29 % e diagonal). Só a capa (Ft1) tem aproximação linear de 100→103 %. Ft2 mostra a página inteira com os 3 níveis visíveis; Ft4 usa um enquadramento fixo que exclui o rosto cortado.
- **Vídeos sem zoom artificial** (antes alternava −7/+5/−4/+4/+6/−4/+5 %). Hook virou uma tomada contínua do vídeo B (6,28–11,38 s), que termina antes do corte interno do vídeo-fonte (11,4 s).
- **Transições:** dissolvências curtas nas trocas de locação e de foto (0,20 s em 5,1/10,4; 0,30 s em 12,4→foto e 15,4; 0,25 s entre fotos; 0,30 s para o mockup). Cortes secos só dentro do mesmo vídeo (6,7 e 8,2 s), na troca de frase.
- **Harmonização leve** de exposição e balanço de branco por cena (ganho ±7 %, 35–40 % em direção à média).
- Áudio idêntico (md5) ao da versão anterior.
