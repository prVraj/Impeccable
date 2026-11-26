"use client";

import { useState } from "react";
import { IntentSidebar, type IntentAction, type IntentChat, type IntentNotify, type IntentSection } from "./intent-sidebar";

/** A file in the demo, with one line shown when it opens. */
type DemoFile = { id: string; name: string; note: string };
export type DemoChat = Omit<IntentChat, "files"> & { files?: DemoFile[] };

/** Every chat is real Impeccable UI work, so the demo is about the library itself. */
export const DEMO_CHATS: DemoChat[] = [
  {
    id: "roadmap",
    title: "Impeccable UI roadmap",
    time: "2h ago",
    pinned: true,
    project: "Impeccable UI",
    files: [
      { id: "roadmap", name: "Roadmap", note: "What ships next, one item at a time, each one tested in light, dark and on phones." },
      { id: "launch", name: "Launch checklist", note: "Share image, previews, prompts and a last edge case check before anything goes live." },
      { id: "ideas", name: "Item ideas", note: "Small details people feel before they notice them." },
    ],
  },
  {
    id: "logic",
    title: "Logic checkpoint idea",
    time: "3h ago",
    pinned: true,
    notify: "mentions",
    project: "Docs site",
    files: [
      { id: "plan", name: "Logic checkpoint plan", note: "Every rule an item follows, written out under its install command." },
      { id: "sidebar", name: "Intent sidebar", note: "A sidebar that reads what you mean to do, not only where you point." },
      { id: "timing", name: "Hover card timing", note: "Wait 400 ms the first time, then follow the pointer from chat to chat at once." },
      { id: "triangle", name: "Safe triangle notes", note: "Crossing a row on the way to a submenu never closes it. Resting there for 500 ms does." },
      { id: "sheet", name: "Phone sheet", note: "No hover on phones: taps and a sheet from the bottom instead." },
    ],
  },
  {
    id: "kitcut",
    title: "Kitcut button crack sound",
    time: "Yesterday",
    unread: true,
    project: "Impeccable UI",
    files: [
      { id: "kitcut", name: "Kitcut button", note: "The button cracks on a zigzag, parts while it loads, then snaps back with a WooHoo." },
      { id: "crack", name: "Crack sound", note: "Made live in the browser, so there is no sound file to load." },
    ],
  },
  {
    id: "orbit",
    title: "Liquid Orbit loader",
    time: "Yesterday",
    files: [{ id: "orbit", name: "Liquid Orbit loader", note: "A liquid drop floats in a ring that pulls apart and pours back together." }],
  },
  {
    id: "type",
    title: "Typography pass with font master",
    time: "Nov 25",
    project: "Docs site",
    files: [
      { id: "scale", name: "Type scale", note: "One token per text style, so every page reads the same." },
      { id: "guide", name: "Typography guide", note: "Which token to pick for a heading, a label or a line of copy." },
      { id: "copy", name: "Docs copy", note: "Plain words on every page, written for humans." },
    ],
  },
  {
    id: "chain",
    title: "Chain Testimonials links",
    time: "Nov 25",
    files: [
      { id: "chain", name: "Chain Testimonials", note: "Picture cards joined by curved links, the middle one open." },
      { id: "cards", name: "Picture cards", note: "Small WebP pictures, so the page stays fast." },
    ],
  },
  { id: "share", title: "One share image for every page", time: "Nov 24", notify: "none" },
  {
    id: "settle",
    title: "Settle counter commas",
    time: "Nov 23",
    files: [{ id: "settle", name: "Settle counter", note: "Only the digits that change move, and they settle in from a little bigger." }],
  },
  {
    id: "liquid404",
    title: "Liquid 404 page",
    time: "Nov 17",
    files: [
      { id: "page", name: "404 page", note: "A glass frame of brand liquid that rises with your pointer." },
      { id: "level", name: "Liquid level", note: "Smooth, never bouncy, from empty to full." },
    ],
  },
];

export const DEMO_PROJECTS = ["Impeccable UI", "Docs site", "Launch"];

/** Pinned on top, then Recents, the way the demo shows them. */
export function sectionsOf(chats: DemoChat[]): IntentSection[] {
  return [
    { title: "Pinned", chats: chats.filter((c) => c.pinned) },
    { title: "Recents", chats: chats.filter((c) => !c.pinned) },
  ];
}

/** The menu's choices change the demo's own list, the way your app would. */
export function applyAction(chats: DemoChat[], id: string, action: IntentAction, value?: string): DemoChat[] {
  return chats.map((c) => {
    if (c.id !== id) return c;
    if (action === "pin") return { ...c, pinned: true };
    if (action === "unpin") return { ...c, pinned: false };
    if (action === "mark-unread") return { ...c, unread: true };
    if (action === "mark-read") return { ...c, unread: false };
    if (action === "notify") return { ...c, notify: value as IntentNotify };
    if (action === "move") return { ...c, project: value || undefined };
    return c;
  });
}

const NOTIFY_WORDS: Record<IntentNotify, string> = { all: "all new messages", mentions: "mentions only", none: "nothing" };

function said(chat: DemoChat, action: IntentAction, value?: string) {
  const t = `“${chat.title}”`;
  switch (action) {
    case "open-window":
      return `${t} opens in a new window in your app.`;
    case "pin":
      return `Pinned ${t}.`;
    case "unpin":
      return `Unpinned ${t}.`;
    case "mark-unread":
      return `Marked ${t} as unread.`;
    case "mark-read":
      return `Marked ${t} as read.`;
    case "rename":
      return `Rename ${t}: your app opens its rename field here.`;
    case "notify":
      return `${t} now notifies you about ${NOTIFY_WORDS[value as IntentNotify]}.`;
    case "move":
      return value ? `Moved ${t} to ${value}.` : `Took ${t} out of its project.`;
    case "settings":
      return `Settings for ${t} open here in your app.`;
    case "archive":
      return `Archived ${t}.`;
    case "delete":
      return `Deleted ${t}.`;
  }
}

/**
 * The preview: a small app window. The sidebar on the left, the chat it opens on the right.
 * Archive and Delete really take the chat out (with Undo), and Pin moves it between the lists.
 */
export function IntentSidebarDemo() {
  const [chats, setChats] = useState(DEMO_CHATS);
  const [open, setOpen] = useState<{ chat: string; file?: string }>({ chat: "logic", file: "plan" });
  const [note, setNote] = useState<{ text: string; undo?: DemoChat[]; n: number } | null>(null);

  const chat = chats.find((c) => c.id === open.chat) ?? chats[0];
  const file = chat?.files?.find((f) => f.id === open.file);

  const onAction = (id: string, action: IntentAction, value?: string) => {
    const c = chats.find((x) => x.id === id);
    if (!c) return;
    const text = said(c, action, value);
    if (action === "archive" || action === "delete") {
      const before = chats;
      const next = chats.filter((x) => x.id !== id);
      setChats(next);
      if (open.chat === id && next[0]) setOpen({ chat: next[0].id, file: next[0].files?.[0]?.id });
      setNote({ text, undo: before, n: Date.now() });
      return;
    }
    setChats(applyAction(chats, id, action, value));
    setNote({ text, n: Date.now() });
  };

  return (
    <div className="flex w-full justify-center px-3 py-8 @min-[34rem]:px-8 @min-[34rem]:py-12">
      <div className="isb-demo flex w-full max-w-[52rem] flex-col rounded-2xl border border-[var(--line)] bg-[var(--bg)] @min-[34rem]:h-[34rem] @min-[34rem]:flex-row">
        {/* The sidebar, on the frame colour like an app's side panel. Its menus and cards float over the chat. */}
        <div className="flex h-[26rem] shrink-0 flex-col rounded-t-2xl bg-[var(--frame)] @min-[34rem]:h-auto @min-[34rem]:w-60 @min-[34rem]:rounded-t-none @min-[34rem]:rounded-l-2xl">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <span className="grid size-6 place-items-center rounded-md bg-[var(--fg)] text-label-11 font-semibold text-[var(--bg)]">I</span>
            <span className="text-label-14 font-medium">Impeccable UI</span>
          </div>
          <IntentSidebar
            sections={sectionsOf(chats)}
            activeId={chat?.id}
            projects={DEMO_PROJECTS}
            onOpen={(id, f) => {
              setOpen({ chat: id, file: f ?? chats.find((c) => c.id === id)?.files?.[0]?.id });
              // Opening a chat reads it.
              if (chats.some((c) => c.id === id && c.unread)) setChats(chats.map((c) => (c.id === id ? { ...c, unread: false } : c)));
            }}
            onAction={onAction}
            aria-label="Chats"
          />
        </div>

        {/* The chat that is open, at the file that was picked. */}
        <div className="flex min-h-[15rem] min-w-0 flex-1 flex-col border-t border-[var(--line)] p-5 @min-[34rem]:border-t-0 @min-[34rem]:border-l @min-[34rem]:p-8">
          {chat ? (
            <div key={chat.id + (file?.id ?? "")} className="isb-demo-in flex min-h-0 flex-1 flex-col">
              <p className="text-label-12 text-[var(--muted)]">{chat.project ?? "No project"}</p>
              <h3 className="mt-1 text-heading-20 text-balance">{chat.title}</h3>
              {chat.files?.length ? (
                <>
                  <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Files in this chat">
                    {chat.files.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setOpen({ chat: chat.id, file: f.id })}
                        aria-pressed={f.id === file?.id}
                        className="press inline-flex h-8 items-center rounded-lg px-3 text-label-13 text-[var(--muted)] shadow-[inset_0_0_0_1px_var(--line)] transition-colors hover:text-[var(--fg)] aria-pressed:bg-[var(--panel-2)] aria-pressed:font-medium aria-pressed:text-[var(--fg)]"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                  {file && (
                    <div className="mt-5 rounded-xl bg-[var(--panel-2)] p-5">
                      <p className="text-heading-16">{file.name}</p>
                      <p className="mt-2 max-w-prose text-copy-14 text-pretty text-[var(--muted)]">{file.note}</p>
                      <div className="mt-5 space-y-2.5" aria-hidden="true">
                        <div className="h-2 w-11/12 rounded-full bg-[var(--line)]" />
                        <div className="h-2 w-9/12 rounded-full bg-[var(--line)]" />
                        <div className="h-2 w-10/12 rounded-full bg-[var(--line)]" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 max-w-prose text-copy-14 text-[var(--muted)]">No files in this chat yet.</p>
              )}
            </div>
          ) : (
            <p className="text-copy-14 text-[var(--muted)]">Every chat is archived. Undo below brings one back.</p>
          )}

          <div className="mt-auto min-h-6 pt-4" aria-live="polite">
            {note && (
              <p key={note.n} className="isb-demo-in flex flex-wrap items-center gap-x-2 text-copy-13 text-[var(--muted)]">
                {note.text}
                {note.undo && (
                  <button
                    type="button"
                    onClick={() => {
                      setChats(note.undo!);
                      setNote(null);
                    }}
                    className="font-medium text-[var(--fg)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--fg)]"
                  >
                    Undo
                  </button>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
      <style>{`.isb-demo-in{animation:isb-demo-in .28s cubic-bezier(.23,1,.32,1) both}@keyframes isb-demo-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.isb-demo-in{animation-duration:.01s}}`}</style>
    </div>
  );
}
