# LivePortrait (ONNX) — retargeting de expressão sobre o próprio quadro (sem vídeo-guia externo)
import numpy as np,onnxruntime as o
from PIL import Image
class LP:
    def __init__(s,M,threads=4):
        so=o.SessionOptions(); so.intra_op_num_threads=threads
        L=lambda n: o.InferenceSession(f"{M}/{n}.onnx",so)
        s.det=L('det_10g'); s.app=L('appearance_feature_extractor'); s.mot=L('motion_extractor')
        s.warp=L('warping'); s.spade=L('spade_generator'); s.stitch=L('stitching')
    # ---------- SCRFD ----------
    def detect(s,img):  # img uint8 HxWx3 RGB -> bbox x1,y1,x2,y2
        H,W=img.shape[:2]; sc=640/max(H,W)
        im=np.asarray(Image.fromarray(img).resize((int(W*sc),int(H*sc)),Image.BILINEAR),np.float32)
        pad=np.zeros((640,640,3),np.float32); pad[:im.shape[0],:im.shape[1]]=im
        x=((pad-127.5)/128).transpose(2,0,1)[None]
        out=s.det.run(None,{'input.1':x}); best=None
        for k,st in enumerate((8,16,32)):
            sco,bb=out[k][:,0],out[k+3]*st; n=640//st
            cy,cx=np.mgrid[:n,:n]; c=np.stack([cx,cy],-1).reshape(-1,2).astype(np.float32)*st
            c=np.repeat(c,2,0); i=np.argmax(sco)
            if best is None or sco[i]>best[0]:
                best=(sco[i],np.array([c[i,0]-bb[i,0],c[i,1]-bb[i,1],c[i,0]+bb[i,2],c[i,1]+bb[i,3]])/sc)
        return best[1],best[0]
    # ---------- movimento ----------
    @staticmethod
    def deg(p):
        p=np.exp(p-p.max(1,keepdims=True)); p/=p.sum(1,keepdims=True)
        return (p*np.arange(66)).sum(1)*3-97.5
    @staticmethod
    def rot(pitch,yaw,roll):
        x,y,z=np.radians([pitch,yaw,roll])
        Rx=np.array([[1,0,0],[0,np.cos(x),-np.sin(x)],[0,np.sin(x),np.cos(x)]])
        Ry=np.array([[np.cos(y),0,np.sin(y)],[0,1,0],[-np.sin(y),0,np.cos(y)]])
        Rz=np.array([[np.cos(z),-np.sin(z),0],[np.sin(z),np.cos(z),0],[0,0,1]])
        return (Rz@Ry@Rx).T
    def run(s,crop,dexp,stitch=True):
        """crop: 256x256x3 float 0..1. dexp: (21,3) delta de expressão. retorna 512x512x3"""
        x=np.ascontiguousarray(crop.transpose(2,0,1)[None],dtype=np.float32)
        f=s.app.run(None,{'img':x})[0]
        pi,ya,ro,t,ex,sc,kp=s.mot.run(None,{'img':x})
        R=s.rot(s.deg(pi)[0],s.deg(ya)[0],s.deg(ro)[0])
        kp=kp.reshape(21,3); ex=ex.reshape(21,3)
        def tr(e):
            v=sc[0,0]*(kp@R+e); v[:,:2]+=t[0,:2]; return v
        xs=tr(ex); xd=tr(ex+dexp)
        if stitch:
            d=s.stitch.run(None,{'input':np.concatenate([xs.ravel(),xd.ravel()])[None].astype(np.float32)})[0][0]
            xd=xd+d[:63].reshape(21,3); xd[:,:2]+=d[63:65]
        w=s.warp.run(None,{'feature_3d':f,'kp_source':xs[None].astype(np.float32),'kp_driving':xd[None].astype(np.float32)})[2]
        return s.spade.run(None,{'input':w})[0][0].transpose(1,2,0).clip(0,1)
def expr(mouth=0.,blink=0.,smile=0.,eee=0.):
    e=np.zeros((21,3))
    e[19,1]+=mouth*0.001; e[19,2]+=mouth*0.0001; e[17,1]+=mouth*-0.0001
    e[20,2]+=eee*-0.001; e[20,1]+=eee*-0.001; e[14,1]+=eee*-0.001
    e[20,1]+=smile*-0.01; e[14,1]+=smile*-0.02; e[17,1]+=smile*0.0065; e[17,2]+=smile*0.003
    e[13,1]+=smile*-0.00275; e[16,1]+=smile*-0.00275; e[3,1]+=smile*-0.0035; e[7,1]+=smile*-0.0035
    # piscada (blink>0 fecha)
    e[11,1]+=blink*0.001; e[13,1]+=blink*-0.0003; e[15,1]+=blink*0.001; e[16,1]+=blink*-0.0003
    e[1,1]+=blink*0.00025; e[2,1]+=blink*-0.00025
    return e
