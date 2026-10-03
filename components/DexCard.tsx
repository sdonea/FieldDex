"use client";

import type { PointerEvent } from "react";
import { catchStars, displayName, dexType, rarity, taxonUrl, TYPE_COLORS, type SpeciesCount } from "@/lib/dex";
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

export function DexCard({ entry, no }: { entry: SpeciesCount; no: number }) {
  const { taxon, count } = entry;
  const name = displayName(taxon);
  const type = dexType(taxon.iconic_taxon_name);
  const tier = rarity(taxon.observations_count);
  const shiny = tier.tier === "Legendary" || tier.tier === "Rare";
  const photo = taxon.default_photo;

  return (
    <article
      className="card flex flex-col gap-3 p-3"
      data-tier={tier.tier}
      onPointerMove={shiny ? foil : undefined}
      onPointerLeave={shiny ? unfoil : undefined}
    >
      {shiny && <div className="foil" aria-hidden />}

      <header className="panel overflow-hidden">
        <h3 className="strip flex items-baseline gap-3 px-3 py-1.5 text-[22px] leading-tight">
          <span className="silk text-[15px] font-bold tabular-nums">No.{String(no).padStart(3, "0")}</span>
          <span className={`min-w-0 truncate ${taxon.preferred_common_name ? "capitalize" : "italic"}`} title={name}>{name}</span>
        </h3>
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

      <div className="flex flex-wrap gap-2">
        <span className="badge" style={{ background: TYPE_COLORS[type] }}>{type}</span>
        <span className="badge" style={{ background: tier.color }}>{tier.tier}</span>
      </div>

      <dl className="panel px-3 py-1">
        <div className="flex items-center justify-between py-1.5">
          <dt className="silk text-[15px] font-bold text-[var(--ink-soft)]">Seen</dt>
          <dd>{count} near you this week</dd>
        </div>
        <div className="dotted flex items-center justify-between py-1.5">
          <dt className="silk text-[15px] font-bold text-[var(--ink-soft)]">Catch</dt>
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
    </article>
  );
}
