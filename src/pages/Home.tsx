import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Eye, Compass, BookOpen, History as HistoryIcon, ArrowRight, Clock, Layers } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import MysticRing from '@/components/effects/MysticRing';
import RuneShower from '@/components/effects/RuneShower';
import SparkleTrail from '@/components/effects/SparkleTrail';
import TarotCard from '@/components/tarot/TarotCard';
import { TAROT_CARDS } from '@/data/tarotCards';
import { SPREADS } from '@/data/spreads';

const SPREAD_CARDS = [
  {
    key: 'single' as const,
    icon: Eye,
    accent: 'from-amber-400/20 to-amber-600/5',
    duration: '约 1 分钟',
    level: '入门',
  },
  {
    key: 'three' as const,
    icon: Compass,
    accent: 'from-violet-400/20 to-violet-600/5',
    duration: '约 3 分钟',
    level: '进阶',
  },
  {
    key: 'celtic' as const,
    icon: Sparkles,
    accent: 'from-rose-400/20 to-rose-600/5',
    duration: '约 8 分钟',
    level: '深度',
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: '沉浸式仪式体验',
    desc: '冥想、洗牌、选牌、揭晓，每个环节精心设计，让占卜成为一场内在的仪式。',
  },
  {
    icon: BookOpen,
    title: '完整 78 张牌图鉴',
    desc: '22 张大阿尔卡那 + 56 张小阿尔卡那，详尽的中文释义与象征解读。',
  },
  {
    icon: HistoryIcon,
    title: '历史记录追踪',
    desc: '每一次占卜都被珍藏，随时回看过去与宇宙的对话。',
  },
];

const NOTICES = [
  { title: '静心凝神', desc: '在开始前深呼吸三次，让杂念沉淀，让问题清晰浮现。' },
  { title: '明确问题', desc: '心中有一个具体的问题，避免模糊或泛泛的询问。' },
  { title: '开放之心', desc: '接受任何结果，不因牌面不合预期而抗拒——宇宙的答案自有其深意。' },
];

export default function Home() {
  // 装饰用牌（从 78 张中抽 5 张展示）
  const displayCards = [0, 1, 2, 3, 6];

  return (
    <PageLayout>
      {/* ================== Hero ================== */}
      {/* 视觉层级: 标题(E) > 副标 > 描述 > CTA - F 视觉 */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        {/* 中心装饰环 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <MysticRing size={600} rings={3} />
        </div>

        {/* 飘落的符文 */}
        <RuneShower count={18} className="z-0" />

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="text-center">
            {/* 顶部小标签 - 一行 */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-7"
            >
              <span className="h-px w-8 sm:w-14 bg-gradient-to-r from-transparent to-mystic-gold/50" />
              <Sparkles className="w-3.5 h-3.5 text-mystic-gold animate-pulse" />
              <span className="font-title text-[10px] sm:text-xs text-mystic-gold/80 tracking-[0.35em] uppercase">
                Mystic Tarot
              </span>
              <Sparkles className="w-3.5 h-3.5 text-mystic-gold animate-pulse" />
              <span className="h-px w-8 sm:w-14 bg-gradient-to-l from-transparent to-mystic-gold/50" />
            </motion.div>

            {/* 主标题 - 一行一个词 */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight"
            >
              <span className="block text-gold-gradient glow-text">塔罗秘境</span>
            </motion.h1>

            {/* 副标 - 14-16px 标题区 */}
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35 }}
              className="mt-5 sm:mt-6 font-title text-lg sm:text-xl md:text-2xl text-midnight-100/90 tracking-[0.18em]"
            >
              <span className="text-mystic-lightgold">✦</span>
              <span className="mx-2">揭开命运的薄纱</span>
              <span className="text-mystic-lightgold">✦</span>
            </motion.h2>

            {/* 描述 - 14-15px 段落，左对齐更利扫读 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.55 }}
              className="mt-5 sm:mt-6 font-body text-[15px] sm:text-base text-midnight-200/85 max-w-xl mx-auto leading-relaxed"
            >
              78 张古老的卡牌，承载宇宙的智慧。
              <br className="hidden sm:block" />
              在星辰的指引下，聆听内心的回响，遇见未知的自己。
            </motion.p>

            {/* CTA - 主+次 横排 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.75 }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            >
              <Link to="/reading" className="btn-mystic group relative overflow-visible text-sm sm:text-base px-6 py-3">
                <span className="relative z-10 flex items-center">
                  <span>开始占卜</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </span>
                <SparkleTrail count={8} duration={2.5} />
              </Link>
              <Link to="/tarot" className="btn-ghost text-sm sm:text-base px-5 py-3">
                探索图鉴
              </Link>
            </motion.div>
          </div>

          {/* 飘浮的牌 - 装饰 */}
          <div className="relative h-32 sm:h-40 mt-8 sm:mt-12 hidden md:block">
            {displayCards.map((id, idx) => {
              const positions = [
                { left: '15%', top: '20px', rotate: -15 },
                { left: '30%', top: '-30px', rotate: -5 },
                { left: '50%', top: '10px', rotate: 0, transform: 'translateX(-50%)' },
                { left: '70%', top: '-30px', rotate: 5 },
                { left: '85%', top: '20px', rotate: 15 },
              ];
              const pos = positions[idx];
              return (
                <motion.div
                  key={id}
                  className="absolute"
                  style={{ left: pos.left, top: pos.top, rotate: pos.rotate }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{
                    opacity: 1,
                    y: [0, -10, 0],
                  }}
                  transition={{
                    opacity: { duration: 1, delay: 0.5 + idx * 0.1 },
                    y: {
                      duration: 4 + idx * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: idx * 0.3,
                    },
                  }}
                >
                  <TarotCard
                    card={TAROT_CARDS[id]}
                    flipped
                    size="sm"
                    autoFlip
                    interactive={false}
                    noText
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 向下滚动提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-mystic-gold/50"
        >
          <div className="w-5 h-8 border border-mystic-gold/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-mystic-gold/70 rounded-full mt-1.5" />
          </div>
        </motion.div>
      </section>

      {/* ================== 牌阵选择 ================== */}
      {/* 视觉：横向网格(桌面) / 垂直堆叠(手机) - 第一行是标题 */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            kicker="第一步"
            title="选择你的牌阵"
            subtitle="每一种牌阵都对应不同的提问深度。从简明的一日指引，到深邃的十面人生剖析。"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {SPREAD_CARDS.map((item, idx) => {
              const spread = SPREADS[item.key];
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: idx * 0.12 }}
                  whileHover={{ y: -6 }}
                  className="group"
                >
                  <Link to="/reading" className="block h-full">
                    <div className="relative h-full glass-panel rounded-2xl p-5 sm:p-6 overflow-hidden transition-all duration-500 hover:border-mystic-gold/50 hover:shadow-gold-glow">
                      {/* 背景渐变 */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                      {/* 顶部装饰线 */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mystic-gold/40 to-transparent" />

                      <div className="relative z-10 flex flex-col h-full">
                        {/* 第一行：图标 + 难度 */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-11 h-11 rounded-full bg-mystic-gold/10 border border-mystic-gold/30 flex items-center justify-center group-hover:bg-mystic-gold/20 transition-colors">
                            <Icon className="w-5 h-5 text-mystic-gold" />
                          </div>
                          <span className="text-[11px] font-title tracking-widest text-mystic-gold/70 px-2 py-0.5 rounded-full border border-mystic-gold/25">
                            {item.level}
                          </span>
                        </div>

                        {/* 标题区：牌阵名 + 描述 */}
                        <h3 className="font-display text-xl sm:text-2xl text-midnight-50 mb-1.5 group-hover:text-mystic-lightgold transition-colors">
                          {spread.name}
                        </h3>
                        <p className="font-title text-sm text-mystic-gold/75 tracking-wider mb-3">
                          {spread.description}
                        </p>
                        <p className="font-body text-sm text-midnight-200/80 leading-relaxed mb-4">
                          {spread.longDescription}
                        </p>

                        {/* 底部：meta + 箭头 */}
                        <div className="mt-auto pt-4 border-t border-mystic-gold/10 flex items-center justify-between text-xs">
                          <span className="font-sans-ui text-midnight-200/65 flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5" />
                            <span>{spread.cardCount} 张牌</span>
                            <span className="text-mystic-gold/30">·</span>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.duration}</span>
                          </span>
                          <ArrowRight className="w-4 h-4 text-mystic-gold/60 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================== 特性 ================== */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            kicker="独特之处"
            title="为何选择塔罗秘境"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="glass-panel rounded-2xl p-5 sm:p-6 hover:border-mystic-gold/40 transition-colors"
                >
                  {/* 顶部：图标 */}
                  <div className="w-12 h-12 mb-4 rounded-full bg-mystic-gold/10 border border-mystic-gold/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-mystic-gold" />
                  </div>
                  {/* 标题 */}
                  <h3 className="font-display text-lg text-mystic-lightgold mb-2">
                    {feature.title}
                  </h3>
                  {/* 描述 */}
                  <p className="font-body text-sm text-midnight-200/80 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================== 占卜须知 ================== */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            kicker="开始前"
            title="占卜前请记得"
          />

          <div className="space-y-3 sm:space-y-4">
            {NOTICES.map((notice, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                className="glass-panel rounded-xl p-4 sm:p-5 flex items-start gap-4 sm:gap-5 hover:border-mystic-gold/40 transition-colors"
              >
                {/* 编号气泡 */}
                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-mystic-gold/10 border border-mystic-gold/40 flex items-center justify-center font-display text-mystic-gold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-title text-base sm:text-lg text-mystic-lightgold mb-1">
                    {notice.title}
                  </h3>
                  <p className="font-body text-sm sm:text-[15px] text-midnight-200/80 leading-relaxed">
                    {notice.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 底部 CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="text-center mt-12 sm:mt-16"
          >
            <Link to="/reading" className="btn-mystic text-sm sm:text-base px-7 py-3.5">
              <Sparkles className="w-4 h-4 mr-2" />
              准备就绪 · 踏入秘境
            </Link>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}

/**
 * 统一的 Section 头部：kicker(小标签) + 标题 + 副标
 * - 标题统一在中央，竖向 stack 更利扫读
 * - 适配移动：标题字号略小、副标不超 2 行
 */
function SectionHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
      className="text-center mb-10 sm:mb-14"
    >
      <div className="text-[10px] sm:text-[11px] font-title tracking-[0.35em] uppercase text-mystic-gold/80 mb-3 sm:mb-4">
        ✦ {kicker} ✦
      </div>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-gold-gradient glow-text leading-tight">
        {title}
      </h2>
      <div className="rune-divider mt-5 sm:mt-6 max-w-xs mx-auto">
        <span className="text-mystic-gold/60 text-xs">✦</span>
      </div>
      {subtitle && (
        <p className="mt-5 sm:mt-6 font-body italic text-sm sm:text-[15px] text-midnight-200/75 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
