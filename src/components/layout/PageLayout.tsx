import type { ReactNode } from 'react';
import Starfield from '@/components/effects/Starfield';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-base)' }}>
      {/* 背景星空 - 白天模式下变淡 */}
      {withStarfield && (
        <div className="fixed inset-0 z-0 transition-opacity duration-700" style={{ opacity: 'var(--starfield-opacity, 1)' }}>
          <Starfield {...starfieldProps} />
        </div>
      )}

      {/* 装饰性暗角 - 主题感知 */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, var(--vignette-1) 70%, var(--vignette-2) 100%)',
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
