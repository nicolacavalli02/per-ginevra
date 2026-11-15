// Protezioni per il telefono, perché niente interrompa il momento.
//
// - Schermo sempre acceso finché la pagina è aperta: sulla schermata finale lei non tocca
//   più niente, e a schermo spento Chrome fermerebbe anche la musica.
// - "Indietro" resta sulla pagina: senza, il secondo gesto indietro la chiuderebbe e si
//   ricomincerebbe dalla busta. Chrome conta le voci della cronologia solo se aggiunte
//   durante un tocco, per questo la voce di riserva si rimette a ogni tocco.
// - Niente menu "Scarica immagine / Condividi" tenendo il dito su una foto.

// --- Schermo acceso ---
let blocco = null;
async function tieniAcceso() {
  if (!('wakeLock' in navigator) || document.hidden || blocco) return;
  try {
    blocco = await navigator.wakeLock.request('screen');
    blocco.addEventListener('release', () => {
      blocco = null;
    });
  } catch {
    // Non concesso (batteria scarica, impostazioni): si va avanti senza.
  }
}
tieniAcceso();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) tieniAcceso(); // Chrome lo rilascia quando la pagina va in secondo piano
});

// --- "Indietro" resta qui ---
window.addEventListener(
  'click',
  () => {
    tieniAcceso();
    if (!history.state?.biglietto) history.pushState({ biglietto: true }, '');
  },
  { capture: true },
);

// --- Niente menu con la pressione lunga ---
document.addEventListener('contextmenu', (e) => e.preventDefault());
