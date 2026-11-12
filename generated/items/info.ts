// Written by scripts/items.mjs from items/. Don't edit: it is rewritten on every dev and build.
import type { ItemInfo } from "@/lib/site";
import { info as burningToast } from "@/items/burning-toast/info";
import { info as brainTxt } from "@/items/brain-txt/info";
import { info as scratchMe } from "@/items/scratch-me/info";
import { info as passwordStrength } from "@/items/password-strength/info";
import { info as framedUpload } from "@/items/framed-upload/info";
import { info as loginPages } from "@/items/login-pages/info";
import { info as hexLogin } from "@/items/hex-login/info";
import { info as agentDraw } from "@/items/agent-draw/info";
import { info as burningScreen } from "@/items/burning-screen/info";
import { info as uiTongue } from "@/items/ui-tongue/info";

export const INFO: Record<string, ItemInfo> = {
  "burning-toast": burningToast,
  "brain-txt": brainTxt,
  "scratch-me": scratchMe,
  "password-strength": passwordStrength,
  "framed-upload": framedUpload,
  "login-pages": loginPages,
  "hex-login": hexLogin,
  "agent-draw": agentDraw,
  "burning-screen": burningScreen,
  "ui-tongue": uiTongue,
};
