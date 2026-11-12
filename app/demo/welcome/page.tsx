"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBurningScreen } from "@/items/burning-screen/burning-screen";

export default function WelcomeDemo() {
  const router = useRouter();
  const { burn } = useBurningScreen();

  useEffect(() => router.prefetch("/demo/signup"), [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4 text-white dark:bg-white dark:text-neutral-950">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs text-neutral-500">you@studio.com</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">You&apos;re in.</h1>
        <p className="mt-3 text-sm text-neutral-400 dark:text-neutral-500">
          Your account is ready. Everything starts here.
        </p>
        <button
          type="button"
          onClick={(e) => burn(() => router.push("/demo/signup"), { origin: e })}
          className="mt-8 h-11 w-full rounded-full bg-white text-sm font-medium text-neutral-950 transition-transform active:scale-[0.98] dark:bg-neutral-950 dark:text-white"
        >
          Delete account
        </button>
      </div>
    </main>
  );
}
