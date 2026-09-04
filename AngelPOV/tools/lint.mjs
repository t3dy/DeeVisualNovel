// lint.mjs — content checks. Nothing unverified or malformed ships.
// Usage: node tools/lint.mjs        (from angelpov/)
import { readFileSync, existsSync } from 'node:fs';

const base = new URL('../', import.meta.url);
const { pack } = await import(new URL('content/pack.js', base));
const data = JSON.parse(readFileSync(new URL('content/choices.json', base), 'utf8'));
const registry = JSON.parse(readFileSync(new URL('assets/registry.json', base), 'utf8'));

const MARKS = ['ATTESTED', 'PLAUSIBLE-GAP', 'CONTEXT', 'LEGEND', 'COUNTERFACTUAL', 'INVENTED-COMPATIBLE'];
const errors = [];
const warn = [];
const E = (m) => errors.push(m);
const W = (m) => warn.push(m);

const ACTS = data.acts;
const NODES = data.choices;
const ids = new Set();
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

// --- acts ---------------------------------------------------------------------
if (ACTS.length !== 6) E(`expected 6 acts, found ${ACTS.length}`);
for (const a of ACTS) {
  for (const k of ['n', 'title', 'years', 'where', 'palette', 'intro'])
    if (!(k in a)) E(`act ${a.n}: missing ${k}`);
  if (!pack.palettes.includes(a.palette)) E(`act ${a.n}: palette "${a.palette}" not declared in pack`);
  if (!pack.chamberFor(a)) E(`act ${a.n}: no chamber state`);
  if (!pack.diagramFor(a)) E(`act ${a.n}: no act mark`);
  if (words(a.intro) < 25) W(`act ${a.n}: intro is thin (${words(a.intro)} words)`);
}

// --- nodes --------------------------------------------------------------------
for (const n of NODES) {
  const at = `${n.id}`;
  if (ids.has(n.id)) E(`${at}: duplicate node id`);
  ids.add(n.id);
  for (const k of ['id', 'act', 'date', 'grounding', 'event', 'text', 'options'])
    if (!(k in n)) E(`${at}: missing ${k}`);
  if (!MARKS.includes(n.grounding)) E(`${at}: unknown grounding "${n.grounding}"`);
  if (!ACTS.some((a) => a.n === n.act)) E(`${at}: act ${n.act} does not exist`);
  if (words(n.text) < 25) W(`${at}: scene text is thin (${words(n.text)} words)`);
  if (n.plate && !registry.plates[n.plate]) E(`${at}: plate "${n.plate}" not in registry`);
  if (!n.options || n.options.length < 2) E(`${at}: needs at least 2 options`);

  const oids = new Set();
  for (const o of n.options || []) {
    const ot = `${at}/${o.id}`;
    if (!o.id) E(`${at}: option with no id`);
    if (oids.has(o.id)) E(`${ot}: duplicate option id`);
    oids.add(o.id);
    if (!o.label) E(`${ot}: no label`);
    if (o.said === undefined) E(`${ot}: no \`said\` (use "" for deliberate silence)`);
    if (o.written === undefined) E(`${ot}: no \`written\` (use "" for a night with no entry)`);
    if (!o.consequence) E(`${ot}: no consequence`);
    if (words(o.consequence) < 12) W(`${ot}: consequence is thin (${words(o.consequence)} words)`);

    for (const k of Object.keys(o.modes || {}))
      if (!pack.modes.includes(k)) E(`${ot}: unknown mode "${k}"`);
    for (const k of Object.keys(o.states || {}))
      if (!pack.hiddenStates.includes(k)) E(`${ot}: unknown state "${k}"`);
    for (const k of Object.keys(o.gate_min || {}))
      if (!pack.quantities.includes(k)) E(`${ot}: gate_min on unknown quantity "${k}"`);
    if (!o.modes || !Object.keys(o.modes).length)
      if (o.said !== '') W(`${ot}: no modes — an utterance with no manner`);
  }
}

// --- the channel ----------------------------------------------------------------
// `said` and `written` must not be identical: if the channel transmitted you perfectly,
// the screen has nothing to show and the game's whole premise is off.
for (const n of NODES)
  for (const o of n.options || [])
    if (o.said && o.written && o.said.trim() === o.written.trim())
      E(`${n.id}/${o.id}: said and written are identical — no gap for the beat to show`);

const lowCount = NODES.flatMap((n) => n.options).filter((o) => o.written_low).length;
if (lowCount === 0) W('no node supplies `written_low` — the fidelity drift never renders');

// --- pack wiring ------------------------------------------------------------------
const grouped = new Set(pack.journalGroups.flatMap((g) => g.nodes));
for (const id of grouped) if (!ids.has(id)) E(`journalGroups references unknown node "${id}"`);
for (const id of ids) if (!grouped.has(id)) W(`node ${id} appears in no journal group`);
for (const key of ['frontispieceId', 'endingPlateId'])
  if (pack[key] && !registry.plates[pack[key]]) E(`pack.${key} "${pack[key]}" not in registry`);

// --- plate files exist, and every plate carries its provenance ---------------------
for (const [id, p] of Object.entries(registry.plates)) {
  for (const k of ['file', 'caption', 'title', 'date', 'rights', 'provenance_url'])
    if (!p[k]) E(`plate ${id}: missing ${k} (provenance rule)`);
  if (p.file && !existsSync(new URL(p.file, base))) E(`plate ${id}: file missing (${p.file})`);
}

// --- reachability -------------------------------------------------------------------
for (const n of NODES) {
  for (const k of Object.keys(n.requires || {})) {
    const settable = NODES.some((m) => (m.options || []).some((o) => o.flags && k in o.flags));
    if (!settable) E(`${n.id}: requires flag "${k}" that no option ever sets`);
  }
}

// --- report ---------------------------------------------------------------------------
console.log(`nodes ${NODES.length} · acts ${ACTS.length} · plates ${Object.keys(registry.plates).length}`);
warn.forEach((w) => console.log(`  warn  ${w}`));
errors.forEach((e) => console.log(`  ERROR ${e}`));
console.log(errors.length ? `\n${errors.length} ERRORS` : `\nclean${warn.length ? ` (${warn.length} warnings)` : ''}`);
process.exit(errors.length ? 1 : 0);
