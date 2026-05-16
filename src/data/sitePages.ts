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
    seoTitle: 'Camping w Krakowie | Camping Clepardia',
    seoDescription: 'Camping Clepardia: miejsca dla kamperów, vanów, przyczep i namiotów blisko centrum Krakowa.',
    highlights: [
      { title: 'Kampery i vany', copy: 'Praktyczna przestrzeń dla osób podróżujących kamperem, vanem lub autem turystycznym.' },
      { title: 'Przyczepy i namioty', copy: 'Miejsca pod klasyczny camping z dostępem do podstawowego zaplecza.' },
      { title: 'Blisko komunikacji', copy: 'Wygodny dojazd tramwajem do Starego Miasta bez szukania parkingu w centrum.' },
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
    seoTitle: 'Domki w Krakowie | Camping Clepardia',
    seoDescription: 'Domki Camping Clepardia: wygodny nocleg blisko centrum Krakowa i komunikacji miejskiej.',
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
    overline: 'Cennik i kalkulator',
    title: 'Oblicz orientacyjny koszt pobytu',
    lead: 'Wybierz daty, typ pobytu, liczbę osób i dodatki, a kalkulator przygotuje czytelne podsumowanie.',
    seoTitle: 'Cennik Camping Clepardia | Kalkulator pobytu',
    seoDescription: 'Cennik Camping Clepardia z kalkulatorem kosztu pobytu dla campingu i domków.',
    highlights: [
      { title: 'Szybka kalkulacja', copy: 'Automatyczne liczenie liczby nocy, osób i dodatków bez arkuszy i notatek.' },
      { title: 'Sezonowość domków', copy: 'Domki 2-, 3- i 4-osobowe mają osobne stawki dla niskiego i wysokiego sezonu.' },
      { title: 'Breakdown pozycji', copy: 'Podsumowanie pokazuje każdą linię kosztów i sumę końcową.' },
    ],
    cta: {
      title: 'Potwierdź cenę w recepcji',
      copy: 'Kalkulator pomaga szybko oszacować pobyt. Finalna dostępność i szczegóły rezerwacji są potwierdzane przez recepcję.',
      primaryLabel: 'Skontaktuj się',
      primaryHref: '/kontakt',
      secondaryLabel: 'Dojazd',
      secondaryHref: '/dojazd',
    },
  },
  dojazd: {
    slug: 'dojazd',
    overline: 'Dojazd do centrum',
    title: 'Zostaw auto na campingu i jedź tramwajem do Krakowa',
    lead: 'Clepardia jest wygodną bazą dla gości, którzy chcą zwiedzać miasto bez parkowania w ścisłym centrum.',
    seoTitle: 'Dojazd do Camping Clepardia | Kraków',
    seoDescription: 'Informacje o dojeździe do Camping Clepardia i komunikacji miejskiej do centrum Krakowa.',
    highlights: [
      { title: 'Tramwaj do centrum', copy: 'Szybki przejazd do Starego Miasta i najważniejszych punktów miasta.' },
      { title: 'Mniej stresu z autem', copy: 'Auto zostaje na campingu, a zwiedzanie odbywa się komunikacją miejską.' },
      { title: 'Aplikacje i bilety', copy: 'Trasę możesz sprawdzić w mapach lub aplikacji JakDojade.' },
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
    overline: 'Kraków i Małopolska',
    title: 'Atrakcje w zasięgu jednego pobytu',
    lead: 'Camping Clepardia jest dobrą bazą do zwiedzania Krakowa, Wieliczki, Ojcowa i innych miejsc regionu.',
    seoTitle: 'Atrakcje w Krakowie i Małopolsce | Camping Clepardia',
    seoDescription: 'Pomysły na zwiedzanie Krakowa i Małopolski podczas pobytu w Camping Clepardia.',
    highlights: [
      { title: 'Stare Miasto i Kazimierz', copy: 'Klasyczne punkty zwiedzania Krakowa dostępne komunikacją miejską.' },
      { title: 'Wieliczka i Ojców', copy: 'Dobre kierunki na jednodniowe wyjazdy z bazy w Krakowie.' },
      { title: 'Rodzinne atrakcje', copy: 'Energylandia i inne miejsca regionu są wygodne do zaplanowania autem.' },
    ],
    cta: {
      title: 'Zbuduj plan zwiedzania',
      copy: 'Zarezerwuj bazę w Krakowie i ruszaj w miasto oraz Małopolskę.',
      primaryLabel: 'Sprawdź dostępność',
      primaryHref: '/kontakt',
      secondaryLabel: 'Dojazd',
      secondaryHref: '/dojazd',
    },
  },
  kontakt: {
    slug: 'kontakt',
    overline: 'Kontakt z recepcją',
    title: 'Zapytaj o dostępność i warunki pobytu',
    lead: 'Recepcja pomoże potwierdzić termin, typ pobytu i szczegóły rezerwacji.',
    seoTitle: 'Kontakt | Camping Clepardia',
    seoDescription: 'Kontakt z Camping Clepardia w Krakowie w sprawie campingu, domków i rezerwacji.',
    highlights: [
      { title: 'Zapytania rezerwacyjne', copy: 'Podaj termin, liczbę osób i typ pobytu, żeby przyspieszyć odpowiedź.' },
      { title: 'Informacje praktyczne', copy: 'Recepcja odpowie na pytania o dojazd, dostępność i zaplecze.' },
      { title: 'Pobyt w Krakowie', copy: 'Dobierz najlepszą bazę do planu zwiedzania miasta i regionu.' },
    ],
    cta: {
      title: 'Napisz do recepcji',
      copy: 'W kolejnych etapach formularz zostanie podpięty pod system rezerwacyjny.',
      primaryLabel: 'Cennik',
      primaryHref: '/cennik',
      secondaryLabel: 'Camping',
      secondaryHref: '/camping',
    },
  },
  faq: {
    slug: 'faq',
    overline: 'Najczęstsze pytania',
    title: 'Praktyczne odpowiedzi przed przyjazdem',
    lead: 'Zebraliśmy tematy, które najczęściej pojawiają się przy planowaniu pobytu na campingu.',
    seoTitle: 'FAQ | Camping Clepardia',
    seoDescription: 'Najczęstsze pytania o pobyt, dojazd, camping i domki w Camping Clepardia.',
    highlights: [
      { title: 'Dostępność miejsc', copy: 'W sezonie warto potwierdzić dostępność pola campingowego z recepcją.' },
      { title: 'Dojazd do centrum', copy: 'Najwygodniej korzystać z tramwaju i zostawić auto na campingu.' },
      { title: 'Pobyt z psem', copy: 'Pies ma stawkę 0 PLN, ale szczegóły pobytu warto potwierdzić przed przyjazdem.' },
    ],
    cta: {
      title: 'Masz inne pytanie?',
      copy: 'Skontaktuj się z recepcją i opisz plan pobytu.',
      primaryLabel: 'Kontakt',
      primaryHref: '/kontakt',
      secondaryLabel: 'Cennik',
      secondaryHref: '/cennik',
    },
  },
  galeria: {
    slug: 'galeria',
    overline: 'Galeria',
    title: 'Miejsca na zdjęcia campingu, domków i okolicy',
    lead: 'Galeria jest przygotowana pod rozbudowę o realne zdjęcia obiektu, sekcji campingowej i domków.',
    seoTitle: 'Galeria | Camping Clepardia',
    seoDescription: 'Galeria Camping Clepardia przygotowana pod zdjęcia campingu, domków i okolicy.',
    highlights: [
      { title: 'Camping', copy: 'Miejsce na zdjęcia pól, kamperów, namiotów i infrastruktury.' },
      { title: 'Domki', copy: 'Miejsce na zdjęcia zewnętrzne, wnętrza i tarasy domków.' },
      { title: 'Kraków', copy: 'Miejsce na zdjęcia dojazdu, okolicy i atrakcji regionu.' },
    ],
    cta: {
      title: 'Zobacz ofertę pobytu',
      copy: 'Galeria będzie rozwijana razem z systemem assetów strony.',
      primaryLabel: 'Camping',
      primaryHref: '/camping',
      secondaryLabel: 'Domki',
      secondaryHref: '/domki',
    },
  },
  'dla-kamperow': {
    slug: 'dla-kamperow',
    overline: 'Dla kamperów',
    title: 'Wygodna baza kamperowa w Krakowie',
    lead: 'Przestrzeń dla osób podróżujących kamperem, vanem albo autem z zabudową turystyczną.',
    seoTitle: 'Dla kamperów | Camping Clepardia',
    seoDescription: 'Informacje dla podróżujących kamperem, vanem lub autem z namiotem dachowym do Camping Clepardia.',
    highlights: [
      { title: 'Kampery i vany', copy: 'Czytelna oferta dla gości, którzy podróżują mobilnie po Europie.' },
      { title: 'Prąd i zaplecze', copy: 'Podstawowe udogodnienia potrzebne podczas postoju w mieście.' },
      { title: 'Kraków bez parkowania', copy: 'Wygodny dojazd tramwajem do centrum po zostawieniu auta na campingu.' },
    ],
    cta: {
      title: 'Sprawdź koszt postoju',
      copy: 'Użyj kalkulatora i skontaktuj się z recepcją w sprawie dostępności.',
      primaryLabel: 'Kalkulator cennika',
      primaryHref: '/cennik',
      secondaryLabel: 'Kontakt',
      secondaryHref: '/kontakt',
    },
  },
  'dla-rodzin': {
    slug: 'dla-rodzin',
    overline: 'Dla rodzin',
    title: 'Spokojna baza rodzinna do zwiedzania Krakowa',
    lead: 'Camping Clepardia łączy zieloną przestrzeń, domki i wygodny dojazd do atrakcji miasta.',
    seoTitle: 'Dla rodzin | Camping Clepardia',
    seoDescription: 'Camping Clepardia jako baza dla rodzin zwiedzających Kraków i Małopolskę.',
    highlights: [
      { title: 'Domki i camping', copy: 'Możesz wybrać domki albo klasyczny pobyt z własnym sprzętem.' },
      { title: 'Atrakcje regionu', copy: 'Kraków, Wieliczka, Ojców i rodzinne atrakcje są łatwe do zaplanowania.' },
      { title: 'Mniej logistyki', copy: 'Auto może zostać na campingu, a centrum jest dostępne komunikacją miejską.' },
    ],
    cta: {
      title: 'Zaplanuj rodzinny pobyt',
      copy: 'Sprawdź kalkulator i wyślij zapytanie do recepcji.',
      primaryLabel: 'Cennik',
      primaryHref: '/cennik',
      secondaryLabel: 'Kontakt',
      secondaryHref: '/kontakt',
    },
  },
};

export const getPageBySlug = (slug: string) => sitePages[slug as PageSlug];
