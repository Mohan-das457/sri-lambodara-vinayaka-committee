import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, monthNames } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('slv_lang') || 'te'; // Telugu default for committee
  });

  useEffect(() => {
    localStorage.setItem('slv_lang', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  const getMonthName = (monthIndex) => {
    const idx = parseInt(monthIndex, 10) - 1;
    return monthNames[lang]?.[idx] || monthNames.en[idx] || `Month ${monthIndex}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, getMonthName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
