// Immersive 3D facility gallery — ApeChain-inspired spatial showcase.
// Cards live on the inside of a digital sphere around the viewer; drag to
// orbit with momentum, hover to light a card up, click to travel into it.
// Raw Three.js (no R3F) + GSAP for the cinematic focus transition.
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import gsap from "gsap";
import { ArrowRight, ChevronLeft, ChevronRight, Move, X } from "lucide-react";

// ── Content ────────────────────────────────────────────────────────────────
const CARDS = [
  {
    id: "strength-lab",
    title: "Strength Lab",
    tag: "Strength · Power",
    desc: "Racks, platforms and free weights for structured strength training — the engine room where heavy work gets done.",
    img: "/facility/cards/strength-lab.jpg?v=2",
    features: ["Competition racks & lifting platform", "Full dumbbell + barbell range", "Sleds, plates & conditioning tools"],
  },
  {
    id: "performance-lane",
    title: "Performance Lane",
    tag: "Speed · Conditioning",
    desc: "A dedicated turf lane for sprints, sled pushes and engine work — built to make you faster and harder to tire out.",
    img: "/facility/cards/performance-lane.jpg?v=2",
    features: ["Sprint + sled turf lane", "Climbing ropes & battle ropes", "Plyo boxes for explosive work"],
  },
  {
    id: "skill-arena",
    title: "Skill Arena",
    tag: "Calisthenics · Skills",
    desc: "Rings, rigs and open floor under the lights — where muscle-ups, levers and handstands are trained, not wished for.",
    img: "/facility/cards/skill-arena.jpg?v=2",
    features: ["Gymnastic rings & pull-up rig", "Skill progressions for every level", "Mirrored wall for movement feedback"],
  },
  {
    id: "freestyle-area",
    title: "Freestyle Area",
    tag: "Flow · Movement",
    desc: "Bars, mats and room to move — an open playground for creative movement, freestyle flows and soft landings.",
    img: "/facility/cards/freestyle-area.jpg?v=2",
    features: ["Monkey bars & parallel bars", "Crash mats for safe skill work", "Open floor for freestyle flow"],
  },
  {
    id: "mobility-zone",
    title: "Mobility Zone",
    tag: "Mobility · Recovery",
    desc: "Turf, mats and wall bars for the work that keeps you moving — restore range and build the foundation your body needs.",
    img: "/facility/cards/mobility-zone.jpg?v=2",
    features: ["Open turf + mat space", "Wall bars for deep positions", "Mobility tools & soft landings"],
  },
];

// ── Scene constants ────────────────────────────────────────────────────────
const STEP = THREE.MathUtils.degToRad(32); // angular gap between cards
const RADIUS = 10;
const CARD_W = 6.8;
const CARD_H = 5.12; // matches the 1445×1088 source aspect
const BG = 0x05080d;
const ACCENT = new THREE.Color("#2E8DFF");

// ── Card shader: rounded corners, cinematic grade, hover light, edge glow ──
const cardVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const cardFrag = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uHover;
  uniform float uActive;
  uniform float uEdge;    // fades cards near the loop's wrap seam
  uniform float uReflect; // 1 = reflection copy (fades toward floor)
  uniform vec3 uGlow;
  varying vec2 vUv;

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    float aspect = ${(CARD_W / CARD_H).toFixed(4)};
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    float d = sdRoundRect(p, vec2(aspect * 0.5, 0.5), 0.045);
    float aa = fwidth(d) * 1.5;
    float mask = smoothstep(aa, -aa, d);
    if (mask < 0.01) discard;

    vec3 col = texture2D(uMap, vUv).rgb;
    // lift shadows (gamma) + gentle exposure so the footage reads bright
    col = pow(col, vec3(0.82)) * 1.08;
    // cinematic grade: barely cool the shadows, keep them open
    float lum0 = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col * vec3(0.96, 0.99, 1.05), col, smoothstep(0.0, 0.5, lum0));
    // vignette inside the card
    float vig = smoothstep(0.95, 0.3, length(p * vec2(0.8, 1.05)));
    col *= mix(0.93, 1.0, vig);
    // recede when not featured, light up on hover
    col *= mix(0.8, 1.0, uActive) + uHover * 0.18;
    // top sheen so the surface reads as glass
    col += vec3(0.5, 0.7, 1.0) * smoothstep(0.55, 1.0, vUv.y) * 0.05 * (0.4 + uActive);
    // accent edge glow
    float edge = smoothstep(-0.035, -0.004, d) * (1.0 - smoothstep(-0.004, 0.0, d));
    col += uGlow * edge * (0.10 + uHover * 0.65 + uActive * 0.22);

    float alpha = uOpacity * uEdge * mask;
    if (uReflect > 0.5) alpha *= smoothstep(0.85, 0.0, vUv.y) * 0.16;
    gl_FragColor = vec4(col, alpha);
  }
`;

// Soft round sprite for particles
function makeDotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(190,220,255,1)");
  g.addColorStop(0.4, "rgba(120,170,255,0.45)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Horizontal light-streak gradient
function makeStreakTexture() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 8;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.5, "rgba(110,170,255,0.9)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Radial floor glow
function makeFloorTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, "rgba(30,52,82,0.55)");
  g.addColorStop(0.5, "rgba(14,24,38,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const wrapTwo = (n, pad = 2) => String(n + 1).padStart(pad, "0");

// ── Component ──────────────────────────────────────────────────────────────
export default function FacilityGallery3D() {
  const wrapRef = useRef(null);
  const canvasHostRef = useRef(null);
  const apiRef = useRef(null); // imperative bridge into the three scene
  const detailRef = useRef(null);
  const detailImgRef = useRef(null);
  const detailContentRef = useRef(null);

  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false); // camera travelling / detail open
  const [detail, setDetail] = useState(null); // card shown in the detail view
  const [hint, setHint] = useState(true);
  const [webgl, setWebgl] = useState(() => {
    try {
      const c = document.createElement("canvas");
      return Boolean(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      return false;
    }
  });

  // ── Build the scene ──────────────────────────────────────────────────────
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      queueMicrotask(() => setWebgl(false));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(BG, 1);
    host.appendChild(renderer.domElement);
    const el = renderer.domElement;
    el.style.display = "block";
    el.style.touchAction = "pan-y"; // keep vertical page scroll on touch

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(BG, 11, 26);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60);
    camera.position.set(0, 0.15, 0);

    // ── Card ring ──
    const ring = new THREE.Group();
    scene.add(ring);
    const loader = new THREE.TextureLoader();
    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 24, 1);
    // bend the plane onto the cylinder so cards wrap around the viewer
    {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const a = x / RADIUS;
        pos.setX(i, Math.sin(a) * RADIUS);
        pos.setZ(i, (1 - Math.cos(a)) * RADIUS);
      }
      geo.computeVertexNormals();
    }

    const cards = CARDS.map((card, i) => {
      const tex = loader.load(card.img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const makeMat = (reflect) =>
        new THREE.ShaderMaterial({
          vertexShader: cardVert,
          fragmentShader: cardFrag,
          transparent: true,
          depthWrite: !reflect,
          uniforms: {
            uMap: { value: tex },
            uOpacity: { value: 1 },
            uHover: { value: 0 },
            uActive: { value: 0 },
            uEdge: { value: 1 },
            uReflect: { value: reflect ? 1 : 0 },
            uGlow: { value: ACCENT.clone() },
          },
        });

      const theta = i * STEP;
      const holder = new THREE.Group();
      holder.position.set(Math.sin(theta) * RADIUS, 0, -Math.cos(theta) * RADIUS);
      holder.lookAt(0, 0, 0);
      ring.add(holder);

      const mat = makeMat(false);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 2;
      mesh.userData.index = i;
      holder.add(mesh);

      const rmat = makeMat(true);
      const refl = new THREE.Mesh(geo, rmat);
      refl.scale.y = -1;
      refl.position.y = -(CARD_H + 0.1);
      refl.renderOrder = 1;
      holder.add(refl);

      return { holder, mesh, mat, rmat, theta, hoverT: 0, activeT: 0 };
    });

    // ── Echo ring: dim distant duplicates for layered depth ──
    const echoes = new THREE.Group();
    scene.add(echoes);
    cards.forEach((c, i) => {
      const mat = c.mat.clone();
      mat.uniforms.uMap.value = c.mat.uniforms.uMap.value;
      mat.uniforms.uOpacity.value = 0.5;
      mat.uniforms.uActive.value = 0.6;
      mat.depthWrite = false;
      const m = new THREE.Mesh(geo, mat);
      // spread echoes around the full circle so the loop always has depth
      const theta = (i * Math.PI * 2) / CARDS.length + Math.PI / CARDS.length;
      m.position.set(Math.sin(theta) * 17, i % 2 ? 2.1 : -1.4, -Math.cos(theta) * 17);
      m.lookAt(0, m.position.y * 0.4, 0);
      m.scale.setScalar(1.25);
      m.renderOrder = 0;
      echoes.add(m);
    });

    // ── Atmosphere: particles, streaks, floor glow ──
    const dotTex = makeDotTexture();
    const pGeo = new THREE.BufferGeometry();
    const P = 260;
    const pPos = new Float32Array(P * 3);
    for (let i = 0; i < P; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 4 + Math.random() * 16;
      pPos[i * 3] = Math.sin(a) * r;
      pPos[i * 3 + 1] = -4 + Math.random() * 10;
      pPos[i * 3 + 2] = -Math.cos(a) * r;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      map: dotTex, size: 0.14, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const streakTex = makeStreakTexture();
    const streaks = new THREE.Group();
    scene.add(streaks);
    for (let i = 0; i < 6; i++) {
      const w = 3 + Math.random() * 5;
      const sMat = new THREE.MeshBasicMaterial({
        map: streakTex, transparent: true, opacity: 0.16 + Math.random() * 0.14,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      });
      const s = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.02 + Math.random() * 0.025), sMat);
      const a = Math.random() * Math.PI * 2;
      const r = 12 + Math.random() * 7;
      s.position.set(Math.sin(a) * r, -3 + Math.random() * 8, -Math.cos(a) * r);
      s.lookAt(0, s.position.y, 0);
      s.userData.speed = 0.02 + Math.random() * 0.05;
      streaks.add(s);
    }

    const floorTex = makeFloorTexture();
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 70),
      new THREE.MeshBasicMaterial({ map: floorTex, transparent: true, depthWrite: false })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.4;
    scene.add(floor);

    // ── Interaction state ──
    // The scroll position (rot/target) is an unbounded angle: cards repeat
    // every SPAN radians, so the gallery loops endlessly in both directions.
    const N = CARDS.length;
    const SPAN = N * STEP;
    const state = {
      rot: 0, target: 0,
      dragging: false, moved: 0, lastX: 0, lastT: 0, vel: 0,
      hovered: -1, mode: "explore",
      mouseX: 0, mouseY: 0, camRX: 0, camRY: 0, basePitch: 0,
      camZ: 0, fov: 46, fxFade: 1, idx: 0,
      hinted: false, inView: true, pageVisible: true,
      ctxLost: false, activeTl: null,
      dtAvg: 1 / 60, degraded: false,
    };
    apiRef.current = { state };

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const meshes = cards.map((c) => c.mesh);

    // wrap an angle into [-SPAN/2, SPAN/2) — a card's display azimuth
    const wrapSpan = (a) => {
      let v = (a + SPAN / 2) % SPAN;
      if (v < 0) v += SPAN;
      return v - SPAN / 2;
    };
    const mod = (n, m) => ((n % m) + m) % m;
    const snap = (v) => Math.round(v / STEP) * STEP;
    const indexFromRot = (v) => mod(Math.round(-v / STEP), N);

    const announce = () => {
      const idx = indexFromRot(state.target);
      if (idx !== state.idx) { state.idx = idx; setActive(idx); }
    };

    // travel the shortest way around the loop to logical card i
    const targetFor = (i) => {
      const cur = Math.round(-state.target / STEP);
      let diff = mod(i, N) - mod(cur, N);
      if (diff > N / 2) diff -= N;
      if (diff < -N / 2) diff += N;
      return -(cur + diff) * STEP;
    };
    const goTo = (i) => {
      if (state.mode !== "explore") return;
      state.target = targetFor(i);
      announce();
    };
    const goBy = (d) => {
      if (state.mode !== "explore") return;
      state.target = -(Math.round(-state.target / STEP) + d) * STEP;
      announce();
    };

    // ── Cinematic focus: dolly into the card, fade the world, open detail ──
    const focusCard = (i) => {
      if (state.mode !== "explore") return;
      state.mode = "focusing";
      setFocused(true);
      state.target = targetFor(i);
      announce();
      const card = cards[i];
      const dur = reduce ? 0 : 1.25;
      state.activeTl?.kill();
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut", duration: dur, overwrite: "auto" },
        onComplete: () => { state.mode = "focused"; },
      });
      state.activeTl = tl;
      tl.to(state, { camZ: -(RADIUS - 4.0), fov: 40, fxFade: 0 }, 0);
      cards.forEach((c, j) => {
        if (j !== i) tl.to([c.mat.uniforms.uOpacity, c.rmat.uniforms.uOpacity], { value: 0 }, 0);
      });
      tl.to(card.rmat.uniforms.uOpacity, { value: 0 }, 0);
      tl.add(() => setDetail(CARDS[i]), dur * 0.5);
    };

    const unfocus = () => {
      if (state.mode === "explore") return;
      state.mode = "focusing";
      const dur = reduce ? 0 : 0.9;
      state.activeTl?.kill();
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut", duration: dur, overwrite: "auto" },
        onComplete: () => { state.mode = "explore"; setFocused(false); },
      });
      state.activeTl = tl;
      tl.to(state, { camZ: 0, fov: 46, fxFade: 1 }, 0);
      cards.forEach((c) => {
        tl.to(c.mat.uniforms.uOpacity, { value: 1 }, 0);
        tl.to(c.rmat.uniforms.uOpacity, { value: 1 }, 0);
      });
    };

    apiRef.current.goTo = goTo;
    apiRef.current.goBy = goBy;
    apiRef.current.focusCard = focusCard;
    apiRef.current.unfocus = unfocus;

    // ── Pointer handlers ──
    const onDown = (e) => {
      if (state.mode !== "explore") return;
      state.dragging = true;
      state.moved = 0;
      state.lastX = e.clientX;
      state.lastT = performance.now();
      state.vel = 0;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      state.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      state.mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      if (state.dragging) {
        const dx = e.clientX - state.lastX;
        const now = performance.now();
        const dt = Math.max(now - state.lastT, 1);
        state.vel = state.vel * 0.6 + (dx / dt) * 0.4;
        state.lastX = e.clientX;
        state.lastT = now;
        state.moved += Math.abs(dx);
        state.target += dx * 0.0036; // unbounded — the loop wraps forever
        announce();
        if (!state.hinted && state.moved > 24) { state.hinted = true; setHint(false); }
        return;
      }
      // hover raycast
      if (state.mode !== "explore") return;
      raycaster.setFromCamera(ndc.set(state.mouseX, -state.mouseY), camera);
      const hits = raycaster.intersectObjects(meshes, false);
      state.hovered = hits.length ? hits[0].object.userData.index : -1;
      el.style.cursor = state.hovered >= 0 ? "pointer" : "grab";
    };
    const onUp = (e) => {
      if (!state.dragging) return;
      state.dragging = false;
      el.style.cursor = "grab";
      const wasClick = state.moved < 7;
      if (wasClick && state.mode === "explore") {
        const rect = el.getBoundingClientRect();
        ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1));
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(meshes, false);
        if (hits.length) {
          const i = hits[0].object.userData.index;
          if (i === state.idx) focusCard(i);
          else goTo(i);
        }
        return;
      }
      // momentum throw, then settle on the nearest card
      state.target += state.vel * 130 * 0.0036;
      state.target = snap(state.target);
      announce();
    };
    const onLeave = () => { state.hovered = -1; };

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);

    // WebGL contexts can be evicted by the browser (GPU resets, long idle,
    // too many live contexts). preventDefault permits restoration; if it
    // never arrives, swap to the static fallback instead of a frozen canvas.
    let lostTimer = 0;
    const onCtxLost = (e) => {
      e.preventDefault();
      state.ctxLost = true;
      lostTimer = window.setTimeout(() => setWebgl(false), 4000);
    };
    const onCtxRestored = () => {
      state.ctxLost = false;
      window.clearTimeout(lostTimer);
    };
    el.addEventListener("webglcontextlost", onCtxLost, false);
    el.addEventListener("webglcontextrestored", onCtxRestored, false);

    // ── Resize ──
    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      const portrait = w / h < 0.9;
      state.fov = state.mode === "explore" ? (portrait ? 60 : 46) : state.fov;
      // pitch down slightly on portrait so the card rides above the caption
      state.basePitch = portrait ? -0.05 : 0;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // pause rendering offscreen / hidden tab — tracked as two independent
    // flags so returning to the tab always resumes the loop
    const io = new IntersectionObserver(([entry]) => { state.inView = entry.isIntersecting; }, { rootMargin: "100px" });
    io.observe(host);
    const onVis = () => { state.pageVisible = document.visibilityState === "visible"; };
    document.addEventListener("visibilitychange", onVis);
    // watchdog: recompute both flags from scratch so a missed observer event
    // can never leave the loop paused for more than ~1.5s
    const watchdog = window.setInterval(() => {
      const r = host.getBoundingClientRect();
      state.inView = r.width > 0 && r.bottom > -150 && r.top < window.innerHeight + 150;
      state.pageVisible = document.visibilityState === "visible";
    }, 1500);

    // ── Render loop ──
    // All damping is delta-time based (1 - e^(-rate·dt)) so motion speed is
    // identical at 144fps and on slow software-rendered WebGL alike.
    const t0 = performance.now();
    let last = t0;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!state.inView || !state.pageVisible || state.ctxLost) { last = performance.now(); return; }
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const t = (now - t0) / 1000;
      const damp = (rate) => (reduce ? 1 : 1 - Math.exp(-rate * dt));

      // slow device? drop resolution and background effects once, permanently
      state.dtAvg += (dt - state.dtAvg) * 0.05;
      if (!state.degraded && t > 4 && state.dtAvg > 0.045) {
        state.degraded = true;
        renderer.setPixelRatio(1);
        echoes.visible = false;
        streaks.visible = false;
      }

      // settle toward target with weight; gentle idle sway keeps it alive
      state.rot += (state.target - state.rot) * damp(5);
      const sway = reduce ? 0 : Math.sin(t * 0.22) * 0.012 * state.fxFade;
      echoes.rotation.y = -(state.rot * 0.55 + sway * 1.6);
      particles.rotation.y = -(state.rot * 0.3) + (reduce ? 0 : t * 0.01);
      streaks.children.forEach((s, i) => {
        if (!reduce) s.rotation.y += 0; // streaks orbit via group
        s.material.opacity = (0.14 + Math.sin(t * 0.7 + i * 2.1) * 0.08) * state.fxFade;
      });
      if (!reduce) streaks.rotation.y = -(state.rot * 0.4) + t * 0.012;
      pMat.opacity = 0.5 * Math.max(state.fxFade, 0.25);

      // per-card placement on the looping ring + emphasis + hover response.
      // Each card's display azimuth is its angle wrapped into ±SPAN/2 around
      // the scroll position, so the sequence repeats endlessly both ways;
      // uEdge fades cards out before they jump across the wrap seam.
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const az = wrapSpan(c.theta + state.rot) + sway;
        const bobY = reduce ? 0 : Math.sin(t * 0.5 + i * 1.7) * 0.06 * state.fxFade;
        c.holder.position.set(Math.sin(az) * RADIUS, bobY, -Math.cos(az) * RADIUS);
        c.holder.lookAt(0, bobY, 0);
        const ang = Math.abs(az);
        const aT = THREE.MathUtils.clamp(1 - ang / STEP, 0, 1);
        const hT = state.hovered === i && state.mode === "explore" ? 1 : 0;
        c.activeT += (aT - c.activeT) * damp(6.3);
        c.hoverT += (hT - c.hoverT) * damp(7.7);
        const edge = 1 - THREE.MathUtils.smoothstep(ang, SPAN * 0.36, SPAN * 0.49);
        c.mat.uniforms.uActive.value = c.activeT;
        c.mat.uniforms.uHover.value = c.hoverT;
        c.mat.uniforms.uEdge.value = edge;
        c.rmat.uniforms.uActive.value = c.activeT;
        c.rmat.uniforms.uEdge.value = edge;
        const s = 1 + c.activeT * 0.05 + c.hoverT * 0.035;
        c.mesh.scale.setScalar(s);
        c.mesh.position.z = (c.activeT * 0.25 + c.hoverT * 0.3); // toward viewer
      }

      // camera: dolly target + soft mouse parallax
      camera.position.z = state.camZ;
      if (Math.abs(camera.fov - state.fov) > 0.01) { camera.fov += (state.fov - camera.fov) * damp(5); camera.updateProjectionMatrix(); }
      const parallax = state.mode === "explore" && !reduce ? 1 : 0;
      state.camRY += (-state.mouseX * 0.045 * parallax - state.camRY) * damp(3.1);
      state.camRX += (state.mouseY * 0.025 * parallax - state.camRX) * damp(3.1);
      camera.rotation.set(state.camRX + state.basePitch, state.camRY, 0);

      renderer.render(scene, camera);
    };
    tick();

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(watchdog);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      window.clearTimeout(lostTimer);
      el.removeEventListener("webglcontextlost", onCtxLost);
      el.removeEventListener("webglcontextrestored", onCtxRestored);
      state.activeTl?.kill();
      gsap.killTweensOf(state);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            Object.values(m.uniforms ?? {}).forEach((u) => u.value?.isTexture && u.value.dispose());
            m.map?.dispose?.();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      // release the GL context immediately — without this, StrictMode/HMR
      // remounts stack up live contexts until the browser starts killing them
      renderer.forceContextLoss();
      host.contains(el) && host.removeChild(el);
      apiRef.current = null;
    };
  }, []);

  // ── Detail view enter/exit choreography ──────────────────────────────────
  useEffect(() => {
    if (!detail || !detailRef.current) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(detailRef.current, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.5 });
    tl.fromTo(detailImgRef.current, { scale: 1.12 }, { scale: 1.04, duration: reduce ? 0 : 2.2, ease: "power2.out" }, 0);
    tl.fromTo(
      detailContentRef.current?.children ?? [],
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: reduce ? 0 : 0.7, stagger: 0.07 },
      reduce ? 0 : 0.25
    );
    return () => tl.kill();
  }, [detail]);

  const closeDetail = useCallback(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const finish = () => { setDetail(null); apiRef.current?.unfocus(); };
    if (reduce || !detailRef.current) { finish(); return; }
    gsap.to(detailRef.current, { opacity: 0, duration: 0.45, ease: "power2.inOut", onComplete: finish });
  }, []);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e) => e.key === "Escape" && closeDetail();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail, closeDetail]);

  const onKeyNav = (e) => {
    if (focused) return;
    if (e.key === "ArrowRight") { apiRef.current?.goBy(1); setHint(false); }
    if (e.key === "ArrowLeft") { apiRef.current?.goBy(-1); setHint(false); }
    if (e.key === "Enter") apiRef.current?.focusCard(active);
  };

  const card = CARDS[active];

  // Static fallback if WebGL is unavailable
  if (!webgl) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-xl border border-[#1E2A38]">
            <img src={c.img} alt={c.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="p-4">
              <h3 className="font-heading text-lg text-white">{c.title}</h3>
              <p className="mt-1 text-sm text-[#9AA7B6]">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      role="region"
      aria-label="Facility zones 3D gallery. Use arrow keys to browse, Enter to open."
      onKeyDown={onKeyNav}
      className="group relative h-[78vh] min-h-[540px] w-full overflow-hidden rounded-lg border border-[#1E2A38] bg-[#05080D] outline-none focus-visible:ring-1 focus-visible:ring-[#2E8DFF]/60 sm:h-[86vh]"
    >
      {/* WebGL stage */}
      <div ref={canvasHostRef} className="absolute inset-0" aria-hidden="true" />

      {/* Atmosphere grade on top of the canvas */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0B1016]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0B1016]/60 to-transparent" />
        <div className="absolute inset-0 [background:radial-gradient(120%_90%_at_50%_50%,transparent_70%,rgba(3,6,10,0.3)_100%)]" />
      </div>

      {/* ── Explore UI ── */}
      <div className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-500 ${focused ? "opacity-0" : "opacity-100"}`}>
        {/* Featured card info — bottom left */}
        <div key={card.id} className="absolute bottom-6 left-5 max-w-md sm:bottom-10 sm:left-10">
          <p className="ct-gallery-rise text-[10px] font-bold uppercase tracking-[0.3em] text-[#2E8DFF]" style={{ animationDelay: "0ms" }}>
            {card.tag}
          </p>
          <h3 className="ct-gallery-rise mt-2 font-heading text-3xl uppercase leading-none tracking-wide text-white sm:text-5xl" style={{ animationDelay: "60ms" }}>
            {card.title}
          </h3>
          <p className="ct-gallery-rise mt-3 hidden max-w-sm text-sm leading-relaxed text-[#9AA7B6] sm:block" style={{ animationDelay: "120ms" }}>
            {card.desc}
          </p>
          <button
            type="button"
            onClick={() => !focused && apiRef.current?.focusCard(active)}
            className="ct-gallery-rise btn-secondary pointer-events-auto mt-5 text-xs"
            style={{ animationDelay: "180ms" }}
          >
            Step Inside <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Index + progress — top left */}
        <div className="absolute left-5 top-5 flex items-center gap-3 sm:left-10 sm:top-8">
          <span className="font-heading text-sm tracking-widest text-white">{wrapTwo(active)}</span>
          <span className="relative h-px w-16 overflow-hidden bg-white/15">
            <span
              className="absolute inset-y-0 left-0 bg-[#2E8DFF] transition-all duration-500 ease-out"
              style={{ width: `${((active + 1) / CARDS.length) * 100}%` }}
            />
          </span>
          <span className="font-heading text-sm tracking-widest text-white/40">{wrapTwo(CARDS.length - 1)}</span>
        </div>

        {/* Drag hint — center bottom */}
        <div
          className={`absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/50 transition-opacity duration-700 lg:flex ${hint ? "opacity-100" : "opacity-0"}`}
        >
          <Move className="h-3.5 w-3.5 text-[#2E8DFF]" /> Drag to explore
        </div>

        {/* Prev / next — mid edges */}
        <button
          type="button"
          aria-label="Previous zone"
          onClick={() => { apiRef.current?.goBy(-1); setHint(false); }}
          className="pointer-events-auto absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0B1016]/60 text-white backdrop-blur transition hover:border-[#2E8DFF]/60 hover:text-[#2E8DFF] sm:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next zone"
          onClick={() => { apiRef.current?.goBy(1); setHint(false); }}
          className="pointer-events-auto absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0B1016]/60 text-white backdrop-blur transition hover:border-[#2E8DFF]/60 hover:text-[#2E8DFF] sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Thumbnails — bottom right */}
        <div className="pointer-events-auto absolute bottom-6 right-5 hidden items-end gap-2 sm:bottom-10 sm:right-10 lg:flex">
          {CARDS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Go to ${c.title}`}
              onClick={() => { apiRef.current?.goTo(i); setHint(false); }}
              className={`relative overflow-hidden rounded-md border transition-all duration-300 ${
                i === active ? "h-14 w-20 border-[#2E8DFF]" : "h-12 w-16 border-white/15 opacity-50 hover:opacity-90"
              }`}
            >
              <img src={c.img} alt="" className="h-full w-full object-cover" />
              {i === active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#2E8DFF]" />}
            </button>
          ))}
        </div>

        {/* Mobile dots — centered so they clear the floating WhatsApp button */}
        <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden">
          {CARDS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Go to ${c.title}`}
              onClick={() => apiRef.current?.goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-[#2E8DFF]" : "w-1.5 bg-white/25"}`}
            />
          ))}
        </div>
      </div>

      {/* ── Detail view: travel deeper into the selected zone ── */}
      {detail && (
        <div ref={detailRef} className="absolute inset-0 z-30 overflow-hidden bg-[#05080D]">
          <div className="absolute inset-0 overflow-hidden">
            <img ref={detailImgRef} src={detail.img} alt={detail.title} className="h-full w-full scale-[1.12] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05080D]/90 via-[#05080D]/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05080D]/70 via-transparent to-transparent" />
          </div>

          <button
            type="button"
            aria-label="Back to gallery"
            onClick={closeDetail}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#0B1016]/60 text-white backdrop-blur transition hover:rotate-90 hover:border-[#2E8DFF] hover:text-[#2E8DFF] sm:right-8 sm:top-8"
            style={{ transitionDuration: "300ms" }}
          >
            <X className="h-4 w-4" />
          </button>

          <div ref={detailContentRef} className="absolute bottom-8 left-5 right-5 z-10 max-w-2xl sm:bottom-14 sm:left-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#2E8DFF]/40 bg-[#2E8DFF]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#2E8DFF]">
              Facility Zone · {detail.tag}
            </p>
            <h3 className="mt-4 font-heading text-4xl uppercase leading-[0.95] tracking-wide text-white sm:text-7xl">{detail.title}</h3>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#C6D2DF] sm:text-base">{detail.desc}</p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {detail.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-[#9AA7B6]">
                  <span className="h-1 w-1 rounded-full bg-[#2E8DFF]" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link to="/contact" className="btn-primary text-xs">
                Book a Free Trial <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button type="button" onClick={closeDetail} className="btn-secondary text-xs">
                Back to Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
