"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { ParticleWake } from "./particle-wake";

const W = 600; // drawn at this width, scaled to the tube
const H = 400;
const LAP_MS = 3400; // one figure eight through the word
const REST_MS = 1600; // the pointer waits off to the side while the dots drift home

/** A drawn pointer sweeping a figure eight through "Impeccable", then resting while the dots go home. */
export default function ParticleWakeChannel() {
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => el.clientWidth && setScale(Math.min(el.clientWidth / W, el.clientHeight / H));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const cur = cursor.current;
    const st = stage.current;
    if (!cur || !st) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now() + 900; // let the dots gather first
    const send = (type: string, x: number, y: number) => {
      const canvas = st.querySelector("canvas");
      if (!canvas) return;
      const r = st.getBoundingClientRect();
      const k = r.width / W;
      const target = type === "pointerleave" ? canvas.parentElement : canvas;
      target?.dispatchEvent(
        new PointerEvent(type, { bubbles: type !== "pointerleave", clientX: r.left + x * k, clientY: r.top + y * k, pointerType: "mouse" }),
      );
    };
    let inside = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) % (LAP_MS + REST_MS);
      let x: number;
      let y: number;
      if (now < t0 || t > LAP_MS) {
        x = W - 70;
        y = H - 70;
        if (inside) send("pointerleave", x, y);
        inside = false;
      } else {
        const a = (t / LAP_MS) * Math.PI * 2;
        x = W / 2 + Math.sin(a) * 250;
        y = H / 2 + Math.sin(a * 2) * 46 + 6;
        // Ease in from the rest spot over the first and last tenth of the lap.
        const edge = Math.min(1, t / (LAP_MS * 0.1), (LAP_MS - t) / (LAP_MS * 0.1));
        const e = edge * edge * (3 - 2 * edge);
        x = W - 70 + (x - (W - 70)) * e;
        y = H - 70 + (y - (H - 70)) * e;
        send("pointermove", x, y);
        inside = true;
      }
      cur.style.transform = `translate(${x}px, ${y}px)`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div
          ref={stage}
          className="dots pointer-events-none absolute top-1/2 left-1/2"
          style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <ParticleWake
            text="Impeccable"
            color="var(--fg)"
            gap={3}
            radius={60}
            className="font-bold tracking-tight"
            style={{ position: "absolute", inset: 0, aspectRatio: "auto", width: W, height: H }}
          />
          <div ref={cursor} className="absolute top-0 left-0" style={{ transform: `translate(${W - 70}px, ${H - 70}px)` }}>
            <svg width={22} height={22} viewBox="5 3 19 19" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
              <path d="M5 3l14 8.5-6.2 1.3L9.6 19z" fill="var(--fg)" stroke="var(--bg)" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </Screen>
  );
}
