export const locales = ["vi", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

export function getLocaleFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "vi";
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname || "/";
}

export function localizePath(pathname: string, locale: Locale): string {
  const normalizedPath = stripLocalePrefix(pathname || "/");
  if (locale === "en") {
    return normalizedPath === "/" ? "/en" : `/en${normalizedPath}`;
  }
  return normalizedPath;
}

export function getContentLocale(locale: Locale): "vn" | "en" {
  return locale === "en" ? "en" : "vn";
}
