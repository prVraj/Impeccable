"use client";

import { useRef } from "react";
import { Button } from "./button";
import { Arrow } from "./icons";

/**
 * The "Browse components" button (home hero and 404 page), with a click sound.
 * It opens /components, the list of everything in the library, newest first.
 *
 * The sound is made right in the browser with the Web Audio API: a crisp tap
 * on top of a quick falling "tock". There is no sound file, so nothing is
 * downloaded with the page and the very first click already has sound.
 *
 * - Every click plays its own copy, so fast repeat clicks never cut each other off.
 * - Mouse: plays on press, so the sound lands with the finger.
 * - Touch and keyboard (Enter): plays on the tap or key itself, because
 *   phones only allow sound from a finished tap.
 * - Safari (and some others) don't count the press itself as permission to make sound, only
 *   the finished click. So if the sound couldn't start on the press, the click plays it.
 *   It never plays twice: once the sound is allowed, the press alone plays it.
 * - If the browser blocks sound, the button just works silently.
 *
 * Keep this sound. The click on Browse components is part of the site (vrajsensei); never
 * drop it when changing this button, its link or the Button component.
 */
const LOUDNESS = 1; // 0 to 1. At 1 the click peaks just under full volume (no crackle).

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function getContext() {
  if (ctx) return ctx;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  // 12 ms of white noise for the crisp tap at the start of the click.
  noise = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.012), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

let waiting = false; // asked the browser to allow sound, and the click plays once it says yes

function playClick() {
  try {
    const ac = getContext();
    if (!ac || !noise) return;
    if (ac.state === "running") return tock(ac);
    // Sound isn't allowed yet: ask, and play the moment it is. Asking again from a click
    // (which every browser accepts) unlocks the same wait, so it still plays only once.
    if (waiting) return void ac.resume().catch(() => {});
    waiting = true;
    ac.resume()
      .then(() => tock(ac))
      .catch(() => {})
      .finally(() => (waiting = false));
  } catch {
    // No sound support: the button still works.
  }
}

/** The click itself: a falling "tock" with a crisp tap on top. */
function tock(ac: AudioContext) {
  try {
    if (!noise) return;
    const t = ac.currentTime + 0.005;

    const out = ac.createGain();
    out.gain.value = LOUDNESS;
    out.connect(ac.destination);

    // Body: a quick falling tone, the "tock".
    const tone = ac.createOscillator();
    tone.type = "triangle";
    tone.frequency.setValueAtTime(1100, t);
    tone.frequency.exponentialRampToValueAtTime(380, t + 0.07);
    const toneGain = ac.createGain();
    toneGain.gain.setValueAtTime(0.0001, t);
    toneGain.gain.exponentialRampToValueAtTime(1, t + 0.003);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    tone.connect(toneGain).connect(out);
    tone.start(t);
    tone.stop(t + 0.15);
    tone.onended = () => out.disconnect();

    // Tap: a tiny burst of filtered noise, the crisp edge.
    const tap = ac.createBufferSource();
    tap.buffer = noise;
    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3200;
    band.Q.value = 0.9;
    const tapGain = ac.createGain();
    tapGain.gain.setValueAtTime(1, t);
    tapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
    tap.connect(band).connect(tapGain).connect(out);
    tap.start(t);
  } catch {
    // No sound support: the button still works.
  }
}

export function BrowseButton() {
  // How the last press started, so a mouse click doesn't play twice
  // (once on press, once on click).
  const lastPointer = useRef("");
  return (
    <Button
      href="/components"
      size="lg"
      trailing={<Arrow />}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType;
        if (e.pointerType === "mouse" && e.button === 0) playClick();
      }}
      // Touch taps and Enter on the keyboard (detail 0) play here, and a mouse click
      // whose press wasn't allowed to make sound (Safari).
      onClick={(e) => {
        if (e.detail === 0 || lastPointer.current !== "mouse" || ctx?.state !== "running") playClick();
      }}
    >
      Browse components
    </Button>
  );
}
