// Agganciare qualcosa (di solito un suono) a un istante preciso di un video.
//
// alTempo(video, secondi, fn): chiama fn quando il video arriva a `secondi`, guardando il
// tempo del fotogramma mostrato. Se il telefono rallenta il video, il suono lo segue.
// Restituisce la funzione per annullare. Si ferma da solo se il video esce dalla pagina.
export function alTempo(video, secondi, fn) {
  let fermo = false;
  const controlla = () => {
    if (fermo || !video.isConnected) return;
    if (video.currentTime >= secondi) {
      fermo = true;
      fn();
      return;
    }
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(controlla);
    else requestAnimationFrame(controlla);
  };
  controlla();
  return () => {
    fermo = true;
  };
}
