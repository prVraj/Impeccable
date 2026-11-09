import type { CSSProperties } from "react";

// The theme switch: a bulb hanging from the header's bottom line by its
// wire. An isometric line drawing (Hairline style, generated from a scene).
// Light mode: the glass is broken (top half left, jagged edge, filament bare).
// Dark mode: the bulb is whole and lit. The shards are the missing lower
// glass: they burst out when it breaks and fly back in when it mends.
// Styles live in app/globals.css under ".bulb".
export function Bulb({ className }: { className?: string }) {
  return (
    <svg viewBox="180 134.5 40 76" className={`bulb ${className ?? ""}`} aria-hidden="true">
      <g className="g-hang">
      <path className="sil bulb-glass glass-whole" d="M217 192.5L216.8 190.2L216.4 188.1L215.7 186.0L214.7 184.0L213.4 182.1L212.0 180.4L210.3 179.0L208.5 177.7L206.5 176.8L204.4 176.0L202.2 175.6L200 175.5L197.7 175.6L195.6 176.0L193.4 176.8L191.5 177.7L189.6 179.0L187.9 180.4L186.5 182.1L185.2 184.0L184.2 186.0L183.5 188.1L183.1 190.2L183 192.5L183.1 194.7L183.5 196.9L184.2 199.0L185.2 201.0L186.5 202.8L187.9 204.5L189.6 206L191.5 207.2L193.4 208.2L195.6 208.9L197.7 209.3L200 209.5L202.2 209.3L204.4 208.9L206.5 208.2L208.5 207.2L210.3 206L212.0 204.5L213.4 202.8L214.7 201.0L215.7 199.0L216.4 196.9L216.8 194.7Z"/>
      <path className="sil bulb-glass glass-broken" d="M183.6 196.9L183.2 195.2L183.0 193.4L183.0 191.6L183.2 189.8L183.6 188.1L184.1 186.4L184.9 184.8L185.7 183.2L186.8 181.8L188.0 180.5L189.3 179.3L190.7 178.2L192.3 177.4L193.9 176.6L195.6 176.1L197.3 175.7L199.1 175.5L200.9 175.5L202.7 175.7L204.4 176.1L206.1 176.6L207.7 177.4L209.3 178.2L210.7 179.3L212.0 180.5L213.2 181.8L214.3 183.2L215.1 184.8L215.9 186.4L216.4 188.1L216.8 189.8L217.0 191.6L217.0 193.4L216.8 195.2L216.4 196.9L216.4 196.9L211.0 192.5L207.5 199.0L203.0 193.5L198.5 200.5L194.5 194.0L189.5 198.5Z"/>
      <path className="sil bulb-glass shard" style={{ "--sx": "12.2px", "--sy": "11.1px", "--sr": "-40deg" } as CSSProperties} d="M216.4 196.9L211.0 192.5L212.0 204.5L216.4 196.9Z"/>
      <path className="sil bulb-glass shard" style={{ "--sx": "9.4px", "--sy": "14.2px", "--sr": "30deg" } as CSSProperties} d="M211.0 192.5L207.5 199.0L205.8 208.5L212.0 204.5Z"/>
      <path className="sil bulb-glass shard" style={{ "--sx": "4.5px", "--sy": "16.4px", "--sr": "-25deg" } as CSSProperties} d="M207.5 199.0L203.0 193.5L198.5 209.4L205.8 208.5Z"/>
      <path className="sil bulb-glass shard" style={{ "--sx": "-2.7px", "--sy": "16.8px", "--sr": "35deg" } as CSSProperties} d="M203.0 193.5L198.5 200.5L191.5 207.2L198.5 209.4Z"/>
      <path className="sil bulb-glass shard" style={{ "--sx": "-8.5px", "--sy": "14.8px", "--sr": "-30deg" } as CSSProperties} d="M198.5 200.5L194.5 194.0L186.1 202.3L191.5 207.2Z"/>
      <path className="sil bulb-glass shard" style={{ "--sx": "-11.8px", "--sy": "11.8px", "--sr": "45deg" } as CSSProperties} d="M194.5 194.0L189.5 198.5L183.6 196.9L186.1 202.3Z"/>
      <path className="nf lo filament" d="M197.8 177.7L197.8 189.0"/>
      <path className="nf lo filament" d="M202.2 177.7L202.2 189.0"/>
      <path className="nf lo filament" d="M197.8 189.0L194 194.2L197 189.9L200 194.2L203 189.9L206 194.2L202.2 189.0"/>
      <path className="nf lo" d="M194.8 181.4L193.3 182.2L191.9 183.2L190.7 184.4L189.7 185.8L188.9 187.3L188.2 188.9"/>
      <path className="sil" d="M193.5 174.3L193.9 173.0L195.4 172.0L197.5 171.3L200 171.0L202.4 171.3L204.6 172.0L206.0 173.0L206.5 174.3L206.0 175.5L204.6 178.3L203.5 179.1L201.9 179.6L200 179.8L198.0 179.6L196.4 179.1L195.3 178.3L193.9 175.5Z"/>
      <path className="sil" d="M193.0 161.5L193.0 160.7L193.4 160.0L194.1 159.4L195.0 158.8L196.1 158.4L197.4 158.0L198.9 157.8L200.3 157.8L201.8 157.9L203.1 158.2L204.4 158.6L205.4 159.1L206.2 159.7L206.7 160.4L206.9 161.1L206.9 174.1L206.9 174.8L206.5 175.5L205.8 176.2L204.9 176.8L203.8 177.2L202.5 177.5L201.1 177.7L199.6 177.8L198.1 177.7L196.8 177.4L195.5 177.0L194.5 176.5L193.7 175.9L193.2 175.2L193.0 174.5Z"/>
      <path className="nf sil" d="M200 161.3L200 153.5"/>
      </g>
      <g className="g-wire">
      <path className="nf sil wire" d="M200 153.5L200 134.4"/>
      </g>
    </svg>
  );
}
