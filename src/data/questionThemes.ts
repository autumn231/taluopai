// 主题配置 - 每种问题都有专属的解读风格

export type QuestionThemeKey =
  | 'love'
  | 'career'
  | 'wealth'
  | 'study'
  | 'people'
  | 'self'
  | 'open';

export type CardDimension = 'love' | 'career' | 'wealth' | 'general';

export interface QuestionTheme {
  key: QuestionThemeKey;
  label: string;
  /** 主题主色（金/玫瑰/紫/蓝/翠/紫红） */
  accent: string;
  /** 主题匹配关键词（用于从问题文本中识别） */
  keywords: string[];
  /** 抽到这张卡时优先展示的维度 */
  primaryDimension: CardDimension;
  /** 抽到这张卡时次要展示的维度 */
  secondaryDimension: CardDimension;
  /** 主题级开场白 — 回应用户所问 */
  intro: string;
  /** 主题级核心指引 — 出现在综合解读开头 */
  guidance: string;
  /** 主题级行动建议 */
  advice: string;
  /** 主题级提醒/警告 */
  caution: string;
  /** 主题级收束祝福 */
  closing: string;
  /** 牌阵位置的特殊关注提示（按 spreadType） */
  positionFocus: {
    single: string;
    three: { past: string; present: string; future: string };
    celtic: { future: string; self: string; outcome: string };
  };
}

export const QUESTION_THEMES: Record<QuestionThemeKey, QuestionTheme> = {
  love: {
    key: 'love',
    label: '感情',
    accent: 'rose',
    keywords: ['感情', '恋爱', '爱情', '喜欢', '他', '她', '伴侣', '对象', '婚姻', '分手', '复合', '桃花', '暗恋', '心动', '前任', '爱人'],
    primaryDimension: 'love',
    secondaryDimension: 'general',
    intro:
      '关于你在感情中提出的疑问，牌面已铺开一段关于"心动—连接—归属"的能量地图。',
    guidance:
      '感情从来不是孤立的事件，而是内在状态的外在显化。牌面提醒你：先看清自己在这段关系中的位置与期待，真相会自然浮现。',
    advice:
      '不要压抑你真实的感受，也无需迎合对方的节奏。把"我需要什么"问清楚，答案会在诚实中显现。',
    caution:
      '避免在情绪最浓烈时做出重大决定——无论是表白、复合还是放手，都请给自己至少一周的缓冲。',
    closing: '愿你在爱中既保持清醒，又保留柔软。',
    positionFocus: {
      single: '这张牌直接呈现关系当下的核心能量。',
      three: {
        past: '过去影响：审视关系中你反复出现的情感模式。',
        present: '当下状态：此刻关系中真实流动的能量。',
        future: '未来走向：若不改变，关系会自然演化的方向。',
      },
      celtic: {
        future: '近未来（卡 6）显示关系将如何演变。',
        self: '自我状态（卡 7）揭示你在关系中真正扮演的角色。',
        outcome: '最终结果（卡 10）是这段关系若沿当前路径的归宿。',
      },
    },
  },
  career: {
    key: 'career',
    label: '事业',
    accent: 'amber',
    keywords: ['工作', '事业', '职业', '升职', '跳槽', '面试', '创业', '项目', '同事', '老板', '求职', '岗位', '团队', 'offer'],
    primaryDimension: 'career',
    secondaryDimension: 'wealth',
    intro:
      '关于你事业道路上的提问，牌面为你勾勒出当下职业能量地图——既有阻碍，也有潜在的突破点。',
    guidance:
      '事业不是孤立的"职位"，而是你与世界交换能量的方式。牌面提示：先认清你真正想创造的价值，路径会自己显现。',
    advice:
      '把注意力从"我能不能得到"转向"我能提供什么"。当你清晰定义了自己的价值，机会反而会向你靠拢。',
    caution:
      '不要在犹豫中错过窗口期——若一个决定你思考超过 60 天仍未行动，意味着你已在拖延而非慎重。',
    closing: '愿你在自己的节奏里，走出属于你的道路。',
    positionFocus: {
      single: '这张牌指出你事业上的核心课题。',
      three: {
        past: '过去影响：检视你过去积累的能力与经验。',
        present: '当下状态：你当前在职场中的真实处境。',
        future: '未来走向：若持续当前模式，6 个月后的事业位置。',
      },
      celtic: {
        future: '近未来（卡 6）显示工作上的转折点。',
        self: '自我状态（卡 7）揭示你对职业的真实期待。',
        outcome: '最终结果（卡 10）是你当前路径的归宿。',
      },
    },
  },
  wealth: {
    key: 'wealth',
    label: '财富',
    accent: 'gold',
    keywords: ['钱', '财', '收入', '工资', '投资', '理财', '股票', '基金', '副业', '生意', '经济', '房贷', '还贷', '存款', '财富'],
    primaryDimension: 'wealth',
    secondaryDimension: 'career',
    intro:
      '关于你财务状况的提问，牌面为你揭示金钱流动的方向——既包括你已拥有的，也包括即将到来的机遇。',
    guidance:
      '财富是能量的镜像：你对金钱的态度，决定了它流向你的方式。牌面提示：检视你对"拥有"与"匮乏"的信念。',
    advice:
      '本月最适合的财务动作是"盘点"而非"扩张"——理清每一笔钱的去向，机会会比盲目投入更清晰。',
    caution:
      '避免在情绪波动时做大额决策（投资、借贷、跳槽到"为了钱"的岗位）。等心静下来再做。',
    closing: '愿你既能理性规划，又对丰盛保持开放。',
    positionFocus: {
      single: '这张牌揭示你财务能量的核心振动。',
      three: {
        past: '过去影响：检视你过去与金钱的关系。',
        present: '当下状态：当前财务的真实图景。',
        future: '未来走向：若维持现状，3 个月后的财务状况。',
      },
      celtic: {
        future: '近未来（卡 6）显示财富的转变时机。',
        self: '自我状态（卡 7）揭示你对金钱的真实态度。',
        outcome: '最终结果（卡 10）是你当前理财路径的终点。',
      },
    },
  },
  study: {
    key: 'study',
    label: '学业',
    accent: 'sky',
    keywords: ['学业', '学习', '考试', '学校', '专业', '论文', '毕业', '考证', '考研', '留学', '课程', '成绩'],
    primaryDimension: 'career',
    secondaryDimension: 'general',
    intro:
      '关于你在学业或自我精进上的提问，牌面为你照亮了学习的能量状态——既包括外部环境，也包括内在节奏。',
    guidance:
      '学习的本质是"自我扩张"，而非"任务完成"。牌面提示：找到你真正想通过学习抵达的地方，比方法更重要。',
    advice:
      '把"我要学完"换成"我想理解什么"。当目标从"完成量"转为"达成理解"，效率会自然提升。',
    caution:
      '避免用战术上的勤奋掩盖战略上的迷茫——若你一直很努力却没进展，请先停下来问"我为什么学这个"。',
    closing: '愿你在学习中既保持专注，也保持对未知的好奇。',
    positionFocus: {
      single: '这张牌揭示你学业上的核心能量。',
      three: {
        past: '过去影响：你过去的学习模式与基础。',
        present: '当下状态：你当前学习的真实状态。',
        future: '未来走向：若维持当前方法，未来的学业成果。',
      },
      celtic: {
        future: '近未来（卡 6）显示学业上的关键节点。',
        self: '自我状态（卡 7）揭示你学习的内在驱动力。',
        outcome: '最终结果（卡 10）是你当前学习路径的归宿。',
      },
    },
  },
  people: {
    key: 'people',
    label: '人际',
    accent: 'violet',
    keywords: ['人际', '朋友', '家人', '父母', '亲子', '家庭', '社交', '关系', '团队', '同事', '同学'],
    primaryDimension: 'love',
    secondaryDimension: 'general',
    intro:
      '关于你与身边人关系的提问，牌面为你呈现了人际互动的能量场——你给予的、接收的、以及被忽略的部分。',
    guidance:
      '关系不是"维持"的，而是"生长"的。牌面提示：先看清你在关系中的真实位置，再决定如何调整。',
    advice:
      '对身边的人多说一句"我看到你了"。无论是家人、朋友还是同事，一句具体的肯定，会比你想象的更深远。',
    caution:
      '避免在关系中承担"拯救者"的角色——你只能陪伴，不能替别人成长。划清边界，反而让关系更健康。',
    closing: '愿你既能温柔待人，也能温柔待己。',
    positionFocus: {
      single: '这张牌揭示你人际关系中的核心课题。',
      three: {
        past: '过去影响：检视你过去的相处模式。',
        present: '当下状态：你当前人际互动的真实状态。',
        future: '未来走向：若不调整，关系会演化的方向。',
      },
      celtic: {
        future: '近未来（卡 6）显示人际关系的转变。',
        self: '自我状态（卡 7）揭示你在关系中的角色。',
        outcome: '最终结果（卡 10）是你当前人际路径的归属。',
      },
    },
  },
  self: {
    key: 'self',
    label: '自我成长',
    accent: 'emerald',
    keywords: ['成长', '自我', '改变', '突破', '觉醒', '内在', '迷茫', '方向', '目标', '提升', '精进', '蜕变'],
    primaryDimension: 'general',
    secondaryDimension: 'career',
    intro:
      '关于你想成为更好的自己的提问，牌面为你呈现了内在成长的能量状态——既包括你已突破的，也包括你尚未觉察的。',
    guidance:
      '成长不是"变得更好"，而是"成为更完整的自己"。牌面提示：你已经走在路上，只是还未给这段旅程命名。',
    advice:
      '把"我应该"换成"我选择"。当你意识到每个决定都是自己的选择，力量就会从内部生长出来。',
    caution:
      '避免把"自我成长"变成新的压力源——真正的成长，是允许自己在某些时刻"什么都不做"。',
    closing: '愿你既能仰望星辰，也能脚踏实地。',
    positionFocus: {
      single: '这张牌揭示你当下成长的核心课题。',
      three: {
        past: '过去影响：你已经走过的成长之路。',
        present: '当下状态：你当前真实的状态与位置。',
        future: '未来走向：若持续觉知，3 个月后的自己。',
      },
      celtic: {
        future: '近未来（卡 6）显示成长的关键节点。',
        self: '自我状态（卡 7）揭示你当下的内在状态。',
        outcome: '最终结果（卡 10）是你当前成长路径的归宿。',
      },
    },
  },
  open: {
    key: 'open',
    label: '综合',
    accent: 'mystic',
    keywords: [],
    primaryDimension: 'general',
    secondaryDimension: 'love',
    intro:
      '你选择让宇宙指引，没有限定具体问题。牌面以它独有的方式回应——既不直接给出答案，也非无关的暗示，而是将此刻与你相关的能量映射到这些符号之中。',
    guidance:
      '当你没有具体问题，牌面会回应你"当下最需要听到的话"。请放下期待，让直觉引导你阅读。',
    advice:
      '把今天当作一次自我聆听：无论牌面说什么，问自己"这在我生活中对应着什么"，答案会自然浮现。',
    caution:
      '避免对"开放解读"过度联想——把注意力放在最触动你的那一点上，而不是试图让所有解读都合理。',
    closing: '愿你在每次占卜中，都能更靠近自己的内心。',
    positionFocus: {
      single: '这张牌呈现你当下最需要关注的能量。',
      three: {
        past: '过去影响：你过去已走过的路径。',
        present: '当下状态：你此刻的真实状态。',
        future: '未来走向：若不改变，自然演化的方向。',
      },
      celtic: {
        future: '近未来（卡 6）显示即将到来的转折。',
        self: '自我状态（卡 7）揭示你当下的内在。',
        outcome: '最终结果（卡 10）是你当前路径的归属。',
      },
    },
  },
};

/**
 * 从问题文本中识别主题
 */
export function detectThemeFromQuestion(question: string): QuestionTheme {
  const trimmed = question?.trim() || '';
  if (!trimmed) return QUESTION_THEMES.open;
  for (const theme of Object.values(QUESTION_THEMES)) {
    if (theme.keywords.some((kw) => trimmed.includes(kw))) {
      return theme;
    }
  }
  return QUESTION_THEMES.open;
}

/**
 * 从问题文本或主题直接获取主题
 * - 如果传入了 themeKey，直接返回
 * - 否则从文本识别
 */
export function getQuestionTheme(question: string, themeKey?: QuestionThemeKey): QuestionTheme {
  if (themeKey && QUESTION_THEMES[themeKey]) return QUESTION_THEMES[themeKey];
  return detectThemeFromQuestion(question);
}
