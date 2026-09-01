# Act Diagrams — Provenance and Rationale

The series house rule is that **no image ships without a provenance record**. That rule
was written for manuscript photographs. These are not photographs — they are **original
line drawings**, constructed from published geometry — so the rights position is
different, but the record is still required. This file is that record.

## Why drawn rather than reproduced

Three reasons, in order of weight:

1. **It is closer to the source, not further from it.** Clucas's argument (*Ambix* 64.2,
   "The Royal Typographer and the Alchemist") is that Dee's diagrams are not illustrations
   of an argument but *are* the argument — working engines whose typographic and geometric
   arrangement carries the meaning. Reconstructing the geometry engages that claim;
   reproducing a scan of a page merely pictures it. The interface conceit (marginalia, a
   scholar's own hand) also fits a drawn figure better than a photograph.
2. **The rights position is clean.** These are original SVG constructions authored for
   this project. No institution, no shelfmark, no licence to verify, nothing to clear.
   Compare the honest difficulty documented in TurkaGame's `FOUNDER.md` §5, where three
   wanted images could not be registered because their terms could not be asserted.
3. **They inherit the palette.** Drawn in `currentColor`, they ramp with the act — vellum,
   glass, Prague gold, faded — which a raster image cannot do.

## What each figure is derived from

| Key | Figure | Derived from | Acts | Note |
|---|---|---|---|---|
| `monas` | The Monas Hieroglyphica | Dee, *Monas Hieroglyphica* (Antwerp: Willem Silvius, 1564); corpus holds the text, Rattansi's translation, Walton, Clulee, Clucas and Forshaw on it | III | Built as Dee builds it: lunar crescent over solar circle with central point, over the elemental cross, over the two semicircles of Aries |
| `sigillum` | Sigillum Dei Aemeth | Dee, *Mysteriorum Libri*; the *Sigillum Dei* material in the corpus | V | The **construction only** — circle, heptagon, heptagram, inner seven-figure. Letters and names deliberately omitted: this is geometry, not a working talisman |
| `table` | The Great Table | *De Heptarchia Mystica* and the Enochian tables in the corpus | VI | The grid and its black cross; no letters |
| `compass` | A mariner's compass rose | Generic period navigational instrument; Dee's own navigation writings (*General and Rare Memorials*, 1577) | II, IV | Not from a specific plate — a 32-point rose of the ordinary kind |
| `tetractys` | The Pythagorean tetractys | Clucas, *Aries* 10.2, on Pythagorean arithmology and Trithemian number symbolism as the root of the *Monas* | I | The decad, drawn plainly |
| `shelf` | An emptying shelf-run | Not a historical figure. Sherman's "living library" and its dispersal | VII, VIII | The one non-derived figure, and the only invented image in the game |

## Rules for anyone adding to this set

- **Geometry only.** Do not draw people, places, or scenes. The game has no invented
  character art and no invented views — a rule inherited from TurkaGame's decision that
  manuscripts do not depict Ibn Turka's face and the game would not invent one.
- **Omit the operative parts of working figures.** The Sigillum's letters and divine names
  are left out on purpose. The game depicts Dee's practice; it does not supply a talisman.
- **Use `currentColor`.** Anything with a hard-coded hex breaks the palette ramp.
- **Record the derivation here** before it ships, with the source in the corpus.

## If real images are added later

The rule reverts to the strict form: institution, shelfmark, folio, rights note, recorded
before use. Three rights-cleared Dee items already exist in the sibling project
`C:/Dev/OCCULTIMGDB` (`data/catalog.json`):

| id | Title | Rights |
|---|---|---|
| `enochian__dee-monas-glyph` | The Monas Hieroglyphica (1564) | Public domain, via Wikimedia Commons |
| `enochian__dee-monas-hieroglyphica` | The Monas Hieroglyphica — cosmological glyph | Public domain, via Wikimedia Commons |
| `figures__portrait-john-dee` | Portrait of John Dee (the Ashmolean portrait) | Public domain; Ashmolean Museum, Oxford |

Adjacent and usable with checking: `christian_cabala__*` (18 items, including the
tetractys and Reuchlin), `cosmology__fludd-*`, `astrology__durer-melencolia`. Note the
Ashmolean portrait would be the game's **only** depiction of a person, so adding it is a
design decision as much as a rights one — see `../../../docs/OPEN_QUESTIONS.md` Q6.
