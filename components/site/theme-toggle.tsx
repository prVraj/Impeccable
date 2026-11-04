"use client";

export function setTheme(next: "light" | "dark") {
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

export function currentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => setTheme(currentTheme() === "dark" ? "light" : "dark")}
      className="inline-flex h-8 items-center gap-2 rounded-full border border-[var(--line)] px-3 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
      aria-label="Toggle light and dark mode"
    >
      <span className="size-2.5 rounded-full bg-[var(--fg)]" />
      Theme
    </button>
  );
}

export const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;
