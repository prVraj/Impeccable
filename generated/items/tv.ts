// Written by scripts/items.mjs from items/. Don't edit: it is rewritten on every dev and build.
import type { ComponentType } from "react";
import textMirroring from "@/items/text-mirroring/tv";
import burningToast from "@/items/burning-toast/tv";
import brainTxt from "@/items/brain-txt/tv";
import scratchMe from "@/items/scratch-me/tv";
import passwordStrength from "@/items/password-strength/tv";
import framedUpload from "@/items/framed-upload/tv";
import taskProgress from "@/items/task-progress/tv";
import infiniteCurlGallery from "@/items/infinite-curl-gallery/tv";
import orreryGallery from "@/items/orrery-gallery/tv";
import spindleGallery from "@/items/spindle-gallery/tv";
import peterTingleButton from "@/items/peter-tingle-button/tv";
import venomButton from "@/items/venom-button/tv";
import pixelButton from "@/items/pixel-button/tv";
import asciiTideButton from "@/items/ascii-tide-button/tv";
import glassShatterButton from "@/items/glass-shatter-button/tv";
import peepholeButton from "@/items/peephole-button/tv";
import tugOfWorkLoader from "@/items/tug-of-work-loader/tv";
import loupeGrid from "@/items/loupe-grid/tv";
import isometricWall from "@/items/isometric-wall/tv";
import hexLogin from "@/items/hex-login/tv";
import coffeeFaq from "@/items/coffee-faq/tv";
import windowStats from "@/items/window-stats/tv";
import reelStats from "@/items/reel-stats/tv";
import capsuleTestimonials from "@/items/capsule-testimonials/tv";
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
  "task-progress": taskProgress,
  "infinite-curl-gallery": infiniteCurlGallery,
  "orrery-gallery": orreryGallery,
  "spindle-gallery": spindleGallery,
  "peter-tingle-button": peterTingleButton,
  "venom-button": venomButton,
  "pixel-button": pixelButton,
  "ascii-tide-button": asciiTideButton,
  "glass-shatter-button": glassShatterButton,
  "peephole-button": peepholeButton,
  "tug-of-work-loader": tugOfWorkLoader,
  "loupe-grid": loupeGrid,
  "isometric-wall": isometricWall,
  "hex-login": hexLogin,
  "coffee-faq": coffeeFaq,
  "window-stats": windowStats,
  "reel-stats": reelStats,
  "capsule-testimonials": capsuleTestimonials,
  "black-hole-refresh": blackHoleRefresh,
  "agent-draw": agentDraw,
  "burning-screen": burningScreen,
};
