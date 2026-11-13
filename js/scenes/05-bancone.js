// Scena 5: il bancone. Lo chef serve un pezzo alla volta; toccando il pezzo, al suo
// posto si sviluppa una polaroid con un ricordo. Dopo i quattro ricordi arriva la
// pergamena della scena 2: il nastro diventa alga, un taglio, ed è un maki.
//
// Comincia identica a come finisce la scena 4 (lanterna accesa, bancone in basso),
// per questo entra con uno stacco netto.
//
// Per ora i pezzi sono disegnati e le foto sono segnaposto: i contenuti veri si
// mettono in content.js (ricordi e bancone.fondo), senza toccare questo file.

import { NASTRO } from './_nastro.js';
import { crea, creaSala } from './_sala.js';

// Il pezzo disegnato per ogni ricordo, nell'ordine: vale finché in content.js
// (bancone.pezzi) non c'è il ritaglio fotografico corrispondente.
const PEZZI = ['salmone', 'tonno', 'gambero', 'ikura'];

// Dove si mettono via le polaroid: in fila davanti a lei, leggermente storte.
// [posizione orizzontale in cqw, rotazione in gradi]
const POSTI = [
  [14, -5],
  [38, 2],
  [62, -2],
  [86, 5],
];

const TEMPI = {
  servizio: 150, // la lanterna sale, lo sguardo scende sul bancone
  primoPezzo: 1900,
  servito: 700, // quanto ci mette un pezzo ad arrivare sul piatto
  sviluppo: 1500, // quanto ci mette la foto a comparire
  riposta: 500,
  alga: 1100,
  fine: 2400, // dal taglio al cambio scena
};

export default {
  taglio: true,

  mount(el, ctx) {
    const c = ctx.content;
    // Le classi della scena 4, già nello stato finale: la sala è la stessa.
    el.classList.add('biglietto', 'processo', 'kaizen', 'is-sera', 'is-accesa', 'is-bancone', 'bancone');
    const sala = creaSala(el, c);
    sala.pennello.subito();

    // --- Il banco: ha le proporzioni della foto di fondo, tutto il resto si misura su di lui ---
    const banco = crea('div', 'banco');
    if (c.bancone.fondo) {
      const foto = crea('img', 'banco__foto');
      foto.alt = '';
      foto.addEventListener('load', () => el.classList.add('ha-fondo'));
      foto.src = c.bancone.fondo;
      banco.append(foto);
    }

    const piatto = crea('div', 'piatto');
    piatto.append(crea('div', 'piatto__piano'), crea('div', 'piatto__bordo'));
    const invito = crea('div', 'banco__invito');

    // Un ritaglio fotografico, messo esattamente dov'era nella foto del bancone.
    const ritaglio = (classe, { immagine, riquadro: [x, y, w, h] }) => {
      const img = crea('img', classe);
      img.alt = '';
      img.src = immagine;
      img.style.cssText = `left:${x}%;top:${y}%;width:${w}%;height:${h}%`;
      return img;
    };

    const pezzi = c.ricordi.map((_, i) => {
      const vero = c.bancone.pezzi?.[i];
      if (vero) return ritaglio('pezzo pezzo--foto', vero);
      const pezzo = crea('div', `pezzo pezzo--${PEZZI[i % PEZZI.length]}`);
      pezzo.append(crea('div', 'pezzo__riso'), crea('div', 'pezzo__sopra'));
      return pezzo;
    });

    // L'ultimo pezzo: la pergamena, poi l'alga, poi il maki tagliato.
    const maki = crea('div', 'maki');
    const rotolo = crea('div', 'maki__rotolo');
    const fiocco = crea('div', 'maki__fiocco');
    fiocco.innerHTML = NASTRO;
    const fette = crea('div', 'maki__fette');
    for (let i = 0; i < 6; i++) {
      const fetta = crea('div', 'maki__fetta');
      fetta.style.setProperty('--i', i);
      fette.append(fetta);
    }
    maki.append(rotolo, crea('div', 'maki__alga'), fiocco, fette);

    // Se ci sono le tre foto (pergamena, rotolo, fette) prendono il posto del maki disegnato.
    const makiVero = c.bancone.maki;
    const ultimo = makiVero
      ? ['pergamena', 'rotolo', 'fette'].map((nome) => ritaglio(`maki-foto maki-foto--${nome}`, makiVero[nome]))
      : [maki];

    banco.append(piatto, invito, ...pezzi, ...ultimo);
    sala.pendolo.before(banco);

    // --- Le polaroid dei ricordi ---
    const ricordi = c.ricordi.map((ricordo, i) => {
      const polaroid = crea('figure', 'ricordo');
      const [x, storta] = POSTI[i % POSTI.length];
      polaroid.style.setProperty('--dx', `${x - 50}cqw`);
      polaroid.style.setProperty('--r', `${storta}deg`);
      polaroid.style.setProperty('--storta', `${i % 2 ? 2 : -2}deg`);

      const cornice = crea('div', 'ricordo__foto');
      if (ricordo.foto) {
        const img = document.createElement('img');
        img.src = ricordo.foto;
        img.alt = '';
        cornice.append(img);
      } else {
        cornice.append(crea('span', 'ricordo__vuota', String(i + 1)));
      }
      polaroid.append(cornice, crea('figcaption', 'ricordo__didascalia', ricordo.didascalia));
      return polaroid;
    });
    el.append(...ricordi);

    // --- I passi: ogni tap fa il successivo ---
    let occupato = true; // finché è vero i tap sono ignorati
    const libera = (ms) =>
      ctx.after(ms, () => {
        occupato = false;
        el.classList.add('is-attesa'); // un alone sul piatto invita a toccare
      });

    function servi(i) {
      ctx.audio.play('coltello');
      pezzi[i].classList.add('is-servito');
      libera(TEMPI.servito);
    }

    function rivela(i) {
      ctx.audio.play('carta');
      pezzi[i].classList.add('is-mangiato');
      ricordi[i].classList.add('is-grande');
      libera(TEMPI.sviluppo);
    }

    function riponi(i) {
      ricordi[i].classList.remove('is-grande');
      ricordi[i].classList.add('is-riposta');
    }

    const passi = [];
    c.ricordi.forEach((_, i) => {
      passi.push(() => rivela(i));
      passi.push(() => {
        riponi(i);
        if (i < c.ricordi.length - 1) {
          ctx.after(TEMPI.riposta, () => servi(i + 1));
        } else {
          // Finiti i ricordi, sul piatto arriva la pergamena.
          ctx.after(TEMPI.riposta, () => {
            ctx.audio.play('carta');
            el.classList.add('is-pergamena');
            libera(TEMPI.servito);
          });
        }
      });
    });
    passi.push(() => {
      ctx.audio.play('carta');
      el.classList.add('is-alga');
      libera(TEMPI.alga);
    });
    passi.push(() => {
      // Tre colpi di coltello, poi si va alla tendina.
      for (const ms of [0, 190, 380]) ctx.after(ms, () => ctx.audio.play('coltello'));
      ctx.after(380, () => el.classList.add('is-tagliato'));
      ctx.after(TEMPI.fine, () => ctx.next());
    });

    let passo = 0;
    ctx.onTap(el, () => {
      if (occupato || passo >= passi.length) return;
      occupato = true;
      el.classList.remove('is-attesa');
      passi[passo++]();
    });

    ctx.after(TEMPI.servizio, () => el.classList.add('is-servizio'));
    ctx.after(TEMPI.primoPezzo, () => servi(0));

    return () => sala.pennello.ferma();
  },
};
