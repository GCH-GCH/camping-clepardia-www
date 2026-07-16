import { summerCampingCopy } from '../../shared/summerCamping.js';

export type SiteNoticeType = 'event' | 'offer' | 'alert' | 'info';
export type SiteNoticePriority = 'low' | 'medium' | 'high';
export type SiteNoticeLanguage = 'pl' | 'en' | 'de' | 'it' | 'fr' | 'es' | 'nl' | 'cs' | 'sk' | 'sv';
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
    image: '/images/attractions/krakow-main-square.webp',
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
    image: '/images/attractions/krakow-tram-city-trip.webp',
    imageAlt: 'Tramwaj podczas przejazdu przez Kraków',
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
    title: summerCampingCopy.pl.title,
    shortDescription: summerCampingCopy.pl.short,
    description: `${summerCampingCopy.pl.message} ${summerCampingCopy.pl.noon} ${summerCampingCopy.pl.evening} ${summerCampingCopy.pl.disclaimer}`,
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
    image: '/images/attractions/krakow-wawel-castle.webp',
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

const noticeLanguages: SiteNoticeLanguage[] = ['pl', 'en', 'de', 'it', 'fr', 'es', 'nl', 'cs', 'sk', 'sv'];

const noticeCopyOverrides: Record<string, Partial<Record<SiteNoticeLanguage, SiteNoticeTranslation>>> = {
  'season-open-2026': {
    de: { title: 'Camping Clepardia öffnet am 1. April', shortDescription: 'Camping Clepardia empfängt Gäste ab dem 1. April.', description: 'Wir begrüßen Gäste ab dem 1. April. Prüfen Sie Preise, Anreise und senden Sie eine Anfrage für Camping, Bungalows oder einen kombinierten Aufenthalt.', ctaLabel: 'Aufenthalt anfragen', badge: 'Saison geöffnet', imageAlt: 'Grüne Bäume auf Camping Clepardia' },
    it: { title: 'La stagione di Camping Clepardia apre il 1º aprile', shortDescription: 'Camping Clepardia accoglie gli ospiti dal 1º aprile.', description: 'Vi aspettiamo dal 1º aprile. Controlla prezzi, indicazioni e invia una richiesta per camping, bungalow o soggiorno combinato.', ctaLabel: 'Richiedi il soggiorno', badge: 'Stagione aperta', imageAlt: 'Alberi verdi al Camping Clepardia' },
    fr: { title: 'La saison Camping Clepardia ouvre le 1er avril', shortDescription: 'Camping Clepardia accueille les clients à partir du 1er avril.', description: 'Nous accueillons les clients à partir du 1er avril. Consultez les tarifs, l’accès et envoyez une demande pour camping, bungalow ou séjour combiné.', ctaLabel: 'Envoyer une demande', badge: 'Saison ouverte', imageAlt: 'Arbres verts au Camping Clepardia' },
    es: { title: 'La temporada de Camping Clepardia empieza el 1 de abril', shortDescription: 'Camping Clepardia recibe huéspedes desde el 1 de abril.', description: 'Recibimos huéspedes desde el 1 de abril. Consulta precios, acceso y envía una solicitud para camping, bungalows o estancia combinada.', ctaLabel: 'Enviar consulta', badge: 'Temporada abierta', imageAlt: 'Árboles verdes en Camping Clepardia' },
    nl: { title: 'Camping Clepardia opent op 1 april', shortDescription: 'Camping Clepardia verwelkomt gasten vanaf 1 april.', description: 'Vanaf 1 april zijn gasten welkom. Bekijk prijzen, route en stuur een aanvraag voor camping, bungalows of een gecombineerd verblijf.', ctaLabel: 'Stuur een aanvraag', badge: 'Seizoen open', imageAlt: 'Groene bomen op Camping Clepardia' },
    cs: { title: 'Sezóna Camping Clepardia začíná 1. dubna', shortDescription: 'Camping Clepardia vítá hosty od 1. dubna.', description: 'Hosty vítáme od 1. dubna. Zkontrolujte ceny, dopravu a odešlete dotaz na camping, bungalovy nebo kombinovaný pobyt.', ctaLabel: 'Odeslat dotaz', badge: 'Sezóna otevřena', imageAlt: 'Zelené stromy v Camping Clepardia' },
    sk: { title: 'Sezóna Camping Clepardia sa začína 1. apríla', shortDescription: 'Camping Clepardia víta hostí od 1. apríla.', description: 'Hostí vítame od 1. apríla. Skontrolujte ceny, dopravu a odošlite dopyt na camping, bungalovy alebo kombinovaný pobyt.', ctaLabel: 'Odoslať dopyt', badge: 'Sezóna otvorená', imageAlt: 'Zelené stromy v Camping Clepardia' },
    sv: { title: 'Camping Clepardia öppnar säsongen den 1 april', shortDescription: 'Camping Clepardia välkomnar gäster från den 1 april.', description: 'Vi välkomnar gäster från den 1 april. Kontrollera priser, vägbeskrivning och skicka en förfrågan för camping, bungalower eller kombinerad vistelse.', ctaLabel: 'Skicka förfrågan', badge: 'Säsongen öppen', imageAlt: 'Gröna träd på Camping Clepardia' },
  },
  'tram-to-centre': {
    en: { title: 'Around 14 minutes to the centre by tram', shortDescription: 'Górnickiego tram stop is about 40 m from the gate.', description: 'Górnickiego tram stop is about 40 m from the campsite. Tram 18 usually reaches Stary Kleparz in about 9 stops and around 14 minutes.', ctaLabel: 'See directions', badge: 'Transport', imageAlt: 'Tram travelling through Krakow' },
    de: { title: 'Mit der Straßenbahn in ca. 14 Minuten ins Zentrum', shortDescription: 'Die Haltestelle Górnickiego liegt ca. 40 m vom Tor entfernt.', description: 'Die Haltestelle Górnickiego liegt ca. 40 m vom Campingplatz entfernt. Linie 18 fährt meist in ca. 9 Haltestellen und rund 14 Minuten bis Stary Kleparz.', ctaLabel: 'Anreise ansehen', badge: 'Anreise', imageAlt: 'Straßenbahn in Krakau' },
    it: { title: 'In centro in circa 14 minuti in tram', shortDescription: 'La fermata Górnickiego è a circa 40 m dal cancello.', description: 'La fermata Górnickiego è a circa 40 m dal campeggio. Il tram 18 arriva di solito a Stary Kleparz in circa 9 fermate e 14 minuti.', ctaLabel: 'Vedi come arrivare', badge: 'Trasporto', imageAlt: 'Tram a Cracovia' },
    fr: { title: 'Environ 14 minutes vers le centre en tramway', shortDescription: 'L’arrêt Górnickiego est à environ 40 m de la porte.', description: 'L’arrêt Górnickiego est à environ 40 m du camping. Le tram 18 rejoint généralement Stary Kleparz en environ 9 arrêts et 14 minutes.', ctaLabel: 'Voir l’accès', badge: 'Accès', imageAlt: 'Tramway à Cracovie' },
    es: { title: 'Unos 14 minutos al centro en tranvía', shortDescription: 'La parada Górnickiego está a unos 40 m de la puerta.', description: 'La parada Górnickiego está a unos 40 m del camping. El tranvía 18 suele llegar a Stary Kleparz en unas 9 paradas y 14 minutos.', ctaLabel: 'Ver acceso', badge: 'Transporte', imageAlt: 'Tranvía en Cracovia' },
    nl: { title: 'In ongeveer 14 minuten met de tram naar het centrum', shortDescription: 'Tramhalte Górnickiego ligt op ca. 40 m van de poort.', description: 'Tramhalte Górnickiego ligt op ca. 40 m van de camping. Lijn 18 rijdt meestal in ca. 9 haltes en 14 minuten naar Stary Kleparz.', ctaLabel: 'Bekijk route', badge: 'Route', imageAlt: 'Tram in Krakau' },
    cs: { title: 'Do centra tramvají asi za 14 minut', shortDescription: 'Zastávka Górnickiego je asi 40 m od brány.', description: 'Zastávka Górnickiego je asi 40 m od kempu. Tramvaj 18 jede na Stary Kleparz obvykle asi 9 zastávek a 14 minut.', ctaLabel: 'Zobrazit dopravu', badge: 'Doprava', imageAlt: 'Tramvaj v Krakově' },
    sk: { title: 'Do centra električkou asi za 14 minút', shortDescription: 'Zastávka Górnickiego je asi 40 m od brány.', description: 'Zastávka Górnickiego je asi 40 m od kempu. Električka 18 ide na Stary Kleparz zvyčajne asi 9 zastávok a 14 minút.', ctaLabel: 'Zobraziť dopravu', badge: 'Doprava', imageAlt: 'Električka v Krakove' },
    sv: { title: 'Cirka 14 minuter till centrum med spårvagn', shortDescription: 'Hållplatsen Górnickiego ligger cirka 40 m från porten.', description: 'Hållplatsen Górnickiego ligger cirka 40 m från campingen. Linje 18 når Stary Kleparz på ungefär 9 hållplatser och 14 minuter.', ctaLabel: 'Se vägbeskrivning', badge: 'Transport', imageAlt: 'Spårvagn i Kraków' },
  },
  'google-maps-2022': {
    en: { title: 'Use Google Maps for arrival', shortDescription: 'The campsite access route changed in 2022.', description: 'The access route to the campsite changed in 2022. Older navigation systems may lead you incorrectly, so we recommend Google Maps.', ctaLabel: 'See directions', badge: 'Google Maps 2022', imageAlt: 'Area near the access road to Camping Clepardia' },
    de: { title: 'Für die Anreise Google Maps nutzen', shortDescription: 'Die Zufahrt zum Campingplatz wurde 2022 geändert.', description: 'Die Zufahrt zum Campingplatz wurde 2022 geändert. Ältere Navigationsgeräte können falsch führen, daher empfehlen wir Google Maps.', ctaLabel: 'Anreise ansehen', badge: 'Google Maps 2022', imageAlt: 'Umgebung der Zufahrt zu Camping Clepardia' },
    it: { title: 'Usa Google Maps per arrivare', shortDescription: 'L’accesso al camping è cambiato nel 2022.', description: 'L’accesso al camping è cambiato nel 2022. I navigatori più vecchi possono sbagliare, quindi consigliamo Google Maps.', ctaLabel: 'Vedi come arrivare', badge: 'Google Maps 2022', imageAlt: 'Zona di accesso a Camping Clepardia' },
    fr: { title: 'Utilisez Google Maps pour l’arrivée', shortDescription: 'L’accès au camping a changé en 2022.', description: 'L’accès au camping a changé en 2022. Les anciens GPS peuvent indiquer un mauvais itinéraire, nous recommandons donc Google Maps.', ctaLabel: 'Voir l’accès', badge: 'Google Maps 2022', imageAlt: 'Zone d’accès à Camping Clepardia' },
    es: { title: 'Usa Google Maps para llegar', shortDescription: 'El acceso al camping cambió en 2022.', description: 'El acceso al camping cambió en 2022. Los navegadores antiguos pueden indicar mal, por eso recomendamos Google Maps.', ctaLabel: 'Ver acceso', badge: 'Google Maps 2022', imageAlt: 'Zona de acceso a Camping Clepardia' },
    nl: { title: 'Gebruik Google Maps voor de route', shortDescription: 'De toegang tot de camping veranderde in 2022.', description: 'De toegang tot de camping veranderde in 2022. Oudere navigatie kan verkeerd sturen, daarom adviseren we Google Maps.', ctaLabel: 'Bekijk route', badge: 'Google Maps 2022', imageAlt: 'Omgeving van de toegang tot Camping Clepardia' },
    cs: { title: 'Pro příjezd použijte Google Maps', shortDescription: 'Vjezd do kempu se změnil v roce 2022.', description: 'Vjezd do kempu se změnil v roce 2022. Starší navigace může vést špatně, proto doporučujeme Google Maps.', ctaLabel: 'Zobrazit dopravu', badge: 'Google Maps 2022', imageAlt: 'Okolí příjezdu do Camping Clepardia' },
    sk: { title: 'Na príchod použite Google Maps', shortDescription: 'Vjazd do kempu sa zmenil v roku 2022.', description: 'Vjazd do kempu sa zmenil v roku 2022. Staršia navigácia môže viesť zle, preto odporúčame Google Maps.', ctaLabel: 'Zobraziť dopravu', badge: 'Google Maps 2022', imageAlt: 'Okolie príchodu do Camping Clepardia' },
    sv: { title: 'Använd Google Maps för ankomst', shortDescription: 'Infarten till campingen ändrades 2022.', description: 'Infarten till campingen ändrades 2022. Äldre navigation kan visa fel, därför rekommenderar vi Google Maps.', ctaLabel: 'Se vägbeskrivning', badge: 'Google Maps 2022', imageAlt: 'Området vid infarten till Camping Clepardia' },
  },
  'summer-camping-first-come': {
    ...Object.fromEntries((['en','de','it','fr','es','nl','cs','sk','sv'] as const).map((language) => {
      const copy = summerCampingCopy[language];
      return [language, { title: copy.title, shortDescription: copy.short, description: `${copy.message} ${copy.noon} ${copy.evening} ${copy.disclaimer}`, ctaLabel: copy.rules, badge: copy.badge, imageAlt: 'Camping Clepardia Kraków' }];
    })),
  },
  'arrival-registration-documents': {
    en: { title: 'What to prepare for check-in?', shortDescription: 'ID and vehicle registration number make registration faster.', description: 'At registration we ask for one identity document and the vehicle registration number if you arrive by car, camper, van or caravan. For a caravan, enter the caravan registration number.', ctaLabel: 'Before arrival', badge: 'Reception', imageAlt: 'Green camping area in Krakow' },
    de: { title: 'Was für den Check-in vorbereiten?', shortDescription: 'Ausweis und Kennzeichen beschleunigen die Anmeldung.', description: 'Bei der Anmeldung bitten wir um ein Ausweisdokument und das Kennzeichen, wenn Sie mit Auto, Camper, Van oder Wohnwagen kommen. Beim Wohnwagen bitte das Wohnwagenkennzeichen angeben.', ctaLabel: 'Vor der Anreise', badge: 'Rezeption', imageAlt: 'Grüne Campingfläche in Krakau' },
    it: { title: 'Cosa preparare per il check-in?', shortDescription: 'Documento e targa del veicolo velocizzano la registrazione.', description: 'Alla registrazione chiediamo un documento d’identità e la targa del veicolo se arrivi in auto, camper, van o roulotte. Per la roulotte indica la targa della roulotte.', ctaLabel: 'Prima dell’arrivo', badge: 'Reception', imageAlt: 'Area verde del camping a Cracovia' },
    fr: { title: 'Que préparer pour l’enregistrement ?', shortDescription: 'Une pièce d’identité et l’immatriculation accélèrent l’arrivée.', description: 'À l’enregistrement, nous demandons une pièce d’identité et le numéro d’immatriculation du véhicule si vous arrivez en voiture, camping-car, van ou caravane. Pour une caravane, indiquez son immatriculation.', ctaLabel: 'Avant l’arrivée', badge: 'Réception', imageAlt: 'Espace vert de camping à Cracovie' },
    es: { title: '¿Qué preparar para el check-in?', shortDescription: 'Documento de identidad y matrícula agilizan el registro.', description: 'En el registro pedimos un documento de identidad y la matrícula del vehículo si llegas en coche, autocaravana, van o caravana. Para una caravana, indica su matrícula.', ctaLabel: 'Antes de llegar', badge: 'Recepción', imageAlt: 'Zona verde de camping en Cracovia' },
    nl: { title: 'Wat voorbereiden voor check-in?', shortDescription: 'ID en kenteken maken de registratie sneller.', description: 'Bij registratie vragen we om één identiteitsbewijs en het kenteken als je met auto, camper, van of caravan komt. Geef bij een caravan ook het caravankenteken door.', ctaLabel: 'Voor aankomst', badge: 'Receptie', imageAlt: 'Groene campingruimte in Krakau' },
    cs: { title: 'Co připravit k příjezdu?', shortDescription: 'Doklad totožnosti a registrační značka urychlí registraci.', description: 'Při registraci požádáme o jeden doklad totožnosti a registrační značku vozidla, pokud přijíždíte autem, obytným vozem, vanem nebo karavanem. U karavanu uveďte registrační značku karavanu.', ctaLabel: 'Před příjezdem', badge: 'Recepce', imageAlt: 'Zelený prostor kempu v Krakově' },
    sk: { title: 'Čo pripraviť na príchod?', shortDescription: 'Doklad totožnosti a evidenčné číslo urýchlia registráciu.', description: 'Pri registrácii požiadame o jeden doklad totožnosti a evidenčné číslo vozidla, ak prichádzate autom, obytným autom, vanom alebo karavanom. Pri karavane uveďte evidenčné číslo karavanu.', ctaLabel: 'Pred príchodom', badge: 'Recepcia', imageAlt: 'Zelený priestor kempu v Krakove' },
    sv: { title: 'Vad ska förberedas för incheckning?', shortDescription: 'ID och registreringsnummer gör registreringen snabbare.', description: 'Vid registrering ber vi om en ID-handling och fordonets registreringsnummer om du kommer med bil, husbil, van eller husvagn. För husvagn anger du husvagnens registreringsnummer.', ctaLabel: 'Före ankomst', badge: 'Reception', imageAlt: 'Grön campingyta i Kraków' },
  },
  'dog-free-camping': {
    en: { title: 'Dog at the campsite free of charge', shortDescription: 'A dog costs 0 PLN.', description: 'Dogs are free of charge. Please keep them supervised, on a leash and clean up after them so every guest has a comfortable stay.', ctaLabel: 'Check prices', badge: 'Dog 0 PLN', imageAlt: 'Green trees at Camping Clepardia' },
    de: { title: 'Hund auf dem Campingplatz kostenlos', shortDescription: 'Ein Hund kostet 0 PLN.', description: 'Hunde sind kostenlos. Bitte beaufsichtigen, an der Leine führen und Hinterlassenschaften entfernen, damit alle Gäste einen angenehmen Aufenthalt haben.', ctaLabel: 'Preise prüfen', badge: 'Hund 0 PLN', imageAlt: 'Grüne Bäume auf Camping Clepardia' },
    it: { title: 'Cane in camping senza supplemento', shortDescription: 'Il cane costa 0 PLN.', description: 'Il cane è gratuito. Chiediamo solo supervisione, guinzaglio e pulizia, così il soggiorno resta piacevole per tutti.', ctaLabel: 'Controlla i prezzi', badge: 'Cane 0 PLN', imageAlt: 'Alberi verdi al Camping Clepardia' },
    fr: { title: 'Chien au camping sans supplément', shortDescription: 'Le chien coûte 0 PLN.', description: 'Le chien est gratuit. Merci de le surveiller, de le tenir en laisse et de ramasser après lui pour le confort de tous.', ctaLabel: 'Voir les tarifs', badge: 'Chien 0 PLN', imageAlt: 'Arbres verts au Camping Clepardia' },
    es: { title: 'Perro en el camping sin coste', shortDescription: 'El perro cuesta 0 PLN.', description: 'El perro es gratuito. Solo pedimos supervisión, correa y recoger sus excrementos para que todos estén cómodos.', ctaLabel: 'Ver precios', badge: 'Perro 0 PLN', imageAlt: 'Árboles verdes en Camping Clepardia' },
    nl: { title: 'Hond op de camping zonder kosten', shortDescription: 'Een hond kost 0 PLN.', description: 'Honden zijn gratis. Houd ze onder toezicht, aan de lijn en ruim op, zodat alle gasten comfortabel verblijven.', ctaLabel: 'Bekijk prijzen', badge: 'Hond 0 PLN', imageAlt: 'Groene bomen op Camping Clepardia' },
    cs: { title: 'Pes v kempu bez poplatku', shortDescription: 'Pes stojí 0 PLN.', description: 'Pes je zdarma. Prosíme jen o dohled, vodítko a úklid po psovi, aby byl pobyt pohodlný pro všechny hosty.', ctaLabel: 'Zobrazit ceny', badge: 'Pes 0 PLN', imageAlt: 'Zelené stromy v Camping Clepardia' },
    sk: { title: 'Pes v kempe bez poplatku', shortDescription: 'Pes stojí 0 PLN.', description: 'Pes je zadarmo. Prosíme len o dohľad, vôdzku a upratanie po psovi, aby bol pobyt pohodlný pre všetkých hostí.', ctaLabel: 'Zobraziť ceny', badge: 'Pes 0 PLN', imageAlt: 'Zelené stromy v Camping Clepardia' },
    sv: { title: 'Hund på campingen utan avgift', shortDescription: 'Hund kostar 0 PLN.', description: 'Hundar är kostnadsfria. Håll dem under uppsikt, i koppel och plocka upp efter dem så att alla gäster får en bekväm vistelse.', ctaLabel: 'Se priser', badge: 'Hund 0 PLN', imageAlt: 'Gröna träd på Camping Clepardia' },
  },
  'three-night-plan': {
    en: { title: 'Stay 3 nights and see more', shortDescription: 'Krakow plus one larger trip is a good travel rhythm.', description: 'With 3 nights you can calmly combine Krakow with one larger trip, for example Wieliczka or Auschwitz-Birkenau. The planner suggests what fits without rushing.', ctaLabel: 'Open planner', badge: '3-day plan', imageAlt: 'Wieliczka as a trip idea from Krakow' },
    de: { title: '3 Nächte bleiben und mehr sehen', shortDescription: 'Krakau plus ein größerer Ausflug ist ein guter Rhythmus.', description: 'Bei 3 Nächten können Sie Krakau ruhig mit einem größeren Ausflug verbinden, z. B. Wieliczka oder Auschwitz-Birkenau. Der Planer zeigt, was ohne Hetze passt.', ctaLabel: 'Planer öffnen', badge: '3-Tage-Plan', imageAlt: 'Wieliczka als Ausflugsidee ab Krakau' },
    it: { title: 'Resta 3 notti e vedi di più', shortDescription: 'Cracovia più una gita più grande è un buon ritmo.', description: 'Con 3 notti puoi combinare Cracovia con una gita più grande, per esempio Wieliczka o Auschwitz-Birkenau. Il planner suggerisce cosa entra senza fretta.', ctaLabel: 'Apri il planner', badge: 'Piano 3 giorni', imageAlt: 'Wieliczka come idea di gita da Cracovia' },
    fr: { title: 'Restez 3 nuits et voyez davantage', shortDescription: 'Cracovie plus une grande excursion : un bon rythme.', description: 'Avec 3 nuits, vous pouvez combiner tranquillement Cracovie avec une grande excursion, par exemple Wieliczka ou Auschwitz-Birkenau. Le planificateur propose un rythme sans course.', ctaLabel: 'Ouvrir le planificateur', badge: 'Plan 3 jours', imageAlt: 'Wieliczka comme idée d’excursion depuis Cracovie' },
    es: { title: 'Quédate 3 noches y ve más', shortDescription: 'Cracovia más una excursión grande es un buen ritmo.', description: 'Con 3 noches puedes combinar Cracovia con una excursión grande, por ejemplo Wieliczka o Auschwitz-Birkenau. El planificador sugiere qué encaja sin prisas.', ctaLabel: 'Abrir planificador', badge: 'Plan 3 días', imageAlt: 'Wieliczka como excursión desde Cracovia' },
    nl: { title: 'Blijf 3 nachten en zie meer', shortDescription: 'Krakau plus één grotere uitstap is een prettig tempo.', description: 'Met 3 nachten combineer je Krakau rustig met één grotere uitstap, bijvoorbeeld Wieliczka of Auschwitz-Birkenau. De planner laat zien wat past zonder haast.', ctaLabel: 'Open planner', badge: 'Plan 3 dagen', imageAlt: 'Wieliczka als uitstap vanuit Krakau' },
    cs: { title: 'Zůstaňte 3 noci a uvidíte víc', shortDescription: 'Krakov plus jeden větší výlet je dobrý rytmus.', description: 'Při 3 nocích můžete klidně spojit Krakov s jedním větším výletem, například Wieliczkou nebo Auschwitz-Birkenau. Plánovač poradí, co se vejde bez spěchu.', ctaLabel: 'Otevřít plánovač', badge: 'Plán 3 dny', imageAlt: 'Wieliczka jako tip na výlet z Krakova' },
    sk: { title: 'Zostaňte 3 noci a uvidíte viac', shortDescription: 'Krakov plus jeden väčší výlet je dobrý rytmus.', description: 'Pri 3 nociach môžete pokojne spojiť Krakov s jedným väčším výletom, napríklad Wieliczkou alebo Auschwitz-Birkenau. Plánovač poradí, čo sa zmestí bez zhonu.', ctaLabel: 'Otvoriť plánovač', badge: 'Plán 3 dni', imageAlt: 'Wieliczka ako tip na výlet z Krakova' },
    sv: { title: 'Stanna 3 nätter och se mer', shortDescription: 'Kraków plus en större utflykt är en bra rytm.', description: 'Med 3 nätter kan du lugnt kombinera Kraków med en större utflykt, till exempel Wieliczka eller Auschwitz-Birkenau. Planeraren visar vad som ryms utan stress.', ctaLabel: 'Öppna planeraren', badge: '3-dagars plan', imageAlt: 'Wieliczka som utflyktsidé från Kraków' },
  },
};

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
  const normalizedLanguage = (noticeLanguages.includes(language as SiteNoticeLanguage) ? language : 'en') as SiteNoticeLanguage;
  const translation = normalizedLanguage === 'pl'
    ? notice.translations?.pl
    : (notice.translations?.[normalizedLanguage] ?? noticeCopyOverrides[notice.id]?.[normalizedLanguage] ?? notice.translations?.en);

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
