export const LOW_SEASON = 'low';
export const HIGH_SEASON = 'high';

export const pricingConfig = {
  currency: 'PLN',
  seasons: {
    high: {
      label: 'Wysoki sezon',
      start: '07-01',
      end: '08-31',
    },
    low: {
      label: 'Niski sezon',
    },
    summerNoticeMonths: [6, 7, 8],
  },
  people: {
    adults: { label: 'Osoba dorosła', price: 35 },
    children: { label: 'Dziecko 4-14', price: 20 },
    toddlers: { label: 'Dziecko do 4', price: 0 },
  },
  stayTypes: [
    { id: 'camper', label: 'Kamper', category: 'camping', price: 80 },
    { id: 'caravan', label: 'Przyczepa', category: 'camping', price: 60 },
    { id: 'tent-small', label: 'Namiot 1-2 os.', category: 'camping', price: 35 },
    { id: 'tent-large', label: 'Namiot 3-4 os.', category: 'camping', price: 45 },
    { id: 'van', label: 'Van', category: 'camping', price: 75 },
    { id: 'rooftop-tent', label: 'Auto + namiot dachowy', category: 'camping', price: 50 },
    {
      id: 'bungalow-2',
      label: 'Domek 2-os.',
      category: 'bungalow',
      seasonalPrices: { low: 200, high: 220 },
    },
    {
      id: 'bungalow-3',
      label: 'Domek 3-os.',
      category: 'bungalow',
      seasonalPrices: { low: 250, high: 300 },
    },
    {
      id: 'bungalow-4',
      label: 'Domek 4-os.',
      category: 'bungalow',
      seasonalPrices: { low: 400, high: 450 },
    },
  ],
  addons: [
    { id: 'electricity', label: 'Prąd', price: 30 },
    { id: 'dog', label: 'Pies', price: 0 },
    { id: 'motorcycle', label: 'Motocykl', price: 25 },
    { id: 'cargo-trailer', label: 'Przyczepa bagażowa', price: 25 },
    { id: 'bus', label: 'Bus / ciężarówka', price: 160 },
    { id: 'parking', label: 'Samochód', price: 35 },
    { id: 'extra-car', label: 'Dodatkowe auto', price: 35 },
  ],
} as const;

export const currencyEstimateConfig = {
  baseCurrency: 'PLN',
  rates: {
    EUR: 4.30,
    USD: 4.00,
    GBP: 5.10,
  },
  disclaimer:
    'Przeliczenia EUR / USD / GBP są orientacyjne i informacyjne. Finalna kwota, forma płatności i ewentualny kurs są potwierdzane przez recepcję.',
  shortDisclaimer: 'Waluty obce pokazujemy wyłącznie orientacyjnie.',
} as const;

export type EstimateCurrency = keyof typeof currencyEstimateConfig.rates;

export const getCurrencyEstimates = (plnValue: number) => {
  const value = Math.max(0, Number(plnValue) || 0);
  return Object.fromEntries(
    Object.entries(currencyEstimateConfig.rates).map(([currency, rate]) => [
      currency,
      Math.round(value / rate),
    ]),
  ) as Record<EstimateCurrency, number>;
};

export const formatCurrencyEstimates = (plnValue: number) => {
  const estimates = getCurrencyEstimates(plnValue);
  return `ok. ${estimates.EUR} EUR / ${estimates.USD} USD / ${estimates.GBP} GBP`;
};
