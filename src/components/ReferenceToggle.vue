<template>
  <label class="reference-toggle">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="toggle-input"
    />
    <span class="toggle-label">不播放参考音</span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.reference-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.reference-toggle:hover {
  background-color: var(--bg-panel);
}

.toggle-input {
  width: 40px;
  height: 20px;
  appearance: none;
  background-color: var(--border-color);
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-input:checked {
  background-color: var(--primary-color);
}

.toggle-input::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-input:checked::before {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 0.9rem;
  color: var(--text-main);
}
</style>
