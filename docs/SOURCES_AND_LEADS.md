# Sources and Leads — Dee

## The grounding problem — largely resolved (2026-08-31)

This project's whole claim is that it knows the difference between what is documented and
what is not. That obligation applies to its own research inputs, not only to its scenes.

**Update: the Dee scholarship is on disk, and a research pipeline over it already exists.**
`E:/pdf/renaissance magic/Dee/` holds Parry (*The Arch-Conjuror of England*), Harkness
(*John Dee's Conversations with Angels*), Clulee (*Natural Philosophy*), Szonyi
(*Occultism*), Hakansson (*Seeing the Word*), Whitby (*Actions with Spirits*), Clucas and
Forshaw in *Ambix* and *Aries*, Sherman on the library and the politics of reading — plus
the primary sources: the *Mysteriorum Libri*, Casaubon's *True & Faithful Relation*, the
*Monas*, *Propaedeumata Aphoristica*, the *Heptarchia*, the *Soyga* tables, Fenton's
edition of the day books.

More importantly, `DeeChunks/` is a **pre-existing, separately maintained pipeline** over
that corpus, with its own `AGENTS.md` whose rule this project follows: *use the converted
Markdown chunks and the SQLite index; do not re-read the PDFs for ordinary work.* It holds:

| Table | Rows | What it gives the game |
|---|---|---|
| `documents` / `chunks` / `chunk_fts` | 68 / 3,052 | Full-text search across the whole corpus |
| `biography_timeline` | 29 | Dated events with page-level bibliography — the scene-writing spine |
| `dee_spirit_action_summaries` | 117 | Every recorded angelic session, dated and topic-tagged |
| `dee_daybook_entry_summaries` | 1,464 | Dee's own diary, entry by entry |
| `scholarly_chapter_summaries` | 47 | Per-chapter argument **and** `historiographical_issues` |
| `dee_writings_catalog` | 14 | Dee's own works, with attribution status |

**This project does not rebuild or modify that corpus.** `research/build_research_layer.py`
reads it read-only and emits two artifacts into this pack:
`content/timeline.json` (the game's reference layer) and `docs/RESEARCH_INDEX.md` (the
mining index). Re-run it whenever the corpus is rebuilt.

### What this changes

- The **LEAD** tag below was introduced when the scholarship was unavailable. It is now
  largely obsolete: most of the leads inventoried in this file can be checked against the
  corpus directly. Items still marked LEAD are ones nobody has yet verified — not ones
  that cannot be.
- `BIOGRAPHY.md`'s many **CONTEXT** tags were assigned under the old constraint ("standard
  scholarship, not on disk"). **They should now be upgraded to ATTESTED with citations**
  as each is checked. This is the single highest-value outstanding research task, and it
  is mechanical rather than difficult.
- `content/timeline.json` already ships 29 events tagged ATTESTED with real Parry/Harkness
  page ranges. Those are safe to write from today.

### The LEAD tag (retained, narrowed)

> **LEAD** — asserted in a synthesis (e.g. a NotebookLM session) but not yet checked
> against the corpus. May shape a scene's *structure* and may direct a search. **May not
> be asserted as fact in player-facing text until verified.**

LEAD is a research-side tag only; it never renders in the game, and `tools/lint.mjs`
fails the build if a LEAD-tagged node reaches `choices.json`.

## The four historiographical lenses

The most valuable thing in the NotebookLM material is not any single anecdote — it is that
it organizes Dee by *the arguments modern scholars have about him*. Each lens is a
different answer to "what was Dee actually doing," and the game can let the **player**
settle it by how they play, which is a far better use of historiography than picking a
winner in the design doc.

| Lens | The claim | The game's version |
|---|---|---|
| **Sherman** — the politics of reading | Not an isolated occultist but a "one-man research institute": library and marginalia as instruments of civic humanism, policy and state service; manuscripts as targeted political documents for the Queen and Council. | Reading is **adversarial and productive** — books are annotated and appropriated *for* something. Underlies the marginalia interface and the library-as-engine design. |
| **Parry** — the arch-conjuror | The "conjuror" slander was manufactured and weaponized by court factions and rivals (Prestall, Murphyn; Hatton, Whitgift) to block patronage. Dee's ruin is *political*, not intellectual. | The **stain** — a slander economy that no argument can clear, culminating in the refused 1604–05 petition. This is already the game's spine. |
| **Harkness** — crisis natural philosophy | The angel sessions are not senility but a rigorous continuation of natural philosophy under eschatological pressure: the Book of Nature is decaying, and an Adamic/exegetical key is needed to read the cosmos before the end. | The angelic work is **not a departure from the science but its continuation** — which is why Act V must not read as a man losing his mind. |
| **Clucas** — diagrammatic logic | The *Monas* diagrams are not illustrations but working engines: hieroglyphic syllogisms, Pythagorean number-symbolism, alchemy done *diagrammatically*. | The *Monas* is a **made object with a layout**, produced in a pressroom with a printer — a thing you compose, not a thing you merely write. |

Between them, these four are the game's real thesis: Dee was simultaneously a state
servant, a slander victim, an apocalyptic natural philosopher, and a diagram-maker — and
which of those a given playthrough foregrounds should be the player's doing.

## Leads inventory (all LEAD unless noted)

Named material to verify, act by act. Where a claim is already CONTEXT in
[BIOGRAPHY.md](BIOGRAPHY.md) it is marked ✔.

**Act II — the 1555 arrest.** Accuser **George Ferrers**; interrogation by Secretary
**John Bourne**; lodgings sealed; charges framed around calculing/conjuring against Mary,
Philip and Elizabeth ✔. Ferrers' children afterward struck blind and dying, feeding public
rumor of magical revenge. Release conditioned on submission under **Bonner** ✔, producing
a durable public stain via **Foxe's *Acts and Monuments***, where Dee appears in the
martyrology's account of Bonner's examinations.

**Acts III–IV — factional warfare.** **John Prestall**, Catholic conjuror and serial
plotter, repeatedly escaping punishment by promising alchemical silver-to-gold and cures
for Pembroke — the rival who *is* rewarded for the promises Dee will not make.
**Vincent Murphyn**, forger and libeller, calling Dee a Catholic coiner and "great
conjuror"; Dee's slander suit (c. 1580, damages sought in the hundreds of pounds);
Murphyn's counter-attack by letter to **Burghley** alleging Dee's suit masked a Catholic
conspiracy. Later, the Catholic exile **Parsons**' libel smearing a royal favorite's
circle as a school of atheism dependent on a "conjuror" — the stain reaching past Dee to
his patrons.

**Act IV — Sherman's reading.** Weeks of annotation in **Ramusio's *Navigationi et
Viaggi*** during the **Frobisher** voyages to Meta Incognita ✔, formulating a
legal-historical case against Iberian hegemony (papal donation denied; Arthur and Madoc
as prior title) ✔ in the **limits of the British Empire** material ✔. Alternative
register: the ***Brytannicae Reipublicae Synopsis***, drawing on Cicero's *De Officiis* —
navy, fisheries, wool trade, the *commonweal* rather than the empire. The two documents
as two different Dees, both real, is an excellent Act IV fork.

**Act III — Clucas's pressroom.** Antwerp 1564: Dee lodging in the house of the royal
typographer **Willem Silvius** while composing the ***Monas*** ✔, the press functioning as
a laboratory where typesetting constraints anatomize the glyph. Continental reception by
iatrochemists (**Croll**, **Khunrath**) versus the practical/metallurgical reading
available to **Maximilian II**'s court — a real fork between international prestige and
courtly usefulness.

**Act V — the Talbot imposture.** "**Edward Talbot**" arriving at Mortlake after
**Barnabas Saul**'s failure ✔; **Jane Dee**'s "marvellous rage" at warnings that the man
is a counterfeit — *the household knew before Dee admitted it*, which is dramatically
enormous. The **Soyga** test: Uriel demurring, the angel **Il** later supplying a
translation that contradicts Dee's own cabalistic notes ✔(Soyga/Uriel).

**Acts V–VI — Harkness's Gates of Nature.** Cracow, April–May 1584: the angel
**Nalvage** delivering the **Gates of Nature** — 49 Governors, 48 keys, spelled out
letter-by-letter from tables — explicitly as an instrument for judging the inner workings
and imminent decay of the elements before the eschaton. Kelley's exhaustion and his
pressure to redirect the channel toward metallurgy and gold: the recurring
*apocalyptic knowledge vs. practical alchemy* fork, and the true engine of the
partnership's decay.

**Act VI — the Prague burning.** 1586, under suspicion pressed by the nuncio
**Malaspina** and **Bishop Sega**: the command to burn the books — 28 folio volumes — in
the oratory furnace; then the **restoration in the garden**, the books returned unburned.
Whether staged or not is exactly the question the game refuses to answer, and it is the
single best set-piece in the life for the no-ground-truth rule.

**Act VI — 1587 Třeboň.** ✔ Decided as playable at diary distance. Additional lead: Kelley
framing refusal as forfeiting the powder of transmutation — i.e. the covenant is extorted
against the *patronage economy*, not only against belief. Consent preserves the
alchemical partnership and Rožmberk's protection; refusal preserves the household and
sends Dee home in penury.

**Acts VII–VIII — Manchester.** **Whitgift**'s hand in the wardenship as a form of exile ✔;
a nonconforming town, embezzled college finances, tithe litigation, rioting tenants over
enclosure; the **John Darrell** exorcism controversy, on which Dee must take a side ✔(consulted
on possession). Late scryers **Francis Nichols** and **Bartholomew Hickman** in bitter
discord over what appears in the stone; a break with one of them ending in burned diaries
and, at the last, cosmic silence.

## Verification plan (revised — the sources are in hand)

1. **Upgrade BIOGRAPHY.md's CONTEXT claims to ATTESTED**, act by act, citing Parry and
   Harkness page ranges from `biography_timeline` and `scholarly_chapter_summaries`.
   Highest value, lowest difficulty.
2. **Check the named LEAD material** — Ferrers, Bourne, Prestall, Murphyn, Nalvage, the
   Prague burning, Silvius, Hickman/Nichols — with `chunk_fts` searches. Each either
   becomes ATTESTED or gets cut from the scene that relies on it.
3. **Mine `dee_spirit_action_summaries`** (117 dated sessions) for Act V–VI scene detail;
   it is the closest thing to a scene list the primary record can give.
4. **Mine `dee_daybook_entry_summaries`** (1,464 entries) for the domestic and financial
   texture Acts IV, VII and VIII need — and note where the diary goes silent, which is
   itself usable.
