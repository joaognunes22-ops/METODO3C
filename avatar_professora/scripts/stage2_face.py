# Etapa 2: fala discreta + piscadas via LivePortrait, colados só na região do rosto
import sys,os,numpy as np; sys.path.insert(0,os.path.dirname(__file__))
from PIL import Image,ImageFilter; from lp import LP,expr
S=sys.argv[1]; mode=sys.argv[2]; N=450; FPS=30
if mode=='plan':
    lp=LP(S+'/models/lp',4); B=[]
    for f in range(N):
        bb,sc=lp.detect(np.asarray(Image.open(f"{S}/base/b{f:03d}.png").convert('RGB'))); B.append(bb)
    B=np.array(B)
    # suavização temporal do recorte (gaussiana, sigma 3 quadros)
    k=np.exp(-0.5*(np.arange(-9,10)/3)**2); k/=k.sum()
    Bs=np.stack([np.convolve(np.pad(B[:,i],9,mode='edge'),k,'valid') for i in range(4)],1)
    # sinais de boca e piscada
    rng=np.random.default_rng(7); t=np.arange(N)/FPS; m=np.zeros(N)
    tt=0.6
    while tt<14.3:
        end=min(tt+rng.uniform(1.4,2.8),14.3)
        while tt<end:
            d=rng.uniform(0.14,0.30); a=rng.uniform(0.35,1.0)
            m+=a*np.exp(-0.5*((t-tt-d/2)/(d/3.2))**2); tt+=d*rng.uniform(0.85,1.05)
        tt+=rng.uniform(0.3,0.55)   # pausa entre frases
    m=np.clip(m,0,1.1)
    blink=np.zeros(N)
    for bt in (1.15,3.85,5.7,8.95,11.25,12.0,13.75):
        f0=int(bt*FPS)
        for i,v in enumerate([0.35,0.8,1,1,0.75,0.45,0.2,0.07]):
            if f0+i<N: blink[f0+i]=max(blink[f0+i],v)
    np.savez(f"{S}/plan.npz",B=B,Bs=Bs,m=m,blink=blink)
    print('ok', B[:,2].min(), m.mean())
else:
    w,nw=int(mode),int(sys.argv[3]); lp=LP(S+'/models/lp',2)
    P=np.load(f"{S}/plan.npz"); Bs,m,blink=P['Bs'],P['m'],P['blink']
    os.makedirs(f"{S}/face",exist_ok=True)
    for f in range(w,N,nw):
        out=f"{S}/face/c{f:03d}.png"
        if os.path.exists(out): continue
        img=Image.open(f"{S}/base/b{f:03d}.png").convert('RGB'); A=np.asarray(img,np.float32)/255
        x1,y1,x2,y2=Bs[f]; cx,cy=(x1+x2)/2,(y1+y2)/2; bw,bh=x2-x1,y2-y1; sz=max(bw,bh)*2.0
        box=(cx-sz/2,cy-sz/2,cx+sz/2,cy+sz/2)
        crop=np.asarray(img.transform((256,256),Image.EXTENT,box,Image.BICUBIC),np.float32)/255
        o=lp.run(crop,expr(mouth=8-34*m[f],blink=-13*blink[f]))
        oi=Image.fromarray((o*255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(1.2,40,2))
        # volta ao quadro: região do rosto
        X0,Y0=int(np.floor(box[0])),int(np.floor(box[1])); X1,Y1=int(np.ceil(box[2])),int(np.ceil(box[3]))
        Wd,Hd=X1-X0,Y1-Y0
        # mapeia o 512 de volta para a janela inteira (pixels alinhados)
        sx=(box[2]-box[0])/512; ox=(box[0]-X0)
        back=oi.transform((Wd,Hd),Image.AFFINE,(1/sx,0,-ox/sx,0,1/sx,-(box[1]-Y0)/sx),Image.BICUBIC)
        back=np.asarray(back,np.float32)/255
        yy,xx=np.mgrid[Y0:Y1,X0:X1]
        ell=((xx-cx)/(0.40*bw))**2+((yy-(cy+0.06*bh))/(0.47*bh))**2
        mk=np.clip((1.0-ell)/0.35,0,1); mk=mk*mk*(3-2*mk)
        mk=mk[...,None]
        ya,yb=max(Y0,0),min(Y1,A.shape[0]); xa,xb=max(X0,0),min(X1,A.shape[1])
        reg=A[ya:yb,xa:xb]; bk=back[ya-Y0:yb-Y0,xa-X0:xb-X0]; mm=mk[ya-Y0:yb-Y0,xa-X0:xb-X0]
        # casamento de cor na borda da máscara
        ring=(mm[...,0]>0.05)&(mm[...,0]<0.5)
        if ring.sum()>50: bk=bk+(reg[ring].mean(0)-bk[ring].mean(0))
        A[ya:yb,xa:xb]=reg*(1-mm)+bk*mm
        Image.fromarray((A*255+0.5).clip(0,255).astype(np.uint8)).save(out)
        print(w,f,flush=True)
