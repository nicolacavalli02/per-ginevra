import { segnaposto } from './_segnaposto.js';

export default segnaposto({
  titolo: 'Biglietto di congratulazioni',
  capisce: 'niente, è un biglietto',
  passi: (c) => [
    { tipo: 'tap', testo: `Biglietto di laurea per la ${c.biglietto.destinataria}` },
  ],
});
