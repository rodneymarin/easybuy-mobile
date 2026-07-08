import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { getSetting, setSetting } from '@lib/repositories/settings';
import { translations, type Language } from './translations';

const LANGUAGE_SETTING_KEY = 'language';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const saved = await getSetting(LANGUAGE_SETTING_KEY);
        if (saved === 'en' || saved === 'es') {
          setLanguageState(saved);
        } else {
          setLanguageState('en');
          await setSetting(LANGUAGE_SETTING_KEY, 'en');
        }
      } catch {
        setLanguageState('en');
      }
      setIsReady(true);
    }
    init();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await setSetting(LANGUAGE_SETTING_KEY, lang);
  }, []);

  function t(key: string, params?: Record<string, string | number>): string {
    let text = translations[language][key];
    if (text === undefined) return key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }

  if (!isReady) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

function tUnit(t: I18nContextValue['t'], unit: string): string {
  const key = `unit.${unit}`;
  const label = t(key);
  return label !== key ? label : unit;
}

export { I18nProvider, useI18n, tUnit };
