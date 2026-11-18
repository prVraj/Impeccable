"use client";

/**
 * Kitcut button, from Impeccable.
 *
 * A solid brand button that cracks open while it works. On click a jagged
 * zigzag crack runs down its middle with a short crack sound, then the two
 * halves pull apart. The label splits with them and goes a little soft, and
 * three small dots wait in the gap. When the work is done the halves snap back
 * together, the seam flashes, a few small sparks fly out and the label says
 * "WooHoo" for a moment, then the button eases back to how it started.
 *
 * Give it `loading`, or let `onClick` return a promise: the button stays open
 * until the promise settles (a promise that rejects closes it without the
 * success state). While it is open, clicks are ignored so nothing is sent twice.
 *
 * No packages. The crack sound is made in the browser with the Web Audio API,
 * so there is no sound file to download. It plays only after a real click.
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
} from "react";

export type KitcutButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  /** Shows the loading state: the button cracks open and three dots wait in the gap. */
  loading?: boolean;
  /** Runs on click. Return a promise and the button stays open until it settles (when `loading` is not set). */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown;
  /** The fill of the button. Any CSS color, including var(--…). Default: Impeccable violet. */
  color?: string;
  /** The label color. Default: black or white, whichever reads best on the fill. */
  textColor?: string;
  /** The dots in the gap. They sit on your page, not on the button. Default: your text color, half strength. */
  dotColor?: string;
  /** Plays the crack sound when a click opens it. */
  sound?: boolean;
  /** What screen readers hear while it loads. */
  loadingText?: string;
  /** Plays the success state when loading ends. Set it to false when the work failed. A rejected promise never plays it. */
  success?: boolean;
  /** The label shown in the success state. */
  successText?: string;
};

/* ---------- tuning (the design: keep as written) ---------- */

const CRACK_MS = 110; // the crack runs down the middle, then the halves start to part
const SPLIT_MS = 460; // the halves pull apart (fast, then a soft landing with a hair of overshoot)
const MIN_OPEN_MS = 720; // the gap stays open at least this long, so the dots are seen even when the work is instant
const CLOSE_MS = 260; // the halves rush back together (slow, then fast into the snap)
const WIN_HOLD_MS = 1100; // how long "WooHoo" stays
const BACK_MS = 600; // everything eases back to how it started
const GAP = 24; // px each half pulls back from the crack (at most 20% of the width)
const SLIDE = 3; // px each half moves outward as a whole
const SHIFT = 10; // px the split label slides with its half
const BLUR = 1.5; // px, how soft the split label gets (a text shadow, not a filter, so no stray lines show on some screens)
const JAG = 6; // px, how far the zigzag swings left and right at most
const SPARKS = 14; // sparks that fly from the seam on success
const LOUDNESS = 1; // 0 to 1, the crack sound

/** Styles that can't be inline: the surface, the halves, the crack, the swaps, focus, disabled and reduced motion. */
const CSS = `
.kcb { --kcb-f: var(--kcb-fill, rgb(72 29 232)); --kcb-t: var(--kcb-text, var(--kcb-auto, rgb(255 255 255))); --kcb-d: var(--kcb-dot, color-mix(in srgb, currentColor 50%, transparent)); --kcb-r: 8px; position: relative; display: inline-grid; place-items: center; min-width: 0; max-width: 100%; height: 44px; padding: 0 16px; border: 0; border-radius: var(--kcb-r); background: none; font: inherit; font-size: 16px; line-height: 24px; font-weight: 500; letter-spacing: -0.01em; cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; isolation: isolate; user-select: none; -webkit-user-select: none; transition: scale .15s cubic-bezier(.23,1,.32,1); }
.kcb-whole, .kcb-face { position: absolute; inset: 0; border: 1px solid color-mix(in srgb, var(--kcb-f) 70%, black); border-radius: var(--kcb-r); background: linear-gradient(180deg, var(--kcb-f), color-mix(in srgb, var(--kcb-f) 84%, black)); box-shadow: inset 0 1px 0 color-mix(in srgb, white 30%, transparent); }
.kcb-whole, .kcb-face { box-shadow: inset 0 1px 0 color-mix(in srgb, white 30%, transparent), 0 1px 2px color-mix(in srgb, var(--kcb-f) 22%, transparent), 0 3px 6px -2px color-mix(in srgb, var(--kcb-f) 26%, transparent); }
.kcb-whole::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; background: white; opacity: 0; transition: opacity ${BACK_MS}ms cubic-bezier(.45,0,.55,1); }
.kcb-whole::before { content: ""; position: absolute; inset: -1px; border-radius: inherit; background: black; opacity: 0; transition: opacity .15s ease; }
.kcb-half { position: absolute; inset: 0; visibility: hidden; transition: translate ${SPLIT_MS}ms cubic-bezier(.22,1.2,.36,1); }
.kcb-face { display: grid; place-items: center; padding: 0 15px; transition: clip-path ${SPLIT_MS}ms cubic-bezier(.22,1.2,.36,1); }
.kcb-text, .kcb-label, .kcb-win { min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--kcb-t); }
.kcb-text { text-shadow: 0 0 0 transparent; transition: translate ${SPLIT_MS}ms cubic-bezier(.22,1,.36,1), color ${SPLIT_MS}ms cubic-bezier(.22,1,.36,1), text-shadow ${SPLIT_MS}ms cubic-bezier(.22,1,.36,1); }
.kcb-label, .kcb-win { grid-area: 1 / 1; position: relative; z-index: 3; transition: opacity 200ms cubic-bezier(.4,0,1,1), translate 200ms cubic-bezier(.4,0,1,1), filter 200ms cubic-bezier(.4,0,1,1), scale 200ms cubic-bezier(.4,0,1,1); }
.kcb-win { opacity: 0; translate: 0 6px; filter: blur(2px); }
.kcb-crack, .kcb-seam { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.kcb-crack { visibility: hidden; clip-path: inset(0 0 100% 0); }
.kcb-crack i, .kcb-seam i { position: absolute; inset: 0; }
.kcb-crack i:first-child { background: color-mix(in srgb, var(--kcb-f) 35%, black); }
.kcb-crack i:last-child { background: color-mix(in srgb, white 40%, transparent); translate: 1px 0; }
.kcb-seam { opacity: 0; }
.kcb-seam i { background: white; }
.kcb-seam[data-on] { animation: kcb-seam 320ms cubic-bezier(.22,1,.36,1); }
@keyframes kcb-seam { 0% { opacity: .95; } 100% { opacity: 0; } }
.kcb-dots { position: absolute; left: 50%; top: 50%; z-index: 3; display: flex; gap: 4px; translate: -50% -50%; opacity: 0; scale: .6; transition: opacity 120ms ease, scale 120ms ease; pointer-events: none; }
.kcb-dots i { display: block; width: 5px; height: 5px; border-radius: 50%; background: var(--kcb-d); }
.kcb-sparks { position: absolute; left: 50%; top: 50%; z-index: 4; width: 0; height: 0; pointer-events: none; }
.kcb-sparks i { position: absolute; left: 0; top: 0; border-radius: 99px; }
.kcb-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.kcb:not([data-phase="idle"]):not([data-phase="win"]):not([data-phase="back"]) .kcb-whole { visibility: hidden; }
.kcb:not([data-phase="idle"]):not([data-phase="win"]):not([data-phase="back"]) .kcb-half { visibility: visible; }
.kcb:not([data-phase="idle"]):not([data-phase="win"]):not([data-phase="back"]) .kcb-label { visibility: hidden; transition: none; }
.kcb[data-phase="crack"] { animation: kcb-knock 240ms cubic-bezier(.22,1,.36,1); }
@keyframes kcb-knock { 0% { scale: 1; } 30% { scale: .975; } 100% { scale: 1; } }
.kcb[data-phase="crack"] .kcb-crack { visibility: visible; clip-path: inset(0 0 0 0); transition: clip-path 90ms cubic-bezier(.4,0,.6,1); }
.kcb[data-phase="open"] .kcb-crack { visibility: visible; clip-path: inset(0 0 0 0); opacity: 0; transition: opacity 120ms ease; }
.kcb[data-phase="open"] .kcb-l { translate: -${SLIDE}px 0; }
.kcb[data-phase="open"] .kcb-r { translate: ${SLIDE}px 0; }
.kcb[data-phase="open"] .kcb-text { color: transparent; text-shadow: 0 0 ${BLUR * 2}px color-mix(in srgb, var(--kcb-t) 85%, transparent), 0 0 ${BLUR}px color-mix(in srgb, var(--kcb-t) 45%, transparent); }
.kcb[data-phase="open"] .kcb-l .kcb-text { translate: -${SHIFT}px 0; }
.kcb[data-phase="open"] .kcb-r .kcb-text { translate: ${SHIFT}px 0; }
.kcb[data-phase="open"] .kcb-dots { opacity: 1; scale: 1; transition: opacity 220ms ease ${SPLIT_MS * 0.35}ms, scale 320ms cubic-bezier(.34,1.56,.64,1) ${SPLIT_MS * 0.35}ms; }
.kcb[data-phase="open"] .kcb-dots i { animation: kcb-hop 1s cubic-bezier(.45,0,.55,1) infinite; }
.kcb[data-phase="open"] .kcb-dots i:nth-child(2) { animation-delay: .14s; }
.kcb[data-phase="open"] .kcb-dots i:nth-child(3) { animation-delay: .28s; }
@keyframes kcb-hop { 0%, 64%, 100% { translate: 0 1.5px; } 32% { translate: 0 -2.5px; } }
.kcb[data-phase="close"] .kcb-half, .kcb[data-phase="close"] .kcb-face, .kcb[data-phase="close"] .kcb-text { transition-duration: ${CLOSE_MS}ms; transition-timing-function: cubic-bezier(.55,0,.9,.45); }
.kcb[data-phase="open"], .kcb[data-phase="close"] { cursor: progress; }
.kcb[data-phase="win"] { animation: kcb-bump 420ms cubic-bezier(.22,1,.36,1); }
@keyframes kcb-bump { 0% { scale: 1.035; } 100% { scale: 1; } }
.kcb[data-phase="win"] .kcb-whole::after { opacity: .14; transition: opacity 260ms cubic-bezier(.22,1,.36,1); }
.kcb[data-phase="win"] .kcb-label { opacity: 0; translate: 0 -6px; filter: blur(2px); transition: none; }
.kcb[data-phase="win"] .kcb-win { opacity: 1; translate: 0 0; filter: none; transition: opacity 260ms cubic-bezier(.22,1,.36,1), translate 360ms cubic-bezier(.34,1.56,.64,1), filter 260ms cubic-bezier(.22,1,.36,1); animation: kcb-pop 360ms cubic-bezier(.34,1.56,.64,1); }
@keyframes kcb-pop { 0% { scale: .86; } 100% { scale: 1; } }
.kcb[data-phase="back"] .kcb-win { translate: 0 -6px; }
.kcb[data-phase="back"] .kcb-label { transition-duration: 420ms; transition-delay: 160ms; transition-timing-function: cubic-bezier(.22,1,.36,1); }
@media (hover: hover) and (pointer: fine) {
  .kcb:hover:is([data-phase="idle"], [data-phase="back"]):not(:disabled) .kcb-whole::before { opacity: .1; }
}
.kcb:active:is([data-phase="idle"], [data-phase="back"]):not(:disabled) { scale: .97; }
.kcb:focus-visible { outline: 2px solid color-mix(in srgb, var(--kcb-f) 70%, white); outline-offset: 2px; }
.kcb:disabled { opacity: .5; cursor: not-allowed; }
@supports (corner-shape: squircle) {
  .kcb-whole, .kcb-face { border-radius: calc(var(--kcb-r) * 1.6); corner-shape: squircle; }
}
@media (prefers-reduced-motion: reduce) {
  .kcb, .kcb[data-phase] { animation: none; transition: none; }
  .kcb .kcb-whole { visibility: visible !important; }
  .kcb .kcb-half, .kcb .kcb-crack, .kcb .kcb-seam, .kcb .kcb-sparks { display: none; }
  .kcb .kcb-label { visibility: visible !important; transition: opacity 200ms ease !important; }
  .kcb:is([data-phase="crack"], [data-phase="open"], [data-phase="close"]) .kcb-label { opacity: 0; }
  .kcb .kcb-dots { --kcb-d: var(--kcb-t); scale: 1; transition: opacity 200ms ease; }
  .kcb[data-phase="open"] .kcb-dots { transition: opacity 200ms ease; }
  .kcb[data-phase="open"] .kcb-dots i { animation-name: kcb-blink; }
  .kcb .kcb-win, .kcb .kcb-label { translate: 0 0 !important; filter: none !important; scale: 1 !important; animation: none !important; }
}
@keyframes kcb-blink { 0%, 64%, 100% { opacity: .4; translate: 0 0; } 32% { opacity: 1; translate: 0 0; } }`;

/* ---------- the crack sound ---------- */

let audio: AudioContext | null = null;
let noise: AudioBuffer | null = null;

/** Opens the sound system inside the click itself, because browsers only allow sound that starts from one. */
function unlockAudio() {
  try {
    if (!audio) {
      const AC =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      audio = new AC();
      noise = audio.createBuffer(1, Math.ceil(audio.sampleRate * 0.06), audio.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (audio.state !== "running") audio.resume().catch(() => {});
  } catch {
    audio = null;
  }
}

/** A dry crack: a sharp snap, a low knock under it, and a few tiny splinters right after. */
function playCrack() {
  try {
    const ac = audio;
    if (!ac || !noise) return;
    const t = ac.currentTime + 0.004;
    const out = ac.createGain();
    out.gain.value = LOUDNESS;
    out.connect(ac.destination);

    // The snap: bright noise that dies in about 30ms.
    const snap = ac.createBufferSource();
    snap.buffer = noise;
    const high = ac.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 1600;
    const snapGain = ac.createGain();
    snapGain.gain.setValueAtTime(0.9, t);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.032);
    snap.connect(high).connect(snapGain).connect(out);
    snap.start(t);
    snap.stop(t + 0.04);

    // The knock: a short low thud, so it sounds like something solid broke.
    const knock = ac.createOscillator();
    knock.type = "sine";
    knock.frequency.setValueAtTime(210, t);
    knock.frequency.exponentialRampToValueAtTime(70, t + 0.09);
    const knockGain = ac.createGain();
    knockGain.gain.setValueAtTime(0.0001, t);
    knockGain.gain.exponentialRampToValueAtTime(0.5, t + 0.003);
    knockGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    knock.connect(knockGain).connect(out);
    knock.start(t);
    knock.stop(t + 0.13);
    knock.onended = () => out.disconnect();

    // Splinters: four tiny ticks, each a little later and quieter.
    [
      [0.014, 0.5],
      [0.029, 0.36],
      [0.044, 0.26],
      [0.066, 0.16],
    ].forEach(([at, level]) => {
      const tick = ac.createBufferSource();
      tick.buffer = noise;
      const band = ac.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 2200 + Math.random() * 3000;
      band.Q.value = 1.2;
      const g = ac.createGain();
      g.gain.setValueAtTime(level, t + at);
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.007);
      tick.connect(band).connect(g).connect(out);
      tick.start(t + at, Math.random() * 0.04);
      tick.stop(t + at + 0.01);
    });
  } catch {
    // No sound support: the button still works.
  }
}

/* ---------- small helpers ---------- */

type Zig = [number, number][]; // [px left or right of the middle, % from the top]

/** The crack before any click: fixed, so the server and the browser draw the same thing. */
const FIRST_ZIG: Zig = [
  [1, 0],
  [-4, 22],
  [4, 41],
  [-3, 60],
  [5, 79],
  [-1, 100],
];

/** A new jagged crack for each click: it swings left and right, never the same twice. */
function newZig(): Zig {
  const ys = [0, 18 + Math.random() * 8, 38 + Math.random() * 6, 56 + Math.random() * 8, 76 + Math.random() * 6, 100];
  const dir = Math.random() < 0.5 ? -1 : 1;
  return ys.map((y, i) => [i === 0 || i === ys.length - 1 ? (Math.random() * 2 - 1) * 2 : dir * (i % 2 ? 1 : -1) * (JAG * 0.5 + Math.random() * JAG * 0.5), y]);
}

const at = (x: number, y: number, open: boolean, side: -1 | 1) =>
  `calc(50% + ${x.toFixed(2)}px${open ? ` ${side < 0 ? "-" : "+"} min(${GAP}px, 20%)` : ""}) ${y.toFixed(1)}%`;

/** The left or right half: everything on one side of the crack, pulled back from it when open. */
function halfPath(zig: Zig, side: -1 | 1, open: boolean) {
  const pts = zig.map(([x, y]) => at(x, y, open, side));
  // The crack runs straight on past the top and bottom, so the halves keep their shadow below them.
  const edge = [pts[0].replace(/ [\d.]+%$/, " -12px"), ...pts, pts[pts.length - 1].replace(/ [\d.]+%$/, " calc(100% + 12px)")].join(", ");
  return side < 0
    ? `polygon(-12px -12px, ${edge}, -12px calc(100% + 12px))`
    : `polygon(${edge}, calc(100% + 12px) calc(100% + 12px), calc(100% + 12px) -12px)`;
}

/** The crack line itself: a thin zigzag band, `w` px wide. */
function linePath(zig: Zig, w: number) {
  const down = zig.map(([x, y]) => `calc(50% + ${(x - w / 2).toFixed(2)}px) ${y.toFixed(1)}%`);
  const up = [...zig].reverse().map(([x, y]) => `calc(50% + ${(x + w / 2).toFixed(2)}px) ${y.toFixed(1)}%`);
  return `polygon(${[...down, ...up].join(", ")})`;
}

/** Any CSS color as [r, g, b], worked out by painting it, so every color format works. */
let probe: CanvasRenderingContext2D | null = null;
function rgbOf(color: string): [number, number, number] {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return [72, 29, 232];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}
const isLight = ([r, g, b]: [number, number, number]) => {
  const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.4;
};

type Phase = "idle" | "crack" | "open" | "close" | "win" | "back";

/* ---------- the button ---------- */

export const KitcutButton = forwardRef<HTMLButtonElement, KitcutButtonProps>(function KitcutButton(
  {
    loading,
    onClick,
    color,
    textColor,
    dotColor,
    sound = true,
    loadingText = "Loading",
    success = true,
    successText = "WooHoo",
    type = "button",
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const tintRef = useRef<HTMLSpanElement>(null);
  const sparksRef = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => btnRef.current!, []);

  // Loading from a returned promise, used only when `loading` is not set.
  const [own, setOwn] = useState(false);
  const busy = !!(loading ?? own) && !rest.disabled;
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  const [phase, setPhase] = useState<Phase>("idle");
  const [zig, setZig] = useState<Zig>(FIRST_ZIG);
  const [seam, setSeam] = useState(0); // counts snaps, so the seam flash plays again each time

  // What the timers read without going stale.
  const now = useRef({ phase: "idle" as Phase, busy: false, win: true, sound: true, ok: true, clickAt: -1e9, openAt: 0 });
  now.current.busy = busy;
  now.current.win = success;
  now.current.sound = sound;
  const timer = useRef(0);
  const ctl = useRef<{ split: () => void; check: () => void } | null>(null);

  useEffect(() => {
    const s = now.current;
    const go = (p: Phase) => {
      s.phase = p;
      setPhase(p);
    };
    const after = (ms: number, fn: () => void) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(fn, Math.max(0, ms));
    };
    const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Sparks: small bits of the button's color fly out of the seam and fade. */
    const burst = () => {
      const box = sparksRef.current, btn = btnRef.current;
      if (!box || !btn || reduced() || typeof box.animate !== "function") return;
      const w = btn.offsetWidth, h = btn.offsetHeight;
      const reach = Math.max(8, Math.min(44, w / 2 - 6)); // never past the button's sides, so the page can't scroll sideways
      for (let i = 0; i < SPARKS; i++) {
        const el = document.createElement("i");
        const bar = i % 3 === 0;
        const side = i % 2 ? -1 : 1; // half fly up, half fly down
        const y0 = (Math.random() - 0.5) * (h - 12);
        const x0 = (Math.random() - 0.5) * 6;
        const x1 = (Math.random() * 2 - 1) * reach;
        const y1 = side * (h / 2 + 6 + Math.random() * 22); // they always end outside the button, where they can be seen
        el.style.width = bar ? "2px" : `${3 + Math.random() * 1.5}px`;
        el.style.height = bar ? "7px" : el.style.width;
        el.style.background = i % 3 === 1 ? "var(--kcb-f)" : "color-mix(in srgb, var(--kcb-f) 65%, white)";
        const turn = `${((Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI + 90).toFixed(0)}deg`;
        box.appendChild(el);
        el.animate(
          [
            { transform: `translate(-50%, -50%) translate(${x0}px, ${y0}px) rotate(${turn}) scale(1)`, opacity: 0 },
            { opacity: 1, offset: 0.08 },
            { opacity: 0.9, offset: 0.55 },
            { transform: `translate(-50%, -50%) translate(${x1}px, ${y1}px) rotate(${turn}) scale(.4)`, opacity: 0 },
          ],
          { duration: 640 + Math.random() * 280, delay: Math.random() * 50, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" },
        ).onfinish = () => el.remove();
      }
    };

    /** The halves meet: flash the seam, then success or straight back to rest. */
    const snap = () => {
      setSeam((n) => n + 1);
      if (s.busy) return split();
      if (s.win && s.ok) {
        go("win");
        burst();
        after(WIN_HOLD_MS, () => {
          go("back");
          after(BACK_MS, () => go("idle"));
        });
      } else go("idle");
      s.ok = true;
    };
    const close = () => {
      go("close");
      after(CLOSE_MS, snap);
    };
    /** While open: once loading is done and the gap has been open long enough, close it. */
    const check = () => {
      if (s.phase !== "open" || s.busy) return;
      const wait = s.openAt + MIN_OPEN_MS - performance.now();
      if (wait > 0) after(wait, check);
      else close();
    };
    /** Loading starts: crack, then open. */
    const split = () => {
      if (s.phase === "crack" || s.phase === "open") return;
      if (s.phase === "close") {
        // Loading started again before the halves met: they part again from where they are.
        s.openAt = performance.now();
        window.clearTimeout(timer.current);
        go("open");
        return;
      }
      setZig(newZig());
      if (s.sound && performance.now() - s.clickAt < 600) playCrack();
      s.clickAt = -1e9;
      go("crack");
      after(CRACK_MS, () => {
        s.openAt = performance.now();
        go("open");
        check();
      });
    };
    ctl.current = { split, check };
    return () => {
      window.clearTimeout(timer.current);
      ctl.current = null;
    };
  }, []);
  useEffect(() => {
    if (busy) ctl.current?.split();
    else ctl.current?.check();
  }, [busy]);

  // Reads the fill (it may be a theme variable), so the label picks black or white.
  useEffect(() => {
    const tint = tintRef.current, btn = btnRef.current;
    if (!tint || !btn) return;
    const read = () => {
      if (textColor) return;
      btn.style.setProperty("--kcb-auto", isLight(rgbOf(getComputedStyle(tint).color)) ? "rgb(10 10 10)" : "rgb(255 255 255)");
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", read);
    };
  }, [color, textColor]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // While it is open, a second click does nothing (and doesn't submit a form twice).
    if (busy || phase === "crack" || phase === "open" || phase === "close") {
      e.preventDefault();
      return;
    }
    if (sound) unlockAudio();
    now.current.clickAt = performance.now();
    const out = onClick?.(e);
    if (loading === undefined && out && typeof (out as Promise<unknown>).then === "function") {
      setOwn(true);
      Promise.resolve(out)
        .then(
          () => (now.current.ok = true),
          () => (now.current.ok = false),
        )
        .finally(() => {
          if (live.current) setOwn(false);
        });
    }
  };

  const open = phase === "open";
  const working = phase === "crack" || phase === "open" || phase === "close";

  return (
    <>
      <style>{CSS}</style>
      <button
        ref={btnRef}
        type={type}
        className={className ? `kcb ${className}` : "kcb"}
        data-phase={phase}
        aria-busy={busy || working || undefined}
        aria-disabled={busy || working || undefined}
        onClick={handleClick}
        style={
          {
            ...(color ? { "--kcb-fill": color } : null),
            ...(textColor ? { "--kcb-text": textColor } : null),
            ...(dotColor ? { "--kcb-dot": dotColor } : null),
            ...style,
          } as CSSProperties
        }
        {...rest}
      >
        <span ref={tintRef} aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, color: "var(--kcb-f)" }} />
        <span className="kcb-whole" aria-hidden="true" />
        <span className="kcb-half kcb-l" aria-hidden="true">
          <span className="kcb-face" style={{ clipPath: halfPath(zig, -1, open) }}>
            <span className="kcb-text">{children}</span>
          </span>
        </span>
        <span className="kcb-half kcb-r" aria-hidden="true">
          <span className="kcb-face" style={{ clipPath: halfPath(zig, 1, open) }}>
            <span className="kcb-text">{children}</span>
          </span>
        </span>
        <span className="kcb-crack" aria-hidden="true">
          <i style={{ clipPath: linePath(zig, 1.6) }} />
          <i style={{ clipPath: linePath(zig, 0.8) }} />
        </span>
        <span key={seam} className="kcb-seam" data-on={seam ? "" : undefined} aria-hidden="true">
          <i style={{ clipPath: linePath(zig, 1.4) }} />
        </span>
        <span className="kcb-label">{children}</span>
        <span className="kcb-win" aria-hidden="true">
          {successText}
        </span>
        <span className="kcb-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span ref={sparksRef} className="kcb-sparks" aria-hidden="true" />
        <span className="kcb-sr" role="status">
          {working ? loadingText : phase === "win" ? successText : ""}
        </span>
      </button>
    </>
  );
});
