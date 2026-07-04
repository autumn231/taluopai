import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { path: '/', label: '首页' },
  { path: '/tarot', label: '图鉴' },
  { path: '/history', label: '历史' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ESC 关闭移动端菜单
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // 点击菜单外部关闭
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    // 延迟绑定，避免触发菜单打开的同一事件
    const t = setTimeout(() => document.addEventListener('click', onClick), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', onClick);
    };
  }, [menuOpen]);

  return (
    <motion.header
      ref={menuRef}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'backdrop-blur-xl border-b'
          : 'bg-transparent',
      )}
      style={scrolled ? {
        backgroundColor: 'var(--bg-panel)',
        borderColor: 'var(--border-soft)',
      } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 bg-mystic-gold/20 rounded-full blur-md group-hover:bg-mystic-gold/40 transition-all" />
            <Sparkles className="w-5 h-5 text-mystic-gold relative" />
          </div>
          <div className="font-display text-base sm:text-lg text-mystic-lightgold tracking-wider">
            塔罗秘境
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative px-5 py-2 font-title text-sm tracking-widest transition-colors',
                  active ? 'text-mystic-lightgold' : 'text-midnight-200 hover:text-mystic-lightgold',
                )}
              >
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-0.5 h-px bg-mystic-gold"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <Link to="/reading" className="ml-4 btn-mystic text-xs">
            开始占卜
          </Link>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-midnight-100 hover:text-mystic-gold"
          aria-label="菜单"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden backdrop-blur-xl border-t"
            style={{
              backgroundColor: 'var(--bg-panel-strong)',
              borderColor: 'var(--border-soft)',
            }}
          >
            <nav className="flex flex-col p-4 gap-2">
              {NAV_ITEMS.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'px-4 py-3 rounded-lg font-title tracking-widest text-sm transition-colors',
                      active
                        ? 'bg-mystic-gold/10 text-mystic-lightgold'
                        : 'text-midnight-200 hover:bg-mystic-gold/5',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link to="/reading" className="btn-mystic text-xs mt-2">
                开始占卜
              </Link>
              <div className="mt-1">
                <ThemeToggle className="mx-auto" />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
