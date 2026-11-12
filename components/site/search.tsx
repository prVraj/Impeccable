"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COMPONENTS, FAMILIES, GROUPS, type Group } from "@/lib/site";
import { cx } from "@/lib/utils";
import { ArrowTurnBackwardIcon, Cancel01Icon, Clock01Icon, CommandIcon, Search01Icon } from "./hugeicons";
import { GroupIcon } from "./group-icon";
import { Mark } from "./icons";

/**
 * Site search. The Search buttons (SearchTrigger) and Cmd+K on Mac / Ctrl+K
 * elsewhere open one dialog (SiteSearch, rendered once in app/layout.tsx).
 * With nothing typed it shows what you opened from search lately, or the four
 * newest items if you haven't searched yet.
 */

const OPEN_EVENT = "impeccable:search";
const RECENT_KEY = "impeccable-recent-search";
const RECENT_MAX = 5;

/**
 * Newest first. Anything in lib/site.ts that is missing here counts as the
 * newest of all, so a new item shows up in "Recently added" on its own; add
 * its slug to the front of this list when you get to it.
 */
const ADDED_NEWEST_FIRST = [
  "burning-toast",
  "hex-login",
  "login-pages",
  "framed-upload",
  "password-strength",
  "scratch-me",
  "brain-txt",
  "ui-tongue",
  "agent-draw",
  "burning-screen",
];

// The open: from 90% size and half opacity to full, like it comes up through
// the screen. Fast to start, calm to settle. The close is quicker and smaller.
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const OPEN_MS = 220;
const CLOSE_MS = 130;

type Item = {
  href: string;
  name: string;
  blurb: string;
  section: string;
  group?: Group;
  haystack: string;
};

const ITEMS: Item[] = [
  {
    href: "/docs",
    name: "Introduction",
    blurb: "Why Impeccable exists and how to use it.",
    section: "Getting started",
    haystack: "introduction getting started docs install blend prompts",
  },
  ...COMPONENTS.map((c) => {
    const section = GROUPS.find((g) => g.id === c.group)?.label ?? "";
    return {
      href: `/docs/${c.slug}`,
      name: c.name,
      blurb: c.blurb,
      section,
      group: c.group,
      haystack: [c.name, c.slug, c.category, c.blurb, section, c.family ?? ""].join(" ").toLowerCase(),
    };
  }),
  ...FAMILIES.map((f) => {
    const section = GROUPS.find((g) => g.id === f.group)?.label ?? "";
    return {
      href: `/docs/${f.slug}`,
      name: f.name,
      blurb: f.blurb,
      section,
      group: f.group,
      haystack: [f.name, f.slug, f.blurb, section, "sign in signin log in"].join(" ").toLowerCase(),
    };
  }),
];

export function openSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

function isMacLike() {
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** null until we know, so the server and the first paint agree. */
function useIsMac() {
  const [mac, setMac] = useState<boolean | null>(null);
  useEffect(() => setMac(isMacLike()), []);
  return mac;
}

/** The ⌘ K (or Ctrl K) keycap. Hidden until we know which one to show. */
function Shortcut({ mac }: { mac: boolean | null }) {
  return (
    <kbd
      className={cx(
        "flex h-5 items-center gap-0.5 rounded-[5px] border border-[var(--line)] bg-[var(--panel-2)] px-1 font-sans text-[11px] leading-none font-medium text-[var(--muted)]",
        mac === null && "invisible",
      )}
    >
      {mac === false ? <span>Ctrl</span> : <CommandIcon size={11} strokeWidth={1.75} />}
      <span>K</span>
    </kbd>
  );
}

/**
 * The Search button. `compact` is the icon-only one for phone headers.
 */
export function SearchTrigger({ compact, className }: { compact?: boolean; className?: string }) {
  const mac = useIsMac();
  const keys = mac === false ? "Control+K" : "Meta+K";
  if (compact) {
    return (
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search"
        aria-haspopup="dialog"
        aria-keyshortcuts={keys}
        className={cx(
          "press grid size-9 place-items-center rounded-md text-[var(--muted)] transition-colors hover:text-[var(--fg)]",
          className,
        )}
      >
        <Search01Icon size={18} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-haspopup="dialog"
      aria-keyshortcuts={keys}
      className={cx(
        "press flex h-7 items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] pr-1 pl-2 text-[13px] text-[var(--muted)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--line))] hover:text-[var(--fg)]",
        className,
      )}
    >
      <Search01Icon size={14} />
      <span className="mr-4">Search</span>
      <Shortcut mac={mac} />
    </button>
  );
}

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveRecent(href: string) {
  try {
    const next = [href, ...readRecent().filter((h) => h !== href)].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}

type Section = { label: string; recent?: boolean; items: Item[] };

function newest(count: number): Item[] {
  const rank = (i: Item) => {
    const slug = i.href.replace("/docs/", "");
    // Not in the list yet = just added = newest.
    return ADDED_NEWEST_FIRST.indexOf(slug);
  };
  return ITEMS.filter((i) => i.group)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, count);
}

function find(query: string): Section[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const q = words.join(" ");
  const score = (i: Item) => {
    const name = i.name.toLowerCase();
    return name.startsWith(q) ? 0 : name.includes(q) ? 1 : 2;
  };
  const hits = ITEMS.filter((i) => words.every((w) => i.haystack.includes(w) || i.name.toLowerCase().includes(w)));
  // Keep the sidebar's parts, best match first, and the part with the best match on top.
  const sections = new Map<string, Item[]>();
  for (const i of [...hits].sort((a, b) => score(a) - score(b))) {
    sections.set(i.section, [...(sections.get(i.section) ?? []), i]);
  }
  return [...sections].map(([label, items]) => ({ label, items }));
}

export function SiteSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const mac = useIsMac();

  const openRef = useRef(false);
  const closing = useRef(0); // which close is running, so a reopen can cancel it
  const panel = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const backTo = useRef<HTMLElement | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  const sections: Section[] = useMemo(() => {
    if (query.trim()) return find(query);
    const seen = recent.map((h) => ITEMS.find((i) => i.href === h)).filter((i): i is Item => !!i);
    if (seen.length) return [{ label: "Recent", recent: true, items: seen }];
    return [{ label: "Recently added", items: newest(4) }];
  }, [query, recent]);
  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const playIn = useCallback(() => {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel.current?.animate(
      still
        ? [{ opacity: 0.5 }, { opacity: 1 }]
        : [
            { opacity: 0.5, transform: "scale(0.9)" },
            { opacity: 1, transform: "scale(1)" },
          ],
      { duration: still ? 120 : OPEN_MS, easing: EASE_OUT },
    );
    veil.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
  }, []);

  const show = useCallback(() => {
    if (openRef.current) {
      // Asked to open while it is closing: stop the close and come back.
      if (closing.current) {
        closing.current = 0;
        panel.current?.getAnimations().forEach((a) => a.cancel());
        veil.current?.getAnimations().forEach((a) => a.cancel());
        playIn();
      }
      input.current?.focus();
      return;
    }
    backTo.current = document.activeElement as HTMLElement | null;
    setRecent(readRecent());
    setQuery("");
    setActive(0);
    openRef.current = true;
    setOpen(true);
  }, [playIn]);

  const hide = useCallback(() => {
    if (!openRef.current || closing.current) return;
    const id = Date.now();
    closing.current = id;
    const done = () => {
      if (closing.current !== id) return; // reopened meanwhile
      closing.current = 0;
      openRef.current = false;
      setOpen(false);
      backTo.current?.focus?.({ preventScroll: true });
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !panel.current) return done();
    const out = panel.current.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.96)" },
      ],
      { duration: CLOSE_MS, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
    );
    veil.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: CLOSE_MS + 20, easing: "ease-in", fill: "forwards" });
    out.finished.then(done, () => {});
  }, []);

  // The shortcut and the Search buttons.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "k" || e.altKey || e.shiftKey) return;
      if (!(isMacLike() ? e.metaKey : e.ctrlKey)) return;
      e.preventDefault();
      if (openRef.current && !closing.current) hide();
      else show();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [show, hide]);

  // On open: play the entrance, focus the field, hold the page still.
  useLayoutEffect(() => {
    if (!open) return;
    playIn();
    input.current?.focus();
    const body = document.body.style;
    const prev = { overflow: body.overflow, paddingRight: body.paddingRight };
    const bar = window.innerWidth - document.documentElement.clientWidth;
    body.overflow = "hidden";
    if (bar > 0) body.paddingRight = `${bar}px`;
    return () => {
      body.overflow = prev.overflow;
      body.paddingRight = prev.paddingRight;
    };
  }, [open, playIn]);

  // On phones the box sits in the middle of what is visible, so when the
  // keyboard slides up the box moves up with it instead of hiding behind it.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = wrap.current;
    if (!open || !vv || !el) return;
    const fit = () => {
      el.style.height = `${vv.height}px`;
      el.style.top = `${vv.offsetTop}px`;
    };
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => {
      vv.removeEventListener("resize", fit);
      vv.removeEventListener("scroll", fit);
    };
  }, [open]);

  // Keep the highlighted row in view when moving with the keyboard.
  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const pick = (item: Item) => {
    saveRecent(item.href);
    router.push(item.href);
    hide();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      hide();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!flat.length) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      const item = flat[active];
      if (item && !e.nativeEvent.isComposing) {
        e.preventDefault();
        pick(item);
      }
    } else if (e.key === "Tab") {
      // Everything here is reached with the arrows; keep focus in the field.
      e.preventDefault();
    }
  };

  if (!open) return null;

  let index = 0;
  const optionId = (i: number) => `site-search-option-${i}`;

  return (
    <div
      ref={wrap}
      className="fixed inset-x-0 top-0 z-[60] flex h-dvh flex-col justify-center sm:block"
      role="presentation"
      onKeyDown={onKeyDown}
    >
      <div
        ref={veil}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--frame)_55%,transparent)] backdrop-blur-[3px]"
        onClick={hide}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Search the library"
        className="relative mx-auto w-[calc(100%-24px)] max-w-[560px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] will-change-transform sm:mt-[16vh]"
        style={{ boxShadow: "var(--shadow-card), 0 24px 64px -24px rgba(10, 10, 10, 0.28)" }}
      >
        <div className="flex h-12 items-center gap-2.5 border-b border-[var(--line)] pr-2.5 pl-4">
          <Search01Icon size={16} className="shrink-0 text-[var(--faint)]" />
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search the library…"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[var(--fg)] outline-none placeholder:text-[var(--faint)]"
            role="combobox"
            aria-expanded="true"
            aria-controls="site-search-list"
            aria-activedescendant={flat[active] ? optionId(active) : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          <button
            type="button"
            onClick={hide}
            tabIndex={-1}
            aria-label="Close search"
            className="press grid h-6 shrink-0 place-items-center rounded-[5px] text-[var(--muted)] transition-colors hover:text-[var(--fg)] sm:border sm:border-[var(--line)] sm:bg-[var(--panel-2)] sm:px-1.5"
          >
            <Cancel01Icon size={16} className="sm:hidden" />
            <span className="hidden text-[11px] font-medium sm:block">Esc</span>
          </button>
        </div>

        <div
          ref={list}
          id="site-search-list"
          role="listbox"
          aria-label="Results"
          className="max-h-[min(360px,calc(100dvh-160px))] overflow-y-auto overscroll-contain p-1.5"
        >
          {flat.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-[var(--muted)]">
              Nothing found for “<span className="text-[var(--fg)]">{query.trim()}</span>”.
            </p>
          ) : (
            sections.map((s) => (
              <div key={s.label} role="group" aria-label={s.label} className="pb-1">
                <div className="flex items-center justify-between px-2.5 pt-2 pb-1.5">
                  <p className="text-xs font-medium text-[var(--faint)]">{s.label}</p>
                  {s.recent && (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => {
                        clearRecent();
                        setRecent([]);
                        setActive(0);
                        input.current?.focus();
                      }}
                      className="text-xs text-[var(--faint)] transition-colors hover:text-[var(--fg)]"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {s.items.map((item) => {
                  const i = index++;
                  const on = i === active;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      id={optionId(i)}
                      data-index={i}
                      role="option"
                      aria-selected={on}
                      tabIndex={-1}
                      onMouseMove={() => !on && setActive(i)}
                      onClick={(e) => {
                        // Cmd/Ctrl-click opens a new tab: leave the dialog open.
                        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                        saveRecent(item.href);
                        hide();
                      }}
                      className={cx(
                        "flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm",
                        on ? "bg-[color-mix(in_srgb,var(--accent)_9%,transparent)]" : "",
                      )}
                    >
                      <span className={cx("grid size-4 shrink-0 place-items-center", on ? "text-[var(--accent)]" : "text-[var(--faint)]")}>
                        {s.recent ? (
                          <Clock01Icon size={16} />
                        ) : item.group ? (
                          <GroupIcon group={item.group} />
                        ) : (
                          <Mark className="h-4 w-[14px]" />
                        )}
                      </span>
                      <span className="shrink-0 font-medium text-[var(--fg)]">{item.name}</span>
                      <span className="hidden min-w-0 flex-1 truncate text-[13px] text-[var(--faint)] sm:block">{item.blurb}</span>
                      <ArrowTurnBackwardIcon
                        size={14}
                        className={cx("ml-auto shrink-0 text-[var(--muted)] transition-opacity duration-150", on ? "opacity-100" : "opacity-0")}
                      />
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="hidden h-10 items-center gap-4 border-t border-[var(--line)] px-4 text-[11px] text-[var(--faint)] sm:flex">
          <span className="flex items-center gap-1.5">
            <Key>↑</Key>
            <Key>↓</Key>
            to move
          </span>
          <span className="flex items-center gap-1.5">
            <Key>↵</Key>
            to open
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Shortcut mac={mac} />
            to open or close
          </span>
        </div>
      </div>
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="grid h-5 min-w-5 place-items-center rounded-[5px] border border-[var(--line)] bg-[var(--panel-2)] px-1 font-sans text-[11px] leading-none text-[var(--muted)]">
      {children}
    </kbd>
  );
}
