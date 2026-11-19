"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { TV } from "@/generated/items/tv";
import { Arrow } from "./icons";

/**
 * One card on /components: a picture of the item, its name, its kind and its short line.
 *
 * Speed first: at rest a card is only a small still picture (public/previews/<slug>-light.webp
 * and -dark.webp, made by scripts/previews.mjs), so the page downloads no item code at all.
 * Hovering a card (mouse) or tabbing to it loads that one item's live iMac channel and pulls it
 * into focus over the still; leaving lets it go again, so at most one live preview runs at a time.
 * Phones keep the stills (no hover, and it saves their battery).
 * An item without a still yet (just added) plays its channel while it is on screen instead,
 * so a card is never blank. Skills have no channel: they show a small SKILL.md sheet.
 */
export function LibraryCard({
  slug,
  name,
  kind,
  blurb,
  still,
  index,
}: {
  slug: string;
  name: string;
  kind: string;
  blurb: string;
  /** True when public/previews/<slug>-light.webp and -dark.webp exist. */
  still: boolean;
  /** Its place in the list, for the short stagger when the page opens. */
  index: number;
}) {
  const Show = TV[slug];
  const [live, setLive] = useState(false); // the channel is mounted
  const [shown, setShown] = useState(false); // and pulled into focus
  const [run, setRun] = useState(0);
  const ref = useRef<HTMLAnchorElement>(null);
  const timer = useRef(0);
  const want = useRef(false); // still wanted when its code arrives?

  // No still yet: play while the card is on screen (or near it), stop once it scrolls away.
  useEffect(() => {
    if (still || !Show || !ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      want.current = e.isIntersecting;
      setLive(e.isIntersecting);
      if (!e.isIntersecting) setShown(false);
    }, { rootMargin: "200px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [still, Show]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const wake = () => {
    if (!Show || !still || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearTimeout(timer.current);
    // A short wait, so sweeping the mouse across the grid doesn't load every card on the way.
    timer.current = window.setTimeout(() => {
      want.current = true;
      setLive(true);
    }, 90);
  };
  const sleep = () => {
    if (!still) return;
    clearTimeout(timer.current);
    want.current = false;
    setShown(false);
    // Let it fade out before it goes.
    timer.current = window.setTimeout(() => setLive(false), 280);
  };

  return (
    <Link
      ref={ref}
      href={`/docs/${slug}`}
      className="lib-card card press group relative flex w-full flex-col rounded-2xl p-1.5 outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--brand-500)]"
      style={{ "--i": index } as React.CSSProperties}
      data-live={shown || undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && wake()}
      onPointerLeave={(e) => e.pointerType === "mouse" && sleep()}
      // Keyboard focus only: a tap on a phone focuses the link too, right before it opens the page.
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && wake()}
      onBlur={sleep}
    >
      {/* The picture. 10px corners: the card's 16px minus its 6px padding. */}
      <div className="lib-shot relative aspect-[3/2] overflow-hidden rounded-[10px] bg-[var(--panel-2)]">
        {still ? (
          <>
            <img
              src={`/previews/${slug}-light.webp`}
              alt=""
              width={996}
              height={664}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="lib-still absolute inset-0 size-full object-cover dark:hidden"
            />
            <img
              src={`/previews/${slug}-dark.webp`}
              alt=""
              width={996}
              height={664}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="lib-still absolute inset-0 hidden size-full object-cover dark:block"
            />
          </>
        ) : (
          !Show && <SkillSheet />
        )}

        {live && Show && (
          // The live channel never takes clicks: the whole card is the link, and a channel's
          // own buttons (some burn or redraw the whole page) only belong on the item's page.
          <div className="lib-live pointer-events-none absolute inset-0 [container-type:inline-size]" data-shown={shown || undefined} aria-hidden="true">
            <Suspense fallback={null}>
              <Show key={run} onReplay={() => setRun((r) => r + 1)} />
              <Ready onReady={() => requestAnimationFrame(() => want.current && setShown(true))} />
            </Suspense>
          </div>
        )}
      </div>

      <div className="px-2.5 pt-3 pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-medium text-[var(--fg)]">{name}</h2>
          <Arrow className="lib-arrow size-3.5 shrink-0 text-[var(--accent)]" />
          <span className="ml-auto shrink-0 text-xs text-[var(--faint)]">{kind}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-pretty text-[var(--muted)]">{blurb}</p>
      </div>
    </Link>
  );
}

/** Renders once the channel's code has arrived (it sits in the same Suspense), so the fade starts on a ready picture. */
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/** A skill's picture: the SKILL.md file you drop into your AI tool, drawn in CSS (nothing to download). */
function SkillSheet() {
  return (
    <div className="dots absolute inset-0 grid place-items-center">
      <div className="lib-sheet card w-[46%] rounded-lg p-3">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--muted)]">
          <span className="size-1.5 rounded-full bg-[var(--accent)]" />
          SKILL.md
        </div>
        <div className="mt-2.5 space-y-1.5" aria-hidden="true">
          <div className="h-1.5 w-[85%] rounded-full bg-[var(--line)]" />
          <div className="h-1.5 w-[65%] rounded-full bg-[var(--line)]" />
          <div className="h-1.5 w-[75%] rounded-full bg-[var(--line)]" />
          <div className="h-1.5 w-[45%] rounded-full bg-[var(--line)]" />
        </div>
      </div>
    </div>
  );
}
