"""Plano de cenas do SHORT_NATAL_PROFISSIONAL.

Cada cena: (inicio_saida, fim_saida, parte, inicio_origem, cx0, cx1, z0, z1, velocidade, nota)
  - tempos de saída em segundos na timeline final (= tempo da narração)
  - cx = centro horizontal do recorte 9:16 (fração da largura 1920 da origem), animado cx0->cx1
  - z  = zoom digital (1.0 = recorte 608x1080 cheio), animado z0->z1 com easing
  - velocidade < 1 = câmera lenta suave (só em planos sem fala/rosto)
Cortes caem nas pausas/inícios de frase detectados na narração.
"""

SHOTS = [
    # --- GANCHO: "Imagine a criança esperando uma surpresa do Papai Noel"
    (0.00, 1.90, "03", 40.00, 0.57, 0.56, 1.06, 1.15, 1.0, "Noel soprando 'pó mágico' para a câmera"),
    (1.90, 3.56, "02", 26.00, 0.58, 0.58, 1.04, 1.13, 1.0, "close acolhedor do Noel olhando a câmera"),
    # --- "e o Natal passando sem aquele momento especial."  (tom melancólico)
    (3.56, 5.60, "06", 23.50, 0.64, 0.62, 1.12, 1.02, 1.0, "trenó se afastando no pôr do sol (zoom-out)"),
    (5.60, 7.92, "06", 32.00, 0.48, 0.48, 1.00, 1.07, 1.0, "silhueta do trenó sumindo no pôr do sol"),
    # --- "Às vezes, o que falta não é um presente caro, mas um detalhe mágico."
    (7.92, 10.30, "01", 26.00, 0.55, 0.57, 1.00, 1.08, 1.0, "Noel no trenó cheio de presentes"),
    (10.30, 11.54, "05", 5.00, 0.53, 0.53, 1.14, 1.05, 1.0, "punch-in: Noel com presente grande ('caro')"),
    (11.54, 13.90, "04", 29.00, 0.40, 0.62, 1.00, 1.06, 1.0, "trenó voando diante da lua ('detalhe mágico')"),
    # --- "Com a Prova Mágica do Polo Norte,"
    (13.90, 16.50, "09", 11.00, 0.66, 0.60, 1.00, 1.08, 0.85, "trenó correndo pela neve da Lapônia"),
    # --- "ela recebe uma carta personalizada,"
    (16.50, 18.00, "08", 3.30, 0.37, 0.37, 1.00, 1.10, 0.83, "carta 'Dear Santa' animada"),
    (18.00, 19.60, "08", 18.00, 0.62, 0.61, 1.00, 1.04, 1.0, "Noel de óculos lendo (close)"),
    # --- "certificado oficial"
    (19.60, 20.78, "04", 10.60, 0.50, 0.50, 1.12, 1.04, 1.0, "punch-in: Noel olhando a câmera, autoridade"),
    # --- "e um código mágico"
    (20.78, 22.64, "02", 38.20, 0.62, 0.61, 1.00, 1.07, 1.0, "Noel acenando / gesto mágico"),
    # --- "que mostra seu nome na lista dos bonzinhos."
    (22.64, 24.30, "08", 13.01, 0.33, 0.40, 1.00, 1.06, 0.73, "mapa-múndi com os pontos das crianças"),
    (24.30, 25.64, "02", 30.00, 0.58, 0.58, 1.06, 1.12, 1.0, "Noel sorrindo ('bonzinhos')"),
    # --- "Tudo por R$ 9,90"
    (25.64, 27.82, "04", 48.15, 0.62, 0.60, 1.14, 1.04, 1.0, "punch-in: Noel com o saco e a rena branca"),
    # --- "em arquivo digital para imprimir."
    (27.82, 30.42, "08", 7.12, 0.55, 0.55, 1.00, 1.08, 1.0, "Noel no escritório diante da tela digital"),
    # --- "Clique em Saiba Mais e"
    (30.42, 32.06, "05", 14.00, 0.32, 0.55, 1.04, 1.04, 1.0, "rena branca puxando o trenó (pan acompanha)"),
    # --- "prepare uma surpresa que vai emocionar."  (encerramento)
    (32.06, 33.60, "07", 53.80, 0.56, 0.60, 1.08, 1.00, 1.0, "vila natalina iluminada à noite"),
    (33.60, 35.00, "06", 56.50, 0.57, 0.53, 1.10, 1.00, 1.0, "Noel na cabana com a tocha (zoom-out final)"),
]

# Transições suaves (tempo do corte, duração). Demais cortes são secos, no ritmo da fala.
DISSOLVES = {3.56: 0.30, 32.06: 0.30, 33.60: 0.40}
FLASHES = {11.54: 0.16}          # brilho dourado discreto na entrada do "detalhe mágico"
FADE_OUT = 0.35                  # saída suave no último plano

# Janelas de partículas douradas (efeito natalino discreto, só em momentos "mágicos")
SPARKLES = [
    (0.00, 1.90, "hand"),      # pó mágico saindo da mão do Noel
    (11.54, 13.90, "sky"),     # trenó na lua
    (20.78, 22.64, "hand"),    # código mágico
    (32.06, 35.00, "sky"),     # encerramento
]

# Centro vertical do recorte quando há zoom (0.5 = meio). Viés para cima preserva rostos.
CY_DEFAULT = 0.44
CY = {0: 0.36}
