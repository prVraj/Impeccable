"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { setGroupOpen, useGroupState } from "./group-state";

/** One sidebar group's card: its name, how many items it has, and its 5 newest items. */
export type GroupPeekData = { id: string; label: string; count: number; newest: { slug: string; name: string; added: string }[] };

/* The same timing as the Intent sidebar's hover card (items/intent-sidebar), so the site feels like the item. */
const OPEN_DELAY = 400; // rest on a group this long before the first card shows
const CLOSE_DELAY = 300; // the card stays this long after the pointer leaves the group and the card
const SKIP_WINDOW = 300; // pointing at a group this soon after a card closed opens its card at once
const REST_MS = 500; // on the way to the card, a heading counts only after the pointer rests on it this long
const WIDTH = 272;

type Pt = { x: number; y: number };
const side = (p: Pt, a: Pt, b: Pt) => (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
function inTriangle(p: Pt, a: Pt, b: Pt, c: Pt) {
  const d = [side(p, a, b), side(p, b, c), side(p, c, a)];
  return !(d.some((x) => x < 0) && d.some((x) => x > 0));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (added: string) => `${MONTHS[Number(added.slice(5, 7)) - 1]} ${Number(added.slice(8, 10))}`;

/**
 * The hover card on the side panel's group headings (Components, Intentional, Buttons...).
 * Rest on a heading and a card shows that group's 5 newest items, plus "+N" for the rest.
 * Moving to another heading moves the card there at once. An item opens its page.
 * "+N" opens the group's list in the side panel; when it is already open, the list scrolls
 * into view and glows for a moment, so you see where it is.
 * Pointer only: phones and tablets never see it (the side panel is desktop only anyway).
 * It finds the headings by their data-peek-group attribute (SideDropdown sets it).
 */
export function GroupPeek({ groups }: { groups: GroupPeekData[] }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const cardEl = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<{ id: string; top: number; left: number; show: boolean; glide: boolean } | null>(null);
  const shown = useRef(false);
  const warmUntil = useRef(0);
  const openT = useRef<number | undefined>(undefined);
  const closeT = useRef<number | undefined>(undefined);
  const open = useGroupState("side");
  const openRef = useRef(open);
  openRef.current = open;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // The card's height eases to fit the next group (a group with fewer items is shorter).
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [card?.id, mounted]);

  useEffect(() => {
    const aside = anchor.current?.closest("aside");
    if (!aside || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const spot = (head: Element) => {
      const r = head.getBoundingClientRect();
      const a = aside.getBoundingClientRect();
      const top = Math.max(8, Math.min(r.top - 8, window.innerHeight - 8 - (cardEl.current?.offsetHeight ?? 300)));
      return { top, left: a.right + 8 };
    };
    const show = (head: Element) => {
      const id = head.getAttribute("data-peek-group")!;
      clearTimeout(openT.current);
      clearTimeout(closeT.current);
      const s = spot(head);
      if (shown.current) return setCard({ id, ...s, show: true, glide: true });
      shown.current = true;
      setCard({ id, ...s, show: false, glide: false });
      requestAnimationFrame(() => requestAnimationFrame(() => setCard((c) => (c && c.id === id && shown.current ? { ...c, show: true } : c))));
    };
    const hide = (now = false) => {
      clearTimeout(openT.current);
      clearTimeout(closeT.current);
      const go = () => {
        if (shown.current) warmUntil.current = performance.now() + SKIP_WINDOW;
        shown.current = false;
        current = null;
        from = null;
        setCard((c) => (c ? { ...c, show: false, glide: false } : c));
      };
      if (now) go();
      else closeT.current = window.setTimeout(go, CLOSE_DELAY);
    };
    hideRef.current = hide;

    const head = (t: EventTarget | null) => (t instanceof Element ? t.closest("[data-peek-group]") : null);
    /* The safe triangle: heading from a group's name down to its card (to +N at the bottom) can cross
       other group names. Inside the triangle from where the pointer left its heading to the card's
       near corners they are ignored, unless the pointer rests on one for REST_MS. */
    let current: Element | null = null; // the heading the card shows
    let from: Pt | null = null; // the pointer's last spot on that heading
    let lastHead: Element | null = null; // the heading the pointer last moved on, and where
    let lastPt: Pt | null = null;
    let pending: Element | null = null;
    let restT: number | undefined;
    const aiming = (p: Pt) => {
      const el = cardEl.current;
      const a = from ?? (lastHead && lastHead === current ? lastPt : null);
      if (!a || !el || !shown.current) return false;
      const r = el.getBoundingClientRect();
      return p.x < r.left && inTriangle(p, { x: a.x - 4, y: a.y }, { x: r.left, y: r.top - 8 }, { x: r.left, y: r.bottom + 8 });
    };
    const drop = () => {
      clearTimeout(restT);
      pending = null;
    };
    const wait = (h: Element) => {
      clearTimeout(restT);
      pending = h;
      restT = window.setTimeout(() => {
        pending = null;
        current = h;
        show(h);
      }, REST_MS);
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const h = head(e.target);
      if (!h || h === head(e.relatedTarget)) return;
      clearTimeout(closeT.current);
      clearTimeout(openT.current);
      drop();
      if (current && current !== h && aiming({ x: e.clientX, y: e.clientY })) return wait(h);
      if (shown.current || performance.now() < warmUntil.current) {
        current = h;
        show(h);
      } else
        openT.current = window.setTimeout(() => {
          current = h;
          show(h);
        }, OPEN_DELAY);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const h = head(e.target);
      const p = { x: e.clientX, y: e.clientY };
      if (h && h !== pending) {
        lastHead = h;
        lastPt = p;
      }
      if (h && h === current) from = p;
      else if (h && h === pending) {
        if (aiming(p)) wait(h);
        else {
          drop();
          current = h;
          show(h);
        }
      }
    };
    const out = (e: PointerEvent) => {
      const h = head(e.target);
      if (!h || h === head(e.relatedTarget)) return;
      if (h === pending) drop();
      if (cardEl.current?.contains(e.relatedTarget as Node)) return;
      clearTimeout(openT.current);
      if (shown.current) hide();
    };
    dropRef.current = drop;
    // Opening or closing a group by its heading, or scrolling the panel, puts the card away.
    const press = (e: PointerEvent) => head(e.target) && hide(true);
    const scroll = () => shown.current && hide(true);
    aside.addEventListener("pointerover", over);
    aside.addEventListener("pointerout", out);
    aside.addEventListener("pointermove", move);
    aside.addEventListener("pointerdown", press);
    aside.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", scroll);
    return () => {
      aside.removeEventListener("pointerover", over);
      aside.removeEventListener("pointerout", out);
      aside.removeEventListener("pointermove", move);
      clearTimeout(restT);
      aside.removeEventListener("pointerdown", press);
      aside.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", scroll);
      clearTimeout(openT.current);
      clearTimeout(closeT.current);
    };
  }, []);
  const hideRef = useRef<(now?: boolean) => void>(() => {});
  const dropRef = useRef<() => void>(() => {});

  /** "+N": open the group's list, or, when it is open already, bring it into view and make it glow. */
  const reveal = (id: string) => {
    hideRef.current(true);
    const list = document.querySelector<HTMLElement>(`[data-peek-list="${id}"]`);
    const head = document.querySelector<HTMLElement>(`[data-peek-group="${id}"]`);
    const wasOpen = openRef.current[id] ?? true;
    if (!wasOpen) setGroupOpen("side", id, true);
    // Wait for the list to finish opening (200ms) before measuring where it is.
    window.setTimeout(
      () => {
        head?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        if (wasOpen && list) {
          list.removeAttribute("data-glow");
          void list.offsetWidth; // restart the glow if it is still playing
          list.setAttribute("data-glow", "");
          window.setTimeout(() => list.removeAttribute("data-glow"), 1400);
        }
        head?.focus({ preventScroll: true });
      },
      wasOpen ? 0 : 220,
    );
  };

  const g = groups.find((x) => x.id === card?.id);
  const more = g ? g.count - g.newest.length : 0;

  return (
    <>
      <span ref={anchor} hidden />
      {mounted &&
        card &&
        g &&
        createPortal(
          <div
            ref={cardEl}
            className="group-peek card fixed top-0 left-0 z-[60] rounded-xl"
            data-show={card.show}
            data-glide={card.glide}
            role="group"
            aria-label={`${g.label}: recently added`}
            style={{ width: WIDTH, height: height ?? undefined, translate: `${card.left}px ${card.top}px` }}
            onPointerEnter={() => {
              clearTimeout(closeT.current);
              dropRef.current();
            }}
            onPointerLeave={() => hideRef.current()}
          >
            <div ref={inner} key={g.id} className="group-peek-in p-2">
              <div className="flex items-baseline gap-1.5 px-2.5 pt-1.5 pb-1">
                <span className="text-label-14 font-medium text-[var(--fg)]">{g.label}</span>
                <span className="text-label-12 text-[var(--muted)] tabular-nums">{g.count}</span>
              </div>
              <p className="px-2.5 pb-1.5 text-label-12 text-[var(--muted)]">Recently added</p>
              <ul>
                {g.newest.map((it) => (
                  <li key={it.slug}>
                    <Link
                      href={`/docs/${it.slug}`}
                      onClick={() => hideRef.current(true)}
                      className="flex items-center gap-3 rounded-md px-2.5 py-1.5 text-label-14 text-[var(--muted)] transition-colors hover:bg-[var(--panel-2)] hover:text-[var(--fg)]"
                    >
                      <span className="min-w-0 flex-1 truncate">{it.name}</span>
                      <span className="shrink-0 text-label-12 text-[var(--muted)] tabular-nums">{day(it.added)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {more > 0 && (
                <button
                  type="button"
                  onClick={() => reveal(g.id)}
                  aria-label={`Show all ${g.count} in ${g.label}`}
                  className="press mt-1 flex w-full items-center rounded-md px-2.5 py-1.5 text-label-13 font-medium text-[var(--muted)] tabular-nums transition-colors hover:bg-[var(--panel-2)] hover:text-[var(--fg)]"
                >
                  +{more} more
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
      <style>{CSS}</style>
    </>
  );
}

// Plain CSS so a running pnpm dev picks it up at once.
const CSS = `
.group-peek{background:var(--sheet,var(--bg));overflow:hidden;opacity:0;pointer-events:none;transform-origin:left center;transition:opacity .18s ease,scale .22s var(--ease-out)}
.group-peek[data-show="true"]{opacity:1;pointer-events:auto}
.group-peek[data-show="false"]{scale:.97}
.group-peek[data-glide="true"]{transition:opacity .18s ease,scale .22s var(--ease-out),translate 260ms var(--ease-out),height 260ms var(--ease-out)}
.group-peek-in{animation:group-peek-in .22s var(--ease-out) both}
@keyframes group-peek-in{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
[data-peek-list]{border-radius:8px}
[data-peek-list][data-glow]{animation:group-peek-glow 1.4s var(--ease-out) both}
@keyframes group-peek-glow{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 0%,transparent);background:transparent}
  25%{box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 35%,transparent),0 0 18px 2px color-mix(in srgb,var(--accent) 22%,transparent);background:color-mix(in srgb,var(--accent) 5%,transparent)}
  100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 0%,transparent);background:transparent}}
@media (prefers-reduced-motion:reduce){.group-peek,.group-peek[data-glide="true"]{transition:opacity .12s ease}.group-peek[data-show="false"]{scale:1}.group-peek-in{animation:none}}
`;
