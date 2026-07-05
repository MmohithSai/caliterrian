// Silhouette Backdrop 3D — the watercolor handstand figure rebuilt as a
// floating particle constellation behind the Training Disciplines section.
// The source art (public/art/handstand-silhouette.png) is sampled on an
// offscreen canvas: every dark pixel becomes a point whose depth, size and
// brightness follow the ink density, so the watercolor texture (and the
// splatter flecks around the figure) survive the translation into 3D.
// Pointer movement parallaxes the cloud; an idle sway keeps it alive when
// the cursor is elsewhere. Raw Three.js (no R3F) — same lifecycle patterns
// as SkillTree3D / FacilityGallery3D.
import { useEffect, useRef } from "react";
import * as THREE from "three";

const SRC = "/art/handstand-silhouette.png";
const MAX_POINTS = 18000;
const WORLD_H = 9; // figure height in world units; camera distance fits this

// ── Point shaders: soft ink dots that drift and twinkle ────────────────────
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
    // denser ink → bigger, nearer-feeling dots
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
    // faint slate for the wash, accent blue for the dense ink
    vec3 col = mix(vec3(0.42, 0.55, 0.72), vec3(0.18, 0.55, 1.0), smoothstep(0.25, 0.95, vShade));
    float alpha = disc * (0.16 + vShade * 0.6) * twinkle * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`;

// ── Wash shaders: the artwork itself as a faint glowing plane ──────────────
// Sits just behind the particles so the pose reads as one solid figure at a
// glance; the points then supply the depth, drift and sparkle on top of it.
const washVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const washFrag = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec4 tx = texture2D(uMap, vUv);
    float lum = dot(tx.rgb, vec3(0.299, 0.587, 0.114));
    float ink = (1.0 - lum) * tx.a;
    if (ink < 0.05) discard;
    vec3 col = mix(vec3(0.05, 0.12, 0.22), vec3(0.12, 0.34, 0.62), smoothstep(0.15, 0.9, ink));
    gl_FragColor = vec4(col, ink * uOpacity);
  }
`;

// Sample the artwork's dark pixels into positions + ink-density shades.
// White paper is discarded; grey wash spawns sparse dim points, solid ink
// spawns dense bright ones. Pixels on the silhouette's boundary always spawn
// a bright point, so the outline of the pose stays legible even where the
// interior wash is airy.
function sampleImage(img) {
  const gridW = 200;
  const gridH = Math.round((img.height / img.width) * gridW);
  const cv = document.createElement("canvas");
  cv.width = gridW;
  cv.height = gridH;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, gridW, gridH);
  const { data } = ctx.getImageData(0, 0, gridW, gridH);

  // darkness field, then reuse it for edge detection below
  const dark = new Float32Array(gridW * gridH);
  for (let i = 0; i < dark.length; i++) {
    const o = i * 4;
    const lum = (data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114) / 255;
    dark[i] = (1 - lum) * (data[o + 3] / 255);
  }

  const positions = [];
  const seeds = [];
  const shades = [];
  const aspect = gridW / gridH;
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const i = y * gridW + x;
      const d = dark[i];
      if (d < 0.12) continue;
      // boundary pixel: solid ink with white paper next door
      const edge =
        d > 0.3 &&
        ((x > 0 && dark[i - 1] < 0.12) ||
          (x < gridW - 1 && dark[i + 1] < 0.12) ||
          (y > 0 && dark[i - gridW] < 0.12) ||
          (y < gridH - 1 && dark[i + gridW] < 0.12));
      if (!edge && Math.random() > 0.24 + d * 0.85) continue;
      const shade = edge ? Math.max(0.85, d) : Math.min(1, d * 1.15);
      const jx = (Math.random() - 0.5) / gridW;
      const jy = (Math.random() - 0.5) / gridH;
      // edges hold the contour plane; interior wash gets a shallow scatter
      const depth = edge
        ? (Math.random() - 0.5) * 0.12
        : (Math.random() - 0.5) * (0.25 + (1 - shade) * 0.75);
      positions.push(
        (x / gridW - 0.5 + jx) * WORLD_H * aspect,
        (0.5 - y / gridH + jy) * WORLD_H,
        depth,
      );
      seeds.push(Math.random());
      shades.push(shade);
      if (seeds.length >= MAX_POINTS) return { positions, seeds, shades };
    }
  }
  return { positions, seeds, shades };
}

export default function SilhouetteBackdrop3D({ className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      return undefined; // no WebGL — the section simply keeps its flat background
    }
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.z = 13.5;
    const group = new THREE.Group();
    scene.add(group);

    const uniforms = {
      uTime: { value: 0 },
      uSize: { value: 46 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uOpacity: { value: 1 },
    };

    let disposed = false;
    let raf = 0;
    let inView = false;
    let material;
    let geometry;
    let washMaterial;
    let washGeometry;
    let washTexture;

    // pointer parallax + idle sway (lerped toward targets each frame)
    const target = { x: 0, y: 0 };
    const onPointer = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const clock = new THREE.Clock();
    const renderFrame = () => {
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      // gentle parallax — big swings shear the tall figure into mush
      group.rotation.y += ((target.x * 0.11 + Math.sin(t * 0.12) * 0.04) - group.rotation.y) * 0.05;
      group.rotation.x += ((target.y * 0.05) - group.rotation.x) * 0.05;
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
      // pull back on narrow viewports so the figure never crops
      camera.position.z = 13.5 / Math.min(1, camera.aspect * 1.35);
      if (reduceMotion && material) renderFrame();
    };

    const img = new Image();
    img.src = SRC;
    img.onload = () => {
      if (disposed) return;
      const { positions, seeds, shades } = sampleImage(img);
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
      geometry.setAttribute("aShade", new THREE.Float32BufferAttribute(shades, 1));
      material = new THREE.ShaderMaterial({
        vertexShader: pointVert,
        fragmentShader: pointFrag,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      group.add(new THREE.Points(geometry, material));

      // faint solid wash of the artwork behind the points — this is what
      // makes the handstand read as a figure instead of a dust cloud
      washTexture = new THREE.Texture(img);
      washTexture.colorSpace = THREE.SRGBColorSpace;
      washTexture.needsUpdate = true;
      const aspect = img.width / img.height;
      washGeometry = new THREE.PlaneGeometry(WORLD_H * aspect, WORLD_H);
      washMaterial = new THREE.ShaderMaterial({
        vertexShader: washVert,
        fragmentShader: washFrag,
        uniforms: { uMap: { value: washTexture }, uOpacity: { value: 0.55 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const wash = new THREE.Mesh(washGeometry, washMaterial);
      wash.position.z = -0.2;
      group.add(wash);
      resize();
      if (reduceMotion) renderFrame();
      else if (inView && !raf) raf = requestAnimationFrame(loop);
    };

    // only animate while the section is on screen
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (reduceMotion) return;
      if (inView && material && !raf) raf = requestAnimationFrame(loop);
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
      disposed = true;
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      geometry?.dispose();
      material?.dispose();
      washGeometry?.dispose();
      washMaterial?.dispose();
      washTexture?.dispose();
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
