export interface InquiryPeople {
  adults: number;
  children: number;
  toddlers: number;
}

export interface InquiryCalculatorSummary {
  total?: string;
  pricePerNight?: string;
  currencyEstimate?: string;
  currencyDisclaimer?: string;
  season?: string;
  breakdown?: string[];
}

export interface InquiryServiceLine {
  id: string;
  scope: string;
  label: string;
  qty: number;
  price: number;
}

export interface InquiryVehicleDetails {
  model: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  large: boolean;
  asphaltNeeded: boolean;
  notes: string;
  summary: string;
}

export interface ReservationInquiryPayload {
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  contactLanguage?: string;
  arrival?: string;
  departure?: string;
  arrivalIso?: string;
  departureIso?: string;
  nights?: number;
  stayType: string;
  stayTypeId?: string;
  stayCategory?: string;
  people?: InquiryPeople;
  addons?: string[];
  message?: string;
  summerNotice?: boolean;
  quietConsent?: boolean;
  consent?: boolean;
  privacyConsent?: boolean;
  website?: string;
  source?: string;
  locale?: string;
  calculatorSummary?: InquiryCalculatorSummary | null;
  stayMode?: string;
  selectedStayMode?: string;
  services?: InquiryServiceLine[];
  estimatedTotal?: number | string;
  currencyEstimate?: string;
  currencyDisclaimer?: string;
  vehiclePlate?: string;
  vehicleDetails?: Partial<InquiryVehicleDetails>;
  specialNeeds?: string;
  lateCheckout?: string;
  originalMessage?: string;
  translatedSummaryPl?: string;
}

export interface NormalizedReservationInquiry extends ReservationInquiryPayload {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  contactLanguage: string;
  arrival: string;
  departure: string;
  arrivalIso: string;
  departureIso: string;
  nights: number;
  stayType: string;
  stayTypeId: string;
  stayCategory: string;
  people: InquiryPeople;
  addons: string[];
  message: string;
  summerNotice: boolean;
  quietConsent: boolean;
  consent: boolean;
  privacyConsent: boolean;
  website: string;
  source: 'website';
  locale: string;
  submittedAt: string;
  inquiryId: string;
  selectedStayMode: string;
  services: InquiryServiceLine[];
  estimatedTotal: string;
  currencyEstimate: string;
  currencyDisclaimer: string;
  vehiclePlate: string;
  vehicleDetails: InquiryVehicleDetails;
  specialNeeds: string;
  lateCheckout: string;
  originalMessage: string;
  translatedSummaryPl: string;
}

export interface CcSystemLeadDraft {
  source: 'website';
  status: 'new';
  type: 'reservation_inquiry';
  customer: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    language: string;
  };
  stay: {
    arrivalIso: string;
    departureIso: string;
    nights: number;
    stayTypeId: string;
    stayType: string;
    stayCategory: string;
    people: InquiryPeople;
    addons: string[];
    services: InquiryServiceLine[];
    estimatedTotal: string;
    currencyEstimate: string;
    currencyDisclaimer: string;
    vehiclePlate: string;
    vehicleDetails: InquiryVehicleDetails;
    specialNeeds: string;
    lateCheckout: string;
    summerNotice: boolean;
    quietConsent: boolean;
    consent: boolean;
    privacyConsent: boolean;
  };
  notes: string;
  createdAt: string;
}

export interface MailMessage {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}

export interface MailDeliveryResult {
  provider: string;
  delivered: boolean;
  messageId?: string;
  reason?: string;
}
