import { getActiveSiteNotices, getNoticeCopy } from './siteNotices';

export interface SearchIndexEntry {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
  badge?: string;
  icon?: string;
  keywords: string[];
}

export const baseSearchIndex: SearchIndexEntry[] = [
  {
    id: 'booking',
    title: 'Rezerwacja pobytu',
    description: 'Wybierz Camping, Domki albo Razem i wyślij zapytanie do recepcji.',
    href: '/rezerwacja',
    category: 'Rezerwacja',
    badge: 'Zarezerwuj',
    icon: 'CalendarCheck',
    keywords: ['rezerwacja', 'zarezerwuj', 'dostępność', 'formularz', 'camping', 'domki', 'razem'],
  },
  {
    id: 'electricity',
    title: 'Prąd 10A',
    description: 'Prąd campingowy kosztuje 30 PLN / noc. Nie służy do ładowania aut EV.',
    href: '/cennik',
    category: 'Cennik',
    badge: '30 PLN',
    icon: 'PlugZap',
    keywords: ['prąd', 'prad', '10a', 'elektryczność', 'ev', 'ładowanie', 'cennik'],
  },
  {
    id: 'dog',
    title: 'Pies na campingu',
    description: 'Pies kosztuje 0 PLN. Prosimy o opiekę i sprzątanie po pupilu.',
    href: '/cennik',
    category: 'Camping',
    badge: '0 PLN',
    icon: 'PawPrint',
    keywords: ['pies', 'psy', 'zwierzę', 'zwierzęta', '0 pln', 'bezpłatnie'],
  },
  {
    id: 'tram',
    title: 'Tramwaj do centrum',
    description: 'Przystanek ok. 40 m od bramy, tramwaj 18 do Starego Kleparza ok. 14 minut.',
    href: '/dojazd',
    category: 'Dojazd',
    badge: '14 min',
    icon: 'TramFront',
    keywords: ['tramwaj', 'centrum', 'górnickiego', 'stary kleparz', 'jakdojade', '14 minut'],
  },
  {
    id: 'google-maps',
    title: 'Google Maps zalecane',
    description: 'Dojazd zmienił się w 2022 roku, dlatego starsze nawigacje mogą prowadzić źle.',
    href: '/dojazd',
    category: 'Alert',
    badge: '2022',
    icon: 'MapPin',
    keywords: ['google maps', 'mapy', 'dojazd', 'nawigacja', '2022'],
  },
  {
    id: 'quiet',
    title: 'Cisza nocna',
    description: 'Camping Clepardia nie jest miejscem imprezowym. Cisza nocna obowiązuje 22:00-07:00.',
    href: '/faq',
    category: 'Zasady',
    badge: '22:00-07:00',
    icon: 'Moon',
    keywords: ['cisza', 'nocna', '22', '07', 'impreza', 'regulamin'],
  },
  {
    id: 'bungalow-deposit',
    title: 'Domki i zaliczka',
    description: 'Domki są 2-, 3- i 4-osobowe. Przy domkach może być wymagana zaliczka po potwierdzeniu dostępności.',
    href: '/domki',
    category: 'Domki',
    badge: '2/3/4-os.',
    icon: 'House',
    keywords: ['domek', 'domki', 'zaliczka', '2-os', '3-os', '4-os', 'nocleg'],
  },
  {
    id: 'documents',
    title: 'Dokument i rejestracja pojazdu',
    description: 'Do meldunku przygotuj dokument tożsamości oraz numer rejestracyjny pojazdu lub przyczepy.',
    href: '/dojazd',
    category: 'Recepcja',
    badge: 'Przyjazd',
    icon: 'BadgeCheck',
    keywords: ['dokument', 'dowód', 'rejestracja', 'rejestracyjny', 'pojazdu', 'przyczepy', 'meldunek'],
  },
  {
    id: 'wieliczka',
    title: 'Wieliczka',
    description: 'Klasyczna wycieczka półdniowa z Krakowa, możliwa także jako zorganizowana wycieczka.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Pół dnia',
    icon: 'Landmark',
    keywords: ['wieliczka', 'kopalnia soli', 'wycieczka', 'seekrakow'],
  },
  {
    id: 'auschwitz',
    title: 'Auschwitz-Birkenau',
    description: 'Poważna wycieczka całodniowa, którą warto zaplanować wcześniej.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Cały dzień',
    icon: 'Shield',
    keywords: ['auschwitz', 'birkenau', 'oświęcim', 'wycieczka', 'seekrakow'],
  },
  {
    id: 'season',
    title: 'Sezon od 1 kwietnia',
    description: 'Camping Clepardia działa sezonowo od 1 kwietnia.',
    href: '/aktualnosci',
    category: 'Aktualności',
    badge: 'Sezon',
    icon: 'CalendarCheck',
    keywords: ['sezon', '1 kwietnia', 'otwarty', 'aktualności'],
  },
  {
    id: 'dragon-parade',
    title: 'Parada Smoków',
    description: 'Wydarzenie w Krakowie 6-7 czerwca, z campingu najwygodniej tramwajem.',
    href: '/aktualnosci',
    category: 'Wydarzenia',
    badge: 'Kraków',
    icon: 'Flame',
    keywords: ['parada smoków', 'smoki', 'wydarzenia', 'kraków'],
  },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const getSearchIndex = (language = 'pl'): SearchIndexEntry[] => {
  const noticeEntries = getActiveSiteNotices().map((notice) => {
    const copy = getNoticeCopy(notice, language);
    return {
      id: `notice-${notice.id}`,
      title: copy.title,
      description: copy.shortDescription ?? copy.description,
      href: notice.ctaHref ?? '/aktualnosci',
      category: 'Aktualności',
      badge: copy.badge,
      icon: notice.icon ?? 'Info',
      keywords: [notice.title, notice.category, ...(notice.tags ?? [])],
    };
  });

  return [...baseSearchIndex, ...noticeEntries];
};

export const searchIndexEntries = getSearchIndex('pl');

export const searchEntries = (query: string, entries: SearchIndexEntry[] = searchIndexEntries, limit = 6) => {
  const normalizedQuery = normalize(query.trim());
  if (!normalizedQuery) return [];

  return entries
    .map((entry) => {
      const haystack = normalize([entry.title, entry.description, entry.category, entry.badge, ...entry.keywords].filter(Boolean).join(' '));
      const score =
        haystack.includes(normalizedQuery) ? 4 :
        entry.keywords.some((keyword) => normalize(keyword).includes(normalizedQuery)) ? 3 :
        normalizedQuery.split(/\s+/).some((part) => part.length > 2 && haystack.includes(part)) ? 2 :
        0;

      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
};
