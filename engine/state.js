// state.js — protagonist-neutral run state for the Renaissance Magic engine.
// Generalized from TurkaGame's games/visual-novel/js/state.js:
//   - `skills` (fixed Occult Quintet) -> `verbs` (declared by the content pack)
//   - `skill_gate`                    -> `capability_gate`
//   - new: hidden states, quantities, and `requires` for foreclosed nodes
// See ../docs/ENGINE_SPEC.md.

export class State {
  constructor(pack) {
    this.packId = pack.id;
    this.index = 0; // index into the *filtered* node list for this run
    this.verbs = Object.fromEntries(pack.verbs.map((v) => [v, 0]));
    this.states = Object.fromEntries(pack.hiddenStates.map((s) => [s, 0]));
    this.quantities = Object.fromEntries(pack.quantities.map((q) => [q, 0]));
    this.flags = {}; // node id -> chosen option id, plus named flags from options
    this.history = []; // {id, act, optionId, label, consequence, date, grounding}
    this.finished = false;
    this.endingId = null;
  }

  get saveKey() {
    return `rm_vn_${this.packId}_v1`;
  }

  // --- gating -------------------------------------------------------------

  // Does this NODE occur at all in this run? Foreclosure only (see
  // ../docs/... CHOICE_ARCHITECTURE.md): geography, not ideology.
  nodeAvailable(node) {
    if (node.requires && !this._flagsMatch(node.requires)) return false;
    if (node.requires_min && !this._minMatch(node.requires_min)) return false;
    return true;
  }

  // Is this OPTION offered? Content divergence lives here.
  optionAvailable(option) {
    if (option.gate && !this._flagsMatch(option.gate)) return false;
    if (option.capability_gate) {
      for (const [verb, min] of Object.entries(option.capability_gate)) {
        if ((this.verbs[verb] || 0) < min) return false;
      }
    }
    return true;
  }

  _flagsMatch(obj) {
    return Object.entries(obj).every(([k, v]) => this.flags[k] === v);
  }

  _minMatch(obj) {
    return Object.entries(obj).every(
      ([k, v]) => (this.quantities[k] ?? this.verbs[k] ?? this.states[k] ?? 0) >= v
    );
  }

  // --- applying a choice --------------------------------------------------

  applyChoice(node, option) {
    this.flags[node.id] = option.id;
    for (const [k, v] of Object.entries(option.flags || {})) this.flags[k] = v;
    for (const [k, v] of Object.entries(option.verbs || {})) {
      if (k in this.verbs) this.verbs[k] += v;
    }
    for (const [k, v] of Object.entries(option.states || {})) {
      if (k in this.states) this.states[k] += v;
    }
    for (const q of Object.keys(this.quantities)) {
      if (q in option) this.quantities[q] += option[q];
    }
    this.history.push({
      id: node.id,
      act: node.act,
      date: node.date,
      grounding: node.grounding,
      event: node.event,
      optionId: option.id,
      label: option.label,
      consequence: option.consequence,
    });
  }

  // --- derived readings ---------------------------------------------------

  dominantVerb() {
    return Object.entries(this.verbs).sort((a, b) => b[1] - a[1])[0][0];
  }

  totalVerbs() {
    return Object.values(this.verbs).reduce((a, b) => a + b, 0);
  }

  // --- persistence --------------------------------------------------------

  save() {
    try {
      localStorage.setItem(
        this.saveKey,
        JSON.stringify({
          index: this.index,
          verbs: this.verbs,
          states: this.states,
          quantities: this.quantities,
          flags: this.flags,
          history: this.history,
          finished: this.finished,
          endingId: this.endingId,
        })
      );
    } catch (e) {
      /* private mode, quota, etc. — a save is a convenience, never a requirement */
    }
  }

  static load(pack) {
    const s = new State(pack);
    try {
      const raw = localStorage.getItem(s.saveKey);
      if (!raw) return null;
      Object.assign(s, JSON.parse(raw));
      return s;
    } catch (e) {
      return null;
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.saveKey);
    } catch (e) {
      /* ignore */
    }
  }
}
