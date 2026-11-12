// Written by scripts/items.mjs from items/. Don't edit: it is rewritten on every dev and build.
import type { ComponentType } from "react";
import { Thumb as hexLogin } from "@/items/hex-login/demo";

export const THUMBS: Record<string, ComponentType> = {
  "hex-login": hexLogin,
};
