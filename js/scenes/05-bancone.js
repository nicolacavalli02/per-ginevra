// Scena 5: il bancone. Lo chef serve un pezzo alla volta; toccando il pezzo, al suo
// posto si sviluppa una polaroid con un ricordo. Messo via il quarto ricordo si passa
// alla tendina della scena 6.
//
// Comincia identica a come finisce la scena 4 (lanterna accesa sopra il bancone),
// per questo entra con uno stacco netto.
//
// Foto, didascalie e immagini dei pezzi stanno in content.js (ricordi e bancone).

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
  servizio: 150, // la lanterna sale ancora un po', la scritta se ne va
  primoPezzo: 1900,
  servito: 700, // quanto ci mette un pezzo ad arrivare sul piatto
  sviluppo: 1500, // quanto ci mette la foto a comparire
  riposta: 500,
  lettura: 4500, // quanto resta grande una polaroid prima di mettersi via da sola
  fine: 1300, // dall'ultimo ricordo messo via al cambio scena
};

export default {
  taglio: true,
  ambiente: 'giappone',

  mount(el, ctx) {
    const c = ctx.content;
    // Le classi della scena 4, già nello stato finale: la sala è la stessa.
    el.classList.add('biglietto', 'processo', 'kaizen', 'is-sera', 'is-accesa', 'is-bancone', 'bancone');
    const sala = creaSala(el, c);
    sala.pennello.subito();

    // --- Sul banco: tutto si misura sulla foto di fondo ---
    const piatto = crea('div', 'piatto'); // serve solo se manca la foto, che il piatto ce l'ha già
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

    // I video dello chef che serve ogni pezzo (dove ci sono): partono dalla foto del piatto
    // vuoto e finiscono sulla foto con il pezzo, che poi prende il loro posto.
    const video = c.ricordi.map((_, i) => {
      const sorgente = c.bancone.video?.[i];
      if (!sorgente || !c.bancone.pezzi?.[i]) return null;
      const v = crea('video', 'banco__video');
      v.src = sorgente;
      v.muted = true;
      v.playsInline = true;
      v.preload = 'auto';
      return v;
    });

    sala.banco.append(piatto, ...video.filter(Boolean), invito, ...pezzi);

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
      const v = video[i];
      // Lo chef appoggia il pezzo senza rumori: sotto c'è il koto.
      const senzaVideo = () => {
        pezzi[i].classList.add('is-servito');
        libera(TEMPI.servito);
      };
      if (!v) return senzaVideo();

      // Con il video: alla fine il pezzo fotografico, identico all'ultimo fotogramma, lo sostituisce.
      let fatto = false;
      const posato = () => {
        if (fatto) return;
        fatto = true;
        pezzi[i].classList.add('pezzo--subito', 'is-servito');
        v.classList.remove('is-in-scena');
        libera(0);
      };
      v.addEventListener('ended', posato, { once: true });
      v.currentTime = 0;
      v.play().then(
        () => {
          v.classList.add('is-in-scena');
        },
        () => {
          // Il video non parte: il pezzo arriva come senza video.
          if (fatto) return;
          fatto = true;
          senzaVideo();
        },
      );
      ctx.after(9000, posato); // per sicurezza
    }

    function rivela(i) {
      ctx.audio.play('carta');
      pezzi[i].classList.add('is-mangiato');
      ricordi[i].classList.add('is-grande');
      // Mentre si guarda la foto l'invito a toccare passa dal piatto alla polaroid.
      el.classList.add('is-foto-aperta');
      libera(TEMPI.sviluppo);
      // Se lei non tocca, dopo qualche secondo la polaroid si mette via da sola.
      const passoRiponi = 2 * i + 1;
      ctx.after(TEMPI.sviluppo + TEMPI.lettura, () => {
        if (passo === passoRiponi && !occupato) avanza();
      });
    }

    function riponi(i) {
      el.classList.remove('is-foto-aperta');
      ricordi[i].classList.remove('is-grande');
      ricordi[i].classList.add('is-riposta');
    }

    const passi = [];
    c.ricordi.forEach((_, i) => {
      passi.push(() => rivela(i));
      passi.push(() => {
        riponi(i);
        if (i < c.ricordi.length - 1) ctx.after(TEMPI.riposta, () => servi(i + 1));
        else ctx.after(TEMPI.fine, () => ctx.next()); // finiti i ricordi, cala la tendina
      });
    });

    let passo = 0;
    function avanza() {
      if (occupato || passo >= passi.length) return;
      occupato = true;
      el.classList.remove('is-attesa');
      passi[passo++]();
    }
    ctx.onTap(el, avanza);

    ctx.after(TEMPI.servizio, () => el.classList.add('is-servizio'));
    ctx.after(TEMPI.primoPezzo, () => servi(0));

    return () => sala.pennello.ferma();
  },
};
