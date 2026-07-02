import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, History, Sparkles, Heart, Briefcase, Coins, BookOpen, Users, Sprout, Compass, ChevronLeft, ChevronRight, Eye, EyeOff, BookMarked } from 'lucide-react';
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
  const [currentCardIdx, setCurrentCardIdx] = useState(0);

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
            onCardClick={(i) => {
              setCurrentCardIdx(i);
              // 平滑滚动到单牌解读 section
              setTimeout(() => {
                document.getElementById('card-pager')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }}
            currentIdx={currentCardIdx}
          />
        </motion.section>

        {/* 单牌解读 - 翻页式 + 可展开，默认只看一张牌的概览 */}
        <motion.section
          id="card-pager"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-10 sm:mb-14"
        >
          <SectionLabel
            step="02"
            kicker="单牌解读"
            help="一张张细看，展开可看完整解读"
          />
          <CardPager
            cards={drawnCards}
            positions={positions}
            theme={theme}
            currentIdx={currentCardIdx}
            onChange={setCurrentCardIdx}
          />
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

// === 牌阵展示（紧凑版：单牌居中 / 三牌横排 / 凯尔特 5×2 网格） ===
function SpreadLayout({
  cards,
  positions,
  spreadType,
  onCardClick,
  currentIdx,
}: {
  cards: any[];
  positions: any[];
  spreadType: 'single' | 'three' | 'celtic';
  onCardClick: (idx: number) => void;
  currentIdx: number;
}) {
  if (spreadType === 'single') {
    const c = cards[0];
    const pos = positions[c.position];
    return (
      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => onCardClick(0)}
        >
          <div className="relative">
            <TarotCard
              card={c.card}
              reversed={c.reversed}
              flipped
              size="md"
              interactive={false}
              autoFlip
            />
            {c.reversed && (
              <div className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40">
                逆位
              </div>
            )}
            {currentIdx === 0 && (
              <div className="absolute inset-0 rounded-xl ring-2 ring-mystic-lightgold/60 pointer-events-none" />
            )}
          </div>
          <div className="mt-3 text-center">
            <div className="font-title text-base sm:text-lg text-mystic-lightgold">
              {pos?.name}
            </div>
            <div className="font-display text-lg sm:text-xl text-mystic-gold mt-0.5">
              {c.card.name.cn}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (spreadType === 'three') {
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto">
        {cards.map((c, i) => {
          const pos = positions[c.position];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onCardClick(i)}
            >
              <div className="relative">
                <div
                  className={cn(
                    'relative rounded-lg p-0.5 transition-all',
                    currentIdx === i
                      ? 'ring-2 ring-mystic-lightgold/60'
                      : 'ring-1 ring-transparent group-hover:ring-mystic-gold/40',
                  )}
                >
                  <TarotCard
                    card={c.card}
                    reversed={c.reversed}
                    flipped
                    size="sm"
                    autoFlip
                    interactive={false}
                  />
                  {c.reversed && (
                    <div className="absolute top-1 right-1 text-[8px] px-1 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40">
                      逆
                    </div>
                  )}
                  <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-midnight-900 border border-mystic-gold/60 text-mystic-lightgold text-[10px] font-title flex items-center justify-center">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center w-full">
                <div className="text-[9px] font-title text-mystic-gold/80 tracking-widest truncate">
                  {pos?.name}
                </div>
                <div className="font-display text-xs sm:text-sm text-mystic-lightgold truncate">
                  {c.card.name.cn}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Celtic Cross - 10 张牌紧凑 5×2 网格
  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {cards.map((c, i) => {
          const pos = positions[c.position];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onCardClick(i)}
            >
              <div
                className={cn(
                  'relative rounded-md p-0.5 transition-all',
                  currentIdx === i
                    ? 'ring-2 ring-mystic-lightgold/60'
                    : 'ring-1 ring-transparent group-hover:ring-mystic-gold/40',
                )}
              >
                <TarotCard
                  card={c.card}
                  reversed={c.reversed}
                  flipped
                  size="xs"
                  autoFlip
                  interactive={false}
                />
                {c.reversed && (
                  <div className="absolute top-0.5 right-0.5 text-[7px] px-0.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/40 leading-none">
                    逆
                  </div>
                )}
                <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-midnight-900 border border-mystic-gold/60 text-mystic-lightgold text-[8px] font-title flex items-center justify-center">
                  {i + 1}
                </div>
              </div>
              <div className="mt-1.5 text-center w-full">
                <div className="text-[8px] font-title text-mystic-gold/75 tracking-widest truncate leading-tight">
                  {pos?.name}
                </div>
                <div className="text-[10px] sm:text-[11px] text-mystic-lightgold/90 truncate leading-tight">
                  {c.card.name.cn}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// === 翻页导航：单张卡片查看 + 上一张/下一张 + 点指示 ===
function CardPager({
  cards,
  positions,
  theme,
  currentIdx,
  onChange,
}: {
  cards: any[];
  positions: any[];
  theme: QuestionTheme;
  currentIdx: number;
  onChange: (i: number) => void;
}) {
  if (cards.length === 0) return null;
  const current = cards[currentIdx];
  const position = positions[current.position];
  const goPrev = () => onChange((currentIdx - 1 + cards.length) % cards.length);
  const goNext = () => onChange((currentIdx + 1) % cards.length);

  return (
    <div>
      {/* 顶部导航条 */}
      <div className="glass-panel rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          className="btn-ghost text-xs px-3 py-2 flex items-center gap-1"
          aria-label="上一张牌"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">上一张</span>
        </button>

        {/* 中间：当前/总数 + 位置名 + 牌名 */}
        <div className="flex-1 min-w-0 text-center">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <span className="text-mystic-gold/80 font-title tracking-widest">
              {String(currentIdx + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
            </span>
            {position && (
              <>
                <span className="text-mystic-gold/30">·</span>
                <span className="text-midnight-200/75 truncate">{position.name}</span>
              </>
            )}
          </div>
          <div className="font-display text-sm sm:text-base text-mystic-lightgold truncate">
            {current.card.name.cn}
            {current.reversed && <span className="ml-1.5 text-[10px] text-rose-400/80">· 逆位</span>}
          </div>
        </div>

        <button
          onClick={goNext}
          className="btn-ghost text-xs px-3 py-2 flex items-center gap-1"
          aria-label="下一张牌"
        >
          <span className="hidden sm:inline">下一张</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 点指示器 */}
      {cards.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              aria-label={`跳到第 ${i + 1} 张`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === currentIdx
                  ? 'w-8 bg-mystic-lightgold shadow-gold-glow'
                  : 'w-1.5 bg-mystic-gold/25 hover:bg-mystic-gold/50',
              )}
            />
          ))}
        </div>
      )}

      {/* 当前卡片（可展开） */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
        >
          <CardInterpretation
            card={current.card}
            reversed={current.reversed}
            position={position}
            index={currentIdx}
            theme={theme}
          />
        </motion.div>
      </AnimatePresence>

      {/* 底部翻页快捷 */}
      {cards.length > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={goPrev}
            className="text-xs text-mystic-gold/70 hover:text-mystic-lightgold transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            上一张 · {cards[(currentIdx - 1 + cards.length) % cards.length].card.name.cn}
          </button>
          <button
            onClick={goNext}
            className="text-xs text-mystic-gold/70 hover:text-mystic-lightgold transition-colors flex items-center gap-1"
          >
            下一张 · {cards[(currentIdx + 1) % cards.length].card.name.cn}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// === 单张牌解读（可折叠：默认显示概览，展开后看完整解读） ===
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
  const [expanded, setExpanded] = useState(false);
  const reading = reversed ? card.reversed : card.upright;
  const isMajor = card.arcana === 'major';

  // === 折叠状态：一张牌 + 概览一句话 + 展开按钮 ===
  if (!expanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-2xl p-4 sm:p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mystic-gold/40 to-transparent" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* 牌面（小） */}
          <div className="flex-shrink-0">
            <TarotCard
              card={card}
              reversed={reversed}
              flipped
              size="sm"
              autoFlip
              interactive={false}
            />
          </div>

          {/* 概览信息 */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1.5">
              <span className="text-[10px] font-sans-ui text-mystic-gold/70 tracking-widest">
                {String(index + 1).padStart(2, '0')}
              </span>
              {position && (
                <>
                  <span className="text-mystic-gold/30">·</span>
                  <span className="text-xs font-title text-mystic-gold/80">
                    {position.name}
                  </span>
                </>
              )}
              {reversed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-rose-400/40 text-rose-400/90 font-title">
                  逆位
                </span>
              )}
            </div>

            <h3 className="font-display text-xl sm:text-2xl text-gold-gradient mb-2">
              {card.name.cn}
            </h3>

            {/* 关键词标签 */}
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mb-3">
              {card.keywords.slice(0, 4).map((kw: string) => (
                <span
                  key={kw}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-mystic-gold/30 bg-mystic-gold/5 text-mystic-gold/90"
                >
                  {kw}
                </span>
              ))}
            </div>

            {/* 概览一句话 */}
            <p className="text-sm text-midnight-200/85 leading-relaxed mb-3 line-clamp-2">
              {reading.general}
            </p>

            {/* 操作按钮 */}
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <button
                onClick={() => setExpanded(true)}
                className="text-xs px-3 py-1.5 rounded-full border border-mystic-gold/40 bg-mystic-gold/10 text-mystic-lightgold hover:bg-mystic-gold/20 hover:border-mystic-gold/60 transition-all inline-flex items-center gap-1.5"
              >
                <BookMarked className="w-3.5 h-3.5" />
                展开完整解读
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // === 展开状态：所有详细解读 ===
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
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
            <button
              onClick={() => setExpanded(false)}
              className="ml-auto text-xs px-2.5 py-1 rounded-full border border-mystic-gold/30 text-mystic-gold/80 hover:bg-mystic-gold/10 transition-all inline-flex items-center gap-1"
            >
              <EyeOff className="w-3 h-3" />
              收起
            </button>
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

// === 综合解读（基于实际牌面数据，4 段结构 + 整合建议） ===
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
  const readingOf = (c: any) => (c.reversed ? c.card.reversed : c.card.upright);
  const nameOf = (c: any) => `${c.card.name.cn}${c.reversed ? '（逆）' : '（正）'}`;

  // === 数据聚合 ===
  const reversedCards = cards.filter((c) => c.reversed);
  const majorCards = cards.filter((c) => c.card.arcana === 'major');
  const minorCards = cards.filter((c) => c.card.arcana === 'minor');
  const courtCards = cards.filter((c) => c.card.suit && (c.card.number ?? 0) >= 11);

  const elementCount: Record<string, number> = {};
  cards.forEach((c) => {
    const e = c.card.element || 'spirit';
    elementCount[e] = (elementCount[e] || 0) + 1;
  });
  const sortedEls = Object.entries(elementCount).sort((a, b) => b[1] - a[1]);
  const dominantEl = sortedEls[0]?.[0];
  const elLabel: Record<string, string> = {
    fire: '火 · 行动',
    water: '水 · 情感',
    air: '风 · 思维',
    earth: '土 · 物质',
    spirit: '灵 · 觉知',
  };

  // === 1. 整体基调 ===
  const buildTone = (): string[] => {
    const lines: string[] = [];
    const reversedRatio = reversedCards.length / Math.max(cards.length, 1);
    const majorRatio = majorCards.length / Math.max(cards.length, 1);

    // 开场 - 用牌数引入
    if (cards.length === 1) {
      lines.push(`你抽到了「${nameOf(cards[0])}」。`);
    } else {
      const names = cards.map(nameOf).join('、');
      lines.push(`你抽到了 ${cards.length} 张牌：${names}。`);
    }

    // 整组牌的张力
    if (reversedCards.length === 0) {
      lines.push('全部正位登场，宇宙把门直接推开——这段对话没有遮掩。');
    } else if (reversedCards.length === cards.length) {
      lines.push('所有牌均呈逆位，提示你：外在的转向需要先从内在的功课开始。');
    } else {
      const rNames = reversedCards.map(nameOf).join('、');
      lines.push(
        `其中 ${rNames} 呈逆位，${cards.length - reversedCards.length} 张正位——${
          reversedRatio > 0.5
            ? '逆位占多数，整体能量偏向内省、暂停、修正。'
            : '正位主导，逆位牌则精准指出你需要留意的暗面。'
        }`,
      );
    }

    // 大/小阿尔卡那分布
    if (cards.length >= 3) {
      if (majorRatio >= 0.7) {
        lines.push(
          `大阿尔卡那占主导（${majorCards.length}/${cards.length}），这是一次关于「灵魂功课」的占卜，议题比你想象的更深远。`,
        );
      } else if (majorRatio <= 0.3) {
        lines.push(
          `小阿尔卡那为主（${minorCards.length}/${cards.length}），议题聚焦在具体可操作的日常层面——柴米油盐、工作细节、关系选择。`,
        );
      } else {
        lines.push(
          `大阿尔卡那与${minorCards.length ? '小阿尔卡那' : ''}并存，${majorCards.length ? '大' : ''}${minorCards.length ? '小' : ''}各有分工——既有命层的指引，也落在可执行的事务上。`,
        );
      }
    }

    // 主元素
    if (dominantEl && sortedEls[0][1] >= 2) {
      lines.push(
        `从元素分布看，${elLabel[dominantEl]}为这一组牌的主调色。${
          dominantEl === 'fire'
            ? '行动力、创造力、激情——这是一个让你"动起来"的阶段。'
            : dominantEl === 'water'
            ? '情感、直觉、关系——这是一段需要倾听内心的时期。'
            : dominantEl === 'air'
            ? '思考、沟通、抉择——清晰是关键。'
            : dominantEl === 'earth'
            ? '稳定、物质、积累——慢即是快。'
            : '觉知、灵性、超越——你正在被更高的东西引领。'
        }`,
      );
    }

    // 宫廷牌
    if (courtCards.length > 0) {
      const courtNames = courtCards.map(nameOf).join('、');
      lines.push(
        `出现${courtCards.length > 1 ? '了' : '了'}宫廷牌 ${courtNames}——它${
          courtCards.length > 1 ? '们' : ''
        }通常代表某个人格原型，可能是你内在的某个面向，也可能是你身边的某个人。`,
      );
    }

    return lines;
  };

  // === 2. 关键脉络 ===
  const buildThread = (): string[] => {
    const lines: string[] = [];

    if (cards.length === 1) {
      // 单牌 - 直接分析这张牌
      const c = cards[0];
      const r = readingOf(c);
      const kw = c.card.keywords.slice(0, 3).join('、');
      lines.push(
        `${c.card.name.cn}是此刻你问题的核心回应——${
          c.reversed ? '逆位提示' : '正位强调'
        }「${kw}」这一组能量。`,
      );
      // 用 primary dimension 的解读作为展开
      lines.push(r[theme.primaryDimension]);
      return lines;
    }

    if (cards.length === 3 && spreadType === 'three') {
      const modeNames: Record<ThreeMode, [string, string, string]> = {
        time: ['过去的因', '当下的势', '未来的果'],
        mind: ['你的心', '你的行', 'TA 的应'],
        free: ['第一张', '第二张', '第三张'],
      };
      const [n0, n1, n2] = modeNames[threeMode];
      const focus = theme.positionFocus.three[threeMode];

      lines.push(
        `「${n0}」的${nameOf(cards[0])}：${focus.past} ${readingOf(cards[0])[theme.primaryDimension]}`,
      );
      lines.push(
        `「${n1}」的${nameOf(cards[1])}：${focus.present} ${readingOf(cards[1])[theme.primaryDimension]}`,
      );
      lines.push(
        `「${n2}」的${nameOf(cards[2])}：${focus.future} ${readingOf(cards[2])[theme.primaryDimension]}`,
      );

      // 演化方向
      const c0 = cards[0];
      const c2 = cards[2];
      if (c0.reversed && !c2.reversed) {
        lines.push('整体走向：从逆位过渡到正位——你正在走出某段阴霾，向清晰靠近。');
      } else if (!c0.reversed && c2.reversed) {
        lines.push('整体走向：从正位走入逆位——需要主动调整，否则会陷入旧的模式。');
      } else if (c0.reversed === c2.reversed) {
        lines.push('整体走向：首尾一致——这是一个连续递进的过程，没有断点。');
      }
      return lines;
    }

    // 凯尔特 - 5 张关键牌
    if (cards.length >= 5) {
      const positions: { idx: number; label: string; hint: string }[] = [
        { idx: 0, label: '当下核心', hint: '此刻你站的位置' },
        { idx: 1, label: '主要挑战', hint: '横亘在你面前的课题' },
        { idx: 5, label: '近未来', hint: '即将浮现的走向' },
        { idx: 6, label: '自我状态', hint: '你当下的内在' },
        { idx: 9, label: '最终结果', hint: '沿当前路径的归宿' },
      ];
      positions.forEach((p) => {
        if (p.idx >= cards.length) return;
        const c = cards[p.idx];
        lines.push(
          `【${p.label}】${nameOf(c)} —— ${p.hint}。${readingOf(c)[theme.primaryDimension]}`,
        );
      });
      return lines;
    }

    return lines;
  };

  // === 3. 核心张力 ===
  const buildTension = (): string | null => {
    // 找出最重要的矛盾关系
    if (cards.length < 2) {
      // 单牌的张力 - 看正逆
      const c = cards[0];
      const r = readingOf(c);
      if (c.reversed && r.warning) {
        return `这张牌逆位出现时，${r.warning}所以它的「阴影面」会比平时更明显——请把它当作提醒而非宣判。`;
      }
      return null;
    }

    // 找出元素对立的牌
    const opposites: Record<string, string> = {
      fire: 'water',
      water: 'fire',
      air: 'earth',
      earth: 'air',
    };
    const pairs: string[] = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i];
        const b = cards[j];
        if (opposites[a.card.element] === b.card.element) {
          pairs.push(
            `${nameOf(a)}（${elLabel[a.card.element] ?? a.card.element}）与 ${nameOf(b)}（${elLabel[b.card.element] ?? b.card.element}）形成一组张力——一者关于${a.card.element === 'fire' || a.card.element === 'water' ? '情感直觉' : '理性执行'}，一者关于${b.card.element === 'fire' || b.card.element === 'water' ? '情感直觉' : '理性执行'}。你无需二选一，牌面提示的是让两者在同一个身体里合作。`,
          );
        }
      }
    }

    // 找出一正一逆的关键对
    if (cards.length >= 2) {
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          if (cards[i].reversed !== cards[j].reversed) {
            const upright = cards[i].reversed ? cards[j] : cards[i];
            const reversed = cards[i].reversed ? cards[i] : cards[j];
            pairs.push(
              `${nameOf(upright)}（正位）是你可以走通的方向，而 ${nameOf(reversed)}（逆位）则指出了同一议题的盲区——看清逆位那一张说什么，能让你更稳地站在正位。`,
            );
            break; // 只取一对，避免过载
          }
        }
      }
    }

    return pairs.length > 0 ? pairs.join('\n\n') : null;
  };

  // === 4. 走向与时机 ===
  const buildTrajectory = (): string => {
    const anchor = cards[spreadType === 'single' ? 0 : spreadType === 'three' ? 1 : cards.length - 1];
    const r = readingOf(anchor);
    const first = cards[0];
    const last = cards[cards.length - 1];

    let line = '';
    if (cards.length === 1) {
      line = `围绕「${theme.label}」这一问，这张牌指向——`;
    } else {
      line = `从开篇的「${nameOf(first)}」到收束的「${nameOf(last)}」，这组牌铺陈了一条演变之路——`;
    }

    if (r.timing) {
      line += r.timing;
    } else {
      line += '时机是流动的，请相信你的直觉。';
    }
    return line;
  };

  // === 5. 整合建议 ===
  const buildAdvice = () => {
    if (cards.length === 0) return null;
    const anchorIdx = spreadType === 'single' ? 0 : spreadType === 'three' ? 1 : cards.length - 1;
    const anchor = cards[anchorIdx];
    const anchorR = readingOf(anchor);
    const origin = cards[0];
    const originR = readingOf(origin);

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {anchorR.advice && (
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
                  {anchorR.advice}
                </p>
                <div className="mt-2 text-[10px] text-mystic-gold/60 tracking-widest">
                  — 来自 {anchor.card.name.cn}{anchor.reversed ? '（逆）' : '（正）'}
                </div>
              </div>
            </div>
          )}
          {cards.length > 1
            ? originR.warning || anchorR.warning
            : anchorR.warning && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-400/5 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-rose-400/90">⚠</span>
                    <span className="font-title text-xs sm:text-sm text-rose-400/90 tracking-widest">
                      需要留意
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-midnight-100/95 leading-relaxed">
                    {originR.warning || anchorR.warning}
                  </p>
                  <div className="mt-2 text-[10px] text-rose-400/60 tracking-widest">
                    — 来自 {origin.card.name.cn}{origin.reversed ? '（逆）' : '（正）'}
                  </div>
                </div>
              )}
        </div>
        {anchorR.timing && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-400/85">⏳</span>
              <span className="font-title text-xs sm:text-sm text-amber-400/85 tracking-widest">
                时间提示
              </span>
            </div>
            <p className="text-sm sm:text-base text-midnight-100/95 leading-relaxed">
              {anchorR.timing}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 font-body text-sm sm:text-base leading-relaxed text-midnight-100/90">
      {/* === 0. 主题开场（问题回声 + 主题核心理念） === */}
      <div className="glass-panel rounded-xl p-4 sm:p-5 border-l-2 border-mystic-gold/60">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-title text-mystic-gold/80 tracking-widest">✦ 你所问</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-mystic-gold/15 text-mystic-lightgold border border-mystic-gold/30">
            {theme.label}主题
          </span>
        </div>
        <p className="font-body italic text-base sm:text-lg text-midnight-100/95 mb-3">
          "{question.trim()}"
        </p>
        <p className="text-sm sm:text-base text-midnight-100/85 leading-relaxed">
          {theme.guidance}
        </p>
      </div>

      {/* === 1. 整体基调 === */}
      <section>
        <SectionSubLabel step="01" title="整体基调" />
        <div className="glass-panel rounded-xl p-4 sm:p-5 space-y-3">
          {buildTone().map((line, i) => (
            <p key={i} className="text-sm sm:text-base text-midnight-100/90 leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </section>

      {/* === 2. 关键脉络 === */}
      <section>
        <SectionSubLabel
          step="02"
          title={spreadType === 'single' ? '这张牌的回应' : spreadType === 'three' ? '牌的展开' : '五张关键牌'}
        />
        <div className="glass-panel rounded-xl p-4 sm:p-5 space-y-3">
          {buildThread().map((line, i) => (
            <p key={i} className="text-sm sm:text-base text-midnight-100/90 leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </section>

      {/* === 3. 核心张力 === */}
      {buildTension() && (
        <section>
          <SectionSubLabel step="03" title="核心张力" highlight />
          <div className="rounded-xl p-4 sm:p-5 border border-mystic-gold/30 bg-mystic-gold/5 space-y-3">
            {buildTension()!
              .split('\n\n')
              .map((line, i) => (
                <p key={i} className="text-sm sm:text-base text-midnight-100/90 leading-relaxed">
                  {line}
                </p>
              ))}
          </div>
        </section>
      )}

      {/* === 4. 走向与时机 === */}
      <section>
        <SectionSubLabel step="04" title="走向与时机" />
        <div className="glass-panel rounded-xl p-4 sm:p-5">
          <p className="text-sm sm:text-base text-midnight-100/90 leading-relaxed">
            {buildTrajectory()}
          </p>
        </div>
      </section>

      {/* === 5. 整合建议 === */}
      <section>
        <SectionSubLabel step="05" title="整合建议" highlight />
        {buildAdvice()}
      </section>

      {/* === 6. 收束 === */}
      <div className="mt-2 pt-6 border-t border-mystic-gold/15 text-center">
        <p className="font-title text-sm sm:text-base text-mystic-gold/90 tracking-widest">
          ✦ {theme.closing} ✦
        </p>
        <p className="mt-3 text-xs sm:text-sm text-midnight-200/70 italic">
          记住：塔罗不预测命运，而是照亮当下。每一次占卜都是与自己内心的一次深度对话。
        </p>
      </div>
    </div>
  );
}

// === 子标签 - Section 03 内部使用的小标签 ===
function SectionSubLabel({
  step,
  title,
  highlight = false,
}: {
  step: string;
  title: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        className={cn(
          'text-[10px] sm:text-[11px] font-display tracking-widest shrink-0',
          highlight ? 'text-mystic-lightgold' : 'text-mystic-gold/60',
        )}
      >
        {step}
      </span>
      <h4
        className={cn(
          'text-sm sm:text-base font-title tracking-wider',
          highlight ? 'text-mystic-lightgold' : 'text-mystic-gold',
        )}
      >
        {title}
      </h4>
      <div className="flex-1 h-px bg-gradient-to-r from-mystic-gold/20 to-transparent" />
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
