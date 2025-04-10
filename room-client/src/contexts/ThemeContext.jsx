import { createContext, useContext, useState, useMemo,useEffect } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const localThemeMode=localStorage.getItem("coros-theme")||'light';
  const [mode, setMode] = useState(localThemeMode);
  const contextValue = useMemo(() => ({
    mode,
    toggleColorMode: () => {
        setMode(prev => prev === 'light' ? 'dark' : 'light');
    }
  }), [mode]);
  useEffect(()=>{
    localStorage.setItem("coros-theme",mode);
  },[mode])
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? {
        background: { default: '#f5f5f5', paper: '#ffffff' },
        text: { primary: '#121212', secondary: '#4a4a4a' }
      } : {
        background: { default: '#121212', paper: '#1E1E1E' },
        text: { primary: '#ffffff', secondary: '#b0b0b0' }
      })
    }
  }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}