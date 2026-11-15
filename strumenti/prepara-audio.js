// Prepara i suoni della pagina dagli originali in audio-grezzi/ (non in git, vedi FONTI.txt).
// Per ogni suono: taglio, dissolvenze, mono, volume percepito uguale per tutti, loop
// per gli ambienti; esce in assets/audio/<nome>.m4a (AAC).
//
// I volumi relativi (sigillo forte, ding basso…) NON stanno qui: stanno in js/audio.js
// (LIVELLI), così si regolano senza rifare i file.
//
// Uso: node strumenti/prepara-audio.js [nome …]   (senza nomi: tutti)
// Serve ffmpeg nel PATH.

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RADICE = path.join(__dirname, '..');
const GREZZI = path.join(RADICE, 'audio-grezzi');
const USCITA = path.join(RADICE, 'assets', 'audio');

// Volume percepito di tutti i file (LUFS) e picco massimo (dB).
const LOUDNESS = -18;
const PICCO = -2;
// Sui colpi brevi (sigillo, carta) il picco arriva prima del volume voluto: il limitatore
// può schiacciarli al massimo di tanti dB per farli sentire quanto gli altri.
const LIMITE_MAX = 6;

// da: file in audio-grezzi · inizio/durata: il taglio, in secondi
// entra/esce: dissolvenze in secondi · loop: secondi di sovrapposizione per chiudere il giro
// stereo: lascia due canali (solo per la musica) · kbps: qualità
// musica: Opus (.ogg) invece di AAC, a metà peso; e niente limitatore, che schiaccerebbe
// la dinamica (gli archi che crescono)
const RICETTE = {
  sigillo: { da: 'sigillo-b', inizio: 0.05, durata: 0.85, entra: 0.005, esce: 0.35 },
  scintille: { da: 'scintille-a', inizio: 10, durata: 3, entra: 0.08, esce: 1.6 },
  carta: { da: 'carta-b', inizio: 0.1, durata: 0.85, entra: 0.01, esce: 0.25 },
  // Scena 1: il tappeto luminoso sotto il biglietto. L'introduzione del brano, che finisce
  // appena prima che entri la cassa (a 16 s).
  luci: { da: 'luce-c', inizio: 0, durata: 15.8, entra: 0.2, esce: 2.5, stereo: true, musica: true, kbps: 48 },
  // Scena 3: il diagramma. Il sottofondo è un pizzicato a frasi di 5,333 s: quattro frasi,
  // tagliate sull'attacco, così il giro si richiude a tempo.
  tesi: { da: 'tesi-c', inizio: 0.03, durata: 21.333, loop: 0.05, musica: true, kbps: 32 },
  ding: { da: 'ding-a', inizio: 0.07, durata: 1, entra: 0.005, esce: 0.6 },
  click: { da: 'click', inizio: 0.14, durata: 0.35, entra: 0.003, esce: 0.12 },
  errore: { da: 'errore-b', inizio: 0, durata: 2, entra: 0.01, esce: 0.6 },
  chime: { da: 'chime-a', inizio: 0.02, durata: 0.75, entra: 0.005, esce: 0.25 },
  // Scene 4 e 6
  pennello: { da: 'pennello-b', inizio: 0.3, durata: 3.3, entra: 0.08, esce: 0.5 },
  campanella: { da: 'campanella', inizio: 5.4, durata: 4, entra: 0.01, esce: 2 },
  tendina: { da: 'tendina-a', inizio: 6.8, durata: 1.6, entra: 0.05, esce: 0.5 },
  faro: { da: 'faro', inizio: 0.05, durata: 0.5, entra: 0.003, esce: 0.2 },
  soffio: { da: 'soffio', inizio: 0.4, durata: 2, entra: 0.1, esce: 0.6 },
  // Koto di Kyoto: la parte più uniforme, chiusa in loop, sotto lo chef e i ricordi.
  giappone: { da: 'giappone-c', inizio: 18, durata: 42, loop: 3, musica: true, kbps: 32 },
  // Archi: entra mentre crescono, il pieno arriva sul regalo, chiude sulla coda tranquilla.
  finale: { da: 'finale-c', inizio: 33, durata: 87, entra: 0.3, esce: 7, stereo: true, musica: true, kbps: 48 },
};

const ffmpeg = (args) => execFileSync('ffmpeg', ['-hide_banner', '-nostdin', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });

// Il loudness integrato e il picco vero di un file, misurati da ffmpeg.
function leggiMisura(file) {
  const r = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-nostdin', '-i', file, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'],
    { encoding: 'utf8' },
  );
  const json = r.stderr.slice(r.stderr.lastIndexOf('{'), r.stderr.lastIndexOf('}') + 1);
  const m = JSON.parse(json);
  return { i: Number(m.input_i), tp: Number(m.input_tp) };
}

function prepara(nome, ricetta) {
  const sorgente = path.join(GREZZI, `${ricetta.da}.mp3`);
  if (!fs.existsSync(sorgente)) throw new Error(`manca ${sorgente}`);
  const temp = path.join(USCITA, `_${nome}.wav`);
  const canali = ricetta.stereo ? 2 : 1;
  const { inizio = 0, durata, entra = 0.01, esce = 0.05, loop } = ricetta;

  // 1. Taglio e dissolvenze (o chiusura del loop), in WAV a 48 kHz.
  let filtro;
  if (loop) {
    // Il giro: alla testa si sovrappone la coda che la segue, così fine e inizio combaciano.
    filtro =
      `[0:a]atrim=start=${inizio}:end=${inizio + durata + loop},asetpts=PTS-STARTPTS,asplit[a][b];` +
      `[a]atrim=end=${durata},afade=t=in:d=${loop}:curve=qsin[testa];` +
      `[b]atrim=start=${durata},asetpts=PTS-STARTPTS,afade=t=out:d=${loop}:curve=qsin[coda];` +
      `[testa][coda]amix=inputs=2:duration=first:normalize=0[out]`;
  } else {
    filtro =
      `[0:a]atrim=start=${inizio}:end=${inizio + durata},asetpts=PTS-STARTPTS,` +
      `afade=t=in:d=${entra},afade=t=out:st=${Math.max(0, durata - esce)}:d=${esce}[out]`;
  }
  ffmpeg(['-i', sorgente, '-filter_complex', filtro, '-map', '[out]', '-ac', String(canali), '-ar', '48000', temp]);

  // 2. Volume percepito uguale per tutti: guadagno verso LOUDNESS; il limitatore tiene il
  //    picco sotto PICCO (anche quello che la compressione AAC aggiunge).
  const { i, tp } = leggiMisura(temp);
  // Sotto i 0,4 s ffmpeg non misura il loudness: lì conta solo il picco.
  const guadagno = Number.isFinite(i)
    ? Math.min(LOUDNESS - i, PICCO - tp + (ricetta.musica ? 0 : LIMITE_MAX))
    : PICCO - tp;
  const limite = (10 ** ((PICCO - 0.5) / 20)).toFixed(3);
  const filtroVolume = ricetta.musica
    ? `volume=${guadagno.toFixed(2)}dB`
    : `volume=${guadagno.toFixed(2)}dB,alimiter=limit=${limite}:attack=1:release=40:level=false`;

  // 3. Codifica: AAC per gli effetti, Opus per la musica.
  const kbps = ricetta.kbps ?? (canali === 2 ? 96 : 64);
  const finale = path.join(USCITA, `${nome}.${ricetta.musica ? 'ogg' : 'm4a'}`);
  const codifica = ricetta.musica
    ? ['-c:a', 'libopus', '-b:a', `${kbps}k`, '-vbr', 'on']
    : ['-c:a', 'aac', '-b:a', `${kbps}k`, '-movflags', '+faststart'];
  ffmpeg(['-i', temp, '-af', filtroVolume, ...codifica, finale]);
  fs.unlinkSync(temp);

  const dopo = leggiMisura(finale);
  const kb = Math.round(fs.statSync(finale).size / 1024);
  console.log(
    `${nome.padEnd(11)} ${durata.toFixed(2).padStart(5)}s  ${String(kb).padStart(4)} KB  ` +
      `loudness ${Number.isFinite(i) ? i.toFixed(1) : "–"} → ${Number.isFinite(dopo.i) ? dopo.i.toFixed(1) : "–"} LUFS  picco ${dopo.tp.toFixed(1)} dB`,
  );
}

fs.mkdirSync(USCITA, { recursive: true });
const scelti = process.argv.slice(2);
for (const [nome, ricetta] of Object.entries(RICETTE)) {
  if (scelti.length && !scelti.includes(nome)) continue;
  prepara(nome, ricetta);
}
