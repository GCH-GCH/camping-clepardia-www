export type CampyLanguage = 'pl' | 'en' | 'de' | 'it' | 'fr' | 'es' | 'nl' | 'cs' | 'sk' | 'sv' | string;

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
    receptionHours: '09:00-21:00',
    gateHours: '08:00-22:00',
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
    bungalow3: `od ${bungalowPrice('bungalow-3').low} PLN / noc`,
    bungalow4: `${bungalowPrice('bungalow-4').low} PLN niski sezon / ${bungalowPrice('bungalow-4').high} PLN wysoki sezon`,
    currencies: `${currencyEstimateConfig.shortDisclaimer} Przykład 180 PLN to ${formatCurrencyEstimates(180)}.`,
  },
  stay: {
    bungalows: 'Tylko domki 2-, 3- i 4-osobowe. Brak domku rodzinnego i brak tarasów.',
    bungalowItems: 'Goście domków zabierają własne ręczniki, kosmetyki i rzeczy osobiste.',
    bungalowCheckIn: 'od 16:00',
    bungalowCheckOut: 'do 11:00',
    campingCheckOut: 'do 12:00',
    highSeason: 'W lipcu i sierpniu rezerwacje z wyprzedzeniem dotyczą tylko domków/bungalowów. Nie przyjmujemy zapytań rezerwacyjnych na miejsca campingowe w tym okresie. Camping dla kamperów, vanów, przyczep i namiotów działa według kolejności przyjazdu; najlepiej przyjechać około 12:00.',
    camperPitches: 'Miejsca dla kamperów są głównie na płytach betonowych.',
    heavyVehicles: 'Busy, trucki, autobusy i ciężkie pojazdy ustawiamy na asfalcie, aby uniknąć zakopania się pojazdu.',
  },
  transport: {
    tramStop: 'Przystanek ok. 40 m od bramy.',
    center: 'Do Starego Kleparza / centrum ok. 9 przystanków i ok. 14 minut tramwajem.',
    oldTownWalk: 'Ze Starego Kleparza około 5 minut pieszo do Starego Miasta.',
    maps: 'Zalecamy Google Maps, bo dojazd zmienił się w 2022 roku.',
    sct: 'https://ztp.krakow.pl/sct',
    etoll: 'Sprawdź e-TOLL przed trasą, jeśli podróżujesz większym pojazdem lub zestawem.',
  },
  tours: {
    bookingHref: 'https://qr.codes/vksKBT',
    destinations: ['Wieliczka', 'Auschwitz-Birkenau', 'Zakopane', 'Ojców', 'Energylandia'],
  },
};

const languageName = (language: CampyLanguage) => {
  const names: Record<string, string> = {
    pl: 'Polish',
    en: 'English',
    de: 'German',
    it: 'Italian',
    fr: 'French',
    es: 'Spanish',
    nl: 'Dutch',
    cs: 'Czech',
    sk: 'Slovak',
    sv: 'Swedish',
  };
  return names[language] ?? 'English';
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
- Reception: ${campyKnowledge.rules.receptionHours}. Gate: ${campyKnowledge.rules.gateHours}. Arrival after 21:00 requires prior contact.
- Bookings: ${campyKnowledge.rules.bookings}
- High season: ${campyKnowledge.stay.highSeason}
- If a guest asks about reserving camping in July/August, do not encourage sending a camping reservation enquiry. Explain arrival order and suggest a bungalow if they need an advance reservation.
- Bungalows: ${campyKnowledge.stay.bungalows}
- Bungalow personal items: ${campyKnowledge.stay.bungalowItems}
- Stay hours: camping check-out ${campyKnowledge.stay.campingCheckOut}; bungalow check-in ${campyKnowledge.stay.bungalowCheckIn}; bungalow check-out ${campyKnowledge.stay.bungalowCheckOut}.
- Pricing: adult ${campyKnowledge.pricing.adult} PLN, child 4-14 ${campyKnowledge.pricing.child4to14} PLN, child under 4 ${campyKnowledge.pricing.childUnder4} PLN, camper ${campyKnowledge.pricing.camper} PLN, van ${campyKnowledge.pricing.van} PLN, caravan ${campyKnowledge.pricing.caravan} PLN, tent 1-2 ${campyKnowledge.pricing.tentSmall} PLN, tent 3-4 ${campyKnowledge.pricing.tentLarge} PLN, rooftop tent ${campyKnowledge.pricing.rooftopTent} PLN, cargo trailer ${campyKnowledge.pricing.cargoTrailer} PLN, bus/truck ${campyKnowledge.pricing.busTruck} PLN, electricity ${campyKnowledge.pricing.electricity} PLN, dog ${campyKnowledge.pricing.dog} PLN.
- Currency estimates: ${campyKnowledge.pricing.currencies} ${currencyEstimateConfig.disclaimer}
- Bungalow prices: 2-person ${campyKnowledge.pricing.bungalow2}; 3-person ${campyKnowledge.pricing.bungalow3}; 4-person ${campyKnowledge.pricing.bungalow4}.
- Camper pitches: ${campyKnowledge.stay.camperPitches}
- Heavy vehicles: ${campyKnowledge.stay.heavyVehicles}
- Tram: ${campyKnowledge.transport.tramStop} ${campyKnowledge.transport.center} ${campyKnowledge.transport.oldTownWalk}
- Navigation: ${campyKnowledge.transport.maps}
- SCT: ${campyKnowledge.transport.sct}
- e-TOLL: ${campyKnowledge.transport.etoll}
- EV/hybrid charging from campsite electricity is not allowed.
- Tours: reception can provide information. Destinations: ${campyKnowledge.tours.destinations.join(', ')}. Booking CTA: ${campyKnowledge.tours.bookingHref}
- ${campyKnowledge.rules.invoices}
`.trim();

export const getCampyFallbackResponse = (language: CampyLanguage = 'pl', message = '') => {
  const normalized = message.toLowerCase();
  const lang = (['pl', 'en', 'de', 'it', 'fr', 'es', 'nl', 'cs', 'sk', 'sv'].includes(language) ? language : 'en') as 'pl' | 'en' | 'de' | 'it' | 'fr' | 'es' | 'nl' | 'cs' | 'sk' | 'sv';
  const moneyExample = formatCurrencyEstimates(180);
  const copy = {
    pl: {
      plan: 'Jasne, zaplanujmy dzień. Ile macie czasu, czy jedziecie z dziećmi, wolicie spokojny czy intensywny plan i tramwaj czy auto?',
      summer: 'W lipcu i sierpniu nie przyjmujemy rezerwacji miejsc campingowych z wyprzedzeniem. Camping działa według kolejności przyjazdu, najlepiej przyjechać około 12:00. W tym terminie zapytanie z wyprzedzeniem można wysłać tylko o domek.',
      price: 'Kamper kosztuje 80 PLN za noc. Dorosły: 35 PLN, dziecko 4-14 lat: 20 PLN, prąd: 30 PLN, pies: 0 PLN. Przykład: 2 osoby + kamper + prąd = 180 PLN za noc. Dostępność potwierdza recepcja.',
      currency: `${currencyEstimateConfig.shortDisclaimer} Przykład: 180 PLN to ${moneyExample}. ${currencyEstimateConfig.disclaimer}`,
      tram: 'Przystanek jest ok. 40 m od bramy. Do Starego Kleparza / centrum jest ok. 9 przystanków i ok. 14 minut tramwajem.',
      fallback: 'CAMPY działa teraz w trybie informacyjnym. Rezerwacje i dostępność potwierdza recepcja: +48 795 294 486 lub clepardia@gmail.com.',
    },
    en: {
      plan: 'Sure, let us sketch a day. How much time do you have, are you with children, calm or intensive plan, tram or car?',
      summer: 'In July and August we do not take advance reservations for camping pitches. Camping works by arrival order, best around 12:00. For that period, an advance enquiry can be sent only for a bungalow.',
      price: 'A motorhome costs 80 PLN per night. Adult: 35 PLN, child 4-14: 20 PLN, electricity: 30 PLN, dog: 0 PLN. Example: 2 adults + camper + electricity = 180 PLN per night. Reception confirms availability.',
      currency: `${currencyEstimateConfig.shortDisclaimer} Example: 180 PLN is ${moneyExample}. ${currencyEstimateConfig.disclaimer}`,
      tram: 'The tram stop is about 40 m from the gate. It is about 9 stops and around 14 minutes to Stary Kleparz / the city centre.',
      fallback: 'CAMPY is currently running in informational mode. Bookings and availability are confirmed by reception: +48 795 294 486 or clepardia@gmail.com.',
    },
    de: {
      plan: 'Gern, planen wir den Tag. Wie viel Zeit haben Sie, reisen Sie mit Kindern, lieber ruhig oder intensiv, Straßenbahn oder Auto?',
      summer: 'Im Juli und August nehmen wir keine Vorreservierungen für Campingplätze an. Camping funktioniert nach Ankunftsreihenfolge, am besten gegen 12:00. In diesem Zeitraum ist eine Anfrage im Voraus nur für einen Bungalow möglich.',
      price: 'Ein Wohnmobil kostet 80 PLN pro Nacht. Erwachsener: 35 PLN, Kind 4–14: 20 PLN, Strom: 30 PLN, Hund: 0 PLN. Beispiel: 2 Erwachsene + Wohnmobil + Strom = 180 PLN pro Nacht. Die Rezeption bestätigt die Verfügbarkeit.',
      currency: `${currencyEstimateConfig.shortDisclaimer} Beispiel: 180 PLN sind ${moneyExample}. ${currencyEstimateConfig.disclaimer}`,
      tram: 'Die Haltestelle ist ca. 40 m vom Tor entfernt. Zum Stary Kleparz / Zentrum sind es ca. 9 Haltestellen und etwa 14 Minuten mit der Straßenbahn.',
      fallback: 'CAMPY läuft aktuell im Informationsmodus. Buchungen und Verfügbarkeit bestätigt die Rezeption: +48 795 294 486 oder clepardia@gmail.com.',
    },
    it: {
      plan: 'Certo, pianifichiamo la giornata. Quanto tempo avete, viaggiate con bambini, preferite un piano tranquillo o intenso, tram o auto?',
      summer: 'A luglio e agosto non accettiamo prenotazioni anticipate per piazzole camping. Il camping funziona in ordine di arrivo, meglio arrivare verso le 12:00. In quel periodo si può inviare in anticipo solo una richiesta per bungalow.',
      price: 'Il camper costa 80 PLN a notte. Adulto: 35 PLN, bambino 4–14: 20 PLN, corrente: 30 PLN, cane: 0 PLN. Esempio: 2 adulti + camper + corrente = 180 PLN a notte. La reception conferma disponibilità.',
      currency: `${currencyEstimateConfig.shortDisclaimer} Esempio: 180 PLN sono ${moneyExample}. ${currencyEstimateConfig.disclaimer}`,
      tram: 'La fermata è a circa 40 m dal cancello. Sono circa 9 fermate e 14 minuti in tram fino a Stary Kleparz / centro.',
      fallback: 'CAMPY è ora in modalità informativa. Prenotazioni e disponibilità sono confermate dalla reception: +48 795 294 486 o clepardia@gmail.com.',
    },
    fr: {
      plan: 'Bien sûr, préparons la journée. Combien de temps avez-vous, voyagez-vous avec des enfants, rythme calme ou intense, tram ou voiture ?',
      summer: 'En juillet et août, nous ne prenons pas de réservations à l’avance pour les emplacements camping. Le camping fonctionne par ordre d’arrivée, idéalement vers 12:00. Pour cette période, une demande à l’avance est possible uniquement pour un bungalow.',
      price: 'Un camping-car coûte 80 PLN par nuit. Adulte : 35 PLN, enfant 4–14 ans : 20 PLN, électricité : 30 PLN, chien : 0 PLN. Exemple : 2 adultes + camping-car + électricité = 180 PLN par nuit. La réception confirme la disponibilité.',
      currency: `${currencyEstimateConfig.shortDisclaimer} Exemple : 180 PLN correspondent à ${moneyExample}. ${currencyEstimateConfig.disclaimer}`,
      tram: 'L’arrêt est à environ 40 m du portail. Il y a environ 9 arrêts et 14 minutes en tram jusqu’à Stary Kleparz / centre.',
      fallback: 'CAMPY fonctionne actuellement en mode information. Les réservations et disponibilités sont confirmées par la réception : +48 795 294 486 ou clepardia@gmail.com.',
    },
    es: {
      plan: 'Claro, planifiquemos el día. ¿Cuánto tiempo tienen, viajan con niños, prefieren un plan tranquilo o intenso, tranvía o coche?',
      summer: 'En julio y agosto no aceptamos reservas anticipadas de parcelas de camping. El camping funciona por orden de llegada, mejor sobre las 12:00. En ese periodo solo se puede enviar consulta anticipada para bungalow.',
      price: 'La autocaravana cuesta 80 PLN por noche. Adulto: 35 PLN, niño 4–14: 20 PLN, electricidad: 30 PLN, perro: 0 PLN. Ejemplo: 2 adultos + autocaravana + electricidad = 180 PLN por noche. Recepción confirma disponibilidad.',
      currency: `${currencyEstimateConfig.shortDisclaimer} Ejemplo: 180 PLN son ${moneyExample}. ${currencyEstimateConfig.disclaimer}`,
      tram: 'La parada está a unos 40 m de la puerta. Son unas 9 paradas y unos 14 minutos en tranvía hasta Stary Kleparz / centro.',
      fallback: 'CAMPY funciona ahora en modo informativo. Reservas y disponibilidad las confirma recepción: +48 795 294 486 o clepardia@gmail.com.',
    },
    nl: {
      plan: 'Zeker, laten we de dag plannen. Hoeveel tijd hebben jullie, reizen jullie met kinderen, rustig of intensief, tram of auto?',
      summer: 'In juli en augustus nemen we geen reserveringen vooraf aan voor kampeerplaatsen. Camping werkt op volgorde van aankomst, het liefst rond 12:00. Voor die periode kan vooraf alleen een aanvraag voor een bungalow worden gestuurd.',
      price: 'Een camper kost 80 PLN per nacht. Volwassene: 35 PLN, kind 4–14: 20 PLN, stroom: 30 PLN, hond: 0 PLN. Voorbeeld: 2 volwassenen + camper + stroom = 180 PLN per nacht. De receptie bevestigt beschikbaarheid.',
      currency: `${currencyEstimateConfig.shortDisclaimer} Voorbeeld: 180 PLN is ${moneyExample}. ${currencyEstimateConfig.disclaimer}`,
      tram: 'De halte ligt ongeveer 40 m van de poort. Het zijn ongeveer 9 haltes en circa 14 minuten met de tram naar Stary Kleparz / centrum.',
      fallback: 'CAMPY draait nu in informatiemodus. Boekingen en beschikbaarheid worden bevestigd door de receptie: +48 795 294 486 of clepardia@gmail.com.',
    },
    cs: {
      plan: 'Jistě, naplánujme den. Kolik máte času, cestujete s dětmi, chcete klidný nebo intenzivní plán, tramvaj nebo auto?',
      summer: 'V červenci a srpnu nepřijímáme rezervace kempovacích míst předem. Kemp funguje podle pořadí příjezdu, ideálně kolem 12:00. V tomto termínu lze předem poslat dotaz pouze na chatku.',
      price: 'Obytný vůz stojí 80 PLN za noc. Dospělý: 35 PLN, dítě 4–14: 20 PLN, elektřina: 30 PLN, pes: 0 PLN. Příklad: 2 dospělí + obytný vůz + elektřina = 180 PLN za noc. Dostupnost potvrzuje recepce.',
      currency: `${currencyEstimateConfig.shortDisclaimer} Příklad: 180 PLN je ${moneyExample}. ${currencyEstimateConfig.disclaimer}`,
      tram: 'Zastávka je asi 40 m od brány. Na Stary Kleparz / centrum je to asi 9 zastávek a 14 minut tramvají.',
      fallback: 'CAMPY nyní běží v informačním režimu. Rezervace a dostupnost potvrzuje recepce: +48 795 294 486 nebo clepardia@gmail.com.',
    },
    sk: {
      plan: 'Jasné, naplánujme deň. Koľko máte času, cestujete s deťmi, chcete pokojný alebo intenzívny plán, električku alebo auto?',
      summer: 'V júli a auguste neprijímame rezervácie kempových miest vopred. Kemp funguje podľa poradia príchodu, najlepšie okolo 12:00. V tomto termíne možno vopred poslať dopyt iba na chatku.',
      price: 'Obytné auto stojí 80 PLN za noc. Dospelý: 35 PLN, dieťa 4–14: 20 PLN, elektrina: 30 PLN, pes: 0 PLN. Príklad: 2 dospelí + obytné auto + elektrina = 180 PLN za noc. Dostupnosť potvrdzuje recepcia.',
      currency: `${currencyEstimateConfig.shortDisclaimer} Príklad: 180 PLN je ${moneyExample}. ${currencyEstimateConfig.disclaimer}`,
      tram: 'Zastávka je asi 40 m od brány. Na Stary Kleparz / centrum je to asi 9 zastávok a 14 minút električkou.',
      fallback: 'CAMPY teraz beží v informačnom režime. Rezervácie a dostupnosť potvrdzuje recepcia: +48 795 294 486 alebo clepardia@gmail.com.',
    },
    sv: {
      plan: 'Absolut, låt oss planera dagen. Hur mycket tid har ni, reser ni med barn, lugnt eller intensivt tempo, spårvagn eller bil?',
      summer: 'I juli och augusti tar vi inte emot förhandsbokningar för campingplatser. Camping gäller enligt ankomstordning, helst runt 12:00. Under denna period kan en förfrågan i förväg bara skickas för bungalow/stuga.',
      price: 'Husbil kostar 80 PLN per natt. Vuxen: 35 PLN, barn 4–14: 20 PLN, el: 30 PLN, hund: 0 PLN. Exempel: 2 vuxna + husbil + el = 180 PLN per natt. Receptionen bekräftar tillgänglighet.',
      currency: `${currencyEstimateConfig.shortDisclaimer} Exempel: 180 PLN är ${moneyExample}. ${currencyEstimateConfig.disclaimer}`,
      tram: 'Hållplatsen ligger cirka 40 m från grinden. Det är cirka 9 hållplatser och 14 minuter med spårvagn till Stary Kleparz / centrum.',
      fallback: 'CAMPY körs nu i informationsläge. Bokningar och tillgänglighet bekräftas av receptionen: +48 795 294 486 eller clepardia@gmail.com.',
    },
  }[lang];

  if (normalized.includes('plan')) return copy.plan;
  if ((normalized.includes('july') || normalized.includes('august') || normalized.includes('lip') || normalized.includes('sier') || normalized.includes('juli') || normalized.includes('agosto') || normalized.includes('julio') || normalized.includes('srpen') || normalized.includes('augusti'))
    && (normalized.includes('camp') || normalized.includes('kamper') || normalized.includes('camper') || normalized.includes('tent') || normalized.includes('namiot') || normalized.includes('caravan') || normalized.includes('przyczep') || normalized.includes('van'))) {
    return copy.summer;
  }
  if (normalized.includes('kamper') || normalized.includes('camper') || normalized.includes('motorhome') || normalized.includes('price') || normalized.includes('cost') || normalized.includes('cena') || normalized.includes('koszt') || normalized.includes('preis') || normalized.includes('precio')) {
    return copy.price;
  }
  if (normalized.includes('euro') || normalized.includes('eur') || normalized.includes('usd') || normalized.includes('dolar') || normalized.includes('dollar') || normalized.includes('gbp') || normalized.includes('funt') || normalized.includes('pound')) {
    return copy.currency;
  }
  if (normalized.includes('centrum') || normalized.includes('centre') || normalized.includes('center') || normalized.includes('tram') || normalized.includes('tranv') || normalized.includes('spårvagn') || normalized.includes('električ')) {
    return copy.tram;
  }
  return copy.fallback;
};
