"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { PeekIndex } from "./peek-index";
import { DEMO_ITEMS, themed, useDark } from "./demo";

const W = 800; // drawn at a laptop width, scaled to the tube
const ITEMS = DEMO_ITEMS.slice(0, 3);

/** The index playing itself: a pointer drifts over the numbered rows (the picture follows it), opens one, then closes it with the −. */
export default function PeekIndexChannel() {
  const dark = useDark();
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 0.4, height: 500 });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      if (!el.clientWidth) return; // hidden tube (no width yet): keep the last fit instead of dividing by zero
      const scale = el.clientWidth / W;
      setFit({ scale, height: el.clientHeight / scale });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* The pretend pointer: it moves on the stage and sends the list the same pointer events a mouse would. */
  useEffect(() => {
    const st = stage.current;
    const cur = cursor.current;
    if (!st || !cur) return;
    let alive = true;
    // The pretend clicks bubble like real ones: never let them follow a link round the tube (the /components card is one).
    const stay = (e: Event) => e.preventDefault();
    st.addEventListener("click", stay);
    let p = { x: W + 40, y: 600 };
    let over: Element | null = null;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const k = () => st.getBoundingClientRect().width / W || 1;
    const client = () => {
      const r = st.getBoundingClientRect();
      return { clientX: r.left + p.x * k(), clientY: r.top + p.y * k() };
    };
    const local = (el: Element, fx: number, fy: number) => {
      const r = el.getBoundingClientRect();
      const s = st.getBoundingClientRect();
      return { x: (r.left - s.left + r.width * fx) / k(), y: (r.top - s.top + r.height * fy) / k() };
    };
    const panels = () => Array.from(st.querySelectorAll(".pki-panel"));
    const emit = () => {
      cur.style.transform = `translate(${p.x}px, ${p.y}px)`;
      const c = client();
      const hit =
        panels().find((el) => {
          const r = el.getBoundingClientRect();
          return c.clientX >= r.left && c.clientX <= r.right && c.clientY >= r.top && c.clientY <= r.bottom;
        }) ?? null;
      if (over && over !== hit) over.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse", relatedTarget: st, ...c }));
      if (hit) hit.dispatchEvent(new PointerEvent(over === hit ? "pointermove" : "pointerover", { bubbles: true, pointerType: "mouse", ...c }));
      if (hit && over !== hit) hit.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse", ...c }));
      over = hit;
    };
    const glide = (to: { x: number; y: number }, ms: number) =>
      new Promise<void>((done) => {
        const a = { ...p };
        const t0 = performance.now();
        const step = (now: number) => {
          if (!alive) return done();
          const t = Math.min(1, (now - t0) / ms);
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          p = { x: a.x + (to.x - a.x) * e, y: a.y + (to.y - a.y) * e };
          emit();
          if (t < 1) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      });
    const click = async (el: Element | null | undefined) => {
      if (!el || !alive) return;
      cur.dataset.press = "true";
      await sleep(140);
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1, ...client() }));
      delete cur.dataset.press;
    };
    const row = (i: number, fx: number) => local(panels()[i], fx, 0.5);

    (async () => {
      await sleep(900);
      while (alive) {
        p = { x: W + 40, y: 600 };
        emit();
        await glide(row(0, 0.72), 900);
        await glide(row(0, 0.32), 1500);
        await glide(row(1, 0.42), 700);
        await glide(row(1, 0.68), 1300);
        await sleep(250);
        await click(panels()[1]?.querySelector(".pki-head"));
        await sleep(3200);
        const x = st.querySelectorAll(".pki-icon")[1];
        if (x) await glide(local(x, 0.5, 0.5), 800);
        await sleep(200);
        await click(x);
        await sleep(1300);
        await glide(row(2, 0.6), 900);
        await glide(row(2, 0.3), 1300);
        await glide({ x: W + 40, y: 600 }, 900);
        await sleep(700);
      }
    })();
    return () => {
      alive = false;
      st.removeEventListener("click", stay);
    };
  }, []);

  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div
          ref={stage}
          className="pointer-events-none absolute top-0 left-0 flex origin-top-left items-center justify-center"
          style={{ width: W, height: fit.height, transform: `scale(${fit.scale})` }}
        >
          <div style={{ width: 660 }}>
            <PeekIndex items={themed(ITEMS, dark)} previewWidth={200} />
          </div>
          <div ref={cursor} className="peek-index-tv-cursor absolute top-0 left-0 z-10" style={{ transform: `translate(${W + 40}px, 600px)` }}>
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 3l14 8.5-6.2 1.3L9.6 19z" fill="var(--fg)" stroke="var(--bg)" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <style>{`.peek-index-tv-cursor svg{transition:transform 140ms ease}.peek-index-tv-cursor[data-press="true"] svg{transform:scale(.82)}`}</style>
          </div>
        </div>
      </div>
    </Screen>
  );
}
