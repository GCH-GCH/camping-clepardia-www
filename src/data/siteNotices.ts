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
    id: 'season-open-2026',
    type: 'info',
    title: 'Sezon Camping Clepardia otwarty od 1 kwietnia',
    description:
      'Camping Clepardia działa w sezonie od 1 kwietnia. Możesz zaplanować pobyt campingowy, domek albo zapytanie łączone Camping + Domki.',
    startDate: '2026-04-01',
    endDate: '2026-12-31',
    isActive: true,
    showOnHomepage: true,
    showAsPopup: false,
    priority: 'high',
    ctaLabel: 'Zarezerwuj pobyt',
    ctaHref: '/rezerwacja',
    language: 'pl',
    icon: 'CalendarCheck',
    badge: 'Sezon otwarty',
    dismissible: true,
    translations: {
      pl: {
        title: 'Sezon Camping Clepardia otwarty od 1 kwietnia',
        description:
          'Camping Clepardia działa w sezonie od 1 kwietnia. Możesz zaplanować pobyt campingowy, domek albo zapytanie łączone Camping + Domki.',
        ctaLabel: 'Zarezerwuj pobyt',
        badge: 'Sezon otwarty',
      },
      en: {
        title: 'Camping Clepardia season opens on 1 April',
        description:
          'Camping Clepardia operates from 1 April. Plan a camping stay, bungalow stay or a combined Camping + Bungalows enquiry.',
        ctaLabel: 'Book your stay',
        badge: 'Season open',
      },
      de: {
        title: 'Camping Clepardia Saison ab 1. April geöffnet',
        description:
          'Camping Clepardia ist ab dem 1. April geöffnet. Planen Sie Camping, Bungalow oder eine kombinierte Anfrage.',
        ctaLabel: 'Aufenthalt buchen',
        badge: 'Saison geöffnet',
      },
      it: {
        title: 'La stagione Camping Clepardia apre il 1 aprile',
        description:
          'Camping Clepardia è aperto dal 1 aprile. Puoi pianificare camping, bungalow o una richiesta combinata.',
        ctaLabel: 'Prenota soggiorno',
        badge: 'Stagione aperta',
      },
    },
  },
  {
    id: 'dragon-parade-2026',
    type: 'event',
    title: 'Parada Smoków w Krakowie',
    description:
      '6-7 czerwca w Krakowie odbywa się Parada Smoków. Z campingu najwygodniej dojechać tramwajem do centrum: zwykle ok. 14 minut do Starego Kleparza i krótki spacer dalej.',
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
          '6-7 czerwca w Krakowie odbywa się Parada Smoków. Z campingu najwygodniej dojechać tramwajem do centrum: zwykle ok. 14 minut do Starego Kleparza i krótki spacer dalej.',
        ctaLabel: 'Sprawdź dojazd tramwajem',
        badge: '6-7 czerwca',
      },
      en: {
        title: 'Dragon Parade in Krakow',
        description:
          'On 6-7 June Krakow hosts the Dragon Parade. From the campsite, the easiest route is by tram: usually about 14 minutes to Stary Kleparz and a short walk.',
        ctaLabel: 'Check tram directions',
        badge: '6-7 June',
      },
      de: {
        title: 'Drachenparade in Krakau',
        description:
          'Am 6.-7. Juni findet in Krakau die Drachenparade statt. Vom Campingplatz fahren Sie am bequemsten mit der Straßenbahn ins Zentrum.',
        ctaLabel: 'Anfahrt mit der Straßenbahn',
        badge: '6.-7. Juni',
      },
      it: {
        title: 'Parata dei Draghi a Cracovia',
        description:
          'Il 6-7 giugno Cracovia ospita la Parata dei Draghi. Dal camping è più comodo arrivare in tram verso il centro.',
        ctaLabel: 'Vedi il percorso in tram',
        badge: '6-7 giugno',
      },
    },
  },
  {
    id: 'tram-to-centre',
    type: 'info',
    title: 'Tramwajem do centrum w około 14 minut',
    description:
      'Przystanek Górnickiego jest ok. 40 m od bramy. Tramwaj 18 jedzie do Starego Kleparza zwykle ok. 9 przystanków i ok. 14 minut.',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    showOnHomepage: true,
    showAsPopup: false,
    priority: 'medium',
    ctaLabel: 'Zobacz dojazd',
    ctaHref: '/dojazd',
    language: 'pl',
    icon: 'TramFront',
    badge: 'Dojazd',
    translations: {
      pl: {
        title: 'Tramwajem do centrum w około 14 minut',
        description:
          'Przystanek Górnickiego jest ok. 40 m od bramy. Tramwaj 18 jedzie do Starego Kleparza zwykle ok. 9 przystanków i ok. 14 minut.',
        ctaLabel: 'Zobacz dojazd',
        badge: 'Dojazd',
      },
      en: {
        title: 'By tram to the centre in about 14 minutes',
        description:
          'Górnickiego stop is about 40 m from the gate. Tram 18 usually takes about 9 stops and around 14 minutes to Stary Kleparz.',
        ctaLabel: 'See directions',
        badge: 'Transport',
      },
    },
  },
  {
    id: 'summer-camping-first-come',
    type: 'info',
    title: 'Lipiec i sierpień: miejsca campingowe według kolejności przyjazdu',
    description:
      'W lipcu i sierpniu rezerwujemy głównie domki. Miejsca campingowe zwykle działają według kolejności przyjazdu — najlepiej przyjechać krótko po 12:00.',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    isActive: true,
    showOnHomepage: true,
    showAsPopup: false,
    priority: 'medium',
    ctaLabel: 'Zapytaj o pobyt',
    ctaHref: '/rezerwacja',
    language: 'pl',
    icon: 'Info',
    badge: 'Wakacje',
    translations: {
      pl: {
        title: 'Lipiec i sierpień: miejsca campingowe według kolejności przyjazdu',
        description:
          'W lipcu i sierpniu rezerwujemy głównie domki. Miejsca campingowe zwykle działają według kolejności przyjazdu — najlepiej przyjechać krótko po 12:00.',
        ctaLabel: 'Zapytaj o pobyt',
        badge: 'Wakacje',
      },
      en: {
        title: 'July and August: camping pitches are usually first come, first served',
        description:
          'In July and August we mainly book bungalows. Camping pitches usually work on arrival order, so it is best to arrive shortly after 12:00.',
        ctaLabel: 'Send an enquiry',
        badge: 'Summer',
      },
    },
  },
  {
    id: 'google-maps-2022',
    type: 'alert',
    title: 'Do nawigacji użyj Google Maps',
    description:
      'Wjazd i trasa dojazdu do Camping Clepardia zmieniły się w 2022 roku. Starsze nawigacje mogą prowadzić nieprawidłowo.',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    showOnHomepage: true,
    showAsPopup: false,
    priority: 'medium',
    ctaLabel: 'Otwórz dojazd',
    ctaHref: '/dojazd',
    language: 'pl',
    icon: 'MapPin',
    badge: 'Google Maps',
    translations: {
      pl: {
        title: 'Do nawigacji użyj Google Maps',
        description:
          'Wjazd i trasa dojazdu do Camping Clepardia zmieniły się w 2022 roku. Starsze nawigacje mogą prowadzić nieprawidłowo.',
        ctaLabel: 'Otwórz dojazd',
        badge: 'Google Maps',
      },
      en: {
        title: 'Use Google Maps for navigation',
        description:
          'The entrance and access route to Camping Clepardia changed in 2022. Older navigation systems may lead incorrectly.',
        ctaLabel: 'Open directions',
        badge: 'Google Maps',
      },
    },
  },
  {
    id: 'doja-cat-tauron-arena-unverified',
    type: 'event',
    title: 'Doja Cat / Tauron Arena — wpis roboczy',
    description:
      'Przykład nieaktywnej aktualności. Wydarzenia koncertowe wymagają weryfikacji daty, miejsca i źródła przed publikacją jako popup.',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    isActive: false,
    showOnHomepage: false,
    showAsPopup: false,
    priority: 'low',
    ctaLabel: 'Nie publikować bez weryfikacji',
    ctaHref: '/atrakcje',
    language: 'pl',
    icon: 'Music',
    badge: 'Nieaktywne',
    translations: {
      pl: {
        title: 'Doja Cat / Tauron Arena — wpis roboczy',
        description:
          'Przykład nieaktywnej aktualności. Wydarzenia koncertowe wymagają weryfikacji daty, miejsca i źródła przed publikacją jako popup.',
        ctaLabel: 'Nie publikować bez weryfikacji',
        badge: 'Nieaktywne',
      },
      en: {
        title: 'Doja Cat / Tauron Arena — draft notice',
        description:
          'Inactive example notice. Concert events need verified date, venue and source before being published as a popup.',
        ctaLabel: 'Do not publish without verification',
        badge: 'Inactive',
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
