import Link from "next/link";
import { AUTHOR, COMPONENTS, GITHUB } from "@/lib/site";
import { Mark } from "./icons";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div>
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <Mark className="h-6 w-[21px]" />
            Impeccable
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            Animation-first React components, with code and prompts for your AI tool.
          </p>
          <p className="mt-6 text-xs text-[var(--faint)]">
            Built by{" "}
            <a href={AUTHOR.href} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--fg)]">
              {AUTHOR.name}
            </a>
            . MIT licensed.
          </p>
        </div>
        <FooterCol title="Components">
          {COMPONENTS.map((c) => (
            <Link key={c.slug} href={`/components/${c.slug}`} className="hover:text-[var(--fg)]">
              {c.name}
            </Link>
          ))}
        </FooterCol>
        <FooterCol title="Project">
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)]">
            GitHub
          </a>
          <a href={`${GITHUB}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)]">
            License
          </a>
          <a href={AUTHOR.href} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)]">
            Say hi on X
          </a>
        </FooterCol>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-[var(--fg)]">{title}</p>
      <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--muted)]">{children}</div>
    </div>
  );
}
