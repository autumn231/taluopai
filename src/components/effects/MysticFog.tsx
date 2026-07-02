import { motion } from 'framer-motion';
import { memo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInViewport } from '@/hooks/useInViewport';

interface MysticFogProps {
  className?: string;
  variant?: 'overlay' | 'curtain' | 'veil';
  duration?: number;
  onAnimationComplete?: () => void;
}

/**
 * 神秘雾境 - 过场遮罩，多种形态可切换
 * 优化：减少 blur 用量、视口外跳过动画
 */
function MysticFogImpl({
  className = '',
  variant = 'overlay',
  duration = 1.6,
  onAnimationComplete,
}: MysticFogProps) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInViewport<HTMLDivElement>({ threshold: 0.01 });
  // 视口外 + 减少动态时直接不渲染 - 节省 GPU
  if (!inView || reduced) {
    return (
      <div
        ref={ref}
        className={`fixed inset-0 z-[90] pointer-events-none ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'curtain') {
    return (
      <motion.div
        ref={ref}
        className={`fixed inset-0 z-[90] pointer-events-none ${className}`}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: [0, 1, 1, 0], originX: [0, 0, 1, 1] }}
        transition={{ duration, times: [0, 0.45, 0.55, 1], ease: 'easeInOut' }}
        onAnimationComplete={onAnimationComplete}
        style={{
          background:
            'linear-gradient(90deg, rgba(15,10,40,0.98) 0%, rgba(45,25,90,0.95) 35%, rgba(212,175,55,0.4) 50%, rgba(45,25,90,0.95) 65%, rgba(15,10,40,0.98) 100%)',
          willChange: 'transform, opacity',
        }}
      />
    );
  }

  if (variant === 'veil') {
    return (
      <motion.div
        ref={ref}
        className={`fixed inset-0 z-[90] pointer-events-none overflow-hidden ${className}`}
        onAnimationComplete={onAnimationComplete}
      >
        {/* 上方光帘 */}
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background: 'linear-gradient(180deg, rgba(15,10,40,0.95) 0%, transparent 100%)',
            willChange: 'transform',
          }}
          initial={{ y: 0 }}
          animate={{ y: ['0%', '-100%'] }}
          transition={{ duration, ease: 'easeInOut' }}
        />
        {/* 下方光帘 */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background: 'linear-gradient(0deg, rgba(15,10,40,0.95) 0%, transparent 100%)',
            willChange: 'transform',
          }}
          initial={{ y: 0 }}
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration, ease: 'easeInOut' }}
        />
        {/* 中心金光 - 减少 blur 用量 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration, times: [0, 0.5, 1] }}
        >
          <div
            className="w-72 h-72 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(244,208,63,0.6) 0%, transparent 70%)',
              filter: 'blur(8px)',
              willChange: 'opacity',
            }}
          />
        </motion.div>
      </motion.div>
    );
  }

  // overlay - 默认：全屏淡入淡出 + 雾流
  return (
    <motion.div
      ref={ref}
      className={`fixed inset-0 z-[90] pointer-events-none overflow-hidden ${className}`}
      onAnimationComplete={onAnimationComplete}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(45,25,90,0.85) 0%, rgba(15,10,40,0.98) 70%)',
          willChange: 'opacity',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration, times: [0, 0.3, 0.7, 1] }}
      />
      {/* 飘动的雾流 - 减小尺寸与 blur 半径（8px → 6px） */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 360 + i * 120,
            height: 140 + i * 60,
            background: `radial-gradient(ellipse, rgba(212,175,55,${0.08 - i * 0.02}) 0%, transparent 70%)`,
            filter: 'blur(12px)',
            left: `${10 + i * 25}%`,
            top: `${20 + i * 20}%`,
            willChange: 'transform, opacity',
          }}
          initial={{ x: -200, y: 0, opacity: 0 }}
          animate={{ x: [0, 200, -200], y: [0, -50, 0], opacity: [0, 0.5, 0] }}
          transition={{
            duration: duration * 1.2,
            delay: i * 0.2,
            repeat: 1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}

export default memo(MysticFogImpl);
