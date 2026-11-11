"""Gera legendas ASS (palavra a palavra, destaque amarelo #FFD700, entrada 'pop') e SRT
a partir do alinhamento real da narração (faster-whisper, word_timestamps)."""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
END = 35.00

words = json.load(open(os.path.join(HERE, "narracao_palavras.json")))

# Junta tokens do valor ("R" "$" "9" ",90") -> "R$ 9,90"
toks = []
i = 0
while i < len(words):
    w = words[i]
    if w["w"] == "R" and i + 3 < len(words) and words[i + 1]["w"] == "$":
        toks.append({"w": "R$ 9,90", "s": w["s"], "e": words[i + 3]["e"]})
        i += 4
        continue
    toks.append(dict(w))
    i += 1

# Grafia revisada (sem alterar a fala): nome do produto em maiúsculas iniciais
FIX = {"prova": "Prova", "mágica": "Mágica"}
for k, t in enumerate(toks):
    if t["w"] in FIX and 30 < k < 40:
        t["w"] = FIX[t["w"]]

# Grupos curtos acompanhando o ritmo da fala (índices de início de cada grupo)
GROUP_TEXT = [
    "Imagine a criança", "esperando uma surpresa", "do Papai Noel",
    "e o Natal passando", "sem aquele", "momento especial.",
    "Às vezes,", "o que falta", "não é um presente caro,", "mas um detalhe mágico.",
    "Com a Prova Mágica", "do Polo Norte,",
    "ela recebe uma carta", "personalizada,", "certificado oficial",
    "e um código mágico", "que mostra seu nome", "na lista dos bonzinhos.",
    "Tudo por R$ 9,90", "em arquivo digital", "para imprimir.",
    "Clique em Saiba Mais", "e prepare uma surpresa", "que vai emocionar.",
]
KEY = {"surpresa", "papai", "noel", "natal", "especial", "presente", "caro", "mágico",
       "prova", "polo", "norte", "carta", "personalizada", "certificado", "oficial",
       "código", "nome", "bonzinhos", "r$ 9,90", "digital", "imprimir",
       "saiba", "mais", "emocionar"}
# "mágica" só faz parte do nome do produto -> destacada junto com "Prova"
KEY.add("mágica")

groups, k = [], 0
for g in GROUP_TEXT:
    n = len(g.split()) - (1 if "R$" in g else 0)
    groups.append(toks[k:k + n])
    got = " ".join(t["w"] for t in toks[k:k + n])
    assert got == g, (got, g)
    k += n
assert k == len(toks), (k, len(toks))


def norm(w):
    return re.sub(r"[.,!?]", "", w).lower()


def ts(t):
    t = max(0, t)
    h, m = int(t // 3600), int(t % 3600 // 60)
    return f"{h}:{m:02d}:{t % 60:05.2f}"


def ts_srt(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


YEL = r"&H0000D7FF&"   # #FFD700 em BGR
WHT = r"&H00FFFFFF&"

head = f"""[Script Info]
Title: SHORT_NATAL_PROFISSIONAL
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Short,Inter Black,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H50000000,0,0,0,0,100,100,1,0,1,8,6,5,120,120,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
POS = r"\an5\pos(540,1310)\blur0.8"   # zona inferior segura: acima da descrição/botões do Shorts

ev, srt = [], []
for gi, g in enumerate(groups):
    g_start = g[0]["s"]
    nxt = groups[gi + 1][0]["s"] if gi + 1 < len(groups) else END
    g_end = nxt if nxt - g[-1]["e"] < 0.7 else g[-1]["e"] + 0.25
    srt.append(f"{gi + 1}\n{ts_srt(g_start)} --> {ts_srt(g_end)}\n{' '.join(t['w'] for t in g)}\n")
    for wi, w in enumerate(g):
        a = w["s"] if wi else g_start
        b = g[wi + 1]["s"] if wi + 1 < len(g) else g_end
        parts = []
        for wj, o in enumerate(g):
            txt = o["w"].upper()
            if wj == wi:
                pop = r"\fscx125\fscy125\t(0,110,\fscx107\fscy107)" if wi == 0 else r"\fscx114\fscy114\t(0,90,\fscx107\fscy107)"
                parts.append(r"{\c" + YEL + pop + "}" + txt
                             + r"{\c" + WHT + r"\fscx100\fscy100}")
            elif norm(o["w"]) in KEY and wj < wi:
                parts.append(r"{\c" + YEL + "}" + txt + r"{\c" + WHT + "}")
            else:
                parts.append(txt)
        intro = r"\fad(110,0)" if wi == 0 else ""
        ev.append(f"Dialogue: 0,{ts(a)},{ts(b)},Short,,0,0,0,,{{{POS}{intro}}}" + " ".join(parts))

open(os.path.join(HERE, "SHORT_NATAL_PROFISSIONAL.ass"), "w").write(head + "\n".join(ev) + "\n")
open(os.path.join(HERE, "SHORT_NATAL_PROFISSIONAL.srt"), "w").write("\n".join(srt))
print(len(groups), "grupos,", len(ev), "eventos")
