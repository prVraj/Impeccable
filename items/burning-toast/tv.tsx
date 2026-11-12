"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { BurningToaster, toast } from "./burning-toast";

/** A tiny settings screen with its own toaster. One toast pops on its own and
 * burns after 4 seconds; the button pops more. The inner screen keeps real
 * size and is scaled to fit; its transform also keeps the toasts in the tube. */
export default function BurningToastChannel() {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      if (!box.current) return;
      setScale(Math.min(box.current.clientWidth / 640, box.current.clientHeight / 460));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (box.current) ro.observe(box.current);
    const t = window.setTimeout(pop, 900);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);
  const pop = () => toast.success("Changes saved", { description: "Your profile is up to date.", toaster: "tv" });
  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 flex h-[460px] w-[640px] flex-col items-center justify-center text-center"
          style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <p className="text-[13px] text-[var(--muted)]">Impeccable demo</p>
          <p className="mt-1 mb-6 text-[30px] leading-tight font-semibold tracking-tight">Save your profile</p>
          <button
            type="button"
            onClick={pop}
            className="card press inline-flex h-10 items-center rounded-full px-5 text-sm font-medium text-[var(--fg)]"
          >
            Pop my toast
          </button>
          <p className="mt-4 mb-24 text-[13px] text-[var(--muted)]">Close it, swipe it, or wait 4 seconds.</p>
          <BurningToaster
            id="tv"
            position="bottom-center"
            colors={{ surface: "var(--panel)", text: "var(--fg)", muted: "var(--muted)", border: "var(--line)" }}
          />
        </div>
      </div>
    </Screen>
  );
}
