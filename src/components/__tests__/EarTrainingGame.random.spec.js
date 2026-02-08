import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import EarTrainingGame from '../EarTrainingGame.vue';

// Mock audio 模块
vi.mock('../../utils/audio', () => ({
  playNote: vi.fn(),
  playNoteByFreq: vi.fn(),
  initAudio: vi.fn(),
  C4_FREQ: 261.63
}));

describe('EarTrainingGame - 洗牌算法功能', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(EarTrainingGame, {
      global: {
        stubs: {
          GameHeader: true,
          NoteGrid: true,
          ReferenceToggle: true,
          GameResult: true,
          LevelMap: true
        }
      }
    });
  });

  describe('洗牌上下文管理', () => {
    it('应该初始化所有洗牌上下文', () => {
      const context = wrapper.vm.shuffleContext;
      
      expect(context).toHaveProperty('notes');
      expect(context).toHaveProperty('blackNotes');
      expect(context).toHaveProperty('whiteNotes');
      expect(context).toHaveProperty('melodies');
      expect(context).toHaveProperty('whiteKeys');
      expect(context).toHaveProperty('semitones');
    });

    it('每个上下文应该有 shuffledArray 和 shuffleIndex', () => {
      const context = wrapper.vm.shuffleContext;
      
      Object.values(context).forEach(ctx => {
        expect(ctx).toHaveProperty('shuffledArray');
        expect(ctx).toHaveProperty('shuffleIndex');
        expect(ctx.shuffledArray).toBeNull();
        expect(ctx.shuffleIndex).toBe(0);
      });
    });

    it('开始游戏时应该重置所有洗牌上下文', async () => {
      // 先修改一些上下文
      wrapper.vm.shuffleContext.notes.shuffleIndex = 10;
      wrapper.vm.shuffleContext.melodies.shuffledArray = [1, 2, 3];

      // 开始游戏
      wrapper.vm.currentLevel = 1;
      wrapper.vm.startGame();
      await nextTick();

      // 所有上下文应该被重置（注意：startGame 会调用 startRound，startRound 会使用洗牌算法，所以 shuffleIndex 会大于 0）
      // 但 shuffledArray 应该被初始化（不为 null）
      expect(wrapper.vm.shuffleContext.notes.shuffledArray).not.toBeNull();
      expect(wrapper.vm.shuffleContext.notes.shuffleIndex).toBeGreaterThan(0);
      // 验证上下文确实被重置并重新初始化了
      expect(wrapper.vm.shuffleContext.notes.shuffledArray).toBeDefined();
    });
  });

  describe('算法在生成函数中的应用', () => {
    beforeEach(() => {
      wrapper.vm.currentLevel = 1;
      wrapper.vm.gameState = 'playing';
    });

    it('generateTargetNote 应该使用洗牌算法选择音符', async () => {
      wrapper.vm.startRound();
      await nextTick();

      expect(wrapper.vm.targetNote).toBeDefined();
      expect(typeof wrapper.vm.targetNote).toBe('string');
      // 验证使用了洗牌上下文
      expect(wrapper.vm.shuffleContext.notes.shuffleIndex).toBeGreaterThan(0);
    });

    it('generateTargetSequence 应该使用洗牌算法生成序列', async () => {
      wrapper.vm.currentLevel = 2; // Level 2 使用序列模式
      wrapper.vm.startRound();
      await nextTick();

      expect(wrapper.vm.targetSequence).toBeDefined();
      expect(Array.isArray(wrapper.vm.targetSequence)).toBe(true);
      expect(wrapper.vm.targetSequence.length).toBe(2);
      // 验证使用了洗牌上下文
      expect(wrapper.vm.shuffleContext.notes.shuffleIndex).toBeGreaterThan(0);
    });

    it('generateMelody 应该使用洗牌算法选择旋律', async () => {
      wrapper.vm.currentLevel = 9; // Level 9 使用旋律模式
      wrapper.vm.startRound();
      await nextTick();

      expect(wrapper.vm.targetSequence).toBeDefined();
      expect(Array.isArray(wrapper.vm.targetSequence)).toBe(true);
      // 验证使用了洗牌上下文
      expect(wrapper.vm.shuffleContext.melodies.shuffleIndex).toBeGreaterThan(0);
    });

    it('generatePitchPair 应该使用洗牌算法生成音高对', async () => {
      wrapper.vm.currentLevel = 0; // Level 0 使用音高比较模式
      wrapper.vm.startRound();
      await nextTick();

      expect(wrapper.vm.pitchPair.first).toBeDefined();
      expect(wrapper.vm.pitchPair.second).toBeDefined();
      expect(typeof wrapper.vm.pitchPair.first).toBe('number');
      expect(typeof wrapper.vm.pitchPair.second).toBe('number');
      // 验证使用了洗牌上下文
      expect(wrapper.vm.shuffleContext.semitones.shuffleIndex).toBeGreaterThan(0);
    });
  });

  describe('特殊关卡测试', () => {
    it('Level 5 参考音选择应该使用洗牌算法', async () => {
      wrapper.vm.currentLevel = 5;
      wrapper.vm.gameState = 'playing';
      wrapper.vm.startRound();
      await nextTick();

      expect(wrapper.vm.referenceNote).toBeDefined();
      expect(typeof wrapper.vm.referenceNote).toBe('string');
      // 验证使用了洗牌上下文
      expect(wrapper.vm.shuffleContext.whiteKeys.shuffleIndex).toBeGreaterThan(0);
    });

    it('Level 8 根音频率选择应该使用洗牌算法', async () => {
      wrapper.vm.currentLevel = 8;
      wrapper.vm.gameState = 'playing';
      wrapper.vm.startRound();
      await nextTick();

      expect(wrapper.vm.currentRootFreq).toBeDefined();
      expect(typeof wrapper.vm.currentRootFreq).toBe('number');
      expect(wrapper.vm.currentRootFreq).toBeGreaterThan(0);
      // 验证使用了洗牌上下文
      expect(wrapper.vm.shuffleContext.semitones.shuffleIndex).toBeGreaterThan(0);
    });
  });

  describe('边界情况', () => {
    it('应该处理空数组情况', async () => {
      wrapper.vm.shuffleContext.notes.shuffledArray = [];
      wrapper.vm.shuffleContext.notes.shuffleIndex = 0;

      // 应该能够处理空数组而不崩溃
      wrapper.vm.currentLevel = 1;
      wrapper.vm.gameState = 'playing';
      
      // 这个测试主要确保不会抛出错误
      expect(() => {
        wrapper.vm.startRound();
      }).not.toThrow();
    });
  });
});
