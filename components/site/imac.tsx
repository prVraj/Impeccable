"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COMPONENTS } from "@/lib/site";
import { TV } from "@/generated/items/tv";
import type { ChannelProps } from "@/components/site/tv-screen";

/** How many of the newest items the iMac picks from. */
const NEWEST = 10;
/** How long each channel plays before the iMac tunes to another one on its own. */
const DWELL_MS = 5000;
/** A channel in the middle of a beat (see ChannelProps.onLoop) may finish it, but never hold the screen longer than this. */
const MAX_DWELL_MS = 12000;

/**
 * The 10 most recently added items (by `added` in each info.ts), newest first, so the home page
 * always shows what's new. Only things with a live demo get a channel (skills have none).
 * CH 01 is the newest; the iMac plays them in a random order.
 */
const CHANNELS = COMPONENTS.filter((c) => c.group !== "skills" && TV[c.slug])
  .sort((a, b) => b.added.localeCompare(a.added))
  .slice(0, NEWEST);

/** A fresh random order of every channel except `skip`, so each one plays once before any repeats. */
function shuffled(skip: number | null) {
  const order = CHANNELS.map((_, i) => i).filter((i) => i !== skip);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * A 1998-style translucent iMac (graphite gray), drawn in CSS. Its screen plays one component
 * from the library at a time and tunes to another random one every 5 seconds (or once the
 * channel's current beat has finished). Speakers flip channels, the power button replays,
 * and the CD slot is "I want this".
 */

/* Graphite gray for the translucent edges and speakers. */
const EDGE = "#8a9196";
const EDGE_DEEP = "#5b6267";

export function IMac() {
  const [channel, setChannel] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const [staticOn, setStaticOn] = useState(false);
  const [osd, setOsd] = useState(false);
  const timers = useRef<number[]>([]);
  const root = useRef<HTMLDivElement>(null);

  const now = useRef<number | null>(null); // the channel on screen, for the timers
  const bag = useRef<number[]>([]); // channels still to play in this random round
  const back = useRef<number[]>([]); // channels already played, for the left speaker
  const tuning = useRef(false); // static is on screen and a new channel is about to show

  /** A random channel that isn't `from`, without repeats until every channel has played. */
  const pick = (from: number | null) => {
    if (CHANNELS.length < 2) return 0;
    let next: number | undefined;
    do {
      if (!bag.current.length) bag.current = shuffled(from);
      next = bag.current.pop();
    } while (next === from);
    return next!;
  };

  const show = (c: number) => {
    now.current = c;
    setChannel(c);
  };

  // Pick a random channel once we're in the browser (keeps SSR stable).
  useEffect(() => {
    show(pick(null));
    flashOsd();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashOsd = () => {
    setOsd(true);
    timers.current.push(window.setTimeout(() => setOsd(false), 1800));
  };

  /** Right speaker (and the timer): a new random channel. Left speaker: the one before. */
  const tune = useCallback((dir: 1 | -1, auto = false) => {
    if (auto && tuning.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go = () => {
      tuning.current = false;
      const from = now.current;
      let to: number;
      if (dir === -1 && back.current.length) to = back.current.pop()!;
      else {
        to = pick(from);
        if (dir === 1 && from !== null) back.current = [...back.current, from].slice(-20);
      }
      show(to);
      setRun((r) => r + 1);
      setStaticOn(false);
      flashOsd();
    };
    if (reduced) return go();
    tuning.current = true;
    setStaticOn(true);
    timers.current.push(window.setTimeout(go, 260));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = channel === null ? null : CHANNELS[channel];
  const key = current ? `${current.slug}-${run}` : null;

  /* ---- Moving on by itself ---- */
  // The 5 seconds start once the channel has actually loaded, and pause while someone is using the
  // screen or about to press "I want this", while a finger is down, or while the iMac can't be seen.
  const [ready, setReady] = useState<string | null>(null);
  const [overScreen, setOverScreen] = useState(false);
  const [overLink, setOverLink] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [seen, setSeen] = useState(true);
  const busy = useRef<string | null>(null); // the channel that is mid-beat
  const due = useRef<string | null>(null); // the channel whose 5 seconds are up, waiting for its beat to end
  const held = overScreen || overLink || pressing;

  useEffect(() => {
    if (!key || ready !== key || held || !seen || CHANNELS.length < 2) return;
    const wait = window.setTimeout(() => {
      if (busy.current === key) due.current = key;
      else tune(1, true);
    }, DWELL_MS);
    const cap = window.setTimeout(() => tune(1, true), MAX_DWELL_MS);
    return () => {
      window.clearTimeout(wait);
      window.clearTimeout(cap);
      due.current = null;
    };
  }, [key, ready, held, seen, tune]);

  const onLoop = useMemo<ChannelProps["onLoop"]>(
    () =>
      key
        ? (phase) => {
            if (phase === "start") return void (busy.current = key);
            if (busy.current === key) busy.current = null;
            if (due.current === key) {
              due.current = null;
              tune(1, true);
            }
          }
        : undefined,
    [key, tune],
  );

  // Only count time while the iMac is on screen and the tab is open.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let inView = true;
    const update = () => setSeen(inView && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // A finger on the iMac (dragging a gallery, tapping a button) holds the channel until it lifts.
  useEffect(() => {
    if (!pressing) return;
    const up = () => setPressing(false);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [pressing]);

  /**
   * Only a real mouse counts as resting on something: phones never hover. Channels that act out a
   * pretend pointer (Peek List) send made-up pointer events, which must not hold the screen.
   */
  const hover = (set: (v: boolean) => void) => ({
    onPointerEnter: (e: React.PointerEvent) =>
      e.nativeEvent.isTrusted && e.pointerType === "mouse" && set(true),
    onPointerLeave: (e: React.PointerEvent) =>
      e.nativeEvent.isTrusted && e.pointerType === "mouse" && set(false),
  });


  return (
    <div
      ref={root}
      onPointerDown={(e) =>
        e.nativeEvent.isTrusted && e.pointerType !== "mouse" && setPressing(true)
      }
      className="imac relative mx-auto w-full [container-type:inline-size]"
      style={{ maxWidth: "min(560px, calc((100dvh - 8rem) * 1.05))" }}
    >
      {/* Shell */}
      <div
        className="relative aspect-[750/690] w-full"
        style={{
          borderRadius: "10% 10% 8% 8% / 11% 11% 8.5% 8.5%",
          background: `
            linear-gradient(90deg, ${EDGE_DEEP} 0, ${EDGE} 1.2%, rgba(110,117,122,.35) 2.6%, rgba(110,117,122,0) 4.5%, rgba(110,117,122,0) 95.5%, rgba(110,117,122,.35) 97.4%, ${EDGE} 98.8%, ${EDGE_DEEP} 100%),
            repeating-linear-gradient(90deg, rgba(255,255,255,.28) 0 1px, rgba(255,255,255,0) 1px 3px),
            linear-gradient(180deg, #eef0f0 0%, #dfe2e2 55%, #d2d6d6 100%)`,
          boxShadow: `
            inset 0 0.5cqw 0.6cqw rgba(255,255,255,.9),
            inset 0 -1cqw 1.4cqw rgba(0,0,0,.12),
            0 3cqw 6cqw -2cqw rgba(0,0,0,.35),
            0 0 0 1px rgba(0,0,0,.08)`,
        }}
      >
        {/* Bezel around the tube */}
        <div
          className="absolute"
          style={{
            left: "7.5%",
            right: "7.5%",
            top: "8%",
            height: "62%",
            borderRadius: "4.5% / 6%",
            background: "linear-gradient(180deg, #cfd4d8, #c3c9ce)",
            boxShadow:
              "inset 0 0 0 0.35cqw #b7c2cc, inset 0 0.4cqw 0.8cqw rgba(0,0,0,.18), 0 0.3cqw 0 rgba(255,255,255,.7)",
          }}
        >
          {/* The tube */}
          <div
            {...hover(setOverScreen)}
            className="absolute overflow-hidden"
            style={{
              inset: "3.2% 2.6%",
              borderRadius: "3% / 4%",
              background: "#15191b",
              boxShadow: "inset 0 0 3cqw rgba(0,0,0,.9), 0 0 0 0.5cqw #1e2326",
            }}
          >
            <div className="imac-screen absolute inset-0 [container-type:inline-size]">
              {current && (
                <Channel
                  key={key}
                  slug={current.slug}
                  onReplay={() => setRun((r) => r + 1)}
                  onLoop={onLoop}
                  onReady={() => setReady(key)}
                />
              )}
            </div>
            {/* On-screen display, like an old TV */}
            {current && (
              <div
                className="pointer-events-none absolute top-[4%] left-[4%] font-mono text-[3cqw] font-bold tracking-wider text-[#7dff9b] transition-opacity duration-300"
                style={{
                  opacity: osd ? 1 : 0,
                  textShadow: "0 0 6px rgba(125,255,155,.7)",
                }}
              >
                CH {String((channel ?? 0) + 1).padStart(2, "0")} ·{" "}
                {current.name.toUpperCase()}
              </div>
            )}
            {/* Static between channels */}
            <div
              className="imac-static pointer-events-none absolute inset-0"
              style={{ opacity: staticOn ? 1 : 0 }}
            />
            {/* Glass: curve highlight, vignette and scanlines */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `
                  radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,.10), rgba(255,255,255,0) 45%),
                  radial-gradient(140% 120% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%),
                  repeating-linear-gradient(0deg, rgba(0,0,0,.07) 0 1px, rgba(0,0,0,0) 1px 3px)`,
              }}
            />
          </div>
        </div>

        {/* Wordmark */}
        <p
          className="absolute inset-x-0 text-center text-[#5d666c] select-none"
          style={{
            top: "72%",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "3.3cqw",
            letterSpacing: "-0.01em",
          }}
        >
          Impeccable
        </p>

        {/* Left speaker: previous channel */}
        <Speaker
          side="left"
          label="Previous component"
          onClick={() => tune(-1)}
        />
        {/* Right speaker: next channel */}
        <Speaker side="right" label="Next component" onClick={() => tune(1)} />

        {/* CD slot: I want this */}
        {current ? (
          <Link
            href={`/docs/${current.slug}`}
            {...hover(setOverLink)}
            className="group absolute flex items-center justify-center rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--brand-500)]"
            style={{
              left: "35%",
              width: "30%",
              top: "79.2%",
              height: "6.4%",
              background: "linear-gradient(180deg, #c4c9cb, #d9dddd)",
              boxShadow:
                "inset 0 0.35cqw 0.6cqw rgba(0,0,0,.28), 0 0.2cqw 0 rgba(255,255,255,.8)",
            }}
          >
            <span
              className="press flex h-[62%] w-[90%] items-center justify-center rounded-full font-sans font-semibold text-[#20343a] transition-[background-color,color,box-shadow] duration-200 group-hover:text-white"
              style={{
                fontSize: "2.35cqw",
                background: "linear-gradient(180deg, #eef1f1, #dde1e2)",
                boxShadow: "0 0.15cqw 0.3cqw rgba(0,0,0,.18)",
              }}
            >
              <span className="relative z-10">I want this →</span>
            </span>
            <span
              className="pointer-events-none absolute inset-y-[19%] inset-x-[5%] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(180deg, var(--brand-500), var(--brand-700))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.22)",
              }}
            />
          </Link>
        ) : (
          <span
            className="absolute"
            style={{ left: "35%", width: "30%", top: "79.2%", height: "6.4%" }}
          />
        )}

        {/* Power: replay */}
        <button
          type="button"
          aria-label="Replay"
          title="Replay"
          onClick={() => setRun((r) => r + 1)}
          className="press absolute grid place-items-center rounded-full text-[#6b7479] transition-colors hover:text-[var(--brand-500)]"
          style={{
            left: "69.5%",
            top: "80%",
            width: "4.6%",
            aspectRatio: "1",
            background: "radial-gradient(circle at 40% 35%, #f6f7f7, #d5d9da)",
            boxShadow:
              "inset 0 -0.2cqw 0.3cqw rgba(0,0,0,.15), 0 0 0 0.25cqw #c6cbcd",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[55%] w-[55%]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 3v8M7 6.2a7.5 7.5 0 1 0 10 0" />
          </svg>
        </button>

        {/* Feet */}
        {["14%", "82%"].map((l) => (
          <span
            key={l}
            className="absolute"
            style={{
              left: l,
              bottom: "-1.6%",
              width: "4%",
              height: "2.4%",
              borderRadius: "0 0 40% 40%",
              background: "linear-gradient(180deg,#c9cdce,#9ea4a6)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Speaker({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="press group absolute overflow-hidden"
      style={
        {
          [side]: "6.5%",
          top: "77.5%",
          width: "17%",
          height: "10.5%",
          borderRadius: "50% / 50%",
          background: `radial-gradient(rgba(255,255,255,.18) 22%, rgba(255,255,255,0) 26%) 0 0 / 0.9cqw 0.9cqw, linear-gradient(180deg, ${EDGE}, ${EDGE_DEEP})`,
          boxShadow:
            "inset 0 0.4cqw 0.8cqw rgba(0,0,0,.4), 0 0 0 0.3cqw rgba(0,0,0,.06), 0 0.25cqw 0 rgba(255,255,255,.7)",
        } as React.CSSProperties
      }
    >
      {/* The little window on each grille, with the channel arrow in it */}
      <span
        className="absolute grid place-items-center rounded-full text-white/70 transition-colors group-hover:text-white"
        style={
          {
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            height: "64%",
            aspectRatio: "1",
            background: "radial-gradient(circle at 40% 35%, #4b5156, #2a2e31)",
            boxShadow: "inset 0 0.2cqw 0.4cqw rgba(0,0,0,.6)",
            fontSize: "2.2cqw",
          } as React.CSSProperties
        }
      >
        {side === "left" ? "◀" : "▶"}
      </span>
    </button>
  );
}

/** What each component looks like on the little screen: its items/<name>/tv.tsx. */
function Channel({
  slug,
  onReady,
  ...props
}: ChannelProps & { slug: string; onReady: () => void }) {
  const Show = TV[slug];
  // Channels load on demand (see generated/items/tv.ts); the screen stays dark for the moment it takes.
  // <Ready> sits in the same Suspense, so it only mounts once the channel has loaded and is showing.
  return Show ? (
    <Suspense fallback={null}>
      <Show {...props} />
      <Ready onReady={onReady} />
    </Suspense>
  ) : null;
}

function Ready({ onReady }: { onReady: () => void }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onReady, []);
  return null;
}
