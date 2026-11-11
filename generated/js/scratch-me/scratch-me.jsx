"use client";

/**
 * Scratch-me, from Impeccable.
 *
 * A promo code hidden under a scratch-off foil. Scratch it with the mouse or a finger:
 * the foil comes off where you rub and the shavings fall and pile up at the bottom.
 * Let go after scratching at least half and the rest of the foil flakes away, the code
 * is copied to the clipboard and the card says so.
 *
 * No packages: two canvases (foil and shavings) and one requestAnimationFrame loop
 * that only runs while something moves.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ---------- tuning (the design: keep as written) ---------- */

const SAMPLE_STEP = 6; // px between pixels checked for progress
const CLEAR_MS = 520; // the rest of the foil flaking away
const GRAVITY = 0.32;
const MAX_SHAVINGS = 260;
const COPIED_MS = 2000; // the check shows this long, then the copy icon comes back
const TOAST_MS = 1800; // the "Code copied" pop

/** Styles that can't be inline: icon swap, toast motion, and no text selection anywhere. */
const CSS = `
.isc-root, .isc-root * { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
.isc-icon { grid-area: 1 / 1; transition: opacity .2s cubic-bezier(.23,1,.32,1), transform .3s cubic-bezier(.23,1,.32,1), filter .2s; }
.isc-icon[data-on="false"] { opacity: 0; transform: scale(.5); filter: blur(4px); }
.isc-check path { stroke-dasharray: 16; stroke-dashoffset: 16; transition: stroke-dashoffset .3s .08s cubic-bezier(.23,1,.32,1); }
.isc-check[data-on="true"] path { stroke-dashoffset: 0; }
.isc-toast { animation: isc-toast ${TOAST_MS}ms cubic-bezier(.23,1,.32,1) both; }
@keyframes isc-toast {
  0% { opacity: 0; transform: translate(-50%, 16px) scale(.94); }
  14% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  82% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, 8px) scale(.98); }
}
@media (prefers-reduced-motion: reduce) {
  .isc-icon, .isc-check path { transition: opacity .15s; transform: none !important; filter: none !important; stroke-dashoffset: 0; }
  .isc-toast { animation-name: isc-toast-fade; }
  @keyframes isc-toast-fade { 0%, 100% { opacity: 0; transform: translate(-50%, 0); } 14%, 82% { opacity: 1; transform: translate(-50%, 0); } }
}`;

/** Dark or light, read from the text color around the card, so it follows any theme setup. */
function useIsDark(ref) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => {
      // Read the parent: the card sets its own text color.
      const el = ref.current?.parentElement ?? ref.current;
      const m = el && getComputedStyle(el).color.match(/[\d.]+/g);
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

/** Paints the foil: a flat metallic gray with fine grain, a soft sheen and a dashed hint
 * of the code's outline, like the printed guide on a real card. */
function paintFoil(ctx, w, h, dark) {
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = dark ? "#2b2b30" : "#cfcfd2";
  ctx.fillRect(0, 0, w, h);
  const sheen = ctx.createLinearGradient(0, 0, w, h);
  sheen.addColorStop(0, dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.35)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0)");
  sheen.addColorStop(1, dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.22)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
  // Grain.
  for (let i = 0; i < (w * h) / 14; i++) {
    const v = Math.random();
    ctx.fillStyle =
      v > 0.5 ? `rgba(255,255,255,${dark ? 0.05 : 0.18})` : `rgba(0,0,0,${dark ? 0.18 : 0.06})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
  // Dashed guide.
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.16)";
  const inset = 7;
  ctx.beginPath();
  ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, 7);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = dark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.36)";
  ctx.font = "500 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SCRATCH HERE", w / 2, h / 2);
}

export function ScratchMe({
  code,
  label,
  hint = "Scratch to reveal your code.",
  copiedText = "Copied. Paste it at checkout.",
  copyAgainText = "Click the code to copy it again.",
  toast = "Code copied",
  threshold = 0.5,
  brushSize = 26,
  shavings = true,
  onReveal,
  onCopy,
  className,
  style,
}) {
  const rootRef = useRef(null);
  const zoneRef = useRef(null);
  const foilRef = useRef(null);
  const dustRef = useRef(null);
  const ringRef = useRef(null);
  const dark = useIsDark(rootRef);

  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [focused, setFocused] = useState(false);
  const [toastKey, setToastKey] = useState(0); // bumps on every copy to replay the pop
  const copiedTimer = useRef(0);

  const st = useRef({
    w: 0,
    h: 0,
    dpr: 1,
    last: null,
    down: false,
    pieces: [],
    raf: 0,
    clearing: 0, // time the final clear started
    reduced: false,
    lastSample: 0,
    revealed: false,
    started: false,
    skipClick: false, // the click that follows the revealing pointerup
  });

  const need = Math.min(0.9, Math.max(0.3, threshold));

  /* ---------- clipboard ---------- */

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Older browsers or blocked permission: fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      ta.remove();
    }
    setCopied(true);
    setToastKey((k) => k + 1);
    // After 2 seconds the check turns back into the copy icon: it can be copied again.
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    onCopy?.(code);
  }, [code, onCopy]);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  /* ---------- drawing loop ---------- */

  const frame = useCallback(() => {
    const s = st.current;
    const dust = dustRef.current?.getContext("2d");
    const foil = foilRef.current?.getContext("2d");
    let busy = false;

    // Final clear: the leftover foil fades and breaks up.
    if (s.clearing && foil) {
      const t = Math.min(1, (performance.now() - s.clearing) / CLEAR_MS);
      foilRef.current.style.opacity = String(1 - t);
      foilRef.current.style.filter = s.reduced ? "" : `blur(${(t * 3).toFixed(2)}px)`;
      if (t < 1) busy = true;
    }

    if (dust) {
      const W = dustRef.current.width / s.dpr;
      const H = dustRef.current.height / s.dpr;
      dust.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      dust.clearRect(0, 0, W, H);
      for (const p of s.pieces) {
        if (!p.landed) {
          p.vy += GRAVITY;
          p.vx *= 0.97;
          p.x += p.vx;
          p.y += p.vy;
          p.spin += p.vx * 0.2;
          const floor = H - p.r - Math.random() * 3; // lands a little unevenly, so it piles
          if (p.y >= floor) {
            p.y = floor;
            p.landed = true;
          } else busy = true;
        }
        if (s.revealed && p.landed) {
          p.a -= 0.012; // the pile fades after the reveal
          if (p.a > 0) busy = true;
        }
        if (p.a <= 0) continue;
        dust.save();
        dust.translate(p.x, p.y);
        dust.rotate(p.spin);
        dust.globalAlpha = p.a;
        dust.fillStyle = dark
          ? `hsl(240 4% ${22 + p.tone * 18}%)`
          : `hsl(240 3% ${70 + p.tone * 16}%)`;
        dust.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        dust.restore();
      }
      s.pieces = s.pieces.filter((p) => p.a > 0);
    }

    s.raf = busy ? requestAnimationFrame(frame) : 0;
  }, [dark]);

  const wake = useCallback(() => {
    if (!st.current.raf) st.current.raf = requestAnimationFrame(frame);
  }, [frame]);

  /* ---------- size and foil ---------- */

  const resetFoil = useCallback(() => {
    const s = st.current;
    const zone = zoneRef.current;
    const foil = foilRef.current;
    const dust = dustRef.current;
    const root = rootRef.current;
    if (!zone || !foil || !dust || !root) return;
    s.dpr = Math.min(2, window.devicePixelRatio || 1);
    s.w = zone.clientWidth;
    s.h = zone.clientHeight;
    foil.width = Math.round(s.w * s.dpr);
    foil.height = Math.round(s.h * s.dpr);
    dust.width = Math.round(root.clientWidth * s.dpr);
    dust.height = Math.round(root.clientHeight * s.dpr);
    const ctx = foil.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    paintFoil(ctx, s.w, s.h, dark);
  }, [dark]);

  useEffect(() => {
    const s = st.current;
    s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Paint the foil until the first scratch; after that a resize only resizes the shavings layer.
    const fit = () => {
      if (s.revealed) return;
      if (!s.started) resetFoil();
      else if (dustRef.current && rootRef.current) {
        dustRef.current.width = Math.round(rootRef.current.clientWidth * s.dpr);
        dustRef.current.height = Math.round(rootRef.current.clientHeight * s.dpr);
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (zoneRef.current) ro.observe(zoneRef.current);
    return () => ro.disconnect();
  }, [resetFoil]);

  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  /* ---------- scratching ---------- */

  const measure = () => {
    const s = st.current;
    const ctx = foilRef.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;
    const data = ctx.getImageData(0, 0, foilRef.current.width, foilRef.current.height).data;
    const step = Math.round(SAMPLE_STEP * s.dpr);
    let clear = 0;
    let total = 0;
    for (let y = 0; y < foilRef.current.height; y += step)
      for (let x = 0; x < foilRef.current.width; x += step) {
        total++;
        if (data[(y * foilRef.current.width + x) * 4 + 3] < 128) clear++;
      }
    return total ? clear / total : 0;
  };

  const scratch = (x, y) => {
    const s = st.current;
    const ctx = foilRef.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const from = s.last ?? { x, y };
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = ctx.fillStyle = "#000"; // fully opaque, so it fully erases
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
    // A ragged edge: a few tiny bites around the brush.
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = brushSize / 2 + Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    // Shavings: more when you move faster.
    const dist = Math.hypot(x - from.x, y - from.y);
    if (shavings && !s.reduced && dist > 0.5) {
      const zone = zoneRef.current.getBoundingClientRect();
      const root = rootRef.current.getBoundingClientRect();
      const ox = zone.left - root.left;
      const oy = zone.top - root.top;
      const n = Math.min(4, 1 + Math.floor(dist / 6));
      for (let i = 0; i < n && s.pieces.length < MAX_SHAVINGS; i++) {
        s.pieces.push({
          x: ox + x + (Math.random() - 0.5) * brushSize * 0.6,
          y: oy + y + (Math.random() - 0.5) * brushSize * 0.6,
          vx: (x - from.x) * 0.15 + (Math.random() - 0.5) * 1.6,
          vy: -Math.random() * 1.6,
          r: 0.6 + Math.random() * 1.3,
          spin: Math.random() * Math.PI,
          a: 0.9,
          tone: Math.random(),
          landed: false,
        });
      }
      wake();
    }
    s.last = { x, y };

    const now = performance.now();
    if (now - s.lastSample > 120) {
      s.lastSample = now;
      setProgress(measure());
    }
  };

  const reveal = useCallback(() => {
    const s = st.current;
    if (s.revealed) return;
    s.revealed = true;
    s.clearing = performance.now();
    if (ringRef.current) ringRef.current.style.opacity = "0";
    setRevealed(true);
    setProgress(1);
    onReveal?.(code);
    copy();
    wake();
  }, [code, copy, onReveal, wake]);

  const point = (e) => {
    const r = zoneRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const moveRing = (e, show) => {
    const ring = ringRef.current;
    if (!ring) return;
    const p = point(e);
    ring.style.transform = `translate(${p.x - brushSize / 2}px, ${p.y - brushSize / 2}px)`;
    ring.style.opacity = show && e.pointerType === "mouse" && !st.current.revealed ? "1" : "0";
  };

  const onDown = (e) => {
    e.preventDefault(); // never start a text selection from the card
    if (st.current.revealed || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    st.current.down = true;
    st.current.started = true;
    st.current.last = null;
    const p = point(e);
    scratch(p.x, p.y);
  };

  const onMove = (e) => {
    moveRing(e, true);
    if (!st.current.down || st.current.revealed) return;
    const p = point(e);
    scratch(p.x, p.y);
  };

  const onUp = () => {
    const s = st.current;
    if (!s.down) return;
    s.down = false;
    s.last = null;
    const done = measure();
    setProgress(done);
    if (done >= need) {
      s.skipClick = true;
      reveal();
    }
  };

  const ink = dark ? "#f4f4f5" : "#111113";
  const muted = dark ? "rgba(244,244,245,0.55)" : "rgba(17,17,19,0.55)";

  return (
    <div
      ref={rootRef}
      className={className ? `isc-root ${className}` : "isc-root"}
      // The code is copied only by clicking it, never by selecting it as text.
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onContextMenu={(e) => !revealed && e.preventDefault()}
      style={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        maxWidth: "100%",
        paddingBottom: 14, // room for the shavings to pile up
        color: ink,
        ...style,
      }}
    >
      <style>{CSS}</style>
      {label && <p style={{ margin: 0, fontSize: 13, color: muted }}>{label}</p>}

      <div
        ref={zoneRef}
        role="button"
        tabIndex={0}
        aria-label={
          revealed
            ? `Code ${code}. Press to copy again.`
            : "Scratch card. Press Enter to reveal the code."
        }
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={(e) => moveRing(e, false)}
        onClick={() => {
          if (st.current.skipClick) st.current.skipClick = false;
          else if (revealed) copy();
        }}
        onFocus={(e) => setFocused(e.currentTarget.matches(":focus-visible"))}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (revealed) copy();
            else reveal();
          }
        }}
        style={{
          position: "relative",
          height: 64,
          minWidth: 260,
          maxWidth: "100%",
          padding: "0 18px 0 24px",
          borderRadius: 12,
          background: dark ? "#1c1c1f" : "#f4f4f5",
          boxShadow: focused
            ? `inset 0 0 0 2px ${dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)"}`
            : dark
              ? "inset 0 0 0 1px rgba(255,255,255,0.08)"
              : "inset 0 0 0 1px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          cursor: revealed ? "copy" : "none",
          touchAction: "none",
          outline: "none",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontSize: "clamp(18px, 5.5vw, 22px)",
            fontWeight: 500,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            transform: revealed ? "scale(1)" : "scale(0.97)",
            transformOrigin: "left center",
            transition: "transform .45s cubic-bezier(.23,1,.32,1)",
          }}
        >
          {code}
        </span>
        <span
          aria-hidden
          style={{
            display: "grid",
            flex: "none",
            color: dark ? "rgba(244,244,245,0.45)" : "rgba(17,17,19,0.35)",
          }}
        >
          <svg
            className="isc-icon"
            data-on={!copied}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <rect
              x="6.5"
              y="6.5"
              width="10"
              height="10"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M13.5 4.5v-.25A1.75 1.75 0 0 0 11.75 2.5h-6A2.75 2.75 0 0 0 3 5.25v6.5c0 .97.78 1.75 1.75 1.75H5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <svg
            className="isc-icon isc-check"
            data-on={copied}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 10.5l3.2 3.2L15 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <canvas
          ref={foilRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
        <div
          ref={ringRef}
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: brushSize,
            height: brushSize,
            borderRadius: "50%",
            border: `1px solid ${dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.45)"}`,
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity .15s",
          }}
        />
      </div>

      <p
        aria-live="polite"
        style={{
          margin: 0,
          fontSize: 12.5,
          lineHeight: 1.45,
          color: muted,
          display: "flex",
          gap: 6,
          alignItems: "center",
          minHeight: 18,
          textAlign: "center",
        }}
      >
        {copied ? (
          copiedText
        ) : revealed ? (
          copyAgainText
        ) : (
          <>
            {hint}
            {progress > 0.02 && !revealed && (
              <span style={{ fontVariantNumeric: "tabular-nums", opacity: 0.8 }}>
                {Math.round(Math.min(progress / need, 1) * 100)}%
              </span>
            )}
          </>
        )}
      </p>

      <canvas
        ref={dustRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {toast != null &&
        toastKey > 0 &&
        createPortal(
          <div
            key={toastKey}
            className="isc-toast"
            role="status"
            onAnimationEnd={() => setToastKey(0)}
            style={{
              position: "fixed",
              left: "50%",
              bottom: "max(24px, env(safe-area-inset-bottom))",
              zIndex: 2147483000,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 14px 9px 11px",
              borderRadius: 999,
              background: dark ? "#f4f4f5" : "#111113",
              color: dark ? "#111113" : "#f4f4f5",
              fontSize: 13.5,
              fontWeight: 500,
              lineHeight: 1,
              whiteSpace: "nowrap",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.35)",
              pointerEvents: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="7" fill="currentColor" opacity=".15" />
              <path
                d="M5 8.3l2 2L11 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {toast}
          </div>,
          document.body,
        )}
    </div>
  );
}
