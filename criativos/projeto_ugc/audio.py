# Narração: encurta pausas (sem cortar palavras), depois atempo para caber em 35 s
import numpy as np,subprocess,json,wave,sys
W=sys.argv[1]; SR=48000; TARGET=34.80
a=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",f"{W}/narr.mp3","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout,np.float32).copy()
sil=[tuple(map(float,l.split())) for l in open(f'{W}/sil.txt')]
END=41.13; segs=[]; t=0.0
for s,e in sil:
    d=e-s; keep=0.22 if d>0.33 else 0.12
    if d<=keep: continue
    segs.append((t,s+keep/2)); t=e-keep/2
segs.append((t,END))
out=[]; mapping=[]; pos=0.0; fade=int(0.008*SR)
for s,e in segs:
    x=a[int(s*SR):int(e*SR)].copy(); x[:fade]*=np.linspace(0,1,fade); x[-fade:]*=np.linspace(1,0,fade)
    out.append(x); mapping.append((s,e,pos)); pos+=len(x)/SR
y=np.concatenate(out); dur=len(y)/SR; tempo=dur/TARGET
with wave.open(f'{W}/narr_trim.wav','wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg","-v","error","-y","-i",f"{W}/narr_trim.wav","-af",f"highpass=f=70,atempo={tempo:.5f},loudnorm=I=-14:TP=-1.5:LRA=9","-ar","48000","-ac","1",f"{W}/narr_final.wav"],check=True)
json.dump(dict(map=mapping,trim_dur=dur,tempo=tempo),open(f'{W}/map.json','w'))
print('após pausas %.3f s, atempo %.4f'%(dur,tempo))
