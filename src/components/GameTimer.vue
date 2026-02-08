<template>
  <span class="timer">{{ formattedTime }}</span>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';

const props = defineProps({
  running: {
    type: Boolean,
    default: false
  },
  reset: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:elapsed']);

const startTime = ref(null);
const elapsedTime = ref(0);
let timerInterval = null;

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(elapsedTime.value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

watch(() => props.running, (newVal) => {
  if (newVal) {
    if (!startTime.value) {
      startTime.value = Date.now();
    }
    timerInterval = setInterval(() => {
      elapsedTime.value = Date.now() - startTime.value;
      emit('update:elapsed', elapsedTime.value);
    }, 100);
  } else {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
}, { immediate: true });

watch(() => props.reset, (newVal) => {
  if (newVal) {
    startTime.value = null;
    elapsedTime.value = 0;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

defineExpose({
  getElapsedTime: () => elapsedTime.value
});
</script>

<style scoped>
.timer {
  font-weight: bold;
  color: var(--text-main);
  font-variant-numeric: tabular-nums;
}
</style>
