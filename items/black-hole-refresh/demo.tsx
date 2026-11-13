"use client";

import { useRouter } from "next/navigation";
import { PageButton } from "@/components/site/page-button";
import { BlackHoleRefresh, blackHoleRefresh } from "./black-hole-refresh";

/**
 * The preview: one button that feeds this whole website to the black hole.
 * The page refreshes while the hole eats, then the blast throws it back.
 * The reload keys (Cmd+R, Ctrl+R, F5) are live while this page is open.
 */
export function BlackHoleRefreshDemo() {
  const router = useRouter();
  return (
    <>
      <BlackHoleRefresh />
      <PageButton
        onClick={() => void blackHoleRefresh({ refresh: () => router.refresh() })}
      >
        Consume this page
      </PageButton>
    </>
  );
}
