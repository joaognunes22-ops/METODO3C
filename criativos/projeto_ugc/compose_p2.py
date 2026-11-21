# MPS_Criativo_01_UGC — compositor quadro a quadro (1080x1920, 30 fps), narração como referência
import sys, os, json, subprocess, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W_DIR = sys.argv[1]; OUT = sys.argv[2]; ONLY = [float(x) for x in sys.argv[3:]]   # tempos para prévia
U = '/root/.claude/uploads/a41b6b8c-ab4b-53e1-b488-cddf7f487b38'
W, H, FPS, DUR = 1080, 1920, 30, 35.0
NF = int(round(DUR * FPS))
VA, VB = f'{W_DIR}/vA.mp4', f'{W_DIR}/vB.mp4'
FLIP = '/home/user/METODO3C/flipbook_mps/MPS_Flipbook_Cinematic_9x16.mp4'
PH = {k: f'{U}/{v}-image.png' for k, v in dict(L3='9271c266', Ft4='710c93a8', Ft1='f148ceda', L1='250c67b0', L4='c2f4c181', Ft3='28219a57', Ft2='c758dcce').items()}
F_BLACK = '/usr/share/fonts/opentype/inter/Inter-Black.otf'
F_XB = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
F_B = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
TEAL, CORAL, YEL = (18, 140, 130), (240, 104, 82), (255, 214, 74)
ease = lambda u: 0.5 - 0.5 * math.cos(math.pi * min(max(u, 0), 1))

# ---------------- cenas: (início, fim, fonte, parâmetros) ----------------
# vídeo: ('vid', arquivo, t_origem, zoom0, zoom1, cx, cy)   foto: ('img', chave, z0, cx0, cy0, z1, cx1, cy1)
SHOTS = [   # sem zoom artificial nos vídeos; fotos estáticas (exceto capa: 100→103% linear)
    (0.00, 5.10, ('vid', VB, 6.28, 1.0, 1.0, 0.50, 0.46)),      # HOOK: tomada contínua até antes do corte interno do vídeo-fonte (11,4 s)
    (5.10, 6.70, ('vid', VA, 9.20, 1.0, 1.0, 0.50, 0.50)),      # "separa tudo com carinho"
    (6.70, 8.20, ('vid', VA, 5.60, 1.0, 1.0, 0.50, 0.50)),      # "começa animado"
    (8.20, 10.40, ('vid', VA, 15.20, 1.0, 1.0, 0.50, 0.50)),    # "abandona a atividade"
    (10.40, 12.40, ('vid', VB, 14.00, 1.0, 1.0, 0.50, 0.46)),   # "volta pro celular"
    (12.40, 15.40, ('vid', VA, 17.60, 1.0, 1.0, 0.50, 0.50)),   # "E o pior?"
    (15.40, 17.30, ('img', 'Ft3', 1.0, 0.50, 0.50, 1.0, 0.50, 0.50)),
    (17.30, 19.10, ('img', 'L4', 1.0, 0.50, 0.50, 1.0, 0.50, 0.50)),
    (19.10, 21.30, ('img', 'Ft1', 1.0, 0.50, 0.50, 1.03, 0.50, 0.50)),   # capa: única aproximação, 3 %
    (21.30, 25.00, ('img', 'Ft2', 1.0, 0.50, 0.50, 1.0, 0.50, 0.50)),    # página inteira, 3 níveis visíveis
    (25.00, 26.85, ('img', 'L3', 1.0, 0.50, 0.50, 1.0, 0.50, 0.50)),
    (26.85, 28.62, ('img', 'L1', 1.0, 0.50, 0.50, 1.0, 0.50, 0.50)),
    (28.62, 31.55, ('img', 'Ft4', 1.25, 0.50, 0.68, 1.25, 0.50, 0.68)),  # kit + capas dos bônus (sem rosto cortado)
    (31.55, 35.00, ('flip', FLIP, 23.55)),
]
# transição de entrada de cada cena (s): 0 = corte seco intencional (mesmo vídeo, sincronizado com a fala)
XIN = {1: 0.20, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0, 6: 0.0, 7: 0.25, 8: 0.25, 9: 0.25, 10: 0.25, 11: 0.25, 12: 0.25, 13: 0.30}

# ---------------- legendas (texto exato da narração; tempos do alinhamento) ----------------
KEY = {'insistir', 'mesmas', 'atividades', 'interesse.', 'carinho.', 'animado,', 'abandona', 'celular.', 'pior?', 'diferente.',
       'cada', 'momento', 'Meu', 'Pequeno', 'Singular.', '500', 'ilustradas,', 'três', 'níveis', 'casa', 'escola,', 'ritmo', 'R$', '9,90.'}
CAPS = [  # (ini, fim, texto, posição y do centro)
    (0.00, 2.33, 'Pare de insistir nas mesmas atividades', 'hook'),
    (2.36, 5.05, 'se você quer que seu filho realmente se interesse.', 1180),
    (5.18, 6.72, 'Você separa tudo com carinho.', 1110),
    (6.78, 7.96, 'Ele começa animado,', 1110),
    (7.98, 10.80, 'mas minutos depois abandona a atividade', 1110),
    (10.82, 12.40, 'e volta pro celular.', 1180),
    (12.45, 13.02, 'E o pior?', 1110),
    (13.08, 15.35, 'Você fica sem saber o que fazer diferente.', 1110),
    (15.53, 17.60, 'Mas e se existisse uma atividade', 420),
    (17.65, 19.06, 'para cada momento dele?', 790),
    (19.13, 21.26, 'Conheça o Meu Pequeno Singular.', 420),
    (21.34, 23.40, 'São 500 atividades ilustradas,', 470),
    (23.45, 25.03, 'com três níveis de desafio', 470),
    (25.00, 26.82, 'para usar em casa ou na escola,', (1010, 54)),
    (26.84, 28.60, 'respeitando o ritmo da criança.', 1180),
    (28.62, 31.52, 'Tudo por apenas R$ 9,90.', 430),
    # 32,0–35,0: "Clique em Saiba Mais e conheça o kit completo." — exibido no cartão final (botão + selo)
]
CHIPS = [  # (ini, fim, texto, y)
    (21.55, 23.40, '500 ATIVIDADES ILUSTRADAS', 320),
    (23.60, 25.03, '3 NÍVEIS DE DESAFIO', 320),
    (25.20, 26.82, 'PARA CASA OU ESCOLA', 290),
]

# ---------------- utilidades ----------------
def font(path, size): return ImageFont.truetype(path, size)
def cover_crop(img, z, cx, cy):
    """recorta 9:16 com zoom z (1 = cobre o quadro) centrado em (cx, cy) normalizados; retorna 1080x1920"""
    iw, ih = img.size; s = max(W / iw, H / ih) * z
    vw, vh = W / s, H / s
    x0 = min(max(cx * iw - vw / 2, 0), iw - vw); y0 = min(max(cy * ih - vh / 2, 0), ih - vh)
    return img.transform((W, H), Image.EXTENT, (x0, y0, x0 + vw, y0 + vh), Image.BICUBIC)

_vcache = {}
def vid_frames(path, t0, n, upscale_sharpen=False):
    key = (path, round(t0, 3), n)
    if key in _vcache: return _vcache[key]
    w, h = map(int, subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip().split(','))
    vf = f'fps={FPS}'
    if w < 1000: vf += ',scale=1080:1920:flags=lanczos,unsharp=5:5:0.6'; w, h = 1080, 1920
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t0:.3f}', '-i', path, '-frames:v', str(n), '-vf', vf, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    fr = [Image.frombuffer('RGB', (w, h), raw[i * w * h * 3:(i + 1) * w * h * 3]) for i in range(len(raw) // (w * h * 3))]
    while len(fr) < n: fr.append(fr[-1])
    _vcache[key] = fr; return fr

_icache = {}
def photo(k):
    if k not in _icache: _icache[k] = Image.open(PH[k]).convert('RGB')
    return _icache[k]

def shot_frame(i, t):
    t0, t1, src = SHOTS[i]; u = min(max((t - t0) / (t1 - t0), 0), 1); e = u   # velocidade constante
    if src[0] == 'vid':
        _, path, ts, z0, z1, cx, cy = src
        n = int(round((t1 - t0 + 0.4) * FPS)) + 2
        fr = vid_frames(path, ts, n)[min(int(round((t - t0) * FPS)), n - 1)]
        return grade(cover_crop(fr, z0 + (z1 - z0) * e, cx, cy), i)
    if src[0] == 'img':
        _, k, z0, cx0, cy0, z1, cx1, cy1 = src
        return grade(cover_crop(photo(k), z0 + (z1 - z0) * e, cx0 + (cx1 - cx0) * e, cy0 + (cy1 - cy0) * e), i)
    if src[0] == 'flip':
        n = int(round((t1 - t0) * FPS)) + 2
        return vid_frames(src[1], src[2], n)[min(int(round((t - t0) * FPS)), n - 1)].copy()

_gcache = {}
REF = np.array([0.0, 0.0, 0.0])
def _shot_mean(i):
    t0, t1, src = SHOTS[i]; tm = (t0 + t1) / 2
    if src[0] == 'vid': im = cover_crop(vid_frames(src[1], src[2], int(round((t1 - t0 + 0.4) * FPS)) + 2)[int((tm - t0) * FPS)], 1.0, src[5], src[6])
    elif src[0] == 'img': im = cover_crop(photo(src[1]), src[2], src[3], src[4])
    else: return None
    a = np.asarray(im.resize((108, 192)), np.float32) / 255; return a.reshape(-1, 3).mean(0)
def grade(im, i):
    if i not in _gcache:
        means = [m for m in (_shot_mean(k) for k in range(len(SHOTS))) if m is not None]
        target = np.mean(means, 0); m = _shot_mean(i)
        if m is None: _gcache[i] = None
        else:
            lum_t, lum_m = target.mean(), m.mean()
            g = np.clip((lum_t / lum_m) ** 0.35, 0.93, 1.07)                       # aproxima a exposição (35 %)
            wb = np.clip((target / target.mean()) / (m / m.mean()), 0.94, 1.06) ** 0.4   # aproxima o balanço de branco (40 %)
            _gcache[i] = (g * wb).astype(np.float32)
    k = _gcache[i]
    if k is None or np.allclose(k, 1, atol=0.004): return im
    a = np.asarray(im, np.float32) * k
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

# ---------------- desenho de texto ----------------
def wrap(text, fnt, maxw, draw):
    words = text.split(); lines = ['']
    for w in words:
        cand = (lines[-1] + ' ' + w).strip()
        if draw.textlength(cand, font=fnt) <= maxw: lines[-1] = cand
        else: lines.append(w)
    return lines

def draw_caption(img, text, yc, hook=False):
    d = ImageDraw.Draw(img)
    size = 76 if hook else 60
    if isinstance(yc, tuple): yc, size = yc          # linha única com tamanho próprio
    fnt = font(F_BLACK if hook else F_XB, size)
    lines = wrap(text, fnt, 900 if hook else (1020 if size < 60 else 940), d)[:2]
    if len(wrap(text, fnt, 940, d)) > 2 and size >= 60: lines = wrap(text, font(F_XB, 52), 960, d); fnt = font(F_XB, 52); size = 52
    lh = int(size * 1.18); y = (900 if hook else yc) - lh * len(lines) / 2
    shadow = Image.new('L', img.size, 0); sd = ImageDraw.Draw(shadow)
    for li, line in enumerate(lines):
        x = (W - d.textlength(line, font=fnt)) / 2
        sd.text((x + 3, y + li * lh + 5), line, font=fnt, fill=170, stroke_width=8, stroke_fill=170)
    img.paste((0, 0, 0), (0, 0), shadow.filter(ImageFilter.GaussianBlur(7)))
    d = ImageDraw.Draw(img)
    for li, line in enumerate(lines):
        x = (W - d.textlength(line, font=fnt)) / 2
        for w in line.split(' '):
            col = YEL if (w in KEY or w.rstrip('.,?') in {k.rstrip('.,?') for k in KEY}) else (255, 255, 255)
            d.text((x, y + li * lh), w, font=fnt, fill=col, stroke_width=6 if hook else 5, stroke_fill=(20, 20, 20))
            x += d.textlength(w + ' ', font=fnt)

def rounded(img, box, r, fill, shadow=True):
    if shadow:
        sh = Image.new('L', img.size, 0); ImageDraw.Draw(sh).rounded_rectangle([box[0] + 4, box[1] + 10, box[2] + 4, box[3] + 10], r, fill=110)
        img.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(14)))
    ImageDraw.Draw(img).rounded_rectangle(box, r, fill=fill)

def draw_chip(img, text, y, a):
    if a <= 0: return
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); fnt = font(F_BLACK, 50)
    d = ImageDraw.Draw(layer); tw = d.textlength(text, font=fnt); dy = int((1 - a) * 18)
    box = [(W - tw) / 2 - 38, y - 44 + dy, (W + tw) / 2 + 38, y + 44 + dy]
    base = Image.new('RGB', img.size); base.paste(img); rounded(base, box, 44, TEAL)
    ImageDraw.Draw(base).text(((W - tw) / 2, y - 31 + dy), text, font=fnt, fill=(255, 255, 255))
    img.paste(Image.blend(img, base, a))

def end_card(img, t):
    a = lambda t0: ease((t - t0) / 0.25)
    # gradiente escuro suave no topo para legibilidade do título
    g = np.zeros((H, W), np.float32); g[:620] = np.linspace(0.55, 0, 620)[:, None]
    dark = Image.fromarray((g * 255 * a(31.55)).astype(np.uint8))
    img.paste((20, 14, 8), (0, 0), dark)
    # topo: nome do produto + selo
    if a(31.60) > 0:
        base = img.copy(); d = ImageDraw.Draw(base)
        f1 = font(F_BLACK, 74); s = 'MEU PEQUENO SINGULAR'; tw = d.textlength(s, font=f1)
        sh = Image.new('L', img.size, 0); ImageDraw.Draw(sh).text(((W - tw) / 2 + 3, 268), s, font=f1, fill=200, stroke_width=10, stroke_fill=200)
        base.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(10)))
        ImageDraw.Draw(base).text(((W - tw) / 2, 262), s, font=f1, fill=(255, 255, 255), stroke_width=3, stroke_fill=(30, 30, 30))
        img.paste(Image.blend(img, base, a(31.60)))
    if a(31.78) > 0: draw_chip(img, 'KIT DIGITAL COMPLETO', 400, a(31.78))
    # preço
    if a(31.66) > 0:
        base = img.copy(); f2 = font(F_XB, 40); f3 = font(F_BLACK, 104)
        d = ImageDraw.Draw(base); w2 = d.textlength('APENAS', font=f2); w3 = d.textlength('R$ 9,90', font=f3)
        bw = max(w2, w3) + 110; box = [(W - bw) / 2, 905, (W + bw) / 2, 1085]
        rounded(base, box, 36, (255, 255, 255))
        d = ImageDraw.Draw(base); d.text(((W - w2) / 2, 920), 'APENAS', font=f2, fill=(70, 70, 70)); d.text(((W - w3) / 2, 958), 'R$ 9,90', font=f3, fill=CORAL)
        img.paste(Image.blend(img, base, a(31.66)))
    # botão
    if a(32.00) > 0:
        base = img.copy(); f4 = font(F_BLACK, 50); s = 'CLIQUE EM SAIBA MAIS'
        d = ImageDraw.Draw(base); tw = d.textlength(s, font=f4)
        pulse = 1 + 0.025 * math.sin(max(0, t - 32.6) * 5.0) if t > 32.6 else 1
        bw, bh = (tw + 96) * pulse, 108 * pulse; box = [(W - bw) / 2, 1160 - bh / 2, (W + bw) / 2, 1160 + bh / 2]
        rounded(base, box, bh / 2, TEAL)
        ImageDraw.Draw(base).text(((W - tw) / 2, 1160 - 31), s, font=f4, fill=(255, 255, 255))
        img.paste(Image.blend(img, base, a(32.00)))

# ---------------- render ----------------
def render(fi):
    t = fi / FPS
    cur = [i for i, (a, b, _) in enumerate(SHOTS) if a <= t < b]
    i = max(cur) if cur else len(SHOTS) - 1
    img = shot_frame(i, t)
    x = XIN.get(i, 0)
    if x and t < SHOTS[i][0] + x:
        prev = shot_frame(i - 1, t); img = Image.blend(prev, img, ease((t - SHOTS[i][0]) / x))
    for a, b, txt, y in CAPS:
        if a <= t < b: draw_caption(img, txt, y if y != 'hook' else 900, hook=(y == 'hook'))
    for a, b, txt, y in CHIPS:
        if a <= t < b: draw_chip(img, txt, y, min(ease((t - a) / 0.2), ease((b - t) / 0.12)))
    if t >= 31.55: end_card(img, t)
    return img

if ONLY:
    os.makedirs(OUT, exist_ok=True)
    for t in ONLY: render(int(round(t * FPS))).save(f'{OUT}/p{t:05.2f}.png')
else:
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-i', f'{W_DIR}/narr_final.wav', '-filter_complex', '[1:a]apad=whole_dur=35[a]', '-map', '0:v', '-map', '[a]',
                            '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.1', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
                            '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', '35', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
    for fi in range(NF):
        enc.stdin.write(render(fi).tobytes())
        if fi % 150 == 0: print(fi, flush=True)
    enc.stdin.close(); enc.wait(); print('ok')
