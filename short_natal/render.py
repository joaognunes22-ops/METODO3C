"""Monta o SHORT_NATAL_PROFISSIONAL.mp4 (1080x1920, H.264, AAC 48 kHz).

Uso: python3 render.py <pasta_dos_videos> <narracao.mp3> [--preview]
"""
import glob, math, os, subprocess, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from plano_cenas import SHOTS, DISSOLVES, FLASHES, FADE_OUT, SPARKLES, CY, CY_DEFAULT  # noqa: E402

SRC_DIR, NARR = sys.argv[1], sys.argv[2]
PREVIEW = "--preview" in sys.argv
FPS, DUR = 25, 35.0                        # 25 fps = cadência original do material
W, H = (540, 960) if PREVIEW else (1080, 1920)
SW, SH = 1920, 1080
NF = int(round(DUR * FPS))
rng = np.random.default_rng(3)


def src_path(part):
    return glob.glob(os.path.join(SRC_DIR, f"*Parte_{part}.mp4"))[0]


def ease(u):
    u = min(max(u, 0.0), 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * u)


def ease_out(u):
    u = min(max(u, 0.0), 1.0)
    return 1 - (1 - u) ** 3


# ---------- carregamento preguiçoso dos trechos de origem ----------
HANDLE = 0.5
cache = {}


def load(i):
    if i in cache:
        return cache[i]
    o0, o1, part, s0, *_rest = SHOTS[i]
    speed = SHOTS[i][8]
    a = max(0.0, s0 - HANDLE * speed)
    b = s0 + (o1 - o0 + HANDLE) * speed
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-i", src_path(part), "-t", f"{b - a:.3f}",
           "-an", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, SH, SW, 3)
    cache[i] = (a, frames)
    return cache[i]


def shot_frame(i, t):
    """Quadro 9:16 do plano i no tempo de saída t (pode cair nas 'alças' antes/depois)."""
    o0, o1, part, s0, cx0, cx1, z0, z1, speed, _ = SHOTS[i]
    a, frames = load(i)
    u = (t - o0) / (o1 - o0)
    # punch-in (z0 > z1 com corte seco) usa ease-out rápido; demais, easing suave
    if z0 > z1 and (z0 - z1) > 0.07:
        z = z1 + (z0 - z1) * (1 - ease_out(u / 0.45 if u < 0.45 else 1.0)) * 0.6 + \
            (z0 - z1) * 0.4 * (1 - ease(u))
    else:
        z = z0 + (z1 - z0) * ease(u)
    cx = (cx0 + (cx1 - cx0) * ease(u)) * SW
    ch = SH / z
    cw = ch * 9 / 16
    cx = min(max(cx, cw / 2), SW - cw / 2)
    cy = min(max(CY.get(i, CY_DEFAULT) * SH, ch / 2), SH - ch / 2)
    st = s0 + (t - o0) * speed
    fi = (st - a) * 25.0
    f0 = int(math.floor(fi))
    f0 = min(max(f0, 0), len(frames) - 1)
    f1 = min(f0 + 1, len(frames) - 1)
    fr = fi - math.floor(fi)
    if speed != 1.0 and fr > 0.05 and f1 != f0:
        img = (frames[f0].astype(np.float32) * (1 - fr) + frames[f1].astype(np.float32) * fr).astype(np.uint8)
    else:
        img = frames[f0 if fr < 0.5 or speed != 1.0 else f1]
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    pil = Image.fromarray(img).resize((W, H), Image.LANCZOS, box=box)
    return np.asarray(pil).astype(np.float32)


# ---------- partículas douradas ----------
def make_sprite(r):
    y, x = np.mgrid[-r:r + 1, -r:r + 1]
    d2 = (x * x + y * y) / (r * r)
    core = np.exp(-d2 * 18)
    halo = np.exp(-d2 * 4) * 0.35
    a = np.clip(core + halo, 0, 1)
    col = np.array([255, 214, 120], np.float32)
    return a[..., None] * col[None, None, :]


SPR = {r: make_sprite(r) for r in (6, 9, 13, 18)}
SC = W / 1080


def particles(win):
    t0, t1, kind = win
    n = 46 if kind == "sky" else 38
    ps = []
    for _ in range(n):
        if kind == "hand":
            x, y = rng.uniform(380, 700), rng.uniform(620, 980)
            vx, vy = rng.uniform(-60, 60), rng.uniform(-140, -40)
        else:
            x, y = rng.uniform(0, 1080), rng.uniform(150, 1500)
            vx, vy = rng.uniform(-15, 15), rng.uniform(-50, -10)
        ps.append((x, y, vx, vy, rng.uniform(0, t1 - t0), rng.choice(list(SPR)),
                   rng.uniform(0, 6.28), rng.uniform(3, 7)))
    return ps


PARTS = [particles(w) for w in SPARKLES]


def draw_sparkles(img, t):
    for (t0, t1, kind), ps in zip(SPARKLES, PARTS):
        if not (t0 <= t < t1):
            continue
        g = min(1.0, (t - t0) / 0.3, (t1 - t) / 0.4)
        for x, y, vx, vy, birth, r, ph, tw in ps:
            age = (t - t0) - birth * (0.6 if kind == "hand" else 0.0)
            if age < 0:
                continue
            life = 1.6 if kind == "hand" else 99
            if age > life:
                continue
            fade = math.sin(math.pi * min(age / life, 1)) if kind == "hand" else 1.0
            a = g * fade * (0.45 + 0.55 * (0.5 + 0.5 * math.sin(ph + tw * (t - t0)))) * 0.75
            px = int((x + vx * age) * SC)
            py = int((y + vy * age) * SC)
            rr = max(2, int(r * SC))
            spr = SPR[r] if SC == 1 else make_sprite(rr)
            rr = spr.shape[0] // 2
            x0, y0 = px - rr, py - rr
            x1, y1 = x0 + spr.shape[1], y0 + spr.shape[0]
            if x1 <= 0 or y1 <= 0 or x0 >= W or y0 >= H:
                continue
            sx0, sy0 = max(0, -x0), max(0, -y0)
            sx1, sy1 = spr.shape[1] - max(0, x1 - W), spr.shape[0] - max(0, y1 - H)
            img[max(0, y0):min(H, y1), max(0, x0):min(W, x1)] += spr[sy0:sy1, sx0:sx1] * a
    return img


# ---------- montagem ----------
def shot_index(t):
    for i, s in enumerate(SHOTS):
        if s[0] <= t < s[1]:
            return i
    return len(SHOTS) - 1


ass = os.path.join(HERE, "SHORT_NATAL_PROFISSIONAL.ass")
vf = []
if not PREVIEW:
    # brilho cinematográfico (bloom) suave + grade natalina quente + vinheta + nitidez pós-upscale
    vf.append("split[a][b];[b]gblur=sigma=28,curves=all='0/0 0.55/0.08 1/1'[g];"
              "[a][g]blend=all_mode=screen:all_opacity=0.22")
vf.append("eq=contrast=1.06:saturation=1.14:gamma=0.98")
vf.append("colorbalance=rs=0.035:bs=-0.03:rm=0.03:gm=0.0:bm=-0.035:rh=0.02:bh=-0.035")
vf.append("vignette=angle=PI/5.5")
if not PREVIEW:
    vf.append("unsharp=5:5:0.55:5:5:0.0")
    vf.append(f"ass='{ass}'")
else:
    vf.append(f"scale=1080:1920,ass='{ass}',scale=540:960")
vf.append("format=yuv420p")

out = os.path.join(HERE, "SHORT_NATAL_PROFISSIONAL.mp4" if not PREVIEW else "preview.mp4")
music = os.path.join(HERE, "trilha_fundo.wav")
sfx = os.path.join(HERE, "sfx.wav")
af = ("[1:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[v][vk];"
      "[2:a]volume=0.20[m];"
      "[m][vk]sidechaincompress=threshold=0.04:ratio=4:attack=20:release=400[md];"
      "[3:a]volume=1.0[s];"
      "[v][md][s]amix=inputs=3:duration=first:normalize=0,"
      "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout]")
enc = ["ffmpeg", "-v", "error", "-y",
       "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
       "-i", NARR, "-i", music, "-i", sfx,
       "-filter_complex", f"[0:v]{','.join(vf)}[vout];{af}",
       "-map", "[vout]", "-map", "[aout]",
       "-c:v", "libx264", "-preset", "veryfast" if PREVIEW else "slow",
       "-crf", "28" if PREVIEW else "16", "-profile:v", "high", "-pix_fmt", "yuv420p",
       "-r", str(FPS), "-g", str(FPS * 2),
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
       "-t", f"{DUR:.3f}", "-movflags", "+faststart", out]
proc = subprocess.Popen(enc, stdin=subprocess.PIPE)

for n in range(NF):
    t = n / FPS
    i = shot_index(t)
    img = shot_frame(i, t)
    # dissolves
    for cut, d in DISSOLVES.items():
        if cut - d / 2 <= t < cut + d / 2:
            j = shot_index(cut)
            k = j - 1
            w = ease((t - (cut - d / 2)) / d)
            img = shot_frame(k, t) * (1 - w) + shot_frame(j, t) * w
    # flash dourado curto
    for cut, d in FLASHES.items():
        if cut <= t < cut + d:
            w = 1 - (t - cut) / d
            img = img * (1 - 0.45 * w) + np.array([255, 236, 190], np.float32) * 0.45 * w
    img = draw_sparkles(img, t)
    if t > DUR - FADE_OUT:
        img *= max(0.0, (DUR - t) / FADE_OUT) * 0.85 + 0.15
    proc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
    # libera trechos já usados
    for key in list(cache):
        if SHOTS[key][1] + 0.6 < t:
            del cache[key]
    if n % 100 == 0:
        print(f"quadro {n}/{NF}", flush=True)

proc.stdin.close()
proc.wait()
print("render:", out, "rc", proc.returncode)
