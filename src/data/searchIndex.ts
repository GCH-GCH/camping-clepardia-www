import { getActiveSiteNotices, getNoticeCopy } from './siteNotices';
import { currencyEstimateConfig, formatCurrencyEstimates, pricingConfig } from './pricing';
import { attractionImages } from './attractionsImageRegistry';

export interface SearchIndexEntry {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
  badge?: string;
  icon?: string;
  image?: string;
  keywords: string[];
}

const stayPrice = (id: string) => {
  const item = pricingConfig.stayTypes.find((entry) => entry.id === id);
  return item && 'price' in item ? item.price : 0;
};
const addonPrice = (id: string) => pricingConfig.addons.find((entry) => entry.id === id)?.price ?? 0;
const camperExample = pricingConfig.people.adults.price * 2 + stayPrice('camper') + addonPrice('electricity');

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
    id: 'tent-small-price',
    title: 'Namiot 1-2 os.',
    description: `Namiot 1-2 os. kosztuje ${stayPrice('tent-small')} PLN / noc. Przykład: 2 dorosłych + mały namiot = ${pricingConfig.people.adults.price * 2 + stayPrice('tent-small')} PLN / noc.`,
    href: '/cennik',
    category: 'Cennik',
    badge: `${stayPrice('tent-small')} PLN`,
    icon: 'Tent',
    keywords: ['namiot', 'namiot maly', 'mały namiot', 'tent', 'small tent', '1-2', 'cena namiotu'],
  },
  {
    id: 'tent-large-price',
    title: 'Namiot 3-4 os.',
    description: `Namiot 3-4 os. kosztuje ${stayPrice('tent-large')} PLN / noc. Przykład: 2 dorosłych + duży namiot = ${pricingConfig.people.adults.price * 2 + stayPrice('tent-large')} PLN / noc.`,
    href: '/cennik',
    category: 'Cennik',
    badge: `${stayPrice('tent-large')} PLN`,
    icon: 'Tent',
    keywords: ['namiot', 'duzy namiot', 'duży namiot', 'tent large', '3-4', 'cena namiotu'],
  },
  {
    id: 'cargo-trailer-price',
    title: 'Przyczepa bagażowa',
    description: `Przyczepa bagażowa kosztuje ${addonPrice('cargo-trailer')} PLN / noc. Przyczepa kempingowa pozostaje osobną pozycją w cenniku.`,
    href: '/cennik',
    category: 'Cennik',
    badge: `${addonPrice('cargo-trailer')} PLN`,
    icon: 'Container',
    keywords: ['przyczepa bagażowa', 'trailer', 'cargo trailer', 'bagaż', 'przyczepka'],
  },
  {
    id: 'currency-estimates',
    title: 'Waluty orientacyjne EUR / USD / GBP',
    description: `Ceny pokazujemy głównie w PLN. Przykład: ${camperExample} PLN to ${formatCurrencyEstimates(camperExample)}. ${currencyEstimateConfig.shortDisclaimer}`,
    href: '/cennik',
    category: 'Cennik',
    badge: 'Orientacyjnie',
    icon: 'Coins',
    keywords: ['eur', 'euro', 'usd', 'dolar', 'dollar', 'gbp', 'funt', 'pound', 'waluty', 'currency', 'exchange'],
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
    id: 'bungalow-towels',
    title: 'Ręczniki i rzeczy osobiste w domkach',
    description: 'Do domku zabierz własne ręczniki, kosmetyki i pozostałe rzeczy osobiste. Domki są 2-, 3- i 4-osobowe.',
    href: '/domki',
    category: 'Domki',
    badge: 'Co zabrać',
    icon: 'Briefcase',
    keywords: ['ręczniki', 'reczniki', 'kosmetyki', 'rzeczy osobiste', 'co zabrać', 'domek', 'domki'],
  },
  {
    id: 'late-arrival',
    title: 'Przyjazd po 21:00',
    description: 'Przy późnym przyjeździe skontaktuj się wcześniej z recepcją, aby ustalić dostęp do bramy i szczegóły zameldowania.',
    href: '/kontakt',
    category: 'Recepcja',
    badge: 'Ustal wcześniej',
    icon: 'Clock3',
    keywords: ['po 21', '21:00', 'późny przyjazd', 'pozny przyjazd', 'późno', 'brama', 'godziny recepcji', 'zameldowanie'],
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
    image: attractionImages.wieliczka.src,
    keywords: ['wieliczka', 'kopalnia soli', 'wycieczka', 'wycieczki z krakowa'],
  },
  {
    id: 'wawel',
    title: 'Wawel',
    description: 'Wawel pasuje nawet do krótkiego pobytu. Najwygodniej dojechać tramwajem do centrum i przejść przez Stare Miasto.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Kraków',
    icon: 'Landmark',
    image: attractionImages.wawel.src,
    keywords: ['wawel', 'zamek', 'katedra', 'stare miasto', 'kraków', 'krakow'],
  },
  {
    id: 'kazimierz',
    title: 'Kazimierz — klimatyczna dzielnica Krakowa',
    description: 'Dawna dzielnica żydowska z synagogami, restauracjami, kawiarniami i dobrym planem na popołudnie lub wieczór.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Kraków',
    icon: 'Landmark',
    image: attractionImages.kazimierz.src,
    keywords: ['kazimierz', 'dzielnica żydowska', 'synagogi', 'szeroka', 'plac nowy', 'restauracje', 'kawiarnie', 'wieczór'],
  },
  {
    id: 'schindler',
    title: 'Fabryka Schindlera',
    description: 'Muzeum historii XX wieku i dobry pomysł na deszczowy dzień w Krakowie.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Muzeum',
    icon: 'Building2',
    image: attractionImages.schindler.src,
    keywords: ['schindler', 'fabryka schindlera', 'muzeum', 'deszcz', 'history'],
  },
  {
    id: 'stay-plans',
    title: 'Plan pobytu 1 / 2 / 3 noce',
    description: 'Planer podpowiada, co zwiedzić przy 1, 2, 3 lub 4+ nocach: centrum, Wawel, Kazimierz, Wieliczka, Auschwitz i Małopolska.',
    href: '/planer-pobytu',
    category: 'Planer',
    badge: 'Wycieczki',
    icon: 'CalendarDays',
    keywords: ['plan', 'planer', '1 noc', '2 noce', '3 noce', 'wycieczki', 'trips', 'wieliczka', 'auschwitz', 'dzieci'],
  },
  {
    id: 'auschwitz',
    title: 'Auschwitz-Birkenau',
    description: 'Poważna wycieczka całodniowa, którą warto zaplanować wcześniej.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Cały dzień',
    icon: 'Shield',
    image: attractionImages.auschwitz.src,
    keywords: ['auschwitz', 'birkenau', 'oświęcim', 'wycieczka', 'wycieczki z krakowa'],
  },
  {
    id: 'energylandia',
    title: 'Energylandia',
    description: 'Całodniowy kierunek dla rodzin i osób szukających parku rozrywki poza Krakowem.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Cały dzień',
    icon: 'Sparkles',
    image: attractionImages.energylandia.src,
    keywords: ['energylandia', 'zator', 'park rozrywki', 'dzieci', 'rodzina'],
  },
  {
    id: 'ojcow',
    title: 'Ojcowski Park Narodowy',
    description: 'Spokojniejsza wycieczka z naturą, wapiennymi skałami i zamkami blisko Krakowa.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Natura',
    icon: 'Trees',
    image: attractionImages.ojcow.src,
    keywords: ['ojców', 'ojcow', 'park narodowy', 'natura', 'zamek', 'pieskowa skała'],
  },
  {
    id: 'zakopane',
    title: 'Zakopane i Tatry',
    description: 'Całodniowa wycieczka dla dłuższych pobytów, najlepiej planowana z wyprzedzeniem.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Góry',
    icon: 'MountainSnow',
    image: attractionImages.zakopane.src,
    keywords: ['zakopane', 'tatry', 'góry', 'krupówki', 'wycieczka'],
  },
  {
    id: 'bagry',
    title: 'Zalew Bagry',
    description: 'Miejska plaża i teren rekreacyjny na cieplejszy, spokojniejszy dzień w Krakowie.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Plaża',
    icon: 'Waves',
    image: attractionImages.bagry.src,
    keywords: ['bagry', 'zalew', 'plaża', 'woda', 'kraków', 'lato'],
  },
  {
    id: 'kryspinow',
    title: 'Kryspinów',
    description: 'Kąpielisko i plaża pod Krakowem, dobre jako odpoczynek między dniami zwiedzania.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Odpoczynek',
    icon: 'Umbrella',
    image: attractionImages.kryspinow.src,
    keywords: ['kryspinów', 'kryspinow', 'plaża', 'kąpielisko', 'woda', 'lato'],
  },
  {
    id: 'water-park',
    title: 'Park Wodny w Krakowie',
    description: 'Rodzinny plan na kilka godzin i jedna z opcji na dzień z gorszą pogodą.',
    href: '/atrakcje',
    category: 'Atrakcje',
    badge: 'Z dziećmi',
    icon: 'Waves',
    image: attractionImages.waterPark.src,
    keywords: ['park wodny', 'aquapark', 'dzieci', 'deszcz', 'kraków', 'basen'],
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
  {
    id: 'parking',
    title: 'Parking i pojazdy',
    description: 'Dla cięższych pojazdów, busów i ciężarówek recepcja może wskazać asfalt, aby uniknąć zakopania.',
    href: '/rezerwacja',
    category: 'Przyjazd',
    badge: 'Pojazd',
    icon: 'CarFront',
    keywords: ['parking', 'auto', 'samochód', 'bus', 'ciężarówka', 'asfalt', 'pojazd'],
  },
  {
    id: 'adapter-cable',
    title: 'Kabel i adapter do prądu',
    description: 'Przy pobycie campingowym zabierz własny kabel/przedłużacz i odpowiedni adapter do podłączenia 10A.',
    href: '/faq',
    category: 'Checklist',
    badge: 'Prąd 10A',
    icon: 'Cable',
    keywords: ['adapter', 'kabel', 'przedłużacz', 'prąd', '10a', 'wtyczka'],
  },
  {
    id: 'ev-charging',
    title: 'Ładowanie EV / hybryd',
    description: 'Prąd campingowy 10A nie służy do ładowania samochodów elektrycznych ani hybryd plug-in.',
    href: '/cennik',
    category: 'Zasady',
    badge: 'Nie EV',
    icon: 'PlugZap',
    keywords: ['ev', 'hybryda', 'ładowanie', 'samochód elektryczny', 'prąd'],
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
