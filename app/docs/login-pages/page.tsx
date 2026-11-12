import type { Metadata } from "next";
import Link from "next/link";
import { DocsLayout } from "@/components/site/docs-layout";
import { PageTitle } from "@/components/site/doc-parts";
import { HexLoginThumb } from "@/components/site/hex-login-demo";
import { Arrow } from "@/components/site/icons";
import { familyMembers } from "@/lib/site";

const DESCRIPTION =
  "Every login page in the library, side by side. Pick the one that fits your product, then open it to try it, install it or blend it in.";

export const metadata: Metadata = {
  title: "Login pages · Impeccable",
  description: DESCRIPTION,
};

/** A live thumbnail for each login page. Add one here when a new login page joins the family. */
const THUMBS: Record<string, React.ReactNode> = {
  "hex-login": <HexLoginThumb />,
};

export default function LoginPagesPage() {
  const pages = familyMembers("login-pages");
  return (
    <DocsLayout slug="login-pages" sections={[{ id: "all", title: "All login pages" }]}>
      <PageTitle name="Login pages" description={DESCRIPTION} tags={[`${pages.length} ${pages.length === 1 ? "page" : "pages"}`, "Light + dark", "Mobile"]} />

      <section id="all" className="mt-10 scroll-mt-20">
        <h2 className="sr-only">All login pages</h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {pages.map((p) => (
            <li key={p.slug}>
              {/* The thumbnail is a real page (with its own links and form), so it sits beside the link,
                  not inside it; the link's ::after covers the whole card. */}
              <div className="card press group relative overflow-hidden rounded-2xl">
                <div className="border-b border-[var(--line)]">{THUMBS[p.slug]}</div>
                <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                  <span className="min-w-0">
                    <Link href={`/docs/${p.slug}`} className="block text-sm font-medium after:absolute after:inset-0 after:rounded-2xl">
                      {p.name}
                    </Link>
                    <span className="mt-0.5 block text-[13px] leading-snug text-[var(--muted)]">{p.blurb}</span>
                  </span>
                  <Arrow className="mt-0.5 size-4 shrink-0 text-[var(--faint)] transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[13px] text-[var(--muted)]">More login pages are on the way. Each new one shows up here.</p>
      </section>
    </DocsLayout>
  );
}
