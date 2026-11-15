// Il biglietto che si arrotola, disegnato su un canvas a partire dall'immagine del
// biglietto vero: così il rotolo è fatto della stessa carta, con la stessa cornice.
//
// Il biglietto si arrotola all'indietro partendo dal bordo in basso: il rotolo sta
// dietro al foglio, tocca il suo bordo basso, e fuori mostra il lato stampato.
// Alla fine si vedono la cornice rossa e l'intestazione avvolte intorno al rotolo.
//
// creaTelaRotolo(src) → { canvas, disegna(k) }  con k da 0 (piatto) a 1 (arrotolato).
// Il canvas copre il biglietto (W × H cqw) più un margine M cqw su ogni lato.

export const W = 80;
export const H = 112;
export const M = 7;
const R_FINE = 6.4; // raggio del rotolo finito, in cqw
const R_INIZIO = 0.9; // raggio della prima piega

const immagini = new Map();
function carica(src) {
  if (!immagini.has(src)) {
    const img = new Image();
    img.src = src;
    immagini.set(src, img.decode().then(() => img));
  }
  return immagini.get(src);
}

const vincola = (x, a, b) => Math.max(a, Math.min(b, x));

export function creaTelaRotolo(src) {
  const canvas = document.createElement('canvas');
  canvas.className = 'rotolo-tela';
  canvas.setAttribute('aria-hidden', 'true');
  const g = canvas.getContext('2d');
  let img = null;
  let ultimo = null;

  carica(src).then((i) => {
    img = i;
    if (ultimo !== null) disegna(ultimo);
  });

  // Dimensiona il canvas sulla sua misura vera (senza le trasformazioni) e sulla densità dello schermo.
  function misura() {
    const densita = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * densita);
    const h = Math.round(canvas.clientHeight * densita);
    if (w && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function disegna(k) {
    ultimo = k;
    if (!img) return;
    misura();
    const s = canvas.width / (W + 2 * M); // pixel per cqw
    if (!s) return;
    const ox = M * s;
    const oy = M * s;
    const Wc = W * s;
    const Hc = H * s;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    g.clearRect(0, 0, canvas.width, canvas.height);

    if (k <= 0) {
      g.drawImage(img, ox, oy, Wc, Hc);
      return;
    }

    // Quanta carta è già arrotolata e quanto è grosso il rotolo (la carta ha uno spessore).
    const L = k * Hc;
    const piatto = Hc - L;
    const r0 = R_INIZIO * s;
    const rf = R_FINE * s;
    const spessore = (Math.PI * (rf * rf - r0 * r0)) / Hc;
    const R = Math.sqrt(r0 * r0 + (L * spessore) / Math.PI);
    const yc = oy + piatto; // il rotolo tocca il bordo basso del foglio a metà della sua altezza

    // --- L'ombra che il rotolo getta sotto di sé ---
    const ombraSotto = g.createRadialGradient(ox + Wc / 2, yc + R * 1.05, 0, ox + Wc / 2, yc + R * 1.05, Wc * 0.55);
    ombraSotto.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
    ombraSotto.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.save();
    g.translate(0, yc + R * 1.05);
    g.scale(1, 0.12);
    g.translate(0, -(yc + R * 1.05));
    g.fillStyle = ombraSotto;
    g.fillRect(ox - Wc * 0.1, yc + R * 1.05 - Wc * 0.55, Wc * 1.2, Wc * 1.1);
    g.restore();

    // --- Il rotolo, una riga alla volta ---
    // Per ogni riga dello schermo si cerca quale riga del biglietto si vede lì, avvolta.
    for (let y = Math.floor(yc - R); y <= Math.ceil(yc + R); y++) {
      const v = (y + 0.5 - yc) / R;
      if (v <= -1 || v >= 1) continue;
      const th = Math.asin(v); // 0 davanti, -90° in alto, +90° in basso
      // Sotto il punto di contatto la carta scende e gira; sopra si vede il giro precedente.
      const arco = th >= 0 ? R * th : R * (th + 2 * Math.PI);
      const p = piatto + arco;
      if (p < Hc) {
        const sy = (p / Hc) * ih;
        g.drawImage(img, 0, sy, iw, Math.max(1, ih / Hc), ox, y, Wc, 1.05);
      } else {
        g.fillStyle = '#e9e1d0'; // dentro, oltre l'ultimo giro: retro del cartoncino
        g.fillRect(ox, y, Wc, 1.05);
      }
      // Luce dall'alto: il rotolo è chiaro sopra e si scurisce verso il basso e ai bordi.
      const luce = vincola(0.28 + 0.72 * (0.75 * Math.cos(th) - 0.66 * Math.sin(th)), 0, 1);
      g.fillStyle = `rgba(38, 24, 10, ${((1 - luce) * 0.85).toFixed(3)})`;
      g.fillRect(ox, y, Wc, 1.05);
      // Un riflesso morbido dove la luce colpisce in pieno.
      const riflesso = Math.exp(-(((th + 0.55) / 0.28) ** 2)) * 0.22;
      if (riflesso > 0.01) {
        g.fillStyle = `rgba(255, 252, 244, ${riflesso.toFixed(3)})`;
        g.fillRect(ox, y, Wc, 1.05);
      }
    }

    // --- Le due estremità: i giri di carta visti di taglio ---
    for (const x of [ox, ox + Wc]) {
      const rx = R * 0.2;
      const sfumatura = g.createLinearGradient(0, yc - R, 0, yc + R);
      sfumatura.addColorStop(0, '#f3ece0');
      sfumatura.addColorStop(1, '#bfb299');
      g.fillStyle = sfumatura;
      g.beginPath();
      g.ellipse(x, yc, rx, R, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(110, 85, 55, 0.35)';
      g.lineWidth = Math.max(1, s * 0.12);
      for (let i = 1; i <= 4; i++) {
        const f = 1 - i * 0.2;
        g.beginPath();
        g.ellipse(x, yc, rx * f, R * f, 0, 0, Math.PI * 2);
        g.stroke();
      }
    }

    // --- Il foglio ancora piatto, davanti al rotolo ---
    if (piatto > 0.5) {
      g.drawImage(img, 0, 0, iw, (piatto / Hc) * ih, ox, oy, Wc, piatto);
      // Il foglio si incurva appena prima del bordo: un'ombra leggera.
      const curva = Math.min(piatto, R * 1.2);
      const ombra = g.createLinearGradient(0, yc - curva, 0, yc);
      ombra.addColorStop(0, 'rgba(40, 26, 12, 0)');
      ombra.addColorStop(1, 'rgba(40, 26, 12, 0.22)');
      g.fillStyle = ombra;
      g.fillRect(ox, yc - curva, Wc, curva);
      // Il bordo del foglio getta ombra sul rotolo appena sotto.
      const sotto = g.createLinearGradient(0, yc, 0, yc + R * 0.7);
      sotto.addColorStop(0, 'rgba(20, 12, 5, 0.35)');
      sotto.addColorStop(1, 'rgba(20, 12, 5, 0)');
      g.fillStyle = sotto;
      g.fillRect(ox, yc, Wc, R * 0.7);
    }
  }

  return { canvas, disegna };
}
