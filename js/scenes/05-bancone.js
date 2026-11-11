import { segnaposto } from './_segnaposto.js';

export default segnaposto({
  titolo: 'Il bancone',
  capisce: 'sushi',
  passi: (c) => [
    ...c.ricordi.map((ricordo, i) => ({
      tipo: 'tap',
      suono: 'coltello',
      testo: `Pezzo ${i + 1} → ricordo: ${ricordo.didascalia}`,
    })),
    { tipo: 'tap', suono: 'coltello', testo: 'Ultimo pezzo: la pergamena, il nastro diventa alga, è un maki' },
  ],
});
