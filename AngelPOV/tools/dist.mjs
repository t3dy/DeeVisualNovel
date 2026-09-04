// dist.mjs — ending-distribution audit, and the source of the `norms` in pack.js.
//
// This tool exists because the Dee pack shipped with absolute thresholds and this audit
// showed two endings at 0% and the documented one at 1.4%. Relative dominance against
// MEASURED means is the fix. Re-run after any content change and paste the means back
// into pack.js `norms`.
//
// Usage: node tools/dist.mjs [runs=3000]
import { readFileSync } from 'node:fs';
import { State } from '../engine/state.js';

const base = new URL('../', import.meta.url);
const { pack } = await import(new URL('content/pack.js', base));
const NODES = JSON.parse(readFileSync(new URL('content/choices.json', base), 'utf8')).choices;
const N = Number(process.argv[2]) || 3000;

function run(pick) {
  const s = new State(pack);
  let g = 0;
  while (g++ < 200) {
    const n = NODES.filter((x) => !(x.id in s.flags) && s.nodeAvailable(x))[0];
    if (!n) break;
    const o = n.options.filter((x) => s.optionAvailable(x));
    s.applyChoice(n, o[Math.min(pick(n, s), o.length - 1)]);
  }
  return { s, e: pack.computeEnding(s) };
}

const count = {};
const rows = [];
for (let i = 0; i < N; i++) {
  const { s, e } = run((n) => Math.floor(Math.random() * n.options.length));
  count[e.id] = (count[e.id] || 0) + 1;
  rows.push([
    s.states.fidelity, s.states.obedience, s.states.notice,
    s.quantities.crown_english, s.quantities.crown_imperial,
    s.quantities.crown_ottoman, s.quantities.millennium, s.history.length,
  ]);
}

console.log(`ending distribution over ${N} random runs:`);
Object.entries(count)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k.padEnd(22)} ${((v / N) * 100).toFixed(1)}%`));

const L = ['fidelity', 'obedience', 'notice', 'crown_english', 'crown_imperial', 'crown_ottoman', 'millennium', 'nodes'];
const avg = (i) => (rows.reduce((a, b) => a + b[i], 0) / rows.length).toFixed(1);
const rng = (i) => `${Math.min(...rows.map((r) => r[i]))}..${Math.max(...rows.map((r) => r[i]))}`;
console.log();
L.forEach((l, i) => console.log(`  ${l.padEnd(15)} avg ${String(avg(i)).padStart(6)}   range ${rng(i)}`));
console.log(`\n  suggested norms: { fidelity: ${Math.round(avg(0))}, obedience: ${Math.round(avg(1))}, notice: ${Math.round(avg(2))} }`);
