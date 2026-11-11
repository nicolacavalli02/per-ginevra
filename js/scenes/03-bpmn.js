import { segnaposto } from './_segnaposto.js';

export default segnaposto({
  titolo: 'Processo BPMN',
  capisce: 'c\'è un regalo, e decide lui',
  passi: (c) => [
    { tipo: 'tap', testo: c.tesi.titolo },
    { tipo: 'tap', suono: 'ding', testo: 'Insight 1' },
    { tipo: 'tap', suono: 'ding', testo: 'Insight 2' },
    { tipo: 'tap', suono: 'ding', testo: 'Insight 3' },
    { tipo: 'tap', testo: 'Gateway: qualunque scelta porta allo stesso risultato' },
  ],
});
