import { getRequestConfig } from 'next-intl/server';

const locales = ['fr', 'en', 'nl'];

export default getRequestConfig(async (params) => {
  // 1. On "await" (attend) la promesse pour obtenir la vraie valeur de la langue !
  let currentLocale = (await params.locale) || (await (params as any).requestLocale);
  
  console.log("🔍 LANGUE DÉTECTÉE PAR NEXT-INTL :", currentLocale);

  if (!currentLocale || !locales.includes(currentLocale)) {
    console.log(`⚠️ Langue invalide, on force le Français !`);
    currentLocale = 'fr';
  }

  let messages;

  try {
    switch (currentLocale) {
      case 'en':
        messages = (await import('./messages/en.json')).default;
        break;
      case 'nl':
        messages = (await import('./messages/nl.json')).default;
        break;
      case 'fr':
      default:
        messages = (await import('./messages/fr.json')).default;
        break;
    }
  } catch (error) {
    messages = {}; 
  }

  return {
    locale: currentLocale,
    messages
  };
});