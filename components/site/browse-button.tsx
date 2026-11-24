import { Button } from "./button";
import { Arrow } from "./icons";

/**
 * The "Browse components" button (home hero and 404 page), with its click sound.
 * It opens /components, the list of everything in the library, newest first.
 *
 * The sound comes from components/site/cta-sound.tsx through `data-cta-sound`
 * (the same "tock" it always had, now shared with the other main CTAs).
 *
 * Keep this sound. The click on Browse components is part of the site (vrajsensei); never
 * drop `data-cta-sound` when changing this button, its link or the Button component.
 */
export function BrowseButton() {
  return (
    <Button href="/components" size="lg" trailing={<Arrow />} data-cta-sound>
      Browse components
    </Button>
  );
}
