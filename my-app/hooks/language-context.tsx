'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Import your translation JSON files
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

// Define the type for translation objects
type Translations = {
  [key: string]: any;
};

// Define the context properties
interface LanguageContextProps {
  language: 'en' | 'ar';
  t: Translations;
  setLanguage: (lang: 'en' | 'ar') => void;
}

// Store the translations for each language
const translations: { [lang: string]: Translations } = {
  en,
  ar,
};

// Create the context
const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Props for the LanguageProvider
interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: 'en' | 'ar';
}

/**
 * LanguageProvider component that provides the current language,
 * translation object, and a function to change the language.
 */
export const LanguageProvider = ({
  children,
  initialLanguage = 'en'
}: LanguageProviderProps) => {
  // Initialize the language state based on the initialLanguage prop.
  const [language, setLanguageState] = useState<'en' | 'ar'>(initialLanguage);

  // Sync document direction and localStorage when language changes.
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  /**
   * Updates the active language, localStorage, and cookie.
   * @param lang - The new language code ('en' or 'ar').
   */
  const updateLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.cookie = `lang=${lang}; path=/`;
  };

  const contextValue: LanguageContextProps = {
    language,
    t: translations[language],
    setLanguage: updateLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Custom hook to consume the LanguageContext.
 * @throws Will throw an error if used outside of a LanguageProvider.
 */
export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
