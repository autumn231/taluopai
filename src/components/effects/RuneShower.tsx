import { motion } from 'framer-motion';
import { useMemo, memo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsDark } from '@/hooks/useIsDark';
import { useInViewport } from '@/hooks/useInViewport';

interface RuneShowerProps {
  className?: string;
  count?: number;
  duration?: number;
  runes?: string[];
}

const DEFAULT_RUNES = ['✦', '☽', '✧', '☉', '✶', '✷', '⚝', '❋'];

/**
 * 符文雨 - 飘落的符文符号
 * 优化：白天模式不渲染、视口外停帧、低性能设备少粒子
 */
function RuneShowerImpl({
  className = '',
  count = 14,
  duration = 6,
  runes = DEFAULT_RUNES,
}: RuneShowerProps) {
  const isDark = useIsDark();
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>({ threshold: 0.01 });

  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        rune: runes[i % runes.length],
        x: Math.random() * 100,
        delay: Math.random() * duration,
        fallDuration: duration + Math.random() * 4,
        size: 14 + Math.random() * 20,
        drift: (Math.random() - 0.5) * 60,
      })),
    [count, runes, duration],
  );

  // 白天模式、视口外、减少动态时：返回空容器（保留 ref 让 IntersectionObserver 恢复）
  if (!isDark || !inView || reduced) {
    return (
      <div
        ref={ref}
        className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-mystic-gold/40 font-display"
          style={{
            left: `${item.x}%`,
            top: -50,
            fontSize: item.size,
            textShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
            willChange: 'transform, opacity',
          }}
          initial={{ y: -50, opacity: 0, rotate: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, item.drift, 0],
            opacity: [0, 0.7, 0.7, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: item.fallDuration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {item.rune}
        </motion.div>
      ))}
    </div>
  );
}

export default memo(RuneShowerImpl);
