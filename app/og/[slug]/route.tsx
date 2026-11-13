import { ImageResponse } from "next/og";
import { COMPONENTS, FAMILIES, GROUPS } from "@/lib/site";
import { SITE } from "@/lib/seo";

/**
 * Social cards (the picture X, LinkedIn and Slack show for a shared link), 1200 x 630,
 * one template for every page: /og/home, /og/docs and /og/<item slug>.
 * Made once at build time. Text stays inside the middle 1000 x 500, because each
 * platform crops the edges a little differently.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

const ITEMS = [...FAMILIES, ...COMPONENTS];

export function generateStaticParams() {
  return [{ slug: "home" }, { slug: "docs" }, ...ITEMS.map((i) => ({ slug: i.slug }))];
}

// The logo mark from components/site/icons.tsx, in near-black.
const MARK =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 69 80"><defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="69" height="80"><path d="M34.5 0 69 20v40L34.5 80 0 60V20z" fill="#fff"/><g stroke="#000" stroke-width="1.5"><path d="M0-11.5 69 28.5M0-6 69 34M0-.5 69 39.5"/></g></mask></defs><path d="M34.5 0 69 20v40L34.5 80 0 60V20z" fill="#0a0a0a" mask="url(#m)"/></svg>',
  );

function card(slug: string) {
  if (slug === "home")
    return { label: "Free + MIT · React", name: "Animated React components with AI prompts", line: "Every piece comes with its code and two prompts, so your AI tool builds it the way it was meant to feel." };
  if (slug === "docs")
    return { label: "Docs", name: "Components, buttons, sections, animations and skills", line: "A live preview, TS + JS code, one install command and two prompts for each." };
  const i = ITEMS.find((x) => x.slug === slug)!;
  const group = GROUPS.find((g) => g.id === i.group)!.label;
  // "Buttons · Button" says the same thing twice, so the category only shows when it adds something.
  const cat = i.category && !group.toLowerCase().startsWith(i.category.toLowerCase()) ? i.category : "";
  return { label: [group, cat].filter(Boolean).join(" · "), name: i.name, line: i.blurb };
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = card(slug);
  const long = c.name.length > 24;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 100px",
          // Light on purpose (vrajsensei, 2026-11-13): white, black text and a soft light
          // purple look premium; dark with purple reads generic and AI-made.
          background: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 96% 0%, rgba(173,152,247,0.30), rgba(173,152,247,0) 42%), radial-gradient(circle at 0% 100%, rgba(207,195,251,0.22), rgba(207,195,251,0) 38%)",
          color: "#0a0a0a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MARK} width={36} height={42} alt="" />
          <div style={{ fontSize: 30, letterSpacing: "-0.02em" }}>{SITE.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 18px",
              borderRadius: 999,
              border: "1px solid #e4dcfd",
              background: "#f4f1fe",
              color: "#481de8",
              fontSize: 22,
            }}
          >
            {c.label}
          </div>
          <div style={{ fontSize: long ? 68 : 96, lineHeight: 1.02, letterSpacing: "-0.045em", maxWidth: 1000 }}>{c.name}</div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: "#52525b", maxWidth: 900 }}>{c.line}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#71717a" }}>
          <div>{SITE.url.replace("https://", "")}</div>
          <div>{`by ${SITE.author.alternateName}`}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
