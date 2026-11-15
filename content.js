// UNICO file di contenuti: testi, foto e didascalie.
// Per cambiare una parola o una foto si modifica solo qui, non il codice.
// Le voci tra [parentesi quadre] sono segnaposto ancora da scrivere.

export default {
  titoloPagina: 'Per Ginevra',

  // Scena 1: la busta e il cartoncino.
  biglietto: {
    fondo: 'assets/img/festa.webp', // la festa serale dietro la busta; null per quella disegnata
    fontana: 'assets/video/fontana.mp4', // le due fontane luminose; null per quelle disegnate
    video: 'assets/video/busta.mp4', // la busta che si apre; null per l'animazione disegnata
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

  // La pergamena delle scene 2, 3 e 4 è il biglietto stesso arrotolato: si disegna da
  // questa immagine del cartoncino. Se cambi i testi del biglietto, va rifatta.
  pergamena: {
    immagine: 'assets/img/biglietto.webp',
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
      'Non si indossa, non si legge, non si appende.',
      'Ha due grandi passioni. Nicola le conosce bene tutte e due.',
      'Vuole fare qualcosa nei giorni dopo Capodanno.',
    ],
    // Ai bivi qualunque scelta porta allo stesso esito.
    bivio1: {
      domanda: 'Ha già capito cos’è?',
      scelte: ['Sì', 'Ha un sospetto'],
      esito: 'No, non ha capito',
      nota: 'Tutte le strade portano qui.',
    },
    bivio2: {
      domanda: 'Vuole un altro indizio?',
      scelte: ['Sì', 'Vuole subito il regalo'],
      esito: 'Indizi esauriti',
    },
    fine: 'Continuous Improvement',
  },

  // Scena 4: i due caratteri li scrive il pennello; qui c'è come si leggono.
  kaizen: {
    kanji: '改善',
    lettura: 'kaizen',
    lanterna: 'assets/img/lanterna.webp', // la lanterna accesa; null per quella disegnata
  },

  // Scena 5: la foto del bancone vuoto che fa da fondo (verticale 9:16).
  // Percorso in assets/img/, oppure null: in quel caso il bancone è disegnato.
  bancone: {
    fondo: 'assets/img/bancone.webp',
    // I pezzi serviti, uno per ricordo, ritagliati dalla stessa foto del bancone.
    // riquadro: dove sta il ritaglio nella foto, in percentuale [x, y, larghezza, altezza].
    // Dove c'è null il pezzo è ancora quello disegnato.
    // Lo chef che serve ogni pezzo, nello stesso ordine; null per farlo arrivare senza video.
    video: [
      'assets/video/chef-salmone.mp4',
      'assets/video/chef-tonno.mp4',
      'assets/video/chef-gambero.mp4',
      'assets/video/chef-gunkan.mp4',
    ],
    pezzi: [
      { immagine: 'assets/img/pezzo-salmone.webp', riquadro: [35.83, 58.29, 30.19, 9.1] },
      { immagine: 'assets/img/pezzo-tonno.webp', riquadro: [35.46, 57.98, 30, 9.61] },
      { immagine: 'assets/img/pezzo-gambero.webp', riquadro: [33.33, 58.04, 42.04, 10.44] },
      { immagine: 'assets/img/pezzo-gunkan.webp', riquadro: [36.67, 54.57, 25.46, 12.92] },
    ],
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
    tessuto: 'assets/img/tessuto.webp', // la stoffa della tendina; null per quella disegnata
    tendaVideo: 'assets/video/tenda.mp4', // la tendina che si apre, girata con Flow; null per quella disegnata

    // Il regalo: prima una busta chiusa nel buio, sotto un fascio di luce; rotto il
    // sigillo esce il bigliettino.
    preludio: 'E adesso…', // compare nel buio, prima che scenda la busta
    busta: 'Il tuo regalo', // scritto sulla busta
    regalo: 'Cena omakase per due',
    locale: 'Sonkei Omakase',
    citta: 'Roncadelle',
    data: '2 gennaio 2027',

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

  // I suoni: un file per nome, in assets/audio/. Con null suona il segnaposto
  // sintetizzato in js/audio.js (per gli effetti) o niente (per ambienti e musica).
  suoni: {
    // Effetti
    sigillo: 'assets/audio/sigillo.m4a', // ceralacca che si spezza (scene 1 e 6)
    scintille: 'assets/audio/scintille.m4a', // sfrigolio delle fontane, scintille del sigillo
    carta: 'assets/audio/carta.m4a', // carta che scivola, polaroid, bigliettini
    ding: 'assets/audio/ding.m4a', // ogni indizio del diagramma
    click: 'assets/audio/click.m4a', // tap e scelte ai bivi
    errore: 'assets/audio/errore.m4a', // "No, non ha capito", "Indizi esauriti"
    chime: 'assets/audio/chime.m4a', // "Continuous Improvement"
    pennello: 'assets/audio/pennello.m4a', // il pennello che scrive i caratteri
    campanella: 'assets/audio/campanella.m4a', // la lanterna che si accende
    tendina: 'assets/audio/tendina.m4a', // la stoffa della tendina
    faro: 'assets/audio/faro.m4a', // l'interruttore del fascio di luce
    soffio: 'assets/audio/soffio.m4a', // la busta che scende
    // Ambienti, in loop
    tesi: 'assets/audio/tesi.ogg', // scena 3: pizzicato in punta di piedi, sotto il diagramma
    festa: 'assets/audio/festa.m4a', // scene 1-2: brusio lontano e calici
    giappone: 'assets/audio/giappone.ogg', // scene 4-6: koto, dalla lanterna alla tendina
    // Musica, dal regalo alla fine
    finale: 'assets/audio/finale.ogg', // archi
  },
};
