"use client";

/**
 * Password-Strength, from Impeccable.
 *
 * A password field with a show/hide eye, a three-part meter and three checkpoints:
 *   1. at least 12 characters
 *   2. at least 2 upper case and 2 lower case letters
 *   3. at least one special character and one number
 * Meet none and the password reads as "No", 1 as "AI" (easy to guess), 2 as
 * "AI agent", all 3 as "Human": a strong password.
 *
 * No packages. Eye icons are from Hugeicons (free set, MIT, hugeicons.com), copied in as SVG.
 * Colors come from the text color around the field, so it follows light and dark mode.
 */

import { useEffect, useId, useRef, useState } from "react";

/* ---------- the design: keep as written ---------- */

const EASE = "cubic-bezier(.23,1,.32,1)"; // fast start, soft landing
const BAR_MS = 380; // a bar filling or emptying
const BAR_STAGGER = 45; // between bars
const DEFAULT_COLORS = ["#f26a5e", "#f2a93b", "#2eb872"];

/** Which checkpoints a password meets. */
export function checkPassword(pw, minLength = 12) {
  const upper = pw.match(/\p{Lu}/gu)?.length ?? 0;
  const lower = pw.match(/\p{Ll}/gu)?.length ?? 0;
  return [
    [...pw].length >= minLength,
    upper >= 2 && lower >= 2,
    /\p{N}/u.test(pw) && /[^\p{L}\p{N}\s]/u.test(pw),
  ];
}

/** How many of the three checkpoints the password meets (0 to 3). */
export function passwordLevel(pw, minLength = 12) {
  return checkPassword(pw, minLength).filter(Boolean).length;
}

const CSS = `
.ipw { --ipw-line: color-mix(in oklab, currentColor 12%, transparent); --ipw-soft: color-mix(in oklab, currentColor 45%, transparent); }
.ipw-field { transition: border-color .15s, box-shadow .2s ${EASE}; }
.ipw-field:hover { border-color: color-mix(in oklab, currentColor 20%, transparent); }
.ipw-field:focus-within { border-color: color-mix(in oklab, currentColor 32%, transparent); box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 0 0 3px color-mix(in oklab, currentColor 7%, transparent); }
.ipw-input { all: unset; box-sizing: border-box; width: 100%; height: 100%; padding: 0 48px 0 16px; font: inherit; font-size: 15px; color: inherit; caret-color: currentColor; }
.ipw-input[type="password"] { color: var(--ipw-soft); font-size: 20px; letter-spacing: .16em; }
.ipw-input::placeholder { color: var(--ipw-soft); letter-spacing: normal; }
.ipw-input::-ms-reveal { display: none; }
.ipw-eye { all: unset; position: absolute; top: 50%; right: 10px; width: 32px; height: 32px; margin-top: -16px; display: grid; place-items: center; border-radius: 8px; cursor: pointer; color: var(--ipw-soft); transition: color .15s, transform .15s ${EASE}; -webkit-tap-highlight-color: transparent; }
.ipw-eye:hover { color: currentColor; color: color-mix(in oklab, currentColor 80%, transparent); }
.ipw-eye:active { transform: scale(.92); }
.ipw-eye:focus-visible { box-shadow: 0 0 0 2px var(--ipw-soft); }
.ipw-eye svg { grid-area: 1 / 1; transform-origin: 50% 50%; transition: opacity .18s ${EASE}, transform .26s ${EASE}, filter .18s; }
.ipw-eye svg[data-on="false"] { opacity: 0; transform: scaleY(.25); filter: blur(2px); }
.ipw-bar { position: relative; flex: 1; height: 4px; border-radius: 99px; background: var(--ipw-line); overflow: hidden; }
.ipw-fill { position: absolute; inset: 0; border-radius: inherit; transform-origin: left center; transition: transform ${BAR_MS}ms ${EASE}, background-color .24s; }
.ipw-sheen { position: absolute; inset: -2px 0; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent); width: 40%; animation: ipw-sheen .8s ${EASE} .25s both; }
@keyframes ipw-sheen { from { transform: translateX(-100%); opacity: 1; } to { transform: translateX(260%); opacity: 0; } }
.ipw-level { animation: ipw-level .26s ${EASE} both; }
@keyframes ipw-level { from { opacity: 0; transform: translateY(4px); filter: blur(3px); } }
.ipw-box { flex: none; width: 20px; height: 20px; box-sizing: border-box; border-radius: 5px; border: 1.5px solid color-mix(in oklab, currentColor 16%, transparent); display: grid; place-items: center; transition: background-color .2s ${EASE}, border-color .2s ${EASE}; }
.ipw-box[data-on="true"] { background: currentColor; border-color: currentColor; animation: ipw-pop .32s cubic-bezier(.34,1.56,.64,1); }
@keyframes ipw-pop { 0% { transform: scale(.82); } 100% { transform: scale(1); } }
.ipw-box path { stroke-dasharray: 14; stroke-dashoffset: 14; transition: stroke-dashoffset .26s ${EASE}; }
.ipw-box[data-on="true"] path { stroke-dashoffset: 0; transition-delay: .06s; }
@media (prefers-reduced-motion: reduce) {
  .ipw-fill, .ipw-eye svg { transition: opacity .15s, background-color .15s; }
  .ipw-eye svg[data-on="false"] { transform: none; filter: none; }
  .ipw-sheen { display: none; }
  .ipw-level { animation: none; }
  .ipw-box[data-on="true"] { animation: none; }
  .ipw-box path { transition: none; }
}`;

/** True when the text around the field is light, so the check mark can be dark. */
function useLightText(ref) {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const read = () => {
      const c = ref.current && getComputedStyle(ref.current).color.match(/[\d.]+/g);
      if (!c) return;
      const [r, g, b] = c.map(Number);
      setLight(0.299 * r + 0.587 * g + 0.114 * b > 140);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", read);
    };
  }, [ref]);
  return light;
}

/* Hugeicons "view-off" and "view" (free set, MIT). */
function EyeOff({ on }) {
  return (
    <svg
      data-on={on}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 8C22 8 18 14 12 14C6 14 2 8 2 8" />
      <path d="M15 13.5L16.5 16" />
      <path d="M20 11L22 13" />
      <path d="M2 13L4 11" />
      <path d="M9 13.5L7.5 16" />
    </svg>
  );
}

function EyeOpen({ on }) {
  return (
    <svg
      data-on={on}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" />
      <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" />
    </svg>
  );
}

export function PasswordStrength({
  label = "Password",
  value,
  defaultValue = "",
  onChange,
  onLevelChange,
  levels = ["No", "AI", "AI agent", "Human"],
  rules = ["Minimum 12 characters", "2 upper & 2 lower case chars", "Special char and numbers"],
  minLength = 12,
  colors = DEFAULT_COLORS,
  name,
  id,
  placeholder,
  autoComplete = "new-password",
  className,
  style,
}) {
  const autoId = useId();
  const inputId = id ?? `ipw-${autoId}`;
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [inner, setInner] = useState(defaultValue);
  const [shown, setShown] = useState(false);
  const pw = value ?? inner;
  const met = checkPassword(pw, minLength);
  const level = passwordLevel(pw, minLength);
  const lightText = useLightText(rootRef);

  // The sheen runs once each time the password reaches "Human".
  const [sheen, setSheen] = useState(0);
  const prevLevel = useRef(level);
  useEffect(() => {
    if (level !== prevLevel.current) {
      if (level === 3) setSheen((s) => s + 1);
      onLevelChange?.(level);
      prevLevel.current = level;
    }
  }, [level, onLevelChange]);

  const toggle = () => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? null;
    const end = el?.selectionEnd ?? null;
    setShown((s) => !s);
    // Keep the caret where it was after the type switch.
    requestAnimationFrame(() => {
      if (el && start !== null && end !== null && document.activeElement === el)
        el.setSelectionRange(start, end);
    });
  };

  const color = level ? colors[level - 1] : "transparent";

  return (
    <div
      ref={rootRef}
      className={`ipw${className ? ` ${className}` : ""}`}
      style={{ width: "100%", maxWidth: 480, ...style }}
    >
      <style>{CSS}</style>

      <label
        htmlFor={inputId}
        style={{
          display: "block",
          fontSize: 18,
          fontWeight: 500,
          lineHeight: "26px",
          marginBottom: 8,
        }}
      >
        {label}
      </label>

      <div
        className="ipw-field"
        style={{
          position: "relative",
          height: 52,
          borderRadius: 10,
          border: "1px solid var(--ipw-line)",
          boxShadow: "0 1px 2px rgba(0,0,0,.04)",
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          className="ipw-input"
          type={shown ? "text" : "password"}
          value={pw}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby={`${inputId}-meter ${inputId}-rules`}
          onChange={(e) => {
            if (value === undefined) setInner(e.target.value);
            onChange?.(e.target.value);
          }}
        />
        <button
          type="button"
          className="ipw-eye"
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          aria-controls={inputId}
          // Keep focus (and the phone keyboard) on the field.
          onPointerDown={(e) => e.preventDefault()}
          onClick={toggle}
        >
          <EyeOff on={!shown} />
          <EyeOpen on={shown} />
        </button>
      </div>

      <div
        id={`${inputId}-meter`}
        style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, height: 20 }}
      >
        <div
          style={{ position: "relative", display: "flex", gap: 3, width: "62.5%" }}
          aria-hidden="true"
        >
          {[1, 2, 3].map((n) => {
            const on = level >= n;
            // Fill left to right, empty right to left.
            const delay = on ? (n - 1) * BAR_STAGGER : (3 - n) * BAR_STAGGER;
            return (
              <span key={n} className="ipw-bar">
                <span
                  className="ipw-fill"
                  style={{
                    background: on ? color : "transparent",
                    transform: `scaleX(${on ? 1 : 0})`,
                    transitionDelay: `${delay}ms, 0ms`,
                  }}
                />
              </span>
            );
          })}
          {sheen > 0 && level === 3 && (
            <span
              key={sheen}
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                borderRadius: 99,
                pointerEvents: "none",
              }}
            >
              <span className="ipw-sheen" />
            </span>
          )}
        </div>
        <span
          aria-live="polite"
          style={{
            fontSize: 16,
            lineHeight: "20px",
            color: "var(--ipw-soft)",
            whiteSpace: "nowrap",
          }}
        >
          {pw.length > 0 && (
            <span key={level} className="ipw-level" style={{ display: "inline-block" }}>
              <span
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clip: "rect(0 0 0 0)",
                }}
              >
                Password strength:{" "}
              </span>
              {levels[level]}
            </span>
          )}
        </span>
      </div>

      <ul
        id={`${inputId}-rules`}
        style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "grid", gap: 9 }}
      >
        {rules.map((text, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 16,
              lineHeight: "20px",
            }}
          >
            <span className="ipw-box" data-on={met[i]} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.2L5 8.5L9.5 3.5"
                  stroke={lightText ? "#0a0a0a" : "#ffffff"}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span style={{ color: "color-mix(in oklab, currentColor 78%, transparent)" }}>
              {text}
            </span>
            <span
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
              }}
            >
              {met[i] ? " (done)" : " (not yet)"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
