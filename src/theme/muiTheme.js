import { createTheme } from '@mui/material';

const palettes = {
  // 토큰 정본(src/theme/tokens.css)과 같은 값. MUI는 로그인·마이페이지 폼에서만 쓴다.
  light: {
    primary: '#111418', bgDefault: '#ffffff', bgPaper: '#ffffff',
    textPrimary: '#111418', textSecondary: '#5c6470',
  },
  dark: {
    primary: '#eef1f7', bgDefault: '#0f1115', bgPaper: '#151821',
    textPrimary: '#eef1f7', textSecondary: '#9aa3b5',
  },
};

export function makeTheme(mode) {
  const p = palettes[mode] || palettes.light;
  return createTheme({
    palette: {
      mode,
      primary: { main: p.primary },
      background: { default: p.bgDefault, paper: p.bgPaper },
      text: { primary: p.textPrimary, secondary: p.textSecondary },
    },
    typography: { fontFamily: `'Pretendard', -apple-system, sans-serif` },
    shape: { borderRadius: 8 },
  });
}
