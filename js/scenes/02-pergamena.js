// Scena 2 (automatica, circa 6 s): il cartoncino si arrotola in diagonale partendo
// dall'angolo in basso a destra, diventa un rotolo che si raddrizza, e un nastro
// rosso scende dall'alto e lo chiude con un fiocco.
//
// Comincia identica a come finisce la scena 1 (stesso sfondo, stesso cartoncino),
// per questo entra con uno stacco netto.

import { creaCartoncino } from './_cartoncino.js';
import { creaFesta } from './_festa.js';
import { NASTRO } from './_nastro.js';
import { creaRotoloFoto } from './_pergamena.js';

// Misure in cqw: il cartoncino e il rotolo finito.
const W = 80;
const H = 112;
const ROTOLO = { lungo: 60, spesso: 9.5 };
const SFUMA = 8; // sotto questa distanza dalla fine l'ultimo lembo svanisce

// Momenti della sequenza, in ms dall'inizio della scena.
const TEMPI = {
  arrotola: 300, // comincia ad arrotolarsi
  durata: 2600, // quanto dura l'arrotolamento
  nastro: 3700, // il nastro si srotola dall'alto fino al rotolo
  fiocco: 4600, // si avvolge e si annoda
  foto: 5350, // il rotolo disegnato sfuma in quello fotografico (se c'è)
  fine: 6400, // si passa alla scena 3
};

const n = (x) => +x.toFixed(2);
const morbido = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default {
  taglio: true,

  mount(el, ctx) {
    el.classList.add('biglietto', 'pergamena', 'is-scritta');
    const festa = creaFesta(el);

    const foglio = document.createElement('div');
    foglio.className = 'pergamena__foglio';
    const cartoncino = creaCartoncino(ctx.content.biglietto);
    const rotolo = document.createElement('div');
    rotolo.className = 'rotolo';
    const nastro = document.createElement('div');
    nastro.className = 'nastro';
    nastro.innerHTML = NASTRO;
    foglio.append(cartoncino, rotolo, nastro);
    const foto = creaRotoloFoto(ctx.content);
    if (foto) foglio.append(foto);

    // La striscia di nastro che scende dall'alto del palco fino al rotolo.
    const striscia = document.createElement('i');
    striscia.className = 'nastro__caduta';
    el.append(foglio, striscia);

    // Mette in posa foglio e rotolo per una data posizione della piega.
    // La piega è la retta x + y = s: parte dall'angolo in basso a destra (s = W + H)
    // e arriva a quello in alto a sinistra (s = 0). Sta piatto ciò che ha x + y < s.
    function posa(s) {
      const fatto = 1 - s / (W + H);
      const spesso = 2.2 + (ROTOLO.spesso - 2.2) * Math.sqrt(fatto);

      // Estremi della piega sui bordi del cartoncino.
      const a = s > W ? [W, s - W] : [s, 0];
      const b = s > H ? [s - H, H] : [0, s];

      if (s > 0) {
        const punti = [[0, 0]];
        if (s > W) punti.push([W, 0], a);
        else punti.push(a);
        if (s > H) punti.push(b, [0, H]);
        else punti.push(b);
        cartoncino.style.clipPath = `polygon(${punti.map(([x, y]) => `${n((x / W) * 100)}% ${n((y / H) * 100)}%`).join(',')})`;
        // L'ultimo lembo sparisce sotto il rotolo invece di restare a vista come un ritaglio.
        cartoncino.style.opacity = s < SFUMA ? n(s / SFUMA) : '';
      } else {
        cartoncino.style.visibility = 'hidden';
      }

      // Il rotolo è lungo quanto la piega; verso la fine non scende sotto la sua lunghezza finale.
      const piega = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const lungo = s > H ? Math.max(piega, 3) : Math.max(piega, ROTOLO.lungo);

      // Nell'ultimo tratto il foglio viene tirato verso il centro, così il rotolo finisce lì.
      const tira = morbido(1 - Math.max(0, Math.min(1, s / W)));
      foglio.style.transform = `translate(${n(tira * (W / 2))}cqw, ${n(tira * (H / 2))}cqw)`;

      // Il rotolo sta a cavallo della piega, un po' sopra la parte ancora piatta.
      const sopra = 0.13 * spesso * (1 - tira);
      const x = (a[0] + b[0]) / 2 - sopra;
      const y = (a[1] + b[1]) / 2 - sopra;
      rotolo.style.visibility = 'visible';
      rotolo.style.width = `${n(lungo)}cqw`;
      rotolo.style.height = `${n(spesso)}cqw`;
      rotolo.style.transform = `translate(${n(x - lungo / 2)}cqw, ${n(y - spesso / 2)}cqw) rotate(-45deg)`;
    }

    // A rotolo finito: si raddrizza restando al centro.
    function raddrizza() {
      el.classList.add('is-arrotolata');
      rotolo.style.transform = `translate(${n(-ROTOLO.lungo / 2)}cqw, ${n(-ROTOLO.spesso / 2)}cqw) rotate(0deg)`;
    }

    const stato = (classe) => () => el.classList.add(classe);
    const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    ctx.after(TEMPI.arrotola, () => {
      ctx.audio.play('carta');
      if (fermo) {
        posa(0);
        raddrizza();
        return;
      }
      const inizio = performance.now();
      const passo = (t) => {
        const k = Math.min(1, (t - inizio) / TEMPI.durata);
        // Parte piano dall'angolo e accelera: la fine è rapida, senza indugiare sull'ultimo lembo.
        posa((W + H) * (1 - Math.pow(k, 1.7)));
        if (k < 1) raf = requestAnimationFrame(passo);
        else raddrizza();
      };
      raf = requestAnimationFrame(passo);
    });
    ctx.after(TEMPI.arrotola + 1400, () => ctx.audio.play('carta'));
    ctx.after(TEMPI.nastro, stato('is-nastro'));
    ctx.after(TEMPI.fiocco, stato('is-fiocco'));
    if (foto) ctx.after(TEMPI.foto, stato('is-foto'));
    ctx.after(TEMPI.fine, () => ctx.next());

    return () => {
      cancelAnimationFrame(raf);
      festa.distruggi();
    };
  },
};
