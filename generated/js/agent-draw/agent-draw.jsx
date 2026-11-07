"use client";

import { useEffect, useRef } from "react";

export const AGENT_NAMES = ["Vraj", "Sensei", "Impeccable"];

export const AGENT_COLORS = [
  "#a5b4fc", // periwinkle
  "#f9a8d4", // pink
  "#86efac", // mint
  "#fcd34d", // butter
  "#7dd3fc", // sky
  "#fdba74", // peach
  "#c4b5fd", // lilac
  "#5eead4", // aqua
  "#fca5a5", // coral
  "#d9f99d", // lime
];

const HARD_CAP = 9;
const TICK_MS = 400; // how long the content fade and skeleton fade take

/* ------------------------------------------------------------------------ */
/* Shared cursor pool: every Agent-Draw on the page shares the same cursors, */
/* so the total on screen never goes over the cap.                           */
/* ------------------------------------------------------------------------ */

const busy = new Set();
const waiters = new Set();

function takeSlots(want, cap) {
  const got = [];
  for (let i = 0; i < cap && got.length < want; i++) {
    if (!busy.has(i)) {
      busy.add(i);
      got.push(i);
    }
  }
  return got;
}

function giveSlots(slots) {
  slots.forEach((s) => busy.delete(s));
  if (slots.length) waiters.forEach((w) => w());
}

const ATOMIC =
  "img,svg,video,canvas,picture,iframe,input,textarea,select,button,progress,meter,[data-agent-draw]";

function alpha(color) {
  if (!color || color === "transparent") return 0;
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return 1;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  return parts.length > 3 ? parseFloat(parts[3]) : 1;
}

/** Has its own background, border or shadow (a card, chip or button). */
function hasPaint(cs) {
  if (alpha(cs.backgroundColor) > 0.02 || cs.backgroundImage !== "none") return true;
  if (cs.boxShadow !== "none") return true;
  return ["Top", "Right", "Bottom", "Left"].some(
    (side) =>
      parseFloat(cs.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0 &&
      alpha(cs.getPropertyValue(`border-${side.toLowerCase()}-color`)) > 0.02,
  );
}

function radiusOf(cs, w, h) {
  const raw = cs.borderTopLeftRadius;
  const n = parseFloat(raw) || 0;
  return raw.endsWith("%") ? (Math.min(w, h) * n) / 100 : n;
}

function isInline(el) {
  return getComputedStyle(el).display.startsWith("inline") && !el.matches(ATOMIC);
}

function measure(root) {
  const base = root.getBoundingClientRect();
  const rootArea = base.width * base.height;
  const out = [];

  const push = (left, top, w, h, kind, r) => {
    if (w < 4 || h < 4) return;
    out.push({
      x: left - base.left,
      y: top - base.top,
      w,
      h,
      r: Math.min(r, Math.min(w, h) / 2),
      kind,
    });
  };

  // One bar per line of text, like a skeleton.
  const textLines = (node) => {
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = Array.from(range.getClientRects()).filter((r) => r.width > 1 && r.height > 1);
    const rows = [];
    for (const rc of rects) {
      const mid = rc.top + rc.height / 2;
      const row = rows.find((w) => mid > w.t && mid < w.b);
      if (row) {
        row.l = Math.min(row.l, rc.left);
        row.r = Math.max(row.r, rc.right);
      } else rows.push({ l: rc.left, t: rc.top, r: rc.right, b: rc.bottom });
    }
    for (const row of rows) {
      const h = (row.b - row.t) * 0.68;
      push(row.l, row.t + (row.b - row.t - h) / 2, row.r - row.l, h, "text", 4);
    }
  };

  const visit = (el) => {
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent?.trim()) textLines(node);
        continue;
      }
      if (!(node instanceof Element) || node.hasAttribute("data-agent-skip")) continue;
      const cs = getComputedStyle(node);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") continue;
      if (cs.display === "contents") {
        visit(node);
        continue;
      }
      const rect = node.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      const r = radiusOf(cs, rect.width, rect.height);
      const round =
        r >= Math.min(rect.width, rect.height) / 2 - 0.5 && Math.abs(rect.width - rect.height) < 3;
      const paint = hasPaint(cs);

      // Images, icons, inputs, buttons, chips and badges: one solid shape.
      if (node.matches(ATOMIC) || (paint && rect.height <= 72 && rect.width <= 360)) {
        push(rect.left, rect.top, rect.width, rect.height, round ? "circle" : "box", r);
        continue;
      }
      // A paragraph or heading (text plus inline bits): bars per line.
      if (node.textContent?.trim() && Array.from(node.children).every(isInline)) {
        // A round badge with initials is one circle, like an avatar.
        if (paint && round) push(rect.left, rect.top, rect.width, rect.height, "circle", r);
        else {
          if (paint) push(rect.left, rect.top, rect.width, rect.height, "frame", r);
          textLines(node);
        }
        continue;
      }
      // A card or panel: its outline, then whatever is inside it.
      if (paint && rect.width * rect.height < rootArea * 0.9) {
        push(rect.left, rect.top, rect.width, rect.height, round ? "circle" : "frame", r);
      }
      visit(node);
    }
  };

  visit(root);
  // Top to bottom, then left to right.
  return out.sort((a, b) => (Math.abs(a.y - b.y) < 6 ? a.x - b.x : a.y - b.y));
}

/* ------------------------------------------------------------------------ */
/* Small helpers                                                             */
/* ------------------------------------------------------------------------ */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/** True when the page behind the component is dark. */
function onDarkPage(el) {
  let node = el;
  while (node) {
    const bg = getComputedStyle(node).backgroundColor;
    if (alpha(bg) > 0.5) {
      const [r, g, b] = (bg.match(/[\d.]+/g) ?? ["255", "255", "255"]).map(Number);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
    }
    node = node.parentElement;
  }
  return matchMedia("(prefers-color-scheme: dark)").matches;
}

const STYLE_ID = "agent-draw-style";
const CSS = `
.ad-shape{position:absolute;left:0;top:0;box-sizing:border-box;border:1.5px solid transparent;opacity:0;
  transition:background-color .3s ease,border-color .3s ease,opacity ${TICK_MS}ms ease}
.ad-shape.ad-frame{background:transparent}
.ad-shimmer{background-image:linear-gradient(100deg,transparent 30%,var(--ad-shine) 50%,transparent 70%);
  background-size:300% 100%;animation:ad-shimmer 1.4s linear infinite}
@keyframes ad-shimmer{from{background-position:120% 0}to{background-position:-20% 0}}
.ad-cursor{position:absolute;left:0;top:0;opacity:0;will-change:transform,opacity;z-index:2}
.ad-cursor svg{display:block;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.25))}
.ad-name{position:absolute;left:14px;top:16px;transition:transform .25s ease;padding:2px 7px;border-radius:999px;white-space:nowrap;
  font:500 11px/16px ui-sans-serif,system-ui,sans-serif;color:#0a0a0a}
.ad-size{position:absolute;padding:1px 5px;border-radius:4px;white-space:nowrap;opacity:0;
  font:500 10px/14px ui-monospace,SFMono-Regular,Menlo,monospace;color:#0a0a0a;transform:translate(-50%,6px)}
`;

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

const ARROW =
  '<svg width="16" height="20" viewBox="0 0 16 20" aria-hidden="true"><path d="M1.5 1.5v15.2l4.1-3.9 2.7 6 2.6-1.2-2.7-5.8h5.6z" fill="currentColor" stroke="rgba(10,10,10,.75)" stroke-width="1.2" stroke-linejoin="round"/></svg>';

/* ------------------------------------------------------------------------ */
/* The component                                                             */
/* ------------------------------------------------------------------------ */

export function AgentDraw({
  children,
  loading = false,
  duration = 3500,
  maxAgents = 8,
  maxAgentsMobile = 4,
  names = AGENT_NAMES,
  colors = AGENT_COLORS,
  sizeTags = true,
  once,
  onDone,
  className,
  style,
}) {
  const contentRef = useRef(null);
  const overlayRef = useRef(null);
  const loadingRef = useRef(loading);
  const revealRef = useRef(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Keep the latest options without restarting the drawing.
  const opts = useRef({ duration, maxAgents, maxAgentsMobile, names, colors, sizeTags, once });
  opts.current = { duration, maxAgents, maxAgentsMobile, names, colors, sizeTags, once };

  useEffect(() => {
    loadingRef.current = loading;
    if (!loading) revealRef.current?.();
  }, [loading]);

  useEffect(() => {
    const content = contentRef.current;
    const overlay = overlayRef.current;
    if (!content || !overlay) return;
    ensureStyle();

    const o = opts.current;
    let cancelled = false;
    let raf = 0;
    let slots = [];
    let shapeEls = [];
    const timers = [];
    const cleanups = [];

    const showContent = (fade) => {
      content.style.transition = `opacity ${fade}ms ease`;
      content.style.opacity = "1";
    };

    const finish = () => {
      revealRef.current = null;
      showContent(TICK_MS);
      overlay.style.transition = `opacity ${TICK_MS}ms ease`;
      overlay.style.opacity = "0";
      timers.push(
        window.setTimeout(() => {
          overlay.replaceChildren();
          content.style.transition = "";
          if (o.once) {
            try {
              localStorage.setItem(`agent-draw:${o.once}`, "1");
            } catch {}
          }
          onDoneRef.current?.();
        }, TICK_MS + 50),
      );
    };

    /** Drawing is over: show the content, or shimmer until the data arrives. */
    const settle = () => {
      if (!loadingRef.current) return finish();
      shapeEls.forEach((el) => {
        if (!el.classList.contains("ad-frame")) el.classList.add("ad-shimmer");
      });
      revealRef.current = finish;
    };

    const dark = onDarkPage(overlay);
    overlay.style.setProperty("--ad-skel", dark ? "rgba(255,255,255,.08)" : "rgba(10,10,10,.07)");
    overlay.style.setProperty("--ad-line", dark ? "rgba(255,255,255,.10)" : "rgba(10,10,10,.09)");
    overlay.style.setProperty(
      "--ad-shine",
      dark ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.65)",
    );
    overlay.style.opacity = "1";
    overlay.style.transition = "";

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    if (o.once) {
      try {
        seen = localStorage.getItem(`agent-draw:${o.once}`) === "1";
      } catch {}
    }

    // Draw the skeleton shapes for the given list (static, no cursors).
    const makeShapes = (shapes) => {
      shapeEls = shapes.map((s) => {
        const el = document.createElement("div");
        el.className = s.kind === "frame" ? "ad-shape ad-frame" : "ad-shape";
        el.style.transform = `translate(${s.x}px,${s.y}px)`;
        el.style.width = `${s.w}px`;
        el.style.height = `${s.h}px`;
        el.style.borderRadius = s.kind === "circle" ? "50%" : `${s.r}px`;
        overlay.appendChild(el);
        return el;
      });
    };

    const settleShape = (el, s) => {
      el.style.width = `${s.w}px`;
      el.style.height = `${s.h}px`;
      el.style.opacity = "1";
      if (s.kind === "frame") {
        el.style.borderColor = "var(--ad-line)";
        el.style.backgroundColor = "transparent";
      } else {
        el.style.borderColor = "transparent";
        el.style.backgroundColor = "var(--ad-skel)";
      }
    };

    // Reduced motion, or already seen: no cursors.
    if (reduced || seen) {
      if (!loadingRef.current) {
        showContent(reduced ? 200 : TICK_MS);
        timers.push(window.setTimeout(() => onDoneRef.current?.(), TICK_MS));
      } else {
        const shapes = measure(content);
        makeShapes(shapes);
        shapeEls.forEach((el, i) => settleShape(el, shapes[i]));
        revealRef.current = finish;
      }
      return () => {
        timers.forEach(clearTimeout);
        revealRef.current = null;
      };
    }

    const run = (shapes, mySlots) => {
      slots = mySlots;
      makeShapes(shapes);
      const W = content.offsetWidth;
      const A = mySlots.length;
      const S = shapes.length;
      const per = clamp(((o.duration - 450) * A) / Math.max(S, 1), 180, 1100);
      const move = per * 0.42;
      const agents = mySlots.map((slot, i) => {
        const color = o.colors[slot % o.colors.length] ?? AGENT_COLORS[slot % AGENT_COLORS.length];
        const name = o.names[slot] ?? `Agent ${slot + 1}`;
        const el = document.createElement("div");
        el.className = "ad-cursor";
        el.style.color = color;
        el.innerHTML = ARROW;
        const tag = document.createElement("span");
        tag.className = "ad-name";
        tag.style.background = color;
        tag.textContent = name;
        el.appendChild(tag);
        overlay.appendChild(el);
        const size = document.createElement("span");
        size.className = "ad-size";
        size.style.background = color;
        overlay.appendChild(size);
        const sx = ((i + 0.5) / A) * W;
        return {
          el,
          size,
          tag,
          flipped: false,
          color,
          outline: dark ? color : `color-mix(in oklab, ${color} 60%, #0a0a0a)`,
          tint: `color-mix(in srgb, ${color} 18%, transparent)`,
          tasks: [],
          free: i * 70,
          x: sx,
          y: -24,
          sx,
        };
      });

      // Hand out shapes top to bottom; each goes to the cursor that's free first.
      shapes.forEach((s, k) => {
        let best = agents[0];
        for (const a of agents) {
          if (a.free < best.free - 1) best = a;
          else if (
            Math.abs(a.free - best.free) <= 1 &&
            Math.hypot(a.x - s.x, a.y - s.y) < Math.hypot(best.x - s.x, best.y - s.y)
          )
            best = a;
        }
        best.tasks.push({ s: k, start: best.free, fx: best.x, fy: best.y });
        best.free += per;
        best.x = s.x + s.w;
        best.y = s.y + s.h;
      });

      const done = new Array(S).fill(false);
      const exitMs = 320;
      const end = Math.max(...agents.map((a) => a.free)) + exitMs;
      let released = false;
      const t0 = performance.now();

      const frame = (now) => {
        if (cancelled) return;
        const e = now - t0;
        for (const a of agents) {
          const first = a.tasks[0];
          const last = a.tasks[a.tasks.length - 1];
          let x = a.sx;
          let y = -24;
          let op = 0;
          let showSize = false;

          if (!first || e < first.start) {
            op = 0;
          } else if (e >= last.start + per) {
            // Leaving: drift down-right and fade.
            const q = clamp((e - last.start - per) / exitMs, 0, 1);
            const s = shapes[last.s];
            x = s.x + s.w + 14 * q;
            y = s.y + s.h + 10 * q;
            op = 1 - q;
          } else {
            const task = a.tasks.find((t) => e >= t.start && e < t.start + per) ?? last;
            const s = shapes[task.s];
            const el = shapeEls[task.s];
            const local = e - task.start;
            op = task === first ? clamp(local / 180, 0, 1) : 1;
            if (local < move) {
              // Fly to the shape's top-left corner, on a slight curve.
              const p = easeInOut(local / move);
              const dx = s.x - task.fx;
              const dy = s.y - task.fy;
              const bend = Math.sin(p * Math.PI) * Math.min(40, Math.hypot(dx, dy) * 0.12);
              const len = Math.hypot(dx, dy) || 1;
              x = task.fx + dx * p + (-dy / len) * bend;
              y = task.fy + dy * p + (dx / len) * bend;
            } else {
              // Drag the shape out from corner to corner.
              const q = easeOut(clamp((local - move) / (per - move), 0, 1));
              const w = s.w * q;
              const h = s.h * q;
              x = s.x + w;
              y = s.y + h;
              el.style.opacity = "1";
              el.style.width = `${w}px`;
              el.style.height = `${h}px`;
              el.style.borderColor = a.outline;
              el.style.backgroundColor = s.kind === "frame" ? "transparent" : a.tint;
              if (o.sizeTags && s.kind !== "text" && s.w >= 40) {
                showSize = true;
                a.size.textContent = `${Math.round(w)} × ${Math.round(h)}`;
                const cx = clamp(s.x + w / 2, 34, W - 34);
                a.size.style.transform = `translate(${cx}px,${s.y + h}px) translate(-50%,6px)`;
              }
            }
          }
          // Settle every shape whose drag has finished.
          for (const t of a.tasks) {
            if (!done[t.s] && e >= t.start + per) {
              done[t.s] = true;
              settleShape(shapeEls[t.s], shapes[t.s]);
            }
          }
          // Near the right edge, the name tag flips to the cursor's left.
          const flip = x > W - 96;
          if (flip !== a.flipped) {
            a.flipped = flip;
            a.tag.style.transform = flip ? `translateX(calc(-100% - 22px))` : "";
          }
          a.el.style.opacity = String(op);
          a.el.style.transform = `translate3d(${x}px,${y}px,0)`;
          a.size.style.opacity = showSize ? "1" : "0";
        }

        if (e < end) raf = requestAnimationFrame(frame);
        else {
          agents.forEach((a) => {
            a.el.remove();
            a.size.remove();
          });
          if (!released) {
            released = true;
            giveSlots(slots);
            slots = [];
          }
          settle();
        }
      };
      raf = requestAnimationFrame(frame);
    };

    const start = async () => {
      // Let web fonts settle so text lines are measured at their final size.
      await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 300))]);
      if (cancelled) return;
      const shapes = measure(content);
      if (!shapes.length) return settle();
      const mobile = matchMedia("(max-width: 640px)").matches;
      const cap = clamp(Math.round(mobile ? o.maxAgentsMobile : o.maxAgents), 1, HARD_CAP);
      // Few shapes, few cursors: each cursor gets about three shapes at least.
      const want = Math.min(cap, Math.ceil(shapes.length / 3));
      const tryStart = () => {
        if (cancelled) return;
        const got = takeSlots(want, cap);
        if (!got.length) return; // all cursors busy elsewhere: wait for a free one
        waiters.delete(tryStart);
        run(shapes, got);
      };
      waiters.add(tryStart);
      cleanups.push(() => waiters.delete(tryStart));
      tryStart();
    };

    // Start when the block scrolls into view, so sections draw top to bottom.
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((en) => en.isIntersecting)) {
            io.disconnect();
            start();
          }
        },
        { threshold: 0.12 },
      );
      io.observe(content);
      cleanups.push(() => io.disconnect());
    } else start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      cleanups.forEach((c) => c());
      giveSlots(slots);
      revealRef.current = null;
      overlay.replaceChildren();
    };
  }, []);

  return (
    <div style={{ position: "relative" }} aria-busy={loading || undefined}>
      <div ref={contentRef} className={className} style={{ ...style, opacity: 0 }}>
        {children}
      </div>
      <div
        ref={overlayRef}
        aria-hidden="true"
        // Clip sideways so tags near the edge never widen the page on phones.
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflowX: "clip",
          overflowY: "visible",
        }}
      />
    </div>
  );
}
