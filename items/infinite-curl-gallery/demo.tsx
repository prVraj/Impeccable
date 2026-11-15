"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { InfiniteCurlGallery, type CurlImage } from "./infinite-curl-gallery";

/** Photos and posters from Vraj's own work, shrunk to about 360px on the long side, 237KB for all 21 (public/infinite-curl-gallery). */
export const SAMPLE_IMAGES: CurlImage[] = [
  { src: "/infinite-curl-gallery/01.webp", alt: "A runner in white sneakers in warm orange light" },
  { src: "/infinite-curl-gallery/02.webp", alt: "A running shoe poster on a red track" },
  { src: "/infinite-curl-gallery/03.webp", alt: "An iced matcha poster in a dark green room" },
  { src: "/infinite-curl-gallery/04.webp", alt: "A matcha drink bursting out of a phone" },
  { src: "/infinite-curl-gallery/05.webp", alt: "A woman in red sipping a drink under a blue sky" },
  { src: "/infinite-curl-gallery/06.webp", alt: "A woman holding a pink cleanser among pink flowers" },
  { src: "/infinite-curl-gallery/07.webp", alt: "A cleanser ad seen in a car's side mirror" },
  { src: "/infinite-curl-gallery/08.webp", alt: "A woman reaching out of a phone for a pink bottle" },
  { src: "/infinite-curl-gallery/09.webp", alt: "A woman holding a perfume bottle in golden light" },
  { src: "/infinite-curl-gallery/10.webp", alt: "A perfume bottle in clear sea water" },
  { src: "/infinite-curl-gallery/11.webp", alt: "A green hill with one tree under a blue sky" },
  { src: "/infinite-curl-gallery/12.webp", alt: "A grandfather playing with two children on a rug" },
  { src: "/infinite-curl-gallery/13.webp", alt: "A mother and son cooking together" },
  { src: "/infinite-curl-gallery/14.webp", alt: "A man on the phone on a city balcony" },
  { src: "/infinite-curl-gallery/15.webp", alt: "Three friends talking on stone steps" },
  { src: "/infinite-curl-gallery/16.webp", alt: "A father reading with his daughter on a sofa" },
  { src: "/infinite-curl-gallery/17.webp", alt: "Two women chatting at a fruit stall" },
  { src: "/infinite-curl-gallery/18.webp", alt: "A woman buying from a market stall" },
  { src: "/infinite-curl-gallery/19.webp", alt: "Two hands reaching for each other in the sky" },
  { src: "/infinite-curl-gallery/20.webp", alt: "A girl and her grandmother talking at a table" },
  { src: "/infinite-curl-gallery/21.webp", alt: "A man and a woman sharing fruit at a market" },
];

const PILL =
  "card press inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-[var(--fg)] transition-[transform,box-shadow] hover:shadow-[0_0_0_1px_var(--faint)]";
const MAX_FILES = 40;
const MAX_BYTES = 15 * 1024 * 1024;

/**
 * The preview: the gallery on the dotted card, so you can see the edges fade into
 * the dots (a mask, not a color). Add your own photos with the pill or by dropping
 * them on the card; they stay in this tab only.
 */
export function InfiniteCurlGalleryDemo() {
  const [mine, setMine] = useState<{ src: string; alt: string }[]>([]);
  const [note, setNote] = useState("");
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  // Let go of the photos when the demo goes away.
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);
  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(""), 3200);
    return () => clearTimeout(t);
  }, [note]);

  const add = (files: FileList | null) => {
    if (!files?.length) return;
    const all = Array.from(files);
    const ok = all.filter((f) => f.type.startsWith("image/") && f.size <= MAX_BYTES).slice(0, MAX_FILES - mine.length);
    const skipped = all.length - ok.length;
    if (ok.length) {
      const added = ok.map((f) => {
        const src = URL.createObjectURL(f);
        urls.current.push(src);
        return { src, alt: f.name.replace(/\.[^.]+$/, "") };
      });
      setMine((m) => [...added, ...m].slice(0, MAX_FILES));
    }
    if (skipped) setNote(`Skipped ${skipped} ${skipped === 1 ? "file" : "files"}: pictures only, up to 15 MB, ${MAX_FILES} at most.`);
  };

  const clear = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    setMine([]);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    add(e.dataTransfer.files);
  };

  return (
    <div
      className="card dots relative h-[26rem] overflow-hidden rounded-2xl text-[var(--fg)] @min-[40rem]:h-[32rem]"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOver(false)}
      onDrop={onDrop}
    >
      <InfiniteCurlGallery
        images={mine.length ? mine : SAMPLE_IMAGES}
        aria-label={mine.length ? "Your photos" : "Sample photos"}
        className="absolute inset-0"
      />
      <div
        className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl text-sm font-medium transition-opacity duration-200"
        style={{ opacity: over ? 1 : 0, background: "color-mix(in oklab, var(--panel) 70%, transparent)" }}
        aria-hidden="true"
      >
        Drop your photos here
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4 @min-[40rem]:bottom-6">
        <p aria-live="polite" className="min-h-6 text-center text-xs">
          {note && <span className="card inline-block rounded-full px-3 py-1 text-[var(--muted)]">{note}</span>}
        </p>
        <div className="pointer-events-auto flex gap-2">
          <button type="button" className={PILL} onClick={() => input.current?.click()}>
            {mine.length ? "Add more" : "Add your photos"}
          </button>
          {mine.length > 0 && (
            <button type="button" className={PILL} onClick={clear}>
              Show samples
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            add(e.currentTarget.files);
            e.currentTarget.value = ""; // the same photo can be picked again
          }}
        />
      </div>
    </div>
  );
}
