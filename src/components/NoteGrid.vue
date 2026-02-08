<template>
  <div class="note-grid-wrapper">
    <!-- 序列模式：显示清除按钮 -->
    <div v-if="mode === 'sequence' && userSequence.length > 0 && !disabled" class="clear-button-container">
      <button @click="clearSequence" class="clear-btn">
        ↺ 清除重选 (已选 {{ userSequence.length }}/{{ sequenceLength }})
      </button>
    </div>
    
    <div class="options-container" :class="{ 'chromatic-mode': chromatic }">
      <button
        v-for="note in notes"
        :key="note.val"
        @click="handleClick(note.val)"
        :disabled="disabled"
        class="note-btn"
        :class="[
          note.type,
          {
            'correct': isCorrect(note.val),
            'wrong': isWrong(note.val),
            'correct-answer': isCorrectAnswer(note.val),
            'dimmed': isDimmed(note.val),
            'in-sequence': mode === 'sequence' && userSequence.includes(note.val)
          }
        ]"
      >
        <div v-if="mode === 'sequence' && userSequence.includes(note.val)" class="sequence-badge">
          {{ getSequenceBadgeText(note.val) }}
        </div>
        <div class="note-name">{{ note.name }}</div>
        <div class="note-val" v-if="showNoteVal">{{ note.val }}</div>
      </button>
      
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  notes: {
    type: Array,
    required: true
  },
  mode: {
    type: String,
    default: 'single', // 'single' | 'sequence'
    validator: (val) => ['single', 'sequence'].includes(val)
  },
  sequenceLength: {
    type: Number,
    default: 2
  },
  disabled: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: Object,
    default: null
  },
  chromatic: {
    type: Boolean,
    default: false
  },
  showNoteVal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select', 'sequence-complete']);

const userSequence = ref([]);

const getSequenceBadgeText = (noteVal) => {
  // 获取该音符在用户序列中的所有位置
  const positions = [];
  for (let i = 0; i < userSequence.value.length; i++) {
    if (userSequence.value[i] === noteVal) {
      positions.push(i + 1);
    }
  }
  return positions.join(',');
};

const isCorrect = (noteVal) => {
  if (!props.feedback) return false;
  if (props.mode === 'single') {
    return props.feedback.targetNote === noteVal;
  } else {
    // 序列模式：检查该音符在用户序列中的每个位置是否与目标序列匹配
    const targetSeq = props.feedback.targetSequence || [];
    const userSeq = props.feedback.userSequence || [];
    
    // 检查用户序列中每个位置，如果该位置是 noteVal 且与目标序列匹配，则正确
    for (let i = 0; i < userSeq.length; i++) {
      if (userSeq[i] === noteVal && targetSeq[i] === noteVal) {
        return true;
      }
    }
    return false;
  }
};

const isWrong = (noteVal) => {
  if (!props.feedback) return false;
  if (props.mode === 'single') {
    return props.feedback.selectedNote === noteVal && props.feedback.selectedNote !== props.feedback.targetNote;
  } else {
    // 序列模式：该音符在用户序列中，但至少有一个位置不匹配
    const targetSeq = props.feedback.targetSequence || [];
    const userSeq = props.feedback.userSequence || [];
    
    // 检查用户序列中是否有该音符，但位置不对
    for (let i = 0; i < userSeq.length; i++) {
      if (userSeq[i] === noteVal && targetSeq[i] !== noteVal) {
        return true;
      }
    }
    return false;
  }
};

const isCorrectAnswer = (noteVal) => {
  if (!props.feedback) return false;
  if (props.mode === 'single') {
    // 单音模式：这是正确答案，但用户选错了
    // 只有当用户选择了错误的答案时，才显示正确答案指示
    return props.feedback.targetNote === noteVal && 
           props.feedback.selectedNote !== noteVal &&
           props.feedback.selectedNote !== null;
  } else {
    // 序列模式：该音符在目标序列中，但用户没有正确选择（或位置不对）
    const targetSeq = props.feedback.targetSequence || [];
    const userSeq = props.feedback.userSequence || [];
    
    // 过滤掉休止符和持续音，只检查实际需要选择的音符
    const targetFiltered = targetSeq.filter(n => n !== '0' && n !== '-');
    
    // 检查目标序列中是否有该音符，但用户序列中该位置不对或没有
    for (let i = 0; i < targetFiltered.length; i++) {
      if (targetFiltered[i] === noteVal && (userSeq[i] !== noteVal || userSeq.length <= i)) {
        return true;
      }
    }
    return false;
  }
};

const isDimmed = (noteVal) => {
  if (!props.feedback) return false;
  if (props.mode === 'single') {
    // 单音模式：既不是用户选择的，也不是正确答案的，才变暗
    // 但如果用户选错了，正确答案应该显示为 correct-answer，所以这里排除正确答案
    if (isCorrectAnswer(noteVal)) {
      return false; // 正确答案用 correct-answer 样式，不 dimmed
    }
    return props.feedback.selectedNote !== noteVal && props.feedback.targetNote !== noteVal;
  } else {
    // 序列模式：该音符在目标序列中，但用户没有点击它（或点击次数不足）
    const targetSeq = props.feedback.targetSequence || [];
    const userSeq = props.feedback.userSequence || [];
    
    // 计算目标序列中该音符的出现次数（不包括"-"和"0"）
    const targetCount = targetSeq.filter(n => n === noteVal && n !== '0' && n !== '-').length;
    // 计算用户序列中该音符的出现次数
    const userCount = userSeq.filter(n => n === noteVal).length;
    
    // 如果目标序列中有该音符，但用户点击次数不足，则变暗
    // 但如果该音符应该显示为 correct-answer，则不 dimmed
    if (isCorrectAnswer(noteVal)) {
      return false; // 应该显示为 correct-answer，不 dimmed
    }
    if (targetCount > 0 && userCount < targetCount) {
      return true;
    }
    return false;
  }
};

const handleClick = (noteVal) => {
  if (props.disabled) return;
  
  if (props.mode === 'single') {
    emit('select', noteVal);
  } else if (props.mode === 'sequence') {
    // 序列模式：允许重复点击相同的音符（因为序列中可能有重复）
    // 只要序列长度还没达到目标长度，就允许点击
    if (userSequence.value.length >= props.sequenceLength) return;
    
    userSequence.value.push(noteVal);
    
    // 如果序列完成，发送事件
    if (userSequence.value.length === props.sequenceLength) {
      emit('sequence-complete', [...userSequence.value]);
    }
  }
};

const clearSequence = () => {
  if (props.disabled) return;
  userSequence.value = [];
};

// 当反馈显示时，重置序列（为下一轮准备）
watch(() => props.feedback, () => {
  if (props.mode === 'sequence') {
    // 延迟重置，让用户看到反馈
    setTimeout(() => {
      userSequence.value = [];
    }, 2000);
  }
});

// 当 disabled 变为 false 时，重置序列（新的一轮开始）
watch(() => props.disabled, (newVal) => {
  if (!newVal && props.mode === 'sequence') {
    userSequence.value = [];
  }
});
</script>

<style scoped>
.note-grid-wrapper {
  width: 100%;
}

.clear-button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.clear-btn {
  padding: 8px 16px;
  background-color: var(--bg-panel);
  border: 2px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-main);
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: var(--hover-bg);
  border-color: var(--hover-border);
  transform: translateY(-1px);
}

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
  user-select: none;
}

.note-btn.black {
  background: var(--key-black-bg);
  color: var(--key-black-text);
  height: 65px;
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

.note-btn.correct-answer {
  background-color: #9acd32 !important;
  color: white !important;
  border-color: #7cb342;
  box-shadow: 0 0 10px rgba(154, 205, 50, 0.5);
}

.note-btn.dimmed {
  opacity: 0.5;
}

.note-btn.in-sequence {
  border: 2px solid var(--primary-color);
}

.sequence-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 12px;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  white-space: nowrap;
}

.note-name {
  font-size: 1rem;
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
  width: 60px;
}

.note-btn.special-btn {
  background: var(--bg-panel);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  height: 100px;
}

.note-btn.sustain-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.note-btn.rest-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.note-btn.special-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(2px);
}
</style>
