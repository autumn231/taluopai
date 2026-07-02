import { memo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsDark } from '@/hooks/useIsDark';
import { useInViewport } from '@/hooks/useInViewport';

interface EnergyVortexProps {
  size?: number;
  color?: string;
  active?: boolean;
  className?: string;
  rings?: number;
  speed?: number;
}

/**
 * 能量漩涡 - 多环旋转 + 能量粒子辐射
 * 优化：白天模式隐藏、视口外停帧、减少默认粒子数
 */
function EnergyVortexImpl({
  size = 240,
  color = '#d4af37',
  active = true,
  className = '',
  rings = 4,
  speed = 1,
}: EnergyVortexProps) {
  const isDark = useIsDark();
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>({ threshold: 0.05 });

  if (!active || !isDark || !inView || reduced) {
    return (
      <div
        ref={ref}
        className={`relative ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  // 预先计算粒子角度与目标位置 - 避免每帧 Math.cos/sin
  const particleAngles = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2);
  const particleTargets = particleAngles.map((angle) => ({
    x: Math.cos(angle) * size * 0.5,
    y: Math.sin(angle) * size * 0.5,
  }));

  return (
    <div
      ref={ref}
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 辐射光晕 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, transparent 60%)`,
          filter: 'blur(4px)',
          animation: `pulse-soft 2s ease-in-out infinite`,
          animationDuration: `${2 / speed}s`,
          willChange: 'transform, opacity',
        }}
      />

      {/* 多层环 */}
      {Array.from({ length: rings }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * (0.5 + i * 0.15),
            height: size * (0.5 + i * 0.15),
            border: `1px solid ${color}`,
            opacity: 0.4 - i * 0.05,
            borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
            animation: `${i % 2 === 0 ? 'spin' : 'spinReverse'} ${(6 + i) / speed}s linear infinite`,
            willChange: 'transform',
          }}
        />
      ))}

      {/* 中心光球 */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.25,
          height: size * 0.25,
          background: `radial-gradient(circle, #f4d03f 0%, ${color} 60%, transparent 90%)`,
          boxShadow: `0 0 ${size / 3}px ${color}`,
          animation: `pulse-soft 1.5s ease-in-out infinite`,
          animationDuration: `${1.5 / speed}s`,
          willChange: 'transform, opacity',
        }}
      />

      {/* 辐射粒子 - 6 个（从 8 减少），使用 CSS 变量驱动的 keyframe */}
      {particleTargets.map((target, i) => (
        <div
          key={`particle-${i}`}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: 4,
            height: 4,
            background: color,
            boxShadow: `0 0 8px ${color}`,
            animation: `vortexFly ${2 / speed}s ease-out ${i * 0.25}s infinite`,
            // CSS 变量驱动 keyframe 终点 - 比 motion.div 更便宜
            ['--tx' as string]: `${target.x}px`,
            ['--ty' as string]: `${target.y}px`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}

export default memo(EnergyVortexImpl);
