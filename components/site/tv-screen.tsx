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
