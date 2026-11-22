# Som das folhas sintetizado (ruído filtrado), sincronizado com a animação; ambiente de sala discreto
import numpy as np, wave, subprocess, sys
OUT = sys.argv[1]; SR = 48000; DUR = 25.0; N = int(SR * DUR)
rng = np.random.default_rng(4)
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    return np.fft.irfft(X * g, len(x))
def put(buf, t, x, gain):
    i = int(t * SR); j = min(N, i + len(x)); buf[i:j] += gain * x[:j - i]
L = np.zeros(N); R = np.zeros(N)
def crinkle(t, d, gain, pan=0.0):
    n = int(d * SR); x = np.zeros(n)
    k = rng.integers(0, n, int(90 * d)); x[k] = rng.uniform(-1, 1, len(k)) * rng.uniform(0.3, 1, len(k))
    x = band(x + rng.normal(0, 0.05, n), 1800, 9000); x *= np.hanning(n) ** 0.5
    put(L, t, x, gain * (1 - pan)); put(R, t, x, gain * (1 + pan))
def swish(t, d, gain, pan=0.0):
    n = int(d * SR); u = np.linspace(0, 1, n)
    lo = band(rng.normal(0, 1, n), 300, 1400); hi = band(rng.normal(0, 1, n), 1500, 6000)
    env = np.sin(np.pi * u) ** 1.5; x = (lo * (1 - u) + hi * u * 0.7) * env
    put(L, t, x, gain * (1 - pan)); put(R, t, x, gain * (1 + pan))
def land(t, gain, pan=0.0):
    n = int(0.22 * SR); u = np.arange(n) / SR
    thump = band(rng.normal(0, 1, n), 120, 700) * np.exp(-u / 0.025)
    slide = band(rng.normal(0, 1, n), 900, 4000) * np.exp(-u / 0.07) * 0.5
    x = thump + slide; put(L, t, x, gain * (1 - pan)); put(R, t, x, gain * (1 + pan))
def slide(t, d, gain, pan=0.0):
    n = int(d * SR); u = np.linspace(0, 1, n)
    x = band(rng.normal(0, 1, n), 700, 3500) * (np.sin(np.pi * u) ** 2)
    put(L, t, x, gain * (1 - pan)); put(R, t, x, gain * (1 + pan))
# capa sendo ajeitada
slide(0.5, 1.7, 0.10, 0.05)
# viradas (mesmos tempos da animação: FD = 0,95 s)
FLIPS = [3.0, 4.6, 6.2, 8.0, 9.4, 10.8, 12.2, 13.8, 15.4, 17.0, 18.6]
for i, t0 in enumerate(FLIPS):
    v = rng.uniform(0.85, 1.1); p = rng.uniform(-0.15, 0.15)
    crinkle(t0 + 0.02, 0.28, 0.20 * v, p); swish(t0 + 0.25, 0.62, 0.16 * v, p); land(t0 + 0.86, 0.22 * v, p)
# folhas espalhadas no final
for t0 in [20.05, 20.45, 20.85, 21.25]:
    v = rng.uniform(0.8, 1.0); crinkle(t0, 0.18, 0.12 * v); slide(t0 + 0.05, 0.8, 0.12 * v); land(t0 + 0.82, 0.15 * v)
# ambiente de sala (ruído rosa muito baixo)
w = rng.normal(0, 1, N); W_ = np.fft.rfft(w); f = np.fft.rfftfreq(N, 1 / SR); W_[1:] /= np.sqrt(f[1:]); W_[f < 40] = 0
room = np.fft.irfft(W_, N); room = room / np.abs(room).max() * 0.006
L += room; R += room
st = np.stack([L, R], 1); st = st / max(1e-9, np.abs(st).max()) * 0.5
fade = int(0.3 * SR); st[:fade] *= np.linspace(0, 1, fade)[:, None]; st[-fade:] *= np.linspace(1, 0, fade)[:, None]
with wave.open(OUT + '.raw.wav', 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((st * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', OUT + '.raw.wav', '-af', 'loudnorm=I=-27:TP=-6:LRA=11', '-ar', '48000', OUT], check=True)
print('ok')
