<template>
  <div class="game-container">
    <div v-if="gameState === 'menu'" class="menu">
      <h1>Ear Training Game</h1>
      <p>Select a Level</p>
      <div class="level-buttons">
        <button @click="selectLevel(1)" class="level-btn">
          <strong>Level 1</strong>
          <span>C Major Scale (White Keys)</span>
        </button>
        <button @click="selectLevel(2)" class="level-btn">
          <strong>Level 2</strong>
          <span>Chromatic Scale (All Keys)</span>
        </button>
        <button @click="selectLevel(3)" class="level-btn">
          <strong>Level 3</strong>
          <span>Movable Do (Relative Pitch)</span>
        </button>
      </div>
    </div>

    <div v-else-if="gameState === 'start' || gameState === 'finished'" class="intro">
      <h1>Level {{ currentLevel }}</h1>
      <p v-if="gameState === 'start'">
        Welcome! Listen to the reference tone (Do), then identify the played note.
        <br>
        <span class="sub-text">10 Rounds. +10 points for correct answer.</span>
      </p>
      <div v-else class="game-over">
        <h2>Game Over!</h2>
        <div class="final-score">Final Score: {{ score }} / 100</div>
      </div>
      
      <div class="action-buttons">
        <button @click="startGame" class="primary-btn">
          {{ gameState === 'start' ? 'Start Game' : 'Play Again' }}
        </button>
        <button @click="gameState = 'menu'" class="secondary-btn">
          Back to Menu
        </button>
      </div>
    </div>

    <div v-else class="play-area">
      <div class="header">
        <button @click="gameState = 'menu'" class="back-link">← Menu</button>
        <div class="stats">
          <span>Level {{ currentLevel }}</span>
          <span>Round: {{ currentRound }} / 10</span>
          <span>Score: {{ score }}</span>
        </div>
      </div>

      <div class="status-box">
        <p class="status-text">{{ statusText }}</p>
        <button @click="playSequence" :disabled="isPlaying || gameState === 'feedback'" class="replay-btn">
          🔊 Replay
        </button>
      </div>

      <!-- Options Grid -->
      <div class="options-container" :class="{ 'chromatic-mode': currentLevel === 2 }">
        <button 
          v-for="note in currentLevelNotes" 
          :key="note.val"
          @click="checkAnswer(note.val)"
          :disabled="isPlaying || gameState === 'feedback'"
          class="note-btn"
          :class="[
            note.type,
            { 
              'correct': showFeedback && targetNote === note.val,
              'wrong': showFeedback && selectedNote === note.val && selectedNote !== targetNote,
              'dimmed': showFeedback && selectedNote !== note.val && targetNote !== note.val
            }
          ]"
        >
          <div class="note-name">{{ note.name }}</div>
          <div class="note-val" v-if="currentLevel === 1">{{ note.val }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { playNote, initAudio, C4_FREQ } from '../utils/audio';

// Configuration
const notesConfig = [
  { val: '1', name: 'Do', type: 'white' },
  { val: '1#', name: 'Do#', type: 'black' },
  { val: '2', name: 'Re', type: 'white' },
  { val: '2#', name: 'Re#', type: 'black' },
  { val: '3', name: 'Mi', type: 'white' },
  { val: '4', name: 'Fa', type: 'white' },
  { val: '4#', name: 'Fa#', type: 'black' },
  { val: '5', name: 'Sol', type: 'white' },
  { val: '5#', name: 'Sol#', type: 'black' },
  { val: '6', name: 'La', type: 'white' },
  { val: '6#', name: 'La#', type: 'black' },
  { val: '7', name: 'Si', type: 'white' }
];

// State
const gameState = ref('menu'); // menu, start, playing, waiting_for_answer, feedback, finished
const currentLevel = ref(1);
const currentRound = ref(1);
const score = ref(0);
const targetNote = ref(null);
const selectedNote = ref(null);
const isPlaying = ref(false);
const statusText = ref('');
const currentRootFreq = ref(C4_FREQ);

// Computed
const showFeedback = computed(() => gameState.value === 'feedback');

const currentLevelNotes = computed(() => {
  if (currentLevel.value === 1) {
    return notesConfig.filter(n => n.type === 'white');
  }
  // Level 2 and 3 use chromatic scale
  return notesConfig;
});

// Actions
const selectLevel = (level) => {
  // Initialize audio context immediately on user interaction
  initAudio();
  currentLevel.value = level;
  gameState.value = 'start';
};

const startGame = () => {
  // Initialize audio context immediately on user interaction
  initAudio();
  score.value = 0;
  currentRound.value = 1;
  gameState.value = 'playing';
  startRound();
};

const startRound = () => {
  selectedNote.value = null;
  statusText.value = 'Get Ready...';
  
  // Decide Root Freq for this round
  if (currentLevel.value === 3) {
    // Random root between C3 (130.81) and C5 (523.25)
    // Actually, picking from standard semitones is nicer.
    // Let's pick a random semitone offset from C3 (-12 to +12) or similar.
    // For simplicity, let's range C3 to B4.
    // C4 is 261.63. 
    // Random factor between 0.75 (approx G3) and 1.5 (G4)
    const randomSemitones = Math.floor(Math.random() * 12) - 5; // -5 to +6 range around C4
    currentRootFreq.value = C4_FREQ * Math.pow(2, randomSemitones / 12);
  } else {
    currentRootFreq.value = C4_FREQ;
  }

  let options = [];
  if (currentLevel.value === 1) {
    // Level 1: Random from based on Re, Mi, Fa, Sol, La, Si (2-7) for target
    // Requirement says: "Play... based on this re, me, fa, so, la, si"
    options = ['2', '3', '4', '5', '6', '7'];
  } else {
    // Level 2 & 3: All notes including sharps
    options = notesConfig.map(n => n.val);
  }
  
  targetNote.value = options[Math.floor(Math.random() * options.length)];
  
  // Small delay before playing
  setTimeout(() => {
    playSequence();
  }, 500);
};

const playSequence = async () => {
  if (isPlaying.value) return;
  isPlaying.value = true;
  statusText.value = 'Listening...';

  // Play Reference (Do / ROOT) - ID is '1', but we use special 'ROOT' or just '1' if we want.
  // Actually, '1' maps to 0 semitones, which is correct for Do.
  // Using 'ROOT' constant logic in audio.js is also fine, but '1' works naturally with Movable Do logic.
  // Let's use '1' (Do) explicitly.
  playNote('1', 0.8, currentRootFreq.value);
  
  // Wait
  await new Promise(r => setTimeout(r, 1000));

  // Play Target
  playNote(targetNote.value, 1.2, currentRootFreq.value);
  
  await new Promise(r => setTimeout(r, 1200));
  
  isPlaying.value = false;
  
  if (gameState.value !== 'feedback') {
    gameState.value = 'waiting_for_answer';
    statusText.value = 'Select the note you heard';
  }
};

const checkAnswer = (val) => {
  if (gameState.value !== 'waiting_for_answer') return;
  
  selectedNote.value = val;
  gameState.value = 'feedback';
  
  if (val === targetNote.value) {
    score.value += 10;
    statusText.value = 'Correct! +10 points';
  } else {
    const correctNote = notesConfig.find(n => n.val === targetNote.value);
    statusText.value = `Wrong! It was ${correctNote.name}`;
  }

  // Next round
  setTimeout(() => {
    if (currentRound.value < 10) {
      currentRound.value++;
      gameState.value = 'playing';
      startRound();
    } else {
      gameState.value = 'finished';
    }
  }, 2000);
};
</script>

<style scoped>
.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-main);
}

/* Menu */
.menu {
  margin-top: 40px;
}
.level-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}
.level-btn {
  padding: 20px;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--bg-panel);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-main);
}
.level-btn:hover {
  border-color: var(--hover-border);
  background-color: var(--hover-bg);
  transform: translateY(-2px);
}
.level-btn strong {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: var(--text-main);
}
.level-btn span {
  font-size: 0.9rem;
  color: var(--text-sub);
}

/* Common */
.primary-btn, .secondary-btn {
  padding: 10px 25px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  margin: 0 10px;
}
.primary-btn {
  background-color: var(--primary-color);
  color: var(--primary-text);
}
.secondary-btn {
  background-color: var(--secondary-bg);
  color: var(--secondary-text);
}

.intro {
  margin-top: 50px;
}
.game-over {
  margin: 20px 0;
}
.sub-text {
  color: var(--text-sub);
  font-size: 0.9rem;
}
.final-score {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 20px 0;
}
.action-buttons {
    margin-top: 20px;
}

/* Play Area */
.play-area {
  margin-top: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 15px;
}
.back-link {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1rem;
}
.stats {
  display: flex;
  gap: 20px;
  font-weight: bold;
  color: var(--text-main);
}

.status-box {
  background: var(--bg-panel);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.status-text {
  font-size: 1.4rem;
  font-weight: 600;
  min-height: 1.6em;
  margin: 0;
  color: var(--text-main);
}
.replay-btn {
  background: var(--replay-btn-bg);
  border: 1px solid var(--replay-btn-border);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-main);
}
.replay-btn:hover:not(:disabled) {
  background: var(--replay-btn-hover);
}

/* Options Grid */
.options-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 700px;
  margin: 0 auto;
}

.note-btn {
  width: 70px;
  height: 100px;
  border: 1px solid var(--border-color);
  border-radius: 0 0 5px 5px;
  background: var(--key-white-bg);
  color: var(--key-white-text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 10px;
  font-weight: bold;
  box-shadow: 0 2px 5px var(--shadow-color);
  transition: all 0.1s;
  position: relative;
  /* Disable text selection */
  user-select: none;
}

.note-btn.black {
  background: var(--key-black-bg);
  color: var(--key-black-text);
  height: 65px; 
  /* For Level 2 visual distinction in grid */
  border: none;
}

.note-btn:hover:not(:disabled) {
  transform: translateY(2px);
}
.note-btn:active:not(:disabled) {
  transform: translateY(4px);
}

.note-btn.correct {
  background-color: #4ed07d !important;
  color: white !important;
  border-color: #4ed07d;
}
.note-btn.wrong {
  background-color: #ff6b6b !important;
  color: white !important;
  border-color: #ff6b6b;
}
.note-btn.dimmed {
  opacity: 0.5;
}

.note-val {
  font-size: 0.8rem;
  margin-top: 5px;
  opacity: 0.7;
}

.chromatic-mode {
  gap: 8px;
}
.chromatic-mode .note-btn {
  font-size: 0.9rem;
  /* Slightly smaller for more density if needed */
  width: 60px;
}
</style>
