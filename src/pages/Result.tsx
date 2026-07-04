import { useEffect, useState, useMemo, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, History, Sparkles, Heart, Briefcase, Coins, Users, Sprout, Compass, ChevronLeft, ChevronRight, EyeOff, BookMarked, Copy, Check, ImageDown, type LucideIcon } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import TarotCard from '@/components/tarot/TarotCard';
import EnergyVortex from '@/components/effects/EnergyVortex';
import SparkleTrail from '@/components/effects/SparkleTrail';
import { useReadingUI, useReadingActions } from '@/store/selectors';
import { SPREADS, getSpreadPositions, THREE_MODES } from '@/data/spreads';
import { getQuestionTheme, type CardDimension, type QuestionTheme, type ThreeMode } from '@/data/questionThemes';
import { cn } from '@/lib/utils';
import {
  analyzeSynergy,
  generateDirectAnswer,
  generateActionPlan,
} from '@/lib/interpretation';
import DirectAnswer from '@/components/tarot/DirectAnswer';
import CardSynergy from '@/components/tarot/CardSynergy';
import ActionPlan from '@/components/tarot/ActionPlan';
import FollowUpChat from '@/components/tarot/FollowUpChat';
import ShareCardModal from '@/components/tarot/ShareCardModal';
import type { DrawnCard, SpreadType, TarotCard as TarotCardType, SpreadPosition } from '@/types';

export default function Result() {
  const navigate = useNavigate();
  const { drawnCards, spreadType, question, threeMode } = useReadingUI();
  const { reset } = useReadingActions();
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (drawnCards.length === 0 || !spreadType) {
      navigate('/reading', { replace: true });
    }
  }, [drawnCards, spreadType, navigate]);

  // 主题与解读引擎（hooks 须在早返回之前调用，故在此带守卫计算）
  const theme = useMemo(() => getQuestionTheme(question), [question]);
  const synergy = useMemo(
    () => (drawnCards.length ? analyzeSynergy(drawnCards) : null),
    [drawnCards],
  );
  const directAnswer = useMemo(
    () =>
      spreadType && drawnCards.length
        ? generateDirectAnswer(question, drawnCards, theme, spreadType)
        : null,
    [question, drawnCards, theme, spreadType],
  );
  const actionPlan = useMemo(
    () => (drawnCards.length ? generateActionPlan(drawnCards, theme) : []),
    [drawnCards, theme],
  );

  if (drawnCards.length === 0 || !spreadType) {
    return null;
  }

  const spread = SPREADS[spreadType];
  // 三张牌阵根据 threeMode 拿位置
  const positions = getSpreadPositions(spreadType, threeMode);
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

        {/* 塔罗师的直接回应 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10 sm:mb-14"
        >
          <DirectAnswer answer={directAnswer!} question={question} />
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

        {/* 能量关系 - 牌与牌的呼应 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-10 sm:mb-14"
        >
          <SectionLabel
            step="03"
            kicker="能量关系"
            help="牌与牌如何相互呼应或牵扯"
          />
          <CardSynergy report={synergy!} />
        </motion.section>

        {/* 综合解读 - 最后总览 */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12 sm:mb-16"
        >
          <SectionLabel
            step="04"
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

        {/* 行动方案 - 塔罗师给你的功课 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-10 sm:mb-14"
        >
          <SectionLabel
            step="05"
            kicker="行动方案"
            help="把解读变成可落地的一步步"
          />
          <ActionPlan items={actionPlan} />
        </motion.section>

        {/* 追问塔罗师 - 对话式深挖 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-12 sm:mb-16"
        >
          <SectionLabel
            step="06"
            kicker="追问塔罗师"
            help="还有什么想问的，直接开口"
            accent
          />
          <FollowUpChat
            cards={drawnCards}
            theme={theme}
            question={question}
          />
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
            <button
              onClick={() => setShareOpen(true)}
              className="btn-mystic"
            >
              <ImageDown className="w-4 h-4 mr-2" />
              生成分析图片
            </button>
            <Link
              to="/reading"
              onClick={() => reset()}
              className="btn-ghost"
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

      {/* 一键生成结果分析图片 */}
      <ShareCardModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        question={question}
        drawnCards={drawnCards}
        positions={positions}
        spreadName={spread.name + (modeLabel ? ` · ${modeLabel.name}` : '')}
        theme={theme}
        directAnswer={directAnswer!}
        actionPlan={actionPlan}
        closingText={theme.closing}
      />
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
  cards: DrawnCard[];
  positions: SpreadPosition[];
  spreadType: SpreadType;
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
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
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
  cards: DrawnCard[];
  positions: SpreadPosition[];
  theme: QuestionTheme;
  currentIdx: number;
  onChange: (i: number) => void;
}) {
  const goPrev = useCallback(() => onChange((currentIdx - 1 + cards.length) % cards.length), [onChange, currentIdx, cards.length]);
  const goNext = useCallback(() => onChange((currentIdx + 1) % cards.length), [onChange, currentIdx, cards.length]);

  // 键盘左右翻页
  useEffect(() => {
    if (cards.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, cards.length]);

  if (cards.length === 0) return null;
  const current = cards[currentIdx];
  const position = positions[current.position];

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
        <div className="flex items-center justify-between mt-4 gap-3">
          <button
            onClick={goPrev}
            className="text-xs text-mystic-gold/70 hover:text-mystic-lightgold transition-colors flex items-center gap-1 min-w-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              上一张 · {cards[(currentIdx - 1 + cards.length) % cards.length].card.name.cn}
            </span>
          </button>
          <button
            onClick={goNext}
            className="text-xs text-mystic-gold/70 hover:text-mystic-lightgold transition-colors flex items-center gap-1 min-w-0"
          >
            <span className="truncate">
              下一张 · {cards[(currentIdx + 1) % cards.length].card.name.cn}
            </span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      )}

      {/* 键盘提示 */}
      {cards.length > 1 && (
        <div className="mt-3 text-center text-[10px] text-midnight-300/50 font-sans-ui">
          可使用
          <kbd className="mx-1 px-1.5 py-0.5 rounded border border-mystic-gold/25 bg-midnight-900/40 text-mystic-gold/80 text-[10px]">←</kbd>
          <kbd className="mx-0.5 px-1.5 py-0.5 rounded border border-mystic-gold/25 bg-midnight-900/40 text-mystic-gold/80 text-[10px]">→</kbd>
          键翻页
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
  card: TarotCardType;
  reversed: boolean;
  position: SpreadPosition | undefined;
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

            <h3 className="font-display text-xl sm:text-2xl text-gold-gradient mb-2 break-words">
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

          <h3 className="font-display text-2xl sm:text-3xl text-gold-gradient mb-1 break-words">
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

const DIMENSION_ICON: Record<CardDimension, LucideIcon> = {
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
  icon: ReactNode;
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
        <span className="hidden sm:inline text-[10px] sm:text-[11px] text-midnight-300/65 font-body italic truncate min-w-0 max-w-[55%]">
          {help}
        </span>
      )}
    </div>
  );
}

// === 综合解读（精简 3 段：映照 + 故事 + 指引，去重去杂） ===
function SynthesisReading({
  spreadType,
  threeMode,
  cards,
  question,
}: {
  spreadType: SpreadType;
  threeMode: ThreeMode;
  cards: DrawnCard[];
  question: string;
}) {
  const theme = getQuestionTheme(question);
  const [copied, setCopied] = useState(false);

  // 用 useMemo 一次性算出三段文本，避免渲染时重复调用
  const { echoText, storyTexts, guidanceText, anchor, closingText } = useMemo(() => {
    const readingOf = (c: DrawnCard) => (c.reversed ? c.card.reversed : c.card.upright);
    const nameOf = (c: DrawnCard) => {
      const orientation = c.reversed ? '（逆）' : '（正）';
      return `${c.card.name.cn}${orientation}`;
    };
    const dim = theme.primaryDimension;
    const anchorIdx = spreadType === 'single' ? 0 : spreadType === 'three' ? 1 : cards.length - 1;
    const anchorCard = cards[anchorIdx];
    const anchorR = readingOf(anchorCard);
    const reversedCount = cards.filter((c) => c.reversed).length;

    // === 1. 整体映照 ===
    const echoParts: string[] = [];
    if (cards.length === 1) {
      echoParts.push(`你抽到的是「${nameOf(cards[0])}」。`);
    } else {
      echoParts.push(`这组牌由「${nameOf(cards[0])}」启程，到「${nameOf(cards[cards.length - 1])}」收束。`);
    }
    if (reversedCount === 0) {
      echoParts.push('全部正位登场——这是一段没有遮掩的对话，牌面把门直接推开。');
    } else if (reversedCount === cards.length) {
      echoParts.push('所有牌均呈逆位——提示你：外在的转向必须先从内在的功课开始。');
    } else if (reversedCount > cards.length / 2) {
      echoParts.push('逆位占多数，整体能量偏向内省、暂停与修正。');
    } else {
      echoParts.push('正位主导，逆位牌则精准指出你需要留意的暗面。');
    }
    const elCount: Record<string, number> = {};
    cards.forEach((c) => {
      const e = c.card.element || 'spirit';
      elCount[e] = (elCount[e] || 0) + 1;
    });
    const sorted = Object.entries(elCount).sort((a, b) => b[1] - a[1]);
    if (sorted[0] && sorted[0][1] >= 2) {
      const elDesc: Record<string, string> = {
        fire: '行动与热情的火焰',
        water: '情感与直觉的深流',
        air: '思考与沟通的清流',
        earth: '稳定与物质的根基',
        spirit: '觉知与超越的召唤',
      };
      echoParts.push(`主调色是${elDesc[sorted[0][0]]}。`);
    }
    const echoText = echoParts.join('');

    // === 2. 牌的故事 ===
    const storyTexts: string[] = [];
    if (cards.length === 1) {
      const c = cards[0];
      const r = readingOf(c);
      const kw = c.card.keywords.slice(0, 3).join('、');
      storyTexts.push(
        `${c.card.name.cn}${c.reversed ? '逆位' : '正位'}登场，把「${kw}」这一组能量摆到你面前——${r[dim]}`,
      );
    } else if (cards.length === 3 && spreadType === 'three') {
      const modeNames: Record<ThreeMode, [string, string, string]> = {
        time: ['过去的因', '当下的势', '未来的果'],
        mind: ['你的心', '你的行', 'TA 的应'],
        free: ['第一张', '第二张', '第三张'],
      };
      const [n0, n1, n2] = modeNames[threeMode];
      const focus = theme.positionFocus.three[threeMode];
      storyTexts.push(`「${n0}」是${nameOf(cards[0])}——${focus.past}${readingOf(cards[0])[dim]}`);
      storyTexts.push(`「${n1}」是${nameOf(cards[1])}——${focus.present}${readingOf(cards[1])[dim]}`);
      storyTexts.push(`「${n2}」是${nameOf(cards[2])}——${focus.future}${readingOf(cards[2])[dim]}`);
      const c0 = cards[0];
      const c2 = cards[2];
      if (c0.reversed && !c2.reversed) {
        storyTexts.push('从首到尾，是由逆位过渡到正位——你正在走出某段阴霾，向清晰靠近。');
      } else if (!c0.reversed && c2.reversed) {
        storyTexts.push('从首到尾，是由正位走入逆位——需要主动调整，否则会陷入旧的模式。');
      } else {
        storyTexts.push('首尾一致——这是一个连续递进的过程，没有断点。');
      }
    } else if (cards.length >= 5) {
      const positions: { idx: number; label: string; hint: string }[] = [
        { idx: 0, label: '当下核心', hint: '此刻你站的位置——' },
        { idx: 1, label: '主要挑战', hint: '横亘在你面前的课题——' },
        { idx: 5, label: '近未来', hint: '即将浮现的走向——' },
        { idx: 6, label: '自我状态', hint: '你当下的内在——' },
        { idx: 9, label: '最终结果', hint: '沿当前路径的归宿——' },
      ];
      positions.forEach((p) => {
        if (p.idx >= cards.length) return;
        const c = cards[p.idx];
        storyTexts.push(`【${p.label}】${nameOf(c)}：${p.hint}${readingOf(c)[dim]}`);
      });
    }

    // === 3. 给你的指引 ===
    const guidanceParts: string[] = [];
    const action = anchorR.advice || theme.advice;
    if (action) guidanceParts.push(action);
    if (anchorR.timing) guidanceParts.push(anchorR.timing);
    const caution = anchorR.warning || theme.caution;
    if (caution) guidanceParts.push(caution);
    const guidanceText = guidanceParts.join(' ');

    return {
      echoText,
      storyTexts,
      guidanceText,
      anchor: anchorCard,
      closingText: theme.closing,
    };
  }, [cards, spreadType, threeMode, theme]);

  const hasGuidance = guidanceText.length > 0;

  // 复制完整解读到剪贴板
  const handleCopy = useCallback(async () => {
    const lines: string[] = [];
    if (question) lines.push(`【问题】${question}`);
    lines.push('');
    lines.push('【整体映照】');
    lines.push(echoText);
    lines.push('');
    lines.push('【牌的故事】');
    storyTexts.forEach((p) => lines.push(p));
    if (hasGuidance) {
      lines.push('');
      lines.push('【给你的指引】');
      lines.push(guidanceText);
    }
    lines.push('');
    lines.push(`✦ ${closingText} ✦`);
    const text = lines.join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 降级：选中文本
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // 静默失败
      }
      document.body.removeChild(ta);
    }
  }, [question, echoText, storyTexts, guidanceText, hasGuidance, closingText]);

  return (
    <div className="space-y-6 sm:space-y-8 font-body text-sm sm:text-base leading-relaxed text-midnight-100/90">
      {/* 复制按钮 */}
      <div className="flex justify-end -mb-3">
        <button
          onClick={handleCopy}
          className={cn(
            'text-xs px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5',
            copied
              ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
              : 'border-mystic-gold/30 bg-mystic-gold/5 text-mystic-gold/90 hover:bg-mystic-gold/15 hover:border-mystic-gold/50',
          )}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? '已复制' : '复制解读'}
        </button>
      </div>

      {/* === 1. 整体映照（首段，开门见山） === */}
      <p className="text-base sm:text-lg text-midnight-100/95 leading-relaxed font-body">
        {echoText}
      </p>

      {/* === 2. 牌的故事（按牌位展开的叙述） === */}
      <div className="glass-panel rounded-xl p-5 sm:p-6 space-y-4 border-l-2 border-mystic-gold/40">
        {storyTexts.map((p, i) => (
          <p
            key={i}
            className="text-sm sm:text-base text-midnight-100/90 leading-relaxed"
          >
            {p}
          </p>
        ))}
      </div>

      {/* === 3. 给你的指引（行动 + 时机 + 留意，1 段话） === */}
      {hasGuidance && (
        <div className="rounded-xl p-5 sm:p-6 border border-mystic-lightgold/40 bg-mystic-gold/8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-mystic-gold/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <span className="text-mystic-lightgold text-lg leading-none mt-0.5">✦</span>
            <div className="flex-1 min-w-0">
              <div className="font-title text-sm sm:text-base text-mystic-lightgold tracking-widest mb-2">
                给你的指引
              </div>
              <p className="text-sm sm:text-base text-midnight-100/95 leading-relaxed">
                {guidanceText}
              </p>
              <div className="mt-2 text-[10px] text-mystic-gold/60 tracking-widest">
                — 取自 {anchor.card.name.cn}{anchor.reversed ? '（逆）' : '（正）'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === 收束 === */}
      <div className="text-center pt-2">
        <p className="font-title text-sm sm:text-base text-mystic-gold/90 tracking-widest">
          ✦ {closingText} ✦
        </p>
        <p className="mt-3 text-xs sm:text-sm text-midnight-200/70 italic">
          塔罗不预测命运，而是照亮当下。每一次占卜都是与自己内心的一次深度对话。
        </p>
      </div>
    </div>
  );
}
