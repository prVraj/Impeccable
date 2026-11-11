"use client";

/**
 * brain.txt, from Impeccable.
 *
 * A brain sits in the middle of a small web of dots. Each dot holds one thought.
 * Hover a dot to light up its links, click it to read the thought, and drag the
 * dots, the brain or the empty canvas to play with the web. Everything springs back.
 *
 * Every dot links to at most 3 nearby dots (never more), so the web stays clean.
 * No packages: SVG, pointer events and one requestAnimationFrame loop that stops
 * when everything is still.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/* ---------- tuning (the design: keep as written) ---------- */

const MAX_LINKS = 3; // hard cap, whatever the prop says
const BRAIN_SIZE = 30; // px, the center emoji
const ANCHOR = 0.035; // pull back to home
const SPRING = 0.06; // pull along links
const DAMP = 0.84; // velocity kept per frame
const CLICK_SLOP = 5; // px a pointer may move and still count as a click
const ENTER_MS = 900; // dots grow out of the brain on first view
const FADE = 0.14; // opacity of everything not lit while a dot is active

/* ---------- layout ---------- */

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Home spots on a sunflower spiral, with a little jitter so it never looks like a pattern.
 * Unit space: the brain is at 0,0 and the outer dots near radius 1. */
function homes(count, seed) {
  const rand = rng(seed);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.9) / (count + 0.4);
    const radius = 0.28 + 0.72 * Math.sqrt(t) + (rand() - 0.5) * 0.12;
    const angle = i * golden + rand() * 0.5 + seed * 0.37;
    pts.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      r: 2.6 + rand() * 1.8,
      shade: 0.55 + rand() * 0.4,
    });
  }
  return pts;
}

function crosses(a, b, c, d) {
  const o = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}

/** Shortest links first; a link is added only if both dots still have room (max 3)
 * and it doesn't cross a link already drawn. */
function linkDots(pts, max) {
  const pairs = [];
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++)
      pairs.push([Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y), i, j]);
  pairs.sort((a, b) => a[0] - b[0]);
  const degree = new Array(pts.length).fill(0);
  const edges = [];
  for (const [dist, i, j] of pairs) {
    if (dist > 1.25) break; // far dots stay apart
    if (degree[i] >= max || degree[j] >= max) continue;
    if (
      edges.some(
        ([a, b]) =>
          a !== i && a !== j && b !== i && b !== j && crosses(pts[i], pts[j], pts[a], pts[b]),
      )
    )
      continue;
    edges.push([i, j]);
    degree[i]++;
    degree[j]++;
  }
  return edges.map(([a, b]) => [a + 1, b + 1]); // shift: node 0 is the brain
}

/* ---------- theme ---------- */

/** Dark or light, read from the text color the map inherits, so it follows any theme setup. */
function useIsDark(ref) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => {
      const el = ref.current;
      if (!el) return;
      const m = getComputedStyle(el).color.match(/[\d.]+/g);
      if (!m) return;
      const [r, g, b] = m.map(Number);
      setDark(0.299 * r + 0.587 * g + 0.114 * b > 140);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", read);
    };
  }, [ref]);
  return dark;
}

/* ---------- component ---------- */

export function BrainTxt({
  thoughts,
  brainLinks = true,
  maxLinks = 3,
  center = "🧠",
  accent = "#3b8ff6",
  hint = (
    <>
      Click on dots to see what I think.
      <br />
      Drag it to play with it.
    </>
  ),
  seed = 7,
  height = 420,
  className,
  style,
}) {
  const boxRef = useRef(null);
  const svgRef = useRef(null);
  const brainRef = useRef(null);
  const cardRef = useRef(null);
  const dark = useIsDark(boxRef);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState(null); // node index, 0 = brain
  const [open, setOpen] = useState(null); // dot index that shows its card
  const [grabbing, setGrabbing] = useState(false);

  // Layout in unit space, rebuilt only when the thoughts change.
  const unit = useMemo(() => homes(thoughts.length, seed), [thoughts.length, seed]);
  const edges = useMemo(() => {
    const cap = Math.max(1, Math.min(MAX_LINKS, maxLinks));
    const dotLinks = linkDots(unit, cap);
    if (!brainLinks) return dotLinks;
    // Left to itself, the brain links to its nearest dots: about 45% of them, 3 to 8.
    const nearest = unit
      .map((p, i) => [Math.hypot(p.x, p.y), i])
      .sort((a, b) => a[0] - b[0])
      .slice(0, Math.max(3, Math.min(8, Math.round(unit.length * 0.45))))
      .map(([, i]) => i);
    const toBrain = [];
    unit.forEach((_, i) => {
      const chosen = thoughts[i]?.brain;
      if (chosen === true || (chosen === undefined && nearest.includes(i)))
        toBrain.push([0, i + 1]);
    });
    return [...toBrain, ...dotLinks];
  }, [unit, thoughts, brainLinks, maxLinks]);

  const neighbours = useMemo(() => {
    const n = Array.from({ length: thoughts.length + 1 }, () => new Set());
    for (const [a, b] of edges) {
      n[a].add(b);
      n[b].add(a);
    }
    return n;
  }, [edges, thoughts.length]);

  // Live simulation state (kept out of React so frames are cheap).
  const sim = useRef({
    nodes: [],
    pan: { x: 0, y: 0 },
    drag: null,
    raf: 0,
    born: 0,
    still: true,
    reduced: false,
  });

  // Measure the box.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setSize({ w: e.contentRect.width, h: e.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Write positions to the DOM. */
  const paint = useCallback(() => {
    const s = sim.current;
    const svg = svgRef.current;
    if (!svg || !s.nodes.length) return;
    const grow = s.reduced ? 1 : Math.min(1, (performance.now() - s.born) / ENTER_MS);
    const ease = 1 - Math.pow(1 - grow, 3);
    const c = s.nodes[0];
    const at = (n) => n;
    const lines = svg.querySelectorAll("line[data-e]");
    lines.forEach((line, k) => {
      const [a, b] = edges[k] ?? [0, 0];
      const p = a === 0 ? c : at(s.nodes[a]);
      const q = at(s.nodes[b]);
      line.setAttribute("x1", p.x.toFixed(1));
      line.setAttribute("y1", p.y.toFixed(1));
      line.setAttribute("x2", q.x.toFixed(1));
      line.setAttribute("y2", q.y.toFixed(1));
    });
    svg.querySelectorAll("g[data-n]").forEach((g, k) => {
      const p = at(s.nodes[k + 1]);
      g.setAttribute(
        "transform",
        `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(0.3 + 0.7 * ease).toFixed(3)})`,
      );
    });
    if (brainRef.current)
      brainRef.current.style.transform = `translate(${c.x - BRAIN_SIZE / 2}px, ${c.y - BRAIN_SIZE / 2}px)`;
    const card = cardRef.current;
    const i = Number(card?.dataset.for);
    if (card && i) {
      const p = s.nodes[i];
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      const W = svg.clientWidth;
      const H = svg.clientHeight;
      const right = p.x + 14 + w < W - 8 || p.x < W / 2;
      let x = right ? p.x + 14 : p.x - 14 - w;
      let y = p.y - h / 2;
      x = Math.max(8, Math.min(W - w - 8, x));
      y = Math.max(8, Math.min(H - h - 8, y));
      card.style.transform = `translate(${x}px, ${y}px)`;
      card.style.transformOrigin = right ? "left center" : "right center";
    }
  }, [edges]);

  /** One physics step for every node. Returns how much is still moving. */
  const step = useCallback(() => {
    const s = sim.current;
    const nodes = s.nodes;
    let energy = 0;
    for (const [a, b] of edges) {
      const A = nodes[a];
      const B = nodes[b];
      const rest = Math.hypot(A.hx - B.hx, A.hy - B.hy);
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const d = Math.hypot(dx, dy) || 1;
      const f = (SPRING * (d - rest)) / d;
      A.vx += dx * f;
      A.vy += dy * f;
      B.vx -= dx * f;
      B.vy -= dy * f;
    }
    nodes.forEach((n, i) => {
      const held = s.drag?.kind === "node" && s.drag.index === i;
      if (held) {
        n.vx = n.vy = 0;
        return;
      }
      const k = i === 0 ? ANCHOR * 2 : ANCHOR;
      n.vx = (n.vx + (n.hx + s.pan.x - n.x) * k) * DAMP;
      n.vy = (n.vy + (n.hy + s.pan.y - n.y) * k) * DAMP;
      n.x += n.vx;
      n.y += n.vy;
      energy +=
        Math.abs(n.vx) +
        Math.abs(n.vy) +
        Math.abs(n.hx + s.pan.x - n.x) * 0.02 +
        Math.abs(n.hy + s.pan.y - n.y) * 0.02;
    });
    return energy;
  }, [edges]);

  const tick = useCallback(() => {
    const s = sim.current;
    if (s.reduced) {
      s.nodes.forEach((n, i) => {
        if (s.drag?.kind === "node" && s.drag.index === i) return;
        n.x = n.hx + s.pan.x;
        n.y = n.hy + s.pan.y;
      });
      paint();
      s.raf = 0;
      return;
    }
    const energy = step();
    paint();
    const entering = performance.now() - s.born < ENTER_MS;
    if (energy > 0.02 || s.drag || entering) s.raf = requestAnimationFrame(tick);
    else s.raf = 0;
  }, [paint, step]);

  const wake = useCallback(() => {
    const s = sim.current;
    if (!s.raf) s.raf = requestAnimationFrame(tick);
  }, [tick]);

  // Place nodes whenever the size or layout changes.
  useEffect(() => {
    if (!size.w || !size.h) return;
    const s = sim.current;
    s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hintSpace = hint ? 44 : 0;
    const cx = size.w / 2;
    const cy = (size.h - hintSpace) / 2;
    // Fill the box: the web may stretch up to 30% wider than tall (or taller than wide on phones).
    const fitX = Math.max(60, size.w / 2 - 28);
    const fitY = Math.max(60, (size.h - hintSpace) / 2 - 22);
    const Rx = Math.min(fitX, fitY * 1.3);
    const Ry = Math.min(fitY, fitX * 1.3);
    const first = s.nodes.length === 0;
    const prev = s.nodes;
    s.nodes = [{ x: 0, y: 0, r: 0, shade: 1 }, ...unit].map((p, i) => {
      const hx = cx + p.x * Rx;
      const hy = cy + p.y * Ry;
      const old = prev[i];
      return {
        hx,
        hy,
        x: old ? old.x - old.hx + hx : hx,
        y: old ? old.y - old.hy + hy : hy,
        vx: 0,
        vy: 0,
        r: p.r,
        shade: p.shade,
      };
    });
    if (first) {
      s.born = performance.now();
      // Start inside the brain and spring out.
      if (!s.reduced)
        s.nodes.forEach((n) => ((n.x = cx + (n.hx - cx) * 0.2), (n.y = cy + (n.hy - cy) * 0.2)));
    }
    wake();
  }, [size, unit, hint, wake]);

  useEffect(() => () => cancelAnimationFrame(sim.current.raf), []);

  // Repaint once React has rendered new lines, dots or the card (before the browser paints).
  useLayoutEffect(() => {
    paint();
  });

  /* ---------- pointer ---------- */

  const local = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e, index) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const s = sim.current;
    const p = local(e);
    const n = index === null ? null : s.nodes[index];
    s.drag = {
      kind: index === null ? "pan" : "node",
      index: index ?? -1,
      start: p,
      last: p,
      moved: false,
      id: e.pointerId,
      offset: n ? { x: n.x - p.x, y: n.y - p.y } : { x: 0, y: 0 },
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setGrabbing(true);
    wake();
  };

  const onMove = (e) => {
    const s = sim.current;
    const d = s.drag;
    if (!d || d.id !== e.pointerId) return;
    const p = local(e);
    if (Math.hypot(p.x - d.start.x, p.y - d.start.y) > CLICK_SLOP) d.moved = true;
    if (d.kind === "pan") {
      // Move the whole web; dots lag a touch behind and wobble into place.
      const W = svgRef.current.clientWidth;
      const H = svgRef.current.clientHeight;
      s.pan.x = Math.max(-W / 2 + 40, Math.min(W / 2 - 40, s.pan.x + p.x - d.last.x));
      s.pan.y = Math.max(-H / 2 + 40, Math.min(H / 2 - 40, s.pan.y + p.y - d.last.y));
    } else {
      const n = s.nodes[d.index];
      n.x = p.x + d.offset.x;
      n.y = p.y + d.offset.y;
    }
    d.last = p;
    wake();
  };

  const onUp = (e) => {
    const s = sim.current;
    const d = s.drag;
    if (!d || d.id !== e.pointerId) return;
    s.drag = null;
    setGrabbing(false);
    if (!d.moved) {
      if (d.kind === "node" && d.index > 0) setOpen((o) => (o === d.index ? null : d.index));
      else setOpen(null);
    }
    wake();
  };

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* ---------- what is lit ---------- */

  const active = hover ?? open; // hover wins; an open card keeps its dot lit
  const lit = (i) => active === null || i === active || neighbours[active]?.has(i);
  const edgeLit = (a, b) => {
    if (active === null) return false;
    if (a === active || b === active) return true;
    // When the brain is active, also light the links between its dots.
    return active === 0 && neighbours[0].has(a) && neighbours[0].has(b);
  };

  const ink = dark ? "#f4f4f5" : "#111113";
  const line = dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)";
  const thought = open !== null ? thoughts[open - 1] : null;

  return (
    <div
      ref={boxRef}
      className={className}
      style={{ position: "relative", height, userSelect: "none", ...style }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          display: "block",
          touchAction: "none",
          cursor: grabbing ? "grabbing" : "grab",
          overflow: "visible",
        }}
        onPointerDown={(e) => onDown(e, null)}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="group"
        aria-label="Map of thoughts. Click a dot to read it."
      >
        {edges.map(([a, b], k) => {
          const on = edgeLit(a, b);
          return (
            <line
              key={`${a}-${b}`}
              data-e={k}
              stroke={on ? accent : line}
              strokeWidth={on ? 1.1 : 1}
              strokeLinecap="round"
              style={{
                opacity: active === null || on ? 1 : FADE,
                transition: "opacity .25s, stroke .25s",
              }}
            />
          );
        })}
        {thoughts.map((t, i) => {
          const idx = i + 1;
          const n = unit[i];
          const isOn = active !== null && lit(idx);
          const fill = t.featured ? accent : ink;
          return (
            <g
              key={idx}
              data-n={idx}
              role="button"
              tabIndex={0}
              aria-label={`Thought ${idx}${t.tag ? `, ${t.tag}` : ""}`}
              aria-expanded={open === idx}
              style={{
                cursor: grabbing ? "grabbing" : "pointer",
                outline: "none",
                opacity: lit(idx) ? 1 : FADE,
                transition: "opacity .25s",
              }}
              onPointerDown={(e) => onDown(e, idx)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(idx)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(idx)}
              onBlur={() => setHover(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen((o) => (o === idx ? null : idx));
                }
              }}
            >
              {/* Bigger invisible target so dots are easy to hit with a finger. */}
              <circle r={14} fill="transparent" />
              <circle
                r={n.r * (isOn && idx === active ? 1.35 : 1)}
                fill={fill}
                fillOpacity={t.featured ? 1 : n.shade}
                style={{ transition: "r .2s" }}
              />
            </g>
          );
        })}
      </svg>

      <div
        ref={brainRef}
        aria-hidden
        onPointerDown={(e) => onDown(e, 0)}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(0)}
        onPointerLeave={() => setHover(null)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: BRAIN_SIZE,
          height: BRAIN_SIZE,
          display: "grid",
          placeItems: "center",
          fontSize: BRAIN_SIZE * 0.82,
          lineHeight: 1,
          cursor: grabbing ? "grabbing" : "grab",
          touchAction: "none",
          opacity: lit(0) ? 1 : FADE + 0.1,
          transition: "opacity .25s",
        }}
      >
        {center}
      </div>

      {thought && (
        <div
          ref={cardRef}
          data-for={open ?? undefined}
          key={open}
          role="dialog"
          aria-label="Thought"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "min(240px, calc(100% - 16px))",
            padding: "12px 30px 12px 14px",
            borderRadius: 12,
            background: dark ? "#18181b" : "#ffffff",
            color: ink,
            fontSize: 13,
            lineHeight: 1.45,
            boxShadow: dark
              ? "0 0 0 1px rgba(255,255,255,0.08), 0 12px 32px -8px rgba(0,0,0,0.6)"
              : "0 0 0 1px rgba(0,0,0,0.05), 0 12px 32px -10px rgba(0,0,0,0.18)",
            animation: "brain-txt-card .18s cubic-bezier(.23,1,.32,1)",
            userSelect: "text",
            cursor: "auto",
          }}
        >
          <style>{`@keyframes brain-txt-card{from{opacity:0;scale:.96}}@media (prefers-reduced-motion: reduce){[role=dialog][data-for]{animation:none!important}}`}</style>
          <p style={{ margin: 0, textWrap: "pretty" }}>{thought.text}</p>
          {thought.tag && (
            <span
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "1px 8px",
                borderRadius: 999,
                background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                color: accent,
                fontWeight: 500,
                fontSize: 11,
                lineHeight: "18px",
              }}
            >
              {thought.tag}
            </span>
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(null)}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 22,
              height: 22,
              display: "grid",
              placeItems: "center",
              border: 0,
              borderRadius: 6,
              background: "transparent",
              color: "inherit",
              opacity: 0.5,
              cursor: "pointer",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path
                d="M1 1l8 8M9 1L1 9"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      {hint && (
        <p
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            textAlign: "center",
            fontSize: 12.5,
            lineHeight: 1.5,
            opacity: 0.45,
            pointerEvents: "none",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
