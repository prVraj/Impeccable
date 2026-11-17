// Written by scripts/items.mjs from items/. Don't edit: it is rewritten on every dev and build.
import type { ComponentType } from "react";
import { Thumb as hexLogin } from "@/items/hex-login/demo";
import { Thumb as coffeeFaq } from "@/items/coffee-faq/demo";
import { Thumb as windowStats } from "@/items/window-stats/demo";
import { Thumb as reelStats } from "@/items/reel-stats/demo";
import { Thumb as capsuleTestimonials } from "@/items/capsule-testimonials/demo";
import { Thumb as deckFeatures } from "@/items/deck-features/demo";

export const THUMBS: Record<string, ComponentType> = {
  "hex-login": hexLogin,
  "coffee-faq": coffeeFaq,
  "window-stats": windowStats,
  "reel-stats": reelStats,
  "capsule-testimonials": capsuleTestimonials,
  "deck-features": deckFeatures,
};
