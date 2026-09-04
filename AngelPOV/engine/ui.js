// ui.js — the five screens.
//
// Screen vocabulary inherited from the Dee pack, with one substitution that is the whole
// point of this game: `consequence` becomes `transmission`. Do not merge it back into
// `choice`. See ../DESIGN.md §2.
//
//   title | act_intro | choice | transmission | ending

const el = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function setPalette(name) {
  document.body.dataset.palette = name || 'stone';
}

function shell(html) {
  el('app').innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

// --- keyboard ---------------------------------------------------------------
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

function plateHtml(plate, cls = '') {
  if (!plate) return '';
  return `
    <figure class="plate ${cls}">
      <img src="${esc(plate.src)}" alt="${esc(plate.caption)}" loading="lazy">
      <figcaption>${esc(plate.caption)}</figcaption>
    </figure>`;
}

const MARKS = {
  ATTESTED: 'the record holds this',
  'PLAUSIBLE-GAP': 'the record is silent here',
  CONTEXT: 'as the age went',
  LEGEND: 'so it was later told',
  COUNTERFACTUAL: 'so it might have been',
  'INVENTED-COMPATIBLE': 'here we imagine',
};

// --- title ------------------------------------------------------------------

export function renderTitle(pack, hasSave, { onStart, onResume }) {
  setPalette('stone');
  shell(`
    <article class="card title-card">
      ${plateHtml(pack.frontispiece, 'frontispiece')}
      <p class="eyebrow">${esc(pack.series)}</p>
      <h1>${esc(pack.title)}</h1>
      <p class="tagline">${esc(pack.tagline)}</p>
      <p class="premise">${esc(pack.premise)}</p>
      <div class="actions">
        ${hasSave ? '<button class="primary" id="resume">Continue</button>' : ''}
        <button class="${hasSave ? '' : 'primary'}" id="start">Answer him</button>
      </div>
      <p class="note">${esc(pack.groundingNote)}</p>
    </article>`);
  el('start').onclick = onStart;
  if (hasSave) el('resume').onclick = onResume;
  const go = hasSave ? onResume : onStart;
  keys({ Enter: go, ' ': go });
}

// --- act intro ---------------------------------------------------------------

export function renderActIntro(act, onContinue, diagram) {
  setPalette(act.palette);
  shell(`
    <article class="card act-card">
      ${diagram ? `<figure class="act-mark">${diagram}</figure>` : ''}
      <p class="eyebrow">Act ${act.n} &middot; ${esc(act.years)} &middot; ${esc(act.where)}</p>
      <h2>${esc(act.title)}</h2>
      <p class="act-text">${esc(act.intro)}</p>
      <div class="actions"><button class="primary" id="go">Continue</button></div>
    </article>`);
  el('go').onclick = onContinue;
  keys({ Enter: onContinue, ' ': onContinue });
}

// --- choice ------------------------------------------------------------------

export function renderChoice(node, act, state, options, { onPick, progress, plate }) {
  setPalette(act.palette);
  const opts = options
    .map(
      (o, i) => `
      <button class="option" data-i="${i}">
        <span class="key">${i + 1}</span>${esc(o.label)}
      </button>`
    )
    .join('');
  const modes = Object.entries(state.modes)
    .map(([m, n]) => `<li><span>${esc(m)}</span><i style="--n:${Math.min(n, 8)}"></i><b>${n}</b></li>`)
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
        <ul class="modes">${modes}</ul>
        <p class="progress">${progress.done} of ${progress.total}</p>
      </footer>
    </article>`);
  const map = {};
  document.querySelectorAll('.option').forEach((b, i) => {
    b.onclick = () => onPick(options[i]);
    map[String(i + 1)] = () => onPick(options[i]);
  });
  keys(map);
}

// --- THE TRANSMISSION BEAT ---------------------------------------------------
// What you said, and what he wrote down. The gap is the game.

export function renderTransmission(node, act, entry, drifted, onContinue) {
  setPalette(act.palette);
  const said = entry.said
    ? `<p class="said">${esc(entry.said)}</p>`
    : `<p class="said empty">Nothing. You let the silence stand.</p>`;
  const written = entry.written
    ? `<p class="written">${esc(entry.written)}</p>`
    : `<p class="written empty">— no entry for this night —</p>`;
  shell(`
    <article class="card transmission-card">
      <div class="channel">
        <div>
          <h4>What you said</h4>
          ${said}
        </div>
        <div>
          <h4>What he wrote down</h4>
          ${written}
        </div>
      </div>
      ${drifted ? '<p class="drift">the channel is authoring you</p>' : ''}
      <p class="outcome">${esc(entry.consequence)}</p>
      <div class="actions"><button class="primary" id="go">Continue</button></div>
    </article>`);
  el('go').onclick = onContinue;
  keys({ Enter: onContinue, ' ': onContinue });
}

// --- ending ------------------------------------------------------------------

export function renderEnding(pack, ending, state, { onRestart, plate }) {
  setPalette(pack.endPalette);
  const groups = pack.journalGroups
    .map((g) => {
      const items = state.history
        .filter((h) => g.nodes.includes(h.id))
        .map(
          (h) => `<li><span class="date">${esc(h.date)}</span><span>${esc(h.label)}</span></li>`
        )
        .join('');
      return items ? `<div class="shelf"><h4>${esc(g.title)}</h4><ul>${items}</ul></div>` : '';
    })
    .join('');
  shell(`
    <article class="card ending-card">
      <p class="eyebrow">${esc(ending.mark)}</p>
      <h2>${esc(ending.title)}</h2>
      <p class="ending-text">${esc(ending.text)}</p>
      <p class="ending-text epilogue">${esc(ending.epilogue)}</p>
      ${plateHtml(plate, 'coda-plate')}
      <p class="ending-text reception">${esc(ending.reception)}</p>
      <h3 class="catalogue-title">${esc(pack.journalTitle)}</h3>
      ${groups}
      <div class="actions"><button class="primary" id="again">Say it differently</button></div>
      <p class="note">Eight outcomes. The documented one is not privileged among them, and the
        one marked <em>so it might have been</em> is Melvin-Koushki&rsquo;s counterfactual, not
        the record&rsquo;s.</p>
    </article>`);
  el('again').onclick = onRestart;
  keys({ Enter: onRestart, ' ': onRestart });
}
