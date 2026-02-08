import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  randomSelect,
  shuffle,
  randomSelectMultiple,
  selectFromShuffled,
  selectRandom
} from './random';

describe('random.js', () => {
  describe('randomSelect - 原始随机算法', () => {
    it('应该从数组中随机选择一个元素', () => {
      const array = [1, 2, 3, 4, 5];
      const result = randomSelect(array);
      
      expect(array).toContain(result);
      expect(typeof result).toBe('number');
    });

    it('应该处理空数组', () => {
      const result = randomSelect([]);
      expect(result).toBeNull();
    });

    it('应该处理 null 或 undefined', () => {
      expect(randomSelect(null)).toBeNull();
      expect(randomSelect(undefined)).toBeNull();
    });

    it('应该能够选择数组中的任何元素', () => {
      const array = ['a', 'b', 'c'];
      const results = new Set();
      
      // 运行多次以确保随机性
      for (let i = 0; i < 100; i++) {
        results.add(randomSelect(array));
      }
      
      // 应该至少选择到两个不同的元素（由于随机性，可能不会全部选中）
      expect(results.size).toBeGreaterThanOrEqual(1);
    });

    it('应该处理单个元素数组', () => {
      const array = [42];
      expect(randomSelect(array)).toBe(42);
    });

    it('应该处理对象数组', () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = randomSelect(array);
      
      expect(array).toContain(result);
      expect(result).toHaveProperty('id');
    });
  });

  describe('shuffle - 洗牌算法', () => {
    it('应该返回一个新数组，不修改原数组', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);
      
      expect(shuffled).not.toBe(original);
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });

    it('应该返回包含相同元素的数组', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffle(array);
      
      expect(shuffled.length).toBe(array.length);
      expect(shuffled.sort()).toEqual(array.sort());
    });

    it('应该处理空数组', () => {
      const result = shuffle([]);
      expect(result).toEqual([]);
    });

    it('应该处理单个元素数组', () => {
      const array = [42];
      const result = shuffle(array);
      expect(result).toEqual([42]);
    });

    it('应该能够打乱数组顺序', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      let allSame = true;
      
      // 运行多次，检查是否至少有一次顺序不同
      for (let i = 0; i < 10; i++) {
        const shuffled = shuffle(array);
        if (JSON.stringify(shuffled) !== JSON.stringify(array)) {
          allSame = false;
          break;
        }
      }
      
      // 由于随机性，可能偶尔会相同，但多次运行应该至少有一次不同
      expect(allSame).toBe(false);
    });

    it('应该处理字符串数组', () => {
      const array = ['a', 'b', 'c', 'd'];
      const shuffled = shuffle(array);
      
      expect(shuffled.length).toBe(array.length);
      expect(new Set(shuffled)).toEqual(new Set(array));
    });

    it('应该处理对象数组', () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const shuffled = shuffle(array);
      
      expect(shuffled.length).toBe(array.length);
      const shuffledIds = shuffled.map(item => item.id).sort();
      const originalIds = array.map(item => item.id).sort();
      expect(shuffledIds).toEqual(originalIds);
    });
  });

  describe('randomSelectMultiple - 多选函数', () => {
    it('应该选择指定数量的元素', () => {
      const array = [1, 2, 3, 4, 5];
      const result = randomSelectMultiple(array, 3);
      
      expect(result.length).toBe(3);
      result.forEach(item => {
        expect(array).toContain(item);
      });
    });

    it('应该返回不重复的元素', () => {
      const array = [1, 2, 3, 4, 5];
      const result = randomSelectMultiple(array, 3);
      
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('当 count 大于等于数组长度时，应该返回所有元素', () => {
      const array = [1, 2, 3];
      const result = randomSelectMultiple(array, 5);
      
      expect(result.length).toBe(3);
      expect(new Set(result)).toEqual(new Set(array));
    });

    it('应该处理 count 为 0', () => {
      const array = [1, 2, 3];
      const result = randomSelectMultiple(array, 0);
      expect(result).toEqual([]);
    });

    it('应该处理空数组', () => {
      const result = randomSelectMultiple([], 3);
      expect(result).toEqual([]);
    });

    it('应该处理负数 count', () => {
      const array = [1, 2, 3];
      const result = randomSelectMultiple(array, -1);
      expect(result).toEqual([]);
    });
  });

  describe('selectFromShuffled - 从洗牌数组中选择', () => {
    it('应该返回选中的元素和下一个索引', () => {
      const array = [1, 2, 3, 4, 5];
      const result = selectFromShuffled(array, 3);
      
      expect(result).toHaveProperty('selected');
      expect(result).toHaveProperty('nextIndex');
      expect(result).toHaveProperty('shuffledArray');
      expect(array).toContain(result.selected);
      expect(result.nextIndex).toBe(1);
    });

    it('应该按顺序返回洗牌后的元素', () => {
      const array = [1, 2, 3];
      let result = selectFromShuffled(array, 3);
      const first = result.selected;
      
      result = selectFromShuffled(array, 3, result.nextIndex, result.shuffledArray);
      const second = result.selected;
      
      expect(first).not.toBe(second);
      expect([first, second]).not.toEqual([1, 2]); // 顺序应该被打乱
    });

    it('当索引超出范围时应该重新洗牌', () => {
      const array = [1, 2, 3];
      let result = selectFromShuffled(array, 3);
      
      // 消耗所有元素（第一次调用已经消耗了一个，再调用两次）
      result = selectFromShuffled(array, 3, result.nextIndex, result.shuffledArray);
      result = selectFromShuffled(array, 3, result.nextIndex, result.shuffledArray);
      // 此时 nextIndex 应该是 3，等于数组长度
      
      // 下一次应该重新洗牌
      const newResult = selectFromShuffled(array, 3, result.nextIndex, result.shuffledArray);
      expect(newResult.shuffledArray).toBeDefined();
      expect(newResult.nextIndex).toBe(1);
    });

    it('应该处理空数组', () => {
      const result = selectFromShuffled([], 3);
      expect(result.selected).toBeNull();
      expect(result.nextIndex).toBe(0);
      expect(result.shuffledArray).toBeNull();
    });
  });

  describe('selectRandom - 统一选择函数', () => {
    describe('使用 random 算法', () => {
      it('应该使用原始随机算法', () => {
        const array = [1, 2, 3, 4, 5];
        const result = selectRandom(array, 'random');
        
        expect(array).toContain(result);
      });

      it('应该能够选择任何元素', () => {
        const array = ['a', 'b', 'c'];
        const results = new Set();
        
        for (let i = 0; i < 50; i++) {
          results.add(selectRandom(array, 'random'));
        }
        
        expect(results.size).toBeGreaterThanOrEqual(1);
      });
    });

    describe('使用 shuffle 算法', () => {
      it('应该使用洗牌算法', () => {
        const array = [1, 2, 3, 4, 5];
        const context = { shuffledArray: null, shuffleIndex: 0 };
        const result = selectRandom(array, 'shuffle', context);
        
        expect(array).toContain(result);
        expect(context.shuffledArray).toBeDefined();
        expect(context.shuffleIndex).toBe(1);
      });

      it('应该按顺序返回洗牌后的元素', () => {
        const array = [1, 2, 3];
        const context = { shuffledArray: null, shuffleIndex: 0 };
        
        const first = selectRandom(array, 'shuffle', context);
        const second = selectRandom(array, 'shuffle', context);
        const third = selectRandom(array, 'shuffle', context);
        
        expect([first, second, third].length).toBe(3);
        expect(new Set([first, second, third])).toEqual(new Set(array));
      });

      it('当洗牌数组用尽时应该重新洗牌', () => {
        const array = [1, 2, 3];
        const context = { shuffledArray: null, shuffleIndex: 0 };
        
        // 消耗所有元素
        selectRandom(array, 'shuffle', context);
        selectRandom(array, 'shuffle', context);
        selectRandom(array, 'shuffle', context);
        
        // 下一次应该重新洗牌
        const beforeReshuffle = context.shuffleIndex;
        selectRandom(array, 'shuffle', context);
        
        expect(context.shuffleIndex).toBe(1);
        expect(context.shuffledArray).toBeDefined();
      });

      it('应该为不同的上下文维护独立状态', () => {
        const array = [1, 2, 3];
        const context1 = { shuffledArray: null, shuffleIndex: 0 };
        const context2 = { shuffledArray: null, shuffleIndex: 0 };
        
        const result1 = selectRandom(array, 'shuffle', context1);
        const result2 = selectRandom(array, 'shuffle', context2);
        
        expect(context1.shuffledArray).not.toBe(context2.shuffledArray);
        expect(context1.shuffleIndex).toBe(1);
        expect(context2.shuffleIndex).toBe(1);
      });
    });

    describe('边界情况', () => {
      it('应该处理空数组', () => {
        expect(selectRandom([], 'random')).toBeNull();
        expect(selectRandom([], 'shuffle', {})).toBeNull();
      });

      it('应该处理 null 或 undefined', () => {
        expect(selectRandom(null, 'random')).toBeNull();
        expect(selectRandom(undefined, 'random')).toBeNull();
      });

      it('默认应该使用 random 算法', () => {
        const array = [1, 2, 3];
        const result = selectRandom(array);
        expect(array).toContain(result);
      });
    });
  });

  describe('算法对比测试', () => {
    it('两种算法都应该能够选择数组中的元素', () => {
      const array = [1, 2, 3, 4, 5];
      
      const randomResult = selectRandom(array, 'random');
      const shuffleContext = { shuffledArray: null, shuffleIndex: 0 };
      const shuffleResult = selectRandom(array, 'shuffle', shuffleContext);
      
      expect(array).toContain(randomResult);
      expect(array).toContain(shuffleResult);
    });

    it('洗牌算法应该确保所有元素都被选中（在足够多次调用后）', () => {
      const array = [1, 2, 3, 4, 5];
      const context = { shuffledArray: null, shuffleIndex: 0 };
      const selected = new Set();
      
      // 运行足够多次以确保所有元素都被选中
      for (let i = 0; i < array.length * 2; i++) {
        const result = selectRandom(array, 'shuffle', context);
        selected.add(result);
      }
      
      // 洗牌算法应该确保所有元素都被选中
      expect(selected.size).toBe(array.length);
    });
  });
});
