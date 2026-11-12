// Gestore delle scene: ne monta una alla volta e ripulisce quella precedente.
//
// Una scena è un oggetto { mount(el, ctx), taglio?, sopra? }. mount può restituire una funzione di pulizia.
// ctx offre:
//   next()               passa alla scena successiva (vale una volta sola)
//   sotto, togliSotto()  le scene rimaste sotto una scena "sopra", e come toglierle
//   after(ms, fn)        timer annullato da solo al cambio scena
//   onTap(el, fn)        tap/click; restituisce la funzione per rimuoverlo
//   onSwipe(el, opzioni) swipe/trascinamento; idem
//   audio, content, numero, totale

import { onTap, onSwipe } from './input.js';

const DISSOLVENZA = 450;

export function createEngine({ stage, scenes, audio, content }) {
  let indice = -1;
  let pulizie = [];

  function pulisci() {
    for (const fn of pulizie.splice(0)) fn();
  }

  function go(n) {
    const i = Math.max(0, Math.min(scenes.length - 1, n));
    pulisci();

    // Una scena con "taglio: true" comincia identica a come finisce la precedente:
    // entra con uno stacco netto invece della dissolvenza, così il cambio non si vede.
    const taglio = scenes[i].taglio === true;

    // Una scena con "sopra: true" entra anch'essa con uno stacco, ma appoggiata sopra
    // la precedente, che resta ferma lì sotto finché la nuova non chiama ctx.togliSotto():
    // così può coprirla a poco a poco invece di sostituirla di colpo.
    const sopra = scenes[i].sopra === true;
    const sotto = [];

    for (const vecchia of stage.querySelectorAll('.scene')) {
      if (sopra) {
        vecchia.classList.add('is-sotto');
        sotto.push(vecchia);
        continue;
      }
      if (taglio) {
        vecchia.remove();
        continue;
      }
      vecchia.classList.remove('is-active');
      vecchia.classList.add('is-leaving');
      setTimeout(() => vecchia.remove(), DISSOLVENZA);
    }

    indice = i;
    const el = document.createElement('section');
    el.className = 'scene';
    el.dataset.scene = String(i + 1);
    stage.append(el);

    const registra = (rimuovi) => {
      pulizie.push(rimuovi);
      return rimuovi;
    };

    const ctx = {
      el,
      audio,
      content,
      numero: i + 1,
      totale: scenes.length,
      sotto,
      togliSotto() {
        for (const vecchia of sotto.splice(0)) vecchia.remove();
      },
      next() {
        if (indice === i && i < scenes.length - 1) go(i + 1);
      },
      after(ms, fn) {
        const id = setTimeout(fn, ms);
        return registra(() => clearTimeout(id));
      },
      onTap: (bersaglio, fn) => registra(onTap(bersaglio, fn)),
      onSwipe: (bersaglio, opzioni) => registra(onSwipe(bersaglio, opzioni)),
    };

    const fine = scenes[i].mount(el, ctx);
    if (typeof fine === 'function') pulizie.push(fine);

    if (taglio || sopra) {
      el.style.transition = 'none';
      el.classList.add('is-active');
      void el.offsetWidth;
      el.style.transition = '';
    } else {
      // Forza un reflow così la dissolvenza in entrata parte davvero.
      void el.offsetWidth;
      el.classList.add('is-active');
    }
  }

  return {
    go,
    get indice() {
      return indice;
    },
  };
}
