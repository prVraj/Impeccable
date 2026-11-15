"use client";

import { Button } from "./button";
import { Arrow } from "./icons";

/**
 * The home page's "Browse components" button, with a soft click sound
 * (made with ElevenLabs, public/sounds/click.mp3, a few KB).
 *
 * Speed: the sound isn't fetched with the page. It loads the first time the
 * pointer comes near the button (hover or touch) or it gets keyboard focus,
 * and plays on press, so the click lands with the finger, not after it.
 * The page changes in place (no reload), so the sound plays on through it.
 * If the file is missing or the browser blocks sound, the button just works silently.
 */
const SRC = "/sounds/click.mp3";
const VOLUME = 0.45;

let sound: HTMLAudioElement | null = null;
const load = () => {
  if (sound || typeof Audio === "undefined") return;
  sound = new Audio(SRC);
  sound.preload = "auto";
  sound.volume = VOLUME;
};
const play = () => {
  load();
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
};

export function BrowseButton() {
  return (
    <Button
      href="/docs"
      size="lg"
      trailing={<Arrow />}
      onPointerEnter={load}
      onFocus={load}
      onPointerDown={(e) => e.button === 0 && play()}
      // Enter on the keyboard has no pointer press.
      onKeyDown={(e) => e.key === "Enter" && play()}
    >
      Browse components
    </Button>
  );
}
