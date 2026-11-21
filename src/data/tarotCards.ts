import type { TarotCard, Suit } from '@/types';
import { MAJOR_EXT } from './tarotMajorExtended';

// 元素映射
const suitToElement: Record<Suit, 'fire' | 'water' | 'air' | 'earth'> = {
  wands: 'fire',
  cups: 'water',
  swords: 'air',
  pentacles: 'earth',
};

// 大阿尔卡那（0-21）
const MAJOR_ARCANA: Omit<TarotCard, 'suit' | 'number'>[] = [
  {
    id: 0,
    name: { en: 'The Fool', cn: '愚者' },
    arcana: 'major',
    keywords: ['新开始', '纯真', '冒险', '潜能', '自由'],
    element: 'spirit',
    symbol: '云端行走的旅人',
    upright: {
      general: '代表新的旅程、纯真的信念与无限的潜能。是放手一搏、相信直觉的时刻。',
      love: '新的恋情可能萌芽，或关系中出现新阶段的契机。保持开放与纯真的心。',
      career: '适合开启全新的项目或职业方向。信任你的直觉，勇敢踏出第一步。',
      wealth: '财务上有新的机会，但需谨慎规划。避免冲动消费，量力而行。',
    },
    reversed: {
      general: '鲁莽、轻率或缺乏远见。可能因冲动而错失机会，或陷入不切实际的幻想。',
      love: '关系中可能存在不成熟或逃避责任的倾向。需重新审视承诺与边界。',
      career: '缺乏规划的行动可能带来挫败。需要更多准备与现实评估。',
      wealth: '财务决策需谨慎，过于冒险可能导致损失。',
    },
  },
  {
    id: 1,
    name: { en: 'The Magician', cn: '魔术师' },
    arcana: 'major',
    keywords: ['创造力', '意志力', '显化', '技能', '行动'],
    element: 'spirit',
    symbol: '手持权杖的神秘施法者',
    upright: {
      general: '你拥有创造现实所需的一切资源。是将想法付诸实践、展现个人力量的时刻。',
      love: '主动出击会让关系升温。运用你的魅力与智慧吸引对方。',
      career: '你的才能将得到充分发挥，是开展新项目、谈判、签约的良机。',
      wealth: '通过技能与创意获得财富的可能性极高。',
    },
    reversed: {
      general: '才能未能发挥，或被他人操控。需警惕欺骗与自我欺骗。',
      love: '关系中可能存在操控或不真诚的成分。',
      career: '才能被浪费，或项目方向出现偏差。',
      wealth: '财务上有被骗或决策失误的风险。',
    },
  },
  {
    id: 2,
    name: { en: 'The High Priestess', cn: '女祭司' },
    arcana: 'major',
    keywords: ['直觉', '潜意识', '神秘', '智慧', '内在之声'],
    element: 'spirit',
    symbol: '月下帷幕后的女祭司',
    upright: {
      general: '倾听你的内在智慧。答案不在外界，而在你内心深处。保持静默与觉察。',
      love: '关系的发展需要更多的直觉与耐心。某些真相尚未浮出水面。',
      career: '在决策前先内观。可能隐藏的信息会为你指明方向。',
      wealth: '跟随直觉做财务决策，但要避免完全凭感觉行事。',
    },
    reversed: {
      general: '忽视直觉、被表象迷惑、或过度依赖他人意见。需重新连接内在智慧。',
      love: '关系中存在误解或隐瞒，需要更坦诚的沟通。',
      career: '可能忽视了重要信息，需深入调查再做判断。',
      wealth: '财务上有被误导的风险，谨慎核实信息。',
    },
  },
  {
    id: 3,
    name: { en: 'The Empress', cn: '皇后' },
    arcana: 'major',
    keywords: ['丰盛', '母性', '创造力', '自然', '滋养'],
    element: 'spirit',
    symbol: '丰饶大地之上的女神',
    upright: {
      general: '丰盛与创造的能量涌动。事物在滋养中成长，关系、艺术、事业都将开花结果。',
      love: '爱情甜蜜而丰盈，可能是怀孕、订婚或深度承诺的信号。',
      career: '创意项目硕果累累。与自然、艺术、母性相关的工作有特别的优势。',
      wealth: '财务进入丰收期，物质与精神双重富足。',
    },
    reversed: {
      general: '创造力受阻，或过度依赖他人滋养。需要找回自我养育的能力。',
      love: '关系中可能存在过度依赖或窒息感。',
      career: '项目停滞不前，可能因为缺乏投入或资源。',
      wealth: '财务上需注意过度支出或被他人依赖。',
    },
  },
  {
    id: 4,
    name: { en: 'The Emperor', cn: '皇帝' },
    arcana: 'major',
    keywords: ['权威', '结构', '稳定', '领导力', '父性'],
    element: 'spirit',
    symbol: '王座之上威严的统治者',
    upright: {
      general: '通过纪律与结构获得成功。你是被召唤来建立秩序与规则的人。',
      love: '关系需要稳定的承诺与责任。可能遇到可靠的伴侣或需建立更稳固的根基。',
      career: '领导力得到认可。是建立制度、争取升迁、开创事业的好时机。',
      wealth: '通过理性规划与长期纪律建立财富。',
    },
    reversed: {
      general: '专制、僵化或滥用权力。需要平衡控制与灵活。',
      love: '关系中可能存在控制欲过强或权威争夺。',
      career: '管理方式可能过于死板，需要更多人性化考量。',
      wealth: '财务决策需避免过度保守或专制独断。',
    },
  },
  {
    id: 5,
    name: { en: 'The Hierophant', cn: '教皇' },
    arcana: 'major',
    keywords: ['传统', '信仰', '教导', '制度', '精神指引'],
    element: 'spirit',
    symbol: '祝福信众的精神导师',
    upright: {
      general: '传统、信仰与精神传承的力量。学习、教导、加入团体会有特别意义。',
      love: '可能通过家族介绍、传统仪式进入关系。重视精神层面的契合。',
      career: '在教育、宗教、咨询等领域有发展。适合团队合作与制度内晋升。',
      wealth: '通过稳健的传统方式积累财富，避免投机。',
    },
    reversed: {
      general: '挑战传统、寻求个人独特的精神道路。需摆脱束缚你的旧观念。',
      love: '关系可能不符合社会或家庭的期待，需要勇敢做自己。',
      career: '不适合死板的工作环境，需寻找更具创造性的组织文化。',
      wealth: '财务上可能需突破传统理财方式。',
    },
  },
  {
    id: 6,
    name: { en: 'The Lovers', cn: '恋人' },
    arcana: 'major',
    keywords: ['爱情', '选择', '和谐', '价值观', '结合'],
    element: 'spirit',
    symbol: '天使祝福下的一对恋人',
    upright: {
      general: '爱与和谐的能量。面临重要选择时，跟随你的心。',
      love: '深刻的情感连接，可能是灵魂伴侣的出现或关系的深化。',
      career: '与价值观契合的合作关系会带来丰盛成果。',
      wealth: '财务决策需要与你的价值观一致。',
    },
    reversed: {
      general: '关系失衡、错误选择或价值观冲突。需要重新对齐。',
      love: '关系中可能出现不和谐、欺骗或重大分歧。',
      career: '合作可能出现价值观冲突，需要重新评估。',
      wealth: '财务关系需理清，避免因感情用事而损失。',
    },
  },
  {
    id: 7,
    name: { en: 'The Chariot', cn: '战车' },
    arcana: 'major',
    keywords: ['胜利', '意志力', '决心', '控制', '前进'],
    element: 'spirit',
    symbol: '驾驭双狮的战车勇士',
    upright: {
      general: '通过决心与自律达成目标。你的意志力是成功的关键。',
      love: '主动追求会有结果，但需平衡强势与温柔。',
      career: '克服挑战，达成重要里程碑。',
      wealth: '通过努力与策略实现财务目标。',
    },
    reversed: {
      general: '失去方向、内心冲突或强行推进。需要重新校准。',
      love: '关系中可能存在争夺主导权的紧张。',
      career: '前进方向不明，需要暂停反思。',
      wealth: '财务上需避免强行投资或过度扩张。',
    },
  },
  {
    id: 8,
    name: { en: 'Strength', cn: '力量' },
    arcana: 'major',
    keywords: ['勇气', '内在力量', '耐心', '柔克刚', '自控'],
    element: 'spirit',
    symbol: '温柔驯服狮子的女子',
    upright: {
      general: '真正的力量来自内心而非肌肉。以柔克刚、以智取胜。',
      love: '用爱与耐心化解关系中的挑战。',
      career: '持续稳定的力量会带来成功。',
      wealth: '稳健的财务策略胜过激进投资。',
    },
    reversed: {
      general: '自我怀疑、力量被压制或过度强硬。',
      love: '关系中可能失去耐心或自我价值。',
      career: '可能感到力不从心或被他人压制。',
      wealth: '财务上信心不足，需要重新建立掌控感。',
    },
  },
  {
    id: 9,
    name: { en: 'The Hermit', cn: '隐者' },
    arcana: 'major',
    keywords: ['内省', '智慧', '独处', '寻道', '指引'],
    element: 'spirit',
    symbol: '提灯独行的老者',
    upright: {
      general: '退入内省时刻。独自探寻答案，会找到更深的智慧。',
      love: '需要独处时间反思感情，或寻找精神导师。',
      career: '专注自我提升胜过追逐外在机会。',
      wealth: '通过反思与学习做出更明智的财务决策。',
    },
    reversed: {
      general: '过度孤立或拒绝求助。需要平衡独处与连接。',
      love: '可能因过度封闭而错失关系。',
      career: '孤立无援，需要寻求合作或指导。',
      wealth: '独自承担财务压力，需要专业建议。',
    },
  },
  {
    id: 10,
    name: { en: 'Wheel of Fortune', cn: '命运之轮' },
    arcana: 'major',
    keywords: ['转变', '循环', '机遇', '命运', '转折点'],
    element: 'spirit',
    symbol: '流转不息的命运之轮',
    upright: {
      general: '重大转折点到来。把握机遇，顺应变化的节奏。',
      love: '关系可能进入新阶段，或命运般地遇见某人。',
      career: '重要机会出现，是改变职业轨迹的良机。',
      wealth: '财务运气上升，但要持续努力不可松懈。',
    },
    reversed: {
      general: '抗拒变化、运气低迷或循环模式难破。',
      love: '关系中可能陷入重复的破坏性模式。',
      career: '项目可能因外部不可控因素受挫。',
      wealth: '财务上有损失风险，需谨慎应对。',
    },
  },
  {
    id: 11,
    name: { en: 'Justice', cn: '正义' },
    arcana: 'major',
    keywords: ['公正', '真相', '因果', '平衡', '决断'],
    element: 'spirit',
    symbol: '持剑与天平的女神',
    upright: {
      general: '因果业力清晰显现。你将得到你所应得的——无论是奖赏还是后果。',
      love: '关系需要诚实与公平。可能面临重要决定。',
      career: '法律、合同、协议相关事务有利。',
      wealth: '财务决策需基于事实，做出平衡的选择。',
    },
    reversed: {
      general: '不公、逃避责任或判断失衡。',
      love: '关系中存在不公或失衡，需要坦诚面对。',
      career: '可能遭遇不公待遇或陷入法律纠纷。',
      wealth: '财务上有被欺骗或决策不公的风险。',
    },
  },
  {
    id: 12,
    name: { en: 'The Hanged Man', cn: '倒吊人' },
    arcana: 'major',
    keywords: ['放下', '新视角', '牺牲', '暂停', '领悟'],
    element: 'spirit',
    symbol: '倒悬于树上的智者',
    upright: {
      general: '换个视角看世界。暂时的停顿会带来深刻的领悟。',
      love: '关系中需要放手控制，以新视角看待。',
      career: '暂停推进，从不同角度思考问题。',
      wealth: '可能需要暂时牺牲以获得长远收益。',
    },
    reversed: {
      general: '无谓的牺牲、停滞不前或抗拒改变。',
      love: '在关系中感到窒息或停滞不前。',
      career: '牺牲未得到回报，需要重新评估。',
      wealth: '财务上的停滞，需要改变策略。',
    },
  },
  {
    id: 13,
    name: { en: 'Death', cn: '死神' },
    arcana: 'major',
    keywords: ['结束', '转化', '新生', '放下', '蜕变'],
    element: 'spirit',
    symbol: '黑色铠甲的死神骑士',
    upright: {
      general: '一个章节结束，新篇章即将开启。彻底放下过去，拥抱蜕变。',
      love: '关系可能结束或彻底转化。但结束是为新开始让路。',
      career: '旧项目的结束为新机遇腾出空间。',
      wealth: '财务结构可能发生重大变化。',
    },
    reversed: {
      general: '抗拒必要的结束、拖延转变、困在旧模式中。',
      love: '难以走出旧关系，反复纠结。',
      career: '对变革的恐惧阻碍了发展。',
      wealth: '财务上难以做出必要的调整。',
    },
  },
  {
    id: 14,
    name: { en: 'Temperance', cn: '节制' },
    arcana: 'major',
    keywords: ['平衡', '中庸', '调和', '耐心', '流动'],
    element: 'spirit',
    symbol: '调和双杯的天使',
    upright: {
      general: '平衡与中庸之道。耐心调和生活的方方面面。',
      love: '关系中需要磨合与调适，缓慢而稳定的成长。',
      career: '团队协作良好，稳步推进。',
      wealth: '财务上需要平衡收支，稳健积累。',
    },
    reversed: {
      general: '失衡、过度放纵或极端倾向。',
      love: '关系中失去平衡，一方付出过多。',
      career: '工作与生活失衡，需要调整。',
      wealth: '财务上过度消费或过度节俭。',
    },
  },
  {
    id: 15,
    name: { en: 'The Devil', cn: '恶魔' },
    arcana: 'major',
    keywords: ['束缚', '欲望', '执着', '阴影', '诱惑'],
    element: 'spirit',
    symbol: '枷锁中的两个人影',
    upright: {
      general: '检视什么在束缚你。欲望、恐惧、上瘾都可能让你失去自由。',
      love: '关系中可能存在不健康依恋、执念或控制。',
      career: '可能陷入让你不快乐但又难以离开的工作。',
      wealth: '财务上可能陷入以钱为牢的循环。',
    },
    reversed: {
      general: '挣脱束缚、觉醒、面对阴影。',
      love: '从不健康的关系中解脱，重新找回自己。',
      career: '摆脱让你窒息的工作环境。',
      wealth: '打破消费成瘾或财务陷阱。',
    },
  },
  {
    id: 16,
    name: { en: 'The Tower', cn: '高塔' },
    arcana: 'major',
    keywords: ['突变', '崩塌', '觉醒', '冲击', '重建'],
    element: 'spirit',
    symbol: '雷击中的崩塌高塔',
    upright: {
      general: '突如其来的变化打破虚假的稳定。看似毁灭，实为重建的契机。',
      love: '关系可能经历剧烈冲突或突然破裂，但会迎来更真实的新生。',
      career: '重大变革——可能是失业、公司重组或职业剧变。',
      wealth: '财务可能遭受突然损失，但也是重组的机会。',
    },
    reversed: {
      general: '避免了的灾难、内在崩塌、对改变的恐惧。',
      love: '勉强维持的关系可能正在内部崩塌。',
      career: '对改变的抗拒可能延长痛苦。',
      wealth: '财务危机被拖延，问题会持续累积。',
    },
  },
  {
    id: 17,
    name: { en: 'The Star', cn: '星星' },
    arcana: 'major',
    keywords: ['希望', '灵感', '宁静', '信念', '疗愈'],
    element: 'spirit',
    symbol: '星空下倾倒圣水的女子',
    upright: {
      general: '希望与疗愈的时刻。相信你的愿景，宇宙会指引你。',
      love: '关系进入充满希望的新阶段，或疗愈过去的伤痛。',
      career: '灵感涌现，是创造与规划未来的好时机。',
      wealth: '财务前景光明，但需持续努力。',
    },
    reversed: {
      general: '失去希望、信念动摇或感到迷失。',
      love: '对关系感到失望或失去信心。',
      career: '灵感枯竭，前景黯淡。',
      wealth: '财务上信心不足，需要重新规划。',
    },
  },
  {
    id: 18,
    name: { en: 'The Moon', cn: '月亮' },
    arcana: 'major',
    keywords: ['幻象', '直觉', '潜意识', '恐惧', '梦境'],
    element: 'spirit',
    symbol: '月夜中狼嚎的秘境',
    upright: {
      general: '事物表面不清晰。信任你的直觉，但避免被恐惧与幻象所骗。',
      love: '关系中可能存在不确定或隐瞒，需要时间明朗。',
      career: '信息不全，需要更多调研再行动。',
      wealth: '财务上有迷雾，避免在不确定时做大决定。',
    },
    reversed: {
      general: '迷雾散去、真相显现、释放恐惧。',
      love: '关系中的误解与不安逐渐消散。',
      career: '看清局面，可以做出明智决策。',
      wealth: '财务上的不确定逐渐明朗。',
    },
  },
  {
    id: 19,
    name: { en: 'The Sun', cn: '太阳' },
    arcana: 'major',
    keywords: ['喜悦', '成功', '活力', '光明', '丰盛'],
    element: 'spirit',
    symbol: '向日葵与奔跑的孩子',
    upright: {
      general: '光明、喜悦与成功。这是充满正能量的美好时刻。',
      love: '关系充满快乐，可能是订婚、婚礼或深度幸福。',
      career: '项目大获成功，声誉上升。',
      wealth: '财务丰收，享受生活的馈赠。',
    },
    reversed: {
      general: '暂时的不顺、过度乐观或浅薄的快乐。',
      love: '关系中可能存在过于表面的快乐，缺乏深度。',
      career: '成功可能延迟，或表面风光实则问题。',
      wealth: '财务上可能虚浮，过度乐观。',
    },
  },
  {
    id: 20,
    name: { en: 'Judgement', cn: '审判' },
    arcana: 'major',
    keywords: ['觉醒', '重生', '召唤', '宽恕', '反思'],
    element: 'spirit',
    symbol: '天使吹响审判号角',
    upright: {
      general: '灵魂深处的觉醒时刻。回应你更高的召唤，宽恕过去，拥抱新生。',
      love: '关系进入新的精神层面，可能重燃旧情或得到新的顿悟。',
      career: '找到真正的使命，做出符合灵魂的职业选择。',
      wealth: '重新评估价值观，做出更符合内心的财务决定。',
    },
    reversed: {
      general: '自我批判、逃避召唤或拒绝成长。',
      love: '难以原谅自己或对方，困在过去。',
      career: '逃避真正的使命，从事不合适的工作。',
      wealth: '财务决策与价值观脱节。',
    },
  },
  {
    id: 21,
    name: { en: 'The World', cn: '世界' },
    arcana: 'major',
    keywords: ['完成', '圆满', '成就', '整合', '新循环'],
    element: 'spirit',
    symbol: '环绕花环的舞者',
    upright: {
      general: '一个重要循环的完成。庆祝你的成就，准备迎接新的开始。',
      love: '关系达到圆满，可能是订婚、结婚或深度承诺。',
      career: '重大项目圆满完成，声誉与成就达到高峰。',
      wealth: '财务目标达成，进入新的丰盛阶段。',
    },
    reversed: {
      general: '未完成的事、无法收尾或害怕开始新循环。',
      love: '关系难以达到承诺，或未解决的旧事。',
      career: '项目收尾困难，难以进入下一阶段。',
      wealth: '财务目标未达成，需要继续努力。',
    },
  },
];

// 小阿尔卡那通用解读生成器
function generateMinorMeaning(
  num: number,
  suit: Suit,
  uprightKeywords: string[],
  uprightDesc: string,
  reversedDesc: string,
) {
  const element = suitToElement[suit];
  return {
    keywords: uprightKeywords,
    element,
    upright: {
      general: uprightDesc,
      love: getLoveMeaning(num, suit, 'upright'),
      career: getCareerMeaning(num, suit, 'upright'),
      wealth: getWealthMeaning(num, suit, 'upright'),
      health: getHealthMeaning(num, suit, 'upright'),
      relationship: getRelationshipMeaning(num, suit, 'upright'),
      spiritual: getSpiritualMeaning(num, suit, 'upright'),
      advice: getAdviceMeaning(num, suit, 'upright'),
      warning: getWarningMeaning(num, suit, 'upright'),
      timing: getTimingMeaning(num, suit, 'upright'),
    },
    reversed: {
      general: reversedDesc,
      love: getLoveMeaning(num, suit, 'reversed'),
      career: getCareerMeaning(num, suit, 'reversed'),
      wealth: getWealthMeaning(num, suit, 'reversed'),
      health: getHealthMeaning(num, suit, 'reversed'),
      relationship: getRelationshipMeaning(num, suit, 'reversed'),
      spiritual: getSpiritualMeaning(num, suit, 'reversed'),
      advice: getAdviceMeaning(num, suit, 'reversed'),
      warning: getWarningMeaning(num, suit, 'reversed'),
      timing: getTimingMeaning(num, suit, 'reversed'),
    },
  };
}

// === 小阿尔卡那 - 扩展字段生成器 ===
// 基于花色 + 数字 维度组合，让 56 张牌都有一致的解读深度

type MinorTpl = { up: string; re: string };

const HEALTH_TPL: Record<Suit, MinorTpl> = {
  wands: {
    up: '能量充沛，是开始运动计划或体力活动的黄金期。注意运动损伤。',
    re: '精力透支或急躁易怒。注意休息，避免过度劳累。',
  },
  cups: {
    up: '情绪与身体连接紧密，注意补水、皮肤保养与情绪调养。',
    re: '情绪积压影响身体，注意排解、倾诉或寻求专业帮助。',
  },
  swords: {
    up: '头脑清晰，呼吸系统与神经系统运作良好。',
    re: '精神压力导致失眠、偏头痛或焦虑。',
  },
  pentacles: {
    up: '身体状态稳定，是改善饮食习惯与作息的好时机。',
    re: '注意慢性疲劳或过度安逸带来的健康问题。',
  },
};

const RELATIONSHIP_TPL: Record<Suit, MinorTpl> = {
  wands: {
    up: '朋友圈充满活力，可能结识志同道合的伙伴。',
    re: '人际中可能因冲动或争夺而出现摩擦。',
  },
  cups: {
    up: '情感连接加深，可能遇到真心朋友或亲近的伙伴。',
    re: '人际中界限不清，过度依赖或冷漠。',
  },
  swords: {
    up: '通过理性沟通改善人际关系。',
    re: '言语冲突或误解影响人际和谐。',
  },
  pentacles: {
    up: '人际关系务实稳定，可能建立长期合作或社群。',
    re: '人际中存在利益纠葛或信任问题。',
  },
};

const SPIRITUAL_TPL: Record<Suit, MinorTpl> = {
  wands: {
    up: '通过行动与创造力连接灵性。打破常规的修行方式。',
    re: '用行动代替思考，避免蛮力修行的陷阱。',
  },
  cups: {
    up: '直觉与梦境是重要的指引。倾听内在的声音。',
    re: '被情绪淹没，需要回到内心中心。',
  },
  swords: {
    up: '通过思考与冥想寻找答案。理性与灵性可以共存。',
    re: '过度用脑反而阻断了直觉的流动。',
  },
  pentacles: {
    up: '灵性就在日常中。接地气的修行最有力量。',
    re: '困在物质层面，忘记了灵性的存在。',
  },
};

const TIMING_TPL: Record<Suit, MinorTpl> = {
  wands: {
    up: '事情会快速发展（1-2 周内），把握当下的势头。',
    re: '暂停 1-2 周再行动，蓄势待发。',
  },
  cups: {
    up: '跟随情感的节奏，自然展开（2-4 周）。',
    re: '需要更长的情绪修复期（1-3 个月）。',
  },
  swords: {
    up: '做决定后立即行动（数日到 2 周）。',
    re: '等待信息更完整再做判断（1-2 周）。',
  },
  pentacles: {
    up: '长期布局（3-6 个月），耐心是关键词。',
    re: '短期难有变化（1-2 个月），需要策略调整。',
  },
};

// === 牌阶（数字/宫廷）维度解读 ===
// 旧版 love/career/wealth 只按花色取文案，同一花色 14 张牌完全相同；
// 现在改为「花色定基调 + 牌阶定具体信息」，每张小牌的解读都不同。

const RANK_LOVE: Record<number, MinorTpl> = {
  1: { up: '一段新感情或关系新阶段的种子正在萌芽，主动释放善意会有回应。', re: '心动迟迟不敢表达，或旧伤未愈挡住了新的可能。' },
  2: { up: '关系来到需要坦诚对话与共同规划的节点，两个人的意愿比激情更重要。', re: '彼此试探、迟迟不肯先开口，平衡正在被沉默打破。' },
  3: { up: '感情在共同经历中稳步升温，适合一起旅行、见朋友或规划下一步。', re: '第三方意见或距离带来干扰，先确认彼此的优先级。' },
  4: { up: '关系进入安稳期，适合确认名分、见家人或经营共同的小日子。', re: '安稳变成乏味，或家庭因素给关系带来压力。' },
  5: { up: '摩擦与分歧浮现，争执背后是未被满足的需求，别赢了道理输了人。', re: '冷战或翻旧账让裂痕加深，先降温再谈。' },
  6: { up: '付出开始得到回应，关系里出现体贴与默契的流动。', re: '一方付出过多、一方习惯索取，天平需要重新校准。' },
  7: { up: '你在评估这段关系值不值得继续投入，答案在对方的行动里不在言语里。', re: '幻想多于现实，可能高估了对方的心意。' },
  8: { up: '关系快速推进，可能突然确定关系或做出重要约定。', re: '推进太快让一方想逃，或忙碌让联系变得稀疏。' },
  9: { up: '彼此已足够了解，安全感在累积，适合谈更长远的安排。', re: '过去的伤让你本能防备，亲密需要先卸下盔甲。' },
  10: { up: '关系走向圆满与承诺，家庭层面的融合提上日程。', re: '责任与现实压力挤压了感情，先处理外部问题再谈感受。' },
  11: { up: '有心动的消息或新的人出现，保持好奇与开放，但别急着下结论。', re: '暧昧信号混乱，或对方还不够成熟，先观察。' },
  12: { up: '有人主动热烈地靠近，享受被追求的同时看清对方的持续性。', re: '来得快去得也快，小心只有三分钟热度的靠近。' },
  13: { up: '你在关系中散发稳定而温暖的吸引力，照顾对方之前先照顾好自己的感受。', re: '过度迁就或情绪索取正在消耗关系，边界感需要重建。' },
  14: { up: '关系需要成熟稳重的处理方式，一次有分量的承诺胜过十句情话。', re: '控制欲或冷漠让关系失衡，权力感别带进感情里。' },
};

const RANK_CAREER: Record<number, MinorTpl> = {
  1: { up: '新项目、新岗位或新技能的起点出现了，果断拿下入场券。', re: '机会在眼前却迟迟不启动，先补齐最关键的那块短板。' },
  2: { up: '适合做职业规划与路径选择，把大目标拆成可执行的小步。', re: '在两个方向之间摇摆，拖延正在消耗你的先发优势。' },
  3: { up: '前期投入开始见到初步成果，适合拓展合作与外部资源。', re: '计划推进受阻或合作方掉链子，备选方案要提前准备。' },
  4: { up: '工作进入稳定期，适合沉淀方法论、争取长期资源。', re: '舒适区待太久，成长停滞的风险大于变化的风险。' },
  5: { up: '竞争与冲突不可避免，把分歧摆在桌面上解决比私下内耗强。', re: '团队内耗或恶性竞争出现，注意别成为办公室政治的牺牲品。' },
  6: { up: '努力得到公开认可，适合争取晋升、汇报成果或跳槽议价。', re: '成果被忽视或功劳被抢，留痕与向上沟通要跟上。' },
  7: { up: '坚守自己的专业立场，短期质疑会随结果消散。', re: '硬撑不如调整策略，评估是否值得继续投入这场仗。' },
  8: { up: '项目高速推进、消息频传，执行力就是这段时间的最大竞争力。', re: '节奏过快导致细节出错，忙中要有复核机制。' },
  9: { up: '到了冲刺收尾阶段，疲惫是真的，放弃的代价更大。', re: '长期透支已影响状态，该休整时别硬扛。' },
  10: { up: '阶段性目标达成，适合复盘并规划下一程，别让成功变成包袱。', re: '责任越背越多，学会分派与拒绝是新的必修课。' },
  11: { up: '适合学习新技能、争取培训机会，新人视角反而是你的优势。', re: '经验不足导致返工，虚心请教比硬闯省时间。' },
  12: { up: '适合主动出击、开拓业务或推动变革，速度带来机会。', re: '冒进容易踩坑，重要决策先过一遍风险清单。' },
  13: { up: '以专业与口碑取胜的时期，适合带团队、做导师或经营个人品牌。', re: '过度在意他人评价影响判断，回到专业标准本身。' },
  14: { up: '适合做决策、定方向与资源调配，你的判断会被团队采纳。', re: '独断或信息不透明引发抵触，权威要用在透明处。' },
};

const RANK_WEALTH: Record<number, MinorTpl> = {
  1: { up: '新的收入来源或投资机会出现，小额试水、确认模式再加码。', re: '看似的机会实为坑，先查清规则与成本。' },
  2: { up: '多份收入或支出需要统筹平衡，现金流管理是本阶段重点。', re: '拆东墙补西墙的迹象出现，尽快做一次收支盘点。' },
  3: { up: '合作生财的格局，适合与人合伙、接外包或拓展副业渠道。', re: '合作账目要清晰，口头约定尽快落纸面。' },
  4: { up: '适合储蓄与防守型配置，守住本金就是赢。', re: '过度保守错失机会，或过度囤积让资金失去流动性。' },
  5: { up: '财务上有波动或意外支出，预留应急金，避免冲动消费。', re: '亏损后急于翻本是大忌，先止损再复盘。' },
  6: { up: '有进账或人情往来的收获，慷慨与回馈会带来新的资源。', re: '借贷与担保需谨慎，帮忙也要量力而行。' },
  7: { up: '适合评估持仓与长期投入的去留，耐心比频繁操作更赚钱。', re: '沉没成本绑架决策，该割肉时别犹豫。' },
  8: { up: '收入随业务量快速增长，适合加速周转、扩大投入。', re: '钱来得快去得也快，记账与预算要立刻跟上。' },
  9: { up: '财务接近阶段性目标，享受成果的同时保留安全边际。', re: '为钱焦虑过度影响生活，先区分真实风险与想象风险。' },
  10: { up: '长期积累见效，适合做资产配置与长期安排。', re: '家庭或合作层面的财务纠纷需提前厘清权责。' },
  11: { up: '有小额进账或学习投资的机会，适合为技能付费。', re: '经验不足容易交学费，付费前多方比价与查证。' },
  12: { up: '适合主动开拓财源，跑动与出差会带来收益。', re: '追逐快钱风险高，远离高杠杆与不明平台。' },
  13: { up: '财务管理进入成熟期，适合优化结构、享受复利。', re: '为他人过度买单，财务边界需要明确。' },
  14: { up: '适合做大额决策与长期布局，你的判断力就是资产。', re: '贪大求全或面子消费会伤元气，量力而行。' },
};

const RANK_ADVICE: Record<number, MinorTpl> = {
  1: { up: '抓住刚出现的机会，先行动再完善。', re: '别急着开始，先把内心的阻力看清楚。' },
  2: { up: '把选择写下来比较，答案会自己浮现。', re: '停止观望，给自己设定一个做决定的截止日。' },
  3: { up: '扩大圈子与视野，外援会带来转机。', re: '先修内功，外部扩张暂缓。' },
  4: { up: '稳固根基，庆祝小成果以积累信心。', re: '打破让你窒息的稳定，微调也是前进。' },
  5: { up: '直面冲突，回避只会让问题变大。', re: '退出无意义的争斗，保存实力。' },
  6: { up: '主动分享与给予，流动带来丰盛。', re: '检查关系中的付出是否对等。' },
  7: { up: '盘点手头资源，再决定去留。', re: '别被幻想牵着走，回到事实层面。' },
  8: { up: '顺势加速，把拖延的事项一次清掉。', re: '慢下来，方向对了再提速。' },
  9: { up: '坚持最后一公里，同时照顾好自己的状态。', re: '允许自己休息，恢复不是放弃。' },
  10: { up: '做好收尾与交接，为新阶段腾出空间。', re: '放下不属于你的责任。' },
  11: { up: '保持好奇心，小步试错。', re: '先补课再行动，热情需要能力托底。' },
  12: { up: '主动出击，机会偏爱行动者。', re: '收一收冲劲，先确认方向。' },
  13: { up: '用你的经验与温度影响周围的人。', re: '先安顿好自己，再照顾别人。' },
  14: { up: '做长期正确的决定，并为它负责。', re: '放下控制欲，信任过程与伙伴。' },
};

const RANK_WARNING: Record<number, MinorTpl> = {
  1: { up: '别让一时热情透支后续资源。', re: '机会窗口短暂，犹豫即错过。' },
  2: { up: '别在信息不足时押上全部筹码。', re: '摇摆本身正在造成损失。' },
  3: { up: '别因初步顺利就盲目扩张。', re: '合作中的信任需要验证机制。' },
  4: { up: '别把稳定误认为停滞的借口。', re: '舒适区之外才有增量。' },
  5: { up: '别在情绪上头时做决定或签约。', re: '小心破财消灾式的冲动处理。' },
  6: { up: '别忽视默默支持你的人。', re: '人情债也是债，量力而行。' },
  7: { up: '别为沉没成本继续买单。', re: '警惕看似美好的捷径。' },
  8: { up: '别让速度牺牲准确与安全。', re: '信息滞后会让你错判形势。' },
  9: { up: '别独自硬扛到崩溃边缘。', re: '焦虑多半来自想象而非现实。' },
  10: { up: '别让成果变成新的负担。', re: '家庭与钱的事别拖，越拖越乱。' },
  11: { up: '别轻信未经证实的消息。', re: '三分钟热度会留下烂摊子。' },
  12: { up: '别在疲惫时做重大决定。', re: '小心冒进背后的连锁反应。' },
  13: { up: '别过度干涉他人的课题。', re: '情绪需要出口，别独自消化。' },
  14: { up: '别用权威压制不同意见。', re: '面子是最贵的消费。' },
};

const SUIT_LOVE: Record<Suit, MinorTpl> = {
  wands: { up: '关系充满激情与冒险。', re: '关系中火气偏旺，容易冲动。' },
  cups: { up: '情感丰盈，彼此容易心意相通。', re: '情绪在关系中占了上风。' },
  swords: { up: '这段关系正处在需要把话说开的阶段。', re: '言语与沉默都在消耗这段关系。' },
  pentacles: { up: '关系偏向务实与安稳的经营。', re: '现实问题正在给关系施压。' },
};

const SUIT_CAREER: Record<Suit, MinorTpl> = {
  wands: { up: '工作上创造力与热情正旺。', re: '工作状态被火元素的躁动干扰。' },
  cups: { up: '工作与情感、人际连结紧密。', re: '情绪容易被带进工作里。' },
  swords: { up: '思维与沟通是这段时间的主战场。', re: '信息与沟通环节容易出问题。' },
  pentacles: { up: '工作重心在务实积累与回报。', re: '资源与节奏是当前瓶颈。' },
};

const SUIT_WEALTH: Record<Suit, MinorTpl> = {
  wands: { up: '财务上行动力带来机会。', re: '财务上容易冲动行事。' },
  cups: { up: '财务与人情、情感往来相关。', re: '财务容易受情绪与他人影响。' },
  swords: { up: '财务靠分析与策略取胜。', re: '财务上要防信息差与误判。' },
  pentacles: { up: '财务以稳健积累为主线。', re: '财务节奏偏紧，需要盘点。' },
};

function getLoveMeaning(num: number, suit: Suit, dir: 'upright' | 'reversed'): string {
  return `${tpl(SUIT_LOVE[suit], dir)}${tpl(RANK_LOVE[num], dir)}`;
}

function getCareerMeaning(num: number, suit: Suit, dir: 'upright' | 'reversed'): string {
  return `${tpl(SUIT_CAREER[suit], dir)}${tpl(RANK_CAREER[num], dir)}`;
}

function getWealthMeaning(num: number, suit: Suit, dir: 'upright' | 'reversed'): string {
  return `${tpl(SUIT_WEALTH[suit], dir)}${tpl(RANK_WEALTH[num], dir)}`;
}

// === 扩展字段 helper ===
const tpl = (m: MinorTpl, dir: 'upright' | 'reversed') => m[dir === 'upright' ? 'up' : 're'];

const getHealthMeaning = (_n: number, s: Suit, d: 'upright' | 'reversed') => tpl(HEALTH_TPL[s], d);
const getRelationshipMeaning = (_n: number, s: Suit, d: 'upright' | 'reversed') => tpl(RELATIONSHIP_TPL[s], d);
const getSpiritualMeaning = (_n: number, s: Suit, d: 'upright' | 'reversed') => tpl(SPIRITUAL_TPL[s], d);
const getAdviceMeaning = (n: number, _s: Suit, d: 'upright' | 'reversed') => tpl(RANK_ADVICE[n], d);
const getWarningMeaning = (n: number, _s: Suit, d: 'upright' | 'reversed') => tpl(RANK_WARNING[n], d);
const getTimingMeaning = (_n: number, s: Suit, d: 'upright' | 'reversed') => tpl(TIMING_TPL[s], d);

// 小阿尔卡那数据定义
const MINOR_ARCANA_DATA: Array<{
  suit: Suit;
  num: number;
  name: { en: string; cn: string };
  keywords: string[];
  symbol: string;
  uprightGeneral: string;
  reversedGeneral: string;
}> = [
  // 权杖 Wands (火) - 行动、创造、激情
  { suit: 'wands', num: 1, name: { en: 'Ace of Wands', cn: '权杖王牌' }, keywords: ['灵感', '新机会', '创造力', '热情'], symbol: '手中绽放的权杖', uprightGeneral: '新的创造力与机遇之火被点燃。是开始新项目、追求激情的时刻。', reversedGeneral: '灵感受阻、机会延迟或动力不足。' },
  { suit: 'wands', num: 2, name: { en: 'Two of Wands', cn: '权杖二' }, keywords: ['规划', '决策', '远见', '选择'], symbol: '远眺世界的持有者', uprightGeneral: '站在起点，规划未来的可能。重大决策需要长远视角。', reversedGeneral: '决策困难、视野受限或畏惧未知。' },
  { suit: 'wands', num: 3, name: { en: 'Three of Wands', cn: '权杖三' }, keywords: ['扩展', '远见', '等待', '海外'], symbol: '眺望远方的旅人', uprightGeneral: '你的视野正在扩展。耐心等待种子的成长，未来可期。', reversedGeneral: '计划延迟、视野狭窄或缺乏耐心。' },
  { suit: 'wands', num: 4, name: { en: 'Four of Wands', cn: '权杖四' }, keywords: ['庆祝', '家庭', '稳定', '里程碑'], symbol: '鲜花装饰的门廊', uprightGeneral: '庆祝里程碑。家庭、归属、稳定的喜悦时刻。', reversedGeneral: '家庭不和谐、缺乏归属感或庆祝延迟。' },
  { suit: 'wands', num: 5, name: { en: 'Five of Wands', cn: '权杖五' }, keywords: ['冲突', '竞争', '分歧', '挑战'], symbol: '五人混战', uprightGeneral: '竞争与冲突是成长的一部分。健康的对抗激发潜能。', reversedGeneral: '避免冲突、内在斗争或竞争失利。' },
  { suit: 'wands', num: 6, name: { en: 'Six of Wands', cn: '权杖六' }, keywords: ['胜利', '认可', '成功', '荣耀'], symbol: '骑马凯旋的勇士', uprightGeneral: '胜利与公众认可。你的努力得到应有的荣誉。', reversedGeneral: '成功延迟、缺乏认可或自负导致失败。' },
  { suit: 'wands', num: 7, name: { en: 'Seven of Wands', cn: '权杖七' }, keywords: ['防御', '坚持', '立场', '挑战'], symbol: '居高临下的守护者', uprightGeneral: '坚定立场，捍卫你的信念。面对挑战不退缩。', reversedGeneral: '防御过当、压力过大或放弃立场。' },
  { suit: 'wands', num: 8, name: { en: 'Eight of Wands', cn: '权杖八' }, keywords: ['快速', '行动', '消息', '加速'], symbol: '八支飞行的权杖', uprightGeneral: '事情快速推进。消息将至，行动力爆棚。', reversedGeneral: '进展过急、延迟或沟通不畅。' },
  { suit: 'wands', num: 9, name: { en: 'Nine of Wands', cn: '权杖九' }, keywords: ['坚持', '韧性', '警戒', '最后一搏'], symbol: '带伤的守望者', uprightGeneral: '坚持到底。你已疲惫但胜利在望。保持警惕，不放弃。', reversedGeneral: '精疲力竭、过度防御或准备放弃。' },
  { suit: 'wands', num: 10, name: { en: 'Ten of Wands', cn: '权杖十' }, keywords: ['负担', '责任', '压力', '坚持'], symbol: '背负十杖的旅人', uprightGeneral: '你承担了很多责任。考虑是否需要放下一些重担。', reversedGeneral: '压力过载、卸下责任或被压垮。' },
  { suit: 'wands', num: 11, name: { en: 'Page of Wands', cn: '权杖侍从' }, keywords: ['热情', '探索', '自由', '消息'], symbol: '手持权杖的年轻冒险者', uprightGeneral: '充满热情的新开始。好奇心与冒险精神引导你。', reversedGeneral: '缺乏方向、鲁莽或热情消退。' },
  { suit: 'wands', num: 12, name: { en: 'Knight of Wands', cn: '权杖骑士' }, keywords: ['行动', '勇气', '冲动', '能量'], symbol: '战马上的烈焰骑士', uprightGeneral: '勇敢行动，充满能量。但需注意不要过于冲动。', reversedGeneral: '鲁莽、冲动或方向不明。' },
  { suit: 'wands', num: 13, name: { en: 'Queen of Wands', cn: '权杖皇后' }, keywords: ['自信', '独立', '魅力', '热情'], symbol: '王座上的火焰女王', uprightGeneral: '自信、热情、富有创造力。你吸引他人如磁石。', reversedGeneral: '自私、嫉妒或热情过度控制他人。' },
  { suit: 'wands', num: 14, name: { en: 'King of Wands', cn: '权杖国王' }, keywords: ['领导', '远见', '权威', '成熟'], symbol: '披风的成熟领导者', uprightGeneral: '成熟的领导力与远见。你激励他人达成目标。', reversedGeneral: '专制、独断或滥用权力。' },
  // 圣杯 Cups (水) - 情感、关系、直觉
  { suit: 'cups', num: 1, name: { en: 'Ace of Cups', cn: '圣杯王牌' }, keywords: ['新感情', '爱', '情感丰盈', '直觉'], symbol: '溢出的圣杯', uprightGeneral: '情感的丰盈与新生。爱、友谊、灵感的种子已种下。', reversedGeneral: '情感空虚、关系破裂或爱被拒绝。' },
  { suit: 'cups', num: 2, name: { en: 'Two of Cups', cn: '圣杯二' }, keywords: ['结合', '伙伴', '相互吸引', '和谐'], symbol: '互相举杯的两人', uprightGeneral: '两个人之间的和谐连接。伙伴关系、恋爱、合作的美妙结合。', reversedGeneral: '关系失衡、误解或不和谐。' },
  { suit: 'cups', num: 3, name: { en: 'Three of Cups', cn: '圣杯三' }, keywords: ['友谊', '庆祝', '团聚', '社群'], symbol: '举杯欢庆的姐妹', uprightGeneral: '友谊与庆祝。社群支持带来喜悦。', reversedGeneral: '孤立、社交过度或友谊破裂。' },
  { suit: 'cups', num: 4, name: { en: 'Four of Cups', cn: '圣杯四' }, keywords: ['冷漠', '沉思', '错失', '倦怠'], symbol: '树下冥想的人', uprightGeneral: '对周围的机会感到冷漠。需要内省或重新评估。', reversedGeneral: '重新接受机会、走出倦怠或接受新事物。' },
  { suit: 'cups', num: 5, name: { en: 'Five of Cups', cn: '圣杯五' }, keywords: ['失落', '悲伤', '遗憾', '遗憾'], symbol: '披斗篷的哀悼者', uprightGeneral: '失去与遗憾。但要看到身后仍有两杯未倾倒。', reversedGeneral: '走出悲伤、宽恕过往或重新振作。' },
  { suit: 'cups', num: 6, name: { en: 'Six of Cups', cn: '圣杯六' }, keywords: ['怀旧', '纯真', '童年', '回忆'], symbol: '送花的孩子们', uprightGeneral: '怀旧与纯真的回归。可能遇到旧友或重访过去。', reversedGeneral: '困在过去、不愿成长或沉溺回忆。' },
  { suit: 'cups', num: 7, name: { en: 'Seven of Cups', cn: '圣杯七' }, keywords: ['幻想', '选择', '想象', '诱惑'], symbol: '七个漂浮的圣杯', uprightGeneral: '面对众多选择与幻想。保持清醒，分清现实与想象。', reversedGeneral: '清晰决断、放弃幻想或专注重点。' },
  { suit: 'cups', num: 8, name: { en: 'Eight of Cups', cn: '圣杯八' }, keywords: ['离开', '放下', '寻找', '转身'], symbol: '月下离去的旅人', uprightGeneral: '放下不再服务你的东西，踏上寻找更深意义的旅程。', reversedGeneral: '不愿离开、害怕未知或回归过去。' },
  { suit: 'cups', num: 9, name: { en: 'Nine of Cups', cn: '圣杯九' }, keywords: ['满足', '愿望成真', '享乐', '感恩'], symbol: '满足的享乐者', uprightGeneral: '愿望达成、情感满足。享受你的丰盛。', reversedGeneral: '过度满足、浅薄快乐或愿望未达。' },
  { suit: 'cups', num: 10, name: { en: 'Ten of Cups', cn: '圣杯十' }, keywords: ['圆满', '家庭幸福', '和谐', '理想'], symbol: '彩虹下的全家福', uprightGeneral: '家庭与情感的圆满。理想的关系状态。', reversedGeneral: '家庭不和谐、理想破灭或关系失衡。' },
  { suit: 'cups', num: 11, name: { en: 'Page of Cups', cn: '圣杯侍从' }, keywords: ['浪漫', '敏感', '创意', '消息'], symbol: '杯中跃出之鱼的年轻使者', uprightGeneral: '浪漫敏感的创造性信息。可能有人向你示爱。', reversedGeneral: '情绪化、不成熟或创意受阻。' },
  { suit: 'cups', num: 12, name: { en: 'Knight of Cups', cn: '圣杯骑士' }, keywords: ['浪漫', '魅力', '理想主义', '追求'], symbol: '白马上的浪漫骑士', uprightGeneral: '浪漫的追求者，带着情感与理想出发。', reversedGeneral: '情绪化、不切实际或浪漫幻灭。' },
  { suit: 'cups', num: 13, name: { en: 'Queen of Cups', cn: '圣杯皇后' }, keywords: ['直觉', '同情', '情感智慧', '关怀'], symbol: '海边的关怀女王', uprightGeneral: '深刻的情感智慧与直觉。你是他人情感的港湾。', reversedGeneral: '情绪化、过度敏感或被情绪淹没。' },
  { suit: 'cups', num: 14, name: { en: 'King of Cups', cn: '圣杯国王' }, keywords: ['情感成熟', '智慧', '平静', '外交'], symbol: '海中的沉稳国王', uprightGeneral: '情感成熟、内心平静。在动荡中保持稳定。', reversedGeneral: '情绪操控、压抑情感或情绪不稳。' },
  // 宝剑 Swords (风) - 思想、沟通、冲突
  { suit: 'swords', num: 1, name: { en: 'Ace of Swords', cn: '宝剑王牌' }, keywords: ['突破', '清晰', '真相', '胜利'], symbol: '高举的王者之剑', uprightGeneral: '心智的突破与真相的揭示。清晰的思维带来胜利。', reversedGeneral: '思维混乱、决策失误或真相被蒙蔽。' },
  { suit: 'swords', num: 2, name: { en: 'Two of Swords', cn: '宝剑二' }, keywords: ['僵局', '选择', '平衡', '回避'], symbol: '蒙眼持剑的决策者', uprightGeneral: '面对两难选择。内在的智慧会为你指路。', reversedGeneral: '必须做出决定、打破僵局或看到真相。' },
  { suit: 'swords', num: 3, name: { en: 'Three of Swords', cn: '宝剑三' }, keywords: ['心碎', '痛苦', '悲伤', '释放'], symbol: '心被三剑刺穿', uprightGeneral: '情感的剧痛。但这是必要的释放与疗愈。', reversedGeneral: '正在疗愈、宽恕过往或走出伤痛。' },
  { suit: 'swords', num: 4, name: { en: 'Four of Swords', cn: '宝剑四' }, keywords: ['休息', '恢复', '冥想', '暂停'], symbol: '沉睡的骑士', uprightGeneral: '需要停下来休养。给自己恢复的时间与空间。', reversedGeneral: '抗拒休息、过度工作或缺乏反思。' },
  { suit: 'swords', num: 5, name: { en: 'Five of Swords', cn: '宝剑五' }, keywords: ['冲突', '争吵', '失败', '胜利的代价'], symbol: '背剑离去的胜利者', uprightGeneral: '赢了战斗却输了关系。评估胜利的真正代价。', reversedGeneral: '和解、停止争斗或承认失败。' },
  { suit: 'swords', num: 6, name: { en: 'Six of Swords', cn: '宝剑六' }, keywords: ['过渡', '转变', '离开', '旅程'], symbol: '渡船离去的旅人', uprightGeneral: '离开困难的环境，向更平静的水域前进。', reversedGeneral: '困在过渡期、无法前进或抗拒改变。' },
  { suit: 'swords', num: 7, name: { en: 'Seven of Swords', cn: '宝剑七' }, keywords: ['欺骗', '策略', '偷窃', '机智'], symbol: '偷剑离去的身影', uprightGeneral: '可能涉及欺骗或不诚实。审视你的策略与动机。', reversedGeneral: '真相暴露、坦白从宽或改变策略。' },
  { suit: 'swords', num: 8, name: { en: 'Eight of Swords', cn: '宝剑八' }, keywords: ['束缚', '无助', '自我限制', '困境'], symbol: '被蒙眼束缚的女子', uprightGeneral: '你感到被困，但束缚多来自内心。换个视角。', reversedGeneral: '挣脱束缚、看到新可能或重获自由。' },
  { suit: 'swords', num: 9, name: { en: 'Nine of Swords', cn: '宝剑九' }, keywords: ['焦虑', '噩梦', '担忧', '失眠'], symbol: '深夜惊醒的焦虑者', uprightGeneral: '忧虑困扰你。但最坏的情况很少发生。停止自我折磨。', reversedGeneral: '走出焦虑、释放恐惧或面对真相。' },
  { suit: 'swords', num: 10, name: { en: 'Ten of Swords', cn: '宝剑十' }, keywords: ['结束', '崩溃', '黎明', '终结'], symbol: '倒地十剑的受害者', uprightGeneral: '触底反弹。最坏已经过去，黎明即将到来。', reversedGeneral: '缓慢恢复、避免崩溃或从谷底反弹。' },
  { suit: 'swords', num: 11, name: { en: 'Page of Swords', cn: '宝剑侍从' }, keywords: ['好奇', '警觉', '学习', '真相'], symbol: '持剑警觉的年轻人', uprightGeneral: '好奇而警觉的心智。追求真相与新知。', reversedGeneral: '八卦、欺骗或缺乏专注。' },
  { suit: 'swords', num: 12, name: { en: 'Knight of Swords', cn: '宝剑骑士' }, keywords: ['行动', '雄心', '冲动', '速度'], symbol: '疾驰冲锋的骑士', uprightGeneral: '快速而雄心勃勃地前进。勇气与速度是优势。', reversedGeneral: '鲁莽、急躁或过于咄咄逼人。' },
  { suit: 'swords', num: 13, name: { en: 'Queen of Swords', cn: '宝剑皇后' }, keywords: ['独立', '清晰', '直接', '诚实'], symbol: '云端持剑的独立女王', uprightGeneral: '独立清晰的判断。直接而诚实的沟通。', reversedGeneral: '冷酷、刻薄或情感隔绝。' },
  { suit: 'swords', num: 14, name: { en: 'King of Swords', cn: '宝剑国王' }, keywords: ['权威', '理性', '公正', '智慧'], symbol: '王座上的智慧国王', uprightGeneral: '理性、权威、公正的决策者。', reversedGeneral: '专制、冷酷或滥用智谋。' },
  // 星币 Pentacles (土) - 物质、财富、健康
  { suit: 'pentacles', num: 1, name: { en: 'Ace of Pentacles', cn: '星币王牌' }, keywords: ['新机会', '丰盛', '物质', '潜力'], symbol: '手中闪烁的星币', uprightGeneral: '物质与财务上的新机会。丰盛的种子已经种下。', reversedGeneral: '机会延迟、财务损失或缺乏规划。' },
  { suit: 'pentacles', num: 2, name: { en: 'Two of Pentacles', cn: '星币二' }, keywords: ['平衡', '适应', '灵活', '节奏'], symbol: '玩弄双币的杂耍者', uprightGeneral: '在变化中保持平衡。灵活应对多任务。', reversedGeneral: '失衡、过度负荷或手忙脚乱。' },
  { suit: 'pentacles', num: 3, name: { en: 'Three of Pentacles', cn: '星币三' }, keywords: ['合作', '技能', '学习', '建造'], symbol: '共建圣殿的工匠', uprightGeneral: '通过团队合作与精湛技艺达成目标。', reversedGeneral: '合作不良、技艺不精或团队不和。' },
  { suit: 'pentacles', num: 4, name: { en: 'Four of Pentacles', cn: '星币四' }, keywords: ['保守', '安全', '囤积', '控制'], symbol: '紧抱金币的守财者', uprightGeneral: '对资源的守护。适度的安全感是好的，但不要过度。', reversedGeneral: '过度吝啬、失去或打开心扉。' },
  { suit: 'pentacles', num: 5, name: { en: 'Five of Pentacles', cn: '星币五' }, keywords: ['贫困', '孤立', '困境', '求助'], symbol: '雪中求助的两人', uprightGeneral: '感到物质或情感上的匮乏。但援助就在附近。', reversedGeneral: '走出困境、获得援助或恢复丰盛。' },
  { suit: 'pentacles', num: 6, name: { en: 'Six of Pentacles', cn: '星币六' }, keywords: ['慷慨', '给予', '公平', '共享'], symbol: '分发金币的施予者', uprightGeneral: '慷慨的给予与接受。资源的公平流动。', reversedGeneral: '给予不公、依附或权力不平衡。' },
  { suit: 'pentacles', num: 7, name: { en: 'Seven of Pentacles', cn: '星币七' }, keywords: ['耐心', '评估', '成长', '等待'], symbol: '凝视藤蔓的农人', uprightGeneral: '耐心等待你的投资成长。评估哪些值得继续。', reversedGeneral: '缺乏耐心、错误投资或需要重新评估。' },
  { suit: 'pentacles', num: 8, name: { en: 'Eight of Pentacles', cn: '星币八' }, keywords: ['勤奋', '技艺', '专注', '精进'], symbol: '专注雕刻的工匠', uprightGeneral: '通过勤奋与专注精进技艺。熟能生巧。', reversedGeneral: '缺乏动力、技艺生疏或低质量产出。' },
  { suit: 'pentacles', num: 9, name: { en: 'Nine of Pentacles', cn: '星币九' }, keywords: ['独立', '丰盛', '自给自足', '优雅'], symbol: '花园中的优雅女子', uprightGeneral: '独立而丰盛。你享受自己创造的成果。', reversedGeneral: '依赖他人、过度奢华或财务不稳。' },
  { suit: 'pentacles', num: 10, name: { en: 'Ten of Pentacles', cn: '星币十' }, keywords: ['财富', '传承', '家族', '稳定'], symbol: '家族团聚的繁荣场景', uprightGeneral: '家族的丰盛与传承。长期稳定的富足。', reversedGeneral: '家族纷争、财富损失或遗产纠纷。' },
  { suit: 'pentacles', num: 11, name: { en: 'Page of Pentacles', cn: '星币侍从' }, keywords: ['学习', '勤奋', '新机会', '踏实'], symbol: '凝神金币的年轻人', uprightGeneral: '踏实学习新技能。新机会正在萌芽。', reversedGeneral: '懒散、学习受阻或错过机会。' },
  { suit: 'pentacles', num: 12, name: { en: 'Knight of Pentacles', cn: '星币骑士' }, keywords: ['可靠', '勤奋', '稳健', '坚持'], symbol: '稳重前行的骑士', uprightGeneral: '可靠而稳健的前进。坚持终有回报。', reversedGeneral: '停滞、过于保守或缺乏动力。' },
  { suit: 'pentacles', num: 13, name: { en: 'Queen of Pentacles', cn: '星币皇后' }, keywords: ['养育', '丰盛', '务实', '关怀'], symbol: '花园中的丰饶女王', uprightGeneral: '务实而养育的能量。丰盛且关怀他人。', reversedGeneral: '过度关注物质或忽视自我。' },
  { suit: 'pentacles', num: 14, name: { en: 'King of Pentacles', cn: '星币国王' }, keywords: ['财富', '权威', '稳定', '成功'], symbol: '富丽堂皇的成功国王', uprightGeneral: '物质与精神的双重富足。成功且慷慨。', reversedGeneral: '贪婪、物质主义或财务不稳。' },
];

// 合并所有数据
function buildMinorCards(): TarotCard[] {
  return MINOR_ARCANA_DATA.map((data) => {
    const meanings = generateMinorMeaning(
      data.num,
      data.suit,
      data.keywords,
      data.uprightGeneral,
      data.reversedGeneral,
    );
    return {
      id: MAJOR_ARCANA.length + MINOR_ARCANA_DATA.indexOf(data),
      name: { en: data.name.en, cn: data.name.cn },
      arcana: 'minor' as const,
      suit: data.suit,
      number: data.num,
      keywords: data.keywords,
      element: meanings.element,
      symbol: data.symbol,
      upright: meanings.upright,
      reversed: meanings.reversed,
    };
  });
}

export const TAROT_CARDS: TarotCard[] = [
  ...MAJOR_ARCANA.map((card) => {
    const ext = MAJOR_EXT[card.id];
    return {
      ...card,
      arcana: 'major' as const,
      upright: { ...card.upright, ...(ext?.upright ?? {}) },
      reversed: { ...card.reversed, ...(ext?.reversed ?? {}) },
    };
  }),
  ...buildMinorCards(),
];

// 工具函数
export const getCardById = (id: number): TarotCard | undefined =>
  TAROT_CARDS.find((c) => c.id === id);

export const getMajorArcana = (): TarotCard[] =>
  TAROT_CARDS.filter((c) => c.arcana === 'major');

export const getMinorArcana = (suit?: Suit): TarotCard[] =>
  TAROT_CARDS.filter((c) => c.arcana === 'minor' && (!suit || c.suit === suit));

// 牌图 SVG 主题色映射
export const SUIT_THEMES: Record<Suit, { color: string; symbol: string; name: string }> = {
  wands: { color: '#e85d04', symbol: '🔥', name: '火 · 行动' },
  cups: { color: '#0096c7', symbol: '💧', name: '水 · 情感' },
  swords: { color: '#c0c0d6', symbol: '⚔️', name: '风 · 思想' },
  pentacles: { color: '#d4af37', symbol: '🌿', name: '土 · 物质' },
};

export const ELEMENT_THEMES: Record<string, { color: string; symbol: string; name: string }> = {
  spirit: { color: '#d4af37', symbol: '✦', name: '灵 · 觉醒' },
  fire: { color: '#e85d04', symbol: '🔥', name: '火 · 行动' },
  water: { color: '#0096c7', symbol: '💧', name: '水 · 情感' },
  air: { color: '#c0c0d6', symbol: '⚔️', name: '风 · 思想' },
  earth: { color: '#d4af37', symbol: '🌿', name: '土 · 物质' },
};
