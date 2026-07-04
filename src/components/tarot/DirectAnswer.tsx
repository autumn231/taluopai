import { motion } from 'framer-motion';
import { Check, AlertTriangle, Circle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DirectAnswer as DirectAnswerType, Verdict } from '@/lib/interpretation';

const VERDICT_META: Record<
  Verdict,
  {
    label: string;
    icon: typeof Check;
    accent: string;
    ring: string;
    glow: string;
    barFrom: string;
    barTo: string;
  }
> = {
  positive: {
    label: '倾向明朗',
    icon: Check,
    accent: 'text-emerald-300',
    ring: 'border-emerald-400/50',
    glow: 'shadow-[0_0_40px_-10px_rgba(52,211,153,0.45)]',
    barFrom: 'from-emerald-400',
    barTo: 'to-mystic-gold',
  },
  cautious: {
    label: '需谨慎',
    icon: AlertTriangle,
    accent: 'text-rose-300',
    ring: 'border-rose-400/50',
    glow: 'shadow-[0_0_40px_-10px_rgba(251,113,133,0.45)]',
    barFrom: 'from-rose-400',
    barTo: 'to-amber-400',
  },
  neutral: {
    label: '能量待定',
    icon: Circle,
    accent: 'text-mystic-lightgold',
    ring: 'border-mystic-gold/50',
    glow: 'shadow-[0_0_40px_-10px_rgba(234,179,8,0.35)]',
    barFrom: 'from-amber-400',
    barTo: 'to-mystic-gold',
  },
};

export default function DirectAnswer({
  answer,
  question,
}: {
  answer: DirectAnswerType;
  question: string;
}) {
  const meta = VERDICT_META[answer.verdict];
  const Icon = meta.icon;
  // 把 -100..100 映射到 0..100 的进度
  const pct = Math.round(((answer.score + 100) / 200) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'glass-panel-strong rounded-2xl p-5 sm:p-7 relative overflow-hidden border',
        meta.ring,
        meta.glow,
      )}
    >
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-mystic-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-mystic-lightgold" />
          <span className="font-title text-xs sm:text-sm text-mystic-lightgold tracking-widest">
            塔罗师的直接回应
          </span>
        </div>
        <p className="text-[11px] text-midnight-300/60 mb-4">
          针对「{question || '你的问题'}」
        </p>

        {/* 仪表盘 + 判定 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 mb-5">
          {/* 圆环仪表 */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <GaugeMeter pct={pct} verdict={answer.verdict} />
          </div>

          {/* 判定标签 + 一句话 */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-title tracking-widest mb-3',
                meta.ring,
                meta.accent,
                'bg-midnight-900/40',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {meta.label}
            </div>
            <p className="font-body text-sm sm:text-base text-midnight-100/95 leading-relaxed">
              {answer.headline}
            </p>
          </div>
        </div>

        {/* 能量条 */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] text-midnight-300/60 mb-1.5 font-sans-ui">
            <span>逆位 / 内省</span>
            <span className="text-mystic-gold/80">能量中点</span>
            <span>正位 / 顺畅</span>
          </div>
          <div className="relative h-2 rounded-full bg-midnight-900/60 overflow-hidden">
            <div className="absolute inset-y-0 left-1/2 w-px bg-mystic-gold/40" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn('h-full rounded-full bg-gradient-to-r', meta.barFrom, meta.barTo)}
            />
          </div>
        </div>

        {/* 推理过程 */}
        <div className="rounded-xl bg-midnight-900/30 border border-mystic-gold/15 p-3.5">
          <div className="text-[10px] font-title text-mystic-gold/70 tracking-widest mb-1.5">
            为什么这么说
          </div>
          <p className="text-xs sm:text-sm text-midnight-200/85 leading-relaxed font-body">
            {answer.reasoning}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/** 半圆/圆环仪表盘 —— 用 SVG 画一个 270° 的弧 */
function GaugeMeter({ pct, verdict }: { pct: number; verdict: Verdict }) {
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // 270 度弧：从 135° 起到 405°(=45°)
  const startAngle = 135;
  const sweep = 270;
  const valueAngle = startAngle + (sweep * pct) / 100;

  const polar = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (from: number, to: number) => {
    const a = polar(from);
    const b = polar(to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
  };

  const color =
    verdict === 'positive' ? '#34d399' : verdict === 'cautious' ? '#fb7185' : '#eab308';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* 背景弧 */}
        <path
          d={arcPath(startAngle, startAngle + sweep)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* 数值弧 */}
        <motion.path
          d={arcPath(startAngle, valueAngle)}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-display text-mystic-lightgold leading-none">
          {pct}
        </span>
        <span className="text-[9px] text-midnight-300/60 mt-0.5">能量值</span>
      </div>
    </div>
  );
}
