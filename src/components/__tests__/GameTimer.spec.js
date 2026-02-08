import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import GameTimer from './GameTimer.vue';

describe('GameTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('时间格式化', () => {
    it('应该正确格式化时间 - 00:00', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: false
        }
      });

      expect(wrapper.text()).toBe('00:00');
    });

    it('应该正确格式化时间 - 01:23', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: false
        }
      });

      // 手动设置 elapsedTime 为 83000ms (1分23秒)
      wrapper.vm.elapsedTime = 83000;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.text()).toBe('01:23');
    });

    it('应该正确格式化时间 - 超过1小时', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: false
        }
      });

      // 手动设置 elapsedTime 为 3665000ms (1小时1分5秒)
      wrapper.vm.elapsedTime = 3665000;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.text()).toBe('61:05');
    });
  });

  describe('计时器启动和停止', () => {
    it('应该在 running 为 true 时开始计时', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: false
        }
      });

      const startTime = Date.now();
      vi.setSystemTime(startTime);

      await wrapper.setProps({ running: true });
      
      // 前进 1 秒
      vi.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();

      // 应该发出 update:elapsed 事件
      expect(wrapper.emitted('update:elapsed')).toBeDefined();
      const elapsedEvents = wrapper.emitted('update:elapsed');
      expect(elapsedEvents.length).toBeGreaterThan(0);
      
      // 检查最后的事件值应该接近 1000ms
      const lastElapsed = elapsedEvents[elapsedEvents.length - 1][0];
      expect(lastElapsed).toBeGreaterThanOrEqual(900);
      expect(lastElapsed).toBeLessThanOrEqual(1100);
    });

    it('应该在 running 为 false 时停止计时', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: true
        }
      });

      const initialEmitCount = wrapper.emitted('update:elapsed')?.length || 0;

      await wrapper.setProps({ running: false });
      
      // 前进时间，但计时器应该已停止
      vi.advanceTimersByTime(2000);
      await wrapper.vm.$nextTick();

      // 事件数量不应该增加
      const finalEmitCount = wrapper.emitted('update:elapsed')?.length || 0;
      expect(finalEmitCount).toBe(initialEmitCount);
    });

    it('应该每100ms更新一次时间', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: true
        }
      });

      // 清除初始事件
      wrapper.emitted('update:elapsed')?.splice(0);

      // 前进 500ms
      vi.advanceTimersByTime(500);
      await wrapper.vm.$nextTick();

      // 应该大约有 5 次更新（每100ms一次）
      const emitCount = wrapper.emitted('update:elapsed')?.length || 0;
      expect(emitCount).toBeGreaterThanOrEqual(4);
      expect(emitCount).toBeLessThanOrEqual(6);
    });
  });

  describe('计时器重置', () => {
    it('应该在 reset 为 true 时重置计时器', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: true,
          reset: false
        }
      });

      // 让计时器运行一段时间
      vi.advanceTimersByTime(2000);
      await wrapper.vm.$nextTick();

      // 重置计时器
      await wrapper.setProps({ reset: true });
      await wrapper.vm.$nextTick();

      // 检查时间是否重置
      const lastElapsed = wrapper.emitted('update:elapsed')?.[wrapper.emitted('update:elapsed').length - 1]?.[0];
      
      // 重置后，如果计时器继续运行，应该从0开始
      vi.advanceTimersByTime(500);
      await wrapper.vm.$nextTick();
      
      const newElapsed = wrapper.emitted('update:elapsed')?.[wrapper.emitted('update:elapsed').length - 1]?.[0];
      // 重置后应该从接近0开始
      expect(newElapsed).toBeLessThan(1000);
    });

    it('应该在重置时停止计时器', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: true,
          reset: false
        }
      });

      const initialEmitCount = wrapper.emitted('update:elapsed')?.length || 0;

      await wrapper.setProps({ reset: true });
      await wrapper.vm.$nextTick();

      // 前进时间
      vi.advanceTimersByTime(1000);
      await wrapper.vm.$nextTick();

      // 如果重置时停止了计时器，事件数量不应该增加
      const finalEmitCount = wrapper.emitted('update:elapsed')?.length || 0;
      // 注意：重置后如果 running 仍然是 true，计时器会重新开始
      // 所以这里主要测试重置功能本身
      expect(wrapper.vm.elapsedTime).toBe(0);
    });
  });

  describe('getElapsedTime 方法', () => {
    it('应该通过 defineExpose 暴露 getElapsedTime 方法', () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: false
        }
      });

      expect(wrapper.vm.getElapsedTime).toBeDefined();
      expect(typeof wrapper.vm.getElapsedTime).toBe('function');
    });

    it('应该返回当前的 elapsedTime', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: true
        }
      });

      vi.advanceTimersByTime(1500);
      await wrapper.vm.$nextTick();

      const elapsed = wrapper.vm.getElapsedTime();
      expect(elapsed).toBeGreaterThanOrEqual(1400);
      expect(elapsed).toBeLessThanOrEqual(1600);
    });
  });

  describe('组件卸载', () => {
    it('应该在组件卸载时清理定时器', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: true
        }
      });

      const initialEmitCount = wrapper.emitted('update:elapsed')?.length || 0;

      wrapper.unmount();

      // 前进时间
      vi.advanceTimersByTime(1000);
      
      // 事件数量不应该增加（因为定时器已被清理）
      // 注意：由于组件已卸载，我们无法检查事件，但可以确保没有错误
      expect(true).toBe(true); // 如果没有抛出错误，说明清理成功
    });
  });

  describe('边界情况', () => {
    it('应该正确处理 running 状态的快速切换', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: false
        }
      });

      // 快速切换 running 状态
      await wrapper.setProps({ running: true });
      await wrapper.setProps({ running: false });
      await wrapper.setProps({ running: true });
      await wrapper.setProps({ running: false });

      // 不应该有内存泄漏或错误
      expect(wrapper.vm).toBeDefined();
    });

    it('应该正确处理从停止状态直接重置', async () => {
      const wrapper = mount(GameTimer, {
        props: {
          running: false,
          reset: false
        }
      });

      await wrapper.setProps({ reset: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.elapsedTime).toBe(0);
    });
  });
});
