<template>
  <div class="game-container">
    <h1>Ear Training - Level 1</h1>
    
    <div v-if="gameState === 'start' || gameState === 'finished'" class="intro">
      <p v-if="gameState === 'start'">Welcome! Listen to the reference tone (Do), then identify the second note.</p>
      <p v-else>Game Over! Final Score: {{ score }} / 100</p>
      
      <button @click="startGame" class="primary-btn">
        {{ gameState === 'start' ? 'Start Game' : 'Play Again' }}
      </button>
    </div>

    <div v-else class="play-area">
      <div class="stats">
        <span>Round: {{ currentRound }} / 10</span>
        <span>Score: {{ score }}</span>
      </div>

      <div class="status-box">
        <p class="status-text">{{ statusText }}</p>
      </div>

      <div class="controls">
        <button @click="playSequence" :disabled="isPlaying || gameState === 'feedback'">
          🔊 Replay Note
        </button>
      </div>

      <div class="options-grid">
        <button 
          v-for="note in notes" 
          :key="note.val"
          @click="checkAnswer(note.val)"
          :disabled="isPlaying || gameState === 'feedback'"
          :class="{ 
            'correct': showFeedback && targetNote === note.val,
            'wrong': showFeedback && selectedNote === note.val && selectedNote !== targetNote
          }"
        >
          <div class="note-num">{{ note.val }}</div>
          <div class="note-name">{{ note.name }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { playNote } from '../utils/audio';

// 1=Do, 2=Re, 3=Mi, 4=Fa, 5=Sol, 6=La, 7=Si
const notes = [
  { val: 1, name: 'Do' },
  { val: 2, name: 'Re' },
  { val: 3, name: 'Mi' },
  { val: 4, name: 'Fa' },
  { val: 5, name: 'Sol' },
  { val: 6, name: 'La' },
  { val: 7, name: 'Si' }
];

const gameState = ref('start'); // start, playing, waiting_for_answer, feedback, finished
const currentRound = ref(1);
const score = ref(0);
const targetNote = ref(null);
const selectedNote = ref(null);
const isPlaying = ref(false);
const statusText = ref('');

const showFeedback = computed(() => gameState.value === 'feedback');

const startGame = () => {
  score.value = 0;
  currentRound.value = 1;
  gameState.value = 'playing';
  startRound();
};

const startRound = () => {
  selectedNote.value = null;
  // Requirement: "Play based on this re, me, fa, so, la, si". 
  // Selecting from 2-7.
  const options = [2, 3, 4, 5, 6, 7]; 
  targetNote.value = options[Math.floor(Math.random() * options.length)];
  
  playSequence();
};

const playSequence = async () => {
  if (isPlaying.value) return;
  isPlaying.value = true;
  statusText.value = 'Listening...';

  // Play Reference (Do / C3)
  playNote(1, 1.0); // 1 second
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 1200));

  // Play Target
  playNote(targetNote.value, 1.0);
  
  await new Promise(r => setTimeout(r, 1000));
  
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
    statusText.value = `Wrong! It was ${notes.find(n => n.val === targetNote.value).name}`;
  }

  // Next round after delay
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
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.intro {
  margin-top: 50px;
}

.stats {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.status-box {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.status-text {
  font-size: 1.5rem;
  font-weight: bold;
}

.controls {
  margin-bottom: 2rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}
/* Center the last 3 items if needed, or just 4x2 grid? 1-7 is 7 items. */
/* Let's make it responsive or just flex wrap */
.options-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}

.options-grid button {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.note-num {
  font-size: 1.5rem;
  font-weight: bold;
}

.note-name {
  font-size: 0.9rem;
  opacity: 0.8;
}

.primary-btn {
  font-size: 1.2rem;
  padding: 1rem 2rem;
  background-color: #646cff;
  color: white;
}

button.correct {
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
}

button.wrong {
  background-color: #f44336;
  border-color: #f44336;
  color: white;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
