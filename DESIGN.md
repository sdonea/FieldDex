# Field Dex — design spec

Built to four reference screenshots of a DS-era handheld encyclopedia UI (an INFO page, two DATA pages and a
list page). Every hex value below was sampled from those images with PIL, not eyeballed. Nothing from them is
copied as artwork: no ball icon, no monster names, no official font. Only the palette, materials and layout
language carry over.

## Palette

| Token | Hex | Sampled from | Used for |
|---|---|---|---|
| `--dex-red` | `#ee3131` | INFO header bar, name strip | Top bar, card name strip, accents |
| `--dex-red-deep` | `#c62429` | Header bar bottom edge | Red surfaces that carry text (AA: white on it is 5.6:1) |
| `--dex-red-ink` | `#940f21` | Header outline | 1px outline under red bars |
| `--dex-pink` | `#ff9ca4` | Highlight under name strip | The pink rule under every red strip |
| `--paper` | `#ffffff` | INFO grid background | Page background |
| `--grid` | `#adadad` | INFO grid lines | 1px grid lines on the page |
| `--frame` | `#5a5a5a` | Panel outlines | 2px outline on every panel |
| `--drop` | `#c7ced7` | Panel drop shadow | Hard offset shadow (4px 4px, no blur) |
| `--ink` | `#292929` | Body text | All body text |
| `--ink-soft` | `#575757` | Secondary text | Labels (7.1:1 on white) |
| `--cyan` | `#30bfd7` | DATA tab rail | Type-filter rail |
| `--teal` | `#38a0b8` | DATA panel fill | Stats panel frame |
| `--slate` | `#408098` | DATA panel edge | Tab outlines |
| `--sky` | `#70c4f0` | DATA tab arrow | Focus ring, links on dark |
| `--screen` | `#c6effe` | List-page screen | Search screen fill |
| `--screen-line` | `#a5dff7` | List-page grid | Search screen grid lines |
| `--screen-frame` | `#5a5a73` | List-page frame | Search screen frame, count bar |
| `--screen-deep` | `#42425b` | List-page outer frame | Count bar edge |
| `--screen-hi` | `#f1fcff` | Selected list row | Input fill |

Stat-bar fills from the DATA page (`#58ca38` `#f0313d` `#fe7800` `#fd4688` `#fecd00` `#5c91f6`) and the badge
fills (`#a0c788` BUG, `#90e77f` GRASS, `#c8a048` ROCK, `#6898f8` WATER, `#b8b9a9` NORMAL) give the type and
rarity colors:

| Type | Fill | Source |
|---|---|---|
| Flying (Aves) | `#70c4f0` | DATA tab arrow sky |
| Grass (Plantae) | `#90e77f` | GRASS badge |
| Bug (Insecta, Arachnida) | `#a0c788` | BUG badge |
| Poison (Fungi) | `#fd4688` | Sp. Atk bar |
| Normal (Mammalia) | `#b8b9a9` | NORMAL badge |
| Dragon (Reptilia) | `#fe7800` | Defense bar |
| Water (Amphibia, Actinopterygii, Mollusca) | `#6898f8` | WATER badge |
| Mystery (everything else) | `#c8a048` | ROCK badge |

| Rarity | Fill | Source |
|---|---|---|
| Legendary | `#fecd00` | Sp. Def bar |
| Rare | `#5c91f6` | Speed bar |
| Uncommon | `#58ca38` | HP bar |
| Common | `#b8b9a9` | NORMAL badge |

Badge text is `#161616` on every fill above (lowest is 5.5:1 on `#fd4688`; `--ink` would be 4.4:1 there), with a 1px white text-shadow below
for the embossed look the references get from their outlined letters.

## Type

- **Pixelify Sans** (Google Fonts): a proportional pixel face, the closest free match to the references' screen
  font. Body, names, numbers. Never below 16px so the pixels stay crisp and legible.
- **Silkscreen** (Google Fonts) bold, uppercase: the blocky badge lettering (`BUG`, `GRASS`, tabs, the top bar).
- Scientific names: Pixelify Sans, synthesized oblique. Numbers use `tabular-nums` where they line up.

## Materials

- **Panels**: white fill, 2px `--frame` outline, 6px radius, hard 4px/4px `--drop` shadow. No blur anywhere.
- **Strips**: red bar with a 3px `--dex-pink` rule under it (INFO name strip).
- **Badges**: flat fill, 2px `--frame` outline, 3px radius, inner 1px white top highlight and dark bottom
  edge (bevel, like the NORMAL plates).
- **Tabs**: gray bevel plates on the cyan rail; the active tab is white with a slate outline (DATA tabs).
- **Page**: white with a 1px `--grid` line every 32px (INFO background). The search screen uses the light-blue
  list-page screen with its own finer grid.
- **Icon**: a pixel leaf on the top bar and favicon, in place of the references' ball icon.

## Card anatomy (top to bottom)

1. **Name strip** (red, pink rule): `No.007` + common name, white text on `--dex-red-deep`.
2. **Title line**: scientific name, right-aligned, oblique (the "Title" row of the INFO page).
3. **Photo window**: square photo inside a framed box with a red top stripe (the INFO portrait box).
4. **Badges row**: type badge + rarity badge.
5. **Stat panel** with a dotted divider (the HT/WT panel): `SEEN` sightings near you this week, `CATCH` 1–5
   pixel stars, then `{local} of N ever logged` (this week's local sightings out of the global total).
6. **Footer panel** with red side bars (INFO description box): photo credit and the iNaturalist link.

## Page layout

- Top bar: full-width red, `▼ FIELD DEX` in Silkscreen (INFO bar).
- Search screen: framed light-blue panel (list page) with the ZIP input and "use my location" button.
- Count bar: dark `--screen-frame` band with light text, e.g. "71 species near Evansville, IN this week"
  (list-page title band).
- Type filter: the tab rail (DATA tabs), one tab per type present plus ALL.
- Grid: `repeat(auto-fill, minmax(280px, 1fr))`, 24px gap. One column at 375px.

## Motion

- Flip: clicking a card (or its ENTRY plate) turns it over in 0.6s to the back face: name strip, an entry
  box with the red side bars, a class/order/family panel with dotted dividers, and MARK CAUGHT / BACK plates.
  The tilt and the flip sit on separate layers so each keeps its own timing.

- Rare and Legendary: a holographic foil over the photo and card face. Pointer position sets `--mx`/`--my`;
  CSS draws a rainbow `repeating-linear-gradient` plus a glare `radial-gradient` with `color-dodge`, and tilts
  the card up to 6°. Foil only sits on the photo and frame; text panels are opaque so contrast is unaffected.
- Loading: a blinking pixel cursor and a stepped scan bar (`steps()` timing, like a handheld redraw).
- `prefers-reduced-motion`: foil, tilt, blink and scan all off; the flip swaps faces instantly.

## Deliberately not taken

- The ball icon in the INFO strip and list rows (replaced by the leaf and plain numbers).
- The sprite art, evolution arrows and stat bars (no stats to show).
- White text on `#ee3131` (3.9:1, fails AA): text-bearing red surfaces use `#c62429` instead.
