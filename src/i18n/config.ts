import { en } from './en';
import { pl } from './pl';
import { de } from './de';
import { it } from './it';
import { fallback } from './fallback';
import type { PageSlug } from '@/data/sitePages';

export const fullTranslationLanguages = ['pl', 'en', 'de', 'it'] as const;
export const fallbackTranslationLanguages = ['fr', 'es', 'nl', 'cs', 'sk', 'sv'] as const;

export type FullTranslationLanguage = typeof fullTranslationLanguages[number];

const dictionaries: Record<FullTranslationLanguage, typeof en> = {
  pl: pl as typeof en,
  en,
  de: de as typeof en,
  it: it as typeof en,
};

export const resolveContentLanguage = (languageCode?: string): FullTranslationLanguage =>
  fullTranslationLanguages.includes(languageCode as FullTranslationLanguage)
    ? (languageCode as FullTranslationLanguage)
    : 'en';

export const getTranslations = (languageCode?: string) =>
  dictionaries[resolveContentLanguage(languageCode)] ?? fallback;

export const getHomeSeo = (languageCode?: string) => getTranslations(languageCode).seo.home;

export const getSitePages = (languageCode?: string) => getTranslations(languageCode).pages;

export const getSitePage = (slug: string, languageCode?: string) =>
  getSitePages(languageCode)[slug as PageSlug];
