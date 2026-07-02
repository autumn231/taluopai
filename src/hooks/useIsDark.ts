import { useEffect, useState } from 'react';

/**
 * 监听当前 html 上的 light/dark 主题类
 * 用 MutationObserver 而不是 useTheme - 避免向每个 effect 注入 useTheme 钩子
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !document.documentElement.classList.contains('light');
  });

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setIsDark(!html.classList.contains('light'));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
