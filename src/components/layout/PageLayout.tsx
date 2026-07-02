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
          className="fixed inset-0 z-0 transition-opacity duration-500"
          style={{ opacity: isDark ? 1 : 0 }}
        >
          <Starfield {...starfieldProps} />
        </div>
      )}

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
