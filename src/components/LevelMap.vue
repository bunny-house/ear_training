<template>
  <div class="level-map">
    <svg class="map-svg" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <!-- 绘制连线 -->
      <g class="connections">
        <!-- 0 -> 1 -->
        <line
          :x1="getNodePosition(0).x"
          :y1="getNodePosition(0).y"
          :x2="getNodePosition(1).x"
          :y2="getNodePosition(1).y"
          :class="['connection-line', { 'unlocked-path': isUnlocked(1) }]"
        />
        <!-- 1 -> 2 -->
        <line
          :x1="getNodePosition(1).x"
          :y1="getNodePosition(1).y"
          :x2="getNodePosition(2).x"
          :y2="getNodePosition(2).y"
          :class="['connection-line', { 'unlocked-path': isUnlocked(2) }]"
        />
        <!-- 2 -> 3 -->
        <line
          :x1="getNodePosition(2).x"
          :y1="getNodePosition(2).y"
          :x2="getNodePosition(3).x"
          :y2="getNodePosition(3).y"
          :class="['connection-line', { 'unlocked-path': isUnlocked(3) }]"
        />
        <!-- 3 -> 9 -->
        <line
          :x1="getNodePosition(3).x"
          :y1="getNodePosition(3).y"
          :x2="getNodePosition(9).x"
          :y2="getNodePosition(9).y"
          :class="['connection-line', { 'unlocked-path': isUnlocked(9) }]"
        />
        <!-- 1 -> 4 -->
        <line
          :x1="getNodePosition(1).x"
          :y1="getNodePosition(1).y"
          :x2="getNodePosition(4).x"
          :y2="getNodePosition(4).y"
          :class="['connection-line', { 'unlocked-path': isUnlocked(4) }]"
        />
        <!-- 4 -> 6 -->
        <line
          :x1="getNodePosition(4).x"
          :y1="getNodePosition(4).y"
          :x2="getNodePosition(6).x"
          :y2="getNodePosition(6).y"
          :class="['connection-line', { 'unlocked-path': isUnlocked(6) }]"
        />
        <!-- 6 -> 7 -->
        <line
          :x1="getNodePosition(6).x"
          :y1="getNodePosition(6).y"
          :x2="getNodePosition(7).x"
          :y2="getNodePosition(7).y"
          :class="['connection-line', { 'unlocked-path': isUnlocked(7) }]"
        />
        <!-- 4 -> 5 -->
        <line
          :x1="getNodePosition(4).x"
          :y1="getNodePosition(4).y"
          :x2="getNodePosition(5).x"
          :y2="getNodePosition(5).y"
          :class="['connection-line', { 'unlocked-path': isUnlocked(5) }]"
        />
        <!-- 5 -> 8 -->
        <line
          :x1="getNodePosition(5).x"
          :y1="getNodePosition(5).y"
          :x2="getNodePosition(8).x"
          :y2="getNodePosition(8).y"
          :class="['connection-line', { 'unlocked-path': isUnlocked(8) }]"
        />
      </g>
    </svg>
    
    <!-- 节点按钮 -->
    <div class="nodes-container">
      <button
        v-for="level in LEVELS"
        :key="level.id"
        @click="handleNodeClick(level.id)"
        :disabled="!isUnlocked(level.id)"
        :class="[
          'level-node',
          {
            'unlocked': isUnlocked(level.id),
            'locked': !isUnlocked(level.id),
            'completed': isCompleted(level.id)
          }
        ]"
        :style="getNodeStyle(level.id)"
      >
        <div class="node-number">L{{ level.id }}</div>
        <div class="node-name">{{ level.name }}</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { LEVELS } from '../utils/levels';

const props = defineProps({
  completedLevels: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select']);

// 节点位置配置（基于 600x900 的 SVG viewBox 坐标系）
// 百分比定位 + SVG viewBox 本身就是响应式的，容器缩放时自动等比适配
// 0 -> 1
// 1 -> 2 -> 3 -> 9 (左分支：旋律听写)
// 1 -> 4 (右分支起始)
// 4 -> 6 -> 7 (右分支A)
// 4 -> 5 -> 8 (右分支B)
const nodePositions = {
  0: { x: 300, y: 60 },    // 起始
  1: { x: 300, y: 210 },   // 分叉点1
  
  // 左分支
  2: { x: 170, y: 400 },
  3: { x: 170, y: 580 },
  9: { x: 170, y: 760 },   // 短旋律听写
  
  // 右分支起始
  4: { x: 430, y: 400 },
  
  // 右分支A (4->6->7)
  6: { x: 350, y: 580 },
  7: { x: 350, y: 760 },
  
  // 右分支B (4->5->8)
  5: { x: 520, y: 580 },
  8: { x: 520, y: 760 }
};

const getNodePosition = (levelId) => {
  return nodePositions[levelId] || { x: 0, y: 0 };
};

const getNodeStyle = (levelId) => {
  const pos = getNodePosition(levelId);
  // 将绝对坐标转换为百分比（基于 600x900 viewBox）
  return {
    left: `${(pos.x / 600) * 100}%`,
    top: `${(pos.y / 900) * 100}%`
  };
};

// 判断关卡是否解锁
const isUnlocked = (levelId) => {
  return true; // 所有关卡都解锁
};

// 判断关卡是否已完成
const isCompleted = (levelId) => {
  return props.completedLevels.includes(levelId);
};

const handleNodeClick = (levelId) => {
  if (isUnlocked(levelId)) {
    emit('select', levelId);
  }
};
</script>

<style scoped>
.level-map {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 10px auto;
  aspect-ratio: 2 / 3;
  min-height: 700px;
}

/* 响应式 level-map 大小 */
@media (max-width: 900px) {
  .level-map {
    max-width: 500px;
    min-height: 620px;
    margin: 8px auto;
  }
}

@media (max-width: 600px) {
  .level-map {
    max-width: 100%;
    min-height: 560px;
    margin: 6px auto;
  }
}

@media (max-width: 480px) {
  .level-map {
    max-width: 100%;
    min-height: 500px;
    margin: 4px auto;
  }
}

.map-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connection-line {
  stroke: var(--border-color);
  stroke-width: 2;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.connection-line.unlocked-path {
  stroke: var(--primary-color);
  opacity: 0.6;
}

.nodes-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.level-node {
  position: absolute;
  width: 90px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background-color: var(--bg-panel);
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px;
  box-sizing: border-box;
  color: var(--text-main);
}

.level-node.unlocked {
  border-color: var(--primary-color);
  background-color: var(--bg-panel);
}

.level-node.unlocked:hover {
  border-color: var(--hover-border);
  background-color: var(--hover-bg);
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.level-node.completed {
  background-color: var(--primary-color);
  color: var(--primary-text);
  border-color: var(--primary-color);
}

.level-node.locked {
  opacity: 0.4;
  cursor: not-allowed;
  background-color: var(--bg-panel);
  border-color: var(--border-color);
}

.node-number {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 2px;
}

.node-name {
  font-size: 0.65rem;
  text-align: center;
  line-height: 1.2;
  word-break: keep-all;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .level-node {
    width: 80px;
    height: 55px;
  }
  
  .node-number {
    font-size: 0.9rem;
  }
  
  .node-name {
    font-size: 0.6rem;
  }
}

@media (max-width: 600px) {
  .level-node {
    width: 70px;
    height: 50px;
    padding: 4px;
  }
  
  .node-number {
    font-size: 0.85rem;
    margin-bottom: 1px;
  }
  
  .node-name {
    font-size: 0.5rem;
  }
}

@media (max-width: 480px) {
  .level-node {
    width: 60px;
    height: 45px;
    padding: 3px;
  }
  
  .node-number {
    font-size: 0.75rem;
    margin-bottom: 1px;
  }
  
  .node-name {
    font-size: 0.45rem;
  }
}
</style>