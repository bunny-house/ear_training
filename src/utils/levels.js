// 完整的音符配置（包含 High Do）
export const notesConfig = [
  { val: '1', name: 'Do', type: 'white' },
  { val: '1#', name: 'Do#', type: 'black' },
  { val: '2', name: 'Re', type: 'white' },
  { val: '2#', name: 'Re#', type: 'black' },
  { val: '3', name: 'Mi', type: 'white' },
  { val: '4', name: 'Fa', type: 'white' },
  { val: '4#', name: 'Fa#', type: 'black' },
  { val: '5', name: 'Sol', type: 'white' },
  { val: '5#', name: 'Sol#', type: 'black' },
  { val: '6', name: 'La', type: 'white' },
  { val: '6#', name: 'La#', type: 'black' },
  { val: '7', name: 'Si', type: 'white' },
  { val: "1'", name: "Do'", type: 'white' } // High Do
];

// 流行歌曲旋律库 (简谱数字表示)
// 说明："-" 表示持续音（延长前一个音），"0" 表示休止符（空格）
export const MELODIES = [
  // 8个音及以下的完整旋律
  { name: '小星星', sequence: ['1', '1', '5', '5', '6', '6', '5'] },
  { name: '两只老虎', sequence: ['1', '2', '3', '1', '1', '2', '3', '1'] },
  { name: '生日快乐', sequence: ['5', '5', '6', '5', "1'", '7'] },
  { name: '送别', sequence: ['5', '3', '5', "1'", '6', "1'", '5'] },
  { name: '兰花草', sequence: ['6', '6', '6', '5', '6', "1'", '5', '3'] },
  
  // 欢乐颂拆分为多个片段（原15个音）
  { name: '欢乐颂片段1', sequence: ['3', '3', '4', '5', '5', '4', '3', '2'] },
  { name: '欢乐颂片段2', sequence: ['1', '1', '2', '3', '3', '2', '2'] },
  
  // 粉刷匠拆分为多个片段（原12个音）
  { name: '粉刷匠片段1', sequence: ['5', '3', '5', '3', '5', '3', '1', '2'] },
  { name: '粉刷匠片段2', sequence: ['4', '3', '2', '5'] },
  
  // 新年好拆分为多个片段（原15个音）
  { name: '新年好片段1', sequence: ['1', '1', '1', '5', '3', '3', '3', '1'] },
  { name: '新年好片段2', sequence: ['1', '3', '5', '5', '4', '3', '2'] },
  
  // 茉莉花拆分为多个片段（原11个音）
  { name: '茉莉花片段1', sequence: ['3', '3', '5', '6', "1'", "1'", '6', '5'] },
  { name: '茉莉花片段2', sequence: ['5', '6', '5'] },
  
  // 虫儿飞拆分为多个片段（原15个音）
  { name: '虫儿飞片段1', sequence: ['3', '3', '3', '4', '5', '3', '2', '1'] },
  { name: '虫儿飞片段2', sequence: ['1', '1', '2', '3', '3', '6', '5'] },
  
  // 春天在哪里拆分为多个片段（原14个音）
  { name: '春天在哪里片段1', sequence: ['1', '1', '5', '5', '6', '6', '5'] },
  { name: '春天在哪里片段2', sequence: ['4', '4', '3', '3', '2', '2', '1'] },
  
  // 世上只有妈妈好拆分为多个片段（原15个音）
  { name: '世上只有妈妈好片段1', sequence: ['6', '5', '3', '5', '6', "1'", '6', '5'] },
  { name: '世上只有妈妈好片段2', sequence: ['3', '2', '1', '2', '3', '5', '6'] },
  
  // 让我们荡起双桨拆分为多个片段（原15个音）
  { name: '让我们荡起双桨片段1', sequence: ['1', '2', '3', '5', '5', '6', "1'", '6'] },
  { name: '让我们荡起双桨片段2', sequence: ['5', '3', '2', '1', '2', '3', '5'] },
  
  // 采蘑菇的小姑娘拆分为多个片段（原17个音）
  { name: '采蘑菇的小姑娘片段1', sequence: ['3', '3', '3', '2', '3', '5', '6', '5'] },
  { name: '采蘑菇的小姑娘片段2', sequence: ['3', '2', '1', '2', '3', '5', '3', '2'] },
  { name: '采蘑菇的小姑娘片段3', sequence: ['1'] },
  
  // 卖报歌拆分为多个片段（原15个音）
  { name: '卖报歌片段1', sequence: ['5', '5', '5', '5', '3', '5', '6', '5'] },
  { name: '卖报歌片段2', sequence: ['3', '2', '1', '2', '3', '5', '5'] },
  
  // 小燕子拆分为多个片段（原15个音）
  { name: '小燕子片段1', sequence: ['3', '5', '6', "1'", '6', '5', '3', '5'] },
  { name: '小燕子片段2', sequence: ['6', "1'", '6', '5', '3', '2', '1'] },
  
  // 拔萝卜拆分为多个片段（原17个音）
  { name: '拔萝卜片段1', sequence: ['1', '1', '1', '2', '3', '3', '3', '2'] },
  { name: '拔萝卜片段2', sequence: ['1', '2', '3', '5', '5', '4', '3', '2'] },
  { name: '拔萝卜片段3', sequence: ['1'] },
  
  // 数鸭子拆分为多个片段（原16个音）
  { name: '数鸭子片段1', sequence: ['2', '2', '2', '3', '5', '5', '5', '3'] },
  { name: '数鸭子片段2', sequence: ['2', '1', '2', '3', '5', '3', '2', '1'] },
  
  // 小兔子乖乖拆分为多个片段（原14个音）
  { name: '小兔子乖乖片段1', sequence: ['1', '2', '3', '1', '1', '2', '3', '1'] },
  { name: '小兔子乖乖片段2', sequence: ['3', '4', '5', '3', '4', '5'] },
  
  // 找朋友拆分为多个片段（原13个音）
  { name: '找朋友片段1', sequence: ['5', '6', '5', '4', '3', '4', '5', '2'] },
  { name: '找朋友片段2', sequence: ['3', '4', '3', '4', '5'] },
  
  // 小毛驴拆分为多个片段（原15个音）
  { name: '小毛驴片段1', sequence: ['5', '5', '5', '5', '3', '5', '6', '5'] },
  { name: '小毛驴片段2', sequence: ['3', '2', '1', '2', '3', '5', '5'] },
  
  // 我是一个粉刷匠拆分为多个片段（原24个音）
  { name: '我是一个粉刷匠片段1', sequence: ['5', '3', '5', '3', '5', '3', '1', '2'] },
  { name: '我是一个粉刷匠片段2', sequence: ['4', '3', '2', '5'] },
  { name: '我是一个粉刷匠片段3', sequence: ['5', '3', '5', '3', '5', '3', '1', '2'] },
  { name: '我是一个粉刷匠片段4', sequence: ['4', '3', '2', '1'] },
  
  // 小螺号拆分为多个片段（原16个音）
  { name: '小螺号片段1', sequence: ['5', '5', '5', '6', "1'", '6', '5', '3'] },
  { name: '小螺号片段2', sequence: ['5', '6', "1'", '6', '5', '3', '2', '1'] },
  
  // 小白船拆分为多个片段（原16个音）
  { name: '小白船片段1', sequence: ['3', '3', '3', '4', '5', '5', '5', '4'] },
  { name: '小白船片段2', sequence: ['3', '2', '1', '2', '3', '3', '2', '1'] },
  
  // 小松树拆分为多个片段（原14个音）
  { name: '小松树片段1', sequence: ['1', '1', '5', '5', '6', '6', '5'] },
  { name: '小松树片段2', sequence: ['4', '4', '3', '3', '2', '2', '1'] },
  
  // 小星星（完整版）拆分为多个片段
  { name: '小星星片段1', sequence: ['1', '1', '5', '5', '6', '6', '5'] },
  { name: '小星星片段2', sequence: ['4', '4', '3', '3', '2', '2', '1'] },
  { name: '小星星片段3', sequence: ['5', '5', '4', '4', '3', '3', '2'] },
  { name: '小星星片段4', sequence: ['5', '5', '4', '4', '3', '3', '2'] },
  { name: '小星星片段5', sequence: ['1', '1', '5', '5', '6', '6', '5'] },
  { name: '小星星片段6', sequence: ['4', '4', '3', '3', '2', '2', '1'] },
  // 玛丽有只小羊羔拆分为多个片段
  { name: '玛丽有只小羊羔片段1', sequence: ['3', '2', '1', '2', '3', '3', '3'] },
  { name: '玛丽有只小羊羔片段2', sequence: ['2', '2', '2', '3', '5', '5', '3'] },
  { name: '玛丽有只小羊羔片段3', sequence: ['2', '1', '2', '3', '3', '3', '2'] },
  { name: '玛丽有只小羊羔片段4', sequence: ['2', '3', '2', '1'] },
  // 划船歌拆分为多个片段
  { name: '划船歌片段1', sequence: ['1', '2', '3', '4', '5', '6', '7', "1'"] },
  { name: '划船歌片段2', sequence: ["1'", '7', '6', '5', '4', '3', '2', '1'] },
  // Do Re Mi拆分为多个片段
  { name: 'Do Re Mi片段1', sequence: ['1', '2', '3', '4', '5', '6', '7', "1'"] },
  { name: 'Do Re Mi片段2', sequence: ["1'", '7', '6', '5', '4', '3', '2', '1'] },
  { name: 'Do Re Mi片段3', sequence: ['0', '1', '2', '3', '4', '5', '6', '7'] },
  { name: 'Do Re Mi片段4', sequence: ["1'"] },
  // 小星星（带休止）拆分为多个片段（原15个音）
  { name: '小星星（带休止）片段1', sequence: ['1', '1', '5', '5', '6', '6', '5', '0'] },
  { name: '小星星（带休止）片段2', sequence: ['4', '4', '3', '3', '2', '2', '1'] },
  // 两只老虎（带持续音）拆分为多个片段
  { name: '两只老虎（带持续音）片段1', sequence: ['1', '2', '3', '1', '-', '-'] },
  { name: '两只老虎（带持续音）片段2', sequence: ['1', '2', '3', '1', '-', '-'] },
  { name: '两只老虎（带持续音）片段3', sequence: ['3', '4', '5', '-'] },
  { name: '两只老虎（带持续音）片段4', sequence: ['3', '4', '5', '-'] },
  // 欢乐颂（带休止）拆分为多个片段（原16个音）
  { name: '欢乐颂（带休止）片段1', sequence: ['3', '3', '4', '5', '5', '4', '3', '2'] },
  { name: '欢乐颂（带休止）片段2', sequence: ['1', '1', '2', '3', '0', '3', '2', '2'] },
  
  // 茉莉花（带持续音）拆分为多个片段（原14个音）
  { name: '茉莉花（带持续音）片段1', sequence: ['3', '3', '5', '6', "1'", "1'", '-', '6'] },
  { name: '茉莉花（带持续音）片段2', sequence: ['5', '5', '6', '5', '-', '-'] },
  // 送别（完整版）拆分为多个片段
  { name: '送别片段1', sequence: ['5', '3', '5', "1'", '6', "1'", '5', '-'] },
  { name: '送别片段2', sequence: ['3', '5', '5', '3', '2', '1', '2', '3'] },
  { name: '送别片段3', sequence: ['5', '3', '2', '1'] },
  // 虫儿飞（带休止）拆分为多个片段（原16个音）
  { name: '虫儿飞（带休止）片段1', sequence: ['3', '3', '3', '4', '5', '3', '2', '1'] },
  { name: '虫儿飞（带休止）片段2', sequence: ['0', '1', '1', '2', '3', '3', '6', '5'] },
  
  // 兰花草（带持续音）拆分为多个片段（原11个音）
  { name: '兰花草（带持续音）片段1', sequence: ['6', '6', '6', '5', '6', "1'", '-', '5'] },
  { name: '兰花草（带持续音）片段2', sequence: ['3', '-', '-'] },
  // 春天在哪里（带休止）拆分为多个片段
  { name: '春天在哪里（带休止）片段1', sequence: ['1', '1', '5', '5', '6', '6', '5'] },
  { name: '春天在哪里（带休止）片段2', sequence: ['4', '4', '3', '3', '2', '2', '1'] },
  { name: '春天在哪里（带休止）片段3', sequence: ['0', '5', '5', '4', '4', '3', '3', '2'] },
  
  // 世上只有妈妈好（带持续音）拆分为多个片段（原17个音）
  { name: '世上只有妈妈好（带持续音）片段1', sequence: ['6', '5', '3', '5', '6', "1'", '-', '6'] },
  { name: '世上只有妈妈好（带持续音）片段2', sequence: ['5', '3', '2', '1', '2', '3', '5', '6'] },
  { name: '世上只有妈妈好（带持续音）片段3', sequence: ['-'] },
  
  // 让我们荡起双桨（带休止）拆分为多个片段
  { name: '让我们荡起双桨（带休止）片段1', sequence: ['1', '2', '3', '5', '5', '6', "1'", '6'] },
  { name: '让我们荡起双桨（带休止）片段2', sequence: ['5', '3', '2', '1', '0', '2', '3', '5'] },
  { name: '让我们荡起双桨（带休止）片段3', sequence: ['5', '6', "1'", '6', '5'] },
  
  // 采蘑菇的小姑娘（带休止）拆分为多个片段
  { name: '采蘑菇的小姑娘（带休止）片段1', sequence: ['3', '3', '3', '2', '3', '5', '6', '5'] },
  { name: '采蘑菇的小姑娘（带休止）片段2', sequence: ['3', '2', '1', '0', '2', '3', '5', '3'] },
  { name: '采蘑菇的小姑娘（带休止）片段3', sequence: ['2', '1', '-', '-'] },
  
  // 卖报歌（带休止）拆分为多个片段
  { name: '卖报歌（带休止）片段1', sequence: ['5', '5', '5', '5', '3', '5', '6', '5'] },
  { name: '卖报歌（带休止）片段2', sequence: ['3', '2', '1', '2', '3', '5', '5', '0'] },
  { name: '卖报歌（带休止）片段3', sequence: ['5', '5', '5', '5', '3', '5', '6', '5'] },

];

// 关卡配置
export const LEVELS = [
  {
    id: 0,
    name: '高低音辨别',
    subtitle: 'Pitch Comparison',
    description: '依次听两个音，判断哪个更高',
    introText: '欢迎！依次听两个音，判断第一个音更高还是第二个音更高。',
    mode: 'pitch_compare',
    hasReferenceToggle: false,
    noteSet: 'none',
    totalRounds: 10,
    pointsPerQuestion: 10
  },
  {
    id: 1,
    name: 'C大调 (白键)',
    subtitle: 'C Major',
    description: '听参考音 Do，辨认随机播放的白键音符',
    introText: '欢迎！请先听参考音 (Do)，然后辨认播放的音符。',
    mode: 'single',
    hasReferenceToggle: true,
    noteSet: 'white_no_do', // Do~High Do, 8个
    totalRounds: 10,
    pointsPerQuestion: 10
  },
  {
    id: 2,
    name: '双音序列',
    subtitle: 'Two-Note Sequence',
    description: '听参考音 Do，然后依次辨认两个音符',
    introText: '欢迎！请先听参考音 (Do)，然后依次辨认播放的两个音符。',
    mode: 'sequence',
    sequenceLength: 2,
    hasReferenceToggle: true,
    noteSet: 'white_no_do', // Do~High Do, 8个
    totalRounds: 10,
    pointsPerQuestion: 10,
    scoringRule: 'partial' // 两个都对10分，对一个5分，都错0分
  },
  {
    id: 3,
    name: '三音序列',
    subtitle: 'Three-Note Sequence',
    description: '听参考音 Do，然后依次辨认三个音符',
    introText: '欢迎！请先听参考音 (Do)，然后依次辨认播放的三个音符。',
    mode: 'sequence',
    sequenceLength: 3,
    hasReferenceToggle: true,
    noteSet: 'white_no_do', // Do~High Do, 8个
    totalRounds: 10,
    pointsPerQuestion: 10,
    scoringRule: 'proportional' // 全对10分，对2个约6.67分，对1个约3.33分
  },
  {
    id: 9,
    name: '短旋律听写',
    subtitle: 'Short Melodic Dictation',
    description: '听参考音 Do，然后辨认一段简短的流行歌曲旋律（8个音及以下）',
    introText: '欢迎！请先听参考音 (Do)，然后辨认播放的旋律片段。',
    mode: 'melody',
    melodyType: 'short',
    hasReferenceToggle: true,
    defaultSkipReference: true, // 默认不播放参考音
    noteSet: 'white_no_do', // Do~High Do, 8个
    totalRounds: 10,
    pointsPerQuestion: 10,
    scoringRule: 'proportional'
  },
  {
    id: 4,
    name: '半音阶',
    subtitle: 'Chromatic',
    description: '听参考音 Do，辨认包含黑键的半音阶音符',
    introText: '欢迎！请先听参考音 (Do)，然后辨认播放的音符（包含黑键）。',
    mode: 'single',
    hasReferenceToggle: true,
    noteSet: 'chromatic_no_low_do', // 含低音Do和High Do，共13个
    totalRounds: 10,
    pointsPerQuestion: 10,
    blackKeyProbability: 0.7 // 70% 黑键
  },
  {
    id: 5,
    name: '变化参考音',
    subtitle: 'Variable Reference',
    description: '参考音不再是固定的 Do，可能是任意音',
    introText: '欢迎！参考音不再是固定的 Do，系统会告知参考音的唱名，请根据参考音辨认目标音。',
    mode: 'single',
    hasReferenceToggle: false, // Level 5 不提供参考音开关
    noteSet: 'chromatic_no_low_do',
    totalRounds: 10,
    pointsPerQuestion: 10,
    blackKeyProbability: 0.7
  },
  {
    id: 6,
    name: '半音阶双音',
    subtitle: 'Chromatic 2-Note',
    description: '听参考音 Do，依次辨认两个半音阶音符',
    introText: '欢迎！请先听参考音 (Do)，然后依次辨认播放的两个音符（包含黑键）。',
    mode: 'sequence',
    sequenceLength: 2,
    hasReferenceToggle: true,
    noteSet: 'chromatic_no_low_do',
    totalRounds: 10,
    pointsPerQuestion: 10,
    blackKeyProbability: 0.7,
    scoringRule: 'partial'
  },
  {
    id: 7,
    name: '半音阶三音',
    subtitle: 'Chromatic 3-Note',
    description: '听参考音 Do，依次辨认三个半音阶音符',
    introText: '欢迎！请先听参考音 (Do)，然后依次辨认播放的三个音符（包含黑键）。',
    mode: 'sequence',
    sequenceLength: 3,
    hasReferenceToggle: true,
    noteSet: 'chromatic_no_low_do',
    totalRounds: 10,
    pointsPerQuestion: 10,
    blackKeyProbability: 0.7,
    scoringRule: 'proportional'
  },
  {
    id: 8,
    name: '移动调',
    subtitle: 'Movable Do',
    description: '参考音 Do 的音高会变化，需要根据相对音高判断',
    introText: '欢迎！参考音 Do 的音高会随机变化，请忽略绝对音高，根据相对音高辨认目标音。',
    mode: 'single',
    hasReferenceToggle: false, // Level 8 不提供参考音开关
    noteSet: 'chromatic_no_low_do',
    totalRounds: 10,
    pointsPerQuestion: 10,
    blackKeyProbability: 0.7
  }
];

// 获取关卡配置
export function getLevelConfig(levelId) {
  return LEVELS.find(l => l.id === levelId);
}

// 根据关卡配置获取音符选项
export function getNotesForLevel(levelId) {
  const level = getLevelConfig(levelId);
  if (!level) return [];
  
  switch (level.noteSet) {
    case 'white_no_do':
      // Do~High Do (含低音Do和High Do)
      return notesConfig.filter(n => n.type === 'white');
    
    case 'chromatic_no_low_do':
      // 含低音Do和High Do，共13个
      return notesConfig;
    
    case 'none':
    default:
      return [];
  }
}

// 获取白键音符列表（用于 Level 5 的参考音选择）
export function getWhiteKeyNotes() {
  return notesConfig.filter(n => n.type === 'white' && n.val !== "1'");
}

// 计分函数
export function calculateScore(levelId, userAnswer, targetAnswer, userSequence = null, targetSequence = null) {
  const level = getLevelConfig(levelId);
  if (!level) return 0;
  
  if (level.mode === 'sequence' || level.mode === 'melody') {
    // 序列模式
    if (!userSequence || !targetSequence) return 0;
    
    // 过滤掉休止符和持续音，只比较需要用户选择的音符
    // 用户序列中不应该有休止符和持续音（因为按钮已被移除），但为了安全起见也过滤一下
    const targetFiltered = targetSequence.filter(n => n !== '0' && n !== '-');
    const userFiltered = userSequence.filter(n => n !== '0' && n !== '-');
    
    // 如果用户选择的音符数量不对，返回0分
    if (userFiltered.length !== targetFiltered.length) return 0;
    
    if (level.scoringRule === 'partial') {
      // Level 2: 两个都对10分，对一个5分，都错0分
      const correctCount = userFiltered.filter((val, idx) => val === targetFiltered[idx]).length;
      const expectedLength = targetFiltered.length; // 使用过滤后的长度
      if (correctCount === expectedLength) return 10;
      if (correctCount === 1) return 5;
      return 0;
    } else if (level.scoringRule === 'proportional') {
      // Level 3/9: 按比例计分（排除休止符）
      const correctCount = userFiltered.filter((val, idx) => val === targetFiltered[idx]).length;
      const total = targetFiltered.length; // 使用过滤后的长度（排除休止符）
      return Math.round((correctCount / total) * 10 * 100) / 100; // 保留两位小数
    }
  } else {
    // 单音模式
    return userAnswer === targetAnswer ? level.pointsPerQuestion : 0;
  }
  
  return 0;
}