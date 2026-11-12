"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { AUTHOR } from "@/lib/site";
import { HexLogin } from "./hex-login";

/** The whole login page, drawn at a laptop size and scaled to fit the tube. Try a bad email right on it. */
export default function HexLoginChannel() {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const W = 800;
  const H = 600;
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / W, el.clientHeight / H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2"
          style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <HexLogin
            style={{ minHeight: H, background: "transparent" }}
            termsHref="/docs/hex-login"
            privacyHref="/docs/hex-login"
            onContinue={() => {
              window.open(AUTHOR.href, "_blank", "noopener,noreferrer");
            }}
          />
        </div>
      </div>
    </Screen>
  );
}
