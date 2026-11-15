// Audio: si sblocca al primo tap, il pulsante mute è sempre attivo.
// Effetti, tappeti d'ambiente e musica sono file (elencati in content.js, sezione suoni);
// dove un file manca suonano i segnaposto sintetizzati qui sotto.

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
  sigillo: (c, u) => {
    rumore(c, u, { freq: 1800, q: 2, picco: 0.28, coda: 0.07 });
    nota(c, u, { freq: 95, picco: 0.22, coda: 0.1 });
  },
  carta: (c, u) => rumore(c, u, { freq: 3500, q: 0.6, picco: 0.12, attacco: 0.05, coda: 0.35 }),
  coltello: (c, u) => {
    rumore(c, u, { filtro: 'highpass', freq: 2500, picco: 0.18, coda: 0.04 });
    nota(c, u, { freq: 140, picco: 0.25, coda: 0.09 });
  },
  tendina: (c, u) => rumore(c, u, { filtro: 'lowpass', freq: 900, picco: 0.2, attacco: 0.15, coda: 0.6 }),
  // Un accordo che si apre piano: sta al posto della musica della rivelazione.
  rivelazione: (c, u) => {
    for (const freq of [261.6, 329.6, 392, 523.3]) nota(c, u, { freq, picco: 0.07, attacco: 0.7, coda: 4 });
  },
  // Il fascio di luce che si accende: un colpo basso e un ronzio che resta.
  faro: (c, u) => {
    nota(c, u, { freq: 70, picco: 0.3, coda: 0.25 });
    rumore(c, u, { filtro: 'lowpass', freq: 400, picco: 0.08, attacco: 0.3, coda: 1.6 });
  },
  // Il bigliettino del regalo che esce dalla busta: un arpeggio che sale e un accordo pieno.
  regalo: (c, u) => {
    [523.3, 659.3, 784, 1046.5, 1318.5].forEach((freq, i) => {
      setTimeout(() => nota(c, u, { freq, picco: 0.09, coda: 1.6 }), i * 90);
    });
    for (const freq of [261.6, 329.6, 392, 523.3, 659.3]) nota(c, u, { freq, picco: 0.06, attacco: 0.5, coda: 5 });
  },
};

// Volume di ogni canale sotto il master.
const VOLUMI = { effetti: 1, ambiente: 1, musica: 1 };

// Il mix: quanto suona ogni file rispetto agli altri, in dB. I file escono tutti con lo
// stesso volume percepito (strumenti/prepara-audio.js), quindi qui c'è solo la scelta:
// 0 = pieno (i gesti di lei), −6 = medio, −14 e oltre = appena sotto, per non dare fastidio.
const LIVELLI = {
  sigillo: 0,
  tendina: 0,
  faro: 2, // il file è un colpo secco, più basso degli altri
  carta: -7,
  pennello: -6,
  campanella: -6,
  soffio: -8,
  scintille: -15,
  ding: -15,
  chime: -15,
  errore: -15,
  click: -20,
  festa: -25,
  giappone: -13,
  finale: -3,
};
const livello = (nome) => 10 ** ((LIVELLI[nome] ?? 0) / 20);

// createAudio(pulsante, { suoni, log })
//   suoni: { nome: 'assets/audio/…' | null } da content.js. Senza file (o finché non è
//          pronto) un effetto suona il segnaposto sintetizzato qui sopra.
//   log:   con ?audio=log la console scrive ogni suono con il suo istante.
//
// play(nome, { volume, variazione })  un effetto
// ambiente(nome | null, { dissolvenza })  il tappeto in loop della scena
// musica(nome | null, { attacco, dissolvenza })  la traccia finale, una volta sola
// vibra(schema)  navigator.vibrate, se c'è e se l'audio non è muto
export function createAudio(pulsante, { suoni = {}, log = false } = {}) {
  const Contesto = window.AudioContext || window.webkitAudioContext;
  let muto = false;
  let sbloccato = false;
  const inizio = performance.now();

  // Il contesto nasce subito, sospeso: così i file si decodificano mentre la pagina
  // carica, e al primo tap (il sigillo) il primo suono è già pronto.
  const ctx = Contesto ? new Contesto() : null;
  const master = ctx?.createGain();
  const canali = {};
  if (ctx) {
    master.connect(ctx.destination);
    for (const [nome, volume] of Object.entries(VOLUMI)) {
      canali[nome] = ctx.createGain();
      canali[nome].gain.value = volume;
      canali[nome].connect(master);
    }
  }

  const scrivi = (...cosa) => {
    if (log) console.info(`[audio] ${((performance.now() - inizio) / 1000).toFixed(2)}s`, ...cosa);
  };

  // --- I file: scaricati e decodificati subito, uno per nome ---
  const buffer = new Map();
  if (ctx) {
    for (const [nome, src] of Object.entries(suoni)) {
      if (!src) continue;
      fetch(src)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.arrayBuffer();
        })
        .then((dati) => ctx.decodeAudioData(dati))
        .then((b) => {
          buffer.set(nome, b);
          aggiornaAmbiente(); // se era il tappeto atteso, ora può partire
        })
        .catch((errore) => scrivi('file non caricato:', nome, src, errore.message));
    }
  }

  // Una sorgente che suona un buffer su un canale, con il suo volume.
  function sorgente(b, canale, { volume = 1, loop = false, velocita = 1 } = {}) {
    const s = ctx.createBufferSource();
    s.buffer = b;
    s.loop = loop;
    s.playbackRate.value = velocita;
    const g = ctx.createGain();
    g.gain.value = volume;
    s.connect(g).connect(canale);
    return { s, g };
  }

  // Sfuma un suono a zero in `secondi` e poi lo ferma.
  function sfuma(suono, secondi) {
    if (!suono) return;
    const t = ctx.currentTime;
    suono.g.gain.cancelScheduledValues(t);
    suono.g.gain.setValueAtTime(suono.g.gain.value, t);
    suono.g.gain.setTargetAtTime(0, t, secondi / 5);
    suono.s.stop(t + secondi + 0.05);
  }

  // Lo fa entrare da zero in `secondi`.
  function entra(suono, secondi, volume = 1) {
    const t = ctx.currentTime;
    suono.g.gain.setValueAtTime(0, t);
    suono.g.gain.linearRampToValueAtTime(volume, t + Math.max(0.01, secondi));
    suono.s.start();
  }

  // --- Il tappeto della scena: si può chiedere prima dello sblocco o prima che il
  //     file sia pronto; parte appena può ---
  let ambienteVoluto = null;
  let ambienteDissolvenza = 1.5;
  let ambienteInCorso = null; // { nome, s, g }

  function aggiornaAmbiente() {
    if (!ctx || !sbloccato) return;
    if ((ambienteInCorso?.nome ?? null) === ambienteVoluto) return;
    const b = ambienteVoluto && buffer.get(ambienteVoluto);
    if (ambienteVoluto && !b) return; // il file non è ancora pronto: si riprova quando arriva
    sfuma(ambienteInCorso, ambienteDissolvenza);
    ambienteInCorso = null;
    if (b) {
      ambienteInCorso = { nome: ambienteVoluto, ...sorgente(b, canali.ambiente, { loop: true }) };
      entra(ambienteInCorso, ambienteDissolvenza, livello(ambienteVoluto));
      scrivi('ambiente', ambienteVoluto);
    } else {
      scrivi('ambiente spento');
    }
  }

  // --- La musica: una traccia, una volta sola, che finisce da sé ---
  let musicaInCorso = null;

  function sblocca() {
    if (!ctx) return;
    if (ctx.state !== 'running' && !document.hidden) ctx.resume();
    if (!sbloccato) {
      sbloccato = true;
      scrivi('sbloccato');
      aggiornaAmbiente();
    }
  }

  function setMuto(valore) {
    muto = valore;
    if (master) master.gain.setTargetAtTime(muto ? 0 : 1, ctx.currentTime, 0.02);
    if (muto) navigator.vibrate?.(0);
    pulsante.classList.toggle('is-muted', muto);
    pulsante.setAttribute('aria-pressed', String(muto));
    pulsante.setAttribute('aria-label', muto ? 'Attiva audio' : 'Disattiva audio');
  }

  // Il browser permette l'audio solo dopo un gesto. Ogni tocco riprova a far ripartire
  // il contesto: serve anche se il sistema lo ha interrotto (una chiamata, un allarme).
  window.addEventListener('pointerdown', sblocca, { capture: true });
  window.addEventListener('keydown', sblocca, { capture: true });

  document.addEventListener('visibilitychange', () => {
    if (!ctx || !sbloccato) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });

  pulsante.addEventListener('click', () => setMuto(!muto));

  return {
    // Prima dello sblocco non suona nulla, senza errori.
    // durata (secondi): lo accorcia con una breve sfumatura, per esempio il pennello
    // che scrive per meno tempo del file.
    play(nome, { volume = 1, variazione = 0, durata } = {}) {
      if (!ctx || !sbloccato) return;
      const b = buffer.get(nome);
      if (b) {
        // Una piccola variazione di tono e volume: i suoni ripetuti non sembrano tutti uguali.
        const caso = () => Math.random() * 2 - 1;
        const v = volume * livello(nome) * (1 - Math.abs(caso()) * variazione);
        const { s, g } = sorgente(b, canali.effetti, { volume: v, velocita: 1 + caso() * variazione * 0.5 });
        s.start();
        if (durata && durata < b.duration) {
          const t = ctx.currentTime;
          const coda = Math.min(0.3, durata / 3);
          g.gain.setValueAtTime(v, t + durata - coda);
          g.gain.linearRampToValueAtTime(0, t + durata);
          s.stop(t + durata + 0.02);
        }
        scrivi('effetto', nome);
      } else if (SUONI[nome]) {
        SUONI[nome](ctx, canali.effetti);
        scrivi('effetto', nome, '(segnaposto)');
      } else {
        scrivi('effetto', nome, '(nessun suono)');
      }
    },

    ambiente(nome, { dissolvenza = 1.5 } = {}) {
      ambienteVoluto = nome || null;
      ambienteDissolvenza = dissolvenza;
      aggiornaAmbiente();
    },

    musica(nome, { attacco = 2, dissolvenza = 3 } = {}) {
      if (!ctx || !sbloccato) return;
      if (!nome) {
        sfuma(musicaInCorso, dissolvenza);
        musicaInCorso = null;
        scrivi('musica spenta');
        return;
      }
      if (musicaInCorso?.nome === nome) return;
      const b = buffer.get(nome);
      if (!b) {
        scrivi('musica', nome, '(file non pronto)');
        return;
      }
      sfuma(musicaInCorso, dissolvenza);
      musicaInCorso = { nome, ...sorgente(b, canali.musica) };
      entra(musicaInCorso, attacco, livello(nome));
      scrivi('musica', nome);
    },

    vibra(schema) {
      if (muto || !sbloccato) return;
      try {
        navigator.vibrate?.(schema);
      } catch {
        // Nessuna vibrazione: va bene così.
      }
      scrivi('vibra', schema);
    },

    setMuto,
    get muto() {
      return muto;
    },
    get sbloccato() {
      return sbloccato;
    },
  };
}
