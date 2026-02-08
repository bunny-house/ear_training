// Standard C4 Frequency (Middle C reference for Fixed Do)
export const C4_FREQ = 261.63;

// Note Definitions: Mapping ID to Semitone distance from Root
// 0 = Do, 1 = Do#, 2 = Re, etc.
const NOTE_DEFS = {
  '1': { semitones: 0 },
  '1#': { semitones: 1 },
  '2': { semitones: 2 },
  '2#': { semitones: 3 },
  '3': { semitones: 4 },
  '4': { semitones: 5 },
  '4#': { semitones: 6 },
  '5': { semitones: 7 },
  '5#': { semitones: 8 },
  '6': { semitones: 9 },
  '6#': { semitones: 10 },
  '7': { semitones: 11 },
  "1'": { semitones: 12 }, // High Do
};

let audioCtx = null;

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

/**
 * Calculates frequency based on Equal Temperament
 * freq = root * 2^(semitones/12)
 */
function getFrequency(rootFreq, semitones) {
  return rootFreq * Math.pow(2, semitones / 12);
}

/**
 * Play a note based on its ID relative to a Root Frequency.
 * @param {string} noteId - The ID of the note ('1', '2#', etc.) or 'ROOT' to play the root itself.
 * @param {number} duration - Duration in seconds.
 * @param {number} rootFreq - The frequency of 'Do' (Root). Defaults to C4.
 */
export function playNote(noteId, duration = 1.5, rootFreq = C4_FREQ) {
  initAudio();
  
  let freq;
  if (noteId === 'ROOT') {
    freq = rootFreq;
  } else {
    const def = NOTE_DEFS[noteId];
    if (!def) return;
    freq = getFrequency(rootFreq, def.semitones);
  }

  const now = audioCtx.currentTime;
  
  // Oscillators
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.value = freq;

  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = freq;
  osc2.detune.value = 10; 

  // Gain
  const mainGain = audioCtx.createGain();
  const osc1Gain = audioCtx.createGain();
  const osc2Gain = audioCtx.createGain();

  // Filter
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0;

  // Connections
  osc1.connect(osc1Gain);
  osc2.connect(osc2Gain);
  
  osc1Gain.connect(filter);
  osc2Gain.connect(filter);
  
  filter.connect(mainGain);
  mainGain.connect(audioCtx.destination);

  // Envelopes
  mainGain.gain.setValueAtTime(0, now);
  mainGain.gain.linearRampToValueAtTime(0.8, now + 0.02); 
  mainGain.gain.exponentialRampToValueAtTime(0.01, now + duration); 

  filter.frequency.setValueAtTime(freq * 8, now);
  filter.frequency.exponentialRampToValueAtTime(freq, now + 1.0); 

  // Mix
  osc1Gain.gain.value = 0.6;
  osc2Gain.gain.value = 0.4;

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
}

/**
 * Play a note by absolute frequency (for Level 0 pitch comparison).
 * @param {number} freq - The absolute frequency in Hz.
 * @param {number} duration - Duration in seconds.
 */
export function playNoteByFreq(freq, duration = 1.5) {
  initAudio();
  
  const now = audioCtx.currentTime;
  
  // Oscillators
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.value = freq;

  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = freq;
  osc2.detune.value = 10; 

  // Gain
  const mainGain = audioCtx.createGain();
  const osc1Gain = audioCtx.createGain();
  const osc2Gain = audioCtx.createGain();

  // Filter
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0;

  // Connections
  osc1.connect(osc1Gain);
  osc2.connect(osc2Gain);
  
  osc1Gain.connect(filter);
  osc2Gain.connect(filter);
  
  filter.connect(mainGain);
  mainGain.connect(audioCtx.destination);

  // Envelopes
  mainGain.gain.setValueAtTime(0, now);
  mainGain.gain.linearRampToValueAtTime(0.8, now + 0.02); 
  mainGain.gain.exponentialRampToValueAtTime(0.01, now + duration); 

  filter.frequency.setValueAtTime(freq * 8, now);
  filter.frequency.exponentialRampToValueAtTime(freq, now + 1.0); 

  // Mix
  osc1Gain.gain.value = 0.6;
  osc2Gain.gain.value = 0.4;

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
}
