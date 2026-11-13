// Scena 4: "Continuous Improvement" diventa 改善 (kaizen). Automatica, circa 8 secondi.
//
// Comincia sopra la fine della scena 3: stesso riquadro al centro, stessa pergamena
// appena sopra. Scende la sera sul diagramma, il riquadro diventa una lanterna di
// carta, un pennello ci scrive i due caratteri, la lanterna si accende e la sua luce
// cade su un bancone scuro: da lì parte la scena 5.

import { creaGettone } from './_pergamena.js';
import { creaSala } from './_sala.js';

// Quando succede ogni cosa, in millisecondi dall'ingresso.
// La scena 5 riprende il dondolio della lanterna da dove lo lascia questa:
// se cambi "accende" o "fine", aggiorna i ritardi di .bancone in scenes.css.
const TEMPI = {
  sera: 120, // il cielo si scurisce, il riquadro comincia a cambiare forma
  scrive: 1650, // primo tratto del pennello
  scrittura: 3300, // quanto dura la scrittura dei due caratteri
  accende: 5150, // la lanterna si accende, intorno si fa notte
  bancone: 6500, // la lanterna sale, la luce cade sul bancone
  fine: 8300,
};

export default {
  sopra: true,

  mount(el, ctx) {
    // "biglietto" e "processo" servono solo per i colori e la grana della pergamena.
    el.classList.add('biglietto', 'processo', 'kaizen');
    if (ctx.sotto.length === 0) el.classList.add('is-sola'); // aperta da sola con ?scene=4

    const sala = creaSala(el, ctx.content);

    // La pergamena, dov'era alla fine del diagramma: cadrà dietro la lanterna.
    const gettone = creaGettone(ctx.content);
    sala.pendolo.before(gettone);

    const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;

    ctx.after(TEMPI.sera, () => el.classList.add('is-sera'));
    ctx.after(TEMPI.scrive, () => {
      ctx.togliSotto(); // ormai il diagramma è coperto dalla sera
      if (fermo) sala.pennello.subito();
      else sala.pennello.scrivi(TEMPI.scrittura);
    });
    ctx.after(TEMPI.accende, () => {
      el.classList.add('is-accesa');
      ctx.audio.play('campanella');
    });
    ctx.after(TEMPI.bancone, () => el.classList.add('is-bancone'));
    ctx.after(TEMPI.fine, () => ctx.next());

    return () => sala.pennello.ferma();
  },
};
