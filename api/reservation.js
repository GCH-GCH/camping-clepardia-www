import {
  logInboxError,
  saveReservationInquiry,
  serializeInboxError,
  updateReservationMailStatus,
} from './_lib/inbox.js';

const DAY = 24 * 60 * 60 * 1000;
const MAX_BODY = 32_000;

const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader('cache-control', 'no-store');
  res.json(payload);
};

const oneLine = (value, max = 600) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const longText = (value, max = 2400) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const configured = (...values) => values.find((value) => String(value || '').trim()) || '';

const mailProvider = () => {
  const provider = String(process.env.MAIL_PROVIDER || 'auto').trim().toLowerCase();
  return ['auto', 'resend', 'formsubmit'].includes(provider) ? provider : 'auto';
};

const formSubmitEmail = () =>
  configured(process.env.FORMSUBMIT_TO_EMAIL, process.env.RESERVATION_TO_EMAIL, process.env.MAIL_TO, 'clepardia@gmail.com');

const mailEnvSnapshot = () => {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const from = configured(process.env.RESERVATION_FROM_EMAIL, process.env.MAIL_FROM, 'Camping Clepardia WWW <no-reply@clepardia.com.pl>');
  const to = configured(process.env.RESERVATION_TO_EMAIL, process.env.MAIL_TO, 'clepardia@gmail.com');
  const fromDomain = String(from).match(/@([^>\s]+)/)?.[1] || '';

  return {
    mailProvider: mailProvider(),
    resendKeyPresent: Boolean(apiKey),
    resendKeyStartsWithRe: apiKey.startsWith('re_'),
    resendKeyLength: apiKey.length,
    reservationFromPresent: Boolean(String(process.env.RESERVATION_FROM_EMAIL || '').trim()),
    reservationToPresent: Boolean(String(process.env.RESERVATION_TO_EMAIL || '').trim()),
    formSubmitToPresent: Boolean(formSubmitEmail()),
    fromDomain,
    toPresent: Boolean(to),
  };
};

const logMailEnv = (inquiryId) => {
  try {
    console.info('[reservation-api] mail-env', { inquiryId, ...mailEnvSnapshot() });
  } catch {
    // Logging must never block accepting an enquiry.
  }
};

const collectBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;

    req.on('data', (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      length += buffer.length;
      if (length > MAX_BODY) {
        reject(new Error('Payload too large.'));
        return;
      }
      chunks.push(buffer);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

const readPayload = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const rawBody = typeof req.body === 'string' ? req.body : await collectBody(req);
  const raw = String(rawBody || '').replace(/^\uFEFF/, '').trim();
  return raw ? JSON.parse(raw) : {};
};

const parseDate = (value) => {
  const raw = oneLine(value, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [year, month, day] = raw.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
};

const displayDate = (date) => {
  if (!date) return '';
  return `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`;
};

const normalizeServices = (payload) => {
  const services = Array.isArray(payload.services) ? payload.services : [];
  const addons = Array.isArray(payload.addons) ? payload.addons : [];

  return services
    .map((service) => ({
      id: oneLine(service?.id, 80),
      scope: oneLine(service?.scope, 40),
      label: oneLine(service?.label, 120),
      qty: Math.max(0, Math.floor(Number(service?.qty || 0))),
      price: Math.max(0, Number(service?.price || 0)),
    }))
    .filter((service) => service.id && service.label && service.qty > 0)
    .concat(
      addons
        .filter(Boolean)
        .slice(0, 12)
        .map((addon, index) => ({
          id: `addon-${index + 1}`,
          scope: 'legacy',
          label: oneLine(addon, 120),
          qty: 1,
          price: 0,
        })),
    )
    .slice(0, 40);
};

const validate = (payload) => {
  const errors = {};
  const arrival = parseDate(payload.arrivalIso || payload.arrival);
  const departure = parseDate(payload.departureIso || payload.departure);
  const services = normalizeServices(payload);
  const email = oneLine(payload.email, 254).toLowerCase();
  const phone = oneLine(payload.phone, 80);

  if (!oneLine(payload.fullName, 140)) errors.fullName = 'Podaj imie i nazwisko.';
  if (!email && !phone) errors.contact = 'Podaj adres email albo telefon.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Podaj poprawny adres email.';
  if (!oneLine(payload.country, 120)) errors.country = 'Wybierz kraj.';
  if (!arrival) errors.arrival = 'Podaj date przyjazdu.';
  if (!departure) errors.departure = 'Podaj date wyjazdu.';
  if (arrival && departure && departure <= arrival) errors.departure = 'Data wyjazdu musi byc po dacie przyjazdu.';
  if (!oneLine(payload.stayType || payload.selectedStayMode, 140)) errors.stayType = 'Wybierz typ pobytu.';
  if (!services.length) errors.services = 'Wybierz przynajmniej jedna opcje pobytu lub usluge.';
  if (!payload.quietConsent) errors.quietConsent = 'Potwierdz zasady ciszy nocnej.';
  if (!payload.consent) errors.consent = 'Zaakceptuj kontakt zwrotny.';
  if (!payload.privacyConsent) errors.privacyConsent = 'Zaakceptuj zgode na przetwarzanie danych.';

  return { errors, arrival, departure, services, email, phone };
};

const createInquiry = (payload, normalized) => {
  const nights = normalized.arrival && normalized.departure
    ? Math.max(1, Math.round((normalized.departure.getTime() - normalized.arrival.getTime()) / DAY))
    : Math.max(0, Number(payload.nights || 0));

  return {
    inquiryId: `WEB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    submittedAt: new Date().toISOString(),
    fullName: oneLine(payload.fullName, 140),
    email: normalized.email,
    phone: normalized.phone,
    country: oneLine(payload.country, 120),
    contactLanguage: oneLine(payload.contactLanguage || payload.locale || 'PL', 40),
    stayType: oneLine(payload.stayType || payload.selectedStayMode, 140),
    stayTypeId: oneLine(payload.stayTypeId, 80),
    stayCategory: oneLine(payload.stayCategory, 40),
    selectedStayMode: oneLine(payload.selectedStayMode || payload.stayMode || payload.stayCategory, 40),
    arrivalIso: oneLine(payload.arrivalIso, 20),
    departureIso: oneLine(payload.departureIso, 20),
    arrival: displayDate(normalized.arrival),
    departure: displayDate(normalized.departure),
    nights,
    people: {
      adults: Math.max(0, Math.floor(Number(payload.people?.adults || 0))),
      children: Math.max(0, Math.floor(Number(payload.people?.children || 0))),
      toddlers: Math.max(0, Math.floor(Number(payload.people?.toddlers || 0))),
    },
    services: normalized.services,
    tours: (Array.isArray(payload.tours) ? payload.tours : [])
      .map((tour) => oneLine(tour, 120))
      .filter(Boolean)
      .slice(0, 12),
    arrivalTime: oneLine(payload.arrivalTime, 120),
    highSeasonCampingInfo: Boolean(payload.highSeasonCampingInfo),
    bungalowPersonalItemsNotice: Boolean(payload.bungalowPersonalItemsNotice),
    estimatedTotal: oneLine(payload.estimatedTotal || payload.calculatorSummary?.total, 80),
    currencyEstimate: oneLine(payload.currencyEstimate || payload.calculatorSummary?.currencyEstimate, 160),
    currencyDisclaimer: longText(
      payload.currencyDisclaimer
        || payload.calculatorSummary?.currencyDisclaimer
        || 'Przeliczenia EUR / USD / GBP są orientacyjne i informacyjne. Finalna kwota, forma płatności i ewentualny kurs są potwierdzane przez recepcję.',
      500,
    ),
    calculatorSummary: payload.calculatorSummary || null,
    vehiclePlate: oneLine(payload.vehiclePlate, 80),
    specialNeeds: longText(payload.specialNeeds, 1200),
    lateCheckout: oneLine(payload.lateCheckout, 160),
    message: longText(payload.message || payload.originalMessage, 2400),
    quietConsent: Boolean(payload.quietConsent),
    consent: Boolean(payload.consent),
    privacyConsent: Boolean(payload.privacyConsent),
    website: oneLine(payload.website, 220),
    summerNotice: Boolean(payload.summerNotice),
  };
};

const hasBungalow = (inquiry) =>
  /bungalow|domek|domki|combined|razem/i.test(`${inquiry.selectedStayMode} ${inquiry.stayCategory} ${inquiry.stayType}`);

const customerConfirmationEnabled = () =>
  /^true$/i.test(String(process.env.SEND_CUSTOMER_CONFIRMATION || '').trim());

const createCcSystemDraft = (inquiry) => ({
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
    services: inquiry.services,
    tours: inquiry.tours,
    arrivalTime: inquiry.arrivalTime,
    highSeasonCampingInfo: inquiry.highSeasonCampingInfo,
    bungalowPersonalItemsNotice: inquiry.bungalowPersonalItemsNotice,
    estimatedTotal: inquiry.estimatedTotal,
    currencyEstimate: inquiry.currencyEstimate,
    currencyDisclaimer: inquiry.currencyDisclaimer,
    vehiclePlate: inquiry.vehiclePlate,
    specialNeeds: inquiry.specialNeeds,
    lateCheckout: inquiry.lateCheckout,
    summerNotice: inquiry.summerNotice,
    quietConsent: inquiry.quietConsent,
    consent: inquiry.consent,
    privacyConsent: inquiry.privacyConsent,
  },
  notes: inquiry.message,
  createdAt: inquiry.submittedAt,
});

const numericTotal = (value) => {
  const match = String(value || '').replace(',', '.').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const createSupabaseRecord = (inquiry, payload) => ({
  status: inquiry.website ? 'spam' : 'new',
  source: oneLine(payload.source || 'website', 80),
  stay_type: inquiry.stayType,
  language: inquiry.contactLanguage,
  country: inquiry.country,
  full_name: inquiry.fullName,
  email: inquiry.email || null,
  phone: inquiry.phone || null,
  arrival_date: inquiry.arrivalIso,
  departure_date: inquiry.departureIso,
  nights: inquiry.nights,
  services_json: inquiry.services,
  estimated_total_pln: numericTotal(inquiry.estimatedTotal),
  estimated_currency_json: inquiry.calculatorSummary || {
    estimate: inquiry.currencyEstimate,
    disclaimer: inquiry.currencyDisclaimer,
  },
  vehicle_registration: inquiry.vehiclePlate || null,
  vehicle_details_json: payload.vehicleDetails || null,
  special_needs: inquiry.specialNeeds || null,
  trips_interest_json: inquiry.tours,
  consents_json: {
    quiet: inquiry.quietConsent,
    contact: inquiry.consent,
    privacy: inquiry.privacyConsent,
  },
  message: inquiry.message || null,
  notes: '',
  mail_provider: 'none',
  mail_delivered: false,
  mail_error: null,
  raw_payload_json: payload,
});

const buildReceptionMail = (inquiry) => {
  const depositNote = hasBungalow(inquiry)
    ? 'W przypadku domkow moze byc wymagana zaliczka. Dane do zaliczki nalezy wyslac klientowi w odpowiedzi mailowej po potwierdzeniu dostepnosci.'
    : '';
  const services = inquiry.services.map((service) => `${service.label} x ${service.qty} (${service.price} PLN / noc)`);
  const serviceGroups = inquiry.services.reduce((groups, service) => {
    const scope = /bungalow/i.test(service.scope) ? 'Domki' : /camping/i.test(service.scope) ? 'Camping' : 'Pozostale';
    groups[scope] = groups[scope] || [];
    groups[scope].push(`${service.label} x ${service.qty} (${service.price} PLN / noc)`);
    return groups;
  }, {});
  const guests = [
    inquiry.people.adults ? `Dorosli: ${inquiry.people.adults}` : '',
    inquiry.people.children ? `Dzieci 4-14: ${inquiry.people.children}` : '',
    inquiry.people.toddlers ? `Dzieci do 4: ${inquiry.people.toddlers}` : '',
  ].filter(Boolean).join(', ') || 'brak';
  const rows = [
    ['ID', inquiry.inquiryId],
    ['Zapis do panelu', 'zapisano w reservation_inquiries'],
    ['Panel recepcji', 'https://camping-clepardia-www.vercel.app/cc-gate-a8f3k9r2p6'],
    ['Status', 'Do potwierdzenia przez recepcje'],
    ['Typ pobytu', inquiry.stayType],
    ['Termin', `${inquiry.arrival} - ${inquiry.departure}`],
    ['Orientacyjna godzina przyjazdu', inquiry.arrivalTime || 'jeszcze nie wiem'],
    ['Noce', inquiry.nights],
    ['Goscie', guests],
    ['Cena orientacyjna', inquiry.estimatedTotal || 'brak'],
    ['Waluty orientacyjnie', inquiry.currencyEstimate || 'brak'],
    ['Imie i nazwisko', inquiry.fullName],
    ['Email', inquiry.email],
    ['Telefon', inquiry.phone],
    ['Kraj', inquiry.country],
    ['Jezyk kontaktu', inquiry.contactLanguage],
    ['Numer rejestracyjny', inquiry.vehiclePlate || 'brak'],
    ['Specjalne potrzeby', inquiry.specialNeeds || 'brak'],
    ['Pozniejszy wyjazd', inquiry.lateCheckout || 'brak'],
    ['Wycieczki (bez doliczania ceny)', inquiry.tours.join(', ') || 'brak'],
    ['Lipiec/sierpień — camping bez rezerwacji', inquiry.highSeasonCampingInfo ? 'TAK — przekazano informację o kolejności przyjazdu' : 'nie dotyczy'],
    ['Domki — własne ręczniki i rzeczy osobiste', inquiry.bungalowPersonalItemsNotice ? 'przekazano klientowi' : 'nie dotyczy'],
    ['Cisza nocna', inquiry.quietConsent ? 'zaakceptowana' : 'brak'],
    ['Zgoda kontaktowa', inquiry.consent ? 'zaakceptowana' : 'brak'],
    ['Zgoda RODO', inquiry.privacyConsent ? 'zaakceptowana' : 'brak'],
  ];
  const rowHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:9px 0;color:#61736a;border-top:1px solid #e6f1ea;">${escapeHtml(label)}</td>
      <td style="padding:9px 0;color:#102319;font-weight:800;text-align:right;border-top:1px solid #e6f1ea;">${escapeHtml(value || 'brak')}</td>
    </tr>
  `).join('');
  const serviceHtml = services.map((service) => `
    <li style="padding:9px 0;border-top:1px solid #e6f1ea;color:#102319;font-weight:800;">${escapeHtml(service)}</li>
  `).join('');
  const groupedServiceText = Object.keys(serviceGroups).length
    ? Object.entries(serviceGroups).map(([group, items]) => [
        `${group}:`,
        ...items.map((item) => `- ${item}`),
      ].join('\n')).join('\n\n')
    : 'brak';
  const groupedServiceHtml = Object.keys(serviceGroups).length
    ? Object.entries(serviceGroups).map(([group, items]) => `
        <section style="margin-top:12px;padding:12px 14px;border:1px solid #e6f1ea;border-radius:14px;background:#f7fbf8;">
          <h3 style="margin:0 0 8px;font-size:14px;color:#24794e;">${escapeHtml(group)}</h3>
          <ul style="list-style:none;margin:0;padding:0;">
            ${items.map((item) => `<li style="padding:7px 0;border-top:1px solid #e6f1ea;color:#102319;font-weight:800;">${escapeHtml(item)}</li>`).join('')}
          </ul>
        </section>
      `).join('')
    : '';
  const bodyHtml = `
    <div style="font-family:Arial,sans-serif;background:#eef7f1;padding:28px;color:#102319;">
      <div style="max-width:760px;margin:0 auto;">
        <header style="padding:26px 28px;border-radius:24px;background:linear-gradient(135deg,#0b1f15,#1b3b2a);color:#fff;">
          <p style="display:inline-block;margin:0 0 12px;padding:7px 11px;border-radius:999px;background:rgba(60,179,113,.18);color:#9cf2bf;font-size:12px;font-weight:900;text-transform:uppercase;">Nowe zapytanie</p>
          <h1 style="margin:0;font-size:27px;">Camping Clepardia</h1>
          <p style="margin:12px 0 0;color:#d7efe0;">${escapeHtml(inquiry.stayType)} - ${escapeHtml(inquiry.arrival)} - ${escapeHtml(inquiry.departure)} - ${escapeHtml(inquiry.inquiryId)}</p>
        </header>
        <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#fff;">
          <h2 style="margin:0 0 12px;font-size:17px;">Dane zapytania</h2>
          <table role="presentation" style="width:100%;border-collapse:collapse;">${rowHtml}</table>
        </section>
        <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#fff;">
          <h2 style="margin:0 0 12px;font-size:17px;">Uslugi i ceny</h2>
          <ul style="list-style:none;margin:0;padding:0;">${serviceHtml}</ul>
          ${groupedServiceHtml}
        </section>
        <section style="margin:18px 0;padding:16px 18px;border-radius:18px;background:#eef8f1;border:1px solid #dceee4;color:#102319;">
          <h2 style="margin:0 0 8px;font-size:16px;">Waluty orientacyjne</h2>
          <p style="margin:0 0 8px;line-height:1.55;font-weight:800;">${escapeHtml(inquiry.currencyEstimate || 'brak')}</p>
          <p style="margin:0;line-height:1.55;color:#4b5b51;">${escapeHtml(inquiry.currencyDisclaimer)}</p>
        </section>
        <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#fff;">
          <h2 style="margin:0 0 12px;font-size:17px;">Wiadomosc klienta</h2>
          <p style="white-space:pre-wrap;line-height:1.65;margin:0;">${escapeHtml(inquiry.message || 'brak')}</p>
        </section>
        ${depositNote ? `<section style="margin:18px 0;padding:18px 20px;border-radius:18px;background:#fff8ea;border:1px solid #f0d7a6;color:#4c3b13;"><strong>Zaliczka</strong><p style="margin:8px 0 0;line-height:1.6;">${escapeHtml(depositNote)}</p></section>` : ''}
        <footer style="padding:18px 6px;color:#54675d;font-size:12px;line-height:1.6;">Status: do potwierdzenia przez recepcje. To zapytanie nie potwierdza automatycznie rezerwacji.</footer>
      </div>
    </div>
  `;
  const bodyText = [
    'Nowe zapytanie rezerwacyjne - Camping Clepardia',
    '',
    ...rows.map(([label, value]) => `${label}: ${value || 'brak'}`),
    '',
    'USLUGI I CENY',
    ...(services.length ? services.map((service) => `- ${service}`) : ['- brak']),
    '',
    `Waluty orientacyjnie: ${inquiry.currencyEstimate || 'brak'}`,
    inquiry.currencyDisclaimer,
    '',
    'SEKCJE',
    groupedServiceText,
    '',
    'WIADOMOSC KLIENTA',
    inquiry.message || 'brak',
    '',
    depositNote,
    'Status: do potwierdzenia przez recepcje. To zapytanie nie potwierdza automatycznie rezerwacji.',
  ].filter(Boolean).join('\n');

  return {
    from: configured(process.env.RESERVATION_FROM_EMAIL, process.env.MAIL_FROM, 'Camping Clepardia WWW <no-reply@clepardia.com.pl>'),
    to: configured(process.env.RESERVATION_TO_EMAIL, process.env.MAIL_TO, 'clepardia@gmail.com'),
    replyTo: inquiry.email || undefined,
    subject: `Nowe zapytanie rezerwacyjne - Camping Clepardia - ${inquiry.stayType} - ${inquiry.arrival} - ${inquiry.departure}`,
    html: bodyHtml,
    text: bodyText,
  };
};

const buildCustomerMail = (inquiry) => {
  const depositNote = hasBungalow(inquiry)
    ? 'W przypadku domkow moze byc wymagana zaliczka. Szczegoly otrzymasz w odpowiedzi po sprawdzeniu dostepnosci.'
    : '';
  const services = inquiry.services.map((service) => `${service.label} x ${service.qty}`);
  const rows = [
    ['Typ pobytu', inquiry.stayType],
    ['Termin', `${inquiry.arrival} - ${inquiry.departure}`],
    ['Orientacyjna godzina przyjazdu', inquiry.arrivalTime || 'jeszcze nie wiem'],
    ['Noce', inquiry.nights],
    ['Goscie', [
      inquiry.people.adults ? `dorosli: ${inquiry.people.adults}` : '',
      inquiry.people.children ? `dzieci 4-14: ${inquiry.people.children}` : '',
      inquiry.people.toddlers ? `dzieci do 4: ${inquiry.people.toddlers}` : '',
    ].filter(Boolean).join(', ') || 'brak'],
    ['Uslugi', services.length ? services.join(', ') : 'brak'],
    ['Cena orientacyjna', inquiry.estimatedTotal || 'do potwierdzenia'],
    ['Waluty orientacyjnie', inquiry.currencyEstimate || 'brak'],
  ];
  const rowHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:9px 0;color:#61736a;border-top:1px solid #e6f1ea;">${escapeHtml(label)}</td>
      <td style="padding:9px 0;color:#102319;font-weight:800;text-align:right;border-top:1px solid #e6f1ea;">${escapeHtml(value || 'brak')}</td>
    </tr>
  `).join('');
  const bodyHtml = `
    <div style="font-family:Arial,sans-serif;background:#eef7f1;padding:28px;color:#102319;">
      <div style="max-width:720px;margin:0 auto;">
        <header style="padding:24px 26px;border-radius:24px;background:linear-gradient(135deg,#0b1f15,#1b3b2a);color:#fff;">
          <p style="display:inline-block;margin:0 0 12px;padding:7px 11px;border-radius:999px;background:rgba(60,179,113,.18);color:#9cf2bf;font-size:12px;font-weight:900;text-transform:uppercase;">Otrzymalismy zapytanie</p>
          <h1 style="margin:0;font-size:26px;">Camping Clepardia</h1>
          <p style="margin:12px 0 0;color:#d7efe0;">To nie jest automatyczne potwierdzenie rezerwacji. Recepcja sprawdzi dostepnosc i odpowie mozliwie szybko.</p>
        </header>
        <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#fff;">
          <h2 style="margin:0 0 12px;font-size:17px;">Twoje zapytanie</h2>
          <table role="presentation" style="width:100%;border-collapse:collapse;">${rowHtml}</table>
        </section>
        ${depositNote ? `<section style="margin:18px 0;padding:18px 20px;border-radius:18px;background:#fff8ea;border:1px solid #f0d7a6;color:#4c3b13;"><strong>Zaliczka przy domkach</strong><p style="margin:8px 0 0;line-height:1.6;">${escapeHtml(depositNote)}</p></section>` : ''}
        <section style="margin:18px 0;padding:16px 18px;border-radius:18px;background:#eef8f1;border:1px solid #dceee4;color:#102319;">
          <strong>Waluty orientacyjne</strong>
          <p style="margin:8px 0 0;line-height:1.6;">${escapeHtml(inquiry.currencyEstimate || 'brak')}</p>
          <p style="margin:8px 0 0;line-height:1.6;color:#4b5b51;">${escapeHtml(inquiry.currencyDisclaimer)}</p>
        </section>
        <section style="margin:18px 0;padding:18px 20px;border-radius:18px;background:#fff;border:1px solid #dceee4;color:#102319;">
          <p style="margin:0;line-height:1.65;">Cisza nocna obowiazuje od 22:00 do 07:00. Dojazd najlepiej sprawdzic w Google Maps: ul. Henryka Pachonskiego 28A, Krakow.</p>
        </section>
        <footer style="padding:18px 6px;color:#54675d;font-size:12px;line-height:1.6;">Kontakt: clepardia@gmail.com, +48 795 294 486. Finalne warunki potwierdza recepcja.</footer>
      </div>
    </div>
  `;
  const bodyText = [
    'Otrzymalismy Twoje zapytanie - Camping Clepardia',
    '',
    'To nie jest automatyczne potwierdzenie rezerwacji. Recepcja sprawdzi dostepnosc i odpowie mozliwie szybko.',
    '',
    ...rows.map(([label, value]) => `${label}: ${value || 'brak'}`),
    inquiry.currencyDisclaimer,
    '',
    depositNote,
    'Cisza nocna: 22:00-07:00.',
    'Kontakt: clepardia@gmail.com, +48 795 294 486.',
  ].filter(Boolean).join('\n');

  return {
    from: configured(process.env.RESERVATION_FROM_EMAIL, process.env.MAIL_FROM, 'Camping Clepardia WWW <no-reply@clepardia.com.pl>'),
    to: inquiry.email,
    replyTo: configured(process.env.RESERVATION_TO_EMAIL, process.env.MAIL_TO, 'clepardia@gmail.com'),
    subject: 'Otrzymalismy Twoje zapytanie - Camping Clepardia',
    html: bodyHtml,
    text: bodyText,
  };
};

const normalizeResendError = (body, status) => {
  const rawCode = oneLine(body?.name || body?.code || body?.error || `RESEND_${status}`, 120);
  const rawMessage = oneLine(body?.message || body?.error || `Resend returned ${status}.`, 800);
  const normalized = `${rawCode} ${rawMessage}`.toLowerCase();

  if (status === 401 || normalized.includes('api key is invalid') || normalized.includes('invalid api key')) {
    return {
      errorCode: 'invalid_api_key',
      message: 'Resend API key is invalid. Generate a new key in Resend and update RESEND_API_KEY in Vercel.',
      reason: rawMessage,
    };
  }

  if (status === 403 || normalized.includes('domain') || normalized.includes('sender') || normalized.includes('from') || normalized.includes('verify')) {
    return {
      errorCode: 'sender_rejected',
      message: 'Resend wymaga zweryfikowanego nadawcy/domeny.',
      reason: 'Resend wymaga zweryfikowanego nadawcy/domeny.',
    };
  }

  return {
    errorCode: rawCode,
    message: rawMessage,
    reason: rawMessage,
  };
};

const isResendFallbackError = (result) =>
  ['invalid_api_key', 'sender_rejected'].includes(String(result?.errorCode || '').toLowerCase())
  || [401, 403].includes(Number(result?.status || 0));

const normalizeFormSubmitError = (body, status) => {
  const rawMessage = oneLine(body?.message || body?.error || body?.reason || `FormSubmit returned ${status}.`, 800);
  const normalized = rawMessage.toLowerCase();
  if (status === 403 || normalized.includes('activate') || normalized.includes('activation') || normalized.includes('confirm')) {
    return {
      errorCode: 'formsubmit_activation_required',
      message: 'FormSubmit zwrócił 403 — prawdopodobnie wymagana ponowna aktywacja lub endpoint jest zablokowany.',
      reason: 'FormSubmit zwrócił 403 — prawdopodobnie wymagana ponowna aktywacja lub endpoint jest zablokowany.',
    };
  }
  return {
    errorCode: oneLine(body?.code || body?.error || `FORMSUBMIT_${status}`, 120),
    message: rawMessage,
    reason: rawMessage,
  };
};

const buildFormSubmitPayload = (message, inquiry) => ({
  _subject: message.subject,
  _template: 'table',
  _captcha: 'false',
  _replyto: inquiry.email || '',
  _autoresponse: '',
  inquiry_id: inquiry.inquiryId,
  zapis_do_panelu: 'zapisano w reservation_inquiries',
  status: 'Do potwierdzenia przez recepcje',
  typ_pobytu: inquiry.stayType,
  termin: `${inquiry.arrival} - ${inquiry.departure}`,
  orientacyjna_godzina_przyjazdu: inquiry.arrivalTime || 'jeszcze nie wiem',
  liczba_nocy: inquiry.nights,
  goscie: [
    inquiry.people.adults ? `Dorosli: ${inquiry.people.adults}` : '',
    inquiry.people.children ? `Dzieci 4-14: ${inquiry.people.children}` : '',
    inquiry.people.toddlers ? `Dzieci do 4: ${inquiry.people.toddlers}` : '',
  ].filter(Boolean).join(', ') || 'brak',
  uslugi: inquiry.services.map((service) => `${service.scope ? `[${service.scope}] ` : ''}${service.label} x ${service.qty} - ${service.price} PLN / noc`).join('\n') || 'brak',
  cena_orientacyjna: inquiry.estimatedTotal || 'brak',
  waluty_orientacyjnie: inquiry.currencyEstimate || 'brak',
  informacja_o_walutach: inquiry.currencyDisclaimer || 'Waluty obce pokazujemy wylacznie orientacyjnie.',
  kraj: inquiry.country || 'brak',
  jezyk_kontaktu: inquiry.contactLanguage || 'brak',
  imie_i_nazwisko: inquiry.fullName || 'brak',
  email: inquiry.email || 'brak',
  telefon: inquiry.phone || 'brak',
  numer_rejestracyjny: inquiry.vehiclePlate || 'brak',
  specjalne_potrzeby: inquiry.specialNeeds || 'brak',
  pozniejszy_wyjazd: inquiry.lateCheckout || 'brak',
  wycieczki_bez_doliczania_ceny: inquiry.tours.join(', ') || 'brak',
  camping_lipiec_sierpien_bez_rezerwacji: inquiry.highSeasonCampingInfo ? 'TAK — według kolejności przyjazdu' : 'nie dotyczy',
  domki_wlasne_reczniki_i_rzeczy_osobiste: inquiry.bungalowPersonalItemsNotice ? 'informacja przekazana' : 'nie dotyczy',
  wiadomosc_klienta: inquiry.message || 'brak',
  zgoda_cisza_nocna: inquiry.quietConsent ? 'zaakceptowana' : 'brak',
  zgoda_kontaktowa: inquiry.consent ? 'zaakceptowana' : 'brak',
  zgoda_prywatnosc: inquiry.privacyConsent ? 'zaakceptowana' : 'brak',
  informacja: 'Dostepnosc i finalne warunki potwierdza recepcja.',
  podsumowanie: message.text,
});

const sendWithResend = async (message) => {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    return {
      provider: 'mock',
      delivered: false,
      reason: 'RESEND_API_KEY is not configured - mail body prepared but not sent.',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to.split(',').map((item) => item.trim()).filter(Boolean),
        reply_to: message.replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const normalizedError = normalizeResendError(body, response.status);
      console.error('[reservation-api] resend-provider-error', {
        status: response.status,
        errorCode: normalizedError.errorCode,
        reason: normalizedError.reason,
      });
      return {
        provider: 'resend',
        delivered: false,
        status: response.status,
        ...normalizedError,
      };
    }

    return {
      provider: 'resend',
      delivered: true,
      messageId: body?.id || '',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Resend request failed.';
    return {
      provider: 'resend',
      delivered: false,
      errorCode: 'RESEND_REQUEST_FAILED',
      message,
      reason: message,
    };
  }
};

const sendWithFormSubmit = async (message, inquiry) => {
  const to = formSubmitEmail();
  if (!to) {
    return {
      provider: 'mock',
      delivered: false,
      reason: 'FORMSUBMIT_TO_EMAIL / RESERVATION_TO_EMAIL is not configured - mail body prepared but not sent.',
    };
  }

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        origin: 'https://camping-clepardia-www.vercel.app',
        referer: 'https://camping-clepardia-www.vercel.app/rezerwacja',
        'user-agent': 'Camping Clepardia reservation API',
      },
      body: JSON.stringify(buildFormSubmitPayload(message, inquiry)),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok || body?.success === false) {
      const normalizedError = normalizeFormSubmitError(body, response.status);
      console.error('[reservation-api] formsubmit-provider-error', {
        status: response.status,
        errorCode: normalizedError.errorCode,
        reason: normalizedError.reason,
      });
      return {
        provider: 'formsubmit',
        delivered: false,
        status: response.status,
        activationNotice: normalizedError.errorCode === 'formsubmit_activation_required',
        activationRequired: normalizedError.errorCode === 'formsubmit_activation_required',
        ...normalizedError,
      };
    }

    return {
      provider: 'formsubmit',
      delivered: true,
      messageId: oneLine(body?.submission_id || body?.message || body?.next || '', 180),
      activationNotice: false,
      message: 'Sent through FormSubmit.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'FormSubmit request failed.';
    return {
      provider: 'formsubmit',
      delivered: false,
      errorCode: 'FORMSUBMIT_REQUEST_FAILED',
      message,
      reason: message,
    };
  }
};

const sendReceptionMail = async (message, inquiry) => {
  const provider = mailProvider();
  if (provider === 'resend') return sendWithResend(message);
  if (provider === 'formsubmit') return sendWithFormSubmit(message, inquiry);

  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) return sendWithFormSubmit(message, inquiry);

  const resend = await sendWithResend(message);
  if (resend.delivered) return resend;
  if (!isResendFallbackError(resend)) return resend;

  const formsubmit = await sendWithFormSubmit(message, inquiry);
  return {
    ...formsubmit,
    fallbackFrom: {
      provider: 'resend',
      delivered: false,
      status: resend.status || null,
      errorCode: resend.errorCode || 'RESEND_ERROR',
      message: resend.message || resend.reason || 'Resend delivery failed.',
      reason: resend.reason || '',
    },
  };
};

const sendCustomerConfirmation = async (message) => {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    return {
      provider: 'mock',
      delivered: false,
      reason: 'Customer autoresponder template is ready, but RESEND_API_KEY is not configured.',
    };
  }
  return sendWithResend(message);
};

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('allow', 'POST, OPTIONS');
      return sendJson(res, 200, {
        ok: true,
        inquirySaved: false,
        provider: 'none',
        delivered: false,
        error: null,
        reason: 'Preflight response.',
        inquiryId: null,
      });
    }

    if (req.method !== 'POST') {
      res.setHeader('allow', 'POST, OPTIONS');
      return sendJson(res, 405, {
        ok: false,
        inquirySaved: false,
        provider: 'none',
        delivered: false,
        code: 'METHOD_NOT_ALLOWED',
        error: 'METHOD_NOT_ALLOWED',
        reason: 'Method not allowed.',
        inquiryId: null,
        message: 'Method not allowed.',
      });
    }

    const payload = await readPayload(req);
    const normalized = validate(payload);

    if (Object.keys(normalized.errors).length) {
      return sendJson(res, 400, {
        ok: false,
        inquirySaved: false,
        provider: 'none',
        delivered: false,
        error: 'VALIDATION_ERROR',
        reason: 'Reservation payload validation failed.',
        inquiryId: null,
        errors: normalized.errors,
      });
    }

    const inquiry = createInquiry(payload, normalized);
    let saved;
    try {
      saved = await saveReservationInquiry(createSupabaseRecord(inquiry, payload));
      inquiry.inquiryId = String(saved.id);
    } catch (error) {
      logInboxError('reservation-save', error);
      const diagnostic = serializeInboxError(error);
      return sendJson(res, diagnostic.status, {
        ok: false,
        inquirySaved: false,
        inquiryId: null,
        provider: 'none',
        delivered: false,
        code: diagnostic.payload.code,
        error: diagnostic.payload.error,
        reason: diagnostic.payload.error,
        details: diagnostic.payload.details,
        ...(diagnostic.payload.missing ? { missing: diagnostic.payload.missing } : {}),
        ...(diagnostic.payload.valuePreview ? { valuePreview: diagnostic.payload.valuePreview } : {}),
        ...(diagnostic.payload.supabaseStatus ? { supabaseStatus: diagnostic.payload.supabaseStatus } : {}),
      });
    }

    if (inquiry.website) {
      return sendJson(res, 200, {
        ok: true,
        inquirySaved: true,
        provider: 'none',
        delivered: false,
        error: null,
        reason: 'Spam-filtered submission.',
        inquiryId: inquiry.inquiryId,
        mode: 'spam-filtered',
      });
    }

    logMailEnv(inquiry.inquiryId);
    const reception = await sendReceptionMail(buildReceptionMail(inquiry), inquiry);
    const mailError = reception.delivered
      ? null
      : oneLine(reception.message || reception.reason || reception.errorCode || 'Mail delivery failed.', 1200);
    let inboxUpdateError = '';
    try {
      await updateReservationMailStatus(inquiry.inquiryId, {
        mail_provider: reception.fallbackFrom ? 'fallback' : (reception.provider || 'none'),
        mail_delivered: Boolean(reception.delivered),
        mail_error: mailError,
      });
    } catch (error) {
      const diagnostic = serializeInboxError(error);
      inboxUpdateError = diagnostic.payload.error;
      logInboxError('reservation-mail-status-update', error, { inquiryId: inquiry.inquiryId });
    }
    const mail = {
      reception,
      autoresponder: {
        provider: reception.provider,
        delivered: false,
        reason: customerConfirmationEnabled()
          ? 'Customer autoresponder was not attempted because reception mail did not finish yet.'
          : 'Customer autoresponder template is prepared. Set SEND_CUSTOMER_CONFIRMATION=true to enable it.',
      },
    };

    if (!reception.delivered && reception.provider === 'formsubmit' && reception.activationNotice) {
      return sendJson(res, 200, {
        ok: true,
        inquirySaved: true,
        provider: reception.fallbackFrom ? 'fallback' : 'formsubmit',
        delivered: false,
        error: reception.errorCode || 'formsubmit_activation_required',
        reason: [reception.reason || reception.message, inboxUpdateError].filter(Boolean).join(' | '),
        mode: 'formsubmit',
        inquiryId: inquiry.inquiryId,
        message: reception.message,
        mail,
        ccSystemDraft: createCcSystemDraft(inquiry),
      });
    }

    if (!reception.delivered && reception.provider !== 'mock') {
      console.error('[reservation-api] mail-error', {
        inquiryId: inquiry.inquiryId,
        provider: reception.provider || 'unknown',
        status: reception.status || null,
        errorCode: reception.errorCode || 'MAIL_ERROR',
        message: reception.message || reception.reason || 'Mail delivery failed.',
      });
      return sendJson(res, 200, {
        ok: true,
        inquirySaved: true,
        mode: 'mail-error',
        provider: reception.fallbackFrom ? 'fallback' : (reception.provider || 'none'),
        delivered: false,
        error: reception.errorCode || 'MAIL_ERROR',
        reason: [reception.reason || reception.message || 'Mail delivery failed.', inboxUpdateError].filter(Boolean).join(' | '),
        errorCode: reception.errorCode || 'MAIL_ERROR',
        message: reception.message || reception.reason || 'Mail delivery failed.',
        inquiryId: inquiry.inquiryId,
        mail,
        ccSystemDraft: createCcSystemDraft(inquiry),
      });
    }

    if (reception.delivered && inquiry.email && customerConfirmationEnabled()) {
      const autoresponder = await sendCustomerConfirmation(buildCustomerMail(inquiry));
      mail.autoresponder = autoresponder;
      if (!autoresponder.delivered) {
        console.error('[reservation-api] customer-autoresponder-error', {
          inquiryId: inquiry.inquiryId,
          provider: autoresponder.provider || 'unknown',
          status: autoresponder.status || null,
          errorCode: autoresponder.errorCode || 'CUSTOMER_AUTORESPONDER_ERROR',
          message: autoresponder.message || autoresponder.reason || 'Customer autoresponder failed.',
        });
      }
    } else if (reception.delivered && inquiry.email) {
      mail.autoresponder = {
        provider: reception.provider,
        delivered: false,
        reason: 'Customer autoresponder template is ready but SEND_CUSTOMER_CONFIRMATION is not true.',
      };
    }

    return sendJson(res, 200, {
      ok: true,
      inquirySaved: true,
      provider: reception.fallbackFrom ? 'fallback' : (reception.provider || 'none'),
      delivered: Boolean(reception.delivered),
      error: reception.delivered ? null : (reception.errorCode || 'MAIL_NOT_DELIVERED'),
      reason: reception.delivered
        ? (inboxUpdateError || null)
        : [reception.reason || 'Mail body prepared but not sent.', inboxUpdateError].filter(Boolean).join(' | '),
      mode: reception.delivered ? reception.provider : 'mock',
      inquiryId: inquiry.inquiryId,
      mail,
      ccSystemDraft: createCcSystemDraft(inquiry),
    });
  } catch (error) {
    console.error('[reservation-api-unhandled]', {
      code: error?.code || 'RESERVATION_ENDPOINT_FAILED',
      error: error instanceof Error ? error.message : String(error),
    });
    return sendJson(res, 500, {
      ok: false,
      inquirySaved: false,
      provider: 'none',
      delivered: false,
      code: 'RESERVATION_ENDPOINT_FAILED',
      error: error instanceof Error ? error.message : 'Unknown reservation endpoint error.',
      inquiryId: null,
      mode: 'error',
      message: 'Reservation endpoint failed before accepting the enquiry.',
      reason: error instanceof Error ? error.message : 'Unknown reservation endpoint error.',
    });
  }
}
