import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, History, Sparkles, Heart, Briefcase, Coins, BookOpen, Users, Sprout, Compass } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import TarotCard from '@/components/tarot/TarotCard';
import EnergyVortex from '@/components/effects/EnergyVortex';
import SparkleTrail from '@/components/effects/SparkleTrail';
import { useReadingUI, useReadingActions } from '@/store/selectors';
import { SPREADS, getSpreadPositions, THREE_MODES } from '@/data/spreads';
import { getQuestionTheme, QUESTION_THEMES, type CardDimension, type QuestionTheme, type ThreeMode } from '@/data/questionThemes';
import { cn } from '@/lib/utils';

export default function Result() {
  const navigate = useNavigate();
  const { drawnCards, spreadType, question, threeMode } = useReadingUI();
  const { reset } = useReadingActions();

  useEffect(() => {
    if (drawnCards.length === 0 || !spreadType) {
      navigate('/reading', { replace: true });
    }
  }, [drawnCards, spreadType, navigate]);

  if (drawnCards.length === 0 || !spreadType) {
    return null;
  }

  const spread = SPREADS[spreadType];
  // 三张牌阵根据 threeMode 拿位置
  const positions = getSpreadPositions(spreadType, threeMode);
  const theme = getQuestionTheme(question);
  const modeLabel = spreadType === 'three' ? THREE_MODES[threeMode] : null;

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* 顶部导航 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 sm:mb-12"
        >
          <button
            onClick={() => {
              reset();
              navigate('/');
            }}
            className="btn-ghost text-xs"
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            返回首页
          </button>
          <div className="text-center">
            <div className="font-title text-xs sm:text-sm text-mystic-gold/80 tracking-widest">
              {spread.name}
              {modeLabel && (
                <span className="ml-1.5 text-mystic-gold/60">· {modeLabel.name}</span>
              )}
            </div>
            <div className="text-xs text-midnight-300/60 mt-1">
              {drawnCards.length} 张牌 · {new Date().toLocaleDateString('zh-CN')}
            </div>
          </div>
          <Link
            to="/reading"
            onClick={() => reset()}
            className="btn-mystic text-xs"
          >
            <RotateCw className="w-3 h-3 mr-2" />
            重新占卜
          </Link>
        </motion.div>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8 sm:mb-12 relative"
        >
          <div className="relative inline-block">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-gold-gradient glow-text">
              解读
            </h1>
            <div className="absolute inset-0 -m-8 pointer-events-none">
              <SparkleTrail count={8} duration={3} />
            </div>
          </div>
          <div className="rune-divider mt-4 max-w-xs mx-auto">
            <span className="text-mystic-gold/60 text-xs">✦</span>
          </div>
          {question && (
            <div className="mt-6 max-w-2xl mx-auto glass-panel rounded-2xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2 justify-center">
                <span className="text-xs font-title text-mystic-gold/80 tracking-widest">
                  ✦ 你所问
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-mystic-gold/15 text-mystic-lightgold border border-mystic-gold/30">
                  {theme.label}主题
                </span>
              </div>
              <p className="font-body italic text-base sm:text-lg text-midnight-100/90 text-center">
                {question}
              </p>
            </div>
          )}
        </motion.div>

        {/* 牌阵展示 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10 sm:mb-14"
        >
          <SectionLabel
            step="01"
            kicker="你的牌阵"
            help="先看牌面，再看解读"
          />
          <SpreadLayout
            cards={drawnCards}
            positions={positions}
            spreadType={spreadType}
          />
        </motion.section>

        {/* 单牌解读 - 在综合解读之前 - 让用户先看每张牌的细节 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-6 sm:space-y-8 mb-10 sm:mb-14"
        >
          <SectionLabel
            step="02"
            kicker="单牌解读"
            help="逐张阅读，每张都有专属的回应"
          />
          {drawnCards.map((drawn, idx) => (
            <CardInterpretation
              key={idx}
              card={drawn.card}
              reversed={drawn.reversed}
              position={positions[drawn.position]}
              index={idx}
              theme={theme}
            />
          ))}
        </motion.section>

        {/* 综合解读 - 最后总览 */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12 sm:mb-16"
        >
          <SectionLabel
            step="03"
            kicker="综合解读"
            help="把所有牌的线索连成画面"
            accent
          />
          <div className="glass-panel-strong rounded-2xl p-5 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mystic-gold/50 to-transparent" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-mystic-gold/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <EnergyVortex size={56} rings={3} speed={1.5} />
                <div>
                  <h2 className="font-display text-xl sm:text-2xl text-mystic-lightgold glow-text leading-tight">
                    综合解读
                  </h2>
                  <p className="text-[10px] sm:text-xs text-midnight-300/60 mt-0.5">
                    {spreadType === 'single' && '一张牌的全面解析'}
                    {spreadType === 'three' && `三张牌 · ${modeLabel?.name}`}
                    {spreadType === 'celtic' && '凯尔特十字 · 十大要素的聚合'}
                  </p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <SynthesisReading
                  spreadType={spreadType}
                  threeMode={threeMode}
                  cards={drawnCards}
                  question={question}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 底部操作 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="rune-divider mb-6 max-w-md mx-auto">
            <span className="text-mystic-gold/60 text-xs">✦</span>
          </div>
          <p className="font-body italic text-sm text-midnight-200/70 mb-8 max-w-xl mx-auto">
            牌面所映照的，是当下能量的流动。
            <br />
            真正决定未来的，是你接下来的每一个选择。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/reading"
              onClick={() => reset()}
              className="btn-mystic"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              重新占卜
            </Link>
            <Link to="/history" className="btn-ghost">
              <History className="w-4 h-4 mr-2" />
              查看历史
            </Link>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}

// === 牌阵展示 ===
function SpreadLayout({
  cards,
  positions,
  spreadType,
}: {
  cards: any[];
  positions: any[];
  spreadType: 'single' | 'three' | 'celtic';
}) {
  if (spreadType === 'single') {
    return (
      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <TarotCard
            card={cards[0].card}
            reversed={cards[0].reversed}
            flipped
            size="xl"
            interactive={false}
            autoFlip
          />
          <div className="mt-4 text-center">
            <div className="font-title text-base sm:text-lg text-mystic-lightgold">
              {positions[0]?.name} · {positions[0]?.meaning}
            </div>
            <div className="mt-1 text-xs text-midnight-200/70 font-body italic">
              {positions[0]?.description}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (spreadType === 'three') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="flex flex-col items-center"
          >
            <TarotCard
              card={c.card}
              reversed={c.reversed}
              flipped
              size="lg"
              autoFlip
              interactive={false}
            />
            <div className="mt-3 text-center">
              <div className="font-title text-sm text-mystic-lightgold">
                {positions[c.position]?.name}
              </div>
              <div className="text-xs text-midnight-300/60 mt-0.5">
                {positions[c.position]?.meaning}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Celtic Cross - 10 张牌的复杂布局
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((c, i) => {
          const pos = positions[c.position];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-center"
            >
              <div className="text-xs font-sans-ui text-mystic-gold/70 tracking-wider mb-1">
                {String(c.position + 1).padStart(2, '0')}
              </div>
              <TarotCard
                card={c.card}
                reversed={c.reversed}
                flipped
                size="md"
                autoFlip
                interactive={false}
              />
              <div className="mt-2 text-center">
                <div className="font-title text-xs sm:text-sm text-mystic-lightgold">
                  {pos?.name}
                </div>
                <div className="text-[10px] sm:text-xs text-midnight-300/60 mt-0.5">
                  {pos?.meaning}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// === 单张牌解读 ===
function CardInterpretation({
  card,
  reversed,
  position,
  index,
  theme,
}: {
  card: any;
  reversed: boolean;
  position: any;
  index: number;
  theme: QuestionTheme;
}) {
  const reading = reversed ? card.reversed : card.upright;
  const isMajor = card.arcana === 'major';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="glass-panel rounded-2xl p-5 sm:p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mystic-gold/40 to-transparent" />

      <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
        {/* 牌面 */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <TarotCard
            card={card}
            reversed={reversed}
            flipped
            size="md"
            autoFlip
            interactive={false}
          />
        </div>

        {/* 解读内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-sans-ui text-mystic-gold/70 tracking-widest">
              {String(index + 1).padStart(2, '0')}
            </span>
            {position && (
              <>
                <span className="text-xs text-midnight-300/50">·</span>
                <span className="text-xs font-title text-mystic-gold/80">
                  {position.name}
                </span>
              </>
            )}
            {reversed && (
              <span className="text-xs px-2 py-0.5 rounded-full border border-rose-400/40 text-rose-400/90 font-title">
                逆位
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-mystic-gold/15 text-mystic-lightgold border border-mystic-gold/30">
              ✦ {theme.label}主题
            </span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl text-gold-gradient mb-1">
            {card.name.cn}
          </h3>
          <div className="text-xs text-midnight-300/60 font-title tracking-widest mb-4">
            {card.name.en.toUpperCase()}
            <span className="mx-2 text-mystic-gold/40">·</span>
            {card.element === 'spirit' ? '灵' : card.element === 'fire' ? '火' : card.element === 'water' ? '水' : card.element === 'air' ? '风' : '土'}
            {isMajor && <span className="ml-2 text-mystic-gold/70">大阿尔卡那</span>}
          </div>

          {/* 关键词 */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5">
            {card.keywords.map((kw: string) => (
              <span
                key={kw}
                className="text-xs px-2.5 py-1 rounded-full border border-mystic-gold/30 bg-mystic-gold/5 text-mystic-gold/90"
              >
                {kw}
              </span>
            ))}
          </div>

          {/* 牌位说明 */}
          {position && (
            <div className="mb-4 text-sm font-body italic text-midnight-200/70 border-l-2 border-mystic-gold/40 pl-3">
              {position.description}
            </div>
          )}

          {/* 主维度解读 - 与问题主题强关联 */}
          <div className="mb-5 relative">
            <SectionTitle
              icon={<DimensionIcon dimension={theme.primaryDimension} />}
              title={`对「${theme.label}」的回应`}
              highlight
            />
            <p className="font-body text-sm sm:text-base text-midnight-100 leading-relaxed">
              {reading[theme.primaryDimension]}
            </p>
          </div>

          {/* 次维度解读 - 补充视角 */}
          {theme.secondaryDimension !== theme.primaryDimension && theme.secondaryDimension !== 'general' && (
            <div className="mb-5">
              <SectionTitle
                icon={<DimensionIcon dimension={theme.secondaryDimension} />}
                title={`补充视角 · ${DIMENSION_LABEL[theme.secondaryDimension]}`}
              />
              <p className="font-body text-sm sm:text-base text-midnight-200/85 leading-relaxed">
                {reading[theme.secondaryDimension]}
              </p>
            </div>
          )}

          {/* 核心指引 - 总览 */}
          <div className="mb-3">
            <SectionTitle icon={<Sparkles className="w-3.5 h-3.5" />} title="核心指引" />
            <p className="font-body text-sm sm:text-base text-midnight-200/85 leading-relaxed">
              {reading.general}
            </p>
          </div>

          {/* 扩展指引 - 健康/人际/灵性/建议/警示/时间 */}
          {(reading.health || reading.relationship || reading.spiritual) && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {reading.health && (
                <div className="rounded-lg p-2.5 border border-emerald-400/25 bg-emerald-400/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sprout className="w-3 h-3 text-emerald-400/80" />
                    <span className="text-[10px] font-title text-emerald-400/85 tracking-widest">身心健康</span>
                  </div>
                  <p className="text-xs text-midnight-200/85 leading-relaxed">{reading.health}</p>
                </div>
              )}
              {reading.relationship && (
                <div className="rounded-lg p-2.5 border border-sky-400/25 bg-sky-400/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="w-3 h-3 text-sky-400/80" />
                    <span className="text-[10px] font-title text-sky-400/85 tracking-widest">人际往来</span>
                  </div>
                  <p className="text-xs text-midnight-200/85 leading-relaxed">{reading.relationship}</p>
                </div>
              )}
              {reading.spiritual && (
                <div className="rounded-lg p-2.5 border border-violet-400/25 bg-violet-400/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Compass className="w-3 h-3 text-violet-400/80" />
                    <span className="text-[10px] font-title text-violet-400/85 tracking-widest">灵性启示</span>
                  </div>
                  <p className="text-xs text-midnight-200/85 leading-relaxed">{reading.spiritual}</p>
                </div>
              )}
            </div>
          )}

          {(reading.advice || reading.warning || reading.timing) && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {reading.advice && (
                <div className="rounded-lg p-2.5 border border-mystic-gold/40 bg-mystic-gold/8">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-mystic-lightgold text-xs">✦</span>
                    <span className="text-[10px] font-title text-mystic-lightgold tracking-widest">行动指引</span>
                  </div>
                  <p className="text-xs text-midnight-100/90 leading-relaxed">{reading.advice}</p>
                </div>
              )}
              {reading.warning && (
                <div className="rounded-lg p-2.5 border border-rose-400/30 bg-rose-400/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-rose-400/80 text-xs">⚠</span>
                    <span className="text-[10px] font-title text-rose-400/85 tracking-widest">需要留意</span>
                  </div>
                  <p className="text-xs text-midnight-100/90 leading-relaxed">{reading.warning}</p>
                </div>
              )}
              {reading.timing && (
                <div className="rounded-lg p-2.5 border border-amber-400/30 bg-amber-400/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-amber-400/85 text-xs">⏳</span>
                    <span className="text-[10px] font-title text-amber-400/85 tracking-widest">时间提示</span>
                  </div>
                  <p className="text-xs text-midnight-100/90 leading-relaxed">{reading.timing}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const DIMENSION_LABEL: Record<CardDimension, string> = {
  love: '爱情',
  career: '事业',
  wealth: '财富',
  general: '综合',
};

const DIMENSION_ICON: Record<CardDimension, any> = {
  love: Heart,
  career: Briefcase,
  wealth: Coins,
  general: Sparkles,
};

function DimensionIcon({ dimension }: { dimension: CardDimension }) {
  const Icon = DIMENSION_ICON[dimension];
  return <Icon className="w-3.5 h-3.5" />;
}

function SectionTitle({
  icon,
  title,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={cn(highlight ? 'text-mystic-lightgold' : 'text-mystic-gold')}>
        {icon}
      </span>
      <span
        className={cn(
          'font-title text-xs sm:text-sm tracking-widest',
          highlight ? 'text-mystic-lightgold' : 'text-mystic-gold/90',
        )}
      >
        {title}
      </span>
      {highlight && (
        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-mystic-gold/20 text-mystic-lightgold border border-mystic-gold/40">
          重点
        </span>
      )}
    </div>
  );
}

/**
 * Section 标签 - 与 Reading 页统一的 step / kicker / help 结构
 * 适配阅读习惯：编号 + 标题 + 帮助文字
 */
function SectionLabel({
  step,
  kicker,
  help,
  accent = false,
}: {
  step: string;
  kicker: string;
  help?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-5 sm:mb-6 pb-3 border-b border-mystic-gold/10">
      <div className="flex items-baseline gap-2 sm:gap-3 min-w-0">
        <span
          className={cn(
            'text-[10px] sm:text-[11px] font-display tracking-widest shrink-0',
            accent ? 'text-mystic-lightgold' : 'text-mystic-gold/60',
          )}
        >
          {step}
        </span>
        <h3
          className={cn(
            'text-lg sm:text-xl font-title tracking-wider leading-tight',
            accent ? 'text-mystic-lightgold' : 'text-mystic-gold',
          )}
        >
          {kicker}
        </h3>
      </div>
      {help && (
        <span className="text-[10px] sm:text-[11px] text-midnight-300/65 font-body italic truncate min-w-0 max-w-[60%]">
          {help}
        </span>
      )}
    </div>
  );
}

// === 综合解读 ===
function SynthesisReading({
  spreadType,
  threeMode,
  cards,
  question,
}: {
  spreadType: 'single' | 'three' | 'celtic';
  threeMode: ThreeMode;
  cards: any[];
  question: string;
}) {
  const theme = getQuestionTheme(question);
  const reversedCount = cards.filter((c) => c.reversed).length;
  const elements = cards.map((c) => c.card.element);
  const dominantElement = ['fire', 'water', 'air', 'earth', 'spirit']
    .map((el) => ({ el, count: elements.filter((e) => e === el).length }))
    .sort((a, b) => b.count - a.count)[0];

  const getCardReading = (drawn: any, dimension: CardDimension) => {
    const reading = drawn.reversed ? drawn.card.reversed : drawn.card.upright;
    return reading[dimension];
  };

  // === 主题级开场卡 ===
  const renderIntro = () => (
    <div className="space-y-4">
      {/* 主题徽章 + 问题回声 */}
      <div className="glass-panel rounded-xl p-4 sm:p-5 border-l-2 border-mystic-gold/60">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-title text-mystic-gold/80 tracking-widest">
            ✦ 你所问
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-mystic-gold/15 text-mystic-lightgold border border-mystic-gold/30">
            {theme.label}主题
          </span>
        </div>
        <p className="font-body italic text-base sm:text-lg text-midnight-100/95 mb-4">
          "{question.trim()}"
        </p>
        <p className="text-sm sm:text-base text-midnight-100/85 leading-relaxed">
          {theme.intro}
        </p>
      </div>

      {/* 主题核心指引 */}
      <div className="glass-panel rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-mystic-lightgold">✦</span>
          <span className="font-title text-xs sm:text-sm text-mystic-lightgold tracking-widest">
            主题核心指引
          </span>
        </div>
        <p className="text-sm sm:text-base text-midnight-100/85 leading-relaxed">
          {theme.guidance}
        </p>
      </div>
    </div>
  );

  // === 单张牌解读 ===
  const renderSingleAnalysis = () => {
    if (cards.length !== 1) return null;
    const c = cards[0];
    const reading = c.reversed ? c.card.reversed : c.card.upright;
    return (
      <div className="glass-panel rounded-xl p-4 sm:p-5">
        <p className="text-sm sm:text-base leading-relaxed text-midnight-100/90">
          <span className="text-mystic-lightgold">{c.card.name.cn}</span>
          {c.reversed ? '逆位' : '正位'}
          的出现，邀请你将注意力转向
          {c.reversed ? '内在的阴影面' : '当下能量的核心'}。
          {theme.positionFocus.single}
        </p>
        <div className="mt-4 pl-3 sm:pl-4 border-l-2 border-mystic-gold/40">
          <div className="text-xs font-title text-mystic-gold/80 tracking-widest mb-2">
            关于「{theme.label}」的展开
          </div>
          <p className="text-sm sm:text-base text-midnight-100/90 leading-relaxed">
            {getCardReading(c, theme.primaryDimension)}
          </p>
        </div>
      </div>
    );
  };

  // === 三张牌解读（支持 time / mind / free 三种模式） ===
  const renderThreeAnalysis = () => {
    if (cards.length !== 3) return null;
    const focus = theme.positionFocus.three[threeMode];
    const modeNames: Record<ThreeMode, [string, string, string]> = {
      time: ['过去的因', '当下的势', '未来的果'],
      mind: ['你的心', '你的行', 'TA 的应'],
      free: ['第一张', '第二张', '第三张'],
    };
    const [n0, n1, n2] = modeNames[threeMode];
    const modeOpeners: Record<ThreeMode, string> = {
      time: '三张牌的时间之流为你呈现了一幅关于「{theme}」的完整图景。',
      mind: '心·行·果三张牌为你照见内在、外在与回应的呼应——关于「{theme}」。',
      free: '三张自由牌依你此刻的呼吸而落，没有固定位置，只为回应你心中那个模糊的念。',
    };
    const opener = modeOpeners[threeMode].replace('{theme}', theme.label);
    return (
      <div className="space-y-4">
        <div className="glass-panel rounded-xl p-4 sm:p-5">
          <p className="text-sm sm:text-base leading-relaxed text-midnight-100/90 mb-3">
            {opener}
          </p>
          <div className="space-y-3 mt-4">
            <TimelineRow
              label={n0}
              card={cards[0]}
              hint={focus.past}
              dimension={theme.primaryDimension}
            />
            <TimelineRow
              label={n1}
              card={cards[1]}
              hint={focus.present}
              dimension={theme.primaryDimension}
              highlight
            />
            <TimelineRow
              label={n2}
              card={cards[2]}
              hint={focus.future}
              dimension={theme.primaryDimension}
            />
          </div>
        </div>
      </div>
    );
  };

  // === 凯尔特十字深度解读 ===
  const renderCelticAnalysis = () => {
    if (cards.length !== 10) return null;
    const focus = theme.positionFocus.celtic;
    // 重点位置：1(当下), 2(挑战), 6(近未来), 7(自我), 10(最终)
    const keyIndices = [0, 1, 5, 6, 9];
    return (
      <div className="space-y-4">
        <div className="glass-panel rounded-xl p-4 sm:p-5">
          <p className="text-sm sm:text-base leading-relaxed text-midnight-100/90 mb-4">
            凯尔特十字的十张牌为你关于「{theme.label}」的提问提供了深度剖析。
            为避免信息过载，我们将聚焦于对你最重要的五张牌：
            <span className="text-mystic-lightgold"> 当下、挑战、近未来、自我、最终结果</span>。
          </p>
          <div className="space-y-3">
            {keyIndices.map((idx) => {
              const c = cards[idx];
              const pos = [
                '当下核心',
                '主要挑战',
                '近未来',
                '自我状态',
                '最终结果',
              ][keyIndices.indexOf(idx)];
              return (
                <KeyCardRow
                  key={idx}
                  positionName={pos}
                  positionHint={
                    pos === '近未来'
                      ? focus.future
                      : pos === '自我状态'
                      ? focus.self
                      : pos === '最终结果'
                      ? focus.outcome
                      : pos === '当下核心'
                      ? '此刻你最需要看清的能量。'
                      : '横亘在你前进路上的主要课题。'
                  }
                  card={c}
                  dimension={theme.primaryDimension}
                  isFinal={pos === '最终结果'}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // === 整体能量场 ===
  const renderEnergyField = () => (
    <div className="glass-panel rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-mystic-gold">✦</span>
        <span className="font-title text-xs sm:text-sm text-mystic-gold tracking-widest">
          整体能量场
        </span>
      </div>
      <p className="text-sm sm:text-base text-midnight-100/85 leading-relaxed">
        在这组牌中，{reversedCount === 0
          ? '所有牌都呈正位出现，象征着能量的顺畅流动，宇宙正在为你铺设一条清晰的道路。'
          : reversedCount === cards.length
          ? '所有牌都呈逆位，提示你需要在内在进行深度的反思与调整，外在的改变需要先从心开始。'
          : `有 ${reversedCount} 张牌呈逆位，${cards.length - reversedCount} 张正位，${
              reversedCount > cards.length / 2
                ? '提示你面临的课题较深，需要更深的内省。'
                : '整体能量较为顺畅，逆位的牌指出了需要留意的领域。'
            }`}
        {dominantElement && dominantElement.count > 0 && (
          <>
            {' '}从元素分布来看，
            {dominantElement.el === 'fire' && '火元素的能量主导，象征着行动力、创造力与激情的涌动。'}
            {dominantElement.el === 'water' && '水元素的能量主导，象征着情感、直觉与内在的流动。'}
            {dominantElement.el === 'air' && '风元素的能量主导，象征着思想、沟通与理性的清晰。'}
            {dominantElement.el === 'earth' && '土元素的能量主导，象征着稳定、物质与实际的建构。'}
            {dominantElement.el === 'spirit' && '灵性元素的能量主导，象征着更高的指引与觉醒。'}
            这是你此阶段最需要觉察与运用的能量。
          </>
        )}
      </p>
    </div>
  );

  // === 卡牌对话（多牌时） - 展示牌与牌之间的呼应 ===
  const renderCardDialogue = () => {
    if (cards.length < 2) return null;
    const names = cards.map((c) => c.card.name.cn);
    const reversedCount = cards.filter((c) => c.reversed).length;

    // 元素计数
    const elementCount: Record<string, number> = {};
    cards.forEach((c) => {
      elementCount[c.card.element] = (elementCount[c.card.element] || 0) + 1;
    });
    const sortedElements = Object.entries(elementCount).sort((a, b) => b[1] - a[1]);
    const elementLabelMap: Record<string, string> = {
      fire: '火 · 行动力',
      water: '水 · 情感',
      air: '风 · 思维',
      earth: '土 · 物质',
      spirit: '灵 · 觉醒',
    };
    const elLines: string[] = [];
    if (sortedElements.length > 1) {
      const dominant = sortedElements[0];
      const second = sortedElements[1];
      elLines.push(
        `牌阵中以${elementLabelMap[dominant[0]]}的能量为主导，${elementLabelMap[second[0]]}为次要力量。`,
      );
      if (dominant[1] >= cards.length * 0.6) {
        elLines.push(
          `这意味着这段时期你的${dominant[0] === 'fire' ? '行动与创造力' : dominant[0] === 'water' ? '情感与直觉' : dominant[0] === 'air' ? '思考与沟通' : dominant[0] === 'earth' ? '物质与实际' : '灵性追求'}是核心轴。`,
        );
      } else {
        elLines.push('多种能量交织，意味着你正经历一个综合的成长阶段，需要平衡不同面向。');
      }
    }

    // 时间模式（三张牌）卡牌叙事
    let narrative = '';
    if (cards.length === 3 && spreadType === 'three') {
      const modeNames: Record<ThreeMode, [string, string, string]> = {
        time: ['过去的因', '当下的势', '未来的果'],
        mind: ['你的心', '你的行', 'TA 的应'],
        free: ['第一张', '第二张', '第三张'],
      };
      const [n0, n1, n2] = modeNames[threeMode];
      narrative = `从「${n0}」的${names[0]}（${cards[0].reversed ? '逆位' : '正位'}）经由「${n1}」的${names[1]}（${cards[1].reversed ? '逆位' : '正位'}），流向「${n2}」的${names[2]}（${cards[2].reversed ? '逆位' : '正位'}）——这是一段由你此刻的选择所推动的${cards[0].reversed === cards[2].reversed ? '能量闭环' : '能量转折'}。`;
    } else if (cards.length >= 5) {
      const first = cards[0];
      const last = cards[cards.length - 1];
      const firstReading = first.reversed ? first.card.reversed : first.card.upright;
      const lastReading = last.reversed ? last.card.reversed : last.card.upright;
      narrative = `从开篇的${first.card.name.cn}（${first.reversed ? '逆位' : '正位'}）到收束的${last.card.name.cn}（${last.reversed ? '逆位' : '正位'}），这组牌铺陈了一条从「${firstReading.general.slice(0, 12)}…」到「${lastReading.general.slice(0, 12)}…」的演变之路。每张牌都在为下一张铺垫，最终指向你此刻最需要看清的方向。`;
    } else {
      narrative = `${names.join('、')}这几张牌相互呼应，${reversedCount === 0 ? '全部正位带来顺畅的能量流动' : reversedCount === cards.length ? '全部逆位提示深度的内在功课' : `正逆交织，${reversedCount > cards.length / 2 ? '逆位能量较强，需要先内省' : '正位为主，逆位牌指出了需要留意的领域'}`}。`;
    }

    return (
      <div className="glass-panel rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-mystic-lightgold">✦</span>
          <span className="font-title text-xs sm:text-sm text-mystic-lightgold tracking-widest">
            卡牌之间的对话
          </span>
        </div>
        <p className="text-sm sm:text-base text-midnight-100/90 leading-relaxed mb-3">
          {narrative}
        </p>
        {elLines.length > 0 && (
          <div className="mt-3 pt-3 border-t border-mystic-gold/10">
            <p className="text-sm sm:text-base text-midnight-200/85 leading-relaxed">
              {elLines.join(' ')}
            </p>
          </div>
        )}
      </div>
    );
  };

  // === 整合建议 - 从多张牌合成核心指引 ===
  const renderAdvice = () => {
    if (cards.length === 0) return null;
    // 取最重要的一张（单牌=唯一；三牌=当下；凯尔特=最终结果）
    const anchorIdx =
      spreadType === 'single' ? 0 : spreadType === 'three' ? 1 : cards.length - 1;
    const anchor = cards[anchorIdx];
    const reading = anchor.reversed ? anchor.card.reversed : anchor.card.upright;

    // 警示取第一张（根源），时序取最后一张（落地）
    const originIdx = 0;
    const origin = cards[originIdx];
    const originReading = origin.reversed ? origin.card.reversed : origin.card.upright;

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 行动指引 - 来自核心牌 */}
          {reading.advice && (
            <div className="rounded-xl border border-mystic-gold/40 bg-mystic-gold/8 p-4 sm:p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-mystic-gold/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-mystic-lightgold">✦</span>
                  <span className="font-title text-xs sm:text-sm text-mystic-lightgold tracking-widest">
                    核心行动指引
                  </span>
                </div>
                <p className="text-sm sm:text-base text-midnight-100/95 leading-relaxed">
                  {reading.advice}
                </p>
                <div className="mt-2 text-[10px] text-mystic-gold/60 tracking-widest">
                  — 来自 {anchor.card.name.cn}
                </div>
              </div>
            </div>
          )}
          {/* 需要留意 - 来自根源牌（多牌时）或核心牌（单牌时） */}
          {(cards.length > 1 ? originReading.warning : reading.warning) && (
            <div className="rounded-xl border border-rose-400/30 bg-rose-400/5 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-rose-400/90">⚠</span>
                <span className="font-title text-xs sm:text-sm text-rose-400/90 tracking-widest">
                  需要留意
                </span>
              </div>
              <p className="text-sm sm:text-base text-midnight-100/95 leading-relaxed">
                {cards.length > 1 ? originReading.warning : reading.warning}
              </p>
              {cards.length > 1 && (
                <div className="mt-2 text-[10px] text-rose-400/60 tracking-widest">
                  — 来自 {origin.card.name.cn}
                </div>
              )}
            </div>
          )}
        </div>
        {/* 时间提示 - 横跨整组牌 */}
        {reading.timing && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-400/85">⏳</span>
              <span className="font-title text-xs sm:text-sm text-amber-400/85 tracking-widest">
                时间提示
              </span>
            </div>
            <p className="text-sm sm:text-base text-midnight-100/95 leading-relaxed">
              {reading.timing}
            </p>
            <div className="mt-2 text-[10px] text-amber-400/60 tracking-widest">
              — 来自 {anchor.card.name.cn}
            </div>
          </div>
        )}
      </div>
    );
  };

  // === 收束 ===
  const renderClosing = () => (
    <div className="mt-2 pt-6 border-t border-mystic-gold/15 text-center">
      <p className="font-title text-sm sm:text-base text-mystic-gold/90 tracking-widest">
        ✦ {theme.closing} ✦
      </p>
      <p className="mt-3 text-xs sm:text-sm text-midnight-200/70 italic">
        记住：塔罗不预测命运，而是照亮当下。每一次占卜都是与自己内心的一次深度对话。
      </p>
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 font-body text-sm sm:text-base leading-relaxed text-midnight-100/90">
      {renderIntro()}

      {spreadType === 'single' && renderSingleAnalysis()}
      {spreadType === 'three' && renderThreeAnalysis()}
      {spreadType === 'celtic' && renderCelticAnalysis()}

      {renderEnergyField()}
      {renderCardDialogue()}
      {renderAdvice()}
      {renderClosing()}
    </div>
  );
}

// === 时间线单行 ===
function TimelineRow({
  label,
  card,
  hint,
  dimension,
  highlight = false,
}: {
  label: string;
  card: any;
  hint: string;
  dimension: CardDimension;
  highlight?: boolean;
}) {
  const reading = card.reversed ? card.card.reversed : card.card.upright;
  return (
    <div
      className={cn(
        'rounded-lg p-3 sm:p-4 border-l-2',
        highlight
          ? 'border-mystic-lightgold bg-mystic-gold/5'
          : 'border-mystic-gold/40 bg-midnight-900/30',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="text-xs font-title text-mystic-gold tracking-widest">{label}</span>
        <span className="text-mystic-lightgold">·</span>
        <span className="text-sm font-display text-mystic-lightgold">{card.card.name.cn}</span>
        <span className="text-xs text-midnight-300/60">({card.card.name.en})</span>
        {card.reversed && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-rose-400/40 text-rose-400/90">
            逆位
          </span>
        )}
        {highlight && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-mystic-gold/20 text-mystic-lightgold border border-mystic-gold/40">
            此刻
          </span>
        )}
      </div>
      <div className="text-xs text-midnight-300/70 italic mb-2">{hint}</div>
      <p className="text-sm sm:text-base text-midnight-100/90 leading-relaxed">
        {reading[dimension]}
      </p>
    </div>
  );
}

// === 重点牌行（凯尔特十字） ===
function KeyCardRow({
  positionName,
  positionHint,
  card,
  dimension,
  isFinal = false,
}: {
  positionName: string;
  positionHint: string;
  card: any;
  dimension: CardDimension;
  isFinal?: boolean;
}) {
  const reading = card.reversed ? card.card.reversed : card.card.upright;
  return (
    <div
      className={cn(
        'rounded-lg p-3 sm:p-4 border-l-2',
        isFinal
          ? 'border-mystic-lightgold bg-mystic-gold/8 shadow-gold-glow'
          : 'border-mystic-gold/40 bg-midnight-900/30',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="text-xs font-title text-mystic-gold/80 tracking-widest">
          {positionName}
        </span>
        <span className="text-mystic-lightgold">·</span>
        <span className="text-sm font-display text-mystic-lightgold">{card.card.name.cn}</span>
        {card.reversed && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-rose-400/40 text-rose-400/90">
            逆位
          </span>
        )}
        {isFinal && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-mystic-gold/20 text-mystic-lightgold border border-mystic-gold/40">
            最终
          </span>
        )}
      </div>
      <div className="text-xs text-midnight-300/70 italic mb-2">{positionHint}</div>
      <p className="text-sm sm:text-base text-midnight-100/90 leading-relaxed">
        {reading[dimension]}
      </p>
    </div>
  );
}
