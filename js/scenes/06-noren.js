import { segnaposto } from './_segnaposto.js';

export default segnaposto({
  titolo: 'Il noren e il reveal',
  capisce: 'tutto',
  passi: (c) => {
    const { regalo, luogo, omakase, sonkei, fraseFinale } = c.reveal;
    const voce = (v) => `${v.kanji}, ${v.lettura} = ${v.significato} ${v.nota}`;
    return [
      { tipo: 'swipe', testo: `Tendina rossa con ${sonkei.kanji}` },
      { tipo: 'auto', ms: 1500, suono: 'tendina', testo: '(un attimo di silenzio)' },
      { tipo: 'tap', testo: `${regalo} — ${luogo}` },
      { tipo: 'tap', testo: voce(omakase) },
      { tipo: 'tap', testo: voce(sonkei) },
      { tipo: 'tap', testo: fraseFinale },
    ];
  },
});
