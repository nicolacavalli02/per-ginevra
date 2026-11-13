// UNICO file di contenuti: testi, foto e didascalie.
// Per cambiare una parola o una foto si modifica solo qui, non il codice.
// Le voci tra [parentesi quadre] sono segnaposto ancora da scrivere.

export default {
  titoloPagina: 'Per Ginevra',

  // Scena 1: la busta e il cartoncino.
  biglietto: {
    busta: 'Per Ginevra', // scritto a mano sulla busta
    sigillo: 'G',
    titolo: 'Congratulazioni',
    destinataria: 'Dott.ssa Ginevra',
    messaggio: [
      'Ce l’hai fatta, amore!',
      'È stato un percorso lungo e a tratti complicato, ma ho sempre creduto in te.',
      'Ora bisogna festeggiare.',
    ],
    firma: 'Nicola',
    ps: 'P.S. Non finisce qui.',
    data: '20 novembre 2026',
  },

  tesi: {
    titolo: 'From Customer Insights to Continuous Improvement',
  },

  // Scena 3: il diagramma di processo.
  processo: {
    file: 'regalo-di-laurea.bpmn',
    corsie: ['Ginevra', 'Nicola'],
    inizio: 'Laurea conseguita',
    raccolta: 'Raccogliere Customer Insights',
    // Gli indizi: graduali, senza dire di cosa si tratta.
    insight: [
      'Anni di esami, appunti e scadenze. Ha deciso, organizzato e chiuso tutto lei.',
      'Ha due grandi passioni. Nicola le conosce bene tutte e due.',
      'Non si indossa, non si legge, non si appende.',
    ],
    // Ai bivi qualunque scelta porta allo stesso esito.
    bivio1: {
      domanda: 'Ha già capito cos’è?',
      scelte: ['Sì', 'Certo'],
      esito: 'No, non ha capito',
      nota: 'Tutte le strade portano qui.',
    },
    bivio2: {
      domanda: 'Vuole un altro indizio?',
      scelte: ['Sì', 'Anche due'],
      esito: 'Indizi esauriti',
    },
    fine: 'Continuous Improvement',
  },

  // Scena 4: i due caratteri li scrive il pennello; qui c'è come si leggono.
  kaizen: {
    kanji: '改善',
    lettura: 'kaizen',
  },

  // Scena 5: la foto del bancone vuoto che fa da fondo (verticale 9:16).
  // Percorso in assets/img/, oppure null: in quel caso il bancone è disegnato.
  bancone: {
    fondo: 'assets/img/bancone.webp',
    // I pezzi serviti, uno per ricordo, ritagliati dalla stessa foto del bancone.
    // riquadro: dove sta il ritaglio nella foto, in percentuale [x, y, larghezza, altezza].
    // Dove c'è null il pezzo è ancora quello disegnato.
    pezzi: [
      { immagine: 'assets/img/pezzo-salmone.webp', riquadro: [35.83, 58.29, 30.19, 9.1] },
      { immagine: 'assets/img/pezzo-tonno.webp', riquadro: [35.46, 57.98, 30, 9.61] },
      { immagine: 'assets/img/pezzo-gambero.webp', riquadro: [33.33, 58.04, 42.04, 10.44] },
      { immagine: 'assets/img/pezzo-gunkan.webp', riquadro: [36.67, 54.57, 25.46, 12.92] },
    ],
    // L'ultimo pezzo, in tre momenti: la pergamena, il rotolo di alga, le fette.
    // Oppure maki: null per usare quello disegnato.
    maki: {
      pergamena: { immagine: 'assets/img/maki-pergamena.webp', riquadro: [28.7, 55.25, 54.72, 13.23] },
      rotolo: { immagine: 'assets/img/maki-rotolo.webp', riquadro: [28.43, 54.11, 54.81, 14.42] },
      fette: { immagine: 'assets/img/maki-fette.webp', riquadro: [20.19, 56.07, 60.46, 10.65] },
    },
  },

  // Un ricordo per ogni pezzo servito. foto: percorso in assets/img/, oppure null.
  ricordi: [
    // Le quattro didascalie si leggono di seguito, come un'unica frase.
    { foto: 'assets/img/ricordo-1.webp', didascalia: 'Ci piace girare per città' },
    { foto: 'assets/img/ricordo-2.webp', didascalia: 'Ci piace mangiare. Tanto' },
    { foto: 'assets/img/ricordo-3.webp', didascalia: 'Camminare, un po’ meno' },
    { foto: 'assets/img/ricordo-4.webp', didascalia: 'Ma soprattutto, stare insieme' },
  ],

  // Scena 6: dietro la tendina, quattro bigliettini uno dopo l'altro.
  reveal: {
    fondo: 'assets/img/tavola.webp', // il bancone apparecchiato per due

    // Primo bigliettino: il regalo.
    annuncio: 'Il tuo regalo',
    regalo: 'Cena omakase per due',
    locale: 'Sonkei Omakase',
    citta: 'Roncadelle',

    // Secondo e terzo: le due parole. I caratteri li scrive il pennello.
    omakase: {
      kanji: 'お任せ',
      lettura: 'omakase',
      significato: '«mi affido a te»',
      nota: 'Per una sera non scegli niente.',
    },
    sonkei: {
      kanji: '尊敬',
      lettura: 'sonkei',
      significato: 'stima, rispetto',
      nota: 'Quello che provo per quello che hai fatto.',
    },

    // Quarto: le parole di Nicola.
    frase: ['Sai che non sono bravo coi bigliettini fisici.', 'Ho provato con questo.'],
    chiusa: 'Ti amo.',
    firma: 'Nicola',
  },

  // Scena 7
  // Due righe: la prima piccola, la seconda grande. Poi lo schermo resta fermo.
  finale: {
    prima: 'Il resto te lo dico a voce.',
    poi: 'Alza gli occhi.',
  },
};
