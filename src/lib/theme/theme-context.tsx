import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { getSetting, setSetting } from '@lib/repositories/settings';
import { light, dark, type ThemeColors } from './colors';

const THEME_SETTING_KEY = 'theme';

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const saved = await getSetting(THEME_SETTING_KEY);
      if (saved !== null) {
        setIsDark(saved === 'dark');
      } else {
        const detected = systemScheme === 'dark';
        setIsDark(detected);
        await setSetting(THEME_SETTING_KEY, detected ? 'dark' : 'light');
      }
      setIsReady(true);
    }
    init();
  }, []);

  const toggleTheme = useCallback(async () => {
    setIsDark((prev) => {
      const next = !prev;
      setSetting(THEME_SETTING_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const colors = isDark ? dark : light;

  if (!isReady) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeProvider, useTheme };
