"use client";

/**
 * Framed-Upload, from Impeccable.
 *
 * An image upload that hangs whatever you pick inside a picture frame: a bevelled
 * moulding, the picture window right inside it with an inner shadow, and a soft,
 * layered shadow on the wall. Click or drop an image in; it settles into the frame. Replace and Remove sit in the corner once it's filled.
 *
 * The frame's corners come from your `--radius-lg` design token (8px only as a
 * fallback), or from the `radius` prop. The moulding is white on a light page and
 * graphite on a dark one, read from the text color around the frame.
 *
 * No packages. Icons are from Hugeicons (free set, MIT, hugeicons.com), copied in as SVG.
 */

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from "react";

export type FramedUploadLabels = {
  /** Shown in the empty frame while a file is dragged over it. */
  drop?: ReactNode;
  /** Name of the Replace button (screen readers and tooltip). */
  replace?: string;
  /** Name of the Remove button (screen readers and tooltip). */
  remove?: string;
  /** Shown for 3 seconds when the file isn't an accepted image. */
  typeError?: ReactNode;
  /** Shown for 3 seconds when the file is bigger than `maxSize`. */
  sizeError?: ReactNode;
};

export type FramedUploadProps = {
  /** An image to show before anything is picked, like a current avatar or cover. */
  defaultSrc?: string | null;
  /** Called with the picked file, or null after Remove. */
  onChange?: (file: File | null) => void;
  /** Alt text for the image in the frame. */
  alt?: string;
  /** Which files to take, like the `accept` of a file input. Always images. */
  accept?: string;
  /** Largest file in bytes. Default 10 MB. */
  maxSize?: number;
  /** Shape of the empty frame, as a CSS aspect-ratio. Default portrait, like a poster. */
  aspectRatio?: string;
  /** Reshape the frame to each picture's own shape, so nothing is cropped. Off: every picture is cropped to `aspectRatio`. */
  fitToImage?: boolean;
  /** Corner radius of the frame. Any CSS length or var(--…). Default: your `--radius-lg` token. */
  radius?: string;
  /** Moulding color. Any CSS color or var(--…). Default: white on a light page, graphite on a dark one. */
  frameColor?: string;
  /** Big line in the empty frame. */
  title?: ReactNode;
  /** Small line under it. Default names the size limit. */
  hint?: ReactNode;
  /** The other short texts. */
  labels?: FramedUploadLabels;
  /** Form field name, so the picked file is sent with a normal form. */
  name?: string;
  className?: string;
  style?: CSSProperties;
};

/* ---------- the design: keep as written ---------- */

const EASE = "cubic-bezier(.23,1,.32,1)"; // fast start, soft landing
const SETTLE_MS = 560; // the image settling into the frame
const HANG_MS = 620; // the frame's small swing when an image lands
const LIFT_PX = 3; // the frame lifts this much while a file is over it
const NOTE_MS = 3200; // how long an error note stays
const RESHAPE_MS = 420; // the frame easing into a new picture's shape
const MIN_RATIO = 1 / 3; // the tallest frame (width / height)
const MAX_RATIO = 3; // the widest frame; pictures beyond these are cropped a little

/** Frame corners: your design token first, this size only if the token is missing. */
const DEFAULT_RADIUS = "var(--radius-lg, 0.5rem)";

/** The frame's proportions, as a share of its width (cqi), so it looks the same at any size. */
const MOULDING = "5.5cqi"; // the frame itself

/* Corners follow one rule: inner radius = outer radius - the padding between them.
   frame: --ifu-radius
   photo: frame - moulding
   Never below 0, so at normal sizes the inner corners come out square, like a real frame. */

/** Moulding color and the empty window behind the picture, light page and dark page. */
const WOOD = {
  light: {
    frame: "#ffffff",
    back: "#f2f2f0",
    bevel: "inset 0 0 0 1px rgba(0,0,0,.07), inset 0 1.5px 0 rgba(255,255,255,.95), inset 0 -1.5px 0 rgba(0,0,0,.07)",
  },
  dark: {
    frame: "#2a2a2f",
    back: "#1d1d21",
    bevel: "inset 0 0 0 1px rgba(255,255,255,.07), inset 0 1px 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(0,0,0,.5)",
  },
};

/** A frame on a wall: a tight contact shadow plus a wide, soft one that falls downward. */
const SHADOW = {
  light: {
    rest: "0 1px 1px rgba(0,0,0,.08), 0 3px 6px -2px rgba(0,0,0,.10), 0 12px 20px -10px rgba(0,0,0,.22), 0 24px 40px -20px rgba(0,0,0,.20)",
    lift: "0 2px 2px rgba(0,0,0,.06), 0 6px 10px -3px rgba(0,0,0,.10), 0 18px 28px -12px rgba(0,0,0,.24), 0 34px 56px -24px rgba(0,0,0,.22)",
  },
  dark: {
    rest: "0 1px 1px rgba(0,0,0,.5), 0 3px 6px -2px rgba(0,0,0,.5), 0 14px 24px -10px rgba(0,0,0,.7), 0 28px 48px -20px rgba(0,0,0,.6)",
    lift: "0 2px 2px rgba(0,0,0,.45), 0 6px 12px -3px rgba(0,0,0,.5), 0 20px 32px -12px rgba(0,0,0,.72), 0 38px 60px -24px rgba(0,0,0,.62)",
  },
};

const CSS = `
.ifu { container-type: inline-size; --ifu-soft: color-mix(in oklab, currentColor 55%, transparent); }
.ifu-frame { position: relative; box-sizing: border-box; padding: ${MOULDING}; border-radius: var(--ifu-radius); background: var(--ifu-color) linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.04)); box-shadow: var(--ifu-bevel), var(--ifu-shadow); transition: transform .26s ${EASE}, box-shadow .26s ${EASE}; }
.ifu-frame[data-drag="true"] { transform: translateY(-${LIFT_PX}px); box-shadow: var(--ifu-bevel), var(--ifu-shadow-lift); }
.ifu-pic { position: relative; overflow: hidden; container-type: inline-size; transition: aspect-ratio ${RESHAPE_MS}ms ${EASE}; border-radius: max(0px, calc(var(--ifu-radius) - ${MOULDING})); background: color-mix(in oklab, currentColor 3%, var(--ifu-back)); }
.ifu-pic::after { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; border-radius: inherit; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12), inset 0 3px 7px -1px rgba(0,0,0,.32), inset 0 -1px 2px rgba(255,255,255,.18); }
.ifu-empty { all: unset; box-sizing: border-box; border-radius: inherit; position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 12px; text-align: center; cursor: pointer; background: transparent; transition: background-color .2s ${EASE}; -webkit-tap-highlight-color: transparent; }
.ifu-empty:hover, .ifu-frame[data-drag="true"] .ifu-empty { background: color-mix(in oklab, currentColor 4%, transparent); }
.ifu-empty:focus-visible { box-shadow: inset 0 0 0 2px var(--ifu-soft); }
.ifu-icon { color: var(--ifu-soft); margin-bottom: 6px; transition: transform .3s ${EASE}; }
.ifu-frame[data-drag="true"] .ifu-icon { transform: translateY(-3px); }
.ifu-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; animation: ifu-in ${SETTLE_MS}ms ${EASE} both; }
@keyframes ifu-in { from { opacity: 0; transform: scale(1.06); filter: blur(10px); } }
.ifu-tools { position: absolute; right: 8px; bottom: 8px; z-index: 2; display: flex; gap: 2px; padding: 3px; border-radius: 999px; background: rgba(10,10,10,.55); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); opacity: 0; transform: translateY(4px); transition: opacity .2s ${EASE}, transform .2s ${EASE}; }
.ifu-frame:hover .ifu-tools, .ifu-frame:focus-within .ifu-tools { opacity: 1; transform: none; }
@media (hover: none) { .ifu-tools { opacity: 1; transform: none; } }
.ifu-tool { all: unset; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 999px; color: #fff; cursor: pointer; transition: background-color .15s, transform .15s ${EASE}; -webkit-tap-highlight-color: transparent; }
.ifu-tool:hover { background: rgba(255,255,255,.16); }
.ifu-tool:active { transform: scale(.92); }
.ifu-tool:focus-visible { box-shadow: 0 0 0 2px rgba(255,255,255,.8); }
.ifu-note { position: absolute; left: 50%; bottom: 10px; z-index: 3; max-width: calc(100% - 24px); box-sizing: border-box; padding: 6px 12px; border-radius: 999px; background: rgba(10,10,10,.72); color: #fff; font-size: 13px; line-height: 18px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; animation: ifu-note .26s ${EASE} both; transform: translateX(-50%); }
@keyframes ifu-note { from { opacity: 0; transform: translate(-50%, 6px); } }
.ifu-title { font-size: 15px; font-weight: 500; line-height: 20px; text-wrap: balance; }
.ifu-hint { font-size: 13px; line-height: 18px; color: var(--ifu-soft); text-wrap: balance; }
/* Small frames: shorter text, smaller buttons. */
@container (max-width: 180px) {
  .ifu-title { font-size: 13px; line-height: 17px; }
  .ifu-hint { display: none; }
  .ifu-icon { width: 22px; height: 22px; margin-bottom: 2px; }
  .ifu-tools { right: 6px; bottom: 6px; }
  .ifu-tool { width: 24px; height: 24px; }
  .ifu-tool svg { width: 14px; height: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .ifu-frame, .ifu-icon, .ifu-tools { transition: opacity .15s, background-color .15s, box-shadow .15s; }
  .ifu-frame[data-drag="true"], .ifu-frame[data-drag="true"] .ifu-icon { transform: none; }
  .ifu-pic { transition: none; }
  .ifu-img { animation-name: ifu-fade; }
  @keyframes ifu-fade { from { opacity: 0; } }
  .ifu-note { animation: none; }
}`;

/** True when the text around the frame is light (dark mode), read from the color itself. */
function useLightText(ref: React.RefObject<HTMLElement | null>) {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const read = () => {
      const c = ref.current && getComputedStyle(ref.current).color.match(/[\d.]+/g);
      if (!c) return;
      const [r, g, b] = c.map(Number);
      setLight(0.299 * r + 0.587 * g + 0.114 * b > 140);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", read);
    };
  }, [ref]);
  return light;
}

/** Does the file match an `accept` list like "image/*" or "image/png,.webp"? Always images only. */
function accepts(file: File, accept: string) {
  if (!file.type.startsWith("image/")) return false;
  const name = file.name.toLowerCase();
  return accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .some((t) => (t.startsWith(".") ? name.endsWith(t) : t.endsWith("/*") ? file.type.startsWith(t.slice(0, -1)) : file.type === t));
}

function formatSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${Math.round(mb * 10) / 10} MB` : `${Math.round(bytes / 1024)} KB`;
}

/* Hugeicons "image-upload", "arrow-reload-horizontal" and "delete-02" (free set, MIT). */
function UploadIcon() {
  return (
    <svg
      className="ifu-icon"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M15.5 17L14 15.5M21 16L18.5303 13.5303C18.1908 13.1908 17.7302 13 17.25 13C16.7698 13 16.3092 13.1908 15.9697 13.5303L14 15.5" />
      <path d="M12 2.5C7.77027 2.5 5.6554 2.5 4.25276 3.69797C4.05358 3.86808 3.86808 4.05358 3.69797 4.25276C2.5 5.6554 2.5 7.77027 2.5 12C2.5 16.2297 2.5 18.3446 3.69797 19.7472C3.86808 19.9464 4.05358 20.1319 4.25276 20.302C5.6554 21.5 7.77027 21.5 12 21.5C16.2297 21.5 18.3446 21.5 19.7472 20.302C19.9464 20.1319 20.1319 19.9464 20.302 19.7472C21.5 18.3446 21.5 16.2297 21.5 12" />
      <path d="M15.5 5.5C16.0898 4.89316 17.6597 2.5 18.5 2.5C19.3403 2.5 20.9102 4.89316 21.5 5.5M18.5 3V9.5" />
    </svg>
  );
}

function ReplaceIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 5.5H9.5C5.78672 5.5 3 8.18503 3 12" />
      <path d="M3.5 18.5H14.5C18.2133 18.5 21 15.815 21 12" />
      <path d="M18.5 3C18.5 3 21 4.84122 21 5.50002C21 6.15882 18.5 8 18.5 8" />
      <path d="M5.49998 16C5.49998 16 3.00001 17.8412 3 18.5C2.99999 19.1588 5.5 21 5.5 21" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18.8516 16.3743L19.5 6H4.5L5.14839 16.3743C5.315 19.0401 5.39831 20.373 6.26426 21.1865C7.13021 22 8.46571 22 11.1367 22H12.8633C15.5343 22 16.8698 22 17.7357 21.1865C18.6017 20.373 18.685 19.0401 18.8516 16.3743Z" />
      <path d="M16 6H21M16 6L15.3778 4.34082C15.0007 3.33524 14.8122 2.83245 14.4402 2.50292C14.3213 2.39765 14.1904 2.3069 14.0501 2.2326C13.6109 2 13.074 2 12 2C10.926 2 10.3891 2 9.9499 2.2326C9.8096 2.3069 9.67865 2.39765 9.55982 2.50292C9.18783 2.83245 8.99928 3.33524 8.62219 4.34082L8 6M16 6H8M3 6H8" />
      <path d="M9.5 11V17M14.5 11V17" />
    </svg>
  );
}

export function FramedUpload({
  defaultSrc = null,
  onChange,
  alt = "Uploaded image",
  accept = "image/*",
  maxSize = 10 * 1024 * 1024,
  aspectRatio = "4 / 5",
  fitToImage = true,
  radius = DEFAULT_RADIUS,
  frameColor,
  title = "Drop an image here",
  hint,
  labels,
  name,
  className,
  style,
}: FramedUploadProps) {
  const l = {
    drop: "Let go to frame it",
    replace: "Replace image",
    remove: "Remove image",
    typeError: "That file isn't an image.",
    sizeError: `That image is over ${formatSize(maxSize)}.`,
    ...labels,
  };
  const inputId = `ifu-${useId()}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ownUrl = useRef<string | null>(null); // the object URL we made, so we can free it
  const [src, setSrc] = useState<string | null>(defaultSrc);
  const [ratio, setRatio] = useState<number | null>(null); // the picture's own width / height
  const swingNext = useRef(false); // swing once the picked picture has loaded
  const [drag, setDrag] = useState(false);
  const [note, setNote] = useState<{ id: number; text: ReactNode } | null>(null);
  const dark = useLightText(rootRef);
  const shadow = dark ? SHADOW.dark : SHADOW.light;
  const wood = dark ? WOOD.dark : WOOD.light;

  // Free the last object URL when the component goes away.
  useEffect(
    () => () => {
      if (ownUrl.current) URL.revokeObjectURL(ownUrl.current);
    },
    [],
  );

  // Error notes leave on their own.
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), NOTE_MS);
    return () => clearTimeout(t);
  }, [note]);

  /** The frame gives a small swing, like it was just hung. Skipped with reduced motion. */
  const hang = useCallback(() => {
    const el = frameRef.current;
    if (!el?.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate(
      [
        { transform: `translateY(-${LIFT_PX + 1}px) rotate(-0.5deg)` },
        { transform: "translateY(1px) rotate(0.2deg)", offset: 0.55 },
        { transform: "none" },
      ],
      { duration: HANG_MS, easing: EASE },
    );
  }, []);

  const take = (file: File | undefined, files?: FileList) => {
    if (!file) return;
    if (!accepts(file, accept)) return setNote({ id: Date.now(), text: l.typeError });
    if (file.size > maxSize) return setNote({ id: Date.now(), text: l.sizeError });
    // A dropped file goes into the hidden input too, so a normal form sends it.
    if (files && inputRef.current) {
      try {
        inputRef.current.files = files;
      } catch {
        /* older browsers: onChange still gets the file */
      }
    }
    if (ownUrl.current) URL.revokeObjectURL(ownUrl.current);
    const url = URL.createObjectURL(file);
    ownUrl.current = url;
    setNote(null);
    swingNext.current = true;
    setSrc(url);
    onChange?.(file);
  };

  const remove = () => {
    if (ownUrl.current) URL.revokeObjectURL(ownUrl.current);
    ownUrl.current = null;
    if (inputRef.current) inputRef.current.value = "";
    setSrc(null);
    setRatio(null);
    onChange?.(null);
  };

  const pick = () => inputRef.current?.click();

  const dragProps = {
    onDragEnter: (e: DragEvent) => {
      if (!e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      setDrag(true);
    },
    onDragOver: (e: DragEvent) => {
      if (!e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDrag(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setDrag(false);
      take(e.dataTransfer.files[0], e.dataTransfer.files);
    },
  };

  return (
    <div
      ref={rootRef}
      className={`ifu${className ? ` ${className}` : ""}`}
      style={
        {
          width: "100%",
          maxWidth: 320,
          "--ifu-radius": radius,
          "--ifu-color": frameColor ?? wood.frame,
          "--ifu-back": wood.back,
          "--ifu-bevel": wood.bevel,
          "--ifu-shadow": shadow.rest,
          "--ifu-shadow-lift": shadow.lift,
          ...style,
        } as CSSProperties
      }
    >
      <style>{CSS}</style>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        name={name}
        accept={accept}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, overflow: "hidden", clip: "rect(0 0 0 0)", pointerEvents: "none" }}
        onChange={(e) => take(e.target.files?.[0])}
      />
      <div ref={frameRef} className="ifu-frame" data-drag={drag} data-filled={!!src} {...dragProps}>
        <div className="ifu-pic" style={{ aspectRatio: fitToImage && src && ratio ? String(ratio) : aspectRatio }}>
          {src ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- a picked file is a blob: URL */}
              <img
                key={src}
                className="ifu-img"
                src={src}
                alt={alt}
                draggable={false}
                onLoad={(e) => {
                  const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                  if (w && h) setRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, w / h)));
                  if (swingNext.current) {
                    swingNext.current = false;
                    hang();
                  }
                }}
              />
              <div className="ifu-tools">
                <button type="button" className="ifu-tool" aria-label={l.replace} title={l.replace} onClick={pick}>
                  <ReplaceIcon />
                </button>
                <button type="button" className="ifu-tool" aria-label={l.remove} title={l.remove} onClick={remove}>
                  <RemoveIcon />
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="ifu-empty" onClick={pick} aria-describedby={`${inputId}-hint`}>
              <UploadIcon />
              <span className="ifu-title">{drag ? l.drop : title}</span>
              <span id={`${inputId}-hint`} className="ifu-hint">
                {hint ?? `or click to choose. Up to ${formatSize(maxSize)}.`}
              </span>
            </button>
          )}
          <span aria-live="polite">
            {note && (
              <span key={note.id} className="ifu-note">
                {note.text}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
