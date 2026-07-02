import { motion } from 'framer-motion';
import { useMemo, memo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsDark } from '@/hooks/useIsDark';
import { useInViewport } from '@/hooks/useInViewport';

interface SparkleTrailProps {
  className?: string;
  count?: number;
  colors?: string[];
  duration?: number;
}

const DEFAULT_COLORS = ['#f4d03f', '#d4af37', '#ffffff', '#f7e98e'];

/**
 * 闪光粒子阵 - 用于 CTA 按钮、标题等关键元素的装饰
 * 优化：白天模式不渲染、视口外停帧、低性能设备少粒子
 */
function SparkleTrailImpl({
  className = '',
  count = 12,
  colors = DEFAULT_COLORS,
  duration = 3,
}: SparkleTrailProps) {
  const isDark = useIsDark();
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>({ threshold: 0.01 });

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 60 + Math.random() * 40;
        return {
          id: i,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          size: 2 + Math.random() * 4,
          color: colors[i % colors.length],
          delay: Math.random() * 2,
          duration: duration + Math.random() * 2,
        };
      }),
    [count, colors, duration],
  );

  // 白天模式、视口外、减少动态时：返回空容器（保留 ref 让 IntersectionObserver 恢复）
  if (!isDark || !inView || reduced) {
    return (
      <div
        ref={ref}
        className={`pointer-events-none absolute inset-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            willChange: 'transform, opacity',
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: [0, p.x, p.x * 0.6, 0],
            y: [0, p.y, p.y * 0.6, 0],
            scale: [0, 1, 0.6, 0],
            opacity: [0, 1, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default memo(SparkleTrailImpl);
