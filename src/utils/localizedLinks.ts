import { defaultLanguage, languages } from '@/data/languages';

export type LanguageCode = (typeof languages)[number]['code'];

export const languageCodes = languages.map((language) => language.code) as LanguageCode[];

export const ogLocaleByLanguage: Record<LanguageCode, string> = {
  pl: 'pl_PL',
  en: 'en_GB',
  de: 'de_DE',
  it: 'it_IT',
  fr: 'fr_FR',
  es: 'es_ES',
  nl: 'nl_NL',
  cs: 'cs_CZ',
  sk: 'sk_SK',
  sv: 'sv_SE',
};

export const isLanguageCode = (value?: string): value is LanguageCode =>
  Boolean(value && languageCodes.includes(value as LanguageCode));

export const normalizeSlug = (slug = '') => slug.replace(/^\/+|\/+$/g, '');

export const normalizePathname = (pathname: string) => {
  const [pathOnly] = pathname.split(/[?#]/);
  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;

  return withLeadingSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
};

export const getLocalizedPath = (languageCode?: string, slug = '') => {
  const normalizedSlug = normalizeSlug(slug);
  const normalizedLanguage = isLanguageCode(languageCode) ? languageCode : undefined;

  if (!normalizedLanguage) {
    return normalizedSlug ? `/${normalizedSlug}` : '/';
  }

  return normalizedSlug ? `/${normalizedLanguage}/${normalizedSlug}` : `/${normalizedLanguage}/`;
};

export const getPathContext = (pathname: string) => {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split('/').filter(Boolean);
  const explicitLanguage = isLanguageCode(segments[0]) ? segments[0] : undefined;
  const slug = explicitLanguage ? segments.slice(1).join('/') : segments.join('/');
  const languageCode = explicitLanguage ?? defaultLanguage.code;
  const currentLanguage = languages.find((language) => language.code === languageCode) ?? defaultLanguage;

  return {
    pathname: normalizedPathname,
    explicitLanguage,
    languageCode,
    currentLanguage,
    slug,
  };
};

export const getLanguageSwitchLinks = (pathname: string) => {
  const { languageCode, slug } = getPathContext(pathname);

  return languages.map((language) => ({
    ...language,
    href: getLocalizedPath(language.code, slug),
    active: language.code === languageCode,
  }));
};

export const withOrigin = (href: string, origin?: string) => {
  if (/^https?:\/\//i.test(href)) return href;

  const normalizedHref = href.startsWith('/') ? href : `/${href}`;
  const normalizedOrigin = origin?.replace(/\/+$/, '');

  return normalizedOrigin ? `${normalizedOrigin}${normalizedHref}` : normalizedHref;
};

export const getSeoLanguageMeta = (pathname: string, origin?: string, canonicalOverride?: string) => {
  const context = getPathContext(pathname);
  const currentPath = context.explicitLanguage
    ? getLocalizedPath(context.explicitLanguage, context.slug)
    : getLocalizedPath(undefined, context.slug);

  return {
    lang: context.languageCode,
    ogLocale: ogLocaleByLanguage[context.languageCode],
    canonicalHref: withOrigin(canonicalOverride ?? currentPath, origin),
    alternateLinks: [
      ...languages.map((language) => ({
        hrefLang: language.code,
        href: withOrigin(getLocalizedPath(language.code, context.slug), origin),
      })),
      {
        hrefLang: 'x-default',
        href: withOrigin(getLocalizedPath(undefined, context.slug), origin),
      },
    ],
  };
};
