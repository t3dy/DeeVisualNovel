// diagrams.js — original line-drawn constructions of Dee's own figures, used as act marks.
//
// WHY DRAWN, NOT PHOTOGRAPHED: Dee's visual vocabulary is geometric construction, not
// illustration. Clucas's argument (Ambix 64.2) is that the Monas diagrams are working
// engines — made objects whose arrangement carries the argument — so redrawing them from
// the geometry is closer to the source than reproducing a scan would be. It is also
// rights-clean: these are original drawings, not reproductions. Provenance and what each
// figure is derived from: ../assets/DIAGRAMS.md
//
// All use `currentColor` so they inherit the act palette (see engine.css).

const wrap = (vb, body) =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none" ` +
  `stroke="currentColor" stroke-width="1.4" stroke-linecap="round" ` +
  `stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

// The Monas Hieroglyphica (1564), built as Dee builds it: the lunar crescent set over
// the solar circle with its central point, over the cross of the elements, over the
// two semicircles of Aries — the fire that completes the work.
export const monas = wrap(
  '0 0 100 150',
  `
  <path d="M28 30 A28 28 0 0 0 72 30" />
  <circle cx="50" cy="62" r="21" />
  <circle cx="50" cy="62" r="2.6" fill="currentColor" stroke="none" />
  <path d="M50 83 V126" />
  <path d="M30 104 H70" />
  <path d="M36 138 A11 11 0 0 1 58 138" />
  <path d="M42 138 A11 11 0 0 1 64 138" />
`
);

// The Sigillum Dei Aemeth — the heptagonal seal delivered through the actions and cut in
// wax nine inches across. Drawn as its construction: circle, heptagon, heptagram, and the
// inner seven-pointed figure. Letters omitted deliberately; this is the geometry, not a
// working talisman.
export const sigillum = (() => {
  const pts = (n, r, rot = -90) =>
    Array.from({ length: n }, (_, i) => {
      const a = ((rot + (360 / n) * i) * Math.PI) / 180;
      return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
    });
  const poly = (p) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const star = (p, step) => {
    const out = [];
    for (let i = 0; i < p.length; i++) out.push(p[(i * step) % p.length]);
    return poly(out);
  };
  const outer = pts(7, 44);
  const inner = pts(7, 30, -90 + 360 / 14);
  return wrap(
    '0 0 100 100',
    `
  <circle cx="50" cy="50" r="47" />
  <circle cx="50" cy="50" r="44" stroke-width="0.7" />
  <polygon points="${poly(outer)}" />
  <polygon points="${star(outer, 2)}" stroke-width="0.8" />
  <polygon points="${star(inner, 3)}" stroke-width="0.8" />
  <circle cx="50" cy="50" r="13" stroke-width="0.7" />
`
  );
})();

// The Great Table / Enochian tablet: a 12x13 lettered grid crossed by the black cross,
// from which the calls were spelled out letter by letter. Drawn as the grid alone.
export const table = (() => {
  const cells = [];
  const w = 96 / 12;
  const h = 78 / 13;
  for (let c = 0; c <= 12; c++)
    cells.push(`<path d="M${(2 + c * w).toFixed(1)} 11 V89" stroke-width="0.5" />`);
  for (let r = 0; r <= 13; r++)
    cells.push(`<path d="M2 ${(11 + r * h).toFixed(1)} H98" stroke-width="0.5" />`);
  return wrap(
    '0 0 100 100',
    `${cells.join('')}
  <rect x="2" y="11" width="96" height="78" stroke-width="1.4" />
  <path d="M50 11 V89" stroke-width="2" />
  <path d="M2 50 H98" stroke-width="2" />
`
  );
})();

// A mariner's compass rose, for the acts where the work is navigation and empire.
export const compass = (() => {
  const rays = [];
  for (let i = 0; i < 32; i++) {
    const a = ((i * 360) / 32 - 90) * (Math.PI / 180);
    const r0 = i % 8 === 0 ? 16 : i % 4 === 0 ? 26 : 34;
    const r1 = 42;
    rays.push(
      `<path d="M${(50 + r0 * Math.cos(a)).toFixed(1)} ${(50 + r0 * Math.sin(a)).toFixed(1)} ` +
        `L${(50 + r1 * Math.cos(a)).toFixed(1)} ${(50 + r1 * Math.sin(a)).toFixed(1)}" ` +
        `stroke-width="${i % 8 === 0 ? 1.2 : 0.5}" />`
    );
  }
  return wrap(
    '0 0 100 100',
    `${rays.join('')}
  <circle cx="50" cy="50" r="45" stroke-width="1" />
  <circle cx="50" cy="50" r="42" stroke-width="0.5" />
  <polygon points="50,8 56,44 50,50 44,44" stroke-width="1" />
  <circle cx="50" cy="50" r="4" />
`
  );
})();

// The tetractys — the Pythagorean decad. Clucas's argument puts number symbolism, not
// alchemy alone, at the root of the Monas; this is that root drawn plainly.
export const tetractys = (() => {
  const dots = [];
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      const x = 50 + (i - row / 2) * 20;
      const y = 22 + row * 19;
      dots.push(`<circle cx="${x}" cy="${y}" r="4" fill="currentColor" stroke="none" />`);
    }
  }
  return wrap('0 0 100 100', `${dots.join('')}<path d="M50 12 L20 97 H80 Z" stroke-width="0.6" />`);
})();

// An empty shelf-run: the library as it ends. Used for the final acts.
export const shelf = wrap(
  '0 0 100 100',
  `
  <rect x="8" y="14" width="84" height="72" stroke-width="1.2" />
  <path d="M8 44 H92" stroke-width="1" />
  <path d="M8 68 H92" stroke-width="1" />
  <path d="M14 18 V42 M19 18 V42 M24 19 V42 M31 20 V42 M36 18 V42" stroke-width="0.8" />
  <path d="M14 48 V66 M19 47 V66" stroke-width="0.8" />
  <path d="M80 47 V66 M85 48 V66" stroke-width="0.8" />
  <path d="M14 72 V84 M19 71 V84 M25 72 V84" stroke-width="0.8" />
`
);

export const DIAGRAMS = { monas, sigillum, table, compass, tetractys, shelf };
