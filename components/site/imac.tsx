"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AgentDraw } from "@/registry/impeccable/agent-draw/agent-draw";
import { useBurningScreen } from "@/registry/impeccable/burning-screen/burning-screen";
import { BrainTxt } from "@/registry/impeccable/brain-txt/brain-txt";
import { ScratchMe } from "@/registry/impeccable/scratch-me/scratch-me";
import { DEMO_THOUGHTS } from "./brain-txt-demo";
import { COMPONENTS } from "@/lib/site";

/** Only things with a live demo get a channel (skills have none). */
const CHANNELS = COMPONENTS.filter((c) => c.group !== "skills");
import { currentTheme, setTheme } from "./theme-toggle";
import { PasswordStrength } from "@/registry/impeccable/password-strength/password-strength";
import { FramedUpload } from "@/registry/impeccable/framed-upload/framed-upload";

/**
 * A 1998-style translucent iMac (graphite gray), drawn in CSS. Its screen plays one component
 * from the library at a time. Speakers flip channels, the power button replays,
 * and the CD slot is "I want this".
 */

/* Graphite gray for the translucent edges and speakers. */
const EDGE = "#8a9196";
const EDGE_DEEP = "#5b6267";

export function IMac() {
  const [channel, setChannel] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const [staticOn, setStaticOn] = useState(false);
  const [osd, setOsd] = useState(false);
  const timers = useRef<number[]>([]);

  // Pick a random channel once we're in the browser (keeps SSR stable).
  useEffect(() => {
    setChannel(Math.floor(Math.random() * CHANNELS.length));
    flashOsd();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashOsd = () => {
    setOsd(true);
    timers.current.push(window.setTimeout(() => setOsd(false), 1800));
  };

  const tune = useCallback((dir: 1 | -1) => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go = () => {
      setChannel(
        (c) => ((c ?? 0) + dir + CHANNELS.length) % CHANNELS.length,
      );
      setRun((r) => r + 1);
      setStaticOn(false);
      flashOsd();
    };
    if (reduced) return go();
    setStaticOn(true);
    timers.current.push(window.setTimeout(go, 260));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = channel === null ? null : CHANNELS[channel];

  return (
    <div
      className="imac relative mx-auto w-full [container-type:inline-size]"
      style={{ maxWidth: "min(560px, calc((100dvh - 8rem) * 1.05))" }}
    >
      {/* Shell */}
      <div
        className="relative aspect-[750/690] w-full"
        style={{
          borderRadius: "10% 10% 8% 8% / 11% 11% 8.5% 8.5%",
          background: `
            linear-gradient(90deg, ${EDGE_DEEP} 0, ${EDGE} 1.2%, rgba(110,117,122,.35) 2.6%, rgba(110,117,122,0) 4.5%, rgba(110,117,122,0) 95.5%, rgba(110,117,122,.35) 97.4%, ${EDGE} 98.8%, ${EDGE_DEEP} 100%),
            repeating-linear-gradient(90deg, rgba(255,255,255,.28) 0 1px, rgba(255,255,255,0) 1px 3px),
            linear-gradient(180deg, #eef0f0 0%, #dfe2e2 55%, #d2d6d6 100%)`,
          boxShadow: `
            inset 0 0.5cqw 0.6cqw rgba(255,255,255,.9),
            inset 0 -1cqw 1.4cqw rgba(0,0,0,.12),
            0 3cqw 6cqw -2cqw rgba(0,0,0,.35),
            0 0 0 1px rgba(0,0,0,.08)`,
        }}
      >
        {/* Bezel around the tube */}
        <div
          className="absolute"
          style={{
            left: "7.5%",
            right: "7.5%",
            top: "8%",
            height: "62%",
            borderRadius: "4.5% / 6%",
            background: "linear-gradient(180deg, #cfd4d8, #c3c9ce)",
            boxShadow:
              "inset 0 0 0 0.35cqw #b7c2cc, inset 0 0.4cqw 0.8cqw rgba(0,0,0,.18), 0 0.3cqw 0 rgba(255,255,255,.7)",
          }}
        >
          {/* The tube */}
          <div
            className="absolute overflow-hidden"
            style={{
              inset: "3.2% 2.6%",
              borderRadius: "3% / 4%",
              background: "#15191b",
              boxShadow: "inset 0 0 3cqw rgba(0,0,0,.9), 0 0 0 0.5cqw #1e2326",
            }}
          >
            <div className="imac-screen absolute inset-0 [container-type:inline-size]">
              {current && (
                <Channel
                  key={`${current.slug}-${run}`}
                  slug={current.slug}
                  onReplay={() => setRun((r) => r + 1)}
                />
              )}
            </div>
            {/* On-screen display, like an old TV */}
            {current && (
              <div
                className="pointer-events-none absolute top-[4%] left-[4%] font-mono text-[3cqw] font-bold tracking-wider text-[#7dff9b] transition-opacity duration-300"
                style={{
                  opacity: osd ? 1 : 0,
                  textShadow: "0 0 6px rgba(125,255,155,.7)",
                }}
              >
                CH {String((channel ?? 0) + 1).padStart(2, "0")} ·{" "}
                {current.name.toUpperCase()}
              </div>
            )}
            {/* Static between channels */}
            <div
              className="imac-static pointer-events-none absolute inset-0"
              style={{ opacity: staticOn ? 1 : 0 }}
            />
            {/* Glass: curve highlight, vignette and scanlines */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `
                  radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,.10), rgba(255,255,255,0) 45%),
                  radial-gradient(140% 120% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%),
                  repeating-linear-gradient(0deg, rgba(0,0,0,.07) 0 1px, rgba(0,0,0,0) 1px 3px)`,
              }}
            />
          </div>
        </div>

        {/* Wordmark */}
        <p
          className="absolute inset-x-0 text-center text-[#5d666c] select-none"
          style={{
            top: "72%",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "3.3cqw",
            letterSpacing: "-0.01em",
          }}
        >
          Impeccable
        </p>

        {/* Left speaker: previous channel */}
        <Speaker
          side="left"
          label="Previous component"
          onClick={() => tune(-1)}
        />
        {/* Right speaker: next channel */}
        <Speaker side="right" label="Next component" onClick={() => tune(1)} />

        {/* CD slot: I want this */}
        {current ? (
          <Link
            href={`/docs/${current.slug}`}
            className="group absolute flex items-center justify-center rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--brand-500)]"
            style={{
              left: "35%",
              width: "30%",
              top: "79.2%",
              height: "6.4%",
              background: "linear-gradient(180deg, #c4c9cb, #d9dddd)",
              boxShadow:
                "inset 0 0.35cqw 0.6cqw rgba(0,0,0,.28), 0 0.2cqw 0 rgba(255,255,255,.8)",
            }}
          >
            <span
              className="press flex h-[62%] w-[90%] items-center justify-center rounded-full font-sans font-semibold text-[#20343a] transition-[background-color,color,box-shadow] duration-200 group-hover:text-white"
              style={{
                fontSize: "2.35cqw",
                background: "linear-gradient(180deg, #eef1f1, #dde1e2)",
                boxShadow: "0 0.15cqw 0.3cqw rgba(0,0,0,.18)",
              }}
            >
              <span className="relative z-10">I want this →</span>
            </span>
            <span
              className="pointer-events-none absolute inset-y-[19%] inset-x-[5%] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(180deg, var(--brand-500), var(--brand-700))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.22)",
              }}
            />
          </Link>
        ) : (
          <span
            className="absolute"
            style={{ left: "35%", width: "30%", top: "79.2%", height: "6.4%" }}
          />
        )}

        {/* Power: replay */}
        <button
          type="button"
          aria-label="Replay"
          title="Replay"
          onClick={() => setRun((r) => r + 1)}
          className="press absolute grid place-items-center rounded-full text-[#6b7479] transition-colors hover:text-[var(--brand-500)]"
          style={{
            left: "69.5%",
            top: "80%",
            width: "4.6%",
            aspectRatio: "1",
            background: "radial-gradient(circle at 40% 35%, #f6f7f7, #d5d9da)",
            boxShadow:
              "inset 0 -0.2cqw 0.3cqw rgba(0,0,0,.15), 0 0 0 0.25cqw #c6cbcd",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[55%] w-[55%]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 3v8M7 6.2a7.5 7.5 0 1 0 10 0" />
          </svg>
        </button>

        {/* Feet */}
        {["14%", "82%"].map((l) => (
          <span
            key={l}
            className="absolute"
            style={{
              left: l,
              bottom: "-1.6%",
              width: "4%",
              height: "2.4%",
              borderRadius: "0 0 40% 40%",
              background: "linear-gradient(180deg,#c9cdce,#9ea4a6)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Speaker({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="press group absolute overflow-hidden"
      style={
        {
          [side]: "6.5%",
          top: "77.5%",
          width: "17%",
          height: "10.5%",
          borderRadius: "50% / 50%",
          background: `radial-gradient(rgba(255,255,255,.18) 22%, rgba(255,255,255,0) 26%) 0 0 / 0.9cqw 0.9cqw, linear-gradient(180deg, ${EDGE}, ${EDGE_DEEP})`,
          boxShadow:
            "inset 0 0.4cqw 0.8cqw rgba(0,0,0,.4), 0 0 0 0.3cqw rgba(0,0,0,.06), 0 0.25cqw 0 rgba(255,255,255,.7)",
        } as React.CSSProperties
      }
    >
      {/* The little window on each grille, with the channel arrow in it */}
      <span
        className="absolute grid place-items-center rounded-full text-white/70 transition-colors group-hover:text-white"
        style={
          {
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            height: "64%",
            aspectRatio: "1",
            background: "radial-gradient(circle at 40% 35%, #4b5156, #2a2e31)",
            boxShadow: "inset 0 0.2cqw 0.4cqw rgba(0,0,0,.6)",
            fontSize: "2.2cqw",
          } as React.CSSProperties
        }
      >
        {side === "left" ? "◀" : "▶"}
      </span>
    </button>
  );
}

/** What each component looks like on the little screen. */
function Channel({ slug, onReplay }: { slug: string; onReplay: () => void }) {
  if (slug === "burning-screen") return <BurnChannel />;
  if (slug === "agent-draw") return <AgentDrawChannel onReplay={onReplay} />;
  if (slug === "brain-txt") return <BrainTxtChannel />;
  if (slug === "scratch-me") return <ScratchMeChannel onReplay={onReplay} />;
  if (slug === "password-strength") return <PasswordStrengthChannel />;
  if (slug === "framed-upload") return <FramedUploadChannel />;
  return null;
}

/** brain.txt fills the tube. Fewer thoughts so the dots have room on a small screen. */
function BrainTxtChannel() {
  return (
    <Screen>
      <BrainTxt
        thoughts={DEMO_THOUGHTS.slice(0, 9)}
        accent="var(--accent)"
        height="100%"
        hint="Click a dot to read it. Drag to play."
      />
    </Screen>
  );
}

/** A tiny checkout screen with a scratch card on it. Scratch it right on the tube. */
function ScratchMeChannel({ onReplay }: { onReplay: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <Screen>
      <div className="flex h-full flex-col items-center justify-center px-[4cqw] text-center">
        <p className="text-[2.6cqw] text-[var(--muted)]">Impeccable demo</p>
        <p className="mt-[1cqw] mb-[4cqw] text-[5.4cqw] leading-tight font-semibold tracking-tight">
          A gift for your first order
        </p>
        <ScratchMe code="IMPECCABLE20" onReveal={() => setDone(true)} />
        <button
          type="button"
          onClick={onReplay}
          className={`press mt-[1cqw] text-[2.6cqw] font-medium text-[var(--muted)] transition-opacity hover:text-[var(--fg)] ${done ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          Scratch again
        </button>
      </div>
    </Screen>
  );
}

/** A tiny sign-up screen with the password field. Type right on the tube.
 * The field keeps its real size and the whole screen is scaled to fit the tube. */
function PasswordStrengthChannel() {
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

/** A tiny gallery wall: one framed print. Drop a picture on the tube to swap it. */
function FramedUploadChannel() {
  return (
    <Screen>
      <div className="flex h-full flex-col items-center justify-center px-[4cqw] text-center">
        <p className="text-[2.6cqw] text-[var(--muted)]">Impeccable demo</p>
        <p className="mt-[1cqw] mb-[4cqw] text-[5.4cqw] leading-tight font-semibold tracking-tight">
          Hang your first picture
        </p>
        <FramedUpload
          defaultSrc="/previews/framed-upload-sample.svg"
          alt="A violet poster with a setting sun"
          style={{ maxWidth: "26cqw" }}
        />
      </div>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="imac-power-on absolute inset-0 overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      {children}
      {/* A white glow that fades out, so the warm-up line shows in dark mode too */}
      <div className="imac-power-flash pointer-events-none absolute inset-0 z-50 bg-white" />
    </div>
  );
}

/** Agent-Draw runs right inside the tube, then loops. */
function AgentDrawChannel({ onReplay }: { onReplay: () => void }) {
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

/** A tiny sign-up screen. Its button burns the whole page into the other theme. */
function BurnChannel() {
  const { burn } = useBurningScreen();
  return (
    <Screen>
      <div className="flex h-full flex-col items-center justify-center px-[10cqw] text-center">
        <p className="text-[2.6cqw] text-[var(--muted)]">Impeccable demo</p>
        <p className="mt-[1cqw] text-[6cqw] leading-tight font-semibold tracking-tight">
          Create your account
        </p>
        <div className="mt-[4cqw] w-full rounded-full border border-[var(--line)] px-[3.5cqw] py-[2cqw] text-left text-[3cqw] text-[var(--muted)]">
          you@studio.com
        </div>
        <button
          type="button"
          onClick={(e) =>
            burn(() => setTheme(currentTheme() === "dark" ? "light" : "dark"), {
              origin: e,
            })
          }
          className="press mt-[2.5cqw] w-full rounded-full bg-[var(--fg)] py-[2.2cqw] text-[3.2cqw] font-medium text-[var(--bg)]"
        >
          Create account
        </button>
        <p className="mt-[3cqw] text-[2.4cqw] text-[var(--muted)]">
          Click it. The whole page burns into the other theme.
        </p>
      </div>
    </Screen>
  );
}
