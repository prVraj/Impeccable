/** Small building blocks shared by the component pages. */

export function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-20">
      <h2 className="mb-4 text-heading-24 text-balance">
        <a href={`#${id}`} className="hover:underline hover:decoration-[var(--line)] hover:underline-offset-4">
          {title}
        </a>
      </h2>
      {children}
    </section>
  );
}

export function Lede({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 max-w-prose text-copy-16 text-pretty text-[var(--muted)]">{children}</p>;
}

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-[var(--panel-2)] px-1.5 py-0.5 font-mono text-code-inline text-[var(--fg)]">{children}</code>
  );
}

export function PropsTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="card overflow-x-auto rounded-xl">
      <table className="w-full min-w-[520px] text-left text-copy-14">
        <thead className="text-label-14 text-[var(--muted)]">
          <tr className="border-b border-[var(--line)]">
            <th className="px-4 py-3 font-medium">Prop</th>
            <th className="px-4 py-3 font-medium">Default</th>
            <th className="px-4 py-3 font-medium">What it does</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, def, desc]) => (
            <tr key={name} className="border-b border-[var(--line)] align-top last:border-0">
              <td className="px-4 py-3">
                <code className="font-mono text-code-13 text-[var(--accent)]">{name}</code>
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-code-13 text-[var(--muted)]">{def}</code>
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageTitle({ name, description, tags }: { name: string; description: string; tags: string[] }) {
  return (
    <div className="mt-4">
      <h1 className="text-heading-32 text-balance sm:text-heading-40">{name}</h1>
      <p className="mt-4 max-w-2xl text-copy-16 text-pretty text-[var(--muted)] sm:text-copy-18">{description}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-label-12 text-[var(--muted)]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
