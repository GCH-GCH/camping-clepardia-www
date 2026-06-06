export type SiteNoticeType = 'event' | 'offer' | 'alert' | 'info';
export type SiteNoticePriority = 'low' | 'medium' | 'high';
export type SiteNoticeLanguage = 'pl' | 'en' | 'de' | 'it';

export interface SiteNoticeTranslation {
  title: string;
  description: string;
  ctaLabel?: string;
  badge?: string;
}

export interface SiteNotice {
  id: string;
  type: SiteNoticeType;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  showOnHomepage: boolean;
  showAsPopup: boolean;
  priority: SiteNoticePriority;
  ctaLabel?: string;
  ctaHref?: string;
  language?: SiteNoticeLanguage;
  translations?: Partial<Record<SiteNoticeLanguage, SiteNoticeTranslation>>;
  icon?: string;
  badge?: string;
  dismissible?: boolean;
}

// Future CC SYSTEM/admin panel can control these fields directly:
// isActive, showOnHomepage, showAsPopup, priority, startDate, endDate and copy/translations.
export const siteNotices: SiteNotice[] = [
  {
    id: 'dragon-parade-2026',
    type: 'event',
    title: 'Parada Smoków w Krakowie',
    description:
      '6-7 czerwca w Krakowie odbywa się Parada Smoków. Najwygodniej zostawić auto na campingu i dojechać tramwajem w stronę centrum.',
    startDate: '2026-06-06',
    endDate: '2026-06-07',
    isActive: true,
    showOnHomepage: true,
    showAsPopup: true,
    priority: 'medium',
    ctaLabel: 'Sprawdź dojazd tramwajem',
    ctaHref: '/dojazd',
    language: 'pl',
    icon: 'Flame',
    badge: '6-7 czerwca',
    dismissible: true,
    translations: {
      pl: {
        title: 'Parada Smoków w Krakowie',
        description:
          '6-7 czerwca w Krakowie odbywa się Parada Smoków. Najwygodniej zostawić auto na campingu i dojechać tramwajem w stronę centrum.',
        ctaLabel: 'Sprawdź dojazd tramwajem',
        badge: '6-7 czerwca',
      },
      en: {
        title: 'Dragon Parade in Krakow',
        description:
          'On 6-7 June Krakow hosts the Dragon Parade. Leave the car at the campsite and take the tram towards the centre.',
        ctaLabel: 'Check tram directions',
        badge: '6-7 June',
      },
      de: {
        title: 'Drachenparade in Krakau',
        description:
          'Am 6.-7. Juni findet in Krakau die Drachenparade statt. Am bequemsten bleibt das Auto auf dem Campingplatz und Sie fahren mit der Strassenbahn ins Zentrum.',
        ctaLabel: 'Anfahrt mit der Strassenbahn',
        badge: '6.-7. Juni',
      },
      it: {
        title: 'Parata dei Draghi a Cracovia',
        description:
          'Il 6-7 giugno Cracovia ospita la Parata dei Draghi. Lascia l auto al camping e prendi il tram verso il centro.',
        ctaLabel: 'Vedi il percorso in tram',
        badge: '6-7 giugno',
      },
    },
  },
];

const priorityRank: Record<SiteNoticePriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const endOfDay = (date: string) => new Date(`${date}T23:59:59`);
const startOfDay = (date: string) => new Date(`${date}T00:00:00`);

export const isNoticeActive = (notice: SiteNotice, now = new Date()) => {
  if (!notice.isActive) return false;
  return now >= startOfDay(notice.startDate) && now <= endOfDay(notice.endDate);
};

export const getNoticeCopy = (notice: SiteNotice, language: string = 'pl') => {
  const normalizedLanguage = (['pl', 'en', 'de', 'it'].includes(language) ? language : 'en') as SiteNoticeLanguage;
  const translation = notice.translations?.[normalizedLanguage] ?? notice.translations?.en ?? notice.translations?.pl;

  return {
    title: translation?.title ?? notice.title,
    description: translation?.description ?? notice.description,
    ctaLabel: translation?.ctaLabel ?? notice.ctaLabel,
    badge: translation?.badge ?? notice.badge,
  };
};

export const getActiveSiteNotices = (now = new Date()) =>
  siteNotices
    .filter((notice) => isNoticeActive(notice, now))
    .sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);

export const getHomepageSiteNotices = (now = new Date()) =>
  getActiveSiteNotices(now).filter((notice) => notice.showOnHomepage);

export const getPopupSiteNotice = (now = new Date()) =>
  getActiveSiteNotices(now).find((notice) => notice.showAsPopup);
