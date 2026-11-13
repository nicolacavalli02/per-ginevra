// Scrive dei kanji su un canvas come farebbe un pennello: un tratto dopo l'altro,
// ognuno con l'attacco pieno, il corpo largo e la coda che si assottiglia e si asciuga.
//
// creaPennello(canvas, kanji, opzioni) → { scrivi(durataMs, allaFine), ferma() }
//   kanji: elenco di caratteri, ognuno un elenco di tracciati SVG (linee centrali)
//   opzioni.lato: lato del riquadro dei tracciati
//   opzioni.orizzontale: i caratteri si affiancano; altrimenti si impilano in verticale
//   opzioni.colore: colore dell'inchiostro

const SVG = 'http://www.w3.org/2000/svg';
const SETOLE = 7; // la pennellata è fatta di tante setole affiancate
const PASSO = 0.35; // distanza tra due impronte lungo il tratto, in unità del riquadro
const PAUSA_TRATTO = 45; // ms tra un tratto e l'altro: il pennello si alza
const PAUSA_KANJI = 220; // ms tra un carattere e l'altro

// Numeri "a caso" ma sempre uguali: la scritta viene identica a ogni apertura.
function casuale(seme) {
  let s = seme;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Larghezza della pennellata lungo il tratto (k da 0 a 1): entra, si allarga, si assottiglia.
function profilo(k) {
  const attacco = 0.55 + 0.45 * Math.sin((Math.min(1, k / 0.16) * Math.PI) / 2);
  const coda = k > 0.6 ? 1 - 0.7 * Math.pow((k - 0.6) / 0.4, 1.6) : 1;
  return attacco * coda;
}

export function creaPennello(canvas, kanji, { lato = 109, colore = '#1b1613', orizzontale = false } = {}) {
  const g = canvas.getContext('2d');
  const caso = casuale(20261120);

  // Un <path> fuori pagina serve solo a misurare i tracciati.
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.cssText = 'position:absolute;visibility:hidden';
  const misura = document.createElementNS(SVG, 'path');
  svg.append(misura);
  document.body.append(svg);

  const tratti = [];
  kanji.forEach((carattere, riga) => {
    carattere.forEach((d, i) => {
      misura.setAttribute('d', d);
      const lungo = misura.getTotalLength();
      const quanti = Math.max(2, Math.ceil(lungo / PASSO));
      const punti = [];
      for (let j = 0; j <= quanti; j++) {
        const p = misura.getPointAtLength((j / quanti) * lungo);
        punti.push(orizzontale ? [p.x + riga * lato, p.y] : [p.x, p.y + riga * lato]);
      }
      tratti.push({
        punti,
        lungo,
        base: Math.min(7.6, 5.2 + lungo * 0.034), // i tratti lunghi sono un po' più grossi
        fase: caso() * 6,
        // Ogni setola finisce l'inchiostro in un punto diverso: da lì lascia delle righe.
        secca: Array.from({ length: SETOLE }, () => 0.55 + caso() * 0.6),
        fatti: 0,
        pausaPrima: i === 0 && riga > 0 ? PAUSA_KANJI : i === 0 ? 0 : PAUSA_TRATTO,
      });
    });
  });
  svg.remove();

  const righe = kanji.length;
  let raf = 0;

  function misuraCanvas() {
    const densita = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(canvas.clientWidth * densita);
    canvas.height = Math.round(canvas.clientHeight * densita);
    const lungo = lato * righe; // il lato lungo del canvas contiene tutti i caratteri
    if (orizzontale) g.setTransform(canvas.width / lungo, 0, 0, canvas.height / lato, 0, 0);
    else g.setTransform(canvas.width / lato, 0, 0, canvas.height / lungo, 0, 0);
    g.fillStyle = colore;
  }

  // Disegna le impronte di un tratto dall'ultima fatta fino alla numero "fino".
  function stendi(tratto, fino) {
    const { punti, base, secca, fase } = tratto;
    const ultimo = punti.length - 1;
    for (let j = tratto.fatti; j <= fino; j++) {
      const k = j / ultimo;
      const [x, y] = punti[j];
      const [ax, ay] = punti[Math.max(0, j - 1)];
      const [bx, by] = punti[Math.min(ultimo, j + 1)];
      const lung = Math.hypot(bx - ax, by - ay) || 1;
      const nx = -(by - ay) / lung; // perpendicolare al tratto
      const ny = (bx - ax) / lung;
      const largo = base * profilo(k) * (1 + 0.07 * Math.sin(k * 9 + fase));
      const raggio = (largo / SETOLE) * 0.82;
      for (let s = 0; s < SETOLE; s++) {
        // Verso la fine le setole asciutte saltano qualche impronta.
        if (k > secca[s] && caso() < (k - secca[s]) * 2.6) continue;
        const scarto = (s / (SETOLE - 1) - 0.5) * (largo - raggio * 2);
        g.beginPath();
        g.arc(x + nx * scarto, y + ny * scarto, raggio, 0, Math.PI * 2);
        g.fill();
      }
    }
    tratto.fatti = fino + 1;
  }

  function scrivi(durata, allaFine) {
    misuraCanvas();

    // Ogni tratto dura in proporzione alla sua lunghezza (quelli corti un po' di più).
    const pause = tratti.reduce((somma, t) => somma + t.pausaPrima, 0);
    const pesi = tratti.map((t) => Math.pow(t.lungo, 0.6));
    const peso = pesi.reduce((a, b) => a + b, 0);
    let quando = 0;
    tratti.forEach((t, i) => {
      quando += t.pausaPrima;
      t.inizio = quando;
      t.durata = (pesi[i] / peso) * Math.max(1, durata - pause);
      quando += t.durata;
    });

    const partenza = performance.now();
    const passo = (ora) => {
      const t = ora - partenza;
      let finito = true;
      for (const tratto of tratti) {
        const ultimo = tratto.punti.length - 1;
        if (tratto.fatti > ultimo) continue;
        finito = false;
        if (t < tratto.inizio) break;
        // Il pennello parte deciso e rallenta in fondo al tratto.
        const k = Math.min(1, (t - tratto.inizio) / tratto.durata);
        stendi(tratto, Math.floor((1 - Math.pow(1 - k, 1.7)) * ultimo));
      }
      if (finito) allaFine?.();
      else raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
  }

  return {
    scrivi,
    // Tutta la scritta in un colpo (per chi ha chiesto meno animazioni).
    subito() {
      misuraCanvas();
      for (const tratto of tratti) stendi(tratto, tratto.punti.length - 1);
    },
    ferma: () => cancelAnimationFrame(raf),
  };
}
