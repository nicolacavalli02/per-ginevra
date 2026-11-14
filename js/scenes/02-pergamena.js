// Scena 2 (automatica, circa 5 s): il cartoncino si arrotola dal bordo in basso verso
// l'alto, come un diploma. Il rotolo nasce già orizzontale, sale e si ingrossa mentre
// il foglio si accorcia, e finisce al centro. Poi un nastro rosso scende dall'alto e
// il rotolo diventa la pergamena fotografica con il fiocco.
//
// Comincia identica a come finisce la scena 1 (stesso sfondo, stesso cartoncino),
// per questo entra con uno stacco netto.

import { creaCartoncino } from './_cartoncino.js';
import { creaFesta } from './_festa.js';
import { NASTRO } from './_nastro.js';
import { creaRotoloFoto } from './_pergamena.js';

// Misure in cqw: il cartoncino e lo spessore del rotolo, all'inizio e alla fine.
const W = 80;
const H = 112;
const SPESSORE = { inizio: 2.4, fine: 11.5 };
// Nella pergamena fotografica il centro del rotolo sta a questa distanza dal bordo alto
// dell'immagine (il fiocco sporge sopra).
const FOTO_CENTRO = 20.9;

// Momenti della sequenza, in ms dall'inizio della scena.
const TEMPI = {
  arrotola: 250, // comincia ad arrotolarsi
  durata: 2500, // quanto dura l'arrotolamento
  nastro: 2900, // il nastro scende dall'alto fino al rotolo
  foto: 3700, // il rotolo diventa la pergamena fotografica, con il fiocco
  fine: 5000, // si passa alla scena 3
};

const n = (x) => +x.toFixed(2);
const morbido = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default {
  taglio: true,

  mount(el, ctx) {
    el.classList.add('biglietto', 'pergamena', 'is-scritta', 'dal-basso');
    const c = ctx.content;
    const festa = creaFesta(el, c.biglietto.fondo, c.biglietto.fontana);

    const foglio = document.createElement('div');
    foglio.className = 'pergamena__foglio';
    const cartoncino = creaCartoncino(c.biglietto);
    const rotolo = document.createElement('div');
    rotolo.className = 'rotolo';
    foglio.append(cartoncino, rotolo);

    // Senza la foto, alla fine si annoda il fiocco disegnato.
    const foto = creaRotoloFoto(c);
    let nastro = null;
    if (foto) {
      foto.style.left = '0';
      foto.style.top = `${-FOTO_CENTRO}cqw`;
      foglio.append(foto);
    } else {
      nastro = document.createElement('div');
      nastro.className = 'nastro';
      nastro.innerHTML = NASTRO;
      foglio.append(nastro);
    }

    // La striscia di nastro che scende dall'alto del palco fino al rotolo.
    const striscia = document.createElement('i');
    striscia.className = 'nastro__caduta';
    el.append(foglio, striscia);

    // Mette in posa foglio e rotolo per un avanzamento k da 0 (piatto) a 1 (arrotolato).
    function posa(k) {
      const resta = H * (1 - k); // quanto del cartoncino è ancora piatto, dall'alto
      const spesso = SPESSORE.inizio + (SPESSORE.fine - SPESSORE.inizio) * Math.sqrt(k);

      // Il cartoncino si accorcia dal basso: la parte arrotolata sparisce nel rotolo.
      cartoncino.style.clipPath = `inset(0 0 ${n(k * 100)}% 0)`;
      if (k >= 1) cartoncino.style.visibility = 'hidden';

      // Il rotolo sta sul bordo basso della parte piatta, un po' davanti.
      rotolo.style.visibility = 'visible';
      rotolo.style.width = `${W}cqw`;
      rotolo.style.height = `${n(spesso)}cqw`;
      rotolo.style.transform = `translate(0, ${n(resta - spesso / 2)}cqw)`;

      // Intanto il foglio scende, così il rotolo finisce esattamente al centro del palco.
      foglio.style.transform = `translateY(${n((H / 2) * morbido(k))}cqw)`;
    }

    const stato = (classe) => () => el.classList.add(classe);
    const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    ctx.after(TEMPI.arrotola, () => {
      ctx.audio.play('carta');
      if (fermo) return posa(1);
      const inizio = performance.now();
      const passo = (t) => {
        const k = Math.min(1, (t - inizio) / TEMPI.durata);
        // Parte piano, come quando si prende il bordo, e finisce morbido.
        posa(morbido(k));
        if (k < 1) raf = requestAnimationFrame(passo);
      };
      raf = requestAnimationFrame(passo);
    });
    ctx.after(TEMPI.arrotola + 1300, () => ctx.audio.play('carta'));
    ctx.after(TEMPI.nastro, stato('is-nastro'));
    ctx.after(TEMPI.foto, () => {
      el.classList.add(foto ? 'is-foto' : 'is-fiocco');
      if (foto) el.classList.add('is-fiocco'); // il nastro che scendeva rientra nel fiocco
    });
    ctx.after(TEMPI.fine, () => ctx.next());

    return () => {
      cancelAnimationFrame(raf);
      festa.distruggi();
    };
  },
};
