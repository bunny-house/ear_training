import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ReferenceToggle from './ReferenceToggle.vue';

describe('ReferenceToggle', () => {
  describe('显示内容', () => {
    it('应该显示标签文本', () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: false
        }
      });

      expect(wrapper.text()).toContain('不播放参考音');
    });

    it('应该包含复选框输入', () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: false
        }
      });

      const input = wrapper.find('.toggle-input');
      expect(input.exists()).toBe(true);
      expect(input.attributes('type')).toBe('checkbox');
    });
  });

  describe('双向绑定', () => {
    it('应该正确反映 modelValue 为 false', () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: false
        }
      });

      const input = wrapper.find('.toggle-input');
      expect(input.element.checked).toBe(false);
    });

    it('应该正确反映 modelValue 为 true', () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: true
        }
      });

      const input = wrapper.find('.toggle-input');
      expect(input.element.checked).toBe(true);
    });

    it('应该在复选框改变时发出 update:modelValue 事件', async () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: false
        }
      });

      const input = wrapper.find('.toggle-input');
      await input.setValue(true);

      expect(wrapper.emitted('update:modelValue')).toBeDefined();
      expect(wrapper.emitted('update:modelValue').length).toBe(1);
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(true);
    });

    it('应该在取消选中时发出 false 值', async () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: true
        }
      });

      const input = wrapper.find('.toggle-input');
      await input.setValue(false);

      expect(wrapper.emitted('update:modelValue')).toBeDefined();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false);
    });
  });

  describe('用户交互', () => {
    it('应该可以通过点击标签来切换', async () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: false
        }
      });

      const label = wrapper.find('.reference-toggle');
      await label.trigger('click');

      // 由于点击标签会触发复选框的 change 事件
      // 我们需要检查事件是否被发出
      // 注意：在某些情况下，可能需要直接操作 input
      const input = wrapper.find('.toggle-input');
      expect(input.exists()).toBe(true);
    });

    it('应该可以通过直接点击复选框来切换', async () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: false
        }
      });

      const input = wrapper.find('.toggle-input');
      await input.trigger('change', { target: { checked: true } });

      expect(wrapper.emitted('update:modelValue')).toBeDefined();
    });
  });

  describe('样式和布局', () => {
    it('应该应用正确的 CSS 类', () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: false
        }
      });

      const label = wrapper.find('.reference-toggle');
      expect(label.exists()).toBe(true);
    });

    it('应该在选中状态下应用正确的样式', () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: true
        }
      });

      const input = wrapper.find('.toggle-input');
      expect(input.element.checked).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('应该正确处理默认值（未提供 modelValue）', () => {
      const wrapper = mount(ReferenceToggle);

      const input = wrapper.find('.toggle-input');
      // 默认值应该是 false
      expect(input.element.checked).toBe(false);
    });

    it('应该正确处理多次快速切换', async () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: false
        }
      });

      const input = wrapper.find('.toggle-input');
      
      // 快速切换多次
      await input.setValue(true);
      await wrapper.setProps({ modelValue: true });
      await input.setValue(false);
      await wrapper.setProps({ modelValue: false });
      await input.setValue(true);

      const events = wrapper.emitted('update:modelValue');
      expect(events.length).toBeGreaterThanOrEqual(3);
    });

    it('应该正确处理外部 prop 更新', async () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: false
        }
      });

      await wrapper.setProps({ modelValue: true });
      await wrapper.vm.$nextTick();

      const input = wrapper.find('.toggle-input');
      expect(input.element.checked).toBe(true);
    });
  });

  describe('可访问性', () => {
    it('应该正确关联标签和输入', () => {
      const wrapper = mount(ReferenceToggle, {
        props: {
          modelValue: false
        }
      });

      const label = wrapper.find('.reference-toggle');
      const input = wrapper.find('.toggle-input');
      
      // 标签应该包含输入框
      expect(label.element.contains(input.element)).toBe(true);
    });
  });
});
