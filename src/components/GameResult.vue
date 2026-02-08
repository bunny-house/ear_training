<template>
  <div class="game-result">
    <h2>游戏结束！</h2>
    <div class="final-score">最终得分: {{ score }} / {{ totalScore }}</div>
    <div class="final-time">总用时: {{ formattedTime }}</div>
    <div class="action-buttons">
      <button @click="$emit('restart')" class="primary-btn">再玩一次</button>
      <button @click="$emit('back')" class="secondary-btn">返回菜单</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  level: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalScore: {
    type: Number,
    default: 100
  },
  elapsedTime: {
    type: Number,
    required: true // 毫秒
  }
});

defineEmits(['restart', 'back']);

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(props.elapsedTime / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});
</script>

<style scoped>
.game-result {
  margin: 20px 0;
}

.final-score {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 20px 0;
}

.final-time {
  font-size: 1.2rem;
  color: var(--text-sub);
  margin-bottom: 30px;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.primary-btn,
.secondary-btn {
  padding: 10px 25px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.primary-btn {
  background-color: var(--primary-color);
  color: var(--primary-text);
}

.primary-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.secondary-btn {
  background-color: var(--secondary-bg);
  color: var(--secondary-text);
}

.secondary-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>
