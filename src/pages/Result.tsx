import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, History, Sparkles, Heart, Briefcase, Coins, BookOpen } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import TarotCard from '@/components/tarot/TarotCard';
import EnergyVortex from '@/components/effects/EnergyVortex';
import SparkleTrail from '@/components/effects/SparkleTrail';
import { useReadingStore } from '@/store/useReadingStore';
import { SPREADS } from '@/data/spreads';
import { cn } from '@/lib/utils';

export default function Result() {
  const navigate = useNavigate();
  const { drawnCards, spreadType, question, reset } = useReadingStore();

  useEffect(() => {
    if (drawnCards.length === 0 || !spreadType) {
      navigate('/reading', { replace: true });
    }
  }, [drawnCards, spreadType, navigate]);

  if (drawnCards.length === 0 || !spreadType) {
    return null;
  }

  const spread = SPREADS[spreadType];
  const positions = spread.positions;

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
              <div className="text-xs font-title text-mystic-gold/80 tracking-widest mb-2">
                ✦ 你所问 ✦
              </div>
              <p className="font-body italic text-base sm:text-lg text-midnight-100/90">
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
          className="mb-12 sm:mb-16"
        >
          <SpreadLayout
            cards={drawnCards}
            positions={positions}
            spreadType={spreadType}
          />
        </motion.section>

        {/* 单牌解读 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-8 sm:space-y-12 mb-12 sm:mb-16"
        >
          {drawnCards.map((drawn, idx) => (
            <CardInterpretation
              key={idx}
              card={drawn.card}
              reversed={drawn.reversed}
              position={positions[drawn.position]}
              index={idx}
            />
          ))}
        </motion.section>

        {/* 综合解读 */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12 sm:mb-16"
        >
          <div className="glass-panel-strong rounded-2xl p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mystic-gold/50 to-transparent" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-mystic-gold/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="text-center mb-6 sm:mb-8 relative">
                <div className="flex justify-center mb-3">
                  <EnergyVortex size={80} rings={3} speed={1.5} />
                </div>
                <Sparkles className="w-6 h-6 text-mystic-gold mx-auto mb-3 relative z-10" />
                <h2 className="font-display text-2xl sm:text-3xl text-mystic-lightgold glow-text">
                  综合解读
                </h2>
                <div className="rune-divider mt-3 max-w-xs mx-auto">
                  <span className="text-mystic-gold/60 text-xs">✦</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <SynthesisReading
                  spreadType={spreadType}
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
}: {
  card: any;
  reversed: boolean;
  position: any;
  index: number;
}) {
  const reading = reversed ? card.reversed : card.upright;

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
          </div>

          <h3 className="font-display text-2xl sm:text-3xl text-gold-gradient mb-1">
            {card.name.cn}
          </h3>
          <div className="text-xs text-midnight-300/60 font-title tracking-widest mb-4">
            {card.name.en.toUpperCase()}
            <span className="mx-2 text-mystic-gold/40">·</span>
            {card.element === 'spirit' ? '灵' : card.element === 'fire' ? '火' : card.element === 'water' ? '水' : card.element === 'air' ? '风' : '土'}
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

          {/* 综合解读 */}
          <div className="mb-5">
            <SectionTitle icon={<Sparkles className="w-3.5 h-3.5" />} title="核心指引" />
            <p className="font-body text-sm sm:text-base text-midnight-100/90 leading-relaxed">
              {reading.general}
            </p>
          </div>

          {/* 三维度解读 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Dimension
              icon={<Heart className="w-3.5 h-3.5" />}
              label="爱情"
              content={reading.love}
              color="rose"
            />
            <Dimension
              icon={<Briefcase className="w-3.5 h-3.5" />}
              label="事业"
              content={reading.career}
              color="violet"
            />
            <Dimension
              icon={<Coins className="w-3.5 h-3.5" />}
              label="财运"
              content={reading.wealth}
              color="gold"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-mystic-gold">{icon}</span>
      <span className="font-title text-xs sm:text-sm text-mystic-gold/90 tracking-widest">
        {title}
      </span>
    </div>
  );
}

function Dimension({
  icon,
  label,
  content,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  content: string;
  color: 'rose' | 'violet' | 'gold';
}) {
  const colors = {
    rose: 'text-rose-400/90 border-rose-400/30 bg-rose-400/5',
    violet: 'text-violet-400/90 border-violet-400/30 bg-violet-400/5',
    gold: 'text-mystic-gold/90 border-mystic-gold/30 bg-mystic-gold/5',
  };
  return (
    <div className={cn('rounded-xl border p-3 sm:p-4', colors[color])}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="font-title text-xs tracking-widest">{label}</span>
      </div>
      <p className="font-body text-xs sm:text-sm text-midnight-100/80 leading-relaxed">
        {content}
      </p>
    </div>
  );
}

// === 综合解读 ===
function SynthesisReading({
  spreadType,
  cards,
  question,
}: {
  spreadType: 'single' | 'three' | 'celtic';
  cards: any[];
  question: string;
}) {
  const reversedCount = cards.filter((c) => c.reversed).length;
  const elements = cards.map((c) => c.card.element);
  const dominantElement = ['fire', 'water', 'air', 'earth', 'spirit']
    .map((el) => ({ el, count: elements.filter((e) => e === el).length }))
    .sort((a, b) => b.count - a.count)[0];

  // 从问题中识别主题
  const detectTheme = (q: string): { theme: 'love' | 'career' | 'wealth' | 'general'; label: string; keywords: string[] } => {
    const trimmed = q.trim();
    if (!trimmed) return { theme: 'general', label: '', keywords: [] };
    const loveKW = ['爱', '感情', '恋爱', '喜欢', '他', '她', '伴侣', '对象', '婚姻', '分手', '复合', '桃花', '暗恋', '心动', '前任'];
    const careerKW = ['工作', '事业', '职业', '升职', '跳槽', '面试', '创业', '项目', '同事', '老板', '求职', '岗位', '团队', 'offer'];
    const wealthKW = ['钱', '财', '收入', '工资', '投资', '理财', '股票', '基金', '创业', '副业', '生意', '经济', '房贷', '还贷', '存款'];
    if (loveKW.some((k) => trimmed.includes(k))) {
      return { theme: 'love', label: '情感', keywords: loveKW };
    }
    if (careerKW.some((k) => trimmed.includes(k))) {
      return { theme: 'career', label: '事业', keywords: careerKW };
    }
    if (wealthKW.some((k) => trimmed.includes(k))) {
      return { theme: 'wealth', label: '财富', keywords: wealthKW };
    }
    return { theme: 'general', label: '人生', keywords: [] };
  };

  const questionTheme = detectTheme(question);

  // 根据问题主题生成回应的引导
  const questionResponse = (() => {
    if (!question.trim()) return null;
    const theme = questionTheme;
    if (theme.theme === 'love') {
      return (
        <>
          关于你在感情中提出的疑问，牌阵首先回应你最关心的部分：此刻关系中的能量状态与未来的走向，已在以下牌面中清晰呈现。
        </>
      );
    }
    if (theme.theme === 'career') {
      return (
        <>
          关于你关于事业发展的提问，宇宙通过这组牌面为你揭示当前职业道路上的关键能量与转折点，请仔细感受每张牌的指引。
        </>
      );
    }
    if (theme.theme === 'wealth') {
      return (
        <>
          关于你的财务提问，牌阵为你照亮了当前资金流动的方向与可能遇到的机遇，理性与直觉同样重要。
        </>
      );
    }
    return (
      <>
        关于你所问之事，牌阵以它独有的方式回应——既不直接给出答案，也非无关的暗示，而是将此刻与你相关的能量映射到这些符号之中。
      </>
    );
  })();

  return (
    <div className="space-y-5 sm:space-y-6 font-body text-sm sm:text-base leading-relaxed text-midnight-100/90">
      {questionResponse && (
        <div className="glass-panel rounded-xl p-4 sm:p-5 border-l-2 border-mystic-gold/60">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-title text-mystic-gold/80 tracking-widest">
              ✦ 关于你的提问
            </span>
            {questionTheme.label && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-mystic-gold/15 text-mystic-lightgold border border-mystic-gold/30">
                {questionTheme.label}主题
              </span>
            )}
          </div>
          <p className="text-midnight-100/90 italic">"{question.trim()}"</p>
          <p className="mt-3 text-sm sm:text-base text-midnight-100/80">
            {questionResponse}
          </p>
        </div>
      )}

      <p>
        {spreadType === 'single' && (
          <>
            <span className="text-mystic-lightgold">{cards[0].card.name.cn}</span>
            {cards[0].reversed ? '逆位' : '正位'}
            的出现，邀请你将注意力转向
            {cards[0].reversed ? '内在的阴影面' : '当下能量的核心'}。
            此刻宇宙通过这张牌传递的信息非常明确——
            {questionTheme.theme !== 'general' && questionTheme.theme === 'love' && cards[0].reversed
              ? '在感情层面，这张逆位的牌提示你需要先看清关系中的真相。'
              : questionTheme.theme !== 'general' && questionTheme.theme === 'career' && cards[0].reversed
              ? '在事业层面，这张逆位的牌提示你需要重新评估当前的方向。'
              : cards[0].reversed
              ? cards[0].card.reversed.general.split('。')[0]
              : cards[0].card.upright.general.split('。')[0]}
            {questionTheme.theme === 'love' && (
              <> 关于<span className="text-mystic-lightgold">爱情</span>，{cards[0].reversed ? cards[0].card.reversed.love : cards[0].card.upright.love}</>
            )}
            {questionTheme.theme === 'career' && (
              <> 关于<span className="text-mystic-lightgold">事业</span>，{cards[0].reversed ? cards[0].card.reversed.career : cards[0].card.upright.career}</>
            )}
            {questionTheme.theme === 'wealth' && (
              <> 关于<span className="text-mystic-lightgold">财务</span>，{cards[0].reversed ? cards[0].card.reversed.wealth : cards[0].card.upright.wealth}</>
            )}
            {questionTheme.theme === 'general' && (
              <> 核心指引：{cards[0].reversed ? cards[0].card.reversed.general : cards[0].card.upright.general}</>
            )}
          </>
        )}

        {spreadType === 'three' && (
          <>
            三张牌的时间之流为你呈现了一幅完整的能量图景。
            <span className="text-mystic-lightgold">{cards[0].card.name.cn}</span>
            作为过去的影响，揭示了
            {cards[0].reversed ? '你需要放下的旧有模式' : '支持你走到今天的根基'}；
            <span className="text-mystic-lightgold">{cards[1].card.name.cn}</span>
            标志着当下的核心能量，{cards[1].reversed ? cards[1].card.reversed.general.split('。')[0] : cards[1].card.upright.general.split('。')[0]}；
            <span className="text-mystic-lightgold">{cards[2].card.name.cn}</span>
            则指向未来的走向，{cards[2].reversed ? '警示你需要在某些领域做出调整' : '预示着丰盛的可能性正在靠近'}。
            {questionTheme.theme !== 'general' && (
              <>
                {' '}
                针对你关于<span className="text-mystic-lightgold">{questionTheme.label}</span>的提问，
                请特别留意第三张<span className="text-mystic-lightgold">{cards[2].card.name.cn}</span>
                {cards[2].reversed ? '逆位' : '正位'}所传递的
                <span className="text-mystic-lightgold">
                  {questionTheme.theme === 'love' && (cards[2].reversed ? cards[2].card.reversed.love : cards[2].card.upright.love).split('。')[0]}
                  {questionTheme.theme === 'career' && (cards[2].reversed ? cards[2].card.reversed.career : cards[2].card.upright.career).split('。')[0]}
                  {questionTheme.theme === 'wealth' && (cards[2].reversed ? cards[2].card.reversed.wealth : cards[2].card.upright.wealth).split('。')[0]}
                </span>。
              </>
            )}
          </>
        )}

        {spreadType === 'celtic' && (
          <>
            凯尔特十字的十张牌为你的人生全景提供了深度的剖析。
            你的当下核心状态由
            <span className="text-mystic-lightgold">{cards[0].card.name.cn}</span>
            所定义，而横亘在前的主要挑战是
            <span className="text-mystic-lightgold">{cards[1].card.name.cn}</span>
            所昭示的课题。你的意识与潜意识层面分别由
            <span className="text-mystic-lightgold">{cards[2].card.name.cn}</span>与
            <span className="text-mystic-lightgold">{cards[3].card.name.cn}</span>
            所支撑；过去的影响正逐渐淡去，未来则由
            <span className="text-mystic-lightgold">{cards[5].card.name.cn}</span>所引导。
            <span className="text-mystic-lightgold">{cards[6].card.name.cn}</span>
            描述了你当下的内在状态，
            <span className="text-mystic-lightgold">{cards[7].card.name.cn}</span>
            反映外部环境的影响。
            <span className="text-mystic-lightgold">{cards[8].card.name.cn}</span>
            揭示了你内心深处的希望与恐惧，而
            <span className="text-mystic-lightgold">{cards[9].card.name.cn}</span>
            则是若沿此路径的最终走向。
            {questionTheme.theme !== 'general' && (
              <>
                {' '}
                关于你所关注的<span className="text-mystic-lightgold">{questionTheme.label}</span>议题，
                请将注意力特别放在第 6 张
                <span className="text-mystic-lightgold">{cards[5].card.name.cn}</span>
                （近未来）、第 7 张
                <span className="text-mystic-lightgold">{cards[6].card.name.cn}</span>
                （自我状态）以及第 10 张
                <span className="text-mystic-lightgold">{cards[9].card.name.cn}</span>
                （最终结果）上。
              </>
            )}
          </>
        )}
      </p>

      <p>
        在这组牌中，{reversedCount === 0
          ? '所有牌都呈正位出现，象征着能量的顺畅流动，宇宙正在为你铺设一条清晰的道路。'
          : reversedCount === cards.length
          ? '所有牌都呈逆位，提示你需要在内在进行深度的反思与调整，外在的改变需要先从心开始。'
          : `有 ${reversedCount} 张牌呈逆位，${cards.length - reversedCount} 张正位，${reversedCount > cards.length / 2 ? '提示你面临的挑战较多，需要更深的内省。' : '整体能量较为顺畅，逆位的牌指出了需要留意的领域。'}`}
      </p>

      {dominantElement && dominantElement.count > 0 && (
        <p>
          从元素分布来看，
          {dominantElement.el === 'fire' && '火元素的能量主导，象征着行动力、创造力与激情的涌动。'}
          {dominantElement.el === 'water' && '水元素的能量主导，象征着情感、直觉与内在的流动。'}
          {dominantElement.el === 'air' && '风元素的能量主导，象征着思想、沟通与理性的清晰。'}
          {dominantElement.el === 'earth' && '土元素的能量主导，象征着稳定、物质与实际的建构。'}
          {dominantElement.el === 'spirit' && '灵性元素的能量主导，象征着更高的指引与觉醒。'}
          这是你此阶段最需要觉察与运用的能量。
        </p>
      )}

      <div className="mt-6 sm:mt-8 pt-6 border-t border-mystic-gold/15 text-center">
        <p className="font-title text-sm sm:text-base text-mystic-gold/90 tracking-widest">
          ✦ 愿星辰指引你的道路 ✦
        </p>
        <p className="mt-3 text-xs sm:text-sm text-midnight-200/70 italic">
          记住：塔罗不预测命运，而是照亮当下。每一次占卜都是与自己内心的一次深度对话。
        </p>
      </div>
    </div>
  );
}
