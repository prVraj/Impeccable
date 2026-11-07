/** Small building blocks shared by the component pages. */

export function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-20">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">
        <a href={`#${id}`} className="hover:underline hover:decoration-[var(--line)] hover:underline-offset-4">
          {title}
        </a>
      </h2>
      {children}
    </section>
  );
}

export function Lede({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[15px] leading-relaxed text-[var(--muted)]">{children}</p>;
}

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-[var(--panel-2)] px-1.5 py-0.5 font-mono text-[12.5px] text-[var(--fg)]">{children}</code>
  );
}

export function PropsTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="card overflow-x-auto rounded-xl">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="text-xs text-[var(--muted)]">
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
                <code className="font-mono text-[12.5px] text-[var(--accent)]">{name}</code>
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-[12.5px] text-[var(--muted)]">{def}</code>
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
      <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">{name}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">{description}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-xs text-[var(--muted)]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
