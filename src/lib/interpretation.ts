/**
 * 塔罗解读引擎 —— 用本地规则模拟塔罗师的解读逻辑
 *
 * 提供 3 个核心能力（无需后端 AI）：
 *  1. analyzeSynergy       牌与牌的能量关系（元素尊严、格局）
 *  2. generateDirectAnswer 对问题给出"倾向是 / 倾向否 / 中立"的直接回应
 *  3. generateActionPlan   个性化行动方案（行动 / 留意 / 时机）
 */

import type { DrawnCard, TarotCard, Element, SpreadType } from '@/types';
import type { QuestionTheme } from '@/data/questionThemes';

// === 元素映射 ===
export const ELEMENT_CN: Record<Element, string> = {
  spirit: '灵',
  fire: '火',
  water: '水',
  air: '风',
  earth: '土',
};

const ELEMENT_TRAIT: Record<Element, string> = {
  spirit: '觉知与超越',
  fire: '行动与热情',
  water: '情感与直觉',
  air: '思考与沟通',
  earth: '稳定与物质',
};

const ELEMENT_COLOR: Record<Element, string> = {
  spirit: 'text-mystic-lightgold',
  fire: 'text-rose-300',
  water: 'text-sky-300',
  air: 'text-violet-300',
  earth: 'text-emerald-300',
};

type DignityRelation = 'amplify' | 'support' | 'neutral' | 'conflict';

const DIGNITY_LABEL: Record<DignityRelation, string> = {
  amplify: '同频共振',
  support: '相生助力',
  neutral: '中性并存',
  conflict: '相克张力',
};

const DIGNITY_HINT: Record<DignityRelation, string> = {
  amplify: '同元素叠加，能量被显著放大',
  support: '元素相生，彼此顺畅呼应',
  neutral: '元素互不干扰，各自独立运作',
  conflict: '元素相克，存在张力需要调和',
};

function getDignity(a: Element, b: Element): DignityRelation {
  if (a === b) return 'amplify';
  if (a === 'spirit' || b === 'spirit') return 'support';
  const friendly: Array<[Element, Element]> = [
    ['fire', 'air'],
    ['water', 'earth'],
  ];
  const hostile: Array<[Element, Element]> = [
    ['fire', 'water'],
    ['air', 'earth'],
  ];
  const match = (list: Array<[Element, Element]>) =>
    list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  if (match(friendly)) return 'support';
  if (match(hostile)) return 'conflict';
  return 'neutral';
}

function isCourtCard(card: TarotCard): boolean {
  return card.arcana === 'minor' && !!card.number && card.number >= 11;
}

/** 牌的极性：正位为正，逆位为负；大阿尔卡那权重更高 */
function cardPolarity(c: DrawnCard): number {
  const weight = c.card.arcana === 'major' ? 2 : 1;
  return c.reversed ? -weight : weight;
}

function readingOf(c: DrawnCard) {
  return c.reversed ? c.card.reversed : c.card.upright;
}

function nameOf(c: DrawnCard): string {
  return `${c.card.name.cn}${c.reversed ? '（逆）' : '（正）'}`;
}

// === 1. 牌阵能量关系分析 ===
export interface DignityPair {
  aName: string;
  bName: string;
  relation: DignityRelation;
  label: string;
  hint: string;
}

export interface SynergyReport {
  dominantElement: Element | null;
  elementalBalance: { element: Element; count: number; pct: number }[];
  majorArcanaCount: number;
  majorArcanaRatio: number;
  reversedCount: number;
  reversedRatio: number;
  courtCount: number;
  courtNames: string[];
  dignities: DignityPair[];
  pattern: string;
  patternHint: string;
  summary: string;
}

export function analyzeSynergy(cards: DrawnCard[]): SynergyReport {
  const total = cards.length || 1;

  // 元素统计
  const elCount: Record<string, number> = {};
  cards.forEach((c) => {
    const e = c.card.element || 'spirit';
    elCount[e] = (elCount[e] || 0) + 1;
  });
  const elementalBalance = (Object.keys(elCount) as Element[])
    .map((element) => ({
      element,
      count: elCount[element],
      pct: Math.round((elCount[element] / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
  const dominantElement = elementalBalance[0]?.element ?? null;

  // 大阿尔卡那
  const majorArcanaCount = cards.filter((c) => c.card.arcana === 'major').length;
  const majorArcanaRatio = majorArcanaCount / total;

  // 逆位
  const reversedCount = cards.filter((c) => c.reversed).length;
  const reversedRatio = reversedCount / total;

  // 宫廷牌
  const courtCards = cards.filter((c) => isCourtCard(c.card));
  const courtCount = courtCards.length;
  const courtNames = courtCards.map((c) => c.card.name.cn);

  // 相邻牌的元素尊严（仅多张牌时）
  const dignities: DignityPair[] = [];
  for (let i = 0; i < cards.length - 1; i++) {
    const a = cards[i].card.element || 'spirit';
    const b = cards[i + 1].card.element || 'spirit';
    const relation = getDignity(a, b);
    dignities.push({
      aName: cards[i].card.name.cn,
      bName: cards[i + 1].card.name.cn,
      relation,
      label: DIGNITY_LABEL[relation],
      hint: DIGNITY_HINT[relation],
    });
  }

  // 整体格局判定
  let pattern = '';
  let patternHint = '';
  if (majorArcanaRatio >= 0.5) {
    pattern = '大阿尔卡那主导';
    patternHint = '此刻你正处在人生的关键转折点，发生的事具有长远影响，并非日常琐事。';
  } else if (majorArcanaCount === 0) {
    pattern = '小阿尔卡那主导';
    patternHint = '当下的能量偏向日常事务与具体行动，是可调控、可落地的层面。';
  } else {
    pattern = '大小阿尔卡那交织';
    patternHint = '既有大方向的暗流，也有日常行动的呼应——内在功课与现实调整需同步进行。';
  }

  const courtExtra =
    courtCount >= 2
      ? `宫廷牌出现 ${courtCount} 张（${courtNames.join('、')}），提示这段局面中「人」的因素很关键。`
      : '';

  const summary = [
    dominantElement
      ? `主调能量为${ELEMENT_CN[dominantElement]}（${ELEMENT_TRAIT[dominantElement]}）。`
      : '',
    `${reversedCount === 0 ? '全部正位' : reversedCount === total ? '全部逆位' : `逆位 ${reversedCount}/${total}`}，`,
    majorArcanaRatio >= 0.5 ? '关键转折能量强。' : '日常流动能量为主。',
    courtExtra,
  ]
    .filter(Boolean)
    .join('');

  return {
    dominantElement,
    elementalBalance,
    majorArcanaCount,
    majorArcanaRatio,
    reversedCount,
    reversedRatio,
    courtCount,
    courtNames,
    dignities,
    pattern,
    patternHint,
    summary,
  };
}

// === 2. 直接回答 ===
export type Verdict = 'positive' | 'cautious' | 'neutral';

export interface DirectAnswer {
  verdict: Verdict;
  verdictLabel: string;
  /** 0-100 的能量分值，用于仪表盘 */
  score: number;
  headline: string;
  reasoning: string;
}

/** 取结果位牌：单张=0，三张=最后一张（果/未来），凯尔特=最终结果(9) */
function outcomeCard(cards: DrawnCard[], spreadType: SpreadType): DrawnCard {
  if (cards.length === 0) return cards[0]; // 防御：空数组返回 undefined 由调用方守卫
  if (spreadType === 'single') return cards[0];
  if (spreadType === 'three') return cards[cards.length - 1];
  return cards[Math.min(9, cards.length - 1)];
}

export function generateDirectAnswer(
  question: string,
  cards: DrawnCard[],
  theme: QuestionTheme,
  spreadType: SpreadType,
): DirectAnswer {
  const total = cards.length || 1;
  // 极性得分：所有牌的极性之和，归一化到 -100..100
  const rawScore = cards.reduce((sum, c) => sum + cardPolarity(c), 0);
  const maxAbs = cards.reduce(
    (sum, c) => sum + (c.card.arcana === 'major' ? 2 : 1),
    0,
  ) || 1;
  let score = Math.round((rawScore / maxAbs) * 100);

  // 结果位牌是关键信号，加权
  const outcome = outcomeCard(cards, spreadType);
  const outcomePolarity = cardPolarity(outcome);
  score = Math.round(score * 0.6 + (outcomePolarity > 0 ? 40 : outcomePolarity < 0 ? -40 : 0) * 0.4);
  score = Math.max(-100, Math.min(100, score));

  // 判定
  let verdict: Verdict;
  if (score >= 25) verdict = 'positive';
  else if (score <= -25) verdict = 'cautious';
  else verdict = 'neutral';

  const verdictLabel =
    verdict === 'positive' ? '倾向明朗' : verdict === 'cautious' ? '需谨慎' : '能量待定';

  const outcomeR = readingOf(outcome);
  const dim = theme.primaryDimension;

  const headline =
    verdict === 'positive'
      ? `牌面整体回应是肯定的——${outcomeR[dim]}`
      : verdict === 'cautious'
        ? `牌面提示需要先停下来看清——${outcomeR[dim]}`
        : `此刻的能量尚未明朗，答案不在「是与否」，而在你怎么走——${outcomeR[dim]}`;

  // 推理
  const reasons: string[] = [];
  if (question) {
    reasons.push(`你问的是「${question}」，牌面给出如下回应。`);
  }
  const reversedCount = cards.filter((c) => c.reversed).length;
  if (reversedCount === 0) {
    reasons.push(`${total} 张牌全部正位，能量顺畅没有遮掩。`);
  } else if (reversedCount === total) {
    reasons.push(`${total} 张牌全部逆位，外在的转向需先从内在功课开始。`);
  } else if (reversedCount > total / 2) {
    reasons.push(`逆位占多数（${reversedCount}/${total}），整体偏向内省与调整。`);
  } else {
    reasons.push(`正位主导，逆位牌精准指出需要留意的暗面。`);
  }
  reasons.push(
    `结果位「${nameOf(outcome)}」是这次占卜的核心信号，它直接回应了你的问题。`,
  );
  if (outcomeR.warning) {
    reasons.push(`它特别提醒：${outcomeR.warning}`);
  }

  return {
    verdict,
    verdictLabel,
    score,
    headline,
    reasoning: reasons.join(''),
  };
}

// === 3. 行动方案 ===
export interface ActionItem {
  kind: 'advice' | 'warning' | 'timing' | 'theme';
  title: string;
  detail: string;
  source: string;
}

export function generateActionPlan(cards: DrawnCard[], theme: QuestionTheme): ActionItem[] {
  const items: ActionItem[] = [];
  const outcome = outcomeCard(cards, cards.length === 1 ? 'single' : cards.length === 3 ? 'three' : 'celtic');
  const outcomeR = readingOf(outcome);

  // 行动指引：优先结果位牌的 advice
  if (outcomeR.advice) {
    items.push({
      kind: 'advice',
      title: '此刻最该做的',
      detail: outcomeR.advice,
      source: `${outcome.card.name.cn}（结果位）`,
    });
  } else if (theme.advice) {
    items.push({
      kind: 'theme',
      title: '此刻最该做的',
      detail: theme.advice,
      source: `${theme.label}主题`,
    });
  }

  // 留意事项：找一张带 warning 的牌
  const warningCard = cards.find((c) => readingOf(c).warning);
  if (warningCard) {
    items.push({
      kind: 'warning',
      title: '需要留意的暗面',
      detail: readingOf(warningCard).warning!,
      source: warningCard.card.name.cn,
    });
  } else if (theme.caution) {
    items.push({
      kind: 'warning',
      title: '需要留意的暗面',
      detail: theme.caution,
      source: `${theme.label}主题`,
    });
  }

  // 时机提示
  const timingCard = cards.find((c) => readingOf(c).timing);
  if (timingCard) {
    items.push({
      kind: 'timing',
      title: '时机提示',
      detail: readingOf(timingCard).timing!,
      source: timingCard.card.name.cn,
    });
  }

  // 若建议少于 3 条，用主题级补充
  if (items.length < 3 && theme.guidance) {
    items.push({
      kind: 'theme',
      title: '塔罗师的叮嘱',
      detail: theme.guidance,
      source: `${theme.label}主题`,
    });
  }

  return items.slice(0, 3);
}

export { ELEMENT_TRAIT, ELEMENT_COLOR };
