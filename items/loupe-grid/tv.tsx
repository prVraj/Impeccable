"use client";

import { useEffect, useState } from "react";
import { Screen } from "@/components/site/tv-screen";
import { LoupeGrid, type LoupeGridType } from "./loupe-grid";

const ORDER: LoupeGridType[] = ["plus-lines", "dots", "dots-lines", "plus"];

/** The grid fills the tube and steps through the four types; move the pointer over the screen to see the loupe. */
export default function LoupeGridChannel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % ORDER.length), 3200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <Screen>
      <LoupeGrid type={ORDER[i]} gap={28} radius={80} className="h-full w-full" />
    </Screen>
  );
}
