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

export type ThreeMode = 'time' | 'mind' | 'free';

export interface SubQuestion {
  /** 子问题 id（用于 active 高亮） */
  id: string;
  /** 子问题标签（按钮上展示） */
  label: string;
  /** 完整问题文本（用于占卜） */
  text: string;
  /** 提示符 / 副标题 */
  hint?: string;
}

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
  /** 子问题列表 - 3-5 个细分提问，1 个开放项 */
  subQuestions: SubQuestion[];
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
  /** 牌阵位置的特殊关注提示（按 spreadType 与三张牌子模式） */
  positionFocus: {
    single: string;
    three: {
      /** 时间之流：过去/当下/未来 */
      time: { past: string; present: string; future: string };
      /** 心·行·果：心态/行动/结果 */
      mind: { past: string; present: string; future: string };
      /** 自由三牌：第一张/第二张/第三张 */
      free: { past: string; present: string; future: string };
    };
    celtic: { future: string; self: string; outcome: string };
  };
}

export const QUESTION_THEMES: Record<QuestionThemeKey, QuestionTheme> = {
  love: {
    key: 'love',
    label: '感情',
    accent: 'rose',
    keywords: ['感情', '恋爱', '爱情', '喜欢', '他', '她', '伴侣', '对象', '婚姻', '分手', '复合', '桃花', '暗恋', '心动', '前任', '爱人', 'TA', '前男友', '前女友'],
    primaryDimension: 'love',
    secondaryDimension: 'general',
    subQuestions: [
      { id: 'love-crush', label: '暗恋', text: '我与暗恋的人会走到一起吗？', hint: '心动的萌芽' },
      { id: 'love-current', label: '现任', text: '我与现任的关系未来会如何发展？', hint: '感情的走向' },
      { id: 'love-reconcile', label: '复合', text: '与前任之间是否还有重归于好的可能？', hint: '旧缘的余温' },
      { id: 'love-new', label: '桃花', text: '我的正缘何时会到来？', hint: '命中的相遇' },
      { id: 'love-marriage', label: '婚姻', text: '我与 TA 适合进入婚姻吗？', hint: '长久的承诺' },
    ],
    intro:
      '你说出的问题，是心里一封寄向未知的信。牌面已铺开——关于心动，关于靠近，关于一个人在你生命里留下的温度。',
    guidance:
      '感情从来不是孤立的章节，而是你内在状态在另一个人身上的映照。牌面提醒你：先看清自己在这段关系中站着什么位置，真相会自己浮上来。',
    advice:
      '把"我该不该"换成"我想要什么"。当你愿意诚实地回答自己，对方也会被这份清晰吸引。',
    caution:
      '避免在最浓烈时做最重的决定——无论是表白、复合还是告别。给情绪一周的缓冲期，再听心说话。',
    closing: '愿你在爱里既看得见对方，也看得见自己。',
    positionFocus: {
      single: '这张牌直指这段关系此刻的核心能量。',
      three: {
        time: {
          past: '过去的因：检视你们之间反复出现过的模式。',
          present: '此刻的缘：这段关系当下真实流动的能量。',
          future: '未来的果：若不改变，关系会自然走向的方向。',
        },
        mind: {
          past: '你的心：在关系中你真正的期待与未说出口的话。',
          present: '你的行：你当下可以为关系做的具体行动。',
          future: 'TA 的应：你的行动可能在对方那里唤起的回应。',
        },
        free: {
          past: '第一张：关系中你最容易忽略的那一面。',
          present: '第二张：这段关系当前最真实的温度。',
          future: '第三张：冥冥中潜藏的、未被你看见的可能性。',
        },
      },
      celtic: {
        future: '近未来（卡 6）显示关系会如何演变。',
        self: '自我状态（卡 7）揭示你在关系中真正扮演的角色。',
        outcome: '最终结果（卡 10）是这段关系沿当前路径的归宿。',
      },
    },
  },
  career: {
    key: 'career',
    label: '事业',
    accent: 'amber',
    keywords: ['工作', '事业', '职业', '升职', '跳槽', '面试', '创业', '项目', '同事', '老板', '求职', '岗位', '团队', 'offer', '离职', '转行'],
    primaryDimension: 'career',
    secondaryDimension: 'wealth',
    subQuestions: [
      { id: 'career-hunt', label: '求职', text: '当前这次求职能否拿到满意的 offer？', hint: '机会的窗口' },
      { id: 'career-promote', label: '晋升', text: '我有机会在近期获得晋升或加薪吗？', hint: '价值的兑现' },
      { id: 'career-switch', label: '跳槽', text: '现在跳槽是一个明智的选择吗？', hint: '转折的时机' },
      { id: 'career-startup', label: '创业', text: '我手头的创业项目是否值得继续投入？', hint: '火候的把握' },
      { id: 'career-direction', label: '方向', text: '我的事业下一步应该往哪里走？', hint: '路径的抉择' },
    ],
    intro:
      '事业这条路，从来不是一条笔直的线。牌面为你勾出当下的地形——有山、有雾、也有你尚未走到的那片开阔地。',
    guidance:
      '事业不是孤立的"职位"，而是你与世界交换的方式。牌面提示：先认清你真正想创造的价值，路径会自己显现。',
    advice:
      '把"我能不能得到"换成"我能提供什么"。当你清晰定义自己的价值，机会会从你看不见的地方靠近。',
    caution:
      '避免在犹豫中错过窗口——一个决定思考超过 60 天仍未行动，往往意味着你已在拖延而非慎重。',
    closing: '愿你在自己的节奏里，走出属于你的路。',
    positionFocus: {
      single: '这张牌指出你事业上此刻的核心课题。',
      three: {
        time: {
          past: '过去的积累：你打下的能力与经验。',
          present: '当下的位置：你在职场中真实的状态。',
          future: '未来的走向：若维持当前模式，6 个月后的位置。',
        },
        mind: {
          past: '你的心：你对职业最真实的不满与期待。',
          present: '你的行：你今天就能做的具体改变。',
          future: '势的应：环境可能给你的回应与机会。',
        },
        free: {
          past: '第一张：你事业中尚未被看见的潜质。',
          present: '第二张：你当前工作中隐藏的钥匙。',
          future: '第三张：3 个月内可能浮现的转机。',
        },
      },
      celtic: {
        future: '近未来（卡 6）显示工作上的关键转折。',
        self: '自我状态（卡 7）揭示你对职业的真实期待。',
        outcome: '最终结果（卡 10）是你当前路径的归宿。',
      },
    },
  },
  wealth: {
    key: 'wealth',
    label: '财富',
    accent: 'gold',
    keywords: ['钱', '财', '收入', '工资', '投资', '理财', '股票', '基金', '副业', '生意', '经济', '房贷', '还贷', '存款', '财富', '加薪'],
    primaryDimension: 'wealth',
    secondaryDimension: 'career',
    subQuestions: [
      { id: 'wealth-trend', label: '财运', text: '近期的整体财运与机遇在哪里？', hint: '钱的流向' },
      { id: 'wealth-invest', label: '投资', text: '我计划中的这次投资是否明智？', hint: '风险的辨识' },
      { id: 'wealth-side', label: '副业', text: '我是否应该开启一个副业？', hint: '第二曲线' },
      { id: 'wealth-save', label: '理财', text: '我该如何调整当下的理财方式？', hint: '结构与节奏' },
      { id: 'wealth-debt', label: '债务', text: '我手头的债务该如何处理？', hint: '松绑与重建' },
    ],
    intro:
      '金钱从来不只是数字，它是流动的能量。牌面为你揭示此刻的潮汐——既有正在退去的，也有即将涌来的。',
    guidance:
      '财富是内在的镜像：你对"拥有"与"匮乏"的信念，决定了它流向你的方式。牌面提示：先检视你对金钱的内在对话。',
    advice:
      '本月最适合的财务动作是"盘点"——理清每一笔钱的去向，比盲目扩张更可能迎来真正的余裕。',
    caution:
      '避免在情绪波动时做大额决策（投资、借贷、为"钱"而跳槽）。等心静下来，钱的事才能看得清。',
    closing: '愿你既懂得规划，也对丰盛保持开放。',
    positionFocus: {
      single: '这张牌揭示你财务能量的核心振动。',
      three: {
        time: {
          past: '过去的因：你与金钱之间已形成的模式。',
          present: '当下的势：当前财务的真实图景。',
          future: '未来的果：若维持现状，3 个月后的财务状况。',
        },
        mind: {
          past: '你的心：你对金钱最深的不安全感。',
          present: '你的行：你今天就能开始的财务小动作。',
          future: '钱的应：环境即将带来的财务信号。',
        },
        free: {
          past: '第一张：你财务中潜藏的、未被启用的资源。',
          present: '第二张：你当前现金流中隐藏的关键。',
          future: '第三张：未来可能出现的一笔意外之财或转折。',
        },
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
    keywords: ['学业', '学习', '考试', '学校', '专业', '论文', '毕业', '考证', '考研', '留学', '课程', '成绩', '复习'],
    primaryDimension: 'career',
    secondaryDimension: 'general',
    subQuestions: [
      { id: 'study-exam', label: '考试', text: '我即将参加的考试能否顺利通过？', hint: '当下的挑战' },
      { id: 'study-grad', label: '考研', text: '我适合考研吗？考研的方向如何选择？', hint: '深造的抉择' },
      { id: 'study-abroad', label: '留学', text: '我是否应该选择出国深造？', hint: '远方的召唤' },
      { id: 'study-focus', label: '专注', text: '当下我应该在学业上专注什么？', hint: '精力的分配' },
      { id: 'study-direction', label: '方向', text: '我目前所学的专业对我未来有利吗？', hint: '路径的反思' },
    ],
    intro:
      '学习从不是单纯的记忆，而是你与未知的一次次对话。牌面为你照亮此刻的灯——前方有光，也有尚待走过的路。',
    guidance:
      '学习的本质是"自我扩张"，而非"任务完成"。牌面提示：找到你真正想通过学习抵达的地方，比方法更重要。',
    advice:
      '把"我要学完"换成"我想理解什么"。当目标从"完成量"转为"达成理解"，效率会自然生长。',
    caution:
      '避免用战术上的勤奋掩盖战略上的迷茫——若你一直很努力却没进展，请先停下来问"我为什么学这个"。',
    closing: '愿你在学习中既保持专注，也保持对未知的好奇。',
    positionFocus: {
      single: '这张牌揭示你学业上的核心能量。',
      three: {
        time: {
          past: '过去的因：你已经积累的学习基础。',
          present: '当下的势：你当前学习的状态。',
          future: '未来的果：若维持当前方法，未来的学业成果。',
        },
        mind: {
          past: '你的心：你对学习最真实的热忱或抗拒。',
          present: '你的行：你今天能调整的学习习惯。',
          future: '场的应：环境可能带来的助力或障碍。',
        },
        free: {
          past: '第一张：你学习中尚未被点亮的盲区。',
          present: '第二张：你当前学业的关键瓶颈。',
          future: '第三张：未来学习路上可能出现的启示。',
        },
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
    keywords: ['人际', '朋友', '家人', '父母', '亲子', '家庭', '社交', '关系', '团队', '同事', '同学', '闺蜜', '兄弟', '姐妹'],
    primaryDimension: 'love',
    secondaryDimension: 'general',
    subQuestions: [
      { id: 'people-friend', label: '友谊', text: '我与这位朋友的关系会如何发展？', hint: '友情的脉络' },
      { id: 'people-family', label: '家人', text: '我该如何改善与家人的关系？', hint: '亲缘的和解' },
      { id: 'people-team', label: '团队', text: '我与团队/同事的关系该如何处理？', hint: '协作的边界' },
      { id: 'people-social', label: '社交', text: '我该如何拓展更健康的人际圈？', hint: '圈层的进化' },
      { id: 'people-conflict', label: '冲突', text: '我与某人之间的矛盾该如何化解？', hint: '修复的可能' },
    ],
    intro:
      '每一段关系都是一面镜子，映出你给予的、接收的、以及被忽略的部分。牌面为你照见此刻人际中最需要看清的一角。',
    guidance:
      '关系不是"维持"的，而是"生长"的。牌面提示：先看清你在关系中真正站的位置，再决定如何调整。',
    advice:
      '对身边的人多说一句"我看到你了"。无论是家人、朋友还是同事，一句具体的肯定，会比你想的更深远。',
    caution:
      '避免在关系中承担"拯救者"的角色——你只能陪伴，不能替别人成长。划清边界，反而让关系更健康。',
    closing: '愿你既能温柔待人，也能温柔待己。',
    positionFocus: {
      single: '这张牌揭示你人际关系中的核心课题。',
      three: {
        time: {
          past: '过去的因：你反复出现过的相处模式。',
          present: '当下的势：你当前人际互动的真实状态。',
          future: '未来的果：若不调整，关系会演化的方向。',
        },
        mind: {
          past: '你的心：你在关系中真正害怕失去的。',
          present: '你的行：你今天可以迈出的一小步。',
          future: 'TA 的应：对方可能因你的改变而给出的回应。',
        },
        free: {
          past: '第一张：你与对方关系中沉在最底下的未说之话。',
          present: '第二张：你们此刻最需要被看见的那一寸。',
          future: '第三张：关系下一步最可能的走向。',
        },
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
    keywords: ['成长', '自我', '改变', '突破', '觉醒', '内在', '迷茫', '方向', '目标', '提升', '精进', '蜕变', '焦虑', '卡住'],
    primaryDimension: 'general',
    secondaryDimension: 'career',
    subQuestions: [
      { id: 'self-confusion', label: '迷茫', text: '我当下的迷茫来自哪里？如何看清方向？', hint: '雾中的灯' },
      { id: 'self-break', label: '突破', text: '我该如何突破当前的人生卡点？', hint: '破茧的可能' },
      { id: 'self-pattern', label: '模式', text: '我身上有哪些模式正在重复伤害我？', hint: '轮回的觉知' },
      { id: 'self-energy', label: '能量', text: '我该如何为自己补充内在的能量？', hint: '蓄势与节流' },
      { id: 'self-purpose', label: '意义', text: '我这一生真正想做的事是什么？', hint: '使命的召唤' },
    ],
    intro:
      '你想成为更好的自己——这句话本身，就是一份来自灵魂的邀请。牌面为你照见此刻内在成长的方向。',
    guidance:
      '成长不是"变得更好"，而是"成为更完整的自己"。牌面提示：你已经在路上，只是还没给这段旅程命名。',
    advice:
      '把"我应该"换成"我选择"。当你意识到每个决定都是自己的选择，力量会从内部生长出来。',
    caution:
      '避免把"自我成长"变成新的压力源——真正的成长，是允许自己在某些时刻"什么都不做"。',
    closing: '愿你既能仰望星辰，也能脚踏实地。',
    positionFocus: {
      single: '这张牌揭示你当下成长的核心课题。',
      three: {
        time: {
          past: '过去的因：你已经走过的成长之路。',
          present: '当下的势：你此刻真实的状态与位置。',
          future: '未来的果：若持续觉知，3 个月后的自己。',
        },
        mind: {
          past: '你的心：你内在最深的渴望与不甘。',
          present: '你的行：你今天能为自己做的小小改变。',
          future: '身的应：你身体与生活即将给你的回应。',
        },
        free: {
          past: '第一张：你尚未命名的那一段成长。',
          present: '第二张：你此刻最需要被温柔以待的自己。',
          future: '第三张：3 个月内可能浮现的生命礼物。',
        },
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
    label: '让宇宙指引',
    accent: 'mystic',
    keywords: [],
    primaryDimension: 'general',
    secondaryDimension: 'love',
    subQuestions: [
      { id: 'open-today', label: '今日', text: '今天我需要知道的一件事是什么？', hint: '当下一刻' },
      { id: 'open-block', label: '卡点', text: '我最近卡住我的究竟是什么？', hint: '迷雾的一角' },
      { id: 'open-gift', label: '礼物', text: '宇宙此刻想送给我的礼物是什么？', hint: '意外的祝福' },
    ],
    intro:
      '你把问题交给了宇宙，没有具体的指向。牌面会回应你"当下最需要听到的话"——它不是答案，而是一面镜子。',
    guidance:
      '当你没有具体问题，牌面会回应你"此刻最需要看见的那一面"。请放下期待，让直觉引导你阅读。',
    advice:
      '把今天当作一次自我聆听：无论牌面说什么，问自己"这在我生活中对应着什么"，答案会自然浮现。',
    caution:
      '避免对"开放解读"过度联想——把注意力放在最触动你的那一点上，而不是试图让所有解读都合理。',
    closing: '愿你在每次占卜中，都能更靠近自己的内心。',
    positionFocus: {
      single: '这张牌呈现你当下最需要关注的能量。',
      three: {
        time: {
          past: '过去的因：你过去已走过的路。',
          present: '当下的势：你此刻真实的状态。',
          future: '未来的果：若不改变，自然演化的方向。',
        },
        mind: {
          past: '你的心：宇宙要你看见的内在回响。',
          present: '你的行：今天可以落地的一个小小动作。',
          future: '天的应：环境即将为你展开的回应。',
        },
        free: {
          past: '第一张：宇宙想让你回望的一面。',
          present: '第二张：宇宙想让你停留在此刻的一刻。',
          future: '第三张：宇宙想让你望向的方向。',
        },
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
