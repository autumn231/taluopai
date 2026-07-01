import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, RotateCw, Eye } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import MysticRing from '@/components/effects/MysticRing';
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

  // 选完所有牌后，延迟跳转到结果页
  useEffect(() => {
    if (stage === 'done' && drawnCards.length > 0) {
      // 保存到历史
      addRecord({
        id: generateId(),
        timestamp: Date.now(),
        spreadType: spreadType!,
        question,
        cards: drawnCards,
      });
      const t = setTimeout(() => navigate('/result'), 1500);
      return () => clearTimeout(t);
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
          className="text-center mb-8 sm:mb-12"
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
              <span>越具体的问题，得到更精准的指引</span>
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

  useEffect(() => {
    if (progress >= 100 && phase === 'shuffling') {
      setPhase('done');
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
  }, [progress, phase, onComplete]);

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
      <div className="max-w-2xl w-full text-center">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-gradient glow-text mb-8">
          洗牌中
        </h2>

        {/* 洗牌视觉 */}
        <div className="relative h-72 sm:h-96 mb-8 sm:mb-12 flex items-center justify-center">
          {/* 中心环 */}
          <MysticRing size={320} rings={2} speed={0.5} className="absolute opacity-50" />

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

  // 模拟一摞牌，让用户点击抽取
  const stackSize = 26; // 显示的牌数

  const handleClick = (i: number) => {
    if (selected.includes(i)) return;
    if (selected.length >= cardCount) return;
    const newSelected = [...selected, i];
    setSelected(newSelected);
    if (newSelected.length === cardCount) {
      setTimeout(() => onSelect(newSelected), 600);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8"
    >
      <div className="max-w-4xl w-full">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gold-gradient glow-text">
            选择你的牌
          </h2>
          <div className="rune-divider mt-3 max-w-xs mx-auto">
            <span className="text-mystic-gold/60 text-xs">✦</span>
          </div>
          <p className="mt-4 font-body italic text-sm sm:text-base text-midnight-200/80">
            请凭直觉选择 {cardCount} 张牌
            <br />
            <span className="text-mystic-gold/80 text-xs">已选 {selected.length} / {cardCount}</span>
          </p>
        </div>

        {/* 牌堆 - 居中堆叠 */}
        <div className="relative h-72 sm:h-96 mb-8 flex items-center justify-center">
          <div className="relative w-40 h-64 sm:w-48 sm:h-72">
            {Array.from({ length: stackSize }).map((_, i) => {
              const isSelected = selected.includes(i);
              const randomRotate = ((i * 47) % 21) - 10;
              const randomX = ((i * 13) % 11) - 5;
              const randomY = ((i * 7) % 7) - 3;
              const order = selected.indexOf(i);
              // 选中的牌从牌堆中"飞"出
              const angle = order >= 0 ? (order - (cardCount - 1) / 2) * 20 : 0;
              const flyDistance = order >= 0 ? 180 + order * 20 : 0;

              return (
                <motion.div
                  key={i}
                  className="absolute inset-0 cursor-pointer"
                  style={{ zIndex: isSelected ? 100 + order : i }}
                  initial={false}
                  animate={
                    isSelected
                      ? {
                          x: Math.cos((angle * Math.PI) / 180) * flyDistance,
                          y: Math.sin((angle * Math.PI) / 180) * flyDistance - 100,
                          rotate: angle,
                          scale: 0.8,
                        }
                      : {
                          x: hoveredIdx === i ? randomX * 1.5 : randomX,
                          y: hoveredIdx === i ? randomY - 8 : randomY,
                          rotate: randomRotate,
                          scale: 1,
                        }
                  }
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  onClick={() => handleClick(i)}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div className={cn('relative', hoveredIdx === i && !isSelected && 'z-50')}>
                    <TarotCard
                      showBack
                      size="lg"
                      interactive={false}
                      className="rounded-xl shadow-2xl"
                    />
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-mystic-gold text-midnight-950 flex items-center justify-center font-display text-sm font-bold shadow-gold-glow"
                      >
                        {order + 1}
                      </motion.div>
                    )}
                    {hoveredIdx === i && !isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{ boxShadow: '0 0 30px rgba(212, 175, 55, 0.8)' }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
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

  useEffect(() => {
    if (revealedCount < cards.length) {
      const t = setTimeout(() => setRevealedCount((c) => c + 1), 1200);
      return () => clearTimeout(t);
    } else if (revealedCount === cards.length) {
      const t = setTimeout(onComplete, 1500);
      return () => clearTimeout(t);
    }
  }, [revealedCount, cards.length, onComplete]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8"
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
            'grid gap-6 sm:gap-8 justify-items-center mb-8',
            cards.length === 1 && 'grid-cols-1',
            cards.length === 3 && 'grid-cols-1 md:grid-cols-3',
            cards.length === 10 && 'grid-cols-2 md:grid-cols-5',
          )}
        >
          {cards.map((drawn, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <TarotCard
                card={drawn.card}
                reversed={drawn.reversed}
                flipped={idx < revealedCount}
                size={cards.length > 5 ? 'md' : 'lg'}
                interactive={false}
              />
              <AnimatePresence>
                {idx < revealedCount && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-center"
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
          ))}
        </div>

        {/* 进度 */}
        <div className="text-center">
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
