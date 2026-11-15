// Scena 6: la tendina e la rivelazione.
//
// Una tendina rossa cala sul bancone della scena 5 e il pennello ci scrive 尊敬.
// Lei la scosta con il dito (o la tocca): un attimo di buio e silenzio, poi compare
// il bancone apparecchiato per due e, uno per tap, le due parole giapponesi.
// Poi il regalo: la sala si fa buia, si accende un fascio di luce e ci scende una
// busta con scritto "Il tuo regalo". Lei rompe il sigillo, il bigliettino esce e si
// ingrandisce. Per ultime le parole di Nicola.

import { LATO, OMAKASE, SONKEI } from './_kanji.js';
import { creaPennello } from './_pennello.js';
import { crea } from './_sala.js';

const TEMPI = {
  trascina: 1.2, // con il video: quanti secondi di apertura segue il dito
  dopoVideo: 900, // dal bancone svelato al primo bigliettino
  cala: 80, // la tendina comincia a scendere
  chiusa: 1050, // ha coperto tutto: sotto si può fare buio
  scrive: 1100, // primo tratto del pennello sulla tendina
  perKanji: 1150, // quanto dura la scrittura di ognuno dei due caratteri
  silenzio: 1300, // dal momento in cui si apre a quando compare il bancone
  primoBiglietto: 1700, // dal bancone al primo bigliettino
  penna: 750, // dal bigliettino al primo tratto del pennello
};

// Il momento del regalo, dal tap sul bigliettino di sonkei.
const REGALO = {
  preludio: 700, // nel buio compare "E adesso…"
  faro: 1700, // si accende il fascio di luce
  preludioVia: 2300, // "E adesso…" sparisce (in 0,45 s) prima che arrivi la busta
  busta: 2800, // la busta scende nella luce
  pronta: 4000, // la busta è posata: il sigillo respira, si può toccare
  // dal tap sul sigillo:
  lembo: 250, // il lembo si apre
  esce: 800, // il bigliettino esce dalla busta
  libero: 2000, // il bigliettino si ingrandisce, la busta scende e sparisce
  attesa: 4900, // righe scritte: il prossimo tap porta le parole di Nicola
};

const SCINTILLE = 18;

// La busta del regalo, vista davanti: la tasca, e il lembo chiuso con la punta in basso.
const TASCA = `
  <svg viewBox="0 0 68 52" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="scrigno-tasca" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8f1b1d"/><stop offset="1" stop-color="#5f1013"/>
      </linearGradient>
    </defs>
    <path d="M0 0L34 30L68 0V52H0Z" fill="url(#scrigno-tasca)"/>
    <path d="M0 52L33 27M68 52L35 27" stroke="rgba(0,0,0,.28)" stroke-width=".5" fill="none"/>
    <rect x=".6" y=".6" width="66.8" height="50.8" fill="none" stroke="#d8b26a" stroke-width=".35" opacity=".7"/>
  </svg>`;
const LEMBO = `
  <svg viewBox="0 0 68 31" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="scrigno-lembo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#a42224"/><stop offset="1" stop-color="#7b1619"/>
      </linearGradient>
    </defs>
    <path d="M0 0H68L34 30Z" fill="url(#scrigno-lembo)" stroke="rgba(0,0,0,.3)" stroke-width=".4"/>
    <path d="M1.4 .6H66.6L34 29Z" fill="none" stroke="#d8b26a" stroke-width=".3" opacity=".7"/>
  </svg>`;

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
  ambiente: 'giappone', // continua dalla scena 5 finché lei non apre la tendina

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
      crea('h1', 'invito__titolo', c.regalo),
      fregio,
      crea('p', 'invito__locale', c.locale),
      crea('p', 'invito__citta', c.citta),
      crea('p', 'invito__data', c.data),
    );
    const omakase = parola(1.5, c.omakase, 'invito__kanji--tre');
    const sonkei = parola(-1, c.sonkei, 'invito__kanji--due');
    const frase = crea('div', 'invito__frase');
    for (const riga of c.frase) frase.append(crea('p', '', riga));
    const parole = biglietto(1, frase, crea('p', 'invito__chiusa', c.chiusa), crea('p', 'invito__firma', c.firma));
    regalo.classList.add('invito--regalo');
    parole.classList.add('invito--parole');

    // --- Il momento del regalo: buio, fascio di luce, busta con il sigillo ---
    const velo = crea('div', 'regalo__velo');
    const faro = crea('div', 'faro');
    const cono = crea('div', 'faro__cono');
    faro.append(cono, crea('div', 'faro__pozza'), crea('div', 'faro__lampo'));
    for (let i = 0; i < 9; i++) {
      const granello = crea('span', 'faro__polvere');
      granello.style.cssText = `--x:${(38 + Math.random() * 24).toFixed(1)}cqw;--y:${(25 + Math.random() * 55).toFixed(1)};--d:${(Math.random() * -6).toFixed(2)}s`;
      faro.append(granello);
    }
    const preludio = crea('p', 'regalo__preludio', c.preludio);

    const retro = crea('div', 'scrigno scrigno__retro');
    const tasca = crea('div', 'scrigno scrigno__tasca');
    tasca.innerHTML = TASCA;
    tasca.append(crea('span', 'scrigno__scritta', c.busta));
    const lembo = crea('div', 'scrigno scrigno__lembo');
    lembo.innerHTML = LEMBO;
    const sigillo = crea('div', 'scrigno scrigno__sigillo');
    sigillo.innerHTML = `
      <div class="sigillo">
        <div class="sigillo__meta sigillo__meta--sx"><span></span></div>
        <div class="sigillo__meta sigillo__meta--dx"><span></span></div>
      </div>`;
    for (const lettera of sigillo.querySelectorAll('span')) lettera.textContent = ctx.content.biglietto.sigillo;
    for (let i = 0; i < SCINTILLE; i++) {
      const scintilla = crea('span', 'scintilla');
      const angolo = (i / SCINTILLE) * Math.PI * 2 + Math.random() * 0.3;
      const forza = 18 + Math.random() * 22;
      scintilla.style.cssText = `--dx:${(Math.cos(angolo) * forza).toFixed(1)}cqw;--dy:${(Math.sin(angolo) * forza - 8).toFixed(1)}cqw;--d:${(Math.random() * 0.15).toFixed(2)}s`;
      sigillo.append(scintilla);
    }
    const busta = [retro, tasca, lembo, sigillo];

    // Prima le due parole, poi il regalo che le mette insieme, infine le parole di Nicola.
    const biglietti = [omakase.el, sonkei.el, regalo, parole];
    const pennelli = [
      creaPennello(omakase.tela, OMAKASE, { lato: LATO, orizzontale: true }),
      creaPennello(sonkei.tela, SONKEI, { lato: LATO, orizzontale: true }),
      null,
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

    // La tendina girata con Flow (se c'è): mentre lei la scosta il video segue il dito,
    // poi va fino in fondo e resta fermo sull'ultimo fotogramma, che è il bancone per due.
    let video = null;
    if (c.tendaVideo && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('con-tenda');
      video = crea('video', 'tenda__video');
      video.src = c.tendaVideo;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.addEventListener('error', () => {
        video?.remove();
        video = null;
        el.classList.remove('is-tenda-video', 'con-tenda');
      });
    }

    el.append(tavola, ...(video ? [video] : []), velo, faro, ...biglietti, ...busta, preludio, noren);

    const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // attesa → pronta (si può aprire) → aperta → biglietti (un tap = il prossimo) ⇄ occupata;
    // prima del regalo: sigillo (un tap lo rompe)
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
        ctx.after(TEMPI.penna, () => {
          if (fermo) return pennello.subito();
          pennello.scrivi(1500);
          ctx.audio.play('pennello', { durata: 1.5 });
        });
      }
      ctx.after(pennello ? 2600 : 2000, () => {
        stato = 'biglietti';
        el.classList.add('is-attesa'); // il bigliettino respira: invita a toccare
      });
    }

    // Dopo le due parole: buio, il fascio di luce, la busta che scende.
    const iRegalo = biglietti.indexOf(regalo);
    function preparaRegalo() {
      stato = 'occupata';
      el.classList.add('is-buio');
      biglietti.slice(0, iRegalo).forEach((b) => b.classList.add('is-via'));
      ctx.after(REGALO.preludio, () => el.classList.add('is-preludio'));
      ctx.after(REGALO.faro, () => {
        el.classList.add('is-faro');
        ctx.audio.play('faro');
        ctx.audio.vibra(25);
      });
      ctx.after(REGALO.preludioVia, () => el.classList.remove('is-preludio'));
      ctx.after(REGALO.busta, () => {
        ctx.audio.play('soffio'); // la busta scende nella luce
        el.classList.add('is-busta');
      });
      ctx.after(REGALO.pronta, () => {
        regalo.classList.add('is-dentro'); // dietro la tasca: non si vede ancora
        el.classList.add('is-sigillo');
        stato = 'sigillo';
      });
    }

    // Il sigillo si rompe, la luce lampeggia, il bigliettino esce e si ingrandisce.
    function apriRegalo() {
      stato = 'occupata';
      ctx.audio.play('sigillo');
      ctx.audio.play('scintille');
      ctx.audio.vibra([30, 60, 30]);
      el.classList.remove('is-sigillo');
      el.classList.add('is-rotta');
      sigillo.classList.add('is-rotto');
      ctx.after(REGALO.lembo, () => el.classList.add('is-lembo'));
      ctx.after(REGALO.esce, () => {
        ctx.audio.play('carta');
        regalo.classList.add('is-fuori');
      });
      ctx.after(REGALO.libero, () => {
        ctx.audio.musica('finale', { attacco: 1.5 }); // gli archi: dal regalo fino alla fine
        ctx.audio.vibra(90);
        biglietti[iRegalo - 1]?.classList.remove('is-ultimo');
        regalo.classList.add('is-libero', 'is-mostrato', 'is-ultimo');
        el.classList.add('is-busta-via');
        indice = iRegalo;
      });
      ctx.after(REGALO.attesa, () => {
        stato = 'biglietti';
        el.classList.add('is-attesa');
      });
    }

    function apri() {
      stato = 'aperta';
      ctx.audio.ambiente(null, { dissolvenza: 1.2 }); // aperta la tendina: un attimo di silenzio
      el.style.removeProperty('--apri');
      el.classList.remove('is-pronta', 'is-trascina');
      el.classList.add('is-aperta');
      ctx.audio.play('tendina');
      if (video) {
        el.classList.add('is-tenda-video');
        let fatto = false;
        const svelato = () => {
          if (fatto) return;
          fatto = true;
          ctx.after(TEMPI.dopoVideo, () => mostra(0));
        };
        video.addEventListener('ended', svelato, { once: true });
        video.play().catch(svelato);
        ctx.after(6000, svelato); // per sicurezza
        return;
      }
      ctx.after(TEMPI.silenzio, () => {
        el.classList.add('is-tavola');
        ctx.after(TEMPI.primoBiglietto, () => mostra(0));
      });
    }

    // Il dito scosta i teli; se il gesto è abbastanza ampio la tendina si apre.
    ctx.onSwipe(el, {
      onMove({ dx, dy }) {
        if (stato !== 'pronta') return;
        el.classList.add('is-trascina');
        const p = Math.min(1, Math.hypot(dx, dy) / (el.clientWidth * 0.45));
        el.style.setProperty('--apri', p.toFixed(3));
        // Con il video: i teli seguono il dito nella prima parte dell'apertura.
        if (video && video.readyState >= 1) {
          el.classList.add('is-tenda-video');
          video.currentTime = p * TEMPI.trascina;
        }
      },
      onEnd({ swiped }) {
        if (stato !== 'pronta') return;
        el.classList.remove('is-trascina');
        if (swiped) apri();
        else {
          el.style.setProperty('--apri', '0');
          if (video) {
            el.classList.remove('is-tenda-video'); // torna la tendina vera, chiusa
            video.currentTime = 0;
          }
        }
      },
    });

    ctx.onTap(el, () => {
      if (stato === 'pronta') apri();
      else if (stato === 'sigillo') apriRegalo();
      else if (stato === 'biglietti') {
        el.classList.remove('is-attesa');
        if (indice + 1 === iRegalo) preparaRegalo();
        else if (indice < biglietti.length - 1) {
          if (indice === iRegalo) el.classList.add('is-dopo-regalo'); // torna un po' di luce
          mostra(indice + 1);
        }
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
        ctx.audio.play('pennello', { durata: (2 * TEMPI.perKanji) / 1000 });
      }
    });

    return () => {
      teli.forEach((t) => t.pennello.ferma());
      pennelli.forEach((p) => p?.ferma());
    };
  },
};
