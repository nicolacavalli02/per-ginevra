// Il cartoncino con il QR da mettere nella scatoletta: stesso stile del biglietto della
// pagina (carta avorio, cornice rossa, corsivo). Esce un foglio A4 con più copie e i
// segni di taglio, in stampa/cartoncino-qr.html (poi lo si esporta in PDF).
//
// Uso: node strumenti/cartoncino-qr.js <cartella con node_modules/qrcode>
// La libreria qrcode serve solo qui, sul PC: nella pagina non entra.

const path = require('path');
const fs = require('fs');
const QRCode = require(path.join(process.argv[2], 'node_modules', 'qrcode'));

const URL = 'https://nicolacavalli02.github.io/per-ginevra/';
const TITOLO = 'Per Ginevra';
const RIGA = 'Inquadrami.';

// Misure in millimetri. La scatoletta dentro è 80 × 48: il cartoncino sta 1,5 mm più
// stretto per lato, così entra senza incurvarsi.
const W = 77;
const H = 45;
const QR = 25; // lato del codice, la misura scelta sul foglio di prova
const QR_X = 44.5; // il codice sta a destra, con almeno 3 mm liberi tutto intorno
const COPIE = 8;

const n = (x) => +x.toFixed(2);

// La cornice: doppio filetto rosso con gli angoli rientranti, come il biglietto.
function profilo(a, r) {
  return (
    `M${n(a + r)} ${n(a)}H${n(W - a - r)}A${r} ${r} 0 0 0 ${n(W - a)} ${n(a + r)}` +
    `V${n(H - a - r)}A${r} ${r} 0 0 0 ${n(W - a - r)} ${n(H - a)}` +
    `H${n(a + r)}A${r} ${r} 0 0 0 ${n(a)} ${n(H - a - r)}` +
    `V${n(a + r)}A${r} ${r} 0 0 0 ${n(a + r)} ${n(a)}Z`
  );
}
const rombo = (x, y, s) => `M${n(x)} ${n(y - s)}L${n(x + s * 1.5)} ${n(y)}L${n(x)} ${n(y + s)}L${n(x - s * 1.5)} ${n(y)}Z`;

function cornice() {
  const a = 2.6;
  const angoli = [
    [a, a],
    [W - a, a],
    [W - a, H - a],
    [a, H - a],
  ];
  return `
  <svg class="cornice" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <path d="${profilo(a, 3)}" fill="none" stroke="#9b1c1f" stroke-width=".34"/>
    <path d="${profilo(a + 0.95, 3.95)}" fill="none" stroke="#9b1c1f" stroke-width=".14"/>
    ${angoli.map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".62" fill="#9b1c1f"/>`).join('')}
    ${[a, H - a]
      .map((y) => `<path d="${rombo(W / 2, y, 1.25)}" fill="#f7f2e8" stroke="#f7f2e8" stroke-width="1.1"/><path d="${rombo(W / 2, y, 0.85)}" fill="#9b1c1f"/>`)
      .join('')}
  </svg>`;
}

const FREGIO = `
  <svg class="fregio" viewBox="0 0 80 8" aria-hidden="true">
    <path d="M0 4H31M49 4H80" fill="none" stroke="#9b1c1f" stroke-width=".9"/>
    <path d="M40 .8L44.6 4L40 7.2L35.4 4Z" fill="#9b1c1f"/>
  </svg>`;

// Segni di taglio: quattro coppie di trattini fuori dagli angoli del cartoncino.
function tagli() {
  const d = 1.5; // distanza dal bordo
  const l = 4; // lunghezza
  const segni = [];
  for (const [x, sx] of [
    [0, -1],
    [W, 1],
  ]) {
    for (const [y, sy] of [
      [0, -1],
      [H, 1],
    ]) {
      segni.push(`M${x + sx * d} ${y}h${sx * l}M${x} ${y + sy * d}v${sy * l}`);
    }
  }
  return `<svg class="tagli" viewBox="-6 -6 ${W + 12} ${H + 12}" aria-hidden="true"><path d="${segni.join('')}" fill="none" stroke="#000" stroke-width=".12"/></svg>`;
}

(async () => {
  const qr = await QRCode.toString(URL, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 0,
    color: { dark: '#14110f', light: '#0000' },
  });

  const cartoncino = `
    <div class="posto">
      ${tagli()}
      <div class="cartoncino">
        ${cornice()}
        <div class="testo">
          <p class="titolo">${TITOLO}</p>
          ${FREGIO}
          <p class="riga">${RIGA}</p>
        </div>
        <div class="qr">${qr}</div>
      </div>
    </div>`;

  const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><title>Cartoncino QR</title>
<style>
  @font-face { font-family: "Pinyon Script"; src: url("../assets/fonts/pinyon-script.woff2") format("woff2"); }
  @font-face { font-family: "Bodoni Moda"; font-style: italic; font-weight: 400 700; src: url("../assets/fonts/bodoni-moda-italic.woff2") format("woff2"); }
  @page { size: A4; margin: 12mm 15mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 9.5pt/1.4 system-ui, sans-serif; color: #333; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  header p { margin: 0 0 1.5mm; }
  .griglia { display: grid; grid-template-columns: repeat(2, ${W + 12}mm); gap: 0 2mm; justify-content: center; margin-top: 3mm; }
  .posto { position: relative; width: ${W + 12}mm; height: ${H + 12}mm; }
  .tagli { position: absolute; inset: 0; width: 100%; height: 100%; }
  .cartoncino { position: absolute; left: 6mm; top: 6mm; width: ${W}mm; height: ${H}mm; background: #f7f2e8; overflow: hidden; }
  .cornice { position: absolute; inset: 0; width: 100%; height: 100%; }
  .testo { position: absolute; left: 5.5mm; top: 0; width: ${n(QR_X - 3 - 5.5)}mm; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .titolo { margin: 0; color: #9b1c1f; font: 400 8.1mm/1 "Pinyon Script", cursive; white-space: nowrap; }
  .fregio { display: block; width: 15mm; margin: 2.6mm 0 2.2mm; }
  .riga { margin: 0; color: #2a2622; font: italic 400 3.1mm/1 "Bodoni Moda", serif; letter-spacing: .04em; }
  .qr { position: absolute; left: ${QR_X}mm; top: ${n((H - QR) / 2)}mm; width: ${QR}mm; height: ${QR}mm; }
  .qr svg { display: block; width: 100%; height: 100%; }
  .righello { margin: 3mm auto 1mm; width: 100mm; height: 5mm; border: .3mm solid #222; border-top: 0;
    background: repeating-linear-gradient(90deg, #222 0 .3mm, transparent .3mm 10mm); }
  footer { text-align: center; color: #666; font-size: 8.5pt; }
</style></head><body>
  <header>
    <p><b>Cartoncino per la scatoletta</b> · ${W} × ${H} mm, QR da ${QR} mm · ${COPIE} copie (le altre sono di riserva)</p>
    <p>Stampa <b>al 100% / "Dimensioni effettive"</b> su cartoncino da 200–300 g, poi taglia lungo i trattini agli angoli.</p>
  </header>
  <div class="griglia">${cartoncino.repeat(COPIE)}</div>
  <div class="righello"></div>
  <footer>Controllo della stampa: questa riga deve misurare 10 cm esatti.</footer>
</body></html>`;

  const uscita = path.join(__dirname, '..', 'stampa');
  fs.mkdirSync(uscita, { recursive: true });
  fs.writeFileSync(path.join(uscita, 'cartoncino-qr.html'), html);
  console.log(`fatto: stampa/cartoncino-qr.html — cartoncino ${W}×${H} mm, QR ${QR} mm, ${COPIE} copie`);
})();
