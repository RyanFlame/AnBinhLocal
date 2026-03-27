// Load all JSON files in the locales directories
const viFiles: Record<string, any> = import.meta.glob('./locales/vi/*.json', { eager: true });
const enFiles: Record<string, any> = import.meta.glob('./locales/en/*.json', { eager: true });

function buildDict(files: Record<string, any>) {
  const dict: Record<string, any> = {};
  for (const path in files) {
    // Merge the content of each file into the dictionary
    const content = files[path].default || files[path];
    Object.assign(dict, content);
  }
  return dict;
}

const translations = {
  vi: buildDict(viFiles),
  en: buildDict(enFiles)
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
