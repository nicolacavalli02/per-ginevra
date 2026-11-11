// Audio: si sblocca al primo tap, il pulsante mute è sempre attivo.
// I suoni sono per ora segnaposto sintetizzati via codice (nessun file).

function inviluppo(ctx, uscita, { picco = 0.25, attacco = 0.005, coda = 0.2 }) {
  const g = ctx.createGain();
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(picco, t + attacco);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attacco + coda);
  g.connect(uscita);
  return g;
}

function nota(ctx, uscita, { freq, tipo = 'sine', ...env }) {
  const o = ctx.createOscillator();
  o.type = tipo;
  o.frequency.value = freq;
  o.connect(inviluppo(ctx, uscita, env));
  o.start();
  o.stop(ctx.currentTime + (env.attacco ?? 0.005) + (env.coda ?? 0.2) + 0.05);
}

function rumore(ctx, uscita, { filtro = 'bandpass', freq = 2000, q = 1, ...env }) {
  const durata = (env.attacco ?? 0.005) + (env.coda ?? 0.2) + 0.05;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * durata), ctx.sampleRate);
  const dati = buffer.getChannelData(0);
  for (let i = 0; i < dati.length; i++) dati[i] = Math.random() * 2 - 1;

  const sorgente = ctx.createBufferSource();
  sorgente.buffer = buffer;
  const f = ctx.createBiquadFilter();
  f.type = filtro;
  f.frequency.value = freq;
  f.Q.value = q;
  sorgente.connect(f).connect(inviluppo(ctx, uscita, env));
  sorgente.start();
}

const SUONI = {
  click: (c, u) => nota(c, u, { freq: 1400, tipo: 'triangle', picco: 0.15, coda: 0.05 }),
  ding: (c, u) => {
    nota(c, u, { freq: 1320, picco: 0.2, coda: 0.6 });
    nota(c, u, { freq: 2640, picco: 0.06, coda: 0.3 });
  },
  campanella: (c, u) => {
    nota(c, u, { freq: 660, picco: 0.22, coda: 2.2 });
    nota(c, u, { freq: 1757, picco: 0.08, coda: 1.4 });
    nota(c, u, { freq: 2794, picco: 0.04, coda: 0.8 });
  },
  carta: (c, u) => rumore(c, u, { freq: 3500, q: 0.6, picco: 0.12, attacco: 0.05, coda: 0.35 }),
  coltello: (c, u) => {
    rumore(c, u, { filtro: 'highpass', freq: 2500, picco: 0.18, coda: 0.04 });
    nota(c, u, { freq: 140, picco: 0.25, coda: 0.09 });
  },
  tendina: (c, u) => rumore(c, u, { filtro: 'lowpass', freq: 900, picco: 0.2, attacco: 0.15, coda: 0.6 }),
};

export function createAudio(pulsante) {
  let ctx = null;
  let master = null;
  let muto = false;

  function sblocca() {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = muto ? 0 : 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
  }

  function setMuto(valore) {
    muto = valore;
    if (master) master.gain.setTargetAtTime(muto ? 0 : 1, ctx.currentTime, 0.02);
    pulsante.classList.toggle('is-muted', muto);
    pulsante.setAttribute('aria-pressed', String(muto));
    pulsante.setAttribute('aria-label', muto ? 'Attiva audio' : 'Disattiva audio');
  }

  // Il browser permette l'audio solo dopo un gesto: qualsiasi primo tocco lo sblocca.
  window.addEventListener('pointerdown', sblocca, { capture: true });
  window.addEventListener('keydown', sblocca, { capture: true });

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });

  pulsante.addEventListener('click', () => setMuto(!muto));

  return {
    // Prima dello sblocco non suona nulla, senza errori.
    play(nome) {
      if (!ctx) return;
      SUONI[nome]?.(ctx, master);
    },
    setMuto,
    get muto() {
      return muto;
    },
    get sbloccato() {
      return ctx !== null;
    },
  };
}
