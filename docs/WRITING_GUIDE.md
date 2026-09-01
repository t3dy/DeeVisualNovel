# WRITING_GUIDE.md — Imperial Magus

Specialization of the series house rule (`../../../CLAUDE.md`) to John Dee. Read before
writing or revising any scene text, option label, or consequence line.

## The rule

**Every scene reveals something specific and real about Dee's actual world** — a named
text, institution, practice, person, manuscript, or historiographical fact — not generic
occult-fantasy atmosphere that could belong to any invented setting. A player should
finish a run knowing things: that the *Mathematicall Praeface* was written for
shipwrights and gunners, that Mortlake held four thousand volumes and no charter, that
the 1604 petition asked for a trial and was refused.

## The research-access layer

Check these before writing, in this order. Do not write from memory of what "feels right"
for the period.

1. **[BIOGRAPHY.md](BIOGRAPHY.md)** — the claim-tagged life. Authoritative for what the
   game may assert.
2. **[../content/timeline.json](../content/timeline.json)** — 29 dated events, each with a
   page-level bibliography in Parry and Harkness. Generated; regenerate with
   `python ../research/build_research_layer.py`.
3. **[RESEARCH_INDEX.md](RESEARCH_INDEX.md)** — the mining index: 47 scholarly chapter
   summaries with their historiographical issues, 117 spirit actions with dates and
   topics, daybook density by year, and Dee's own writings. Generated from the DeeChunks
   corpus.
4. **The corpus itself** — full text search, per its own AGENTS.md (use the chunks and
   the SQLite index, never the PDFs):

```bash
python -c "import sqlite3;c=sqlite3.connect('file:E:/pdf/renaissance magic/Dee/DeeChunks/dee_chunks.sqlite?mode=ro',uri=True);[print(r) for r in c.execute('SELECT d.title, snippet(chunk_fts,0,\">\",\"<\",\"...\",20) FROM chunk_fts f JOIN chunks c ON c.chunk_id=f.rowid JOIN documents d ON d.doc_id=c.doc_id WHERE chunk_fts MATCH ? LIMIT 8',('Murphyn',))]"
```

## Per-scene checklist

1. **What attested entity does this scene surface?** A named text (*Monas Hieroglyphica*,
   *Propaedeumata Aphoristica*, *General and Rare Memorials*, the *Mathematicall
   Praeface*, the *Compendious Rehearsal*, the *Libri Mysteriorum*, the *Book of Soyga*),
   a named institution (Trinity, the Star Chamber, Mortlake, the Samarkand of his
   imagination, Christ's College Manchester), a named person from BIOGRAPHY.md's cast, or
   a named practice. If the answer is "nothing specific," look again before finalizing.
2. **What does the grounding tag license?**
   - `ATTESTED` — state it directly.
   - `PLAUSIBLE-GAP` — the surrounding facts are stated plainly; the drama lives in the
     invented-but-compatible *decision*, never in invented facts around it.
   - `LEGEND` — write it as what was *said*, not what happened. The eighteen-hour days
     and the *Pax* beetle are Dee's own retrospective self-fashioning; let the prose
     carry that.
   - `COUNTERFACTUAL` — only the Ottoman route. Its scenes must contain, somewhere, the
     real record they depart from.
   - `LEAD` — **never ships.** Research-side only. Upgrade it or cut it.
3. **Is the vocabulary real?** *Scryer*, not "psychic." *Action*, not "séance." *Shewstone*
   or *stone*, not "crystal ball." *Nativity*, not "horoscope reading." *Election*, for
   choosing an auspicious hour. *Archemastrie*, Dee's own word, in the Preface contexts.
4. **Does it stay silent on the metaphysics?** No line of the game's own voice — scene,
   consequence, epilogue or coda — ever says whether the angels were real. Consequences
   report the social and material only: who believed, who paid, who withdrew, what got
   written down.

## Length anchors (numeric, deliberately)

TurkaGame's audit found option text drifting to ~41 words and generic; a numeric target
was added because "a bit shorter" regresses over successive edits. Same discipline here:

| Field | Target | Notes |
|---|---|---|
| Scene `text` | 35–60 words | Two to four sentences. It sets a room and a problem, not a lecture. |
| Option `label` | **10–20 words** | One sentence. Names a real thing wherever the biography supports one. |
| `consequence` | 15–30 words | A marginal annotation in Dee's own hand. Dry, retrospective, occasionally rueful. Never explains the mechanic. |
| Act `intro` | 40–60 words | Atmosphere only; asks nothing of the player. |

Check with `node ../../tools/lint.mjs dee`.

## Voice

The consequence line is Dee annotating his own life in a second ink, years later. That
means: past-inflected, compressed, unsentimental, and often noticing the cost of a thing
he thought was free. *"The crate costs more than a year's living. It will also be the
reason great men climb your stairs."* Not: *"Your Navigate skill increased."*

The scene text is present-tense, second person, close. The player is in the room.

## What not to do

- Do not write the angels as characters with personalities the game vouches for.
- Do not resolve a scholarly dispute the scholarship has not resolved (Bonner, Enochian's
  status, whether Kelley believed anything). Write the dispute.
- Do not invent contact with Ibn Turka, Bruno, Agrippa, or any other series protagonist.
- Do not let a consequence announce a gate. Gates are silent until they are hit — that is
  the design, per GAMELOOP.md.
