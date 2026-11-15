// Scena 2 (automatica, circa 5 s): il biglietto si arrotola all'indietro dal bordo in
// basso, come un diploma, e diventa una pergamena fatta della stessa carta. Il rotolo
// sale verso il centro, poi un nastro rosso scende dall'alto e si annoda in un fiocco.
//
// Comincia identica a come finisce la scena 1 (stesso sfondo, stesso cartoncino),
// per questo entra con uno stacco netto. L'arrotolamento è disegnato su un canvas a
// partire dall'immagine del biglietto (pergamena.immagine in content.js).

import { creaCartoncino } from './_cartoncino.js';
import { creaFesta } from './_festa.js';
import { NASTRO } from './_nastro.js';
import { creaTelaRotolo, H, W } from './_rotolo.js';

// Momenti della sequenza, in ms dall'inizio della scena.
const TEMPI = {
  arrotola: 250, // comincia ad arrotolarsi
  durata: 2600, // quanto dura l'arrotolamento
  nastro: 3000, // il nastro scende dall'alto fino al rotolo
  fiocco: 3850, // si avvolge e si annoda
  fine: 5200, // si passa alla scena 3
};

const n = (x) => +x.toFixed(2);
const morbido = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default {
  taglio: true,
  ambiente: null,

  mount(el, ctx) {
    el.classList.add('biglietto', 'pergamena', 'is-scritta', 'arrotola');
    const c = ctx.content;
    const festa = creaFesta(el, c.biglietto.fondo, c.biglietto.fontana);

    const foglio = document.createElement('div');
    foglio.className = 'pergamena__foglio';
    const cartoncino = creaCartoncino(c.biglietto);
    const tela = creaTelaRotolo(c.pergamena.immagine);
    // Il fiocco si annoda al centro del rotolo finito, che sta sul bordo alto del biglietto.
    const nastro = document.createElement('div');
    nastro.className = 'nastro';
    nastro.innerHTML = NASTRO;
    nastro.style.left = `${W / 2}cqw`;
    nastro.style.top = '0';
    foglio.append(cartoncino, tela.canvas, nastro);

    // La striscia di nastro che scende dall'alto del palco fino al rotolo.
    const striscia = document.createElement('i');
    striscia.className = 'nastro__caduta';
    el.append(foglio, striscia);

    // Il cartoncino vero resta finché il canvas non ha disegnato la prima immagine.
    tela.disegna(0);

    function posa(k) {
      tela.disegna(k);
      el.classList.add('is-in-corso');
      // Mentre si arrotola il foglio scende, così il rotolo finisce al centro del palco.
      foglio.style.transform = `translateY(${n((H / 2) * morbido(k))}cqw)`;
    }

    const stato = (classe) => () => el.classList.add(classe);
    const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    ctx.audio.musica(null, { dissolvenza: 4 }); // il tappeto luminoso sfuma mentre il biglietto si arrotola
    ctx.after(TEMPI.arrotola, () => {
      if (fermo) return posa(1);
      const inizio = performance.now();
      const passo = (t) => {
        const k = Math.min(1, (t - inizio) / TEMPI.durata);
        // Comincia piano, come quando si prende il bordo, e finisce morbido.
        posa(morbido(k));
        if (k < 1) raf = requestAnimationFrame(passo);
      };
      raf = requestAnimationFrame(passo);
    });
    ctx.after(TEMPI.nastro, stato('is-nastro'));
    ctx.after(TEMPI.fiocco, stato('is-fiocco'));
    ctx.after(TEMPI.fine, () => ctx.next());

    return () => {
      cancelAnimationFrame(raf);
      festa.distruggi();
    };
  },
};
