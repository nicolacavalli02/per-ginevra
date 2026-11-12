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
    fondo: null,
  },

  // Un ricordo per ogni pezzo servito. foto: percorso in assets/img/, oppure null.
  ricordi: [
    { foto: null, didascalia: '[didascalia del ricordo 1]' },
    { foto: null, didascalia: '[didascalia del ricordo 2]' },
    { foto: null, didascalia: '[didascalia del ricordo 3]' },
    { foto: null, didascalia: '[didascalia del ricordo 4]' },
  ],

  // Scena 6
  reveal: {
    regalo: 'Cena omakase per due',
    luogo: 'Sonkei Omakase, Roncadelle',
    omakase: {
      kanji: 'お任せ',
      lettura: 'omakase',
      significato: '«mi affido a te»',
      nota: '[per una sera non scegli niente]',
    },
    sonkei: {
      kanji: '尊敬',
      lettura: 'sonkei',
      significato: 'stima, rispetto',
      nota: '[quello che provo per quello che hai fatto]',
    },
    fraseFinale: '[frase finale di Nicola]',
  },

  // Scena 7
  finale: 'Il resto te lo dico a voce. Alza gli occhi.',
};
