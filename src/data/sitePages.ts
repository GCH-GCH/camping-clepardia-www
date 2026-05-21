export const pageSlugs = [
  'camping',
  'domki',
  'cennik',
  'dojazd',
  'atrakcje',
  'kontakt',
  'faq',
  'galeria',
  'dla-kamperow',
  'dla-rodzin',
  'regulamin',
  'polityka-prywatnosci',
] as const;

export type PageSlug = typeof pageSlugs[number];

export interface SitePage {
  slug: PageSlug;
  overline: string;
  title: string;
  lead: string;
  seoTitle: string;
  seoDescription: string;
  highlights: Array<{
    title: string;
    copy: string;
  }>;
  cta: {
    title: string;
    copy: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
}

export const sitePages: Record<PageSlug, SitePage> = {
  camping: {
    slug: 'camping',
    overline: 'Camping w Krakowie',
    title: 'Miejsca dla kamperów, przyczep, vanów i namiotów',
    lead: 'Zielona baza w Krakowie dla podróżujących po mieście i Małopolsce własnym tempem.',
    seoTitle: 'Camping w Krakowie — kampery, namioty i przyczepy | Camping Clepardia',
    seoDescription: 'Camping Clepardia w Krakowie — miejsca dla kamperów, vanów, przyczep i namiotów blisko centrum oraz szybki dojazd tramwajem.',
    highlights: [
      { title: 'Kampery i vany', copy: 'Praktyczna przestrzeń dla osób podróżujących kamperem, vanem lub autem turystycznym.' },
      { title: 'Przyczepy i namioty', copy: 'Miejsca pod klasyczny camping z dostępem do podstawowego zaplecza.' },
      { title: 'Blisko komunikacji', copy: 'Wygodny dojazd tramwajem do Starego Miasta bez szukania parkingu w centrum.' },
      { title: 'Płyty betonowe i asfalt', copy: 'Miejsca dla kamperów są głównie na płytach betonowych, a busy, trucki, autobusy i ciężkie pojazdy ustawiamy na asfalcie z możliwością wyjścia na trawę.' },
    ],
    cta: {
      title: 'Zaplanuj pobyt campingowy',
      copy: 'Sprawdź cennik albo wyślij zapytanie do recepcji Camping Clepardia.',
      primaryLabel: 'Sprawdź dostępność',
      primaryHref: '/kontakt',
      secondaryLabel: 'Zobacz cennik',
      secondaryHref: '/cennik',
    },
  },
  domki: {
    slug: 'domki',
    overline: 'Domki Camping Clepardia',
    title: 'Wygodny nocleg w Krakowie bez własnego sprzętu',
    lead: 'Domki dla gości, którzy chcą zostać blisko centrum, ale wolą spokojniejszą, zieloną przestrzeń.',
    seoTitle: 'Domki Camping Clepardia — nocleg w Krakowie',
    seoDescription: 'Domki Camping Clepardia w Krakowie — spokojna lokalizacja, blisko centrum miasta i wygodny dojazd tramwajem.',
    highlights: [
      { title: 'Dla par i rodzin', copy: 'Praktyczne rozwiązanie po intensywnym dniu zwiedzania Krakowa.' },
      { title: 'Campingowy klimat', copy: 'Więcej swobody niż w typowym hotelu i zielona przestrzeń wokół.' },
      { title: 'Sezonowa dostępność', copy: 'Rezerwacje domków są zależne od sezonu i aktualnej dostępności.' },
    ],
    cta: {
      title: 'Wybierz domek i potwierdź dostępność',
      copy: 'Sprawdź orientacyjne ceny, a następnie wyślij zapytanie do recepcji w sprawie wybranego terminu.',
      primaryLabel: 'Sprawdź cennik',
      primaryHref: '/cennik',
      secondaryLabel: 'Zapytaj o domek',
      secondaryHref: '/kontakt',
    },
  },
  cennik: {
    slug: 'cennik',
    overline: 'Cennik Camping Clepardia',
    title: 'Sprawdź orientacyjny koszt pobytu',
    lead: 'Wybierz termin, typ pobytu i dodatki - kalkulator pokaże orientacyjną cenę przed wysłaniem zapytania.',
    seoTitle: 'Cennik Camping Clepardia — kampery, namioty i domki',
    seoDescription: 'Sprawdź orientacyjne ceny pobytu na Camping Clepardia w Krakowie. Kalkulator kosztów dla kamperów, namiotów, przyczep i domków.',
    highlights: [
      { title: 'Cena orientacyjna', copy: 'Ceny są orientacyjne i mogą wymagać potwierdzenia przez recepcję.' },
      { title: 'Sezon letni', copy: 'Rezerwacje pola campingowego w sezonie letnim mogą być ograniczone.' },
      { title: 'Domki sezonowe', copy: 'Domki mają osobne ceny dla sezonu niskiego i wysokiego.' },
      { title: 'Dostępność', copy: 'Finalna dostępność jest potwierdzana przez recepcję.' },
    ],
    cta: {
      title: 'Potwierdź termin z recepcją',
      copy: 'Kalkulator pomaga szybko oszacować pobyt. Finalną dostępność i szczegóły rezerwacji potwierdza recepcja.',
      primaryLabel: 'Zapytaj o dostępność',
      primaryHref: '/kontakt',
      secondaryLabel: 'Zobacz domki',
      secondaryHref: '/domki',
    },
  },
  dojazd: {
    slug: 'dojazd',
    overline: 'Dojazd do Camping Clepardia',
    title: 'Zostaw auto lub kampera i jedź tramwajem do centrum',
    lead: 'Camping Clepardia znajduje się w Krakowie przy ul. Henryka Pachońskiego 28A. Do centrum miasta najwygodniej dojechać tramwajem.',
    seoTitle: 'Dojazd do Camping Clepardia — Kraków',
    seoDescription: 'Sprawdź, jak dojechać do Camping Clepardia i jak wygodnie dostać się tramwajem do centrum Krakowa.',
    highlights: [
      { title: 'Adres', copy: 'Henryka Pachońskiego 28A, 31-322 Kraków.' },
      { title: 'Tramwaj blisko campingu', copy: 'Najwygodniejszy sposób dojazdu do centrum miasta.' },
      { title: 'Stare Miasto', copy: 'Szybki dojazd w okolice Starego Kleparza i centrum.' },
      { title: 'Baza w Krakowie', copy: 'Wygodna baza do zwiedzania Krakowa bez parkowania w ścisłym centrum.' },
    ],
    cta: {
      title: 'Przyjedź wygodnie',
      copy: 'Sprawdź cennik i zaplanuj pobyt z prostym dojazdem do centrum.',
      primaryLabel: 'Zobacz cennik',
      primaryHref: '/cennik',
      secondaryLabel: 'Kontakt',
      secondaryHref: '/kontakt',
    },
  },
  atrakcje: {
    slug: 'atrakcje',
    overline: 'Atrakcje w okolicy',
    title: 'Zwiedzaj Kraków i Małopolskę z Camping Clepardia',
    lead: 'Zatrzymaj się w zielonej części Krakowa i wygodnie ruszaj do centrum miasta, Wieliczki, Ojcowa, Energylandii i innych miejsc regionu.',
    seoTitle: 'Atrakcje w Krakowie i Małopolsce — Camping Clepardia',
    seoDescription: 'Zobacz atrakcje w Krakowie i Małopolsce blisko Camping Clepardia: Stare Miasto, Wieliczka, Energylandia, Ojców i rodzinne wycieczki.',
    highlights: [
      { title: 'Kraków bez parkowania', copy: 'Auto, kamper lub przyczepa mogą zostać na campingu, a centrum jest dostępne tramwajem.' },
      { title: 'Małopolska w zasięgu', copy: 'Wieliczka, Ojców, Energylandia i Zakopane są wygodne do zaplanowania jako wycieczki z Krakowa.' },
      { title: 'Plan pobytu', copy: 'Jedna baza pozwala połączyć zwiedzanie miasta, historię, naturę i rodzinne atrakcje.' },
    ],
    cta: {
      title: 'Zaplanuj pobyt w Krakowie z Camping Clepardia',
      copy: 'Sprawdź cennik, zapytaj o dostępność i zobacz, jak wygodnie dojechać do centrum.',
      primaryLabel: 'Sprawdź cennik',
      primaryHref: '/cennik',
      secondaryLabel: 'Jak dojechać',
      secondaryHref: '/dojazd',
    },
  },
  kontakt: {
    slug: 'kontakt',
    overline: 'Kontakt i rezerwacje',
    title: 'Zapytaj o dostępność pobytu',
    lead: 'Napisz, kiedy chcesz przyjechać - recepcja Camping Clepardia potwierdzi dostępność i szczegóły pobytu.',
    seoTitle: 'Kontakt i rezerwacje — Camping Clepardia Kraków',
    seoDescription: 'Skontaktuj się z recepcją Camping Clepardia w Krakowie. Zapytaj o dostępność miejsca campingowego, domku, ceny i szczegóły pobytu.',
    highlights: [
      { title: 'Sezon letni', copy: 'W czerwcu, lipcu i sierpniu rezerwacje pola campingowego mogą być ograniczone.' },
      { title: 'Domki', copy: 'Domki mają osobną dostępność.' },
      { title: 'Potwierdzenie', copy: 'Finalną cenę i dostępność potwierdza recepcja.' },
      { title: 'Najszybszy kontakt', copy: 'Najszybszy kontakt: telefon lub email.' },
      { title: 'Google Maps', copy: 'Do nawigacji zalecamy Google Maps, bo wjazd / trasa dojazdu zmieniła się w 2022 roku.' },
    ],
    cta: {
      title: 'Napisz do recepcji',
      copy: 'Wypełnij formularz albo skorzystaj z kontaktu telefonicznego i mailowego.',
      primaryLabel: 'Cennik',
      primaryHref: '/cennik',
      secondaryLabel: 'Camping',
      secondaryHref: '/camping',
    },
  },
  faq: {
    slug: 'faq',
    overline: 'FAQ',
    title: 'Najczęściej zadawane pytania',
    lead: 'Zebraliśmy najważniejsze informacje o pobycie, rezerwacjach, cenach, dojeździe i zasadach na Camping Clepardia.',
    seoTitle: 'FAQ Camping Clepardia — pytania i odpowiedzi',
    seoDescription: 'Najczęściej zadawane pytania o Camping Clepardia: rezerwacje, cennik, check-in, domki, camping, dojazd, psy i udogodnienia.',
    highlights: [
      { title: 'Dostępność miejsc', copy: 'W sezonie warto potwierdzić dostępność pola campingowego z recepcją.' },
      { title: 'Dojazd do centrum', copy: 'Najwygodniej korzystać z tramwaju i zostawić auto na campingu.' },
      { title: 'Pobyt z psem', copy: 'Pies ma stawkę 0 PLN, ale szczegóły pobytu warto potwierdzić przed przyjazdem.' },
    ],
    cta: {
      title: 'Masz inne pytanie?',
      copy: 'Sprawdź cennik albo skontaktuj się z recepcją i opisz plan pobytu.',
      primaryLabel: 'Sprawdź cennik',
      primaryHref: '/cennik',
      secondaryLabel: 'Zapytaj recepcję',
      secondaryHref: '/kontakt',
    },
  },
  galeria: {
    slug: 'galeria',
    overline: 'Galeria',
    title: 'Zobacz Camping Clepardia',
    lead: 'Zdjęcia campingu, domków, okolicy i udogodnień dla gości.',
    seoTitle: 'Galeria Camping Clepardia — zdjęcia campingu i domków',
    seoDescription: 'Zobacz galerię Camping Clepardia w Krakowie: camping, domki, sanitariaty, dojazd, okolica i atrakcje dla gości.',
    highlights: [
      { title: 'Camping', copy: 'Miejsce na zdjęcia pól, kamperów, namiotów i infrastruktury.' },
      { title: 'Domki', copy: 'Miejsce na zdjęcia zewnętrzne, wnętrza oraz domki 2-, 3- i 4-osobowe.' },
      { title: 'Kraków', copy: 'Miejsce na zdjęcia dojazdu, okolicy i atrakcji regionu.' },
    ],
    cta: {
      title: 'Zobacz miejsce i zapytaj o dostępność',
      copy: 'Sprawdź orientacyjne ceny albo wyślij zapytanie do recepcji Camping Clepardia.',
      primaryLabel: 'Sprawdź cennik',
      primaryHref: '/cennik',
      secondaryLabel: 'Zapytaj o dostępność',
      secondaryHref: '/kontakt',
    },
  },
  'dla-kamperow': {
    slug: 'dla-kamperow',
    overline: 'Dla kamperów',
    title: 'Camping w Krakowie dla kamperów, vanów i przyczep',
    lead: 'Zatrzymaj się w zielonej części Krakowa, zostaw pojazd na campingu i wygodnie ruszaj tramwajem do centrum.',
    seoTitle: 'Camping dla kamperów w Krakowie — Camping Clepardia',
    seoDescription: 'Miejsca dla kamperów, vanów i przyczep w Krakowie. Camping Clepardia blisko centrum miasta.',
    highlights: [
      { title: 'Blisko Krakowa', copy: 'Wygodna baza do zwiedzania miasta bez parkowania przy Starym Mieście.' },
      { title: 'Dla różnych pojazdów', copy: 'Miejsce dla kamperów, vanów, przyczep oraz aut z namiotem dachowym.' },
      { title: 'Prąd i zaplecze', copy: 'Podłączenie prądu, sanitariaty i praktyczne udogodnienia na miejscu.' },
      { title: 'Transport do centrum', copy: 'Najwygodniej zostawić pojazd na campingu i dojechać do centrum tramwajem.' },
    ],
    cta: {
      title: 'Oblicz koszt postoju kamperem',
      copy: 'Sprawdź orientacyjny koszt pobytu i skontaktuj się z recepcją w sprawie dostępności w wybranym terminie.',
      primaryLabel: 'Oblicz koszt pobytu',
      primaryHref: '/cennik',
      secondaryLabel: 'Zapytaj o dostępność',
      secondaryHref: '/kontakt',
    },
  },
  'dla-rodzin': {
    slug: 'dla-rodzin',
    overline: 'Dla rodzin',
    title: 'Rodzinny pobyt w Krakowie z campingowym klimatem',
    lead: 'Camping Clepardia to wygodna baza dla rodzin, które chcą zwiedzać Kraków i odpocząć w spokojniejszej, zielonej przestrzeni.',
    seoTitle: 'Camping dla rodzin w Krakowie — Camping Clepardia',
    seoDescription: 'Rodzinny pobyt w Krakowie z campingowym klimatem. Domki, camping, zielona przestrzeń i wygodny dojazd do centrum oraz atrakcji Małopolski.',
    highlights: [
      { title: 'Blisko centrum Krakowa', copy: 'Łatwy dojazd tramwajem do centrum bez stresu z parkowaniem przy Starym Mieście.' },
      { title: 'Zielona przestrzeń', copy: 'Po dniu zwiedzania można wrócić w spokojniejsze miejsce poza ścisłym centrum.' },
      { title: 'Domki 3- i 4-osobowe', copy: 'Praktyczna opcja dla rodzin, które nie podróżują kamperem ani namiotem.' },
      { title: 'Baza do wycieczek', copy: 'Dobry start do Wieliczki, Energylandii, Ojcowa i innych atrakcji Małopolski.' },
    ],
    cta: {
      title: 'Zaplanuj rodzinny pobyt w Krakowie',
      copy: 'Sprawdź cennik, zapytaj o dostępność i zobacz atrakcje, które łatwo zaplanować z Camping Clepardia.',
      primaryLabel: 'Sprawdź cennik',
      primaryHref: '/cennik',
      secondaryLabel: 'Zapytaj o dostępność',
      secondaryHref: '/kontakt',
    },
  },
  regulamin: {
    slug: 'regulamin',
    overline: 'Regulamin',
    title: 'Zasady pobytu na Camping Clepardia',
    lead: 'Najważniejsze informacje o ciszy nocnej, przyjeździe, rejestracji, domkach, miejscach campingowych i zasadach bezpieczeństwa.',
    seoTitle: 'Regulamin Camping Clepardia — zasady pobytu',
    seoDescription: 'Sprawdź zasady pobytu na Camping Clepardia: cisza nocna, przyjazd, rejestracja, domki, miejsca campingowe, prąd, psy i faktury.',
    highlights: [
      { title: 'Nieimprezowy charakter', copy: 'Camping Clepardia jest miejscem spokojnego pobytu. Cisza nocna obowiązuje od 22:00 do 07:00.' },
      { title: 'Przyjazd i rejestracja', copy: 'Po przyjeździe zatrzymaj się przy recepcji lub parkingu. Obsługa wskaże miejsce i przeprowadzi rejestrację.' },
      { title: 'Dostępność potwierdza recepcja', copy: 'Kalkulator pokazuje cenę orientacyjną, a finalną dostępność potwierdza recepcja.' },
    ],
    cta: {
      title: 'Masz pytanie o zasady pobytu?',
      copy: 'Skontaktuj się z recepcją Camping Clepardia przed przyjazdem.',
      primaryLabel: 'Zapytaj recepcję',
      primaryHref: '/kontakt',
      secondaryLabel: 'Sprawdź FAQ',
      secondaryHref: '/faq',
    },
  },
  'polityka-prywatnosci': {
    slug: 'polityka-prywatnosci',
    overline: 'Polityka prywatności',
    title: 'Jak przetwarzamy dane z formularza',
    lead: 'Bezpieczny draft informacji prywatności dla zapytań wysyłanych przez stronę Camping Clepardia.',
    seoTitle: 'Polityka prywatności — Camping Clepardia',
    seoDescription: 'Polityka prywatności Camping Clepardia: dane z formularza, cel kontaktu, email recepcji, cookies i informacje do uzupełnienia przed publikacją.',
    highlights: [
      { title: 'Dane z formularza', copy: 'Dane są używane do odpowiedzi na zapytanie o pobyt i dostępność.' },
      { title: 'Kontakt z recepcją', copy: 'W sprawach danych i zapytań użyj adresu clepardia@gmail.com.' },
      { title: 'Draft do uzupełnienia', copy: 'Pełne dane administratora wymagają potwierdzenia przed publikacją produkcyjną.' },
    ],
    cta: {
      title: 'Potrzebujesz kontaktu z recepcją?',
      copy: 'Napisz lub zadzwoń do Camping Clepardia.',
      primaryLabel: 'Kontakt',
      primaryHref: '/kontakt',
      secondaryLabel: 'FAQ',
      secondaryHref: '/faq',
    },
  },
};

export const getPageBySlug = (slug: string) => sitePages[slug as PageSlug];
