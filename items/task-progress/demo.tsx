"use client";

import { useEffect, useState } from "react";
import { TaskProgress, type Task } from "./task-progress";

export const DEMO_TASKS = [
  "Read the project rules and notes",
  "Sketch the three task states",
  "Draw the strike as each task finishes",
  "Keep five tasks, fold the rest away",
  "Check light and dark on a phone",
  "Run the production build",
  "Hand it over for review",
];

const STEP_MS = 1700; // one task in progress
const HOLD_MS = 3800; // all done, before it starts over
const RESET_MS = 900; // all back to not started, before the first one starts

/**
 * Plays the list on its own: one task at a time goes from in progress to done
 * and the next one starts. When all are done it rests, clears and starts over.
 * `paused` holds it where it is (the docs preview pauses while the pointer is on it).
 */
export function useTaskRun(labels: string[], paused = false): Task[] {
  // -1 = all clear, 0..n-1 = that task in progress, n = all done.
  const [at, setAt] = useState(0);
  const n = labels.length;
  useEffect(() => {
    if (paused) return;
    const wait = at === n ? HOLD_MS : at === -1 ? RESET_MS : STEP_MS;
    const t = window.setTimeout(() => setAt((a) => (a === n ? -1 : a + 1)), wait);
    return () => clearTimeout(t);
  }, [at, n, paused]);
  return labels.map((label, i) => ({
    id: i,
    label,
    status: at === -1 || i > at ? "pending" : i === at ? "active" : "done",
  }));
}

/** The preview: the list alone on the dotted card, playing on its own. It pauses while the pointer is on it. */
export function TaskProgressDemo() {
  const [hover, setHover] = useState(false);
  const tasks = useTaskRun(DEMO_TASKS, hover);
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-12 @min-[40rem]:min-h-96 @min-[40rem]:py-16">
      <div
        className="w-full text-[var(--fg)]"
        style={{ maxWidth: 448 }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <TaskProgress tasks={tasks} style={{ background: "var(--panel)" }} />
      </div>
    </div>
  );
}
