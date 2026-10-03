"use client";

import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { catchStars, displayName, dexType, rarity, taxonApiUrl, taxonUrl, TYPE_COLORS, type SpeciesCount } from "@/lib/dex";
import { Stars } from "./Pixels";

// Pointer → CSS vars for the foil glare, rainbow shift and tilt. The CSS ignores them under reduced motion.
function foil(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  const s = e.currentTarget.style;
  s.setProperty("--mx", `${x * 100}%`);
  s.setProperty("--my", `${y * 100}%`);
  s.setProperty("--px", `${x * 100}%`);
  s.setProperty("--py", `${y * 100}%`);
  s.setProperty("--rx", `${(0.5 - y) * 12}deg`);
  s.setProperty("--ry", `${(x - 0.5) * 12}deg`);
}
function unfoil(e: PointerEvent<HTMLElement>) {
  for (const v of ["--mx", "--my", "--px", "--py", "--rx", "--ry"]) e.currentTarget.style.removeProperty(v);
}

type Entry = { summary: string; lineage: { rank: string; name: string }[]; wikipedia: string | null };
type Ancestor = { rank: string; name: string; preferred_common_name?: string };

// The back of the card: iNaturalist's Wikipedia summary and the class/order/family line. One request, on first flip.
async function loadEntry(id: number): Promise<Entry> {
  const res = await fetch(taxonApiUrl(id));
  if (!res.ok) throw new Error(`iNaturalist ${res.status}`);
  const t = (await res.json()).results[0];
  return {
    // The summary arrives as HTML; parse it inert and keep only the text.
    summary: new DOMParser().parseFromString(t.wikipedia_summary ?? "", "text/html").body.textContent?.trim() ?? "",
    lineage: (t.ancestors as Ancestor[] ?? [])
      .filter((a) => ["class", "order", "family"].includes(a.rank))
      .map((a) => ({ rank: a.rank, name: a.preferred_common_name || a.name })),
    wikipedia: t.wikipedia_url ?? null,
  };
}

const label = "silk text-[15px] font-bold text-[var(--ink-soft)]";

export function DexCard({ sighting, no, caught, onToggleCaught }: {
  sighting: SpeciesCount;
  no: number;
  caught: boolean;
  onToggleCaught: () => void;
}) {
  const { taxon, count } = sighting;
  const name = displayName(taxon);
  const type = dexType(taxon.iconic_taxon_name);
  const tier = rarity(taxon.observations_count);
  const shiny = tier.tier === "Legendary" || tier.tier === "Rare";
  const photo = taxon.default_photo;
  const [flipped, setFlipped] = useState(false);
  const [entry, setEntry] = useState<Entry | "loading" | "error" | null>(null);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);

  function flip() {
    const next = !flipped;
    setFlipped(next);
    if (next && (entry === null || entry === "error")) {
      setEntry("loading");
      loadEntry(taxon.id).then(setEntry, () => setEntry("error"));
    }
    // Keep keyboard focus on the face that's showing.
    requestAnimationFrame(() => (next ? backButton : frontButton).current?.focus({ preventScroll: true }));
  }
  // Clicking anywhere on the card flips it, except on its own links and buttons.
  function cardClick(e: MouseEvent<HTMLElement>) {
    if (!(e.target as HTMLElement).closest("a, button") && !getSelection()?.toString()) flip();
  }

  const nameStrip = (
    <h3 className="strip flex items-baseline gap-3 px-3 py-1.5 text-[22px] leading-tight">
      <span className="silk text-[15px] font-bold tabular-nums">No.{String(no).padStart(3, "0")}</span>
      <span className={`min-w-0 truncate ${taxon.preferred_common_name ? "capitalize" : "italic"}`} title={name}>{name}</span>
    </h3>
  );

  return (
    <article
      className="card"
      data-tier={tier.tier}
      data-flipped={flipped || undefined}
      onClick={cardClick}
      onPointerMove={shiny ? foil : undefined}
      onPointerLeave={shiny ? unfoil : undefined}
    >
      <div className="flipper">
        <div className="face flex flex-col gap-3 p-3" inert={flipped}>
          {shiny && <div className="foil" aria-hidden />}

          <header className="panel overflow-hidden">
            {nameStrip}
            <p className="truncate px-3 py-1 text-right italic text-[var(--ink-soft)]" title={taxon.name}>{taxon.name}</p>
          </header>

          <div className="panel photo overflow-hidden border-t-[8px] border-t-[var(--dex-red)]">
            {photo ? (
              // Remote CC photo straight from iNaturalist's open-data bucket; the site is static, so no image optimizer.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.medium_url}
                alt={`Photo of ${name} (${taxon.name})`}
                width={500}
                height={500}
                loading="lazy"
                className="aspect-square w-full bg-[var(--drop)] object-cover"
              />
            ) : (
              <div className="silk flex aspect-square items-center justify-center bg-[var(--drop)] text-[var(--ink-soft)]">No photo on file</div>
            )}
            {shiny && <div className="foil" aria-hidden />}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge" style={{ background: TYPE_COLORS[type] }}>{type}</span>
            <span className="badge" style={{ background: tier.color }}>{tier.tier}</span>
            {caught && <span className="badge border-[var(--dex-red-deep)] bg-white text-[var(--dex-red-deep)]">Caught</span>}
            <button
              ref={frontButton}
              type="button"
              onClick={flip}
              className="plate ml-auto bg-white px-2.5 py-1 text-[14px] text-[var(--ink)]"
              aria-label={`Read the entry for ${name}`}
            >
              Entry ▸
            </button>
          </div>

          <dl className="panel px-3 py-1">
            <div className="flex items-center justify-between py-1.5">
              <dt className={label}>Seen</dt>
              <dd>{count} near you this week</dd>
            </div>
            <div className="dotted flex items-center justify-between py-1.5">
              <dt className={label}>Catch</dt>
              <dd><Stars value={catchStars(taxon.observations_count)} /></dd>
            </div>
            <div className="dotted py-1.5 text-center">
              <dt className="sr-only">Global rarity</dt>
              <dd>{count} of <span className="tabular-nums">{taxon.observations_count.toLocaleString("en-US")}</span> ever logged</dd>
            </div>
          </dl>

          <footer className="panel sidebars px-3 py-2 text-[16px] leading-snug">
            <p className="break-words text-[var(--ink-soft)]">{photo ? photo.attribution : "No photo credit"}</p>
            <a
              href={taxonUrl(taxon.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-bold text-[var(--dex-red-deep)] underline decoration-2 underline-offset-4"
            >
              iNaturalist page ▸<span className="sr-only"> for {name} (opens in a new tab)</span>
            </a>
          </footer>
        </div>

        <div className="face back flex flex-col gap-3 p-3" inert={!flipped} aria-label={`Entry for ${name}`}>
          <header className="panel overflow-hidden">{nameStrip}</header>

          <section className="panel sidebars px-4 py-3 text-[17px] leading-snug">
            <h4 className={`${label} mb-1.5`}>Entry</h4>
            {entry === "loading" || entry === null ? (
              <p>Reading entry<span className="cursor">_</span></p>
            ) : entry === "error" ? (
              <p>The entry didn&apos;t load. Flip the card again to retry.</p>
            ) : (
              <p className="whitespace-pre-line">{entry.summary || "No detailed information is available at this time."}</p>
            )}
          </section>

          {typeof entry === "object" && entry && entry.lineage.length > 0 && (
            <dl className="panel px-3 py-1">
              {entry.lineage.map((l, i) => (
                <div key={l.rank} className={`flex items-baseline justify-between gap-3 py-1.5 ${i ? "dotted" : ""}`}>
                  <dt className={label}>{l.rank}</dt>
                  <dd className="text-right first-letter:uppercase">{l.name}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleCaught}
              aria-pressed={caught}
              className={`plate px-3 py-2 text-[15px] ${caught ? "bg-[var(--dex-red-deep)] text-white" : "bg-white text-[var(--ink)]"}`}
            >
              {caught ? "Caught ✓" : "Mark caught"}
            </button>
            {typeof entry === "object" && entry?.wikipedia && (
              <a href={entry.wikipedia} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--dex-red-deep)] underline decoration-2 underline-offset-4">
                Wikipedia ▸<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <button
              ref={backButton}
              type="button"
              onClick={flip}
              className="plate ml-auto bg-[#e8ecec] px-3 py-2 text-[15px] text-[var(--ink)]"
              aria-label={`Back to the front of ${name}`}
            >
              ◂ Back
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
