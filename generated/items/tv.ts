// Written by scripts/items.mjs from items/. Don't edit: it is rewritten on every dev and build.
import type { ComponentType } from "react";
import burningToast from "@/items/burning-toast/tv";
import brainTxt from "@/items/brain-txt/tv";
import scratchMe from "@/items/scratch-me/tv";
import passwordStrength from "@/items/password-strength/tv";
import framedUpload from "@/items/framed-upload/tv";
import hexLogin from "@/items/hex-login/tv";
import agentDraw from "@/items/agent-draw/tv";
import burningScreen from "@/items/burning-screen/tv";

export const TV: Record<string, ComponentType<{ onReplay: () => void }>> = {
  "burning-toast": burningToast,
  "brain-txt": brainTxt,
  "scratch-me": scratchMe,
  "password-strength": passwordStrength,
  "framed-upload": framedUpload,
  "hex-login": hexLogin,
  "agent-draw": agentDraw,
  "burning-screen": burningScreen,
};
