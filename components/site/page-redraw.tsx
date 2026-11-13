"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import type { AgentDrawProps } from "@/items/agent-draw/agent-draw";
import { REDRAW_CLASS, REDRAW_KEY } from "./page-redraw-script";

/**
 * "Redraw this page" on the Agent-Draw docs: the page really reloads, and on
 * the fresh page the Agent-Draw cursors draw every part of it back.
 * A flag in sessionStorage survives the reload; the head script turns it into
 * a class that hides the page until the drawing takes over (no flash).
 * Normal visits never load Agent-Draw: <Redraw> just renders its children.
 */

const KEY = REDRAW_KEY;
const CLASS = REDRAW_CLASS;

export function redrawPage() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {}
  location.reload();
}

let loader: Promise<ComponentType<AgentDrawProps>> | null = null;

/** One part of the page the cursors draw. All parts share the same cursors (9 at most), so each part draws quickly and the first screen finishes in about 4s. */
export function Redraw({ children }: { children: ReactNode }) {
  const [Draw, setDraw] = useState<ComponentType<AgentDrawProps> | null>(null);

  useEffect(() => {
    if (!document.documentElement.classList.contains(CLASS)) return;
    loader ??= import("@/items/agent-draw/agent-draw").then((m) => m.AgentDraw);
    let live = true;
    loader.then((C) => live && setDraw(() => C));
    return () => {
      live = false;
    };
  }, []);

  // The drawing has taken over (its content starts hidden): show the page.
  useEffect(() => {
    if (!Draw) return;
    const id = requestAnimationFrame(() => document.documentElement.classList.remove(CLASS));
    return () => cancelAnimationFrame(id);
  }, [Draw]);

  if (!Draw) return <>{children}</>;
  return (
    <Draw duration={1800} maxAgents={9} maxAgentsMobile={4}>
      {children}
    </Draw>
  );
}
