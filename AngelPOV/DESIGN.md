# Spoken Backward — design record

**Sister project to `protagonists/dee/` (Imperial Magus).** Same century, same room, same
documents, inverted point of view: you are what comes into the stone, and John Dee is the
instrument you are trying to aim.

Canonical source lives here. `C:\Dev\DeeVisualNovel\AngelPOV\` is a *generated* copy —
see DEPLOY_STATE.md. Never edit the deploy tree by hand.

---

## 1. The premise, and where it comes from

The governing idea is not invented. It is Melvin-Koushki's, stated flatly in *Hellebore*
(Fall 2021), "Dr Dee's Ottoman Adventure," p. 75:

> the angels do not seem to be particularly pro-Catholic or pro-Protestant either, but
> rather most interested in the establishment of a millennial world empire at all costs.
> Although the angels did not divulge this fact to Dee, the Ottoman house had nurtured the
> same millenarian and occultist imperial vision since the turn of the 16th century.

Two clauses do all the work:

1. **The angels want a universal empire and are indifferent to whose it is.** That is a
   playable objective. It is also, in the record, *not disclosed to Dee* — so concealment
   is a mechanic, not a plot twist.
2. **The Ottoman house wanted the same thing.** So the counterfactual is not a joke
   ending. It is the option that best serves the stated objective, and the player is the
   only party in the fiction who can see that.

Everything else follows. The player spends six acts loading one of four thrones —
Elizabeth's, Rudolf's, Murad's, or none — and the endings report which one took.

## 2. The inversion, screen by screen

| Imperial Magus (Dee) | Spoken Backward (the angels) |
|---|---|
| You act; consequences arrive as marginalia in Dee's own hand | You **speak**; consequences arrive as **what Kelley said you said** |
| The game never states whether the angels were real | The game never states **what you are** |
| Hidden states: angelic authority, scholarly credibility, political utility | Hidden states: **fidelity, obedience, notice** |
| The record is the thing that survives you | The record is the thing that **misquotes** you |
| Seven capabilities as verbs (calculate, predict, ...) | Seven **modes of appearing** (appear, spell, threaten, promise, command, withhold, console) |

### The transmission beat — the load-bearing screen

Imperial Magus's consequence screen is a marginal annotation. This game's equivalent is
**two inks side by side**: `WHAT YOU SAID` and `WHAT HE WROTE DOWN`. Kelley is the only
channel. At full fidelity the two columns agree. As fidelity falls, the right column
starts to author you — adding appetites, flattery, threats you did not make, and
eventually the covenant of 3 May 1587.

The game never adjudicates whether Kelley was lying, whether the distortion is his
invention, or whether there was nothing there to distort. That is the actual state of the
scholarship (Harkness; Clucas; Parry), rendered as a verb instead of a footnote.

**Design consequence:** the player experiences the historiographical problem from the
inside. You cannot verify your own transmission. Neither can anyone else, ever.

## 2b. Orientation and apparatus (added in the playtest pass)

The first build hid everything, and hiding everything turned out to read as confusion
rather than mystery. Two additions fix that without giving up the series rule.

**`pack.stateReading(s)`** returns four short in-fiction lines — channel, instrument,
world, empire — banded around the means `tools/dist.mjs` measures, and normalised per
choice made so it reads identically early and late. No numerals ever reach the screen.
The player can feel a trend and still cannot min-max it, which was the point of hiding
the states in the first place.

**`node.evidence`** — `{ source, text }` on all 41 scenes, rendered collapsed on the
transmission screen. Its job is four-fold and every note does at least two of them:

1. name the manuscript or the scholarship the scene rests on;
2. say where the record goes silent, and where *the game* has compressed or invented —
   a09 confesses that the Watchtower material actually arrives at Kraków in 1584, not at
   Mortlake in 1583;
3. supply the history-of-science or court context a reader needs — what a nuncio was for,
   why aristocrats funded alchemy, why the Adamic language was a research programme and
   not a whim, why 1588 was already loaded before Dee said anything;
4. flag where a claim everyone repeats is thinner than it looks. Kelley's cropped ears
   are the standing example: universally retold, including by this game, and not actually
   documented.

**Per-option grounding marks.** `option.mark` carries a grounding code. The transmission
screen compares its rank against the scene's and, when the answer sits further from the
record than the scene did, says so at the moment it happens. This is why a11 is graded
`PLAUSIBLE-GAP` and not `COUNTERFACTUAL`: the scene (Dee pressing about the purpose of
the work) is plausible, the specific answers are not, and grading the whole node
counterfactual made the per-answer flags unreachable — nothing can step further than the
scene has already stepped.

**Progress is reported as act, not as a fraction.** A run's length is genuinely unknown
mid-run: choosing to cross at a10 unlocks eight nodes at once, so "9 of 21" would become
"9 of 30" one screen later. The counter now reads `choice 9 · act 2 of 6`.

## 3. Systems

**Modes (seven).** Every one is documented angelic behaviour in the *Mysteriorum Libri* /
Casaubon: appearing in a form, spelling by letter off the table (backward — reading
forward was held to release the power), threatening wrath, promising the powder and the
tongue of Adam, commanding obedience, refusing ("it is not lawful"), and consoling
(Madimi's register).

**Hidden states (three, never displayed).**
- `fidelity` — how intact your speech arrives through Kelley
- `obedience` — how far Dee will go on your word alone
- `notice` — how much the world outside the room hears; drives the 1659 reception

**Quantities (the imperial vector).** `crown_english`, `crown_imperial`, `crown_ottoman`,
and `millennium` (how near you have promised the end). The endings read the vector.

**Concealment.** A flag, not a meter. Whether you ever told Dee that the empire's
nationality is negotiable. Withholding it is historically correct and mechanically
required for the Ottoman route — Dee will not go east for a God who admits to shopping.

## 3b. Why the thrones are normalised

The endings originally compared `crown_english` against `crown_imperial` as raw totals.
That is wrong, and `tools/dist.mjs` proved it as soon as act 5 grew: England accumulates
faster simply because more scenes touch the Crown, so it took 35% of runs while Prague
fell to 9%. `crownNorms` holds each throne's measured mean and `crownWeights()` returns
ratios; `computeEnding()` and `stateReading()` both call it, so the line telling the
player where the weight sits is computed from the same numbers that decide the ending.

The "no throne took it" door uses the **combined** western weight rather than the maximum,
because the question is whether the empire found any Christian throne at all, and two
half-hearted crowns still amount to a life spent on patronage.

## 3c. The apparatus outside the game

`notes.html` is generated from `content/choices.json` and `pack.js` by
`tools/build_notes.mjs`. It carries the same 45 notes the game shows collapsed, plus
per-scene anchors and the off-record answers for each scene, so the scholarship can be
linked and cited without playing a run.

The endings are reached by **probe** rather than transcribed, so the page cannot drift
from `computeEnding()` — if a threshold changes and a probe stops reaching its ending,
the page says so inline and `lint` warns. `lint` also fails outright if `notes.html` is
older than the content it was built from.

## 3d. Accessibility

- `shell()` moves focus into each new card. Every screen replaces the card wholesale, so
  without this a keyboard or screen-reader user is left on a removed element with no
  announcement that anything happened.
- Every screen carries a heading; where the design has no room for a visible one, an
  `.sr-only` heading gives the document a navigable outline.
- Focus rings use `:focus-visible`, so keyboard users get them and mouse users do not.
- `tools/contrast.mjs` audits all five palettes against WCAG AA. It caught `--ink-2` on
  the ending palette at 4.33:1 against a 4.5 requirement; lifted to 4.90:1.
- No entrance animation animates opacity, so no text depends on an animation running.

## 4. Acts

| # | Title | Years | Where |
|---|---|---|---|
| 1 | The First Appearing | 1581-1582 | Mortlake (7 scenes) |
| 2 | The Tables | 1582-1583 | Mortlake |
| 3 | The Kings | 1583-1586 | Krakow, Prague |
| 4 | The Covenant | 1586-1588 | Trebon (7 scenes; runs to the birth in February 1588) |
| 5 | Eighty-Eight | 1588-1595 | the road home (8 scenes: the collapse gets the room it needs) |
| 6 | Where We Put It | 1595-1608, and elsewhere | Mortlake — or the passage east |

41 nodes authored; 28-39 played per run, depending on foreclosure.

## 5. Endings (eight)

1. **The Sultan's Angels** — *so it might have been.* The Ottoman route. Requires the
   ottoman vector loaded, Dee desperate, and the objective concealed throughout.
2. **The Long Way Round** — *so it was later told.* No millennium; but the phrase Dee
   coined runs a quarter of the earth, and the Golden Dawn (founded 1888) works your tables.
3. **A True & Faithful Relation** — *the record holds this.* High notice, high fidelity:
   Casaubon prints you in 1659 to prove you were devils, and so keeps every word forever.
4. **The Covenant** — *the record holds this.* The channel spent on the wives.
5. **The Habsburg Silence** — *the record holds this.* Rudolf loaded; Rudolf does nothing.
6. **Tides and Title** — *the record holds this.* Elizabeth loaded; she takes the calendar
   advice and the North-West title and declines the apocalypse.
7. **The Year That Came** — *the record holds this.* Millennium promised too hard; 1588
   passes; Dee burns his books.
8. **The Stone Goes Dark** — *the record is silent here.* Fidelity or obedience collapses.

Chosen by **relative dominance against measured norms**, not absolute cutoffs — the fix
`tools/dist.mjs` forced on the Dee pack, inherited deliberately.

## 6. The chamber (three.js)

A background scrying chamber, rendered *from inside the shewstone looking out*. Built
procedurally: Holy Table on four wax seals, the Sigillum Dei Aemeth as heptagram geometry,
chalk circles, candles, and two robed silhouettes.

**Visual contract.** Subject: one table at ~2m, camera 2.6m back at table height, slow
drift only. Near-black room; the sigil is the brightest authored thing in it; target 60fps
at 1.5x DPR on integrated graphics, and the page must be fully playable with the canvas
absent.

**Emissive hierarchy** (scene-relative, set before bloom, per `$threejs-bloom`):

```
candle flame core   12     brief, small, the only white
shewstone core       8     where you are
sigil glyph lines    6     pulsing, the authored subject
floating letters     4
chalk circles      1.5
table letter grid   0.6
wood / robes / floor  0    ordinary lit surface
```

Signal order: `RenderPass -> UnrealBloomPass -> OutputPass`, bloom threshold calibrated in
HDR *before* tone mapping (ACESFilmic, exposure 1.0). One bloom owner, no selective layer
substitution — nothing in this scene needs a second pass, and the material-restoration
transaction is a liability we do not have to take on.

**Degradation, in order:** WebGL2 → WebGL1 → `prefers-reduced-motion` (static frame, no
drift) → no canvas at all (CSS vellum ground). The narrative never depends on it.

**Debug.** `?debug=1` exposes the field controls and a no-post baseline (`?nopost=1`),
per the router's acceptance gate.

## 7. Why a forked engine

AngelPOV does not import `../engine/`. The transmission beat is a different screen
vocabulary, the chamber needs a persistent canvas layer under the card, and the palette is
inverted (dark room, light ink). Forking is the honest call; the shared engine stays
stable for the shipped Dee game and for Bruno/Agrippa after it. The state machine is
deliberately kept API-compatible with `engine/state.js` so the existing tooling can be
pointed at it.

## 8. Sources

- Matthew Melvin-Koushki, "Dr Dee's Ottoman Adventure," *Hellebore* (Fall 2021), 71–79 —
  the counterfactual, the angels' imperial indifference, Murad III as angelologist, the
  *Book of Soyga* / *Agios* reversal, Ibn Turka's Tahawi Circle as the Islamic Monad.
- Deborah Harkness, *John Dee's Conversations with Angels* — the actions as natural
  philosophy; Madimi; the apocalyptic register.
- Glyn Parry, *The Arch-Conjuror of England* — patronage, the Continental tour, the
  slander, the 1604–05 petition.
- Stephen Clucas on the *Mysteriorum Libri*; Méric Casaubon, *A True & Faithful Relation*
  (1659) — including the frontispiece pairing Dee with Muhammad as fellow angel-talkers,
  which this game treats as its own epigraph.
