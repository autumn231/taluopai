import type { SpreadDefinition, SpreadType } from '@/types';

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
    description: '时间之流 · 过去/现在/未来',
    longDescription: '经典三张牌阵，揭示事物发展的三个阶段。洞察过去根源、理解当下处境、预见未来走向。',
    cardCount: 3,
    positions: [
      {
        index: 0,
        name: '过去',
        meaning: 'The Past',
        description: '影响当前局面的过往因素',
      },
      {
        index: 1,
        name: '现在',
        meaning: 'The Present',
        description: '你当下所处的核心能量',
      },
      {
        index: 2,
        name: '未来',
        meaning: 'The Future',
        description: '若沿此路径发展的可能走向',
      },
    ],
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
