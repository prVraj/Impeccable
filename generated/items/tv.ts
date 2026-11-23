// Written by scripts/items.mjs from items/. Don't edit: it is rewritten on every dev and build.
import { lazy, type ComponentType } from "react";

// Each channel loads only when the iMac tunes to it, so the home page doesn't download every
// item up front (that made it heavy and slow to wake up, and caused hydration error #418).
type Channel = ComponentType<{ onReplay: () => void }>;

export const TV: Record<string, Channel> = {
  "text-mirroring": lazy(() => import("@/items/text-mirroring/tv")),
  "burning-toast": lazy(() => import("@/items/burning-toast/tv")),
  "brain-txt": lazy(() => import("@/items/brain-txt/tv")),
  "scratch-me": lazy(() => import("@/items/scratch-me/tv")),
  "password-strength": lazy(() => import("@/items/password-strength/tv")),
  "framed-upload": lazy(() => import("@/items/framed-upload/tv")),
  "task-progress": lazy(() => import("@/items/task-progress/tv")),
  "infinite-curl-gallery": lazy(() => import("@/items/infinite-curl-gallery/tv")),
  "orrery-gallery": lazy(() => import("@/items/orrery-gallery/tv")),
  "spindle-gallery": lazy(() => import("@/items/spindle-gallery/tv")),
  "tumble-gallery": lazy(() => import("@/items/tumble-gallery/tv")),
  "sleeve-card": lazy(() => import("@/items/sleeve-card/tv")),
  "spotlight-ticker": lazy(() => import("@/items/spotlight-ticker/tv")),
  "rolling-clock": lazy(() => import("@/items/rolling-clock/tv")),
  "peter-tingle-button": lazy(() => import("@/items/peter-tingle-button/tv")),
  "venom-button": lazy(() => import("@/items/venom-button/tv")),
  "pixel-button": lazy(() => import("@/items/pixel-button/tv")),
  "ascii-tide-button": lazy(() => import("@/items/ascii-tide-button/tv")),
  "glass-shatter-button": lazy(() => import("@/items/glass-shatter-button/tv")),
  "peephole-button": lazy(() => import("@/items/peephole-button/tv")),
  "comet-button": lazy(() => import("@/items/comet-button/tv")),
  "kitcut-button": lazy(() => import("@/items/kitcut-button/tv")),
  "tug-of-work-loader": lazy(() => import("@/items/tug-of-work-loader/tv")),
  "loupe-grid": lazy(() => import("@/items/loupe-grid/tv")),
  "isometric-wall": lazy(() => import("@/items/isometric-wall/tv")),
  "hex-login": lazy(() => import("@/items/hex-login/tv")),
  "coffee-faq": lazy(() => import("@/items/coffee-faq/tv")),
  "window-stats": lazy(() => import("@/items/window-stats/tv")),
  "reel-stats": lazy(() => import("@/items/reel-stats/tv")),
  "capsule-testimonials": lazy(() => import("@/items/capsule-testimonials/tv")),
  "deck-features": lazy(() => import("@/items/deck-features/tv")),
  "black-hole-refresh": lazy(() => import("@/items/black-hole-refresh/tv")),
  "agent-draw": lazy(() => import("@/items/agent-draw/tv")),
  "burning-screen": lazy(() => import("@/items/burning-screen/tv")),
};
