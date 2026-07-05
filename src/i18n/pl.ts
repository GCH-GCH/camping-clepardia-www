import { homeSeo } from '@/data/seo';
import { sitePages } from '@/data/sitePages';
import { en } from './en';

export const pl = {
  ...en,
  seo: {
    home: homeSeo,
  },
  nav: {
    aria: 'Główna nawigacja Camping Clepardia',
    homeAria: 'Wróć na stronę główną Camping Clepardia',
    changeLanguage: 'Zmień język',
    languageList: 'Lista języków',
    changeTheme: 'Zmień motyw strony',
    openMenu: 'Otwórz menu',
    closeMenu: 'Zamknij menu',
    mobileMenu: 'Menu mobilne Camping Clepardia',
    chooseLanguage: 'Wybór języka',
    lightMode: 'Tryb jasny',
    darkMode: 'Tryb ciemny',
    enableLight: 'Włącz tryb jasny',
    enableDark: 'Włącz tryb ciemny',
    cta: 'Zarezerwuj',
    items: {
      start: 'Start',
      camping: 'Camping',
      domki: 'Domki',
      cennik: 'Cennik',
      dojazd: 'Dojazd',
      atrakcje: 'Atrakcje',
      galeria: 'Galeria',
      kontakt: 'Kontakt',
    },
  },
  footer: {
    description:
      'Camping Clepardia — camping i domki w Krakowie blisko centrum miasta.',
    languages: 'Wersje językowe',
    quickLinks: 'Szybkie linki',
    contact: 'Kontakt',
    contactPlace: 'Camping Clepardia<br />Henryka Pachońskiego 28A<br />31-322 Kraków',
    phoneLabel: 'Telefon',
    emailLabel: 'Email',
    addressLabel: 'Adres',
    receptionHoursLabel: 'Godziny recepcji',
    mapsLabel: 'Otwórz w Google Maps',
    reception: '9:00–21:00',
    social: 'Social media',
    rights: 'Wszystkie prawa zastrzeżone.',
    bookingReady: 'Strona Camping Clepardia — informacje, cennik i zapytania o dostępność.',
  },
  loader: {
    messages: [
      'Ładujemy Camping Clepardia',
      'Przygotowujemy zieloną bazę w Krakowie',
      'Otwieramy bramę campingu',
    ],
  },
  global: {
    scrollToTop: 'Wróć na początek strony',
    nextStep: 'Następny krok',
  },
  cta: {
    pricing: 'Sprawdź cennik',
    availability: 'Zapytaj o dostępność',
    gallery: 'Zobacz galerię',
    bungalows: 'Zobacz domki',
    directions: 'Jak dojechać',
    contact: 'Kontakt',
    contactReception: 'Zapytaj recepcję',
    maps: 'Otwórz w Google Maps',
    camperCost: 'Oblicz koszt pobytu',
  },
  toursBooking: {
    reserve: 'Zarezerwuj',
    reserveTitle: 'Zarezerwuj wycieczkę z Krakowa',
    reserveDescription:
      'Sprawdź aktualne wycieczki, dostępność i szczegóły rezerwacji. Camping Clepardia to wygodna baza wypadowa do zwiedzania Krakowa i Małopolski.',
    sellingText:
      'Wybierz gotową wycieczkę, a po dniu zwiedzania wróć odpocząć w spokojnej, zielonej bazie Camping Clepardia.',
    chips: {
      transport: 'Transport z campingu',
      guides: 'Lokalni przewodnicy',
      popular: 'Najpopularniejsze atrakcje',
      return: 'Spokojny powrót na camping',
    },
  },
  chat: {
    open: 'Otwórz pomocnika CAMPY',
    close: 'Zamknij chat',
    title: 'CAMPY — pomocnik Camping Clepardia',
    status: 'Gotowy do pomocy',
    intro:
      'Cześć! 👋 Jestem CAMPY, Twój pomocnik Camping Clepardia. Pomogę Ci szybko znaleźć informacje o cenniku, domkach, dojeździe tramwajem do centrum, zasadach pobytu i kontakcie z recepcją.',
    notice:
      'Odpowiedzi są informacyjne. Rezerwacje i dostępność zawsze potwierdza recepcja.',
    quickLabel: 'Szybkie tematy',
    inputLabel: 'Napisz wiadomość',
    inputPlaceholder: 'Napisz wiadomość...',
    send: 'Wyślij wiadomość',
    actions: {
      pricing: 'Sprawdź cennik',
      camperPrice: 'Ile kosztuje kamper?',
      directions: 'Jak dojechać?',
      centerTransit: 'Jak dojadę do centrum?',
      transit: 'Tramwaj do centrum',
      dog: 'Czy można z psem?',
      campingBooking: 'Czy mogę zarezerwować camping?',
      bungalow: 'Domki',
      arrival: 'Jak wygląda przyjazd?',
      reception: 'Kontakt z recepcją',
      quiet: 'Zasady ciszy',
      maps: 'Dojazd Google Maps',
      sctEtoll: 'SCT / e-TOLL',
      attractions: 'Atrakcje',
      dayPlan: 'Zaplanuj dzień w Krakowie',
      familyAttractions: 'Co zwiedzić z dziećmi?',
    },
    answers: {
      camperPrice:
        'Kamper kosztuje 80 PLN za noc. Do tego doliczane są osoby: dorosły 35 PLN, dziecko 4–14 lat 20 PLN. Prąd: 30 PLN, pies: 0 PLN. Przykład: 2 osoby + kamper + prąd = 180 PLN / noc.',
      pricing:
        'Orientacyjnie: kamper 80 PLN / noc, bus / ciężarówka 160 PLN / noc, prąd 30 PLN / noc, pies 0 PLN. Pełny kalkulator znajdziesz na stronie Cennik.',
      centerTransit:
        'Przystanek jest ok. 40 m od bramy. Do Starego Kleparza / centrum jest ok. 9 przystanków i ok. 14 minut jazdy tramwajem.',
      directions:
        'Najwygodniej zostawić auto lub kampera na campingu i pojechać tramwajem w stronę centrum Krakowa. Do nawigacji zalecamy używać Google Maps. Wjazd / trasa dojazdu zmieniła się w 2022 roku, dlatego starsze nawigacje mogą prowadzić nieprawidłowo.',
      transit:
        'Do centrum najwygodniej pojechać tramwajem: przystanek jest ok. 40 m od bramy, do Starego Kleparza / centrum jest ok. 9 przystanków i ok. 14 minut jazdy.',
      bungalows:
        'Domki mają osobną dostępność. Dostępne są tylko domki 2-os., 3-os. i 4-os. Ceny: 200/220 PLN, 3-os. od 250 PLN oraz 400/450 PLN zależnie od sezonu.',
      dog:
        'Tak, pies ma stawkę 0 PLN. Prosimy sprzątać po psie i trzymać go pod kontrolą na terenie campingu.',
      campingBooking:
        'Możesz wysłać zapytanie przez formularz. W sezonie letnim rezerwacje pola mogą być ograniczone, dlatego dostępność zawsze potwierdza recepcja.',
      arrival:
        'Po przyjeździe zatrzymaj się przy recepcji. Personel podejdzie, wskaże miejsce i oprowadzi po campingu. Rejestracja odbywa się później.',
      reception:
        'Recepcja: +48 795 294 486, email: clepardia@gmail.com. Najszybszy kontakt w sprawie dostępności to telefon lub wiadomość email.',
      camping:
        'Camping Clepardia przyjmuje kampery, vany, przyczepy, namioty i auta z namiotem dachowym. Miejsca dla kamperów znajdują się głównie na płytach betonowych. Busy, trucki, autobusy i ciężkie pojazdy ustawiamy na asfalcie, aby uniknąć zakopania się pojazdu, z możliwością wyjścia na trawę.',
      quiet:
        'Camping Clepardia nie jest miejscem imprezowym. Cisza nocna obowiązuje od 22:00 do 07:00. Jeśli planujesz imprezować, wybierz inne miejsce.',
      maps:
        'Do nawigacji zalecamy używać Google Maps. Wjazd / trasa dojazdu zmieniła się w 2022 roku, dlatego starsze nawigacje mogą prowadzić nieprawidłowo.',
      sctEtoll:
        'Przed przyjazdem sprawdź aktualne zasady SCT w Krakowie. Jeśli jedziesz większym pojazdem lub zestawem, sprawdź też, czy dotyczą Cię zasady e-TOLL.',
      attractions:
        'Clepardia jest dobrą bazą do zwiedzania Krakowa, Wieliczki, Kazimierza, Ojcowa i Energylandii. Najpierw odpoczynek w zielonej bazie, potem wygodny wypad w Małopolskę.',
      dayPlan:
        'Jasne, zaplanujmy dzień. Powiedz proszę: ile macie czasu, czy jedziecie z dziećmi, wolicie spokojny czy intensywny plan i czy chcecie jechać tramwajem czy autem?',
      familyAttractions:
        'Z dziećmi najczęściej sprawdza się spokojny spacer po centrum, Wawel, Ojców, Energylandia albo Wieliczka. Najwygodniej zaplanować start tramwajem z przystanku ok. 40 m od bramy.',
      fallback:
        'Najpewniej pomoże recepcja Camping Clepardia: +48 795 294 486 lub clepardia@gmail.com. CAMPY podpowiada najważniejsze informacje, a rezerwacje potwierdza recepcja.',
    },
  },
  content: {
    infoKicker: 'Informacje',
    infoTitle: 'Najważniejsze informacje przed przyjazdem',
    pricingQuickAria: 'Najważniejsze informacje o cenniku',
    highSeason: 'Wysoki sezon',
    lowSeason: 'Niski sezon',
    remainingDates: 'pozostałe terminy',
    dog: 'Pies',
    free: 'bezpłatnie',
    confirm: 'do potwierdzenia',
    electricity: 'Prąd',
    contactAria: 'Dane kontaktowe Camping Clepardia',
    contactCards: {
      phone: 'Telefon',
      email: 'Email',
      address: 'Adres',
      receptionHours: 'Godziny recepcji',
    },
    bungalowKicker: 'Cennik domków',
    bungalowTitle: 'Rodzaje domków',
    bungalowCopy:
      'Ceny domków zależą od sezonu. Dostępne są domki 2-osobowe, 3-osobowe i 4-osobowe.',
    lowSeasonLabel: 'niski sezon',
    highSeasonLabel: 'wysoki sezon',
    priceFromLabel: 'cena od',
    bungalowConfirm: 'Dostępność i finalna cena potwierdzana przez recepcję.',
    seasonNote: 'Wysoki sezon: {range}. Niski sezon: pozostałe terminy sezonu.',
    pricingGuidanceKicker: 'Ważne przed rezerwacją',
    pricingGuidanceTitle: 'Najważniejsze informacje',
    contactGuidanceKicker: 'Przed wysłaniem zapytania',
    contactGuidanceTitle: 'Co warto wiedzieć?',
  },
  pricing: {
    title: 'Kalkulator cennika',
    kicker: 'Kalkulator pobytu',
    lead:
      'Kalkulator liczy noce, typ pobytu, osoby i dodatki. Finalną dostępność oraz warunki rezerwacji potwierdza recepcja.',
    formAria: 'Kalkulator cennika Camping Clepardia',
    dates: 'Daty pobytu',
    arrival: 'Data przyjazdu',
    departure: 'Data wyjazdu',
    nightsLabel: 'Liczba nocy',
    stayType: 'Typ pobytu',
    from: 'od',
    perNight: 'noc',
    summerNotice:
      'W sezonie letnim rezerwacje pola campingowego mogą być ograniczone. Skontaktuj się z recepcją w sprawie dostępności.',
    people: 'Osoby',
    adults: 'Dorośli',
    children: 'Dzieci 4-14',
    toddlers: 'Dzieci do 4',
    extras: 'Dodatki',
    summary: 'Podsumowanie',
    total: 'Suma końcowa',
    term: 'Termin',
    season: 'Sezon',
    pricePerNight: 'Cena za noc',
    toComplete: 'Do uzupełnienia',
    noAddons: 'Brak',
    noPeople: 'Brak osób',
    lowSeason: 'Niski sezon',
    highSeason: 'Wysoki sezon',
    mixedSeason: 'Sezon mieszany',
    confirmPrice: 'do potwierdzenia',
    summaryFootnote:
      'To orientacyjna kalkulacja. Recepcja potwierdza dostępność, sezon i szczegóły pobytu.',
    mobileTotal: 'Suma pobytu',
    increment: 'Zwiększ',
    decrement: 'Zmniejsz',
    night: {
      one: '1 noc',
      other: '{count} nocy',
    },
    stayTypes: {
      camper: 'Kamper',
      caravan: 'Przyczepa',
      van: 'Van',
      car: 'Samochód',
      'tent-small': 'Namiot 1-2 os.',
      'tent-large': 'Namiot 3-4 os.',
      'rooftop-tent': 'Auto + namiot dachowy',
      bus: 'Bus / ciężarówka',
      'bungalow-2': 'Domek 2-os.',
      'bungalow-3': 'Domek 3-os.',
      'bungalow-4': 'Domek 4-os.',
    },
    addons: {
      electricity: 'Prąd',
      dog: 'Pies',
      motorcycle: 'Motocykl',
      'cargo-trailer': 'Przyczepa bagażowa',
      bus: 'Bus / ciężarówka',
      parking: 'Parking',
      'extra-car': 'Dodatkowe auto',
    },
  },
  form: {
    kicker: 'Formularz zapytania rezerwacyjnego',
    title: 'Wyślij szczegóły planowanego pobytu',
    lead:
      'Im więcej informacji podasz od razu, tym szybciej recepcja może potwierdzić dostępność terminu i najlepszą opcję pobytu.',
    honeypotLabel: 'Strona internetowa',
    data: 'Dane',
    fullName: 'Imię i nazwisko',
    email: 'Email',
    phone: 'Telefon',
    country: 'Kraj',
    contactLanguage: 'Język kontaktu',
    dates: 'Termin',
    arrival: 'Data przyjazdu',
    departure: 'Data wyjazdu',
    nights: 'Liczba nocy',
    completeDates: 'Uzupełnij termin',
    stayType: 'Typ pobytu',
    people: 'Osoby',
    adults: 'Dorośli',
    children: 'Dzieci 4-14',
    toddlers: 'Dzieci do 4',
    extras: 'Dodatki',
    message: 'Wiadomość',
    messagePlaceholder:
      'Napisz, czego potrzebujesz: godzina przyjazdu, typ sprzętu, pytania o domek lub dodatkowe informacje.',
    quietRule:
      'Camping Clepardia nie jest miejscem imprezowym. Cisza nocna obowiązuje od 22:00 do 07:00. Jeśli planujesz imprezować, wybierz inne miejsce.',
    quietConsent:
      'Rozumiem, że Camping Clepardia nie jest miejscem imprezowym, a cisza nocna obowiązuje od 22:00 do 07:00.',
    consent: 'Akceptuję kontakt zwrotny w sprawie mojego zapytania.',
    submit: 'Wyślij zapytanie',
    homeCtaButton: 'Przejdź do rezerwacji',
    homeMiniNote: 'To szybki wybór terminu. Pełne zapytanie wyślesz na stronie rezerwacji.',
    loading: 'WysyĹ‚amy...',
    networkError: 'Nie udaĹ‚o siÄ™ wysĹ‚aÄ‡ zapytania. SprĂłbuj ponownie albo skontaktuj siÄ™ bezpoĹ›rednio z recepcjÄ….',
    summary: 'Podsumowanie zapytania',
    summaryEmpty: 'Uzupełnij formularz, a tutaj pojawi się podsumowanie zapytania.',
    term: 'Termin',
    countrySummary: 'Kraj',
    language: 'Język',
    season: 'Sezon',
    noAddons: 'Brak',
    noPeople: 'Brak osób',
    toComplete: 'Do uzupełnienia',
    summerSeason: 'Sezon letni',
    outsideSummer: 'Poza głównym sezonem letnim',
    summerNotice:
      'W sezonie letnim rezerwacje pola campingowego mogą być ograniczone. Recepcja potwierdzi dostępność w odpowiedzi na zapytanie.',
    success:
      'Zapytanie zostało przygotowane. W kolejnym etapie podłączymy wysyłkę do recepcji Camping Clepardia.',
    errorHeading: 'Popraw formularz:',
    validation: {
      fullName: 'Podaj imię i nazwisko.',
      email: 'Podaj adres email.',
      emailFormat: 'Podaj poprawny adres email.',
      arrival: 'Podaj datę przyjazdu.',
      departure: 'Podaj datę wyjazdu.',
      departureAfterArrival: 'Data wyjazdu musi być po dacie przyjazdu.',
      stayType: 'Wybierz typ pobytu.',
      quietConsent: 'Potwierdź zasady ciszy nocnej i nieimprezowy charakter campingu.',
      consent: 'Zaakceptuj kontakt zwrotny w sprawie zapytania.',
    },
    mailTitle: 'Zapytanie rezerwacyjne Camping Clepardia',
    mailLabels: {
      fullName: 'Imię i nazwisko',
      email: 'Email',
      phone: 'Telefon',
      country: 'Kraj',
      notProvided: 'nie podano',
      contactLanguage: 'Język kontaktu',
      term: 'Termin',
      nights: 'Liczba nocy',
      stayType: 'Typ pobytu',
      adults: 'Dorośli',
      children: 'Dzieci 4-14',
      toddlers: 'Dzieci do 4',
      addons: 'Dodatki',
      none: 'brak',
      summerNotice: 'Komunikat sezonowy',
      quietConsent: 'Potwierdzenie ciszy nocnej',
      accepted: 'zaakceptowano',
      notApplicable: 'nie dotyczy',
      message: 'Wiadomość',
    },
  },
  pages: sitePages,
  home: {
    hero: {
      badge: 'Premium camping w Krakowie',
      title: 'Camping Clepardia',
      subtitle: 'Camping w Krakowie blisko centrum miasta',
      copy:
        'Zielona baza dla kamperów, przyczep, namiotów i komfortowych domków. Odpoczywaj spokojnie i dojedź tramwajem do Starego Miasta.',
      primary: 'Zarezerwuj pobyt',
      secondary: 'Zobacz cennik',
      badges: ['Blisko centrum Krakowa', 'Camping + domki', 'Tramwaj do centrum', 'Mister Camping 2024 i 2025'],
      benefits: ['Blisko centrum', 'Tramwaj do Starego Miasta', 'Kampery, namioty i domki'],
      scroll: 'Przewiń',
    },
    stats: [
      { value: 'Kraków', label: 'Blisko centrum Krakowa', copy: 'Spokojna baza z dostępem do atrakcji miasta.' },
      { value: 'Tramwaj', label: 'Tramwaj w pobliżu', copy: 'Wygodny dojazd do Starego Miasta.' },
      { value: 'Pobyt', label: 'Camping + domki', copy: 'Wybierz swój styl pobytu.' },
      { value: 'Zieleń', label: 'Zielona część miasta', copy: 'Odpocznij po zwiedzaniu w spokojniejszej przestrzeni.' },
    ],
    why: {
      overline: 'Zielona baza w Krakowie',
      title: 'Dlaczego Camping Clepardia?',
      lead:
        'Zielona przestrzeń w Krakowie, wygodna baza do zwiedzania i szybki dojazd do centrum bez stresu z parkowaniem.',
      benefits: [
        {
          title: 'Blisko centrum Krakowa',
          copy: 'Szybki dojazd tramwajem do Starego Miasta bez szukania parkingu w centrum.',
        },
        {
          title: 'Miejsca dla kamperów i przyczep',
          copy:
            'Wygodna baza dla podróżujących kamperem, vanem, przyczepą lub autem z namiotem dachowym.',
        },
        {
          title: 'Domki dla gości',
          copy:
            'Komfortowa opcja noclegu dla osób, które chcą zostać w Krakowie bez własnego sprzętu campingowego.',
        },
        {
          title: 'Zielona okolica',
          copy: 'Spokojniejsza przestrzeń do odpoczynku po całym dniu zwiedzania Krakowa i Małopolski.',
        },
        {
          title: 'Dobre zaplecze',
          copy: 'Sanitariaty, kuchnie turystyczne, prąd, pralnia i podstawowe udogodnienia potrzebne w podróży.',
        },
        {
          title: 'Dobra baza wypadowa',
          copy:
            'Wygodny start do zwiedzania Krakowa, Wieliczki, Ojcowa, Energylandii i innych atrakcji regionu.',
        },
      ],
    },
    trust: {
      overline: 'Zaufanie',
      title: 'Miejsce wybierane przez gości, którzy chcą zwiedzać Kraków po swojemu.',
      cards: [
        {
          title: 'Mister Camping 2024 i 2025',
          copy: 'Wyróżnienie budujące zaufanie wśród gości planujących pobyt.',
        },
        {
          title: 'Wysoka ocena gości',
          copy: 'Goście doceniają lokalizację, atmosferę i wygodę pobytu.',
        },
        {
          title: 'Rodzinna atmosfera',
          copy: 'Campingowy rytm, bez anonimowego hotelowego dystansu.',
        },
        {
          title: 'Wiele lat doświadczenia',
          copy: 'Sprawdzone miejsce dla turystów odwiedzających Kraków.',
        },
      ],
    },
  },
} as const;
