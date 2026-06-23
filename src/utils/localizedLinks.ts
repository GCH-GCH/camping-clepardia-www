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

export const bookingSlugByLanguage: Partial<Record<LanguageCode, string>> = {
  pl: 'rezerwacja',
  en: 'booking',
  de: 'buchung',
  it: 'prenotazione',
  fr: 'booking',
  es: 'booking',
  nl: 'booking',
  cs: 'booking',
  sk: 'booking',
  sv: 'booking',
};

const bookingSlugSet = new Set(Object.values(bookingSlugByLanguage));

export const plannerSlugByLanguage: Partial<Record<LanguageCode, string>> = {
  pl: 'planer-pobytu',
  en: 'stay-planner',
  de: 'aufenthaltsplaner',
  it: 'pianificatore-soggiorno',
  fr: 'planificateur-sejour',
  es: 'planificador-estancia',
  nl: 'verblijfsplanner',
  cs: 'planovac-pobytu',
  sk: 'planovac-pobytu',
  sv: 'vistelseplanerare',
};

const plannerSlugSet = new Set(Object.values(plannerSlugByLanguage));

export const isBookingSlug = (slug = '') => bookingSlugSet.has(normalizeSlug(slug));
export const isPlannerSlug = (slug = '') => plannerSlugSet.has(normalizeSlug(slug));

export const getBookingLocalizedPath = (languageCode?: string, stay?: string) => {
  const normalizedLanguage = isLanguageCode(languageCode) ? languageCode : defaultLanguage.code;
  const bookingLanguage = bookingSlugByLanguage[normalizedLanguage] ? normalizedLanguage : 'en';
  const slug = bookingSlugByLanguage[bookingLanguage] ?? 'booking';
  const path = bookingLanguage === defaultLanguage.code ? `/${slug}` : `/${bookingLanguage}/${slug}`;

  return stay ? `${path}?stay=${encodeURIComponent(stay)}` : path;
};

export const getPlannerLocalizedPath = (languageCode?: string) => {
  const normalizedLanguage = isLanguageCode(languageCode) ? languageCode : defaultLanguage.code;
  const plannerLanguage = plannerSlugByLanguage[normalizedLanguage] ? normalizedLanguage : 'en';
  const slug = plannerSlugByLanguage[plannerLanguage] ?? 'stay-planner';

  return plannerLanguage === defaultLanguage.code ? `/${slug}` : `/${plannerLanguage}/${slug}`;
};

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
  const isBookingPage = isBookingSlug(slug);
  const isPlannerPage = isPlannerSlug(slug);

  return languages.map((language) => ({
    ...language,
    href: isBookingPage
      ? getBookingLocalizedPath(language.code)
      : isPlannerPage
      ? getPlannerLocalizedPath(language.code)
      : getLocalizedPath(language.code, slug),
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
  const isBookingPage = isBookingSlug(context.slug);
  const isPlannerPage = isPlannerSlug(context.slug);
  const seoPathForLanguage = (languageCode: LanguageCode) =>
    isBookingPage
      ? getBookingLocalizedPath(languageCode)
      : isPlannerPage
      ? getPlannerLocalizedPath(languageCode)
      : languageCode === defaultLanguage.code
      ? getLocalizedPath(undefined, context.slug)
      : getLocalizedPath(languageCode, context.slug);
  const currentPath = isBookingPage
    ? getBookingLocalizedPath(context.languageCode)
    : isPlannerPage
    ? getPlannerLocalizedPath(context.languageCode)
    : seoPathForLanguage(context.languageCode);

  return {
    lang: context.languageCode,
    ogLocale: ogLocaleByLanguage[context.languageCode],
    canonicalHref: withOrigin(canonicalOverride ?? currentPath, origin),
    alternateLinks: [
      ...languages.map((language) => ({
        hrefLang: language.code,
        href: withOrigin(seoPathForLanguage(language.code), origin),
      })),
      {
        hrefLang: 'x-default',
        href: withOrigin(
          isBookingPage
            ? getBookingLocalizedPath(defaultLanguage.code)
            : isPlannerPage
            ? getPlannerLocalizedPath(defaultLanguage.code)
            : getLocalizedPath(undefined, context.slug),
          origin
        ),
      },
    ],
  };
};
