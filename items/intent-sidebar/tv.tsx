"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { IntentSidebar, type IntentAction } from "./intent-sidebar";
import { DEMO_CHATS, DEMO_PROJECTS, applyAction, sectionsOf } from "./demo";

const W = 800; // drawn at a laptop width, scaled to the tube

/* What the pretend pointer can land on, most specific first. */
const SEL = ".isb-item, .isb-menu, .isb-all-item, .isb-more, .isb-file, .isb-card, .isb-dots, .isb-count, .isb-open, .isb-row, .isb-scrim, .isb-back";

/**
 * The sidebar playing itself: a pointer rests on a chat (the card opens), slides down (the card
 * follows), opens every file through +N, then opens ⋯ > Notifications and cuts diagonally across
 * Settings to the submenu without closing it. On touch screens it taps through the sheets instead.
 */
export default function IntentSidebarChannel() {
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 0.4, height: 500 });
  const [chats, setChats] = useState(DEMO_CHATS);
  const [open, setOpen] = useState<{ chat: string; file?: string }>({ chat: "logic", file: "plan" });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      if (!el.clientWidth) return;
      const scale = el.clientWidth / W;
      setFit({ scale, height: el.clientHeight / scale });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const st = stage.current;
    const cur = cursor.current;
    if (!st || !cur) return;
    let alive = true;
    const stay = (e: Event) => e.preventDefault();
    st.addEventListener("click", stay);
    const touch = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let p = { x: W + 40, y: 300 };
    let over: Element | null = null;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const k = () => st.getBoundingClientRect().width / W || 1;
    const client = () => {
      const r = st.getBoundingClientRect();
      return { clientX: r.left + p.x * k(), clientY: r.top + p.y * k() };
    };
    const at = (el: Element | null | undefined, fx = 0.5, fy = 0.5) => {
      if (!el) return p;
      const r = el.getBoundingClientRect();
      const s = st.getBoundingClientRect();
      return { x: (r.left - s.left + r.width * fx) / k(), y: (r.top - s.top + r.height * fy) / k() };
    };
    const q = (s: string) => st.querySelector(s);
    const qa = (s: string) => Array.from(st.querySelectorAll(s));
    const rowOf = (title: string) => qa(".isb-row").find((r) => r.textContent?.includes(title));
    const itemOf = (label: string) => qa(".isb-item").find((r) => r.textContent?.startsWith(label));
    const hit = () => {
      const c = client();
      const found = qa(SEL).filter((el) => {
        if (el.closest('.isb-card[data-show="false"], [data-closing="true"]')) return false;
        const r = el.getBoundingClientRect();
        return c.clientX >= r.left && c.clientX <= r.right && c.clientY >= r.top && c.clientY <= r.bottom;
      });
      return found.find((el) => !found.some((o) => o !== el && el.contains(o))) ?? null;
    };
    const ev = (type: string, extra: object = {}) => ({ bubbles: true, cancelable: true, pointerType: touch ? "touch" : "mouse", pointerId: 1, isPrimary: true, ...client(), ...extra });
    const emit = () => {
      cur.style.transform = `translate(${p.x}px, ${p.y}px)`;
      if (touch) return;
      const h = hit();
      if (h !== over) {
        over?.dispatchEvent(new PointerEvent("pointerout", ev("pointerout", { relatedTarget: h })));
        h?.dispatchEvent(new PointerEvent("pointerover", ev("pointerover", { relatedTarget: over })));
      }
      h?.dispatchEvent(new PointerEvent("pointermove", ev("pointermove")));
      over = h;
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
      el.dispatchEvent(new PointerEvent("pointerdown", ev("pointerdown", { button: 0 })));
      await sleep(140);
      el.dispatchEvent(new PointerEvent("pointerup", ev("pointerup", { button: 0 })));
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1, ...client() }));
      delete cur.dataset.press;
    };
    const reset = async () => {
      setChats(DEMO_CHATS);
      setOpen({ chat: "logic", file: "plan" });
      p = { x: W + 40, y: 300 };
      emit();
      await sleep(400);
    };

    (async () => {
      await sleep(900);
      while (alive) {
        await reset();
        if (touch) {
          // Phones: tap the file count, then ⋯ > Notifications, like a finger would.
          await glide(at(rowOf("Logic checkpoint")?.querySelector(".isb-count")), 1000);
          await click(rowOf("Logic checkpoint")?.querySelector(".isb-count"));
          await sleep(1800);
          await glide({ x: 420, y: 60 }, 700);
          await click(q(".isb-scrim"));
          await sleep(500);
          await glide(at(rowOf("Kitcut button")?.querySelector(".isb-dots")), 900);
          await click(rowOf("Kitcut button")?.querySelector(".isb-dots"));
          await sleep(900);
          await glide(at(itemOf("Notifications")), 800);
          await click(itemOf("Notifications"));
          await sleep(1600);
          await glide(at(q(".isb-back")), 700);
          await click(q(".isb-back"));
          await sleep(900);
          await glide({ x: 420, y: 60 }, 700);
          await click(q(".isb-scrim"));
          await sleep(900);
          continue;
        }
        // Rest on a chat: the card opens. Slide down: it follows, no new wait.
        await glide(at(rowOf("Impeccable UI roadmap"), 0.45), 1000);
        await sleep(1100);
        await glide(at(rowOf("Logic checkpoint"), 0.5), 520);
        await sleep(900);
        // Into the card and onto +N: every file in the chat.
        await glide(at(q(".isb-more")), 650);
        await sleep(1700);
        await glide(at(qa(".isb-all-item")[2]), 500);
        await click(qa(".isb-all-item")[2]);
        await sleep(900);
        // ⋯ on another chat, then Notifications, then cut diagonally across Settings to the submenu.
        await glide(at(rowOf("Kitcut button"), 0.6), 800);
        await glide(at(rowOf("Kitcut button")?.querySelector(".isb-dots")), 350);
        await sleep(250);
        await click(rowOf("Kitcut button")?.querySelector(".isb-dots"));
        await sleep(600);
        await glide(at(itemOf("Notifications"), 0.4), 700);
        await sleep(500);
        const target = qa(".isb-sub .isb-item")[1];
        if (target) await glide(at(target, 0.18, 0.55), 650);
        await sleep(900);
        await click(qa(".isb-sub .isb-item")[1]);
        await sleep(1400);
        await glide({ x: W + 40, y: 320 }, 900);
        await sleep(600);
      }
    })();
    return () => {
      alive = false;
      st.removeEventListener("click", stay);
    };
  }, []);

  const chat = chats.find((c) => c.id === open.chat);
  const file = chat?.files?.find((f) => f.id === open.file);

  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div
          ref={stage}
          className="pointer-events-none absolute top-0 left-0 flex origin-top-left"
          style={{ width: W, height: fit.height, transform: `scale(${fit.scale})` }}
        >
          <div className="flex w-[260px] shrink-0 flex-col bg-[var(--frame)] pt-5">
            <IntentSidebar
              sections={sectionsOf(chats)}
              activeId={open.chat}
              projects={DEMO_PROJECTS}
              onOpen={(id, f) => setOpen({ chat: id, file: f ?? chats.find((c) => c.id === id)?.files?.[0]?.id })}
              onAction={(id: string, action: IntentAction, value?: string) => setChats((cs) => applyAction(cs, id, action, value))}
            />
          </div>
          <div className="min-w-0 flex-1 border-l border-[var(--line)] p-10">
            <p className="text-label-12 text-[var(--muted)]">{chat?.project ?? "No project"}</p>
            <p className="mt-1 text-heading-24">{chat?.title}</p>
            {file && (
              <div key={file.id} className="mt-6 rounded-xl bg-[var(--panel-2)] p-6">
                <p className="text-heading-16">{file.name}</p>
                <p className="mt-2 text-copy-14 text-[var(--muted)]">{file.note}</p>
              </div>
            )}
          </div>
          <div ref={cursor} className="isb-tv-cursor absolute top-0 left-0 z-[70]" style={{ transform: `translate(${W + 40}px, 300px)` }}>
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 3l14 8.5-6.2 1.3L9.6 19z" fill="var(--fg)" stroke="var(--bg)" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <style>{`.isb-tv-cursor svg{transition:transform 140ms ease}.isb-tv-cursor[data-press="true"] svg{transform:scale(.82)}`}</style>
          </div>
        </div>
      </div>
    </Screen>
  );
}
