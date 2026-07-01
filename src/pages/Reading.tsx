import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, RotateCw, Eye } from 'lucide-react';
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

        {/* 问题输入 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 sm:mb-10"
        >
          <p className="text-center text-xs font-title text-mystic-gold/80 tracking-widest mb-4">
            ✦ 心中所问 ✦
          </p>
          <div className="glass-panel rounded-2xl p-4 sm:p-6">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="此刻，宇宙想从你这里听到的问题……（可选）"
              rows={3}
              maxLength={200}
              className="w-full bg-transparent text-midnight-100 placeholder:text-midnight-300/50 font-body text-sm sm:text-base italic focus:outline-none resize-none"
            />
            <div className="flex justify-between items-center mt-2 text-xs text-midnight-300/60">
              <span>问题将作为洗牌种子，让"所问"真正影响牌面 ✦</span>
              <span>{question.length} / 200</span>
            </div>
          </div>
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

  // 14 张牌分两行扇形铺开，每张都可独立点击
  const FAN_SIZE = 14;
  const ROW_SIZE = 7;
  const fanAngles = useMemo(
    () =>
      Array.from({ length: FAN_SIZE }, (_, i) => {
        // 上排 7 张（0-6），下排 7 张（7-13）
        const isTop = i < ROW_SIZE;
        const posInRow = isTop ? i : i - ROW_SIZE;
        const center = (ROW_SIZE - 1) / 2; // 3
        // 横向偏移：每张牌 44px 间隔（牌宽 90px，露出 ~44px 可见区域）
        const xOffset = (posInRow - center) * 44;
        // 上排在上方，下排贴底
        const yOffset = isTop ? -160 : 0;
        // 旋转：左右两边的牌角度更大，形成扇形
        const normalized = (posInRow - center) / center; // -1 to 1
        const angle = normalized * (isTop ? 7 : -5);
        return { xOffset, yOffset, angle, isTop, posInRow };
      }),
    [],
  );

  const handleClick = (i: number) => {
    if (selected.includes(i)) return;
    if (selected.length >= cardCount) return;
    const newSelected = [...selected, i];
    setSelected(newSelected);
    if (newSelected.length === cardCount) {
      setTimeout(() => onSelect(newSelected), 700);
    }
  };

  // 选中牌的飞出位置（在顶部展示区横向排列）
  const getSelectedFlyTarget = (order: number, total: number) => {
    const totalWidth = Math.min(600, total * 70);
    const spacing = totalWidth / Math.max(total - 1, 1);
    const startX = -totalWidth / 2;
    return {
      x: startX + order * spacing,
      y: -180,
      rotate: 0,
    };
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex items-center justify-center px-2 sm:px-4 py-6 sm:py-8"
    >
      <div className="max-w-5xl w-full">
        <div className="text-center mb-4 sm:mb-8">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-gradient glow-text">
            选择你的牌
          </h2>
          <div className="rune-divider mt-2 sm:mt-3 max-w-xs mx-auto">
            <span className="text-mystic-gold/60 text-xs">✦</span>
          </div>
          <p className="mt-3 sm:mt-4 font-body italic text-sm sm:text-base text-midnight-200/80">
            请凭直觉选择 {cardCount} 张牌
            <br />
            <span className="text-mystic-gold/80 text-xs">已选 {selected.length} / {cardCount}</span>
          </p>
        </div>

        {/* 选中区 */}
        <div className="relative h-20 sm:h-24 mb-2 sm:mb-4">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
            {Array.from({ length: cardCount }).map((_, slot) => {
              const isFilled = selected.length > slot;
              return (
                <div
                  key={slot}
                  className="w-[52px] h-[80px] sm:w-[64px] sm:h-[100px] mx-1 sm:mx-2 rounded-lg border border-dashed border-mystic-gold/30 flex items-center justify-center text-mystic-gold/30 text-xs"
                >
                  {isFilled ? '✦' : slot + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* 牌阵 - 两行扇形 */}
        <div className="relative h-[340px] sm:h-[400px] mb-4 sm:mb-8 flex items-center justify-center">
          {fanAngles.map((info, i) => {
            const isSelected = selected.includes(i);
            const order = selected.indexOf(i);
            const target = order >= 0 ? getSelectedFlyTarget(order, cardCount) : null;

            return (
              <motion.button
                key={i}
                type="button"
                className="absolute left-1/2 bottom-0 origin-bottom touch-manipulation"
                style={{
                  zIndex: isSelected ? 200 + order : hoveredIdx === i ? 150 : i,
                }}
                initial={false}
                animate={
                  isSelected && target
                    ? {
                        x: target.x,
                        y: target.y,
                        rotate: 0,
                        scale: 0.55,
                      }
                    : {
                        x: info.xOffset,
                        y: info.yOffset,
                        rotate: hoveredIdx === i ? 0 : info.angle,
                        scale: hoveredIdx === i ? 1.1 : 1,
                      }
                }
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                onClick={() => handleClick(i)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onTouchStart={() => setHoveredIdx(i)}
                aria-label={`第 ${i + 1} 张牌`}
                disabled={selected.length >= cardCount && !isSelected}
              >
                {/* 牌本体 */}
                <div
                  className={cn(
                    'relative transition-all duration-300',
                    !isSelected && 'hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]',
                    selected.length >= cardCount && !isSelected && 'opacity-40',
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
                    <span className="text-mystic-gold/30 font-display text-xl sm:text-2xl select-none">
                      {i + 1}
                    </span>
                  </div>
                </div>

                {/* 选中徽章 */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, delay: 0.1 }}
                    className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-mystic-gold text-midnight-950 flex items-center justify-center font-display text-xs sm:text-sm font-bold shadow-gold-glow pointer-events-none z-10"
                  >
                    {order + 1}
                  </motion.div>
                )}

                {/* 悬停光晕 */}
                {hoveredIdx === i && !isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ boxShadow: '0 0 25px rgba(212, 175, 55, 0.7), inset 0 0 15px rgba(212, 175, 55, 0.3)' }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 进度点 */}
        <div className="flex justify-center gap-3">
          {Array.from({ length: cardCount }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                'w-3 h-3 rounded-full border-2 transition-all',
                selected.length > i
                  ? 'bg-mystic-gold border-mystic-gold shadow-gold-glow'
                  : 'border-mystic-gold/30',
              )}
              animate={selected.length > i ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
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
