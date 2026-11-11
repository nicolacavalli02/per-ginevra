// UNICO file di contenuti: testi, foto e didascalie.
// Per cambiare una parola o una foto si modifica solo qui, non il codice.
// Le voci tra [parentesi quadre] sono segnaposto ancora da scrivere.

export default {
  titoloPagina: 'Per Ginevra',

  biglietto: {
    destinataria: 'Dott.ssa Ginevra',
  },

  tesi: {
    titolo: 'From Customer Insights to Continuous Improvement',
  },

  // Scena 5: un ricordo per ogni pezzo servito. foto: percorso in assets/img/, oppure null.
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
