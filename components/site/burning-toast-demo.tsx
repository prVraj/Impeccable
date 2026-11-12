"use client";

import { useSyncExternalStore } from "react";
import { BurningToaster, toast, type ToastPosition, type ToastType } from "@/registry/impeccable/burning-toast/burning-toast";
import { cx } from "@/lib/utils";

/* Which side the docs page's toaster pops on. Shared by the Position buttons and the toaster. */
let side: ToastPosition = "bottom-right";
const subs = new Set<() => void>();
const setSide = (p: ToastPosition) => {
  side = p;
  subs.forEach((f) => f());
};
const useSide = () =>
  useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => side,
    () => "bottom-right" as ToastPosition,
  );

/** The one toaster on the docs page, in the site's colors. */
export function BurningToastDemoToaster() {
  const position = useSide();
  return (
    <BurningToaster
      position={position}
      colors={{ surface: "var(--panel)", text: "var(--fg)", muted: "var(--muted)", border: "var(--line)" }}
    />
  );
}

const OUTLINE =
  "card press inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-[var(--fg)] transition-[transform,box-shadow] hover:shadow-[0_0_0_1px_var(--faint)]";

const pop = () => toast("Event created", { description: "Sunday, December 3 at 9:00 AM" });

/** The preview: one button. Demos use the secondary button, never the site's brand CTA. */
export function BurningToastDemo() {
  return (
    <div className="card dots grid min-h-72 place-items-center rounded-2xl px-5 py-12 @min-[40rem]:min-h-80">
      <button
        type="button"
        onClick={pop}
        className={OUTLINE}
      >
        Pop my toast
      </button>
    </div>
  );
}

const TYPES: { type: ToastType; label: string; title: string; description: string }[] = [
  { type: "default", label: "Default", title: "Event created", description: "Sunday, December 3 at 9:00 AM" },
  { type: "success", label: "Success", title: "Changes saved", description: "Your profile is up to date." },
  { type: "info", label: "Info", title: "New version available", description: "Refresh to get the latest features." },
  { type: "warning", label: "Warning", title: "Storage almost full", description: "You have used 9 GB of your 10 GB." },
  { type: "error", label: "Error", title: "Payment failed", description: "Your card was declined. Try another one." },
];

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="card dots flex min-h-40 flex-wrap items-center justify-center gap-2.5 rounded-2xl px-5 py-10">
      {children}
    </div>
  );
}

/** Types: one button per toast type. */
export function ToastTypesDemo() {
  return (
    <Stage>
      {TYPES.map((t) => (
        <button
          key={t.type}
          type="button"
          className={OUTLINE}
          onClick={() => toast(t.title, { type: t.type, description: t.description })}
        >
          {t.label}
        </button>
      ))}
    </Stage>
  );
}

/** Position: pick a side, and a toast pops there. */
export function ToastPositionDemo() {
  const current = useSide();
  const go = (p: ToastPosition) => {
    setSide(p);
    toast(p === "bottom-right" ? "Popping on the right" : "Popping in the center", {
      description: p === "bottom-right" ? "New toasts stack at the bottom right." : "New toasts stack at the bottom center.",
    });
  };
  return (
    <Stage>
      {(
        [
          ["bottom-right", "Pop on the right"],
          ["bottom-center", "Pop in the center"],
        ] as const
      ).map(([p, label]) => (
        <button
          key={p}
          type="button"
          aria-pressed={current === p}
          onClick={() => go(p)}
          className={cx(OUTLINE, current === p && "shadow-[0_0_0_1.5px_var(--accent)]! text-[var(--accent)]")}
        >
          {label}
        </button>
      ))}
    </Stage>
  );
}
