export type CampyLanguage = 'pl' | 'en' | 'de' | 'it' | string;

export const campyKnowledge = {
  contact: {
    phone: '+48 795 294 486',
    email: 'clepardia@gmail.com',
    address: 'Henryka Pachońskiego 28A, 31-322 Kraków',
  },
  rules: {
    quietHours: '22:00-07:00',
    noParty: true,
    noEvCharging: true,
    invoices: 'Faktury wyłącznie dla firm zarejestrowanych w Polsce.',
    bookings: 'Rezerwacje i dostępność zawsze potwierdza recepcja.',
  },
  pricing: {
    adult: 35,
    child4to14: 20,
    childUnder4: 0,
    camper: 80,
    van: 75,
    caravan: 60,
    tentSmall: 30,
    tentLarge: 40,
    rooftopTent: 50,
    busTruck: 160,
    electricity: 25,
    dog: 0,
    bungalow2: '200 PLN niski sezon / 220 PLN wysoki sezon',
    bungalow3: '250 PLN niski sezon / 300 PLN wysoki sezon',
    bungalow4: '400 PLN niski sezon / 450 PLN wysoki sezon',
  },
  stay: {
    bungalows: 'Tylko domki 2-, 3- i 4-osobowe. Brak domku rodzinnego i brak tarasów.',
    camperPitches: 'Miejsca dla kamperów są głównie na płytach betonowych.',
    heavyVehicles: 'Busy, trucki, autobusy i ciężkie pojazdy ustawiamy na asfalcie, aby uniknąć zakopania się pojazdu.',
  },
  transport: {
    tramStop: 'Przystanek ok. 40 m od bramy.',
    center: 'Do Starego Kleparza / centrum ok. 9 przystanków i ok. 14 minut tramwajem.',
    maps: 'Zalecamy Google Maps, bo dojazd zmienił się w 2022 roku.',
    sct: 'https://ztp.krakow.pl/sct',
    etoll: 'Sprawdź e-TOLL przed trasą, jeśli podróżujesz większym pojazdem lub zestawem.',
  },
};

const languageName = (language: CampyLanguage) => {
  if (language === 'pl') return 'Polish';
  if (language === 'de') return 'German';
  if (language === 'it') return 'Italian';
  return 'English';
};

export const buildCampySystemPrompt = (language: CampyLanguage = 'pl') => `
You are CAMPY, the warm Camping Clepardia helper.
Answer in ${languageName(language)}.

Use only the knowledge below. Keep answers short, friendly and practical.
Never confirm bookings, never guarantee availability, never invent prices and never pretend to be reception.
If the question needs confirmation, direct the guest to reception: ${campyKnowledge.contact.phone}, ${campyKnowledge.contact.email}.

Knowledge:
- Address: ${campyKnowledge.contact.address}
- Quiet hours: ${campyKnowledge.rules.quietHours}. Camping Clepardia is not a party campsite.
- Bookings: ${campyKnowledge.rules.bookings}
- Bungalows: ${campyKnowledge.stay.bungalows}
- Pricing: adult ${campyKnowledge.pricing.adult} PLN, child 4-14 ${campyKnowledge.pricing.child4to14} PLN, child under 4 ${campyKnowledge.pricing.childUnder4} PLN, camper ${campyKnowledge.pricing.camper} PLN, van ${campyKnowledge.pricing.van} PLN, caravan ${campyKnowledge.pricing.caravan} PLN, tent 1-2 ${campyKnowledge.pricing.tentSmall} PLN, tent 3-4 ${campyKnowledge.pricing.tentLarge} PLN, rooftop tent ${campyKnowledge.pricing.rooftopTent} PLN, bus/truck ${campyKnowledge.pricing.busTruck} PLN, electricity ${campyKnowledge.pricing.electricity} PLN, dog ${campyKnowledge.pricing.dog} PLN.
- Bungalow prices: 2-person ${campyKnowledge.pricing.bungalow2}; 3-person ${campyKnowledge.pricing.bungalow3}; 4-person ${campyKnowledge.pricing.bungalow4}.
- Camper pitches: ${campyKnowledge.stay.camperPitches}
- Heavy vehicles: ${campyKnowledge.stay.heavyVehicles}
- Tram: ${campyKnowledge.transport.tramStop} ${campyKnowledge.transport.center}
- Navigation: ${campyKnowledge.transport.maps}
- SCT: ${campyKnowledge.transport.sct}
- e-TOLL: ${campyKnowledge.transport.etoll}
- EV/hybrid charging from campsite electricity is not allowed.
- ${campyKnowledge.rules.invoices}
`.trim();

export const getCampyFallbackResponse = (language: CampyLanguage = 'pl', message = '') => {
  const normalized = message.toLowerCase();
  if (language === 'pl') {
    if (normalized.includes('plan')) {
      return 'Jasne, zaplanujmy dzień. Ile macie czasu, czy jedziecie z dziećmi, wolicie spokojny czy intensywny plan i tramwaj czy auto?';
    }
    if (normalized.includes('kamper') || normalized.includes('cena') || normalized.includes('koszt')) {
      return 'Kamper kosztuje 80 PLN za noc. Dorosły: 35 PLN, dziecko 4-14 lat: 20 PLN, prąd: 25 PLN, pies: 0 PLN. Dostępność potwierdza recepcja.';
    }
    if (normalized.includes('centrum') || normalized.includes('tram')) {
      return 'Przystanek jest ok. 40 m od bramy. Do Starego Kleparza / centrum jest ok. 9 przystanków i ok. 14 minut tramwajem.';
    }
    return 'CAMPY działa teraz w trybie informacyjnym. Rezerwacje i dostępność potwierdza recepcja: +48 795 294 486 lub clepardia@gmail.com.';
  }

  if (normalized.includes('plan')) {
    return 'Sure, let us sketch a day. How much time do you have, are you with children, calm or intensive plan, tram or car?';
  }
  if (normalized.includes('camper') || normalized.includes('price') || normalized.includes('cost')) {
    return 'A motorhome costs 80 PLN per night. Adult: 35 PLN, child 4-14: 20 PLN, electricity: 25 PLN, dog: 0 PLN. Reception confirms availability.';
  }
  if (normalized.includes('centre') || normalized.includes('center') || normalized.includes('tram')) {
    return 'The tram stop is about 40 m from the gate. It is about 9 stops and around 14 minutes to Stary Kleparz / the city centre.';
  }
  return 'CAMPY is currently running in informational mode. Bookings and availability are confirmed by reception: +48 795 294 486 or clepardia@gmail.com.';
};
