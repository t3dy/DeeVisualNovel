import { DIAGRAMS } from './diagrams.js?v=1';

// pack.js — the John Dee content pack. Everything protagonist-specific lives here;
// the engine (../../../engine/) knows none of it.
// Design: ../docs/NARRATIVE_DESIGN.md · Architecture: ../docs/CHOICE_ARCHITECTURE.md

export const pack = {
  id: 'dee',
  series: 'Renaissance Magic',
  title: 'Imperial Magus',
  tagline: 'John Dee, 1527–1608. A charge can be answered. A stain cannot.',
  premise:
    'Mathematician to a queen, owner of the greatest library in England, and — depending ' +
    'entirely on who is speaking — either the age’s most ambitious natural philosopher or ' +
    'its most notorious conjuror. You will spend a life trying to make mathematics, ' +
    'navigation, alchemy and the conversation of angels into one science, in the service ' +
    'of an empire that admires you and does not pay you.',
  groundingNote:
    'Every scene carries a mark in the margin saying how far the record supports it: ' +
    'the record holds this · the record is silent here · so it was later told · so it might have been. ' +
    'Built from the Dee scholarship of Parry, Harkness, Clulee, Sherman, Clucas and Szőnyi, ' +
    'and from Dee’s own diaries.',

  choicesUrl: './content/choices.json',
  platesUrl: './assets/registry.json',
  frontispieceId: 'ashmolean',
  endingPlateId: 'holy-table',
  nodesPerRun: 40,
  verbs: ['calculate', 'predict', 'experiment', 'invoke', 'navigate', 'map', 'persuade'],
  hiddenStates: ['angelic_authority', 'scholarly_credibility', 'political_utility'],
  quantities: ['stain', 'library', 'ottoman'],
  palettes: ['vellum', 'vellum-warm', 'glass', 'prague', 'faded'],
  endPalette: 'faded',

  // Act marks: original line drawings of Dee's own figures, not reproductions.
  // Provenance and rationale: ../assets/DIAGRAMS.md
  diagramFor(act) {
    return {
      1: DIAGRAMS.tetractys, // formation: number before anything else
      2: DIAGRAMS.compass,   // the nativity as a calculation of position
      3: DIAGRAMS.monas,     // the glyph itself, this act's whole business
      4: DIAGRAMS.compass,   // navigation, empire, the limits
      5: DIAGRAMS.sigillum,  // the seal cut in wax nine inches across
      6: DIAGRAMS.table,     // the Great Table, spelled letter by letter
      7: DIAGRAMS.shelf,     // the gaps you can read like a sentence
      8: DIAGRAMS.shelf,
    }[act.n];
  },

  // The ending journal as the library catalogue (NARRATIVE_DESIGN §4) — grouped by
  // theme, not chronology, which is GAMELOOP.md's diagnosed fix to Turka's "receipt."
  journalTitle: 'The Catalogue of the Library of Doctor Dee',
  journalGroups: [
    { title: 'What he asked',
      nodes: ['d05', 'd21', 'd22', 'd23', 'd24', 'd25', 'd27c', 'd28e', 'd36', 'd37'] },
    { title: 'Whom he told',
      nodes: ['d07', 'd11', 'd12', 'd14', 'd15', 'd28c', 'd32', 'd35'] },
    { title: 'What he kept',
      nodes: ['d02', 'd06', 'd13', 'd16', 'd29c', 'd29e', 'd38', 'd39', 'd40'] },
    { title: 'What was promised',
      nodes: ['d04', 'd10', 'd17', 'd18', 'd26', 'd27e', 'd33', 'o1', 'd30e'] },
    { title: 'What was scattered',
      nodes: ['d01', 'd03', 'd08', 'd09', 'd19', 'd20', 'd30c', 'd31', 'd34m', 'd34p'] },
  ],

  // Endings are chosen by RELATIVE dominance, not absolute cutoffs. A 40-node run
  // produces large totals (credibility ~26, political ~18, angelic ~11 on average), so
  // fixed thresholds either never fire or always do — tools/dist.mjs caught exactly that
  // (two endings at 0%, the documented one at 1.4%) and this is the fix. NORMS are the
  // measured means; re-run the audit and update them whenever the graph changes.
  norms: { scholarly_credibility: 26, political_utility: 18, angelic_authority: 11 },

  // The game NEVER adjudicates whether the angels were real. Every line below reports
  // only what happened socially and materially.
  computeEnding(s) {
    const f = s.flags;
    const q = s.quantities;
    const st = s.states;
    const coda = codaFor(s);
    const n = this.norms;
    const rc = st.scholarly_credibility / n.scholarly_credibility;
    const rp = st.political_utility / n.political_utility;
    const ra = st.angelic_authority / n.angelic_authority;
    const ruined = q.stain >= 12 && rc < 1.0;

    // 7 — COUNTERFACTUAL, rare, fully earned.
    if (f.ottoman_route === 'pursued' && q.ottoman >= 9) {
      return {
        id: 'sultans_astronomer',
        mark: 'so it might have been',
        title: 'The Sultan’s Astronomer',
        text:
          'You go east with the Turkey merchants, and at Constantinople you are received as ' +
          'what you have always insisted you were: a mathematician whose science includes the ' +
          'heavens and whose heavens include instruction. The court has a word for the kind of ' +
          'man who takes counsel from dreams, and it is not conjuror.',
        epilogue:
          'The record holds none of this. John Dee never sailed east; he died at Mortlake, ' +
          'poor, his library dispersed, his petition to be tried refused. The road was real ' +
          'enough to be imagined — Melvin-Koushki imagines it — and it was never taken.',
        coda,
      };
    }

    // --- the England branch (foreclosure #1 refused) -------------------------
    if (f.branch === 'england') {
      if (ruined) return conjuror(f, coda);
      if (q.library >= 3 && rc >= 0.95) {
        return {
          id: 'queens_philosopher',
          mark: 'the record is silent here',
          title: 'The Queen’s Philosopher',
          text:
            'You never crossed. Mortlake kept its roof, its shelves and its stream of ' +
            'visitors, and you grew old as the realm’s consulted mathematician — the man ' +
            'sent for about tides, calendars, comets and title to distant coasts.',
          epilogue:
            'A smaller life than the one on offer in 1583, and the game does not pretend ' +
            'otherwise. But the library survives you, which the real one did not.',
          coda,
        };
      }
      return {
        id: 'mortlake_recluse',
        mark: 'the record is silent here',
        title: 'The Master of Mortlake',
        text:
          'You stayed, and England slowly stopped sending. The house on the river kept its ' +
          'books and lost its visitors, and the word that followed you was not conjuror so ' +
          'much as old — which is the quieter way a country puts a man down.',
        epilogue:
          'Dee did cross, in September 1583, and lost the library for it. This is the life ' +
          'the record does not contain.',
        coda,
      };
    }

    // --- the Continental branch (the documented shape) -----------------------
    if (ruined) return conjuror(f, coda);

    if (f['treboň'] === 'consent' && rp >= rc && rp >= ra) {
      return {
        id: 'rudolfine_alchemist',
        mark: 'the record holds this',
        title: 'The Rudolfine Adept',
        text:
          'You kept the partnership and the powder and the protection, and the price was ' +
          'paid at home, in a household that never afterward recovered its ordinary peace. ' +
          'The furnaces ran. The work continued. Something else did not.',
        epilogue:
          'Kelley was knighted, imprisoned, and died in Bohemia. Jane Dee died of plague at ' +
          'Manchester in 1605. The covenant is in Dee’s own hand, and so is what came after.',
        coda,
      };
    }

    if (ra >= rc && ra >= rp) {
      return {
        id: 'servant_of_the_glass',
        mark: 'the record holds this',
        title: 'The Servant of the Glass',
        text:
          'You followed it to the end — across a continent, through an emperor’s courtesy and ' +
          'a nuncio’s attention, into whatever the stone asked of you, and home again to a ' +
          'house with gaps in the shelves where the answer to it should have been.',
        epilogue:
          st.angelic_authority >= 14
            ? 'You never once saw or heard any of it yourself. That is in the record too, in your own hand, on every page.'
            : 'By the end you had stopped being certain, and kept writing it down anyway. The uncertainty is in the record as plainly as the belief.',
        coda,
      };
    }

    if (rc >= rp) {
      return {
        id: 'mathematical_philosopher',
        mark: 'the record holds this',
        title: 'The Mathematical Philosopher',
        text:
          'You are read, in the end, by the people you wrote the Preface for — shipwrights, ' +
          'surveyors, gunners, men no university would admit — and it is they, not the court, ' +
          'who carry your name forward without the adjective attached.',
        epilogue:
          'The Mathematicall Praeface of 1570 outlived every slander made against its author ' +
          'and was still being reprinted when the last of his accusers were forgotten.',
        coda,
      };
    }

    return {
      id: 'imperial_geographer',
      mark: 'the record holds this',
      title: 'The Imperial Geographer',
      text:
        'The phrase was yours — the British Impire — assembled out of Arthur, Madoc, ' +
        'chronicles and charts, and handed to a Council that used it for three centuries ' +
        'without much remembering who made it.',
      epilogue:
        f.empire === 'limits'
          ? 'Dee’s Limits of the British Empire shaped English claims to the north-west long after his own petitions had stopped being answered.'
          : 'The work was useful, and being useful is not the same as being kept. The petitions went on going unanswered.',
      coda,
    };
  },
};

// Reachable from either branch: the Parry ending, where the slander simply wins.
function conjuror(f, coda) {
  return {
    id: 'conjuror_of_mortlake',
    mark: 'the record holds this',
    title: 'The Conjuror of Mortlake',
    text:
      'By the end there is no argument left to make, because nobody is arguing. The word ' +
      'arrived in rooms before you did and stayed after you had gone, and it was never ' +
      'a charge, so it was never answerable.',
    epilogue:
      f.petition === 'made'
        ? 'You asked the King to try you for your life so that you might be cleared. He did not refuse the charge — he refused the trial.'
        : 'You never asked to be tried. When Dee did ask, in 1604, he was refused.',
    coda,
  };
}

// The reception coda — TurkaGame's two-century-later beat (the Zīj-i Shāhjahānī move),
// shaded by how the player handled the record itself.
function codaFor(s) {
  const f = s.flags;
  if (f.last === 'burn' || f.record === 'sealed' || f.heir === 'chest') {
    return (
      'Sixty years on, a chest with a false bottom gives up what was hidden in it — some of ' +
      'it already used to line pie-dishes. In 1659 Méric Casaubon prints the conversations in ' +
      'order to damn them, and so preserves every word of them forever.'
    );
  }
  if (f.record === 'full' || f.last === 'keep') {
    return (
      'Because you recorded it exactly, with dates, in order, it survives being hated. Casaubon ' +
      'prints it in 1659 to prove you were deceived; Ashmole collects the relics; and four ' +
      'centuries later the argument about what happened in that room is still going, on your evidence.'
    );
  }
  return (
    'The papers scatter, and enough are gathered up again — by Cotton, by Ashmole, by accident — ' +
    'that the seventeenth century can print you as a warning and the twenty-first can read you ' +
    'as a scientist. Both are reading the same pages.'
  );
}
