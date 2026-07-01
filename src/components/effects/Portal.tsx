import { motion } from 'framer-motion';

interface PortalProps {
  active: boolean;
  onComplete?: () => void;
  duration?: number;
  className?: string;
}

/**
 * 传送门 - 圆形能量漩涡，用于页面跳转
 */
export default function Portal({ active, onComplete, duration = 1.5, className = '' }: PortalProps) {
  if (!active) return null;

  return (
    <motion.div
      className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 中心暗化 */}
      <motion.div
        className="absolute inset-0 bg-midnight-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0.85] }}
        transition={{ duration, times: [0, 0.6, 1], ease: 'easeIn' }}
        onAnimationComplete={() => onComplete?.()}
      />

      {/* 旋转环 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: 200 + i * 80,
            height: 200 + i * 80,
            borderColor: i % 2 === 0 ? '#d4af37' : '#9b59b6',
            borderWidth: 1,
            opacity: 0.4,
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
          }}
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.2, 1.5],
            rotate: i % 2 === 0 ? 360 : -360,
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* 中心光球 */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: 120,
          height: 120,
          background: 'radial-gradient(circle, #f4d03f, #d4af37 50%, transparent 80%)',
          boxShadow: '0 0 80px rgba(244, 208, 63, 0.8)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 2] }}
        transition={{ duration: duration * 0.7, ease: 'easeOut' }}
      />

      {/* 文字 */}
      <motion.div
        className="absolute font-display text-mystic-lightgold tracking-[0.4em] text-lg sm:text-xl glow-text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0, 1, 1, 0], y: 0 }}
        transition={{ duration, times: [0, 0.2, 0.7, 1] }}
      >
        ✦ 解读之门 ✦
      </motion.div>
    </motion.div>
  );
}
