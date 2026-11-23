"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { clickPop } from "./click-pop";
import { DEMO_COLOR, Pointer, TYPES } from "./demo";

const W = 600; // drawn at this width, scaled to the tube
const H = 400;
// Where the pointer clicks, one spot per type, all well inside the tube so no pop spills past its edge.
const SPOTS = [
  { x: 250, y: 215 },
  { x: 360, y: 175 },
  { x: 285, y: 150 },
  { x: 340, y: 230 },
  { x: 255, y: 200 },
];
const GLIDE_MS = 520; // pointer moving to the next spot
const SHOW_MS = 700; // the pop playing out before it moves on

/** A pointer clicking round the tube, popping each of the five types in turn, its name underneath. */
export default function ClickPopChannel() {
  const box = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [label, setLabel] = useState(TYPES[0].label);

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
    if (!cur) return;
    let alive = true;
    let p = { x: W + 30, y: H - 40 };
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const put = () => (cur.style.transform = `translate(${p.x}px, ${p.y}px)`);
    const glide = (to: { x: number; y: number }, ms: number) =>
      new Promise<void>((done) => {
        const a = p;
        const t0 = performance.now();
        const step = (now: number) => {
          if (!alive) return done();
          const t = Math.min(1, (now - t0) / ms);
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          p = { x: a.x + (to.x - a.x) * e, y: a.y + (to.y - a.y) * e };
          put();
          if (t < 1) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      });

    (async () => {
      put();
      await sleep(400);
      let i = 0;
      while (alive) {
        const t = TYPES[i % TYPES.length];
        await glide(SPOTS[i % SPOTS.length], GLIDE_MS);
        if (!alive) break;
        setLabel(t.label);
        const r = cur.getBoundingClientRect();
        const k = r.width / 22 || 1; // the drawn pointer is 22px at full size
        cur.dataset.press = "true";
        clickPop(r.left, r.top, { type: t.type, color: DEMO_COLOR, size: Math.max(0.8, k) }); // a touch bigger than true scale, so it reads on the small tube
        await sleep(120);
        delete cur.dataset.press;
        await sleep(SHOW_MS - 120);
        i++;
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div
          className="dots pointer-events-none absolute top-1/2 left-1/2"
          style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <span className="absolute inset-x-0 bottom-10 text-center text-[22px] font-medium text-[var(--muted)]">{label}</span>
          <div ref={cursor} className="pop-tv-cursor absolute top-0 left-0" style={{ transform: `translate(${W + 30}px, ${H - 40}px)` }}>
            <Pointer size={22} />
            <style>{`.pop-tv-cursor svg{transition:transform 120ms ease;transform-origin:0 0}.pop-tv-cursor[data-press="true"] svg{transform:scale(.85)}`}</style>
          </div>
        </div>
      </div>
    </Screen>
  );
}
