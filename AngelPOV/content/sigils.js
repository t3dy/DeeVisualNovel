// sigils.js — original line constructions used as act marks.
//
// Same rationale as the Dee pack's diagrams.js: these are DRAWN FROM THE GEOMETRY, not
// reproduced from manuscripts. Dee's visual vocabulary is construction — a figure whose
// arrangement carries the argument — so rebuilding the construction is closer to the
// source than a scan would be, and it is rights-clean.
//
// All use `currentColor` so they take the act palette (see ../engine/angel.css).

const wrap = (vb, body) =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none" ` +
  `stroke="currentColor" stroke-width="1.3" stroke-linecap="round" ` +
  `stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

// Points of a regular n-gon, radius r, first point at the top.
const pts = (n, r, rot = -90, cx = 50, cy = 50) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const poly = (p) => p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
const star = (p, step) => {
  const out = [];
  for (let i = 0; i < p.length; i++) out.push(p[(i * step) % p.length]);
  return poly(out);
};

// ACT 1 — the shewstone. A sphere drawn as the two circles a draughtsman uses for one,
// with the point of sight inside it. You are the point. He is outside the outer line.
const stone = wrap(
  '0 0 100 100',
  `
  <circle cx="50" cy="50" r="38" />
  <ellipse cx="50" cy="50" rx="14" ry="38" stroke-width="0.6" />
  <path d="M12 50 A38 38 0 0 0 88 50" stroke-width="0.6" />
  <circle cx="50" cy="50" r="3.4" fill="currentColor" stroke="none" />
  <circle cx="50" cy="50" r="9" stroke-width="0.5" />
`
);

// ACT 2 — the Sigillum Dei Aemeth, as its construction: circle, heptagon, heptagram of
// step 2, inner heptagram of step 3. Letters omitted deliberately; this is the geometry,
// not a working talisman.
const sigillum = (() => {
  const outer = pts(7, 43);
  const inner = pts(7, 29, -90 + 360 / 14);
  return wrap(
    '0 0 100 100',
    `
  <circle cx="50" cy="50" r="47" stroke-width="0.6" />
  <circle cx="50" cy="50" r="43" />
  <polygon points="${poly(outer)}" stroke-width="0.8" />
  <polygon points="${star(outer, 2)}" stroke-width="0.8" />
  <polygon points="${star(inner, 3)}" stroke-width="0.7" />
  <circle cx="50" cy="50" r="12" stroke-width="0.6" />
`
  );
})();

// ACT 3 — the Great Table: the earth quartered into four watchtowers, each ruled into
// its own grid, with the black cross of the governors between them.
const watchtowers = (() => {
  const q = (ox, oy) => {
    const lines = [];
    for (let i = 0; i <= 6; i++) {
      const t = (i / 6) * 38;
      lines.push(`<path d="M${ox} ${oy + t} h38" stroke-width="0.4" />`);
      lines.push(`<path d="M${ox + t} ${oy} v38" stroke-width="0.4" />`);
    }
    return lines.join('');
  };
  return wrap(
    '0 0 100 100',
    `
  ${q(6, 6)}${q(56, 6)}${q(6, 56)}${q(56, 56)}
  <rect x="6" y="6" width="38" height="38" />
  <rect x="56" y="6" width="38" height="38" />
  <rect x="6" y="56" width="38" height="38" />
  <rect x="56" y="56" width="38" height="38" />
  <path d="M50 2 V98 M2 50 H98" stroke-width="1.6" />
`
  );
})();

// ACT 4 — the covenant. Two circles made to overlap. The vesica between them is drawn
// heavier than either, because it is the only part of the figure that was asked for.
const covenant = wrap(
  '0 0 100 100',
  `
  <circle cx="36" cy="50" r="28" stroke-width="0.8" />
  <circle cx="64" cy="50" r="28" stroke-width="0.8" />
  <path d="M50 24.2 A28 28 0 0 1 50 75.8 A28 28 0 0 1 50 24.2 Z" stroke-width="1.7" />
  <path d="M50 22 V78" stroke-width="0.5" stroke-dasharray="2 3" />
`
);

// ACT 5 — the year. A calendar circle divided in twelve, with the arc that was promised
// and did not close, and the mark where the count was expected to end.
const broken = (() => {
  const ticks = pts(12, 40)
    .map(([x, y], i) => {
      const [ix, iy] = pts(12, i % 3 === 0 ? 32 : 36)[i];
      return `<path d="M${x.toFixed(2)} ${y.toFixed(2)} L${ix.toFixed(2)} ${iy.toFixed(2)}" stroke-width="0.6" />`;
    })
    .join('');
  return wrap(
    '0 0 100 100',
    `
  <circle cx="50" cy="50" r="40" stroke-width="0.6" />
  ${ticks}
  <path d="M50 10 A40 40 0 1 1 15.4 70" stroke-width="1.7" />
  <circle cx="50" cy="10" r="2.6" fill="currentColor" stroke="none" />
  <path d="M15.4 70 l-5 8" stroke-width="0.8" stroke-dasharray="2 3" />
`
  );
})();

// ACT 6 — after Ibn Turka's Tahawi Circle (Kitab al-Mafahis, 1432): one figure holding a
// whole mathematised cosmos, the Isfahani sage-mage's answer to the Monas. Drawn as
// nested circles on a shared tangent point, which is its organising idea — every order of
// being touching every other at one place. Not a reproduction of the manuscript figure.
const tahawi = wrap(
  '0 0 100 100',
  `
  <circle cx="50" cy="56" r="40" stroke-width="0.6" />
  <circle cx="50" cy="60" r="32" stroke-width="0.8" />
  <circle cx="50" cy="66" r="24" stroke-width="0.8" />
  <circle cx="50" cy="72" r="16" stroke-width="0.8" />
  <circle cx="50" cy="80" r="8" stroke-width="0.8" />
  <circle cx="50" cy="88" r="2.4" fill="currentColor" stroke="none" />
  <path d="M50 16 V92" stroke-width="0.4" stroke-dasharray="2 3" />
  <path d="M31 22 A26 26 0 0 0 69 22" stroke-width="1.2" />
`
);

export const SIGILS = { stone, sigillum, watchtowers, covenant, broken, tahawi };
