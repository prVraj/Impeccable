"use client";

/**
 * Coffee FAQ, from Impeccable.
 *
 * A centred FAQ section: a small label, a title, a line under it, then a stack
 * of question rows that open one at a time to show their answer. The last row
 * is a chat box in the same style: type any question and press Enter or the
 * arrow. Your question becomes a new open row above the box, three dots "type"
 * for about a second and a half, then the reply writes itself in, word by word.
 * Only your latest question stays: asking again folds the one before away.
 *
 *   - With no `onAsk`, every question gets the same reply (by default:
 *     "My credits are over. Buy me a coffee."). No AI and no network.
 *   - Give it `onAsk` and return a string (or a promise of one) to answer for
 *     real. The dots stay for at least `replyDelay` either way.
 *   - One question at a time: the arrow waits until the reply is in.
 *
 * No packages. Colors come from the page's own theme variables
 * (--foreground / --background, else --fg / --bg), so it follows light and dark mode.
 */

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";

export type CoffeeFaqItem = {
  question: string;
  /** Plain text or your own markup (paragraphs, links). */
  answer: ReactNode;
};

export type CoffeeFaqProps = {
  /** The small pill above the title. Pass null to hide it. */
  eyebrow?: ReactNode;
  title?: ReactNode;
  /** The line under the title. Pass null to hide it. */
  description?: ReactNode;
  /** The questions and answers, top to bottom. */
  items?: CoffeeFaqItem[];
  /** Which row starts open (0 is the first). Leave out to start with all closed. */
  defaultOpen?: number;
  /** Show the chat box under the questions. */
  chat?: boolean;
  chatTitle?: ReactNode;
  chatDescription?: ReactNode;
  /** The face next to the replies and in the chat box, about 40px round. Defaults to the Impeccable mark. */
  avatar?: ReactNode;
  /** What every question gets back when there is no onAsk (or onAsk returns nothing). */
  reply?: string;
  /** How long the dots type before the reply shows, in ms (300 to 10000). A little is added or taken at random so it feels human. */
  replyDelay?: number;
  /** Called with each question. Return a string, or a promise of one, to answer with it. */
  onAsk?: (question: string) => string | void | Promise<string | void>;
  /** All the short texts. Pass only the ones you want to change. */
  labels?: Partial<CoffeeFaqLabels>;
  className?: string;
  style?: CSSProperties;
};

export type CoffeeFaqLabels = {
  /** The input's placeholder (and its label for screen readers). */
  placeholder: string;
  send: string;
  /** The tag on rows you asked. */
  you: string;
  /** Read out while the dots type. */
  typing: string;
  /** The reply when onAsk throws or its promise fails. */
  error: string;
};

const DEFAULT_LABELS: CoffeeFaqLabels = {
  placeholder: "Ask your own question",
  send: "Send",
  you: "You",
  typing: "Typing",
  error: "Something went wrong on my side. Try again in a moment.",
};

export const COFFEE_FAQ_ITEMS: CoffeeFaqItem[] = [
  {
    question: "Who makes it?",
    answer:
      "Me, Vraj. I'm a designer who wanted pieces that feel made for your product. Every item is designed, checked and polished here before it ships.",
  },
  {
    question: "What is Impeccable UI?",
    answer:
      "A free library of animated React components, sections and page effects. Each one comes with its code and two prompts, so it fits your product instead of looking borrowed from another site.",
  },
  {
    question: "Can I use it in client and paid projects?",
    answer:
      "Yes. Everything is under the MIT license, so you can use it in personal, client and commercial work. A credit is always nice, never required.",
  },
  {
    question: "How do I add something to my project?",
    answer:
      "Copy the install command on its page (npm, pnpm, yarn or bun), or paste its Install prompt into your AI coding tool. Either way you get one file in your components folder.",
  },
  {
    question: "What is the difference between Install and Blend?",
    answer:
      "Install adds the piece exactly as you see it here and only asks where it goes. Blend asks a few short questions first, then fits the colors, words and timing to your brand.",
  },
  {
    question: "Does it work in dark mode and on phones?",
    answer:
      "Yes. Every piece takes its colors from your theme, so it follows light and dark mode on its own, and each one is checked at phone, tablet and desktop sizes.",
  },
];

/* ---------- the design: keep as written ---------- */

const EASE = "cubic-bezier(.23,1,.32,1)"; // fast start, soft landing
const OPEN_EASE = "cubic-bezier(.32,.72,0,1)"; // rows opening and closing, like a drawer
const OPEN_MS = 420; // a row opening or closing
const REPLY_MS = 1500; // the dots type for this long by default...
const JITTER_MS = 250; // ...give or take this much, at random
const WORD_STAGGER_MS = 45; // between each word of the reply
const MAX_QUESTION = 280; // characters you can type

const CSS = `
.icf {
  --icf-fg: var(--foreground, var(--fg, CanvasText));
  --icf-bg: var(--background, var(--bg, Canvas));
  --icf-radius: var(--radius-lg, 8px);
  --icf-row: color-mix(in oklab, var(--icf-fg) 2.5%, var(--icf-bg));
  --icf-row-hover: color-mix(in oklab, var(--icf-fg) 4.5%, var(--icf-bg));
  --icf-line: color-mix(in oklab, var(--icf-fg) 9%, transparent);
  --icf-muted: color-mix(in oklab, var(--icf-fg) 62%, var(--icf-bg));
  --icf-faint: color-mix(in oklab, var(--icf-fg) 40%, var(--icf-bg));
  --icf-ring: color-mix(in oklab, var(--icf-fg) 35%, transparent);
  --icf-shadow: 0 1px 2px color-mix(in oklab, var(--icf-fg) 4%, transparent);
  --icf-lift: 0 1px 2px color-mix(in oklab, var(--icf-fg) 5%, transparent), 0 6px 16px -6px color-mix(in oklab, var(--icf-fg) 10%, transparent);
  container-type: inline-size;
  position: relative; box-sizing: border-box; width: 100%;
  color: var(--icf-fg); background: var(--icf-bg); font-family: inherit; -webkit-font-smoothing: antialiased;
}
.icf *, .icf *::before, .icf *::after { box-sizing: border-box; }
.icf-in { padding: 96px 24px; }
.icf-col { width: 100%; max-width: 640px; margin: 0 auto; }
.icf-head { text-align: center; }
.icf-eyebrow {
  display: inline-flex; align-items: center; height: 28px; padding: 0 12px; border-radius: 999px;
  border: 1px solid var(--icf-line); background: var(--icf-row); box-shadow: var(--icf-shadow);
  font-size: 13px; line-height: 1; font-weight: 500;
}
.icf-title { margin: 16px 0 0; font-size: 40px; line-height: 1.1; font-weight: 600; letter-spacing: -.035em; text-wrap: balance; overflow-wrap: anywhere; }
.icf-desc { margin: 14px auto 0; max-width: 440px; font-size: 17px; line-height: 1.55; color: var(--icf-muted); text-wrap: pretty; overflow-wrap: anywhere; }
.icf-head + .icf-list { margin-top: 48px; }
.icf-list { margin: 0; padding: 0; list-style: none; }
.icf-item { display: grid; grid-template-rows: 1fr; }
.icf-cell { min-height: 0; }
.icf-item + .icf-item > .icf-cell > .icf-row { margin-top: 12px; }
.icf-enter { animation: icf-grow .52s ${EASE} both; }
.icf-enter > .icf-cell, .icf-leave > .icf-cell { overflow: hidden; }
@keyframes icf-grow { from { grid-template-rows: 0fr; opacity: 0; transform: translateY(8px) scale(.985); } }
.icf-leave { animation: icf-shrink .46s ${OPEN_EASE} both; pointer-events: none; }
@keyframes icf-shrink { to { grid-template-rows: 0fr; opacity: 0; transform: translateY(-6px) scale(.985); filter: blur(2px); } }

.icf-row {
  border: 1px solid var(--icf-line); border-radius: var(--icf-radius); background: var(--icf-row); box-shadow: var(--icf-shadow);
  transition: background-color .2s, box-shadow .3s ${EASE}, border-color .2s;
}
@media (hover: hover) { .icf-row:has(> .icf-h .icf-q:hover):not([data-open]) { background: var(--icf-row-hover); } }
.icf-row[data-open] { background: var(--icf-bg); box-shadow: var(--icf-lift); }
.icf-h { margin: 0; font: inherit; }
.icf-q {
  all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 12px; width: 100%; min-height: 56px;
  padding: 15px 16px 15px 20px; padding-inline: 20px 16px; border-radius: calc(var(--icf-radius) - 1px);
  font-size: 16px; line-height: 24px; font-weight: 500; text-align: start; cursor: pointer;
  -webkit-tap-highlight-color: transparent; user-select: none;
}
.icf-q:focus-visible { outline: 2px solid var(--icf-ring); outline-offset: -2px; }
.icf-q-text { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.icf-you {
  flex: none; display: inline-flex; align-items: center; height: 20px; padding: 0 7px; border-radius: 999px;
  font-size: 11px; font-weight: 600; letter-spacing: .02em; color: var(--icf-bg); background: var(--icf-fg);
  align-self: flex-start; margin-top: 2px; /* sits on the first line of a long question */
}
.icf-chev { flex: none; width: 20px; height: 20px; color: var(--icf-muted); transition: transform ${OPEN_MS}ms ${OPEN_EASE}, color .2s; }
.icf-row[data-open] .icf-chev { transform: rotate(180deg); color: var(--icf-fg); }

.icf-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows ${OPEN_MS}ms ${OPEN_EASE}; }
.icf-row[data-open] > .icf-a { grid-template-rows: 1fr; }
.icf-a-clip { min-height: 0; overflow: hidden; visibility: hidden; transition: visibility 0s ${OPEN_MS}ms; }
.icf-row[data-open] > .icf-a > .icf-a-clip { visibility: visible; transition-delay: 0s; }
.icf-a-body {
  padding: 0 52px 18px 20px; padding-inline: 20px 52px; font-size: 15px; line-height: 24px; color: var(--icf-muted);
  overflow-wrap: anywhere; opacity: 0; transform: translateY(-6px); filter: blur(3px);
  transition: opacity .16s, transform .3s ${EASE}, filter .16s;
}
.icf-row[data-open] .icf-a-body { opacity: 1; transform: none; filter: none; transition: opacity .32s .07s, transform .46s ${EASE} .05s, filter .32s .07s; }
.icf-a-body > p { margin: 0; }
.icf-a-body > p + p { margin-top: 10px; }
.icf-a-body a { color: var(--icf-fg); text-underline-offset: 3px; }

.icf-said { display: flex; align-items: flex-start; gap: 10px; }
.icf-face { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 999px; overflow: hidden; background: var(--icf-fg); color: var(--icf-bg); }
.icf-face > svg { width: 46%; height: auto; }
.icf-face > img { width: 100%; height: 100%; object-fit: cover; }
.icf-reply { position: relative; flex: 1; min-width: 0; min-height: 24px; color: color-mix(in oklab, var(--icf-fg) 82%, var(--icf-bg)); }
.icf-dots { position: absolute; inset-block-start: 0; inset-inline-start: 0; display: flex; align-items: center; gap: 4px; height: 24px; color: var(--icf-fg); transition: opacity .2s, filter .2s; }
.icf-dots > i { width: 6px; height: 6px; border-radius: 999px; background: currentColor; opacity: .3; animation: icf-dot 1.2s ease-in-out infinite; }
.icf-dots > i:nth-child(2) { animation-delay: .15s; }
.icf-dots > i:nth-child(3) { animation-delay: .3s; }
@keyframes icf-dot { 0%, 60%, 100% { transform: none; opacity: .3; } 30% { transform: translateY(-3px); opacity: .9; } }
.icf-said[data-done] .icf-dots { opacity: 0; filter: blur(2px); }
.icf-w { display: inline-block; opacity: 0; }
.icf-said[data-done] .icf-w { animation: icf-word .5s ${EASE} both; animation-delay: calc(var(--i) * ${WORD_STAGGER_MS}ms + 80ms); }
@keyframes icf-word { from { opacity: 0; transform: translateY(4px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }

.icf-chat:focus-within { border-color: color-mix(in oklab, var(--icf-fg) 22%, transparent); box-shadow: var(--icf-lift), 0 0 0 3px color-mix(in oklab, var(--icf-fg) 6%, transparent); }
.icf-chat-head { display: flex; align-items: center; gap: 14px; padding: 18px 20px; }
.icf-chat-head .icf-face { width: 40px; height: 40px; }
.icf-chat-text { min-width: 0; }
.icf-chat-title { margin: 0; font-size: 16px; line-height: 24px; font-weight: 600; overflow-wrap: anywhere; }
.icf-chat-sub { margin: 2px 0 0; font-size: 14px; line-height: 20px; color: var(--icf-muted); overflow-wrap: anywhere; }
.icf-compose {
  position: relative; display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 9px 8px 20px; padding-inline: 20px 9px;
  border-top: 1px solid var(--icf-line); border-radius: 0 0 calc(var(--icf-radius) - 1px) calc(var(--icf-radius) - 1px); background: var(--icf-bg);
}
.icf-input {
  all: unset; box-sizing: border-box; flex: 1; min-width: 0; height: 40px; font: inherit; font-size: 16px; line-height: 24px; color: var(--icf-fg);
  caret-color: var(--icf-fg); transition: opacity .15s;
}
.icf-input::placeholder { color: var(--icf-faint); opacity: 1; }
.icf-input[data-hide] { opacity: 0; transition: none; }
.icf-ghost {
  position: absolute; inset-inline: 20px 60px; top: 50%; margin-top: -12px; height: 24px; font-size: 16px; line-height: 24px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; animation: icf-ghost .42s ${EASE} forwards;
}
@keyframes icf-ghost { to { opacity: 0; transform: translateY(-14px); filter: blur(3px); } }
.icf-send {
  all: unset; box-sizing: border-box; flex: none; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 999px;
  background: var(--icf-fg); color: var(--icf-bg); cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: transform .16s ${EASE}, background-color .2s, color .2s;
}
.icf-send:active:not([aria-disabled="true"]) { transform: scale(.92); }
.icf-send:focus-visible { outline: 2px solid var(--icf-ring); outline-offset: 2px; }
.icf-send[aria-disabled="true"] { cursor: default; background: color-mix(in oklab, var(--icf-fg) 8%, transparent); color: var(--icf-faint); }
.icf-send > svg { width: 18px; height: 18px; transition: transform .3s ${EASE}; }
@media (hover: hover) { .icf-send:not([aria-disabled="true"]):hover > svg { transform: translateY(-1px); } }
.icf-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

@container (max-width: 560px) {
  .icf-in { padding: 64px 16px; }
  .icf-title { font-size: 30px; }
  .icf-desc { font-size: 16px; }
  .icf-head + .icf-list { margin-top: 36px; }
  .icf-q { font-size: 15px; padding-inline: 16px 12px; }
  .icf-a-body { padding-inline: 16px 16px; }
  .icf-chat-head { padding: 16px; }
  .icf-compose { padding-inline-start: 16px; }
  .icf-ghost { inset-inline-start: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .icf *, .icf *::before, .icf *::after { transition-duration: 0s !important; transition-delay: 0s !important; animation: none !important; }
  .icf-said[data-done] .icf-w { opacity: 1; }
  .icf-dots > i { opacity: .6; }
  .icf-ghost { display: none; }
  .icf-enter > .icf-cell { overflow: visible; }
}
`;

/** The Impeccable mark: a pointy-top hexagon with three stripes cut across its top right. */
function DefaultAvatar() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 69 80" aria-hidden="true">
      <defs>
        <mask id={`icf-cut-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="69" height="80">
          <path d="M34.5 0 69 20v40L34.5 80 0 60V20z" fill="#fff" />
          <path d="M0-11.5 69 28.5M0-6 69 34M0-.5 69 39.5" stroke="#000" strokeWidth="4" />
        </mask>
      </defs>
      <path d="M34.5 0 69 20v40L34.5 80 0 60V20z" fill="currentColor" mask={`url(#icf-cut-${id})`} />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="icf-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 9s-4.42 6-6 6-6-6-6-6" />
    </svg>
  );
}

function ArrowUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20V4M6 10s4.42-6 6-6 6 6 6 6" />
    </svg>
  );
}

type Asked = { id: string; question: string; reply: string | null; fresh: boolean; leaving?: boolean };

/** The reply, one span per word so the words can arrive one after another. */
function Words({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="icf-w" style={{ "--i": i } as CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export function CoffeeFaq({
  eyebrow = "Frequently asked questions",
  title = "Questions about Impeccable UI",
  description = "Everything people ask before they install their first piece. Can't find yours? Ask it at the bottom.",
  items = COFFEE_FAQ_ITEMS,
  defaultOpen,
  chat = true,
  chatTitle = "Still have a question?",
  chatDescription = "Ask it here. I usually reply in a second or two.",
  avatar,
  reply = "My credits are over. Buy me a coffee.",
  replyDelay = REPLY_MS,
  onAsk,
  labels: labelOverrides,
  className,
  style,
}: CoffeeFaqProps) {
  const t = { ...DEFAULT_LABELS, ...labelOverrides };
  const uid = useId().replace(/:/g, "");
  const rowId = (i: number) => `icf-${uid}-q${i}`;
  const [open, setOpen] = useState<string | null>(
    typeof defaultOpen === "number" && defaultOpen >= 0 && defaultOpen < items.length ? rowId(defaultOpen) : null,
  );
  const [asked, setAsked] = useState<Asked[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [ghost, setGhost] = useState<{ key: number; text: string } | null>(null);
  const [said, setSaid] = useState(""); // read out once a reply is in
  const count = useRef(0);
  const timers = useRef(new Set<number>());
  const alive = useRef(true);
  const composeRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stop every timer when the section goes away, so nothing updates a gone component.
  useEffect(() => {
    alive.current = true;
    const live = timers.current;
    return () => {
      alive.current = false;
      live.forEach((id) => window.clearTimeout(id));
      live.clear();
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      if (alive.current) fn();
    }, ms);
    timers.current.add(id);
  };

  const toggle = (id: string) => setOpen((now) => (now === id ? null : id));

  const send = (e: FormEvent) => {
    e.preventDefault();
    const question = text.trim();
    if (!question || busy) return;
    const n = ++count.current;
    const id = `icf-${uid}-a${n}`;
    // Only the latest question stays, so the section never grows: the one before folds
    // away while the new one grows in its place (at once with reduced motion).
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAsked((list) => [
      ...(reduce ? [] : list.map((a) => ({ ...a, leaving: true }))),
      { id, question, reply: null, fresh: true },
    ]);
    if (!reduce) later(() => setAsked((list) => list.filter((a) => !a.leaving)), 520);
    setOpen(id);
    setText("");
    setBusy(true);
    setSaid("");
    setGhost({ key: n, text: question });
    later(() => setGhost((g) => (g && g.key === n ? null : g)), 450);

    // Keep the box in view once the new row has pushed it down.
    later(() => composeRef.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }), reduce ? 0 : 560);

    const base = Math.min(10000, Math.max(300, Number.isFinite(replyDelay) ? replyDelay : REPLY_MS));
    const wait = Math.max(300, base + (Math.random() * 2 - 1) * JITTER_MS);
    const start = Date.now();
    Promise.resolve()
      .then(() => onAsk?.(question))
      .then(
        (answer) => (typeof answer === "string" && answer.trim() ? answer.trim() : reply),
        (err) => {
          console.error(err);
          return t.error;
        },
      )
      .then((answer) => {
        later(() => {
          setAsked((list) => list.map((a) => (a.id === id ? { ...a, reply: answer } : a)));
          setBusy(false);
          setSaid(answer);
        }, Math.max(0, wait - (Date.now() - start)));
      });
  };

  const empty = !text.trim();

  return (
    <section className={className ? `icf ${className}` : "icf"} style={style}>
      <style>{CSS}</style>
      <div className="icf-in">
        <div className="icf-col">
          {(eyebrow != null || title != null || description != null) && (
            <div className="icf-head">
              {eyebrow != null && <span className="icf-eyebrow">{eyebrow}</span>}
              {title != null && <h2 className="icf-title">{title}</h2>}
              {description != null && <p className="icf-desc">{description}</p>}
            </div>
          )}

          <ul className="icf-list">
            {items.map((item, i) => {
              const id = rowId(i);
              const isOpen = open === id;
              return (
                <li key={id} className="icf-item">
                  <div className="icf-cell">
                  <div className="icf-row" data-open={isOpen || undefined}>
                    <h3 className="icf-h">
                      <button type="button" id={`${id}-btn`} className="icf-q" aria-expanded={isOpen} aria-controls={`${id}-panel`} onClick={() => toggle(id)}>
                        <span className="icf-q-text">{item.question}</span>
                        <Chevron />
                      </button>
                    </h3>
                    <div className="icf-a">
                      <div className="icf-a-clip">
                        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`} className="icf-a-body">
                          {typeof item.answer === "string" ? <p>{item.answer}</p> : item.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </li>
              );
            })}

            {asked.map((a) => {
              const isOpen = open === a.id;
              const done = a.reply !== null;
              // While the dots type, the default reply is already laid out (hidden) so the row
              // doesn't jump when it arrives. A reply from onAsk isn't known yet, so it gets one line.
              const shown = a.reply ?? (onAsk ? "" : reply);
              return (
                <li
                  key={a.id}
                  className={a.leaving ? "icf-item icf-leave" : a.fresh ? "icf-item icf-enter" : "icf-item"}
                  aria-hidden={a.leaving || undefined}
                  onAnimationEnd={(e) => {
                    // Once it has grown in, stop clipping so its shadow shows.
                    if (e.target === e.currentTarget && !a.leaving)
                      setAsked((list) => list.map((x) => (x.id === a.id ? { ...x, fresh: false } : x)));
                  }}
                >
                  <div className="icf-cell">
                    <div className="icf-row" data-open={isOpen || undefined}>
                      <h3 className="icf-h">
                        <button type="button" id={`${a.id}-btn`} className="icf-q" aria-expanded={isOpen} aria-controls={`${a.id}-panel`} onClick={() => toggle(a.id)}>
                          <span className="icf-you">{t.you}</span>
                          <span className="icf-q-text">{a.question}</span>
                          <Chevron />
                        </button>
                      </h3>
                      <div className="icf-a">
                        <div className="icf-a-clip">
                          <div id={`${a.id}-panel`} role="region" aria-labelledby={`${a.id}-btn`} className="icf-a-body">
                            <div className="icf-said" data-done={done || undefined}>
                              <span className="icf-face" aria-hidden="true">
                                {avatar ?? <DefaultAvatar />}
                              </span>
                              <div className="icf-reply">
                                <span className="icf-dots" aria-hidden="true">
                                  <i />
                                  <i />
                                  <i />
                                </span>
                                {done ? <Words text={shown} /> : <span aria-hidden="true">{shown ? <Words text={shown} /> : null}</span>}
                                {!done && <span className="icf-sr">{t.typing}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}

            {chat && (
              <li className="icf-item">
                <div className="icf-cell">
                <div className="icf-row icf-chat">
                  <div className="icf-chat-head">
                    <span className="icf-face" aria-hidden="true">
                      {avatar ?? <DefaultAvatar />}
                    </span>
                    <div className="icf-chat-text">
                      {chatTitle != null && <p className="icf-chat-title">{chatTitle}</p>}
                      {chatDescription != null && <p className="icf-chat-sub">{chatDescription}</p>}
                    </div>
                  </div>
                  <form ref={composeRef} className="icf-compose" onSubmit={send}>
                    <label className="icf-sr" htmlFor={`icf-${uid}-input`}>
                      {t.placeholder}
                    </label>
                    <input
                      ref={inputRef}
                      id={`icf-${uid}-input`}
                      className="icf-input"
                      type="text"
                      name="question"
                      autoComplete="off"
                      enterKeyHint="send"
                      maxLength={MAX_QUESTION}
                      placeholder={t.placeholder}
                      value={text}
                      data-hide={ghost && !text ? "" : undefined}
                      onChange={(e) => setText(e.target.value)}
                    />
                    {ghost && (
                      <span key={ghost.key} className="icf-ghost" aria-hidden="true">
                        {ghost.text}
                      </span>
                    )}
                    <button type="submit" className="icf-send" aria-label={t.send} aria-disabled={empty || busy || undefined}>
                      <ArrowUp />
                    </button>
                  </form>
                </div>
                </div>
              </li>
            )}
          </ul>
          <p className="icf-sr" aria-live="polite">
            {said}
          </p>
        </div>
      </div>
    </section>
  );
}
