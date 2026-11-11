import content from '../content.js';
import { createAudio } from './audio.js';
import { createEngine } from './engine.js';

import biglietto from './scenes/01-biglietto.js';
import pergamena from './scenes/02-pergamena.js';
import bpmn from './scenes/03-bpmn.js';
import kaizen from './scenes/04-kaizen.js';
import bancone from './scenes/05-bancone.js';
import noren from './scenes/06-noren.js';
import finale from './scenes/07-finale.js';

const scenes = [biglietto, pergamena, bpmn, kaizen, bancone, noren, finale];

document.title = content.titoloPagina;

const audio = createAudio(document.getElementById('mute'));
const engine = createEngine({
  stage: document.getElementById('stage'),
  scenes,
  audio,
  content,
});

// ?scene=N salta alla scena N (da 1 a 7) durante i test.
const richiesta = parseInt(new URLSearchParams(location.search).get('scene'), 10);
engine.go(Number.isFinite(richiesta) ? richiesta - 1 : 0);
