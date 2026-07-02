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
    <div className="relative min-h-screen flex flex-col bg-midnight-950 text-midnight-100 overflow-x-hidden">
      {/* 背景星空 */}
      {withStarfield && (
        <div className="fixed inset-0 z-0">
          <Starfield {...starfieldProps} />
        </div>
      )}

      {/* 装饰性暗角 */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 3, 20, 0.5) 70%, rgba(5, 3, 20, 0.9) 100%)',
      }} />

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
