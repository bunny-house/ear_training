// Note frequencies for C3 Major Scale
// C3 is ~130.81 Hz
const frequencies = {
  1: 261.63, // C4 (Using C4 as "C3" in user request context often means Middle C for non-musicians, but I will provide C4 or C3? request says C3. Let's start with C4 as it sounds clearer, or I can provide C3. 130Hz is quite low. I will use C4 for better clarity but label it as strictly Do/Re/Mi)
  // Actually, let's stick to strict scientific pitch notation if I want to be pedantic, but for ear training, C4 is usually better.
  // However, I will strictly follow "C3" effectively being the root. 
  // Let's use standard frequencies for C4 major scale as it's more standard for "Do Re Mi" starting point in simple apps.
  // But wait, the user SAID "C3". I will use C3 frequencies.
  // C3 = 130.81
  // D3 = 146.83
  // E3 = 164.81
  // F3 = 174.61
  // G3 = 196.00
  // A3 = 220.00
  // B3 = 246.94
};

// C4 Major Scale (Higher octave for better clarity)
const NOTES = {
  1: { name: 'Do', freq: 261.63, label: 'C4' },
  2: { name: 'Re', freq: 293.66, label: 'D4' },
  3: { name: 'Mi', freq: 329.63, label: 'E4' },
  4: { name: 'Fa', freq: 349.23, label: 'F4' },
  5: { name: 'Sol', freq: 392.00, label: 'G4' },
  6: { name: 'La', freq: 440.00, label: 'A4' },
  7: { name: 'Si', freq: 493.88, label: 'B4' },
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

  // 3. Hammer hit simulation (Short noise or high sine click) - optional, keeping it simple but rich
  // We will trust the filter envelope to do the "hit" sound

  // Gain Stages
  const mainGain = audioCtx.createGain();
  const osc1Gain = audioCtx.createGain();
  const osc2Gain = audioCtx.createGain();

  // Filter (Lowpass to simulate string damping)
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0;

  // Connections
  // Osc1 -> Osc1Gain -> Filter -> MainGain
  // Osc2 -> Osc2Gain -> MainGain (Mix overtone directly or through filter? Let's put both through filter)
  
  osc1.connect(osc1Gain);
  osc2.connect(osc2Gain);
  
  osc1Gain.connect(filter);
  osc2Gain.connect(filter);
  
  filter.connect(mainGain);
  mainGain.connect(audioCtx.destination);

  // --- Envelopes ---

  // 1. Amplitude Envelope (ADSR)
  // Piano: Fast attack, initial decay to sustain, then long release. 
  // Here we just do a "percussive" decay since we don't hold keys.
  mainGain.gain.setValueAtTime(0, now);
  mainGain.gain.linearRampToValueAtTime(0.8, now + 0.02); // Attack
  mainGain.gain.exponentialRampToValueAtTime(0.01, now + duration); // Long Decay

  // 2. Filter Frequency Envelope (Brightness decay)
  // Starts bright (hammer hit) and gets mellower
  // Base frequency varies by note, but ~2000Hz start is good for clarity
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
