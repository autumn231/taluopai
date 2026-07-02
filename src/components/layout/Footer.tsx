import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-mystic-gold/10 bg-midnight-950/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-mystic-gold/70">
            <Sparkles className="w-4 h-4" />
            <span className="font-display text-sm tracking-widest">MYSTIC TAROT</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <p className="text-center text-sm text-midnight-200/70 max-w-2xl font-body italic">
            塔罗是古老的智慧之镜，映照内心的声音。
            <br />
            本站所有解读仅供娱乐参考，重要的决定请结合现实与理性。
          </p>

          <div className="rune-divider w-full max-w-md">
            <span className="text-mystic-gold/50 text-xs">✦</span>
          </div>

          <div className="text-xs text-midnight-300/60 font-sans-ui tracking-widest">
            © {new Date().getFullYear()} 塔罗秘境 · 仅供娱乐 · 请勿过度依赖
          </div>
        </div>
      </div>
    </footer>
  );
}
