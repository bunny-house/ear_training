import { describe, it, expect } from 'vitest';
import {
  LEVELS,
  notesConfig,
  getLevelConfig,
  getNotesForLevel,
  getWhiteKeyNotes,
  calculateScore
} from './levels';

describe('levels.js', () => {
  describe('LEVELS 配置', () => {
    it('应该包含所有7个关卡', () => {
      expect(LEVELS.length).toBe(7);
      expect(LEVELS.map(l => l.id)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it('每个关卡应该有必需的属性', () => {
      LEVELS.forEach(level => {
        expect(level).toHaveProperty('id');
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('mode');
        expect(level).toHaveProperty('totalRounds');
        expect(level).toHaveProperty('pointsPerQuestion');
      });
    });

    it('Level 0 应该是 pitch_compare 模式', () => {
      const level0 = LEVELS.find(l => l.id === 0);
      expect(level0.mode).toBe('pitch_compare');
      expect(level0.hasReferenceToggle).toBe(false);
    });

    it('Level 1 应该是 single 模式', () => {
      const level1 = LEVELS.find(l => l.id === 1);
      expect(level1.mode).toBe('single');
      expect(level1.noteSet).toBe('white_no_do');
      expect(level1.hasReferenceToggle).toBe(true);
    });

    it('Level 2 应该是 sequence 模式，长度为2', () => {
      const level2 = LEVELS.find(l => l.id === 2);
      expect(level2.mode).toBe('sequence');
      expect(level2.sequenceLength).toBe(2);
      expect(level2.scoringRule).toBe('partial');
    });

    it('Level 3 应该是 sequence 模式，长度为3', () => {
      const level3 = LEVELS.find(l => l.id === 3);
      expect(level3.mode).toBe('sequence');
      expect(level3.sequenceLength).toBe(3);
      expect(level3.scoringRule).toBe('proportional');
    });

    it('Level 4/5/6 应该有 blackKeyProbability', () => {
      [4, 5, 6].forEach(levelId => {
        const level = LEVELS.find(l => l.id === levelId);
        expect(level.blackKeyProbability).toBe(0.7);
      });
    });
  });

  describe('notesConfig', () => {
    it('应该包含所有音符', () => {
      expect(notesConfig.length).toBeGreaterThan(0);
    });

    it('每个音符应该有 val, name, type 属性', () => {
      notesConfig.forEach(note => {
        expect(note).toHaveProperty('val');
        expect(note).toHaveProperty('name');
        expect(note).toHaveProperty('type');
        expect(['white', 'black']).toContain(note.type);
      });
    });

    it('应该包含 High Do (1\')', () => {
      const highDo = notesConfig.find(n => n.val === "1'");
      expect(highDo).toBeDefined();
      expect(highDo.name).toBe("Do'");
      expect(highDo.type).toBe('white');
    });
  });

  describe('getLevelConfig', () => {
    it('应该返回正确的关卡配置', () => {
      const level0 = getLevelConfig(0);
      expect(level0.id).toBe(0);
      expect(level0.mode).toBe('pitch_compare');
    });

    it('应该返回 undefined 对于不存在的关卡', () => {
      const invalid = getLevelConfig(999);
      expect(invalid).toBeUndefined();
    });

    it('应该返回所有关卡的配置', () => {
      for (let i = 0; i <= 6; i++) {
        const config = getLevelConfig(i);
        expect(config).toBeDefined();
        expect(config.id).toBe(i);
      }
    });
  });

  describe('getNotesForLevel', () => {
    it('Level 0 应该返回空数组', () => {
      const notes = getNotesForLevel(0);
      expect(notes).toEqual([]);
    });

    it('Level 1 应该返回白键（不含低音Do，含High Do）', () => {
      const notes = getNotesForLevel(1);
      expect(notes.length).toBe(7); // Re, Mi, Fa, Sol, La, Si, High Do
      expect(notes.every(n => n.type === 'white')).toBe(true);
      expect(notes.find(n => n.val === '1')).toBeUndefined(); // 不含低音Do
      expect(notes.find(n => n.val === "1'")).toBeDefined(); // 含High Do
    });

    it('Level 2/3 应该返回白键（不含低音Do，含High Do）', () => {
      [2, 3].forEach(levelId => {
        const notes = getNotesForLevel(levelId);
        expect(notes.length).toBe(7);
        expect(notes.every(n => n.type === 'white')).toBe(true);
      });
    });

    it('Level 4/5/6 应该返回半音阶（不含低音Do，含High Do）', () => {
      [4, 5, 6].forEach(levelId => {
        const notes = getNotesForLevel(levelId);
        expect(notes.length).toBe(12); // 12个音符
        expect(notes.find(n => n.val === '1')).toBeUndefined(); // 不含低音Do
        expect(notes.find(n => n.val === "1'")).toBeDefined(); // 含High Do
      });
    });

    it('无效关卡应该返回空数组', () => {
      const notes = getNotesForLevel(999);
      expect(notes).toEqual([]);
    });
  });

  describe('getWhiteKeyNotes', () => {
    it('应该返回所有白键（不含High Do）', () => {
      const notes = getWhiteKeyNotes();
      expect(notes.length).toBe(7); // Do, Re, Mi, Fa, Sol, La, Si
      expect(notes.every(n => n.type === 'white')).toBe(true);
      expect(notes.find(n => n.val === "1'")).toBeUndefined(); // 不含High Do
    });

    it('应该包含低音Do', () => {
      const notes = getWhiteKeyNotes();
      expect(notes.find(n => n.val === '1')).toBeDefined();
    });
  });

  describe('calculateScore', () => {
    describe('单音模式', () => {
      it('Level 1: 正确答案应该得10分', () => {
        const score = calculateScore(1, '2', '2');
        expect(score).toBe(10);
      });

      it('Level 1: 错误答案应该得0分', () => {
        const score = calculateScore(1, '2', '3');
        expect(score).toBe(0);
      });

      it('Level 4: 正确答案应该得10分', () => {
        const score = calculateScore(4, '2#', '2#');
        expect(score).toBe(10);
      });

      it('Level 4: 错误答案应该得0分', () => {
        const score = calculateScore(4, '2#', '3');
        expect(score).toBe(0);
      });
    });

    describe('序列模式 - Level 2 (partial)', () => {
      it('两个都正确应该得10分', () => {
        const score = calculateScore(2, null, null, ['2', '3'], ['2', '3']);
        expect(score).toBe(10);
      });

      it('一个正确应该得5分', () => {
        const score = calculateScore(2, null, null, ['2', '4'], ['2', '3']);
        expect(score).toBe(5);
      });

      it('都错误应该得0分', () => {
        const score = calculateScore(2, null, null, ['4', '5'], ['2', '3']);
        expect(score).toBe(0);
      });

      it('第一个正确，第二个错误应该得5分', () => {
        const score = calculateScore(2, null, null, ['2', '4'], ['2', '3']);
        expect(score).toBe(5);
      });

      it('第一个错误，第二个正确应该得5分', () => {
        const score = calculateScore(2, null, null, ['4', '3'], ['2', '3']);
        expect(score).toBe(5);
      });
    });

    describe('序列模式 - Level 3 (proportional)', () => {
      it('三个都正确应该得10分', () => {
        const score = calculateScore(3, null, null, ['2', '3', '4'], ['2', '3', '4']);
        expect(score).toBe(10);
      });

      it('两个正确应该得约6.67分', () => {
        const score = calculateScore(3, null, null, ['2', '3', '5'], ['2', '3', '4']);
        expect(Math.abs(score - 6.67)).toBeLessThan(0.01);
      });

      it('一个正确应该得约3.33分', () => {
        const score = calculateScore(3, null, null, ['2', '5', '6'], ['2', '3', '4']);
        expect(Math.abs(score - 3.33)).toBeLessThan(0.01);
      });

      it('都错误应该得0分', () => {
        const score = calculateScore(3, null, null, ['5', '6', '7'], ['2', '3', '4']);
        expect(score).toBe(0);
      });

      it('应该保留两位小数', () => {
        const score = calculateScore(3, null, null, ['2', '3', '5'], ['2', '3', '4']);
        const decimalPlaces = (score.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });

    describe('边界情况', () => {
      it('无效关卡应该返回0分', () => {
        const score = calculateScore(999, '2', '2');
        expect(score).toBe(0);
      });

      it('序列模式缺少参数应该返回0分', () => {
        const score = calculateScore(2, null, null, null, ['2', '3']);
        expect(score).toBe(0);
      });

      it('序列模式长度不匹配应该正确处理', () => {
        // 用户序列比目标序列短
        const score = calculateScore(2, null, null, ['2'], ['2', '3']);
        expect(score).toBe(0); // 只对了一个，但序列不完整
      });

      it('应该正确处理重复音符的序列', () => {
        const score = calculateScore(2, null, null, ['2', '2'], ['2', '2']);
        expect(score).toBe(10);
      });

      it('应该正确处理部分重复音符的序列', () => {
        const score = calculateScore(2, null, null, ['2', '3'], ['2', '2']);
        expect(score).toBe(5); // 第一个正确
      });
    });
  });
});
