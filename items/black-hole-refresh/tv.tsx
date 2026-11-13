"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { blackHoleRefresh } from "./black-hole-refresh";

/** A tiny page on the tube that a black hole swallows and blasts back, over and over. */
export default function BlackHoleChannel() {
  const page = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    // With reduced motion the tube just shows the page; a looping fade would only flicker.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    let timer = 0;
    const loop = () => {
      if (!alive || !page.current) return;
      void blackHoleRefresh({
        root: page.current,
        refresh: () =>
          // The fresh headline arrives after 2s, while the hole is still eating.
          new Promise<void>((done) =>
            window.setTimeout(() => {
              setRound((n) => n + 1);
              done();
            }, 2000),
          ),
      }).then(() => {
        if (alive) timer = window.setTimeout(loop, 1800);
      });
    };
    timer = window.setTimeout(loop, 1200);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <Screen>
      <div
        ref={page}
        className="relative h-full overflow-hidden px-[6cqw] py-[4cqw]"
      >
        <div className="flex items-center justify-between text-[2.4cqw] text-[var(--muted)]">
          <span className="flex items-center gap-[1.2cqw] font-semibold text-[var(--fg)]">
            <span className="size-[2.2cqw] rounded-full bg-[var(--fg)]" />
            Orbit
          </span>
          <span className="flex gap-[3cqw]">
            <span>Work</span>
            <span>Studio</span>
            <span>Journal</span>
          </span>
        </div>
        <p className="mt-[7cqw] text-center text-[6cqw] leading-tight font-semibold tracking-tight">
          {round === 0 ? "Refresh me." : `Fresh, ${round}x.`}
        </p>
        <p className="mt-[1.5cqw] text-center text-[2.6cqw] text-[var(--muted)]">
          Pulled thin, swallowed, blasted back new.
        </p>
        <div className="mt-[5cqw] grid grid-cols-3 gap-[2.5cqw]">
          {["Tides", "Horizon", "Afterglow"].map((title) => (
            <div
              key={title}
              className="rounded-[2cqw] border border-[var(--line)] p-[1.5cqw]"
            >
              <div className="aspect-[4/3] rounded-[0.5cqw] bg-[var(--panel-2)]" />
              <p className="mt-[1cqw] text-[2.4cqw] font-medium">{title}</p>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
