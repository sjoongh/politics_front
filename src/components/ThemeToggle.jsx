import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeMode } from '../theme/ThemeContext';

export default function ThemeToggle() {
  const { resolved, toggle } = useThemeMode();
  const isDark = resolved === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드' : '다크 모드'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
