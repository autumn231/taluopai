import type { SpreadDefinition, SpreadType, SpreadPosition } from '@/types';
import type { ThreeMode } from './questionThemes';

const THREE_POSITIONS: Record<ThreeMode, SpreadPosition[]> = {
  /** 时间之流：过去 / 当下 / 未来 */
  time: [
    { index: 0, name: '过去', meaning: 'The Past', description: '影响当前局面的过往因素' },
    { index: 1, name: '现在', meaning: 'The Present', description: '你当下所处的核心能量' },
    { index: 2, name: '未来', meaning: 'The Future', description: '若沿此路径发展的可能走向' },
  ],
  /** 心·行·果：心态 / 行动 / 结果 */
  mind: [
    { index: 0, name: '心', meaning: 'The Heart', description: '你此刻内在的真实心态' },
    { index: 1, name: '行', meaning: 'The Action', description: '你当下可以采取的具体行动' },
    { index: 2, name: '果', meaning: 'The Outcome', description: '这份行动可能带来的结果' },
  ],
  /** 自由三牌：凭直觉整体感知 */
  free: [
    { index: 0, name: '第一张', meaning: 'The First Whisper', description: '牌阵想让你先看见的一面' },
    { index: 1, name: '第二张', meaning: 'The Second Whisper', description: '牌阵想让你停留在此刻的一面' },
    { index: 2, name: '第三张', meaning: 'The Third Whisper', description: '牌阵想让你望向前方的一面' },
  ],
};

export const THREE_MODES: Record<ThreeMode, { id: ThreeMode; name: string; desc: string }> = {
  time: { id: 'time', name: '时间之流', desc: '过去 / 当下 / 未来' },
  mind: { id: 'mind', name: '心·行·果', desc: '心态 / 行动 / 结果' },
  free: { id: 'free', name: '自由三牌', desc: '凭直觉整体感知' },
};

export const SPREADS: Record<SpreadType, SpreadDefinition> = {
  single: {
    type: 'single',
    name: '单张牌阵',
    description: '一日指引 · 一日能量',
    longDescription: '从 78 张中随机抽取 1 张，作为此刻的灵魂指引。简单而直接，适合日常快速问询。',
    cardCount: 1,
    positions: [
      {
        index: 0,
        name: '核心指引',
        meaning: 'The Core Guidance',
        description: '此刻宇宙要告诉你的核心信息',
      },
    ],
  },
  three: {
    type: 'three',
    name: '三张牌阵',
    description: '三扇窗口 · 看见更完整的答案',
    longDescription: '经典三张牌阵，揭示事物的三个切面。可选"时间之流"、"心·行·果"或"自由三牌"三种解读模式。',
    cardCount: 3,
    /** 默认使用时间之流 - 实际位置由 getSpreadPositions 决定 */
    positions: THREE_POSITIONS.time,
  },
  celtic: {
    type: 'celtic',
    name: '凯尔特十字',
    description: '深度剖析 · 十面人生',
    longDescription: '塔罗史上最为经典复杂的牌阵，十张牌层层剖析问题本质，涵盖内外因、潜意识、希望与恐惧、最终结果，是深层占卜的不二之选。',
    cardCount: 10,
    positions: [
      { index: 0, name: '当下状况', meaning: 'Present Situation', description: '询问者目前的核心状态', gridArea: '4 / 2 / 5 / 3' },
      { index: 1, name: '挑战障碍', meaning: 'The Challenge', description: '横亘在前的主要障碍', gridArea: '4 / 2 / 5 / 3' },
      { index: 2, name: '意识层面', meaning: 'Conscious', description: '询问者所能意识到的根基', gridArea: '3 / 2 / 4 / 3' },
      { index: 3, name: '潜意识', meaning: 'Subconscious', description: '潜藏于深处的根源', gridArea: '5 / 2 / 6 / 3' },
      { index: 4, name: '过去', meaning: 'The Past', description: '即将离去的影响', gridArea: '4 / 1 / 5 / 2' },
      { index: 5, name: '未来', meaning: 'Near Future', description: '即将到来的发展', gridArea: '4 / 3 / 5 / 4' },
      { index: 6, name: '自我', meaning: 'The Self', description: '询问者的内在状态', gridArea: '1 / 1 / 2 / 2' },
      { index: 7, name: '环境', meaning: 'Environment', description: '外部环境与他人影响', gridArea: '2 / 1 / 3 / 2' },
      { index: 8, name: '希望与恐惧', meaning: 'Hopes & Fears', description: '询问者的内心期待与担忧', gridArea: '1 / 2 / 2 / 3' },
      { index: 9, name: '最终结果', meaning: 'Final Outcome', description: '若沿此路径的最终走向', gridArea: '1 / 3 / 6 / 4' },
    ],
  },
};

export const getSpread = (type: SpreadType): SpreadDefinition => SPREADS[type];

/**
 * 三张牌阵的位置根据 threeMode 动态返回
 */
export function getSpreadPositions(type: SpreadType, threeMode: ThreeMode = 'time'): SpreadPosition[] {
  if (type === 'three') return THREE_POSITIONS[threeMode];
  return SPREADS[type].positions;
}
