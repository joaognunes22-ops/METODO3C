# Avatar_Professora_UGC_FINAL_FLUIDO

Vídeo vertical 1080×1920, H.264 High, 30 fps, 15,0 s (450 quadros), sem áudio, `+faststart`.

## Como foi feito
O original tinha 12 imagens estáticas (1,25 s cada, cortes secos). Pipeline (CPU, sem GPU):

1. **Movimento corporal — RIFE 4.9 (ONNX)**: interpolação por fluxo óptico entre poses vizinhas,
   guiada por uma curva de tempo monotônica com velocidade contínua (sem pausas nas poses-chave).
   Coreografia: 0–3 s olhar/fala, 3–6 s mãos explicando, 6–9 s aponta para cima (pico ~7,3 s),
   9–12 s abaixa e gesticula, 12–15 s postura confortável.
2. **Rosto — LivePortrait (ONNX)**: sobre cada quadro, retargeting de expressão do próprio rosto
   (fala discreta com sílabas e pausas, 7 piscadas). Colado só na região do rosto com máscara suave
   e casamento de cor — identidade, cabelo, roupa e fundo vêm do original.
3. **Exportação**: Lanczos para 1080×1920, grão leve, libx264 CRF 16.

## Scripts (`scripts/`)
`stage1_rife.py` → `stage2_face.py plan` → `stage2_face.py <worker> <n>` → ffmpeg (ver `run_rest.sh`).
Modelos: `yuvraj108c/rife-onnx` (rife49) e `myn0908/Live-Portrait-ONNX` no HuggingFace.
