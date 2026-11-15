// Schermo intero sul telefono: spariscono la barra dell'indirizzo e quella di stato.
//
// Chrome lo concede solo dentro un gesto, quindi parte al primo tocco vero (il sigillo).
// Quando scatta, lo schermo si allunga di colpo: schermoIntero() aspetta che il telefono
// abbia finito di ridimensionare la pagina, così il video della busta parte dopo e non salta.
// Se lei esce (gesto "indietro"), il tocco successivo lo riprende.
//
// Solo sui dispositivi touch: sul computer, durante le prove, la pagina resta com'è.
// Con ?schermo=0 è spento anche sul telefono.

const ATTESA_MASSIMA = 600; // ms: oltre, si va avanti comunque

let iniziato = false;

// Aperta come app installata (schermo intero dal manifest) non serve: è già senza barre.
const giaApp = () => matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;

const voluto = () =>
  !giaApp() &&
  !!document.documentElement.requestFullscreen &&
  matchMedia('(pointer: coarse)').matches &&
  new URLSearchParams(location.search).get('schermo') !== '0';

const attivo = () => !!document.fullscreenElement;

// Chiede lo schermo intero e, appena c'è, blocca il telefono in verticale
// (Chrome permette il blocco solo a schermo intero).
function chiedi() {
  try {
    return Promise.resolve(document.documentElement.requestFullscreen({ navigationUI: 'hide' })).then(() => {
      screen.orientation?.lock?.('portrait').catch(() => {});
    });
  } catch (errore) {
    return Promise.reject(errore);
  }
}

// Da chiamare dentro un tocco. Si risolve quando la pagina ha già le misure nuove
// (o subito, se lo schermo intero non serve, non è permesso o è già attivo).
export function schermoIntero() {
  iniziato = true;
  if (!voluto() || attivo()) return Promise.resolve();
  const ridimensionata = new Promise((pronto) => {
    window.addEventListener('resize', () => requestAnimationFrame(() => requestAnimationFrame(pronto)), { once: true });
  });
  const tempoScaduto = new Promise((pronto) => setTimeout(pronto, ATTESA_MASSIMA));
  return Promise.race([chiedi().then(() => ridimensionata), tempoScaduto]).catch(() => {});
}

// Dopo il primo ingresso, ogni tocco lo riprende se nel frattempo lei ne è uscita.
window.addEventListener(
  'click',
  () => {
    if (iniziato && voluto() && !attivo()) chiedi().catch(() => {});
  },
  { capture: true },
);
