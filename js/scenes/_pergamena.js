// La pergamena arrotolata con il fiocco rosso: nasce nella scena 2, fa da gettone
// nella 3 e cade nella 4. Se in content.js c'è la foto (pergamena.foto) si usa quella,
// la stessa pergamena che torna sul piatto nella scena 5; altrimenti è disegnata.

import { NASTRO } from './_nastro.js';

function crea(tag, classe) {
  const el = document.createElement(tag);
  el.className = classe;
  return el;
}

// La foto del rotolo, centrata sul suo asse; null se non c'è.
export function creaRotoloFoto(content) {
  const foto = content.pergamena?.foto;
  if (!foto) return null;
  const img = crea('img', 'rotolo-foto');
  img.alt = '';
  img.src = foto;
  return img;
}

// Il gettone: il rotolo con il fiocco, da spostare e rimpicciolire con una trasformazione.
export function creaGettone(content) {
  const gettone = crea('div', 'gettone');
  const corpo = crea('div', 'gettone__corpo');
  const foto = creaRotoloFoto(content);
  if (foto) corpo.append(foto);
  else {
    const nastro = crea('div', 'nastro');
    nastro.innerHTML = NASTRO;
    corpo.append(crea('div', 'rotolo'), nastro);
  }
  gettone.append(corpo);
  return gettone;
}
