import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const VALID_THEMES: Theme[] = ['light', 'dark'];

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      // 旧版本会把系统推导出的主题自动存入 localStorage，那不是用户的真实选择；
      // 只有手动切换过（theme-explicit=1）的存档才算数，其余一律默认黑夜模式——
      // 本站的设计语言（星空/辉光/鎏金）为深色而生
      if (localStorage.getItem('theme-explicit') === '1') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && VALID_THEMES.includes(savedTheme as Theme)) {
          return savedTheme as Theme;
        }
      }
    } catch {
      // localStorage 不可用时静默回退
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // 隐私模式或配额满时静默失败
    }
  }, [theme]);

  const toggleTheme = () => {
    try {
      localStorage.setItem('theme-explicit', '1');
    } catch {
      // 静默失败
    }
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
}