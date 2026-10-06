/* 3D stage: Sentry the bot, plus a different prop on every page. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

const P = window.__ptr;
const SCENE = document.body.dataset.scene || 'home';
const EMBLEM = document.body.dataset.emblem || '';
const PAGE_COLOR = document.body.dataset.color || null;
const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x07090c, 9, 22);
const camera = new THREE.PerspectiveCamera(35, 1, .1, 60);
camera.position.set(0, 0, 10);

scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x0a0d12, .9));
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0x3cf0ff, 1.1); rim.position.set(-5, 2, -4); scene.add(rim);
const cursorLight = new THREE.PointLight(0xb6ff3c, 14, 9, 1.6); scene.add(cursorLight);

const accent = () => PAGE_COLOR || P.accent || '#b6ff3c';
const shell = new THREE.MeshStandardMaterial({ color: 0xe9eef3, roughness: .32, metalness: .25 });
const dark = new THREE.MeshStandardMaterial({ color: 0x0b0f14, roughness: .12, metalness: .7 });
const joint = new THREE.MeshStandardMaterial({ color: 0x2a323c, roughness: .5, metalness: .6 });
const glow = new THREE.MeshBasicMaterial({ color: accent() });
const glowSoft = new THREE.MeshBasicMaterial({ color: accent(), transparent: true, opacity: .5 });
const M = (g, m) => new THREE.Mesh(g, m);

/* ---------- Sentry ---------- */
const bot = new THREE.Group(); scene.add(bot);
const head = new THREE.Group(); head.position.y = .95; bot.add(head);
const skull = M(new THREE.SphereGeometry(1, 48, 40), shell); skull.scale.set(1.08, .9, .98); head.add(skull);
const visor = M(new THREE.SphereGeometry(1, 48, 32), dark); visor.scale.set(.9, .56, .8); visor.position.set(0, .02, .26); head.add(visor);
const eyes = new THREE.Group(); eyes.position.set(0, .04, 1.02); head.add(eyes);
const eyeG = new THREE.CapsuleGeometry(.085, .17, 6, 14);
const eL = M(eyeG, glow), eR = M(eyeG, glow); eL.position.x = -.3; eR.position.x = .3; eyes.add(eL, eR);
const earG = new THREE.CylinderGeometry(.2, .2, .14, 24);
[-1, 1].forEach(s => { const e = M(earG, joint); e.rotation.z = Math.PI / 2; e.position.set(1.08 * s, 0, 0); head.add(e); const d = M(new THREE.CircleGeometry(.09, 20), glow); d.rotation.y = s * Math.PI / 2; d.position.set(1.16 * s, 0, 0); head.add(d); });
const ant = M(new THREE.CylinderGeometry(.025, .025, .45, 8), joint); ant.position.y = 1.08; head.add(ant);
const tip = M(new THREE.SphereGeometry(.09, 16, 16), glow); tip.position.y = 1.34; head.add(tip);
const neck = M(new THREE.CylinderGeometry(.2, .26, .25, 20), joint); neck.position.y = .02; bot.add(neck);
const body = M(new THREE.CapsuleGeometry(.62, .42, 10, 28), shell); body.position.y = -.72; body.scale.set(1, 1, .86); bot.add(body);
const chest = M(new THREE.TorusGeometry(.19, .035, 10, 36), glow); chest.position.set(0, -.55, .52); bot.add(chest);
const core = M(new THREE.CircleGeometry(.12, 24), glowSoft); core.position.set(0, -.55, .535); bot.add(core);
const belt = M(new THREE.TorusGeometry(.6, .03, 8, 48), joint); belt.rotation.x = Math.PI / 2; belt.position.y = -1.0; belt.scale.set(1, .86, 1); bot.add(belt);
const mkArm = s => { const g = new THREE.Group(); g.position.set(.86 * s, -.42, 0);
  const a = M(new THREE.CapsuleGeometry(.14, .42, 6, 16), shell); a.position.y = -.3; g.add(a);
  const h = M(new THREE.SphereGeometry(.17, 20, 16), dark); h.position.y = -.68; g.add(h);
  g.rotation.z = .22 * s; bot.add(g); return g; };
const armL = mkArm(-1), armR = mkArm(1);
const thr = M(new THREE.ConeGeometry(.3, .5, 24, 1, true), new THREE.MeshBasicMaterial({ color: accent(), transparent: true, opacity: .35, side: THREE.DoubleSide, depthWrite: false }));
thr.rotation.x = Math.PI; thr.position.y = -1.62; bot.add(thr);
const halo = M(new THREE.TorusGeometry(1, .012, 6, 80), glowSoft); halo.rotation.x = Math.PI / 2; halo.position.y = -2.05; bot.add(halo);
const halo2 = halo.clone(); bot.add(halo2);
const glowMats = [glow, glowSoft, thr.material];

/* ---------- backdrop ---------- */
const wireMat = new THREE.LineBasicMaterial({ color: 0x3cf0ff, transparent: true, opacity: .13 });
const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.6, 1)), wireMat);
wire.position.z = -3; scene.add(wire);
const N = innerWidth < 800 ? 700 : 1600, pos = new Float32Array(N * 3);
for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 26; pos[i * 3 + 1] = (Math.random() - .5) * 18; pos[i * 3 + 2] = -Math.random() * 14 + 3; }
const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const stars = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xbfd0e0, size: .035, transparent: true, opacity: .7 }));
scene.add(stars);

/* ---------- per-page props ---------- */
const prop = new THREE.Group(); scene.add(prop);
const propMat = new THREE.MeshStandardMaterial({ color: accent(), roughness: .25, metalness: .55, emissive: new THREE.Color(accent()), emissiveIntensity: .25 });
const propWire = new THREE.LineBasicMaterial({ color: accent(), transparent: true, opacity: .55 });
const crystals = [];
if (SCENE === 'work') {
  ['#b6ff3c', '#3cf0ff', '#ffb03c', '#ff5c8a', '#a78bfa'].forEach((c, i) => {
    const m = M(new THREE.OctahedronGeometry(.26, 0), new THREE.MeshStandardMaterial({ color: c, roughness: .2, metalness: .6, emissive: new THREE.Color(c), emissiveIntensity: .35, flatShading: true }));
    m.userData.i = i; crystals.push(m); prop.add(m);
  });
} else if (SCENE === 'project') {
  const W = g => new THREE.LineSegments(new THREE.WireframeGeometry(g), propWire);
  if (EMBLEM === 'shield') { prop.add(M(new THREE.IcosahedronGeometry(.9, 0), Object.assign(propMat, { flatShading: true })), W(new THREE.IcosahedronGeometry(1.45, 1))); }
  else if (EMBLEM === 'knot') { prop.add(M(new THREE.TorusKnotGeometry(.8, .22, 160, 20), propMat)); }
  else if (EMBLEM === 'rings') { const a = M(new THREE.TorusGeometry(.85, .13, 20, 80), propMat), b = M(new THREE.TorusGeometry(.85, .13, 20, 80), shell); a.position.x = -.45; b.position.x = .45; b.rotation.x = Math.PI / 2; prop.add(a, b); }
  else if (EMBLEM === 'sun') { prop.add(M(new THREE.SphereGeometry(.7, 40, 32), propMat)); for (let i = 0; i < 12; i++) { const r = M(new THREE.ConeGeometry(.09, .5, 10), propMat); const a = i / 12 * Math.PI * 2; r.position.set(Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0); r.rotation.z = a - Math.PI / 2; prop.add(r); } }
  else { prop.add(W(new THREE.BoxGeometry(1.9, 1.9, 1.9)), W(new THREE.BoxGeometry(1.25, 1.25, 1.25)), M(new THREE.BoxGeometry(.6, .6, .6), propMat)); }
} else if (SCENE === 'about') {
  for (let i = 0; i < 3; i++) { const r = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 1.9 + i * .35, 1.9 + i * .35).getPoints(90)), propWire); r.rotation.x = Math.PI / 2 + (i - 1) * .5; r.rotation.y = i * .7; r.userData.sp = .2 + i * .12; prop.add(r); }
}

/* ---------- where things stand: fractions of the half-viewport, interpolated by scroll ---------- */
const STAGES = {
  home:    { wide: [{ x: .52, y: .02, s: 1.05 }, { x: .66, y: -.1, s: .7 }, { x: .7, y: -.3, s: .55 }, { x: .58, y: 0, s: .8 }], narrow: [{ x: .3, y: .56, s: .5 }, { x: .64, y: .64, s: .28 }, { x: .64, y: .64, s: .28 }] },
  work:    { wide: [{ x: .6, y: 0, s: .85 }, { x: .66, y: -.05, s: .75 }], narrow: [{ x: .3, y: .58, s: .46 }, { x: .64, y: .64, s: .28 }] },
  about:   { wide: [{ x: .56, y: 0, s: .9 }, { x: .7, y: -.3, s: .5 }, { x: .7, y: -.3, s: .5 }], narrow: [{ x: .3, y: .58, s: .46 }, { x: .64, y: .64, s: .28 }] },
  lab:     { wide: [{ x: .66, y: .05, s: .78 }, { x: .74, y: -.42, s: .5 }], narrow: [{ x: .3, y: .58, s: .46 }, { x: .64, y: .64, s: .28 }] },
  contact: { wide: [{ x: .56, y: 0, s: 1 }, { x: .56, y: 0, s: 1 }], narrow: [{ x: .3, y: .58, s: .46 }, { x: .3, y: .58, s: .46 }] },
  project: { wide: [{ x: .8, y: -.42, s: .42 }, { x: .8, y: -.45, s: .38 }], narrow: [{ x: .66, y: .5, s: .26 }, { x: .66, y: .64, s: .24 }] },
};
const PROP = { wide: [{ x: .52, y: .1, s: 1.15 }, { x: .7, y: .3, s: .6 }], narrow: [{ x: .1, y: .56, s: .62 }, { x: -.5, y: .62, s: .3 }] };
let halfW = 1, halfH = 1, narrow = false;
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; halfW = halfH * camera.aspect; narrow = w < 860;
}
addEventListener('resize', resize); resize();
const lerp = THREE.MathUtils.lerp;
function at(list, p) { const f = p * (list.length - 1), i = Math.min(Math.floor(f), list.length - 2), k = f - i, e = k * k * (3 - 2 * k), A = list[i], B = list[i + 1]; return { x: lerp(A.x, B.x, e), y: lerp(A.y, B.y, e), s: lerp(A.s, B.s, e) }; }

const look = new THREE.Vector3(), tmpC = new THREE.Color();
let jump = 0, jumpV = 0, wave = SCENE === 'contact' ? 2.5 : 0, lastClicks = 0, blink = 0, nextBlink = 2, spin = 0, baseYaw = 0;
const clock = new THREE.Clock();

function frame() {
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, sc = P.scroll || 0;
  const st = at(STAGES[SCENE][narrow ? 'narrow' : 'wide'], sc);

  if (P.clicks !== lastClicks) { lastClicks = P.clicks; jumpV = 4.2; wave = 1.4; if (P.clicks % 5 === 0) spin = Math.PI * 2; }
  if (P.dance > 0) { P.dance -= dt; if (jump === 0) jumpV = 3.4; spin += dt * 5; wave = .5; }
  jumpV -= 14 * dt; jump = Math.max(0, jump + jumpV * dt); if (jump === 0) jumpV = 0;
  wave = Math.max(0, wave - dt);
  if (SCENE === 'contact' && wave === 0 && Math.sin(t * .5) > .96) wave = 1.4;

  bot.position.x = lerp(bot.position.x, st.x * halfW, .06);
  bot.position.y = lerp(bot.position.y, st.y * halfH + Math.sin(t * 1.6) * .09 + jump * .5, .12);
  bot.scale.setScalar(lerp(bot.scale.x, st.s, .08));

  const cx = P.nx * halfW, cy = P.ny * halfH;
  look.set(cx - bot.position.x, cy - (bot.position.y + .95 * bot.scale.x), 4);
  const yaw = THREE.MathUtils.clamp(Math.atan2(look.x, look.z), -.9, .9);
  const pitch = THREE.MathUtils.clamp(-Math.atan2(look.y, look.z), -.55, .55);
  if (P.dance <= 0) spin = lerp(spin, 0, .07);
  head.rotation.y = lerp(head.rotation.y, yaw, .12); head.rotation.x = lerp(head.rotation.x, pitch, .12); head.rotation.z = lerp(head.rotation.z, -yaw * .12, .08);
  baseYaw = lerp(baseYaw, yaw * .35, .06); bot.rotation.y = baseYaw + spin; bot.rotation.z = Math.sin(t * .9) * .03;
  eyes.position.x = lerp(eyes.position.x, yaw * .1, .2); eyes.position.y = .04 - pitch * .08;

  nextBlink -= dt; if (nextBlink < 0) { blink = 1; nextBlink = 2 + Math.random() * 3.5; }
  blink = Math.max(0, blink - dt * 7);
  eL.scale.y = eR.scale.y = Math.max(.08, (1 - Math.sin(blink * Math.PI)) * (wave > 0 ? .45 : 1));

  armL.rotation.x = Math.sin(t * 1.6) * .12; armL.rotation.z = -.22 - Math.sin(t * 1.6 + 1) * .05 - (P.dance > 0 ? 1.6 + Math.sin(t * 12) * .4 : 0);
  const wv = Math.min(1, wave * 3);
  armR.rotation.z = lerp(armR.rotation.z, .22 + wv * (2.3 + Math.sin(t * 14) * .35), .2);
  armR.rotation.x = lerp(armR.rotation.x, -Math.sin(t * 1.6) * .12, .2);

  tmpC.set(P.color || accent());
  glowMats.forEach(m => m.color.lerp(tmpC, .1)); cursorLight.color.lerp(tmpC, .1);
  propMat.color.lerp(tmpC, .1); propMat.emissive.lerp(tmpC, .1); propWire.color.lerp(tmpC, .1);
  tip.scale.setScalar(1 + Math.sin(t * 5) * .22); chest.rotation.z = t * 1.2;
  thr.scale.set(1, 1 + Math.sin(t * 22) * .12 + jump * .6, 1);
  halo.scale.setScalar(.75 + ((t * .5) % 1) * .9); halo2.scale.setScalar(.75 + ((t * .5 + .5) % 1) * .9);

  // props
  if (SCENE === 'work') {
    prop.position.copy(bot.position); prop.scale.setScalar(bot.scale.x);
    crystals.forEach((m, i) => {
      const a = t * .5 + i / crystals.length * Math.PI * 2, hot = P.hot === i, R = hot ? 1.75 : 2.05;
      m.position.set(Math.cos(a) * R, Math.sin(a * 1.3 + i) * .35 - .1, Math.sin(a) * R * .55);
      m.rotation.x += dt * (hot ? 3 : .8); m.rotation.y += dt * (hot ? 4 : 1.1);
      m.scale.setScalar(lerp(m.scale.x, hot ? 1.9 : (P.hot >= 0 ? .7 : 1), .12));
    });
  } else if (SCENE === 'project') {
    const ps = at(PROP[narrow ? 'narrow' : 'wide'], sc);
    prop.position.x = lerp(prop.position.x, ps.x * halfW, .06); prop.position.y = lerp(prop.position.y, ps.y * halfH + Math.sin(t) * .1, .08);
    prop.scale.setScalar(lerp(prop.scale.x, ps.s * (narrow ? 1 : 1.25), .08));
    prop.rotation.y = t * .35 + P.nx * .6; prop.rotation.x = Math.sin(t * .4) * .25 - P.ny * .4;
  } else if (SCENE === 'about') {
    prop.position.copy(bot.position); prop.position.y -= .3 * bot.scale.x; prop.scale.setScalar(bot.scale.x);
    prop.children.forEach(r => { r.rotation.z = t * r.userData.sp; });
  }

  cursorLight.position.set(cx, cy, 2.4);
  wire.rotation.x = t * .06 + P.ny * .2; wire.rotation.y = t * .09 + P.nx * .3;
  wire.position.x = lerp(wire.position.x, (SCENE === 'project' ? prop.position.x : bot.position.x) * .8, .03); wire.position.y = lerp(wire.position.y, bot.position.y * .6, .03);
  stars.rotation.y = lerp(stars.rotation.y, P.nx * .08, .04); stars.rotation.x = lerp(stars.rotation.x, -P.ny * .05, .04); stars.position.y = sc * 3;
  camera.position.x = lerp(camera.position.x, P.nx * .25, .04); camera.position.y = lerp(camera.position.y, P.ny * .15, .04); camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
if (calm) { for (let n = 0; n < 60; n++) frame(); addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true }); addEventListener('resize', frame); }
else renderer.setAnimationLoop(frame);
document.addEventListener('visibilitychange', () => { if (!calm) renderer.setAnimationLoop(document.hidden ? null : frame); });
