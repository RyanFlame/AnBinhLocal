import vi from './locales/vi.json';
import en from './locales/en.json';

const translations = {
  vi,
  en
} as const;

export function useTranslations(lang: string) {
  return function t(key: string) {
    const locale = (lang === 'vn' ? 'vi' : lang) as 'vi' | 'en';
    const dict = (translations as any)[locale] || translations.vi;
    
    // Support nested keys like "hero.title" or "location.step1.sub"
    const value = key.split('.').reduce((obj, k) => obj?.[k], dict);
    return value || key;
  };
}
