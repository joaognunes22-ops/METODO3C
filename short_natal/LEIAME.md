# SHORT_NATAL_PROFISSIONAL

YouTube Short natalino: 1080×1920, H.264 High, 25 fps (cadência original do material), AAC 48 kHz, 35,0 s (duração exata da narração).

## Arquivos
- `SHORT_NATAL_PROFISSIONAL.mp4`: vídeo final, com as legendas já gravadas na imagem.
- `SHORT_NATAL_PROFISSIONAL.ass`: legendas animadas (palavra a palavra, destaque em #FFD700).
- `SHORT_NATAL_PROFISSIONAL.srt`: legendas simples (podem ser enviadas como closed caption no YouTube).
- `narracao_palavras.json`: alinhamento por palavra da narração (faster-whisper medium).
- `plano_cenas.py`: projeto editável (cenas, reenquadramento, zoom, transições, partículas).
- `legendas.py`, `audio.py`, `render.py`: scripts de montagem.

## Re-renderizar
```bash
python3 legendas.py
python3 audio.py
python3 render.py <pasta_dos_videos_Parte_XX> <narracao.mp3>
```
Use `--preview` para gerar uma prévia rápida em 540×960.

A trilha de fundo e os efeitos sonoros são sintetizados por `audio.py` (composição original, sem direitos de terceiros).
