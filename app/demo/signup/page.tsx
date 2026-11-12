"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBurningScreen } from "@/items/burning-screen/burning-screen";

export default function SignupDemo() {
  const router = useRouter();
  const { burn } = useBurningScreen();

  useEffect(() => router.prefetch("/demo/welcome"), [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-4 text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <form
        className="w-full max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter;
          burn(() => router.push("/demo/welcome"), { origin: submitter });
        }}
      >
        <p className="text-center text-xs text-neutral-500">Impeccable demo</p>
        <h1 className="mt-2 text-center text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-center text-sm text-neutral-500">It takes a few seconds.</p>
        <div className="mt-8 space-y-3">
          <input
            type="email"
            placeholder="Email"
            defaultValue="you@studio.com"
            className="h-11 w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-neutral-600"
          />
          <input
            type="password"
            placeholder="Password"
            defaultValue="password"
            className="h-11 w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-neutral-600"
          />
          <button
            type="submit"
            className="h-11 w-full rounded-full bg-neutral-950 text-sm font-medium text-white transition-transform active:scale-[0.98] dark:bg-white dark:text-neutral-950"
          >
            Create account
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-neutral-500">
          <Link href="/docs/burning-screen" className="underline underline-offset-4">
            Back to docs
          </Link>
        </p>
      </form>
    </main>
  );
}
