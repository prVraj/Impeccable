// Written by scripts/items.mjs from items/. Don't edit: it is rewritten on every dev and build.
import type { ComponentType } from "react";
import textMirroring from "@/items/text-mirroring/tv";
import burningToast from "@/items/burning-toast/tv";
import brainTxt from "@/items/brain-txt/tv";
import scratchMe from "@/items/scratch-me/tv";
import passwordStrength from "@/items/password-strength/tv";
import framedUpload from "@/items/framed-upload/tv";
import peterTingleButton from "@/items/peter-tingle-button/tv";
import venomButton from "@/items/venom-button/tv";
import pixelButton from "@/items/pixel-button/tv";
import asciiTideButton from "@/items/ascii-tide-button/tv";
import glassShatterButton from "@/items/glass-shatter-button/tv";
import peepholeButton from "@/items/peephole-button/tv";
import tugOfWorkLoader from "@/items/tug-of-work-loader/tv";
import hexLogin from "@/items/hex-login/tv";
import blackHoleRefresh from "@/items/black-hole-refresh/tv";
import agentDraw from "@/items/agent-draw/tv";
import burningScreen from "@/items/burning-screen/tv";

export const TV: Record<string, ComponentType<{ onReplay: () => void }>> = {
  "text-mirroring": textMirroring,
  "burning-toast": burningToast,
  "brain-txt": brainTxt,
  "scratch-me": scratchMe,
  "password-strength": passwordStrength,
  "framed-upload": framedUpload,
  "peter-tingle-button": peterTingleButton,
  "venom-button": venomButton,
  "pixel-button": pixelButton,
  "ascii-tide-button": asciiTideButton,
  "glass-shatter-button": glassShatterButton,
  "peephole-button": peepholeButton,
  "tug-of-work-loader": tugOfWorkLoader,
  "hex-login": hexLogin,
  "black-hole-refresh": blackHoleRefresh,
  "agent-draw": agentDraw,
  "burning-screen": burningScreen,
};
