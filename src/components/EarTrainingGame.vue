<template>
  <div class="game-container">
    <!-- 菜单页 -->
    <div v-if="gameState === 'menu'" class="menu">
      <h1>Ear Training Game</h1>
      <p>选择一个关卡</p>
      <LevelMap
        :completed-levels="completedLevels"
        @select="selectLevel"
      />
    </div>

    <!-- 关卡介绍页 -->
    <div v-else-if="gameState === 'start'" class="intro">
      <button @click="goMenu" class="back-link">← 返回菜单</button>
      <h1>Level {{ currentLevel }}</h1>
      <p>{{ currentLevelConfig.introText }}</p>
      <span class="sub-text">共{{ currentLevelConfig.totalRounds }}轮。每题{{ currentLevelConfig.pointsPerQuestion }}分。</span>
      
      <ReferenceToggle
        v-if="currentLevelConfig.hasReferenceToggle"
        v-model="skipReference"
        class="intro-toggle"
      />
      
      <div class="action-buttons">
        <button @click="startGame" class="primary-btn">开始游戏</button>
      </div>
    </div>

    <!-- 游戏结束页 -->
    <div v-else-if="gameState === 'finished'" class="intro">
      <GameResult
        :level="currentLevel"
        :score="score"
        :total-score="currentLevelConfig.totalRounds * currentLevelConfig.pointsPerQuestion"
        :elapsed-time="finalElapsedTime"
        @restart="restart"
        @back="goMenu"
      />
    </div>

    <!-- 游戏区域 -->
    <div v-else class="play-area">
      <GameHeader
        ref="headerRef"
        :level="currentLevel"
        :round="currentRound"
        :total-rounds="currentLevelConfig.totalRounds"
        :score="score"
        :timer-running="timerRunning"
        @back="goMenu"
      />

      <div class="status-box">
        <p class="status-text">{{ statusText }}</p>
        <ReferenceToggle
          v-if="currentLevelConfig.hasReferenceToggle"
          v-model="skipReference"
        />
        <button
          @click="playSequence"
          :disabled="isPlaying || gameState === 'feedback'"
          class="replay-btn"
        >
          🔊 重播
        </button>
      </div>

      <!-- Level 0: 高低音辨别 -->
      <div v-if="currentLevelConfig.mode === 'pitch_compare'" class="pitch-buttons">
        <button
          @click="checkAnswer('first')"
          :disabled="isPlaying || gameState === 'feedback'"
          class="pitch-btn"
        >
          第一个音更高
        </button>
        <button
          @click="checkAnswer('second')"
          :disabled="isPlaying || gameState === 'feedback'"
          class="pitch-btn"
        >
          第二个音更高
        </button>
      </div>

      <!-- Level 1~6: 音符网格 -->
      <NoteGrid
        v-else
        :notes="currentLevelNotes"
        :mode="gridMode"
        :sequence-length="sequenceLengthForGrid"
        :disabled="isPlaying || gameState === 'feedback'"
        :feedback="feedback"
        :chromatic="currentLevelConfig.noteSet === 'chromatic_no_low_do'"
        :show-note-val="currentLevel === 1"
        @select="handleNoteSelect"
        @sequence-complete="handleSequenceComplete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { playNote, playNoteByFreq, initAudio, C4_FREQ } from '@/utils/audio';
import {
  LEVELS,
  getLevelConfig,
  getNotesForLevel,
  getWhiteKeyNotes,
  calculateScore,
  notesConfig,
  MELODIES
} from '@/utils/levels';
import {
  shuffle,
  selectRandom
} from '@/utils/random';
import GameHeader from './GameHeader.vue';
import NoteGrid from './NoteGrid.vue';
import ReferenceToggle from './ReferenceToggle.vue';
import GameResult from './GameResult.vue';
import LevelMap from './LevelMap.vue';

// 状态
const gameState = ref('menu'); // menu, start, playing, waiting_for_answer, feedback, finished
const currentLevel = ref(0);
const currentRound = ref(1);
const score = ref(0);
const targetNote = ref(null);
const targetSequence = ref([]);
const lastTargetNote = ref(null);
const lastTargetSequence = ref([]);
const selectedNote = ref(null);
const userSequence = ref([]);
const isPlaying = ref(false);
const statusText = ref('');
const currentRootFreq = ref(C4_FREQ);
const skipReference = ref(false);
const timerRunning = ref(false);
const finalElapsedTime = ref(0);
const headerRef = ref(null);

// Level 0 专用状态
const pitchPair = ref({ first: null, second: null });

// Level 5 专用状态
const referenceNote = ref(null);

// 洗牌算法上下文（固定使用洗牌算法）
const shuffleContext = ref({
  notes: { shuffledArray: null, shuffleIndex: 0 },
  blackNotes: { shuffledArray: null, shuffleIndex: 0 },
  whiteNotes: { shuffledArray: null, shuffleIndex: 0 },
  melodies: { shuffledArray: null, shuffleIndex: 0 },
  whiteKeys: { shuffledArray: null, shuffleIndex: 0 },
  semitones: { shuffledArray: null, shuffleIndex: 0 }
});

// 完成的关卡列表（从 localStorage 读取）
const STORAGE_KEY = 'ear_training_completed_levels';
const loadCompletedLevels = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};
const saveCompletedLevels = (levels) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  } catch {
    // 忽略存储错误
  }
};
const completedLevels = ref(loadCompletedLevels());

// 计算属性
const currentLevelConfig = computed(() => getLevelConfig(currentLevel.value));
const currentLevelNotes = computed(() => getNotesForLevel(currentLevel.value));

const gridMode = computed(() => {
  const config = currentLevelConfig.value;
  return (config?.mode === 'sequence' || config?.mode === 'melody') ? 'sequence' : 'single';
});

const feedback = computed(() => {
  if (gameState.value !== 'feedback') return null;
  
  if (currentLevelConfig.value?.mode === 'sequence' || currentLevelConfig.value?.mode === 'melody') {
    return {
      targetSequence: targetSequence.value,
      userSequence: userSequence.value
    };
  } else {
    return {
      targetNote: targetNote.value,
      selectedNote: selectedNote.value
    };
  }
});

const sequenceLengthForGrid = computed(() => {
  const config = currentLevelConfig.value;
  if (config?.mode === 'melody') {
    // 排除休止符和持续音，只计算需要用户选择的音符数量
    if (!targetSequence.value || targetSequence.value.length === 0) {
      return 0;
    }
    return targetSequence.value.filter(n => n !== '0' && n !== '-').length;
  }
  return config?.sequenceLength;
});

// 方法
const selectLevel = (levelId) => {
  initAudio();
  currentLevel.value = levelId;
  gameState.value = 'start';
  lastTargetNote.value = null;
  lastTargetSequence.value = [];
  
  // 根据关卡配置设置默认是否跳过参考音
  const config = getLevelConfig(levelId);
  skipReference.value = config?.defaultSkipReference || false;
  
  referenceNote.value = null;
};

const goMenu = () => {
  gameState.value = 'menu';
  timerRunning.value = false;
  finalElapsedTime.value = 0;
};

const startGame = () => {
  initAudio();
  score.value = 0;
  currentRound.value = 1;
  gameState.value = 'playing';
  timerRunning.value = true;
  // 重置洗牌上下文
  shuffleContext.value = {
    notes: { shuffledArray: null, shuffleIndex: 0 },
    blackNotes: { shuffledArray: null, shuffleIndex: 0 },
    whiteNotes: { shuffledArray: null, shuffleIndex: 0 },
    melodies: { shuffledArray: null, shuffleIndex: 0 },
    whiteKeys: { shuffledArray: null, shuffleIndex: 0 },
    semitones: { shuffledArray: null, shuffleIndex: 0 }
  };
  startRound();
};

const restart = () => {
  startGame();
};

const startRound = () => {
  selectedNote.value = null;
  userSequence.value = [];
  statusText.value = '准备好...';
  
  const config = currentLevelConfig.value;
  
  // 决定根音频率
  if (currentLevel.value === 8) {
    // Level 8: 随机根音 (Movable Do) - 使用洗牌算法
    if (!shuffleContext.value.semitones.shuffledArray || 
        shuffleContext.value.semitones.shuffleIndex >= shuffleContext.value.semitones.shuffledArray.length) {
      const semitonesArray = Array.from({ length: 12 }, (_, i) => i - 5);
      shuffleContext.value.semitones.shuffledArray = shuffle(semitonesArray);
      shuffleContext.value.semitones.shuffleIndex = 0;
    }
    const randomSemitones = shuffleContext.value.semitones.shuffledArray[shuffleContext.value.semitones.shuffleIndex];
    shuffleContext.value.semitones.shuffleIndex++;
    currentRootFreq.value = C4_FREQ * Math.pow(2, randomSemitones / 12);
  } else {
    currentRootFreq.value = C4_FREQ;
  }
  
  // Level 0: 生成两个音高
  if (config.mode === 'pitch_compare') {
    generatePitchPair();
  }
  // Level 5: 随机参考音 - 使用洗牌算法
  else if (currentLevel.value === 5) {
    const whiteKeys = getWhiteKeyNotes();
    const randomRef = selectRandom(whiteKeys, 'shuffle', shuffleContext.value.whiteKeys);
    if (randomRef) {
      referenceNote.value = randomRef.val;
    } else {
      // 回退到随机选择
      const fallbackRef = whiteKeys[Math.floor(Math.random() * whiteKeys.length)];
      referenceNote.value = fallbackRef.val;
    }
    generateTargetNote();
  }
  // Level 9: 旋律听写
  else if (config.mode === 'melody') {
    generateMelody();
  }
  // Level 2/3: 生成序列
  else if (config.mode === 'sequence') {
    generateTargetSequence();
  }
  // Level 1/4/6: 生成单音
  else {
    generateTargetNote();
  }
  
  setTimeout(() => {
    playSequence();
  }, 500);
};

const generatePitchPair = () => {
  let firstFreq, secondFreq;
  let searchLimit = 50;
  
  do {
    // 生成两个不同的频率，确保差距 >= 3 个半音 - 使用洗牌算法
    if (!shuffleContext.value.semitones.shuffledArray || 
        shuffleContext.value.semitones.shuffleIndex >= shuffleContext.value.semitones.shuffledArray.length) {
      const semitonesArray = Array.from({ length: 24 }, (_, i) => i - 12);
      shuffleContext.value.semitones.shuffledArray = shuffle(semitonesArray);
      shuffleContext.value.semitones.shuffleIndex = 0;
    }
    const firstSemitones = shuffleContext.value.semitones.shuffledArray[shuffleContext.value.semitones.shuffleIndex];
    shuffleContext.value.semitones.shuffleIndex++;
    
    // 确保第二个音与第一个音不同
    if (shuffleContext.value.semitones.shuffleIndex >= shuffleContext.value.semitones.shuffledArray.length) {
      shuffleContext.value.semitones.shuffledArray = shuffle(Array.from({ length: 24 }, (_, i) => i - 12));
      shuffleContext.value.semitones.shuffleIndex = 0;
    }
    const secondSemitones = shuffleContext.value.semitones.shuffledArray[shuffleContext.value.semitones.shuffleIndex];
    shuffleContext.value.semitones.shuffleIndex++;
    
    const diff = Math.abs(firstSemitones - secondSemitones);
    if (diff >= 3) {
      firstFreq = C4_FREQ * Math.pow(2, firstSemitones / 12);
      secondFreq = C4_FREQ * Math.pow(2, secondSemitones / 12);
      break;
    }
    searchLimit--;
  } while (searchLimit > 0);
  
  pitchPair.value = { first: firstFreq, second: secondFreq };
};

const generateTargetNote = () => {
  const config = currentLevelConfig.value;
  const notes = currentLevelNotes.value;
  let newNote;
  let searchLimit = 50;
  
  do {
    if (config.blackKeyProbability !== undefined) {
      // Level 4/5/6: 70% 黑键，30% 白键 - 使用洗牌算法
      const blackNotes = notes.filter(n => n.type === 'black').map(n => n.val);
      const whiteNotes = notes.filter(n => n.type === 'white').map(n => n.val);
      
      // 使用洗牌算法：生成概率数组并洗牌
      const probabilityArray = Array.from({ length: 100 }, (_, i) => i < config.blackKeyProbability * 100);
      const shuffled = shuffle(probabilityArray);
      const useBlack = shuffled[0];
      
      if (useBlack) {
        const selected = selectRandom(blackNotes, 'shuffle', shuffleContext.value.blackNotes);
        newNote = selected !== null ? selected : blackNotes[Math.floor(Math.random() * blackNotes.length)];
      } else {
        const selected = selectRandom(whiteNotes, 'shuffle', shuffleContext.value.whiteNotes);
        newNote = selected !== null ? selected : whiteNotes[Math.floor(Math.random() * whiteNotes.length)];
      }
    } else {
      // Level 1: 随机白键（Re~High Do）- 使用洗牌算法
      const selectedNote = selectRandom(notes, 'shuffle', shuffleContext.value.notes);
      newNote = selectedNote ? selectedNote.val : notes[Math.floor(Math.random() * notes.length)].val;
    }
    searchLimit--;
  } while (newNote === lastTargetNote.value && searchLimit > 0);
  
  targetNote.value = newNote;
  lastTargetNote.value = newNote;
};

const generateMelody = () => {
  let newMelody;
  let searchLimit = 50;
  const config = currentLevelConfig.value;
  
  // 筛选短旋律（8个音及以下）
  const availableMelodies = MELODIES.filter(m => m.sequence.length <= 8);
  
  // 如果筛选结果为空（不应该发生），回退到所有旋律
  const pool = availableMelodies.length > 0 ? availableMelodies : MELODIES;
  
  do {
    // 使用洗牌算法
    const selectedMelody = selectRandom(pool, 'shuffle', shuffleContext.value.melodies);
    newMelody = selectedMelody ? selectedMelody.sequence : pool[Math.floor(Math.random() * pool.length)].sequence;
    searchLimit--;
  } while (
    JSON.stringify(newMelody) === JSON.stringify(lastTargetSequence.value) &&
    searchLimit > 0
  );
  
  targetSequence.value = newMelody;
  lastTargetSequence.value = [...newMelody];
};

const generateTargetSequence = () => {
  const config = currentLevelConfig.value;
  const notes = currentLevelNotes.value;
  const length = config.sequenceLength;
  let newSequence;
  let searchLimit = 50;
  
  do {
    newSequence = [];
    // 使用洗牌算法：从洗牌后的数组中按顺序选择
    for (let i = 0; i < length; i++) {
      const selectedNote = selectRandom(notes, 'shuffle', shuffleContext.value.notes);
      newSequence.push(selectedNote ? selectedNote.val : notes[Math.floor(Math.random() * notes.length)].val);
    }
    searchLimit--;
  } while (
    JSON.stringify(newSequence) === JSON.stringify(lastTargetSequence.value) &&
    searchLimit > 0
  );
  
  targetSequence.value = newSequence;
  lastTargetSequence.value = [...newSequence];
};

const playSequence = async () => {
  if (isPlaying.value) return;
  isPlaying.value = true;
  statusText.value = '正在播放...';
  
  const config = currentLevelConfig.value;
  
  // Level 0: 播放两个音
  if (config.mode === 'pitch_compare') {
    playNoteByFreq(pitchPair.value.first, 1.0);
    await new Promise(r => setTimeout(r, 1200));
    playNoteByFreq(pitchPair.value.second, 1.0);
    await new Promise(r => setTimeout(r, 1200));
  }
  // Level 5: 播放参考音（带提示）+ 目标音
  else if (currentLevel.value === 5) {
    const refNote = notesConfig.find(n => n.val === referenceNote.value);
    statusText.value = `参考音是 ${refNote.name}`;
    await new Promise(r => setTimeout(r, 500));
    
    playNote(referenceNote.value, 0.8, currentRootFreq.value);
    await new Promise(r => setTimeout(r, 1000));
    
    playNote(targetNote.value, 1.2, currentRootFreq.value);
    await new Promise(r => setTimeout(r, 1200));
  }
  // Level 2/3/9: 播放参考音 + 序列
  else if (config.mode === 'sequence' || config.mode === 'melody') {
    if (!skipReference.value) {
      playNote('1', 0.8, currentRootFreq.value);
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // 旋律模式稍微快一点
    const interval = config.mode === 'melody' ? 600 : 800;
    let lastNote = null; // 用于处理持续音
    
    for (let i = 0; i < targetSequence.value.length; i++) {
      const note = targetSequence.value[i];
      
      if (note === '0') {
        // 休止符：不播放任何音，只等待
        await new Promise(r => setTimeout(r, interval));
      } else if (note === '-') {
        // 持续音：延长前一个音
        if (lastNote) {
          // 继续播放前一个音（延长持续时间）
          playNote(lastNote, 1.0, currentRootFreq.value);
          await new Promise(r => setTimeout(r, interval));
        } else {
          // 如果第一个就是持续音，跳过
          await new Promise(r => setTimeout(r, interval));
        }
      } else {
        // 正常音符
        playNote(note, 1.0, currentRootFreq.value);
        lastNote = note; // 记录当前音符，供后续持续音使用
        await new Promise(r => setTimeout(r, interval));
      }
    }
    await new Promise(r => setTimeout(r, 800));
  }
  // Level 1/4/6: 播放参考音 + 目标音
  else {
    if (!skipReference.value) {
      playNote('1', 0.8, currentRootFreq.value);
      await new Promise(r => setTimeout(r, 1000));
    }
    
    playNote(targetNote.value, 1.2, currentRootFreq.value);
    await new Promise(r => setTimeout(r, 1200));
  }
  
  isPlaying.value = false;
  
  if (gameState.value !== 'feedback') {
    gameState.value = 'waiting_for_answer';
    if (config.mode === 'sequence') {
      statusText.value = `请按顺序选择 ${config.sequenceLength} 个音符`;
    } else if (config.mode === 'melody') {
      // 计算实际需要选择的音符数量（不包括"0"休止符和"-"持续音）
      const actualNoteCount = targetSequence.value.filter(n => n !== '0' && n !== '-').length;
      statusText.value = `请按顺序听写旋律 (需要选择 ${actualNoteCount} 个音符）`;
    } else if (currentLevel.value === 0) {
      statusText.value = '请选择哪个音更高';
    } else if (currentLevel.value === 5) {
      // Level 5: 保持参考音信息
      const refNote = notesConfig.find(n => n.val === referenceNote.value);
      statusText.value = `参考音是 ${refNote.name}，请选择目标音`;
    } else {
      statusText.value = '请选择你听到的音符';
    }
  }
};

const handleNoteSelect = (noteVal) => {
  if (gameState.value !== 'waiting_for_answer') return;
  
  selectedNote.value = noteVal;
  gameState.value = 'feedback';
  
  const points = calculateScore(currentLevel.value, noteVal, targetNote.value);
  if (points > 0) {
    score.value += points;
    statusText.value = `回答正确！+${points}分`;
  } else {
    const correctNote = notesConfig.find(n => n.val === targetNote.value);
    statusText.value = `回答错误！正确答案是 ${correctNote.name}`;
  }
  
  nextRound();
};

const handleSequenceComplete = (sequence) => {
  if (gameState.value !== 'waiting_for_answer') return;
  
  userSequence.value = [...sequence];
  gameState.value = 'feedback';
  
  const points = calculateScore(
    currentLevel.value,
    null,
    null,
    sequence,
    targetSequence.value
  );
  
  if (points > 0) {
    score.value += points;
    statusText.value = `回答正确！+${points.toFixed(2)}分`;
  } else {
    // 格式化正确答案显示，排除休止符和持续音
    const correctNames = targetSequence.value
      .filter(val => val !== '0' && val !== '-') // 过滤掉休止符和持续音，不显示在答案中
      .map(val => {
        const note = notesConfig.find(n => n.val === val);
        return note ? note.name : val;
      })
      .join('、');
    statusText.value = `回答错误！正确答案是 ${correctNames}`;
  }
  
  nextRound();
};

const checkAnswer = (answer) => {
  if (gameState.value !== 'waiting_for_answer') return;
  
  const isFirstHigher = pitchPair.value.first > pitchPair.value.second;
  const isCorrect = (answer === 'first' && isFirstHigher) || (answer === 'second' && !isFirstHigher);
  
  gameState.value = 'feedback';
  
  if (isCorrect) {
    score.value += 10;
    statusText.value = '回答正确！+10分';
  } else {
    statusText.value = `回答错误！${isFirstHigher ? '第一个' : '第二个'}音更高`;
  }
  
  nextRound();
};

const nextRound = () => {
  setTimeout(() => {
    if (currentRound.value < currentLevelConfig.value.totalRounds) {
      currentRound.value++;
      gameState.value = 'playing';
      startRound();
    } else {
      gameState.value = 'finished';
      timerRunning.value = false;
      if (headerRef.value) {
        finalElapsedTime.value = headerRef.value.getElapsedTime();
      }
      // 标记关卡完成
      if (!completedLevels.value.includes(currentLevel.value)) {
        completedLevels.value.push(currentLevel.value);
        saveCompletedLevels(completedLevels.value);
      }
    }
  }, 2000);
};

// 清理
onUnmounted(() => {
  timerRunning.value = false;
});
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

.menu p {
  margin-bottom: 20px;
}

.level-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.level-btn {
  padding: 20px;
  width: 100%;
  max-width: 300px;
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

/* Intro */
.intro {
  margin-top: 50px;
  position: relative;
}

.intro .back-link {
  position: absolute;
  top: -200px;
  left: 0px;
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s;
  padding: 0;
}

.intro .back-link:hover {
  color: var(--text-main);
}

.sub-text {
  color: var(--text-sub);
  font-size: 0.9rem;
  display: block;
  margin-top: 10px;
}

.intro-toggle {
  margin: 20px 0;
}

.action-buttons {
  margin-top: 20px;
}

.primary-btn {
  padding: 10px 25px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  background-color: var(--primary-color);
  color: var(--primary-text);
  transition: all 0.2s;
}

.primary-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Play Area */
.play-area {
  margin-top: 20px;
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
  transition: all 0.2s;
}

.replay-btn:hover:not(:disabled) {
  background: var(--replay-btn-hover);
}

.replay-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Level 0: Pitch Comparison Buttons */
.pitch-buttons {
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-top: 40px;
}

.pitch-btn {
  padding: 30px 50px;
  font-size: 1.3rem;
  font-weight: bold;
  border-radius: 10px;
  border: 3px solid var(--border-color);
  background-color: var(--bg-panel);
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;
}

.pitch-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  background-color: var(--hover-bg);
  transform: translateY(-2px);
}

.pitch-btn:active:not(:disabled) {
  transform: translateY(0);
}

.pitch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
