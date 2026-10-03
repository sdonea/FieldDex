// node lib/dex.check.ts — pins the tier thresholds, the star scale and the type map.
import assert from "node:assert/strict";
import { catchStars, dexType, rarity } from "./dex.ts";

// Evansville (ZIP 47708), week of 2026-10-02
assert.equal(rarity(1_253).tier, "Legendary"); // swamp beggarticks
assert.equal(rarity(2_407).tier, "Rare"); // Japanese chaff flower
assert.equal(rarity(1_999).tier, "Legendary");
assert.equal(rarity(2_000).tier, "Rare");
assert.equal(rarity(99_999).tier, "Uncommon");
assert.equal(rarity(311_979).tier, "Common"); // mourning dove

assert.equal(catchStars(1), 5);
assert.equal(catchStars(1_253), 5);
assert.equal(catchStars(2_407), 4);
assert.equal(catchStars(311_979), 2);
assert.equal(catchStars(5_000_000), 1);
for (let n = 1; n < 1e8; n *= 1.7) assert.ok(catchStars(n) >= catchStars(n * 1.7), `stars never rise with count (${n})`);

assert.equal(dexType("Aves"), "Flying");
assert.equal(dexType("Arachnida"), "Bug");
assert.equal(dexType("Mollusca"), "Water");
assert.equal(dexType("Protozoa"), "Mystery");
assert.equal(dexType(null), "Mystery");
console.log("dex checks pass");
