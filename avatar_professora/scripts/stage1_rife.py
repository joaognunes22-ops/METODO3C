# Etapa 1: movimento corporal contínuo entre as 12 poses via RIFE 4.9 (ONNX, CPU)
import sys,numpy as np,onnxruntime as o
from PIL import Image
S=sys.argv[1]; FPS=30; N=450
so=o.SessionOptions(); so.intra_op_num_threads=4
rife=o.InferenceSession(f"{S}/models/rife49.onnx",so)
P=[np.asarray(Image.open(f"{S}/poses/p{i:02d}.png").convert('RGB'),np.float32)/255 for i in range(12)]
def prep(a): return np.ascontiguousarray(np.pad(a,((0,0),(0,48),(0,0)),mode='edge').transpose(2,0,1)[None])
PT=[prep(a) for a in P]
def interp(i,j,t): return rife.run(None,{'img0':PT[i],'img1':PT[j],'timestep':np.array([t],np.float32)})[0][0].transpose(1,2,0)[:,:720]
# curva de pose s(t): spline monotônica por partes (Fritsch-Carlson), velocidade contínua
K=np.array([[0,0],[1.5,1],[3.0,2],[4.0,3],[4.9,4],[5.8,5],[6.6,6],[7.35,7],[8.7,8],[9.7,9],[11.4,10],[13.2,11],[15.0,10.65]])
x,y=K[:,0],K[:,1]; h=np.diff(x); d=np.diff(y)/h
m=np.zeros_like(y); m[0],m[-1]=d[0],d[-1]
for k in range(1,len(y)-1):
    m[k]=0 if d[k-1]*d[k]<=0 else 3*(h[k-1]+h[k])/((2*h[k]+h[k-1])/d[k-1]+(h[k]+2*h[k-1])/d[k])
def s_of(t):
    k=min(np.searchsorted(x,t,side='right')-1,len(h)-1); u=(t-x[k])/h[k]
    h00,h10,h01,h11=2*u**3-3*u**2+1,u**3-2*u**2+u,-2*u**3+3*u**2,u**3-u**2
    return h00*y[k]+h10*h[k]*m[k]+h01*y[k+1]+h11*h[k]*m[k+1]
for f in range(N):
    s=s_of(f/FPS); i=min(int(np.floor(s)),10); fr=s-i
    img=P[i] if fr<0.004 else P[i+1] if fr>0.996 else interp(i,i+1,fr)
    Image.fromarray((img*255+0.5).clip(0,255).astype(np.uint8)).save(f"{S}/base/b{f:03d}.png")
    if f%30==0: print(f,round(s,3),flush=True)
