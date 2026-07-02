import { Sparkles, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="relative border-t backdrop-blur-md transition-colors duration-500"
      style={{
        backgroundColor: 'var(--bg-panel)',
        borderColor: 'var(--border-soft)',
      }}
    >
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

          {/* 作者联系方式 */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-sans-ui">
            <div className="flex items-center gap-1.5 text-midnight-200/80">
              <span className="text-mystic-gold/70">✦</span>
              <span className="tracking-wider">作者</span>
              <span className="text-mystic-lightgold font-medium">高翔</span>
            </div>
            <div className="flex items-center gap-1.5 text-midnight-200/80">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400/80" />
              <span className="tracking-wider">微信</span>
              <span className="font-mono text-mystic-lightgold select-all">gx13598483383</span>
            </div>
          </div>

          <div className="rune-divider w-full max-w-md">
            <span className="text-mystic-gold/50 text-xs">✦</span>
          </div>

          {/* 版权声明 */}
          <div className="text-center space-y-1.5">
            <div className="text-xs text-midnight-300/60 font-sans-ui tracking-widest">
              © {new Date().getFullYear()} 塔罗秘境 · 仅供娱乐 · 请勿过度依赖
            </div>
            <div className="text-[11px] text-midnight-300/50 font-body italic">
              Copyright © {new Date().getFullYear()} 高翔. All rights reserved.
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> · </span>
              如有侵权请联系作者删除。
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
