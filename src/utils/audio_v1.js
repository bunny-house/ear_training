// Note frequencies for C3 Major Scale
// C3 is ~130.81 Hz
const frequencies = {
  1: 261.63, 
};

// C4 Chromatic Scale
const NOTES = {
  '1': { name: 'Do', freq: 261.63, label: 'C4', type: 'white' },
  '1#': { name: 'Do#', freq: 277.18, label: 'C#4', type: 'black' },
  '2': { name: 'Re', freq: 293.66, label: 'D4', type: 'white' },
  '2#': { name: 'Re#', freq: 311.13, label: 'D#4', type: 'black' },
  '3': { name: 'Mi', freq: 329.63, label: 'E4', type: 'white' },
  '4': { name: 'Fa', freq: 349.23, label: 'F4', type: 'white' },
  '4#': { name: 'Fa#', freq: 369.99, label: 'F#4', type: 'black' },
  '5': { name: 'Sol', freq: 392.00, label: 'G4', type: 'white' },
  '5#': { name: 'Sol#', freq: 415.30, label: 'G#4', type: 'black' },
  '6': { name: 'La', freq: 440.00, label: 'A4', type: 'white' },
  '6#': { name: 'La#', freq: 466.16, label: 'A#4', type: 'black' },
  '7': { name: 'Si', freq: 493.88, label: 'B4', type: 'white' },
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

export function playNote(noteIndex, duration = 1.5) {
  initAudio();
  const note = NOTES[noteIndex];
  if (!note) return;

  const now = audioCtx.currentTime;
  
  // Create nodes for Piano-like sound
  // 1. Fundamental Oscillator (Triangle for body)
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.value = note.freq;

  // 2. Overtone Oscillator (Sine for clarity)
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = note.freq;
  osc2.detune.value = 10; // Slight detune for chorus effect

  // Gain Stages
  const mainGain = audioCtx.createGain();
  const osc1Gain = audioCtx.createGain();
  const osc2Gain = audioCtx.createGain();

  // Filter (Lowpass to simulate string damping)
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

  // --- Envelopes ---
  mainGain.gain.setValueAtTime(0, now);
  mainGain.gain.linearRampToValueAtTime(0.8, now + 0.02); // Attack
  mainGain.gain.exponentialRampToValueAtTime(0.01, now + duration); // Long Decay

  filter.frequency.setValueAtTime(note.freq * 8, now); // Start with many overtones
  filter.frequency.exponentialRampToValueAtTime(note.freq, now + 1.0); // Decay to fundamental

  // 3. Mix Levels
  osc1Gain.gain.value = 0.7; // Triangle base
  osc2Gain.gain.value = 0.3; // Sine overtone

  // Start/Stop
  osc1.start(now);
  osc2.start(now);
  
  osc1.stop(now + duration + 0.5); // Allow trail
  osc2.stop(now + duration + 0.5);
}

export const NOTE_DATA = NOTES;
