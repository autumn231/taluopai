import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface SparkleTrailProps {
  className?: string;
  count?: number;
  colors?: string[];
  duration?: number;
}

/**
 * 闪光粒子阵 - 用于 CTA 按钮、标题等关键元素的装饰
 */
export default function SparkleTrail({
  className = '',
  count = 18,
  colors = ['#f4d03f', '#d4af37', '#ffffff', '#f7e98e'],
  duration = 3,
}: SparkleTrailProps) {
  const isMobile = useIsMobile();
  // 移动端大幅减少粒子数
  const effectiveCount = isMobile ? Math.min(count, 4) : count;

  const particles = useMemo(
    () =>
      Array.from({ length: effectiveCount }, (_, i) => {
        const angle = (i / effectiveCount) * Math.PI * 2;
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
    [effectiveCount, colors, duration],
  );

  if (effectiveCount === 0) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
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
