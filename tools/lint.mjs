// lint.mjs — content checks the writing guide can actually enforce.
// Usage: node tools/lint.mjs [protagonist=dee]
//  - word-count anchors per field (WRITING_GUIDE.md)
//  - no LEAD-tagged node ships (research-side tag only)
//  - every node reachable; every act has an intro; no orphan journal ids
import { readFileSync } from 'node:fs';

const who = process.argv[2] || 'dee';
const base = new URL(`../protagonists/${who}/`, import.meta.url);
const { pack } = await import(new URL('content/pack.js', base));
const data = JSON.parse(readFileSync(new URL('content/choices.json', base), 'utf8'));

const words = (s) => String(s).trim().split(/\s+/).length;
const warn = [];
const err = [];

// Floors are loose, ceilings are strict. TurkaGame's audit found option text drifting
// UP (to ~41 words, generic) over successive edits — that is the failure mode a numeric
// anchor exists to catch. Terse is fine; padding to hit a minimum is not.
const LIMITS = {
  text: [22, 60],
  label: [8, 20],
  consequence: [10, 30],
  intro: [32, 60],
};

for (const a of data.acts) {
  const n = words(a.intro);
  if (n < LIMITS.intro[0] || n > LIMITS.intro[1])
    warn.push(`act ${a.n} intro: ${n} words (target ${LIMITS.intro.join('-')})`);
}

const allIds = new Set(data.choices.map((c) => c.id));
for (const c of data.choices) {
  if (c.grounding === 'LEAD') err.push(`${c.id}: LEAD-tagged nodes must not ship`);
  const n = words(c.text);
  if (n < LIMITS.text[0] || n > LIMITS.text[1])
    warn.push(`${c.id} text: ${n} words (target ${LIMITS.text.join('-')})`);
  if (!c.options?.length) err.push(`${c.id}: no options`);
  for (const o of c.options || []) {
    const wl = words(o.label);
    if (wl < LIMITS.label[0] || wl > LIMITS.label[1])
      warn.push(`${c.id}/${o.id} label: ${wl} words (target ${LIMITS.label.join('-')})`);
    if (!o.consequence) err.push(`${c.id}/${o.id}: no consequence line`);
    else {
      const wc = words(o.consequence);
      if (wc < LIMITS.consequence[0] || wc > LIMITS.consequence[1])
        warn.push(`${c.id}/${o.id} consequence: ${wc} words (target ${LIMITS.consequence.join('-')})`);
    }
  }
  for (const k of Object.keys(c.requires || {}))
    if (!allIds.has(k)) err.push(`${c.id}: requires unknown node ${k}`);
}

for (const g of pack.journalGroups || [])
  for (const id of g.nodes)
    if (!allIds.has(id)) err.push(`journal group "${g.title}" references unknown node ${id}`);

const filed = new Set((pack.journalGroups || []).flatMap((g) => g.nodes));
const unfiled = [...allIds].filter((id) => !filed.has(id));
if (unfiled.length) warn.push(`nodes not in any journal group: ${unfiled.join(', ')}`);

console.log(`${data.choices.length} nodes, ${data.choices.reduce((a, c) => a + c.options.length, 0)} options`);
if (warn.length) {
  console.log(`\n${warn.length} style warnings:`);
  warn.forEach((w) => console.log('  ' + w));
}
if (err.length) {
  console.log(`\n${err.length} ERRORS:`);
  err.forEach((e) => console.log('  ' + e));
}
console.log(err.length ? '\nFAIL' : '\nOK');
process.exit(err.length ? 1 : 0);
