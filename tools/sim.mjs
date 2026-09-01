// sim.mjs — headless playthroughs, no browser. Verifies that every run reaches an
// ending, that node counts are sane, and that foreclosure/gates behave.
// Usage: node tools/sim.mjs [protagonist=dee]
import { readFileSync } from 'node:fs';
import { State } from '../engine/state.js';

const who = process.argv[2] || 'dee';
const base = new URL(`../protagonists/${who}/`, import.meta.url);
const { pack } = await import(new URL('content/pack.js', base));
const data = JSON.parse(readFileSync(new URL('content/choices.json', base), 'utf8'));
const NODES = data.choices;

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

const strategies = {
  'always first': () => 0,
  'always second': () => 1,
  'always third': () => 2,
  'stay in England': (n) => (n.id === 'd26' ? 1 : 0),
  'cross, angels': (n) => (n.id === 'd26' ? 0 : n.options.length > 2 ? 0 : 0),
  'cross, sceptic': (n) => (n.id === 'd26' ? 0 : 1),
  'eastward': (n) => {
    const i = n.options.findIndex((o) => (o.ottoman || 0) > 0 || o.id === 'pursue');
    return i >= 0 ? i : 0;
  },
  random: (n) => Math.floor(Math.random() * n.options.length),
};

let fail = 0;
const seen = new Set();
console.log(`nodes authored: ${NODES.length}\n`);
for (const [name, pick] of Object.entries(strategies)) {
  for (let i = 0; i < (name === 'random' ? 40 : 1); i++) {
    const { s, ending } = run(pick);
    seen.add(ending.id);
    const n = s.history.length;
    const ok = n >= 38 && n <= 42;
    if (!ok) { fail++; console.log(`  FAIL ${name}: ${n} nodes`); }
    if (i === 0) {
      console.log(
        `${name.padEnd(16)} ${String(n).padStart(2)} nodes  ${ending.id.padEnd(24)}` +
        ` stain=${s.quantities.stain} lib=${s.quantities.library} ott=${s.quantities.ottoman}`
      );
    }
  }
}
console.log(`\nendings reached (${seen.size}): ${[...seen].join(', ')}`);
console.log(fail ? `\n${fail} FAILURES` : '\nall runs OK');
process.exit(fail ? 1 : 0);
