"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { dexType, rarestFirst, speciesUrl, TYPE_COLORS, type DexType, type SpeciesCount } from "@/lib/dex";
import { DexCard } from "./DexCard";

type Query = { kind: "zip"; zip: string } | { kind: "geo"; lat: number; lng: number };
type State =
  | { kind: "idle" }
  | { kind: "loading"; place: string }
  | { kind: "results"; place: string; total: number; species: SpeciesCount[] }
  | { kind: "empty"; place: string }
  | { kind: "badZip"; zip: string }
  | { kind: "denied"; reason: string }
  | { kind: "error"; query: Query };

class UnknownZip extends Error {}

// Local calendar date seven days ago, as iNaturalist's d1 wants it.
const weekAgo = () => new Date(Date.now() - 7 * 864e5).toLocaleDateString("en-CA");

async function lookupZip(zip: string) {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (res.status === 404) throw new UnknownZip();
  if (!res.ok) throw new Error(`zippopotam ${res.status}`);
  const place = (await res.json()).places[0];
  return { lat: Number(place.latitude), lng: Number(place.longitude), place: `${place["place name"]}, ${place["state abbreviation"]}` };
}

export function FieldDex() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [zip, setZip] = useState("");
  const [filter, setFilter] = useState<DexType | "All">("All");
  const latest = useRef(0); // only the newest search may write state

  async function run(query: Query) {
    const id = ++latest.current;
    const set = (s: State) => id === latest.current && setState(s);
    setFilter("All");
    if (query.kind === "zip") history.replaceState(null, "", `?zip=${query.zip}`);
    set({ kind: "loading", place: query.kind === "zip" ? `ZIP ${query.zip}` : "your location" });
    try {
      const { lat, lng, place } = query.kind === "zip" ? await lookupZip(query.zip) : { ...query, place: "your location" };
      set({ kind: "loading", place });
      const res = await fetch(speciesUrl(lat, lng, weekAgo()));
      if (!res.ok) throw new Error(`iNaturalist ${res.status}`);
      const data: { total_results: number; results: SpeciesCount[] } = await res.json();
      if (!data.results.length) return set({ kind: "empty", place });
      set({ kind: "results", place, total: data.total_results, species: data.results.toSorted(rarestFirst) });
    } catch (e) {
      if (e instanceof UnknownZip && query.kind === "zip") return set({ kind: "badZip", zip: query.zip });
      set({ kind: "error", query });
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const z = zip.trim();
    if (!/^\d{5}$/.test(z)) return setState({ kind: "badZip", zip: z });
    run({ kind: "zip", zip: z });
  }

  function locate() {
    if (!navigator.geolocation) return setState({ kind: "denied", reason: "This browser can't share a location." });
    setState({ kind: "loading", place: "your location" });
    navigator.geolocation.getCurrentPosition(
      (p) => run({ kind: "geo", lat: Number(p.coords.latitude.toFixed(4)), lng: Number(p.coords.longitude.toFixed(4)) }),
      (err) =>
        setState({
          kind: "denied",
          reason: err.code === err.PERMISSION_DENIED
            ? "Location access was blocked for this site."
            : "Your device couldn't get a location fix.",
        }),
      { timeout: 15_000, maximumAge: 600_000 },
    );
  }

  // A shared ?zip= link runs its search on arrival.
  useEffect(() => {
    const z = new URLSearchParams(location.search).get("zip");
    if (z && /^\d{5}$/.test(z)) {
      setZip(z);
      run({ kind: "zip", zip: z });
    }
  }, []);

  const busy = state.kind === "loading";
  const badZip = state.kind === "badZip";

  return (
    <>
      <section className="screen p-4 sm:p-6" aria-labelledby="search-title">
        <h2 id="search-title" className="silk mb-3 text-[17px] font-bold text-[var(--screen-deep)]">Scan an area</h2>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
          <div className="flex-1">
            <label htmlFor="zip" className="silk mb-1 block text-[16px] font-bold text-[var(--screen-frame)]">US ZIP code</label>
            <input
              id="zip"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="e.g. 47708"
              aria-invalid={badZip}
              aria-describedby="zip-help"
              className="w-full rounded-[4px] border-2 border-[var(--screen-frame)] bg-[var(--screen-hi)] px-3 py-2 text-[26px] tracking-[0.15em] tabular-nums shadow-[inset_3px_3px_0_var(--screen-line)] placeholder:text-[#5f6f7e]"
            />
          </div>
          <button type="submit" disabled={busy} className="plate bg-[var(--dex-red-deep)] px-5 py-3 text-[17px] text-white [text-shadow:1px_1px_0_var(--dex-red-ink)]">
            Scan
          </button>
          <button type="button" onClick={locate} disabled={busy} className="plate bg-[#e8ecec] px-4 py-3 text-[15px] text-[var(--ink)]">
            Use my location
          </button>
        </form>
        <p id="zip-help" className="mt-3 text-[var(--screen-deep)]">
          Every species logged on iNaturalist within 10 km in the last 7 days, rarest first.
        </p>
      </section>

      <div aria-live="polite" className="mt-8">
        {state.kind === "idle" && (
          <Notice title="No area scanned yet">
            Type a ZIP above, or try{" "}
            <button type="button" className="font-bold text-[var(--dex-red-deep)] underline decoration-2 underline-offset-4" onClick={() => { setZip("47708"); run({ kind: "zip", zip: "47708" }); }}>
              Evansville, IN (47708)
            </button>
            .
          </Notice>
        )}
        {state.kind === "loading" && (
          <Notice title={<>Scanning 10 km around {state.place}<span className="cursor">_</span></>}>
            <div className="mt-2 h-4 overflow-hidden rounded-[3px] border-2 border-[var(--frame)] bg-[var(--screen-hi)]">
              <div className="scanbar h-full w-1/4 bg-[var(--cyan)]" />
            </div>
          </Notice>
        )}
        {state.kind === "empty" && (
          <Notice title={`No sightings near ${state.place} this week`}>
            Nobody logged a plant, animal or fungus within 10 km in the last 7 days. Try a ZIP in a bigger town, or check back
            after the weekend, when most people upload.
          </Notice>
        )}
        {state.kind === "badZip" && (
          <Notice title={state.zip.length === 5 ? `ZIP ${state.zip} isn't on file` : "That isn't a ZIP code"}>
            {state.zip.length === 5 ? "No US place uses that ZIP. Check the digits and scan again." : "US ZIP codes are 5 digits, like 47708."}
          </Notice>
        )}
        {state.kind === "denied" && (
          <Notice title="No location to scan">
            {state.reason} Allow location for this site in your browser settings, or type a ZIP above instead.
          </Notice>
        )}
        {state.kind === "error" && (
          <Notice title="The field guide didn't answer">
            iNaturalist or the ZIP lookup didn&apos;t respond. Your connection may have dropped, or the service is busy.
            <div className="mt-3">
              <button type="button" onClick={() => run(state.query)} className="plate bg-[var(--dex-red-deep)] px-5 py-2 text-[16px] text-white">
                Retry
              </button>
            </div>
          </Notice>
        )}
        {state.kind === "results" && <Results {...state} filter={filter} setFilter={setFilter} />}
      </div>
    </>
  );
}

function Results({ place, total, species, filter, setFilter }: {
  place: string;
  total: number;
  species: SpeciesCount[];
  filter: DexType | "All";
  setFilter: (t: DexType | "All") => void;
}) {
  const numbered = useMemo(() => species.map((s, i) => ({ s, no: i + 1, type: dexType(s.taxon.iconic_taxon_name) })), [species]);
  const counts = useMemo(() => {
    const c = new Map<DexType, number>();
    for (const { type } of numbered) c.set(type, (c.get(type) ?? 0) + 1);
    return [...c].sort((a, b) => b[1] - a[1]);
  }, [numbered]);
  const shown = filter === "All" ? numbered : numbered.filter((n) => n.type === filter);

  return (
    <section aria-labelledby="count">
      <h2
        id="count"
        className="rounded-[6px] border-2 border-[var(--screen-deep)] bg-[var(--screen-frame)] px-4 py-2.5 text-center text-[22px] text-white shadow-[4px_4px_0_var(--drop),inset_0_2px_0_rgb(255_255_255/0.2)]"
      >
        {total} species near {place} this week
      </h2>
      {total > species.length && (
        <p className="mt-2 text-center text-[var(--ink-soft)]">
          <span className="bg-white px-1">iNaturalist returns 200 species per search: these are the 200 most-logged.</span>
        </p>
      )}

      <div className="rail mt-5 flex flex-wrap gap-2 p-2" role="group" aria-label="Filter by type">
        {([["All", species.length], ...counts] as const).map(([t, n]) => (
          <button
            key={t}
            type="button"
            aria-pressed={filter === t}
            onClick={() => setFilter(t)}
            className="tab silk flex items-center gap-2 px-3 py-1.5 text-[14px] font-bold"
          >
            {t !== "All" && <span aria-hidden className="h-3 w-3 border-2 border-[var(--frame)]" style={{ background: TYPE_COLORS[t] }} />}
            {t} <span className="font-normal">{n}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))] gap-6">
        {shown.map(({ s, no }) => <DexCard key={s.taxon.id} entry={s} no={no} />)}
      </div>
    </section>
  );
}

function Notice({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="panel sidebars mx-auto max-w-2xl px-5 py-4">
      <h2 className="silk text-[17px] font-bold">{title}</h2>
      <div className="mt-2 leading-snug">{children}</div>
    </div>
  );
}
