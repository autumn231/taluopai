import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const VALID_THEMES: Theme[] = ['light', 'dark'];

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && VALID_THEMES.includes(savedTheme as Theme)) {
        return savedTheme as Theme;
      }
    } catch {
      // localStorage 不可用时静默回退
    }
    // 无已存偏好时默认黑夜模式——本站的设计语言（星空/辉光/鎏金）为深色而生
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
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
}