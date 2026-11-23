/**
 * What the home iMac hands each channel (items/<name>/tv.tsx).
 * - onReplay: start the channel over.
 * - onLoop: optional. A channel that plays in beats calls onLoop("start") when a beat begins and
 *   onLoop("end") when it has fully settled. The iMac moves on after 5 seconds, but never in the
 *   middle of a beat: it waits for "end" first. Channels that just run (a marquee, a clock) skip it.
 */
export type ChannelProps = {
  onReplay: () => void;
  onLoop?: (phase: "start" | "end") => void;
};

/** The iMac tube every channel (items/<name>/tv.tsx) draws inside. */
export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="imac-power-on absolute inset-0 overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      {children}
      {/* A white glow that fades out, so the warm-up line shows in dark mode too */}
      <div className="imac-power-flash pointer-events-none absolute inset-0 z-50 bg-white" />
    </div>
  );
}
