"use client";

import { useState } from "react";
import { useBurningScreen } from "@/registry/impeccable/burning-screen/burning-screen";
import { currentTheme, setTheme } from "./theme-toggle";

const COLOR_FIELDS = [
  ["char", "Char"],
  ["glow", "Glow"],
  ["smoke", "Smoke"],
  ["ember", "Ash"],
] as const;

const DEFAULTS = { char: "#0a0a0a", glow: "#ffffff", smoke: "#737373", ember: "#8a8a8a" };

export function Playground() {
  const { burn } = useBurningScreen();
  const [duration, setDuration] = useState(2000);
  const [embers, setEmbers] = useState(true);
  const [emberDuration, setEmberDuration] = useState(1500);
  const [colors, setColors] = useState(DEFAULTS);

  const options = { duration, embers, emberDuration, colors };

  return (
    <div className="card rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={(e) =>
            burn(() => setTheme(currentTheme() === "dark" ? "light" : "dark"), { ...options, origin: e })
          }
          className="h-11 rounded-full bg-[var(--fg)] px-6 text-sm font-medium text-[var(--bg)] transition-transform active:scale-[0.98]"
        >
          Burn to the other theme
        </button>
        <a
          href="/demo/signup"
          className="inline-flex h-11 items-center rounded-full border border-[var(--line)] px-6 text-sm font-medium transition-colors hover:border-[var(--fg)]/40"
        >
          Try the sign-up flow
        </a>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Slider
          label="Duration"
          value={duration}
          min={600}
          max={4000}
          step={100}
          unit="ms"
          onChange={setDuration}
        />
        <Slider
          label="Ash time"
          value={emberDuration}
          min={300}
          max={4000}
          step={100}
          unit="ms"
          onChange={setEmberDuration}
          disabled={!embers}
        />
        <label className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--muted)]">Rising ash</span>
          <input
            type="checkbox"
            checked={embers}
            onChange={(e) => setEmbers(e.target.checked)}
            className="size-4 accent-[var(--fg)]"
          />
        </label>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--muted)]">Colors</span>
          <div className="flex items-center gap-2">
            {COLOR_FIELDS.map(([key, label]) => (
              <label key={key} title={label} className="relative">
                <span className="sr-only">{label}</span>
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => setColors((c) => ({ ...c, [key]: e.target.value }))}
                  className="size-7 cursor-pointer rounded-full border border-[var(--line)] bg-transparent p-0.5 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() => setColors(DEFAULTS)}
              className="ml-1 text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--fg)]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`block text-sm ${disabled ? "opacity-40" : ""}`}>
      <span className="flex justify-between text-[var(--muted)]">
        <span>{label}</span>
        <span className="font-mono text-xs tabular-nums text-[var(--fg)]">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--fg)]"
      />
    </label>
  );
}
