import { segnaposto } from './_segnaposto.js';

export default segnaposto({
  titolo: 'Alza gli occhi',
  capisce: '—',
  passi: (c) => [{ tipo: 'fermo', testo: c.finale }],
});
