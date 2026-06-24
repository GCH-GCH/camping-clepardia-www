import { en } from './en';
import { pl } from './pl';
import { de } from './de';
import { it } from './it';
import { fallback } from './fallback';
import { corePublicTranslations } from './corePublicTranslations';
import type { PageSlug } from '@/data/sitePages';

export const fullTranslationLanguages = ['pl', 'en', 'de', 'it'] as const;
export const fallbackTranslationLanguages = [] as const;
export const corePublicTranslationLanguages = ['fr', 'es', 'nl', 'cs', 'sk', 'sv'] as const;

export type FullTranslationLanguage = typeof fullTranslationLanguages[number];
export type CorePublicTranslationLanguage = typeof corePublicTranslationLanguages[number];
export type PublicTranslationLanguage = FullTranslationLanguage | CorePublicTranslationLanguage;

const dictionaries: Record<PublicTranslationLanguage, typeof en> = {
  pl: pl as typeof en,
  en,
  de: de as typeof en,
  it: it as typeof en,
  fr: corePublicTranslations.fr as typeof en,
  es: corePublicTranslations.es as typeof en,
  nl: corePublicTranslations.nl as typeof en,
  cs: corePublicTranslations.cs as typeof en,
  sk: corePublicTranslations.sk as typeof en,
  sv: corePublicTranslations.sv as typeof en,
};

export const resolveContentLanguage = (languageCode?: string): FullTranslationLanguage =>
  fullTranslationLanguages.includes(languageCode as FullTranslationLanguage)
    ? (languageCode as FullTranslationLanguage)
    : 'en';

export const getTranslations = (languageCode?: string) =>
  dictionaries[languageCode as PublicTranslationLanguage] ?? dictionaries[resolveContentLanguage(languageCode)] ?? fallback;

export const getHomeSeo = (languageCode?: string) => getTranslations(languageCode).seo.home;

export const getSitePages = (languageCode?: string) => getTranslations(languageCode).pages;

export const getSitePage = (slug: string, languageCode?: string) =>
  getSitePages(languageCode)[slug as PageSlug];
