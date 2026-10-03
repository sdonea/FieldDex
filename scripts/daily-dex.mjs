// Daily README update (run by .github/workflows/daily-dex.yml, or by hand): asks iNaturalist for every species
// logged within 10 km of Evansville today, picks the rarest, rewrites the block between the daily-dex markers
// in README.md and logs the pick to docs/daily-dex.csv. A day with no sightings changes nothing.
//
//   node scripts/daily-dex.mjs            (Node 22.18+: imports lib/dex.ts directly)
import { readFile, writeFile } from "node:fs/promises";
import { displayName, rarestFirst, rarity, speciesUrl, taxonUrl } from "../lib/dex.ts";

const EVANSVILLE = { lat: 37.9718, lng: -87.572 }; // ZIP 47708, from api.zippopotam.us
const today = process.env.DAY ?? new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

const res = await fetch(speciesUrl(EVANSVILLE.lat, EVANSVILLE.lng, today, today), {
  headers: { "User-Agent": "fielddex-daily (https://github.com/sdonea/fielddex)" },
});
if (!res.ok) throw new Error(`iNaturalist ${res.status}`);
const { results } = await res.json();
if (!results.length) {
  console.log(`${today}: no sightings near Evansville, README left as is`);
  process.exit(0);
}
const { taxon, count } = results.sort(rarestFirst)[0];
const name = displayName(taxon), tier = rarity(taxon.observations_count).tier;
const logged = taxon.observations_count.toLocaleString("en-US");
const photo = taxon.default_photo;

const block = `<!-- daily-dex:start -->
### Today's rarest find near Evansville, IN · ${today}

${photo ? `<a href="${taxonUrl(taxon.id)}"><img src="${photo.medium_url}" width="280" alt="Photo of ${name} (${taxon.name})" /></a>\n\n` : ""}**${name}** (*${taxon.name}*) · **${tier}** · 1 of ${logged} ever logged · seen ${count}× today · [iNaturalist page](${taxonUrl(taxon.id)})

<sub>${photo ? `Photo: ${photo.attribution}. ` : ""}Updated every evening by a GitHub Action: it asks iNaturalist for every species logged
within 10 km of Evansville that day and keeps the one with the fewest observations worldwide. Every day's pick is logged in
<a href="docs/daily-dex.csv">docs/daily-dex.csv</a>.</sub>
<!-- daily-dex:end -->`;

const readme = await readFile("README.md", "utf8");
const start = readme.indexOf("<!-- daily-dex:start -->"), end = readme.indexOf("<!-- daily-dex:end -->");
if (start < 0 || end < 0) throw new Error("README.md has no daily-dex markers");
await writeFile("README.md", readme.slice(0, start) + block + readme.slice(end + "<!-- daily-dex:end -->".length));
const log = (await readFile("docs/daily-dex.csv", "utf8")).split("\n").filter((l) => l && !l.startsWith(`${today},`)); // re-runs replace the day
await writeFile("docs/daily-dex.csv", [...log, `${today},${taxon.id},"${name}","${taxon.name}",${taxon.observations_count},${tier}`, ""].join("\n"));
console.log(`${today}: ${name} (${taxon.name}), ${tier}, 1 of ${logged}`);
