// Scena 2 (automatica, circa 6 s): il cartoncino si arrotola in diagonale partendo
// dall'angolo in basso a destra, diventa un rotolo che si raddrizza, e un nastro
// rosso scende dall'alto e lo chiude con un fiocco.
//
// Comincia identica a come finisce la scena 1 (stesso sfondo, stesso cartoncino),
// per questo entra con uno stacco netto.
//
// Se in content.js c'è il video (pergamena.video) l'arrotolamento è quello girato con
// Flow: parte dallo stesso cartoncino e finisce sul rotolo con il fiocco, poi sfuma nella
// pergamena fotografica. Se il video non parte, si usa l'animazione disegnata.

import { creaCartoncino } from './_cartoncino.js';
import { creaFesta } from './_festa.js';
import { NASTRO } from './_nastro.js';
import { creaRotoloFoto } from './_pergamena.js';

// Misure in cqw: il cartoncino e il rotolo finito.
const W = 80;
const H = 112;
const ROTOLO = { lungo: 60, spesso: 9.5 };
const SFUMA = 8; // sotto questa distanza dalla fine l'ultimo lembo svanisce

// Momenti della sequenza, in ms dall'inizio della scena.
const TEMPI = {
  arrotola: 300, // comincia ad arrotolarsi
  durata: 2600, // quanto dura l'arrotolamento
  nastro: 3700, // il nastro si srotola dall'alto fino al rotolo
  fiocco: 4600, // si avvolge e si annoda
  foto: 5350, // il rotolo disegnato sfuma in quello fotografico (se c'è)
  fine: 6400, // si passa alla scena 3
};

// Con il video: quando parte, quanto prima della sua fine sfuma nella foto, e dopo
// quanto si passa alla scena 3.
const VIDEO = { parte: 250, sfuma: 450, poi: 650 };

const n = (x) => +x.toFixed(2);
const morbido = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default {
  taglio: true,

  mount(el, ctx) {
    el.classList.add('biglietto', 'pergamena', 'is-scritta');
    const festa = creaFesta(el, ctx.content.biglietto.fondo, ctx.content.biglietto.fontana);

    const foglio = document.createElement('div');
    foglio.className = 'pergamena__foglio';
    const cartoncino = creaCartoncino(ctx.content.biglietto);
    const rotolo = document.createElement('div');
    rotolo.className = 'rotolo';
    const nastro = document.createElement('div');
    nastro.className = 'nastro';
    nastro.innerHTML = NASTRO;
    foglio.append(cartoncino, rotolo, nastro);
    const foto = creaRotoloFoto(ctx.content);
    if (foto) foglio.append(foto);

    // La striscia di nastro che scende dall'alto del palco fino al rotolo.
    const striscia = document.createElement('i');
    striscia.className = 'nastro__caduta';
    el.append(foglio, striscia);

    // Mette in posa foglio e rotolo per una data posizione della piega.
    // La piega è la retta x + y = s: parte dall'angolo in basso a destra (s = W + H)
    // e arriva a quello in alto a sinistra (s = 0). Sta piatto ciò che ha x + y < s.
    function posa(s) {
      const fatto = 1 - s / (W + H);
      const spesso = 2.2 + (ROTOLO.spesso - 2.2) * Math.sqrt(fatto);

      // Estremi della piega sui bordi del cartoncino.
      const a = s > W ? [W, s - W] : [s, 0];
      const b = s > H ? [s - H, H] : [0, s];

      if (s > 0) {
        const punti = [[0, 0]];
        if (s > W) punti.push([W, 0], a);
        else punti.push(a);
        if (s > H) punti.push(b, [0, H]);
        else punti.push(b);
        cartoncino.style.clipPath = `polygon(${punti.map(([x, y]) => `${n((x / W) * 100)}% ${n((y / H) * 100)}%`).join(',')})`;
        // L'ultimo lembo sparisce sotto il rotolo invece di restare a vista come un ritaglio.
        cartoncino.style.opacity = s < SFUMA ? n(s / SFUMA) : '';
      } else {
        cartoncino.style.visibility = 'hidden';
      }

      // Il rotolo è lungo quanto la piega; verso la fine non scende sotto la sua lunghezza finale.
      const piega = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const lungo = s > H ? Math.max(piega, 3) : Math.max(piega, ROTOLO.lungo);

      // Nell'ultimo tratto il foglio viene tirato verso il centro, così il rotolo finisce lì.
      const tira = morbido(1 - Math.max(0, Math.min(1, s / W)));
      foglio.style.transform = `translate(${n(tira * (W / 2))}cqw, ${n(tira * (H / 2))}cqw)`;

      // Il rotolo sta a cavallo della piega, un po' sopra la parte ancora piatta.
      const sopra = 0.13 * spesso * (1 - tira);
      const x = (a[0] + b[0]) / 2 - sopra;
      const y = (a[1] + b[1]) / 2 - sopra;
      rotolo.style.visibility = 'visible';
      rotolo.style.width = `${n(lungo)}cqw`;
      rotolo.style.height = `${n(spesso)}cqw`;
      rotolo.style.transform = `translate(${n(x - lungo / 2)}cqw, ${n(y - spesso / 2)}cqw) rotate(-45deg)`;
    }

    // A rotolo finito: si raddrizza restando al centro.
    function raddrizza() {
      el.classList.add('is-arrotolata');
      rotolo.style.transform = `translate(${n(-ROTOLO.lungo / 2)}cqw, ${n(-ROTOLO.spesso / 2)}cqw) rotate(0deg)`;
    }

    const stato = (classe) => () => el.classList.add(classe);
    const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    // --- Con il video ---
    const sorgente = ctx.content.pergamena?.video;
    if (sorgente && foto && !fermo) {
      const video = document.createElement('video');
      video.className = 'pergamena__video';
      video.src = sorgente;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      el.append(video);

      let finito = false;
      let disegnata = false;
      const chiudi = () => {
        if (finito || disegnata) return;
        finito = true;
        // La pergamena fotografica sta nel foglio: lo porta dove l'animazione disegnata
        // lo lascerebbe, così il rotolo è al centro come nel video.
        cartoncino.style.visibility = 'hidden';
        foglio.style.transition = 'none';
        foglio.style.transform = `translate(${W / 2}cqw, ${H / 2}cqw)`;
        el.classList.add('is-foto', 'is-fine-video'); // il video sfuma nella pergamena fotografica
        ctx.after(VIDEO.poi, () => ctx.next());
      };
      // Se il video non parte (file mancante, rete lenta) si torna all'animazione disegnata.
      const ripiega = () => {
        if (disegnata || finito) return;
        disegnata = true;
        video.remove();
        el.classList.remove('is-video');
        animaDisegnata(0);
      };
      video.addEventListener('error', ripiega);
      video.addEventListener('timeupdate', () => {
        if (video.duration && video.currentTime >= video.duration - VIDEO.sfuma / 1000) chiudi();
      });
      video.addEventListener('ended', chiudi);

      ctx.after(VIDEO.parte, () => {
        video.play().then(() => {
          el.classList.add('is-video');
          ctx.audio.play('carta');
          ctx.after(1400, () => ctx.audio.play('carta'));
        }, ripiega);
      });
      // Se dopo un secondo e mezzo non è ancora partito, meglio il disegno.
      ctx.after(VIDEO.parte + 1500, () => {
        if (video.paused) ripiega();
      });
      ctx.after(VIDEO.parte + 9000, chiudi); // per sicurezza

      return () => {
        video.pause();
        cancelAnimationFrame(raf);
        festa.distruggi();
      };
    }

    animaDisegnata(TEMPI.arrotola);

    // --- Senza video: l'animazione disegnata. "ritardo" è quando comincia ad arrotolarsi. ---
    function animaDisegnata(ritardo) {
    const t0 = ritardo - TEMPI.arrotola;
    ctx.after(TEMPI.arrotola + t0, () => {
      ctx.audio.play('carta');
      if (fermo) {
        posa(0);
        raddrizza();
        return;
      }
      const inizio = performance.now();
      const passo = (t) => {
        const k = Math.min(1, (t - inizio) / TEMPI.durata);
        // Parte piano dall'angolo e accelera: la fine è rapida, senza indugiare sull'ultimo lembo.
        posa((W + H) * (1 - Math.pow(k, 1.7)));
        if (k < 1) raf = requestAnimationFrame(passo);
        else raddrizza();
      };
      raf = requestAnimationFrame(passo);
    });
    ctx.after(TEMPI.arrotola + 1400 + t0, () => ctx.audio.play('carta'));
    ctx.after(TEMPI.nastro + t0, stato('is-nastro'));
    ctx.after(TEMPI.fiocco + t0, stato('is-fiocco'));
    if (foto) ctx.after(TEMPI.foto + t0, stato('is-foto'));
    ctx.after(TEMPI.fine + t0, () => ctx.next());
    }

    return () => {
      cancelAnimationFrame(raf);
      festa.distruggi();
    };
  },
};
