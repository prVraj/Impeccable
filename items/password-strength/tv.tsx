"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { PasswordStrength } from "./password-strength";

/** A tiny sign-up screen with the password field. Type right on the tube.
 * The field keeps its real size and the whole screen is scaled to fit the tube. */
export default function PasswordStrengthChannel() {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      if (!box.current || !inner.current) return;
      const pad = 0.86;
      const s = Math.min(
        (box.current.clientWidth * pad) / inner.current.offsetWidth,
        (box.current.clientHeight * pad) / inner.current.offsetHeight,
      );
      setScale(Math.min(1, s));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (box.current) ro.observe(box.current);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, []);
  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div
          ref={inner}
          className="absolute top-1/2 left-1/2 w-[420px] text-left"
          style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <p className="text-[13px] text-[var(--muted)]">Impeccable demo</p>
          <p className="mt-1 mb-5 text-[26px] leading-tight font-semibold tracking-tight">Are you human?</p>
          <PasswordStrength defaultValue="sunflower" />
        </div>
      </div>
    </Screen>
  );
}
