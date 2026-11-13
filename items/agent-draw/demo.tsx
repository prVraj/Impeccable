"use client";

import { PageButton } from "@/components/site/page-button";
import { redrawPage } from "@/components/site/page-redraw";

/** The preview: one button that reloads this whole page and lets the agents draw it back. */
export function AgentDrawDemo() {
  return <PageButton onClick={() => redrawPage()}>Redraw this page</PageButton>;
}
