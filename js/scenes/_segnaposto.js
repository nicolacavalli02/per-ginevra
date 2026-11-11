// Scena segnaposto: non ha grafica, ma rispetta il ritmo della scena vera
// (tap, parti automatiche, swipe). Ogni scena la sostituirà con la propria.
//
// passi: elenco, o funzione (content) => elenco, di
//   { tipo: 'tap' | 'auto' | 'swipe' | 'fermo', testo, ms, suono }

const GESTI = {
  tap: 'tocca per continuare',
  swipe: 'scorri per aprire',
  fermo: '',
};

export function segnaposto({ titolo, capisce, passi }) {
  return {
    mount(el, ctx) {
      const elenco = typeof passi === 'function' ? passi(ctx.content) : passi;

      el.classList.add('segnaposto');
      el.innerHTML = `
        <p class="segnaposto__num"></p>
        <h1 class="segnaposto__titolo"></h1>
        <p class="segnaposto__capisce"></p>
        <p class="segnaposto__passo"></p>
        <div class="segnaposto__barra"><i></i></div>
        <p class="segnaposto__gesto"></p>`;

      const trova = (classe) => el.querySelector(`.segnaposto__${classe}`);
      trova('num').textContent = `Scena ${ctx.numero} / ${ctx.totale} · segnaposto`;
      trova('titolo').textContent = titolo;
      trova('capisce').textContent = `Cosa capisce lei: ${capisce}`;

      const elPasso = trova('passo');
      const elBarra = trova('barra');
      const elGesto = trova('gesto');

      let i = -1;
      let ferma = null;
      let animazione = null;

      function avanti() {
        ferma?.();
        ferma = null;
        animazione?.cancel();
        animazione = null;

        i += 1;
        const passo = elenco[i];
        if (!passo) return ctx.next();

        elPasso.textContent = passo.testo ?? '';
        elBarra.hidden = passo.tipo !== 'auto';
        elGesto.textContent =
          passo.tipo === 'auto' ? `automatico · ${passo.ms / 1000} s` : GESTI[passo.tipo];
        if (passo.suono) ctx.audio.play(passo.suono);

        if (passo.tipo === 'tap') {
          ferma = ctx.onTap(el, () => {
            ctx.audio.play('click');
            avanti();
          });
        } else if (passo.tipo === 'auto') {
          animazione = elBarra.firstElementChild.animate(
            [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
            { duration: passo.ms, fill: 'forwards' },
          );
          ferma = ctx.after(passo.ms, avanti);
        } else if (passo.tipo === 'swipe') {
          ferma = ctx.onSwipe(el, {
            onEnd: ({ swiped }) => {
              if (swiped) avanti();
            },
          });
        }
      }

      avanti();
    },
  };
}
