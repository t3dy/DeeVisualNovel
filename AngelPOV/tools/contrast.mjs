// WCAG contrast audit of the AngelPOV palette tokens.
// Card backgrounds are rgba over the chamber; the scrim keeps what is behind them dark,
// so each card is composited over a near-black ground for the purposes of this check.
const hex = (h) => {
  h = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
// composite rgba(card) over the page ground
const over = (rgb, alpha, ground) => rgb.map((c, i) => c * alpha + ground[i] * (1 - alpha));

const GROUND = hex('#0a0c0f');

const PALETTES = {
  stone:        { card: [[16, 19, 24], 0.965], ink: '#dfe4e8', ink2: '#9c917c', said: '#cfe0e8', written: '#b9c6cf', gold: '#8fa4b2' },
  'stone-warm': { card: [[22, 18, 13], 0.965], ink: '#e8dcc2', ink2: '#9c917c', said: '#cfe0e8', written: '#d8b478', gold: '#c9a34a' },
  prague:       { card: [[28, 21, 13], 0.965], ink: '#ecdcbc', ink2: '#9c917c', said: '#cfe0e8', written: '#e0a95e', gold: '#c9932f' },
  ember:        { card: [[32, 15, 11], 0.965], ink: '#f0d9cd', ink2: '#9c917c', said: '#cfe0e8', written: '#e08a5a', gold: '#c96a3a' },
  faded:        { card: [[20, 21, 21], 0.965], ink: '#c9c6bd', ink2: '#86847c', said: '#cfe0e8', written: '#a99a80', gold: '#8a8171' },
};

// role -> approximate rendered px size, and whether WCAG treats it as large text
const ROLES = {
  ink:     ['body / scene / options', 17, false],
  ink2:    ['eyebrow, note, reading, evidence', 13, false],
  said:    ['what you said', 17, false],
  written: ['what he wrote down', 16, false],
  gold:    ['marks, tagline, evidence label', 12, false],
};

let fails = 0;
let warns = 0;
console.log('WCAG AA needs 4.5:1 for normal text, 3:1 for large.\n');
for (const [name, p] of Object.entries(PALETTES)) {
  const bg = over(p.card[0], p.card[1], GROUND);
  console.log(`--- ${name} ---`);
  for (const [key, [label, px, large]] of Object.entries(ROLES)) {
    const r = ratio(hex(p[key]), bg);
    const need = large ? 3 : 4.5;
    const mark = r >= need ? 'ok  ' : r >= need - 1.0 ? 'WARN' : 'FAIL';
    if (mark === 'FAIL') fails++;
    if (mark === 'WARN') warns++;
    console.log(`  ${mark} ${r.toFixed(2).padStart(5)}:1  ${key.padEnd(8)} ${label} (~${px}px)`);
  }
}
console.log(`\n${fails} failing, ${warns} marginal`);
