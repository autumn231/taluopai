import { motion } from 'framer-motion';

interface MysticFogProps {
  className?: string;
  variant?: 'overlay' | 'curtain' | 'veil';
  duration?: number;
  onAnimationComplete?: () => void;
}

/**
 * 神秘雾境 - 过场遮罩，多种形态可切换
 */
export default function MysticFog({
  className = '',
  variant = 'overlay',
  duration = 1.6,
  onAnimationComplete,
}: MysticFogProps) {
  if (variant === 'curtain') {
    return (
      <motion.div
        className={`fixed inset-0 z-[90] pointer-events-none ${className}`}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: [0, 1, 1, 0], originX: [0, 0, 1, 1] }}
        transition={{ duration, times: [0, 0.45, 0.55, 1], ease: 'easeInOut' }}
        onAnimationComplete={onAnimationComplete}
        style={{
          background:
            'linear-gradient(90deg, var(--overlay-darken) 0%, var(--overlay-mid) 35%, var(--overlay-accent) 50%, var(--overlay-mid) 65%, var(--overlay-darken) 100%)',
        }}
      />
    );
  }

  if (variant === 'veil') {
    return (
      <motion.div
        className={`fixed inset-0 z-[90] pointer-events-none overflow-hidden ${className}`}
        onAnimationComplete={onAnimationComplete}
      >
        {/* 上方光帘 */}
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background: 'linear-gradient(180deg, var(--overlay-darken) 0%, transparent 100%)',
          }}
          initial={{ y: 0 }}
          animate={{ y: ['0%', '-100%'] }}
          transition={{ duration, ease: 'easeInOut' }}
        />
        {/* 下方光帘 */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background: 'linear-gradient(0deg, var(--overlay-darken) 0%, transparent 100%)',
          }}
          initial={{ y: 0 }}
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration, ease: 'easeInOut' }}
        />
        {/* 中心金光 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration, times: [0, 0.5, 1] }}
        >
          <div
            className="w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(244,208,63,0.6) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        </motion.div>
      </motion.div>
    );
  }

  // overlay - 默认：全屏淡入淡出 + 雾流
  return (
    <motion.div
      className={`fixed inset-0 z-[90] pointer-events-none overflow-hidden ${className}`}
      onAnimationComplete={onAnimationComplete}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, var(--overlay-mid) 0%, var(--overlay-darken) 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration, times: [0, 0.3, 0.7, 1] }}
      />
      {/* 飘动的雾流 */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 500 + i * 200,
            height: 200 + i * 100,
            background: `radial-gradient(ellipse, rgba(212,175,55,${0.1 - i * 0.02}) 0%, transparent 70%)`,
            filter: 'blur(40px)',
            left: `${10 + i * 25}%`,
            top: `${20 + i * 20}%`,
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
