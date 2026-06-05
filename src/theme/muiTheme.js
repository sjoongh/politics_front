import { createTheme } from '@mui/material';

const palettes = {
  light: {
    primary: '#3354ff', bgDefault: '#f4f6fb', bgPaper: '#ffffff',
    textPrimary: '#1a2233', textSecondary: '#5b6580',
  },
  dark: {
    primary: '#5b78ff', bgDefault: '#0f1218', bgPaper: '#181c24',
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
    shape: { borderRadius: 12 },
  });
}
