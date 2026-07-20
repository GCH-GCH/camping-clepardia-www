import { getActiveSiteNotices, getNoticeCopy } from './siteNotices';
import { currencyEstimateConfig, formatCurrencyEstimates, pricingConfig } from './pricing';
import { attractionImages } from './attractionsImageRegistry';
import { tourBookingHref } from '@/i18n/coreUi';
import { getBookingLocalizedPath, getLocalizedPath, getPlannerLocalizedPath } from '@/utils/localizedLinks';

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
    id: 'tour-booking',
    title: 'Sprawdź i zarezerwuj wycieczkę',
    description: 'Aktualne warianty wycieczek do Wieliczki, Auschwitz-Birkenau, Zakopanego, Ojcowa i Energylandii.',
    href: tourBookingHref,
    category: 'Wycieczki',
    badge: 'Sprawdź dostępność',
    icon: 'TicketCheck',
    keywords: ['wycieczka', 'wycieczki', 'tour', 'wieliczka', 'auschwitz', 'zakopane', 'ojców', 'energylandia', 'rezerwacja wycieczki'],
  },
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
    id: 'reception-gate-hours',
    title: 'Recepcja i brama — godziny',
    description: 'Recepcja działa 9:00–21:00, a brama 8:00–22:00. Przy przyjeździe po 21:00 skontaktuj się wcześniej.',
    href: '/kontakt',
    category: 'Recepcja',
    badge: '9:00–21:00',
    icon: 'Clock3',
    keywords: ['recepcja', 'brama', 'godziny recepcji', 'godziny bramy', 'otwarcie', 'kontakt', 'po 21'],
  },
  {
    id: 'summer-arrival-rules',
    title: 'Lipiec i sierpień — zasady campingu',
    description: 'Z wyprzedzeniem rezerwujemy tylko domki. Kampery, vany, namioty i przyczepy przyjmujemy według kolejności przyjazdu; najlepiej około 12:00.',
    href: '/faq',
    category: 'Sezon',
    badge: 'Lipiec–sierpień',
    icon: 'Sun',
    keywords: ['sezon', 'wysoki sezon', 'lipiec', 'sierpień', 'rezerwacja campingu', 'około 12', 'kolejność przyjazdu'],
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
    keywords: ['parking', 'auto', 'samochód', 'bus', 'ciężarówka', 'ciężki pojazd', 'ciezki pojazd', 'asfalt', 'pojazd'],
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

type LocalizedSearchSeed = Omit<SearchIndexEntry, 'href'> & {
  route: string;
};

const localizedHref = (language: string, route: string) => {
  if (route === '__tour__') return tourBookingHref;
  if (route === '__booking__') return getBookingLocalizedPath(language);
  if (route === '__planner__') return getPlannerLocalizedPath(language);
  return getLocalizedPath(language, route);
};

const makeLocalizedEntries = (language: keyof typeof localizedSearchSeeds): SearchIndexEntry[] =>
  localizedSearchSeeds[language].map(({ route, ...entry }) => ({
    ...entry,
    href: localizedHref(language, route),
  }));

const newsCategoryByLanguage = {
  pl: 'Aktualności',
  en: 'Updates',
  de: 'Neuigkeiten',
  it: 'Novità',
  fr: 'Actualités',
  es: 'Noticias',
  nl: 'Updates',
  cs: 'Novinky',
  sk: 'Novinky',
  sv: 'Nyheter',
} as const;

const localizeNoticeHref = (language: string, href?: string) => {
  if (!href) return getLocalizedPath(language === 'pl' ? undefined : language, 'aktualnosci');
  if (/^https?:\/\//i.test(href)) return href;
  if (href === '/rezerwacja') return getBookingLocalizedPath(language);
  if (href === '/planer-pobytu') return getPlannerLocalizedPath(language);
  const slug = href.replace(/^\/+|\/+$/g, '');
  return getLocalizedPath(language === 'pl' ? undefined : language, slug);
};

const localizedSearchSeeds = {
  en: [
    { id: 'tour-booking', route: '__tour__', title: 'Check and book a tour', description: 'Tours to Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców and Energylandia.', category: 'Tours', badge: 'Availability', icon: 'TicketCheck', keywords: ['tour', 'tours', 'Wieliczka', 'Auschwitz', 'Zakopane', 'Ojców', 'Energylandia'] },
    { id: 'booking', route: '__booking__', title: 'Booking enquiry', description: 'Choose camping, bungalows or a combined stay and send an enquiry.', category: 'Booking', badge: 'Enquiry', icon: 'CalendarCheck', keywords: ['booking', 'reservation', 'camping', 'bungalow', 'combined'] },
    { id: 'electricity', route: 'cennik', title: '10A electricity', description: 'Camping electricity is 30 PLN per night and is not for EV charging.', category: 'Prices', badge: '30 PLN', icon: 'PlugZap', keywords: ['electricity', 'power', '10a', 'ev', 'charging'] },
    { id: 'dog', route: 'cennik', title: 'Dog at the campsite', description: 'Dog fee is 0 PLN. Please supervise your pet and clean up after it.', category: 'Camping', badge: '0 PLN', icon: 'PawPrint', keywords: ['dog', 'pet', '0 pln'] },
    { id: 'tram', route: 'dojazd', title: 'Tram to the centre', description: 'Górnickiego stop is about 40 m from the gate; tram 18 reaches Stary Kleparz in about 14 minutes.', category: 'Directions', badge: '14 min', icon: 'TramFront', keywords: ['tram', 'centre', 'Górnickiego', 'Stary Kleparz'] },
    { id: 'google-maps', route: 'dojazd', title: 'Google Maps recommended', description: 'The access route changed in 2022, so older navigation may be wrong.', category: 'Directions', badge: '2022', icon: 'MapPin', keywords: ['Google Maps', 'maps', 'directions', 'navigation', '2022'] },
    { id: 'documents', route: 'dojazd', title: 'ID and vehicle registration', description: 'Prepare an ID document and vehicle or caravan registration number for check-in.', category: 'Reception', badge: 'Arrival', icon: 'BadgeCheck', keywords: ['document', 'id', 'registration', 'vehicle', 'caravan'] },
    { id: 'quiet', route: 'faq', title: 'Quiet hours', description: 'Camping Clepardia is not a party campsite. Quiet hours are 22:00–07:00.', category: 'Rules', badge: '22:00–07:00', icon: 'Moon', keywords: ['quiet', 'rules', 'party', 'night'] },
    { id: 'bungalow-towels', route: 'domki', title: 'Towels in bungalows', description: 'Bring your own towels, toiletries and personal items for bungalow stays.', category: 'Bungalows', badge: 'Bring', icon: 'Briefcase', keywords: ['towels', 'toiletries', 'bungalow'] },
    { id: 'wieliczka', route: 'atrakcje', title: 'Wieliczka', description: 'Classic half-day trip from Krakow, also available as an organised tour.', category: 'Attractions', badge: 'Half day', icon: 'Landmark', image: attractionImages.wieliczka.src, keywords: ['Wieliczka', 'salt mine', 'tour'] },
    { id: 'kazimierz', route: 'atrakcje', title: 'Kazimierz', description: 'Historic Krakow district with synagogues, cafés and restaurants.', category: 'Attractions', badge: 'Krakow', icon: 'Landmark', image: attractionImages.kazimierz.src, keywords: ['Kazimierz', 'Jewish district', 'Krakow'] },
    { id: 'stay-plans', route: '__planner__', title: 'Stay planner', description: 'Plan 1, 2, 3 or 4+ nights with Krakow, Wawel, Kazimierz, Wieliczka and Auschwitz.', category: 'Planner', badge: 'Trips', icon: 'CalendarDays', keywords: ['planner', 'plan', 'nights', 'trips'] },
  ],
  de: [
    { id: 'tour-booking', route: '__tour__', title: 'Touren prüfen und buchen', description: 'Touren nach Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców und Energylandia.', category: 'Touren', badge: 'Verfügbarkeit', icon: 'TicketCheck', keywords: ['tour', 'ausflug', 'Wieliczka', 'Auschwitz', 'Zakopane'] },
    { id: 'booking', route: '__booking__', title: 'Buchungsanfrage', description: 'Camping, Bungalow oder kombinierten Aufenthalt wählen und Anfrage senden.', category: 'Buchung', badge: 'Anfrage', icon: 'CalendarCheck', keywords: ['buchung', 'reservierung', 'camping', 'bungalow'] },
    { id: 'electricity', route: 'cennik', title: '10A-Strom', description: 'Campingstrom kostet 30 PLN pro Nacht und dient nicht zum Laden von E-Autos.', category: 'Preise', badge: '30 PLN', icon: 'PlugZap', keywords: ['strom', '10a', 'ev', 'laden'] },
    { id: 'dog', route: 'cennik', title: 'Hund auf dem Campingplatz', description: 'Hund kostet 0 PLN. Bitte beaufsichtigen und sauber machen.', category: 'Camping', badge: '0 PLN', icon: 'PawPrint', keywords: ['hund', 'haustier', '0 pln'] },
    { id: 'tram', route: 'dojazd', title: 'Straßenbahn ins Zentrum', description: 'Haltestelle Górnickiego ca. 40 m vom Tor; Linie 18 nach Stary Kleparz ca. 14 Minuten.', category: 'Anreise', badge: '14 min', icon: 'TramFront', keywords: ['straßenbahn', 'tram', 'zentrum', 'Górnickiego'] },
    { id: 'google-maps', route: 'dojazd', title: 'Google Maps empfohlen', description: 'Die Zufahrt wurde 2022 geändert, ältere Navigation kann falsch führen.', category: 'Anreise', badge: '2022', icon: 'MapPin', keywords: ['Google Maps', 'navigation', 'anfahrt', '2022'] },
    { id: 'documents', route: 'dojazd', title: 'Ausweis und Kennzeichen', description: 'Für den Check-in Ausweis und Kennzeichen von Fahrzeug oder Wohnwagen vorbereiten.', category: 'Rezeption', badge: 'Ankunft', icon: 'BadgeCheck', keywords: ['dokument', 'ausweis', 'kennzeichen', 'fahrzeug'] },
    { id: 'quiet', route: 'faq', title: 'Nachtruhe', description: 'Camping Clepardia ist kein Party-Camping. Nachtruhe gilt 22:00–07:00.', category: 'Regeln', badge: '22:00–07:00', icon: 'Moon', keywords: ['nachtruhe', 'regeln', 'party'] },
    { id: 'bungalow-towels', route: 'domki', title: 'Handtücher in Bungalows', description: 'Für Bungalows eigene Handtücher, Kosmetik und persönliche Sachen mitbringen.', category: 'Bungalows', badge: 'Mitbringen', icon: 'Briefcase', keywords: ['handtücher', 'bungalow', 'kosmetik'] },
    { id: 'wieliczka', route: 'atrakcje', title: 'Wieliczka', description: 'Klassischer Halbtagesausflug ab Krakau, auch als organisierte Tour.', category: 'Attraktionen', badge: 'Halber Tag', icon: 'Landmark', image: attractionImages.wieliczka.src, keywords: ['Wieliczka', 'salzbergwerk', 'tour'] },
    { id: 'kazimierz', route: 'atrakcje', title: 'Kazimierz', description: 'Historisches Krakauer Viertel mit Synagogen, Cafés und Restaurants.', category: 'Attraktionen', badge: 'Krakau', icon: 'Landmark', image: attractionImages.kazimierz.src, keywords: ['Kazimierz', 'jüdisches viertel', 'Krakau'] },
    { id: 'stay-plans', route: '__planner__', title: 'Aufenthaltsplaner', description: 'Plan für 1, 2, 3 oder 4+ Nächte mit Krakau, Wawel, Kazimierz, Wieliczka und Auschwitz.', category: 'Planer', badge: 'Ausflüge', icon: 'CalendarDays', keywords: ['planer', 'nächte', 'ausflüge'] },
  ],
  it: [
    { id: 'tour-booking', route: '__tour__', title: 'Controlla e prenota tour', description: 'Tour a Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców ed Energylandia.', category: 'Tour', badge: 'Disponibilità', icon: 'TicketCheck', keywords: ['tour', 'escursione', 'Wieliczka', 'Auschwitz'] },
    { id: 'booking', route: '__booking__', title: 'Richiesta di prenotazione', description: 'Scegli camping, bungalow o soggiorno combinato e invia una richiesta.', category: 'Prenotazione', badge: 'Richiesta', icon: 'CalendarCheck', keywords: ['prenotazione', 'camping', 'bungalow'] },
    { id: 'electricity', route: 'cennik', title: 'Elettricità 10A', description: 'La corrente camping costa 30 PLN a notte e non serve per ricaricare veicoli elettrici.', category: 'Prezzi', badge: '30 PLN', icon: 'PlugZap', keywords: ['elettricità', 'corrente', '10a', 'ev'] },
    { id: 'dog', route: 'cennik', title: 'Cane in camping', description: 'Il cane costa 0 PLN. Chiediamo supervisione e pulizia.', category: 'Camping', badge: '0 PLN', icon: 'PawPrint', keywords: ['cane', 'animale', '0 pln'] },
    { id: 'tram', route: 'dojazd', title: 'Tram per il centro', description: 'Fermata Górnickiego a circa 40 m; tram 18 per Stary Kleparz in circa 14 minuti.', category: 'Accesso', badge: '14 min', icon: 'TramFront', keywords: ['tram', 'centro', 'Górnickiego'] },
    { id: 'google-maps', route: 'dojazd', title: 'Google Maps consigliato', description: 'L’accesso è cambiato nel 2022, quindi i navigatori vecchi possono sbagliare.', category: 'Accesso', badge: '2022', icon: 'MapPin', keywords: ['Google Maps', 'navigazione', 'accesso', '2022'] },
    { id: 'documents', route: 'dojazd', title: 'Documento e targa', description: 'Prepara documento d’identità e targa del veicolo o della roulotte per il check-in.', category: 'Reception', badge: 'Arrivo', icon: 'BadgeCheck', keywords: ['documento', 'targa', 'veicolo', 'roulotte'] },
    { id: 'quiet', route: 'faq', title: 'Silenzio notturno', description: 'Camping Clepardia non è un luogo per feste. Silenzio 22:00–07:00.', category: 'Regole', badge: '22:00–07:00', icon: 'Moon', keywords: ['silenzio', 'regole', 'feste'] },
    { id: 'bungalow-towels', route: 'domki', title: 'Asciugamani nei bungalow', description: 'Porta asciugamani, cosmetici e oggetti personali per il soggiorno in bungalow.', category: 'Bungalow', badge: 'Da portare', icon: 'Briefcase', keywords: ['asciugamani', 'bungalow', 'cosmetici'] },
    { id: 'wieliczka', route: 'atrakcje', title: 'Wieliczka', description: 'Classica gita di mezza giornata da Cracovia, anche come tour organizzato.', category: 'Attrazioni', badge: 'Mezza giornata', icon: 'Landmark', image: attractionImages.wieliczka.src, keywords: ['Wieliczka', 'miniera di sale', 'tour'] },
    { id: 'kazimierz', route: 'atrakcje', title: 'Kazimierz', description: 'Quartiere storico di Cracovia con sinagoghe, caffè e ristoranti.', category: 'Attrazioni', badge: 'Cracovia', icon: 'Landmark', image: attractionImages.kazimierz.src, keywords: ['Kazimierz', 'quartiere ebraico', 'Cracovia'] },
    { id: 'stay-plans', route: '__planner__', title: 'Planner soggiorno', description: 'Piano per 1, 2, 3 o 4+ notti con Cracovia, Wawel, Kazimierz, Wieliczka e Auschwitz.', category: 'Planner', badge: 'Gite', icon: 'CalendarDays', keywords: ['planner', 'notti', 'gite'] },
  ],
  fr: [
    { id: 'tour-booking', route: '__tour__', title: 'Voir et réserver une excursion', description: 'Excursions vers Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców et Energylandia.', category: 'Excursions', badge: 'Disponibilité', icon: 'TicketCheck', keywords: ['excursion', 'tour', 'Wieliczka', 'Auschwitz'] },
    { id: 'booking', route: '__booking__', title: 'Demande de réservation', description: 'Choisissez camping, bungalow ou séjour combiné et envoyez une demande.', category: 'Réservation', badge: 'Demande', icon: 'CalendarCheck', keywords: ['réservation', 'camping', 'bungalow'] },
    { id: 'electricity', route: 'cennik', title: 'Électricité 10A', description: 'L’électricité camping coûte 30 PLN par nuit et ne sert pas à charger les véhicules électriques.', category: 'Tarifs', badge: '30 PLN', icon: 'PlugZap', keywords: ['électricité', 'courant', '10a', 'ev'] },
    { id: 'dog', route: 'cennik', title: 'Chien au camping', description: 'Le chien coûte 0 PLN. Merci de le surveiller et de ramasser après lui.', category: 'Camping', badge: '0 PLN', icon: 'PawPrint', keywords: ['chien', 'animal', '0 pln'] },
    { id: 'tram', route: 'dojazd', title: 'Tramway vers le centre', description: 'Arrêt Górnickiego à environ 40 m ; tram 18 vers Stary Kleparz en environ 14 minutes.', category: 'Accès', badge: '14 min', icon: 'TramFront', keywords: ['tramway', 'tram', 'centre', 'Górnickiego'] },
    { id: 'google-maps', route: 'dojazd', title: 'Google Maps recommandé', description: 'L’accès a changé en 2022 ; les anciens GPS peuvent se tromper.', category: 'Accès', badge: '2022', icon: 'MapPin', keywords: ['Google Maps', 'accès', 'navigation', '2022'] },
    { id: 'documents', route: 'dojazd', title: 'Document et immatriculation', description: 'Préparez une pièce d’identité et l’immatriculation du véhicule ou de la caravane pour l’arrivée.', category: 'Réception', badge: 'Arrivée', icon: 'BadgeCheck', keywords: ['document', 'identité', 'immatriculation', 'véhicule'] },
    { id: 'quiet', route: 'faq', title: 'Calme nocturne', description: 'Camping Clepardia n’est pas un lieu de fête. Calme de 22h00 à 07h00.', category: 'Règles', badge: '22:00–07:00', icon: 'Moon', keywords: ['calme', 'règles', 'fête'] },
    { id: 'bungalow-towels', route: 'domki', title: 'Serviettes dans les bungalows', description: 'Apportez serviettes, produits de toilette et effets personnels pour les bungalows.', category: 'Bungalows', badge: 'À apporter', icon: 'Briefcase', keywords: ['serviettes', 'bungalow', 'toilette'] },
    { id: 'wieliczka', route: 'atrakcje', title: 'Wieliczka', description: 'Excursion classique d’une demi-journée depuis Cracovie, possible aussi en tour organisé.', category: 'Attractions', badge: 'Demi-journée', icon: 'Landmark', image: attractionImages.wieliczka.src, keywords: ['Wieliczka', 'mine de sel', 'excursion'] },
    { id: 'kazimierz', route: 'atrakcje', title: 'Kazimierz', description: 'Quartier historique de Cracovie avec synagogues, cafés et restaurants.', category: 'Attractions', badge: 'Cracovie', icon: 'Landmark', image: attractionImages.kazimierz.src, keywords: ['Kazimierz', 'quartier juif', 'Cracovie'] },
    { id: 'stay-plans', route: '__planner__', title: 'Planificateur de séjour', description: 'Planifiez 1, 2, 3 ou 4+ nuits avec Cracovie, Wawel, Kazimierz, Wieliczka et Auschwitz.', category: 'Planificateur', badge: 'Excursions', icon: 'CalendarDays', keywords: ['planificateur', 'nuits', 'excursions'] },
  ],
  es: [
    { id: 'tour-booking', route: '__tour__', title: 'Ver y reservar excursión', description: 'Excursiones a Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców y Energylandia.', category: 'Excursiones', badge: 'Disponibilidad', icon: 'TicketCheck', keywords: ['excursión', 'tour', 'Wieliczka', 'Auschwitz'] },
    { id: 'booking', route: '__booking__', title: 'Consulta de reserva', description: 'Elige camping, bungalow o estancia combinada y envía una consulta.', category: 'Reserva', badge: 'Consulta', icon: 'CalendarCheck', keywords: ['reserva', 'camping', 'bungalow'] },
    { id: 'electricity', route: 'cennik', title: 'Electricidad 10A', description: 'La electricidad de camping cuesta 30 PLN por noche y no sirve para cargar vehículos eléctricos.', category: 'Precios', badge: '30 PLN', icon: 'PlugZap', keywords: ['electricidad', 'corriente', '10a', 'ev'] },
    { id: 'dog', route: 'cennik', title: 'Perro en el camping', description: 'El perro cuesta 0 PLN. Pedimos supervisión y limpieza.', category: 'Camping', badge: '0 PLN', icon: 'PawPrint', keywords: ['perro', 'mascota', '0 pln'] },
    { id: 'tram', route: 'dojazd', title: 'Tranvía al centro', description: 'Parada Górnickiego a unos 40 m; tranvía 18 a Stary Kleparz en unos 14 minutos.', category: 'Acceso', badge: '14 min', icon: 'TramFront', keywords: ['tranvía', 'tram', 'centro', 'Górnickiego'] },
    { id: 'google-maps', route: 'dojazd', title: 'Google Maps recomendado', description: 'El acceso cambió en 2022; los navegadores antiguos pueden indicar mal.', category: 'Acceso', badge: '2022', icon: 'MapPin', keywords: ['Google Maps', 'acceso', 'navegación', '2022'] },
    { id: 'documents', route: 'dojazd', title: 'Documento y matrícula', description: 'Prepara documento de identidad y matrícula del vehículo o caravana para el check-in.', category: 'Recepción', badge: 'Llegada', icon: 'BadgeCheck', keywords: ['documento', 'identidad', 'matrícula', 'vehículo'] },
    { id: 'quiet', route: 'faq', title: 'Silencio nocturno', description: 'Camping Clepardia no es un camping de fiestas. Silencio de 22:00 a 07:00.', category: 'Normas', badge: '22:00–07:00', icon: 'Moon', keywords: ['silencio', 'normas', 'fiesta'] },
    { id: 'bungalow-towels', route: 'domki', title: 'Toallas en bungalows', description: 'Trae toallas, productos de aseo y objetos personales para los bungalows.', category: 'Bungalows', badge: 'Traer', icon: 'Briefcase', keywords: ['toallas', 'bungalow', 'aseo'] },
    { id: 'wieliczka', route: 'atrakcje', title: 'Wieliczka', description: 'Excursión clásica de medio día desde Cracovia, también como tour organizado.', category: 'Atracciones', badge: 'Medio día', icon: 'Landmark', image: attractionImages.wieliczka.src, keywords: ['Wieliczka', 'mina de sal', 'excursión'] },
    { id: 'kazimierz', route: 'atrakcje', title: 'Kazimierz', description: 'Barrio histórico de Cracovia con sinagogas, cafés y restaurantes.', category: 'Atracciones', badge: 'Cracovia', icon: 'Landmark', image: attractionImages.kazimierz.src, keywords: ['Kazimierz', 'barrio judío', 'Cracovia'] },
    { id: 'stay-plans', route: '__planner__', title: 'Planificador de estancia', description: 'Planifica 1, 2, 3 o 4+ noches con Cracovia, Wawel, Kazimierz, Wieliczka y Auschwitz.', category: 'Planificador', badge: 'Excursiones', icon: 'CalendarDays', keywords: ['planificador', 'noches', 'excursiones'] },
  ],
  nl: [
    { id: 'tour-booking', route: '__tour__', title: 'Tours bekijken en boeken', description: 'Tours naar Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców en Energylandia.', category: 'Tours', badge: 'Beschikbaarheid', icon: 'TicketCheck', keywords: ['tour', 'uitstap', 'Wieliczka', 'Auschwitz'] },
    { id: 'booking', route: '__booking__', title: 'Boekingsaanvraag', description: 'Kies camping, bungalow of gecombineerd verblijf en stuur een aanvraag.', category: 'Boeken', badge: 'Aanvraag', icon: 'CalendarCheck', keywords: ['boeken', 'reserveren', 'camping', 'bungalow'] },
    { id: 'electricity', route: 'cennik', title: '10A stroom', description: 'Campingstroom kost 30 PLN per nacht en is niet bedoeld voor EV-laden.', category: 'Prijzen', badge: '30 PLN', icon: 'PlugZap', keywords: ['stroom', 'elektriciteit', '10a', 'ev'] },
    { id: 'dog', route: 'cennik', title: 'Hond op de camping', description: 'Een hond kost 0 PLN. Houd toezicht en ruim op.', category: 'Camping', badge: '0 PLN', icon: 'PawPrint', keywords: ['hond', 'huisdier', '0 pln'] },
    { id: 'tram', route: 'dojazd', title: 'Tram naar het centrum', description: 'Halte Górnickiego op ca. 40 m; tram 18 naar Stary Kleparz in ca. 14 minuten.', category: 'Route', badge: '14 min', icon: 'TramFront', keywords: ['tram', 'centrum', 'Górnickiego'] },
    { id: 'google-maps', route: 'dojazd', title: 'Google Maps aanbevolen', description: 'De toegang veranderde in 2022; oudere navigatie kan verkeerd sturen.', category: 'Route', badge: '2022', icon: 'MapPin', keywords: ['Google Maps', 'route', 'navigatie', '2022'] },
    { id: 'documents', route: 'dojazd', title: 'ID en kenteken', description: 'Neem ID en kenteken van voertuig of caravan mee voor check-in.', category: 'Receptie', badge: 'Aankomst', icon: 'BadgeCheck', keywords: ['document', 'id', 'kenteken', 'voertuig'] },
    { id: 'quiet', route: 'faq', title: 'Nachtrust', description: 'Camping Clepardia is geen feestcamping. Nachtrust geldt 22:00–07:00.', category: 'Regels', badge: '22:00–07:00', icon: 'Moon', keywords: ['rust', 'regels', 'feest'] },
    { id: 'bungalow-towels', route: 'domki', title: 'Handdoeken in bungalows', description: 'Neem eigen handdoeken, toiletartikelen en persoonlijke spullen mee.', category: 'Bungalows', badge: 'Meenemen', icon: 'Briefcase', keywords: ['handdoeken', 'bungalow', 'toiletartikelen'] },
    { id: 'wieliczka', route: 'atrakcje', title: 'Wieliczka', description: 'Klassieke halve-dagtrip vanuit Krakau, ook als georganiseerde tour.', category: 'Attracties', badge: 'Halve dag', icon: 'Landmark', image: attractionImages.wieliczka.src, keywords: ['Wieliczka', 'zoutmijn', 'tour'] },
    { id: 'kazimierz', route: 'atrakcje', title: 'Kazimierz', description: 'Historische wijk van Krakau met synagogen, cafés en restaurants.', category: 'Attracties', badge: 'Krakau', icon: 'Landmark', image: attractionImages.kazimierz.src, keywords: ['Kazimierz', 'Joodse wijk', 'Krakau'] },
    { id: 'stay-plans', route: '__planner__', title: 'Verblijfsplanner', description: 'Plan 1, 2, 3 of 4+ nachten met Krakau, Wawel, Kazimierz, Wieliczka en Auschwitz.', category: 'Planner', badge: 'Uitstappen', icon: 'CalendarDays', keywords: ['planner', 'nachten', 'uitstappen'] },
  ],
  cs: [
    { id: 'tour-booking', route: '__tour__', title: 'Zkontrolovat a rezervovat výlet', description: 'Výlety do Wieliczky, Auschwitz-Birkenau, Zakopaného, Ojcówa a Energylandie.', category: 'Výlety', badge: 'Dostupnost', icon: 'TicketCheck', keywords: ['výlet', 'Wieliczka', 'Auschwitz', 'Zakopane'] },
    { id: 'booking', route: '__booking__', title: 'Dotaz k rezervaci', description: 'Vyberte camping, bungalov nebo kombinovaný pobyt a odešlete dotaz.', category: 'Rezervace', badge: 'Dotaz', icon: 'CalendarCheck', keywords: ['rezervace', 'camping', 'bungalov'] },
    { id: 'electricity', route: 'cennik', title: 'Elektřina 10A', description: 'Campingová elektřina stojí 30 PLN za noc a není pro nabíjení elektromobilů.', category: 'Ceny', badge: '30 PLN', icon: 'PlugZap', keywords: ['elektřina', 'proud', '10a', 'ev'] },
    { id: 'dog', route: 'cennik', title: 'Pes v kempu', description: 'Pes stojí 0 PLN. Prosíme o dohled a úklid.', category: 'Camping', badge: '0 PLN', icon: 'PawPrint', keywords: ['pes', 'zvíře', '0 pln'] },
    { id: 'tram', route: 'dojazd', title: 'Tramvaj do centra', description: 'Zastávka Górnickiego asi 40 m; tramvaj 18 na Stary Kleparz asi 14 minut.', category: 'Doprava', badge: '14 min', icon: 'TramFront', keywords: ['tramvaj', 'centrum', 'Górnickiego'] },
    { id: 'google-maps', route: 'dojazd', title: 'Doporučujeme Google Maps', description: 'Vjezd se změnil v roce 2022; starší navigace může vést špatně.', category: 'Doprava', badge: '2022', icon: 'MapPin', keywords: ['Google Maps', 'doprava', 'navigace', '2022'] },
    { id: 'documents', route: 'dojazd', title: 'Doklad a registrační značka', description: 'Pro příjezd připravte doklad totožnosti a registrační značku vozidla nebo karavanu.', category: 'Recepce', badge: 'Příjezd', icon: 'BadgeCheck', keywords: ['doklad', 'registrace', 'vozidlo', 'karavan'] },
    { id: 'quiet', route: 'faq', title: 'Noční klid', description: 'Camping Clepardia není párty místo. Noční klid platí 22:00–07:00.', category: 'Pravidla', badge: '22:00–07:00', icon: 'Moon', keywords: ['klid', 'pravidla', 'party'] },
    { id: 'bungalow-towels', route: 'domki', title: 'Ručníky v bungalovech', description: 'Do bungalovu si vezměte ručníky, hygienické potřeby a osobní věci.', category: 'Bungalovy', badge: 'S sebou', icon: 'Briefcase', keywords: ['ručníky', 'bungalov', 'hygiena'] },
    { id: 'wieliczka', route: 'atrakcje', title: 'Wieliczka', description: 'Klasický půldenní výlet z Krakova, také jako organizovaný výlet.', category: 'Atrakce', badge: 'Půl dne', icon: 'Landmark', image: attractionImages.wieliczka.src, keywords: ['Wieliczka', 'solný důl', 'výlet'] },
    { id: 'kazimierz', route: 'atrakcje', title: 'Kazimierz', description: 'Historická krakovská čtvrť se synagogami, kavárnami a restauracemi.', category: 'Atrakce', badge: 'Krakov', icon: 'Landmark', image: attractionImages.kazimierz.src, keywords: ['Kazimierz', 'židovská čtvrť', 'Krakov'] },
    { id: 'stay-plans', route: '__planner__', title: 'Plánovač pobytu', description: 'Naplánujte 1, 2, 3 nebo 4+ noci s Krakovem, Wawelem, Kazimierzem, Wieliczkou a Auschwitz.', category: 'Plánovač', badge: 'Výlety', icon: 'CalendarDays', keywords: ['plánovač', 'noci', 'výlety'] },
  ],
  sk: [
    { id: 'tour-booking', route: '__tour__', title: 'Skontrolovať a rezervovať výlet', description: 'Výlety do Wieliczky, Auschwitz-Birkenau, Zakopaného, Ojcówa a Energylandie.', category: 'Výlety', badge: 'Dostupnosť', icon: 'TicketCheck', keywords: ['výlet', 'Wieliczka', 'Auschwitz', 'Zakopane'] },
    { id: 'booking', route: '__booking__', title: 'Dopyt k rezervácii', description: 'Vyberte camping, bungalov alebo kombinovaný pobyt a odošlite dopyt.', category: 'Rezervácia', badge: 'Dopyt', icon: 'CalendarCheck', keywords: ['rezervácia', 'camping', 'bungalov'] },
    { id: 'electricity', route: 'cennik', title: 'Elektrina 10A', description: 'Campingová elektrina stojí 30 PLN za noc a nie je na nabíjanie elektromobilov.', category: 'Ceny', badge: '30 PLN', icon: 'PlugZap', keywords: ['elektrina', 'prúd', '10a', 'ev'] },
    { id: 'dog', route: 'cennik', title: 'Pes v kempe', description: 'Pes stojí 0 PLN. Prosíme o dohľad a upratanie.', category: 'Camping', badge: '0 PLN', icon: 'PawPrint', keywords: ['pes', 'zviera', '0 pln'] },
    { id: 'tram', route: 'dojazd', title: 'Električka do centra', description: 'Zastávka Górnickiego asi 40 m; električka 18 na Stary Kleparz asi 14 minút.', category: 'Doprava', badge: '14 min', icon: 'TramFront', keywords: ['električka', 'centrum', 'Górnickiego'] },
    { id: 'google-maps', route: 'dojazd', title: 'Odporúčame Google Maps', description: 'Vjazd sa zmenil v roku 2022; staršia navigácia môže viesť zle.', category: 'Doprava', badge: '2022', icon: 'MapPin', keywords: ['Google Maps', 'doprava', 'navigácia', '2022'] },
    { id: 'documents', route: 'dojazd', title: 'Doklad a evidenčné číslo', description: 'Na príchod pripravte doklad totožnosti a evidenčné číslo vozidla alebo karavanu.', category: 'Recepcia', badge: 'Príchod', icon: 'BadgeCheck', keywords: ['doklad', 'registrácia', 'vozidlo', 'karavan'] },
    { id: 'quiet', route: 'faq', title: 'Nočný pokoj', description: 'Camping Clepardia nie je párty miesto. Nočný pokoj platí 22:00–07:00.', category: 'Pravidlá', badge: '22:00–07:00', icon: 'Moon', keywords: ['pokoj', 'pravidlá', 'party'] },
    { id: 'bungalow-towels', route: 'domki', title: 'Uteráky v bungalovoch', description: 'Do bungalovu si vezmite uteráky, hygienické potreby a osobné veci.', category: 'Bungalovy', badge: 'So sebou', icon: 'Briefcase', keywords: ['uteráky', 'bungalov', 'hygiena'] },
    { id: 'wieliczka', route: 'atrakcje', title: 'Wieliczka', description: 'Klasický poldenný výlet z Krakova, aj ako organizovaný výlet.', category: 'Atrakcie', badge: 'Pol dňa', icon: 'Landmark', image: attractionImages.wieliczka.src, keywords: ['Wieliczka', 'soľná baňa', 'výlet'] },
    { id: 'kazimierz', route: 'atrakcje', title: 'Kazimierz', description: 'Historická krakovská štvrť so synagógami, kaviarňami a reštauráciami.', category: 'Atrakcie', badge: 'Krakov', icon: 'Landmark', image: attractionImages.kazimierz.src, keywords: ['Kazimierz', 'židovská štvrť', 'Krakov'] },
    { id: 'stay-plans', route: '__planner__', title: 'Plánovač pobytu', description: 'Naplánujte 1, 2, 3 alebo 4+ noci s Krakovom, Wawelom, Kazimierzom, Wieliczkou a Auschwitz.', category: 'Plánovač', badge: 'Výlety', icon: 'CalendarDays', keywords: ['plánovač', 'noci', 'výlety'] },
  ],
  sv: [
    { id: 'tour-booking', route: '__tour__', title: 'Kontrollera och boka tur', description: 'Turer till Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców och Energylandia.', category: 'Turer', badge: 'Tillgänglighet', icon: 'TicketCheck', keywords: ['tur', 'utflykt', 'Wieliczka', 'Auschwitz'] },
    { id: 'booking', route: '__booking__', title: 'Bokningsförfrågan', description: 'Välj camping, bungalow eller kombinerad vistelse och skicka en förfrågan.', category: 'Bokning', badge: 'Förfrågan', icon: 'CalendarCheck', keywords: ['bokning', 'camping', 'bungalow'] },
    { id: 'electricity', route: 'cennik', title: '10A el', description: 'Campingel kostar 30 PLN per natt och är inte för laddning av elfordon.', category: 'Priser', badge: '30 PLN', icon: 'PlugZap', keywords: ['el', 'ström', '10a', 'ev'] },
    { id: 'dog', route: 'cennik', title: 'Hund på campingen', description: 'Hund kostar 0 PLN. Håll uppsikt och plocka upp efter hunden.', category: 'Camping', badge: '0 PLN', icon: 'PawPrint', keywords: ['hund', 'husdjur', '0 pln'] },
    { id: 'tram', route: 'dojazd', title: 'Spårvagn till centrum', description: 'Hållplats Górnickiego cirka 40 m; linje 18 till Stary Kleparz på cirka 14 minuter.', category: 'Väg', badge: '14 min', icon: 'TramFront', keywords: ['spårvagn', 'centrum', 'Górnickiego'] },
    { id: 'google-maps', route: 'dojazd', title: 'Google Maps rekommenderas', description: 'Infarten ändrades 2022; äldre navigation kan visa fel.', category: 'Väg', badge: '2022', icon: 'MapPin', keywords: ['Google Maps', 'väg', 'navigation', '2022'] },
    { id: 'documents', route: 'dojazd', title: 'ID och registreringsnummer', description: 'Förbered ID och registreringsnummer för fordon eller husvagn vid incheckning.', category: 'Reception', badge: 'Ankomst', icon: 'BadgeCheck', keywords: ['dokument', 'id', 'registrering', 'fordon'] },
    { id: 'quiet', route: 'faq', title: 'Nattro', description: 'Camping Clepardia är ingen festcamping. Nattro gäller 22:00–07:00.', category: 'Regler', badge: '22:00–07:00', icon: 'Moon', keywords: ['nattro', 'regler', 'fest'] },
    { id: 'bungalow-towels', route: 'domki', title: 'Handdukar i bungalower', description: 'Ta med egna handdukar, hygienartiklar och personliga saker.', category: 'Bungalower', badge: 'Ta med', icon: 'Briefcase', keywords: ['handdukar', 'bungalow', 'hygien'] },
    { id: 'wieliczka', route: 'atrakcje', title: 'Wieliczka', description: 'Klassisk halvdagstur från Kraków, även som organiserad tur.', category: 'Sevärdheter', badge: 'Halvdag', icon: 'Landmark', image: attractionImages.wieliczka.src, keywords: ['Wieliczka', 'saltgruva', 'tur'] },
    { id: 'kazimierz', route: 'atrakcje', title: 'Kazimierz', description: 'Historiskt Krakówområde med synagogor, kaféer och restauranger.', category: 'Sevärdheter', badge: 'Kraków', icon: 'Landmark', image: attractionImages.kazimierz.src, keywords: ['Kazimierz', 'judiska kvarteren', 'Kraków'] },
    { id: 'stay-plans', route: '__planner__', title: 'Vistelseplanerare', description: 'Planera 1, 2, 3 eller 4+ nätter med Kraków, Wawel, Kazimierz, Wieliczka och Auschwitz.', category: 'Planerare', badge: 'Utflykter', icon: 'CalendarDays', keywords: ['planerare', 'nätter', 'utflykter'] },
  ],
} satisfies Record<string, LocalizedSearchSeed[]>;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const auschwitzSearchCopy = {
  pl:{ category:'Auschwitz-Birkenau',badge:'Tylko online',officialTitle:'Oficjalne karty wstępu Auschwitz',officialDescription:'Od 1 marca karty wstępu są dostępne wyłącznie online w oficjalnym systemie. Nie można otrzymać karty przy wejściu.',placeDescription:'Całodniowa wizyta wymagająca wcześniejszej rezerwacji online. Dostępne są oficjalne karty wstępu i wycieczki z Krakowa.',keywords:['auschwitz','birkenau','oświęcim','bilety auschwitz','karta wstępu','karty wstępu','bezpłatna karta','visit auschwitz','rezerwacja online']},
  en:{ category:'Auschwitz-Birkenau',badge:'Online only',officialTitle:'Official Auschwitz entry cards',officialDescription:'From 1 March, entry cards are available only through the official online system and not at the Museum entrance.',placeDescription:'A full-day visit requiring advance online reservation. Official entry cards and tours from Krakow are separate options.',keywords:['auschwitz','birkenau','entry card','tickets','free entry card','official booking','online reservation','visit auschwitz']},
  de:{ category:'Auschwitz-Birkenau',badge:'Nur online',officialTitle:'Offizielle Auschwitz-Eintrittskarten',officialDescription:'Seit 1. März gibt es Eintrittskarten nur im offiziellen Online-System, nicht am Museumseingang.',placeDescription:'Ganztagesbesuch mit vorheriger Online-Reservierung. Offizielle Eintrittskarten und Ausflüge ab Krakau sind getrennte Optionen.',keywords:['auschwitz','birkenau','eintrittskarte','tickets','kostenlose karte','offizielle reservierung','online buchen']},
  it:{ category:'Auschwitz-Birkenau',badge:'Solo online',officialTitle:'Carte d’ingresso ufficiali Auschwitz',officialDescription:'Dal 1° marzo le carte sono disponibili solo nel sistema online ufficiale, non all’ingresso.',placeDescription:'Visita di un giorno con prenotazione online anticipata. Carte ufficiali e tour da Cracovia sono opzioni separate.',keywords:['auschwitz','birkenau','biglietti','carta ingresso','ingresso gratuito','prenotazione ufficiale','online']},
  fr:{ category:'Auschwitz-Birkenau',badge:'En ligne uniquement',officialTitle:'Cartes d’entrée officielles Auschwitz',officialDescription:'Depuis le 1er mars, les cartes sont disponibles uniquement dans le système officiel en ligne, pas à l’entrée.',placeDescription:'Visite d’une journée avec réservation en ligne préalable. Cartes officielles et excursions depuis Cracovie sont deux options.',keywords:['auschwitz','birkenau','billets','carte entrée','carte gratuite','réservation officielle','en ligne']},
  es:{ category:'Auschwitz-Birkenau',badge:'Solo online',officialTitle:'Entradas oficiales Auschwitz',officialDescription:'Desde el 1 de marzo las entradas solo están en el sistema oficial online, no en la entrada del Museo.',placeDescription:'Visita de día completo con reserva online previa. Entradas oficiales y excursiones desde Cracovia son opciones distintas.',keywords:['auschwitz','birkenau','entradas','tarjeta entrada','entrada gratuita','reserva oficial','online']},
  nl:{ category:'Auschwitz-Birkenau',badge:'Alleen online',officialTitle:'Officiële toegangsbewijzen Auschwitz',officialDescription:'Vanaf 1 maart zijn kaarten alleen beschikbaar via het officiële online systeem, niet bij de ingang.',placeDescription:'Een dagbezoek met online reservering vooraf. Officiële kaarten en tours vanuit Krakau zijn aparte opties.',keywords:['auschwitz','birkenau','toegangsbewijs','tickets','gratis kaart','officieel reserveren','online']},
  cs:{ category:'Auschwitz-Birkenau',badge:'Pouze online',officialTitle:'Oficiální vstupní karty Auschwitz',officialDescription:'Od 1. března jsou karty jen v oficiálním online systému, ne u vstupu do Muzea.',placeDescription:'Celodenní návštěva s předchozí online rezervací. Oficiální karty a výlety z Krakova jsou samostatné možnosti.',keywords:['auschwitz','birkenau','vstupní karta','vstupenky','bezplatná karta','oficiální rezervace','online']},
  sk:{ category:'Auschwitz-Birkenau',badge:'Iba online',officialTitle:'Oficiálne vstupné karty Auschwitz',officialDescription:'Od 1. marca sú karty iba v oficiálnom online systéme, nie pri vstupe do Múzea.',placeDescription:'Celodenná návšteva s predchádzajúcou online rezerváciou. Oficiálne karty a výlety z Krakova sú samostatné možnosti.',keywords:['auschwitz','birkenau','vstupná karta','vstupenky','bezplatná karta','oficiálna rezervácia','online']},
  sv:{ category:'Auschwitz-Birkenau',badge:'Endast online',officialTitle:'Officiella inträdeskort Auschwitz',officialDescription:'Från 1 mars finns kort endast i det officiella onlinesystemet, inte vid museets entré.',placeDescription:'Ett heldagsbesök med onlinebokning i förväg. Officiella kort och turer från Kraków är separata alternativ.',keywords:['auschwitz','birkenau','inträdeskort','biljetter','gratis kort','officiell bokning','online']},
} as const;

export const getSearchIndex = (language = 'pl'): SearchIndexEntry[] => {
  const sourceEntries = language in localizedSearchSeeds
    ? makeLocalizedEntries(language as keyof typeof localizedSearchSeeds)
    : baseSearchIndex;
  const auschwitzCopy = auschwitzSearchCopy[language as keyof typeof auschwitzSearchCopy] ?? auschwitzSearchCopy.en;
  const attractionHref = getLocalizedPath(language === 'pl' ? undefined : language,'atrakcje');
  const coreEntries = [
    ...sourceEntries.filter((entry)=>entry.id !== 'auschwitz'),
    {
      id:'auschwitz',title:'Auschwitz-Birkenau',description:auschwitzCopy.placeDescription,href:attractionHref,
      category:auschwitzCopy.category,badge:language === 'pl' ? 'Cały dzień' : auschwitzCopy.badge,icon:'Shield',image:attractionImages.auschwitz.src,
      keywords:[...auschwitzCopy.keywords,'tour','wycieczki','excursion','ausflug'],
    },
    {
      id:'auschwitz-official-entry',title:auschwitzCopy.officialTitle,description:auschwitzCopy.officialDescription,href:'https://visit.auschwitz.org/',
      category:auschwitzCopy.category,badge:auschwitzCopy.badge,icon:'TicketCheck',image:attractionImages.auschwitz.src,keywords:[...auschwitzCopy.keywords,'visit.auschwitz.org'],
    },
  ];
  const noticeEntries = getActiveSiteNotices().map((notice) => {
    const copy = getNoticeCopy(notice, language);
    return {
      id: `notice-${notice.id}`,
      title: copy.title,
      description: copy.shortDescription ?? copy.description,
      href: localizeNoticeHref(language, notice.ctaHref),
      category: newsCategoryByLanguage[language as keyof typeof newsCategoryByLanguage] ?? newsCategoryByLanguage.en,
      badge: copy.badge,
      icon: notice.icon ?? 'Info',
      keywords: [notice.title, notice.category, ...(notice.tags ?? [])],
    };
  });

  return [...coreEntries, ...noticeEntries];
};

export const searchIndexEntries = getSearchIndex('pl');

export const searchEntries = (query: string, entries: SearchIndexEntry[] = searchIndexEntries, limit = 6) => {
  const normalizedQuery = normalize(query.trim());
  if (!normalizedQuery) return [];

  return entries
    .map((entry) => {
      const normalizedTitle = normalize(entry.title);
      const normalizedKeywords = entry.keywords.map(normalize);
      const haystack = normalize([entry.title, entry.description, entry.category, entry.badge, ...entry.keywords].filter(Boolean).join(' '));
      const score =
        normalizedTitle === normalizedQuery ? 7 :
        normalizedTitle.includes(normalizedQuery) ? 6 :
        normalizedKeywords.some((keyword) => keyword === normalizedQuery) ? 5 :
        normalizedKeywords.some((keyword) => keyword.includes(normalizedQuery)) ? 4 :
        haystack.includes(normalizedQuery) ? 3 :
        normalizedQuery.split(/\s+/).some((part) => part.length > 2 && haystack.includes(part)) ? 2 :
        0;

      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
};
