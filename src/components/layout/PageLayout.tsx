import type { ReactNode } from 'react';
import Starfield from '@/components/effects/Starfield';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useTheme } from '@/hooks/useTheme';

interface PageLayoutProps {
  children: ReactNode;
  withStarfield?: boolean;
  starfieldProps?: {
    density?: number;
    showShootingStars?: boolean;
    showNebula?: boolean;
  };
  className?: string;
  containerClassName?: string;
}

export default function PageLayout({
  children,
  withStarfield = true,
  starfieldProps = {},
  className = '',
  containerClassName = '',
}: PageLayoutProps) {
  const { isDark } = useTheme();

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-x-hidden transition-colors duration-500"
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      {/* 背景星空 - 仅暗黑模式显示全效果 */}
      {withStarfield && (
        <div
          className="fixed inset-0 z-0 transition-opacity duration-700"
          style={{ opacity: isDark ? 1 : 0.25 }}
        >
          <Starfield {...starfieldProps} />
        </div>
      )}

      {/* 装饰性暗角 / 光晕 */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 50%, rgba(5, 3, 20, 0.35) 85%, rgba(5, 3, 20, 0.7) 100%)'
            : 'radial-gradient(ellipse at center, transparent 50%, rgba(239, 228, 196, 0.2) 85%, rgba(239, 228, 196, 0.5) 100%)',
        }}
      />

      {/* 内容层 */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className={`flex-1 pt-16 ${className}`}>
          <div className={containerClassName}>{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
