"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import type { ChannelProps } from "@/components/site/tv-screen";
import { puzzleRefresh } from "./puzzle-refresh";

/** A tiny page on the tube that breaks into puzzle pieces and flies back together, over and over. */
export default function PuzzleChannel({ onLoop }: ChannelProps) {
  const page = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState(0);
  const loopRef = useRef(onLoop);
  useEffect(() => {
    loopRef.current = onLoop;
  }, [onLoop]);

  useEffect(() => {
    // With reduced motion the tube just shows the page; a looping fade would only flicker.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    let timer = 0;
    const loop = () => {
      if (!alive || !page.current) return;
      loopRef.current?.("start");
      void puzzleRefresh({
        root: page.current,
        pieces: 30,
        sound: false,
        refresh: () =>
          // The fresh headline arrives while the pieces lie in the heap.
          new Promise<void>((done) =>
            window.setTimeout(() => {
              setRound((n) => n + 1);
              done();
            }, 1200),
          ),
      }).then(() => {
        loopRef.current?.("end");
        if (alive) timer = window.setTimeout(loop, 1600);
      });
    };
    timer = window.setTimeout(loop, 1000);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <Screen>
      <div
        ref={page}
        className="relative h-full overflow-hidden bg-[var(--bg)] px-[6cqw] py-[4cqw]"
      >
        <div className="flex items-center justify-between text-[2.4cqw] text-[var(--muted)]">
          <span className="flex items-center gap-[1.2cqw] font-semibold text-[var(--fg)]">
            <span className="size-[2.2cqw] rounded-[0.6cqw] bg-[var(--fg)]" />
            Piecework
          </span>
          <span className="flex gap-[3cqw]">
            <span>Shop</span>
            <span>Studio</span>
            <span>About</span>
          </span>
        </div>
        <p className="mt-[7cqw] text-center text-[6cqw] leading-tight font-semibold tracking-tight">
          {round === 0 ? "Refresh me." : `Fresh, ${round}x.`}
        </p>
        <p className="mt-[1.5cqw] text-center text-[2.6cqw] text-[var(--muted)]">
          Cracked, dropped, put back together.
        </p>
        <div className="mt-[5cqw] grid grid-cols-3 gap-[2.5cqw]">
          {["Corners", "Edges", "Middles"].map((title) => (
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
