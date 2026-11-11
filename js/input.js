// Tap e swipe unificati: stessi gesti con dito e mouse.

// Rilasciare il mouse dopo un trascinamento genera anche un click:
// lo ignoriamo se arriva subito dopo uno swipe.
let ultimoSwipe = -Infinity;
const PAUSA_DOPO_SWIPE = 350;

export function onTap(el, fn) {
  const gestisci = (e) => {
    if (performance.now() - ultimoSwipe < PAUSA_DOPO_SWIPE) return;
    fn(e);
  };
  el.addEventListener('click', gestisci);
  return () => el.removeEventListener('click', gestisci);
}

// onMove({dx, dy}) segue il dito; onEnd({dx, dy, dir, swiped}) arriva al rilascio.
// dir vale 'left' | 'right' | 'up' | 'down' se lo spostamento supera la soglia.
export function onSwipe(el, { onMove, onEnd, soglia = 60 } = {}) {
  let id = null;
  let x0 = 0;
  let y0 = 0;

  const giu = (e) => {
    if (id !== null) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    id = e.pointerId;
    x0 = e.clientX;
    y0 = e.clientY;
    try {
      el.setPointerCapture(id);
    } catch {
      /* il puntatore può non essere più attivo: il gesto funziona comunque */
    }
  };

  const muovi = (e) => {
    if (e.pointerId !== id) return;
    onMove?.({ dx: e.clientX - x0, dy: e.clientY - y0 });
  };

  const su = (e) => {
    if (e.pointerId !== id) return;
    id = null;
    const dx = e.clientX - x0;
    const dy = e.clientY - y0;
    const swiped = e.type === 'pointerup' && Math.hypot(dx, dy) >= soglia;
    let dir = null;
    if (swiped) {
      ultimoSwipe = performance.now();
      dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    }
    onEnd?.({ dx, dy, dir, swiped });
  };

  el.addEventListener('pointerdown', giu);
  el.addEventListener('pointermove', muovi);
  el.addEventListener('pointerup', su);
  el.addEventListener('pointercancel', su);

  return () => {
    el.removeEventListener('pointerdown', giu);
    el.removeEventListener('pointermove', muovi);
    el.removeEventListener('pointerup', su);
    el.removeEventListener('pointercancel', su);
  };
}
