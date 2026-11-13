// Scena 6: la tendina e la rivelazione.
//
// Una tendina rossa cala sul bancone della scena 5 e il pennello ci scrive 尊敬.
// Lei la scosta con il dito (o la tocca): un attimo di buio e silenzio, poi compare
// il bancone apparecchiato per due e, uno per tap, quattro bigliettini: il regalo,
// le due parole giapponesi, le parole di Nicola.

import { LATO, OMAKASE, SONKEI } from './_kanji.js';
import { creaPennello } from './_pennello.js';
import { crea } from './_sala.js';

const TEMPI = {
  cala: 80, // la tendina comincia a scendere
  chiusa: 1050, // ha coperto tutto: sotto si può fare buio
  scrive: 1100, // primo tratto del pennello sulla tendina
  perKanji: 1150, // quanto dura la scrittura di ognuno dei due caratteri
  silenzio: 1300, // dal momento in cui si apre a quando compare il bancone
  primoBiglietto: 1700, // dal bancone al primo bigliettino
  penna: 750, // dal bigliettino al primo tratto del pennello
};

const FREGIO = `
  <svg viewBox="0 0 80 8" aria-hidden="true">
    <path d="M0 4H31M49 4H80" fill="none" stroke="currentColor" stroke-width=".8"/>
    <path d="M40 .8L44.6 4L40 7.2L35.4 4Z" fill="currentColor"/>
  </svg>`;

// Un bigliettino: le righe compaiono una dopo l'altra, nell'ordine in cui sono date.
function biglietto(storto, ...righe) {
  const el = crea('article', 'invito');
  el.style.setProperty('--storto', `${storto}deg`);
  righe.forEach((riga, i) => riga.style.setProperty('--i', i));
  el.append(...righe);
  return el;
}

// Il bigliettino di una parola giapponese: caratteri a pennello, lettura, significato, nota.
function parola(storto, voce, classe) {
  const tela = crea('canvas', `invito__kanji ${classe}`);
  tela.setAttribute('role', 'img');
  tela.setAttribute('aria-label', voce.kanji);
  const el = biglietto(
    storto,
    tela,
    crea('p', 'invito__lettura', voce.lettura),
    crea('p', 'invito__significato', voce.significato),
    crea('p', 'invito__nota', voce.nota),
  );
  return { el, tela };
}

export default {
  sopra: true,

  mount(el, ctx) {
    const c = ctx.content.reveal;
    // "biglietto" serve solo per i colori e la grana della carta.
    el.classList.add('biglietto', 'rivelazione');

    // --- Il bancone per due, che compare dopo il silenzio ---
    const tavola = crea('div', 'tavola');
    tavola.style.backgroundImage = `url("${c.fondo}")`;

    // --- I quattro bigliettini ---
    const fregio = crea('span', 'invito__fregio');
    fregio.innerHTML = FREGIO;
    const regalo = biglietto(
      -1.5,
      crea('p', 'invito__sopra', c.annuncio),
      crea('h1', 'invito__titolo', c.regalo),
      fregio,
      crea('p', 'invito__locale', c.locale),
      crea('p', 'invito__citta', c.citta),
    );
    const omakase = parola(1.5, c.omakase, 'invito__kanji--tre');
    const sonkei = parola(-1, c.sonkei, 'invito__kanji--due');
    const frase = crea('div', 'invito__frase');
    for (const riga of c.frase) frase.append(crea('p', '', riga));
    const parole = biglietto(1, frase, crea('p', 'invito__chiusa', c.chiusa), crea('p', 'invito__firma', c.firma));

    const biglietti = [regalo, omakase.el, sonkei.el, parole];
    const pennelli = [
      null,
      creaPennello(omakase.tela, OMAKASE, { lato: LATO, orizzontale: true }),
      creaPennello(sonkei.tela, SONKEI, { lato: LATO, orizzontale: true }),
      null,
    ];

    // --- La tendina: due teli, un carattere per telo ---
    const noren = crea('div', 'noren');
    const teli = ['sx', 'dx'].map((lato, i) => {
      const telo = crea('div', `noren__telo noren__telo--${lato}`);
      const tela = crea('canvas', 'noren__kanji');
      telo.append(tela);
      if (c.tessuto) {
        // La foto del tessuto, con i due bordi del telo un po' in ombra.
        telo.classList.add('noren__telo--foto');
        telo.style.backgroundImage = `linear-gradient(90deg, rgba(0, 0, 0, 0.3), transparent 12%, transparent 88%, rgba(0, 0, 0, 0.3)), url("${c.tessuto}")`;
      }
      return { telo, pennello: creaPennello(tela, [SONKEI[i]], { lato: LATO, colore: '#f4e7cc' }) };
    });
    noren.setAttribute('role', 'img');
    noren.setAttribute('aria-label', c.sonkei.kanji);
    noren.append(...teli.map((t) => t.telo), crea('div', 'noren__asta'));

    el.append(tavola, ...biglietti, noren);

    const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // attesa → pronta (si può aprire) → aperta → biglietti (un tap = il prossimo) ⇄ occupata
    let stato = 'attesa';
    let indice = -1;

    function mostra(i) {
      indice = i;
      stato = 'occupata';
      biglietti[i - 1]?.classList.remove('is-ultimo');
      biglietti[i].classList.add('is-mostrato', 'is-ultimo');
      ctx.audio.play('carta');

      const pennello = pennelli[i];
      if (pennello) {
        ctx.after(TEMPI.penna, () => (fermo ? pennello.subito() : pennello.scrivi(1500)));
      }
      ctx.after(pennello ? 2600 : 2000, () => {
        stato = 'biglietti';
        el.classList.add('is-attesa'); // il bigliettino respira: invita a toccare
      });
    }

    function apri() {
      stato = 'aperta';
      el.style.removeProperty('--apri');
      el.classList.remove('is-pronta', 'is-trascina');
      el.classList.add('is-aperta');
      ctx.audio.play('tendina');
      ctx.after(TEMPI.silenzio, () => {
        el.classList.add('is-tavola');
        ctx.audio.play('rivelazione');
        ctx.after(TEMPI.primoBiglietto, () => mostra(0));
      });
    }

    // Il dito scosta i teli; se il gesto è abbastanza ampio la tendina si apre.
    ctx.onSwipe(el, {
      onMove({ dx, dy }) {
        if (stato !== 'pronta') return;
        el.classList.add('is-trascina');
        el.style.setProperty('--apri', Math.min(1, Math.hypot(dx, dy) / (el.clientWidth * 0.45)).toFixed(3));
      },
      onEnd({ swiped }) {
        if (stato !== 'pronta') return;
        el.classList.remove('is-trascina');
        if (swiped) apri();
        else el.style.setProperty('--apri', '0');
      },
    });

    ctx.onTap(el, () => {
      if (stato === 'pronta') apri();
      else if (stato === 'biglietti') {
        el.classList.remove('is-attesa');
        if (indice < biglietti.length - 1) mostra(indice + 1);
        else {
          stato = 'occupata';
          ctx.next();
        }
      }
    });

    // --- Ingresso: cala la tendina, il pennello scrive i due caratteri ---
    if (ctx.sotto.length === 0) el.classList.add('is-chiusa'); // aperta da sola con ?scene=6
    ctx.after(TEMPI.cala, () => {
      el.classList.add('is-calata');
      ctx.audio.play('tendina');
    });
    ctx.after(TEMPI.chiusa, () => {
      ctx.togliSotto();
      el.classList.add('is-chiusa');
    });
    ctx.after(TEMPI.scrive, () => {
      const pronta = () => {
        stato = 'pronta';
        el.classList.add('is-pronta'); // i teli si muovono appena: invitano a scostarli
      };
      if (fermo) {
        teli.forEach((t) => t.pennello.subito());
        pronta();
      } else {
        teli[0].pennello.scrivi(TEMPI.perKanji, () => teli[1].pennello.scrivi(TEMPI.perKanji, pronta));
      }
    });

    return () => {
      teli.forEach((t) => t.pennello.ferma());
      pennelli.forEach((p) => p?.ferma());
    };
  },
};
