export function Html({ html }: { html: string }) {
  return <div className="[&_pre]:font-mono" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function PromptBody({ text }: { text: string }) {
  return <pre className="font-mono text-[12.5px] whitespace-pre-wrap text-[var(--fg)]">{text}</pre>;
}
