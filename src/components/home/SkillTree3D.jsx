// Skill Tree 3D — the calisthenics blueprint as a glowing constellation.
// Skill nodes float in layered depth (foundations up front, mastery receding
// away); dependency edges are energy conduits that trace themselves in on
// scroll and carry flowing pulses along the unlocked path. Drag orbits the
// constellation with eased momentum, hover lights a node, click selects it
// and feeds the detail rail. Raw Three.js (no R3F) + GSAP — same stack and
// lifecycle patterns as HallOfFirstsGallery3D / FacilityGallery3D.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Move } from "lucide-react";

const BG = 0x0b1016;
const ACCENT = new THREE.Color("#2E8DFF");
// How much of the node core is filled with accent, per difficulty — mirrors
// the ct-skill--* treatments (beginner solid, advanced tinted, mid outlined).
const FILL = { Beginner: 1.0, Intermediate: 0.14, Advanced: 0.45 };

// Map the 2D blueprint coordinates (pos.x/pos.y in %) into world space, with
// depth staged by progression: entry skills sit closest to the viewer and the
// journey recedes into the dark.
function toWorld(n) {
  return new THREE.Vector3(
    (n.pos.x - 38) * 0.155,
    (50 - n.pos.y) * 0.082,
    1.25 - (n.pos.x - 8) * 0.042,
  );
}

// ── Node shader: glow halo, level ring, core disc, selection echo + orbit ──
const quadVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const nodeFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uFill;
  uniform float uActive;
  uniform float uPath;
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv - 0.5;
    float r = length(p);
    float energy = 0.45 + uPath * 0.35 + uHover * 0.45 + uActive * 0.6;
    // soft halo that breathes with state
    float glow = exp(-r * 10.0) * energy;
    // the node ring
    float ring = smoothstep(0.016, 0.005, abs(r - 0.150));
    // solid core (occludes edges passing behind the node)
    float core = smoothstep(0.118, 0.104, r);
    // expanding echo ring while selected
    float pr = fract(uTime * 0.55);
    float echo = smoothstep(0.022, 0.0, abs(r - mix(0.17, 0.46, pr))) * (1.0 - pr) * uActive;
    // rotating segmented orbit while selected
    float ang = atan(p.y, p.x);
    float seg = smoothstep(0.15, 0.6, sin(ang * 3.0 - uTime * 1.6) * 0.5 + 0.5);
    float orbit = smoothstep(0.012, 0.004, abs(r - 0.215)) * seg * uActive;

    vec3 col = uColor * glow * 0.85;
    col += uColor * ring * (0.5 + uPath * 0.5 + uHover * 0.35);
    vec3 coreCol = mix(vec3(0.055, 0.078, 0.104), uColor, clamp(uFill + uHover * 0.25 + uActive * 0.4, 0.0, 1.0));
    col = mix(col, coreCol * (0.9 + glow), core);
    col += uColor * (echo * 0.85 + orbit * 0.8);

    float alpha = clamp(glow * 1.6 + ring + echo + orbit, 0.0, 1.0);
    alpha = max(alpha, core * 0.97);
    gl_FragColor = vec4(col, alpha);
  }
`;

// ── Edge shader: self-tracing draw-in + flowing energy on the lit path ─────
const edgeFrag = /* glsl */ `
  uniform float uDraw;
  uniform float uLit;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float t = vUv.x;
    if (t > uDraw) discard;
    vec3 dim = vec3(0.118, 0.165, 0.220);
    vec3 lit = vec3(0.180, 0.553, 1.000);
    // pulse travelling from prerequisite toward the skill it unlocks
    float p = fract(t - uTime * 0.45);
    float pulse = exp(-pow((p - 0.5) * 7.0, 2.0)) * uLit;
    // bright head while the conduit is still drawing itself in
    float head = uDraw < 0.999 ? smoothstep(0.10, 0.0, uDraw - t) : 0.0;
    vec3 col = mix(dim, lit * 0.85, uLit);
    col += lit * (pulse * 0.9 + head * 1.2);
    gl_FragColor = vec4(col, mix(0.55, 0.95, max(uLit, head)));
  }
`;

// Name + tier plate rendered to a canvas, redrawable once webfonts arrive.
function makeLabel(node) {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 160;
  const ctx = c.getContext("2d");
  const draw = () => {
    ctx.clearRect(0, 0, 640, 160);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    try { ctx.letterSpacing = "3px"; } catch { /* older engines */ }
    ctx.font = "400 64px 'Bebas Neue', 'Arial Narrow', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(node.name.toUpperCase(), 320, 58);
    try { ctx.letterSpacing = "6px"; } catch { /* older engines */ }
    ctx.font = "700 24px Manrope, Inter, sans-serif";
    ctx.fillStyle = "rgba(92,107,124,1)";
    ctx.fillText(node.tier.toUpperCase(), 320, 122);
  };
  draw();
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, redraw: () => { draw(); texture.needsUpdate = true; } };
}

// Static 2D graph for machines without WebGL (or after context death).
function FallbackGraph({ nodes, edges, activeId, pathSet, onSelect }) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const mod = { Beginner: "beginner", Intermediate: "intermediate", Advanced: "advanced" };
  return (
    <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-sm border border-[#1E2A38] bg-[#0B1016] p-2">
      <div className="relative mx-auto h-[420px] min-w-[560px]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map((e) => {
            const a = byId[e.from], b = byId[e.to];
            const lit = pathSet.has(e.from) && pathSet.has(e.to);
            return (
              <line
                key={`${e.from}-${e.to}`}
                x1={a.pos.x} y1={a.pos.y} x2={b.pos.x} y2={b.pos.y}
                stroke={lit ? "#2E8DFF" : "#1E2A38"}
                strokeWidth={lit ? 2 : 1.25}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => onSelect(node.id)}
            aria-pressed={node.id === activeId}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center"
            style={{ left: `${node.pos.x}%`, top: `${node.pos.y}%` }}
          >
            <span
              data-active={node.id === activeId ? "" : undefined}
              className={`ct-skill ct-skill--${mod[node.difficulty]} h-12 w-12 rounded-full`}
            />
            <span className="whitespace-nowrap font-heading text-sm tracking-wide text-white">{node.name}</span>
            <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-widest text-[#5C6B7C]">{node.tier}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function SkillTree3D({ nodes, activeId, pathSet, onSelect }) {
  const hostRef = useRef(null);
  const apiRef = useRef(null); // imperative bridge into the three scene
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; });

  const [hint, setHint] = useState(true);
  const [webgl, setWebgl] = useState(() => {
    try {
      const c = document.createElement("canvas");
      return Boolean(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      return false;
    }
  });

  const edges = useMemo(
    () => nodes.flatMap((n) => n.prereq.map((p) => ({ from: p, to: n.id }))),
    [nodes],
  );

  // ── Build the scene ──────────────────────────────────────────────────────
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !webgl) return;
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
    el.style.touchAction = "pan-y"; // horizontal drags orbit, vertical scrolls the page

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(BG, 13, 24);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 40);

    // Everything lives on a rig so drag-orbit is one rotation.
    const rig = new THREE.Group();
    scene.add(rig);

    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const worldOf = Object.fromEntries(nodes.map((n) => [n.id, toWorld(n)]));

    // ── Skill nodes: billboarded shader quads + name plates ──
    const quadGeo = new THREE.PlaneGeometry(1.7, 1.7);
    const labelGeo = new THREE.PlaneGeometry(2.4, 0.6);
    const labels = [];
    const cards = nodes.map((node) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: quadVert,
        fragmentShader: nodeFrag,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uColor: { value: ACCENT.clone() },
          uFill: { value: FILL[node.difficulty] ?? 0.5 },
          uActive: { value: 0 },
          uPath: { value: 0 },
          uHover: { value: 0 },
          uTime: { value: 0 },
        },
      });
      const group = new THREE.Group();
      group.position.copy(worldOf[node.id]);
      group.scale.setScalar(0.0001); // punched in by the intro
      rig.add(group);

      const quad = new THREE.Mesh(quadGeo, mat);
      quad.userData.id = node.id;
      quad.renderOrder = 3;
      group.add(quad);

      const label = makeLabel(node);
      labels.push(label);
      const labelMat = new THREE.MeshBasicMaterial({
        map: label.texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const plate = new THREE.Mesh(labelGeo, labelMat);
      plate.position.y = -0.62;
      plate.renderOrder = 2;
      group.add(plate);

      return {
        node, group, quad, plate, mat, labelMat,
        baseY: group.position.y,
        phase: node.pos.x * 0.31 + node.pos.y * 0.17,
        hoverT: 0, pathT: 0, activeT: 0,
        hoverTarget: 0, pathTarget: 0, activeTarget: 0,
      };
    });

    // Sharpen the name plates once the webfonts are in.
    document.fonts?.ready.then(() => labels.forEach((l) => l.redraw())).catch(() => {});

    // ── Edges: gently bowed conduits between prerequisite and skill ──
    const edgeObjs = edges.map((e) => {
      const a = worldOf[e.from].clone();
      const b = worldOf[e.to].clone();
      const dir = b.clone().sub(a).normalize();
      // trim so conduits meet the node ring, not its centre
      const start = a.clone().addScaledVector(dir, 0.3);
      const end = b.clone().addScaledVector(dir, -0.3);
      const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.1, 0.45));
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const geo = new THREE.TubeGeometry(curve, 40, 0.02, 6, false);
      const mat = new THREE.ShaderMaterial({
        vertexShader: quadVert,
        fragmentShader: edgeFrag,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uDraw: { value: 0 },
          uLit: { value: 0 },
          uTime: { value: 0 },
        },
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 1;
      rig.add(mesh);
      return { ...e, geo, mat, litT: 0, litTarget: 0, order: Math.min(byId[e.from].pos.x, byId[e.to].pos.x) };
    });

    // ── Ambient particle field (drifts inside the rig for parallax) ──
    const P = 170;
    const pPos = new Float32Array(P * 3);
    for (let i = 0; i < P; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 13;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 7.5;
      pPos[i * 3 + 2] = -3 + Math.random() * 5.5;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: ACCENT,
      size: 0.045,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    rig.add(particles);

    // ── Interaction state ──
    // yaw/pitch chase targets through exponential damping — lenis-style lag.
    const state = {
      yaw: 0, pitch: 0, tYaw: 0, tPitch: 0,
      dragging: false, moved: 0, lastX: 0, lastY: 0, lastT: 0, vx: 0, vy: 0,
      hovered: null, mouseX: 0, mouseY: 0,
      camZ: 10.6, push: 0,
      introDone: false, hinted: false,
      inView: true, pageVisible: true, ctxLost: false,
    };
    const YAW_MAX = 0.34, PITCH_MAX = 0.19;
    const clampYaw = (v) => THREE.MathUtils.clamp(v, -YAW_MAX, YAW_MAX);
    const clampPitch = (v) => THREE.MathUtils.clamp(v, -PITCH_MAX, PITCH_MAX);

    // ── Selection sync: light the path, pulse the node, nudge the camera ──
    const setActive = (id, pathIds, kick) => {
      cards.forEach((c) => {
        c.activeTarget = c.node.id === id ? 1 : 0;
        c.pathTarget = pathIds.has(c.node.id) ? 1 : 0;
      });
      edgeObjs.forEach((e) => {
        e.litTarget = pathIds.has(e.from) && pathIds.has(e.to) ? 1 : 0;
      });
      // Subtle camera push on selection — only once the intro has settled, so
      // the initial sync (mount) doesn't jolt the scene.
      if (kick && !reduce && state.introDone) {
        gsap.killTweensOf(state, "push");
        gsap.to(state, { push: 1, duration: 0.26, ease: "power2.out", yoyo: true, repeat: 1 });
      }
    };
    apiRef.current = { state, setActive };

    // ── Intro: conduits trace in foundation-first, nodes punch in after ──
    const introTl = gsap.timeline({ paused: true, onComplete: () => { state.introDone = true; } });
    if (reduce) {
      introTl.add(() => {
        edgeObjs.forEach((e) => { e.mat.uniforms.uDraw.value = 1; });
        cards.forEach((c) => { c.group.scale.setScalar(1); c.labelMat.opacity = 0.92; });
        pMat.opacity = 0.3;
      });
    } else {
      const eSort = [...edgeObjs].sort((x, y) => x.order - y.order);
      const cSort = [...cards].sort((x, y) => x.node.pos.x - y.node.pos.x);
      eSort.forEach((e, i) => introTl.to(e.mat.uniforms.uDraw, { value: 1, duration: 0.85, ease: "power2.inOut" }, 0.15 + i * 0.13));
      cSort.forEach((c, i) => {
        introTl.to(c.group.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(2.1)" }, 0.05 + i * 0.14);
        introTl.to(c.labelMat, { opacity: 0.92, duration: 0.5, ease: "power2.out" }, 0.25 + i * 0.14);
      });
      introTl.to(pMat, { opacity: 0.3, duration: 1.6, ease: "power2.out" }, 0.4);
    }
    const introIo = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        introTl.play();
        introIo.disconnect();
      }
    }, { threshold: 0.25 });
    introIo.observe(host);

    // ── Pointer handlers: drag orbits with momentum, click selects ──
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const quads = cards.map((c) => c.quad);
    const DRAG_K = 0.0022;
    const pick = (cx, cy) => {
      const rect = el.getBoundingClientRect();
      ndc.set(((cx - rect.left) / rect.width) * 2 - 1, -(((cy - rect.top) / rect.height) * 2 - 1));
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(quads, false);
      return hits.length ? hits[0].object.userData.id : null;
    };
    const onDown = (e) => {
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
        state.tYaw = clampYaw(state.tYaw + dx * DRAG_K);
        state.tPitch = clampPitch(state.tPitch - dy * DRAG_K);
        if (!state.hinted && state.moved > 24) { state.hinted = true; setHint(false); }
        return;
      }
      state.hovered = pick(e.clientX, e.clientY);
      el.style.cursor = state.hovered ? "pointer" : "grab";
    };
    const onUp = (e) => {
      if (!state.dragging) return;
      state.dragging = false;
      el.style.cursor = "grab";
      if (state.moved < 7) {
        const id = pick(e.clientX, e.clientY);
        if (id) {
          state.hinted = true;
          setHint(false);
          onSelectRef.current?.(id);
        }
        return;
      }
      // momentum throw — the damped follower turns it into a glide
      state.tYaw = clampYaw(state.tYaw + state.vx * 90 * DRAG_K);
      state.tPitch = clampPitch(state.tPitch - state.vy * 90 * DRAG_K);
    };
    const onLeave = () => { state.hovered = null; };

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);

    // Context eviction → static graph fallback if it never comes back.
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

    // ── Resize: pull the camera back on narrow viewports ──
    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      state.camZ = w / h < 0.9 ? 16.6 : w / h < 1.35 ? 12.4 : 10.6;
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

    // ── Render loop (delta-time damping — identical feel at any Hz) ──
    const t0 = performance.now();
    let last = t0;
    let raf = 0;
    const qFix = new THREE.Quaternion();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!state.inView || !state.pageVisible || state.ctxLost) { last = performance.now(); return; }
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const t = (now - t0) / 1000;
      const damp = (rate) => (reduce ? 1 : 1 - Math.exp(-rate * dt));

      // idle sway keeps the constellation alive between interactions
      const idle = !reduce && !state.dragging ? Math.sin(t * 0.22) * 0.028 : 0;
      state.yaw += (state.tYaw + idle - state.yaw) * damp(4.2);
      state.pitch += (state.tPitch - state.pitch) * damp(4.2);

      // soft mouse parallax on top of the drag orbit
      const par = !state.dragging && !reduce ? 1 : 0;
      rig.rotation.y = state.yaw + state.mouseX * 0.045 * par;
      rig.rotation.x = state.pitch + state.mouseY * 0.028 * par;

      camera.position.set(0, 0, state.camZ - state.push * 0.5);
      camera.lookAt(0, 0, 0);

      // billboards face the viewer regardless of rig orientation
      qFix.copy(rig.quaternion).invert().multiply(camera.quaternion);
      for (const c of cards) {
        c.quad.quaternion.copy(qFix);
        c.plate.quaternion.copy(qFix);

        c.hoverTarget = state.hovered === c.node.id ? 1 : 0;
        c.hoverT += (c.hoverTarget - c.hoverT) * damp(9);
        c.pathT += (c.pathTarget - c.pathT) * damp(6);
        c.activeT += (c.activeTarget - c.activeT) * damp(6);
        c.mat.uniforms.uHover.value = c.hoverT;
        c.mat.uniforms.uPath.value = c.pathT;
        c.mat.uniforms.uActive.value = c.activeT;
        c.mat.uniforms.uTime.value = t;

        if (!reduce) c.group.position.y = c.baseY + Math.sin(t * 0.7 + c.phase) * 0.055;
        if (state.introDone) {
          const s = 1 + c.hoverT * 0.1 + c.activeT * 0.07;
          c.group.scale.setScalar(s);
        }
      }
      for (const e of edgeObjs) {
        e.litT += (e.litTarget - e.litT) * damp(5);
        e.mat.uniforms.uLit.value = e.litT;
        e.mat.uniforms.uTime.value = reduce ? 0 : t;
      }
      if (!reduce) particles.rotation.y = t * 0.012;

      renderer.render(scene, camera);
    };
    tick();

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      introIo.disconnect();
      introTl.kill();
      gsap.killTweensOf(state);
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      window.clearTimeout(lostTimer);
      el.removeEventListener("webglcontextlost", onCtxLost);
      el.removeEventListener("webglcontextrestored", onCtxRestored);
      quadGeo.dispose();
      labelGeo.dispose();
      pGeo.dispose();
      pMat.dispose();
      cards.forEach((c) => { c.mat.dispose(); c.labelMat.map?.dispose(); c.labelMat.dispose(); });
      edgeObjs.forEach((e) => { e.geo.dispose(); e.mat.dispose(); });
      renderer.dispose();
      // release the GL context immediately — StrictMode/HMR remounts stack up
      // live contexts until the browser starts killing them otherwise
      renderer.forceContextLoss();
      host.contains(el) && host.removeChild(el);
      apiRef.current = null;
    };
    // Scene is built once; nodes/edges are static site data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webgl]);

  // Keep the scene in sync with the selection made anywhere (graph, detail
  // rail prereq/unlock chips, keyboard).
  useEffect(() => {
    apiRef.current?.setActive(activeId, pathSet, true);
  }, [activeId, pathSet]);

  // Keyboard: arrows step through the progression, in blueprint order.
  const onKeyNav = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const order = [...nodes].sort((a, b) => a.pos.x - b.pos.x || a.pos.y - b.pos.y);
    const i = order.findIndex((n) => n.id === activeId);
    const next = order[(i + (e.key === "ArrowRight" ? 1 : -1) + order.length) % order.length];
    setHint(false);
    onSelect(next.id);
  };

  if (!webgl) {
    return <FallbackGraph nodes={nodes} edges={edges} activeId={activeId} pathSet={pathSet} onSelect={onSelect} />;
  }

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Interactive 3D skill tree. Drag to orbit, click a skill to inspect it, use arrow keys to step through the progression."
      onKeyDown={onKeyNav}
      className="relative h-[440px] w-full overflow-hidden rounded-sm border border-[#1E2A38] bg-[#0B1016] outline-none focus-visible:ring-1 focus-visible:ring-[#2E8DFF]/60 sm:h-[500px]"
    >
      <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />

      {/* Atmosphere grade over the canvas */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        <div className="absolute inset-0 [background:radial-gradient(120%_95%_at_50%_45%,transparent_55%,rgba(4,7,11,0.6)_100%)]" />
      </div>

      {/* Overlay UI */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute right-4 top-4 text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
          {nodes.length} Skills · 3D
        </div>
        <div
          className={`absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-[#0B1016]/70 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/60 backdrop-blur transition-opacity duration-700 ${hint ? "opacity-100" : "opacity-0"}`}
        >
          <Move className="h-3.5 w-3.5 text-[#2E8DFF]" /> Drag to orbit · Click a skill
        </div>
      </div>
    </div>
  );
}
