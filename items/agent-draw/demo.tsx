"use client";

import { useEffect, useState } from "react";
import { AgentDraw } from "./agent-draw";

const SITE = "https://parikhvraj.framer.website";
const X = "https://x.com/vrajsensei";

const NAV = [
  { label: "Home", href: `${SITE}/#home` },
  { label: "About me", href: `${SITE}/#about-me` },
  { label: "Experience", href: `${SITE}/#experience` },
  { label: "Connect", href: X },
];

const CASE_STUDIES = [
  {
    no: "01",
    title: "Vroomy",
    kind: "Mobile app",
    text: "A car service app where people book services, learn, and earn rewards they redeem at the garage.",
    tags: ["Mobile app", "Rewards"],
    href: `${SITE}/case-studies/%E2%84%A2`,
    art: "phone",
  },
  {
    no: "02",
    title: "Bundled",
    kind: "Web platform",
    text: "One platform that brings many AI image and video tools together, without a cluttered UI.",
    tags: ["AI tools", "Dashboard"],
    href: `${SITE}/case-studies/one-platform-one-creative-workflow`,
    art: "desk",
  },
] as const;

const FEATURED = [
  { title: "Sytheon", href: "https://syntheon.framer.website" },
  { title: "Multi Agent", href: "https://multiagent.framer.website" },
  { title: "Signal", href: "https://signalblog.framer.website" },
  { title: "Metrik", href: "https://metrikdesign.framer.website" },
];

const EXPERIENCE = [
  { role: "Product Designer", place: "Freelance", when: "05/26 – Now" },
  { role: "Product Designer", place: "Antichurn", when: "03/25 – 06/26" },
  { role: "UX/UI Designer", place: "AppYard", when: "12/24 – 03/25" },
];

const SOCIALS = [
  { label: "X", href: X },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/vraj-parikh-b64b61257/" },
  { label: "Peerlist", href: "https://peerlist.io/vrajsensei" },
  { label: "Framer", href: "https://www.framer.com/@framer-creator/" },
];

const out = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Small mono label that opens each section, like a page in a printed folio. */
function Label({ no, children, href }: { no: string; children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      {...out}
      className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.08em] text-[var(--muted)] uppercase transition-colors hover:text-[var(--fg)]"
    >
      <span className="text-[var(--faint)]">{no}</span>
      <span className="h-px w-4 bg-[var(--line)]" />
      {children}
    </a>
  );
}

/** Cover art for the case studies: a phone for Vroomy, a desktop app for Bundled. */
function Cover({ art }: { art: "phone" | "desk" }) {
  const glass = "bg-white/80 shadow-[0_1px_0_rgba(255,255,255,.6)_inset,0_10px_30px_-12px_rgba(15,23,42,.35)] dark:bg-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)_inset]";
  const bar = "rounded-full bg-neutral-900/10 dark:bg-white/15";
  return (
    <div
      data-agent-draw
      className={`relative aspect-[4/3] overflow-hidden rounded-[14px] ring-1 ring-black/[0.06] ring-inset dark:ring-white/10 ${
        art === "phone"
          ? "bg-[radial-gradient(120%_90%_at_20%_0%,#dbeafe,transparent_60%),linear-gradient(160deg,#eef2ff,#c7d2fe)] dark:bg-[radial-gradient(120%_90%_at_20%_0%,rgba(96,165,250,.25),transparent_60%),linear-gradient(160deg,#141a2e,#1e1b4b)]"
          : "bg-[radial-gradient(120%_90%_at_80%_0%,#d1fae5,transparent_60%),linear-gradient(160deg,#ecfdf5,#a7f3d0)] dark:bg-[radial-gradient(120%_90%_at_80%_0%,rgba(52,211,153,.22),transparent_60%),linear-gradient(160deg,#0f1f1a,#052e24)]"
      }`}
    >
      {art === "phone" ? (
        <div className={`absolute top-[14%] left-1/2 w-[34%] -translate-x-1/2 rounded-[14px] p-[5%] ${glass}`} style={{ aspectRatio: "9 / 17" }}>
          <div className={`mx-auto mb-[14%] h-[3%] w-[30%] ${bar}`} />
          <div className="mb-[10%] aspect-[16/10] rounded-[8px] bg-gradient-to-br from-sky-300 to-indigo-400 dark:from-sky-500/60 dark:to-indigo-500/60" />
          <div className={`mb-[6%] h-[4%] w-[70%] ${bar}`} />
          <div className={`mb-[14%] h-[4%] w-[45%] ${bar}`} />
          <div className="grid grid-cols-3 gap-[8%]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-square rounded-[6px] bg-indigo-500/15 dark:bg-indigo-300/15" />
            ))}
          </div>
        </div>
      ) : (
        <div className={`absolute top-[16%] left-[10%] h-[100%] w-[90%] rounded-tl-[12px] ${glass}`}>
          <div className="flex h-full">
            <div className="w-[22%] space-y-[10%] border-r border-black/5 p-[4%] dark:border-white/10">
              {[70, 50, 60, 40].map((w) => (
                <div key={w} className={`h-[3%] min-h-1 ${bar}`} style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="grid flex-1 grid-cols-3 content-start gap-[3%] p-[4%]">
              {["from-emerald-300 to-teal-400", "from-teal-200 to-cyan-300", "from-lime-200 to-emerald-300", "from-cyan-200 to-emerald-300", "from-emerald-200 to-lime-200", "from-teal-300 to-emerald-400"].map((g) => (
                <div key={g} className={`aspect-[4/3] rounded-[6px] bg-gradient-to-br ${g} opacity-90 dark:opacity-40`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Vraj Parikh's portfolio as a mini page. Everything links to the live site. */
function Profile() {
  return (
    <div className="px-5 pt-5 pb-6 @min-[40rem]:px-9 @min-[40rem]:pt-7 @min-[40rem]:pb-9">
      {/* Nav */}
      <div className="flex items-center justify-between gap-4">
        <a href={`${SITE}/#home`} {...out} className="flex items-center gap-2.5 transition-opacity hover:opacity-70">
          <span className="grid size-7 place-items-center rounded-full bg-[var(--fg)] text-[10px] font-semibold tracking-tight text-[var(--bg)]">
            VP
          </span>
          <span className="text-[13px] font-semibold tracking-tight">Vraj Parikh</span>
        </a>
        <nav className="hidden items-center rounded-full bg-[var(--panel-2)] p-0.5 text-[12.5px] shadow-[inset_0_0_0_1px_var(--line)] @min-[40rem]:flex">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              {...out}
              className="rounded-full px-3 py-1 text-[var(--muted)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--fg)]"
            >
              {n.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Hero */}
      <div className="mt-10 @min-[40rem]:mt-14">
        <div className="flex items-center gap-3">
          <a
            href={`${SITE}/#home`}
            {...out}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-[conic-gradient(from_210deg,#c4b5fd,#f9a8d4,#fde68a,#c4b5fd)] p-[2px] transition-transform active:scale-[0.96]"
          >
            <span className="grid size-full place-items-center rounded-full bg-[var(--bg)] text-[12px] font-semibold tracking-tight">
              VP
            </span>
          </a>
          <a href={`${SITE}/resume`} {...out} className="text-[12.5px] leading-tight text-[var(--muted)] transition-colors hover:text-[var(--fg)]">
            Product Designer
            <br />
            <span className="text-[var(--faint)]">Vadodara, Gujarat</span>
          </a>
        </div>
        <h3 className="mt-6 max-w-[30ch] text-[26px] leading-[1.08] font-semibold tracking-[-0.035em] text-balance @min-[40rem]:text-[34px]">
          <a href={`${SITE}/#about-me`} {...out} className="transition-opacity hover:opacity-80">
            I design flows with clear hierarchy, honest states and{" "}
            <span className="text-[var(--muted)]">build-ready details.</span>
          </a>
        </h3>
        <p className="mt-4 max-w-[52ch] text-[13.5px] leading-relaxed text-pretty text-[var(--muted)]">
          <a href={`${SITE}/#about-me`} {...out} className="transition-colors hover:text-[var(--fg)]">
            Product designer with a computer science background, so I can read the frontend code
            that ships my work. Fundamentals over trends.
          </a>
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={X}
            {...out}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--fg)] pr-3.5 pl-4 text-[13px] font-medium text-[var(--bg)] shadow-[0_1px_2px_rgba(0,0,0,.2)] transition-transform active:scale-[0.96]"
          >
            Connect
            <span aria-hidden="true">↗</span>
          </a>
          <a
            href={`${SITE}/resume`}
            {...out}
            className="inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium shadow-[inset_0_0_0_1px_var(--line)] transition-[background-color,transform] hover:bg-[var(--panel-2)] active:scale-[0.96]"
          >
            Resume
          </a>
        </div>
      </div>

      {/* Selected work */}
      <div className="mt-14">
        <div className="flex items-center justify-between">
          <Label no="01" href={`${SITE}/case-studies`}>Selected work</Label>
          <a href={`${SITE}/case-studies`} {...out} className="text-[12px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]">
            View all →
          </a>
        </div>
        <div className="mt-5 grid gap-x-5 gap-y-8 @min-[40rem]:grid-cols-2">
          {CASE_STUDIES.map((c) => (
            <a key={c.title} href={c.href} {...out} className="group block">
              <div className="transition-transform duration-300 ease-[var(--ease-out)] group-hover:-translate-y-0.5">
                <Cover art={c.art} />
              </div>
              <div className="mt-3.5 flex items-baseline justify-between gap-3">
                <h5 className="text-[15px] font-semibold tracking-tight">{c.title}</h5>
                <span className="font-mono text-[10.5px] text-[var(--faint)] tabular-nums">{c.no}</span>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-pretty text-[var(--muted)]">{c.text}</p>
              <p className="mt-2.5 text-[11.5px] text-[var(--faint)]">{c.tags.join(" · ")}</p>
            </a>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-xl ring-1 ring-[var(--line)] @min-[40rem]:grid-cols-4">
          {FEATURED.map((f, i) => (
            <a
              key={f.title}
              href={f.href}
              {...out}
              className={`group flex items-center justify-between gap-2 border-[var(--line)] px-3 py-2.5 text-[12.5px] transition-colors hover:bg-[var(--panel-2)] ${
                i % 2 ? "border-l" : i ? "@min-[40rem]:border-l" : ""
              } ${i >= 2 ? "border-t @min-[40rem]:border-t-0" : ""}`}
            >
              <span className="truncate">{f.title}</span>
              <span aria-hidden="true" className="text-[var(--faint)] transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--fg)]">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mt-14">
        <Label no="02" href={`${SITE}/#experience`}>Experience</Label>
        <div className="mt-4">
          {EXPERIENCE.map((e) => (
            <a
              key={e.place}
              href={`${SITE}/#experience`}
              {...out}
              className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-b border-[var(--line)] py-3 last:border-0 @min-[40rem]:grid-cols-[7.5rem_1fr]"
            >
              <span className="order-2 font-mono text-[11px] text-[var(--faint)] tabular-nums @min-[40rem]:order-1">{e.when}</span>
              <span className="order-1 text-[13.5px] @min-[40rem]:order-2">
                <span className="font-medium">{e.place}</span>
                <span className="text-[var(--muted)]"> · {e.role}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-14 rounded-2xl bg-[var(--panel-2)] p-5 shadow-[inset_0_0_0_1px_var(--line)] @min-[40rem]:p-6">
        <Label no="03" href={X}>Say hello</Label>
        <a
          href="mailto:vrajsensei@gmail.com"
          className="mt-3 block text-[20px] leading-tight font-semibold tracking-[-0.03em] transition-opacity hover:opacity-70 @min-[40rem]:text-[24px]"
        >
          vrajsensei@gmail.com
        </a>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-[var(--muted)]">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} {...out} className="transition-colors hover:text-[var(--fg)]">
              {s.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

type Phase = "drawing" | "waiting" | "ready";

const SPEEDS = [
  { label: "2.5s", ms: 2500 },
  { label: "3.5s", ms: 3500 },
  { label: "5s", ms: 5000 },
];

const PHASE: Record<Phase, { text: string; dot: string }> = {
  drawing: { text: "Agents drawing", dot: "bg-[var(--brand-400)]" },
  waiting: { text: "Waiting for data", dot: "bg-amber-400" },
  ready: { text: "Content ready", dot: "bg-emerald-500" },
};

const ReplayIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M2.75 8a5.25 5.25 0 1 0 1.6-3.77" />
    <path d="M2.5 2.5v2.75h2.75" />
  </svg>
);

const LockIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className} aria-hidden="true">
    <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
    <path d="M5.5 7V5.25a2.5 2.5 0 0 1 5 0V7" />
  </svg>
);

/** Live state of the demo, so you can see what the component is doing. */
function Status({ phase }: { phase: Phase }) {
  const { text, dot } = PHASE[phase];
  return (
    <div className="flex items-center gap-2 text-[13px] text-[var(--muted)]" role="status" aria-live="polite">
      <span className="relative grid size-2 place-items-center">
        {phase !== "ready" && (
          <span className={`absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:hidden ${dot}`} />
        )}
        <span className={`relative size-2 rounded-full ${dot}`} />
      </span>
      <span className="text-[var(--fg)]">{text}</span>
    </div>
  );
}

/** Three speeds in a segmented control with a sliding thumb. */
function Speed({ value, onChange }: { value: number; onChange: (ms: number) => void }) {
  const index = Math.max(0, SPEEDS.findIndex((s) => s.ms === value));
  return (
    <div
      role="radiogroup"
      aria-label="Drawing speed"
      className="relative grid h-8 grid-cols-3 rounded-full bg-[var(--panel-2)] p-0.5 text-xs shadow-[inset_0_0_0_1px_var(--line)]"
    >
      <span
        aria-hidden="true"
        className="card absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-full transition-transform duration-200 ease-[var(--ease-out)]"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {SPEEDS.map((s, i) => (
        <button
          key={s.ms}
          type="button"
          role="radio"
          aria-checked={i === index}
          onClick={() => onChange(s.ms)}
          className={`relative z-10 w-12 rounded-full font-medium tabular-nums transition-colors duration-150 ${
            i === index ? "text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/** A small switch. The thumb slides; the track fills with the brand color. */
function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex h-8 items-center gap-2 rounded-full pr-1 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
    >
      <span
        className={`relative h-[18px] w-[30px] rounded-full transition-colors duration-200 ${
          checked ? "bg-[var(--brand-500)]" : "bg-[var(--line)]"
        }`}
        style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,.12)" }}
      >
        <span
          className="absolute top-[2px] left-[2px] size-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.25)] transition-transform duration-200 ease-[var(--ease-out)]"
          style={{ transform: checked ? "translateX(12px)" : "none" }}
        />
      </span>
      {label}
    </button>
  );
}

export function AgentDrawDemo() {
  const [run, setRun] = useState(0);
  const [duration, setDuration] = useState(3500);
  const [slowData, setSlowData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("drawing");

  // Fake data: either ready right away, or 2.5s after the drawing ends.
  useEffect(() => {
    setPhase("drawing");
    const timers: number[] = [];
    if (slowData) {
      setLoading(true);
      timers.push(window.setTimeout(() => setPhase("waiting"), duration));
      timers.push(window.setTimeout(() => setLoading(false), duration + 2500));
    } else {
      setLoading(false);
    }
    return () => timers.forEach(clearTimeout);
  }, [run, slowData, duration]);

  const replay = () => setRun((r) => r + 1);

  return (
    <div className="card overflow-hidden rounded-2xl">
      {/* Toolbar */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2.5 border-b border-[var(--line)] px-3 py-2.5 @min-[40rem]:flex @min-[40rem]:px-4">
        <Status phase={phase} />
        <div className="col-span-2 flex items-center justify-between gap-2 @min-[40rem]:order-2 @min-[40rem]:ml-auto @min-[40rem]:justify-end @min-[40rem]:gap-3">
          <Switch
            checked={slowData}
            label="Slow data"
            onChange={(v) => {
              setSlowData(v);
              replay();
            }}
          />
          <Speed
            value={duration}
            onChange={(ms) => {
              setDuration(ms);
              replay();
            }}
          />
        </div>
        <button
          type="button"
          onClick={replay}
          className="btn-brand press col-start-2 row-start-1 inline-flex h-8 items-center gap-1.5 rounded-full pr-3.5 pl-3 text-[13px] font-medium @min-[40rem]:order-3"
        >
          <ReplayIcon className="size-3.5" />
          Replay
        </button>
      </div>

      {/* Stage: the portfolio in a little browser window on a dotted canvas */}
      <div className="relative bg-[var(--panel-2)]/40 p-3 @min-[40rem]:p-6">
        <div className="dots fade-edges pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-xl bg-[var(--bg)] shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3 border-b border-[var(--line)] px-3 py-2">
            <div className="flex gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-2.5 rounded-full bg-[var(--line)]" />
              ))}
            </div>
            <div className="mx-auto flex h-6 max-w-full min-w-0 items-center gap-1.5 rounded-md bg-[var(--panel-2)] px-2.5 text-[11px] text-[var(--muted)] @min-[40rem]:w-72 @min-[40rem]:justify-center">
              <LockIcon className="size-3 shrink-0" />
              <span className="truncate">parikhvraj.framer.website</span>
            </div>
            <span className="w-[42px]" aria-hidden="true" />
          </div>
          <AgentDraw key={run} loading={loading} duration={duration} onDone={() => setPhase("ready")}>
            <Profile />
          </AgentDraw>
        </div>
      </div>
    </div>
  );
}
