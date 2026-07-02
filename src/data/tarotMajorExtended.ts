/**
 * 大阿尔卡那 - 扩展解读字段
 * 为 22 张大阿尔卡那牌补全：health/relationship/spiritual/advice/warning/timing
 * 原有字段（general/love/career/wealth）保留在 tarotCards.ts
 */

export type ExtendedReading = {
  health: string;
  relationship: string;
  spiritual: string;
  advice: string;
  warning: string;
  timing: string;
};

/** 卡片 id -> 扩展解读。upright = 正位, reversed = 逆位 */
export const MAJOR_EXT: Record<number, { upright: ExtendedReading; reversed: ExtendedReading }> = {
  0: {
    // 愚者
    upright: {
      health: '精力充沛、状态轻盈。适合开始新的运动或健康习惯。',
      relationship: '朋友圈会迎来新鲜血液，轻松无负担的社交带来快乐。',
      spiritual: '踏上寻找自我的旅程，相信未知会引领你。放下执念，臣服于生命的流动。',
      advice: '勇敢跳出去，相信第一直觉。旅途的乐趣在于不确定。',
      warning: '别把鲁莽当勇气，先看清脚下再迈步。',
      timing: '1-3 个月内会有新的开始浮现。把握眼前的好时机。',
    },
    reversed: {
      health: '注意意外伤害、跌倒或作息紊乱导致的小毛病。',
      relationship: '朋友圈中可能有不靠谱的人，需要识别谁在拖你后腿。',
      spiritual: '陷入空想而非真正的灵性成长，需要脚踏实地。',
      advice: '停下来，先做功课再出发。',
      warning: '不要因为冲动去做任何重大决定。',
      timing: '当前时机未到，等待 1-2 个月再做打算。',
    },
  },
  1: {
    // 魔术师
    upright: {
      health: '身体状态良好，意志力强。适合开始新的健身计划。',
      relationship: '你的人格魅力会吸引贵人，主动社交会带来惊喜。',
      spiritual: '你拥有显化现实的能力，但要用在正途。整合身心灵的力量。',
      advice: '聚焦一个目标，把所有资源集中在一处。',
      warning: '不要用才华操控他人，否则会反噬。',
      timing: '当下就是最好的时机，立刻行动。',
    },
    reversed: {
      health: '压力过大导致亚健康，需要放松神经。',
      relationship: '警惕被他人操控或在关系中失去主动权。',
      spiritual: '才能被浪费在错误方向，需要重新校准意图。',
      advice: '审视自己真正想要的是什么。',
      warning: '远离骗子和不诚实的合作者。',
      timing: '短期内不宜有大动作，先修身养性。',
    },
  },
  2: {
    // 女祭司
    upright: {
      health: '倾听身体的低语，女性特别注意内分泌与情绪周期。',
      relationship: '不必急于表达，沉默本身是一种沟通。某些事不必说破。',
      spiritual: '这是静修冥想的好时机，答案在梦中显现。',
      advice: '不要急于表态，让内在智慧先说话。',
      warning: '不要因直觉而忽视事实的全部。',
      timing: '慢即是快，1-2 个月内会看到原本看不见的真相。',
    },
    reversed: {
      health: '忽视身体信号会导致小病积累，女性注意妇科问题。',
      relationship: '关系中有未被说出的秘密，需要打破沉默。',
      spiritual: '忽视直觉、被表象所迷。重新连接你的内在指南。',
      advice: '主动去了解真相，而不是猜测。',
      warning: '不要在没有信息的情况下做决定。',
      timing: '信息会在 1 周内逐渐浮现。',
    },
  },
  3: {
    // 皇后
    upright: {
      health: '身体丰盈有活力，孕育与创造的象征。可能与怀孕、生产有关。',
      relationship: '家庭、母亲、伴侣的能量充盈。是结婚、怀孕的好时机。',
      spiritual: '通过身体、自然、艺术来连接神圣。大地是灵性最好的老师。',
      advice: '滋养自己，然后才能滋养世界。',
      warning: '不要为他人过度付出而失去自我。',
      timing: '3-6 个月内会看到丰盛的成果。',
    },
    reversed: {
      health: '女性健康需要关注，注意生育系统或情绪问题。',
      relationship: '关系中可能因一方过度依赖而失去平衡。',
      spiritual: '创造力枯竭，需要回归自然充电。',
      advice: '先学会照顾自己，再去照顾他人。',
      warning: '警惕情感操控或窒息的亲密关系。',
      timing: '短期内进展缓慢，需要耐心。',
    },
  },
  4: {
    // 皇帝
    upright: {
      health: '身体硬朗但需注意心血管与压力管理。',
      relationship: '稳定的承诺，长辈或父辈的祝福带来好运。',
      spiritual: '通过纪律、自律建立灵性结构，规律的打坐冥想会有突破。',
      advice: '建立规则、设立边界、稳扎稳打。',
      warning: '不要让控制欲破坏亲密。',
      timing: '长期布局（6-12 个月）会看到成果。',
    },
    reversed: {
      health: '压力大导致失眠、头痛、肌肉紧张。',
      relationship: '关系中可能存在权力斗争或专制倾向。',
      spiritual: '用头脑压制了心灵，需要重新找到柔的部分。',
      advice: '放下控制，学会信任他人。',
      warning: '独裁会让你孤立无援。',
      timing: '短期内会有冲突，但会迅速过去。',
    },
  },
  5: {
    // 教皇
    upright: {
      health: '遵循传统的养生方式会有好的效果。',
      relationship: '通过师长、家族介绍可能遇到合适的对象。重视精神契合。',
      spiritual: '跟随传统智慧或精神导师，回归经典修炼。',
      advice: '学习经典，向有经验的人请教。',
      warning: '不要被教条束缚了思考。',
      timing: '学习、进修、考试的好时机。',
    },
    reversed: {
      health: '反传统的疗法可能有效，但需谨慎验证。',
      relationship: '关系可能与家庭期待冲突，需要勇气做自己。',
      spiritual: '走出自己的灵性道路，质疑权威。',
      advice: '独立思考，找到适合你自己的方式。',
      warning: '不要为了叛逆而叛逆。',
      timing: '短期内会有突破陈规的机会。',
    },
  },
  6: {
    // 恋人
    upright: {
      health: '身心和谐，魅力提升，是改善形象的好时机。',
      relationship: '命中注定的相遇，或关系达到更深承诺。婚姻、订婚、复合的信号。',
      spiritual: '阴阳合一，在关系中修行是上佳的灵性功课。',
      advice: '跟随内心的选择，价值观一致比表面合适更重要。',
      warning: '不要为了迎合而牺牲真实的需求。',
      timing: '重要关系决定会在 1-2 个月内出现。',
    },
    reversed: {
      health: '情绪波动可能影响身体，注意皮肤与过敏。',
      relationship: '关系中出现不和谐、欺骗或价值观冲突。',
      spiritual: '关系成为逃避成长的借口，需要重新审视。',
      advice: '先认清自己，再投入关系。',
      warning: '警惕三角关系或双面人。',
      timing: '短期内会有考验，但也是清理的契机。',
    },
  },
  7: {
    // 战车
    upright: {
      health: '体力旺盛，适合挑战自我。但避免运动伤害。',
      relationship: '主动追求会有结果，但需平衡强势与温柔。',
      spiritual: '用坚定的意志克服修行中的障碍。',
      advice: '锁定目标，驾驭你内心的双狮（理性与感性）。',
      warning: '不要让控制欲掩盖了对他人感受的尊重。',
      timing: '未来 1-3 个月会有突破性进展。',
    },
    reversed: {
      health: '过劳或受伤，需要停下来休息。',
      relationship: '关系中可能存在权力斗争或方向不一致。',
      spiritual: '用蛮力修行反而徒劳，需要静心。',
      advice: '暂停冲刺，反思方向。',
      warning: '硬碰硬只会两败俱伤。',
      timing: '短期内不宜冒进，等待 2-3 个月。',
    },
  },
  8: {
    // 力量
    upright: {
      health: '免疫力强，温和的运动（瑜伽、太极）特别有益。',
      relationship: '以柔克刚，用耐心和爱化解冲突。',
      spiritual: '驯服内心的野兽（恐惧、欲望），温柔的坚持是修行的真谛。',
      advice: '用爱去驯服，而不是用强。',
      warning: '不要让"温柔"变成"软弱"。',
      timing: '持续努力，3-6 个月看到结果。',
    },
    reversed: {
      health: '情绪压制导致身体问题，需要释放压力。',
      relationship: '关系中可能失去耐心或自我价值。',
      spiritual: '被内心的恐惧或欲望控制。',
      advice: '直面你的恐惧，它们往往是纸老虎。',
      warning: '不要用强硬掩盖脆弱。',
      timing: '短期内会有挑战，1-2 个月内度过。',
    },
  },
  9: {
    // 隐者
    upright: {
      health: '适合独处静养，避免过度社交消耗。',
      relationship: '需要独处反思感情，或寻找精神导师。',
      spiritual: '这是入山修行、闭关、深度冥想的召唤。',
      advice: '退后一步，灯在你心中。',
      warning: '独处不是逃避，要避免彻底封闭。',
      timing: '长期课题，未来 6-12 个月的沉淀。',
    },
    reversed: {
      health: '孤立可能带来心理问题，需要适度社交。',
      relationship: '因过度封闭而错失关系机会。',
      spiritual: '与社群完全切断会失去滋养。',
      advice: '向外寻求支持不是软弱。',
      warning: '不要让自己陷入"孤高"的幻觉。',
      timing: '短期内适合社交活动，打开自己。',
    },
  },
  10: {
    // 命运之轮
    upright: {
      health: '身体节律与自然同步会有奇效。',
      relationship: '命运般的相遇，或关系进入新循环。',
      spiritual: '理解无常，生命的轮回本身就是灵性。',
      advice: '顺势而为，不要强求。',
      warning: '好运不等于稳赢，保持谦逊。',
      timing: '当下是转折点，把握 1-3 个月的关键窗口。',
    },
    reversed: {
      health: '注意生活节律紊乱导致的小毛病。',
      relationship: '关系进入低谷期，需要耐心等待转机。',
      spiritual: '抗拒变化的执着让你痛苦。',
      advice: '接受低谷本身也是转机。',
      warning: '不要在低谷时做重大决定。',
      timing: '短期内会持续低迷，2-3 个月后回升。',
    },
  },
  11: {
    // 正义
    upright: {
      health: '平衡饮食与运动，建立规律。',
      relationship: '关系需要公平与对等的付出。',
      spiritual: '因果业力显现，做正确的事会带来回报。',
      advice: '诚实、客观地评估现状。',
      warning: '不要为了"公平"而斤斤计较。',
      timing: '法律、合约、判决等会在 1-3 个月内明朗。',
    },
    reversed: {
      health: '失衡导致亚健康，需要重新建立生活节律。',
      relationship: '关系中存在不公或欺骗。',
      spiritual: '逃避责任、推卸业力。',
      advice: '承担属于自己的部分。',
      warning: '法律或合约问题需要专业意见。',
      timing: '短期内不宜做重大决定，等待真相浮现。',
    },
  },
  12: {
    // 倒吊人
    upright: {
      health: '注意颈椎、腰椎，避免久坐。',
      relationship: '关系需要换个角度看待，暂停可能带来突破。',
      spiritual: '放下我执，从颠倒的视角看到真相。',
      advice: '接受"悬而未决"的状态，答案会自然显现。',
      warning: '不要把牺牲当作唯一的修行方式。',
      timing: '短期内不会有结果，需要 3-6 个月的沉淀。',
    },
    reversed: {
      health: '拖延治疗会让小病变大。',
      relationship: '僵持不下、彼此消耗。',
      spiritual: '无谓的牺牲或抗拒改变。',
      advice: '做出决定，悬着比落地更累。',
      warning: '不要陷入受害者心态。',
      timing: '需要立即行动，长期拖延会错失机会。',
    },
  },
  13: {
    // 死神
    upright: {
      health: '适合改变旧习惯，身体的蜕变期。',
      relationship: '结束旧模式才能迎来新关系。',
      spiritual: '向死而生，结束是新的开始。',
      advice: '勇敢告别过去，凤凰涅槃。',
      warning: '死亡不是失败，是新生的必要。',
      timing: '3-6 个月内完成一次彻底蜕变。',
    },
    reversed: {
      health: '抗拒必要的医疗或健康改变会让情况恶化。',
      relationship: '勉强维持的关系让你窒息。',
      spiritual: '害怕终结导致无法重生。',
      advice: '在抗拒中你会找到真正重要的东西。',
      warning: '拖延不会让死亡消失，只是延迟。',
      timing: '短期内无法避免改变，不如主动迎接。',
    },
  },
  14: {
    // 节制
    upright: {
      health: '平衡饮食、规律作息、身心调和。',
      relationship: '关系需要平衡艺术，融合彼此的差异。',
      spiritual: '中道修行，融合对立面。',
      advice: '不急不躁，调和各方。',
      warning: '不要为了平衡而失去立场。',
      timing: '6-12 个月的长期调和过程。',
    },
    reversed: {
      health: '失衡、暴饮暴食或极端节食都不可取。',
      relationship: '关系中一方过度付出或索取。',
      spiritual: '失去中道，偏执一端。',
      advice: '重新审视生活中哪些是过度的。',
      warning: '极端行为会带来反噬。',
      timing: '短期内需要主动调整。',
    },
  },
  15: {
    // 恶魔
    upright: {
      health: '注意成瘾行为（烟酒、熬夜、屏幕）的反噬。',
      relationship: '关系可能陷入纠缠、控制或不健康的依赖。',
      spiritual: '直面内心的阴影，欲望不是敌人。',
      advice: '认清束缚你的锁链往往是自造的。',
      warning: '小心债务、不健康的合作。',
      timing: '短期内会看到诱惑的实质。',
    },
    reversed: {
      health: '正在脱离不良习惯，状态开始回升。',
      relationship: '挣脱控制性关系，恢复自由。',
      spiritual: '觉醒、打破幻觉、重获力量。',
      advice: '你已经看到了光，继续走。',
      warning: '不要在解脱后又被新事物束缚。',
      timing: '1-3 个月内完成脱困。',
    },
  },
  16: {
    // 塔
    upright: {
      health: '突发事件可能影响健康，需要有应急方案。',
      relationship: '关系中隐藏的矛盾会突然爆发。',
      spiritual: '摧毁虚假的自我，让真实浮现。',
      advice: '接受崩塌，让真相来敲门。',
      warning: '不要在混乱中做重大决定。',
      timing: '突变会很快发生（数日到数周）。',
    },
    reversed: {
      health: '避免了的灾难，但仍需留意余波。',
      relationship: '关系正在内部崩塌，需要主动干预。',
      spiritual: '内在的小我正在瓦解。',
      advice: '主动拆掉旧结构，比被动倒塌更好。',
      warning: '不要拒绝已经发生的真相。',
      timing: '短期内仍有余震，需要 1-2 个月稳定。',
    },
  },
  17: {
    // 星星
    upright: {
      health: '身心充满希望，疗愈中的好兆头。',
      relationship: '温柔而清澈的关系，灵性的伴侣。',
      spiritual: '这是最有灵感的时期，相信你的愿景。',
      advice: '跟随星光，相信宇宙的指引。',
      warning: '不要让希望取代行动。',
      timing: '3-6 个月内愿景会逐步实现。',
    },
    reversed: {
      health: '精神萎靡，需要休息与大自然疗愈。',
      relationship: '对关系失去信心，需要重新点燃希望。',
      spiritual: '灵感枯竭，与源头的连接断了。',
      advice: '回到最简单的事物，重拾信心。',
      warning: '不要陷入自怜。',
      timing: '短期内会持续低迷，1-2 个月后回升。',
    },
  },
  18: {
    // 月亮
    upright: {
      health: '注意睡眠、情绪、过敏等"看不见"的问题。',
      relationship: '关系中有不确定或隐瞒，需要时间明朗。',
      spiritual: '潜入潜意识，梦境是重要的指引。',
      advice: '不要在迷雾中做决定。',
      warning: '警惕幻象和自欺。',
      timing: '短期内容易看不清，需要 1-2 个月水落石出。',
    },
    reversed: {
      health: '潜藏的健康问题开始显现。',
      relationship: '关系中的误解逐渐消散。',
      spiritual: '迷雾散去，真相浮现。',
      advice: '释放恐惧，拥抱清晰。',
      warning: '不要因为看清了而变得冷酷。',
      timing: '1-2 周内会有重大明朗。',
    },
  },
  19: {
    // 太阳
    upright: {
      health: '活力四射，是改善健康的黄金期。',
      relationship: '阳光般的爱，关系充满喜悦。',
      spiritual: '光明与喜悦本身就是灵性的体现。',
      advice: '享受当下，把快乐分享出去。',
      warning: '不要让"成功"冲昏头脑。',
      timing: '当下就是最好的时机，立即行动。',
    },
    reversed: {
      health: '暂时的疲惫或亚健康，需要调整。',
      relationship: '关系表面快乐但缺乏深度。',
      spiritual: '活在表面的光中，未触及内在的太阳。',
      advice: '深呼吸，回到内心的喜悦源头。',
      warning: '不要因为一时的阴云就否定阳光。',
      timing: '短暂的阴天，1-2 周后转晴。',
    },
  },
  20: {
    // 审判
    upright: {
      health: '身体的觉醒，可能开始新的健康方式。',
      relationship: '关系中的觉醒时刻，可能重燃旧情或得到新的顿悟。',
      spiritual: '这是灵魂觉醒的号角，回应更高的召唤。',
      advice: '宽恕过去，迎接新生。',
      warning: '不要让评判心成为障碍。',
      timing: '1-3 个月内会有重要转折。',
    },
    reversed: {
      health: '忽视身体的警告，需要认真对待。',
      relationship: '无法宽恕过去，让关系卡住。',
      spiritual: '拒绝内在的召唤，错失觉醒机会。',
      advice: '自我审视，是什么阻碍了你？',
      warning: '不要在审判别人之前先审判自己。',
      timing: '短期内难有突破，需要深层自省。',
    },
  },
  21: {
    // 世界
    upright: {
      health: '身心圆满，状态达到巅峰。',
      relationship: '关系圆满，可能是结婚、深度承诺的标志。',
      spiritual: '一个周期的完成，灵性上的圆满。',
      advice: '庆祝完成，准备好下一段旅程。',
      warning: '圆满不是终点，是新循环的起点。',
      timing: '当下即是圆满，把握这个高点。',
    },
    reversed: {
      health: '接近完成但还有小尾巴需要处理。',
      relationship: '关系接近完成但还差临门一脚。',
      spiritual: '无法完成一个周期，旧课题重来。',
      advice: '再坚持一下，你已经接近终点了。',
      warning: '不要在最后一刻放弃。',
      timing: '数周到数月内会完成。',
    },
  },
};
