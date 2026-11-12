"use client";

/**
 * Hex-Login, from Impeccable.
 *
 * A calm, centred login page: your logo inside four thin hexagon rings that
 * turn a little more the further out they are, a "Welcome back" line, Sign in
 * with Google, an email field and a Continue button.
 *
 *   - Continue checks the email first. Empty or not an email: a short error
 *     shows under the field and the field gets focus. A real email: `onContinue`.
 *   - Sign in with Google calls `onGoogle`. Without one (no login connected
 *     yet), a toast at the bottom says so for 3 seconds and points to the email.
 *   - Either handler may return a promise; its button shows a spinner until it settles.
 *
 * No packages. Colors come from the page's own theme variables
 * (--foreground / --background, else --fg / --bg), so it follows light and dark mode.
 */

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";

export type HexLoginProps = {
  /** The big line under the logo. */
  title?: ReactNode;
  /** Your logo. Sits in the middle of the rings, about 70 x 80px. Defaults to the Impeccable mark. */
  logo?: ReactNode;
  /** Called with the trimmed email after it passes the check. */
  onContinue?: (email: string) => void | Promise<unknown>;
  /** Called on Sign in with Google. Leave out until Google login is connected. */
  onGoogle?: () => void | Promise<unknown>;
  /** Show the Google button and the OR line. */
  google?: boolean;
  /** Your product name in the small print. */
  brand?: string;
  termsHref?: string;
  privacyHref?: string;
  defaultEmail?: string;
  /** All the short texts. Pass only the ones you want to change. */
  labels?: Partial<HexLoginLabels>;
  className?: string;
  /** The page fills the screen (min-height 100dvh). Set a smaller minHeight here to fit it in a box. */
  style?: CSSProperties;
};

export type HexLoginLabels = {
  google: string;
  or: string;
  placeholder: string;
  continue: string;
  /** The toast on Sign in with Google when there is no `onGoogle`. */
  googleMissing: string;
  emptyEmail: string;
  badEmail: string;
  /** Small print before the brand name. */
  agree: string;
  terms: string;
  privacy: string;
  and: string;
};

const DEFAULT_LABELS: HexLoginLabels = {
  google: "Sign in with Google",
  or: "OR",
  placeholder: "Enter your email address",
  continue: "Continue",
  googleMissing: "Google sign-in isn't connected yet. Use your email for now.",
  emptyEmail: "Enter your email address to continue.",
  badEmail: "That doesn't look like an email. Try name@example.com.",
  agree: "By continuing you agree to",
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  and: "and",
};

/* ---------- the design: keep as written ---------- */

const EASE = "cubic-bezier(.23,1,.32,1)"; // fast start, soft landing
const TOAST_MS = 3000; // how long the Google toast stays
/** The four rings, inside out: radius in px (desktop) and turn in degrees. */
const RINGS: [number, number][] = [
  [64, -4],
  [110, -8],
  [165, -15],
  [232, -20],
];
const RING_BOX = 520; // the rings' square, centred on the logo

/** Something@something.something, no spaces. Good enough to catch typos. */
export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value) && /\.[^\s@.]{2,}$/.test(value);
}

/** The points of a pointy-top hexagon of radius r, turned by `turn` degrees. */
function hexPoints(r: number, turn: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = ((turn + k * 60) * Math.PI) / 180;
    return `${(r * Math.sin(a)).toFixed(2)},${(-r * Math.cos(a)).toFixed(2)}`;
  }).join(" ");
}

const CSS = `
.ihl {
  --ihl-fg: var(--foreground, var(--fg, CanvasText));
  --ihl-bg: var(--background, var(--bg, Canvas));
  --ihl-error: var(--destructive, #e5484d);
  --ihl-line: color-mix(in oklab, var(--ihl-fg) 10%, transparent);
  --ihl-soft: color-mix(in oklab, var(--ihl-fg) 45%, transparent);
  container-type: inline-size;
  position: relative; box-sizing: border-box; width: 100%; min-height: 100dvh;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  padding: 48px 30px; color: var(--ihl-fg); background: var(--ihl-bg);
  font-family: inherit; text-align: center; -webkit-font-smoothing: antialiased;
}
.ihl *, .ihl *::before, .ihl *::after { box-sizing: border-box; }
.ihl-col { position: relative; width: 100%; max-width: 380px; display: flex; flex-direction: column; align-items: center; }
.ihl-logo { position: relative; display: grid; place-items: center; height: 80px; min-width: 69px; }
.ihl-logo > :not(svg.ihl-rings) { position: relative; }
.ihl-rings {
  position: absolute; left: 50%; top: 50%; width: ${RING_BOX}px; height: ${RING_BOX}px; margin: -${RING_BOX / 2}px 0 0 -${RING_BOX / 2}px;
  pointer-events: none; overflow: visible; transform: scale(.9);
  -webkit-mask-image: linear-gradient(to bottom, #000 40%, transparent 77%); mask-image: linear-gradient(to bottom, #000 40%, transparent 77%);
}
.ihl-rings polygon { fill: none; stroke: var(--ihl-line); stroke-width: 1.5; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.ihl-ring { transform-origin: 0 0; animation: ihl-ring 1s ${EASE} both; }
@keyframes ihl-ring { from { opacity: 0; transform: rotate(14deg) scale(.94); } }
.ihl-title { margin: 40px 0 0; font-size: 24px; line-height: 30px; font-weight: 500; letter-spacing: -.01em; text-wrap: balance; }
.ihl-btn {
  all: unset; box-sizing: border-box; position: relative; width: 100%; display: flex; align-items: center; justify-content: center;
  border-radius: 999px; font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; user-select: none;
  transition: transform .16s ${EASE}, background-color .15s, border-color .15s, box-shadow .2s ${EASE}, opacity .15s;
}
.ihl-btn:active:not([aria-disabled="true"]) { transform: scale(.98); }
.ihl-btn:focus-visible { outline: 2px solid var(--ihl-soft); outline-offset: 2px; }
.ihl-btn[aria-disabled="true"] { cursor: default; }
.ihl-google {
  margin-top: 40px; height: 44px; font-size: 16px; font-weight: 600; color: var(--ihl-fg); background: var(--ihl-bg);
  border: 1px solid color-mix(in oklab, var(--ihl-fg) 14%, transparent);
  box-shadow: 0 1px 1px color-mix(in oklab, var(--ihl-fg) 8%, transparent);
}
.ihl-google:hover { background: color-mix(in oklab, var(--ihl-fg) 3%, var(--ihl-bg)); border-color: color-mix(in oklab, var(--ihl-fg) 20%, transparent); }
.ihl-or { margin: 32px 0; width: 100%; display: flex; align-items: center; gap: 8px; font-size: 14px; line-height: 20px; color: var(--ihl-soft); }
.ihl-or::before, .ihl-or::after { content: ""; flex: 1; height: 1px; background: var(--ihl-line); }
.ihl-form { width: 100%; margin: 0; }
.ihl-input {
  all: unset; box-sizing: border-box; display: block; width: 100%; height: 40px; padding: 0 12px; text-align: left;
  font: inherit; font-size: 16px; color: var(--ihl-fg); caret-color: currentColor;
  background: color-mix(in oklab, var(--ihl-fg) 4.5%, var(--ihl-bg));
  border: 1px solid color-mix(in oklab, var(--ihl-fg) 8%, transparent); border-radius: var(--radius-lg, .5rem);
  box-shadow: 0 1px 1px color-mix(in oklab, var(--ihl-fg) 5%, transparent);
  transition: border-color .15s, box-shadow .2s ${EASE}, background-color .15s;
}
.ihl-input::placeholder { color: color-mix(in oklab, var(--ihl-fg) 40%, transparent); opacity: 1; }
.ihl-input:hover { border-color: color-mix(in oklab, var(--ihl-fg) 16%, transparent); }
.ihl-input:focus { border-color: color-mix(in oklab, var(--ihl-fg) 30%, transparent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--ihl-fg) 8%, transparent); }
.ihl-input[aria-invalid="true"] { border-color: var(--ihl-error); box-shadow: 0 0 0 3px color-mix(in oklab, var(--ihl-error) 16%, transparent); }
.ihl-reveal { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows .26s ${EASE}, opacity .2s; }
.ihl-reveal[data-on="true"] { grid-template-rows: 1fr; opacity: 1; }
.ihl-reveal > div { overflow: hidden; }
.ihl-error { margin: 0; padding-top: 8px; font-size: 13px; line-height: 18px; text-align: left; color: var(--ihl-error); }
.ihl-toast {
  position: absolute; left: 50%; bottom: 24px; z-index: 2; max-width: calc(100% - 32px); width: max-content;
  padding: 10px 16px; border-radius: 12px; font-size: 13px; line-height: 18px; text-align: left;
  color: var(--ihl-bg); background: var(--ihl-fg); box-shadow: 0 8px 24px -6px rgba(0,0,0,.3), 0 1px 2px rgba(0,0,0,.14);
  pointer-events: none; opacity: 0; transform: translate(-50%, 12px) scale(.96);
  transition: opacity .2s, transform .2s ${EASE}, visibility 0s .2s; visibility: hidden;
}
.ihl-toast[data-on="true"] { opacity: 1; transform: translate(-50%, 0); visibility: visible; transition: opacity .2s, transform .32s ${EASE}; }
.ihl-continue {
  margin-top: 16px; height: 36px; font-size: 14px; font-weight: 500; color: var(--ihl-bg); background: var(--ihl-fg);
  box-shadow: 0 4px 10px -2px rgba(0,0,0,.28), 0 1px 2px rgba(0,0,0,.16);
}
.ihl-continue:hover:not([aria-disabled="true"]) { opacity: .88; }
.ihl-label { transition: opacity .15s; }
.ihl-row { display: inline-flex; align-items: center; gap: 16px; }
.ihl-btn[aria-busy="true"] .ihl-label { opacity: 0; }
.ihl-spin { position: absolute; left: 50%; top: 50%; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%;
  border: 2px solid currentColor; border-right-color: transparent; animation: ihl-spin .7s linear infinite; }
@keyframes ihl-spin { to { transform: rotate(360deg); } }
.ihl-legal { margin: 20px 0 0; font-size: 10px; line-height: 14px; color: var(--ihl-soft); text-wrap: balance; }
.ihl-legal a { color: inherit; text-decoration: underline; text-underline-offset: 2px; transition: color .15s; }
.ihl-legal a:hover { color: var(--ihl-fg); }
.ihl-sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@container (min-width: 40rem) {
  .ihl-title { font-size: 30px; line-height: 36px; }
  .ihl-rings { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ihl-ring { animation: ihl-fade .3s both; }
  .ihl-btn, .ihl-reveal { transition: opacity .15s; }
  .ihl-toast, .ihl-toast[data-on="true"] { transform: translate(-50%, 0); }
  .ihl-btn:active:not([aria-disabled="true"]) { transform: none; }
  .ihl-spin { animation-duration: 1.6s; }
}
@keyframes ihl-fade { from { opacity: 0; } }
`;

/** The Impeccable mark: a pointy-top hexagon with three stripes cut across its top right. */
function DefaultLogo() {
  const id = useId().replace(/:/g, "");
  return (
    <svg width="69" height="80" viewBox="0 0 69 80" aria-hidden="true">
      <defs>
        <mask id={`ihl-cut-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="69" height="80">
          <path d="M34.5 0 69 20v40L34.5 80 0 60V20z" fill="#fff" />
          <path d="M0-11.5 69 28.5M0-6 69 34M0-.5 69 39.5" stroke="#000" strokeWidth="1.5" />
        </mask>
      </defs>
      <path d="M34.5 0 69 20v40L34.5 80 0 60V20z" fill="currentColor" mask={`url(#ihl-cut-${id})`} />
    </svg>
  );
}

/** Google's "G", in its own four colors (the brand asks for these exact colors). */
function GoogleG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

/** Runs a handler that may return a promise, and says when it is busy. */
function useBusy() {
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  useEffect(() => () => void (alive.current = false), []);
  const run = (fn: () => void | Promise<unknown>) => {
    let out: void | Promise<unknown>;
    try {
      out = fn();
    } catch (err) {
      console.error(err);
      return;
    }
    if (out && typeof (out as Promise<unknown>).then === "function") {
      setBusy(true);
      (out as Promise<unknown>)
        .catch((err) => console.error(err))
        .finally(() => alive.current && setBusy(false));
    }
  };
  return [busy, run] as const;
}

export function HexLogin({
  title = "Welcome back, Buddy",
  logo,
  onContinue,
  onGoogle,
  google = true,
  brand = "Impeccable",
  termsHref = "/terms",
  privacyHref = "/privacy",
  defaultEmail = "",
  labels: labelOverrides,
  className,
  style,
}: HexLoginProps) {
  const t = { ...DEFAULT_LABELS, ...labelOverrides };
  const uid = useId();
  const errorId = `ihl-error-${uid}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [googleBusy, runGoogle] = useBusy();
  const [continueBusy, runContinue] = useBusy();

  // The Google toast fades away on its own.
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(false), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  const onGoogleClick = () => {
    if (googleBusy) return;
    if (!onGoogle) {
      // Clicking again while it shows starts the 3 seconds over.
      setToast(false);
      requestAnimationFrame(() => setToast(true));
      return;
    }
    runGoogle(onGoogle);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (continueBusy) return;
    const value = email.trim();
    const problem = !value ? t.emptyEmail : !isEmail(value) ? t.badEmail : null;
    setError(problem);
    if (problem) return inputRef.current?.focus();
    if (onContinue) runContinue(() => onContinue(value));
  };

  return (
    <div className={className ? `ihl ${className}` : "ihl"} style={style}>
      <style>{CSS}</style>
      <div className="ihl-col">
        <div className="ihl-logo">
          <svg className="ihl-rings" viewBox={`${-RING_BOX / 2} ${-RING_BOX / 2} ${RING_BOX} ${RING_BOX}`} aria-hidden="true">
            {RINGS.map(([r, turn], i) => (
              <g key={r} className="ihl-ring" style={{ animationDelay: `${i * 70}ms` }}>
                <polygon points={hexPoints(r, turn)} />
              </g>
            ))}
          </svg>
          {logo ?? <DefaultLogo />}
        </div>

        <h1 className="ihl-title">{title}</h1>

        {google && (
          <>
            <button
              type="button"
              className="ihl-btn ihl-google"
              onClick={onGoogleClick}
              aria-disabled={googleBusy || undefined}
              aria-busy={googleBusy || undefined}
            >
              <span className="ihl-label ihl-row">
                <GoogleG />
                {t.google}
              </span>
              {googleBusy && <span className="ihl-spin" aria-hidden="true" />}
            </button>
            <div className="ihl-or" role="separator" aria-label={t.or}>
              <span aria-hidden="true">{t.or}</span>
            </div>
          </>
        )}

        <form className="ihl-form" onSubmit={submit} noValidate style={google ? undefined : { marginTop: 40 }}>
          <label className="ihl-sr" htmlFor={`ihl-email-${uid}`}>
            {t.placeholder}
          </label>
          <input
            ref={inputRef}
            id={`ihl-email-${uid}`}
            className="ihl-input"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={t.placeholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
          />
          <div className="ihl-reveal" data-on={!!error}>
            <div>
              <p id={errorId} className="ihl-error" aria-live="polite">
                {error ?? ""}
              </p>
            </div>
          </div>
          <button
            type="submit"
            className="ihl-btn ihl-continue"
            aria-disabled={continueBusy || undefined}
            aria-busy={continueBusy || undefined}
          >
            <span className="ihl-label">{t.continue}</span>
            {continueBusy && <span className="ihl-spin" aria-hidden="true" />}
          </button>
        </form>

        <p className="ihl-legal">
          {t.agree} {brand} <a href={termsHref}>{t.terms}</a> {t.and} <a href={privacyHref}>{t.privacy}</a>.
        </p>
      </div>

      {/* The Google toast: bottom centre of the page, gone after 3 seconds. */}
      <div className="ihl-toast" data-on={toast} aria-hidden="true">
        {t.googleMissing}
      </div>
      <p className="ihl-sr" role="status">
        {toast ? t.googleMissing : ""}
      </p>
    </div>
  );
}
