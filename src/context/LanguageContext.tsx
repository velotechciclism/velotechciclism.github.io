import React, { createContext, useContext, useEffect } from 'react';
import ptBrTranslations from '@/locales/pt-br.json';

type Language = 'pt-br';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type TranslationValue = string | TranslationTree;

interface TranslationTree {
  [key: string]: TranslationValue;
}

const language: Language = 'pt-br';
const translations: Record<Language, TranslationTree> = {
  'pt-br': ptBrTranslations || {},
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    try {
      localStorage.setItem('language', language);
      document.documentElement.lang = 'pt-BR';
    } catch {
      // Fallback para ambientes sem localStorage.
    }
  }, []);

  const setLanguage = () => undefined;

  const t = (key: string, defaultValue?: string): string => {
    const keys = key.split('.');
    let value: TranslationValue | undefined = translations[language];

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
    throw new Error('useLanguage deve ser usado dentro de LanguageProvider');
  }
  return context;
};
