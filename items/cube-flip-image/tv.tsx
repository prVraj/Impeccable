"use client";

import { useEffect, useRef } from "react";
import { Screen } from "@/components/site/tv-screen";
import { CubeFlipImage } from "./cube-flip-image";
import { DEMO_PICTURES } from "./demo";

/** The photos on the tube, clicked on their own at a new spot every 3.6 seconds (silent, nobody asked for sound). */
export default function CubeFlipImageChannel() {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // The channel sits inside cards that are links: its own clicks must never open them.
    const box = wrap.current;
    const stay = (e: Event) => e.preventDefault();
    box?.addEventListener("click", stay);
    let i = 0;
    const tap = () => {
      const el = wrap.current?.querySelector("button");
      if (!el) return;
      const r = el.getBoundingClientRect();
      // A spot that moves around the picture: a corner, the middle, an edge.
      const spots = [
        [0.2, 0.3],
        [0.75, 0.7],
        [0.5, 0.5],
        [0.85, 0.2],
        [0.15, 0.8],
      ];
      const [fx, fy] = spots[i++ % spots.length];
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1, clientX: r.left + r.width * fx, clientY: r.top + r.height * fy }));
    };
    const first = window.setTimeout(tap, 1200);
    const every = window.setInterval(tap, 3600);
    return () => {
      clearTimeout(first);
      clearInterval(every);
      box?.removeEventListener("click", stay);
    };
  }, []);
  return (
    <Screen>
      <div ref={wrap} className="@container grid h-full place-items-center px-[8cqi]">
        <CubeFlipImage
          images={DEMO_PICTURES}
          className="max-w-[min(100%,26rem)] rounded-[2cqi] shadow-[0_0_0_1px_var(--faint)]"
          style={{ maxHeight: "80cqh" }}
        />
      </div>
    </Screen>
  );
}
