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
// stereo: lascia due canali (solo per la musica) · kbps: qualità AAC
const RICETTE = {
  sigillo: { da: 'sigillo-b', inizio: 0.05, durata: 0.85, entra: 0.005, esce: 0.35 },
  scintille: { da: 'scintille-a', inizio: 10, durata: 3, entra: 0.08, esce: 1.6 },
  carta: { da: 'carta-b', inizio: 0.1, durata: 0.85, entra: 0.01, esce: 0.25 },
  festa: { da: 'festa-b', inizio: 6, durata: 14, loop: 2, kbps: 48 },
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
  const guadagno = Math.min(LOUDNESS - i, PICCO - tp + LIMITE_MAX);
  const limite = (10 ** ((PICCO - 0.5) / 20)).toFixed(3);

  // 3. AAC.
  const kbps = ricetta.kbps ?? (canali === 2 ? 96 : 64);
  const finale = path.join(USCITA, `${nome}.m4a`);
  ffmpeg(['-i', temp, '-af', `volume=${guadagno.toFixed(2)}dB,alimiter=limit=${limite}:attack=1:release=40:level=false`, '-c:a', 'aac', '-b:a', `${kbps}k`, '-movflags', '+faststart', finale]);
  fs.unlinkSync(temp);

  const dopo = leggiMisura(finale);
  const kb = Math.round(fs.statSync(finale).size / 1024);
  console.log(
    `${nome.padEnd(11)} ${durata.toFixed(2).padStart(5)}s  ${String(kb).padStart(4)} KB  ` +
      `loudness ${i.toFixed(1)} → ${dopo.i.toFixed(1)} LUFS  picco ${dopo.tp.toFixed(1)} dB`,
  );
}

fs.mkdirSync(USCITA, { recursive: true });
const scelti = process.argv.slice(2);
for (const [nome, ricetta] of Object.entries(RICETTE)) {
  if (scelti.length && !scelti.includes(nome)) continue;
  prepara(nome, ricetta);
}
