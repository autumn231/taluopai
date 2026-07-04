import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { answerFollowUp, suggestFollowUps } from '@/lib/interpretation';
import type { DrawnCard } from '@/types';
import type { QuestionTheme } from '@/data/questionThemes';

interface Message {
  id: string;
  role: 'user' | 'reader';
  text: string;
  sourceCard?: string;
  sourceDimension?: string;
  fallback?: boolean;
}

export default function FollowUpChat({
  cards,
  theme,
  question,
}: {
  cards: DrawnCard[];
  theme: QuestionTheme;
  question: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(
    () => suggestFollowUps(theme, cards),
    [theme, cards],
  );

  // 初始问候
  useEffect(() => {
    setMessages([
      {
        id: 'greet',
        role: 'reader',
        text: `我是你的塔罗师。关于「${question || '你刚才问的事'}」，牌面已经铺开。如果你还想深挖某个细节——比如该怎么做、有什么风险、时机何时——尽管问我。`,
      },
    ]);
  }, [question]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    // 模拟塔罗师"思考"——给仪式感，也给计算缓冲
    const delay = 700 + Math.min(q.length * 30, 900);
    window.setTimeout(() => {
      const ans = answerFollowUp(q, cards, theme);
      setMessages((prev) => [
        ...prev,
        {
          id: `r-${Date.now()}`,
          role: 'reader',
          text: ans.text,
          sourceCard: ans.sourceCard,
          sourceDimension: ans.sourceDimension,
          fallback: ans.fallback,
        },
      ]);
      setThinking(false);
    }, delay);
  };

  const reset = () => {
    setMessages([
      {
        id: 'greet',
        role: 'reader',
        text: `好，我们重新开始。关于「${question || '你刚才问的事'}」，你想再问什么？`,
      },
    ]);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div className="glass-panel-strong rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 420 }}>
      {/* 顶部 */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-mystic-gold/15 bg-midnight-900/40">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-mystic-gold/15 border border-mystic-gold/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-mystic-lightgold" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-midnight-900" />
          </div>
          <div>
            <div className="font-title text-sm text-mystic-lightgold tracking-wider">塔罗师</div>
            <div className="text-[10px] text-midnight-300/60">在线 · 从牌面为你解读</div>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={reset}
            className="text-[11px] text-midnight-300/60 hover:text-mystic-gold transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            重置对话
          </button>
        )}
      </div>

      {/* 消息区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3" style={{ maxHeight: 360 }}>
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-mystic-gold/20 border border-mystic-gold/40 text-midnight-50 rounded-br-sm'
                    : 'bg-midnight-900/50 border border-mystic-gold/15 text-midnight-100/95 rounded-bl-sm',
                )}
              >
                <p className="font-body">{m.text}</p>
                {m.role === 'reader' && m.sourceCard && (
                  <div className="mt-1.5 pt-1.5 border-t border-mystic-gold/10 text-[10px] text-midnight-300/60 flex items-center gap-1.5">
                    <span className="text-mystic-gold/70">✦</span>
                    <span>取自 {m.sourceCard}</span>
                    {m.sourceDimension && (
                      <>
                        <span className="text-mystic-gold/30">·</span>
                        <span>{m.sourceDimension}维度</span>
                      </>
                    )}
                    {m.fallback && (
                      <span className="text-amber-400/70 ml-1">（整体回应）</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 思考中 */}
        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-midnight-900/50 border border-mystic-gold/15 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-mystic-gold/70"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
              <span className="ml-1 text-[10px] text-midnight-300/60">塔罗师正在凝视牌面…</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* 快捷追问 */}
      {messages.length <= 1 && (
        <div className="px-4 sm:px-5 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-mystic-gold/25 bg-mystic-gold/5 text-mystic-gold/85 hover:bg-mystic-gold/15 hover:border-mystic-gold/45 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 输入区 */}
      <div className="px-3 sm:px-4 py-3 border-t border-mystic-gold/15 bg-midnight-900/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4 text-mystic-gold/50 shrink-0 hidden sm:block" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="追问任何细节，例如「我该怎么办」「有什么风险」…"
            maxLength={80}
            className="flex-1 min-w-0 bg-midnight-900/50 border border-mystic-gold/20 rounded-full px-4 py-2 text-sm text-midnight-100 placeholder:text-midnight-300/50 focus:outline-none focus:border-mystic-gold/50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className={cn(
              'shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all',
              input.trim() && !thinking
                ? 'bg-mystic-gold/20 border border-mystic-gold/50 text-mystic-lightgold hover:bg-mystic-gold/30'
                : 'bg-midnight-900/40 border border-mystic-gold/15 text-midnight-300/40 cursor-not-allowed',
            )}
            aria-label="发送"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
