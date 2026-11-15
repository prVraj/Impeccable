"use client";

import { useEffect, useRef, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { CoffeeFaq, COFFEE_FAQ_ITEMS } from "./coffee-faq";

/** The section at a laptop width, scaled to the tube. Open a question or ask one right on the TV. */
export default function CoffeeFaqChannel() {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const W = 760;
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <Screen>
      <div ref={box} className="relative h-full overflow-hidden">
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: W, marginTop: -16 * scale, transform: `scale(${scale})` }}>
          <CoffeeFaq
            items={COFFEE_FAQ_ITEMS.slice(0, 2)}
            description={null}
            style={{ background: "transparent" }}
          />
        </div>
      </div>
    </Screen>
  );
}
