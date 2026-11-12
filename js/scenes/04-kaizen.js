// Scena 4: "Continuous Improvement" diventa 改善 (kaizen). Automatica, circa 8 secondi.
//
// Comincia sopra la fine della scena 3: stesso riquadro al centro, stessa pergamena
// appena sopra. Scende la sera sul diagramma, il riquadro diventa una lanterna di
// carta, un pennello ci scrive i due caratteri, la lanterna si accende e la sua luce
// cade su un bancone scuro: da lì parte la scena 5.

import { KAIZEN, LATO } from './_kanji.js';
import { NASTRO } from './_nastro.js';
import { creaPennello } from './_pennello.js';

// Quando succede ogni cosa, in millisecondi dall'ingresso.
const TEMPI = {
  sera: 120, // il cielo si scurisce, il riquadro comincia a cambiare forma
  scrive: 1650, // primo tratto del pennello
  scrittura: 3300, // quanto dura la scrittura dei due caratteri
  accende: 5150, // la lanterna si accende, intorno si fa notte
  bancone: 6500, // la lanterna sale, la luce cade sul bancone
  fine: 8300,
};

function crea(tag, classe, testo) {
  const el = document.createElement(tag);
  el.className = classe;
  if (testo !== undefined) el.textContent = testo;
  return el;
}

export default {
  sopra: true,

  mount(el, ctx) {
    const c = ctx.content;
    // "biglietto" e "processo" servono solo per i colori e la grana della pergamena.
    el.classList.add('biglietto', 'processo', 'kaizen');
    if (ctx.sotto.length === 0) el.classList.add('is-sola'); // aperta da sola con ?scene=4

    // La pergamena, dov'era alla fine del diagramma.
    const gettone = crea('div', 'gettone');
    const corpo = crea('div', 'gettone__corpo');
    const nastro = crea('div', 'nastro');
    nastro.innerHTML = NASTRO;
    corpo.append(crea('div', 'rotolo'), nastro);
    gettone.append(corpo);

    // Il riquadro che diventa lanterna, appeso a un filo che pende dall'alto.
    const lanterna = crea('div', 'kaizen__lanterna');
    const inchiostro = crea('canvas', 'kaizen__inchiostro');
    inchiostro.setAttribute('role', 'img');
    inchiostro.setAttribute('aria-label', `${c.kaizen.kanji} (${c.kaizen.lettura})`);
    lanterna.append(
      crea('div', 'kaizen__luce'),
      crea('div', 'kaizen__coste'),
      crea('span', 'kaizen__titolo', c.processo.fine),
      inchiostro,
      crea('div', 'kaizen__tappo kaizen__tappo--su'),
      crea('div', 'kaizen__tappo kaizen__tappo--giu'),
    );
    const pendolo = crea('div', 'kaizen__pendolo');
    pendolo.append(crea('div', 'kaizen__filo'), crea('div', 'kaizen__alone'), lanterna);

    el.append(
      crea('div', 'kaizen__sera'),
      crea('div', 'kaizen__notte'),
      crea('div', 'kaizen__bancone'),
      gettone,
      pendolo,
      crea('p', 'kaizen__lettura', c.kaizen.lettura),
    );

    const pennello = creaPennello(inchiostro, KAIZEN, { lato: LATO });
    const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;

    ctx.after(TEMPI.sera, () => el.classList.add('is-sera'));
    ctx.after(TEMPI.scrive, () => {
      ctx.togliSotto(); // ormai il diagramma è coperto dalla sera
      if (fermo) pennello.subito();
      else pennello.scrivi(TEMPI.scrittura);
    });
    ctx.after(TEMPI.accende, () => {
      el.classList.add('is-accesa');
      ctx.audio.play('campanella');
    });
    ctx.after(TEMPI.bancone, () => el.classList.add('is-bancone'));
    ctx.after(TEMPI.fine, () => ctx.next());

    return () => pennello.ferma();
  },
};
