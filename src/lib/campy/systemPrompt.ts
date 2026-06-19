export type CampyLanguage = 'pl' | 'en' | 'de' | 'it' | string;

import { currencyEstimateConfig, formatCurrencyEstimates, pricingConfig } from '@/data/pricing';

const stayPrice = (id: string) => {
  const item = pricingConfig.stayTypes.find((entry) => entry.id === id);
  return item && 'price' in item ? item.price : 0;
};

const addonPrice = (id: string) => pricingConfig.addons.find((entry) => entry.id === id)?.price ?? 0;
const bungalowPrice = (id: string) => {
  const item = pricingConfig.stayTypes.find((entry) => entry.id === id);
  return item && 'seasonalPrices' in item ? item.seasonalPrices : { low: 0, high: 0 };
};

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
    adult: pricingConfig.people.adults.price,
    child4to14: pricingConfig.people.children.price,
    childUnder4: pricingConfig.people.toddlers.price,
    camper: stayPrice('camper'),
    van: stayPrice('van'),
    caravan: stayPrice('caravan'),
    tentSmall: stayPrice('tent-small'),
    tentLarge: stayPrice('tent-large'),
    rooftopTent: stayPrice('rooftop-tent'),
    cargoTrailer: addonPrice('cargo-trailer'),
    busTruck: addonPrice('bus'),
    electricity: addonPrice('electricity'),
    dog: addonPrice('dog'),
    bungalow2: `${bungalowPrice('bungalow-2').low} PLN niski sezon / ${bungalowPrice('bungalow-2').high} PLN wysoki sezon`,
    bungalow3: `${bungalowPrice('bungalow-3').low} PLN niski sezon / ${bungalowPrice('bungalow-3').high} PLN wysoki sezon`,
    bungalow4: `${bungalowPrice('bungalow-4').low} PLN niski sezon / ${bungalowPrice('bungalow-4').high} PLN wysoki sezon`,
    currencies: `${currencyEstimateConfig.shortDisclaimer} Przykład 180 PLN to ${formatCurrencyEstimates(180)}.`,
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
- Pricing: adult ${campyKnowledge.pricing.adult} PLN, child 4-14 ${campyKnowledge.pricing.child4to14} PLN, child under 4 ${campyKnowledge.pricing.childUnder4} PLN, camper ${campyKnowledge.pricing.camper} PLN, van ${campyKnowledge.pricing.van} PLN, caravan ${campyKnowledge.pricing.caravan} PLN, tent 1-2 ${campyKnowledge.pricing.tentSmall} PLN, tent 3-4 ${campyKnowledge.pricing.tentLarge} PLN, rooftop tent ${campyKnowledge.pricing.rooftopTent} PLN, cargo trailer ${campyKnowledge.pricing.cargoTrailer} PLN, bus/truck ${campyKnowledge.pricing.busTruck} PLN, electricity ${campyKnowledge.pricing.electricity} PLN, dog ${campyKnowledge.pricing.dog} PLN.
- Currency estimates: ${campyKnowledge.pricing.currencies} ${currencyEstimateConfig.disclaimer}
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
      return 'Kamper kosztuje 80 PLN za noc. Dorosły: 35 PLN, dziecko 4-14 lat: 20 PLN, prąd: 30 PLN, pies: 0 PLN. Przykład: 2 osoby + kamper + prąd = 180 PLN za noc. Dostępność potwierdza recepcja.';
    }
    if (normalized.includes('euro') || normalized.includes('eur') || normalized.includes('usd') || normalized.includes('dolar') || normalized.includes('gbp') || normalized.includes('funt')) {
      return `${currencyEstimateConfig.shortDisclaimer} Przykład: 180 PLN to ${formatCurrencyEstimates(180)}. ${currencyEstimateConfig.disclaimer}`;
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
    return 'A motorhome costs 80 PLN per night. Adult: 35 PLN, child 4-14: 20 PLN, electricity: 30 PLN, dog: 0 PLN. Example: 2 adults + camper + electricity = 180 PLN per night. Reception confirms availability.';
  }
  if (normalized.includes('euro') || normalized.includes('eur') || normalized.includes('usd') || normalized.includes('dollar') || normalized.includes('gbp') || normalized.includes('pound')) {
    return `${currencyEstimateConfig.shortDisclaimer} Example: 180 PLN is ${formatCurrencyEstimates(180)}. ${currencyEstimateConfig.disclaimer}`;
  }
  if (normalized.includes('centre') || normalized.includes('center') || normalized.includes('tram')) {
    return 'The tram stop is about 40 m from the gate. It is about 9 stops and around 14 minutes to Stary Kleparz / the city centre.';
  }
  return 'CAMPY is currently running in informational mode. Bookings and availability are confirmed by reception: +48 795 294 486 or clepardia@gmail.com.';
};
