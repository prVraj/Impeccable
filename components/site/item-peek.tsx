"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** What an item's card shows: a still picture, its name and one or two lines about it. */
export type ItemPeekData = { name: string; blurb: string; still?: string };

/* The same timing as the group card and the Intent sidebar's hover card, so the site feels like the item. */
const OPEN_DELAY = 400; // rest on an item this long before the first card shows
const CLOSE_DELAY = 150; // leaving an item for a gap between rows doesn't drop the card at once
const SKIP_WINDOW = 300; // pointing at an item this soon after a card closed opens its card at once
const WIDTH = 280;

/**
 * The hover card on every item in the side panel (Text mirroring, Password Strength...).
 * Rest on an item and a card shows its still, its name and its blurb (two lines at most), so
 * you know what it is before you click. Moving to the next item moves the card there at once.
 * The card only informs: it never catches the pointer (the item itself opens the page), so it
 * can't get in the way of the list. Tabbing to an item shows its card too.
 * Pointer only: phones and tablets never see it. It stays away while the group card is open.
 * It finds the items by their data-peek-item attribute (SideLink sets it).
 */
export function ItemPeek({ items }: { items: Record<string, ItemPeekData> }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const cardEl = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<{ slug: string; top: number; left: number; show: boolean; glide: boolean } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // The card's height eases to fit the next item (a one-line blurb is shorter than a two-line one).
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [card?.slug, mounted]);

  useEffect(() => {
    const aside = anchor.current?.closest("aside");
    if (!aside) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let shown = false;
    let current: Element | null = null;
    let warmUntil = 0;
    let openT: number | undefined;
    let closeT: number | undefined;

    const groupOpen = () => !!document.querySelector('.group-peek[data-show="true"]');
    const spot = (el: Element) => {
      const r = el.getBoundingClientRect();
      const a = aside.getBoundingClientRect();
      const h = cardEl.current?.offsetHeight ?? 260;
      // The card's picture sits level with the item, moved up just enough to stay on screen.
      const top = Math.max(8, Math.min(r.top - 6, window.innerHeight - 8 - h));
      return { top, left: a.right + 8 };
    };
    const show = (el: Element) => {
      const slug = el.getAttribute("data-peek-item")!;
      if (!items[slug]) return;
      clearTimeout(openT);
      clearTimeout(closeT);
      current = el;
      const s = spot(el);
      if (shown) return setCard({ slug, ...s, show: true, glide: true });
      shown = true;
      setCard({ slug, ...s, show: false, glide: false });
      requestAnimationFrame(() => requestAnimationFrame(() => setCard((c) => (c && c.slug === slug && shown ? { ...c, show: true } : c))));
    };
    const hide = (now = false) => {
      clearTimeout(openT);
      clearTimeout(closeT);
      const go = () => {
        if (shown) warmUntil = performance.now() + SKIP_WINDOW;
        shown = false;
        current = null;
        setCard((c) => (c ? { ...c, show: false, glide: false } : c));
      };
      if (now) go();
      else closeT = window.setTimeout(go, CLOSE_DELAY);
    };

    const item = (t: EventTarget | null) => (t instanceof Element ? t.closest("[data-peek-item]") : null);
    const over = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !fine) return;
      const el = item(e.target);
      if (!el || el === item(e.relatedTarget)) return;
      clearTimeout(openT);
      clearTimeout(closeT);
      if (groupOpen()) return;
      if (shown || performance.now() < warmUntil) show(el);
      else openT = window.setTimeout(() => !groupOpen() && show(el), OPEN_DELAY);
    };
    const out = (e: PointerEvent) => {
      const el = item(e.target);
      if (!el || el === item(e.relatedTarget)) return;
      clearTimeout(openT);
      if (shown) hide();
    };
    // Keyboard: the card follows focus, but only focus from the keyboard (a click focuses too).
    const focusIn = (e: FocusEvent) => {
      const el = item(e.target);
      if (el && el.matches(":focus-visible")) show(el);
    };
    const focusOut = (e: FocusEvent) => {
      if (item(e.target) && !item(e.relatedTarget)) hide(true);
    };
    // Clicking an item, scrolling the panel or resizing the window puts the card away.
    const press = () => shown && hide(true);
    const keys = (e: KeyboardEvent) => e.key === "Escape" && shown && hide(true);
    // The group card opening takes over.
    const watch = new MutationObserver(() => shown && groupOpen() && hide(true));
    watch.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-show"] });

    aside.addEventListener("pointerover", over);
    aside.addEventListener("pointerout", out);
    aside.addEventListener("pointerdown", press);
    aside.addEventListener("focusin", focusIn);
    aside.addEventListener("focusout", focusOut);
    aside.addEventListener("scroll", press, true);
    window.addEventListener("resize", press);
    window.addEventListener("keydown", keys);
    return () => {
      aside.removeEventListener("pointerover", over);
      aside.removeEventListener("pointerout", out);
      aside.removeEventListener("pointerdown", press);
      aside.removeEventListener("focusin", focusIn);
      aside.removeEventListener("focusout", focusOut);
      aside.removeEventListener("scroll", press, true);
      window.removeEventListener("resize", press);
      window.removeEventListener("keydown", keys);
      watch.disconnect();
      clearTimeout(openT);
      clearTimeout(closeT);
    };
  }, [items]);

  const it = card ? items[card.slug] : undefined;

  return (
    <>
      <span ref={anchor} hidden />
      {mounted &&
        card &&
        it &&
        createPortal(
          <div
            ref={cardEl}
            className="item-peek card fixed top-0 left-0 z-[60] rounded-xl"
            data-show={card.show}
            data-glide={card.glide}
            aria-hidden="true"
            style={{ width: WIDTH, height: height ?? undefined, translate: `${card.left}px ${card.top}px` }}
          >
            <div ref={inner} className="p-1.5">
              {/* 6px corners: the card's 12px minus its 6px padding. */}
              <div className="item-peek-shot relative aspect-[3/2] overflow-hidden bg-[var(--panel-2)]">
                {it.still && (
                  <span key={it.still} className="item-peek-still">
                    <img src={`/previews/${it.still}-light.webp`} alt="" width={996} height={664} decoding="async" draggable={false} className="absolute inset-0 size-full object-cover dark:hidden" />
                    <img src={`/previews/${it.still}-dark.webp`} alt="" width={996} height={664} decoding="async" draggable={false} className="absolute inset-0 hidden size-full object-cover dark:block" />
                  </span>
                )}
              </div>
              <div key={card.slug} className="item-peek-text px-2 pt-2.5 pb-2">
                <p className="truncate text-label-14 font-medium text-[var(--fg)]">{it.name}</p>
                <p className="item-peek-blurb mt-0.5 text-copy-13 text-[var(--muted)]">{it.blurb}</p>
              </div>
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
.item-peek{background:var(--sheet,var(--bg));overflow:hidden;pointer-events:none;opacity:0;transform-origin:left center;transition:opacity .18s ease,scale .22s var(--ease-out)}
.item-peek[data-show="true"]{opacity:1}
.item-peek[data-show="false"]{scale:.97}
.item-peek[data-glide="true"]{transition:opacity .18s ease,scale .22s var(--ease-out),translate 260ms var(--ease-out),height 260ms var(--ease-out)}
.item-peek-shot{border-radius:6px}
.item-peek-shot::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px var(--line);pointer-events:none}
.item-peek-still{position:absolute;inset:0;animation:item-peek-fade .2s ease both}
.item-peek-blurb{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-wrap:pretty}
.item-peek-text{animation:item-peek-in .22s var(--ease-out) both}
@keyframes item-peek-fade{from{opacity:0}to{opacity:1}}
@keyframes item-peek-in{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.item-peek,.item-peek[data-glide="true"]{transition:opacity .12s ease}.item-peek[data-show="false"]{scale:1}.item-peek-text{animation:none}}
`;
