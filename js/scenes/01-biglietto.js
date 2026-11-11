// Scena 1: festa serale. Una busta chiusa da un sigillo di ceralacca scende
// dall'alto, e al suo arrivo si accendono due fontane luminose.
// Primo tap: il sigillo si spezza, il lembo si apre, il cartoncino esce e si scrive.
// Secondo tap: si passa alla scena 2.

import { creaCartoncino } from './_cartoncino.js';
import { creaFesta } from './_festa.js';

// Arrivo della busta, in ms dall'inizio della scena.
const ARRIVO = {
  candele: 900, // le candele salgono mentre la busta atterra
  fontane: 1300, // si accendono
  tap: 1400, // da qui la busta si può aprire
  calma: 4000, // se lei aspetta, le fontane si abbassano
};

// Momenti della sequenza automatica, in ms dal primo tap (in tutto 6,3 s).
const TEMPI = {
  fontaneSpente: 1100, // le fontane si spengono
  lembo: 300, // il lembo comincia ad alzarsi
  dietro: 650, // a metà apertura il lembo passa dietro al cartoncino
  esce: 1350, // un attimo per vedere la fodera, poi il cartoncino sale dalla busta
  sola: 2200, // la busta cade, poi il cartoncino va al centro
  scritta: 3300, // il testo compare, un elemento alla volta
  pronta: 6300, // si può toccare per andare avanti
};

const BUSTA = `
  <div class="busta__retro"></div>
  <div class="busta__lembo">
    <div class="busta__faccia busta__faccia--fuori">
      <svg viewBox="0 0 70 46" preserveAspectRatio="none">
        <defs>
          <linearGradient id="busta-lembo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#f8f3e8"/><stop offset="1" stop-color="#ebe3d1"/>
          </linearGradient>
        </defs>
        <polygon points="0,0 70,0 35,46" fill="url(#busta-lembo)"/>
        <polyline points="0,0 35,46 70,0" fill="none" stroke="rgba(0,0,0,.07)" stroke-width="6" vector-effect="non-scaling-stroke"/>
        <polyline points="0,0 35,46 70,0" fill="none" stroke="rgba(70,52,25,.3)" stroke-width="1" vector-effect="non-scaling-stroke"/>
      </svg>
    </div>
    <div class="busta__faccia busta__faccia--dentro">
      <svg viewBox="0 0 70 46" preserveAspectRatio="none">
        <polygon points="0,46 70,46 35,0" fill="#ece4d3"/>
        <polygon points="5,44 65,44 35,4.5" fill="#7d1a1a"/>
      </svg>
    </div>
  </div>
  <div class="busta__tasca">
    <svg viewBox="0 0 70 92" preserveAspectRatio="none">
      <defs>
        <linearGradient id="busta-sx" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ece4d2"/><stop offset="1" stop-color="#dcd1ba"/>
        </linearGradient>
        <linearGradient id="busta-dx" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stop-color="#e9e0cd"/><stop offset="1" stop-color="#d9ceb6"/>
        </linearGradient>
        <linearGradient id="busta-giu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f5efe2"/><stop offset="1" stop-color="#eae1cf"/>
        </linearGradient>
      </defs>
      <path d="M0 0L35 46L0 92Z" fill="url(#busta-sx)"/>
      <path d="M70 0L35 46L70 92Z" fill="url(#busta-dx)"/>
      <path d="M0 92L35 42L70 92" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="7" vector-effect="non-scaling-stroke"/>
      <path d="M0 92L35 42L70 92Z" fill="url(#busta-giu)" stroke="rgba(70,52,25,.24)" stroke-width="1" vector-effect="non-scaling-stroke"/>
    </svg>
    <span class="busta__scritta"></span>
  </div>
  <div class="sigillo">
    <div class="sigillo__meta sigillo__meta--sx"><span></span></div>
    <div class="sigillo__meta sigillo__meta--dx"><span></span></div>
  </div>`;

export default {
  mount(el, ctx) {
    const biglietto = ctx.content.biglietto;

    el.classList.add('biglietto');
    const busta = document.createElement('div');
    busta.className = 'busta';
    busta.innerHTML = BUSTA;
    for (const lettera of busta.querySelectorAll('.sigillo span')) {
      lettera.textContent = biglietto.sigillo;
    }
    busta.querySelector('.busta__scritta').textContent = biglietto.busta;
    busta.append(creaCartoncino(biglietto));

    const festa = creaFesta(el);
    el.append(busta);

    const stato = (classe) => () => el.classList.add(classe);
    let aperta = false;

    function apri() {
      aperta = true;
      ctx.audio.play('sigillo');
      el.classList.add('is-rotto');
      // Il sigillo che si spezza fa scoppiare i coriandoli e ravviva le fontane,
      // che poi si spengono per lasciare leggere il cartoncino.
      const altezzaSigillo = 0.5 + (0.06 * el.clientWidth) / el.clientHeight;
      festa.frammenti(0.5, altezzaSigillo);
      festa.coriandoli(0.5, altezzaSigillo);
      festa.fontane(1);
      ctx.after(TEMPI.fontaneSpente, () => festa.fontane(0));
      ctx.after(TEMPI.lembo, stato('is-aperta'));
      ctx.after(TEMPI.dietro, stato('is-dietro'));
      ctx.after(TEMPI.esce, () => {
        el.classList.add('is-fuori');
        ctx.audio.play('carta');
      });
      ctx.after(TEMPI.sola, stato('is-sola'));
      ctx.after(TEMPI.scritta, stato('is-scritta'));
      ctx.after(TEMPI.pronta, () => {
        el.classList.add('is-pronta');
        ctx.onTap(el, () => ctx.next());
      });
    }

    // La busta scende dall'alto; quando atterra salgono le candele e partono le fontane.
    ctx.after(ARRIVO.candele, stato('is-arrivata'));
    ctx.after(ARRIVO.fontane, () => festa.fontane(1));
    ctx.after(ARRIVO.calma, () => {
      if (!aperta) festa.fontane(0.5);
    });
    ctx.after(ARRIVO.tap, () => {
      const togliTap = ctx.onTap(el, () => {
        togliTap();
        apri();
      });
    });

    return () => festa.distruggi();
  },
};
