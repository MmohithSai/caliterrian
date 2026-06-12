// Hall of Firsts — spherical milestone wall (phantom.land-inspired).
// Member-milestone cards are mapped onto the inside of a sphere around the
// viewer; left-drag looks around with lenis-style eased momentum, hovering
// lights a card up, and clicking dollies into the card before a detail page
// wipes in. Raw Three.js (no R3F) + GSAP, same stack as FacilityGallery3D.
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ArrowRight, Move, X } from "lucide-react";

// ── Content: member firsts shown on the wall ──────────────────────────────
const ENTRIES = [
  { id: "priya-pullup",    name: "Priya S.",  milestone: "First Pull-Up",       date: "Jan 2025", quote: "I never thought I could do a pull-up. The coaches made it possible!",      img: "/muscleup-cinematic/frame00012.jpg" },
  { id: "arjun-handstand", name: "Arjun M.",  milestone: "First Handstand",     date: "Feb 2025", quote: "The skill progressions here are incredible. Methodical and effective.",    img: "/pushup/ezgif-frame-018.jpg" },
  { id: "rahul-goal",      name: "Rahul K.",  milestone: "First Goal Hit",      date: "Mar 2025", quote: "I went from 95kg to 77kg and gained real strength along the way.",         img: "/facility/cards/strength-lab.jpg" },
  { id: "kiran-ten",       name: "Kiran D.",  milestone: "First 10 Pull-Ups",   date: "Dec 2024", quote: "My son's confidence has skyrocketed since joining Cali Terrain.",          img: "/muscleup-cinematic/frame00030.jpg" },
  { id: "sneha-goal",      name: "Sneha R.",  milestone: "First Push-Up Set",   date: "Apr 2025", quote: "Better than any gym I've been to. The community keeps you motivated.",     img: "/pushup/ezgif-frame-034.jpg" },
  { id: "vikram-5k",       name: "Vikram P.", milestone: "First 5K PR",         date: "Nov 2024", quote: "The functional fitness program is next level.",                            img: "/facility/cards/performance-lane.jpg" },
  { id: "dev-muscleup",    name: "Dev A.",    milestone: "First Muscle-Up",     date: "May 2025", quote: "Eight months of work, one perfect rep over the bar.",                      img: "/muscleup-cinematic/frame00055.jpg" },
  { id: "ananya-lsit",     name: "Ananya T.", milestone: "First L-Sit",         date: "Jun 2025", quote: "Ten seconds of stillness that took three months to earn.",                 img: "/pushup/ezgif-frame-052.jpg" },
  { id: "rohan-lift",      name: "Rohan V.",  milestone: "First 100kg Lift",    date: "Jul 2025", quote: "Walked in skinny. Walked out strong.",                                     img: "/muscleup-cinematic/frame00022.jpg" },
  { id: "meera-dip",       name: "Meera J.",  milestone: "First Ring Dip",      date: "Aug 2025", quote: "Rings don't lie. Neither does the work.",                                  img: "/facility/cards/skill-arena.jpg" },
  { id: "aditya-flow",     name: "Aditya N.", milestone: "First Bar Flow",      date: "Sep 2025", quote: "Strength became play the day the flow finally clicked.",                   img: "/facility/cards/freestyle-area.jpg" },
  { id: "ishaan-press",    name: "Ishaan B.", milestone: "First Pike Press",    date: "Oct 2025", quote: "Shoulders I didn't know I had.",                                           img: "/pushup/ezgif-frame-070.jpg" },
  { id: "tara-negative",   name: "Tara M.",   milestone: "First Slow Negative", date: "Jan 2026", quote: "Five seconds down. The rep that started everything.",                      img: "/muscleup-cinematic/frame00042.jpg" },
  { id: "kabir-sprint",    name: "Kabir S.",  milestone: "First Sled Sprint",   date: "Feb 2026", quote: "Lungs on fire, grin for days.",                                            img: "/pushup/ezgif-frame-082.jpg" },
  { id: "nidhi-lever",     name: "Nidhi P.",  milestone: "First Tuck Lever",    date: "Mar 2026", quote: "Horizontal for two seconds. Felt like flying.",                            img: "/muscleup-cinematic/frame00064.jpg" },
  { id: "sam-first-day",   name: "Sam R.",    milestone: "First Session",       date: "Apr 2026", quote: "The hardest part was the door. Everything after came with a coach.",       img: "/muscleup-cinematic/frame00006.jpg" },
];

// ── Sphere layout ──────────────────────────────────────────────────────────
// Cards live on the inner surface of a sphere of radius R; the camera sits at
// the centre. Angles are radians: longitude wraps the full circle, rows sit at
// fixed latitudes. Alternate rows are offset half a column (brick pattern).
const R = 10;
const COLS = 14;
const LATS = [-0.51, -0.17, 0.17, 0.51];
const LON_STEP = (Math.PI * 2) / COLS;
const ANG_W = 0.4;                  // card angular width
const ANG_H = ANG_W * 0.625;        // 16:10
const LABEL_H = ANG_W * (96 / 768); // matches label canvas aspect
const PITCH_MAX = 0.55;
const BG = 0x05080d;
const ACCENT = new THREE.Color("#2E8DFF");

// Bend a plane (in angle-space) onto the inside of the sphere. Rotating the
// resulting patch about the origin keeps it on the sphere, so one geometry is
// shared by every card and positioned purely with holder rotations.
function makeSpherePatch(angW, angH, sx = 20, sy = 10) {
  const geo = new THREE.PlaneGeometry(angW, angH, sx, sy);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const lon = pos.getX(i);
    const lat = pos.getY(i);
    pos.setXYZ(
      i,
      Math.sin(lon) * Math.cos(lat) * R,
      Math.sin(lat) * R,
      -Math.cos(lon) * Math.cos(lat) * R
    );
  }
  geo.computeVertexNormals();
  return geo;
}

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
  uniform vec3 uGlow;
  varying vec2 vUv;

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    float aspect = ${(ANG_W / ANG_H).toFixed(4)};
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    float d = sdRoundRect(p, vec2(aspect * 0.5, 0.5), 0.06);
    float aa = fwidth(d) * 1.5;
    float mask = smoothstep(aa, -aa, d);
    if (mask < 0.01) discard;

    vec3 col = texture2D(uMap, vUv).rgb;
    // cinematic grade: cool the shadows, keep highlights honest
    float lum0 = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col * vec3(0.86, 0.94, 1.12), col, smoothstep(0.0, 0.65, lum0));
    // vignette inside the card
    float vig = smoothstep(0.95, 0.3, length(p * vec2(0.8, 1.05)));
    col *= mix(0.84, 1.0, vig);
    // recede when off-axis, light up on hover
    col *= mix(0.42, 1.0, uActive) + uHover * 0.25;
    // top sheen so the surface reads as glass
    col += vec3(0.5, 0.7, 1.0) * smoothstep(0.55, 1.0, vUv.y) * 0.04 * (0.4 + uActive);
    // accent edge glow on hover
    float edge = smoothstep(-0.045, -0.006, d) * (1.0 - smoothstep(-0.006, 0.0, d));
    col += uGlow * edge * (0.08 + uHover * 0.7);

    gl_FragColor = vec4(col, uOpacity * mask);
  }
`;

// Caption strip rendered to a canvas: NAME — MILESTONE, date right-aligned.
function makeLabelTexture(entry) {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 96;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 768, 96);
  ctx.textBaseline = "middle";
  ctx.font = "700 34px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  const name = entry.name.toUpperCase();
  ctx.fillText(name, 6, 30);
  const nameW = ctx.measureText(name).width;
  ctx.font = "500 30px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(146,167,189,0.9)";
  ctx.fillText(`— ${entry.milestone}`, 6 + nameW + 16, 30);
  ctx.font = "500 26px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(92,107,124,0.95)";
  ctx.fillText(entry.date.toUpperCase(), 6, 74);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function HallOfFirstsGallery3D({ onBookTrial }) {
  const canvasHostRef = useRef(null);
  const apiRef = useRef(null); // imperative bridge into the three scene
  const detailRef = useRef(null);
  const detailImgRef = useRef(null);
  const detailContentRef = useRef(null);

  const [focused, setFocused] = useState(false); // camera travelling / detail open
  const [detail, setDetail] = useState(null);    // entry shown in the detail page
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

    const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 40);
    camera.rotation.order = "YXZ"; // yaw then pitch — matches the drag model
    camera.position.set(0, 0, 0);

    // ── Card grid on the sphere interior ──
    const loader = new THREE.TextureLoader();
    const textures = new Map(); // shared by the repeated entries
    const texFor = (src) => {
      if (!textures.has(src)) {
        const t = loader.load(src);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        textures.set(src, t);
      }
      return textures.get(src);
    };

    const cardGeo = makeSpherePatch(ANG_W, ANG_H, 20, 10);
    const labelGeo = makeSpherePatch(ANG_W, LABEL_H, 12, 2);
    const labelMats = ENTRIES.map(
      (e) =>
        new THREE.MeshBasicMaterial({
          map: makeLabelTexture(e),
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        })
    );

    const cards = [];
    for (let row = 0; row < LATS.length; row++) {
      for (let col = 0; col < COLS; col++) {
        const idx = cards.length;
        const entryIdx = idx % ENTRIES.length;
        const entry = ENTRIES[entryIdx];
        const lat = LATS[row];
        const lon = col * LON_STEP + (row % 2 ? LON_STEP / 2 : 0);

        const mat = new THREE.ShaderMaterial({
          vertexShader: cardVert,
          fragmentShader: cardFrag,
          transparent: true,
          uniforms: {
            uMap: { value: texFor(entry.img) },
            uOpacity: { value: 1 },
            uHover: { value: 0 },
            uActive: { value: 0 },
            uGlow: { value: ACCENT.clone() },
          },
        });

        const holder = new THREE.Group();
        holder.rotation.set(lat, lon, 0, "YXZ");
        scene.add(holder);

        const mesh = new THREE.Mesh(cardGeo, mat);
        mesh.userData.index = idx;
        holder.add(mesh);

        const label = new THREE.Mesh(labelGeo, labelMats[entryIdx]);
        // sit just under the card's bottom edge, on the same sphere
        label.rotation.set(-(ANG_H / 2 + LABEL_H / 2 + 0.022), 0, 0);
        holder.add(label);

        // unit direction from the centre toward the card (for facing math)
        const dir = new THREE.Vector3(
          Math.sin(lon) * Math.cos(lat),
          Math.sin(lat),
          -Math.cos(lon) * Math.cos(lat)
        );

        cards.push({ entry, holder, mesh, mat, lat, lon, dir, hoverT: 0, activeT: 0 });
      }
    }

    // ── Interaction state ──
    // yaw/pitch chase tYaw/tPitch through exponential damping — the same
    // "smooth lag" feel as lenis. Yaw is unbounded (wraps forever); pitch is
    // clamped so the viewer can't roll over the poles.
    const state = {
      yaw: 0, pitch: 0, tYaw: 0, tPitch: 0,
      dragging: false, moved: 0, lastX: 0, lastY: 0, lastT: 0, vx: 0, vy: 0,
      hovered: -1, mode: "explore",
      mouseX: 0, mouseY: 0,
      fov: 68, baseFov: 68, fxFade: 1,
      hinted: false, inView: true, pageVisible: true,
      ctxLost: false, activeTl: null,
      dtAvg: 1 / 60, degraded: false,
    };
    apiRef.current = { state };

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const meshes = cards.map((c) => c.mesh);
    const fwd = new THREE.Vector3();
    const clampPitch = (v) => THREE.MathUtils.clamp(v, -PITCH_MAX, PITCH_MAX);

    // ── Cinematic focus: centre the card, dolly in, wipe the page over ──
    const focusCard = (i) => {
      if (state.mode !== "explore") return;
      state.mode = "focusing";
      setFocused(true);
      const card = cards[i];
      // travel the short way around the sphere
      const wrapLon = card.lon + Math.PI * 2 * Math.round((state.yaw - card.lon) / (Math.PI * 2));
      const dur = reduce ? 0 : 1.2;
      state.activeTl?.kill();
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut", duration: dur, overwrite: "auto" },
        onComplete: () => { state.mode = "focused"; },
      });
      state.activeTl = tl;
      tl.to(state, { tYaw: wrapLon, tPitch: card.lat, duration: dur * 0.75 }, 0);
      tl.to(state, { fov: 34, fxFade: 0 }, dur * 0.12);
      cards.forEach((c, j) => {
        if (j !== i) tl.to(c.mat.uniforms.uOpacity, { value: 0.04 }, dur * 0.12);
      });
      tl.add(() => setDetail(card.entry), dur * 0.6);
    };

    const unfocus = () => {
      if (state.mode === "explore") return;
      state.mode = "focusing";
      state.tPitch = clampPitch(state.tPitch);
      const dur = reduce ? 0 : 0.9;
      state.activeTl?.kill();
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut", duration: dur, overwrite: "auto" },
        onComplete: () => { state.mode = "explore"; setFocused(false); },
      });
      state.activeTl = tl;
      tl.to(state, { fov: state.baseFov, fxFade: 1 }, 0);
      cards.forEach((c) => tl.to(c.mat.uniforms.uOpacity, { value: 1 }, 0));
    };

    // most-centred card (keyboard Enter)
    const centerIndex = () => {
      camera.getWorldDirection(fwd);
      let best = 0, bestDot = -2;
      for (let i = 0; i < cards.length; i++) {
        const d = fwd.dot(cards[i].dir);
        if (d > bestDot) { bestDot = d; best = i; }
      }
      return best;
    };

    apiRef.current.focusCard = focusCard;
    apiRef.current.unfocus = unfocus;
    apiRef.current.focusCenter = () => focusCard(centerIndex());
    apiRef.current.nudge = (dx, dy) => {
      if (state.mode !== "explore") return;
      state.tYaw += dx;
      state.tPitch = clampPitch(state.tPitch + dy);
    };

    // ── Pointer handlers ──
    // Grab-and-pull: dragging right pulls the wall right (camera looks left),
    // dragging down pulls it down (camera looks up).
    const DRAG_K = 0.0026;
    const onDown = (e) => {
      if (state.mode !== "explore") return;
      state.dragging = true;
      state.moved = 0;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      state.lastT = performance.now();
      state.vx = 0;
      state.vy = 0;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      state.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      state.mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      if (state.dragging) {
        const dx = e.clientX - state.lastX;
        const dy = e.clientY - state.lastY;
        const now = performance.now();
        const dt = Math.max(now - state.lastT, 1);
        state.vx = state.vx * 0.6 + (dx / dt) * 0.4;
        state.vy = state.vy * 0.6 + (dy / dt) * 0.4;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        state.lastT = now;
        state.moved += Math.abs(dx) + Math.abs(dy);
        state.tYaw += dx * DRAG_K;
        state.tPitch = clampPitch(state.tPitch + dy * DRAG_K);
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
        if (hits.length) focusCard(hits[0].object.userData.index);
        return;
      }
      // momentum throw — the damped follower turns it into a long glide
      state.tYaw += state.vx * 110 * DRAG_K;
      state.tPitch = clampPitch(state.tPitch + state.vy * 110 * DRAG_K);
    };
    const onLeave = () => { state.hovered = -1; };

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);

    // WebGL contexts can be evicted by the browser; preventDefault permits
    // restoration, and if it never arrives we fall back to the static grid.
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
      state.baseFov = w / h < 0.9 ? 82 : 68; // wider view on portrait
      if (state.mode === "explore") state.fov = state.baseFov;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // pause rendering offscreen / hidden tab
    const io = new IntersectionObserver(([entry]) => { state.inView = entry.isIntersecting; }, { rootMargin: "100px" });
    io.observe(host);
    const onVis = () => { state.pageVisible = document.visibilityState === "visible"; };
    document.addEventListener("visibilitychange", onVis);
    // watchdog: a missed observer event can never park the loop for >1.5s
    const watchdog = window.setInterval(() => {
      const r = host.getBoundingClientRect();
      state.inView = r.width > 0 && r.bottom > -150 && r.top < window.innerHeight + 150;
      state.pageVisible = document.visibilityState === "visible";
    }, 1500);

    // ── Render loop ──
    // All damping is delta-time based (1 - e^(-rate·dt)) so the easing feels
    // identical at any refresh rate.
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

      // slow device? drop resolution once, permanently
      state.dtAvg += (dt - state.dtAvg) * 0.05;
      if (!state.degraded && t > 4 && state.dtAvg > 0.045) {
        state.degraded = true;
        renderer.setPixelRatio(1);
      }

      // idle drift keeps the sphere alive between interactions
      if (!reduce && !state.dragging && state.mode === "explore") state.tYaw += dt * 0.016;

      // lenis-style settle toward the target orientation
      state.yaw += (state.tYaw - state.yaw) * damp(4.2);
      state.pitch += (state.tPitch - state.pitch) * damp(4.2);

      // soft mouse parallax while exploring
      const parallax = state.mode === "explore" && !state.dragging && !reduce ? 1 : 0;
      camera.rotation.y = state.yaw - state.mouseX * 0.035 * parallax;
      camera.rotation.x = state.pitch - state.mouseY * 0.02 * parallax;

      // per-card emphasis: cards near the view axis come alive
      camera.getWorldDirection(fwd);
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const ang = Math.acos(THREE.MathUtils.clamp(fwd.dot(c.dir), -1, 1));
        const aT = 1 - THREE.MathUtils.smoothstep(ang, 0.28, 1.05);
        const hT = state.hovered === i && state.mode === "explore" ? 1 : 0;
        c.activeT += (aT - c.activeT) * damp(6);
        c.hoverT += (hT - c.hoverT) * damp(8);
        c.mat.uniforms.uActive.value = c.activeT;
        c.mat.uniforms.uHover.value = c.hoverT;
        // scaling toward the origin pulls the patch off the shell toward the
        // viewer — a subtle lift on hover/centre
        c.mesh.scale.setScalar(1 - c.hoverT * 0.022 - c.activeT * 0.012);
      }
      const labelOpacity = 0.85 * state.fxFade;
      labelMats.forEach((m) => { m.opacity = labelOpacity; });

      if (Math.abs(camera.fov - state.fov) > 0.01) {
        camera.fov += (state.fov - camera.fov) * damp(5);
        camera.updateProjectionMatrix();
      }

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
      cardGeo.dispose();
      labelGeo.dispose();
      cards.forEach((c) => c.mat.dispose());
      labelMats.forEach((m) => { m.map?.dispose(); m.dispose(); });
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      // release the GL context immediately — StrictMode/HMR remounts stack up
      // live contexts until the browser starts killing them otherwise
      renderer.forceContextLoss();
      host.contains(el) && host.removeChild(el);
      apiRef.current = null;
    };
  }, []);

  // ── Detail page enter choreography: wipe up, settle the hero, raise copy ──
  useEffect(() => {
    if (!detail || !detailRef.current) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const tl = gsap.timeline({ defaults: { ease: "power4.inOut" } });
    tl.fromTo(
      detailRef.current,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: reduce ? 0 : 0.85 }
    );
    tl.fromTo(detailImgRef.current, { scale: 1.18 }, { scale: 1.04, duration: reduce ? 0 : 2.4, ease: "power2.out" }, 0.1);
    tl.fromTo(
      detailContentRef.current?.children ?? [],
      { y: 42, opacity: 0 },
      { y: 0, opacity: 1, duration: reduce ? 0 : 0.7, stagger: 0.07, ease: "power3.out" },
      reduce ? 0 : 0.45
    );
    return () => tl.kill();
  }, [detail]);

  const closeDetail = useCallback(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const finish = () => { setDetail(null); apiRef.current?.unfocus(); };
    if (reduce || !detailRef.current) { finish(); return; }
    gsap.to(detailRef.current, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: finish,
    });
  }, []);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e) => e.key === "Escape" && closeDetail();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail, closeDetail]);

  const onKeyNav = (e) => {
    if (focused) return;
    const step = 0.24;
    if (e.key === "ArrowRight") { apiRef.current?.nudge(step, 0); setHint(false); }
    if (e.key === "ArrowLeft") { apiRef.current?.nudge(-step, 0); setHint(false); }
    if (e.key === "ArrowUp") { apiRef.current?.nudge(0, step); setHint(false); }
    if (e.key === "ArrowDown") { apiRef.current?.nudge(0, -step); setHint(false); }
    if (e.key === "Enter") apiRef.current?.focusCenter();
  };

  // Static fallback if WebGL is unavailable
  if (!webgl) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ENTRIES.slice(0, 8).map((e) => (
          <div key={e.id} className="overflow-hidden rounded-xl border border-[#1E2A38]">
            <img src={e.img} alt={`${e.name} — ${e.milestone}`} loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <div className="p-3">
              <h3 className="font-heading text-base text-white">{e.milestone}</h3>
              <p className="mt-0.5 text-xs text-[#9AA7B6]">{e.name} · {e.date}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Hall of Firsts spherical gallery. Drag to look around, use arrow keys to browse, Enter to open a milestone."
      onKeyDown={onKeyNav}
      className="group relative h-[80vh] min-h-[560px] w-full overflow-hidden rounded-lg border border-[#1E2A38] bg-[#05080D] outline-none focus-visible:ring-1 focus-visible:ring-[#2E8DFF]/60 sm:h-[88vh]"
    >
      {/* WebGL stage */}
      <div ref={canvasHostRef} className="absolute inset-0" aria-hidden="true" />

      {/* Atmosphere grade on top of the canvas — the spherical falloff */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0B1016] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0B1016]/90 to-transparent" />
        <div className="absolute inset-0 [background:radial-gradient(115%_85%_at_50%_50%,transparent_50%,rgba(3,6,10,0.62)_100%)]" />
      </div>

      {/* ── Explore UI ── */}
      <div className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-500 ${focused ? "opacity-0" : "opacity-100"}`}>
        {/* Count — top right */}
        <div className="absolute right-5 top-5 text-[10px] font-bold uppercase tracking-[0.28em] text-white/40 sm:right-8 sm:top-7">
          {ENTRIES.length} Firsts
        </div>

        {/* Drag hint — bottom centre pill */}
        <div
          className={`absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0B1016]/70 px-4 py-2 text-[10px] uppercase tracking-[0.26em] text-white/60 backdrop-blur transition-opacity duration-700 ${hint ? "opacity-100" : "opacity-0"}`}
        >
          <Move className="h-3.5 w-3.5 text-[#2E8DFF]" /> Drag to look around · Click a milestone
        </div>
      </div>

      {/* ── Detail page: basic milestone template, wiped in over the sphere ── */}
      {detail && (
        <div
          ref={detailRef}
          className="absolute inset-0 z-30 overflow-hidden bg-[#05080D]"
          style={{ clipPath: "inset(100% 0% 0% 0%)" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <img ref={detailImgRef} src={detail.img} alt={`${detail.name} — ${detail.milestone}`} className="h-full w-full scale-[1.18] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05080D] via-[#05080D]/40 to-[#05080D]/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05080D]/85 via-[#05080D]/30 to-transparent" />
          </div>

          <button
            type="button"
            aria-label="Back to the wall"
            onClick={closeDetail}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#0B1016]/60 text-white backdrop-blur transition hover:rotate-90 hover:border-[#2E8DFF] hover:text-[#2E8DFF] sm:right-8 sm:top-8"
            style={{ transitionDuration: "300ms" }}
          >
            <X className="h-4 w-4" />
          </button>

          <div ref={detailContentRef} className="absolute bottom-8 left-5 right-5 z-10 max-w-2xl sm:bottom-14 sm:left-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#2E8DFF]/40 bg-[#2E8DFF]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#2E8DFF]">
              Hall of Firsts · {detail.date}
            </p>
            <h3 className="mt-4 font-heading text-4xl uppercase leading-[0.95] tracking-wide text-white sm:text-7xl">{detail.milestone}</h3>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#9AA7B6]">{detail.name}</p>
            <blockquote className="mt-5 max-w-xl border-l-2 border-[#2E8DFF] pl-4 text-sm italic leading-relaxed text-[#C6D2DF] sm:text-base">
              “{detail.quote}”
            </blockquote>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button type="button" onClick={onBookTrial} className="btn-primary text-xs">
                Start Your First <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={closeDetail} className="btn-secondary text-xs">
                Back to the Wall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
