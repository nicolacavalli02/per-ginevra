// Cornice del cartoncino, in stile incisione: una fascia tratteggiata con angoli
// rientranti e archi in alto e in basso, rami d'alloro legati da un fiocco agli
// angoli, una palmetta con volute al centro. Tutto disegnato via codice.

const W = 400;
const H = 560;
const SX = 26; // margine della fascia dai bordi del cartoncino
const SU = 30;

const n = (x) => +x.toFixed(2);
const gradi = (rad) => (rad * 180) / Math.PI;

// Profilo della cornice, rientrato di d rispetto a quello esterno.
function sagoma(d) {
  const dx = W - SX;
  const giu = H - SU;
  const x0 = SX + d;
  const x1 = dx - d;
  const y0 = SU + d;
  const y1 = giu - d;
  const r = 26 + d; // raggio dell'angolo rientrante
  const k = Math.sqrt(r * r - d * d);
  const ra = 182 - d; // raggio dell'arco in alto e in basso
  const a = Math.sqrt(ra * ra - (168 - d) ** 2);
  const cx = W / 2;
  const angolo = (x, y) => `A${n(r)} ${n(r)} 0 0 0 ${n(x)} ${n(y)}`;
  const arco = (x, y) => `A${n(ra)} ${n(ra)} 0 0 1 ${n(x)} ${n(y)}`;
  return [
    `M${n(SX + k)} ${n(y0)}L${n(cx - a)} ${n(y0)}`,
    arco(cx + a, y0),
    `L${n(dx - k)} ${n(y0)}`,
    angolo(x1, SU + k),
    `L${n(x1)} ${n(giu - k)}`,
    angolo(dx - k, y1),
    `L${n(cx + a)} ${n(y1)}`,
    arco(cx - a, y1),
    `L${n(SX + k)} ${n(y1)}`,
    angolo(x0, giu - k),
    `L${n(x0)} ${n(SU + k)}`,
    angolo(SX + k, y0),
    'Z',
  ].join('');
}

// Foglia con nervatura: parte da (x, y) e punta nella direzione ang (in gradi).
function foglia(x, y, ang, len) {
  const p = (v) => n(v * len);
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)})">
    <path class="cornice__foglia" d="M0 0C${p(0.3)} ${p(-0.3)} ${p(0.75)} ${p(-0.24)} ${p(1)} 0C${p(0.75)} ${p(0.24)} ${p(0.3)} ${p(0.3)} 0 0Z"/>
    <path d="M${p(0.1)} 0H${p(0.84)}" stroke-width=".6"/>
  </g>`;
}

// Ramo d'alloro lungo una curva (da p0 a p1, con punto di controllo c):
// coppie di foglie ai nodi, una foglia in punta, qualche bacca.
function ramo(p0, c, p1, { nodi = 5, len = 15 } = {}) {
  const punto = (t) => {
    const u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
  };
  const direzione = (t) => {
    const u = 1 - t;
    return gradi(Math.atan2(2 * u * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]), 2 * u * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0])));
  };

  let out = `<path d="M${n(p0[0])} ${n(p0[1])}Q${n(c[0])} ${n(c[1])} ${n(p1[0])} ${n(p1[1])}" stroke-width="1.1"/>`;
  for (let i = 0; i < nodi; i++) {
    const t = 0.1 + (0.78 * i) / (nodi - 1);
    const [x, y] = punto(t);
    const dir = direzione(t);
    const l = len * (1 - 0.32 * t);
    out += foglia(x, y, dir - 34, l) + foglia(x, y, dir + 34, l);
    if (i % 2 === 1) {
      const lato = i % 4 === 1 ? 1 : -1;
      const b = ((dir + 90 * lato) * Math.PI) / 180;
      out += `<circle class="cornice__pieno" cx="${n(x + Math.cos(b) * 2.6)}" cy="${n(y + Math.sin(b) * 2.6)}" r="1.5"/>`;
    }
  }
  out += foglia(p1[0], p1[1], direzione(1), len * 0.72);
  return out;
}

// Voluta: una curva che arriva da destra e si arriccia su se stessa.
function voluta(da, c, centro, r0) {
  const giri = 1.6;
  const passi = 40;
  let d = `M${n(da[0])} ${n(da[1])}Q${n(c[0])} ${n(c[1])} ${n(centro[0])} ${n(centro[1] - r0)}`;
  for (let i = 1; i <= passi; i++) {
    const s = i / passi;
    const ang = -Math.PI / 2 - s * giri * 2 * Math.PI;
    const r = r0 - (r0 - 0.8) * s;
    d += `L${n(centro[0] + r * Math.cos(ang))} ${n(centro[1] + r * Math.sin(ang))}`;
  }
  return `<path d="${d}" stroke-width="1.2"/>`;
}

const FIOCCO = `
  <g class="cornice__pieno" transform="translate(26 30) rotate(-45) scale(1.7)">
    <path d="M0 0c-3-3.4-8-3.4-8 0s5 3.4 8 0c3-3.4 8-3.4 8 0s-5 3.4-8 0z"/>
    <path d="M0 0l-3.4 8.5M0 0l3.4 8.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>`;

function angolo() {
  return (
    ramo([31, 26], [80, 9], [130, 21]) +
    ramo([22, 35], [7, 92], [17, 142]) +
    FIOCCO
  );
}

function centro() {
  const petali = [
    [0, 17],
    [-25, 15.5],
    [25, 15.5],
    [-50, 13],
    [50, 13],
    [-76, 10],
    [76, 10],
  ];
  const palmetta = petali.map(([ang, len]) => foglia(200, 21, -90 + ang, len)).join('');
  const lato = voluta([190, 20], [172, 8], [153, 17.5], 6.5) + foglia(176, 12.6, -150, 9);
  return `
    ${lato}
    <g transform="translate(${W} 0) scale(-1 1)">${lato}</g>
    ${palmetta}
    <circle class="cornice__pieno" cx="200" cy="22" r="2.6"/>`;
}

function fiore() {
  let petali = '';
  for (let i = 0; i < 5; i++) {
    const ang = ((-90 + i * 72) * Math.PI) / 180;
    petali += `<circle class="cornice__foglia" cx="${n(15 + 4.6 * Math.cos(ang))}" cy="${n(280 + 4.6 * Math.sin(ang))}" r="3.5"/>`;
  }
  return `
    ${foglia(15, 271, -90, 17)}${foglia(15, 289, 90, 17)}
    ${foglia(15, 273, -122, 9)}${foglia(15, 287, 122, 9)}
    ${petali}
    <circle class="cornice__pieno" cx="15" cy="280" r="2"/>`;
}

export function cornice() {
  const a = angolo();
  const c = centro();
  const f = fiore();
  return `
    <svg class="cornice" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs>
        <pattern id="cornice-tratteggio" width="4" height="2.4" patternUnits="userSpaceOnUse">
          <path d="M0 1.2H4" stroke="currentColor" stroke-width=".7"/>
        </pattern>
      </defs>
      <path d="${sagoma(0)}${sagoma(12)}" fill="url(#cornice-tratteggio)" fill-rule="evenodd" stroke="none"/>
      <path d="${sagoma(0)}" stroke-width="1.6"/>
      <path d="${sagoma(12)}" stroke-width="1"/>
      <path d="${sagoma(17)}" stroke-width=".6"/>
      ${f}<g transform="translate(${W} 0) scale(-1 1)">${f}</g>
      ${c}<g transform="translate(0 ${H}) scale(1 -1)">${c}</g>
      ${a}
      <g transform="translate(${W} 0) scale(-1 1)">${a}</g>
      <g transform="translate(0 ${H}) scale(1 -1)">${a}</g>
      <g transform="translate(${W} ${H}) scale(-1 -1)">${a}</g>
    </svg>`;
}
