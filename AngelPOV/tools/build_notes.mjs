// build_notes.mjs — generate notes.html, the browsable apparatus.
//
// Everything on that page already exists inside the game as collapsed evidence notes.
// This puts the same material somewhere it can be read, linked and cited without playing
// a run, which is what a research companion is for.
//
// Usage: node tools/build_notes.mjs      (from angelpov/)
// notes.html is GENERATED. Do not edit it by hand; edit content/choices.json and
// content/pack.js and re-run this.

import { readFileSync, writeFileSync } from 'node:fs';

const base = new URL('../', import.meta.url);
const { pack } = await import(new URL('content/pack.js', base));
const data = JSON.parse(readFileSync(new URL('content/choices.json', base), 'utf8'));

const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const MARKS = {
  ATTESTED: 'the record holds this',
  'PLAUSIBLE-GAP': 'the record is silent here',
  CONTEXT: 'as the age went',
  LEGEND: 'so it was later told',
  COUNTERFACTUAL: 'so it might have been',
  'INVENTED-COMPATIBLE': 'here we imagine',
};
const MARK_CLASS = {
  ATTESTED: 'm-att',
  'PLAUSIBLE-GAP': 'm-gap',
  CONTEXT: 'm-ctx',
  LEGEND: 'm-leg',
  COUNTERFACTUAL: 'm-cf',
  'INVENTED-COMPATIBLE': 'm-inv',
};
const mark = (m) => `<span class="mark ${MARK_CLASS[m] || ''}">${esc(MARKS[m] || m)}</span>`;

// --- the eight endings, reached by probe so the page cannot drift from the code -------
const S = (f, q, st) => ({
  flags: f,
  quantities: Object.assign({ crown_english: 0, crown_imperial: 0, crown_ottoman: 0, millennium: 0 }, q),
  states: Object.assign({ fidelity: 20, obedience: 25, notice: 12 }, st),
  history: new Array(30),
});
const ENDING_PROBES = [
  ['tides_and_title', S({}, { crown_english: 9 })],
  ['habsburg_silence', S({}, { crown_imperial: 9 })],
  ['true_and_faithful', S({ print: 'allowed' }, { crown_english: 5 }, { notice: 20, fidelity: 26 })],
  ['long_way_round', S({}, {})],
  ['the_covenant', S({ covenant: 'delivered' }, { crown_english: 5 }, { obedience: 30 })],
  ['the_year_that_came', S({ year: 'affirmed' }, { millennium: 12, crown_english: 5 })],
  ['stone_goes_dark', S({}, {}, { obedience: 1 })],
  ['sultans_angels', S({ road: 'east' }, { crown_ottoman: 14 })],
];

const acts = data.acts;
const nodes = data.choices;

const toc = acts
  .map((a) => `<li><a href="#act${a.n}">${esc(a.title)}</a> <span class="dim">${esc(a.years)}</span></li>`)
  .join('');

const actSections = acts
  .map((a) => {
    const scenes = nodes
      .filter((n) => n.act === a.n)
      .map((n) => {
        const offRecord = (n.options || [])
          .filter((o) => o.mark)
          .map((o) => `<li>${esc(o.label)} &mdash; ${mark(o.mark)}</li>`)
          .join('');
        return `
      <article class="scene" id="${esc(n.id)}">
        <h3>${esc(n.event)}</h3>
        <p class="meta"><span class="date">${esc(n.date)}</span>${mark(n.grounding)}
          <a class="anchor" href="#${esc(n.id)}">#${esc(n.id)}</a></p>
        <p class="scene-text">${esc(n.text)}</p>
        ${
          n.evidence
            ? `<div class="ev"><p class="ev-src">${esc(n.evidence.source)}</p>
               <p>${esc(n.evidence.text)}</p></div>`
            : '<p class="ev-missing">no evidence note</p>'
        }
        ${offRecord ? `<div class="off"><h4>Answers that leave the record</h4><ul>${offRecord}</ul></div>` : ''}
      </article>`;
      })
      .join('');
    return `
    <section class="act" id="act${a.n}">
      <h2>Act ${a.n}. ${esc(a.title)}</h2>
      <p class="meta"><span class="date">${esc(a.years)}</span><span class="dim">${esc(a.where)}</span></p>
      <p class="act-intro">${esc(a.intro)}</p>
      ${scenes}
    </section>`;
  })
  .join('');

const endingSections = ENDING_PROBES.map(([want, st]) => {
  const e = pack.computeEnding(st);
  const drift = e.id === want ? '' : ' <span class="dim">(probe drifted)</span>';
  return `
    <article class="scene" id="ending-${esc(e.id)}">
      <h3>${esc(e.title)}${drift}</h3>
      <p class="meta"><span class="mark">${esc(e.mark)}</span>
        <a class="anchor" href="#ending-${esc(e.id)}">#${esc(e.id)}</a></p>
      <p class="scene-text">${esc(e.text)}</p>
      ${
        e.evidence
          ? `<div class="ev"><p class="ev-src">${esc(e.evidence.source)}</p>
             <p>${esc(e.evidence.text)}</p></div>`
          : '<p class="ev-missing">no evidence note</p>'
      }
    </article>`;
}).join('');

const counts = nodes.reduce((m, n) => ((m[n.grounding] = (m[n.grounding] || 0) + 1), m), {});
const countLine = Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `${v} ${MARKS[k] || k}`)
  .join(' &middot; ');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Evidence — Spoken Backward | Renaissance Magic</title>
<meta name="description" content="The scholarly apparatus behind Spoken Backward: what every scene rests on, where the record goes silent, and where the game leaves the evidence behind.">
<link rel="icon" href="./favicon.svg" type="image/svg+xml">
<style>
  :root { --ink:#e6dcc6; --dim:#9c917c; --gold:#c9a34a; --ground:#0d0f13; --card:#14171c; --rule:#333a42; }
  * { box-sizing: border-box; }
  body { margin:0; padding:2.5rem 1.25rem 5rem; background:var(--ground); color:var(--ink);
    font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
    font-size:1.0625rem; line-height:1.62; }
  .wrap { max-width:46rem; margin:0 auto; }
  h1 { font-size:2rem; font-weight:500; margin:.2rem 0 .5rem; }
  h2 { font-size:1.4rem; font-weight:500; margin:3rem 0 .3rem; padding-top:1.6rem; border-top:1px solid var(--rule); }
  h3 { font-size:1.06rem; font-weight:600; margin:2rem 0 .3rem; }
  h4 { font-size:.74rem; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); margin:1rem 0 .3rem; }
  a { color:var(--gold); }
  .eyebrow { font-size:.72rem; letter-spacing:.18em; text-transform:uppercase; color:var(--dim); margin:0 0 .4rem; }
  .lede { color:var(--ink); margin:0 0 1.4rem; }
  .dim { color:var(--dim); }
  .meta { margin:0 0 .7rem; font-size:.78rem; display:flex; gap:.8rem; flex-wrap:wrap; align-items:baseline; }
  .date { color:var(--dim); font-variant-numeric:tabular-nums; }
  .mark { font-style:italic; color:var(--gold); }
  .m-cf, .m-inv { color:#e08a5a; }
  .m-leg { color:#c98fc9; }
  .m-gap { color:#8fa4b2; }
  .anchor { margin-left:auto; font-size:.72rem; opacity:.5; text-decoration:none; }
  .act-intro { font-style:italic; color:var(--dim); margin:0 0 1rem; }
  .scene { margin:0 0 1.6rem; }
  .scene-text { margin:0 0 .8rem; }
  .ev { border-left:2px solid var(--rule); padding-left:1rem; margin:0 0 .8rem; }
  .ev p { margin:0 0 .5rem; font-size:.9rem; line-height:1.68; color:var(--dim); }
  .ev-src { font-style:italic; color:var(--gold) !important; font-size:.82rem !important; }
  .ev-missing { color:#e08a5a; font-size:.85rem; }
  .off ul { margin:.2rem 0 0; padding-left:1.1rem; }
  .off li { font-size:.85rem; color:var(--dim); margin-bottom:.25rem; }
  .toc { list-style:none; padding:0; margin:0 0 1rem; columns:2; column-gap:2rem; }
  .toc li { font-size:.92rem; margin-bottom:.3rem; break-inside:avoid; }
  .note { font-size:.82rem; color:var(--dim); border-top:1px solid var(--rule); padding-top:1rem; margin-top:2.5rem; }
  @media (max-width:34rem) { .toc { columns:1; } body { padding:1.5rem .9rem 3rem; } }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">Renaissance Magic &middot; the apparatus</p>
  <h1>The Evidence</h1>
  <p class="lede">Everything below appears inside
    <a href="./">Spoken Backward</a> as a note you can open on each scene. It is gathered
    here so it can be read, linked and argued with without playing a run: what each scene
    rests on, where the record goes silent, where the game compresses or invents, and the
    context &mdash; courtly, alchemical, apocalyptic &mdash; you would need to read the
    scene properly.</p>
  <p class="lede dim">${nodes.length} scenes across ${acts.length} acts &middot; ${countLine}.</p>

  <h4>Acts</h4>
  <ul class="toc">${toc}<li><a href="#endings">The eight endings</a></li></ul>

  ${actSections}

  <section class="act" id="endings">
    <h2>The eight endings</h2>
    <p class="act-intro">Chosen by relative dominance against measured means, not fixed
      thresholds. The documented outcome is not privileged among them.</p>
    ${endingSections}
  </section>

  <p class="note">Generated from <code>content/choices.json</code> and
    <code>content/pack.js</code> by <code>tools/build_notes.mjs</code> &mdash; do not edit
    this file by hand. Sources and the design reasoning:
    <a href="${esc(pack.links.design)}">the design record</a>.
    The same twenty-seven years from John Dee&rsquo;s side:
    <a href="${esc(pack.links.dee)}">Imperial Magus</a>.
    Research companion: <a href="${esc(pack.links.portal)}">the Dee Portal</a>.</p>
</div>
</body>
</html>
`;

writeFileSync(new URL('notes.html', base), html, 'utf8');
console.log(
  `notes.html written: ${nodes.length} scenes, ${ENDING_PROBES.length} endings, ` +
    `${(html.length / 1024).toFixed(0)} KB`
);
