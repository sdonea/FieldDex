// Everything that turns an iNaturalist species count into a dex card. Plain erasable TypeScript, so the
// daily README bot (scripts/daily-dex.mjs) imports this same file under Node's type stripping.

export type Taxon = {
  id: number;
  name: string;
  preferred_common_name?: string;
  iconic_taxon_name?: string | null;
  observations_count: number;
  default_photo?: { medium_url: string; square_url: string; attribution: string; license_code: string | null } | null;
};
export type SpeciesCount = { count: number; taxon: Taxon };

export type DexType = "Flying" | "Grass" | "Bug" | "Poison" | "Normal" | "Dragon" | "Water" | "Mystery";
export const TYPE_COLORS: Record<DexType, string> = {
  Flying: "#70c4f0",
  Grass: "#90e77f",
  Bug: "#a0c788",
  Poison: "#fd4688",
  Normal: "#b8b9a9",
  Dragon: "#fe7800",
  Water: "#6898f8",
  Mystery: "#c8a048",
};
const ICONIC_TYPES: Record<string, DexType> = {
  Aves: "Flying",
  Plantae: "Grass",
  Insecta: "Bug",
  Arachnida: "Bug",
  Fungi: "Poison",
  Mammalia: "Normal",
  Reptilia: "Dragon",
  Amphibia: "Water",
  Actinopterygii: "Water",
  Mollusca: "Water",
};
export const dexType = (iconic?: string | null): DexType => (iconic && ICONIC_TYPES[iconic]) || "Mystery";

// Global observation count → tier, rarest first. The one place the thresholds live.
export const RARITY = [
  { tier: "Legendary", under: 2_000, color: "#fecd00" },
  { tier: "Rare", under: 10_000, color: "#5c91f6" },
  { tier: "Uncommon", under: 100_000, color: "#58ca38" },
  { tier: "Common", under: Infinity, color: "#b8b9a9" },
] as const;
export type Tier = (typeof RARITY)[number]["tier"];
export const rarity = (observations: number) => RARITY.find((r) => observations < r.under)!;

// Catch difficulty: log scale, 1,000 or fewer logged ever → 5 stars, a million or more → 1 star.
const HARDEST = 3, EASIEST = 6; // log10 of the observation counts at the two ends
export const catchStars = (observations: number) => {
  const t = (EASIEST - Math.log10(Math.max(observations, 1))) / (EASIEST - HARDEST);
  return 1 + Math.round(4 * Math.min(1, Math.max(0, t)));
};

export const speciesUrl = (lat: number, lng: number, d1: string, d2?: string) =>
  `https://api.inaturalist.org/v1/observations/species_counts?lat=${lat}&lng=${lng}&radius=10&d1=${d1}` +
  (d2 ? `&d2=${d2}` : "") +
  "&quality_grade=research,needs_id&per_page=200";
export const taxonUrl = (id: number) => `https://www.inaturalist.org/taxa/${id}`;
export const taxonApiUrl = (id: number) => `https://api.inaturalist.org/v1/taxa/${id}`;
export const displayName = (t: Taxon) => t.preferred_common_name || t.name;

export const rarestFirst = (a: SpeciesCount, b: SpeciesCount) =>
  a.taxon.observations_count - b.taxon.observations_count;
