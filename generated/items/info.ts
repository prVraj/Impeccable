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
import { info as pixelTremorButton } from "@/items/pixel-tremor-button/info";
import { info as asciiTideButton } from "@/items/ascii-tide-button/info";
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
  "pixel-tremor-button": pixelTremorButton,
  "ascii-tide-button": asciiTideButton,
  "login-pages": loginPages,
  "hex-login": hexLogin,
  "black-hole-refresh": blackHoleRefresh,
  "agent-draw": agentDraw,
  "burning-screen": burningScreen,
  "ui-tongue": uiTongue,
};
