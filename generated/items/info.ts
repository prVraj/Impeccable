// Written by scripts/items.mjs from items/. Don't edit: it is rewritten on every dev and build.
import type { ItemInfo } from "@/lib/site";
import { info as textMirroring } from "@/items/text-mirroring/info";
import { info as burningToast } from "@/items/burning-toast/info";
import { info as brainTxt } from "@/items/brain-txt/info";
import { info as scratchMe } from "@/items/scratch-me/info";
import { info as passwordStrength } from "@/items/password-strength/info";
import { info as framedUpload } from "@/items/framed-upload/info";
import { info as taskProgress } from "@/items/task-progress/info";
import { info as infiniteCurlGallery } from "@/items/infinite-curl-gallery/info";
import { info as orreryGallery } from "@/items/orrery-gallery/info";
import { info as spindleGallery } from "@/items/spindle-gallery/info";
import { info as tumbleGallery } from "@/items/tumble-gallery/info";
import { info as sleeveCard } from "@/items/sleeve-card/info";
import { info as spotlightTicker } from "@/items/spotlight-ticker/info";
import { info as rollingClock } from "@/items/rolling-clock/info";
import { info as peekList } from "@/items/peek-list/info";
import { info as peekIndex } from "@/items/peek-index/info";
import { info as settleCounter } from "@/items/settle-counter/info";
import { info as intentSidebar } from "@/items/intent-sidebar/info";
import { info as peterTingleButton } from "@/items/peter-tingle-button/info";
import { info as venomButton } from "@/items/venom-button/info";
import { info as pixelButton } from "@/items/pixel-button/info";
import { info as asciiTideButton } from "@/items/ascii-tide-button/info";
import { info as glassShatterButton } from "@/items/glass-shatter-button/info";
import { info as peepholeButton } from "@/items/peephole-button/info";
import { info as cometButton } from "@/items/comet-button/info";
import { info as kitcutButton } from "@/items/kitcut-button/info";
import { info as tugOfWorkLoader } from "@/items/tug-of-work-loader/info";
import { info as liquidOrbitLoader } from "@/items/liquid-orbit-loader/info";
import { info as loupeGrid } from "@/items/loupe-grid/info";
import { info as isometricWall } from "@/items/isometric-wall/info";
import { info as loginPages } from "@/items/login-pages/info";
import { info as hexLogin } from "@/items/hex-login/info";
import { info as faqSections } from "@/items/faq-sections/info";
import { info as coffeeFaq } from "@/items/coffee-faq/info";
import { info as statsSections } from "@/items/stats-sections/info";
import { info as windowStats } from "@/items/window-stats/info";
import { info as reelStats } from "@/items/reel-stats/info";
import { info as testimonialSections } from "@/items/testimonial-sections/info";
import { info as capsuleTestimonials } from "@/items/capsule-testimonials/info";
import { info as chainTestimonials } from "@/items/chain-testimonials/info";
import { info as featureSections } from "@/items/feature-sections/info";
import { info as deckFeatures } from "@/items/deck-features/info";
import { info as blackHoleRefresh } from "@/items/black-hole-refresh/info";
import { info as puzzleRefresh } from "@/items/puzzle-refresh/info";
import { info as agentDraw } from "@/items/agent-draw/info";
import { info as burningScreen } from "@/items/burning-screen/info";
import { info as tileFlipImage } from "@/items/tile-flip-image/info";
import { info as uiTongue } from "@/items/ui-tongue/info";
import { info as healthCheck } from "@/items/health-check/info";
import { info as clickPop } from "@/items/click-pop/info";
import { info as cubeFlipImage } from "@/items/cube-flip-image/info";

export const INFO: Record<string, ItemInfo> = {
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
  "tumble-gallery": tumbleGallery,
  "sleeve-card": sleeveCard,
  "spotlight-ticker": spotlightTicker,
  "rolling-clock": rollingClock,
  "peek-list": peekList,
  "peek-index": peekIndex,
  "settle-counter": settleCounter,
  "intent-sidebar": intentSidebar,
  "peter-tingle-button": peterTingleButton,
  "venom-button": venomButton,
  "pixel-button": pixelButton,
  "ascii-tide-button": asciiTideButton,
  "glass-shatter-button": glassShatterButton,
  "peephole-button": peepholeButton,
  "comet-button": cometButton,
  "kitcut-button": kitcutButton,
  "tug-of-work-loader": tugOfWorkLoader,
  "liquid-orbit-loader": liquidOrbitLoader,
  "loupe-grid": loupeGrid,
  "isometric-wall": isometricWall,
  "login-pages": loginPages,
  "hex-login": hexLogin,
  "faq-sections": faqSections,
  "coffee-faq": coffeeFaq,
  "stats-sections": statsSections,
  "window-stats": windowStats,
  "reel-stats": reelStats,
  "testimonial-sections": testimonialSections,
  "capsule-testimonials": capsuleTestimonials,
  "chain-testimonials": chainTestimonials,
  "feature-sections": featureSections,
  "deck-features": deckFeatures,
  "black-hole-refresh": blackHoleRefresh,
  "puzzle-refresh": puzzleRefresh,
  "agent-draw": agentDraw,
  "burning-screen": burningScreen,
  "tile-flip-image": tileFlipImage,
  "ui-tongue": uiTongue,
  "health-check": healthCheck,
  "click-pop": clickPop,
  "cube-flip-image": cubeFlipImage,
};
