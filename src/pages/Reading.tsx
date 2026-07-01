import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, RotateCw, Eye, Heart, Briefcase, Coins, BookOpen, Users, Sprout, Compass } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import MysticRing from '@/components/effects/MysticRing';
import BreathingOrb from '@/components/effects/BreathingOrb';
import SweepBeam from '@/components/effects/SweepBeam';
import ConstellationLines from '@/components/effects/ConstellationLines';
import Portal from '@/components/effects/Portal';
import RuneShower from '@/components/effects/RuneShower';
import MysticFog from '@/components/effects/MysticFog';
import TarotCard from '@/components/tarot/TarotCard';
import { useReadingStore } from '@/store/useReadingStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { SPREADS } from '@/data/spreads';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

const PRESET_QUESTIONS: { key: string; icon: any; label: string; question: string; accent: string }[] = [
  {
    key: 'love',
    icon: Heart,
    label: '感情',
    question: '我此刻的感情走向将会如何？',
    accent: 'from-rose-400/20 to-rose-600/5',
  },
  {
    key: 'career',
    icon: Briefcase,
    label: '事业',
    question: '我事业的下一步该如何抉择？',
    accent: 'from-amber-400/20 to-amber-600/5',
  },
  {
    key: 'wealth',
    icon: Coins,
    label: '财富',
    question: '我近期的财运与机遇在哪里？',
    accent: 'from-yellow-400/20 to-yellow-600/5',
  },
  {
    key: 'study',
    icon: BookOpen,
    label: '学业',
    question: '在学业或自我精进上我该专注什么？',
    accent: 'from-blue-400/20 to-blue-600/5',
  },
  {
    key: 'people',
    icon: Users,
    label: '人际',
    question: '我与身边人的关系将如何发展？',
    accent: 'from-violet-400/20 to-violet-600/5',
  },
  {
    key: 'self',
    icon: Sprout,
    label: '自我成长',
    question: '当下我该如何成为更好的自己？',
    accent: 'from-emerald-400/20 to-emerald-600/5',
  },
  {
    key: 'open',
    icon: Compass,
    label: '让宇宙指引',
    question: '',
    accent: 'from-mystic-gold/20 to-mystic-gold/5',
  },
];

export default function Reading() {
  const navigate = useNavigate();
  const {
    spreadType,
    stage,
    drawnCards,
    question,
    setSpread,
    setQuestion,
    startShuffle,
    startSelect,
    selectCards,
    revealAll,
    reset,
  } = useReadingStore();

  const addRecord = useHistoryStore((s) => s.addRecord);

  // 初始化 - 如果没有选 spread，默认 single
  useEffect(() => {
    if (!spreadType) {
      setSpread('single');
    } else {
      // 已经选了 spread 但还没开始
      if (stage === 'idle') {
        // 不动，等用户点击开始
      }
    }
  }, []);

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
  }, [stage, drawnCards, navigate, addRecord, spreadType, question]);

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
              spreadName={spread.name}
              spreadDesc={spread.longDescription}
              cardCount={spread.cardCount}
              question={question}
              setQuestion={setQuestion}
              onStart={() => startShuffle()}
              onChangeSpread={(t) => {
                reset();
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
                // 翻牌将自动开始
                setTimeout(() => revealAll(), 100);
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

// === 1. Intro 阶段：选牌阵 + 输入问题 ===
function IntroStage({
  spreadName,
  spreadDesc,
  cardCount,
  question,
  setQuestion,
  onStart,
  onChangeSpread,
  currentSpread,
}: {
  spreadName: string;
  spreadDesc: string;
  cardCount: number;
  question: string;
  setQuestion: (q: string) => void;
  onStart: () => void;
  onChangeSpread: (t: 'single' | 'three' | 'celtic') => void;
  currentSpread: 'single' | 'three' | 'celtic';
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12"
    >
      <div className="max-w-3xl w-full">
        {/* 顶部进度 */}
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-10">
          {['选择', '冥想', '洗牌', '选牌', '揭晓'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-display text-xs sm:text-sm border transition-all',
                  i === 0
                    ? 'bg-mystic-gold/20 border-mystic-gold text-mystic-lightgold shadow-gold-glow'
                    : 'bg-midnight-800/50 border-mystic-gold/20 text-midnight-300',
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'text-xs sm:text-sm font-title tracking-wider hidden sm:inline',
                  i === 0 ? 'text-mystic-lightgold' : 'text-midnight-300',
                )}
              >
                {label}
              </span>
              {i < 4 && (
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-mystic-gold/30" />
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-10"
        >
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-gold-gradient glow-text">
            准备仪式
          </h1>
          <div className="rune-divider mt-4 max-w-xs mx-auto">
            <span className="text-mystic-gold/60 text-xs">✦</span>
          </div>
          <p className="mt-4 font-body text-sm sm:text-base text-midnight-200/80 italic">
            静心凝神 · 让问题浮现 · 跟随直觉
          </p>
        </motion.div>

        {/* 呼吸球冥想引导 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="flex justify-center mb-8 sm:mb-12"
        >
          <BreathingOrb size={120} duration={9} />
        </motion.div>

        {/* 牌阵切换 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-center text-xs font-title text-mystic-gold/80 tracking-widest mb-4">
            ✦ 选择牌阵 ✦
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {(Object.keys(SPREADS) as Array<keyof typeof SPREADS>).map((key) => {
              const s = SPREADS[key];
              const active = currentSpread === key;
              return (
                <button
                  key={key}
                  onClick={() => onChangeSpread(key)}
                  className={cn(
                    'p-4 sm:p-5 rounded-xl border text-left transition-all duration-300',
                    active
                      ? 'bg-mystic-gold/15 border-mystic-gold shadow-gold-glow'
                      : 'bg-midnight-900/40 border-mystic-gold/15 hover:border-mystic-gold/40',
                  )}
                >
                  <div className="font-display text-base sm:text-lg text-mystic-lightgold mb-1">
                    {s.name}
                  </div>
                  <div className="text-xs text-midnight-200/70 font-body">
                    {s.cardCount} 张牌 · {s.description}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 问题选择 - 预设问题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 sm:mb-10"
        >
          <p className="text-center text-xs font-title text-mystic-gold/80 tracking-widest mb-4">
            ✦ 选择你的问题 ✦
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_QUESTIONS.map((preset) => {
              const Icon = preset.icon;
              const active = question === preset.question;
              return (
                <motion.button
                  key={preset.key}
                  type="button"
                  onClick={() => setQuestion(preset.question)}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'relative p-3 sm:p-4 rounded-xl border text-center transition-all duration-300 overflow-hidden group',
                    active
                      ? 'bg-mystic-gold/15 border-mystic-gold shadow-gold-glow'
                      : 'bg-midnight-900/40 border-mystic-gold/15 hover:border-mystic-gold/40',
                  )}
                >
                  {/* 背景渐变光晕 */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500',
                      preset.accent,
                      active ? 'opacity-100' : 'group-hover:opacity-60',
                    )}
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all',
                        active
                          ? 'bg-mystic-gold/30 border border-mystic-gold'
                          : 'bg-mystic-gold/10 border border-mystic-gold/30',
                      )}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-mystic-gold" />
                    </div>
                    <span
                      className={cn(
                        'font-title text-xs sm:text-sm tracking-wider transition-colors',
                        active ? 'text-mystic-lightgold' : 'text-midnight-100/90',
                      )}
                    >
                      {preset.label}
                    </span>
                  </div>
                  {/* 选中标记 */}
                  {active && (
                    <motion.div
                      layoutId="preset-check"
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-mystic-gold shadow-gold-glow"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
          {/* 当前问题预览 */}
          <AnimatePresence mode="wait">
            {question && (
              <motion.div
                key={question}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-center"
              >
                <div className="inline-block glass-panel rounded-full px-4 py-2 max-w-full">
                  <span className="text-xs text-mystic-gold/70 mr-2">✦</span>
                  <span className="font-body italic text-sm text-midnight-100/90">
                    {question}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 牌阵信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-block glass-panel rounded-xl px-5 py-3">
            <span className="text-xs font-title text-mystic-gold/80 tracking-widest">
              {spreadName}
            </span>
            <span className="text-midnight-300/50 mx-2">·</span>
            <span className="font-body text-sm text-midnight-200/80">{spreadDesc}</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <button onClick={onStart} className="btn-mystic text-sm sm:text-base px-8 py-3 group">
            <Sparkles className="w-4 h-4 mr-2" />
            <span>开始洗牌</span>
            <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </motion.section>
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

  // 生成 12 张牌（视觉上的洗牌堆）
  const deckCards = Array.from({ length: 12 });

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8"
    >
      <div className="max-w-2xl w-full text-center relative">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-gradient glow-text mb-8">
          洗牌中
        </h2>

        {/* 洗牌视觉 */}
        <div className="relative h-72 sm:h-96 mb-8 sm:mb-12 flex items-center justify-center">
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

        {/* 引导语 */}
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-body italic text-base sm:text-lg text-midnight-100/90 mb-6"
        >
          {phase === 'thinking' && '在心中默念你的问题……'}
          {phase === 'shuffling' && '感受你的能量与牌面共振……'}
          {phase === 'done' && '洗牌完毕，准备选牌'}
        </motion.p>

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

// === 3. Select 阶段：选择牌 ===
function SelectStage({
  cardCount,
  onSelect,
}: {
  cardCount: number;
  onSelect: (positions: number[]) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pickingIdx, setPickingIdx] = useState<number | null>(null);

  const FAN_SIZE = 14;

  // 入场动画触发
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // 弧形牌阵布局：14 张牌形成一条优雅的扇形弧线
  const fanPositions = useMemo(
    () =>
      Array.from({ length: FAN_SIZE }, (_, i) => {
        const t = (i / (FAN_SIZE - 1)) * 2 - 1; // -1 到 1
        const xOffset = t * 180;
        const yOffset = -Math.pow(Math.abs(t), 1.6) * 32; // 边缘上抬
        const angle = t * 16; // -16° 到 16°
        // 每张牌独立浮动相位
        const floatPhase = i * 0.6;
        const floatAmp = 4 + Math.abs(t) * 2; // 边缘浮动稍大
        return { xOffset, yOffset, angle, t, idx: i, floatPhase, floatAmp };
      }),
    [],
  );

  // 选中后剩余牌重新居中
  const remainingPositions = useMemo(() => {
    const remaining = Array.from({ length: FAN_SIZE }, (_, i) => i).filter(
      (i) => !selected.includes(i),
    );
    const total = remaining.length;
    if (total === 0) return [];
    return remaining.map((origIdx, newIdx) => {
      const t = total === 1 ? 0 : (newIdx / (total - 1)) * 2 - 1;
      const xOffset = t * 180;
      const yOffset = -Math.pow(Math.abs(t), 1.6) * 32;
      const angle = t * 16;
      return { origIdx, xOffset, yOffset, angle };
    });
  }, [selected]);

  // 顶部选中槽的位置
  const getSlotTarget = (slot: number) => {
    const total = cardCount;
    const totalWidth = Math.min(560, total * 76);
    const spacing = total > 1 ? totalWidth / (total - 1) : 0;
    const startX = -totalWidth / 2;
    return {
      x: startX + slot * spacing,
      y: -260,
      rotate: 0,
      scale: 0.6,
    };
  };

  // 点击选牌
  const handleClick = (i: number) => {
    if (!mounted) return;
    if (selected.includes(i)) return;
    if (selected.length >= cardCount) return;
    setPickingIdx(i);
    const newSelected = [...selected, i];
    // 短暂延迟让飞牌动画播放
    setTimeout(() => {
      setPickingIdx(null);
      setSelected(newSelected);
    }, 280);
    if (newSelected.length === cardCount) {
      setTimeout(() => onSelect(newSelected), 1200);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-6 sm:py-8"
    >
      <div className="max-w-5xl w-full">
        {/* 标题与进度 */}
        <div className="text-center mb-2 sm:mb-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-gradient glow-text"
          >
            选择你的牌
          </motion.h2>
          <div className="rune-divider mt-2 sm:mt-3 max-w-xs mx-auto">
            <span className="text-mystic-gold/60 text-xs">✦</span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 sm:mt-4 font-body italic text-sm sm:text-base text-midnight-200/80"
          >
            请凭直觉选择 {cardCount} 张牌
            <br />
            <span className="text-mystic-gold/80 text-xs">
              已选 {selected.length} / {cardCount}
            </span>
          </motion.p>
        </div>

        {/* 选中区 - 顶部牌槽 */}
        <div className="relative h-28 sm:h-32 mb-1">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
            {Array.from({ length: cardCount }).map((_, slot) => {
              const filledIdx = selected[slot];
              const isFilled = filledIdx !== undefined;
              return (
                <div
                  key={slot}
                  className="relative w-[60px] h-[96px] sm:w-[72px] sm:h-[112px] mx-1 sm:mx-2"
                >
                  {/* 槽位虚框 */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-lg border-2 border-dashed flex items-center justify-center font-display text-sm transition-all duration-500',
                      isFilled
                        ? 'border-mystic-gold/0 opacity-0'
                        : selected.length === slot
                        ? 'border-mystic-gold/60 text-mystic-gold/70 shadow-gold-glow animate-pulse'
                        : 'border-mystic-gold/25 text-mystic-gold/30',
                    )}
                  >
                    {slot + 1}
                  </div>
                  {/* 已选牌占位（牌实际位置由下方弧形牌阵动画控制） */}
                </div>
              );
            })}
          </div>
        </div>

        {/* 弧形牌阵 */}
        <div className="relative h-[280px] sm:h-[340px] mb-4 sm:mb-6 flex items-end justify-center">
          {/* 底座弧线光晕 */}
          <svg
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[110%] max-w-2xl h-32 pointer-events-none opacity-30"
            viewBox="0 0 600 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
                <stop offset="50%" stopColor="#d4af37" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 80 Q 300 -20 600 80"
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth="1.5"
            />
          </svg>

          {/* 顶部牌槽指示线 */}
          {selected.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >
              {selected.map((cardIdx, slot) => {
                const pos = fanPositions[cardIdx];
                if (!pos) return null;
                const target = getSlotTarget(slot);
                return (
                  <motion.line
                    key={`beam-${cardIdx}`}
                    x1={`calc(50% + ${pos.xOffset}px)`}
                    y1={pos.yOffset + 200}
                    x2={`calc(50% + ${target.x}px)`}
                    y2={target.y + 200}
                    stroke="rgba(212,175,55,0.25)"
                    strokeWidth="1"
                    strokeDasharray="3,4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />
                );
              })}
            </svg>
          )}

          {/* 已选中的牌（飞往顶部）*/}
          {selected.map((cardIdx, slot) => {
            const target = getSlotTarget(slot);
            return (
              <motion.div
                key={`selected-${cardIdx}`}
                className="absolute left-1/2 bottom-0 pointer-events-none"
                initial={false}
                animate={{
                  x: target.x,
                  y: target.y,
                  rotate: target.rotate,
                  scale: target.scale,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 120,
                  damping: 18,
                  mass: 0.8,
                }}
                style={{ zIndex: 300 + slot }}
              >
                <div className="relative">
                  <TarotCard
                    showBack
                    size="sm"
                    interactive={false}
                    className="rounded-lg shadow-gold-glow"
                  />
                  {/* 选中序号徽章 */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 18,
                      delay: 0.3,
                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-mystic-gold to-mystic-lightgold text-midnight-950 flex items-center justify-center font-display text-xs sm:text-sm font-bold shadow-gold-glow"
                  >
                    {slot + 1}
                  </motion.div>
                  {/* 持续微动 */}
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                    }}
                  />
                </div>
              </motion.div>
            );
          })}

          {/* 弧形牌阵 - 未选中的牌 */}
          {fanPositions.map((info) => {
            const isSelected = selected.includes(info.idx);
            const isPicking = pickingIdx === info.idx;
            if (isSelected) return null;

            // 计算实时位置（已选时其他牌重新分布）
            let pos = info;
            if (selected.length > 0) {
              const remap = remainingPositions.find((r) => r.origIdx === info.idx);
              if (remap) {
                pos = { ...info, xOffset: remap.xOffset, yOffset: remap.yOffset, angle: remap.angle };
              }
            }
            const isHovered = hoveredIdx === info.idx;
            const isDisabled = selected.length >= cardCount;
            const enterDelay = info.idx * 0.05;

            return (
              <motion.button
                key={info.idx}
                type="button"
                className="absolute left-1/2 bottom-0 touch-manipulation"
                style={{ zIndex: isHovered ? 200 : 50 - Math.abs(info.idx - 7) }}
                initial={{
                  x: 0,
                  y: 0,
                  rotate: 0,
                  scale: 0.3,
                  opacity: 0,
                }}
                animate={
                  isPicking
                    ? { x: pos.xOffset, y: pos.yOffset - 60, rotate: 0, scale: 1.15, opacity: 1 }
                    : isHovered
                    ? {
                        x: pos.xOffset,
                        y: pos.yOffset - 24,
                        rotate: 0,
                        scale: 1.12,
                        opacity: 1,
                      }
                    : {
                        x: pos.xOffset,
                        y: [
                          pos.yOffset,
                          pos.yOffset - info.floatAmp,
                          pos.yOffset,
                        ],
                        rotate: pos.angle,
                        scale: isDisabled ? 0.9 : 1,
                        opacity: mounted ? (isDisabled ? 0.35 : 1) : 0,
                      }
                }
                transition={
                  isPicking
                    ? { duration: 0.28, ease: 'easeOut' }
                    : isHovered
                    ? { type: 'spring', stiffness: 400, damping: 22 }
                    : mounted && !isPicking && !isHovered
                    ? {
                        x: { type: 'spring', stiffness: 180, damping: 22 },
                        y: {
                          duration: 3.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: info.floatPhase,
                        },
                        rotate: { type: 'spring', stiffness: 180, damping: 22 },
                        scale: { duration: 0.4 },
                        opacity: { duration: 0.5, delay: enterDelay },
                      }
                    : { duration: 0.5, delay: enterDelay }
                }
                onClick={() => handleClick(info.idx)}
                onMouseEnter={() => setHoveredIdx(info.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onTouchStart={() => setHoveredIdx(info.idx)}
                onTouchEnd={() => setHoveredIdx(null)}
                aria-label={`第 ${info.idx + 1} 张牌`}
                disabled={isDisabled}
              >
                <div className="relative">
                  {/* 牌本体 */}
                  <div
                    className={cn(
                      'relative transition-all duration-300',
                      isHovered && 'drop-shadow-[0_0_25px_rgba(244,208,63,0.7)]',
                    )}
                  >
                    <TarotCard
                      showBack
                      size="sm"
                      interactive={false}
                      className="rounded-lg shadow-xl"
                    />
                    {/* 序号水印 */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-mystic-gold/40 font-display text-xl sm:text-2xl select-none">
                        {info.idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* 悬停光晕 */}
                  {isHovered && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -inset-3 rounded-2xl pointer-events-none"
                        style={{
                          background:
                            'radial-gradient(ellipse, rgba(244,208,63,0.3) 0%, transparent 70%)',
                          filter: 'blur(8px)',
                        }}
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -inset-1 rounded-lg pointer-events-none"
                        style={{
                          boxShadow:
                            '0 0 20px rgba(212, 175, 55, 0.6), inset 0 0 10px rgba(244, 208, 63, 0.3)',
                        }}
                      />
                      {/* 浮起的提示文字 */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-mystic-lightgold font-title tracking-widest pointer-events-none"
                      >
                        ✦ 选择我 ✦
                      </motion.div>
                    </>
                  )}

                  {/* 正在拾取的能量环 */}
                  {isPicking && (
                    <motion.div
                      className="absolute -inset-6 rounded-2xl pointer-events-none"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 1.8] }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      style={{
                        background:
                          'radial-gradient(circle, rgba(244,208,63,0.5) 0%, transparent 70%)',
                        filter: 'blur(4px)',
                      }}
                    />
                  )}
                </div>
              </motion.button>
            );
          })}

          {/* 顶部"洗牌位置"指示（待选状态） */}
          {selected.length === 0 && mounted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: [0.4, 0.8, 0.4], y: 0 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            >
              <p className="text-xs font-title text-mystic-gold/70 tracking-[0.4em]">
                ✦ 静心感受 · 让直觉引导 ✦
              </p>
            </motion.div>
          )}
        </div>

        {/* 进度指示 */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-center gap-2.5">
            {Array.from({ length: cardCount }).map((_, i) => {
              const filled = selected.length > i;
              return (
                <div key={i} className="relative w-6 h-6 flex items-center justify-center">
                  <motion.div
                    className={cn(
                      'w-3 h-3 rounded-full border-2 transition-colors duration-500',
                      filled
                        ? 'bg-mystic-gold border-mystic-gold'
                        : 'border-mystic-gold/30',
                    )}
                    animate={filled ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  />
                  {filled && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{ scale: [1, 2, 2.5], opacity: [0.5, 0, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      style={{ border: '1px solid rgba(212, 175, 55, 0.6)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 完成提示 */}
          {selected.length === cardCount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="font-body italic text-sm text-mystic-lightgold tracking-wider">
                ✦ 牌已选定 · 命运即将揭晓 ✦
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}

// === 4. Reveal 阶段：揭晓翻牌 ===
function RevealStage({
  cards,
  onComplete,
}: {
  cards: { card: any; reversed: boolean; position: number }[];
  onComplete: () => void;
}) {
  const [revealedCount, setRevealedCount] = useState(0);
  const completedRef = useRef(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [constellationPoints, setConstellationPoints] = useState<{ x: number; y: number }[]>([]);
  const [showConstellation, setShowConstellation] = useState(false);

  useEffect(() => {
    if (revealedCount < cards.length) {
      const t = setTimeout(() => setRevealedCount((c) => c + 1), 1200);
      return () => clearTimeout(t);
    }
  }, [revealedCount, cards.length]);

  // 全部翻开后：先绘制星座连线，再延迟完成
  useEffect(() => {
    if (revealedCount === cards.length && !completedRef.current) {
      completedRef.current = true;
      // 等 0.4s 让最后一张牌的动画完成，然后开始绘制星座
      const drawTimer = setTimeout(() => {
        // 收集已翻开牌的屏幕坐标
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

      // 星座绘制完成后延迟跳转
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
      className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 relative"
    >
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-gradient glow-text">
            命运揭晓
          </h2>
          <div className="rune-divider mt-3 max-w-xs mx-auto">
            <span className="text-mystic-gold/60 text-xs">✦</span>
          </div>
          <p className="mt-4 font-body italic text-sm sm:text-base text-midnight-200/80">
            依次翻开你的牌
          </p>
        </div>

        {/* 牌阵展示 */}
        <div
          className={cn(
            'relative grid gap-6 sm:gap-8 justify-items-center mb-8',
            cards.length === 1 && 'grid-cols-1',
            cards.length === 3 && 'grid-cols-1 md:grid-cols-3',
            cards.length === 10 && 'grid-cols-2 md:grid-cols-5',
          )}
        >
          {/* 星座连线 */}
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
                {/* 即将翻开时的光环 */}
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

                {/* 翻牌瞬间的能量爆发 */}
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

        {/* 进度 */}
        <div className="text-center relative z-10">
          <div className="text-xs font-sans-ui text-mystic-gold/70 tracking-widest">
            {revealedCount} / {cards.length} 已揭晓
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// === 5. Done 阶段：完成，过渡到结果页 ===
function DoneStage({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 100);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Eye className="w-12 h-12 text-mystic-gold mx-auto" />
        </motion.div>
        <p className="mt-4 font-title text-mystic-gold tracking-widest">
          正在解读……
        </p>
      </div>
    </motion.section>
  );
}
