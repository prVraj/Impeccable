"use client";

import { useEffect, useRef } from "react";
import { Screen } from "@/components/site/tv-screen";
import { AgentDraw } from "./agent-draw";

/** Agent-Draw runs right inside the tube, then loops. */
export default function AgentDrawChannel({ onReplay }: { onReplay: () => void }) {
  const loop = useRef<number>(0);
  useEffect(() => () => clearTimeout(loop.current), []);
  return (
    <Screen>
      <AgentDraw
        duration={3200}
        maxAgents={4}
        maxAgentsMobile={3}
        names={["Vraj", "Sensei", "Impeccable"]}
        onDone={() => {
          loop.current = window.setTimeout(onReplay, 3500);
        }}
      >
        <div className="space-y-[4cqw] p-[6cqw]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[2cqw]">
              <span className="grid size-[6cqw] place-items-center rounded-full bg-[var(--fg)] text-[2.2cqw] font-semibold text-[var(--bg)]">
                VP
              </span>
              <span className="text-[3.4cqw] font-semibold">Vraj Parikh</span>
            </div>
            <div className="flex gap-[3cqw] text-[3cqw] text-[var(--muted)]">
              <span>Work</span>
              <span>About</span>
            </div>
          </div>
          <div className="flex items-center gap-[4cqw]">
            <span className="size-[15cqw] shrink-0 rounded-full bg-gradient-to-br from-violet-300 to-pink-300" />
            <div>
              <p className="text-[5.2cqw] leading-tight font-semibold tracking-tight">
                Vraj Parikh
              </p>
              <p className="text-[3cqw] text-[var(--muted)]">
                Product Designer
              </p>
              <div className="mt-[2cqw] flex gap-[1.5cqw]">
                <span className="rounded-full bg-[var(--fg)] px-[3cqw] py-[1cqw] text-[2.6cqw] font-medium text-[var(--bg)]">
                  Connect
                </span>
                <span className="rounded-full border border-[var(--line)] px-[3cqw] py-[1cqw] text-[2.6cqw] font-medium">
                  Resume
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[3cqw]">
            {[
              "from-sky-300/70 to-indigo-300/70",
              "from-emerald-300/70 to-teal-300/70",
            ].map((tone, i) => (
              <div key={tone}>
                <div
                  data-agent-draw
                  className={`aspect-[16/10] rounded-[2cqw] bg-gradient-to-br ${tone}`}
                />
                <p className="mt-[1.5cqw] text-[3cqw] font-semibold">
                  {i ? "Bundled" : "Vroomy"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AgentDraw>
    </Screen>
  );
}
