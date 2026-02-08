/**
 * 随机算法工具
 * 提供两种随机算法：原始随机算法和洗牌算法
 */

/**
 * 原始随机算法：使用 Math.random() 随机选择
 * @param {Array} array - 要从中选择的数组
 * @returns {*} 随机选择的元素
 */
export function randomSelect(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Fisher-Yates 洗牌算法
 * 对数组进行原地洗牌，打乱数组顺序
 * @param {Array} array - 要洗牌的数组
 * @returns {Array} 洗牌后的数组（原数组会被修改）
 */
export function shuffle(array) {
  if (!array || array.length === 0) return array;
  
  const shuffled = [...array]; // 创建副本，避免修改原数组
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 从数组中随机选择多个不重复的元素（使用洗牌算法）
 * @param {Array} array - 要从中选择的数组
 * @param {number} count - 要选择的元素数量
 * @returns {Array} 随机选择的元素数组
 */
export function randomSelectMultiple(array, count) {
  if (!array || array.length === 0 || count <= 0) return [];
  if (count >= array.length) return [...array];
  
  const shuffled = shuffle(array);
  return shuffled.slice(0, count);
}

/**
 * 使用洗牌算法从数组中按顺序选择元素
 * 先洗牌数组，然后按顺序返回元素
 * @param {Array} array - 要从中选择的数组
 * @param {number} count - 要选择的元素数量
 * @param {number} currentIndex - 当前索引（用于跟踪已选择的元素）
 * @returns {Object} { selected: 选中的元素, nextIndex: 下一个索引, shuffledArray: 洗牌后的数组 }
 */
export function selectFromShuffled(array, count, currentIndex = 0, shuffledArray = null) {
  if (!array || array.length === 0) return { selected: null, nextIndex: 0, shuffledArray: null };
  
  // 如果还没有洗牌数组，或者已经用完，重新洗牌
  if (!shuffledArray || currentIndex >= shuffledArray.length) {
    shuffledArray = shuffle(array);
    currentIndex = 0;
  }
  
  const selected = shuffledArray[currentIndex];
  const nextIndex = currentIndex + 1;
  
  return {
    selected,
    nextIndex,
    shuffledArray
  };
}

/**
 * 随机选择函数（兼容原有逻辑）
 * 根据算法类型选择使用原始随机或洗牌算法
 * @param {Array} array - 要从中选择的数组
 * @param {string} algorithm - 算法类型：'random' | 'shuffle'
 * @param {Object} context - 上下文对象，用于存储洗牌状态
 * @returns {*} 随机选择的元素
 */
export function selectRandom(array, algorithm = 'random', context = {}) {
  if (!array || array.length === 0) return null;
  
  if (algorithm === 'shuffle') {
    // 使用洗牌算法
    if (!context.shuffledArray || context.shuffleIndex >= context.shuffledArray.length) {
      // 重新洗牌
      context.shuffledArray = shuffle(array);
      context.shuffleIndex = 0;
    }
    const selected = context.shuffledArray[context.shuffleIndex];
    context.shuffleIndex++;
    return selected;
  } else {
    // 使用原始随机算法
    return randomSelect(array);
  }
}
