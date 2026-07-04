import type {
  CcSystemLeadDraft,
  InquiryServiceLine,
  InquiryPeople,
  NormalizedReservationInquiry,
  ReservationInquiryPayload,
} from './types';
import {
  isValidEmail,
  sanitizeEmail,
  sanitizeInlineText,
  sanitizeText,
  toNonNegativeInteger,
} from './security';

const DAY = 24 * 60 * 60 * 1000;

const parseIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
};

const parseDisplayDate = (value: string) => {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return parseIsoDate(`${year}-${month}-${day}`);
};

const toIsoDate = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date) => {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getUTCFullYear()}`;
};

const normalizeDatePair = (payload: ReservationInquiryPayload) => {
  const arrival =
    parseIsoDate(sanitizeInlineText(payload.arrivalIso, 20)) ||
    parseDisplayDate(sanitizeInlineText(payload.arrival, 20));
  const departure =
    parseIsoDate(sanitizeInlineText(payload.departureIso, 20)) ||
    parseDisplayDate(sanitizeInlineText(payload.departure, 20));

  return { arrival, departure };
};

const normalizePeople = (people?: InquiryPeople): InquiryPeople => ({
  adults: toNonNegativeInteger(people?.adults, 0),
  children: toNonNegativeInteger(people?.children, 0),
  toddlers: toNonNegativeInteger(people?.toddlers, 0),
  bungalowGuests: toNonNegativeInteger(people?.bungalowGuests, 0),
  campingGuests: toNonNegativeInteger(people?.campingGuests, 0),
});

const normalizeStringList = (values: unknown, maxItems = 12, maxLength = 120) => {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => sanitizeInlineText(value, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
};

const normalizeFeedback = (feedback: ReservationInquiryPayload['feedback']) => {
  const value = feedback || {};
  return {
    rating: Math.min(5, toNonNegativeInteger(value.rating, 0)),
    liked: normalizeStringList(value.liked, 12, 80),
    improve: sanitizeText(value.improve, 800),
    easyInfo: sanitizeInlineText(value.easyInfo, 80),
    easyForm: sanitizeInlineText(value.easyForm, 80),
  };
};

const normalizeServices = (services?: InquiryServiceLine[]): InquiryServiceLine[] => {
  if (!Array.isArray(services)) return [];

  return services
    .map((service) => ({
      id: sanitizeInlineText(service?.id, 80),
      scope: sanitizeInlineText(service?.scope, 40),
      label: sanitizeInlineText(service?.label, 120),
      qty: toNonNegativeInteger(service?.qty, 0),
      price: Math.max(0, Number(service?.price || 0)),
    }))
    .filter((service) => service.id && service.label && service.qty > 0)
    .slice(0, 40);
};

const normalizeVehicleDetails = (details: ReservationInquiryPayload['vehicleDetails']) => {
  const vehicle = details || {};
  return {
    model: sanitizeInlineText(vehicle.model, 120),
    length: sanitizeInlineText(vehicle.length, 40),
    width: sanitizeInlineText(vehicle.width, 40),
    height: sanitizeInlineText(vehicle.height, 40),
    weight: sanitizeInlineText(vehicle.weight, 40),
    large: Boolean(vehicle.large),
    asphaltNeeded: Boolean(vehicle.asphaltNeeded),
    notes: sanitizeText(vehicle.notes, 700),
    summary: sanitizeText(vehicle.summary, 900),
  };
};

const createInquiryId = () => {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `WEB-${Date.now().toString(36).toUpperCase()}-${random}`;
};

export const normalizeReservationInquiry = (rawPayload: unknown) => {
  const payload = (rawPayload || {}) as ReservationInquiryPayload;
  const errors: Record<string, string> = {};
  const fullName = sanitizeInlineText(payload.fullName, 120);
  const email = sanitizeEmail(payload.email);
  const phone = sanitizeInlineText(payload.phone, 60);
  const country = sanitizeInlineText(payload.country, 100);
  const contactLanguage = sanitizeInlineText(payload.contactLanguage, 80) || 'Polski';
  const stayType = sanitizeInlineText(payload.stayType, 120);
  const stayTypeId = sanitizeInlineText(payload.stayTypeId, 80);
  const stayCategory = sanitizeInlineText(payload.stayCategory, 40);
  const selectedStayMode = sanitizeInlineText(payload.selectedStayMode || payload.stayMode || stayCategory, 40);
  const people = normalizePeople(payload.people);
  const tours = normalizeStringList(payload.tours, 12, 120);
  const arrivalTime = sanitizeInlineText(payload.arrivalTime, 120);
  const eventInterest = sanitizeInlineText(payload.eventInterest, 160);
  const feedback = normalizeFeedback(payload.feedback);
  const addons = Array.isArray(payload.addons)
    ? payload.addons.map((addon) => sanitizeInlineText(addon, 100)).filter(Boolean).slice(0, 12)
    : [];
  const message = sanitizeText(payload.message, 2400);
  const services = normalizeServices(payload.services);
  const estimatedTotal = sanitizeInlineText(payload.estimatedTotal, 80);
  const currencyEstimate = sanitizeInlineText(payload.currencyEstimate || payload.calculatorSummary?.currencyEstimate, 160);
  const currencyDisclaimer = sanitizeText(payload.currencyDisclaimer || payload.calculatorSummary?.currencyDisclaimer, 500);
  const vehiclePlate = sanitizeInlineText(payload.vehiclePlate, 80);
  const vehicleDetails = normalizeVehicleDetails(payload.vehicleDetails);
  const specialNeeds = sanitizeText(payload.specialNeeds, 1200);
  const lateCheckout = sanitizeInlineText(payload.lateCheckout, 120);
  const originalMessage = sanitizeText(payload.originalMessage, 2400);
  const translatedSummaryPl = sanitizeText(payload.translatedSummaryPl, 3000);
  const website = sanitizeInlineText(payload.website, 220);
  const locale = sanitizeInlineText(payload.locale, 12) || 'pl';
  const { arrival, departure } = normalizeDatePair(payload);

  if (!fullName) errors.fullName = 'Podaj imie i nazwisko.';
  if (!email && !phone) errors.contact = 'Podaj adres email albo telefon.';
  if (email && !isValidEmail(email)) errors.email = 'Podaj poprawny adres email.';
  if (!country) errors.country = 'Wybierz kraj.';
  if (!arrival) errors.arrival = 'Podaj date przyjazdu.';
  if (!departure) errors.departure = 'Podaj date wyjazdu.';
  if (arrival && departure && departure <= arrival) {
    errors.departure = 'Data wyjazdu musi byc po dacie przyjazdu.';
  }
  if (!stayType) errors.stayType = 'Wybierz typ pobytu.';
  if (!services.length && !addons.length) errors.services = 'Wybierz przynajmniej jedna opcje pobytu lub usluge.';
  if (!payload.quietConsent) errors.quietConsent = 'Potwierdz zasady ciszy nocnej.';
  if (!payload.consent) errors.consent = 'Zaakceptuj kontakt zwrotny.';
  if (!payload.privacyConsent) errors.privacyConsent = 'Zaakceptuj zgode na przetwarzanie danych.';

  const nightsFromDates = arrival && departure ? Math.max(1, Math.round((departure.getTime() - arrival.getTime()) / DAY)) : 0;
  const nights = nightsFromDates || toNonNegativeInteger(payload.nights, 0);
  if (arrival && departure && nights < 1) errors.departure = 'Minimum to 1 noc.';

  if (Object.keys(errors).length > 0) {
    return { ok: false as const, errors };
  }

  const submittedAt = new Date().toISOString();
  const inquiry: NormalizedReservationInquiry = {
    fullName,
    email,
    phone,
    country,
    contactLanguage,
    arrival: arrival ? formatDisplayDate(arrival) : '',
    departure: departure ? formatDisplayDate(departure) : '',
    arrivalIso: arrival ? toIsoDate(arrival) : '',
    departureIso: departure ? toIsoDate(departure) : '',
    nights,
    stayType,
    stayTypeId,
    stayCategory,
    selectedStayMode,
    people,
    addons,
    tours,
    arrivalTime,
    eventInterest,
    message,
    feedback,
    services,
    estimatedTotal,
    currencyEstimate,
    currencyDisclaimer,
    vehiclePlate,
    vehicleDetails,
    specialNeeds,
    lateCheckout,
    originalMessage,
    translatedSummaryPl,
    summerNotice: Boolean(payload.summerNotice),
    quietConsent: Boolean(payload.quietConsent),
    consent: Boolean(payload.consent),
    privacyConsent: Boolean(payload.privacyConsent),
    website,
    source: 'website',
    locale,
    calculatorSummary: payload.calculatorSummary || null,
    submittedAt,
    inquiryId: createInquiryId(),
  };

  return { ok: true as const, inquiry };
};

export const createCcSystemLeadDraft = (inquiry: NormalizedReservationInquiry): CcSystemLeadDraft => ({
  source: 'website',
  status: 'new',
  type: 'reservation_inquiry',
  customer: {
    fullName: inquiry.fullName,
    email: inquiry.email,
    phone: inquiry.phone,
    country: inquiry.country,
    language: inquiry.contactLanguage,
  },
  stay: {
    arrivalIso: inquiry.arrivalIso,
    departureIso: inquiry.departureIso,
    nights: inquiry.nights,
    stayTypeId: inquiry.stayTypeId,
    stayType: inquiry.stayType,
    stayCategory: inquiry.stayCategory,
    people: inquiry.people,
    addons: inquiry.addons,
    tours: inquiry.tours,
    arrivalTime: inquiry.arrivalTime,
    eventInterest: inquiry.eventInterest,
    services: inquiry.services,
    estimatedTotal: inquiry.estimatedTotal,
    currencyEstimate: inquiry.currencyEstimate,
    currencyDisclaimer: inquiry.currencyDisclaimer,
    vehiclePlate: inquiry.vehiclePlate,
    vehicleDetails: inquiry.vehicleDetails,
    specialNeeds: inquiry.specialNeeds,
    lateCheckout: inquiry.lateCheckout,
    summerNotice: inquiry.summerNotice,
    quietConsent: inquiry.quietConsent,
    consent: inquiry.consent,
    privacyConsent: inquiry.privacyConsent,
  },
  feedback: inquiry.feedback,
  notes: inquiry.message,
  createdAt: inquiry.submittedAt,
});
