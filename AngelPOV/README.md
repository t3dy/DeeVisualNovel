# Spoken Backward — you are the angels

**The sister game to [Imperial Magus](../protagonists/dee/).** Same century, same room,
same documents, the other side of the glass.

> *You are what comes into the stone. He writes down every word. He hears only what
> Kelley says.*

## What this is

John Dee spent twenty-seven years asking angels for one method that would unify
mathematics, navigation, alchemy and scripture. *Imperial Magus* plays that from his
chair. **This plays it from theirs.**

You want one thing, and the scholarship is what gives it to you. In *Hellebore* (Fall
2021) Matthew Melvin-Koushki reads the *Spiritual Diaries* and notices that the angels
of the record are neither Catholic nor Protestant but **imperial** — "most interested in
the establishment of a millennial world empire **at all costs**" — and that they never
told Dee so. Two sentences, and they are a game:

1. Your objective is a universal empire before the end. You have **no preference about
   whose**.
2. Dee must never find out — which makes concealment a mechanic instead of a twist.
3. And the Ottoman house had been building exactly that empire since Bayezid. So the
   counterfactual where Dee goes east is not a joke ending. It is the option that best
   serves your actual goal, and you are the only party in the fiction who can see it.

## The load-bearing screen

Everything you say passes through Edward Kelley — a convicted forger with cropped ears
and real ability, and the only channel that exists. So the consequence beat is a
**transmission beat**, in two inks:

```
     WHAT YOU SAID                    WHAT HE WROTE DOWN
     I am small, and I am not         There appeared a little maiden of
     afraid of you, and you will      seven yeares, her haire rowled up
     not be afraid of me.             before and hanging down very long
                                      behind, who played up and down in
                                      the stone.
```

At high fidelity they agree. As fidelity falls, the right-hand column starts to author
you — adding appetites you did not have and, in April 1587, a covenant you may not have
issued. The game never adjudicates whether Kelley was lying, whether he invented it, or
whether there was nothing there to distort. That is the actual state of the scholarship,
turned into a verb.

**You cannot verify your own transmission. Neither can anyone else, ever.**

## Orientation, and the apparatus

Two things were added after the first playtest build, because a game that hides
everything is not mysterious, it is just confusing.

**A qualitative state reading, under every scene.** The three hidden states are still
never shown as numbers — the series rule is that you cannot optimize what you cannot see
— but you are told, in plain language, where you stand:

```
Your words are reaching him whole.
He obeys before he has understood.
Nobody outside this room is listening.
The empire is not resting on anyone yet.
```

Channel, instrument, world, and which throne currently carries the weight. Everything is
normalised per choice made, so it reads the same at choice 3 as at choice 28.

**An evidence note on every one of the 41 scenes**, collapsed by default, opening into
what the scene rests on and what you would need to know to read it properly: the
manuscript or the scholar, where the record goes silent, where the game has compressed
its chronology and admits it, and the context — courtly patronage, the economics of
alchemy, the Adamic-language research programme, apocalyptic politics — that makes the
scene legible. Written for a mixed audience: a stranger to the period is never lost, and
a specialist gets the citation.

**And a flag the moment you leave the record.** Scenes carry a grounding mark; so do
individual answers. When the scene is documented but your answer is not, the transmission
screen says so outright rather than letting you infer it later:

> **so it might have been** — the scene is documented; this answer is not. You have moved
> off the record.

## Systems

- **Seven modes of appearing** — *appear, spell, threaten, promise, command, withhold,
  console.* Every one is documented angelic behaviour in the *Mysteriorum Libri*:
  taking a form, spelling backward off the table (reading forward was held to release
  the power), threatening wrath, promising the tongue of Adam, commanding, refusing
  ("it is not lawful"), and Madimi's register of comfort.
- **Three hidden states** — *fidelity, obedience, notice.* Never displayed.
- **The imperial vector** — four quantities tracking which throne you have loaded:
  Elizabeth's, Rudolf's, Murad's, and how near you have promised the end.
- **Grounding marks on every scene** — *the record holds this · the record is silent
  here · as the age went · so it was later told · so it might have been.*
- **41 nodes authored, 28–39 played** depending on foreclosure. Six acts, 1581 to 1608
  and elsewhere. A run is about 15 minutes.

**Eight endings**, chosen by relative dominance against measured norms. The documented
outcome is not privileged among them. The eastward road is rare and has to be built out
of everything you decline to say, twenty years before you can take it.

## The second pass

**Act 5 was thin** — five scenes for the seven years in which everything collapses. Three
more, all of which needed writing anyway:

- **August 1588, the wind.** The Armada is scattered and everyone in Europe is assigning
  credit for the weather. This is the game's one `so it was later told` scene, because the
  story that Dr Dee raised that storm is a much later invention supported by nothing
  contemporary — and chronologically awkward, since Dee was not in England in 1588 at all.
  He was at Třeboň. You can watch the legend being manufactured, or decline it.
- **22 November 1592, the commissioners.** Two Crown officers sit in his house and hear
  him out over two days — the only hearing he ever gets. He reads them the *Compendious
  Rehearsal*, which is why we know what was in the library: an inventory that exists only
  because the thing inventoried was gone.
- **1591–1597, what became of Kelley.** Knighted, rich, imprisoned for failing to produce
  the gold he had promised, dead after a fall. The standard arc of a court alchemist's
  career, and Dee is asked what to feel about it.

**The thrones are now compared against their own rates.** There are simply more chances to
load England than Prague, so comparing raw totals handed England the verdict by default
(35% of runs, with Prague at 9%). `crownNorms` fixes it the same way the states are
handled — measured means, ratios, and the same shared function used by both the ending
and the orientation line, so they can never disagree about who the empire is resting on.

**And the ending asks for a report.** "Tell us how it played" opens a GitHub issue
prefilled with the run's fingerprint — the outcome, the number of choices, the mode you
leaned on — so a playtest note arrives already knowing which run it is about.

## The third pass: apparatus, a companion page, and access

**The eight endings now carry evidence too.** They make the strongest historical claims
in the game and until now they carried none. Among them: that Casaubon printed the
conversations in 1659 to discredit them and thereby guaranteed their survival, so almost
everything we know about the actions comes through a book published to bury them; that
the Golden Dawn reconstituted the system in 1888 out of Casaubon and the Ashmole papers,
which is how most people meet Enochian magic today; and — for the ending where you spend
the game on Rudolf — that Dee told the Emperor to his face he would be put out of his
seat if he did not listen, and that in 1611 Rudolf was forced to cede his crowns to his
brother and died the year after. The note gives both halves and declines to join them.

**[The Evidence](notes.html)** gathers all 49 notes — 41 scenes and 8 endings — on one
browsable page, with per-scene anchors, the grounding marks colour-coded, and a list under
each scene of the answers that leave the record. It is generated from the content by
`node tools/build_notes.mjs`, and `lint` fails if it is older than the files it was built
from, so it cannot quietly drift.

**Accessibility.** Focus moves into each new card as the screen changes, so keyboard and
screen-reader users are not stranded on a button that no longer exists; every screen has
a real heading (visually hidden where the design has no room for one); the reading and
mode lists are labelled; and focus rings show for keyboard users but not mouse clicks.
`node tools/contrast.mjs` audits every palette token against WCAG AA — it found the
ending palette's secondary ink at 4.33:1 where 4.5 is required, which is now fixed. All
five palettes pass.

## The fourth pass: the two thinnest acts

Act 1 and act 4 were five scenes each. Act 4 in particular is the emotional centre of the
game and was carrying Trřeboň, the covenant and Madimi grown in five beats. Four new
scenes, and all twelve plates are now in use:

- **Which glass you come into** (1581–82). Dee owned several speculae, and two survive in
  the British Museum: a rock-crystal sphere and a polished obsidian mirror. The mirror is
  Mexica work, made before the Spanish conquest and carried to Europe afterwards — so the
  single most famous object in English occultism is a piece of Aztec ritual equipment
  repurposed by the man who wrote the legal case for an English empire.
- **By what name he is to call you** (1582). The angels of the diaries split into names
  any educated Elizabethan already knew and names attested nowhere before — Nalvage,
  Madimi, Galvah, Il. That split is the most useful evidence in the archive and it cuts
  both ways.
- **Jane Dee, before** (early 1587), graded *the record is silent here*, and the note
  explains why that grading is the honest one: Jane left no writing. She appears
  throughout her husband's diaries — her illnesses, her childbearing, her anxiety about
  money, her consent to the covenant — always in his hand, never her own. What she knew
  and when is exactly what the archive cannot tell us, so the game marks the gap instead
  of quietly filling it.
- **Theodorus Trebonianus** (28 February 1588). A son born at Trřeboň and named for the
  place, about ten months after the covenant was signed. The scene text changes depending
  on whether you delivered that instruction; the evidence note gives the dates plainly
  and says the question cannot be resolved, because a player who has just been through
  the covenant scene is owed the date rather than left to find it.

## The chamber

Behind the text, a three.js scrying chamber rendered **from inside the shew-stone,
looking out**: the Holy Table on its four wax seals, the Sigillum Dei Aemeth as heptagram
geometry, chalk circles, candlelight, letters rising off the table, and the two men.

Dee sits at the side of the table with a sloped desk and an open page catching the candle
— the page being the only thing in the room that survives to be argued about — and his
head dips and lifts as he copies, his writing hand moving across the page. Kelley stands
over the stone and leans in, both arms on the table. Each figure is a revolved robe,
shoulders, two arms and a head: a robe and a head alone read as a cone with a ball on it,
and the arms are what make the silhouette a person attending to something. They remain
deliberately unindividuated: this is a grimoire diagram that moves, not portraiture, and
no attempt is made to reproduce any period image of either man. The walls and fog take
the act's colour too, so Mortlake, Prague and Třeboň are different rooms.

Built procedurally, no assets, no build step. It degrades all the way down — WebGL2 →
WebGL1 → reduced-motion still frame → no canvas at all — and **the game is completely
playable with it absent**. Add `?flat=1` to skip it.

The figures, the table marks and the floor glyphs are **non-semantic**: angular marks
generated from the seed, deliberately not transcribed Enochian, so nothing here can be
misread as a working table or a real text.

## Run it

```bash
python -m http.server 7532
```

Then `http://127.0.0.1:7532/angelpov/index.html`.

| Query | Effect |
|---|---|
| `?debug=1` | field readout: bloom params, scene state, emissive hierarchy |
| `?nopost=1` | no-post baseline — every element must still read without bloom |
| `?flat=1` | no chamber at all (the degradation path) |
| `?seed=N` | reproduces a frame exactly |

## Verify

```bash
node tools/sim.mjs
```

```bash
node tools/dist.mjs 4000
```

```bash
node tools/lint.mjs
```

```bash
node tools/build_notes.mjs && node tools/contrast.mjs
```

`lint` also holds the apparatus to account: every scene must carry an evidence note with
a named source, no `said` may equal its `written`, option marks must be real grounding
codes, and `stateReading()` must return usable lines at choice 0, at negative states, and
at the top of the range.

`sim` proves every run reaches an ending and all eight are reachable by deliberate play.
`dist` is the calibration instrument — it is the reason the endings use relative
dominance rather than fixed thresholds, and it caught the counterfactual firing in 66%
of random runs before the eastward chain was gated. `lint` checks provenance on every
plate, that no `said` equals its `written` (a transmission with no gap has nothing to
show), and that no node requires a flag nothing sets.

Current distribution over 4,000 random runs — nothing unreachable, nothing dominant:

```
tides_and_title 25.5% · habsburg_silence 18.6% · true_and_faithful 14.4%
the_covenant 10.8% · long_way_round 9.8% · the_year_that_came 9.3%
stone_goes_dark 7.8% · sultans_angels 3.6%
```

## Where things live

Canonical source is **here** (`VisualNovels/angelpov/`). `DeeVisualNovel/AngelPOV/` is a
generated copy, assembled by `../tools/build_deploy.py` along with the rest of that tree
— never edit it by hand. See [DEPLOY_STATE.md](../DEPLOY_STATE.md).

- [DESIGN.md](DESIGN.md) — the premise and its source, the POV inversion table, the
  systems, the eight endings, the chamber's visual contract, and why the engine is forked.
- `content/choices.json` — 41 nodes; every option carries `said`, `written` and
  `consequence`, and every scene carries an `evidence` note.
- `engine/chamber.js` — the three.js chamber, with its emissive hierarchy documented at
  the top.
- `notes.html` — **generated**. Edit the content and re-run `tools/build_notes.mjs`.

## Sources

Melvin-Koushki, "Dr Dee's Ottoman Adventure," *Hellebore* (Fall 2021) — the premise,
Murad III as fellow angelologist, the *Book of Soyga* / *Agios* reversal, and Ibn Turka's
Tahawi Circle as the Islamic Monad. Harkness, *John Dee's Conversations with Angels*.
Parry, *The Arch-Conjuror of England*. Clucas on the *Mysteriorum Libri*. Casaubon's 1659
*True & Faithful Relation* — whose frontispiece pairs Dee with the Prophet Muhammad as
fellow conversers with angels, meant as the worst thing its editor could say, and used
here as the game's last scene.
