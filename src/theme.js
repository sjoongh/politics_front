import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#21808d' },
    background: { default: '#fcfcf9', paper: '#fffffd' },
    text: { primary: '#13343b', secondary: '#626c71' },
  },
  typography: {
    fontFamily: `'Noto Sans KR', sans-serif`,
  },
  shape: { borderRadius: 8 },
});

export default theme;
