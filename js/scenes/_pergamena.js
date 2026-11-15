// La pergamena arrotolata con il fiocco rosso: nasce nella scena 2, fa da gettone
// nella 3 e cade nella 4. È lo stesso biglietto arrotolato della scena 2, disegnato
// dall'immagine del biglietto (pergamena.immagine in content.js).

import { NASTRO } from './_nastro.js';
import { creaTelaRotolo } from './_rotolo.js';

function crea(tag, classe) {
  const el = document.createElement(tag);
  el.className = classe;
  return el;
}

// Il gettone: il rotolo finito con il fiocco annodato, centrato sul suo asse, da
// spostare e rimpicciolire con una trasformazione.
export function creaGettone(content) {
  const gettone = crea('div', 'gettone');
  const corpo = crea('div', 'gettone__corpo');
  const tela = creaTelaRotolo(content.pergamena.immagine);
  tela.canvas.classList.add('rotolo-tela--gettone');
  const nastro = crea('div', 'nastro');
  nastro.innerHTML = NASTRO;
  corpo.append(tela.canvas, nastro);
  gettone.append(corpo);
  // Il canvas ha la sua misura solo quando è nella pagina.
  requestAnimationFrame(() => tela.disegna(1));
  return gettone;
}
