// Scena 7: il finale. Nessuna interazione e nessun timer: lo schermo resta fermo.
//
// Entra sopra la fine della scena 6 e la lascia lì sotto: il bancone per due resta,
// i bigliettini salgono e spariscono verso l'alto (portano lo sguardo in su), e nel
// buio compaiono le ultime due righe.

import { crea } from './_sala.js';

const TEMPI = {
  congedo: 100, // i bigliettini cominciano a salire
  prima: 1500, // "Il resto te lo dico a voce."
  poi: 3300, // "Alza gli occhi."
};

export default {
  sopra: true,

  mount(el, ctx) {
    const c = ctx.content;
    el.classList.add('biglietto', 'finale');

    // Aperta da sola con ?scene=7 non c'è la scena 6 sotto: il bancone lo mette lei.
    if (ctx.sotto.length === 0) {
      el.classList.add('is-sola');
      const tavola = crea('div', 'tavola');
      tavola.style.backgroundImage = `url("${c.reveal.fondo}")`;
      el.append(tavola);
    }

    el.append(
      crea('div', 'finale__velo'),
      crea('p', 'finale__prima', c.finale.prima),
      crea('p', 'finale__poi', c.finale.poi),
    );

    ctx.after(TEMPI.congedo, () => {
      for (const sotto of ctx.sotto) sotto.classList.add('is-congedo');
      el.classList.add('is-congedo');
    });
    ctx.after(TEMPI.prima, () => el.classList.add('is-prima'));
    ctx.after(TEMPI.poi, () => el.classList.add('is-poi'));
  },
};
