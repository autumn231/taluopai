import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

/**
 * 主题切换按钮 - 太阳/月亮图标动画
 */
export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center overflow-hidden border transition-all duration-500 group ${className}`}
      style={{
        background: 'var(--panel-bg)',
        borderColor: 'var(--panel-border)',
      }}
      aria-label={isDark ? '切换到白天模式' : '切换到黑夜模式'}
      title={isDark ? '白天模式' : '黑夜模式'}
    >
      {/* 背景光环 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: isDark
            ? 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168, 132, 42, 0.2) 0%, transparent 70%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* 悬停光晕 */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
        style={{
          boxShadow: '0 0 20px var(--glow-rune)',
        }}
        transition={{ duration: 0.3 }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative z-10"
          >
            <Moon className="w-5 h-5 text-mystic-lightgold" />
            {/* 月光装饰 */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-mystic-lightgold"
                style={{ boxShadow: '0 0 4px rgba(244, 208, 63, 0.8)' }}
              />
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-mystic-lightgold"
                style={{ boxShadow: '0 0 4px rgba(244, 208, 63, 0.8)' }}
              />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-mystic-lightgold"
                style={{ boxShadow: '0 0 4px rgba(244, 208, 63, 0.8)' }}
              />
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-mystic-lightgold"
                style={{ boxShadow: '0 0 4px rgba(244, 208, 63, 0.8)' }}
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative z-10"
          >
            <Sun className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            {/* 太阳光线 */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <div
                  key={deg}
                  className="absolute top-1/2 left-1/2 w-0.5 h-1.5 rounded-full"
                  style={{
                    background: 'var(--accent)',
                    transform: `rotate(${deg}deg) translateY(-12px) translateX(-50%)`,
                    transformOrigin: '50% 50%',
                    boxShadow: '0 0 3px rgba(168, 132, 42, 0.6)',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
