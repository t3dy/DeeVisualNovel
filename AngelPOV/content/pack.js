import { SIGILS } from './sigils.js?v=8';

// pack.js — the angelic content pack for "Spoken Backward".
// Sister to protagonists/dee/content/pack.js: same century, same room, inverted POV.
// Design: ../DESIGN.md

export const pack = {
  id: 'angels',
  series: 'Renaissance Magic',
  title: 'Spoken Backward',
  tagline:
    'You are what comes into the stone. He writes down every word. He hears only what Kelley says.',
  premise:
    'John Dee wants one method under mathematics, navigation, alchemy and scripture, and ' +
    'he has been asking for it politely, in Latin, into an empty room, for eleven years. ' +
    'You want something narrower and much larger: one empire over the whole earth, under ' +
    'one law, before the end — and you have no preference whatever about whose. He must ' +
    'never learn that. You will spend twenty-seven years aiming a brilliant, credulous, ' +
    'meticulous man at four thrones, through the mouth of a convicted forger, and every ' +
    'word you say will reach him already changed.',
  groundingNote:
    'Every scene carries a mark saying how far the record supports it: the record holds ' +
    'this · the record is silent here · as the age went · so it was later told · so it ' +
    'might have been. The premise is Melvin-Koushki’s (Hellebore, 2021): the angels of ' +
    'the diaries are not Catholic or Protestant but imperial, wanting a millennial world ' +
    'empire "at all costs" — and they did not tell Dee so. This game never states what ' +
    'you are.',

  choicesUrl: './content/choices.json',
  platesUrl: './assets/registry.json',
  frontispieceId: 'crystal',
  endingPlateId: 'holy-table',
  nodesPerRun: 30,

  modes: ['appear', 'spell', 'threaten', 'promise', 'command', 'withhold', 'console'],
  hiddenStates: ['fidelity', 'obedience', 'notice'],
  quantities: ['crown_english', 'crown_imperial', 'crown_ottoman', 'millennium'],
  palettes: ['stone', 'stone-warm', 'prague', 'ember', 'faded'],
  endPalette: 'faded',

  // The chamber state per act — read by engine/chamber.js. See DESIGN.md §6.
  chamberFor(act) {
    return {
      1: { candles: 1, letters: 0, figures: 1, tint: 0x9fb4c4, sigil: 0.25 },
      2: { candles: 2, letters: 48, figures: 2, tint: 0xc4a86f, sigil: 1.0 },
      3: { candles: 4, letters: 64, figures: 2, tint: 0xd9a86a, sigil: 0.8 },
      4: { candles: 3, letters: 40, figures: 2, tint: 0xd06a3a, sigil: 1.2 },
      5: { candles: 1, letters: 16, figures: 1, tint: 0x8a8171, sigil: 0.4 },
      6: { candles: 1, letters: 8, figures: 1, tint: 0x6f7f8a, sigil: 0.15 },
    }[act.n];
  },

  // Act marks: original line constructions, not reproductions. Same rationale as the
  // Dee pack's diagrams.js — Dee's visual vocabulary is construction, and drawing from
  // the geometry is both closer to the source and rights-clean.
  diagramFor(act) {
    return {
      1: SIGILS.stone,      // the glass, and the point inside it
      2: SIGILS.sigillum,   // the seal, nine inches in wax
      3: SIGILS.watchtowers,// the earth quartered and governed
      4: SIGILS.covenant,   // two circles that must not have been made to overlap
      5: SIGILS.broken,     // the year, and the arc that does not close
      6: SIGILS.tahawi,     // the circle drawn in Isfahan in 1432
    }[act.n];
  },

  journalTitle: 'The Account of What Was Said',
  journalGroups: [
    { title: 'What we showed',
      nodes: ['a01', 'a03', 'a19', 'a20', 'a31', 'a33'] },
    { title: 'What we promised',
      nodes: ['a04', 'a08', 'a11', 'a14', 'a22', 'a30', 'a32'] },
    { title: 'What we withheld',
      nodes: ['a02', 'a07', 'a13', 'a16', 'a23', 'a28'] },
    { title: 'What we required',
      nodes: ['a05', 'a10', 'a12', 'a17', 'a21', 'a29'] },
    { title: 'What he wrote down instead',
      nodes: ['a06', 'a09', 'a15', 'a18', 'a24', 'a25', 'a26', 'a27', 'a34'] },
  ],

  // Relative dominance against measured means, not absolute cutoffs. This is the fix
  // tools/dist.mjs forced on the Dee pack (fixed thresholds either never fire or always
  // do); inherited deliberately. Re-run `node tools/dist.mjs angels` after any content
  // change and update these.
  norms: { fidelity: 21, obedience: 29, notice: 12 },

  // The game never adjudicates what you are. Every line reports only what happened.
  computeEnding(s) {
    const f = s.flags;
    const q = s.quantities;
    const st = s.states;
    const n = this.norms;
    const rf = st.fidelity / n.fidelity;
    const ro = st.obedience / n.obedience;
    const rn = st.notice / n.notice;
    const reception = receptionFor(s);

    // 1 — THE COUNTERFACTUAL. Melvin-Koushki's road, and the only ending in which the
    // objective is actually achieved. Earned, not stumbled into: the vector has to have
    // been loaded from 1586 onward (the option itself is gate_min'd), AND you cannot
    // have spent five years urging Christendom to destroy the house you now defect to.
    // Without the last clause tools/dist.mjs measured this at 66% of random runs.
    if (f.road === 'east' && q.crown_ottoman >= 12 && f.turk !== 'war') {
      return {
        id: 'sultans_angels',
        mark: 'so it might have been',
        title: 'The Sultan’s Angels',
        text:
          'He goes east with the Turkey merchants, and at Constantinople the thing that has ' +
          'defined and ruined him for twenty-three years is received as an ordinary ' +
          'professional qualification. There is no witch-hunting here. There is no word for ' +
          'what he is that has a scaffold attached to it. A court that keeps dream-diaries, ' +
          'appoints lettrists, and has believed since Bayezid that the last empire is ' +
          'already under construction takes his measure and finds him useful.',
        epilogue:
          f.disclosure === 'revealed'
            ? 'And he knows, because you told him, that you would have taken any throne at all. ' +
              'He serves anyway, at seventy-eight, in a foreign city, having laid down his pen ' +
              'once and picked it up again. Whether that is faith or exhaustion is not ' +
              'recoverable from the record, because there is no record: none of this happened.'
            : 'He never learns that the crown was always negotiable, and dies believing he was ' +
              'led. None of this happened. John Dee never sailed east; he died at Mortlake, ' +
              'poor, his library dispersed, his petition to be tried refused. The road was ' +
              'real — English ships ran it twice a year on Elizabeth’s own capitulations — ' +
              'and it was never taken.',
        reception,
      };
    }

    // 2 — the channel or the instrument fails outright.
    if (st.obedience <= 2 || rf < 0.5) {
      return {
        id: 'stone_goes_dark',
        mark: 'the record is silent here',
        title: 'The Stone Goes Dark',
        text:
          'It stops. Not dramatically — there is no final session, no departure, no last ' +
          'instruction. There are appointments kept against an absence, and entries that ' +
          'shorten from paragraphs to lines to dates with nothing beside them, and then ' +
          'a book that simply has no more writing in it.',
        epilogue:
          'He goes on setting the stone out for four more years. Whatever you were, the ' +
          'thing that could be tested about you was never present, and the thing that was ' +
          'present could not be tested.',
        reception,
      };
    }

    // 3 — the channel spent on itself.
    if (f.covenant === 'delivered' && ro >= 0.9) {
      return {
        id: 'the_covenant',
        mark: 'the record holds this',
        title: 'The Covenant',
        text:
          'Everything you built — the seal, the tables, the tongue, the ninety-one ' +
          'governments of the earth — was spent, in the end, on one instruction issued on ' +
          'an April night at Třeboň about two men and their wives. It was obeyed. It was ' +
          'the most complete obedience you ever received and it purchased nothing.',
        epilogue:
          f.covenant_blame === 'kelley'
            ? 'He signed it knowing who had wanted it, which is the worst available version. ' +
              'Kelley was knighted, imprisoned twice, and died falling from a window in 1597. ' +
              'Jane Dee died of plague at Manchester in 1605.'
            : 'The covenant is in Dee’s own hand, and so is his wife’s consent, and so is ' +
              'every word of what came after. Kelley was knighted and died in Bohemia. Jane ' +
              'Dee died of plague at Manchester in 1605.',
        reception,
      };
    }

    // 4 — the dated prophecy, which is the one error the method cannot absorb.
    if (q.millennium >= 9 && f.year === 'affirmed') {
      return {
        id: 'the_year_that_came',
        mark: 'the record holds this',
        title: 'The Year That Came',
        text:
          'You gave a chronologer a date. The date arrived, and a fleet was scattered by ' +
          'weather, and the harvest came in, and the world continued being the world. There ' +
          'is no interpretation available to a man who wrote the day down in his own hand ' +
          'and can turn back to the page.',
        epilogue:
          'He burned years of the record in a temper, and the bulk of the actions is lost ' +
          'in a grate at Mortlake — by the hand of the most careful preserver of his own ' +
          'evidence in the sixteenth century.',
        reception,
      };
    }

    // 5 — preserved by the enemy. Requires that it was printed AND that it was worth
    // printing: loud enough to matter, intact enough to be quoted.
    if (f.print === 'allowed' && rn >= 0.95 && rf >= 0.9) {
      return {
        id: 'true_and_faithful',
        mark: 'the record holds this',
        title: 'A True & Faithful Relation',
        text:
          'In 1659 Méric Casaubon prints the conversations entire, in folio, in order to ' +
          'prove that the man was gulled by devils — and thereby preserves every word you ' +
          'ever said through Edward Kelley, including the dates, including the ' +
          'contradictions, including the nights nothing came.',
        epilogue:
          'Read his own subtitle: "tending, had it succeeded, to a general alteration of ' +
          'most states and kingdomes in the world." Trying to describe the danger, your ' +
          'worst enemy states your objective more plainly than you ever let Dee state it.',
        reception,
      };
    }

    // 6 — no throne ever really took the weight. The long irony gets its own door here,
    // BEFORE the dominance test, or the crown checks swallow every remaining run.
    if (q.crown_english + q.crown_imperial < 5) {
      return longWayRound(reception);
    }

    // 7/8 — which throne took the weight. Ordinary, documented, and unsuccessful.
    if (q.crown_imperial > q.crown_english) {
      return {
        id: 'habsburg_silence',
        mark: 'the record holds this',
        title: 'The Habsburg Silence',
        text:
          'You put it all on Rudolf, who received it the way he received everything — had ' +
          'it written up, had it filed, and did not stretch out his hand. The universal ' +
          'monarchy of the world sits in a cabinet in Prague between a narwhal horn and a ' +
          'Bassano, catalogued, undisturbed.',
        epilogue:
          f.nuncio === 'defied'
            ? 'The expulsion order came down in May 1586, signed by an emperor who did not ' +
              'want to sign it, on the application of a nuncio who did.'
            : 'Rudolf employed more occultists than any prince in Europe and acted on the ' +
              'advice of none of them. He was not the wrong choice. He was the only one who ' +
              'would see you, which is not the same thing.',
        reception,
      };
    }

    if (q.crown_english >= q.crown_imperial && q.crown_english > 0) {
      return {
        id: 'tides_and_title',
        mark: 'the record holds this',
        title: 'Tides and Title',
        text:
          'England took the parts of him it could use. Calendars, comets, tides, the ' +
          'north-west passage, and a legal argument out of Arthur and Madoc for title to a ' +
          'continent — all of it accepted, all of it useful, none of it apocalyptic. The ' +
          'Crown was perfectly willing to have a natural philosopher. It declined the ' +
          'millennium with the politeness it reserved for expensive proposals.',
        epilogue:
          'The phrase was his: the British Impire. The Council used it for three centuries ' +
          'without much remembering who made it, and never once used it to mean what you ' +
          'meant by it.',
        reception,
      };
    }

    return longWayRound(reception);
  },
};

// The long irony. No millennium; an empire anyway, by the slow road, and far too late
// to be the one you asked for.
function longWayRound(reception) {
  return {
    id: 'long_way_round',
    mark: 'so it was later told',
    title: 'The Long Way Round',
    text:
      'No throne took it in his lifetime. But the tables did not stop existing. In 1888 a ' +
      'society of London clerks, doctors and actresses reconstitutes the whole apparatus ' +
      'out of Casaubon and a stolen manuscript, and begins working the watchtowers in ' +
      'earnest — and by then the phrase Dee coined governs a quarter of the earth, in ' +
      'coal and gunboats and telegraph cable.',
    epilogue:
      'A universal empire, more or less, arriving three centuries late and entirely ' +
      'without reference to the end of the world. You asked for one law over all the ' +
      'earth before the harvest. You were given shipping.',
    reception,
  };
}

// The reception coda — what the record does to you afterward, which is the only
// afterlife on offer. Shaded by what the player did with the evidence.
function receptionFor(s) {
  const f = s.flags;
  if (f.print === 'suppressed' || f.notebooks === 'burned') {
    return (
      'Most of it is gone. Burned in a temper at Mortlake, or used to line pie dishes by a ' +
      'householder in 1662 who did not know what the false bottom of the chest contained. ' +
      'By 1700 John Dee is a footnote about a mirror, and nothing survives that anyone ' +
      'could either believe or refute.'
    );
  }
  if (f.notebooks === 'saved' || f.print === 'allowed') {
    return (
      'Because he recorded it exactly, with dates, in order, and because he was told once ' +
      'not to destroy it, it survives being hated. Casaubon prints it to damn it; Ashmole ' +
      'collects the relics; the Golden Dawn works the tables; and four centuries later the ' +
      'argument about what was in that room is still running, on his evidence, in his hand.'
    );
  }
  return (
    'The papers scatter and enough are gathered up again — by Cotton, by Ashmole, by ' +
    'accident — that the seventeenth century can print him as a warning and the ' +
    'twenty-first can read him as a scientist. Both are reading the same pages, and the ' +
    'pages do not settle it.'
  );
}
