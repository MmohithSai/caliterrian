// Muscle-Up 3D — a particle-constellation athlete looping a muscle-up behind
// the final CTA, in the same visual language as the Training Programs hero
// (SilhouetteBackdrop3D): soft blue ink-dot particles, slate wash for the
// body's volume, bright Caliterrain-blue points on the outline, per-particle
// drift + twinkle. Unlike the static handstand (sampled from artwork), this
// figure is procedural — shoulder/hip/foot keyframes describe the full
// muscle-up cycle (hang → pull → transition → support → lower), a tiny 2-bone
// IK solves elbows/knees, and every particle re-derives its position from the
// animated skeleton each frame so the whole cloud performs the rep. Pointer
// parallax rotates the group so the depth scatter reads as 3D. Raw Three.js
// (no R3F) — same lifecycle patterns as SkillTree3D / SilhouetteBackdrop3D.
import { useEffect, useRef } from "react";
import * as THREE from "three";

const CYCLE = 6.4; // seconds per full rep
const GRIP = 0.55; // half distance between hands on the bar
const SHW = 0.3; // half shoulder width
const HIPW = 0.17; // half hip width
const UARM = 0.62;
const FARM = 0.6;
const THIGH = 0.92;
const SHIN = 0.88;
const ZS = 0.16; // left/right depth split so parallax reveals volume

// ── Keyframes (bar at y=0, hands fixed at ±GRIP) ───────────────────────────
// sh: shoulder centre · hip: pelvis · fL/fR: feet · arm: elbow bend side
// (+1 flares out below the bar, -1 above it) · lean: head push forward.
const KEYS = [
  { t: 0.0,  sh: [0, -1.15],    hip: [0, -2.55],     fL: [-0.14, -4.26], fR: [0.14, -4.26], arm: 1,  lean: 0 },
  { t: 0.12, sh: [0, -1.15],    hip: [0, -2.55],     fL: [-0.14, -4.26], fR: [0.14, -4.26], arm: 1,  lean: 0 },
  { t: 0.28, sh: [0, -0.3],     hip: [0.06, -1.72],  fL: [0.04, -3.3],   fR: [0.3, -3.28],  arm: 1,  lean: 0.08 },
  { t: 0.38, sh: [0.16, 0.34],  hip: [0.02, -1.05],  fL: [-0.24, -2.7],  fR: [0.04, -2.72], arm: -1, lean: 0.22 },
  { t: 0.5,  sh: [0, 1.08],     hip: [0.05, -0.3],   fL: [-0.1, -2.0],   fR: [0.18, -2.0],  arm: -1, lean: 0.06 },
  { t: 0.64, sh: [0, 1.08],     hip: [0.05, -0.3],   fL: [-0.1, -2.0],   fR: [0.18, -2.0],  arm: -1, lean: 0.06 },
  { t: 0.76, sh: [0.16, 0.34],  hip: [0.02, -1.05],  fL: [-0.24, -2.7],  fR: [0.04, -2.72], arm: -1, lean: 0.22 },
  { t: 0.86, sh: [0, -0.3],     hip: [0.04, -1.72],  fL: [-0.06, -3.32], fR: [0.2, -3.3],   arm: 1,  lean: 0.08 },
  { t: 1.0,  sh: [0, -1.15],    hip: [0, -2.55],     fL: [-0.14, -4.26], fR: [0.14, -4.26], arm: 1,  lean: 0 },
];

function hash(n) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
function easeInOut(k) {
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}

// 2-bone IK: joint (elbow/knee) between a→b for limb lengths l1,l2; `sign`
// picks which side of the a→b line the joint bends toward.
function ik(ax, ay, bx, by, l1, l2, sign, out) {
  let dx = bx - ax;
  let dy = by - ay;
  let d = Math.hypot(dx, dy);
  d = Math.min(Math.max(d, Math.abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3);
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
  const ux = dx / d;
  const uy = dy / d;
  out[0] = ax + ux * a - uy * h * sign;
  out[1] = ay + uy * a + ux * h * sign;
}

// Interpolate the keyframe track at cycle position u ∈ [0,1).
function evalPose(u, out) {
  let a = KEYS[0];
  let b = KEYS[KEYS.length - 1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (u >= KEYS[i].t && u <= KEYS[i + 1].t) {
      a = KEYS[i];
      b = KEYS[i + 1];
      break;
    }
  }
  const k = easeInOut(Math.min(Math.max((u - a.t) / ((b.t - a.t) || 1), 0), 1));
  out.shx = a.sh[0] + (b.sh[0] - a.sh[0]) * k;
  out.shy = a.sh[1] + (b.sh[1] - a.sh[1]) * k;
  out.hipx = a.hip[0] + (b.hip[0] - a.hip[0]) * k;
  out.hipy = a.hip[1] + (b.hip[1] - a.hip[1]) * k;
  out.fLx = a.fL[0] + (b.fL[0] - a.fL[0]) * k;
  out.fLy = a.fL[1] + (b.fL[1] - a.fL[1]) * k;
  out.fRx = a.fR[0] + (b.fR[0] - a.fR[0]) * k;
  out.fRy = a.fR[1] + (b.fR[1] - a.fR[1]) * k;
  out.arm = a.arm + (b.arm - a.arm) * k;
  out.lean = a.lean + (b.lean - a.lean) * k;
}

// ── Point shaders — identical dot language to SilhouetteBackdrop3D ─────────
const pointVert = /* glsl */ `
  attribute float aSeed;
  attribute float aShade;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  varying float vSeed;
  varying float vShade;

  void main() {
    vec3 p = position;
    // per-particle drift — a shimmer, small enough that the pose stays crisp
    float t = uTime * 0.55 + aSeed * 6.2831;
    p.x += sin(t) * 0.016;
    p.y += cos(t * 0.83 + aSeed * 3.7) * 0.016;
    p.z += sin(t * 0.47 + aSeed * 9.1) * 0.035;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // brighter outline points → bigger, nearer-feeling dots
    gl_PointSize = uSize * (0.55 + aShade * 1.05) * (0.7 + 0.6 * fract(aSeed * 7.31)) * uPixelRatio / -mv.z;
    vSeed = aSeed;
    vShade = aShade;
  }
`;
const pointFrag = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying float vSeed;
  varying float vShade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.12, d);
    float twinkle = 0.78 + 0.22 * sin(uTime * 1.4 + vSeed * 43.0);
    // faint slate for the body's wash, accent blue for the bright outline
    vec3 col = mix(vec3(0.42, 0.55, 0.72), vec3(0.18, 0.55, 1.0), smoothstep(0.25, 0.95, vShade));
    float alpha = disc * (0.16 + vShade * 0.6) * twinkle * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`;

// ── Particle layout ─────────────────────────────────────────────────────────
// Every particle owns a spot on the skeleton: a bone id, a position along it
// (u), a lateral position across its width (v ∈ [-1,1]) and a depth jitter.
// ~30% of particles are pinned to the outline (|v| ≈ 1) with a bright shade —
// the same edge/interior split that keeps the Programs-hero silhouette
// legible. Positions are re-derived from the animated joints each frame.
const BONES = [
  { id: "uarmL", n: 300, w0: 0.1, w1: 0.08 },
  { id: "farmL", n: 280, w0: 0.08, w1: 0.06 },
  { id: "uarmR", n: 300, w0: 0.1, w1: 0.08 },
  { id: "farmR", n: 280, w0: 0.08, w1: 0.06 },
  { id: "thighL", n: 380, w0: 0.13, w1: 0.1 },
  { id: "shinL", n: 350, w0: 0.1, w1: 0.07 },
  { id: "thighR", n: 380, w0: 0.13, w1: 0.1 },
  { id: "shinR", n: 350, w0: 0.1, w1: 0.07 },
  { id: "torso", n: 1500 }, // quad between shoulder + hip lines
  { id: "head", n: 430 }, // disc
  { id: "neck", n: 70, w0: 0.07, w1: 0.07 },
  { id: "bar", n: 420, w0: 0.045, w1: 0.045 },
  { id: "postL", n: 520, w0: 0.05, w1: 0.05 },
  { id: "postR", n: 520, w0: 0.05, w1: 0.05 },
  { id: "ambient", n: 320 }, // loose flecks drifting through the volume
];
const COUNT = BONES.reduce((s, b) => s + b.n, 0);

export default function MuscleUp3D({ className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      return undefined; // no WebGL — CTA keeps its gradient background
    }
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(0, -1.55, 9);
    camera.lookAt(0, -1.55, 0);
    const group = new THREE.Group();
    scene.add(group);

    // Static per-particle parameters (which bone, where on it, edge or wash).
    const boneOf = new Uint8Array(COUNT);
    const pu = new Float32Array(COUNT);
    const pv = new Float32Array(COUNT);
    const pz = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);
    const shades = new Float32Array(COUNT);
    {
      let i = 0;
      BONES.forEach((bone, bi) => {
        for (let k = 0; k < bone.n; k++, i++) {
          boneOf[i] = bi;
          seeds[i] = hash(i * 2.7 + bi * 9.1);
          const edge = hash(i * 5.3 + 1.7) < 0.32;
          if (bone.id === "head") {
            pu[i] = hash(i * 3.1 + 0.4) * Math.PI * 2; // angle
            pv[i] = edge ? 0.86 + hash(i * 7.7) * 0.14 : Math.sqrt(hash(i * 7.7)); // radius
          } else if (bone.id === "ambient") {
            pu[i] = (hash(i * 3.1 + 0.4) - 0.5) * 5.4; // x
            pv[i] = -1.55 + (hash(i * 7.7 + 2.2) - 0.5) * 6.4; // y
          } else {
            pu[i] = hash(i * 3.1 + 0.4);
            pv[i] = edge ? (hash(i * 11.3) < 0.5 ? -1 : 1) * (0.84 + hash(i * 7.7) * 0.16) : (hash(i * 7.7) - 0.5) * 2;
          }
          pz[i] =
            bone.id === "ambient"
              ? (hash(i * 13.9 + 3.3) - 0.5) * 2.2
              : (hash(i * 13.9 + 3.3) - 0.5) * (edge ? 0.08 : 0.3);
          shades[i] =
            bone.id === "ambient"
              ? 0.1 + hash(i * 17.3) * 0.22
              : edge
                ? 0.85 + hash(i * 17.3) * 0.15
                : 0.3 + hash(i * 17.3) * 0.42;
        }
      });
    }

    const positions = new Float32Array(COUNT * 3);
    const geometry = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", posAttr);
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aShade", new THREE.BufferAttribute(shades, 1));

    const uniforms = {
      uTime: { value: 0 },
      uSize: { value: 34 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uOpacity: { value: 1 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: pointVert,
      fragmentShader: pointFrag,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    group.add(points);

    // ── Per-frame skeleton solve → particle scatter ------------------------
    const P = {};
    const elbowL = [0, 0];
    const elbowR = [0, 0];
    const kneeL = [0, 0];
    const kneeR = [0, 0];
    // segment endpoints per bone id: [ax, ay, az, bx, by, bz]
    const seg = {
      bar: [-1.65, 0.02, -0.05, 1.65, 0.02, -0.05],
      postL: [-1.68, 0.45, -0.08, -1.68, -4.7, -0.12],
      postR: [1.68, 0.45, -0.08, 1.68, -4.7, -0.12],
      uarmL: [0, 0, 0, 0, 0, 0],
      farmL: [0, 0, 0, 0, 0, 0],
      uarmR: [0, 0, 0, 0, 0, 0],
      farmR: [0, 0, 0, 0, 0, 0],
      thighL: [0, 0, 0, 0, 0, 0],
      shinL: [0, 0, 0, 0, 0, 0],
      thighR: [0, 0, 0, 0, 0, 0],
      shinR: [0, 0, 0, 0, 0, 0],
      neck: [0, 0, 0, 0, 0, 0],
    };
    const torso = { shL: [0, 0, 0], shR: [0, 0, 0], hipL: [0, 0, 0], hipR: [0, 0, 0] };
    const head = { x: 0, y: 0, r: 0.24 };

    const setSeg = (s, ax, ay, az, bx, by, bz) => {
      s[0] = ax; s[1] = ay; s[2] = az; s[3] = bx; s[4] = by; s[5] = bz;
    };

    const update = (t) => {
      evalPose((t % CYCLE) / CYCLE, P);

      const shLx = P.shx - SHW;
      const shRx = P.shx + SHW;
      const hipLx = P.hipx - HIPW;
      const hipRx = P.hipx + HIPW;
      ik(shLx, P.shy, -GRIP, 0, UARM, FARM, P.arm, elbowL);
      ik(shRx, P.shy, GRIP, 0, UARM, FARM, -P.arm, elbowR);
      ik(hipLx, P.hipy, P.fLx, P.fLy, THIGH, SHIN, -1, kneeL);
      ik(hipRx, P.hipy, P.fRx, P.fRy, THIGH, SHIN, 1, kneeR);

      setSeg(seg.uarmL, shLx, P.shy, ZS, elbowL[0], elbowL[1], ZS);
      setSeg(seg.farmL, elbowL[0], elbowL[1], ZS, -GRIP, 0, ZS * 0.6);
      setSeg(seg.uarmR, shRx, P.shy, -ZS, elbowR[0], elbowR[1], -ZS);
      setSeg(seg.farmR, elbowR[0], elbowR[1], -ZS, GRIP, 0, -ZS * 0.6);
      setSeg(seg.thighL, hipLx, P.hipy, ZS * 0.8, kneeL[0], kneeL[1], ZS * 0.9);
      setSeg(seg.shinL, kneeL[0], kneeL[1], ZS * 0.9, P.fLx, P.fLy, ZS * 0.9);
      setSeg(seg.thighR, hipRx, P.hipy, -ZS * 0.8, kneeR[0], kneeR[1], -ZS * 0.9);
      setSeg(seg.shinR, kneeR[0], kneeR[1], -ZS * 0.9, P.fRx, P.fRy, -ZS * 0.9);

      torso.shL[0] = shLx; torso.shL[1] = P.shy; torso.shL[2] = ZS * 0.9;
      torso.shR[0] = shRx; torso.shR[1] = P.shy; torso.shR[2] = -ZS * 0.9;
      torso.hipL[0] = hipLx; torso.hipL[1] = P.hipy; torso.hipL[2] = ZS * 0.7;
      torso.hipR[0] = hipRx; torso.hipR[1] = P.hipy; torso.hipR[2] = -ZS * 0.7;

      // head rides the torso direction, pushed forward by `lean`
      let dx = P.shx - P.hipx;
      let dy = P.shy - P.hipy;
      const dl = Math.hypot(dx, dy) || 1;
      dx /= dl;
      dy /= dl;
      head.x = P.shx + dx * 0.38 + P.lean;
      head.y = P.shy + dy * 0.38;
      setSeg(seg.neck, P.shx, P.shy, 0, head.x, head.y, 0);

      for (let i = 0; i < COUNT; i++) {
        const bone = BONES[boneOf[i]];
        const j = i * 3;
        if (bone.id === "ambient") {
          positions[j] = pu[i];
          positions[j + 1] = pv[i];
          positions[j + 2] = pz[i];
        } else if (bone.id === "head") {
          positions[j] = head.x + Math.cos(pu[i]) * pv[i] * head.r;
          positions[j + 1] = head.y + Math.sin(pu[i]) * pv[i] * head.r;
          positions[j + 2] = pz[i];
        } else if (bone.id === "torso") {
          // bilinear spot in the shoulder→hip quad; v runs left→right
          const u = pu[i];
          const w = (pv[i] + 1) / 2;
          const lx = torso.shL[0] + (torso.hipL[0] - torso.shL[0]) * u;
          const ly = torso.shL[1] + (torso.hipL[1] - torso.shL[1]) * u;
          const lz = torso.shL[2] + (torso.hipL[2] - torso.shL[2]) * u;
          const rx = torso.shR[0] + (torso.hipR[0] - torso.shR[0]) * u;
          const ry = torso.shR[1] + (torso.hipR[1] - torso.shR[1]) * u;
          const rz = torso.shR[2] + (torso.hipR[2] - torso.shR[2]) * u;
          positions[j] = lx + (rx - lx) * w;
          positions[j + 1] = ly + (ry - ly) * w;
          positions[j + 2] = lz + (rz - lz) * w + pz[i];
        } else {
          // limb / rig segment: slide along it, offset across its width
          const s = seg[bone.id];
          const u = pu[i];
          const ax = s[0] + (s[3] - s[0]) * u;
          const ay = s[1] + (s[4] - s[1]) * u;
          const az = s[2] + (s[5] - s[2]) * u;
          let nx = -(s[4] - s[1]);
          let ny = s[3] - s[0];
          const nl = Math.hypot(nx, ny) || 1;
          nx /= nl;
          ny /= nl;
          const hw = (bone.w0 + (bone.w1 - bone.w0) * u) * pv[i];
          positions[j] = ax + nx * hw;
          positions[j + 1] = ay + ny * hw;
          positions[j + 2] = az + pz[i];
        }
      }
      posAttr.needsUpdate = true;
      uniforms.uTime.value = t;
    };

    // pointer parallax + idle sway (lerped toward targets each frame)
    const target = { x: 0, y: 0 };
    const onPointer = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    let raf = 0;
    let inView = false;
    const clock = new THREE.Clock();
    const renderFrame = () => {
      const t = clock.getElapsedTime();
      update(t);
      group.rotation.y += ((target.x * 0.18 + Math.sin(t * 0.16) * 0.07) - group.rotation.y) * 0.05;
      group.rotation.x += (target.y * 0.06 - group.rotation.x) * 0.05;
      renderer.render(scene, camera);
    };
    const loop = () => {
      renderFrame();
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // pull back on narrow viewports so posts + full hang never crop
      camera.position.z = 9 * Math.max(1, 0.62 / camera.aspect);
      if (reduceMotion) {
        update(CYCLE * 0.55); // frozen at the top of the rep
        renderer.render(scene, camera);
      }
    };

    // only animate while the section is on screen
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (reduceMotion) return;
      if (inView && !raf) raf = requestAnimationFrame(loop);
      else if (!inView && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(host);

    resize();
    window.addEventListener("resize", resize);
    if (!reduceMotion) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    />
  );
}
