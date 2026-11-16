"use client";

import { useEffect, useRef, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";

/**
 * Orrery Gallery
 * Round pictures orbit your brand name like planets, fall into one stack, then
 * open into a curved strip you can drag. Dragging left squeezes the curve, dragging
 * right stretches it, and it wobbles back when you let go. Each picture opens its link.
 * One file, React only. Drawn on one canvas; the links are real <a> tags for keyboards.
 */

export type OrreryImage = {
  /** Picture address. Same site, or a site your Content-Security-Policy allows. */
  src: string;
  /** Says what the picture shows. Read by screen readers and used as the link name. */
  alt: string;
  /** Where a click on the picture goes. Leave it out for a picture with no link. */
  href?: string;
  /** Open the link in a new tab. */
  newTab?: boolean;
};

export type OrreryGalleryProps = {
  images: OrreryImage[];
  /** The name in the middle of the orbit, and the small mark in the corner. */
  brand?: string;
  /** Corner for the small brand mark. */
  markPosition?: "bottom-left" | "top-right";
  /** Play the orbit intro the first time it scrolls into view. Off: the strip shows at once. */
  intro?: boolean;
  /** How much the strip curves at rest, 0 (flat) to 0.6. */
  bend?: number;
  /** Corner radius of each picture in the strip, in px. */
  radius?: number;
  /** Height of the gallery. Any CSS height. */
  height?: number | string;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
};

/* ---------- Tuning (the design and its timing) ---------- */
const DPR_MAX = 2;
const WORD_IN = 700; // brand name fades in
const DISC_START = 280; // first picture appears
const DISC_STAGGER = 70; // between pictures
const DISC_POP = 640; // each picture pops in
const ORBIT_HOLD = 750; // orbit after the last picture is in
const MERGE_MS = 860; // pictures fall into the middle
const STACK_MS = 420; // the stack lands, breathes and squares off
const UNFURL_MS = 980; // stack opens into the strip
const UNFURL_STAGGER = 60; // per slot away from the middle
const SPIN = 0.55; // orbit speed, radians a second
const SPIN_MAX = 9; // orbit speed cap while falling in
const STACK_CORNER = 0.2; // the stack's cards are rounded squares
const TILT = 0.78; // the orbit is a tilted ellipse
const DEPTH = 0.1; // pictures in front are 10% bigger
const SKIP_SPEED = 3.2; // a tap during the intro plays the rest this much faster
const DRAG_START = 6; // px before a press becomes a drag (a drag never opens a link)
const MOMENTUM = 0.22; // s of glide after a flick
const SNAP_K = 70; // snap spring stiffness
const SNAP_C = 13.7; // snap spring damping (a hint of overshoot)
const SQUEEZE_MAX = 0.24; // dragging right to left pinches the middle in by up to 24%, the ends stay put
const STRETCH_MAX = 0.12; // dragging left to right pushes the middle out by up to 12%
const SQUEEZE_K = 180; // squeeze spring stiffness
const SQUEEZE_C = 16; // squeeze spring damping (it wobbles back)
const LEAN_K = 120;
const LEAN_C = 16;
const WARP_K = 90; // the curve settles in with a small bounce
const WARP_C = 11;
const LIFT = 0.035; // hovered picture grows 3.5% taller
const EASE_OUT = (x: number) => 1 - Math.pow(1 - x, 4);
const EASE_EXPO = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const BACK_OUT = (x: number) => {
  const c = 1.55;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Only http(s), mailto, tel and same-site links. Never javascript: or data:. */
function safeHref(href?: string) {
  if (!href) return undefined;
  const h = href.trim();
  if (/^(javascript|data|vbscript):/i.test(h.replace(/[\s\u0000-\u001f]/g, ""))) return undefined;
  return h;
}

const CSS = `
.og-root{position:relative;width:100%;overflow:hidden;color:var(--foreground,var(--fg,currentColor));container-type:inline-size;user-select:none;-webkit-user-select:none;touch-action:pan-y;overscroll-behavior-x:contain;-webkit-tap-highlight-color:transparent}
.og-root canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab}
.og-root[data-drag] canvas{cursor:grabbing}
.og-root[data-hover] canvas{cursor:pointer}
.og-word{position:absolute;left:50%;top:50%;margin:0;max-width:90%;overflow:hidden;text-overflow:ellipsis;font-size:clamp(18px,4.6cqi,34px);font-weight:600;letter-spacing:-0.03em;line-height:1;white-space:nowrap;pointer-events:none;opacity:0;transform:translate(-50%,-50%);will-change:opacity,transform,filter}
.og-mark{position:absolute;margin:0;max-width:calc(100% - 48px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600;letter-spacing:-0.01em;line-height:1;pointer-events:none;opacity:0;transform:translateY(6px);transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.og-mark[data-pos=bottom-left]{left:clamp(16px,3cqi,24px);bottom:clamp(16px,3cqi,24px)}
.og-mark[data-pos=top-right]{right:clamp(16px,3cqi,24px);top:clamp(16px,3cqi,24px)}
.og-mark[data-show]{opacity:.92;transform:none}
.og-links{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;list-style:none}
.og-blur{position:absolute;top:0;bottom:0;width:clamp(40px,13%,170px);pointer-events:none}
.og-blur[data-side=l]{left:0;--og-d:to right}
.og-blur[data-side=r]{right:0;--og-d:to left}
.og-blur i{position:absolute;inset:0;-webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px);transition:-webkit-backdrop-filter .9s cubic-bezier(.22,1,.36,1),backdrop-filter .9s cubic-bezier(.22,1,.36,1)}
.og-blur i:nth-child(1){-webkit-mask-image:linear-gradient(var(--og-d),#000 0%,#000 45%,transparent 100%);mask-image:linear-gradient(var(--og-d),#000 0%,#000 45%,transparent 100%)}
.og-blur i:nth-child(2){-webkit-mask-image:linear-gradient(var(--og-d),#000 0%,#000 22%,transparent 65%);mask-image:linear-gradient(var(--og-d),#000 0%,#000 22%,transparent 65%)}
.og-blur i:nth-child(3){-webkit-mask-image:linear-gradient(var(--og-d),#000 0%,transparent 38%);mask-image:linear-gradient(var(--og-d),#000 0%,transparent 38%)}
.og-root[data-strip] .og-blur i:nth-child(1){-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px)}
.og-root[data-strip] .og-blur i:nth-child(2){-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.og-root[data-strip] .og-blur i:nth-child(3){-webkit-backdrop-filter:blur(9px);backdrop-filter:blur(9px)}
@media (prefers-reduced-motion:reduce){.og-mark,.og-blur i{transition:none}}
`;

type Bitmap = { el: HTMLCanvasElement | HTMLImageElement; w: number; h: number } | null;

export function OrreryGallery({
  images,
  brand = "Impeccable",
  markPosition = "bottom-left",
  intro = true,
  bend = 0.32,
  radius = 10,
  height = 520,
  className,
  style,
  "aria-label": ariaLabel = "Gallery",
}: OrreryGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordRef = useRef<HTMLParagraphElement>(null);
  const markRef = useRef<HTMLParagraphElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // The newest props, read by the running loop without restarting it.
  const safeBend = Number.isFinite(bend) ? clamp(bend, 0, 0.6) : 0.32;
  const safeRadius = Number.isFinite(radius) ? Math.max(0, radius) : 10;
  const live = useRef({ images, bend: safeBend, radius: safeRadius });
  live.current = { images, bend: safeBend, radius: safeRadius };
  const api = useRef<{ goTo: (i: number, ring: boolean) => void; step: (d: number) => void; blur: () => void } | null>(null);

  const srcKey = images.map((i) => i.src).join("\n");

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;
    const word = wordRef.current;
    const mark = markRef.current;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const playIntro = intro && !reduce.matches;

    /* ---------- Pictures ---------- */
    const list = live.current.images;
    const n = list.length;
    const raw: (HTMLImageElement | null)[] = list.map(() => null);
    const bmp: Bitmap[] = list.map(() => null);
    let loaded = 0;
    let readyAt = -1;
    const onPicture = () => {
      loaded++;
      prescale();
      kick();
    };
    list.forEach((item, i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        raw[i] = img;
        onPicture();
      };
      img.onerror = () => onPicture(); // a broken picture keeps its soft placeholder
      img.src = item.src;
    });

    /* ---------- Layout ---------- */
    let w = 0, h = 0, dpr = 1;
    let cx = 0, cy = 0, step = 1, W = 1, G = 6, H = 1, D = 40, R0 = 100, N = 1, L = 1;
    const layout = () => {
      const r = root.getBoundingClientRect();
      const oldStep = step;
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      dpr = Math.min(DPR_MAX, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cx = w / 2;
      cy = h / 2;
      const visible = w < 480 ? 1.32 : w < 900 ? 2.4 : 3.2;
      step = w / visible;
      G = Math.max(6, Math.round(step * 0.025));
      W = step - G;
      // Tall enough to fill the box, short enough that the curved ends clear the corner mark.
      H = Math.max(24, Math.min(W * 0.8, h * 0.56, (h - 80) / (1 + live.current.bend)));
      D = clamp(Math.min(w, h) * 0.14, 40, 110) * Math.sqrt(Math.min(1, 10 / Math.max(1, n)));
      // The ring keeps its front pictures inside the box on any screen.
      R0 = Math.max(D, Math.min(w / 2 - D * 0.8, (h / 2 - D * 0.8) / TILT, h * 0.36));
      // Enough copies of the list that the loop never shows its seam.
      const copies = n ? Math.max(1, Math.ceil((w + 4 * step) / (n * step))) : 1;
      N = Math.max(1, n * copies);
      L = N * step;
      if (oldStep > 1) {
        offset *= step / oldStep;
        target *= step / oldStep;
      }
    };

    /** Each picture cropped once to the strip's shape and sized to the screen, so drawing stays light. */
    const prescale = () => {
      for (let i = 0; i < n; i++) {
        const img = raw[i];
        if (!img || !img.naturalWidth) continue;
        const aspect = W / H;
        const iw = img.naturalWidth, ih = img.naturalHeight;
        let sw = iw, sh = iw / aspect;
        if (sh > ih) {
          sh = ih;
          sw = ih * aspect;
        }
        const bw = Math.max(1, Math.round(Math.min(sw, W * dpr * 1.15)));
        const bh = Math.max(1, Math.round(bw / aspect));
        try {
          const c = document.createElement("canvas");
          c.width = bw;
          c.height = bh;
          const x = c.getContext("2d");
          if (!x) throw new Error("no 2d");
          x.imageSmoothingQuality = "high";
          x.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, bw, bh);
          bmp[i] = { el: c, w: bw, h: bh };
        } catch {
          bmp[i] = { el: img, w: iw, h: ih };
        }
      }
    };

    /* ---------- State ---------- */
    let started = !playIntro; // intro waits until it is in view
    let t = playIntro ? 0 : 1e9; // intro clock, ms
    let speed = 1;
    let rot = 0; // orbit angle
    let offset = 0; // strip scroll, px
    let target = 0;
    let sv = 0; // snap spring velocity
    let mode: "free" | "spring" = "spring";
    let vMeas = 0; // measured strip speed, px/s
    let prevOffset = 0;
    let sq = 0, sqv = 0; // squeeze spring
    let lean = 0, leanv = 0;
    let warp = playIntro ? 0 : 1, warpv = 0;
    let lift: number[] = [];
    let hoverJ = -1;
    let ringJ = -1; // keyboard focus ring
    let fg = "currentColor";
    let raf = 0;
    let last = 0;
    let visibleNow = true;
    let wheelTimer = 0;
    let markShown = false;
    let stripShown = false;

    // Pseudo-random but stable tilt and nudge for each picture in the stack.
    const jit = list.map((_, i) => {
      const a = Math.sin((i + 1) * 12.9898) * 43758.5453;
      const b = Math.sin((i + 1) * 78.233) * 12543.123;
      const fa = a - Math.floor(a), fb = b - Math.floor(b);
      return { r: (fa - 0.5) * 0.42, x: (fb - 0.5) * 0.34, y: (fa * 7.3 - Math.floor(fa * 7.3) - 0.5) * 0.24 };
    });

    const discEnd = DISC_START + Math.max(0, n - 1) * DISC_STAGGER + DISC_POP;
    const T_MERGE = discEnd + ORBIT_HOLD;
    const T_STACK = T_MERGE + MERGE_MS;
    const T_UNFURL = T_STACK + STACK_MS;
    const unfurlSlots = () => Math.ceil((w / 2 + W) / step);
    const T_DONE = () => T_UNFURL + UNFURL_MS + unfurlSlots() * UNFURL_STAGGER + 80;

    const readColor = () => {
      fg = getComputedStyle(root).color || "currentColor";
    };

    /* ---------- Drawing ---------- */
    /**
     * Height of the strip at screen x, as a share of H. The curve is shortest in the middle.
     * Dragging acts like a rubber band held at both edges of the box: the ends keep their
     * height and only the middle is pinched in (sq < 0) or pushed out (sq > 0), its belly
     * leaning a little with the movement.
     */
    const curve = (x: number) => {
      const u = (x - cx) / (w / 2);
      const ub = clamp(u, -1.25, 1.25);
      const uc = clamp(u, -1, 1);
      const belly = (1 - uc * uc) * (1 + lean * uc);
      return 1 + live.current.bend * ub * ub + sq * belly;
    };

    const panelPath = (lx0: number, pw: number, r: number, top: (x: number) => number, bot: (x: number) => number, colStep: number) => {
      // Rounded corners follow the warped edges: corners by angle, the middle by columns.
      const rr = Math.min(r, pw / 2);
      const pts: [number, number][] = [];
      const K = 8;
      for (let k = 0; k <= K; k++) {
        const a = (Math.PI / 2) * (k / K);
        const x = lx0 + rr - rr * Math.cos(a);
        pts.push([x, top(x) + rr - rr * Math.sin(a)]);
      }
      for (let x = lx0 + rr + colStep; x < lx0 + pw - rr; x += colStep) pts.push([x, top(x)]);
      for (let k = K; k >= 0; k--) {
        const a = (Math.PI / 2) * (k / K);
        const x = lx0 + pw - rr + rr * Math.cos(a);
        pts.push([x, top(x) + rr - rr * Math.sin(a)]);
      }
      for (let k = 0; k <= K; k++) {
        const a = (Math.PI / 2) * (k / K);
        const x = lx0 + pw - rr + rr * Math.cos(a);
        pts.push([x, bot(x) - rr + rr * Math.sin(a)]);
      }
      for (let x = lx0 + pw - rr - colStep; x > lx0 + rr; x -= colStep) pts.push([x, bot(x)]);
      for (let k = K; k >= 0; k--) {
        const a = (Math.PI / 2) * (k / K);
        const x = lx0 + rr - rr * Math.cos(a);
        pts.push([x, bot(x) - rr + rr * Math.sin(a)]);
      }
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    };

    /**
     * One picture. (px, py) is its middle on screen, pw x ph its size before the curve,
     * r its corners, a its tilt, k how much the strip's curve shapes it (0 = flat).
     */
    const drawPanel = (i: number, px: number, py: number, pw: number, ph: number, r: number, a: number, k: number, alpha: number, extra = 1, ring = false) => {
      if (pw < 0.5 || ph < 0.5 || alpha <= 0.002) return;
      const colStep = pw > 140 ? 3 : 2;
      const hAt = (lx: number) => ph * extra * (k < 0.002 ? 1 : lerp(1, curve(px + lx), k));
      const top = (lx: number) => -hAt(lx) / 2;
      const bot = (lx: number) => hAt(lx) / 2;
      r = Math.min(r, pw / 2, (ph * extra) / 2); // never more than a full round end
      ctx.save();
      ctx.translate(px, py);
      if (a) ctx.rotate(a);
      ctx.globalAlpha = alpha;
      panelPath(-pw / 2, pw, r, top, bot, colStep);
      ctx.save();
      ctx.clip();
      const b = bmp[i];
      if (!b) {
        ctx.fillStyle = fg;
        ctx.globalAlpha = alpha * 0.08;
        ctx.fillRect(-pw / 2 - 1, -hAt(0) * 2, pw + 2, hAt(0) * 4);
      } else {
        // Crop the middle of the picture to this panel's current shape.
        const asp = pw / ph;
        let sw = b.w, sh = b.w / asp;
        if (sh > b.h) {
          sh = b.h;
          sw = b.h * asp;
        }
        const sx = (b.w - sw) / 2, sy = (b.h - sh) / 2;
        if (k < 0.002) {
          ctx.drawImage(b.el, sx, sy, sw, sh, -pw / 2, -ph * extra / 2, pw, ph * extra);
        } else {
          // Thin columns, each stretched to the curve's height there.
          const cols = Math.ceil(pw / colStep);
          const cw = pw / cols;
          for (let c = 0; c < cols; c++) {
            const lx = -pw / 2 + c * cw;
            const hh = hAt(lx + cw / 2);
            const s0 = sx + (c / cols) * sw;
            const s1 = Math.min(sw / cols + 0.0001, b.w - s0);
            ctx.drawImage(b.el, s0, sy, s1, sh, lx, -hh / 2 - 1, cw + 0.6, hh + 2); // 1px over the clip, so no seams
          }
        }
      }
      ctx.restore();
      if (ring) {
        ctx.globalAlpha = 1;
        panelPath(-pw / 2 - 4, pw + 8, r + 4, (lx) => top(clamp(lx, -pw / 2, pw / 2)) - 4, (lx) => bot(clamp(lx, -pw / 2, pw / 2)) + 4, colStep * 2);
        ctx.strokeStyle = fg;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    };

    /** Where slot j sits on screen, wrapped round the loop. */
    const slotX = (j: number) => cx + (mod(j * step - offset + L / 2, L) - L / 2);

    const drawOrbit = () => {
      const merging = t >= T_MERGE;
      const q = merging ? clamp01((t - T_MERGE) / MERGE_MS) : 0;
      const fall = Math.pow(q, 2.2); // falls in faster and faster, like gravity
      const R = R0 * (1 - fall);
      const order = list.map((_, i) => i);
      const pos = order.map((i) => {
        const ang = (i / n) * Math.PI * 2 - Math.PI / 2 + rot;
        const depth = Math.sin(ang);
        const pop = clamp01((t - DISC_START - i * DISC_STAGGER) / DISC_POP);
        const sc = BACK_OUT(pop) * (1 + DEPTH * depth * (1 - fall));
        const jx = jit[i].x * D * fall, jy = jit[i].y * D * fall;
        return {
          i,
          x: cx + Math.cos(ang) * R + jx,
          y: cy + Math.sin(ang) * R * TILT + jy,
          s: D * sc,
          a: jit[i].r * fall,
          alpha: clamp01(pop * 2.2),
          z: merging ? i : depth,
        };
      });
      // Back to front: during the orbit by depth, in the stack picture 0 lands on top.
      pos.sort((p1, p2) => (merging ? (p1.i === 0 ? 1 : p2.i === 0 ? -1 : p1.z - p2.z) : p1.z - p2.z));
      for (const p of pos) drawPanel(p.i, p.x, p.y, p.s, p.s, p.s / 2, p.a, 0, p.alpha);
      if (word) {
        const wIn = EASE_OUT(clamp01(t / WORD_IN));
        const wOut = EASE_OUT(clamp01((q - 0.25) / 0.6));
        word.style.opacity = String(wIn * (1 - wOut));
        word.style.transform = `translate(-50%,-50%) scale(${(0.94 + 0.06 * wIn) * (1 - 0.18 * wOut)})`;
        word.style.filter = `blur(${(1 - wIn) * 6 + wOut * 4}px)`;
      }
    };

    const drawStack = () => {
      // The stack lands with a small squash, then grows a little.
      const st = t - T_STACK;
      const grow = EASE_OUT(clamp01(st / STACK_MS));
      const squash = 1 + 0.1 * Math.exp(-st / 110) * Math.sin((st / 240) * Math.PI * 2);
      const s = D * (1 + 0.35 * grow) * squash;
      // The circles square off into a loose deck as they land.
      const corner = lerp(s / 2, s * STACK_CORNER, grow);
      for (let i = 1; i <= n; i++) {
        const k = i % n; // picture 0 last, on top
        drawPanel(k, cx + jit[k].x * D, cy + jit[k].y * D, s, s, corner, jit[k].r, 0, 1);
      }
      if (word) word.style.opacity = "0";
    };

    const drawUnfurl = () => {
      const st = t - T_UNFURL;
      const m = unfurlSlots();
      const Ds = D * 1.35;
      const r = live.current.radius;
      const slots: number[] = [];
      for (let k = -m; k <= m; k++) slots.push(k);
      // Far slots first, the middle one last (it is the top of the stack).
      slots.sort((a, b) => Math.abs(b) - Math.abs(a));
      for (const k of slots) {
        const j = mod(k + Math.round(offset / step), N);
        const img = j % n;
        const delay = Math.abs(k) * UNFURL_STAGGER;
        const p = clamp01((st - delay) / UNFURL_MS);
        const pe = EASE_EXPO(p);
        const ph = EASE_OUT(clamp01((st - delay - 70) / UNFURL_MS)); // height follows the width a beat later
        const pr = EASE_OUT(clamp01(p * 1.6)); // the circle turns into a card early
        const tx = slotX(j);
        const pw = lerp(Ds, W, pe);
        const hh = lerp(Ds, H, ph);
        const x = lerp(cx + jit[img].x * D, tx, pe);
        const y = lerp(cy + jit[img].y * D, cy, pe);
        drawPanel(img, x, y, pw, hh, lerp(Ds * STACK_CORNER, r, pr), jit[img].r * (1 - pe), warp, 1);
      }
    };

    const drawStrip = () => {
      const r = live.current.radius;
      for (let j = 0; j < N; j++) {
        const x = slotX(j);
        if (x < -W || x > w + W) continue;
        drawPanel(j % n, x, cy, W, H, r, 0, warp, 1, 1 + LIFT * (lift[j] || 0), j === ringJ);
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (!n) return;
      if (!started) return;
      if (t < T_STACK) drawOrbit();
      else if (t < T_UNFURL) drawStack();
      else if (t < T_DONE()) drawUnfurl();
      else drawStrip();
    };

    /* ---------- Motion ---------- */
    const springStep = (x: number, v: number, to: number, k: number, c: number, dt: number) => {
      const a = k * (to - x) - c * v;
      v += a * dt;
      x += v * dt;
      return [x, v] as const;
    };

    const settled = () =>
      t >= T_DONE() &&
      !dragging &&
      mode === "spring" &&
      Math.abs(target - offset) < 0.05 &&
      Math.abs(sv) < 0.5 &&
      Math.abs(sq) < 1e-4 &&
      Math.abs(sqv) < 1e-3 &&
      Math.abs(lean) < 1e-4 &&
      Math.abs(leanv) < 1e-3 &&
      Math.abs(warp - 1) < 1e-4 &&
      Math.abs(warpv) < 1e-3 &&
      lift.every((v, j) => Math.abs(v - (j === hoverJ ? 1 : 0)) < 1e-3);

    const frame = (now: number) => {
      raf = 0;
      // Real elapsed time (up to 0.1s, so a slow phone keeps the timing); springs step in small slices.
      // Two frames can share a timestamp (0s apart); a floor keeps every speed a real number.
      const dt = clamp(last ? (now - last) / 1000 : 1 / 60, 0.001, 0.1);
      last = now;
      const subs = Math.max(1, Math.ceil(dt * 120));
      const sdt = dt / subs;

      if (started && n) {
        const before = t;
        if (t < 1e8) {
          const ready = loaded >= n || (readyAt >= 0 && now - readyAt > 1200);
          if (ready) t += dt * 1000 * speed;
          if (t >= T_DONE() && before < T_DONE()) {
            t = 1e9;
            if (word) word.style.opacity = "0";
          }
        }
        // Orbit spin: faster as the orbit shrinks, like a skater pulling in their arms.
        if (t < T_STACK) {
          const q = t >= T_MERGE ? clamp01((t - T_MERGE) / MERGE_MS) : 0;
          const r = Math.max(0.12, 1 - Math.pow(q, 2.2));
          rot += Math.min(SPIN_MAX, SPIN / (r * r)) * dt * speed;
        }
        if (t >= T_UNFURL + 200 || t > 1e8) for (let k = 0; k < subs; k++) [warp, warpv] = springStep(warp, warpv, 1, WARP_K, WARP_C, sdt);
        if (!stripShown && t >= T_UNFURL) {
          stripShown = true;
          root.setAttribute("data-strip", ""); // the soft blur at both sides fades in
        }
        if (!markShown && (t >= T_UNFURL + UNFURL_MS * 0.6 || t > 1e8) && mark) {
          markShown = true;
          mark.setAttribute("data-show", "");
        }
      }

      // Strip scroll.
      if (mode === "spring" && !dragging) for (let k = 0; k < subs; k++) [offset, sv] = springStep(offset, sv, target, SNAP_K, SNAP_C, sdt);
      const v = (offset - prevOffset) / dt;
      prevOffset = offset;
      vMeas += (v - vMeas) * Math.min(1, dt * 14);
      if (!Number.isFinite(vMeas)) vMeas = 0;

      // Squeeze and lean follow the speed. Leftward squeezes, rightward stretches a little.
      const still = reduce.matches;
      const vn = still ? 0 : vMeas / 1000; // thousands of px a second, so it feels the same on any screen
      const sqTo = vn > 0 ? -Math.min(SQUEEZE_MAX, vn * 0.17) : Math.min(STRETCH_MAX, -vn * 0.1);
      for (let k = 0; k < subs; k++) {
        [sq, sqv] = springStep(sq, sqv, sqTo, SQUEEZE_K, SQUEEZE_C, sdt);
        [lean, leanv] = springStep(lean, leanv, clamp(-vn * 0.35, -0.5, 0.5), LEAN_K, LEAN_C, sdt);
      }
      if (still || !Number.isFinite(sq + sqv + lean + leanv)) {
        sq = sqv = lean = leanv = 0;
      }
      for (let j = 0; j < N; j++) {
        const to = j === hoverJ && !dragging ? 1 : 0;
        lift[j] = (lift[j] || 0) + (to - (lift[j] || 0)) * (1 - Math.exp(-dt * 14));
      }

      draw();
      if (visibleNow && started && n && !settled()) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const kick = () => {
      if (!n && word) word.style.opacity = "1"; // no pictures yet: just the name
      if (!raf && visibleNow && started && n) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    /* ---------- Input ---------- */
    let dragging = false;
    let pressed = false;
    let pid = -1;
    let sx0 = 0, sy0 = 0, off0 = 0;
    let samples: { x: number; t: number }[] = [];

    const inIntro = () => started && t < 1e8;
    const skipIntro = () => {
      if (inIntro()) speed = SKIP_SPEED;
    };

    const hit = (x: number, y: number) => {
      if (t < 1e8 || !n) return -1;
      for (let j = 0; j < N; j++) {
        const px = slotX(j);
        if (Math.abs(x - px) > W / 2) continue;
        const hh = H * (1 + LIFT * (lift[j] || 0)) * lerp(1, curve(x), warp);
        if (Math.abs(y - cy) <= hh / 2) return j;
        return -1;
      }
      return -1;
    };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !e.isPrimary) return;
      visibleNow = true; // a person pressing it can see it
      if (!started) {
        started = true;
        readyAt = performance.now();
      }
      readColor();
      if (inIntro()) {
        skipIntro();
        kick();
        return;
      }
      pressed = true;
      pid = e.pointerId;
      sx0 = e.clientX;
      sy0 = e.clientY;
      off0 = offset;
      samples = [{ x: e.clientX, t: e.timeStamp }];
      ringJ = -1;
    };

    const onMove = (e: PointerEvent) => {
      if (pressed && e.pointerId === pid) {
        const dx = e.clientX - sx0, dy = e.clientY - sy0;
        if (!dragging) {
          if (Math.abs(dy) > DRAG_START && Math.abs(dy) > Math.abs(dx) && e.pointerType !== "mouse") {
            pressed = false; // a vertical swipe scrolls the page
            return;
          }
          if (Math.hypot(dx, dy) > DRAG_START) {
            dragging = true;
            mode = "free";
            root.setAttribute("data-drag", "");
            root.removeAttribute("data-hover");
            try {
              canvas.setPointerCapture(pid);
            } catch {}
          }
        }
        if (dragging) {
          offset = off0 - dx;
          samples.push({ x: e.clientX, t: e.timeStamp });
          if (samples.length > 8) samples.shift();
          kick();
        }
        return;
      }
      if (e.pointerType === "mouse" && !dragging && e.target === canvas) {
        const [x, y] = local(e);
        const j = hit(x, y);
        const linkable = j >= 0 && !!safeHref(live.current.images[j % n]?.href);
        if (j !== hoverJ) {
          hoverJ = j;
          kick();
        }
        if (linkable) root.setAttribute("data-hover", "");
        else root.removeAttribute("data-hover");
      }
    };

    const release = (e: PointerEvent, cancel: boolean) => {
      if (!pressed || e.pointerId !== pid) return;
      pressed = false;
      if (dragging) {
        dragging = false;
        root.removeAttribute("data-drag");
        // Flick speed from the last 100ms of the drag.
        const now = e.timeStamp;
        const recent = samples.filter((s) => now - s.t < 100);
        let rv = 0;
        if (recent.length > 1) {
          const a = recent[0], b = recent[recent.length - 1];
          rv = -((b.x - a.x) / Math.max(16, b.t - a.t)) * 1000;
        }
        rv = clamp(rv, -6000, 6000);
        sv = rv;
        target = Math.round((offset + rv * MOMENTUM) / step) * step;
        mode = "spring";
        kick();
        return;
      }
      if (cancel) return;
      // A tap or click, not a drag: open that picture's link.
      const [x, y] = local(e);
      const j = hit(x, y);
      if (j < 0) return;
      const a = linkRefs.current[j % n];
      if (a) a.click();
    };
    const onUp = (e: PointerEvent) => release(e, false);
    const onCancel = (e: PointerEvent) => release(e, true);
    const onLeave = () => {
      if (hoverJ !== -1) {
        hoverJ = -1;
        root.removeAttribute("data-hover");
        kick();
      }
    };

    const onWheel = (e: WheelEvent) => {
      const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
      if (Math.abs(dx) <= Math.abs(e.deltaY) && !e.shiftKey) return; // vertical scroll stays with the page
      e.preventDefault(); // also stops the browser's swipe-back
      visibleNow = true;
      if (inIntro()) {
        skipIntro();
        kick();
        return;
      }
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? w : 1;
      mode = "free";
      offset += dx * unit;
      ringJ = -1;
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        sv = vMeas;
        target = Math.round(offset / step) * step;
        mode = "spring";
        kick();
      }, 140);
      kick();
    };

    /* ---------- Keyboard (called from the links and the region) ---------- */
    api.current = {
      goTo: (i, ring) => {
        if (!n) return;
        if (inIntro()) speed = SKIP_SPEED;
        const c = Math.round(target / step);
        // The nearest slot that shows picture i.
        let best = c, bestD = Infinity;
        for (let k = c - n; k <= c + n; k++) {
          if (mod(k, n) === i && Math.abs(k - c) < bestD) {
            best = k;
            bestD = Math.abs(k - c);
          }
        }
        target = best * step;
        mode = "spring";
        ringJ = ring ? mod(best, N) : -1;
        readColor();
        kick();
      },
      blur: () => {
        ringJ = -1;
        kick();
      },
      step: (d) => {
        if (!n) return;
        const k = Math.round(target / step) + d;
        target = k * step;
        mode = "spring";
        ringJ = -1;
        kick();
        // Move keyboard focus to the picture now in the middle.
        const a = linkRefs.current[mod(k, n)];
        if (a && root.contains(document.activeElement)) a.focus({ preventScroll: true });
      },
    };

    /* ---------- Wiring ---------- */
    layout();
    readColor();
    const ro = new ResizeObserver(() => {
      layout();
      prescale();
      draw(); // resizing clears a canvas, so redraw at once, even when paused
      kick();
    });
    ro.observe(root);
    const io = new IntersectionObserver(
      (entries) => {
        const en = entries[entries.length - 1];
        visibleNow = en.isIntersecting;
        if (en.intersectionRatio >= 0.35 && !started) {
          started = true;
          readyAt = performance.now();
        }
        if (visibleNow) kick();
      },
      { threshold: [0, 0.01, 0.35, 1] },
    );
    io.observe(root);
    const onReduce = () => {
      if (reduce.matches && inIntro()) speed = 50;
      kick();
    };
    reduce.addEventListener?.("change", onReduce);
    const theme = new MutationObserver(() => {
      readColor();
      kick();
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    kick();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(wheelTimer);
      ro.disconnect();
      io.disconnect();
      theme.disconnect();
      reduce.removeEventListener?.("change", onReduce);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("wheel", onWheel);
      raw.forEach((img) => img && (img.onload = img.onerror = null));
      root.removeAttribute("data-strip");
      mark?.removeAttribute("data-show");
      api.current = null;
      lift = [];
    };
    // Restart only when the pictures themselves or the intro setting change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcKey, intro]);

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      api.current?.step(e.key === "ArrowRight" ? 1 : -1);
    }
  };

  const anyLink = images.some((i) => safeHref(i.href));

  return (
    <div
      ref={rootRef}
      className={["og-root", className].filter(Boolean).join(" ")}
      style={{ height, ...style }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={anyLink ? undefined : 0}
      onKeyDown={onKeyDown}
    >
      <style>{CSS}</style>
      <canvas ref={canvasRef} aria-hidden="true" />
      {/* Soft blur at both sides, strongest at the edge, so pictures seem to drift out of focus. */}
      <div className="og-blur" data-side="l" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="og-blur" data-side="r" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <p ref={wordRef} className="og-word" aria-hidden="true">
        {brand}
      </p>
      <p ref={markRef} className="og-mark" data-pos={markPosition}>
        {brand}
      </p>
      <ul className="og-links">
        {images.map((img, i) => {
          const href = safeHref(img.href);
          return (
            <li key={i}>
              {href ? (
                <a
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  href={href}
                  target={img.newTab ? "_blank" : undefined}
                  rel={img.newTab ? "noopener noreferrer" : undefined}
                  onFocus={(e) => api.current?.goTo(i, e.currentTarget.matches(":focus-visible"))}
                  onBlur={() => api.current?.blur()}
                >
                  {img.alt}
                </a>
              ) : (
                <span
                  ref={() => {
                    linkRefs.current[i] = null;
                  }}
                >
                  {img.alt}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default OrreryGallery;
