// Il cartoncino di auguri. Lo usa la scena 1 e lo riprenderà la pergamena della scena 2.

import { cornice } from './_cornice.js';

const FREGIO = `
  <svg viewBox="0 0 80 8" aria-hidden="true">
    <path d="M0 4H31M49 4H80" fill="none" stroke="currentColor" stroke-width=".8"/>
    <path d="M40 .8L44.6 4L40 7.2L35.4 4Z" fill="currentColor"/>
  </svg>`;

function crea(tag, classe, testo) {
  const el = document.createElement(tag);
  el.className = classe;
  if (testo !== undefined) el.textContent = testo;
  return el;
}

export function creaCartoncino(biglietto) {
  const cartoncino = crea('article', 'cartoncino');

  // La cornice è "stampata": si vede subito. Il resto compare come se venisse scritto.
  const telaio = crea('div', 'cartoncino__cornice');
  telaio.innerHTML = cornice();

  const fregio = crea('span', 'cartoncino__fregio rivela');
  fregio.innerHTML = FREGIO;

  const testo = crea('div', 'cartoncino__testo rivela');
  for (const riga of biglietto.messaggio) testo.append(crea('p', '', riga));

  // [elemento, ordine di comparsa]: la data arriva prima del P.S., che chiude.
  const parti = [
    [crea('h1', 'cartoncino__titolo rivela', biglietto.titolo), 0],
    [crea('p', 'cartoncino__nome rivela', biglietto.destinataria), 1],
    [fregio, 1],
    [testo, 2],
    [crea('p', 'cartoncino__firma rivela', biglietto.firma), 3],
    [crea('p', 'cartoncino__ps rivela', biglietto.ps), 5],
    [crea('p', 'cartoncino__data rivela', biglietto.data), 4],
  ];
  for (const [parte, ordine] of parti) parte.style.setProperty('--i', ordine);

  cartoncino.append(telaio, ...parti.map(([parte]) => parte), crea('span', 'cartoncino__angolo'));
  return cartoncino;
}
