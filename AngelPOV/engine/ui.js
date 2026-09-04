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
// How far from the documented record each mark sits. Used to decide whether a choice
// has moved the player somewhere the scene itself was not.
const MARK_RANK = {
  ATTESTED: 0,
  CONTEXT: 1,
  'PLAUSIBLE-GAP': 2,
  LEGEND: 2,
  'INVENTED-COMPATIBLE': 3,
  COUNTERFACTUAL: 4,
};
const markText = (m) => MARKS[m] || m;

// The apparatus: what this scene rests on, where the record stops, and the context you
// would need to read it properly. Collapsed by default — a 12-minute run stays a
// 12-minute run, and everything is there for anyone who wants it.
function evidenceHtml(node) {
  if (!node.evidence) return '';
  return `
    <details class="evidence">
      <summary><span class="ev-label">the evidence</span><span class="ev-src">${esc(
        node.evidence.source
      )}</span></summary>
      <p>${esc(node.evidence.text)}</p>
    </details>`;
}

// --- title ------------------------------------------------------------------

export function renderTitle(pack, hasSave, { onStart, onResume }) {
  setPalette('stone');
  const how = (pack.howItWorks || [])
    .map((p) => `<li>${esc(p)}</li>`)
    .join('');
  shell(`
    <article class="card title-card">
      ${plateHtml(pack.frontispiece, 'frontispiece')}
      <p class="eyebrow">${esc(pack.series)}</p>
      <h1>${esc(pack.title)}</h1>
      <p class="tagline">${esc(pack.tagline)}</p>
      <p class="premise">${esc(pack.premise)}</p>
      ${how ? `<h4>How this works</h4><ul class="how">${how}</ul>` : ''}
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

export function renderChoice(node, act, state, options, { onPick, progress, plate, reading }) {
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
  const readingHtml = (reading || []).map((r) => `<li>${esc(r)}</li>`).join('');
  shell(`
    <article class="card choice-card">
      <header class="scene-head">
        <p class="eyebrow">Act ${act.n} &middot; ${esc(node.date)}</p>
        <p class="mark" title="grounding: ${esc(node.grounding)}">${esc(markText(node.grounding))}</p>
      </header>
      ${plateHtml(plate)}
      <p class="scene">${esc(node.text)}</p>
      <div class="options">${opts}</div>
      <footer class="panel">
        ${readingHtml ? `<ul class="reading">${readingHtml}</ul>` : ''}
        <div class="panel-row">
          <ul class="modes">${modes}</ul>
          <p class="progress">choice ${progress.done} &middot; act ${act.n} of ${progress.acts}<span class="hint">number keys choose</span></p>
        </div>
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

export function renderTransmission(node, act, entry, drifted, option, onContinue) {
  setPalette(act.palette);
  const said = entry.said
    ? `<p class="said">${esc(entry.said)}</p>`
    : `<p class="said empty">Nothing. You let the silence stand.</p>`;
  const written = entry.written
    ? `<p class="written">${esc(entry.written)}</p>`
    : `<p class="written empty">— no entry for this night —</p>`;

  // If THIS choice sits further from the record than the scene did, say so here, at the
  // moment it happens, rather than leaving the player to infer it later.
  const om = option && option.mark;
  const stepped = om && (MARK_RANK[om] ?? 0) > (MARK_RANK[node.grounding] ?? 0);
  const steppedHtml = stepped
    ? `<p class="stepped"><span>${esc(markText(om))}</span> — the scene is documented; this
       answer is not. You have moved off the record.</p>`
    : '';

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
      ${steppedHtml}
      <p class="outcome">${esc(entry.consequence)}</p>
      ${evidenceHtml(node)}
      <div class="actions"><button class="primary" id="go">Continue</button></div>
    </article>`);
  el('go').onclick = onContinue;
  keys({ Enter: onContinue, ' ': onContinue });
}

// --- ending ------------------------------------------------------------------

// A playtest report is only useful if it says which run it is about. Prefill the issue
// with the run's fingerprint so the tester only has to write the opinion.
function feedbackUrl(pack, ending, state) {
  const dominant = Object.entries(state.modes).sort((a, b) => b[1] - a[1])[0];
  const body = [
    '<!-- your notes here -->',
    '',
    'What did you not understand?',
    'Where did you get bored?',
    'Did the evidence notes earn their place?',
    '',
    '---',
    `ending: ${ending.id} (${ending.title})`,
    `choices made: ${state.history.length}`,
    `most-used mode: ${dominant[0]} (${dominant[1]})`,
    `build: ${location.pathname}`,
  ].join('\n');
  return (
    `${pack.links.feedback}?title=${encodeURIComponent('Spoken Backward playtest: ' + ending.title)}` +
    `&labels=${encodeURIComponent('playtest')}` +
    `&body=${encodeURIComponent(body)}`
  );
}

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
      <div class="actions">
        <button class="primary" id="again">Say it differently</button>
        <a class="button-link" href="${esc(feedbackUrl(pack, ending, state))}"
           target="_blank" rel="noopener">Tell us how it played</a>
      </div>
      <p class="note">Eight outcomes. The documented one is not privileged among them, and the
        one marked <em>so it might have been</em> is Melvin-Koushki&rsquo;s counterfactual, not
        the record&rsquo;s. The sources and the reasoning are in
        <a href="${esc(pack.links.design)}">the design record</a>; the same twenty-seven years
        from John Dee&rsquo;s side are in <a href="${esc(pack.links.dee)}">Imperial Magus</a>,
        and the research companion is <a href="${esc(pack.links.portal)}">the Dee Portal</a>.</p>
    </article>`);
  el('again').onclick = onRestart;
  keys({ Enter: onRestart, ' ': onRestart });
}
