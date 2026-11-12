"use client";

import { PasswordStrength } from "@/registry/impeccable/password-strength/password-strength";

export function PasswordStrengthDemo() {
  return (
    <div className="card grid place-items-center rounded-2xl px-5 py-12 text-[var(--fg)] @min-[40rem]:py-16">
      <PasswordStrength defaultValue="sunflower" />
    </div>
  );
}
