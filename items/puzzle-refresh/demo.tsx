"use client";

import { useRouter } from "next/navigation";
import { PageButton } from "@/components/site/page-button";
import { PuzzleRefresh, puzzleRefresh } from "./puzzle-refresh";

/**
 * The preview: one button that breaks this whole website into puzzle pieces.
 * The page refreshes while the pieces lie in a heap, then they fly back.
 * The reload keys (Cmd+R, Ctrl+R, F5) are live while this page is open.
 */
export function PuzzleRefreshDemo() {
  const router = useRouter();
  return (
    <>
      <PuzzleRefresh />
      <PageButton
        onClick={(e) =>
          void puzzleRefresh({ origin: e, refresh: () => router.refresh() })
        }
      >
        Puzzle this page
      </PageButton>
    </>
  );
}
