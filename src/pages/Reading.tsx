import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, RotateCw, Heart, Briefcase, Coins, BookOpen, Users, Sprout, Compass, Clock, Compass as CompassIcon, Wind, type LucideIcon } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import MysticRing from '@/components/effects/MysticRing';
import BreathingOrb from '@/components/effects/BreathingOrb';
import SweepBeam from '@/components/effects/SweepBeam';
import ConstellationLines from '@/components/effects/ConstellationLines';
import Portal from '@/components/effects/Portal';
import RuneShower from '@/components/effects/RuneShower';
import MysticFog from '@/components/effects/MysticFog';
import TarotCard from '@/components/tarot/TarotCard';
import CardBack from '@/components/tarot/CardBack';
import { useReadingUI, useReadingActions, useHistoryActions } from '@/store/selectors';
import { SPREADS, THREE_MODES } from '@/data/spreads';
import { QUESTION_THEMES, type QuestionThemeKey, type SubQuestion, type ThreeMode } from '@/data/questionThemes';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { DrawnCard } from '@/types';

const PRESET_THEMES: { key: QuestionThemeKey; icon: LucideIcon; label: string; accent: string }[] = [
  { key: 'love', icon: Heart, label: '感情', accent: 'from-rose-400/20 to-rose-600/5' },
  { key: 'career', icon: Briefcase, label: '事业', accent: 'from-amber-400/20 to-amber-600/5' },
  { key: 'wealth', icon: Coins, label: '财富', accent: 'from-yellow-400/20 to-yellow-600/5' },
  { key: 'study', icon: BookOpen, label: '学业', accent: 'from-blue-400/20 to-blue-600/5' },
  { key: 'people', icon: Users, label: '人际', accent: 'from-violet-400/20 to-violet-600/5' },
  { key: 'self', icon: Sprout, label: '自我成长', accent: 'from-emerald-400/20 to-emerald-600/5' },
  { key: 'open', icon: Compass, label: '让宇宙指引', accent: 'from-mystic-gold/20 to-mystic-gold/5' },
];

const THREE_MODE_ICONS: Record<ThreeMode, LucideIcon> = {
  time: Clock,
  mind: CompassIcon,
  free: Wind,
};

export default function Reading() {
  const navigate = useNavigate();
  const { spreadType, stage, drawnCards, question, threeMode } = useReadingUI();
  const { setSpread, setThreeMode, setQuestion, startShuffle, startSelect, selectCards, revealAll } = useReadingActions();
  const { addRecord } = useHistoryActions();

  // 选完所有牌后，延迟跳转到结果页（带传送门过场）
  const [portalActive, setPortalActive] = useState(false);
  const [stageTransition, setStageTransition] = useState<string | null>(null);
  const savedRef = useRef(false);
  const prevStageRef = useRef(stage);

  // 阶段切换时显示过场遮罩
  useEffect(() => {
    if (prevStageRef.current !== stage && stage !== 'done') {
      const prev = prevStageRef.current;
      prevStageRef.current = stage;
      setStageTransition(`${prev}->${stage}`);
      const t = setTimeout(() => setStageTransition(null), 800);
      return () => clearTimeout(t);
    }
    prevStageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    if (stage === 'done' && drawnCards.length > 0 && !savedRef.current) {
      savedRef.current = true;
      // 保存到历史
      addRecord({
        id: generateId(),
        timestamp: Date.now(),
        spreadType: spreadType!,
        threeMode,
        question,
        cards: drawnCards,
      });
      // 先显示传送门 1.2s，再跳转
      const portalTimer = setTimeout(() => setPortalActive(true), 400);
      const navigateTimer = setTimeout(() => navigate('/result'), 1700);
      return () => {
        clearTimeout(portalTimer);
        clearTimeout(navigateTimer);
      };
    }
    // stage 重置时允许重新保存
    if (stage !== 'done') {
      savedRef.current = false;
    }
  }, [stage, drawnCards, navigate, addRecord, spreadType, question, threeMode]);

  if (!spreadType) {
    return null;
  }

  const spread = SPREADS[spreadType];

  return (
    <PageLayout starfieldProps={{ density: 0.8 }} containerClassName="">
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        <AnimatePresence mode="wait">
          {stage === 'idle' && (
            <IntroStage
              key="intro"
              question={question}
              setQuestion={setQuestion}
              threeMode={threeMode}
              setThreeMode={setThreeMode}
              onStart={() => startShuffle()}
              onChangeSpread={(t) => {
                setSpread(t);
              }}
              currentSpread={spreadType}
            />
          )}

          {stage === 'shuffle' && (
            <ShuffleStage
              key="shuffle"
              onComplete={() => startSelect()}
            />
          )}

          {stage === 'select' && (
            <SelectStage
              key="select"
              cardCount={spread.cardCount}
              onSelect={(positions) => {
                selectCards(positions);
              }}
            />
          )}

          {stage === 'reveal' && (
            <RevealStage
              key="reveal"
              cards={drawnCards}
              onComplete={() => revealAll()}
            />
          )}

          {stage === 'done' && (
            <DoneStage
              key="done"
              cards={drawnCards}
              onComplete={() => navigate('/result')}
            />
          )}
        </AnimatePresence>

        {/* 传送门过场动画 - 跳转到结果页时 */}
        <AnimatePresence>
          {portalActive && (
            <Portal
              key="portal"
              active={portalActive}
              duration={1.3}
            />
          )}
        </AnimatePresence>

        {/* 阶段切换过场 - 仪式感遮罩 */}
        <AnimatePresence>
          {stageTransition && (
            <MysticFog key="stage-fog" variant="veil" duration={0.8} />
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}

// === 1. Intro 阶段：选牌阵 + 选主题 + 选子问题 ===
function IntroStage({
  question,
  setQuestion,
  threeMode,
  setThreeMode,
  onStart,
  onChangeSpread,
  currentSpread,
}: {
  question: string;
  setQuestion: (q: string) => void;
  threeMode: ThreeMode;
  setThreeMode: (m: ThreeMode) => void;
  onStart: () => void;
  onChangeSpread: (t: 'single' | 'three' | 'celtic') => void;
  currentSpread: 'single' | 'three' | 'celtic';
}) {
  // 当前选中的主题（仅在二级选择时设置）
  const [activeTheme, setActiveTheme] = useState<QuestionThemeKey | null>(null);
  // 当前选中的子问题 id
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  // 从已有 question 反推出主题与子问题（用于刷新/恢复状态）
  useEffect(() => {
    if (!question || activeTheme) return;
    for (const theme of Object.values(QUESTION_THEMES)) {
      const found = theme.subQuestions.find((sq) => sq.text === question);
      if (found) {
        setActiveTheme(theme.key);
        setActiveSubId(found.id);
        return;
      }
    }
  }, [question, activeTheme]);

  const themeData = activeTheme ? QUESTION_THEMES[activeTheme] : null;

  // 切换主题时重置子问题选择
  const handleSelectTheme = (key: QuestionThemeKey) => {
    setActiveTheme(key);
    setActiveSubId(null);
    // 主题级默认问题（取第一个子问题）— 不直接设，让用户继续选
  };

  const handleSelectSub = (sq: SubQuestion) => {
    setActiveSubId(sq.id);
    setQuestion(sq.text);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 px-4 sm:px-6 py-6 sm:py-10"
    >
      <div className="max-w-3xl mx-auto w-full">
        {/* ============ 进度条 ============ */}
        <StepIndicator currentStep={0} />

        {/* ============ 标题区 ============ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-6 sm:mt-10"
        >
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-gold-gradient glow-text leading-tight">
            准备仪式
          </h1>
          <p className="mt-3 font-body italic text-sm sm:text-base text-midnight-200/80">
            静心凝神 · 让问题浮现 · 跟随直觉
          </p>
        </motion.div>

        {/* 呼吸球冥想引导 - 在标题下、选择区上 - 视觉断点 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="flex justify-center my-6 sm:my-10"
        >
          <BreathingOrb size={120} duration={9} />
        </motion.div>

        {/* ============ 牌阵选择 ============ */}
        <Section
          step="01"
          kicker="选择牌阵"
          help="从简明的指引，到深邃的剖析"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(SPREADS) as Array<keyof typeof SPREADS>).map((key) => {
              const s = SPREADS[key];
              const active = currentSpread === key;
              return (
                <button
                  key={key}
                  onClick={() => onChangeSpread(key)}
                  className={cn(
                    'group relative p-4 rounded-xl border text-left transition-all duration-300 overflow-hidden',
                    active
                      ? 'bg-mystic-gold/15 border-mystic-gold shadow-gold-glow'
                      : 'bg-midnight-900/40 border-mystic-gold/15 hover:border-mystic-gold/40',
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div className="font-display text-base sm:text-lg text-mystic-lightgold">
                      {s.name}
                    </div>
                    <div className="text-[10px] font-title text-mystic-gold/70 tracking-wider">
                      {s.cardCount} 张
                    </div>
                  </div>
                  <div className="text-[11px] sm:text-xs text-midnight-200/70 font-body">
                    {s.description}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* 三张牌阵子模式选择器 */}
        <AnimatePresence>
          {currentSpread === 'three' && (
            <motion.div
              key="three-mode"
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5 sm:mt-7 overflow-hidden"
            >
              <Section
                step="01.1"
                kicker="解读模式"
                help="同一牌阵，不同视角"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(THREE_MODES) as ThreeMode[]).map((modeId) => {
                    const mode = THREE_MODES[modeId];
                    const Icon = THREE_MODE_ICONS[modeId];
                    const active = threeMode === modeId;
                    return (
                      <button
                        key={modeId}
                        onClick={() => setThreeMode(modeId)}
                        className={cn(
                          'p-3 sm:p-3.5 rounded-lg border text-left transition-all duration-300',
                          active
                            ? 'bg-mystic-gold/15 border-mystic-gold shadow-gold-glow'
                            : 'bg-midnight-900/40 border-mystic-gold/15 hover:border-mystic-gold/40',
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-3.5 h-3.5 text-mystic-gold" />
                          <span className="font-display text-sm text-mystic-lightgold">
                            {mode.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-midnight-200/75 font-body leading-snug">
                          {mode.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ 问题选择 ============ */}
        <Section
          step="02"
          kicker="选择你的问题"
          help="先选主题，再选具体想问的一面"
        >
          {/* 一级：主题 - 7 个，移动端 2 列，桌面 4 列 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {PRESET_THEMES.map((preset) => {
              const Icon = preset.icon;
              const active = activeTheme === preset.key;
              return (
                <motion.button
                  key={preset.key}
                  type="button"
                  onClick={() => handleSelectTheme(preset.key)}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'relative p-3 sm:p-3.5 rounded-xl border text-center transition-all duration-300 overflow-hidden group',
                    active
                      ? 'bg-mystic-gold/15 border-mystic-gold shadow-gold-glow'
                      : 'bg-midnight-900/40 border-mystic-gold/15 hover:border-mystic-gold/40',
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500',
                      preset.accent,
                      active ? 'opacity-100' : 'group-hover:opacity-60',
                    )}
                  />
                  <div className="relative z-10 flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all',
                        active
                          ? 'bg-mystic-gold/30 border border-mystic-gold'
                          : 'bg-mystic-gold/10 border border-mystic-gold/30',
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-mystic-gold" />
                    </div>
                    <span
                      className={cn(
                        'font-title text-[11px] sm:text-xs tracking-wider transition-colors',
                        active ? 'text-mystic-lightgold' : 'text-midnight-100/90',
                      )}
                    >
                      {preset.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* 二级：子问题 - 仅当选中主题时显示 */}
          <AnimatePresence mode="wait">
            {themeData && (
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 sm:mt-5 glass-panel rounded-xl p-3.5 sm:p-4 border-l-2 border-mystic-gold/40">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-mystic-gold/80">✦</span>
                    <span className="text-[11px] font-title text-mystic-gold/80 tracking-widest">
                      {themeData.label} · 你更想看清哪一面？
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {themeData.subQuestions.map((sq) => {
                      const active = activeSubId === sq.id;
                      return (
                        <button
                          key={sq.id}
                          type="button"
                          onClick={() => handleSelectSub(sq)}
                          className={cn(
                            'group relative p-2.5 sm:p-3 rounded-lg border text-left transition-all duration-300',
                            active
                              ? 'bg-mystic-gold/15 border-mystic-gold shadow-gold-glow'
                              : 'bg-midnight-900/30 border-mystic-gold/15 hover:border-mystic-gold/40',
                          )}
                        >
                          <div className="flex items-baseline gap-1.5 mb-0.5">
                            <span
                              className={cn(
                                'font-display text-sm sm:text-base',
                                active ? 'text-mystic-lightgold' : 'text-mystic-gold/90',
                              )}
                            >
                              {sq.label}
                            </span>
                            {sq.hint && (
                              <span className="text-[10px] text-midnight-300/60 font-body">
                                · {sq.hint}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] sm:text-xs text-midnight-200/80 font-body leading-snug">
                            {sq.text}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ============ 当前选择摘要 + CTA ============ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-12"
        >
          {/* 已选问题摘要 */}
          {question ? (
            <div className="glass-panel rounded-full px-4 py-2.5 max-w-xl mx-auto flex items-center justify-center gap-2 mb-5">
              <span className="text-[11px] text-mystic-gold/70">✦</span>
              <span className="font-body italic text-sm text-midnight-100/90 truncate">
                {question}
              </span>
            </div>
          ) : (
            <div className="text-center mb-5">
              <span className="text-[11px] sm:text-xs font-body italic text-midnight-300/60">
                请先在上方选择问题，再开始洗牌
              </span>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={onStart}
              disabled={!question}
              className={cn(
                'btn-mystic text-sm sm:text-base px-8 py-3 group',
                !question && 'opacity-50 cursor-not-allowed',
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>开始洗牌</span>
              <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/**
 * 步骤指示器 - 横向 5 步
 * - 当前步高亮 + 文本色
 * - 进度已完成步骤用对勾
 */
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ['选择', '洗牌', '选牌', '揭晓'];
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {steps.map((label, i) => {
        const isCurrent = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={label} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={cn(
                'w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-display text-[10px] sm:text-xs border transition-all',
                isCurrent
                  ? 'bg-mystic-gold/20 border-mystic-gold text-mystic-lightgold shadow-gold-glow'
                  : isDone
                  ? 'bg-mystic-gold/15 border-mystic-gold/50 text-mystic-lightgold'
                  : 'bg-midnight-800/50 border-mystic-gold/20 text-midnight-300',
              )}
            >
              {isDone ? '✓' : i + 1}
            </div>
            <span
              className={cn(
                'text-[10px] sm:text-xs font-title tracking-wider hidden sm:inline',
                isCurrent
                  ? 'text-mystic-lightgold'
                  : isDone
                  ? 'text-mystic-gold/70'
                  : 'text-midnight-300',
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-mystic-gold/30" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Section 容器 - 统一的 step / kicker / help / content 结构
 * - 每段有编号 + 标题 + 简短帮助文案 + 内容
 * - 上下间距统一，便于扫读
 */
function Section({
  step,
  kicker,
  help,
  children,
}: {
  step: string;
  kicker: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-7 sm:mt-9"
    >
      {/* Section header - 一行三段：编号 + kicker + help */}
      <div className="flex items-baseline justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-baseline gap-2 sm:gap-3 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-display text-mystic-gold/60 tracking-widest shrink-0">
            {step}
          </span>
          <span className="text-sm sm:text-base font-title text-mystic-gold tracking-wider">
            {kicker}
          </span>
        </div>
        {help && (
          <span className="text-[10px] sm:text-[11px] text-midnight-300/65 font-body italic truncate min-w-0">
            {help}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// === 2. Shuffle 阶段：洗牌动画 ===
function ShuffleStage({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'thinking' | 'shuffling' | 'done'>('thinking');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('shuffling'), 1500);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 2;
      });
    }, 60);

    return () => {
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, []);

  // 进度到 100% 时切换阶段（只触发一次）
  useEffect(() => {
    if (progress >= 100 && phase === 'shuffling' && !triggeredRef.current) {
      triggeredRef.current = true;
      setPhase('done');
    }
  }, [progress, phase]);

  // 进入 done 阶段后延迟跳转到选牌
  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(onComplete, 1200);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  // 生成 18 张牌（视觉上的洗牌堆 - 加密更显仪式感）
  const deckCards = Array.from({ length: 18 });

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 px-4 sm:px-6 py-6 sm:py-10"
    >
      <div className="max-w-2xl mx-auto w-full text-center">
        <StepIndicator currentStep={1} />

        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-gradient glow-text mt-6 sm:mt-10 mb-2">
          洗牌中
        </h2>
        <p className="font-body italic text-sm text-midnight-200/80 mb-8 sm:mb-12">
          {phase === 'thinking' && '请在心中默念你的问题……'}
          {phase === 'shuffling' && '感受你的能量与牌面共振……'}
          {phase === 'done' && '洗牌完毕，准备选牌'}
        </p>

        {/* 洗牌视觉 */}
        <div className="relative h-72 sm:h-96 mb-8 sm:mb-10 flex items-center justify-center">
          {/* 中心环 */}
          <MysticRing size={320} rings={2} speed={0.5} className="absolute opacity-50" />

          {/* 能量波扫光 */}
          <SweepBeam
            direction="ltr"
            color="rgba(212, 175, 55, 0.5)"
            duration={2.5}
            delay={0.5}
          />
          <SweepBeam
            direction="rtl"
            color="rgba(155, 89, 182, 0.35)"
            duration={3}
            delay={1.2}
          />

          {/* 飘落的符文 - 洗牌氛围 */}
          <RuneShower count={12} duration={8} className="z-0" />

          {/* 牌堆 */}
          <div className="relative w-40 h-64 sm:w-48 sm:h-72">
            {deckCards.map((_, i) => {
              const offset = (i - deckCards.length / 2) * 1.5;
              const randomRotate = (i % 2 === 0 ? 1 : -1) * (Math.sin(i) * 3);
              return (
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  initial={{ x: 0, y: 0, rotate: 0 }}
                  animate={
                    phase === 'shuffling'
                      ? {
                          x: [offset * 2, -offset * 2, offset * 1.5, -offset * 1.5, offset * 0.5],
                          y: [0, -10, 5, -5, 0],
                          rotate: [randomRotate * 2, -randomRotate * 2, randomRotate, -randomRotate, 0],
                        }
                      : phase === 'done'
                      ? { x: 0, y: 0, rotate: 0 }
                      : { x: offset, y: 0, rotate: randomRotate }
                  }
                  transition={{
                    duration: 0.8,
                    repeat: phase === 'shuffling' ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                  style={{ zIndex: i }}
                >
                  <TarotCard
                    showBack
                    size="lg"
                    interactive={false}
                    className="rounded-xl shadow-xl"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 进度条 */}
        <div className="max-w-xs mx-auto">
          <div className="h-1 bg-midnight-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-mystic-gold to-mystic-lightgold"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="mt-2 text-xs font-sans-ui text-mystic-gold/60 tracking-widest">
            {progress}%
          </div>
        </div>

        {/* 跳过 */}
        {phase === 'shuffling' && progress > 30 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onComplete}
            className="mt-8 btn-ghost text-xs"
          >
            <RotateCw className="w-3 h-3 mr-2" />
            跳过 · 准备选牌
          </motion.button>
        )}
      </div>
    </motion.section>
  );
}

// === 3. Select 阶段：从厚牌堆抽牌（顶/中/底） ===
type PickSource = 'top' | 'middle' | 'bottom';

const PICK_LABELS: Record<PickSource, { title: string; hint: string }> = {
  top: { title: '从最上面', hint: '跟随第一直觉' },
  middle: { title: '从最中间', hint: '聆听内心深处' },
  bottom: { title: '从最下面', hint: '挖掘隐藏真相' },
};

function SelectStage({
  cardCount,
  onSelect,
}: {
  cardCount: number;
  onSelect: (positions: number[]) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [picking, setPicking] = useState<PickSource | null>(null);
  const [flyingToSlot, setFlyingToSlot] = useState<number | null>(null);

  // 牌堆厚度：越抽越薄
  const DECK_FULL = 28;
  const deckRemaining = Math.max(8, DECK_FULL - selected.length);

  // 抽牌：抽卡 → 飞向顶部槽位 → 落定
  const handlePick = (source: PickSource) => {
    if (picking || flyingToSlot !== null) return;
    if (selected.length >= cardCount) return;
    setPicking(source);
    setTimeout(() => {
      setPicking(null);
      const newSelected = [...selected, selected.length];
      setSelected(newSelected);
      setFlyingToSlot(newSelected.length - 1);
      setTimeout(() => {
        setFlyingToSlot(null);
        if (newSelected.length === cardCount) {
          setTimeout(() => onSelect(newSelected), 500);
        }
      }, 550);
    }, 550);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-6 sm:py-8"
    >
      <div className="max-w-5xl w-full">
        <StepIndicator currentStep={2} />

        <div className="text-center mt-6 sm:mt-8 mb-6 sm:mb-10">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-gradient glow-text">
            从牌堆中抽出你的牌
          </h2>
          <p className="mt-3 sm:mt-4 font-body italic text-sm sm:text-base text-midnight-200/80">
            请凭直觉选择要抽的位置 · 还需 {cardCount - selected.length} 张
          </p>
        </div>

        {/* 顶部: 槽位 */}
        <div className="relative h-28 sm:h-32 mb-2">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
            {Array.from({ length: cardCount }).map((_, slot) => {
              const isFilled = slot < selected.length;
              const isFlying = flyingToSlot === slot;
              return (
                <div
                  key={slot}
                  className="relative w-[60px] h-[96px] sm:w-[72px] sm:h-[112px] mx-1 sm:mx-2"
                >
                  {!isFilled && !isFlying && (
                    <div
                      className={cn(
                        'absolute inset-0 rounded-lg border-2 border-dashed flex items-center justify-center font-display text-sm transition-all duration-500',
                        selected.length === slot
                          ? 'border-mystic-gold/60 text-mystic-gold/70 shadow-gold-glow animate-pulse'
                          : 'border-mystic-gold/25 text-mystic-gold/30',
                      )}
                    >
                      {slot + 1}
                    </div>
                  )}
                  {(isFilled || isFlying) && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="absolute inset-0"
                    >
                      <TarotCard
                        showBack
                        size="sm"
                        interactive={false}
                        className="rounded-lg shadow-gold-glow"
                      />
                      <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-lightgold text-midnight-950 flex items-center justify-center font-display text-xs sm:text-sm font-bold shadow-gold-glow">
                        {slot + 1}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 中间: 3D 厚牌堆 */}
        <DeckView
          remaining={deckRemaining}
          picking={picking}
          flying={flyingToSlot !== null}
        />

        {/* 底部: 3 个抽牌按钮 */}
        <div className="mt-8 sm:mt-12 flex flex-col items-center gap-4">
          <div className="text-[10px] sm:text-xs font-title text-mystic-gold/60 tracking-[0.3em]">
            选择抽牌位置
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl">
            {(['top', 'middle', 'bottom'] as PickSource[]).map((source) => {
              const label = PICK_LABELS[source];
              return (
                <motion.button
                  key={source}
                  type="button"
                  disabled={picking !== null || flyingToSlot !== null || selected.length >= cardCount}
                  onClick={() => handlePick(source)}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'group relative px-4 sm:px-6 py-3 sm:py-4 rounded-xl border transition-all duration-300',
                    'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]',
                    'border-mystic-gold/30 hover:border-mystic-gold/60',
                    'hover:shadow-gold-glow',
                    picking === source && 'border-mystic-gold/80 shadow-gold-glow bg-[var(--bg-card-hover)]',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-mystic-gold/30 disabled:hover:shadow-none',
                  )}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <PickIcon source={source} highlight={picking === source} />
                    <span className="font-title text-sm sm:text-base text-mystic-lightgold tracking-widest">
                      {label.title}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-mystic-gold/85 italic font-medium">
                    {label.hint}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* 进度指示 */}
          <div className="mt-4 flex items-center gap-2">
            {Array.from({ length: cardCount }).map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i < selected.length ? 1 : 0.85,
                  backgroundColor:
                    i < selected.length
                      ? 'rgba(212, 175, 55, 0.85)'
                      : 'rgba(212, 175, 55, 0.15)',
                }}
                transition={{ duration: 0.3 }}
                className="h-1.5 rounded-full"
                style={{ width: i < selected.length ? 28 : 6 }}
              />
            ))}
            <span className="ml-2 text-xs text-mystic-gold/80 font-sans-ui tracking-widest">
              {selected.length} / {cardCount}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// === 3D 厚牌堆视图 ===
function DeckView({
  remaining,
  picking,
  flying,
}: {
  remaining: number;
  picking: PickSource | null;
  flying: boolean;
}) {
  const visibleLayers = Math.min(remaining, 16);
  const isPicking = picking !== null;

  return (
    <div className="relative h-[220px] sm:h-[280px] flex items-center justify-center my-2 sm:my-4">
      {/* 中心能量光晕 */}
      <motion.div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none"
        animate={{
          scale: isPicking ? 1.4 : flying ? 1.2 : 1,
          opacity: isPicking ? 0.7 : 0.35,
        }}
        transition={{ duration: 0.6 }}
        style={{
          background:
            'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(110, 78, 163, 0.15) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* 3D 牌堆 */}
      <div
        className="relative"
        style={{ perspective: '1200px', perspectiveOrigin: '50% 40%' }}
      >
        <motion.div
          className="relative"
          style={{ transformStyle: 'preserve-3d', width: 100, height: 156 }}
          animate={{
            rotateX: isPicking ? (picking === 'top' ? -22 : picking === 'bottom' ? 22 : 0) : 0,
            rotateY: isPicking && picking === 'middle' ? 18 : 0,
            y: isPicking && picking === 'top' ? -20 : 0,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {Array.from({ length: visibleLayers }).map((_, i) => {
            const depth = i;
            const yShift = -depth * 0.6;
            return (
              <div
                key={i}
                className="absolute inset-0 rounded-lg overflow-hidden"
                style={{
                  transform: `translateY(${yShift}px) translateZ(${-depth}px)`,
                  boxShadow: `0 ${2 + depth * 0.3}px ${4 + depth * 0.5}px rgba(0, 0, 0, ${0.3 + depth * 0.02})`,
                  zIndex: visibleLayers - i,
                }}
              >
                <CardBack width={100} height={156} />
              </div>
            );
          })}

          {/* 飞出的牌 */}
          {isPicking && (
            <motion.div
              className="absolute inset-0 rounded-lg overflow-hidden z-50"
              initial={{ y: picking === 'top' ? -10 : picking === 'bottom' ? 10 : 0, scale: 1, opacity: 1 }}
              animate={{
                y: picking === 'top' ? -180 : picking === 'bottom' ? 180 : -10,
                rotateZ: picking === 'top' ? -8 : picking === 'bottom' ? 8 : 0,
                scale: 1.1,
                opacity: 0.7,
              }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              style={{ boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)' }}
            >
              <CardBack width={100} height={156} />
            </motion.div>
          )}
        </motion.div>

        {/* 3 个位置的呼吸箭头提示 */}
        <PickHint source="top" active={!isPicking && !flying} />
        <PickHint source="bottom" active={!isPicking && !flying} />
        <PickHint source="middle" active={!isPicking && !flying} />
      </div>
    </div>
  );
}

function PickHint({ source, active }: { source: PickSource; active: boolean }) {
  if (!active) return null;
  const positions: Record<PickSource, { top?: string; left?: string; arrow: string }> = {
    top: { top: '-10%', left: '50%', arrow: '↑' },
    middle: { top: '50%', left: '102%', arrow: '→' },
    bottom: { top: '92%', left: '50%', arrow: '↓' },
  };
  const pos = positions[source];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
      transition={{ duration: 2.5, repeat: Infinity, delay: source === 'top' ? 0 : source === 'bottom' ? 0.8 : 1.6 }}
      className="absolute pointer-events-none text-mystic-lightgold text-lg sm:text-xl font-title"
      style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)' }}
    >
      {pos.arrow}
    </motion.div>
  );
}

function PickIcon({ source, highlight }: { source: PickSource; highlight: boolean }) {
  const cls = cn('transition-colors', highlight ? 'text-mystic-lightgold' : 'text-mystic-gold/70');
  if (source === 'top') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={cls}>
        <path d="M12 4 L12 20 M5 11 L12 4 L19 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (source === 'bottom') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={cls}>
        <path d="M12 20 L12 4 M5 13 L12 20 L19 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={cls}>
      <path d="M4 12 L20 12 M9 7 L4 12 L9 17 M15 7 L20 12 L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// === 4. Reveal 阶段：揭晓翻牌 ===
function RevealStage({
  cards,
  onComplete,
}: {
  cards: DrawnCard[];
  onComplete: () => void;
}) {
  const [revealedCount, setRevealedCount] = useState(0);
  const completedRef = useRef(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [constellationPoints, setConstellationPoints] = useState<{ x: number; y: number }[]>([]);
  const [showConstellation, setShowConstellation] = useState(false);

  // 跳过揭晓：立即全部翻开并推进
  const handleSkip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setRevealedCount(cards.length);
    onComplete();
  };

  useEffect(() => {
    if (revealedCount < cards.length) {
      const t = setTimeout(() => setRevealedCount((c) => c + 1), 1200);
      return () => clearTimeout(t);
    }
  }, [revealedCount, cards.length]);

  useEffect(() => {
    if (revealedCount === cards.length && !completedRef.current) {
      completedRef.current = true;
      const drawTimer = setTimeout(() => {
        const container = cardRefs.current[0]?.parentElement?.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const points = cardRefs.current
            .filter(Boolean)
            .map((el) => {
              const rect = el!.getBoundingClientRect();
              return {
                x: rect.left + rect.width / 2 - containerRect.left,
                y: rect.top + rect.height / 2 - containerRect.top,
              };
            });
          setConstellationPoints(points);
          setShowConstellation(true);
        }
      }, 400);

      const completeTimer = setTimeout(() => onComplete(), 2800);
      return () => {
        clearTimeout(drawTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [revealedCount, cards.length, onComplete]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 px-4 sm:px-6 py-6 sm:py-10 relative"
    >
      <div className="max-w-5xl mx-auto w-full">
        <div className="mb-6 sm:mb-10">
          <StepIndicator currentStep={3} />

          <div className="text-center mt-6 sm:mt-8">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-gradient glow-text">
              命运揭晓
            </h2>
            <p className="mt-3 sm:mt-4 font-body italic text-sm sm:text-base text-midnight-200/80">
              依次翻开你的牌
            </p>
          </div>
        </div>

        <div
          className={cn(
            'relative grid gap-6 sm:gap-8 justify-items-center mb-8',
            cards.length === 1 && 'grid-cols-1',
            cards.length === 3 && 'grid-cols-1 md:grid-cols-3',
            cards.length === 10 && 'grid-cols-2 md:grid-cols-5',
          )}
        >
          {showConstellation && constellationPoints.length > 1 && (
            <ConstellationLines points={constellationPoints} drawDelay={0.4} />
          )}

          {cards.map((drawn, idx) => {
            const isRevealed = idx < revealedCount;
            const isCurrent = idx === revealedCount;
            return (
              <motion.div
                key={idx}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center relative"
              >
                {isCurrent && (
                  <motion.div
                    className="absolute -inset-8 sm:-inset-12 rounded-3xl pointer-events-none z-10"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: [0, 0.8, 0.5, 0.8, 0.3],
                      scale: [0.5, 1.1, 1, 1.2, 1.3],
                    }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    style={{
                      background: 'radial-gradient(circle, rgba(244,208,63,0.4) 0%, rgba(212,175,55,0.15) 30%, transparent 70%)',
                      filter: 'blur(8px)',
                    }}
                  />
                )}

                {isRevealed && idx === revealedCount - 1 && (
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 rounded-full pointer-events-none z-0"
                    initial={{ width: 0, height: 0, opacity: 0 }}
                    animate={{
                      width: [0, 200, 300],
                      height: [0, 200, 300],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{
                      background: 'radial-gradient(circle, rgba(244,208,63,0.5) 0%, transparent 70%)',
                    }}
                  />
                )}

                <div className="relative z-10">
                  <TarotCard
                    card={drawn.card}
                    reversed={drawn.reversed}
                    flipped={isRevealed}
                    size={cards.length > 5 ? 'md' : 'lg'}
                    interactive={false}
                  />
                </div>
                <AnimatePresence>
                  {isRevealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-center relative z-10"
                    >
                      <div className="font-title text-sm sm:text-base text-mystic-lightgold">
                        {drawn.card.name.cn}
                      </div>
                      {drawn.reversed && (
                        <div className="text-xs text-rose-400/80 font-title mt-1">
                          · 逆位 ·
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center relative z-10 space-y-4">
          <div className="text-xs font-sans-ui text-mystic-gold/70 tracking-widest">
            {revealedCount} / {cards.length} 已揭晓
          </div>
          {revealedCount < cards.length && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleSkip}
              className="btn-ghost text-xs"
            >
              <Sparkles className="w-3 h-3 mr-2" />
              跳过 · 直接解读
            </motion.button>
          )}
        </div>
      </div>
    </motion.section>
  );
}

// === 5. Done 阶段：完成，2 秒过渡动画 + 传送门 ===
function DoneStage({ cards, onComplete }: { cards: DrawnCard[]; onComplete: () => void }) {
  // 2 秒过渡完成后跳转
  useEffect(() => {
    const t = setTimeout(onComplete, 2000);
    return () => clearTimeout(t);
  }, [onComplete]);

  // 计算每张牌的目标位置（环形）
  const ringPositions = useMemo(() => {
    return cards.map((_, i) => {
      const total = cards.length;
      // 第一张始终在正中（最近抽到的）
      if (i === 0) {
        return { x: 0, y: 0, scale: 1.1, zIndex: 100, rotate: 0 };
      }
      // 其余牌绕成环
      const angle = ((i - 1) / Math.max(total - 1, 1)) * Math.PI * 2;
      const radius = Math.min(220, 80 + total * 10);
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.45, // 椭圆，更扁
        scale: 0.85,
        zIndex: 50 - i,
        rotate: ((i - 1) / Math.max(total - 1, 1)) * 18 - 9,
      };
    });
  }, [cards]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* === 1. 中心的传送门光晕 === */}
      <motion.div
        className="absolute w-96 h-96 sm:w-[28rem] sm:h-[28rem] rounded-full pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.4, 2.2],
          opacity: [0, 0.85, 0.4, 0],
        }}
        transition={{ duration: 2, times: [0, 0.4, 0.7, 1], ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle, rgba(244, 208, 63, 0.5) 0%, rgba(212, 175, 55, 0.3) 30%, rgba(110, 78, 163, 0.15) 60%, transparent 80%)',
          filter: 'blur(20px)',
        }}
      />

      {/* === 2. 中心能量球 === */}
      <motion.div
        className="absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #f4d03f 0%, #d4af37 70%, #6e4ea3 100%)',
          boxShadow: '0 0 30px rgba(244, 208, 63, 0.8), 0 0 60px rgba(212, 175, 55, 0.5)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 1.5, 0.3] }}
        transition={{ duration: 2, times: [0, 0.3, 0.6, 1] }}
      />

      {/* === 3. 牌 - 从下坠收缩后扩散到环 === */}
      {cards.map((drawn, i) => {
        const target = ringPositions[i];
        return (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              y: typeof window !== 'undefined' ? window.innerHeight * 0.4 : 400,
              x: 0,
              scale: 0.4,
              rotate: (Math.random() - 0.5) * 60,
              opacity: 0,
            }}
            animate={{
              y: [null, 80, target.y],
              x: [null, 0, target.x],
              scale: [0.4, 0.7, target.scale, target.scale * 0.6, 0],
              rotate: [null, 0, target.rotate, target.rotate * 1.2, 0],
              opacity: [0, 1, 1, 0.8, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.4, 0.7, 0.9, 1],
              ease: 'easeInOut',
              delay: i * 0.05,
            }}
            style={{ zIndex: target.zIndex }}
          >
            <TarotCard
              card={drawn.card}
              reversed={drawn.reversed}
              flipped
              size="sm"
              interactive={false}
              className="rounded-lg"
            />
          </motion.div>
        );
      })}

      {/* === 4. 旋转的金色光环（装饰） === */}
      <motion.div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none"
        initial={{ opacity: 0, rotate: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.6, 0.3, 0], rotate: 360, scale: [0.5, 1, 1.2, 1.5] }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        style={{
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderTopColor: 'rgba(244, 208, 63, 0.8)',
          borderRightColor: 'rgba(244, 208, 63, 0.6)',
        }}
      />
      <motion.div
        className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full pointer-events-none"
        initial={{ opacity: 0, rotate: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.5, 0.2, 0], rotate: -360, scale: [0.5, 0.9, 1.1, 1.4] }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        style={{
          border: '1px dashed rgba(212, 175, 55, 0.3)',
        }}
      />

      {/* === 5. 文字 === */}
      <motion.div
        className="absolute bottom-[18%] sm:bottom-[15%] left-0 right-0 text-center pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], y: 0 }}
        transition={{ duration: 2, times: [0, 0.3, 0.85, 1] }}
      >
        <p className="font-title text-sm sm:text-base text-mystic-lightgold tracking-[0.4em]">
          ✦ 命运正在显现 ✦
        </p>
        <p className="mt-2 text-xs sm:text-sm text-mystic-gold/60 italic">
          {cards.length} 张牌为你揭开谜底……
        </p>
      </motion.div>

      {/* === 6. 最终全屏白闪（结束时） === */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.6, 0] }}
        transition={{ duration: 2, times: [0, 0.85, 0.95, 1] }}
        style={{
          background:
            'radial-gradient(circle, rgba(244, 208, 63, 0.6) 0%, rgba(212, 175, 55, 0.3) 50%, transparent 80%)',
        }}
      />
    </motion.section>
  );
}
