"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

const DEFAULT_COLORS = {
  char: "#0a0a0a",
  glow: "#ffffff",
  smoke: "#737373",
  ember: "#8a8a8a",
};

const FX_NAME = "burning-screen-fx";
const ACTIVE_CLASS = "burning-screen-active";
const REDUCED_CLASS = "burning-screen-reduced";

const BurningScreenContext = createContext(null);

export function useBurningScreen() {
  const ctx = useContext(BurningScreenContext);
  if (!ctx) {
    throw new Error("useBurningScreen must be used inside <BurningScreen>.");
  }
  return ctx;
}

export function BurningScreen({
  children,
  duration = 2000,
  colors,
  embers = true,
  emberDuration = 1500,
}) {
  const fxRef = useRef(null);
  const glCanvasRef = useRef(null);
  const ashCanvasRef = useRef(null);
  const busyRef = useRef(false);
  const glRef = useRef(undefined);
  const defaults = useRef({ duration, colors, embers, emberDuration });
  defaults.current = { duration, colors, embers, emberDuration };

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove(ACTIVE_CLASS, REDUCED_CLASS);
    };
  }, []);

  const burn = useCallback(async (update, options = {}) => {
    const opts = { ...defaults.current, ...stripUndefined(options) };
    const palette = { ...DEFAULT_COLORS, ...defaults.current.colors, ...options.colors };
    const root = document.documentElement;
    const doc = document;

    const runUpdate = () => waitForUpdate(update);

    // One burn at a time; a second call just updates.
    if (busyRef.current || !doc.startViewTransition) {
      await runUpdate();
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (glRef.current === undefined && glCanvasRef.current) {
      glRef.current = createGL(glCanvasRef.current);
    }
    const gl = glRef.current;

    if (reduced || !gl) {
      busyRef.current = true;
      root.classList.add(REDUCED_CLASS);
      try {
        await doc.startViewTransition(runUpdate).finished;
      } catch {
        /* skipped transitions are fine */
      } finally {
        root.classList.remove(REDUCED_CLASS);
        busyRef.current = false;
      }
      return;
    }

    busyRef.current = true;
    const origin = resolveOrigin(opts.origin);
    const oldBg = sampleBackground(origin);

    root.style.setProperty("--burning-screen-x", `${origin.x}px`);
    root.style.setProperty("--burning-screen-y", `${origin.y}px`);
    root.classList.add(ACTIVE_CLASS);

    const transition = doc.startViewTransition(runUpdate);

    try {
      await transition.ready;
    } catch {
      root.classList.remove(ACTIVE_CLASS);
      busyRef.current = false;
      return;
    }

    const newBg = sampleBackground(origin);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const geo = makeGeometry(origin, w, h);
    const ms = Math.max(300, opts.duration);

    const clip = root.animate(buildClipKeyframes(geo, ms), {
      duration: ms,
      easing: "linear",
      fill: "both",
      pseudoElement: "::view-transition-new(root)",
    });

    // Edge colors adapt to each page so the burn always shows.
    const outer = pickVisible([palette.char, palette.glow], oldBg);
    const inner = pickVisible([palette.glow, palette.char], newBg);
    const spark = pickVisible([palette.glow, palette.char], oldBg);
    const ashColors = [palette.ember, pickVisible([palette.char, palette.glow], newBg)];

    const ash = ashCanvasRef.current;
    const ctx = ash.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const glDpr = Math.min(window.devicePixelRatio || 1, w < 768 ? 1 : 1.5);
    sizeCanvas(ash, w, h, dpr);
    sizeCanvas(gl.canvas, w, h, glDpr);
    if (fxRef.current) fxRef.current.style.opacity = "1";

    const particles = [];
    const start = performance.now();
    let last = start;
    let emberStart = 0;

    await new Promise((resolve) => {
      const frame = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const t = Number(clip.currentTime ?? now - start);
        const p = Math.min(1, Math.max(0, t / ms));
        const burning = p < 1;

        const frameGL = {
          w,
          h,
          dpr: glDpr,
          geo,
          p,
          secs: (p * ms) / 1000,
          clock: (now - start) / 1000,
          outer: hexToRgb(outer),
          inner: hexToRgb(inner),
          smoke: hexToRgb(palette.smoke),
          tail: 0,
        };
        let tailing = false;
        if (burning) {
          drawGL(gl, frameGL);
          spawnAsh(particles, geo, p, frameGL.secs, dt, outer, spark, palette.smoke);
          spawnInnerAsh(particles, geo, p, frameGL.secs, dt, ashColors);
        } else {
          if (!emberStart) emberStart = now;
          // After the burn: no more fire, just the last ash rising and fading.
          clearGL(gl);
          const k = opts.embers ? (now - emberStart) / Math.max(1, opts.emberDuration) : 1;
          tailing = k < 1;
          if (tailing) spawnRisingAsh(particles, w, h, dt, 1 - k, ashColors);
        }

        stepParticles(particles, dt);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        drawParticles(ctx, particles, now / 1000);

        if (burning || tailing || particles.length > 0) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(frame);

      transition.finished.finally(() => {
        root.classList.remove(ACTIVE_CLASS);
      });
    });

    ctx.clearRect(0, 0, ash.width, ash.height);
    if (fxRef.current) fxRef.current.style.opacity = "0";
    busyRef.current = false;
  }, []);

  const value = useMemo(() => ({ burn }), [burn]);

  return (
    <BurningScreenContext.Provider value={value}>
      {children}
      <style>{FX_CSS}</style>
      <div
        ref={fxRef}
        aria-hidden
        data-burning-screen=""
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2147483647,
          opacity: 0,
          viewTransitionName: FX_NAME,
        }}
      >
        <canvas
          ref={glCanvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        <canvas
          ref={ashCanvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      </div>
    </BurningScreenContext.Provider>
  );
}

const FX_CSS = `
html.${ACTIVE_CLASS}::view-transition-old(root),
html.${ACTIVE_CLASS}::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
html.${ACTIVE_CLASS}::view-transition-new(root) {
  clip-path: circle(0px at var(--burning-screen-x, 50%) var(--burning-screen-y, 50%));
}
::view-transition-group(${FX_NAME}),
::view-transition-new(${FX_NAME}) {
  animation: none;
}
::view-transition-old(${FX_NAME}) {
  display: none;
}
html.${REDUCED_CLASS}::view-transition-group(root),
html.${REDUCED_CLASS}::view-transition-old(root),
html.${REDUCED_CLASS}::view-transition-new(root) {
  animation-duration: 220ms;
}
`;

/* ---------------------------------------------------------------------------
 * Waiting for the new page
 * ------------------------------------------------------------------------- */

/** Runs the update and resolves once the page has changed. A returned promise
 * is awaited; otherwise (e.g. router.push) it waits for the DOM to change. */
function waitForUpdate(update) {
  return new Promise((resolve) => {
    let settled = false;
    let settleTimer;
    const done = () => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(fallback);
      clearTimeout(settleTimer);
      resolve();
    };
    const observer = new MutationObserver((records) => {
      const relevant = records.some(
        (r) => !(r.target instanceof Element && r.target.closest("[data-burning-screen]")),
      );
      if (!relevant) return;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(done, 60);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    const fallback = setTimeout(done, 2500);

    let result;
    try {
      result = update();
    } catch (err) {
      done();
      throw err;
    }
    if (result && typeof result.then === "function") {
      result.then(
        () => setTimeout(done, 0),
        () => done(),
      );
    }
  });
}

const WOBBLE = [
  // [frequency, weight, phase, speed]: the outline breathes and crinkles,
  // so no two frames share a shape.
  [3, 0.5, 1.3, 1.7],
  [5, 0.3, 4.1, -2.3],
  [8, 0.24, 2.2, 3.4],
  [13, 0.16, 0.7, -4.6],
  [21, 0.1, 5.3, 6.2],
  [34, 0.06, 2.9, -8.8],
  [55, 0.035, 0.4, 11.5],
];
const WOBBLE_SUM = WOBBLE.reduce((s, w) => s + w[1], 0);

function makeGeometry(origin, w, h) {
  const far = Math.max(
    Math.hypot(origin.x, origin.y),
    Math.hypot(w - origin.x, origin.y),
    Math.hypot(origin.x, h - origin.y),
    Math.hypot(w - origin.x, h - origin.y),
  );
  const amp = 0.16;
  // Leave room for the dents so the last frame still covers every corner.
  const rMax = far / ((1 - amp * WOBBLE_SUM) * 0.9) + 60;
  return { ox: origin.x, oy: origin.y, r0: 10, rMax, amp };
}

/** Radius of the hole at progress p (0–1): slow ignite, then the fire spreads
 * in uneven surges rather than at a steady rate. */
function baseRadius(g, p) {
  const surge = p + 0.12 * Math.sin(23 * p) * p * (1 - p);
  return g.r0 + (g.rMax - g.r0) * Math.pow(Math.max(0, surge), 1.45);
}

/** Some sides race ahead while others stall, and that changes as it burns. */
function spread(theta, p) {
  return (
    1 +
    p *
      (0.22 * Math.sin(2 * theta + 0.7) * Math.sin(3.1 * p + 0.4) +
        0.16 * Math.sin(3 * theta + 2.6) * Math.sin(5.3 * p + 0.9))
  );
}

function edgeRadius(g, theta, p, secs) {
  let n = 0;
  for (const [f, wgt, ph, sp] of WOBBLE) n += wgt * Math.sin(f * theta + ph + sp * secs);
  return baseRadius(g, p) * (1 + g.amp * n) * spread(theta, p);
}

function buildClipKeyframes(g, ms) {
  const frames = [];
  const steps = Math.max(24, Math.round(ms / 33));
  const points = 220;
  for (let k = 0; k <= steps; k++) {
    const p = k / steps;
    const secs = (p * ms) / 1000;
    const pts = [];
    for (let i = 0; i < points; i++) {
      const th = (i / points) * Math.PI * 2 - Math.PI;
      const r = edgeRadius(g, th, p, secs);
      pts.push(
        `${(g.ox + Math.cos(th) * r).toFixed(1)}px ${(g.oy + Math.sin(th) * r).toFixed(1)}px`,
      );
    }
    frames.push({ clipPath: `polygon(${pts.join(",")})` });
  }
  return frames;
}

function resolveOrigin(o) {
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  if (!o) return center;
  const rectCenter = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  if (o instanceof Element) return rectCenter(o);
  if ("clientX" in o) {
    // Keyboard "clicks" report 0,0: start from the element instead.
    if (o.clientX === 0 && o.clientY === 0 && o.currentTarget instanceof Element) {
      return rectCenter(o.currentTarget);
    }
    return { x: o.clientX, y: o.clientY };
  }
  return { x: o.x, y: o.y };
}

let colorCtx = null;
function toRgb(color) {
  if (!colorCtx) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    colorCtx = c.getContext("2d", { willReadFrequently: true });
  }
  if (!colorCtx) return [255, 255, 255];
  colorCtx.clearRect(0, 0, 1, 1);
  colorCtx.fillStyle = "#000";
  colorCtx.fillStyle = color;
  colorCtx.fillRect(0, 0, 1, 1);
  const d = colorCtx.getImageData(0, 0, 1, 1).data;
  const rgb = [d[0], d[1], d[2]];
  rgb.a = d[3] / 255;
  return rgb;
}

function hexToRgb(color) {
  const [r, g, b] = toRgb(color);
  return [r / 255, g / 255, b / 255];
}

function luminance([r, g, b]) {
  const ch = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/** First color with enough contrast against the background, else the best one. */
function pickVisible(candidates, bg) {
  const lb = luminance(bg);
  let best = candidates[0];
  let bestRatio = 0;
  for (const c of candidates) {
    const lc = luminance(toRgb(c));
    const ratio = (Math.max(lb, lc) + 0.05) / (Math.min(lb, lc) + 0.05);
    if (ratio >= 3) return c;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = c;
    }
  }
  return best;
}

/** The page's own background: the most common opaque color behind a ring of
 * points around the origin, so a black button under the click doesn't count. */
function sampleBackground(at) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const pts = [
    [8, 8],
    [w - 8, 8],
    [8, h - 8],
    [w - 8, h - 8],
    [w / 2, 8],
    [w / 2, h - 8],
    [8, h / 2],
    [w - 8, h / 2],
    [at.x, Math.max(8, at.y - 120)],
    [at.x, Math.min(h - 8, at.y + 120)],
  ];
  const votes = new Map();
  for (const [x, y] of pts) {
    const rgb = colorAt(x, y);
    const key = rgb.join(",");
    const v = votes.get(key);
    if (v) v.n++;
    else votes.set(key, { rgb, n: 1 });
  }
  let best = { rgb: [255, 255, 255], n: 0 };
  for (const v of votes.values()) if (v.n > best.n) best = v;
  return best.rgb;
}

/** Walks down the DOM (not hit testing, which is unreliable mid-transition)
 * and returns the last opaque background on the path to the point. */
function colorAt(x, y) {
  let found = [255, 255, 255];
  const opaque = (el) => {
    const c = toRgb(getComputedStyle(el).backgroundColor);
    return (c.a ?? 1) > 0.5 ? [c[0], c[1], c[2]] : null;
  };
  found = opaque(document.documentElement) ?? found;
  let el = document.body;
  while (el) {
    found = opaque(el) ?? found;
    let next = null;
    for (let i = el.children.length - 1; i >= 0; i--) {
      const child = el.children[i];
      if (child.hasAttribute("data-burning-screen")) continue;
      const r = child.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        next = child;
        break;
      }
    }
    el = next;
  }
  return found;
}

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uDpr;
uniform vec2 uOrigin;
uniform float uR;
uniform float uAmp;
uniform float uSecs;
uniform float uClock;
uniform float uProg;
uniform vec3 uOuter;
uniform vec3 uInner;
uniform vec3 uSmoke;
uniform float uTail;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}

// Same outline as the clip-path (WOBBLE, spread) so the two line up.
float edgeR(float th,float s,float p){
  float n=.5*sin(3.*th+1.3+1.7*s)+.3*sin(5.*th+4.1-2.3*s)+.24*sin(8.*th+2.2+3.4*s)
    +.16*sin(13.*th+.7-4.6*s)+.1*sin(21.*th+5.3+6.2*s)+.06*sin(34.*th+2.9-8.8*s)
    +.035*sin(55.*th+.4+11.5*s);
  float sp=1.+p*(.22*sin(2.*th+.7)*sin(3.1*p+.4)+.16*sin(3.*th+2.6)*sin(5.3*p+.9));
  return uR*(1.+uAmp*n)*sp;
}

vec4 over(vec4 dst,vec3 c,float a){a=clamp(a,0.,1.);return vec4(c*a+dst.rgb*(1.-a),a+dst.a*(1.-a));}

void main(){
  vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
  vec2 v=p-uOrigin;
  float d=length(v);
  vec2 dir=v/max(d,.001);
  float th=atan(v.y,v.x);
  // Ragged, flickering edge: noise on the direction (no seam), re-rolled over time.
  float rag=(fbm(dir*26.+vec2(uSecs*1.3,-uSecs*.9))-.5)*9.;
  float s=d-edgeR(th,uSecs,uProg)+rag;
  float grow=smoothstep(0.,.06,uProg);
  vec4 col=vec4(0.);

  if(s>0.){
    // Old page: wide scorch, a thick charred band with texture, glinting embers,
    // and a lifted lip catching the light right at the edge.
    float scorch=exp(-s/40.)*.38*(.5+.5*fbm(p*.01+vec2(uClock*.2,-uClock*.6)));
    col=over(col,uSmoke,scorch*grow);
    float bandW=10.+24.*fbm(p*.028+vec2(uSecs*.25,0.));
    float band=smoothstep(bandW,bandW*.25,s);
    float grain=fbm(p*.22+vec2(0.,uSecs*.8));
    vec3 charC=mix(uOuter,uSmoke,.35*smoothstep(.45,.85,grain));
    col=over(col,charC,band*.97);
    float glint=step(.982,hash(floor(p/2.)+floor(uClock*14.)))*band*smoothstep(bandW,0.,s);
    col=over(col,uInner,glint);
    float lip=exp(-(s-2.5)*(s-2.5)/3.);
    col=over(col,mix(uOuter,uInner,.55),lip*.4);
  } else {
    // New page: the old sheet's shadow, a thick uneven glow, and flames.
    // Smooth depth (no fine edge noise) so the glow has no radial streaks.
    float depth=max(0.,-(d-edgeR(th,uSecs,uProg))-2.);
    // Inner shadow: a wide, uneven soot band just inside the edge, so the
    // new page looks freshly burned rather than simply revealed.
    float sz=clamp(uR/260.,.25,1.);
    float sootW=(14.+20.*fbm(p*.018+vec2(uSecs*.5,uClock*.2)))*sz;
    float soot=exp(-depth/sootW)*(.5+.5*fbm(p*.03+vec2(0.,-uClock*.4)));
    col=over(col,vec3(0.),exp(-depth/(14.*sz))*.3);
    col=over(col,mix(uInner,uSmoke,.55),soot*.32);
    float glowW=(7.+14.*fbm(p*.02+vec2(uClock*.9,uSecs)))*sz;
    float flick=.75+.25*noise(p*.06+vec2(uClock*6.,-uClock*4.));
    col=over(col,uInner,exp(-depth/glowW)*.65*flick);
    col=over(col,uInner,exp(-depth/5.));
    float lower=.25+.75*smoothstep(-.4,.8,dir.y);
    vec2 q=vec2(p.x*.024,p.y*.008+uClock*3.4);
    float f=fbm(q+vec2(sin(uClock*1.7)*.3,0.))+.4*fbm(q*vec2(2.6,1.8)+3.1);
    float fh=depth/(320.*sz);
    float tongue=smoothstep(0.,.12,f-fh-.38)*lower;
    float core=smoothstep(0.,.1,f-fh*1.6-.5)*lower;
    col=over(col,mix(uInner,uSmoke,clamp(depth/260.,0.,1.)),tongue*.6*sz);
    col=over(col,uInner,core*.8*sz);
  }

  // Afterglow: flames along the bottom of the screen that die down.
  if(uTail>0.){
    float hb=uRes.y-p.y;
    vec2 qb=vec2(p.x*.024,p.y*.008+uClock*3.4);
    float fb=fbm(qb)+.4*fbm(qb*vec2(2.6,1.8)+3.1);
    float hh=hb/(300.*uTail);
    float tb=smoothstep(0.,.12,fb-hh-.38);
    float cb=smoothstep(0.,.1,fb-hh*1.6-.5);
    col=over(col,uSmoke,exp(-hb/90.)*.12*uTail);
    col=over(col,mix(uInner,uSmoke,clamp(hb/240.,0.,1.)),tb*.6*uTail);
    col=over(col,uInner,cb*.8*uTail);
  }

  // Hot rim right on the edge, flickering.
  float rim=exp(-s*s/3.)*(.6+.4*noise(vec2(th*40.,uClock*18.)));
  col=over(col,uInner,rim*.85);

  gl_FragColor=col*grow;
}
`;

function createGL(canvas) {
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    alpha: true,
    antialias: false,
  });
  if (!gl) return null;
  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("[burning-screen]", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const names = [
    "uRes",
    "uDpr",
    "uOrigin",
    "uR",
    "uAmp",
    "uSecs",
    "uClock",
    "uProg",
    "uOuter",
    "uInner",
    "uSmoke",
    "uTail",
  ];
  const u = {};
  for (const n of names) u[n] = gl.getUniformLocation(prog, n);
  return { canvas, gl, u };
}

function drawGL(s, f) {
  const { gl, u } = s;
  gl.viewport(0, 0, s.canvas.width, s.canvas.height);
  gl.uniform2f(u.uRes, f.w, f.h);
  gl.uniform1f(u.uDpr, s.canvas.height / f.h);
  gl.uniform2f(u.uOrigin, f.geo.ox, f.geo.oy);
  gl.uniform1f(u.uR, baseRadius(f.geo, f.p));
  gl.uniform1f(u.uAmp, f.geo.amp);
  gl.uniform1f(u.uSecs, f.secs);
  gl.uniform1f(u.uClock, f.clock);
  gl.uniform1f(u.uProg, f.p);
  gl.uniform3fv(u.uOuter, f.outer);
  gl.uniform3fv(u.uInner, f.inner);
  gl.uniform3fv(u.uSmoke, f.smoke);
  gl.uniform1f(u.uTail, f.tail);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function clearGL(s) {
  s.gl.clearColor(0, 0, 0, 0);
  s.gl.clear(s.gl.COLOR_BUFFER_BIT);
}

function sizeCanvas(c, w, h, dpr) {
  const W = Math.round(w * dpr);
  const H = Math.round(h * dpr);
  if (c.width !== W) c.width = W;
  if (c.height !== H) c.height = H;
}

function flakeShape() {
  const n = 4 + Math.floor(Math.random() * 5);
  const radii = [];
  for (let i = 0; i < n; i++) radii.push(0.45 + Math.random() * 0.75);
  return radii;
}

/** Fewer particles on small screens, so phones stay smooth. */
const maxParticles = () =>
  Math.min(1100, Math.round((window.innerWidth * window.innerHeight) / 600));

function spawnAsh(list, g, p, secs, dt, flakeColor, sparkColor, smokeColor) {
  if (p < 0.04) return;
  const rate = 260 * dt; // particles per frame
  for (let i = 0; i < rate && list.length < maxParticles(); i++) {
    const th = Math.random() * Math.PI * 2 - Math.PI;
    // Mostly from the upper edge, where the ash lifts off.
    if (Math.sin(th) > 0.15 && Math.random() > 0.25) continue;
    const r = edgeRadius(g, th, p, secs) + Math.random() * 10;
    const x = g.ox + Math.cos(th) * r;
    const y = g.oy + Math.sin(th) * r;
    if (x < -20 || y < -20 || x > window.innerWidth + 20 || y > window.innerHeight + 20) continue;
    const roll = Math.random();
    const kind = roll < 0.66 ? "flake" : "spark";
    const out = 20 + Math.random() * 80;
    // Mostly specks, a few big curled pieces.
    const flakeSize = 1.4 + Math.pow(Math.random(), 2.6) * 6;
    const heavy = false;
    list.push({
      x,
      y,
      vx: Math.cos(th) * out + (Math.random() - 0.5) * 40,
      vy: heavy ? 10 + Math.random() * 30 : Math.sin(th) * out - (50 + Math.random() * 110),
      life: 0,
      max: heavy ? 1 + Math.random() * 0.8 : 0.6 + Math.random() * 1,
      size: kind === "flake" ? flakeSize : 0.6 + Math.random() * 1.4,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 12,
      color: kind === "flake" ? (Math.random() < 0.72 ? flakeColor : smokeColor) : sparkColor,
      kind,
      seed: heavy ? -1 - Math.random() * 100 : Math.random() * 100,
      shape: kind === "flake" ? flakeShape() : undefined,
      tumble: 3 + Math.random() * 9,
      hot: kind === "flake" && Math.random() < 0.35 ? sparkColor : undefined,
    });
  }
}

function risingFlake(x, y, color, life) {
  const size = 0.8 + Math.pow(Math.random(), 2.4) * 3.6;
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 30,
    vy: -(45 + Math.random() * 120),
    life: 0,
    max: life,
    size,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 10,
    color,
    kind: "flake",
    seed: Math.random() * 100,
    shape: flakeShape(),
    tumble: 2 + Math.random() * 7,
  };
}

/** Ash lifting off the whole burned area, thickest low down, rising through the hole. */
function spawnInnerAsh(list, g, p, secs, dt, colors) {
  if (p < 0.06) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const rate = 520 * dt * Math.min(1, p * 3);
  for (let i = 0; i < rate && list.length < maxParticles(); i++) {
    const th = Math.random() * Math.PI * 2 - Math.PI;
    // Favor the lower half, where the fire is.
    if (Math.sin(th) < 0 && Math.random() < 0.5) continue;
    const r = edgeRadius(g, th, p, secs) * Math.sqrt(Math.random()) * 0.96;
    const x = g.ox + Math.cos(th) * r;
    const y = g.oy + Math.sin(th) * r;
    if (x < 0 || y < 0 || x > w || y > h) continue;
    const c = Math.random() < 0.6 ? colors[0] : colors[1];
    list.push(risingFlake(x, y, c, 0.7 + Math.random() * 1.1));
  }
}

/** After the burn: ash keeps rising from the bottom while the fire dies down. */
function spawnRisingAsh(list, w, h, dt, strength, colors) {
  const rate = 420 * dt * strength * Math.min(1, (w * h) / 900000 + 0.4);
  for (let i = 0; i < rate && list.length < maxParticles(); i++) {
    const x = Math.random() * w;
    const y = h * (0.45 + Math.random() * 0.6);
    const c = Math.random() < 0.6 ? colors[0] : colors[1];
    list.push(risingFlake(x, y, c, 0.8 + Math.random() * 1.2));
  }
}

function stepParticles(list, dt) {
  for (let i = list.length - 1; i >= 0; i--) {
    const q = list[i];
    if (q.delay && q.delay > 0) {
      q.delay -= dt;
      continue;
    }
    q.life += dt;
    if (q.life >= q.max) {
      list.splice(i, 1);
      continue;
    }
    {
      // Heat lifts the ash, with a sideways flutter.
      q.vy -= 40 * dt;
      q.vx += Math.sin(q.seed + q.life * 6) * 30 * dt;
      q.vx *= 1 - 0.9 * dt;
      q.vy *= 1 - 0.6 * dt;
    }
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.rot += q.spin * dt;
  }
}

function drawParticles(ctx, list, time) {
  for (const q of list) {
    const k = q.life / q.max;
    if (q.delay && q.delay > 0) continue;
    let a = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
    if (a <= 0.01) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = q.color;
    if (q.kind === "flake" && q.shape) {
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(q.rot);
      // Tumbling: the flake turns edge-on and back.
      ctx.scale(1, 0.25 + 0.75 * Math.abs(Math.cos(q.life * (q.tumble ?? 6) + q.seed)));
      ctx.beginPath();
      const n = q.shape.length;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2;
        const r = q.shape[i] * q.size;
        if (i === 0) ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
        else ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      ctx.closePath();
      ctx.fill();
      if (q.hot && k < 0.6) {
        ctx.globalAlpha = a * (1 - k / 0.6);
        ctx.strokeStyle = q.hot;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function stripUndefined(o) {
  const out = {};
  for (const k of Object.keys(o)) {
    if (o[k] !== undefined) out[k] = o[k];
  }
  return out;
}
