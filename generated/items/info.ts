// Written by scripts/items.mjs from items/. Don't edit: it is rewritten on every dev and build.
import type { ItemInfo } from "@/lib/site";
import { info as textMirroring } from "@/items/text-mirroring/info";
import { info as burningToast } from "@/items/burning-toast/info";
import { info as brainTxt } from "@/items/brain-txt/info";
import { info as scratchMe } from "@/items/scratch-me/info";
import { info as passwordStrength } from "@/items/password-strength/info";
import { info as framedUpload } from "@/items/framed-upload/info";
import { info as peterTingleButton } from "@/items/peter-tingle-button/info";
import { info as venomButton } from "@/items/venom-button/info";
import { info as pixelButton } from "@/items/pixel-button/info";
import { info as asciiTideButton } from "@/items/ascii-tide-button/info";
import { info as glassShatterButton } from "@/items/glass-shatter-button/info";
import { info as peepholeButton } from "@/items/peephole-button/info";
import { info as tugOfWorkLoader } from "@/items/tug-of-work-loader/info";
import { info as loginPages } from "@/items/login-pages/info";
import { info as hexLogin } from "@/items/hex-login/info";
import { info as blackHoleRefresh } from "@/items/black-hole-refresh/info";
import { info as agentDraw } from "@/items/agent-draw/info";
import { info as burningScreen } from "@/items/burning-screen/info";
import { info as uiTongue } from "@/items/ui-tongue/info";

export const INFO: Record<string, ItemInfo> = {
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
  "login-pages": loginPages,
  "hex-login": hexLogin,
  "black-hole-refresh": blackHoleRefresh,
  "agent-draw": agentDraw,
  "burning-screen": burningScreen,
  "ui-tongue": uiTongue,
};
