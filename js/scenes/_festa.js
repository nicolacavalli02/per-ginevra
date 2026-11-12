// Atmosfera di festa serale: fili di lucine, luci sfocate sullo sfondo,
// due fontane luminose e coriandoli. Lucine e sfondo sono elementi fermi con
// animazioni leggere; scintille e coriandoli sono particelle su un canvas,
// che gira solo finché c'è qualcosa da disegnare.

// Luci sfocate in lontananza: [x %, y %, diametro in cqw, opacità, tono]
const BOKEH = [
  [8, 22, 15, 0.16, 'a'],
  [82, 18, 20, 0.13, 'b'],
  [30, 34, 9, 0.2, 'c'],
  [66, 38, 12, 0.14, 'a'],
  [92, 48, 16, 0.12, 'c'],
  [4, 56, 11, 0.15, 'b'],
  [50, 26, 7, 0.22, 'c'],
  [18, 72, 18, 0.08, 'a'],
  [78, 70, 13, 0.1, 'b'],
  [40, 88, 10, 0.07, 'a'],
  [95, 84, 9, 0.09, 'c'],
  [58, 12, 11, 0.18, 'b'],
  [22, 13, 6, 0.26, 'c'],
  [72, 9, 5, 0.3, 'a'],
  [38, 17, 4.5, 0.28, 'b'],
  [90, 30, 6, 0.2, 'c'],
  [12, 40, 5, 0.2, 'a'],
  [60, 52, 5.5, 0.14, 'c'],
];

// Fili di lucine, in cqw: punti di aggancio, quanto pende ogni campata,
// lampadine per campata, grandezza delle lampadine.
const FILI = [
  { classe: 'festa__filo--dietro', ancore: [[-6, 12], [62, 8.5], [106, 14]], pende: 4.5, n: 6, r: 0.72 },
  { classe: 'festa__filo--davanti', ancore: [[-6, 3], [45, 1.5], [106, 6.5]], pende: 6.5, n: 5, r: 1 },
];

const COLORI_CORIANDOLI = ['#f6f0e3', '#e2b765', '#b3262a', '#f1d9a0', '#e2b765'];
const COLORI_CERALACCA = ['#8e1b1d', '#a8201f', '#6f1213'];

// Scintille per età: [colore, spessore, lunghezza della scia in secondi].
// Appena nate sono bianche e spesse, poi dorate, infine arancio e sottili.
const SCINTILLE = [
  ['rgba(255,252,240,1)', 1.15, 0.032],
  ['rgba(255,222,150,0.9)', 0.9, 0.028],
  ['rgba(255,158,78,0.65)', 0.7, 0.022],
];

const n = (x) => +x.toFixed(2);

function creaLucine() {
  const contenitore = document.createElement('div');
  contenitore.className = 'festa__lucine';
  let k = 0;

  for (const filo of FILI) {
    const gruppo = document.createElement('div');
    gruppo.className = `festa__filo ${filo.classe}`;
    gruppo.style.setProperty('--r', filo.r);

    let cavo = '';
    let attacchi = '';
    for (let s = 0; s < filo.ancore.length - 1; s++) {
      const [ax, ay] = filo.ancore[s];
      const [bx, by] = filo.ancore[s + 1];
      const cx = (ax + bx) / 2;
      const cy = (ay + by) / 2 + 2 * filo.pende;
      cavo += `${s === 0 ? `M${ax} ${ay}` : ''}Q${n(cx)} ${n(cy)} ${bx} ${by}`;

      for (let i = 0; i < filo.n; i++) {
        const t = (i + 0.5) / filo.n;
        const u = 1 - t;
        const x = u * u * ax + 2 * u * t * cx + t * t * bx;
        const y = u * u * ay + 2 * u * t * cy + t * t * by;
        attacchi += `<rect x="${n(x - 0.5 * filo.r)}" y="${n(y - 0.2)}" width="${n(filo.r)}" height="${n(1.6 * filo.r)}" rx=".2"/>`;

        const lampadina = document.createElement('i');
        lampadina.className = 'festa__lampadina';
        lampadina.style.left = `${n(x)}cqw`;
        lampadina.style.top = `${n(y + 1.2 * filo.r)}cqw`;
        lampadina.style.setProperty('--k', k++);
        gruppo.append(lampadina);
      }
    }

    gruppo.insertAdjacentHTML(
      'afterbegin',
      `<svg viewBox="0 0 100 30" aria-hidden="true"><path d="${cavo}" fill="none" stroke="#0b0b10" stroke-width=".28"/><g fill="#0b0b10">${attacchi}</g></svg>`,
    );
    contenitore.append(gruppo);
  }
  return contenitore;
}

function creaBokeh() {
  const contenitore = document.createElement('div');
  contenitore.className = 'festa__bokeh';
  BOKEH.forEach(([x, y, d, opacita, tono], i) => {
    const luce = document.createElement('i');
    luce.className = `festa__luce-lontana festa__luce-lontana--${tono}`;
    luce.style.cssText = `left:${x}%;top:${y}%;width:${d}cqw;height:${d}cqw;--o:${opacita};--k:${i}`;
    contenitore.append(luce);
  });
  return contenitore;
}

function crea(tag, classe) {
  const el = document.createElement(tag);
  el.className = classe;
  return el;
}

export function creaFesta(el) {
  const sfondo = crea('div', 'festa');
  // Le animazioni partono "già in corsa" dal tempo trascorso dall'apertura della pagina:
  // così lucine e luci non scattano quando una scena passa lo sfondo alla successiva.
  sfondo.style.setProperty('--ora', `${n(performance.now() / 1000)}s`);
  sfondo.append(creaBokeh(), creaLucine());

  const candele = ['sx', 'dx'].map((lato) => crea('i', `festa__candela festa__candela--${lato}`));
  const canvas = crea('canvas', 'festa__particelle');
  const riverbero = crea('div', 'festa__riverbero'); // la luce che le fontane gettano sulla scena
  const alone = crea('div', 'festa__alone');

  el.append(sfondo, ...candele, canvas, riverbero, alone);

  const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const g = canvas.getContext('2d');
  let W = 0;
  let H = 0;
  let dpr = 1;

  function misura() {
    W = el.clientWidth;
    H = el.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }
  misura();
  const osservatore = new ResizeObserver(misura);
  osservatore.observe(el);

  let scintille = [];
  let coriandoli = [];
  let intensita = 0; // forza attuale delle fontane, da 0 a 1
  let bersaglio = 0; // forza a cui devono arrivare
  let resto = 0;
  let raf = 0;
  let ultimo = 0;

  // Le punte delle due candele (stesse misure di .festa__candela nel CSS).
  const punte = () => [
    { x: W * 0.107, y: H - W * 0.24, verso: 1 },
    { x: W * 0.893, y: H - W * 0.24, verso: -1 },
  ];

  // Un getto stretto e alto, con qualche scintilla che scappa di lato.
  function nuovaScintilla(punta) {
    const sparpaglio = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
    const apertura = Math.random() < 0.12 ? 0.55 : 0.2;
    const ang = -Math.PI / 2 + sparpaglio * apertura + punta.verso * 0.05;
    const v = W * (1.25 + Math.random() * 1.1);
    const vita = 0.55 + Math.random() * 0.75;
    scintille.push({ x: punta.x, y: punta.y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vita, max: vita, figlia: false });
  }

  function disegnaCoriandoli(dt) {
    g.globalCompositeOperation = 'source-over';
    coriandoli = coriandoli.filter((c) => c.vita > 0 && c.y < H + 30);
    for (const c of coriandoli) {
      c.vita -= dt;
      c.vy += W * 1.1 * dt;
      c.vx *= 1 - 1.8 * dt;
      c.vy *= 1 - 1.8 * dt;
      c.fase += c.vf * dt;
      c.rot += c.vr * dt;
      c.x += (c.vx + Math.sin(c.fase) * W * 0.15) * dt;
      c.y += c.vy * dt;
      g.save();
      g.globalAlpha = Math.min(1, c.vita / 0.6);
      g.translate(c.x, c.y);
      g.rotate(c.rot);
      g.scale(1, Math.cos(c.fase * 1.3));
      g.fillStyle = c.colore;
      g.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      g.restore();
    }
    g.globalAlpha = 1;
  }

  function disegnaScintille(dt) {
    // I colori si sommano dove le scie si sovrappongono: alla base il getto diventa bianco.
    g.globalCompositeOperation = 'lighter';
    g.lineCap = 'round';

    const gruppi = [[], [], []];
    const nate = [];
    scintille = scintille.filter((s) => {
      s.vita -= dt;
      if (s.vita <= 0) {
        // Alcune scintille, spegnendosi, scoppiano in una stellina.
        if (!s.figlia && Math.random() < 0.2) {
          for (let i = 0; i < 4; i++) {
            const ang = Math.random() * Math.PI * 2;
            const v = W * (0.18 + Math.random() * 0.25);
            nate.push({ x: s.x, y: s.y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vita: 0.16, max: 0.16, figlia: true });
          }
        }
        return false;
      }
      s.vy += W * 2.3 * dt;
      s.vx *= 1 - 0.9 * dt;
      s.vy *= 1 - 0.9 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const k = s.vita / s.max;
      gruppi[k > 0.62 ? 0 : k > 0.3 ? 1 : 2].push(s);
      return true;
    });
    scintille.push(...nate);

    const scala = Math.max(0.7, W / 400);
    gruppi.forEach((gruppo, i) => {
      if (!gruppo.length) return;
      const [colore, spessore, scia] = SCINTILLE[i];
      g.strokeStyle = colore;
      g.lineWidth = spessore * scala;
      g.beginPath();
      for (const s of gruppo) {
        const coda = s.figlia ? scia * 0.5 : scia;
        g.moveTo(s.x - s.vx * coda, s.y - s.vy * coda);
        g.lineTo(s.x, s.y);
      }
      g.stroke();
    });

    if (intensita <= 0.02) return;
    for (const punta of punte()) {
      const trema = 0.85 + Math.random() * 0.3;

      // Colonna di luce lungo il getto.
      g.save();
      g.translate(punta.x, punta.y - W * 0.17 * intensita);
      g.scale(1, 3.2);
      const raggioGetto = W * 0.055 * trema;
      const getto = g.createRadialGradient(0, 0, 0, 0, 0, raggioGetto);
      getto.addColorStop(0, `rgba(255,236,190,${n(0.4 * intensita)})`);
      getto.addColorStop(1, 'rgba(255,190,110,0)');
      g.fillStyle = getto;
      g.beginPath();
      g.arc(0, 0, raggioGetto, 0, Math.PI * 2);
      g.fill();
      g.restore();

      // Bagliore bianco alla punta della candela.
      const raggio = W * 0.085 * trema * Math.sqrt(intensita);
      const bagliore = g.createRadialGradient(punta.x, punta.y, 0, punta.x, punta.y, raggio);
      bagliore.addColorStop(0, 'rgba(255,250,232,1)');
      bagliore.addColorStop(0.25, 'rgba(255,214,140,.55)');
      bagliore.addColorStop(1, 'rgba(255,150,60,0)');
      g.fillStyle = bagliore;
      g.beginPath();
      g.arc(punta.x, punta.y, raggio, 0, Math.PI * 2);
      g.fill();
    }
  }

  function fotogramma(t) {
    const dt = Math.min(0.05, (t - ultimo) / 1000);
    ultimo = t;
    intensita += (bersaglio - intensita) * Math.min(1, dt * 4);
    riverbero.style.opacity = n(intensita * (0.9 + Math.random() * 0.1));

    if (intensita > 0.02) {
      resto += intensita * 240 * dt;
      const quante = Math.floor(resto);
      resto -= quante;
      for (const punta of punte()) for (let i = 0; i < quante; i++) nuovaScintilla(punta);
    }

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    disegnaCoriandoli(dt);
    disegnaScintille(dt);

    const attivo = bersaglio > 0 || intensita > 0.02 || scintille.length || coriandoli.length;
    raf = attivo ? requestAnimationFrame(fotogramma) : 0;
    if (!attivo) {
      g.clearRect(0, 0, W, H);
      riverbero.style.opacity = 0;
    }
  }

  function avvia() {
    if (raf || fermo) return;
    ultimo = performance.now();
    raf = requestAnimationFrame(fotogramma);
  }

  // Pezzetti che partono da un punto (frazioni di larghezza e altezza della scena).
  function scoppio(fx, fy, quanti, { colori, grandezza, spinta, vita }) {
    if (fermo) return;
    for (let i = 0; i < quanti; i++) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
      const v = W * spinta * (0.4 + Math.random());
      const w = W * grandezza * (0.5 + Math.random() * 0.5);
      coriandoli.push({
        x: W * fx,
        y: H * fy,
        vx: Math.cos(ang) * v,
        vy: Math.sin(ang) * v,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 8,
        fase: Math.random() * Math.PI * 2,
        vf: 4 + Math.random() * 5,
        w,
        h: w * (1.4 + Math.random() * 0.8),
        colore: colori[i % colori.length],
        vita,
      });
    }
    avvia();
  }

  return {
    // Accende, regola o spegne le fontane (0 = spente, 1 = piena forza).
    fontane(forza) {
      bersaglio = forza;
      avvia();
    },
    coriandoli(fx = 0.5, fy = 0.5, quanti = 70) {
      scoppio(fx, fy, quanti, { colori: COLORI_CORIANDOLI, grandezza: 0.024, spinta: 1.25, vita: 4.5 });
    },
    // Briciole di ceralacca, quando il sigillo si spezza.
    frammenti(fx, fy, quanti = 12) {
      scoppio(fx, fy, quanti, { colori: COLORI_CERALACCA, grandezza: 0.012, spinta: 0.55, vita: 1.3 });
    },
    distruggi() {
      cancelAnimationFrame(raf);
      raf = 0;
      osservatore.disconnect();
    },
    // Toglie la festa dalla scena (quando lo sfondo cambia del tutto).
    rimuovi() {
      this.distruggi();
      for (const pezzo of [sfondo, ...candele, canvas, riverbero, alone]) pezzo.remove();
    },
  };
}
