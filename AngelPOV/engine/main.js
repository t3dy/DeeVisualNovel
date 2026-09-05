// main.js — the state machine.
//   title -> act_intro -> choice -> transmission -> ending
//
// Forked from ../../engine/main.js. Two differences that matter:
//   1. the consequence screen is a TRANSMISSION screen (what you said / what he wrote);
//   2. a three.js chamber runs behind everything, driven by the act — and its absence
//      is a supported state, not an error.

import { State } from './state.js?v=24';
import {
  renderTitle,
  renderActIntro,
  renderChoice,
  renderTransmission,
  renderEnding,
} from './ui.js?v=24';

// --- the chamber, loaded lazily and allowed to fail --------------------------
async function bootChamber() {
  const q = new URLSearchParams(location.search);
  const canvas = document.getElementById('chamber');
  if (!canvas || q.get('flat') === '1') return null;
  try {
    const { createChamber } = await import('./chamber.js?v=24');
    const ch = createChamber(canvas, {
      seed: Number(q.get('seed')) || 1583,
      debug: q.get('debug') === '1',
      noPost: q.get('nopost') === '1',
    });
    if (ch) canvas.classList.add('ready');
    return ch;
  } catch (e) {
    // three.js unreachable, WebGL refused, module blocked — all the same to the player.
    console.info('[chamber] not available; falling back to the flat ground.', e && e.message);
    return null;
  }
}

export async function boot(pack) {
  const data = await fetch(pack.choicesUrl, { cache: 'no-store' }).then((r) => r.json());
  const ACTS = data.acts;
  const NODES = data.choices;

  let PLATES = {};
  if (pack.platesUrl) {
    try {
      const reg = await fetch(pack.platesUrl, { cache: 'no-store' }).then((r) => r.json());
      PLATES = reg.plates || {};
    } catch (e) {
      /* a missing registry must never break the game */
    }
  }
  const plate = (id) =>
    id && PLATES[id] ? { src: PLATES[id].file, caption: PLATES[id].caption } : null;
  if (pack.frontispieceId) pack.frontispiece = plate(pack.frontispieceId);

  // The chamber is decoration with a job. Start it, do not wait on it.
  let chamber = null;
  bootChamber().then((c) => {
    chamber = c;
    if (!c) document.body.classList.add('no-chamber');
    else if (lastAct) chamber.setScene(pack.chamberFor(ACTS[lastAct - 1]));
  });

  function sceneText(node, s) {
    for (const v of node.text_variants || []) {
      if (Object.entries(v.when).every(([k, val]) => s.flags[k] === val)) return v.text;
    }
    return node.text;
  }

  let state = new State(pack);
  let screen = 'title';
  let lastAct = 0;

  function remaining() {
    return NODES.filter((n) => !(n.id in state.flags) && state.nodeAvailable(n));
  }
  function currentNode() {
    return remaining()[0] || null;
  }
  // Honest progress. The run length genuinely is not knowable mid-run -- choosing to
  // cross to the Continent at a10 unlocks eight nodes at once, so a "9 of 21" would
  // become "9 of 30" one screen later. Report the act instead, which is stable, plus
  // the count of choices actually made.
  function progress() {
    return { done: state.history.length + 1, acts: ACTS.length };
  }

  function step() {
    const node = currentNode();
    if (!node) return finish();
    const act = ACTS[node.act - 1];

    if (node.act !== lastAct) {
      lastAct = node.act;
      if (chamber) chamber.setScene(pack.chamberFor(act));
      screen = 'act_intro';
      return renderActIntro(
        act,
        () => {
          screen = 'choice';
          step();
        },
        pack.diagramFor ? pack.diagramFor(act, state) : null
      );
    }

    screen = 'choice';
    const opts = node.options.filter((o) => state.optionAvailable(o));
    renderChoice({ ...node, text: sceneText(node, state) }, act, state, opts, {
      progress: progress(),
      plate: plate(node.plate),
      // Qualitative, in-fiction orientation. The numbers stay hidden; see pack.stateReading.
      reading: pack.stateReading ? pack.stateReading(state) : null,
      onPick: (option) => {
        // Did the channel author this one? Decided BEFORE the choice is applied, since
        // applyChoice moves fidelity.
        const drifted = !!option.written_low && state.fidelityRatio < 0.65;
        state.applyChoice(node, option);
        state.save();

        // Appearing is the one mode that shows in the room.
        if (chamber) {
          const m = option.modes || {};
          if (m.appear >= 2) chamber.pulse(1);
          else if (m.appear || m.spell >= 3) chamber.pulse(0.45);
        }

        screen = 'transmission';
        renderTransmission(
          node,
          act,
          state.history[state.history.length - 1],
          drifted,
          option, // carries `mark` when this answer steps off the record
          () => step()
        );
      },
    });
  }

  function finish() {
    state.finished = true;
    const ending = pack.computeEnding(state);
    state.endingId = ending.id;
    state.save();
    screen = 'ending';
    if (chamber) {
      // The room at the end: whatever was still lit, dimmed, and the letters gone.
      chamber.setScene({ candles: 1, letters: 0, figures: 1, sigil: 0.08, tint: 0x8a8171 });
    }
    renderEnding(pack, ending, state, {
      onRestart: restart,
      plate: plate(pack.endingPlateId),
    });
  }

  function restart() {
    state.clear();
    state = new State(pack);
    lastAct = 0;
    title();
  }

  function title() {
    const saved = State.load(pack);
    screen = 'title';
    if (chamber) chamber.setScene({ candles: 1, letters: 0, figures: 1, sigil: 0.2, tint: 0x9fb4c4 });
    renderTitle(pack, !!saved && !saved.finished, {
      onStart: () => {
        state = new State(pack);
        lastAct = 0;
        step();
      },
      onResume: () => {
        state = saved;
        lastAct = 0;
        step();
      },
    });
  }

  title();

  // Debug handle, matching the workspace convention.
  window.__rmVN = {
    get state() { return state; },
    get screen() { return screen; },
    get nodes() { return NODES; },
    get remaining() { return remaining().map((n) => n.id); },
    get chamber() { return chamber; },
    restart,
    simulate(pick = 0) {
      const s = new State(pack);
      const chooser = typeof pick === 'function' ? pick : () => pick;
      let guard = 0;
      while (guard++ < 200) {
        const node = NODES.filter((n) => !(n.id in s.flags) && s.nodeAvailable(n))[0];
        if (!node) break;
        const opts = node.options.filter((o) => s.optionAvailable(o));
        const o = opts[Math.min(chooser(node, s), opts.length - 1)] || opts[0];
        s.applyChoice(node, o);
      }
      return { ending: pack.computeEnding(s), state: s };
    },
  };
}
