"""Trilha instrumental natalina ORIGINAL (sintetizada aqui, sem direitos de terceiros)
+ efeitos sonoros discretos. Saída: trilha_fundo.wav e sfx.wav (48 kHz, estéreo)."""
import os
import numpy as np
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
SR, DUR = 48000, 35.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def bell(f, dur, amp):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    # sino FM suave: parciais inarmônicas com decaimento exponencial
    s = (np.sin(2 * np.pi * f * tt + 1.2 * np.sin(2 * np.pi * f * 3.5 * tt) * np.exp(-tt * 4))
         * np.exp(-tt * 2.6) + 0.35 * np.sin(2 * np.pi * f * 2.0 * tt) * np.exp(-tt * 4.5))
    s[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return amp * s


def add(buf, sig, at, pan=0.0):
    i = int(at * SR)
    j = min(N, i + len(sig))
    if j <= i:
        return
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    buf[i:j, 0] += sig[: j - i] * l
    buf[i:j, 1] += sig[: j - i] * r


# ---------------- MÚSICA ----------------
music = np.zeros((N, 2))
bpm = 84
beat = 60 / bpm
bar = 4 * beat
# progressão I - vi - IV - V  em Ré maior (D, Bm, G, A) -> sensação acolhedora
prog = [(50, [62, 66, 69, 73]), (47, [62, 66, 69, 71]), (43, [62, 67, 71, 74]), (45, [61, 64, 69, 73])]
pos, k = 0.0, 0
while pos < DUR:
    root, chord = prog[k % 4]
    n = int(bar * SR) + int(0.6 * SR)
    tt = np.arange(n) / SR
    e = env_adsr(n, 0.5, 0.9)
    pad = np.zeros(n)
    for m in chord:
        f = hz(m)
        for det in (-0.12, 0.12):    # leve chorus
            pad += np.sin(2 * np.pi * f * (1 + det / 100) * tt) * 0.5
            pad += 0.12 * np.sin(2 * np.pi * 2 * f * (1 + det / 100) * tt)
    pad *= 0.045 * e
    bass = 0.10 * np.sin(2 * np.pi * hz(root - 12) * tt) * env_adsr(n, 0.08, 0.8)
    add(music, pad, pos, -0.2)
    add(music, pad, pos + 0.013, 0.2)
    add(music, bass, pos)
    # arpejo de sinos (celesta) em colcheias
    arp = chord + [chord[1] + 12, chord[2] + 12, chord[0] + 12, chord[2]]
    for s_i in range(8):
        add(music, bell(hz(arp[s_i] + 12), 1.6, 0.05), pos + s_i * beat / 2, 0.5 if s_i % 2 else -0.5)
    # guizos (sleigh bells) suaves nas batidas 2 e 4
    for b in (1, 3):
        n2 = int(0.18 * SR)
        nz = rng.standard_normal(n2)
        nz = np.diff(np.concatenate([[0], nz]))            # passa-altas simples
        jing = nz * np.exp(-np.arange(n2) / SR * 28) * 0.03
        add(music, jing, pos + b * beat, 0.3)
    pos += bar
    k += 1

# entrada e saída suaves da música
fade = np.ones(N)
fade[: int(0.6 * SR)] = np.linspace(0.3, 1, int(0.6 * SR))
fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR))
music *= fade[:, None]

# ---------------- SFX ----------------
sfx = np.zeros((N, 2))


def whoosh(at, dur=0.55, amp=0.16):
    n = int(dur * SR)
    nz = rng.standard_normal(n)
    # filtro passa-baixas variável (varredura) por média móvel de janela decrescente
    out = np.zeros(n)
    acc = 0.0
    for i in range(n):
        a = 0.02 + 0.5 * (i / n) ** 2
        acc += a * (nz[i] - acc)
        out[i] = acc
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    add(sfx, out * e * amp * 3, at - dur * 0.6, 0.0)


def shimmer(at, amp=0.06):
    notes = [86, 90, 93, 98, 102]
    for i, m in enumerate(notes):
        add(sfx, bell(hz(m), 1.4, amp), at + i * 0.055, -0.6 + 0.3 * i)


def impact(at, amp=0.22):
    n = int(0.6 * SR)
    tt = np.arange(n) / SR
    f = 70 * np.exp(-tt * 3) + 40
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7) * amp
    add(sfx, s, at)


shimmer(0.05, 0.05)        # abertura mágica
whoosh(11.54)              # entrada do trenó na lua
shimmer(12.70, 0.055)      # "detalhe MÁGICO"
shimmer(21.95, 0.05)       # "código MÁGICO"
impact(25.64)              # "Tudo por R$ 9,90"
whoosh(30.42, 0.45, 0.12)  # "Clique em Saiba Mais"
shimmer(33.95, 0.045)      # "vai EMOCIONAR"


def write(name, x):
    x = np.clip(x, -1, 1)
    with wave.open(os.path.join(HERE, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


write("trilha_fundo.wav", music / max(1e-9, np.abs(music).max()) * 0.8)
write("sfx.wav", sfx)
print("ok", np.abs(sfx).max())
