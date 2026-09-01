// ui.js — the five screen renderers, protagonist-neutral.
// Screen vocabulary inherited from TurkaGame's GAMELOOP.md:
//   title | act_intro | choice | consequence | ending
// The consequence screen is the load-bearing one. Do not merge it into `choice`.

const el = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function setPalette(name) {
  document.body.dataset.palette = name || 'vellum';
}

function shell(html) {
  el('app').innerHTML = html;
}

// --- keyboard -----------------------------------------------------------------
// One handler, swapped per screen: number keys pick options, Enter/Space continues.
// Quiet by design — a replayer's convenience, never announced louder than a hint line.
let keyHandler = null;
function keys(map) {
  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const fn = map[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  };
  document.addEventListener('keydown', keyHandler);
}

// A tipped-in plate: period image, caption, nothing louder.
function plateHtml(plate, cls = '') {
  if (!plate) return '';
  return `
    <figure class="plate ${cls}">
      <img src="${esc(plate.src)}" alt="${esc(plate.caption)}">
      <figcaption>${esc(plate.caption)}</figcaption>
    </figure>`;
}

export function renderTitle(pack, hasSave, { onStart, onResume }) {
  setPalette(pack.palettes?.[0] || 'vellum');
  shell(`
    <article class="card title-card">
      ${plateHtml(pack.frontispiece, 'frontispiece')}
      <p class="eyebrow">${esc(pack.series)}</p>
      <h1>${esc(pack.title)}</h1>
      <p class="tagline">${esc(pack.tagline)}</p>
      <p class="premise">${esc(pack.premise)}</p>
      <div class="actions">
        ${hasSave ? '<button class="primary" id="resume">Continue the life</button>' : ''}
        <button class="${hasSave ? '' : 'primary'}" id="start">Begin at Cambridge</button>
      </div>
      <p class="note">${esc(pack.groundingNote)}</p>
    </article>`);
  el('start').onclick = onStart;
  if (hasSave) el('resume').onclick = onResume;
  keys({ Enter: hasSave ? onResume : onStart, ' ': hasSave ? onResume : onStart });
}

export function renderActIntro(act, onContinue, diagram) {
  setPalette(act.palette);
  shell(`
    <article class="card act-card">
      ${diagram ? `<figure class="act-mark">${diagram}</figure>` : ''}
      <p class="eyebrow">Act ${act.n} &middot; ${esc(act.years)}</p>
      <h2>${esc(act.title)}</h2>
      <p class="act-text">${esc(act.intro)}</p>
      <div class="actions"><button class="primary" id="go">Continue</button></div>
    </article>`);
  el('go').onclick = onContinue;
  keys({ Enter: onContinue, ' ': onContinue });
}

// Grounding badges render as a cataloguer's mark in the margin (NARRATIVE_DESIGN §5).
const MARKS = {
  ATTESTED: 'the record holds this',
  'PLAUSIBLE-GAP': 'the record is silent here',
  CONTEXT: 'as the age went',
  LEGEND: 'so it was later told',
  COUNTERFACTUAL: 'so it might have been',
  'INVENTED-COMPATIBLE': 'here we imagine',
};

export function renderChoice(node, act, state, options, { onPick, progress, plate }) {
  setPalette(act.palette);
  const opts = options
    .map(
      (o, i) => `
      <button class="option${o.capability_gate ? ' capability' : ''}" data-i="${i}">
        <span class="key">${i + 1}</span>${
          o.capability_gate
            ? `<span class="cap">[${esc(Object.keys(o.capability_gate).join(', '))}]</span> `
            : ''
        }${esc(o.label)}
      </button>`
    )
    .join('');
  const verbs = Object.entries(state.verbs)
    .map(
      ([v, n]) =>
        `<li><span>${esc(v)}</span><i style="--n:${Math.min(n, 8)}"></i><b>${n}</b></li>`
    )
    .join('');
  shell(`
    <article class="card choice-card">
      <header class="scene-head">
        <p class="eyebrow">Act ${act.n} &middot; ${esc(node.date)}</p>
        <p class="mark" title="${esc(node.grounding)}">${esc(MARKS[node.grounding] || node.grounding)}</p>
      </header>
      ${plateHtml(plate)}
      <p class="scene">${esc(node.text)}</p>
      <div class="options">${opts}</div>
      <footer class="panel">
        <ul class="verbs">${verbs}</ul>
        <p class="progress">${progress.done} of ${progress.total}</p>
      </footer>
    </article>`);
  const btns = [...document.querySelectorAll('.option')];
  btns.forEach((b) => {
    b.onclick = () => onPick(options[Number(b.dataset.i)]);
  });
  const km = {};
  btns.forEach((b, i) => {
    km[String(i + 1)] = () => onPick(options[i]);
  });
  keys(km);
}

// The consequence beat, rendered as Dee's own marginal annotation in a second ink.
// `text` may be a string (the normal one-line beat) or an array of paragraphs —
// the longer, composed beat GAMELOOP.md says the highest-stakes choices deserve.
export function renderConsequence(text, onContinue) {
  const paras = Array.isArray(text) ? text : [text];
  shell(`
    <article class="card consequence-card">
      ${paras.map((p) => `<p class="marginal">${esc(p)}</p>`).join('')}
      <div class="actions"><button class="primary" id="go">Continue</button></div>
    </article>`);
  el('go').onclick = onContinue;
  keys({ Enter: onContinue, ' ': onContinue });
}

// The ending journal, grouped THEMATICALLY (GAMELOOP.md's diagnosed fix), not by act.
export function renderEnding(ending, state, pack, onRestart) {
  setPalette(pack.endPalette || 'faded');
  const groups = (pack.journalGroups || []).map((g) => {
    const rows = state.history.filter((h) => g.nodes.includes(h.id));
    if (!rows.length) return '';
    return `
      <section class="shelf">
        <h4>${esc(g.title)}</h4>
        <ul>${rows
          .map(
            (h) =>
              `<li><span class="date">${esc(h.date)}</span> ${esc(h.label)}</li>`
          )
          .join('')}</ul>
      </section>`;
  });
  const unfiled = state.history.filter(
    (h) => !(pack.journalGroups || []).some((g) => g.nodes.includes(h.id))
  );
  if (unfiled.length) {
    groups.push(`
      <section class="shelf">
        <h4>Uncatalogued</h4>
        <ul>${unfiled
          .map((h) => `<li><span class="date">${esc(h.date)}</span> ${esc(h.label)}</li>`)
          .join('')}</ul>
      </section>`);
  }
  shell(`
    <article class="card ending-card">
      <p class="eyebrow">${esc(ending.mark || '')}</p>
      <h2>${esc(ending.title)}</h2>
      <p class="ending-text">${esc(ending.text)}</p>
      ${ending.epilogue ? `<p class="epilogue">${esc(ending.epilogue)}</p>` : ''}
      ${ending.coda ? `<p class="coda">${esc(ending.coda)}</p>` : ''}
      ${plateHtml(pack.endingPlate, 'coda-plate')}
      <h3 class="catalogue-title">${esc(pack.journalTitle || 'The record of a life')}</h3>
      <div class="catalogue">${groups.join('')}</div>
      <div class="actions"><button class="primary" id="again">Live it differently</button></div>
    </article>`);
  el('again').onclick = onRestart;
  keys({ Enter: onRestart });
}
