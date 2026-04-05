import React, { createContext, useContext, useState, useEffect } from 'react';
import ptBrTranslations from '@/locales/pt-br.json';
import enTranslations from '@/locales/en.json';

type Language = 'pt-br' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, any>> = {
  'pt-br': ptBrTranslations || {},
  'en': enTranslations || {},
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('language');
      if (saved === 'pt-br' || saved === 'en') {
        setLanguageState(saved);
      } else {
        const browserLang = navigator.language;
        if (browserLang.startsWith('pt')) {
          setLanguageState('pt-br');
        }
      }
    } catch {
      // Fallback para ambientes sem localStorage
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [language, isInitialized]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }

    return typeof value === 'string' ? value : defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
