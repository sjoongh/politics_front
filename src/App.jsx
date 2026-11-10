import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@mui/material';
import { makeTheme } from './theme/muiTheme';
import { ThemeModeProvider, useThemeMode } from './theme/ThemeContext';
import { AppProvider } from './components/AppContext';
import AppRouter from './router';
import './App.css';

function ThemedRoot() {
  const { resolved } = useThemeMode();
  const muiTheme = React.useMemo(() => makeTheme(resolved), [resolved]);
  return (
    <ThemeProvider theme={muiTheme}>
      <AppProvider>
        <AppRouter />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--hairline)' },
            success: { iconTheme: { primary: 'var(--action)', secondary: 'var(--on-action)' } },
          }}
        />
      </AppProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeModeProvider>
      <ThemedRoot />
    </ThemeModeProvider>
  );
}
