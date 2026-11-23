import type { Group } from "@/lib/site";
import { Book02Icon, GridIcon, Loading03Icon, MousePointerClickIcon, DashboardSquare01Icon, EaseCurveControlPointsIcon, Layout01Icon, SplinePointerIcon } from "./hugeicons";

/**
 * One Hugeicons icon (components/site/hugeicons.tsx) per part of the library,
 * shown on its heading in the side panel and on its rows in search. Items
 * inside a part have no icon of their own, so adding one needs nothing new.
 */
const GROUP_ICONS: Record<Group, typeof Book02Icon> = {
  components: DashboardSquare01Icon,
  buttons: MousePointerClickIcon,
  loaders: Loading03Icon,
  backgrounds: GridIcon,
  sections: Layout01Icon,
  skills: Book02Icon,
  animations: EaseCurveControlPointsIcon,
  interactions: SplinePointerIcon,
};

export function GroupIcon({ group, size = 16, className }: { group: Group; size?: number; className?: string }) {
  // Falls back to the Components icon so a group whose icon is missing (or still being saved) never crashes the page.
  const Icon = GROUP_ICONS[group] ?? DashboardSquare01Icon;
  return <Icon size={size} className={className ?? "shrink-0"} />;
}
