export type SiteNoticeType = 'event' | 'offer' | 'alert' | 'info';
export type SiteNoticePriority = 'low' | 'medium' | 'high';
export type SiteNoticeLanguage = 'pl' | 'en' | 'de' | 'it';
export type SiteNoticeCategory =
  | 'sezon'
  | 'camping'
  | 'domki'
  | 'dojazd'
  | 'atrakcje'
  | 'wydarzenia'
  | 'koncerty'
  | 'rodzina'
  | 'alerty'
  | 'oferty'
  | 'pogoda'
  | 'recepcja'
  | 'info';

export interface SiteNoticeTranslation {
  title: string;
  shortDescription?: string;
  description: string;
  ctaLabel?: string;
  badge?: string;
  imageAlt?: string;
}

export interface SiteNotice {
  id: string;
  type: SiteNoticeType;
  category: SiteNoticeCategory;
  title: string;
  shortDescription: string;
  description: string;
  image?: string;
  imageAlt?: string;
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
  tags?: string[];
  dismissible?: boolean;
  popupVariant?: 'soft' | 'event' | 'alert' | 'offer';
}

export const siteNoticeCategories: Array<{ id: 'all' | SiteNoticeCategory; label: string; icon: string }> = [
  { id: 'all', label: 'Wszystkie', icon: 'Images' },
  { id: 'sezon', label: 'Sezon', icon: 'CalendarCheck' },
  { id: 'camping', label: 'Camping', icon: 'Tent' },
  { id: 'domki', label: 'Domki', icon: 'House' },
  { id: 'dojazd', label: 'Dojazd', icon: 'TramFront' },
  { id: 'atrakcje', label: 'Atrakcje', icon: 'Landmark' },
  { id: 'wydarzenia', label: 'Wydarzenia', icon: 'Sparkles' },
  { id: 'koncerty', label: 'Koncerty', icon: 'Music' },
  { id: 'rodzina', label: 'Rodzina', icon: 'UsersRound' },
  { id: 'alerty', label: 'Alerty', icon: 'TriangleAlert' },
  { id: 'oferty', label: 'Oferty', icon: 'BadgePercent' },
  { id: 'pogoda', label: 'Pogoda', icon: 'CloudSun' },
  { id: 'recepcja', label: 'Recepcja', icon: 'BadgeCheck' },
  { id: 'info', label: 'Info', icon: 'Info' },
];

export const siteNotices: SiteNotice[] = [
  {
    id: 'season-open-2026',
    type: 'info',
    category: 'sezon',
    title: 'Sezon Camping Clepardia otwarty od 1 kwietnia',
    shortDescription: 'Camping Clepardia zaprasza od 1 kwietnia.',
    description:
      'Zapraszamy od 1 kwietnia. Sprawdź cennik, dojazd i wyślij zapytanie o pobyt campingowy, domek albo wariant łączony Camping + Domki.',
    image: '/images/sections/camping-green-canopy.webp',
    imageAlt: 'Zielona przestrzeń i drzewa na Camping Clepardia',
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
    tags: ['sezon', 'rezerwacja', 'camping', 'domki'],
    dismissible: true,
    popupVariant: 'soft',
    translations: {
      en: {
        title: 'Camping Clepardia season opens on 1 April',
        shortDescription: 'Camping Clepardia welcomes guests from 1 April.',
        description:
          'We welcome guests from 1 April. Check prices, directions and send an enquiry for camping, bungalows or a combined stay.',
        ctaLabel: 'Book your stay',
        badge: 'Season open',
        imageAlt: 'Green trees at Camping Clepardia',
      },
    },
  },
  {
    id: 'dragon-parade-2026',
    type: 'event',
    category: 'wydarzenia',
    title: 'Parada Smoków w Krakowie',
    shortDescription: '6-7 czerwca w Krakowie odbywa się Parada Smoków.',
    description:
      '6-7 czerwca w Krakowie odbywa się Parada Smoków. Z campingu do centrum dojedziesz tramwajem w ok. 14 minut, a dalej przejdziesz pieszo w stronę Starego Miasta.',
    image: '/images/attractions/old-town-krakow.webp',
    imageAlt: 'Stare Miasto w Krakowie jako tło wydarzeń',
    startDate: '2026-06-01',
    endDate: '2026-06-16',
    isActive: true,
    showOnHomepage: true,
    showAsPopup: false,
    priority: 'high',
    ctaLabel: 'Sprawdź dojazd',
    ctaHref: '/dojazd',
    language: 'pl',
    icon: 'Flame',
    badge: '6-7 czerwca',
    tags: ['Kraków', 'event', 'tramwaj', 'centrum'],
    dismissible: true,
    popupVariant: 'event',
    translations: {
      en: {
        title: 'Dragon Parade in Krakow',
        shortDescription: 'On 6-7 June Krakow hosts the Dragon Parade.',
        description:
          'On 6-7 June Krakow hosts the Dragon Parade. From the campsite, the easiest route is by tram: usually about 14 minutes to Stary Kleparz and a short walk.',
        ctaLabel: 'Check directions',
        badge: '6-7 June',
      },
    },
  },
  {
    id: 'tram-to-centre',
    type: 'info',
    category: 'dojazd',
    title: 'Do centrum tramwajem w ok. 14 minut',
    shortDescription: 'Przystanek Górnickiego jest ok. 40 m od bramy.',
    description:
      'Przystanek Górnickiego jest ok. 40 m od campingu. Tramwaj 18 jedzie do Starego Kleparza zwykle ok. 9 przystanków i ok. 14 minut.',
    image: '/images/sections/tram-stop-near-camping.webp',
    imageAlt: 'Przystanek tramwajowy blisko Camping Clepardia',
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
    tags: ['tramwaj', 'Górnickiego', 'Stary Kleparz', 'centrum'],
  },
  {
    id: 'google-maps-2022',
    type: 'alert',
    category: 'alerty',
    title: 'Użyj Google Maps przy dojeździe',
    shortDescription: 'Dojazd do campingu zmienił się w 2022 roku.',
    description:
      'Dojazd do campingu zmienił się w 2022 roku. Starsze nawigacje mogą prowadzić źle, dlatego zalecamy Google Maps.',
    image: '/images/sections/tram-stop-near-camping.webp',
    imageAlt: 'Okolica dojazdu do Camping Clepardia',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    showOnHomepage: true,
    showAsPopup: false,
    priority: 'medium',
    ctaLabel: 'Zobacz dojazd',
    ctaHref: '/dojazd',
    language: 'pl',
    icon: 'MapPin',
    badge: 'Google Maps 2022',
    tags: ['Google Maps', 'dojazd', '2022', 'nawigacja'],
  },
  {
    id: 'summer-camping-first-come',
    type: 'info',
    category: 'camping',
    title: 'Lipiec i sierpień — miejsca campingowe według kolejności przyjazdu',
    shortDescription: 'W wysokim sezonie najlepiej przyjechać krótko po 12:00.',
    description:
      'W wysokim sezonie najlepiej przyjechać krótko po 12:00. Domki można rezerwować, a miejsca campingowe działają zwykle według kolejności przyjazdu.',
    image: '/images/sections/camping-pitches.webp',
    imageAlt: 'Miejsca campingowe na Camping Clepardia w Krakowie',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    isActive: true,
    showOnHomepage: true,
    showAsPopup: false,
    priority: 'medium',
    ctaLabel: 'Sprawdź zasady',
    ctaHref: '/rezerwacja',
    language: 'pl',
    icon: 'Info',
    badge: 'Wakacje',
    tags: ['lipiec', 'sierpień', 'camping', '12:00'],
  },
  {
    id: 'arrival-registration-documents',
    type: 'info',
    category: 'recepcja',
    title: 'Co przygotować do meldunku?',
    shortDescription: 'Dokument tożsamości i numer rejestracyjny pojazdu przyspieszają rejestrację.',
    description:
      'Przy rejestracji poprosimy o jeden dokument tożsamości oraz numer rejestracyjny pojazdu, jeśli przyjeżdżasz autem, kamperem, vanem lub przyczepą. Przy przyczepie wpisz numer rejestracyjny przyczepy.',
    image: '/images/sections/camping-open-space.webp',
    imageAlt: 'Zielona przestrzeń campingowa w Krakowie',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    showOnHomepage: false,
    showAsPopup: false,
    priority: 'medium',
    ctaLabel: 'Przed przyjazdem',
    ctaHref: '/dojazd',
    language: 'pl',
    icon: 'BadgeCheck',
    badge: 'Recepcja',
    tags: ['dokument', 'rejestracja pojazdu', 'meldunek', 'recepcja'],
    dismissible: true,
  },
  {
    id: 'dog-free-camping',
    type: 'info',
    category: 'camping',
    title: 'Pies na campingu bez opłaty',
    shortDescription: 'Pies kosztuje 0 PLN.',
    description:
      'Pies jest bezpłatny. Prosimy tylko o opiekę, smycz i sprzątanie po pupilu, żeby pobyt był komfortowy dla wszystkich gości.',
    image: '/images/sections/camping-green-canopy.webp',
    imageAlt: 'Zielona przestrzeń i drzewa na Camping Clepardia',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    showOnHomepage: true,
    showAsPopup: false,
    priority: 'medium',
    ctaLabel: 'Sprawdź cennik',
    ctaHref: '/cennik',
    language: 'pl',
    icon: 'PawPrint',
    badge: 'Pies 0 PLN',
    tags: ['pies', '0 PLN', 'camping'],
  },
  {
    id: 'three-night-plan',
    type: 'info',
    category: 'atrakcje',
    title: 'Zostań 3 noce i zobacz więcej',
    shortDescription: 'Kraków + jedna większa wycieczka to dobry rytm pobytu.',
    description:
      'Przy 3 nocach możesz spokojnie połączyć Kraków z jedną większą wycieczką, np. Wieliczką albo Auschwitz-Birkenau. Planer podpowie, co zmieści się bez gonitwy.',
    image: '/images/attractions/wieliczka-salt-mine.webp',
    imageAlt: 'Wieliczka jako pomysł na wycieczkę z Krakowa',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    showOnHomepage: true,
    showAsPopup: false,
    priority: 'medium',
    ctaLabel: 'Otwórz planer',
    ctaHref: '/planer-pobytu',
    language: 'pl',
    icon: 'Route',
    badge: 'Plan 3 dni',
    tags: ['planer', 'Wieliczka', 'Auschwitz', '3 noce'],
  },
  {
    id: 'doja-cat-tauron-arena-unverified',
    type: 'event',
    category: 'koncerty',
    title: 'Doja Cat / Tauron Arena — wpis roboczy',
    shortDescription: 'Nieaktywny wpis roboczy do weryfikacji.',
    description:
      'Nieaktywny przykład aktualności. Wydarzenia koncertowe wymagają weryfikacji daty, miejsca i źródła przed publikacją jako popup.',
    image: '/images/attractions/old-town-krakow.webp',
    imageAlt: 'Kraków jako tło wydarzeń koncertowych',
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
    tags: ['koncert', 'do weryfikacji'],
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
  const translation = normalizedLanguage === 'pl'
    ? notice.translations?.pl
    : (notice.translations?.[normalizedLanguage] ?? notice.translations?.en);

  return {
    title: translation?.title ?? notice.title,
    shortDescription: translation?.shortDescription ?? notice.shortDescription,
    description: translation?.description ?? notice.description,
    ctaLabel: translation?.ctaLabel ?? notice.ctaLabel,
    badge: translation?.badge ?? notice.badge,
    imageAlt: translation?.imageAlt ?? notice.imageAlt,
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
