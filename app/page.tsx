import { FieldDex } from "@/components/FieldDex";
import { Leaf } from "@/components/Pixels";

export default function Home() {
  return (
    <>
      <header className="border-b-[3px] border-[var(--dex-red-ink)] bg-[var(--dex-red)] shadow-[0_6px_0_rgb(90_90_90/0.35)]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <span aria-hidden className="text-[22px] text-white [text-shadow:2px_2px_0_var(--dex-red-ink)]">▼</span>
          <h1 className="silk text-[30px] font-bold leading-none text-white [text-shadow:2px_2px_0_var(--dex-red-ink)]">Field Dex</h1>
          <span className="ml-auto"><Leaf /></span>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-60px)] max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        <FieldDex />
      </main>

      <footer className="border-t-[3px] border-[var(--screen-deep)] bg-[var(--screen-frame)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-5 leading-relaxed sm:px-6">
          <p>
            Sightings and photos from{" "}
            <a className="underline decoration-2 underline-offset-4" href="https://www.inaturalist.org">iNaturalist</a>, a joint initiative of the
            California Academy of Sciences and the National Geographic Society. Photos are Creative Commons; each card credits its photographer.
            ZIP lookup by <a className="underline decoration-2 underline-offset-4" href="https://zippopotam.us">Zippopotam.us</a>.
          </p>
          <p className="mt-2">
            Built by Sebastian &ldquo;Seth&rdquo; Donea ·{" "}
            <a className="underline decoration-2 underline-offset-4" href="https://github.com/sdonea/fielddex">Source (MIT)</a>
          </p>
        </div>
      </footer>
    </>
  );
}
