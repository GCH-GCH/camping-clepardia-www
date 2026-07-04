import {
  InboxApiError,
  listReservationInquiries,
  supabaseRequest,
  updateReservationInquiry,
} from './inbox.js';

const MAIL_THREADS_TABLE = 'mail_threads';
const MAIL_MESSAGES_TABLE = 'mail_messages';
const MAIL_EVENTS_TABLE = 'mail_thread_events';
const REPLY_DRAFTS_TABLE = 'reply_drafts';
const MAIL_ACTIVITY_TABLE = 'inbox_activity_log';
const RESERVATION_TABLE = 'reservation_inquiries';

export const MAIL_CENTER_STATUSES = [
  'new',
  'needs_reply',
  'replied',
  'needs_confirmation',
  'confirmed',
  'unavailable',
  'rejected',
  'cancelled',
  'archived',
  'test',
];

export const MAIL_CENTER_FOLDERS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'needs_reply', label: 'Do odpowiedzi' },
  { id: 'replied', label: 'Odpowiedziane' },
  { id: 'needs_confirmation', label: 'Do potwierdzenia' },
  { id: 'confirmed', label: 'Potwierdzone' },
  { id: 'unavailable', label: 'Brak miejsc' },
  { id: 'bungalow', label: 'Domki' },
  { id: 'camping', label: 'Camping' },
  { id: 'late', label: 'Późny przyjazd' },
  { id: 'tours', label: 'Wycieczki' },
  { id: 'group', label: 'Grupy / skauci' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'urgent', label: 'Pilne' },
  { id: 'mail_failed', label: 'Mail niedostarczony' },
  { id: 'test', label: 'Testy' },
  { id: 'archived', label: 'Archiwum' },
];

const LANGUAGES = ['PL', 'EN', 'DE', 'IT', 'FR', 'ES', 'NL', 'CS', 'SK', 'SV'];

export const REPLY_TEMPLATE_DEFS = [
  { id: 'confirm', icon: '✓', category: 'confirm', title: 'Potwierdzenie / odpowiedź pozytywna', priority: 90 },
  { id: 'campingSummer', aliases: ['infoCampingSummer'], icon: '△', category: 'season', title: 'Camping lipiec/sierpień — bez rezerwacji', priority: 120 },
  { id: 'bungalow', icon: '⌂', category: 'bungalow', title: 'Domek / bungalow — dostępność i zasady', priority: 88 },
  { id: 'askMissingData', icon: '?', category: 'missing', title: 'Prośba o brakujące dane', priority: 96 },
  { id: 'noAvailability', icon: '×', category: 'availability', title: 'Brak miejsc', priority: 86 },
  { id: 'lateArrival', icon: '☾', category: 'arrival', title: 'Późny przyjazd', priority: 84 },
  { id: 'tours', icon: '✦', category: 'tours', title: 'Wycieczki i atrakcje', priority: 82 },
  { id: 'electricityEv', icon: '⚡', category: 'power', title: 'Prąd 10A / EV', priority: 81 },
  { id: 'heavyVehicle', icon: '!', category: 'vehicle', title: 'Ciężki pojazd / asfalt', priority: 80 },
  { id: 'groupScout', icon: '◎', category: 'group', title: 'Grupa / skauci', priority: 83 },
  { id: 'generalOffer', icon: '🌿', category: 'offer', title: 'Oferta ogólna', priority: 70 },
  { id: 'phoneContact', icon: '☎', category: 'contact', title: 'Prośba o kontakt telefoniczny', priority: 78 },
  { id: 'paymentInfo', icon: '₿', category: 'payment', title: 'Płatność / zaliczka', priority: 74 },
  { id: 'afterHours', icon: '⏱', category: 'arrival', title: 'Przyjazd poza godzinami', priority: 76 },
];

const copy = {
  PL: {
    subject: 'Camping Clepardia — odpowiedź na zapytanie',
    hello: 'Dzień dobry',
    intro: 'Dziękujemy za wiadomość i zainteresowanie Camping Clepardia. Poniżej przesyłamy najważniejsze informacje dotyczące zapytania.',
    next: 'Recepcja potwierdzi finalną dostępność i warunki w odpowiedzi mailowej lub telefonicznie.',
    contact: 'W razie pytań prosimy odpowiedzieć na tę wiadomość albo zadzwonić do recepcji.',
    location: 'Camping znajduje się blisko tramwaju do centrum Krakowa. Prosimy korzystać z Google Maps, ponieważ wjazd zmienił się w 2022 roku.',
    tours: 'Recepcja może pomóc w informacjach o wycieczkach: Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców, Energylandia, Stare Miasto i Wawel.',
    confirm: 'Zapytanie wygląda poprawnie. Przygotowaliśmy podsumowanie pobytu; recepcja potwierdzi dostępność.',
    campingSummer: 'W lipcu i sierpniu nie prowadzimy rezerwacji miejsc campingowych z wyprzedzeniem. Miejsca dla kamperów, przyczep, vanów i namiotów są dostępne według kolejności przyjazdu. Najlepiej przyjechać około południa, po check-out.',
    bungalow: 'W przypadku domków dostępność potwierdza recepcja. Check-in jest od 16:00, check-out do 11:00. Prosimy zabrać własne ręczniki, kosmetyki i rzeczy osobiste.',
    askMissingData: 'Prosimy o dosłanie brakujących danych, szczególnie kontaktu, terminu, liczby osób, rodzaju pojazdu lub numeru rejestracyjnego, jeżeli nie zostały podane.',
    noAvailability: 'W wybranym terminie dostępność może być ograniczona. Recepcja sprawdzi alternatywne terminy lub inne opcje pobytu.',
    lateArrival: 'Przy planowanym przyjeździe po 21:00 prosimy o wcześniejszy kontakt z recepcją. Recepcja pracuje 09:00–21:00, a brama zwykle 08:00–22:00.',
    afterHours: 'Jeżeli przyjazd wypada poza standardowymi godzinami pracy recepcji, prosimy uzgodnić szczegóły telefonicznie przed podróżą.',
    electricityEv: 'Prąd 10A jest dostępny dla wyposażenia kampera lub przyczepy. Nie ma możliwości ładowania samochodów elektrycznych ani hybryd plug-in na stanowisku.',
    heavyVehicle: 'Przy ciężkim pojeździe, autobusie lub dużym busie prosimy o informację z wyprzedzeniem. Takie pojazdy kierujemy na stabilniejsze/asfaltowe miejsca.',
    groupScout: 'Przy grupach i skautach recepcja potwierdza warunki indywidualnie. Prosimy o liczbę osób, opiekunów, namiotów/pojazdów oraz planowaną godzinę przyjazdu.',
    generalOffer: 'Camping Clepardia to spokojna baza blisko centrum Krakowa, dobra dla kamperów, namiotów, rodzin i gości w domkach.',
    phoneContact: 'Najłatwiej doprecyzować szczegóły telefonicznie. Prosimy o numer i dogodną godzinę kontaktu, jeśli rozmowa będzie wygodniejsza.',
    paymentInfo: 'Ewentualne płatności, zaliczki lub przedpłaty recepcja potwierdza dopiero po sprawdzeniu dostępności.',
  },
  EN: {
    subject: 'Camping Clepardia — reply to your enquiry',
    hello: 'Hello',
    intro: 'Thank you for your message and interest in Camping Clepardia. Below you will find the key information about your enquiry.',
    next: 'Reception will confirm final availability and conditions by email or phone.',
    contact: 'If you have questions, simply reply to this email or call reception.',
    location: 'The campsite is close to a tram connection to Kraków city centre. Please use Google Maps because the entrance changed in 2022.',
    tours: 'Reception can help with trip information: Wieliczka, Auschwitz-Birkenau, Zakopane, Ojców, Energylandia, Old Town and Wawel.',
    confirm: 'Your enquiry looks complete. We have prepared the stay summary; reception will confirm availability.',
    campingSummer: 'In July and August we do not take advance reservations for camping pitches. Camper, caravan, van and tent places are first come, first served. Arriving around noon after check-out is best.',
    bungalow: 'For bungalows, availability is confirmed by reception. Check-in is from 16:00 and check-out until 11:00. Please bring your own towels, toiletries and personal items.',
    askMissingData: 'Please send the missing details, especially contact data, dates, number of guests, vehicle type or registration plate if not provided.',
    noAvailability: 'Availability may be limited for the selected dates. Reception will check alternative dates or stay options.',
    lateArrival: 'If you plan to arrive after 21:00, please contact reception in advance. Reception is open 09:00–21:00 and the gate usually operates 08:00–22:00.',
    afterHours: 'If your arrival is outside normal reception hours, please agree the details by phone before travelling.',
    electricityEv: '10A electricity is available for camper/caravan equipment. Electric cars and plug-in hybrids cannot be charged on the pitch.',
    heavyVehicle: 'For a heavy vehicle, coach or large van, please tell us in advance. Such vehicles are directed to firmer/asphalt areas.',
    groupScout: 'For groups and scouts, reception confirms conditions individually. Please send the number of guests, leaders, tents/vehicles and arrival time.',
    generalOffer: 'Camping Clepardia is a calm base close to Kraków city centre, suitable for campers, tents, families and bungalow guests.',
    phoneContact: 'Some details are easiest to confirm by phone. Please send a number and a convenient contact time if a call is better.',
    paymentInfo: 'Any payments, deposits or prepayments are confirmed by reception only after checking availability.',
  },
};

copy.DE = { ...copy.EN, subject: 'Camping Clepardia — Antwort auf Ihre Anfrage', hello: 'Guten Tag' };
copy.IT = { ...copy.EN, subject: 'Camping Clepardia — risposta alla richiesta', hello: 'Buongiorno' };
copy.FR = { ...copy.EN, subject: 'Camping Clepardia — réponse à votre demande', hello: 'Bonjour' };
copy.ES = { ...copy.EN, subject: 'Camping Clepardia — respuesta a su consulta', hello: 'Buenos días' };
copy.NL = { ...copy.EN, subject: 'Camping Clepardia — antwoord op uw aanvraag', hello: 'Goedendag' };
copy.CS = { ...copy.EN, subject: 'Camping Clepardia — odpověď na váš dotaz', hello: 'Dobrý den' };
copy.SK = { ...copy.EN, subject: 'Camping Clepardia — odpoveď na vašu požiadavku', hello: 'Dobrý deň' };
copy.SV = { ...copy.EN, subject: 'Camping Clepardia — svar på din förfrågan', hello: 'Hej' };

const envValue = (name) => String(process.env[name] || '').trim();
const configured = (...values) => values.find((value) => String(value || '').trim()) || '';
const siteUrl = () => configured(envValue('PUBLIC_SITE_URL'), envValue('SITE_URL'), 'https://www.clepardia.com.pl').replace(/\/+$/, '');
const reservationFromEmail = () => configured(envValue('RESERVATION_FROM_EMAIL'), envValue('MAIL_FROM'), 'Camping Clepardia <rezerwacje@clepardia.com.pl>');
const reservationReplyToEmail = () => configured(envValue('RESERVATION_REPLY_TO_EMAIL'), envValue('RESERVATION_TO_EMAIL'), envValue('MAIL_TO'), 'clepardia@gmail.com');
const resendApiKey = () => envValue('RESEND_API_KEY');

const oneLine = (value, max = 800) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const longText = (value, max = 12000) =>
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

const stripAccents = (value) =>
  String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const parseJsonObject = (value) => value && typeof value === 'object' ? value : {};
const parseJsonArray = (value) => Array.isArray(value) ? value : [];

export const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  const raw = Buffer.concat(chunks).toString('utf8').replace(/^\uFEFF/, '').trim();
  return raw ? JSON.parse(raw) : {};
};

export const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader('cache-control', 'no-store');
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.json(payload);
};

const tableMissing = (error) => {
  const text = [
    error?.code,
    error?.message,
    error?.details,
    error?.hint,
  ].filter(Boolean).join(' ').toLowerCase();
  return /mail_threads|mail_messages|mail_thread_events|reply_drafts|inbox_activity_log|relation .* does not exist|pgrst|schema cache/.test(text);
};

const safeSupabase = async (path, options = {}) => {
  try {
    const result = await supabaseRequest(path, options);
    return { ok: true, ...result };
  } catch (error) {
    return { ok: false, error, tableMissing: tableMissing(error) };
  }
};

const summarizeServices = (inquiry = {}) => {
  const services = parseJsonArray(inquiry.services_json);
  return services.map((service) => {
    const label = oneLine(service?.label || service?.id || 'Usługa', 120);
    const qty = Math.max(1, Number(service?.qty || service?.quantity || 1));
    const price = Number(service?.price || 0);
    return {
      id: oneLine(service?.id || label, 80),
      label,
      qty,
      price,
      line: `${label} × ${qty}${price ? ` (${price} PLN)` : ''}`,
    };
  });
};

const peopleSummary = (inquiry = {}) => {
  const raw = parseJsonObject(inquiry.raw_payload_json);
  const people = parseJsonObject(raw.people);
  const adults = Math.max(0, Number(people.adults || 0));
  const children = Math.max(0, Number(people.children || 0));
  const toddlers = Math.max(0, Number(people.toddlers || 0));
  return [
    adults ? `${adults} dor.` : '',
    children ? `${children} dz.` : '',
    toddlers ? `${toddlers} maluchy` : '',
  ].filter(Boolean).join(' + ') || 'do ustalenia';
};

const vehicleSummary = (inquiry = {}) => {
  const vehicle = parseJsonObject(inquiry.vehicle_details_json);
  const services = summarizeServices(inquiry).map((service) => `${service.id} ${service.label}`).join(' ');
  const text = stripAccents([
    inquiry.stay_type,
    services,
    vehicle.type,
    vehicle.model,
    vehicle.summary,
    inquiry.vehicle_registration,
  ].filter(Boolean).join(' '));
  if (/domek|bungalow/.test(text)) return inquiry.stay_type || 'Domek';
  if (/kamper|camper|motorhome/.test(text)) return ['Kamper', inquiry.vehicle_registration].filter(Boolean).join(' · ');
  if (/przyczep|caravan|trailer/.test(text)) return ['Przyczepa', inquiry.vehicle_registration].filter(Boolean).join(' · ');
  if (/namiot|tent/.test(text)) return 'Namiot';
  if (/\bvan\b/.test(text)) return ['Van', inquiry.vehicle_registration].filter(Boolean).join(' · ');
  if (/bus|coach|autobus|ciezar|truck/.test(text)) return ['Bus / ciężki pojazd', inquiry.vehicle_registration].filter(Boolean).join(' · ');
  return oneLine(vehicle.summary || vehicle.model || inquiry.stay_type || 'Do ustalenia', 160);
};

export const buildStaySummary = (inquiry = {}) => {
  const raw = parseJsonObject(inquiry.raw_payload_json);
  const services = summarizeServices(inquiry);
  return {
    clientName: oneLine(inquiry.full_name || 'Klient', 160),
    email: oneLine(inquiry.email || '', 254),
    phone: oneLine(inquiry.phone || '', 80),
    country: oneLine(inquiry.country || '', 160),
    language: normalizeLanguage(inquiry.language || raw.contactLanguage || raw.locale || 'PL'),
    dates: [inquiry.arrival_date, inquiry.departure_date].filter(Boolean).join(' – ') || 'do ustalenia',
    arrivalDate: inquiry.arrival_date || '',
    departureDate: inquiry.departure_date || '',
    nights: Number(inquiry.nights || 0),
    guests: peopleSummary(inquiry),
    stayType: oneLine(inquiry.stay_type || 'Pobyt', 160),
    vehicle: vehicleSummary(inquiry),
    services,
    servicesText: services.map((service) => service.line).join(', ') || 'do ustalenia',
    price: Number.isFinite(Number(inquiry.estimated_total_pln)) && Number(inquiry.estimated_total_pln) > 0
      ? `${Number(inquiry.estimated_total_pln)} PLN`
      : 'do potwierdzenia',
    arrivalTime: oneLine(raw.arrivalTime || '', 80),
    message: longText(inquiry.message || '', 4000),
    trips: parseJsonArray(inquiry.trips_interest_json).map((item) => oneLine(item, 120)).filter(Boolean),
    status: oneLine(inquiry.status || 'new', 80),
  };
};

export const normalizeLanguage = (value) => {
  const code = String(value || '').trim().slice(0, 2).toUpperCase();
  return LANGUAGES.includes(code) ? code : 'EN';
};

const classifyInquiry = (inquiry = {}) => {
  const summary = buildStaySummary(inquiry);
  const text = stripAccents([
    summary.stayType,
    summary.vehicle,
    summary.servicesText,
    summary.message,
    summary.trips.join(' '),
    inquiry.special_needs,
    inquiry.notes,
  ].join(' '));
  const monthText = `${summary.arrivalDate || ''} ${summary.departureDate || ''}`;
  const isSummerCamping = /(07|08)/.test(monthText.slice(5, 7) + monthText.slice(18, 20)) && /(camping|kamper|camper|van|namiot|tent|przyczep|caravan)/.test(text);
  return {
    missing: !summary.email || !summary.dates || !summary.guests || summary.guests === 'do ustalenia',
    summerCamping: isSummerCamping,
    bungalow: /domek|bungalow/.test(text),
    noAvailability: /brak miejsc|unavailable|no availability/.test(text) || inquiry.status === 'unavailable',
    late: /po 21|after 21|late|p[oó]z/.test(text) || /21/.test(summary.arrivalTime),
    tours: summary.trips.length > 0 || /wielicz|auschwitz|zakopan|ojcow|energylandia|wyciecz/.test(text),
    electricity: /prad|electric|10a|ev|plug/.test(text),
    heavy: /ciezar|truck|bus|coach|asfalt|heavy/.test(text),
    group: /grup|scout|skaut|harcer|pfadfinder/.test(text),
  };
};

export const resolveTemplateId = (requested, inquiry = {}) => {
  const wanted = oneLine(requested, 80);
  const aliasMatch = REPLY_TEMPLATE_DEFS.find((template) => template.id === wanted || template.aliases?.includes(wanted));
  if (aliasMatch) return aliasMatch.id;
  const tags = classifyInquiry(inquiry);
  if (tags.missing) return 'askMissingData';
  if (tags.summerCamping) return 'campingSummer';
  if (tags.bungalow) return 'bungalow';
  if (tags.noAvailability) return 'noAvailability';
  if (tags.late) return 'lateArrival';
  if (tags.tours) return 'tours';
  if (tags.electricity) return 'electricityEv';
  if (tags.heavy) return 'heavyVehicle';
  if (tags.group) return 'groupScout';
  return 'confirm';
};

export const suggestBestReply = (inquiry = {}) => {
  const templateId = resolveTemplateId('', inquiry);
  const template = REPLY_TEMPLATE_DEFS.find((item) => item.id === templateId) || REPLY_TEMPLATE_DEFS[0];
  const tags = classifyInquiry(inquiry);
  const reasons = [
    tags.missing ? 'brakuje danych' : '',
    tags.summerCamping ? 'camping w lipcu/sierpniu' : '',
    tags.bungalow ? 'zapytanie o domek' : '',
    tags.late ? 'późny przyjazd' : '',
    tags.tours ? 'wycieczki' : '',
    tags.electricity ? 'prąd / EV' : '',
    tags.heavy ? 'ciężki pojazd' : '',
    tags.group ? 'grupa / skauci' : '',
  ].filter(Boolean);
  return {
    id: template.id,
    title: template.title,
    icon: template.icon,
    confidence: Math.min(96, reasons.length ? 74 + reasons.length * 6 : 68),
    reason: reasons.join(', ') || 'standardowe zapytanie',
    recommendedWhen: template.category,
  };
};

export const buildSuggestedReplies = (inquiry = {}) => {
  const best = suggestBestReply(inquiry);
  return REPLY_TEMPLATE_DEFS.map((template) => ({
    ...template,
    language: buildStaySummary(inquiry).language,
    subject: subjectForLanguage(buildStaySummary(inquiry).language),
    shortDescription: template.title,
    recommendedWhen: template.id === best.id ? `Najlepsze dopasowanie: ${best.reason}` : `Kategoria: ${template.category}`,
    confidence: template.id === best.id ? best.confidence : Math.max(35, template.priority - 25),
    best: template.id === best.id,
  })).sort((a, b) => Number(b.best) - Number(a.best) || b.priority - a.priority);
};

const subjectForLanguage = (language) => (copy[normalizeLanguage(language)] || copy.EN).subject;

const templateCopy = (templateId, language) => {
  const dict = copy[normalizeLanguage(language)] || copy.EN;
  const canonical = resolveTemplateId(templateId);
  return dict[canonical] || dict.confirm;
};

const htmlParagraphs = (text) =>
  longText(text, 8000)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p style="margin:0 0 12px;color:#244134;line-height:1.65;">${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');

export const buildClientPremiumReplyText = (inquiry = {}, templateId = '', options = {}) => {
  const summary = buildStaySummary(inquiry);
  const language = normalizeLanguage(options.language || summary.language);
  const dict = copy[language] || copy.EN;
  const name = summary.clientName && summary.clientName !== 'Klient' ? ` ${summary.clientName.split(/\s+/)[0]}` : '';
  const body = longText(options.bodyText || templateCopy(templateId, language), 8000);
  return [
    `${dict.hello}${name},`,
    '',
    dict.intro,
    '',
    body,
    '',
    'Szczegóły pobytu',
    `Termin: ${summary.dates}`,
    `Goście: ${summary.guests}`,
    `Pobyt / pojazd: ${summary.vehicle || summary.stayType}`,
    `Usługi: ${summary.servicesText}`,
    `Cena orientacyjna: ${summary.price}`,
    summary.arrivalTime ? `Przyjazd: ${summary.arrivalTime}` : '',
    '',
    'Ważne informacje',
    dict.location,
    dict.tours,
    dict.next,
    '',
    'Kontakt',
    'Camping Clepardia',
    'www.clepardia.com.pl',
    '+48 795 294 486',
    'clepardia@gmail.com',
  ].filter(Boolean).join('\n');
};

export const buildClientPremiumReplyHtml = (inquiry = {}, templateId = '', options = {}) => {
  const summary = buildStaySummary(inquiry);
  const language = normalizeLanguage(options.language || summary.language);
  const dict = copy[language] || copy.EN;
  const subject = oneLine(options.subject || dict.subject, 180);
  const name = summary.clientName && summary.clientName !== 'Klient' ? ` ${summary.clientName.split(/\s+/)[0]}` : '';
  const bodyText = longText(options.bodyText || templateCopy(templateId, language), 8000);
  const logo = `${siteUrl()}/brand/logo/clepardia-logo-main.svg`;
  const cards = [
    ['Termin', summary.dates, summary.nights ? `${summary.nights} nocy` : ''],
    ['Goście', summary.guests, ''],
    ['Pobyt / pojazd', summary.vehicle || summary.stayType, ''],
    ['Usługi', summary.servicesText, ''],
    ['Cena', summary.price, 'orientacyjnie'],
    ['Co dalej', dict.next, ''],
  ];
  const button = (label, href) =>
    `<a href="${escapeHtml(href)}" style="display:inline-block;margin:6px 8px 6px 0;padding:11px 15px;border-radius:999px;background:#0f8b49;color:#ffffff;text-decoration:none;font-weight:800;">${escapeHtml(label)}</a>`;
  return `<!doctype html>
<html lang="${language.toLowerCase()}">
<body style="margin:0;background:#edf7f1;font-family:Arial,Helvetica,sans-serif;color:#10271c;">
  <div style="max-width:760px;margin:0 auto;padding:22px;">
    <div style="border-radius:28px;overflow:hidden;background:#ffffff;border:1px solid #d6eadf;box-shadow:0 20px 50px rgba(16,39,28,.12);">
      <header style="padding:28px;background:linear-gradient(135deg,#073d27,#0f8b49 56%,#41c978);color:#ffffff;">
        <img src="${escapeHtml(logo)}" width="56" height="56" alt="Camping Clepardia" style="display:block;border-radius:18px;background:#ffffff;padding:6px;margin-bottom:16px;">
        <p style="margin:0 0 8px;text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:800;">Camping Clepardia</p>
        <h1 style="margin:0;font-size:28px;line-height:1.15;">${escapeHtml(subject)}</h1>
      </header>
      <main style="padding:26px;">
        <p style="font-size:18px;line-height:1.55;margin:0 0 16px;color:#173628;"><strong>${escapeHtml(dict.hello + name)},</strong></p>
        <p style="margin:0 0 18px;color:#244134;line-height:1.65;">${escapeHtml(dict.intro)}</p>
        <section style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:22px 0;">
          ${cards.map(([label, value, hint]) => `<article style="border:1px solid #d9eadf;background:#f7fcf9;border-radius:18px;padding:15px;">
            <small style="display:block;color:#51705f;text-transform:uppercase;letter-spacing:.08em;font-weight:800;font-size:11px;">${escapeHtml(label)}</small>
            <strong style="display:block;margin-top:6px;font-size:16px;color:#10271c;">${escapeHtml(value)}</strong>
            ${hint ? `<span style="display:block;margin-top:4px;color:#668170;font-size:12px;">${escapeHtml(hint)}</span>` : ''}
          </article>`).join('')}
        </section>
        <section style="padding:18px;border-radius:20px;background:#f3faf6;border:1px solid #d9eadf;margin-bottom:18px;">
          <h2 style="margin:0 0 12px;font-size:18px;color:#0f5f35;">Odpowiedź recepcji</h2>
          ${htmlParagraphs(bodyText)}
        </section>
        <section style="padding:18px;border-radius:20px;background:#fff9e8;border:1px solid #f1dfaa;margin-bottom:18px;">
          <h2 style="margin:0 0 10px;font-size:18px;color:#76530b;">ℹ️ Ważne informacje</h2>
          <p style="margin:0 0 10px;color:#3d3522;line-height:1.6;">${escapeHtml(dict.location)}</p>
          <p style="margin:0;color:#3d3522;line-height:1.6;">${escapeHtml(dict.tours)}</p>
        </section>
        <section style="margin:18px 0;">
          ${button('Zobacz dojazd', `${siteUrl()}/dojazd/`)}
          ${button('Sprawdź cennik', `${siteUrl()}/cennik/`)}
          ${button('Wycieczki', 'https://qr.codes/vksKBT')}
          ${button('Strona Camping Clepardia', siteUrl())}
        </section>
      </main>
      <footer style="padding:22px 26px;background:#f7fcf9;border-top:1px solid #d9eadf;color:#446653;line-height:1.6;">
        <strong style="color:#0f5f35;">Camping Clepardia</strong><br>
        ${escapeHtml(siteUrl().replace(/^https?:\/\//, ''))} · +48 795 294 486 · clepardia@gmail.com<br>
        Pozdrawiamy serdecznie,<br>Recepcja Camping Clepardia
      </footer>
    </div>
  </div>
</body>
</html>`;
};

const inquiryThreadId = (inquiry) => `inquiry:${inquiry.id}`;

export const threadFromInquiry = (inquiry = {}) => {
  const summary = buildStaySummary(inquiry);
  return {
    id: inquiryThreadId(inquiry),
    inquiry_id: inquiry.id,
    client_email: summary.email,
    client_name: summary.clientName,
    client_country: summary.country,
    client_language: summary.language,
    subject: `${summary.clientName} — ${summary.dates}`,
    status: inquiry.status || 'new',
    priority: suggestBestReply(inquiry).confidence > 84 ? 'high' : 'normal',
    thread_key: [summary.email || inquiry.phone || 'no-contact', summary.arrivalDate, summary.departureDate].join('::'),
    last_message_at: inquiry.created_at,
    created_at: inquiry.created_at,
    updated_at: inquiry.updated_at || inquiry.created_at,
    archived: inquiry.status === 'archived',
    is_test: inquiry.status === 'test',
    source: 'reservation_inquiries',
    metadata_json: {
      fallback: true,
      mailProvider: inquiry.mail_provider || 'none',
      mailDelivered: Boolean(inquiry.mail_delivered),
    },
    summary,
  };
};

const applyThreadFilters = (threads, query = {}) => {
  const status = oneLine(query.status || query.folder || '', 80);
  const search = stripAccents(query.search || '');
  return threads.filter((thread) => {
    if (status && status !== 'inbox') {
      if (status === 'mail_failed' && thread.metadata_json?.mailDelivered !== false) return false;
      else if (status === 'urgent' && thread.priority !== 'high') return false;
      else if (['bungalow', 'camping', 'late', 'tours', 'group', 'feedback'].includes(status)) {
        const text = stripAccents([
          thread.client_name,
          thread.client_country,
          thread.subject,
          thread.summary?.stayType,
          thread.summary?.vehicle,
          thread.summary?.servicesText,
          thread.summary?.message,
          Array.isArray(thread.summary?.trips) ? thread.summary.trips.join(' ') : '',
          thread.metadata_json?.categories,
        ].filter(Boolean).join(' '));
        if (status === 'bungalow' && !/domek|bungalow/.test(text)) return false;
        if (status === 'camping' && !/camping|kamper|camper|van|namiot|tent|przyczep|caravan/.test(text)) return false;
        if (status === 'late' && !/po 21|after 21|late|p[oó]z|21:/.test(text)) return false;
        if (status === 'tours' && !/wyciecz|wielicz|auschwitz|zakopan|ojcow|energylandia|wawel|stare miasto/.test(text)) return false;
        if (status === 'group' && !/grup|scout|skaut|harcer|pfadfinder/.test(text)) return false;
        if (status === 'feedback' && !/feedback|opinia|ocena/.test(text)) return false;
      }
      else if (!['mail_failed', 'urgent'].includes(status) && thread.status !== status) return false;
    }
    if (search) {
      const text = stripAccents([thread.client_name, thread.client_email, thread.client_country, thread.subject, thread.summary?.servicesText].join(' '));
      if (!text.includes(search)) return false;
    }
    return true;
  });
};

export const listMailCenterThreads = async (query = {}) => {
  const tableResult = await safeSupabase(`${MAIL_THREADS_TABLE}?select=*&order=last_message_at.desc.nullslast,created_at.desc&limit=500`, { method: 'GET' });
  if (tableResult.ok) {
    const threads = applyThreadFilters(Array.isArray(tableResult.body) ? tableResult.body : [], query);
    return { tablesReady: true, source: MAIL_THREADS_TABLE, fallbackReason: null, threads };
  }
  const inquiries = await listReservationInquiries();
  const threads = applyThreadFilters(inquiries.map(threadFromInquiry), query);
  return {
    tablesReady: false,
    source: RESERVATION_TABLE,
    fallbackReason: tableResult.tableMissing ? 'MAIL_CENTER_TABLES_MISSING' : tableResult.error?.message || 'MAIL_CENTER_TABLES_UNAVAILABLE',
    threads,
  };
};

const getInquiryById = async (id) => {
  const clean = oneLine(id, 120).replace(/^inquiry:/, '');
  const { body } = await supabaseRequest(`${RESERVATION_TABLE}?id=eq.${encodeURIComponent(clean)}&select=*&limit=1`, { method: 'GET' });
  return Array.isArray(body) ? body[0] : null;
};

const listFallbackMessages = (inquiry = {}) => {
  const summary = buildStaySummary(inquiry);
  const messages = [
    {
      id: `inbound:${inquiry.id}`,
      thread_id: inquiryThreadId(inquiry),
      inquiry_id: inquiry.id,
      direction: 'inbound',
      channel: 'form',
      from_email: summary.email,
      to_email: reservationReplyToEmail(),
      subject: `Zapytanie ze strony — ${summary.clientName}`,
      body_text: summary.message || 'Zapytanie bez wiadomości tekstowej.',
      body_html: '',
      provider: inquiry.mail_provider || 'form',
      delivered: Boolean(inquiry.mail_delivered),
      created_at: inquiry.created_at,
      metadata_json: { fallback: true },
    },
  ];
  if (inquiry.notes) {
    messages.push({
      id: `note:${inquiry.id}`,
      thread_id: inquiryThreadId(inquiry),
      inquiry_id: inquiry.id,
      direction: 'internal',
      channel: 'manual',
      from_email: 'Recepcja',
      to_email: '',
      subject: 'Notatki recepcji',
      body_text: inquiry.notes,
      body_html: '',
      provider: 'none',
      delivered: true,
      created_at: inquiry.updated_at || inquiry.created_at,
      metadata_json: { fallback: true },
    });
  }
  return messages;
};

export const getMailCenterThread = async (id) => {
  const clean = oneLine(id, 140);
  const tableThread = !clean.startsWith('inquiry:')
    ? await safeSupabase(`${MAIL_THREADS_TABLE}?id=eq.${encodeURIComponent(clean)}&select=*&limit=1`, { method: 'GET' })
    : { ok: false, tableMissing: false };
  if (tableThread.ok && Array.isArray(tableThread.body) && tableThread.body[0]) {
    const thread = tableThread.body[0];
    const [messagesResult, eventsResult, activityResult, inquiry] = await Promise.all([
      safeSupabase(`${MAIL_MESSAGES_TABLE}?thread_id=eq.${encodeURIComponent(thread.id)}&select=*&order=created_at.asc`, { method: 'GET' }),
      safeSupabase(`${MAIL_EVENTS_TABLE}?thread_id=eq.${encodeURIComponent(thread.id)}&select=*&order=created_at.asc`, { method: 'GET' }),
      safeSupabase(`${MAIL_ACTIVITY_TABLE}?thread_id=eq.${encodeURIComponent(thread.id)}&select=*&order=created_at.asc`, { method: 'GET' }),
      thread.inquiry_id ? getInquiryById(thread.inquiry_id).catch(() => null) : Promise.resolve(null),
    ]);
    const legacyEvents = eventsResult.ok && Array.isArray(eventsResult.body) ? eventsResult.body : [];
    const activityEvents = activityResult.ok && Array.isArray(activityResult.body)
      ? activityResult.body.map((entry) => ({
          id: entry.id,
          thread_id: entry.thread_id,
          event_type: entry.action,
          label: entry.action,
          note: entry.meta_json?.label || entry.meta_json?.note || '',
          created_by: entry.actor || 'Recepcja',
          created_at: entry.created_at,
          metadata_json: entry.meta_json || {},
        }))
      : [];
    return {
      tablesReady: true,
      source: MAIL_THREADS_TABLE,
      thread,
      inquiry,
      messages: messagesResult.ok && Array.isArray(messagesResult.body) ? messagesResult.body : [],
      events: [...legacyEvents, ...activityEvents].sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || ''))),
      suggestedReplies: buildSuggestedReplies(inquiry || thread),
      clientStaySummary: inquiry ? buildStaySummary(inquiry) : null,
      fallbackReason: null,
    };
  }

  const inquiry = await getInquiryById(clean);
  if (!inquiry) {
    throw new InboxApiError('THREAD_NOT_FOUND', 'Nie znaleziono wątku ani zapytania.', { httpStatus: 404 });
  }
  return {
    tablesReady: false,
    source: RESERVATION_TABLE,
    thread: threadFromInquiry(inquiry),
    inquiry,
    messages: listFallbackMessages(inquiry),
    events: [],
    suggestedReplies: buildSuggestedReplies(inquiry),
    clientStaySummary: buildStaySummary(inquiry),
    fallbackReason: tableThread.tableMissing ? 'MAIL_CENTER_TABLES_MISSING' : 'FALLBACK_FROM_RESERVATION_INQUIRIES',
  };
};

const ensureThreadForInquiry = async (inquiry = {}) => {
  const existing = await safeSupabase(`${MAIL_THREADS_TABLE}?inquiry_id=eq.${encodeURIComponent(inquiry.id)}&select=*&limit=1`, { method: 'GET' });
  if (existing.ok && Array.isArray(existing.body) && existing.body[0]) return { tablesReady: true, thread: existing.body[0] };
  if (!existing.ok && existing.tableMissing) return { tablesReady: false, thread: threadFromInquiry(inquiry), fallbackReason: 'MAIL_CENTER_TABLES_MISSING' };

  const summary = buildStaySummary(inquiry);
  const insert = await safeSupabase(`${MAIL_THREADS_TABLE}?select=*`, {
    method: 'POST',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify({
      inquiry_id: inquiry.id,
      client_email: summary.email || null,
      client_name: summary.clientName,
      client_country: summary.country || null,
      client_language: summary.language,
      subject: `${summary.clientName} — ${summary.dates}`,
      status: inquiry.status || 'new',
      priority: suggestBestReply(inquiry).confidence > 84 ? 'high' : 'normal',
      thread_key: [summary.email || inquiry.phone || 'no-contact', summary.arrivalDate, summary.departureDate].join('::'),
      last_message_at: new Date().toISOString(),
      archived: inquiry.status === 'archived',
      is_test: inquiry.status === 'test',
      metadata_json: { createdFrom: 'reservation_inquiries' },
    }),
  });
  if (insert.ok && Array.isArray(insert.body) && insert.body[0]) return { tablesReady: true, thread: insert.body[0] };
  return { tablesReady: false, thread: threadFromInquiry(inquiry), fallbackReason: insert.error?.message || 'MAIL_THREAD_INSERT_FAILED' };
};

export const sendResendCustomerReply = async ({ to, subject, html, text }) => {
  const apiKey = resendApiKey();
  if (!apiKey) return { provider: 'resend', delivered: false, errorCode: 'RESEND_API_KEY_MISSING', reason: 'Brak RESEND_API_KEY.' };
  if (!isEmail(to)) return { provider: 'resend', delivered: false, errorCode: 'INVALID_TO_EMAIL', reason: 'Nieprawidłowy email klienta.' };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: reservationFromEmail(),
        to: [to],
        reply_to: reservationReplyToEmail(),
        subject,
        html,
        text,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        provider: 'resend',
        delivered: false,
        status: response.status,
        errorCode: oneLine(body?.name || body?.error || `RESEND_${response.status}`, 120),
        reason: oneLine(body?.message || body?.error || `Resend HTTP ${response.status}`, 800),
      };
    }
    return { provider: 'resend', delivered: true, status: response.status, messageId: oneLine(body?.id || '', 180), reason: null };
  } catch (error) {
    return {
      provider: 'resend',
      delivered: false,
      errorCode: 'RESEND_REQUEST_FAILED',
      reason: error instanceof Error ? error.message : 'Resend request failed.',
    };
  }
};

const appendNote = (existing, text) => [existing, text].filter(Boolean).join('\n\n').slice(0, 5000);

const insertInboxActivity = async ({ inquiryId = null, threadId = null, action, actor = 'Recepcja', meta = {} }) =>
  safeSupabase(`${MAIL_ACTIVITY_TABLE}?select=*`, {
    method: 'POST',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify({
      inquiry_id: inquiryId ? String(inquiryId) : null,
      thread_id: threadId && !String(threadId).startsWith('inquiry:') ? threadId : null,
      action: oneLine(action || 'activity', 120),
      actor: oneLine(actor || 'Recepcja', 120),
      meta_json: meta && typeof meta === 'object' ? meta : {},
      created_at: new Date().toISOString(),
    }),
  });

export const logInboxActivity = async (payload = {}) => {
  const action = oneLine(payload.action || '', 120);
  if (!action) throw new InboxApiError('MISSING_ACTION', 'Brak typu aktywności.', { httpStatus: 400 });

  const id = oneLine(payload.threadId || payload.inquiryId || payload.id || '', 140);
  let bundle = null;
  if (id) {
    try {
      bundle = await getMailCenterThread(id);
    } catch (error) {
      if (!(error instanceof InboxApiError && error.code === 'THREAD_NOT_FOUND')) throw error;
    }
  }

  const inquiryId = oneLine(payload.inquiryId || bundle?.inquiry?.id || '', 140) || null;
  const threadId = oneLine(payload.threadId || bundle?.thread?.id || '', 140) || null;
  const insert = await insertInboxActivity({
    inquiryId,
    threadId,
    action,
    actor: oneLine(payload.actor || 'Recepcja', 120),
    meta: {
      ...(payload.meta && typeof payload.meta === 'object' ? payload.meta : {}),
      source: 'cc-system-ui',
    },
  });

  if (insert.ok) {
    return {
      ok: true,
      saved: true,
      tablesReady: true,
      source: MAIL_ACTIVITY_TABLE,
      activity: Array.isArray(insert.body) ? insert.body[0] : insert.body,
    };
  }

  return {
    ok: true,
    saved: false,
    tablesReady: false,
    source: RESERVATION_TABLE,
    fallbackReason: insert.tableMissing ? 'MAIL_CENTER_ACTIVITY_TABLE_MISSING' : insert.error?.message || 'ACTIVITY_LOG_UNAVAILABLE',
  };
};

export const persistOutboundReply = async ({ inquiry, thread, payload, delivery, html, text }) => {
  const createdAt = new Date().toISOString();
  const threadId = thread?.id || inquiryThreadId(inquiry);
  const messageRecord = {
    thread_id: threadId.startsWith('inquiry:') ? null : threadId,
    inquiry_id: inquiry.id,
    direction: 'outbound',
    channel: 'resend',
    from_email: reservationFromEmail(),
    to_email: payload.to,
    reply_to: reservationReplyToEmail(),
    subject: payload.subject,
    body_text: text,
    body_html: html,
    template_id: payload.templateId || null,
    language: payload.language || buildStaySummary(inquiry).language,
    provider: delivery.provider || 'resend',
    delivered: Boolean(delivery.delivered),
    provider_message_id: delivery.messageId || null,
    error_message: delivery.delivered ? null : (delivery.reason || delivery.errorCode || 'MAIL_NOT_DELIVERED'),
    created_at: createdAt,
    metadata_json: { statusAfterSend: payload.statusAfterSend || 'replied' },
  };

  const insert = threadId.startsWith('inquiry:')
    ? { ok: false, tableMissing: true, error: new Error('Fallback thread has no mail_messages table.') }
    : await safeSupabase(`${MAIL_MESSAGES_TABLE}?select=*`, {
        method: 'POST',
        headers: { prefer: 'return=representation' },
        body: JSON.stringify(messageRecord),
      });

  const statusAfterSend = oneLine(payload.statusAfterSend || 'replied', 80);
  const statusPatch = delivery.delivered && MAIL_CENTER_STATUSES.includes(statusAfterSend)
    ? { status: statusAfterSend }
    : {};
  const fallbackLine = `[CC SYSTEM ${createdAt}] ${delivery.delivered ? 'Wysłano odpowiedź przez Resend' : 'Próba wysyłki odpowiedzi nieudana'}: ${payload.subject}${delivery.messageId ? ` (${delivery.messageId})` : ''}${delivery.reason ? ` — ${delivery.reason}` : ''}`;
  const inquiryPatch = {
    ...statusPatch,
    notes: appendNote(inquiry.notes || '', fallbackLine),
  };
  let statusUpdated = false;
  try {
    await updateReservationInquiry(inquiry.id, inquiryPatch);
    statusUpdated = Boolean(statusPatch.status);
  } catch {
    statusUpdated = false;
  }

  if (!threadId.startsWith('inquiry:')) {
    await safeSupabase(`${MAIL_THREADS_TABLE}?id=eq.${encodeURIComponent(threadId)}`, {
      method: 'PATCH',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({
        status: statusPatch.status || thread.status || inquiry.status || 'new',
        last_message_at: createdAt,
        updated_at: createdAt,
      }),
    });
    await safeSupabase(`${MAIL_EVENTS_TABLE}?select=*`, {
      method: 'POST',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({
        thread_id: threadId,
        event_type: delivery.delivered ? 'reply_sent' : 'reply_failed',
        label: delivery.delivered ? 'Wysłano odpowiedź' : 'Błąd wysyłki',
        note: fallbackLine,
        created_by: 'Recepcja',
        metadata_json: { provider: delivery.provider, delivered: delivery.delivered, messageId: delivery.messageId || null },
      }),
    });
    await insertInboxActivity({
      inquiryId: inquiry.id,
      threadId,
      action: delivery.delivered ? 'sent_reply' : 'reply_failed',
      actor: 'Recepcja',
      meta: {
        provider: delivery.provider || 'resend',
        delivered: Boolean(delivery.delivered),
        messageId: delivery.messageId || null,
        templateId: payload.templateId || null,
      },
    });
  } else {
    await insertInboxActivity({
      inquiryId: inquiry.id,
      threadId: null,
      action: delivery.delivered ? 'sent_reply' : 'reply_failed',
      actor: 'Recepcja',
      meta: {
        provider: delivery.provider || 'resend',
        delivered: Boolean(delivery.delivered),
        messageId: delivery.messageId || null,
        templateId: payload.templateId || null,
        fallbackThread: true,
      },
    });
  }

  return {
    messageSaved: Boolean(insert.ok),
    message: insert.ok && Array.isArray(insert.body) ? insert.body[0] : messageRecord,
    historyStorage: insert.ok ? MAIL_MESSAGES_TABLE : RESERVATION_TABLE,
    fallbackReason: insert.ok ? null : (insert.tableMissing ? 'MAIL_CENTER_TABLES_MISSING' : insert.error?.message || 'MAIL_MESSAGE_INSERT_FAILED'),
    statusUpdated,
  };
};

export const sendMailCenterReply = async (payload = {}) => {
  const id = oneLine(payload.inquiryId || payload.threadId || '', 140);
  if (!id) throw new InboxApiError('MISSING_THREAD_ID', 'Brak threadId albo inquiryId.', { httpStatus: 400 });
  const threadBundle = await getMailCenterThread(id);
  const inquiry = threadBundle.inquiry;
  if (!inquiry) throw new InboxApiError('INQUIRY_NOT_FOUND', 'Brak zapytania powiązanego z wątkiem.', { httpStatus: 404 });
  const summary = buildStaySummary(inquiry);
  const to = oneLine(payload.to || summary.email, 254).toLowerCase();
  if (!isEmail(to)) throw new InboxApiError('INVALID_TO_EMAIL', 'Brak poprawnego emaila klienta.', { httpStatus: 400 });

  const language = normalizeLanguage(payload.language || summary.language);
  const templateId = resolveTemplateId(payload.templateId || '', inquiry);
  const subject = oneLine(payload.subject || subjectForLanguage(language), 180);
  const text = buildClientPremiumReplyText(inquiry, templateId, { ...payload, to, subject, language });
  const html = buildClientPremiumReplyHtml(inquiry, templateId, { ...payload, to, subject, language, bodyText: payload.bodyText || text });
  const threadState = await ensureThreadForInquiry(inquiry);
  const delivery = await sendResendCustomerReply({ to, subject, html, text });
  const persistence = await persistOutboundReply({
    inquiry,
    thread: threadState.thread,
    payload: { ...payload, to, subject, templateId, language },
    delivery,
    html,
    text,
  });

  return {
    ok: Boolean(delivery.delivered),
    delivered: Boolean(delivery.delivered),
    provider: 'resend',
    messageId: delivery.messageId || null,
    error: delivery.delivered ? null : (delivery.errorCode || 'RESEND_DELIVERY_FAILED'),
    reason: delivery.reason || null,
    status: delivery.status || null,
    inquiryId: inquiry.id,
    threadId: threadState.thread?.id || threadBundle.thread?.id || null,
    tablesReady: Boolean(threadState.tablesReady && persistence.messageSaved),
    historyStorage: persistence.historyStorage,
    messageSaved: persistence.messageSaved,
    statusUpdated: persistence.statusUpdated,
    fallbackReason: persistence.fallbackReason || threadState.fallbackReason || threadBundle.fallbackReason || null,
  };
};

export const saveDraft = async (payload = {}) => {
  const threadBundle = await getMailCenterThread(payload.threadId || payload.inquiryId || '');
  const inquiry = threadBundle.inquiry;
  if (!inquiry) throw new InboxApiError('INQUIRY_NOT_FOUND', 'Brak zapytania powiązanego ze szkicem.', { httpStatus: 404 });
  const threadState = await ensureThreadForInquiry(inquiry);
  if (!threadState.tablesReady || String(threadState.thread?.id || '').startsWith('inquiry:')) {
    return { ok: true, saved: false, tablesReady: false, fallbackReason: 'MAIL_CENTER_TABLES_MISSING' };
  }
  const draftRecord = {
    thread_id: threadState.thread.id,
    inquiry_id: inquiry.id,
    template_type: oneLine(payload.templateId || '', 80) || null,
    language: normalizeLanguage(payload.language || inquiry.language),
    subject: oneLine(payload.subject || subjectForLanguage(payload.language || inquiry.language), 180),
    body_text: longText(payload.bodyText || '', 12000),
    body_html: longText(payload.bodyHtml || '', 20000),
    status: 'draft',
    metadata_json: {
      to: oneLine(payload.to || inquiry.email || '', 254),
      createdBy: 'Recepcja',
    },
    updated_at: new Date().toISOString(),
  };
  const draftInsert = await safeSupabase(`${REPLY_DRAFTS_TABLE}?select=*`, {
    method: 'POST',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify(draftRecord),
  });
  if (draftInsert.ok) {
    await insertInboxActivity({
      inquiryId: inquiry.id,
      threadId: threadState.thread.id,
      action: 'saved_draft',
      actor: 'Recepcja',
      meta: { templateId: draftRecord.template_type, language: draftRecord.language, source: REPLY_DRAFTS_TABLE },
    });
    return {
      ok: true,
      saved: true,
      tablesReady: true,
      source: REPLY_DRAFTS_TABLE,
      draft: Array.isArray(draftInsert.body) ? draftInsert.body[0] : draftInsert.body,
      fallbackReason: null,
    };
  }
  if (!draftInsert.tableMissing) {
    return {
      ok: false,
      saved: false,
      tablesReady: true,
      source: REPLY_DRAFTS_TABLE,
      fallbackReason: draftInsert.error?.message || 'DRAFT_INSERT_FAILED',
    };
  }

  const legacyInsert = await safeSupabase(`${MAIL_MESSAGES_TABLE}?select=*`, {
    method: 'POST',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify({
      thread_id: threadState.thread.id,
      inquiry_id: inquiry.id,
      direction: 'internal',
      channel: 'draft',
      from_email: 'Recepcja',
      to_email: oneLine(payload.to || inquiry.email || '', 254),
      subject: oneLine(payload.subject || subjectForLanguage(payload.language || inquiry.language), 180),
      body_text: longText(payload.bodyText || '', 12000),
      body_html: longText(payload.bodyHtml || '', 20000),
      template_id: oneLine(payload.templateId || '', 80) || null,
      language: normalizeLanguage(payload.language || inquiry.language),
      provider: 'none',
      delivered: false,
      metadata_json: { draft: true },
    }),
  });
  if (legacyInsert.ok) {
    await insertInboxActivity({
      inquiryId: inquiry.id,
      threadId: threadState.thread.id,
      action: 'saved_draft',
      actor: 'Recepcja',
      meta: {
        templateId: oneLine(payload.templateId || '', 80) || null,
        language: normalizeLanguage(payload.language || inquiry.language),
        source: MAIL_MESSAGES_TABLE,
      },
    });
  }
  return {
    ok: legacyInsert.ok || legacyInsert.tableMissing,
    saved: Boolean(legacyInsert.ok),
    tablesReady: Boolean(legacyInsert.ok),
    source: legacyInsert.ok ? MAIL_MESSAGES_TABLE : RESERVATION_TABLE,
    draft: Array.isArray(legacyInsert.body) ? legacyInsert.body[0] : null,
    fallbackReason: legacyInsert.ok ? 'REPLY_DRAFTS_TABLE_MISSING' : (legacyInsert.tableMissing ? 'MAIL_CENTER_TABLES_MISSING' : legacyInsert.error?.message || 'DRAFT_SAVE_FAILED'),
  };
};

export const updateMailCenterStatus = async (payload = {}) => {
  const id = oneLine(payload.inquiryId || payload.threadId || payload.id || '', 140);
  const status = oneLine(payload.status || '', 80);
  if (!id) throw new InboxApiError('MISSING_ID', 'Brak ID.', { httpStatus: 400 });
  if (!MAIL_CENTER_STATUSES.includes(status)) throw new InboxApiError('INVALID_STATUS', 'Nieprawidłowy status.', { httpStatus: 400 });
  const bundle = await getMailCenterThread(id);
  const inquiry = bundle.inquiry;
  if (!inquiry) throw new InboxApiError('INQUIRY_NOT_FOUND', 'Brak zapytania.', { httpStatus: 404 });
  const updated = await updateReservationInquiry(inquiry.id, { status });
  if (bundle.tablesReady && bundle.thread?.id && !String(bundle.thread.id).startsWith('inquiry:')) {
    await safeSupabase(`${MAIL_THREADS_TABLE}?id=eq.${encodeURIComponent(bundle.thread.id)}`, {
      method: 'PATCH',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({ status, archived: status === 'archived', updated_at: new Date().toISOString() }),
    });
  }
  return { ok: true, inquiry: updated, threadId: bundle.thread?.id || null, status };
};

export const addMailCenterNote = async (payload = {}) => {
  const note = longText(payload.note || payload.bodyText || '', 5000);
  if (!note) throw new InboxApiError('EMPTY_NOTE', 'Notatka jest pusta.', { httpStatus: 400 });
  const bundle = await getMailCenterThread(payload.threadId || payload.inquiryId || '');
  const inquiry = bundle.inquiry;
  if (!inquiry) throw new InboxApiError('INQUIRY_NOT_FOUND', 'Brak zapytania.', { httpStatus: 404 });
  if (bundle.tablesReady && bundle.thread?.id && !String(bundle.thread.id).startsWith('inquiry:')) {
    const insert = await safeSupabase(`${MAIL_EVENTS_TABLE}?select=*`, {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({
        thread_id: bundle.thread.id,
        event_type: 'internal_note',
        label: 'Notatka recepcji',
        note,
        created_by: oneLine(payload.createdBy || 'Recepcja', 120),
        metadata_json: {},
      }),
    });
    if (insert.ok) return { ok: true, saved: true, tablesReady: true, note: insert.body?.[0] || null };
  }
  const updated = await updateReservationInquiry(inquiry.id, {
    notes: appendNote(inquiry.notes || '', `[CC SYSTEM ${new Date().toISOString()}] Notatka: ${note}`),
  });
  return { ok: true, saved: true, tablesReady: false, fallbackReason: 'SAVED_IN_RESERVATION_NOTES', inquiry: updated };
};

export const mailCenterDiagnostics = () => ({
  resendKeyPresent: Boolean(resendApiKey()),
  resendKeyLength: resendApiKey().length,
  fromPresent: Boolean(reservationFromEmail()),
  replyToPresent: Boolean(reservationReplyToEmail()),
  languages: LANGUAGES,
  templates: REPLY_TEMPLATE_DEFS.length,
});
