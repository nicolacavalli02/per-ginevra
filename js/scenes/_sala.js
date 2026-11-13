// La sala: sera, notte, bancone e la lanterna di carta appesa al suo filo.
// La scena 4 la costruisce e la anima; la scena 5 la ricrea già nello stato finale,
// così il passaggio tra le due non si vede.

import { KAIZEN, LATO } from './_kanji.js';
import { creaPennello } from './_pennello.js';

export function crea(tag, classe, testo) {
  const el = document.createElement(tag);
  el.className = classe;
  if (testo !== undefined) el.textContent = testo;
  return el;
}

// Aggiunge la sala a "el" e restituisce i pezzi che servono alle scene.
export function creaSala(el, content) {
  const lanterna = crea('div', 'kaizen__lanterna');
  const inchiostro = crea('canvas', 'kaizen__inchiostro');
  inchiostro.setAttribute('role', 'img');
  inchiostro.setAttribute('aria-label', `${content.kaizen.kanji} (${content.kaizen.lettura})`);
  // Da accesa la lanterna è una foto (se c'è): la carta disegnata serve fino a lì.
  let foto = null;
  if (content.kaizen.lanterna) {
    el.classList.add('ha-lanterna');
    foto = crea('img', 'kaizen__foto');
    foto.alt = '';
    foto.src = content.kaizen.lanterna;
  }
  lanterna.append(
    crea('div', 'kaizen__luce'),
    crea('div', 'kaizen__coste'),
    ...(foto ? [foto] : []),
    crea('span', 'kaizen__titolo', content.processo.fine),
    inchiostro,
    crea('div', 'kaizen__tappo kaizen__tappo--su'),
    crea('div', 'kaizen__tappo kaizen__tappo--giu'),
  );
  const pendolo = crea('div', 'kaizen__pendolo');
  pendolo.append(crea('div', 'kaizen__filo'), crea('div', 'kaizen__alone'), lanterna);

  const bancone = crea('div', 'kaizen__bancone');
  el.append(
    crea('div', 'kaizen__sera'),
    crea('div', 'kaizen__notte'),
    bancone,
    pendolo,
    crea('p', 'kaizen__lettura', content.kaizen.lettura),
  );

  return { pendolo, bancone, pennello: creaPennello(inchiostro, KAIZEN, { lato: LATO }) };
}
