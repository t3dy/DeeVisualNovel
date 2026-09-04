// state.js — run state for "Spoken Backward".
//
// Forked from ../../engine/state.js and kept deliberately API-compatible with it:
// `verbs` is exposed as a read alias for `modes` so the existing tools (sim/dist/lint)
// can be pointed at this pack without special-casing. See ../DESIGN.md §7.

export class State {
  constructor(pack) {
    this.packId = pack.id;
    this.index = 0; // index into the *filtered* node list for this run
    this.modes = Object.fromEntries(pack.modes.map((m) => [m, 0]));
    this.states = Object.fromEntries(pack.hiddenStates.map((s) => [s, 0]));
    this.quantities = Object.fromEntries(pack.quantities.map((q) => [q, 0]));
    this.flags = {};
    this.history = [];
    this.finished = false;
    this.endingId = null;
  }

  // Read alias so protagonist-neutral tooling keeps working.
  get verbs() {
    return this.modes;
  }

  get saveKey() {
    return `rm_vn_${this.packId}_v1`;
  }

  // --- gating -------------------------------------------------------------

  nodeAvailable(node) {
    if (node.requires && !this._flagsMatch(node.requires)) return false;
    if (node.requires_min && !this._minMatch(node.requires_min)) return false;
    return true;
  }

  optionAvailable(option) {
    if (option.gate && !this._flagsMatch(option.gate)) return false;
    // Quantity gate: an option only offered once a vector has actually been loaded.
    // This is what keeps the eastward road from being a coin-flip in 1604 — it has to
    // have been paid for in 1586. Not in the Dee engine; added here.
    if (option.gate_min && !this._minMatch(option.gate_min)) return false;
    if (option.capability_gate) {
      for (const [mode, min] of Object.entries(option.capability_gate)) {
        if ((this.modes[mode] || 0) < min) return false;
      }
    }
    return true;
  }

  _flagsMatch(obj) {
    return Object.entries(obj).every(([k, v]) => this.flags[k] === v);
  }

  _minMatch(obj) {
    return Object.entries(obj).every(
      ([k, v]) => (this.quantities[k] ?? this.modes[k] ?? this.states[k] ?? 0) >= v
    );
  }

  // --- applying a choice --------------------------------------------------

  applyChoice(node, option) {
    this.flags[node.id] = option.id;
    for (const [k, v] of Object.entries(option.flags || {})) this.flags[k] = v;
    for (const [k, v] of Object.entries(option.modes || {})) {
      if (k in this.modes) this.modes[k] += v;
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
      said: option.said,
      written: this.transmissionFor(option),
      consequence: option.consequence,
    });
  }

  // --- the channel --------------------------------------------------------
  //
  // The load-bearing rule of this game: what you said is not what was written down.
  // Where an option supplies `written_low`, it renders once fidelity has fallen far
  // enough that Kelley is demonstrably authoring content — used only at nodes where the
  // record itself shows that happening.

  get fidelityRatio() {
    // Normalised against the count of choices made, so it reads the same at node 3 and
    // node 28. Starts neutral (1) before anything has been said.
    const n = this.history.length;
    if (n === 0) return 1;
    return this.states.fidelity / (n * 0.55);
  }

  transmissionFor(option) {
    if (option.written_low && this.fidelityRatio < 0.65) return option.written_low;
    return option.written;
  }

  // --- derived readings ---------------------------------------------------

  dominantMode() {
    return Object.entries(this.modes).sort((a, b) => b[1] - a[1])[0][0];
  }

  totalModes() {
    return Object.values(this.modes).reduce((a, b) => a + b, 0);
  }

  // --- persistence --------------------------------------------------------

  save() {
    try {
      localStorage.setItem(
        this.saveKey,
        JSON.stringify({
          index: this.index,
          modes: this.modes,
          states: this.states,
          quantities: this.quantities,
          flags: this.flags,
          history: this.history,
          finished: this.finished,
          endingId: this.endingId,
        })
      );
    } catch (e) {
      /* private mode, quota — a save is a convenience, never a requirement */
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
