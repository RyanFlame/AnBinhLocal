import vi from './locales/vi.json';
import en from './locales/en.json';

const translations = {
  vi,
  en
} as const;

export function useTranslations(lang: keyof typeof translations | string) {
  return function t(key: string) {
    const locale = (lang === 'vn' ? 'vi' : lang) as keyof typeof translations;
    const dict = translations[locale] || translations.vi;
    return (dict as any)[key] || key;
  };
}
