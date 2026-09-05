// chamber.js — the scrying chamber, seen from inside the glass.
//
// Visual contract (DESIGN.md §6): one table at ~2m, camera just above and behind the
// shew-stone at table height, slow drift only, near-black room. The wax sigil is the
// brightest AUTHORED thing in the scene; the candle cores are the only white. Target is
// 60fps at 1.5x DPR on integrated graphics, and the page must be completely playable
// with this file absent or failed.
//
// Bloom is a camera response to HDR signal, not a substitute for form: every element
// here reads in the no-post baseline (?nopost=1) before bloom is applied. Emissive
// hierarchy is scene-relative and set BEFORE tone mapping — see EMISSIVE below.
//
// Degradation order: WebGL2 -> WebGL1 -> reduced-motion (one frame, no loop) -> null
// (caller adds body.no-chamber and the CSS ground takes over).

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// --- scene-relative emissive hierarchy (pre-tone-map luminance) --------------
// The relationship is what matters, not the absolute numbers. Validate against
// exposure before reusing: renderer.toneMappingExposure is 1.0 below.
const EMISSIVE = {
  candleCore: 7.0, // brief, tiny, the only white in the room
  stone: 2.6, // where you are — small in frame, because you are behind it
  sigil: 4.2, // the authored subject; pulses
  letter: 2.4,
  page: 1.45, // the open book under Dee's hand -- the only warm thing at his end of the table
  chalk: 0.75,
  grid: 0.22,
  // wood, wax, robes, floor: 0 — ordinary lit surface
};

const PARAMS = {
  bloom: { strength: 0.5, radius: 0.6, threshold: 0.68 },
  camera: { fov: 52, pos: [0.06, 1.12, 0.66], look: [0, 0.82, -1.25] },
  drift: { amp: 0.035, rate: 0.06 }, // the only motion the camera is allowed
  table: { size: 0.92, height: 0.78, top: 0.06 },
};

// Deterministic noise, so a seed reproduces a frame exactly (acceptance gate).
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- procedural textures ------------------------------------------------------

function canvas2d(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')];
}

// The letter grid painted on the table top. These are NON-SEMANTIC angular marks
// generated from the seed — deliberately not transcribed Enochian, so that nothing
// here can be misread as a real table or a working text.
function markGlyph(ctx, x, y, s, rnd) {
  ctx.beginPath();
  const n = 2 + Math.floor(rnd() * 3);
  let px = x + (rnd() - 0.5) * s * 0.3;
  let py = y - s * 0.4;
  ctx.moveTo(px, py);
  for (let i = 0; i < n; i++) {
    px = x + (rnd() - 0.5) * s * 0.9;
    py = y + (rnd() - 0.5) * s * 0.9;
    if (rnd() < 0.4) {
      ctx.quadraticCurveTo(x + (rnd() - 0.5) * s, y + (rnd() - 0.5) * s, px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  if (rnd() < 0.35) {
    ctx.beginPath();
    ctx.arc(x + (rnd() - 0.5) * s * 0.5, y + (rnd() - 0.5) * s * 0.5, s * 0.12, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function tableTopTexture(seed) {
  const rnd = mulberry32(seed);
  const [c, ctx] = canvas2d(1024);
  ctx.fillStyle = '#0b0906';
  ctx.fillRect(0, 0, 1024, 1024);
  // grain
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = `rgba(${40 + rnd() * 30},${30 + rnd() * 22},${18 + rnd() * 14},${rnd() * 0.5})`;
    ctx.fillRect(rnd() * 1024, rnd() * 1024, 1 + rnd() * 3, 1 + rnd() * 30);
  }
  // the grid, and the marks in it
  const N = 12;
  const cell = 1024 / N;
  ctx.strokeStyle = 'rgba(196,168,111,0.30)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i <= N; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, 1024);
    ctx.moveTo(0, i * cell);
    ctx.lineTo(1024, i * cell);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(214,186,126,0.62)';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  for (let gy = 0; gy < N; gy++) {
    for (let gx = 0; gx < N; gx++) {
      markGlyph(ctx, (gx + 0.5) * cell, (gy + 0.5) * cell, cell * 0.5, rnd);
    }
  }
  // the heavier cross of the governors, dividing the four quarters
  ctx.strokeStyle = 'rgba(230,205,150,0.5)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(512, 0);
  ctx.lineTo(512, 1024);
  ctx.moveTo(0, 512);
  ctx.lineTo(1024, 512);
  ctx.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// The Sigillum Dei Aemeth, drawn as its construction: circle, heptagon, heptagram of
// step 2, inner heptagram of step 3. Geometry only — no names, no working talisman.
function sigilTexture() {
  const S = 1024;
  const [c, ctx] = canvas2d(S);
  ctx.clearRect(0, 0, S, S);
  const cx = S / 2;
  const cy = S / 2;
  const ring = (r, w, a) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = w;
    ctx.strokeStyle = `rgba(255,238,196,${a})`;
    ctx.stroke();
  };
  const nGon = (n, r, rot) =>
    Array.from({ length: n }, (_, i) => {
      const a = rot + (Math.PI * 2 * i) / n;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  const path = (p, w, a, step = 1) => {
    ctx.beginPath();
    for (let i = 0; i <= p.length; i++) {
      const [x, y] = p[(i * step) % p.length];
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineWidth = w;
    ctx.strokeStyle = `rgba(255,244,210,${a})`;
    ctx.stroke();
  };
  const R = S * 0.44;
  ring(R, 5, 0.95);
  ring(R * 0.965, 2, 0.5);
  const outer = nGon(7, R * 0.9, -Math.PI / 2);
  const inner = nGon(7, R * 0.62, -Math.PI / 2 + Math.PI / 7);
  path(outer, 3.5, 0.85);
  path(outer, 2.6, 0.8, 2);
  path(inner, 2.4, 0.7, 3);
  ring(R * 0.26, 2.6, 0.8);
  ring(R * 0.1, 2, 0.9);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Chalk on the floor: concentric circles, a heptagram, and the ring of marks between.
function floorTexture(seed) {
  const rnd = mulberry32(seed ^ 0x9e37);
  const S = 1024;
  const [c, ctx] = canvas2d(S);
  ctx.fillStyle = '#07080a';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = `rgba(${20 + rnd() * 18},${19 + rnd() * 16},${17 + rnd() * 14},${rnd() * 0.6})`;
    ctx.fillRect(rnd() * S, rnd() * S, 2 + rnd() * 7, 2 + rnd() * 7);
  }
  const cx = S / 2;
  const cy = S / 2;
  ctx.lineCap = 'round';
  const ring = (r, w, a) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = w;
    ctx.strokeStyle = `rgba(206,214,220,${a})`;
    ctx.stroke();
  };
  ring(S * 0.44, 4, 0.5);
  ring(S * 0.41, 2, 0.32);
  ring(S * 0.26, 3, 0.4);
  // heptagram between the rings
  const pts = Array.from({ length: 7 }, (_, i) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / 7;
    return [cx + S * 0.335 * Math.cos(a), cy + S * 0.335 * Math.sin(a)];
  });
  ctx.beginPath();
  for (let i = 0; i <= 7; i++) {
    const [x, y] = pts[(i * 2) % 7];
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = 'rgba(196,208,216,0.34)';
  ctx.stroke();
  // marks around the outer band
  ctx.strokeStyle = 'rgba(200,210,218,0.4)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 28; i++) {
    const a = (Math.PI * 2 * i) / 28;
    markGlyph(ctx, cx + S * 0.425 * Math.cos(a), cy + S * 0.425 * Math.sin(a), 22, rnd);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// The open page under Dee's hand: ruled lines of the same non-semantic marks. This is
// the thing the whole game is about, so it should look written on rather than blank.
function pageTexture(seed) {
  const rnd = mulberry32(seed ^ 0x0dee);
  const [c, ctx] = canvas2d(256);
  ctx.fillStyle = '#efe6d2';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(150,132,104,${rnd() * 0.16})`;
    ctx.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 5, 1 + rnd() * 3);
  }
  ctx.strokeStyle = 'rgba(48,36,24,0.62)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (let row = 0; row < 9; row++) {
    const y = 28 + row * 24;
    const n = 5 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) markGlyph(ctx, 30 + i * (196 / n) + rnd() * 6, y, 11, rnd);
  }
  ctx.strokeStyle = 'rgba(48,36,24,0.28)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(128, 10);
  ctx.lineTo(128, 246);
  ctx.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// A small atlas of the same non-semantic marks, for the letters that leave the table.
function glyphTextures(seed, count = 12) {
  const rnd = mulberry32(seed ^ 0x51ed);
  return Array.from({ length: count }, () => {
    const [c, ctx] = canvas2d(128);
    ctx.clearRect(0, 0, 128, 128);
    ctx.strokeStyle = 'rgba(255,240,205,1)';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    markGlyph(ctx, 64, 64, 62, rnd);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

// --- the chamber ---------------------------------------------------------------

export function createChamber(canvas, { seed = 1583, debug = false, noPost = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
  } catch (e) {
    return null; // no WebGL at all — caller falls back to the CSS ground
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060a);
  scene.fog = new THREE.FogExp2(0x040507, 0.30);

  const camera = new THREE.PerspectiveCamera(
    PARAMS.camera.fov,
    window.innerWidth / window.innerHeight,
    0.05,
    60
  );
  camera.position.set(...PARAMS.camera.pos);
  const lookTarget = new THREE.Vector3(...PARAMS.camera.look);
  camera.lookAt(lookTarget);

  const disposables = [];
  const track = (x) => (disposables.push(x), x);

  // --- the room ---------------------------------------------------------------
  const roomMat = new THREE.MeshStandardMaterial({
    color: 0x0b0a09,
    roughness: 0.98,
    metalness: 0,
    side: THREE.BackSide,
  });
  const room = new THREE.Mesh(track(new THREE.BoxGeometry(7, 3.6, 7)), track(roomMat));
  room.position.y = 1.6;
  scene.add(room);

  const floorTex = track(floorTexture(seed));
  const floor = new THREE.Mesh(
    track(new THREE.PlaneGeometry(4.2, 4.2)),
    track(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.94, metalness: 0 }))
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.002;
  scene.add(floor);

  // the chalk, as its own faintly self-lit layer so the circles read with no post
  const chalk = new THREE.Mesh(
    track(new THREE.PlaneGeometry(4.2, 4.2)),
    track(
      new THREE.MeshBasicMaterial({
        map: floorTex,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
  );
  chalk.rotation.x = -Math.PI / 2;
  chalk.position.y = 0.004;
  chalk.material.color.setScalar(EMISSIVE.chalk);
  scene.add(chalk);

  // --- the Holy Table ---------------------------------------------------------
  const T = PARAMS.table;
  const tableGroup = new THREE.Group();
  scene.add(tableGroup);

  const woodMat = track(
    new THREE.MeshStandardMaterial({ color: 0x2a1f14, roughness: 0.8, metalness: 0 })
  );
  const topTex = track(tableTopTexture(seed));
  const top = new THREE.Mesh(
    track(new THREE.BoxGeometry(T.size, T.top, T.size)),
    [woodMat, woodMat, track(new THREE.MeshStandardMaterial({
      map: topTex, roughness: 0.72, metalness: 0,
      emissive: 0xc4a86f, emissiveMap: topTex, emissiveIntensity: EMISSIVE.grid,
    })), woodMat, woodMat, woodMat]
  );
  top.position.y = T.height;
  tableGroup.add(top);

  const waxMat = track(
    new THREE.MeshStandardMaterial({ color: 0x6b5a33, roughness: 0.62, metalness: 0 })
  );
  const legGeo = track(new THREE.CylinderGeometry(0.028, 0.034, T.height - 0.05, 10));
  const sealGeo = track(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 20));
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const x = sx * (T.size / 2 - 0.09);
    const z = sz * (T.size / 2 - 0.09);
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(x, (T.height - 0.05) / 2 + 0.05, z);
    tableGroup.add(leg);
    const seal = new THREE.Mesh(sealGeo, waxMat); // the four lesser seals under the feet
    seal.position.set(x, 0.025, z);
    tableGroup.add(seal);
  }

  // --- the Sigillum Dei Aemeth: nine inches of wax, and the brightest authored thing --
  const sigilTex = track(sigilTexture());
  const sigilWax = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.118, 0.118, 0.022, 48)),
    waxMat
  );
  sigilWax.position.y = T.height + T.top / 2 + 0.011;
  tableGroup.add(sigilWax);

  const sigilMat = track(
    new THREE.MeshBasicMaterial({
      map: sigilTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false, // unlit HDR: this is display signal, not a lit surface
    })
  );
  const sigil = new THREE.Mesh(track(new THREE.PlaneGeometry(0.236, 0.236)), sigilMat);
  sigil.rotation.x = -Math.PI / 2;
  sigil.position.y = T.height + T.top / 2 + 0.024;
  tableGroup.add(sigil);

  const sigilLight = new THREE.PointLight(0xffd79a, 0, 2.4, 2);
  sigilLight.position.copy(sigil.position).setY(sigil.position.y + 0.12);
  tableGroup.add(sigilLight);

  // --- the shew-stone: where you are ------------------------------------------
  const stoneY = T.height + T.top / 2 + 0.022 + 0.05; // wax top + shell radius
  const stoneCore = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.019, 20, 16)),
    track(new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }))
  );
  stoneCore.material.color.setScalar(EMISSIVE.stone);
  stoneCore.position.set(0, stoneY, 0);
  tableGroup.add(stoneCore);

  const stoneShell = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.05, 28, 20)),
    track(
      new THREE.MeshPhysicalMaterial({
        color: 0xcfe0e8,
        roughness: 0.05,
        metalness: 0,
        transmission: 0.92,
        thickness: 0.12,
        ior: 1.5,
        transparent: true,
        opacity: 0.26,
      })
    )
  );
  stoneShell.position.copy(stoneCore.position);
  tableGroup.add(stoneShell);

  // --- candles -----------------------------------------------------------------
  const candleGroup = new THREE.Group();
  scene.add(candleGroup);
  const flameMat = track(
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
  );
  flameMat.color.setScalar(EMISSIVE.candleCore);
  const flameGeo = track(new THREE.SphereGeometry(0.010, 10, 8));
  const candleGeo = track(new THREE.CylinderGeometry(0.014, 0.017, 0.17, 10));
  const CANDLE_SPOTS = [
    [0.36, T.height + 0.085, -0.3],
    [-0.38, T.height + 0.085, -0.26],
    [0.62, 0.86, 0.55],
    [-0.66, 0.86, 0.5],
  ];
  const candles = CANDLE_SPOTS.map(([x, y, z], i) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(candleGeo, waxMat);
    body.position.set(x, y, z);
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(x, y + 0.098, z);
    flame.scale.set(0.8, 1.6, 0.8);
    const light = new THREE.PointLight(0xffb765, 0.62, 2.4, 2);
    light.position.copy(flame.position);
    g.add(body, flame, light);
    candleGroup.add(g);
    return { g, flame, light, phase: i * 1.7, base: 0.62 };
  });

  // a floor of near-nothing so the room is not literally black
  scene.add(new THREE.AmbientLight(0x2a3038, 0.09));
  const cold = new THREE.DirectionalLight(0x5b7080, 0.045); // the window, off-frame
  cold.position.set(-3, 2.4, -2);
  scene.add(cold);

  // --- the two men --------------------------------------------------------------
  // Robed silhouettes: a revolved profile and a head. Deliberately unindividuated —
  // no attempt at portraiture, and none of the period images are being reproduced.
  function figure({ x, z, height, kneeling, facing, writing = false, reach = 0.6 }) {
    const g = new THREE.Group();
    const profile = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r = kneeling
        ? 0.13 + 0.19 * Math.pow(1 - t, 1.5)
        : 0.1 + 0.2 * Math.pow(1 - t, 1.9);
      profile.push(new THREE.Vector2(Math.max(r, 0.055), t * height));
    }
    const robe = new THREE.Mesh(
      track(new THREE.LatheGeometry(profile, 18)),
      track(new THREE.MeshStandardMaterial({ color: 0x3a3340, roughness: 0.95, metalness: 0 }))
    );
    const head = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.075, 16, 12)),
      track(new THREE.MeshStandardMaterial({ color: 0x6b5a49, roughness: 0.9, metalness: 0 }))
    );
    head.position.y = height + 0.055;
    head.scale.set(1, 1.15, 0.95);

    const shoulderY = height * 0.9;
    const shoulders = new THREE.Mesh(
      track(new THREE.SphereGeometry(1, 14, 10)),
      robe.material
    );
    shoulders.position.set(0, shoulderY, 0.01);
    shoulders.scale.set(0.2, 0.075, 0.135);

    // Both arms swing forward from the shoulders toward whatever the figure is attending
    // to: the page for the one who writes, the stone for the one who looks.
    const armGeo = track(new THREE.CylinderGeometry(0.037, 0.028, height * 0.44, 8));
    const arms = [];
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(armGeo, robe.material);
      arm.position.set(side * 0.155, shoulderY - height * 0.2, 0.055);
      arm.rotation.set(reach, 0, side * 0.2);
      g.add(arm);
      arms.push(arm);
    }

    g.add(robe, head, shoulders);

    // A silhouette alone reads as a lump. Give the man an occupation: a sloped desk and
    // an open page catching the candle. It is also the whole subject of the game -- the
    // page is the only thing in this room that survives to be argued about.
    let page = null;
    if (writing) {
      const desk = new THREE.Mesh(
        track(new THREE.BoxGeometry(0.3, 0.02, 0.22)),
        track(new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.9 }))
      );
      desk.position.set(0, height * 0.88, 0.2);
      desk.rotation.x = 0.52;
      page = new THREE.Mesh(
        track(new THREE.PlaneGeometry(0.21, 0.15)),
        track(new THREE.MeshBasicMaterial({
          map: track(pageTexture(seed)), toneMapped: false, side: THREE.DoubleSide,
        }))
      );
      page.material.color.setScalar(EMISSIVE.page);
      page.position.set(0, height * 0.88 + 0.014, 0.2);
      page.rotation.set(-Math.PI / 2 + 0.52, 0, 0);
      const glow = new THREE.PointLight(0xffd9a0, 0.22, 0.9, 2);
      glow.position.set(0, height * 0.88 + 0.1, 0.16);
      g.add(desk, page, glow);
    }

    g.position.set(x, 0, z);
    g.rotation.y = facing;
    return { group: g, head, page, arms, height };
  }
  // Dee kneels and writes; Kelley stands over the stone and looks. Positions and facings
  // put both of them behind the table and turned toward it, so the camera sees two people
  // attending to the same object rather than two posts in the dark.
  const dee = figure({ x: -0.54, z: -0.18, height: 0.9, kneeling: true, facing: 1.3, writing: true, reach: 0.95 });
  const kelley = figure({ x: 0.30, z: -0.92, height: 1.18, kneeling: false, facing: -0.3, reach: 0.62 });
  scene.add(dee.group, kelley.group);

  // Separation light: without it both figures merge into the back wall. Sits behind and
  // above them, aimed forward, dim enough to read as spill rather than a source.
  const rim = new THREE.DirectionalLight(0x8fa8bd, 1.5);
  rim.position.set(0, 2.2, -3);
  rim.target.position.set(0, 0.8, 0);
  scene.add(rim, rim.target);

  // --- the letters that leave the table -----------------------------------------
  // 12 InstancedMeshes (one per mark) rather than one mesh per letter: 12 draw calls
  // regardless of how many letters the act asks for.
  const LETTER_MAX = 96;
  const glyphTex = glyphTextures(seed).map((t) => track(t));
  const letterGeo = track(new THREE.PlaneGeometry(0.042, 0.042));
  const perGlyph = Math.ceil(LETTER_MAX / glyphTex.length);
  const letterMeshes = glyphTex.map((tex) => {
    const mat = track(
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
    );
    mat.color.setScalar(EMISSIVE.letter);
    const m = new THREE.InstancedMesh(letterGeo, mat, perGlyph);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    m.count = 0;
    scene.add(m);
    return m;
  });

  const rndL = mulberry32(seed ^ 0x1583);
  // Kept low and close to the table on purpose: letters drifting across the upper frame
  // read as confetti and compete with the text the player is actually here to read.
  const letters = Array.from({ length: LETTER_MAX }, () => ({
    a: rndL() * Math.PI * 2,
    r: 0.14 + rndL() * 0.26,
    y: 0.02 + rndL() * 0.30,
    speed: 0.06 + rndL() * 0.16,
    bob: rndL() * Math.PI * 2,
    scale: 0.7 + rndL() * 0.7,
  }));

  // --- inside the glass ----------------------------------------------------------
  // A shell around the camera. It is the reason the whole image has a curvature and a
  // rim: you are not in the room, you are in the thing on the table looking out.
  const glass = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.42, 32, 24)),
    track(
      new THREE.MeshBasicMaterial({
        color: 0x9fc4d8,
        transparent: true,
        opacity: 0.055,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    )
  );
  camera.add(glass);
  scene.add(camera);

  // --- post ------------------------------------------------------------------------
  // Signal order: scene -> bloom -> output. Threshold is calibrated in HDR, BEFORE the
  // tone map, which OutputPass owns. One bloom owner; nothing here needs a second pass.
  let composer = null;
  let bloomPass = null;
  if (!noPost) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      PARAMS.bloom.strength,
      PARAMS.bloom.radius,
      PARAMS.bloom.threshold
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  // --- state the content pack drives ------------------------------------------------
  const target = { candles: 2, letters: 0, figures: 2, sigil: 1, tint: 0xc4a86f, room: 0x0b0a09 };
  const current = {
    letters: 0, sigil: 0.001, candles: 2,
    tintV: new THREE.Color(0xc4a86f),
    roomV: new THREE.Color(0x0b0a09),
  };
  let visionUntil = 0;

  // `immediate` snaps past the easing. Used by the fixed-view visual contract (a
  // screenshot must not depend on how many frames the tab was granted) and available
  // to any caller that wants a cut rather than a dissolve.
  function setScene(s = {}, immediate = false) {
    if (typeof s.candles === 'number') target.candles = Math.max(0, Math.min(4, s.candles));
    if (typeof s.letters === 'number') target.letters = Math.max(0, Math.min(LETTER_MAX, s.letters));
    if (typeof s.figures === 'number') target.figures = s.figures;
    if (typeof s.sigil === 'number') target.sigil = s.sigil;
    if (typeof s.tint === 'number') target.tint = s.tint;
    if (typeof s.room === 'number') target.room = s.room;
    if (immediate) {
      current.sigil = target.sigil;
      current.letters = target.letters;
      current.candles = target.candles;
      current.tintV.set(target.tint);
      current.roomV.set(target.room);
      applyRoom();
      if (reduced) frame(0.016, clock.elapsedTime);
    }
  }

  // A flare, for when the player chooses to appear.
  function pulse(strength = 1) {
    visionUntil = performance.now() + 1400 * strength;
  }

  // Walls and fog carry the act as much as the sigil does. Mortlake is cold slate,
  // Prague is gold-brown, Trebon is ember, the late acts go grey and then nearly out.
  function applyRoom() {
    roomMat.color.copy(current.roomV);
    scene.fog.color.copy(current.roomV).multiplyScalar(0.35);
    scene.background.copy(scene.fog.color);
  }

  // --- loop --------------------------------------------------------------------------
  const clock = new THREE.Clock();
  const dummy = new THREE.Object3D();
  let raf = 0;
  let running = true;

  function frame(dt, t) {
    // camera: drift only, never a swing
    const d = PARAMS.drift;
    camera.position.x = PARAMS.camera.pos[0] + Math.sin(t * d.rate) * d.amp;
    camera.position.y = PARAMS.camera.pos[1] + Math.sin(t * d.rate * 1.7 + 1.2) * d.amp * 0.45;
    camera.lookAt(lookTarget);

    // vision flare, eased out
    const vision = Math.max(0, (visionUntil - performance.now()) / 1400);
    const v = vision * vision;

    // easing toward the act's scene state, frame-rate independent
    const ease = (rate) => 1 - Math.exp(-dt * rate);
    current.sigil += (target.sigil - current.sigil) * ease(2.2);
    current.letters += (target.letters - current.letters) * ease(1.6);
    current.candles += (target.candles - current.candles) * ease(2.6);
    current.tintV.lerp(new THREE.Color(target.tint), ease(1.4));
    current.roomV.lerp(new THREE.Color(target.room), ease(1.0));
    applyRoom();

    // the sigil breathes; the vision drives it hard
    const pulseAmt = 0.72 + 0.28 * Math.sin(t * 0.85) + v * 2.4;
    const sigilLum = EMISSIVE.sigil * current.sigil * pulseAmt;
    sigilMat.color.copy(current.tintV).multiplyScalar(sigilLum / 2.6);
    sigilLight.intensity = 0.28 * current.sigil * pulseAmt + v * 1.2;
    sigilLight.color.copy(current.tintV);

    stoneCore.material.color.setScalar(EMISSIVE.stone * (0.8 + 0.2 * Math.sin(t * 1.6) + v * 1.5));
    stoneShell.scale.setScalar(1 + v * 0.35);

    // candles: flicker is a light property, not a bloom property
    candles.forEach((c, i) => {
      const on = i < Math.round(current.candles);
      c.g.visible = on;
      if (!on) return;
      const f =
        0.78 +
        0.22 * Math.sin(t * 9.3 + c.phase) * Math.sin(t * 3.1 + c.phase * 2.2) +
        0.06 * Math.sin(t * 21 + c.phase);
      c.light.intensity = c.base * f * (1 + v * 0.6);
      c.flame.scale.set(0.8 * f, 1.6 * f, 0.8 * f);
    });

    dee.group.visible = target.figures >= 1;
    kelley.group.visible = target.figures >= 2;

    // Idle motion, small enough to be felt rather than watched: Dee's head dips and
    // lifts as he copies; Kelley leans in over the stone and holds, then eases back.
    dee.head.rotation.x = 0.22 + Math.sin(t * 0.9) * 0.1 + Math.sin(t * 2.7) * 0.03;
    if (dee.page) dee.page.material.color.setScalar(EMISSIVE.page * (0.92 + 0.08 * Math.sin(t * 7.1)));
    if (dee.arms) {
      dee.arms[1].rotation.z = 0.2 + Math.sin(t * 1.5) * 0.06; // the writing hand
      dee.arms[1].rotation.x = 0.95 + Math.sin(t * 1.5 + 0.6) * 0.05;
    }
    const lean = 0.12 + 0.1 * Math.sin(t * 0.42) + v * 0.25;
    kelley.group.rotation.x = lean * 0.35;
    kelley.head.rotation.x = lean;
    if (kelley.arms) {
      kelley.arms[0].rotation.x = 0.62 + lean * 0.5;
      kelley.arms[1].rotation.x = 0.62 + lean * 0.5;
    }

    // letters: rise off the table, orbit, and face the camera
    const shown = Math.round(current.letters);
    letterMeshes.forEach((m) => (m.count = 0));
    for (let i = 0; i < shown; i++) {
      const L = letters[i];
      const mesh = letterMeshes[i % letterMeshes.length];
      const idx = mesh.count;
      if (idx >= perGlyph) continue;
      const ang = L.a + t * L.speed;
      const rise = T.height + T.top / 2 + L.y + Math.sin(t * 0.6 + L.bob) * 0.03 + v * 0.25;
      dummy.position.set(Math.cos(ang) * L.r, rise, Math.sin(ang) * L.r);
      dummy.quaternion.copy(camera.quaternion); // billboard
      dummy.scale.setScalar(L.scale * (1 + v * 0.5));
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
      mesh.count = idx + 1;
      mesh.material.color.copy(current.tintV).multiplyScalar((EMISSIVE.letter * (1 + v)) / 2.0);
    }
    letterMeshes.forEach((m) => (m.instanceMatrix.needsUpdate = true));

    if (bloomPass) bloomPass.strength = PARAMS.bloom.strength * (1 + v * 1.2);

    composer ? composer.render() : renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const dt = clock.getDelta(); // always drain, so a resumed tab gets no giant step
    if (document.hidden) return; // do not burn a laptop battery on a hidden tab
    frame(Math.min(dt, 0.1), clock.elapsedTime);
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    if (composer) composer.setSize(w, h);
    if (reduced) frame(0.016, clock.elapsedTime); // static mode still needs a repaint
  }
  window.addEventListener('resize', onResize);

  if (reduced) {
    frame(0.016, 0); // one frame, no loop, no motion
  } else {
    loop();
  }

  if (debug) {
    const p = document.createElement('pre');
    p.style.cssText =
      'position:fixed;left:8px;bottom:8px;z-index:9;margin:0;padding:6px 9px;' +
      'font:11px ui-monospace,monospace;color:#9fb4c4;background:rgba(0,0,0,.6);' +
      'border:1px solid #333a42;white-space:pre;pointer-events:none';
    document.body.appendChild(p);
    setInterval(() => {
      p.textContent =
        `seed ${seed}  post ${noPost ? 'OFF (baseline)' : 'bloom'}  reduced ${reduced}\n` +
        `bloom s=${PARAMS.bloom.strength} r=${PARAMS.bloom.radius} t=${PARAMS.bloom.threshold}\n` +
        `sigil ${current.sigil.toFixed(2)}  letters ${Math.round(current.letters)}  ` +
        `candles ${Math.round(current.candles)}  figures ${target.figures}\n` +
        `emissive candle ${EMISSIVE.candleCore} > stone ${EMISSIVE.stone} > sigil ${EMISSIVE.sigil} ` +
        `> letter ${EMISSIVE.letter} > chalk ${EMISSIVE.chalk} > grid ${EMISSIVE.grid}`;
    }, 250);
  }

  return {
    setScene,
    pulse,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      disposables.forEach((d) => d.dispose && d.dispose());
      if (composer) composer.dispose && composer.dispose();
      renderer.dispose();
    },
  };
}
