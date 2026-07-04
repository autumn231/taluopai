import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface Point {
  x: number;
  y: number;
}

interface ConstellationLinesProps {
  points: Point[];
  className?: string;
  color?: string;
  duration?: number;
  drawDelay?: number;
}

/**
 * 星座连线 - 在已翻开的牌之间绘制发光的线
 * 移动端降级：关闭 offsetPath 动画和 SVG filter（这两项在移动端极卡）
 */
export default function ConstellationLines({
  points,
  className = '',
  color = 'rgba(212, 175, 55, 0.5)',
  duration = 1.2,
  drawDelay = 0.1,
}: ConstellationLinesProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!containerEl) return;
    const update = () => {
      setSize({ w: containerEl.offsetWidth, h: containerEl.offsetHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [containerEl]);

  if (points.length < 2) return null;

  // 移动端：简化连线，关闭 offsetPath 和 SVG filter
  if (isMobile) {
    return (
      <div
        ref={setContainerEl}
        className={`absolute inset-0 pointer-events-none ${className}`}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${size.w || 100} ${size.h || 100}`}
          preserveAspectRatio="none"
        >
          {points.map((p, i) => {
            if (i === points.length - 1) return null;
            const next = points[i + 1];
            return (
              <motion.line
                key={i}
                x1={p.x}
                y1={p.y}
                x2={next.x}
                y2={next.y}
                stroke={color}
                strokeWidth="1"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.6, 0.3] }}
                transition={{
                  pathLength: { duration, delay: i * drawDelay, ease: 'easeInOut' },
                  opacity: { duration: 0.4, delay: i * drawDelay },
                }}
              />
            );
          })}
          {/* 简单节点 */}
          {points.map((p, i) => (
            <motion.circle
              key={`node-${i}`}
              cx={p.x}
              cy={p.y}
              r="2"
              fill={color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 0.8, 0.5] }}
              transition={{ duration: 0.4, delay: i * drawDelay }}
            />
          ))}
        </svg>
      </div>
    );
  }

  // 桌面端：完整版（带 gradient、filter、offsetPath 流动光点）
  return (
    <div
      ref={setContainerEl}
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${size.w || 100} ${size.h || 100}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="constellation-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id="constellation-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {points.map((p, i) => {
          if (i === points.length - 1) return null;
          const next = points[i + 1];
          return (
            <g key={i} filter="url(#constellation-glow)">
              <motion.line
                x1={p.x}
                y1={p.y}
                x2={next.x}
                y2={next.y}
                stroke="url(#constellation-gradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 0.6] }}
                transition={{
                  pathLength: { duration, delay: i * drawDelay, ease: 'easeInOut' },
                  opacity: { duration: 0.4, delay: i * drawDelay },
                }}
              />
              {/* 沿线的流动光点 */}
              <motion.circle
                r="3"
                fill="#f4d03f"
                initial={{ offsetDistance: '0%', opacity: 0 }}
                animate={{ offsetDistance: '100%', opacity: [0, 1, 0] }}
                transition={{
                  duration: duration * 0.8,
                  delay: i * drawDelay + 0.2,
                  ease: 'easeInOut',
                }}
                style={{
                  offsetPath: `path("M ${p.x} ${p.y} L ${next.x} ${next.y}")`,
                }}
              />
            </g>
          );
        })}

        {/* 节点星点 */}
        {points.map((p, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#f4d03f"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
            transition={{ duration: 0.6, delay: i * drawDelay, ease: 'easeOut' }}
            filter="url(#constellation-glow)"
          />
        ))}
      </svg>
    </div>
  );
}
