import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GameHeader from './GameHeader.vue';

describe('GameHeader', () => {
  const defaultProps = {
    level: 1,
    round: 1,
    totalRounds: 10,
    score: 0,
    timerRunning: false
  };

  describe('显示内容', () => {
    it('应该正确显示关卡信息', () => {
      const wrapper = mount(GameHeader, {
        props: {
          ...defaultProps,
          level: 3
        }
      });

      expect(wrapper.text()).toContain('Level 3');
    });

    it('应该正确显示轮次信息', () => {
      const wrapper = mount(GameHeader, {
        props: {
          ...defaultProps,
          round: 5,
          totalRounds: 10
        }
      });

      expect(wrapper.text()).toContain('轮次: 5 / 10');
    });

    it('应该正确显示得分', () => {
      const wrapper = mount(GameHeader, {
        props: {
          ...defaultProps,
          score: 75
        }
      });

      expect(wrapper.text()).toContain('得分: 75');
    });

    it('应该包含返回按钮', () => {
      const wrapper = mount(GameHeader, {
        props: defaultProps
      });

      const backButton = wrapper.find('.back-link');
      expect(backButton.exists()).toBe(true);
      expect(backButton.text()).toContain('← 返回菜单');
    });

    it('应该包含 GameTimer 组件', () => {
      const wrapper = mount(GameHeader, {
        props: defaultProps
      });

      const timer = wrapper.findComponent({ name: 'GameTimer' });
      expect(timer.exists()).toBe(true);
    });
  });

  describe('事件处理', () => {
    it('应该在点击返回按钮时触发 back 事件', async () => {
      const wrapper = mount(GameHeader, {
        props: defaultProps
      });

      const backButton = wrapper.find('.back-link');
      await backButton.trigger('click');

      expect(wrapper.emitted('back')).toBeDefined();
      expect(wrapper.emitted('back').length).toBe(1);
    });

    it('应该传递 timerRunning 属性给 GameTimer', () => {
      const wrapper = mount(GameHeader, {
        props: {
          ...defaultProps,
          timerRunning: true
        }
      });

      const timer = wrapper.findComponent({ name: 'GameTimer' });
      expect(timer.props('running')).toBe(true);
    });
  });

  describe('计时器集成', () => {
    it('应该处理计时器的 update:elapsed 事件', async () => {
      const wrapper = mount(GameHeader, {
        props: defaultProps
      });

      const timer = wrapper.findComponent({ name: 'GameTimer' });
      
      // 模拟计时器发出事件
      timer.vm.$emit('update:elapsed', 5000);
      await wrapper.vm.$nextTick();

      // 检查 elapsedTime 是否更新
      expect(wrapper.vm.elapsedTime).toBe(5000);
    });

    it('应该通过 getElapsedTime 暴露经过的时间', async () => {
      const wrapper = mount(GameHeader, {
        props: defaultProps
      });

      const timer = wrapper.findComponent({ name: 'GameTimer' });
      timer.vm.$emit('update:elapsed', 12345);
      await wrapper.vm.$nextTick();

      const elapsed = wrapper.vm.getElapsedTime();
      expect(elapsed).toBe(12345);
    });
  });

  describe('边界情况', () => {
    it('应该正确处理最后一轮', () => {
      const wrapper = mount(GameHeader, {
        props: {
          ...defaultProps,
          round: 10,
          totalRounds: 10
        }
      });

      expect(wrapper.text()).toContain('轮次: 10 / 10');
    });

    it('应该正确处理第一轮', () => {
      const wrapper = mount(GameHeader, {
        props: {
          ...defaultProps,
          round: 1,
          totalRounds: 10
        }
      });

      expect(wrapper.text()).toContain('轮次: 1 / 10');
    });

    it('应该正确处理零分', () => {
      const wrapper = mount(GameHeader, {
        props: {
          ...defaultProps,
          score: 0
        }
      });

      expect(wrapper.text()).toContain('得分: 0');
    });

    it('应该正确处理高分', () => {
      const wrapper = mount(GameHeader, {
        props: {
          ...defaultProps,
          score: 999
        }
      });

      expect(wrapper.text()).toContain('得分: 999');
    });

    it('应该正确处理所有关卡', () => {
      for (let level = 0; level <= 6; level++) {
        const wrapper = mount(GameHeader, {
          props: {
            ...defaultProps,
            level
          }
        });

        expect(wrapper.text()).toContain(`Level ${level}`);
      }
    });
  });

  describe('样式和布局', () => {
    it('应该应用正确的 CSS 类', () => {
      const wrapper = mount(GameHeader, {
        props: defaultProps
      });

      const header = wrapper.find('.header');
      expect(header.exists()).toBe(true);
    });

    it('应该正确显示统计信息容器', () => {
      const wrapper = mount(GameHeader, {
        props: defaultProps
      });

      const stats = wrapper.find('.stats');
      expect(stats.exists()).toBe(true);
    });
  });
});
