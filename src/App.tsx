import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';

const Home = lazy(() => import('@/pages/Home'));
const Reading = lazy(() => import('@/pages/Reading'));
const Result = lazy(() => import('@/pages/Result'));
const Tarot = lazy(() => import('@/pages/Tarot'));
const History = lazy(() => import('@/pages/History'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-mystic-gold/30 border-t-mystic-gold animate-spin" />
        <span className="font-title text-sm text-mystic-gold/70 tracking-widest">Loading...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/result" element={<Result />} />
            <Route path="/tarot" element={<Tarot />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </Router>
    </MotionConfig>
  );
}
