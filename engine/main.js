// main.js — the state machine. title -> act_intro -> choice -> consequence -> ending
// Protagonist-neutral: everything specific arrives through the content pack.

import { State } from './state.js?v=3';
import { renderTitle, renderActIntro, renderChoice, renderConsequence, renderEnding } from './ui.js?v=3';

export async function boot(pack) {
  const data = await fetch(pack.choicesUrl, { cache: 'no-store' }).then((r) => r.json());
  const ACTS = data.acts;
  const NODES = data.choices;

  // Period-image plates, if the pack ships a registry (assets/registry.json).
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
  if (pack.endingPlateId) pack.endingPlate = plate(pack.endingPlateId);

  // A node's text can vary on earlier flags (text_variants: [{when, text}], first
  // match wins) — how one authored scene reads differently in different lives,
  // the Turka reactive-scene mechanism carried over.
  function sceneText(node, s) {
    for (const v of node.text_variants || []) {
      if (Object.entries(v.when).every(([k, val]) => s.flags[k] === val)) return v.text;
    }
    return node.text;
  }

  let state = new State(pack);
  let screen = 'title';
  let lastAct = 0;
  let pending = null;

  // The run's node list is computed lazily: foreclosure depends on flags set as we go,
  // so we always ask "what is the next available node after the ones already answered?"
  function remaining() {
    return NODES.filter((n) => !(n.id in state.flags) && state.nodeAvailable(n));
  }
  function currentNode() {
    return remaining()[0] || null;
  }
  function progress() {
    return { done: state.history.length + 1, total: pack.nodesPerRun };
  }

  function step() {
    const node = currentNode();
    if (!node) return finish();
    if (node.act !== lastAct) {
      lastAct = node.act;
      screen = 'act_intro';
      return renderActIntro(
        ACTS[node.act - 1],
        () => {
          screen = 'choice';
          step();
        },
        pack.diagramFor ? pack.diagramFor(ACTS[node.act - 1], state) : null
      );
    }
    screen = 'choice';
    const opts = node.options.filter((o) => state.optionAvailable(o));
    renderChoice({ ...node, text: sceneText(node, state) }, ACTS[node.act - 1], state, opts, {
      progress: progress(),
      plate: plate(node.plate),
      onPick: (option) => {
        state.applyChoice(node, option);
        state.save();
        // The composed long beat, where authored (GAMELOOP.md's diagnosed fix for
        // the highest-stakes choices); the single line everywhere else.
        pending = option.consequence_long || option.consequence;
        screen = 'consequence';
        renderConsequence(pending, () => step());
      },
    });
  }

  function finish() {
    state.finished = true;
    const ending = pack.computeEnding(state);
    state.endingId = ending.id;
    state.save();
    screen = 'ending';
    renderEnding(ending, state, pack, restart);
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

  // Debug handle, matching the workspace convention (window.__turkaVN etc.)
  window.__rmVN = {
    get state() { return state; },
    get screen() { return screen; },
    get nodes() { return NODES; },
    get remaining() { return remaining().map((n) => n.id); },
    restart,
    // Play a whole run by picking option index `pick` (or a function) at every node.
    // Used by tools/sim.mjs and for manual verification of gates and endings.
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
