// sim.mjs — headless playthroughs for "Spoken Backward". No browser.
// Verifies every run reaches an ending, foreclosure behaves, and all eight endings are
// reachable by *some* deliberate strategy.
//
// Usage: node tools/sim.mjs        (from angelpov/)
import { readFileSync } from 'node:fs';
import { State } from '../engine/state.js';

const base = new URL('../', import.meta.url);
const { pack } = await import(new URL('content/pack.js', base));
const data = JSON.parse(readFileSync(new URL('content/choices.json', base), 'utf8'));
const NODES = data.choices;
const MIN_RUN = 22;

function run(pick) {
  const s = new State(pack);
  let guard = 0;
  while (guard++ < 200) {
    const node = NODES.filter((n) => !(n.id in s.flags) && s.nodeAvailable(n))[0];
    if (!node) break;
    const opts = node.options.filter((o) => s.optionAvailable(o));
    if (!opts.length) throw new Error(`no available options at ${node.id}`);
    const o = opts[Math.min(pick(node, s), opts.length - 1)];
    s.applyChoice(node, o);
  }
  return { s, ending: pack.computeEnding(s) };
}

// Pick by option id where the strategy names one, else fall back to an index.
const by = (ids, fallback = 0) => (n) => {
  const i = n.options.findIndex((o) => ids.includes(o.id));
  return i >= 0 ? i : typeof fallback === 'function' ? fallback(n) : fallback;
};

const strategies = {
  'always first': () => 0,
  'always second': () => 1,
  'always third': () => 2,
  'stay in England': by(['keep'], 0),
  'the covenant': by(['deliver', 'take', 'send', 'grow'], 0),
  'withhold everything': by(['withhold_cov', 'unlawful', 'let', 'refuse', 'nothing', 'silence'], 2),
  'load Rudolf': by(['send', 'flatter_rudolf', 'urge', 'rozmberk'], 0),
  'load Elizabeth': by(['keep', 'british', 'withhold_cov', 'stay_west', 'petition'], 0),
  // The intended eastward chain: the road is built out of everything you decline to
  // say (a11 unnamed, a13 decline, a15 vanish, a16 hedge) and only then can be taken.
  'the eastward road': by(
    ['send', 'unnamed', 'decline', 'vanish', 'hedge', 'rozmberk', 'withhold_cov',
     'east', 'monas_arabic', 'millennium_east'],
    0
  ),
  'eastward, told him': by(
    ['send', 'unnamed', 'decline', 'vanish', 'praise', 'rozmberk', 'withhold_cov',
     'east_truth', 'quiet_east', 'compare'],
    0
  ),
  'high millennium': by(['burning', 'affirm_year', 'crusade', 'repent_rudolf'], 0),
  'print it': by(['let_print', 'stay_hand', 'record'], 0),
  random: (n) => Math.floor(Math.random() * n.options.length),
};

let fail = 0;
const seen = new Map();
console.log(`nodes authored: ${NODES.length}\n`);

for (const [name, pick] of Object.entries(strategies)) {
  const reps = name === 'random' ? 200 : 1;
  for (let i = 0; i < reps; i++) {
    const { s, ending } = run(pick);
    seen.set(ending.id, (seen.get(ending.id) || 0) + 1);
    const n = s.history.length;
    // Derived, not hardcoded: the ceiling is everything authored, and the floor is the
    // shortest legitimate life (the England branch forecloses Krakow, Prague, Trebon and
    // the covenant). A run outside this either terminated early or looped.
    if (n < MIN_RUN || n > NODES.length) {
      fail++;
      console.log(`  FAIL ${name}: ${n} nodes (expected ${MIN_RUN}..${NODES.length})`);
    }
    for (const h of s.history) {
      if (h.consequence == null) { fail++; console.log(`  FAIL ${h.id}: no consequence`); }
      if (h.written === undefined) { fail++; console.log(`  FAIL ${h.id}: no transmission`); }
    }
    if (i === 0 && name !== 'random') {
      const q = s.quantities;
      console.log(
        `${name.padEnd(22)} ${String(n).padStart(2)}n  ${ending.id.padEnd(20)}` +
          ` en=${String(q.crown_english).padStart(2)} im=${String(q.crown_imperial).padStart(2)}` +
          ` ot=${String(q.crown_ottoman).padStart(2)} mil=${String(q.millennium).padStart(2)}` +
          `  fid=${s.states.fidelity} obe=${s.states.obedience} not=${s.states.notice}`
      );
    }
  }
}

const all = [
  'sultans_angels', 'stone_goes_dark', 'the_covenant', 'the_year_that_came',
  'true_and_faithful', 'habsburg_silence', 'tides_and_title', 'long_way_round',
];
console.log(`\nendings reached (${seen.size}/8):`);
for (const id of all) {
  const hit = seen.get(id) || 0;
  if (!hit) fail++;
  console.log(`  ${hit ? 'ok  ' : 'MISS'} ${id.padEnd(20)} ${hit}`);
}
console.log(fail ? `\n${fail} FAILURES` : '\nall runs OK');
process.exit(fail ? 1 : 0);
