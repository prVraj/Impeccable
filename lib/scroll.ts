/**
 * Scroll the page to an element with an exponential ease-in-out.
 * The duration grows with the distance (by its square root), so a short hop
 * is quick and a long trip takes longer without ever feeling rushed.
 * A wheel, touch or key press hands control back to the reader at once.
 * `onDone` runs when the scroll ends, finished or interrupted.
 * People who ask for less motion get an instant jump.
 */
const MIN_MS = 350;
const MAX_MS = 1400;
const MS_PER_SQRT_PX = 16;

const easeInOutExpo = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2;

let cancelCurrent: (() => void) | null = null;

export function scrollToElement(el: HTMLElement, onDone?: () => void) {
  cancelCurrent?.();
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const from = window.scrollY;
  const to = Math.min(maxY, Math.max(0, el.getBoundingClientRect().top + from - margin));
  const distance = Math.abs(to - from);

  if (distance < 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, to);
    onDone?.();
    return;
  }

  const duration = Math.min(MAX_MS, Math.max(MIN_MS, MS_PER_SQRT_PX * Math.sqrt(distance)));
  const start = performance.now();
  let frame = 0;

  const stop = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
    cancelCurrent = null;
    onDone?.();
  };
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, from + (to - from) * easeInOutExpo(t));
    if (t < 1) frame = requestAnimationFrame(tick);
    else stop();
  };

  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", stop);
  cancelCurrent = stop;
  frame = requestAnimationFrame(tick);
}
