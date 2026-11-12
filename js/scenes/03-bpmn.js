// Scena 3: un vero diagramma BPMN, con due corsie (Ginevra e Nicola).
// La pergamena della scena 2 rimpicciolisce e diventa il gettone che percorre
// il processo. Si avanza a tap: tre indizi, poi due bivi dove qualunque scelta
// porta allo stesso esito.
//
// Comincia identica a come finisce la scena 2 (festa e pergamena al centro),
// per questo entra con uno stacco netto; poi la tela bianca copre la festa.

import { creaFesta } from './_festa.js';
import { NASTRO } from './_nastro.js';

// Tutte le misure sono in cqw, nel sistema di coordinate del diagramma ("mondo").
const BARRA = 15; // altezza della barra in alto: il mondo comincia lì sotto
const SCALA_GETTONE = 0.22;
const VELOCITA = 62; // cqw al secondo lungo le frecce
const FERMATA = 4.5; // il gettone si ferma poco prima della punta della freccia

const NODI = {
  inizio: [27, 26],
  raccolta: [73, 48],
  bivio1: [27, 141],
  esito1: [73, 165],
  bivio2: [73, 191],
  esito2: [27, 213],
  fine: [50, 245],
};

// Frecce: tracciato, punta [direzione, x, y], nodo di arrivo.
const FLUSSI = {
  f1: { d: 'M27 30.2V48H54', punta: ['dx', 54, 48], verso: 'raccolta' },
  f2: { d: 'M82 55.5V127H27V135.5', punta: ['giu', 27, 135.5], verso: 'bivio1' },
  f1a: { d: 'M27 146.5V165H54', punta: ['dx', 54, 165], verso: 'esito1' },
  f1b: { d: 'M32.5 141H73V157.5', punta: ['giu', 73, 157.5], verso: 'esito1' },
  f3: { d: 'M73 172.5V185.5', punta: ['giu', 73, 185.5], verso: 'bivio2' },
  f2a: { d: 'M67.5 191H27V205.5', punta: ['giu', 27, 205.5], verso: 'esito2' },
  f2b: { d: 'M73 196.5V213H46', punta: ['sx', 46, 213], verso: 'esito2' },
  f4: { d: 'M27 220.5V229H50V236.5', punta: ['giu', 50, 236.5], verso: 'fine' },
};

// Dove guarda la "telecamera" a ogni tappa (altezza del mondo da tenere in vista).
const FUOCO = { insight: 84, bivio1: 143, esito1: 165, bivio2: 191, esito2: 213 };

const INSIGHT_Y = [58, 80, 102]; // bordo alto delle tre schede; sono alte 20
const n = (x) => +x.toFixed(2);
const morbido = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function punta([dir, x, y]) {
  if (dir === 'giu') return `M${x} ${y}l-1.15-2.1h2.3z`;
  if (dir === 'dx') return `M${x} ${y}l-2.1-1.15v2.3z`;
  return `M${x} ${y}l2.1-1.15v2.3z`;
}

function crea(tag, classe, testo) {
  const el = document.createElement(tag);
  el.className = classe;
  if (testo !== undefined) el.textContent = testo;
  return el;
}

// Un elemento del diagramma, centrato nel punto (x, y).
function nodo(classe, [x, y], testo) {
  const el = crea('div', `bpmn-nodo ${classe}`, testo);
  el.style.left = `${x}cqw`;
  el.style.top = `${y}cqw`;
  return el;
}

function etichetta(testo, stile) {
  const el = crea('p', 'bpmn-etichetta', testo);
  el.style.cssText = stile;
  return el;
}

export default {
  taglio: true,

  mount(el, ctx) {
    const c = ctx.content.processo;
    el.classList.add('biglietto', 'processo');
    const festa = creaFesta(el);

    // Altezza del palco in cqw: serve per partire dal centro e per la telecamera.
    const altezza = (el.clientHeight / el.clientWidth) * 100;

    // --- La tela con il diagramma ---
    const tela = crea('div', 'processo__tela');
    const mondo = crea('div', 'processo__mondo');
    tela.append(mondo);

    const barra = crea('div', 'processo__barra');
    barra.append(crea('span', 'processo__scheda', c.file));

    mondo.append(
      crea('div', 'bpmn-vasca', ctx.content.tesi.titolo),
      crea('div', 'bpmn-corsia bpmn-corsia--sx', c.corsie[0]),
      crea('div', 'bpmn-corsia bpmn-corsia--dx', c.corsie[1]),
      crea('div', 'bpmn-divisore'),
    );

    const flussi = {};
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'processo__flussi');
    svg.setAttribute('viewBox', '0 0 100 320');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      `<path class="bpmn-associazione" d="M64 55.5V112${INSIGHT_Y.map((y) => `M48 ${y + 10}H64`).join('')}"/>` +
      Object.entries(FLUSSI)
        .map(([id, f]) => `<g class="bpmn-flusso" data-id="${id}"><path class="bpmn-flusso__linea" d="${f.d}"/><path class="bpmn-flusso__punta" d="${punta(f.punta)}"/></g>`)
        .join('');
    for (const g of svg.querySelectorAll('.bpmn-flusso')) flussi[g.dataset.id] = g;
    mondo.append(svg);

    const nodi = {
      inizio: nodo('bpmn-evento', NODI.inizio),
      raccolta: nodo('bpmn-attivita', NODI.raccolta, c.raccolta),
      bivio1: nodo('bpmn-bivio', NODI.bivio1),
      esito1: nodo('bpmn-attivita', NODI.esito1, c.bivio1.esito),
      bivio2: nodo('bpmn-bivio', NODI.bivio2),
      esito2: nodo('bpmn-attivita', NODI.esito2, c.bivio2.esito),
      fine: nodo('bpmn-attivita bpmn-attivita--fine', NODI.fine, c.fine),
    };

    const insight = c.insight.map((testo, i) => {
      const scheda = crea('div', 'bpmn-insight');
      scheda.style.top = `${INSIGHT_Y[i]}cqw`;
      scheda.append(crea('b', '', `Insight ${i + 1}`), crea('span', '', testo));
      return scheda;
    });

    const nota = crea('p', 'bpmn-nota', c.bivio1.nota);
    const domanda1 = etichetta(c.bivio1.domanda, 'left:35cqw;top:131.5cqw;translate:0 -50%');
    const domanda2 = etichetta(c.bivio2.domanda, 'right:31cqw;top:179.5cqw;translate:0 -50%');

    // I due bivi: [flusso, x, y] per ogni scelta, nell'ordine dei testi.
    const bivi = [
      { dati: c.bivio1, fuoco: FUOCO.esito1, esito: nodi.esito1, scelte: [['f1a', 27, 154], ['f1b', 52, 141]] },
      { dati: c.bivio2, fuoco: FUOCO.esito2, esito: nodi.esito2, scelte: [['f2a', 48, 191], ['f2b', 73, 205]] },
    ];
    for (const bivio of bivi) {
      bivio.pulsanti = bivio.scelte.map(([flusso, x, y], i) => {
        const pulsante = crea('button', 'bpmn-scelta', bivio.dati.scelte[i]);
        pulsante.type = 'button';
        pulsante.style.left = `${x}cqw`;
        pulsante.style.top = `${y}cqw`;
        pulsante.dataset.flusso = flusso;
        return pulsante;
      });
    }

    mondo.append(
      ...Object.values(nodi),
      etichetta(c.inizio, 'left:27cqw;top:33.5cqw;translate:-50% -50%'),
      domanda1,
      domanda2,
      ...insight,
      nota,
      ...bivi.flatMap((b) => b.pulsanti),
    );

    // --- Il gettone: la pergamena con il fiocco, in un mondo suo che segue la telecamera ---
    const mondoGettone = crea('div', 'processo__mondo processo__mondo--gettone');
    const gettone = crea('div', 'gettone');
    const corpo = crea('div', 'gettone__corpo');
    const nastro = crea('div', 'nastro');
    nastro.innerHTML = NASTRO;
    corpo.append(crea('div', 'rotolo'), nastro);
    gettone.append(corpo);
    mondoGettone.append(gettone);

    el.append(tela, barra, mondoGettone);

    // Il diagramma si disegna man mano: quello che viene dopo resta nascosto,
    // così l'esito dei bivi non si legge in anticipo.
    const mostra = (...pezzi) => pezzi.forEach((pezzo) => pezzo.classList.remove('is-nascosto'));
    for (const pezzo of [
      ...['f2', 'f1a', 'f1b', 'f3', 'f2a', 'f2b', 'f4'].map((id) => flussi[id]),
      ...['bivio1', 'esito1', 'bivio2', 'esito2', 'fine'].map((id) => nodi[id]),
      domanda1,
      domanda2,
    ]) {
      pezzo.classList.add('is-nascosto');
    }

    // --- Movimento ---
    let posizione = { x: 50, y: altezza / 2 - BARRA };
    const metti = (x, y, scala) => {
      posizione = { x, y };
      gettone.style.transform = `translate(${n(x)}cqw, ${n(y)}cqw) scale(${scala})`;
    };
    metti(posizione.x, posizione.y, 1);

    function telecamera(y, alCentro = false) {
      const visibile = altezza - BARRA;
      const giu = alCentro ? y + BARRA - altezza / 2 : Math.max(0, y - visibile * 0.45);
      const sposta = `translateY(${n(-giu)}cqw)`;
      mondo.style.transform = sposta;
      mondoGettone.style.transform = sposta;
    }

    let occupato = true; // finché è vero i tap sono ignorati
    let raf = 0;
    const fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Porta il gettone lungo una freccia, fino a poco prima della punta.
    function viaggia(id, poi) {
      occupato = true;
      const flusso = flussi[id];
      const linea = flusso.querySelector('.bpmn-flusso__linea');
      flusso.classList.remove('is-prossimo');
      for (const nodoQui of Object.values(nodi)) nodoQui.classList.remove('is-qui');

      const lungo = Math.max(0, linea.getTotalLength() - FERMATA);
      const da = { ...posizione };
      const inizio = linea.getPointAtLength(0);
      const salto = Math.hypot(inizio.x - da.x, inizio.y - da.y);
      const quota = salto / (salto + lungo);
      const durata = fermo ? 1 : ((salto + lungo) / VELOCITA) * 1000;
      const partenza = performance.now();

      const passo = (t) => {
        const k = morbido(Math.min(1, (t - partenza) / durata));
        if (k < quota) {
          const q = k / quota;
          metti(da.x + (inizio.x - da.x) * q, da.y + (inizio.y - da.y) * q, SCALA_GETTONE);
        } else {
          const p = linea.getPointAtLength(((k - quota) / (1 - quota)) * lungo);
          metti(p.x, p.y, SCALA_GETTONE);
        }
        if (k < 1) {
          raf = requestAnimationFrame(passo);
          return;
        }
        flusso.classList.add('is-fatto');
        nodi[FLUSSI[id].verso].classList.add('is-qui');
        occupato = false;
        poi?.();
      };
      raf = requestAnimationFrame(passo);
    }

    const invita = (id) => flussi[id].classList.add('is-prossimo');

    function rivela(i) {
      ctx.audio.play('ding');
      insight[i].classList.remove('is-prossimo');
      insight[i].classList.add('is-rivelato');
      if (insight[i + 1]) insight[i + 1].classList.add('is-prossimo');
      else {
        mostra(flussi.f2, nodi.bivio1, domanda1);
        invita('f2');
      }
    }

    let bivioAperto = null;
    function apriBivio(bivio) {
      bivioAperto = bivio;
      for (const pulsante of bivio.pulsanti) {
        mostra(flussi[pulsante.dataset.flusso]);
        pulsante.classList.add('is-visibile');
      }
    }

    function scegli(bivio, pulsante, poi) {
      bivioAperto = null;
      ctx.audio.play('click');
      for (const altro of bivio.pulsanti) {
        altro.disabled = true;
        altro.classList.add(altro === pulsante ? 'is-scelta' : 'is-scartata');
      }
      mostra(bivio.esito);
      telecamera(bivio.fuoco);
      viaggia(pulsante.dataset.flusso, poi);
    }

    bivi[0].pulsanti.forEach((pulsante) =>
      ctx.onTap(pulsante, () => {
        if (bivioAperto !== bivi[0] || occupato) return;
        scegli(bivi[0], pulsante, () => {
          nota.classList.add('is-visibile');
          mostra(flussi.f3, nodi.bivio2, domanda2);
          invita('f3');
        });
      }),
    );
    bivi[1].pulsanti.forEach((pulsante) =>
      ctx.onTap(pulsante, () => {
        if (bivioAperto !== bivi[1] || occupato) return;
        scegli(bivi[1], pulsante, () => {
          mostra(flussi.f4, nodi.fine);
          invita('f4');
        });
      }),
    );

    // I tap "avanti", uno dopo l'altro.
    const tappe = [
      () => {
        telecamera(FUOCO.insight);
        viaggia('f1', () => rivela(0));
      },
      () => rivela(1),
      () => rivela(2),
      () => {
        telecamera(FUOCO.bivio1);
        viaggia('f2', () => apriBivio(bivi[0]));
      },
      () => {
        telecamera(FUOCO.bivio2);
        viaggia('f3', () => apriBivio(bivi[1]));
      },
      () => {
        telecamera(NODI.fine[1], true);
        viaggia('f4', () => {
          occupato = true;
          ctx.after(700, () => ctx.next());
        });
      },
    ];
    let tappa = 0;
    ctx.onTap(el, () => {
      if (occupato || bivioAperto || tappa >= tappe.length) return;
      ctx.audio.play('click');
      tappe[tappa++]();
    });

    // --- Ingresso: la tela copre la festa mentre la pergamena diventa il gettone ---
    telecamera(0);
    ctx.after(250, () => {
      el.classList.add('is-tela');
      metti(NODI.inizio[0], NODI.inizio[1], SCALA_GETTONE);
    });
    ctx.after(1500, () => {
      festa.rimuovi();
      el.classList.add('is-pronta');
      invita('f1');
      occupato = false;
    });

    return () => {
      cancelAnimationFrame(raf);
      festa.distruggi();
    };
  },
};
