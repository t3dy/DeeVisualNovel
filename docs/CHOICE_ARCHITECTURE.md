# Choice Architecture — Coverage and Foreclosure

## The rule (user decision, 2026-08-31)

> Every key event of Dee's life appears as a node, **unless the player's own choices have
> made it impossible** — and the foreclosing choices must be chosen very carefully,
> because they are where scope creep lives.

Two consequences, and they pull against each other:

1. **Coverage is the default.** A playthrough should touch the whole documented life. The
   scene *happens*; what varies is its content, its available options, and what it costs.
   This is the Turka state-model discipline: divergence comes from scenes reading state,
   not from scenes being skipped.
2. **Foreclosure is rare, and only ever physical.** A node may be foreclosed only when the
   player's choice makes the event *literally impossible* — almost always because Dee is
   on the wrong continent. Never because he is "the wrong kind of scholar." Ideological
   divergence changes what a scene *is*; geography changes whether it *can occur*.

## The three foreclosure points — and nothing else

| # | Choice | What it forecloses | Authoring cost |
|---|---|---|---|
| **1** | **d26** (Act VI): cross to the Continent with Łaski, or refuse | The whole Continental sequence — Cracow, Rudolf, the Prague burning, Třeboň — versus the English sequence Dee historically never had. | **4 alternate nodes.** The only real branch in the game. |
| **2** | **d33** (Act VII): accept the Manchester wardenship, or refuse it | The Manchester material (the college, Darrell, the fellows) versus staying poor at Mortlake. | **1 alternate node.** |
| **3** | **Ottoman cultivation** (across IV–VI, threshold-gated) | *Additive, not subtractive* — one extra node (**o1**, the invitation) and the rare ending. Forecloses nothing. | **1 extra node.** |

Total authored nodes: **40 played per run**, **46 authored** (40 + 4 + 1 + 1). That is the
scope ceiling, and it is deliberately small. Any future proposal to add a fourth
foreclosure point should be rejected unless it removes an existing one.

### Why d26 earns its cost

The 1583 departure is the hinge of the actual life — everything after it (the library's
destruction, Prague, Kelley's ascendancy, Třeboň, the return to ruin) descends from it.
A game about Dee that cannot ask "what if he had stayed?" has no thesis. And the English
branch is not invention: it is built from documented English material Dee's absence
displaced — the Armada year, Whitgift's counter-revolution against magic, the Prestall
and Murphyn slander war, the library intact and Mortlake still an academy. The historical
attractors still land; they land differently.

### Why nothing else forecloses

Every other temptation to branch is better served by *varying* the node:

- Refusing to invoke doesn't remove Act V — it makes Act V a man at a stone that stays
  dark, which is a better scene than no scene.
- Never publishing doesn't remove the *Monas* — Dee wrote it; the choice is what it is
  and who reads it.
- Losing the Queen's favor doesn't remove the court — it makes the court a room where he
  waits.

## The node table

Acts I–V and VIII are linear five-node acts. Only Act VI forks.

| Act | Nodes | Fork |
|---|---|---|
| I — The Trellis (1542–51) | d01–d05 | — |
| II — The Horoscope (1552–58) | d06–d10 | — |
| III — The Election (1558–70) | d11–d15 | — |
| IV — The Limits (1570–82) | d16–d20 | — |
| V — The Glass (1581–83) | d21–d25 | — |
| VI — The Crossing (1583–89) | d26, then **d27–d30 in `c` (Continental) or `e` (English) variants**, plus optional **o1** | **yes** |
| VII — The Petition (1589–1605) | d31–d35, with **d34** in `m` (Manchester) or `p` (poverty) variants | minor |
| VIII — The Catalogue (1605–09) | d36–d40 | — |

## Engine requirement

The engine filters the flat node list by an optional `requires` object (flag equality)
before presenting the next node. A run therefore walks 40 of the 46 authored nodes, and
the act structure stays fixed at five beats regardless of branch — which preserves the
8–12 minute replay budget the whole series depends on.

## State

**Verbs (visible, quiet):** `calculate, predict, experiment, invoke, navigate, map,
persuade`.

**Hidden states (never shown):** `angelic_authority`, `scholarly_credibility`,
`political_utility`. Felt only through how the world responds. Per the no-ground-truth
rule, no screen ever displays them — you cannot optimize what you cannot see.

**Tracked quantities:** `stain` (the Parry meter — rises easily, falls almost never),
`library` (built in Acts III–IV, spent or scattered in VI–VIII), `ottoman` (the
cultivation score gating o1 and ending #7).

**Flags:** one per node, value = chosen option id, exactly as TurkaGame.
