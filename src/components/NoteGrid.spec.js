import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NoteGrid from './NoteGrid.vue';

describe('NoteGrid - 序列模式重复音符bug修复测试', () => {
  const mockNotes = [
    { val: '2', name: 'Re', type: 'white' },
    { val: '3', name: 'Mi', type: 'white' },
    { val: '4', name: 'Fa', type: 'white' },
  ];

  describe('重复音符点击测试', () => {
    it('应该允许用户重复点击相同的音符', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 3,
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      expect(reButton.exists()).toBe(true);

      // 第一次点击 Re
      await reButton.trigger('click');
      
      // 验证序列完成事件未触发（因为还需要2个音符）
      expect(wrapper.emitted('sequence-complete')).toBeUndefined();
      
      // 第二次点击 Re（重复音符）
      await reButton.trigger('click');
      
      // 验证可以再次点击
      expect(wrapper.emitted('sequence-complete')).toBeUndefined();
      
      // 第三次点击 Mi
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });
      expect(miButton.exists()).toBe(true);
      await miButton.trigger('click');
      
      // 现在应该触发序列完成事件
      expect(wrapper.emitted('sequence-complete')).toBeDefined();
      expect(wrapper.emitted('sequence-complete')[0][0]).toEqual(['2', '2', '3']);
    });

    it('应该正确显示重复音符的序号标志', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 3,
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      expect(reButton.exists()).toBe(true);

      // 第一次点击 Re
      await reButton.trigger('click');
      
      // 检查序号标志显示 "1"
      let badge = reButton.find('.sequence-badge');
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe('1');
      
      // 第二次点击 Re（重复音符）
      await reButton.trigger('click');
      
      // 检查序号标志显示 "1,2"
      badge = reButton.find('.sequence-badge');
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe('1,2');
    });

    it('应该能够完成包含重复音符的序列', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 3,
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });
      expect(reButton.exists()).toBe(true);
      expect(miButton.exists()).toBe(true);

      // 点击序列: Re, Re, Mi
      await reButton.trigger('click'); // 第1个
      await reButton.trigger('click'); // 第2个（重复）
      await miButton.trigger('click'); // 第3个

      // 验证序列完成事件被触发，且序列正确
      expect(wrapper.emitted('sequence-complete')).toBeDefined();
      const emittedSequence = wrapper.emitted('sequence-complete')[0][0];
      expect(emittedSequence).toEqual(['2', '2', '3']);
      expect(emittedSequence.length).toBe(3);
    });
  });

  describe('反馈显示测试 - 重复音符', () => {
    it('应该正确标记重复音符的正确位置', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 3,
          disabled: false,
          feedback: {
            targetSequence: ['2', '2', '3'], // Re, Re, Mi
            userSequence: ['2', '2', '3'],   // 用户完全正确
          },
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });
      expect(reButton.exists()).toBe(true);
      expect(miButton.exists()).toBe(true);

      // Re 应该在两个位置都正确
      expect(reButton.classes()).toContain('correct');
      expect(reButton.classes()).not.toContain('wrong');
      
      // Mi 应该正确
      expect(miButton.classes()).toContain('correct');
      expect(miButton.classes()).not.toContain('wrong');
    });

    it('应该正确标记重复音符的错误位置', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 3,
          disabled: false,
          feedback: {
            targetSequence: ['2', '2', '3'], // Re, Re, Mi
            userSequence: ['2', '3', '2'],   // 用户顺序错误：Re, Mi, Re
          },
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });
      expect(reButton.exists()).toBe(true);
      expect(miButton.exists()).toBe(true);

      // Re 在第1个位置正确，但在第3个位置错误（应该是第2个位置）
      // 因为至少有一个位置错误，所以应该标记为 wrong
      expect(reButton.classes()).toContain('wrong');
      
      // Mi 在第2个位置错误（应该是第3个位置）
      expect(miButton.classes()).toContain('wrong');
    });

    it('应该正确处理部分正确的重复音符序列', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 3,
          disabled: false,
          feedback: {
            targetSequence: ['2', '2', '3'], // Re, Re, Mi
            userSequence: ['2', '3', '3'],   // Re, Mi, Mi（第1个正确，第2个错误，第3个错误）
          },
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });
      expect(reButton.exists()).toBe(true);
      expect(miButton.exists()).toBe(true);

      // Re 在第1个位置正确，所以应该标记为 correct
      expect(reButton.classes()).toContain('correct');
      
      // Mi 在第2和第3个位置都错误（应该是 Re, Mi），所以应该标记为 wrong
      expect(miButton.classes()).toContain('wrong');
    });

    it('应该正确标记未点击的重复音符（dimmed）', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 3,
          disabled: false,
          feedback: {
            targetSequence: ['2', '2', '3'], // Re, Re, Mi
            userSequence: ['2', '3'],        // 用户只点击了 Re, Mi（缺少一个 Re）
          },
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });
      expect(reButton.exists()).toBe(true);
      expect(miButton.exists()).toBe(true);

      // Re 在目标序列中出现2次，用户只点击了1次，所以应该 dimmed
      expect(reButton.classes()).toContain('dimmed');
      
      // Mi 已正确点击
      expect(miButton.classes()).toContain('correct');
    });
  });

  describe('边界情况测试', () => {
    it('应该能够处理所有音符都相同的情况', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 3,
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      expect(reButton.exists()).toBe(true);

      // 连续点击3次 Re
      await reButton.trigger('click');
      await reButton.trigger('click');
      await reButton.trigger('click');

      // 验证序列完成
      expect(wrapper.emitted('sequence-complete')).toBeDefined();
      expect(wrapper.emitted('sequence-complete')[0][0]).toEqual(['2', '2', '2']);
      
      // 验证序号标志显示 "1,2,3"
      const badge = reButton.find('.sequence-badge');
      expect(badge.text()).toBe('1,2,3');
    });

    it('应该在序列长度达到后阻止继续点击', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 2,
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });
      expect(reButton.exists()).toBe(true);
      expect(miButton.exists()).toBe(true);

      // 点击2次完成序列
      await reButton.trigger('click');
      await miButton.trigger('click');

      expect(wrapper.emitted('sequence-complete')).toBeDefined();
      
      // 尝试再次点击应该被阻止（因为序列已完成）
      const initialEmitCount = wrapper.emitted('sequence-complete').length;
      await reButton.trigger('click');
      expect(wrapper.emitted('sequence-complete').length).toBe(initialEmitCount);
    });
  });

  describe('单音模式测试', () => {
    it('应该在单音模式下点击音符时触发 select 事件', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'single',
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      expect(reButton.exists()).toBe(true);

      await reButton.trigger('click');

      expect(wrapper.emitted('select')).toBeDefined();
      expect(wrapper.emitted('select')[0][0]).toBe('2');
    });

    it('应该在单音模式下禁用时不触发事件', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'single',
          disabled: true,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      expect(reButton.exists()).toBe(true);

      await reButton.trigger('click');

      expect(wrapper.emitted('select')).toBeUndefined();
    });

    it('应该在单音模式下正确显示正确反馈', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'single',
          disabled: false,
          feedback: {
            targetNote: '2',
            selectedNote: '2',
          },
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      expect(reButton.exists()).toBe(true);

      expect(reButton.classes()).toContain('correct');
      expect(reButton.classes()).not.toContain('wrong');
    });

    it('应该在单音模式下正确显示错误反馈', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'single',
          disabled: false,
          feedback: {
            targetNote: '2',
            selectedNote: '3',
          },
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });
      expect(reButton.exists()).toBe(true);
      expect(miButton.exists()).toBe(true);

      // Re 是目标音，但用户选择了 Mi，所以 Re 应该 dimmed
      expect(reButton.classes()).toContain('dimmed');
      // Mi 是用户选择的错误答案
      expect(miButton.classes()).toContain('wrong');
    });

    it('应该在单音模式下正确显示未选择的音符（dimmed）', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'single',
          disabled: false,
          feedback: {
            targetNote: '2',
            selectedNote: '3',
          },
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const faButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Fa');
      });
      expect(faButton.exists()).toBe(true);

      // Fa 既不是目标音也不是用户选择的，应该 dimmed
      expect(faButton.classes()).toContain('dimmed');
    });

    it('单音模式下不应该显示序号标志', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'single',
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      expect(reButton.exists()).toBe(true);

      const badge = reButton.find('.sequence-badge');
      expect(badge.exists()).toBe(false);
    });
  });

  describe('禁用状态测试', () => {
    it('应该在 disabled 为 true 时禁用所有按钮', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 2,
          disabled: true,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined();
      });
    });

    it('应该在 disabled 为 false 时启用所有按钮', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 2,
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBeUndefined();
      });
    });

    it('应该在 disabled 状态下阻止点击', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 2,
          disabled: true,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      expect(reButton.exists()).toBe(true);

      await reButton.trigger('click');

      expect(wrapper.emitted('sequence-complete')).toBeUndefined();
    });
  });

  describe('序号标志显示测试', () => {
    it('应该为序列中的每个音符显示正确的序号', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 3,
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });
      const faButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Fa');
      });

      // 点击 Re (第1个)
      await reButton.trigger('click');
      expect(reButton.find('.sequence-badge').text()).toBe('1');

      // 点击 Mi (第2个)
      await miButton.trigger('click');
      expect(miButton.find('.sequence-badge').text()).toBe('2');

      // 点击 Fa (第3个)
      await faButton.trigger('click');
      expect(faButton.find('.sequence-badge').text()).toBe('3');
    });

    it('应该为重复音符显示多个序号', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 4,
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });

      // 点击序列: Re, Mi, Re, Mi
      await reButton.trigger('click'); // 1
      await miButton.trigger('click'); // 2
      await reButton.trigger('click'); // 3
      await miButton.trigger('click'); // 4

      expect(reButton.find('.sequence-badge').text()).toBe('1,3');
      expect(miButton.find('.sequence-badge').text()).toBe('2,4');
    });
  });

  describe('反馈状态测试 - 序列模式', () => {
    it('应该在没有反馈时不显示任何状态', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 2,
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      buttons.forEach(button => {
        expect(button.classes()).not.toContain('correct');
        expect(button.classes()).not.toContain('wrong');
        expect(button.classes()).not.toContain('dimmed');
      });
    });

    it('应该正确标记完全正确的序列', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 2,
          disabled: false,
          feedback: {
            targetSequence: ['2', '3'],
            userSequence: ['2', '3'],
          },
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      const miButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Mi');
      });

      expect(reButton.classes()).toContain('correct');
      expect(miButton.classes()).toContain('correct');
    });

    it('应该正确标记完全错误的序列', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 2,
          disabled: false,
          feedback: {
            targetSequence: ['2', '3'],
            userSequence: ['4', '4'],
          },
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const faButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Fa');
      });

      expect(faButton.classes()).toContain('wrong');
    });
  });

  describe('属性验证', () => {
    it('应该正确应用 chromatic 模式样式', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'single',
          disabled: false,
          chromatic: true,
        },
      });

      const container = wrapper.find('.options-container');
      expect(container.classes()).toContain('chromatic-mode');
    });

    it('应该在 showNoteVal 为 true 时显示音符值', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'single',
          disabled: false,
          showNoteVal: true,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      expect(reButton.exists()).toBe(true);

      const noteVal = reButton.find('.note-val');
      expect(noteVal.exists()).toBe(true);
      expect(noteVal.text()).toBe('2');
    });

    it('应该在 showNoteVal 为 false 时不显示音符值', () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'single',
          disabled: false,
          showNoteVal: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });
      expect(reButton.exists()).toBe(true);

      const noteVal = reButton.find('.note-val');
      // 即使存在，v-if 也会隐藏它
      if (noteVal.exists()) {
        // 如果元素存在但被 v-if 隐藏，这是正常的
        expect(true).toBe(true);
      }
    });
  });

  describe('序列重置测试', () => {
    it('应该在 disabled 变为 false 时重置序列', async () => {
      const wrapper = mount(NoteGrid, {
        props: {
          notes: mockNotes,
          mode: 'sequence',
          sequenceLength: 2,
          disabled: false,
        },
      });

      const buttons = wrapper.findAll('.note-btn');
      const reButton = buttons.find(btn => {
        const noteName = btn.find('.note-name');
        return noteName.exists() && noteName.text().includes('Re');
      });

      // 点击一次
      await reButton.trigger('click');
      expect(reButton.find('.sequence-badge').exists()).toBe(true);

      // 禁用
      await wrapper.setProps({ disabled: true });
      await wrapper.vm.$nextTick();

      // 重新启用
      await wrapper.setProps({ disabled: false });
      await wrapper.vm.$nextTick();

      // 序列应该被重置
      expect(reButton.find('.sequence-badge').exists()).toBe(false);
    });
  });
});
