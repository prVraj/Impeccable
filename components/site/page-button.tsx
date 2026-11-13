"use client";

import type { MouseEvent } from "react";

/**
 * The preview for page-wide animations: one dark pill button on the dotted
 * card, nothing else. The button plays the animation on the whole website.
 */
export function PageButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="card dots grid min-h-80 place-items-center rounded-2xl px-5 py-16 @min-[40rem]:min-h-96">
      <button
        type="button"
        onClick={onClick}
        className="press inline-flex h-11 items-center rounded-full bg-[var(--fg)] px-[22px] text-[15px] font-semibold tracking-[-0.01em] text-[var(--bg)] shadow-[inset_0_1px_0_rgb(255_255_255/.16),0_1px_2px_rgb(0_0_0/.18),0_6px_14px_-8px_rgb(0_0_0/.4)]"
      >
        {children}
      </button>
    </div>
  );
}
