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
- **34 nodes authored, 25–32 played** depending on foreclosure. Six acts, 1581 to 1608
  and elsewhere. A run is about 12 minutes.

**Eight endings**, chosen by relative dominance against measured norms. The documented
outcome is not privileged among them. The eastward road is rare and has to be built out
of everything you decline to say, twenty years before you can take it.

## The chamber

Behind the text, a three.js scrying chamber rendered **from inside the shew-stone,
looking out**: the Holy Table on its four wax seals, the Sigillum Dei Aemeth as heptagram
geometry, chalk circles, candlelight, letters rising off the table, and two robed figures
who are the reason you are here. It changes with the act and flares when you choose to
appear.

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

`sim` proves every run reaches an ending and all eight are reachable by deliberate play.
`dist` is the calibration instrument — it is the reason the endings use relative
dominance rather than fixed thresholds, and it caught the counterfactual firing in 66%
of random runs before the eastward chain was gated. `lint` checks provenance on every
plate, that no `said` equals its `written` (a transmission with no gap has nothing to
show), and that no node requires a flag nothing sets.

Current distribution over 4,000 random runs — nothing unreachable, nothing dominant:

```
tides_and_title 24.7% · habsburg_silence 17.6% · true_and_faithful 15.8%
long_way_round 15.0% · the_covenant 9.9% · stone_goes_dark 7.7%
the_year_that_came 5.3% · sultans_angels 3.9%
```

## Where things live

Canonical source is **here** (`VisualNovels/angelpov/`). `DeeVisualNovel/AngelPOV/` is a
generated copy, assembled by `../tools/build_deploy.py` along with the rest of that tree
— never edit it by hand. See [DEPLOY_STATE.md](../DEPLOY_STATE.md).

- [DESIGN.md](DESIGN.md) — the premise and its source, the POV inversion table, the
  systems, the eight endings, the chamber's visual contract, and why the engine is forked.
- `content/choices.json` — 34 nodes; every option carries `said`, `written` and
  `consequence`.
- `engine/chamber.js` — the three.js chamber, with its emissive hierarchy documented at
  the top.

## Sources

Melvin-Koushki, "Dr Dee's Ottoman Adventure," *Hellebore* (Fall 2021) — the premise,
Murad III as fellow angelologist, the *Book of Soyga* / *Agios* reversal, and Ibn Turka's
Tahawi Circle as the Islamic Monad. Harkness, *John Dee's Conversations with Angels*.
Parry, *The Arch-Conjuror of England*. Clucas on the *Mysteriorum Libri*. Casaubon's 1659
*True & Faithful Relation* — whose frontispiece pairs Dee with the Prophet Muhammad as
fellow conversers with angels, meant as the worst thing its editor could say, and used
here as the game's last scene.
