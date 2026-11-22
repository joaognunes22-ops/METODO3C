// Mão humana (modelo WebXR "generic-hand", articulado por ossos) + antebraço com manga
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const FINGERS = ['index', 'middle', 'ring', 'pinky'];
const SPR = -1; // sinal do afastamento lateral dos dedos
const JOINTS = ['phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal'];

function skinMaterial() {
  // micro-relevo de pele (poros/rugas finas) — ruído suave
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const id = g.createImageData(256, 256);
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const h = new Float32Array(256 * 256).map(r);
  for (let k = 0; k < 1; k++) for (let i = 0; i < h.length; i++) h[i] = (h[i] + h[(i + 1) % h.length] + h[(i + 256) % h.length]) / 3;
  for (let i = 0; i < h.length; i++) { id.data[4*i] = 128 + (h[(i + 1) % h.length] - h[i]) * 160; id.data[4*i+1] = 128 + (h[(i + 256) % h.length] - h[i]) * 160; id.data[4*i+2] = 255; id.data[4*i+3] = 255; }
  g.putImageData(id, 0, 0); const n = new THREE.CanvasTexture(c); n.wrapS = n.wrapT = THREE.RepeatWrapping; n.repeat.set(6, 6);
  return new THREE.MeshPhysicalMaterial({color: 0xffffff, vertexColors: true, roughness: 0.62, normalMap: n, normalScale: new THREE.Vector2(0.25, 0.25),
    sheen: 0.55, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffb59a), specularIntensity: 0.35, envMapIntensity: 0.5});
}

export async function createHand(scene) {
  const gl = await new GLTFLoader().loadAsync('right.glb');
  const model = gl.scene; model.scale.setScalar(3.1);
  const bones = {}; let mesh;
  model.traverse(o => { if (o.isBone) bones[o.name] = o; if (o.isSkinnedMesh) mesh = o; });
  const inner = new THREE.Group(); inner.rotation.x = Math.PI / 2; inner.add(model);
  const mid = new THREE.Group(); mid.rotation.z = Math.PI / 2; mid.add(inner);
  const root = new THREE.Group(); root.rotation.order = 'YXZ'; root.add(mid); scene.add(root);
  root.updateMatrixWorld(true);

  const Q0 = Object.fromEntries(Object.entries(bones).map(([k, b]) => [k, b.quaternion.clone()]));
  const wp = n => { const v = new THREE.Vector3(); bones[n].getWorldPosition(v); return v; };
  const upd = () => root.updateMatrixWorld(true);
  const reset = () => { for (const k in bones) bones[k].quaternion.copy(Q0[k]); upd(); };
  const rotW = (n, axisW, ang) => { const b = bones[n], pq = new THREE.Quaternion(); b.parent.getWorldQuaternion(pq);
    const a = axisW.clone().applyQuaternion(pq.invert()).normalize(); b.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(a, ang)); b.updateMatrixWorld(true); };
  const frame = () => { const w = wp('wrist'), im = wp('index-finger-metacarpal'), pm = wp('pinky-finger-metacarpal'), mt = wp('middle-finger-phalanx-proximal');
    const F = mt.clone().sub(w).normalize(), L = im.clone().sub(pm).normalize(), N = new THREE.Vector3().crossVectors(F, L).normalize(); L.crossVectors(N, F).normalize(); return {F, L, N}; };
  const flex = (f, a, spread = 0) => { const n = f + '-finger'; if (spread) rotW(n + '-phalanx-proximal', frame().N, spread); JOINTS.forEach((j, i) => rotW(n + '-' + j, frame().L, a[i])); };

  // cor da pele por vértice: dorso levemente mais claro, juntas e pontas mais rosadas
  {
    const pos = mesh.geometry.attributes.position, sj = mesh.geometry.attributes.skinIndex, sw = mesh.geometry.attributes.skinWeight; const sk = mesh.skeleton;
    const col = new Float32Array(pos.count * 3); const base = new THREE.Color(0xd8a487), pink = new THREE.Color(0xd98c7c), warm = new THREE.Color(0xcf9a7b), tmp = new THREE.Color();
    let s = 3; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let v = 0; v < pos.count; v++) {
      let tip = 0, knuck = 0;
      for (let k = 0; k < 4; k++) { const nm = sk.bones[sj.getComponent(v, k)].name, w = sw.getComponent(v, k);
        if (nm.includes('distal')) tip += w; if (nm.includes('intermediate') || nm.includes('proximal')) knuck += w * 0.45; }
      tmp.copy(base).lerp(pink, Math.min(1, tip * 0.75 + knuck * 0.3)).lerp(warm, r() * 0.25);
      col[3*v] = tmp.r; col[3*v+1] = tmp.g; col[3*v+2] = tmp.b;
    }
    mesh.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
    mesh.material = skinMaterial(); mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false;
  }

  // unhas: pequenas calotas no dorso da falange distal
  reset();
  const nailMat = new THREE.MeshPhysicalMaterial({color: 0xe9b9a8, roughness: 0.32, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 0.6});
  const nailGeo = new THREE.SphereGeometry(1, 24, 12);
  const NAIL = {index: [0.038, 0.050], middle: [0.040, 0.052], ring: [0.037, 0.048], pinky: [0.031, 0.040], thumb: [0.046, 0.054]};
  const rc = new THREE.Raycaster();
  for (const f of [...FINGERS, 'thumb']) {
    const d = f === 'thumb' ? 'thumb-phalanx-distal' : f + '-finger-phalanx-distal', t = f === 'thumb' ? 'thumb-tip' : f + '-finger-tip';
    const pd = wp(d), pt = wp(t), axis = pt.clone().sub(pd); const len = axis.length(); axis.normalize();
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(axis, -axis.y).normalize();
    const c0 = pd.clone().addScaledVector(axis, len * 0.58);
    rc.set(c0.clone().addScaledVector(up, 0.5), up.clone().negate()); const hit = rc.intersectObject(mesh, false)[0];
    if (!hit) { console.log('sem unha', f); continue; }
    const n = up.clone(); const side = new THREE.Vector3().crossVectors(axis, n).normalize(); const nO = new THREE.Vector3().crossVectors(side, axis).normalize();
    const [w, l] = NAIL[f];
    const nail = new THREE.Mesh(nailGeo, nailMat); nail.castShadow = true;
    nail.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, nO, axis.clone().negate()));
    nail.scale.set(w * 0.42, 0.0055, l * 0.40);
    nail.position.copy(hit.point).addScaledVector(nO, -0.0015).addScaledVector(axis, len * 0.08);
    bones[d].attach(nail);
  }

  // antebraço + manga (tricô bege) presos ao punho
  {
    const w = wp('wrist'), F = frame().F; const back = F.clone().negate();
    const arm = new THREE.Group();
    const skin = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.088, 0.55, 28, 1, true), (() => { const m = skinMaterial(); m.vertexColors = false; m.color.set(0xd4a083); return m; })());
    skin.position.y = -0.27; skin.scale.set(1.0, 1, 0.70);
    const knit = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#e8dccb'; g.fillRect(0, 0, 64, 256);
      for (let y = 0; y < 256; y += 8) for (let x = 0; x < 64; x += 8) { g.fillStyle = `rgba(120,95,70,${0.10 + 0.08 * ((x + y) % 16 === 0)})`; g.beginPath(); g.ellipse(x + 4, y + 4, 3, 4, 0, 0, Math.PI * 2); g.fill(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 3); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.150, 0.125, 1.4, 32, 1, false), new THREE.MeshStandardMaterial({map: knit, roughness: 0.95, color: 0xf3ece2}));
    sleeve.position.y = -0.38 - 0.7; sleeve.scale.set(1, 1, 0.78);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.022, 12, 40), sleeve.material); cuff.rotation.x = Math.PI / 2; cuff.position.y = -0.38; cuff.scale.set(1, 0.78, 1);
    for (const m of [skin, sleeve, cuff]) { m.castShadow = m.receiveShadow = true; arm.add(m); }
    arm.position.copy(w).addScaledVector(F, 0.03); arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), F);
    bones['wrist'].attach(arm);
  }

  // poses
  const snap = () => Object.fromEntries(Object.entries(bones).map(([k, b]) => [k, b.quaternion.clone()]));
  const tipGap = () => wp('thumb-tip').distanceTo(wp('index-finger-tip'));
  // poses: RELAX (mão chegando/saindo) e PRESS (pontas do indicador e médio apoiadas na folha)
  const thumbIn = (k) => { rotW('thumb-metacarpal', frame().N, 0.55 * k); rotW('thumb-phalanx-proximal', frame().N, 0.30 * k); rotW('thumb-phalanx-distal', frame().L, 0.25 * k); };
  reset(); flex('index', [0.22, 0.30, 0.16], SPR * 0.05); flex('middle', [0.30, 0.38, 0.20], 0); flex('ring', [0.40, 0.48, 0.25], -SPR * 0.06); flex('pinky', [0.48, 0.52, 0.28], -SPR * 0.12); thumbIn(1);
  const RELAX = snap();
  reset(); flex('index', [0.30, 0.42, 0.10], SPR * 0.04); flex('middle', [0.36, 0.48, 0.12], 0); flex('ring', [0.62, 0.72, 0.35], -SPR * 0.06); flex('pinky', [0.75, 0.80, 0.40], -SPR * 0.12); thumbIn(1.25);
  const PRESS = snap();
  const OPEN = RELAX, PINCH = PRESS;
  // ponto de pega = média das pontas do indicador e médio (no referencial de root, pose PRESS)
  const gripLocal = (() => { for (const k in PRESS) bones[k].quaternion.copy(PRESS[k]); root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); upd();
    return wp('index-finger-tip').add(wp('middle-finger-tip')).multiplyScalar(0.5); })();

  function setPose(w) { for (const k in bones) bones[k].quaternion.copy(OPEN[k]).slerp(PINCH[k], w); }
  // coloca a mão de modo que o ponto de pega fique em P (mundo); yaw/pitch/roll em rad
  function place(P, yaw, pitch, roll, w) {
    setPose(w); root.rotation.set(pitch, yaw, roll); root.position.set(0, 0, 0); upd();
    const g = gripLocal.clone().applyEuler(root.rotation); root.position.copy(P).sub(g); upd();
  }
  return {root, bones, place, setPose, wp, gripLocal, mesh, reset, rotW, frame, flex, upd};
}
