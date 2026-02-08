import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GameResult from './GameResult.vue';

describe('GameResult', () => {
  const defaultProps = {
    level: 1,
    score: 50,
    totalScore: 100,
    elapsedTime: 120000 // 2分钟，单位：毫秒
  };

  describe('显示内容', () => {
    it('应该显示游戏结束标题', () => {
      const wrapper = mount(GameResult, {
        props: defaultProps
      });

      expect(wrapper.text()).toContain('游戏结束！');
    });

    it('应该正确显示最终得分', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          score: 75,
          totalScore: 100
        }
      });

      expect(wrapper.text()).toContain('最终得分: 75 / 100');
    });

    it('应该正确格式化并显示总用时', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          elapsedTime: 125000 // 2分5秒
        }
      });

      expect(wrapper.text()).toContain('总用时: 02:05');
    });

    it('应该显示再玩一次按钮', () => {
      const wrapper = mount(GameResult, {
        props: defaultProps
      });

      const restartButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('再玩一次')
      );
      expect(restartButton).toBeDefined();
    });

    it('应该显示返回菜单按钮', () => {
      const wrapper = mount(GameResult, {
        props: defaultProps
      });

      const backButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('返回菜单')
      );
      expect(backButton).toBeDefined();
    });
  });

  describe('时间格式化', () => {
    it('应该正确格式化 0 秒', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          elapsedTime: 0
        }
      });

      expect(wrapper.text()).toContain('总用时: 00:00');
    });

    it('应该正确格式化不到1分钟', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          elapsedTime: 45000 // 45秒
        }
      });

      expect(wrapper.text()).toContain('总用时: 00:45');
    });

    it('应该正确格式化1分钟', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          elapsedTime: 60000 // 1分钟
        }
      });

      expect(wrapper.text()).toContain('总用时: 01:00');
    });

    it('应该正确格式化超过1小时', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          elapsedTime: 3665000 // 1小时1分5秒
        }
      });

      expect(wrapper.text()).toContain('总用时: 61:05');
    });

    it('应该正确格式化带小数的秒数（向下取整）', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          elapsedTime: 125500 // 2分5.5秒，应该显示为 02:05
        }
      });

      expect(wrapper.text()).toContain('总用时: 02:05');
    });
  });

  describe('事件处理', () => {
    it('应该在点击再玩一次按钮时触发 restart 事件', async () => {
      const wrapper = mount(GameResult, {
        props: defaultProps
      });

      const restartButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('再玩一次')
      );
      await restartButton.trigger('click');

      expect(wrapper.emitted('restart')).toBeDefined();
      expect(wrapper.emitted('restart').length).toBe(1);
    });

    it('应该在点击返回菜单按钮时触发 back 事件', async () => {
      const wrapper = mount(GameResult, {
        props: defaultProps
      });

      const backButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('返回菜单')
      );
      await backButton.trigger('click');

      expect(wrapper.emitted('back')).toBeDefined();
      expect(wrapper.emitted('back').length).toBe(1);
    });
  });

  describe('边界情况', () => {
    it('应该正确处理满分', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          score: 100,
          totalScore: 100
        }
      });

      expect(wrapper.text()).toContain('最终得分: 100 / 100');
    });

    it('应该正确处理零分', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          score: 0,
          totalScore: 100
        }
      });

      expect(wrapper.text()).toContain('最终得分: 0 / 100');
    });

    it('应该正确处理超过满分的情况', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          score: 150,
          totalScore: 100
        }
      });

      expect(wrapper.text()).toContain('最终得分: 150 / 100');
    });

    it('应该正确处理所有关卡', () => {
      for (let level = 0; level <= 6; level++) {
        const wrapper = mount(GameResult, {
          props: {
            ...defaultProps,
            level
          }
        });

        // 组件应该正常渲染，不报错
        expect(wrapper.exists()).toBe(true);
      }
    });

    it('应该正确处理非常长的时间', () => {
      const wrapper = mount(GameResult, {
        props: {
          ...defaultProps,
          elapsedTime: 7200000 // 2小时
        }
      });

      expect(wrapper.text()).toContain('总用时: 120:00');
    });
  });

  describe('样式', () => {
    it('应该应用正确的 CSS 类', () => {
      const wrapper = mount(GameResult, {
        props: defaultProps
      });

      const resultContainer = wrapper.find('.game-result');
      expect(resultContainer.exists()).toBe(true);
    });

    it('应该正确显示最终得分样式', () => {
      const wrapper = mount(GameResult, {
        props: defaultProps
      });

      const finalScore = wrapper.find('.final-score');
      expect(finalScore.exists()).toBe(true);
    });

    it('应该正确显示总用时样式', () => {
      const wrapper = mount(GameResult, {
        props: defaultProps
      });

      const finalTime = wrapper.find('.final-time');
      expect(finalTime.exists()).toBe(true);
    });
  });
});
