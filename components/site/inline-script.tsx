"use client";

/**
 * A small script in <head> that must run before the page paints (the theme, the redraw flag).
 * It runs once, from the server's HTML. React never runs a <script> it builds in the browser,
 * and warns "Encountered a script tag while rendering React component" when it builds one,
 * which happens whenever the root layout mounts again (for example after a crash in dev).
 * So in the browser the tag is plain text: React stays quiet and nothing runs twice.
 */
export function InlineScript({ code }: { code: string }) {
  return (
    <script
      type={typeof window === "undefined" ? undefined : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
