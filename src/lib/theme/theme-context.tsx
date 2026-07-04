import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { getSetting, setSetting } from '@lib/repositories/settings';
import { light, dark, type ThemeColors } from './colors';

const THEME_SETTING_KEY = 'theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const saved = await getSetting(THEME_SETTING_KEY);
        if (saved !== null && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setThemeModeState(saved);
        } else {
          setThemeModeState('system');
          await setSetting(THEME_SETTING_KEY, 'system');
        }
      } catch {
        setThemeModeState('system');
      }
      setIsReady(true);
    }
    init();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await setSetting(THEME_SETTING_KEY, mode);
  }, []);

  const resolvedScheme = themeMode === 'system' ? (systemScheme ?? 'light') : themeMode;
  const isDark = resolvedScheme === 'dark';
  const colors = isDark ? dark : light;

  if (!isReady) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, setThemeMode }}>
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

export { ThemeProvider, useTheme, type ThemeMode };
