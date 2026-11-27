"use client";

/**
 * Intent sidebar: a chat sidebar that reads what the person means to do.
 *
 * 1. Hover card. Point at a chat and, after a short wait, a card shows its title, when it was last
 *    used and its first file. Move to the next chat and the card glides there at once (no new wait).
 *    Point at (or tap) "+N" and the card opens a list of every file in that chat; click one to open
 *    the chat right at that file.
 * 2. Safe triangle. The ⋯ menu has submenus. Moving diagonally from a submenu's row towards the
 *    open submenu never closes it, even when the pointer crosses other rows on the way. Resting on
 *    another row for 500 ms closes the submenu and lights that row instead.
 * Phones (no hover): tap a chat to open it, tap its file count for the file list, and ⋯ opens a
 * bottom sheet whose submenus slide in like pages.
 *
 * Only React. Colours come from your theme: --foreground and --background (shadcn), else --fg and --bg.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/* ─── Timing. Change these numbers to change the feel. ─────────────────────────────────────── */

/** How long the pointer rests on a chat before the first card shows (so passing by never flashes one). */
const OPEN_DELAY = 400;
/** How long the card stays after the pointer leaves both the chat and the card. */
const CLOSE_DELAY = 300;
/** After a card closes, pointing at a chat within this time shows its card at once. */
const SKIP_WINDOW = 300;
/** How long the pointer rests on a submenu row before its submenu opens. */
const SUB_OPEN_DELAY = 100;
/** How long the pointer must rest on another row, on its way to an open submenu, before it counts. */
const REST_MS = 500;
/** The card's glide from one chat to the next, and its height change. */
const GLIDE_MS = 260;
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/* ─── Types ────────────────────────────────────────────────────────────────────────────────── */

export type IntentFile = { id: string; name: string };
export type IntentNotify = "all" | "mentions" | "none";
export type IntentChat = {
  id: string;
  title: string;
  /** When it was last used, already written for people: "2h ago", "Yesterday", "Nov 19". */
  time: string;
  /** The files (pages, documents) made in this chat. The first one shows on the card. */
  files?: IntentFile[];
  pinned?: boolean;
  unread?: boolean;
  /** Its notification setting, shown next to Notifications in the menu. Default "all". */
  notify?: IntentNotify;
  /** The project it sits in, shown next to Move to project. */
  project?: string;
};
export type IntentSection = { title: string; chats: IntentChat[] };
export type IntentAction =
  | "open-window"
  | "pin"
  | "unpin"
  | "mark-unread"
  | "mark-read"
  | "rename"
  | "notify"
  | "move"
  | "settings"
  | "archive"
  | "delete";

export type IntentSidebarProps = {
  /** Groups of chats, like Pinned and Recents. */
  sections: IntentSection[];
  /** The chat that is open now. */
  activeId?: string;
  /** A chat (and maybe one of its files) was chosen. */
  onOpen?: (chatId: string, fileId?: string) => void;
  /** A menu choice. `value` is the notification setting ("all", "mentions", "none") or the project name ("" for none). */
  onAction?: (chatId: string, action: IntentAction, value?: string) => void;
  /** Projects listed under Move to project. */
  projects?: string[];
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
};

/* ─── Menu model ───────────────────────────────────────────────────────────────────────────── */

type SubKind = "notify" | "move";
type Entry =
  | { kind: "sep"; id: string }
  | { kind: "item"; id: IntentAction; label: string; key?: string; danger?: boolean; sub?: SubKind; value?: string };
type SubEntry = { value: string; label: string; hint?: string };

const NOTIFY: SubEntry[] = [
  { value: "all", label: "All new messages", hint: "Every reply in this chat" },
  { value: "mentions", label: "Mentions only", hint: "Only when someone names you" },
  { value: "none", label: "Nothing", hint: "Stay quiet, check in when you like" },
];
const NOTIFY_SHORT: Record<IntentNotify, string> = { all: "All", mentions: "Mentions", none: "Off" };

function entriesFor(chat: IntentChat): Entry[] {
  return [
    { kind: "item", id: "open-window", label: "Open in new window", key: "O" },
    { kind: "sep", id: "s1" },
    chat.pinned ? { kind: "item", id: "unpin", label: "Unpin", key: "P" } : { kind: "item", id: "pin", label: "Pin", key: "P" },
    chat.unread
      ? { kind: "item", id: "mark-read", label: "Mark as read", key: "U" }
      : { kind: "item", id: "mark-unread", label: "Mark as unread", key: "U" },
    { kind: "item", id: "rename", label: "Rename", key: "R" },
    { kind: "sep", id: "s2" },
    { kind: "item", id: "notify", label: "Notifications", sub: "notify", value: NOTIFY_SHORT[chat.notify ?? "all"] },
    { kind: "item", id: "move", label: "Move to project", sub: "move", value: chat.project || "None" },
    { kind: "item", id: "settings", label: "Settings", key: "S" },
    { kind: "sep", id: "s3" },
    { kind: "item", id: "archive", label: "Archive", key: "A" },
    { kind: "item", id: "delete", label: "Delete", key: "D", danger: true },
  ];
}

function subFor(kind: SubKind, projects: string[]): SubEntry[] {
  if (kind === "notify") return NOTIFY;
  return [...projects.map((p) => ({ value: p, label: p })), { value: "", label: "No project" }];
}

function subValue(kind: SubKind, chat: IntentChat) {
  return kind === "notify" ? (chat.notify ?? "all") : (chat.project ?? "");
}

/* ─── Geometry ─────────────────────────────────────────────────────────────────────────────── */

type Pt = { x: number; y: number };
const side = (p: Pt, a: Pt, b: Pt) => (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
/** True when p is inside the triangle abc. */
function inTriangle(p: Pt, a: Pt, b: Pt, c: Pt) {
  const d1 = side(p, a, b);
  const d2 = side(p, b, c);
  const d3 = side(p, c, a);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/* ─── Small icons (Hugeicons, MIT) ─────────────────────────────────────────────────────────── */

function Icon({ d, size = 16 }: { d: string[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  );
}
const FILE = [
  "M8 17H16",
  "M8 13H12",
  "M13 2.5V3C13 5.82843 13 7.24264 13.8787 8.12132C14.7574 9 16.1716 9 19 9H19.5M20 10.6569V14C20 17.7712 20 19.6569 18.8284 20.8284C17.6569 22 15.7712 22 12 22C8.22876 22 6.34315 22 5.17157 20.8284C4 19.6569 4 17.7712 4 14V9.45584C4 6.21082 4 4.58831 4.88607 3.48933C5.06508 3.26731 5.26731 3.06508 5.48933 2.88607C6.58831 2 8.21082 2 11.4558 2C12.1614 2 12.5141 2 12.8372 2.11401C12.9044 2.13772 12.9702 2.165 13.0345 2.19575C13.3436 2.34355 13.593 2.593 14.0919 3.09188L18.8284 7.82843C19.4065 8.40649 19.6955 8.69552 19.8478 9.06306C20 9.4306 20 9.83935 20 10.6569Z",
];
const DOTS = [
  "M6.00449 12.5V12M18.0045 12.5V12M12.0045 12.5V12M7.00449 12.5C7.00449 11.9477 6.55677 11.5 6.00449 11.5C5.4522 11.5 5.00449 11.9477 5.00449 12.5C5.00449 13.0523 5.4522 13.5 6.00449 13.5C6.55677 13.5 7.00449 13.0523 7.00449 12.5ZM19.0045 12.5C19.0045 11.9477 18.5568 11.5 18.0045 11.5C17.4522 11.5 17.0045 11.9477 17.0045 12.5C17.0045 13.0523 17.4522 13.5 18.0045 13.5C18.5568 13.5 19.0045 13.0523 19.0045 12.5ZM13.0045 12.5C13.0045 11.9477 12.5568 11.5 12.0045 11.5C11.4522 11.5 11.0045 11.9477 11.0045 12.5C11.0045 13.0523 11.4522 13.5 12.0045 13.5C12.5568 13.5 13.0045 13.0523 13.0045 12.5Z",
];
const CHEVRON = ["M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18"];
const BACK = ["M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18"];
const CHECK = ["M5 14L8.5 17.5L19 6.5"];

/* ─── Styles ───────────────────────────────────────────────────────────────────────────────── */

const CSS = `
.isb{--isb-fg:var(--foreground,var(--fg,#0a0a0a));--isb-bg:var(--background,var(--bg,#fff));
  --isb-muted:color-mix(in srgb,var(--isb-fg) 64%,var(--isb-bg));
  --isb-soft:color-mix(in srgb,var(--isb-fg) 7%,transparent);
  --isb-hover:color-mix(in srgb,var(--isb-fg) 6%,transparent);
  --isb-active:color-mix(in srgb,var(--isb-fg) 10%,transparent);
  --isb-line:color-mix(in srgb,var(--isb-fg) 9%,transparent);
  --isb-pop:color-mix(in srgb,var(--isb-fg) 2%,var(--isb-bg));
  --isb-shadow:0 0 0 1px var(--isb-line),0 12px 28px -10px rgba(0,0,0,.18),0 3px 8px -3px rgba(0,0,0,.08);
  --isb-danger:#e5484d;
  position:relative;display:flex;flex-direction:column;flex:1 1 auto;min-height:0;color:var(--isb-fg);font-size:14px;line-height:20px;-webkit-tap-highlight-color:transparent}
/* :where() keeps this reset at the lowest weight, so every class below (padding, colour, background) wins over it. */
:where(.isb) *{box-sizing:border-box}
:where(.isb) button{font:inherit;color:inherit;background:none;border:0;margin:0;padding:0;cursor:pointer;text-align:left}
.isb button:focus-visible{outline:2px solid color-mix(in srgb,var(--isb-fg) 55%,transparent);outline-offset:-2px}
.isb-nav{flex:1;min-height:0;overflow-y:auto;padding:4px 6px 12px;scrollbar-width:none}
.isb-nav::-webkit-scrollbar{display:none}
.isb-sec+.isb-sec{margin-top:16px}
.isb-sec-title{margin:0;padding:8px 10px 4px;font-size:12px;line-height:16px;font-weight:500;color:var(--isb-muted)}
.isb-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:1px}
.isb-row{position:relative;display:flex;align-items:center;height:34px;border-radius:9px;transition:background-color .15s ease}
.isb-row[data-hover="true"],.isb-row[data-menu="true"]{background:var(--isb-hover)}
.isb-row[data-active="true"]{background:var(--isb-active)}
.isb-open{flex:1;min-width:0;height:100%;display:flex;align-items:center;gap:8px;padding:0 4px 0 10px;border-radius:9px}
.isb-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.isb-title{flex:1;min-width:0;white-space:nowrap;overflow:hidden;-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 18px),transparent);mask-image:linear-gradient(to right,#000 calc(100% - 18px),transparent)}
/* Open and unread chats get one weight step, never a new size or a dot. */
.isb-row[data-active="true"] .isb-title,.isb-title[data-unread="true"]{font-weight:500}
.isb-count{display:none;flex:none;align-items:center;gap:3px;height:26px;padding:0 7px;border-radius:7px;font-size:12px;line-height:16px;color:var(--isb-muted);font-variant-numeric:tabular-nums}
.isb-dots{flex:none;display:grid;place-items:center;width:26px;height:26px;margin-right:4px;border-radius:7px;color:var(--isb-muted);opacity:0;transition:opacity .15s ease,background-color .15s ease}
.isb-row[data-hover="true"] .isb-dots,.isb-row[data-menu="true"] .isb-dots,.isb-row:focus-within .isb-dots{opacity:1}
.isb-row[data-menu="true"] .isb-dots{background:var(--isb-active);color:var(--isb-fg)}
@media (hover:hover){.isb-dots:hover{background:var(--isb-active);color:var(--isb-fg)}}
.isb[data-touch="true"] .isb-dots{opacity:1}
.isb[data-touch="true"] .isb-count{display:inline-flex}
.isb[data-touch="true"] .isb-row{height:40px}

/* The hover card */
.isb-card{position:absolute;left:0;top:0;z-index:40;width:280px;border-radius:14px;background:var(--isb-pop);box-shadow:var(--isb-shadow);overflow:hidden;
  opacity:0;pointer-events:none;transform-origin:left center;transition:opacity .18s ease,scale .22s ${EASE}}
.isb-card[data-show="true"]{opacity:1;pointer-events:auto}
.isb-card[data-show="false"]{scale:.97}
.isb-card[data-glide="true"]{transition:opacity .18s ease,scale .22s ${EASE},translate ${GLIDE_MS}ms ${EASE},height ${GLIDE_MS}ms ${EASE}}
.isb-card-in{padding:14px 16px 14px;animation:isb-swap .22s ${EASE} both}
.isb-card-title{margin:0;overflow-wrap:anywhere;font-size:14px;line-height:20px;font-weight:600;letter-spacing:-.01em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-wrap:pretty}
.isb-card-time{margin:2px 0 0;font-size:13px;line-height:16px;color:var(--isb-muted);font-variant-numeric:tabular-nums}
.isb-files{display:flex;align-items:center;gap:4px;margin-top:12px}
.isb-file{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:100%;height:30px;padding:0 10px 0 8px;border-radius:8px;background:var(--isb-soft);font-size:13px;line-height:16px;transition:background-color .15s ease}
.isb-file span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.isb-more{flex:none;height:30px;padding:0 8px;border-radius:8px;font-size:13px;line-height:16px;color:var(--isb-muted);font-variant-numeric:tabular-nums;transition:background-color .15s ease,color .15s ease}
@media (hover:hover){.isb-file:hover{background:var(--isb-active)}.isb-more:hover{background:var(--isb-soft);color:var(--isb-fg)}}
.isb-all{margin-top:12px}
.isb-all-label{margin:0 0 4px;padding:0 2px;font-weight:500;font-size:12px;line-height:16px;color:var(--isb-muted)}
.isb-all-list{list-style:none;margin:0 -6px;padding:0;max-height:204px;overflow-y:auto;scrollbar-width:none}
.isb-all-list::-webkit-scrollbar{display:none}
.isb-all-item{display:flex;align-items:center;gap:8px;width:100%;height:34px;padding:0 8px;border-radius:8px;font-size:13px;line-height:16px;animation:isb-rise .26s ${EASE} both}
.isb-all-item span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.isb-all-item svg,.isb-file svg{flex:none;color:var(--isb-muted)}
@media (hover:hover){.isb-all-item:hover{background:var(--isb-hover)}}

/* The ⋯ menu and its submenus */
.isb-menu{position:absolute;z-index:50;width:236px;padding:6px;border-radius:14px;background:var(--isb-pop);box-shadow:var(--isb-shadow);outline:none;
  transform-origin:top left;animation:isb-pop .18s ${EASE} both}
.isb-menu[data-up="true"]{transform-origin:bottom left}
.isb-sub{width:260px;transform-origin:top left;animation:isb-side .16s ${EASE} both}
.isb-sub[data-left="true"]{transform-origin:top right;animation-name:isb-side-l}
.isb-menu[data-closing="true"]{animation:isb-out .12s ease both;pointer-events:none}
.isb-item{display:flex;align-items:center;gap:8px;width:100%;min-height:32px;padding:6px 10px;border-radius:8px;font-size:14px;line-height:20px}
.isb-item[data-hi="true"]{background:var(--isb-hover)}
.isb-item[data-danger="true"]{color:var(--isb-danger)}
.isb-item-label{flex:1;min-width:0}
.isb-sub .isb-item{padding:7px 10px}
.isb-item-hint{display:block;font-size:12px;line-height:16px;color:var(--isb-muted);margin-top:1px}
.isb-key,.isb-val{flex:none;font-size:12px;line-height:16px;color:var(--isb-muted)}
.isb-key{font-family:inherit;min-width:12px;text-align:right}
.isb-val{max-width:96px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.isb-item svg{flex:none;color:var(--isb-muted)}
.isb-sep{height:1px;margin:5px 10px;background:var(--isb-line)}

/* Phones: a sheet from the bottom */
.isb-scrim{position:absolute;inset:0;z-index:60;background:color-mix(in srgb,#000 22%,transparent);animation:isb-fade .24s ease both}
.isb-scrim[data-closing="true"]{animation:isb-fade-out .22s ease both}
.isb-sheet{position:absolute;left:0;right:0;bottom:0;z-index:61;max-height:82%;display:flex;flex-direction:column;border-radius:18px 18px 0 0;background:var(--isb-pop);box-shadow:var(--isb-shadow);
  padding:6px 8px calc(10px + env(safe-area-inset-bottom));animation:isb-up .32s ${EASE} both;overflow:hidden}
.isb-sheet[data-closing="true"]{animation:isb-down .22s cubic-bezier(.4,0,1,1) both}
.isb-grab{width:36px;height:4px;margin:2px auto 6px;border-radius:99px;background:var(--isb-line)}
.isb-sheet-head{display:flex;align-items:center;gap:4px;min-height:40px;padding:0 10px}
.isb-sheet-head p{margin:0;flex:1;min-width:0;font-size:16px;line-height:24px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.isb-back{display:grid;place-items:center;width:32px;height:32px;margin-left:-6px;border-radius:8px;color:var(--isb-muted)}
.isb-sheet-body{overflow-y:auto;min-height:0;transition:height ${GLIDE_MS}ms ${EASE}}
.isb-page{animation:isb-page-in .28s ${EASE} both}
.isb-page[data-dir="back"]{animation-name:isb-page-back}
.isb-sheet .isb-item{min-height:44px;font-size:16px;line-height:20px}
.isb-sheet .isb-all-item{height:44px;font-size:16px;line-height:20px}

@keyframes isb-swap{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
@keyframes isb-rise{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes isb-pop{from{opacity:0;transform:scale(.97) translateY(-4px)}to{opacity:1;transform:none}}
@keyframes isb-side{from{opacity:0;transform:translateX(-4px)}to{opacity:1;transform:none}}
@keyframes isb-side-l{from{opacity:0;transform:translateX(4px)}to{opacity:1;transform:none}}
@keyframes isb-out{to{opacity:0;transform:scale(.98)}}
@keyframes isb-fade{from{opacity:0}to{opacity:1}}
@keyframes isb-fade-out{to{opacity:0}}
@keyframes isb-up{from{transform:translateY(100%)}to{transform:none}}
@keyframes isb-down{to{transform:translateY(100%)}}
@keyframes isb-page-in{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
@keyframes isb-page-back{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){
  .isb-card,.isb-card[data-glide="true"]{transition:opacity .12s ease}
  .isb-card[data-show="false"]{scale:1}
  .isb-card-in,.isb-all-item,.isb-page,.isb-menu,.isb-sub{animation:isb-fade .12s ease both}
  .isb-sheet{animation:isb-fade .16s ease both}
  .isb-sheet[data-closing="true"],.isb-menu[data-closing="true"]{animation:isb-fade-out .12s ease both}
  .isb-sheet-body{transition:none}
}
`;

/* ─── The sidebar ──────────────────────────────────────────────────────────────────────────── */

type Card = { chatId: string; top: number; left: number; show: boolean; glide: boolean };
/** `real`: opened by a real person (not a script), so it may take focus. */
/** `at`: opened by a right click, at the pointer (screen y), instead of under ⋯. */
type Menu = { chatId: string; left: number; top: number; up: boolean; closing: boolean; keyboard: boolean; real: boolean; at?: number };
type Sub = { kind: SubKind; index: number; left: number; top: number; onLeft: boolean };
type Hi = { level: 0 | 1; index: number } | null;
type Sheet = { chatId: string; kind: "files" | "menu"; page: "root" | SubKind; dir: "in" | "back"; closing: boolean; real: boolean };

export function IntentSidebar({
  sections,
  activeId,
  onOpen,
  onAction,
  projects = [],
  className,
  style,
  "aria-label": ariaLabel = "Chats",
}: IntentSidebarProps) {
  const root = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const all = sections.flatMap((s) => s.chats);
  const find = useCallback((id: string | undefined) => all.find((c) => c.id === id), [all]);

  // Phones and tablets have no hover: they get taps and a bottom sheet instead of cards and side menus.
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setTouch(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* ── Hover card ── */
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [cardH, setCardH] = useState<number | null>(null);
  const cardEl = useRef<HTMLDivElement>(null);
  const cardIn = useRef<HTMLDivElement>(null);
  const openT = useRef<number | undefined>(undefined);
  const closeT = useRef<number | undefined>(undefined);
  const warmUntil = useRef(0);
  const shown = useRef(false);
  const rowEls = useRef(new Map<string, HTMLLIElement>());
  const openEls = useRef(new Map<string, HTMLButtonElement>());
  const dotEls = useRef(new Map<string, HTMLButtonElement>());
  // After a click opens a chat, the card stays away until the pointer moves to another chat.
  const quietId = useRef<string | null>(null);

  /** The sidebar's box on screen, and how much it is scaled (1 unless a parent uses a CSS transform),
   *  so screen distances turn into the sidebar's own pixels. */
  const frame = () => {
    const el = root.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { r, s: el.offsetWidth ? r.width / el.offsetWidth || 1 : 1, w: el.offsetWidth, h: el.clientHeight };
  };

  /** Where the card sits for a chat: just right of the sidebar, its title level with the chat's name.
   *  When the screen has no room on the right, it slides left to stay in view. */
  const cardSpot = (id: string) => {
    const row = rowEls.current.get(id);
    const f = frame();
    if (!row || !f) return { top: 0, left: 0 };
    const left = Math.max(8, Math.min(f.w + 8, (window.innerWidth - 8 - f.r.left) / f.s - 280));
    return { top: (row.getBoundingClientRect().top - f.r.top) / f.s - 7, left };
  };

  const cardShownFor = useRef<string | null>(null);
  // The pointer's last spot on a chat, so the card's triangle has a corner as soon as the card opens.
  const lastOnRow = useRef<{ id: string; p: Pt } | null>(null);
  const cardAnchor = useRef<Pt | null>(null);
  const showCard = useCallback((id: string) => {
    cardShownFor.current = id;
    cardAnchor.current = lastOnRow.current?.id === id ? lastOnRow.current.p : null;
    clearTimeout(openT.current);
    clearTimeout(closeT.current);
    const { top, left } = cardSpot(id);
    setAllOpen(false);
    if (shown.current) {
      // Already showing: glide to the new chat.
      setCard({ chatId: id, top, left, show: true, glide: true });
      return;
    }
    // Not showing: put it in place while hidden, then fade it in there (no glide from an old spot).
    shown.current = true;
    setCard({ chatId: id, top, left, show: false, glide: false });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setCard((c) => (c && c.chatId === id && shown.current ? { ...c, show: true } : c))),
    );
  }, []);

  const hideCard = useCallback((now = false) => {
    clearTimeout(openT.current);
    clearTimeout(closeT.current);
    const go = () => {
      setCard((c) => (c ? { ...c, show: false, glide: false } : c));
      // Once it has faded, take it out, so a hidden card never makes the page scroll sideways.
      window.setTimeout(() => !shown.current && setCard((c) => (c && !c.show ? null : c)), 220);
      if (shown.current) warmUntil.current = performance.now() + SKIP_WINDOW;
      shown.current = false;
      cardShownFor.current = null;
      setAllOpen(false);
    };
    if (now) go();
    else closeT.current = window.setTimeout(go, CLOSE_DELAY);
  }, []);

  const menuOpen = useRef(false);

  /* The card's own safe triangle. Heading from a chat to its card (say, to +N at the card's bottom)
     can cross other chats. While the pointer moves inside the triangle from where it left its chat
     to the card's near corners, those chats are ignored; resting on one for REST_MS switches to it. */
  const cardPending = useRef<string | null>(null);
  const cardRestT = useRef<number | undefined>(undefined);
  const aimingCard = (p: Pt) => {
    const a = cardAnchor.current;
    const el = cardEl.current;
    if (!a || !el || !shown.current) return false;
    const r = el.getBoundingClientRect();
    return p.x < r.left && inTriangle(p, { x: a.x - 4, y: a.y }, { x: r.left, y: r.top - 8 }, { x: r.left, y: r.bottom + 8 });
  };
  const dropPending = () => {
    clearTimeout(cardRestT.current);
    cardPending.current = null;
  };

  const enterRow = (id: string, p?: Pt) => {
    if (touch || menuOpen.current) return;
    if (quietId.current && quietId.current !== id) quietId.current = null;
    if (quietId.current === id) return;
    clearTimeout(closeT.current);
    clearTimeout(openT.current);
    dropPending();
    if (p && cardShownFor.current && cardShownFor.current !== id && aimingCard(p)) {
      // On the way to the open card: wait, and switch only if the pointer rests here.
      cardPending.current = id;
      cardRestT.current = window.setTimeout(() => {
        cardPending.current = null;
        showCard(id);
      }, REST_MS);
      return;
    }
    // Skip the wait when a card is up (or just went away): moving down the list feels instant.
    if (shown.current || performance.now() < warmUntil.current) showCard(id);
    else openT.current = window.setTimeout(() => showCard(id), OPEN_DELAY);
  };

  const moveRow = (id: string, p: Pt) => {
    if (touch || menuOpen.current) return;
    if (cardPending.current !== id) lastOnRow.current = { id, p };
    if (cardShownFor.current === id) cardAnchor.current = p;
    else if (cardPending.current === id) {
      // Still aiming at the card: the rest starts again. Turned away from it: switch now.
      if (aimingCard(p)) {
        clearTimeout(cardRestT.current);
        cardRestT.current = window.setTimeout(() => {
          cardPending.current = null;
          showCard(id);
        }, REST_MS);
      } else {
        dropPending();
        showCard(id);
      }
    }
  };

  const leaveRow = (id: string) => {
    clearTimeout(openT.current);
    if (cardPending.current === id) dropPending();
    if (shown.current) hideCard();
  };

  // The card's height follows its content (one file, or the whole list).
  useLayoutEffect(() => {
    const el = cardIn.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight));
    ro.observe(el);
    setCardH(el.offsetHeight);
    return () => ro.disconnect();
  }, [card?.chatId]);

  // Keep the card inside the sidebar's height (a chat near the bottom pushes the card up).
  const box = root.current;
  const cardTop = card && cardH != null && box ? Math.max(8, Math.min(card.top, box.clientHeight - cardH - 8)) : (card?.top ?? 0);

  /* ── ⋯ menu ── */
  const [menu, setMenu] = useState<Menu | null>(null);
  const [sub, setSub] = useState<Sub | null>(null);
  const [hi, setHi] = useState<Hi>(null);
  const menuEl = useRef<HTMLDivElement>(null);
  const subEl = useRef<HTMLDivElement>(null);
  const itemEls = useRef<(HTMLButtonElement | null)[]>([]);
  const subItemEls = useRef<(HTMLButtonElement | null)[]>([]);
  const anchor = useRef<Pt | null>(null);
  const last = useRef<Pt | null>(null);
  const pending = useRef<number | null>(null);
  const restT = useRef<number | undefined>(undefined);
  const subT = useRef<number | undefined>(undefined);
  const closingT = useRef<number | undefined>(undefined);
  menuOpen.current = !!menu && !menu.closing;
  const menuRef = useRef(menu);
  menuRef.current = menu;
  // Pressing ⋯ while its menu is open closes it; this stops the click that follows from opening it again.
  const dotsClosed = useRef(false);

  const menuChat = find(menu?.chatId);
  const entries = menuChat ? entriesFor(menuChat) : [];
  const subEntries = sub ? subFor(sub.kind, projects) : [];

  const closeMenu = useCallback((refocus: boolean) => {
    clearTimeout(restT.current);
    clearTimeout(subT.current);
    pending.current = null;
    anchor.current = null;
    setSub(null);
    setHi(null);
    const m = menuRef.current;
    if (!m || m.closing) return;
    if (refocus) dotEls.current.get(m.chatId)?.focus({ preventScroll: true });
    setMenu({ ...m, closing: true });
    clearTimeout(closingT.current);
    closingT.current = window.setTimeout(() => setMenu((m) => (m?.closing ? null : m)), 130);
  }, []);

  const openMenu = (chat: IntentChat, keyboard: boolean, real: boolean, at?: { x: number; y: number }) => {
    const dots = dotEls.current.get(chat.id);
    const row = rowEls.current.get(chat.id);
    const f = frame();
    if (!dots || !row || !f) return;
    hideCard(true);
    clearTimeout(closingT.current);
    const d = dots.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    setSub(null);
    setHi(keyboard ? { level: 0, index: 0 } : null);
    // Under the ⋯ button (or at the pointer after a right click), pulled left when the screen is too narrow for the whole menu.
    const x = at ? (at.x - f.r.left) / f.s : (d.left - f.r.left) / f.s - 14;
    const left = Math.max(8 - f.r.left / f.s, Math.min(x, (window.innerWidth - 8 - f.r.left) / f.s - 236));
    const top = at ? (at.y - f.r.top) / f.s + 2 : (r.bottom - f.r.top) / f.s + 4;
    setMenu({ chatId: chat.id, left, top, up: false, closing: false, keyboard, real, at: at?.y });
  };

  // Place the menu: under the chat, or over it when there is no room below. Then focus it.
  useLayoutEffect(() => {
    const el = menuEl.current;
    const f = frame();
    if (!menu || menu.closing || !el || !f) return;
    const row = rowEls.current.get(menu.chatId);
    // No room under the chat on screen: open above it, when there is room there.
    if (!menu.up && row) {
      const r = row.getBoundingClientRect();
      const h = el.offsetHeight * f.s;
      // A right-click menu grows up from the pointer instead.
      const below = menu.at ?? r.bottom;
      const above = menu.at ?? r.top;
      if (below + 4 + h > window.innerHeight - 8 && above - 4 - h > 8) {
        setMenu({ ...menu, top: (above - f.r.top) / f.s - el.offsetHeight - (menu.at === undefined ? 4 : 2), up: true });
        return;
      }
    }
    if (menu.keyboard) itemEls.current[0]?.focus({ preventScroll: true });
    else if (menu.real) el.focus({ preventScroll: true }); // so its letters work; a script never takes focus
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu?.chatId, menu?.up, menu?.closing]);

  const openSub = (index: number, focusFirst = false) => {
    const e = entries[index];
    const t = itemEls.current[index];
    const m = menuEl.current;
    const f = frame();
    if (!e || e.kind !== "item" || !e.sub || !t || !m || !f) return;
    clearTimeout(subT.current);
    const tr = t.getBoundingClientRect();
    const mr = m.getBoundingClientRect();
    const subW = 260 * f.s;
    const onLeft = mr.right + 4 + subW > window.innerWidth - 8 && mr.left - 4 - subW > 8;
    // The safe triangle starts where the pointer is now (if it is on this row).
    anchor.current = last.current;
    setSub({
      kind: e.sub,
      index,
      top: (tr.top - f.r.top) / f.s - 6,
      left: onLeft ? (mr.left - f.r.left) / f.s - 264 : (mr.right - f.r.left) / f.s + 4,
      onLeft,
    });
    if (focusFirst) setHi({ level: 1, index: 0 });
  };

  // Keep the submenu on screen at the bottom.
  useLayoutEffect(() => {
    const el = subEl.current;
    if (!sub || !el) return;
    const over = el.getBoundingClientRect().bottom - (window.innerHeight - 8);
    if (over > 0) setSub({ ...sub, top: sub.top - over / (frame()?.s ?? 1) });
    if (hi?.level === 1) subItemEls.current[hi.index]?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub?.kind, sub?.index]);

  /** Is the pointer heading for the open submenu? The safe triangle runs from where it left the
   *  submenu's row to the submenu's near corners. */
  const aiming = (p: Pt) => {
    const a = anchor.current;
    const el = subEl.current;
    if (!a || !el || !sub) return false;
    const r = el.getBoundingClientRect();
    const x = sub.onLeft ? r.right : r.left;
    const back = sub.onLeft ? 4 : -4;
    return inTriangle(p, { x: a.x + back, y: a.y }, { x, y: r.top - 8 }, { x, y: r.bottom + 8 });
  };

  const lightRow = (i: number) => {
    clearTimeout(restT.current);
    pending.current = null;
    setHi({ level: 0, index: i });
    const e = entries[i];
    clearTimeout(subT.current);
    if (e?.kind === "item" && e.sub) {
      if (sub?.index !== i) subT.current = window.setTimeout(() => openSub(i), sub ? 0 : SUB_OPEN_DELAY);
    } else if (sub) {
      setSub(null);
      anchor.current = null;
    }
  };

  const onItemMove = (i: number, e: ReactPointerEvent) => {
    if (e.pointerType === "touch") return;
    const p = { x: e.clientX, y: e.clientY };
    const moved = !last.current || Math.hypot(p.x - last.current.x, p.y - last.current.y) > 1;
    last.current = p;
    if (sub && i === sub.index) {
      // On the submenu's own row: remember where the pointer is, the corner of the safe triangle.
      anchor.current = p;
      clearTimeout(restT.current);
      pending.current = null;
      if (hi?.level !== 0 || hi.index !== i) setHi({ level: 0, index: i });
      return;
    }
    if (sub && aiming(p)) {
      // Crossing another row on the way to the submenu: ignore it, unless the pointer rests here.
      if (pending.current !== i || moved) {
        pending.current = i;
        clearTimeout(restT.current);
        restT.current = window.setTimeout(() => lightRow(i), REST_MS);
      }
      return;
    }
    if (hi?.level !== 0 || hi.index !== i || pending.current != null) lightRow(i);
  };

  const pick = (level: 0 | 1, index: number, keyboard: boolean) => {
    if (!menuChat) return;
    if (level === 0) {
      const e = entries[index];
      if (e?.kind !== "item") return;
      if (e.sub) {
        if (sub?.index === index) {
          if (keyboard) setHi({ level: 1, index: 0 });
        } else openSub(index, keyboard);
        if (keyboard && sub?.index === index) subItemEls.current[0]?.focus({ preventScroll: true });
        return;
      }
      onAction?.(menuChat.id, e.id);
      closeMenu(keyboard);
      return;
    }
    if (!sub) return;
    const s = subEntries[index];
    if (!s) return;
    onAction?.(menuChat.id, sub.kind === "notify" ? "notify" : "move", s.value);
    closeMenu(keyboard);
  };

  const stepTo = (level: 0 | 1, index: number) => {
    setHi({ level, index });
    (level === 0 ? itemEls.current[index] : subItemEls.current[index])?.focus({ preventScroll: true });
  };

  const onMenuKey = (e: ReactKeyboardEvent) => {
    if (!menu || !menuChat) return;
    const level = hi?.level ?? 0;
    const list = level === 0 ? entries.map((x) => x.kind === "item") : subEntries.map(() => true);
    const cur = hi?.index ?? -1;
    const move = (dir: 1 | -1, from = cur) => {
      for (let k = 1; k <= list.length; k++) {
        const j = (from + dir * k + list.length * 2) % list.length;
        if (list[j]) return j;
      }
      return from;
    };
    const key = e.key;
    if (key === "ArrowDown" || key === "ArrowUp") {
      e.preventDefault();
      if (level === 0 && sub) setSub(null);
      stepTo(level, move(key === "ArrowDown" ? 1 : -1));
    } else if (key === "Home" || key === "End") {
      e.preventDefault();
      stepTo(level, key === "Home" ? move(1, -1) : move(-1, list.length));
    } else if (key === "ArrowRight" && level === 0) {
      const en = entries[cur];
      if (en?.kind === "item" && en.sub) {
        e.preventDefault();
        if (sub?.index === cur) stepTo(1, 0);
        else openSub(cur, true);
      }
    } else if ((key === "ArrowLeft" || key === "Escape") && level === 1 && sub) {
      e.preventDefault();
      const i = sub.index;
      setSub(null);
      stepTo(0, i);
    } else if (key === "Escape") {
      e.preventDefault();
      closeMenu(true);
    } else if (key === "Tab") {
      closeMenu(false);
    } else if (key === "Enter" || key === " ") {
      e.preventDefault();
      if (cur >= 0) pick(level, cur, true);
    } else if (level === 0 && key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const i = entries.findIndex((x) => x.kind === "item" && x.key === key.toUpperCase());
      if (i >= 0) {
        e.preventDefault();
        pick(0, i, true);
      }
    }
  };

  // A press outside the menu, or scrolling the list, closes it. Scrolling also hides the card.
  useEffect(() => {
    if (!menu || menu.closing) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuEl.current?.contains(t) || subEl.current?.contains(t) || dotEls.current.get(menu.chatId)?.contains(t)) return;
      closeMenu(false);
    };
    const blur = () => closeMenu(false);
    document.addEventListener("pointerdown", down, true);
    window.addEventListener("blur", blur);
    window.addEventListener("resize", blur);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      window.removeEventListener("blur", blur);
      window.removeEventListener("resize", blur);
    };
  }, [menu, closeMenu]);

  const onNavScroll = () => {
    if (shown.current) hideCard(true);
    if (menuOpen.current) closeMenu(false);
  };

  /* ── Phones: the bottom sheet ── */
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const sheetEl = useRef<HTMLDivElement>(null);
  const sheetBody = useRef<HTMLDivElement>(null);
  const sheetPage = useRef<HTMLDivElement>(null);
  const [sheetH, setSheetH] = useState<number | null>(null);
  const sheetChat = find(sheet?.chatId);
  const sheetFrom = useRef<HTMLElement | null>(null);
  const sheetReal = useRef(false);

  const openSheet = (chatId: string, kind: Sheet["kind"], from: HTMLElement, real: boolean) => {
    sheetFrom.current = from;
    sheetReal.current = real;
    setSheetH(null);
    setSheet({ chatId, kind, page: "root", dir: "in", closing: false, real });
  };
  const closeSheet = useCallback(() => {
    setSheet((s) => (s && !s.closing ? { ...s, closing: true } : s));
    window.setTimeout(() => setSheet((s) => (s?.closing ? null : s)), 230);
    if (sheetReal.current) sheetFrom.current?.focus({ preventScroll: true });
  }, []);

  useLayoutEffect(() => {
    const el = sheetPage.current;
    if (!sheet || !el) return;
    const ro = new ResizeObserver(() => setSheetH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [sheet?.page, sheet?.kind, !!sheet]);

  useEffect(() => {
    if (!sheet || sheet.closing) return;
    if (sheet.real) sheetEl.current?.querySelector<HTMLElement>(".isb-page button")?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [sheet?.page, sheet?.kind, sheet?.closing, closeSheet]);

  // If the chat a card, menu or sheet belongs to goes away (deleted, archived), close it.
  useEffect(() => {
    if (card && !find(card.chatId)) setCard(null);
    if (menu && !find(menu.chatId)) setMenu(null);
    if (sheet && !find(sheet.chatId)) setSheet(null);
  });

  // A resized window moves the chats, so a card left open would point at the wrong one.
  useEffect(() => {
    const away = () => shown.current && hideCard(true);
    window.addEventListener("resize", away);
    return () => window.removeEventListener("resize", away);
  }, [hideCard]);

  useEffect(
    () => () => {
      [openT, closeT, restT, subT, closingT, cardRestT].forEach((t) => clearTimeout(t.current));
    },
    [],
  );

  const open = (chatId: string, fileId?: string) => {
    quietId.current = chatId;
    hideCard(true);
    onOpen?.(chatId, fileId);
  };

  const cardChat = find(card?.chatId);

  /* ── Render ── */
  return (
    <div ref={root} className={["isb", className].filter(Boolean).join(" ")} style={style} data-touch={touch}>
      <style>{CSS}</style>

      <nav ref={nav} className="isb-nav" aria-label={ariaLabel} onScroll={onNavScroll}>
        {sections.map((sec) =>
          sec.chats.length ? (
            <div key={sec.title} className="isb-sec">
              <p className="isb-sec-title">{sec.title}</p>
              <ul className="isb-list">
                {sec.chats.map((chat) => {
                  const files = chat.files ?? [];
                  return (
                    <li
                      key={chat.id}
                      ref={(el) => {
                        if (el) rowEls.current.set(chat.id, el);
                        else rowEls.current.delete(chat.id);
                      }}
                      className="isb-row"
                      data-active={chat.id === activeId}
                      data-hover={!touch && (card?.show ? card.chatId === chat.id : hoverId === chat.id)}
                      data-menu={menu?.chatId === chat.id && !menu.closing}
                      onContextMenu={(e) => {
                        // A right click opens the same menu as ⋯, at the pointer (a long press on phones opens the sheet).
                        e.preventDefault();
                        const dots = dotEls.current.get(chat.id);
                        if (touch) return dots && openSheet(chat.id, "menu", dots, e.nativeEvent.isTrusted);
                        // The keyboard's menu key has no pointer spot: open under ⋯ like a keyboard press.
                        const fromKeys = e.clientX === 0 && e.clientY === 0;
                        openMenu(chat, fromKeys, e.nativeEvent.isTrusted, fromKeys ? undefined : { x: e.clientX, y: e.clientY });
                      }}
                      onPointerEnter={(e) => {
                        if (e.pointerType === "touch") return;
                        setHoverId(chat.id);
                        enterRow(chat.id, { x: e.clientX, y: e.clientY });
                      }}
                      onPointerMove={(e) => {
                        if (e.pointerType !== "touch") moveRow(chat.id, { x: e.clientX, y: e.clientY });
                      }}
                      onPointerLeave={(e) => {
                        if (e.pointerType === "touch") return;
                        setHoverId((h) => (h === chat.id ? null : h));
                        leaveRow(chat.id);
                      }}
                    >
                      <button
                        ref={(el) => {
                          if (el) openEls.current.set(chat.id, el);
                          else openEls.current.delete(chat.id);
                        }}
                        type="button"
                        className="isb-open"
                        aria-current={chat.id === activeId ? "page" : undefined}
                        onClick={() => open(chat.id)}
                        onFocus={(e) => {
                          if (!touch && e.currentTarget.matches(":focus-visible")) enterRow(chat.id);
                        }}
                        onBlur={(e) => {
                          if (!cardEl.current?.contains(e.relatedTarget as Node)) leaveRow(chat.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowRight" && shown.current && card?.chatId === chat.id) {
                            e.preventDefault();
                            cardEl.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
                          }
                        }}
                      >
                        <span className="isb-title" data-unread={chat.unread || undefined}>
                          {chat.unread && <span className="isb-sr">Unread: </span>}
                          {chat.title}
                        </span>
                      </button>
                      {files.length > 0 && (
                        <button
                          type="button"
                          className="isb-count"
                          aria-label={`${files.length} ${files.length === 1 ? "file" : "files"} in ${chat.title}`}
                          tabIndex={touch ? 0 : -1}
                          onClick={(e) => openSheet(chat.id, "files", e.currentTarget, e.nativeEvent.isTrusted)}
                        >
                          <Icon d={FILE} size={14} />
                          {files.length}
                        </button>
                      )}
                      <button
                        ref={(el) => {
                          if (el) dotEls.current.set(chat.id, el);
                          else dotEls.current.delete(chat.id);
                        }}
                        type="button"
                        className="isb-dots"
                        aria-label={`More for ${chat.title}`}
                        aria-haspopup="menu"
                        aria-expanded={menu?.chatId === chat.id && !menu.closing}
                        onPointerDown={(e) => {
                          // Pressing ⋯ again closes the menu (the outside-press check ignores this button).
                          if (e.button === 0 && menu?.chatId === chat.id && !menu.closing) {
                            e.preventDefault();
                            dotsClosed.current = true;
                            closeMenu(false);
                          }
                        }}
                        onClick={(e) => {
                          if (touch) return openSheet(chat.id, "menu", e.currentTarget, e.nativeEvent.isTrusted);
                          if (dotsClosed.current) {
                            dotsClosed.current = false;
                            return;
                          }
                          if (menu?.chatId === chat.id && !menu.closing) return;
                          openMenu(chat, e.detail === 0, e.nativeEvent.isTrusted);
                        }}
                      >
                        <Icon d={DOTS} size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null,
        )}
      </nav>

      {/* The hover card: one card that glides from chat to chat. */}
      {!touch && card && cardChat && (
        <div
          ref={cardEl}
          className="isb-card"
          data-show={card.show}
          data-glide={card.glide}
          role="group"
          aria-label={`Preview of ${cardChat.title}`}
          style={{ translate: `${card.left}px ${cardTop}px`, height: cardH ?? undefined }}
          onPointerEnter={() => {
            clearTimeout(closeT.current);
            dropPending();
          }}
          onPointerLeave={() => hideCard()}
          onBlur={(e) => {
            if (!cardEl.current?.contains(e.relatedTarget as Node) && !rowEls.current.get(card.chatId)?.contains(e.relatedTarget as Node)) hideCard();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "ArrowLeft") {
              e.preventDefault();
              openEls.current.get(card.chatId)?.focus({ preventScroll: true });
              if (e.key === "Escape") hideCard(true);
            }
          }}
        >
          <div ref={cardIn} key={cardChat.id} className="isb-card-in">
            <p className="isb-card-title">{cardChat.title}</p>
            <p className="isb-card-time">{cardChat.time}</p>
            {(cardChat.files?.length ?? 0) > 0 &&
              (allOpen ? (
                <div className="isb-all">
                  <p className="isb-all-label">
                    {cardChat.files!.length} files in this chat
                  </p>
                  <ul className="isb-all-list">
                    {cardChat.files!.map((f, i) => (
                      <li key={f.id}>
                        <button type="button" className="isb-all-item" style={{ animationDelay: `${i * 28}ms` }} onClick={() => open(cardChat.id, f.id)}>
                          <Icon d={FILE} size={15} />
                          <span>{f.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="isb-files">
                  <button type="button" className="isb-file" onClick={() => open(cardChat.id, cardChat.files![0].id)}>
                    <Icon d={FILE} size={15} />
                    <span>{cardChat.files![0].name}</span>
                  </button>
                  {cardChat.files!.length > 1 && (
                    <button
                      type="button"
                      className="isb-more"
                      aria-label={`Show all ${cardChat.files!.length} files`}
                      onPointerEnter={(e) => e.pointerType !== "touch" && setAllOpen(true)}
                      onClick={(e) => {
                        setAllOpen(true);
                        // From the keyboard, move into the list; a mouse click leaves focus where it is.
                        if (e.detail === 0 && e.nativeEvent.isTrusted)
                          requestAnimationFrame(() => cardEl.current?.querySelector<HTMLElement>(".isb-all-item")?.focus({ preventScroll: true }));
                      }}
                    >
                      +{cardChat.files!.length - 1}
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* The ⋯ menu */}
      {menu && menuChat && (
        <div
          ref={menuEl}
          role="menu"
          tabIndex={-1}
          aria-label={`Actions for ${menuChat.title}`}
          className="isb-menu"
          data-up={menu.up}
          data-closing={menu.closing}
          style={{ left: menu.left, top: menu.top }}
          onKeyDown={onMenuKey}
          onPointerLeave={() => {
            // Leaving the menu (not into the submenu) drops a waiting row, so nothing switches late.
            clearTimeout(restT.current);
            pending.current = null;
          }}
        >
          {entries.map((en, i) =>
            en.kind === "sep" ? (
              <div key={en.id} className="isb-sep" role="separator" />
            ) : (
              <button
                key={en.id}
                ref={(el) => {
                  itemEls.current[i] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="isb-item"
                data-hi={(hi?.level === 0 && hi.index === i) || sub?.index === i}
                data-danger={en.danger}
                aria-haspopup={en.sub ? "menu" : undefined}
                aria-expanded={en.sub ? sub?.index === i : undefined}
                aria-keyshortcuts={en.key}
                onPointerMove={(e) => onItemMove(i, e)}
                onClick={(e) => pick(0, i, e.detail === 0)}
              >
                <span className="isb-item-label">{en.label}</span>
                {en.sub ? (
                  <>
                    <span className="isb-val">{en.value}</span>
                    <Icon d={CHEVRON} size={14} />
                  </>
                ) : (
                  en.key && <kbd className="isb-key">{en.key}</kbd>
                )}
              </button>
            ),
          )}
        </div>
      )}
      {menu && !menu.closing && menuChat && sub && (
        <div
          ref={subEl}
          role="menu"
          aria-label={entries[sub.index]?.kind === "item" ? (entries[sub.index] as { label: string }).label : undefined}
          className="isb-menu isb-sub"
          data-left={sub.onLeft}
          style={{ left: sub.left, top: sub.top }}
          onKeyDown={onMenuKey}
          onPointerEnter={() => {
            clearTimeout(restT.current);
            pending.current = null;
            if (hi?.level !== 1) setHi({ level: 0, index: sub.index });
          }}
        >
          {subEntries.map((s, i) => (
            <button
              key={s.value || "none"}
              ref={(el) => {
                subItemEls.current[i] = el;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={subValue(sub.kind, menuChat) === s.value}
              tabIndex={-1}
              className="isb-item"
              data-hi={hi?.level === 1 && hi.index === i}
              onPointerMove={(e) => {
                if (e.pointerType === "touch") return;
                clearTimeout(restT.current);
                pending.current = null;
                if (hi?.level !== 1 || hi.index !== i) setHi({ level: 1, index: i });
              }}
              onClick={(e) => pick(1, i, e.detail === 0)}
            >
              <span className="isb-item-label">
                {s.label}
                {s.hint && <span className="isb-item-hint">{s.hint}</span>}
              </span>
              {subValue(sub.kind, menuChat) === s.value && <Icon d={CHECK} size={15} />}
            </button>
          ))}
        </div>
      )}

      {/* Phones: the bottom sheet */}
      {sheet && sheetChat && (
        <>
          <div className="isb-scrim" data-closing={sheet.closing} onClick={closeSheet} aria-hidden="true" />
          <div
            ref={sheetEl}
            className="isb-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={sheet.kind === "files" ? `Files in ${sheetChat.title}` : `Actions for ${sheetChat.title}`}
            data-closing={sheet.closing}
          >
            <div className="isb-grab" aria-hidden="true" />
            <div className="isb-sheet-head">
              {sheet.page !== "root" && (
                <button type="button" className="isb-back" aria-label="Back" onClick={() => setSheet({ ...sheet, page: "root", dir: "back" })}>
                  <Icon d={BACK} size={18} />
                </button>
              )}
              <p>
                {sheet.page === "notify" ? "Notifications" : sheet.page === "move" ? "Move to project" : sheetChat.title}
              </p>
            </div>
            <div ref={sheetBody} className="isb-sheet-body" style={{ height: sheetH ?? undefined }}>
              <div ref={sheetPage} key={sheet.kind + sheet.page} className="isb-page" data-dir={sheet.dir}>
                {sheet.kind === "files" ? (
                  (sheetChat.files ?? []).map((f, i) => (
                    <button
                      key={f.id}
                      type="button"
                      className="isb-all-item"
                      style={{ animationDelay: `${i * 28}ms` }}
                      onClick={() => {
                        closeSheet();
                        onOpen?.(sheetChat.id, f.id);
                      }}
                    >
                      <Icon d={FILE} size={16} />
                      <span>{f.name}</span>
                    </button>
                  ))
                ) : sheet.page === "root" ? (
                  entriesFor(sheetChat).map((en) =>
                    en.kind === "sep" ? (
                      <div key={en.id} className="isb-sep" />
                    ) : (
                      <button
                        key={en.id}
                        type="button"
                        className="isb-item"
                        data-danger={en.danger}
                        onClick={() => {
                          if (en.sub) return setSheet({ ...sheet, page: en.sub, dir: "in" });
                          closeSheet();
                          onAction?.(sheetChat.id, en.id);
                        }}
                      >
                        <span className="isb-item-label">{en.label}</span>
                        {en.sub && (
                          <>
                            <span className="isb-val">{en.value}</span>
                            <Icon d={CHEVRON} size={16} />
                          </>
                        )}
                      </button>
                    ),
                  )
                ) : (
                  subFor(sheet.page, projects).map((s) => (
                    <button
                      key={s.value || "none"}
                      type="button"
                      className="isb-item"
                      aria-pressed={subValue(sheet.page as SubKind, sheetChat) === s.value}
                      onClick={() => {
                        closeSheet();
                        onAction?.(sheetChat.id, sheet.page === "notify" ? "notify" : "move", s.value);
                      }}
                    >
                      <span className="isb-item-label">
                        {s.label}
                        {s.hint && <span className="isb-item-hint">{s.hint}</span>}
                      </span>
                      {subValue(sheet.page as SubKind, sheetChat) === s.value && <Icon d={CHECK} size={16} />}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default IntentSidebar;
