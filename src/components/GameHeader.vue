<template>
  <div class="header">
    <button @click="$emit('back')" class="back-link">← 返回菜单</button>
    <div class="stats">
      <span>Level {{ level }}</span>
      <span>轮次: {{ round }} / {{ totalRounds }}</span>
      <span>得分: {{ score }}</span>
      <GameTimer :running="timerRunning" @update:elapsed="handleElapsed" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GameTimer from './GameTimer.vue';

defineProps({
  level: {
    type: Number,
    required: true
  },
  round: {
    type: Number,
    required: true
  },
  totalRounds: {
    type: Number,
    default: 10
  },
  score: {
    type: Number,
    required: true
  },
  timerRunning: {
    type: Boolean,
    default: false
  }
});

defineEmits(['back']);

const elapsedTime = ref(0);

const handleElapsed = (ms) => {
  elapsedTime.value = ms;
};

defineExpose({
  getElapsedTime: () => elapsedTime.value
});
</script>

<style scoped>
.header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 15px;
  gap: 20px;
}

.back-link {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.back-link:hover {
  color: var(--text-main);
}

.stats {
  display: flex;
  gap: 20px;
  font-weight: bold;
  color: var(--text-main);
  align-items: center;
  flex-wrap: wrap;
  margin-left: auto;
}
</style>
