import { listReservationInquiries, supabaseRequest } from './inbox.js';

const EVENTS_TABLE = 'site_events';
const RECOMMENDATIONS_TABLE = 'analytics_recommendations';
const DAY_MS = 86_400_000;

const text = (value, max = 180) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const safeObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const safeArray = (value) => Array.isArray(value) ? value : [];
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const percent = (value, total) => total ? Math.round((value / total) * 100) : 0;
const redactFeedback = (value) => text(value, 500)
  .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[dane usunięte]')
  .replace(/(?:\+?\d[\s().-]*){7,}/g, '[dane usunięte]');

const metadataOf = (event) => safeObject(event?.metadata_json);
const eventCategory = (event) => text(event?.category || metadataOf(event).category || metadataOf(event).topic || metadataOf(event).attraction || metadataOf(event).tour, 120);
const eventElement = (event) => text(event?.element_id || metadataOf(event).elementId || metadataOf(event).label || metadataOf(event).eventTarget, 160);
const eventCountry = (event) => text(event?.country_code || event?.country_guess || 'Nieznany', 40).toUpperCase();
const eventReferrer = (event) => text(event?.referrer_domain || event?.referrer || 'direct', 180);
const eventSession = (event) => text(event?.session_id || metadataOf(event).sessionId, 120);

const countBy = (items, reader, limit = 20) => {
  const counts = new Map();
  items.forEach((item) => {
    const key = text(reader(item), 180) || 'Nieznany';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count, share: percent(count, items.length) }));
};

const unique = (values) => [...new Set(values.map((value) => text(value, 180)).filter(Boolean))].sort();

const dateBoundary = (value, end = false) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const date = new Date(`${value}T${end ? '23:59:59.999' : '00:00:00.000'}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const parseAnalyticsFilters = (query = {}) => {
  const range = ['today', '7d', '30d', 'custom'].includes(query.range) ? query.range : '30d';
  const now = new Date();
  let from = new Date(now.getTime() - (29 * DAY_MS));
  let to = now;
  if (range === 'today') from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (range === '7d') from = new Date(now.getTime() - (6 * DAY_MS));
  if (range === 'custom') {
    from = dateBoundary(query.from) || from;
    to = dateBoundary(query.to, true) || to;
  }
  return {
    range,
    from,
    to,
    fromLabel: from.toISOString().slice(0, 10),
    toLabel: to.toISOString().slice(0, 10),
    country: text(query.country, 40),
    locale: text(query.locale || query.language, 16).toLowerCase(),
    device: text(query.device, 40).toLowerCase(),
    page: text(query.page, 240),
    eventType: text(query.eventType || query.event_type, 80),
    attraction: text(query.attraction, 120).toLowerCase(),
    referrer: text(query.referrer, 180).toLowerCase(),
  };
};

export const filterAnalyticsEvents = (events, filters) => safeArray(events).filter((event) => {
  const createdAt = new Date(event.created_at || 0);
  if (Number.isNaN(createdAt.getTime()) || createdAt < filters.from || createdAt > filters.to) return false;
  if (filters.country && eventCountry(event).toLowerCase() !== filters.country.toLowerCase()) return false;
  if (filters.locale && text(event.locale, 16).toLowerCase() !== filters.locale) return false;
  if (filters.device && text(event.device_type, 40).toLowerCase() !== filters.device) return false;
  if (filters.page && text(event.page_path, 240) !== filters.page) return false;
  if (filters.eventType && text(event.event_type, 80) !== filters.eventType) return false;
  if (filters.attraction && !`${eventCategory(event)} ${eventElement(event)}`.toLowerCase().includes(filters.attraction)) return false;
  if (filters.referrer && !eventReferrer(event).toLowerCase().includes(filters.referrer)) return false;
  return true;
});

const sessionPaths = (events) => {
  const sessions = new Map();
  events.forEach((event) => {
    const session = eventSession(event);
    if (!session) return;
    if (!sessions.has(session)) sessions.set(session, []);
    sessions.get(session).push(event);
  });
  const transitions = [];
  for (const sessionEvents of sessions.values()) {
    sessionEvents.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    let previous = null;
    sessionEvents.filter((event) => event.event_type === 'page_view').forEach((event) => {
      if (previous && previous.page_path !== event.page_path) {
        transitions.push({
          label: `${previous.page_path || '/'} → ${event.page_path || '/'}`,
          seconds: Math.max(0, Math.round((new Date(event.created_at) - new Date(previous.created_at)) / 1000)),
        });
      }
      previous = event;
    });
  }
  const top = countBy(transitions, (item) => item.label, 12).map((item) => {
    const values = transitions.filter((entry) => entry.label === item.label).map((entry) => entry.seconds).filter((value) => value <= 3600);
    return { ...item, averageSeconds: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null };
  });
  return { top, sessions };
};

const conversionAfterCampy = (events, sessions) => {
  const targets = { pricing: 0, directions: 0, attractions: 0, booking: 0 };
  for (const sessionEvents of sessions.values()) {
    const sorted = [...sessionEvents].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const campyIndex = sorted.findIndex((event) => ['open_campy', 'campy_question_category', 'campy_question'].includes(event.event_type));
    if (campyIndex < 0) continue;
    const later = sorted.slice(campyIndex + 1);
    if (later.some((event) => /cennik|pricing/.test(`${event.page_path} ${eventElement(event)}`.toLowerCase()))) targets.pricing += 1;
    if (later.some((event) => /dojazd|maps|tram/.test(`${event.page_path} ${eventElement(event)}`.toLowerCase()))) targets.directions += 1;
    if (later.some((event) => /atrakc|attraction|tour/.test(`${event.page_path} ${event.event_type} ${eventCategory(event)}`.toLowerCase()))) targets.attractions += 1;
    if (later.some((event) => /rezerw|booking/.test(`${event.page_path} ${event.event_type}`.toLowerCase()))) targets.booking += 1;
  }
  return targets;
};

export const aggregateEvents = (events, filters = parseAnalyticsFilters({ range: '30d' })) => {
  const filtered = filterAnalyticsEvents(events, filters);
  const ofType = (...types) => filtered.filter((event) => types.includes(event.event_type));
  const pageViews = ofType('page_view');
  const clickEvents = filtered.filter((event) => /click|cta/.test(event.event_type));
  const { top: paths, sessions } = sessionPaths(filtered);
  const started = ofType('start_booking_form').length;
  const submitted = ofType('submit_booking_form').length;
  const errors = ofType('booking_field_error');
  const abandoned = ofType('booking_abandon');
  const campyQuestions = ofType('campy_question_category', 'campy_question');
  const attractions = filtered.filter((event) => ['attraction_click', 'tour_click', 'tour_cta_click'].includes(event.event_type));
  const countryNotice = 'Kraj jest orientacyjny i pochodzi z nagłówka infrastruktury Vercel; nie zapisujemy adresu IP.';
  const hours = countBy(filtered, (event) => `${new Intl.DateTimeFormat('pl-PL', { hour:'2-digit', hourCycle:'h23', timeZone:'Europe/Warsaw' }).format(new Date(event.created_at))}:00`, 24);
  const days = countBy(filtered, (event) => new Date(event.created_at).toLocaleDateString('pl-PL', { weekday: 'short', timeZone: 'Europe/Warsaw' }), 7);
  const ctaLabels = countBy(clickEvents, (event) => eventElement(event) || eventCategory(event) || event.event_type, 20);
  const formBy = (reader) => countBy(filtered.filter((event) => /booking|form/.test(event.event_type)), reader, 20);
  const options = {
    countries: unique(events.map(eventCountry)),
    locales: unique(events.map((event) => event.locale)),
    devices: unique(events.map((event) => event.device_type)),
    pages: unique(events.map((event) => event.page_path)),
    eventTypes: unique(events.map((event) => event.event_type)),
    attractions: unique(events.map(eventCategory)),
    referrers: unique(events.map(eventReferrer)),
  };
  return {
    filters: { ...filters, from: undefined, to: undefined },
    options,
    overview: {
      events: filtered.length,
      sessions: sessions.size,
      pageViews: pageViews.length,
      ctaClicks: clickEvents.length,
      completionRate: percent(submitted, started),
      sessionScope: 'Anonimowy identyfikator działa tylko w bieżącej karcie/sesji. Bez cookies marketingowych nie klasyfikujemy osób jako powracające.',
    },
    countries: { notice: countryNotice, rows: countBy(filtered, eventCountry) },
    languages: countBy(filtered, (event) => text(event.locale, 16).toUpperCase()),
    devices: countBy(filtered, (event) => event.device_type),
    pages: { top: countBy(pageViews, (event) => event.page_path), paths, hours, days },
    clicks: {
      top: ctaLabels,
      phone: clickEvents.filter((event) => /tel|telefon|phone/.test(`${eventElement(event)} ${eventCategory(event)}`.toLowerCase())).length,
      email: clickEvents.filter((event) => /mail|email/.test(`${eventElement(event)} ${eventCategory(event)}`.toLowerCase())).length,
      maps: clickEvents.filter((event) => /maps|mapa|dojazd/.test(`${eventElement(event)} ${eventCategory(event)} ${event.event_type}`.toLowerCase())).length,
      tours: clickEvents.filter((event) => /tour|wyciecz/.test(`${eventElement(event)} ${eventCategory(event)} ${event.event_type}`.toLowerCase())).length,
    },
    form: {
      started,
      stepViews: ofType('booking_step_view').length,
      submitted,
      abandoned: abandoned.length,
      completionRate: percent(submitted, started),
      steps: countBy(ofType('booking_step_view'), (event) => eventCategory(event) || metadataOf(event).step),
      abandonSteps: countBy(abandoned, (event) => eventCategory(event) || metadataOf(event).step),
      errors: countBy(errors, (event) => eventCategory(event) || metadataOf(event).field || metadataOf(event).reason),
      languages: formBy((event) => text(event.locale, 16).toUpperCase()),
      devices: formBy((event) => event.device_type),
      stayTypes: formBy((event) => metadataOf(event).stayType || eventCategory(event)),
    },
    campy: {
      opened: ofType('open_campy').length,
      questions: campyQuestions.length,
      categories: countBy(campyQuestions, eventCategory),
      languages: countBy([...ofType('open_campy'), ...campyQuestions], (event) => text(event.locale, 16).toUpperCase()),
      conversions: conversionAfterCampy(filtered, sessions),
    },
    attractions: {
      topAttractions: countBy(filtered.filter((event) => event.event_type === 'attraction_click'), eventCategory),
      topTours: countBy(filtered.filter((event) => ['tour_click', 'tour_cta_click'].includes(event.event_type)), eventCategory),
      auschwitzOfficial: filtered.filter((event) => /auschwitz.*official|official.*auschwitz/.test(`${eventCategory(event)} ${eventElement(event)}`.toLowerCase())).length,
      auschwitzTour: filtered.filter((event) => /auschwitz/.test(`${eventCategory(event)} ${eventElement(event)}`.toLowerCase()) && /tour|wyciecz/.test(`${event.event_type} ${eventElement(event)}`.toLowerCase())).length,
      planner: attractions.filter((event) => /planner|planer/.test(`${metadataOf(event).source || ''} ${event.page_path || ''}`.toLowerCase())).length,
      bookingTransitions: filtered.filter((event) => event.event_type === 'click_cta' && /rezerw|booking/.test(`${eventCategory(event)} ${eventElement(event)}`.toLowerCase())).length,
    },
    recent: filtered.slice(0, 50).map((event) => ({
      createdAt: event.created_at,
      eventType: event.event_type,
      pagePath: event.page_path,
      locale: event.locale,
      country: eventCountry(event),
      device: event.device_type,
      category: eventCategory(event),
    })),
  };
};

const feedbackFromInquiry = (row) => {
  const raw = safeObject(row.raw_payload_json);
  const review = safeObject(raw.feedback || row.feedback_json);
  const rating = Math.max(0, Math.min(5, Math.round(number(review.rating))));
  const liked = safeArray(review.liked).map((item) => redactFeedback(item)).filter(Boolean);
  const improve = redactFeedback(review.improve || review.suggestion);
  const easyInfo = text(review.easyInfo, 80);
  const easyForm = text(review.easyForm, 80);
  if (!rating && !liked.length && !improve && !easyInfo && !easyForm) return null;
  return {
    source: 'reservation', rating, liked, improve, easyInfo, easyForm,
    locale: text(row.language || raw.language, 16).toUpperCase(),
    country: text(row.country_code || row.country, 80),
    device: text(raw.deviceType || raw.device_type, 40),
    createdAt: row.created_at,
  };
};

const feedbackFromStay = (row) => {
  const rating = Math.max(0, Math.min(5, Math.round(number(row.feedback_rating))));
  const improve = redactFeedback(row.feedback_text);
  if (!rating && !improve && row.feedback_helpful === null) return null;
  return {
    source: 'my_stay', rating, liked: row.feedback_helpful === true ? ['My Stay był pomocny'] : [], improve,
    easyInfo: '', easyForm: '', locale: text(row.locale, 16).toUpperCase(), country: '',
    device: '', createdAt: row.feedback_at || row.updated_at,
  };
};

export const analyzeFeedbackRows = (inquiries = [], stayPanels = [], filters = null) => {
  const feedback = [...safeArray(inquiries).map(feedbackFromInquiry), ...safeArray(stayPanels).map(feedbackFromStay)]
    .filter(Boolean)
    .filter((item) => {
      if (!filters) return true;
      const createdAt = new Date(item.createdAt || 0);
      if (Number.isNaN(createdAt.getTime()) || createdAt < filters.from || createdAt > filters.to) return false;
      if (filters.locale && item.locale.toLowerCase() !== filters.locale) return false;
      if (filters.country && !item.country.toLowerCase().includes(filters.country.toLowerCase())) return false;
      if (filters.device && item.device.toLowerCase() !== filters.device) return false;
      return true;
    });
  const ratings = feedback.map((item) => item.rating).filter(Boolean);
  const average = ratings.length ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10 : null;
  const ratingRows = [1, 2, 3, 4, 5].map((rating) => ({ label: String(rating), count: ratings.filter((value) => value === rating).length }));
  const problemTexts = feedback.flatMap((item) => [item.improve, item.easyInfo, item.easyForm]).filter(Boolean);
  return {
    count: feedback.length,
    average,
    ratings: ratingRows,
    positives: countBy(feedback.flatMap((item) => item.liked.map((label) => ({ label }))), (item) => item.label, 12),
    problems: countBy(problemTexts.map((label) => ({ label })), (item) => item.label, 12),
    byLanguage: countBy(feedback, (item) => item.locale),
    lowByLanguage: countBy(feedback.filter((item) => item.rating && item.rating <= 3), (item) => item.locale),
    byDevice: countBy(feedback, (item) => item.device || 'brak danych'),
    recentSuggestions: feedback.filter((item) => item.improve).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15).map((item) => ({
      suggestion: item.improve, locale: item.locale, country: item.country, device: item.device || 'brak danych', createdAt: item.createdAt,
    })),
  };
};

export const generateRecommendations = (dashboard, feedback, statusRows = []) => {
  const statusMap = new Map(safeArray(statusRows).map((row) => [row.recommendation_key, row.status]));
  const categories = new Map((dashboard.campy?.categories || []).map((row) => [String(row.label).toLowerCase(), row.count]));
  const form = dashboard.form || {};
  const mobileForm = (form.devices || []).find((row) => /mobile/.test(row.label))?.count || 0;
  const attractionClicks = (dashboard.attractions?.topAttractions || []).reduce((sum, row) => sum + row.count, 0);
  const tourClicks = (dashboard.attractions?.topTours || []).reduce((sum, row) => sum + row.count, 0);
  const pricingClicks = (dashboard.clicks?.top || []).filter((row) => /cennik|price|pricing/.test(row.label.toLowerCase())).reduce((sum, row) => sum + row.count, 0);
  const rules = [
    { key:'auschwitz-info', when:(categories.get('auschwitz') || 0) >= 3, title:'Wzmocnij informację o Auschwitz', priority:'high', reason:`Pytania CAMPY w kategorii Auschwitz: ${categories.get('auschwitz') || 0}.`, source:'CAMPY', action:'Utrzymaj obowiązek rezerwacji online i dwa osobne CTA w najbardziej widocznych miejscach.' },
    { key:'pricing-to-booking', when:pricingClicks >= 5 && form.submitted < Math.ceil(pricingClicks * .15), title:'Sprawdź przejście z cennika do formularza', priority:'high', reason:`Kliknięcia cennika: ${pricingClicks}, wysłania formularza: ${form.submitted || 0}.`, source:'Kliknięcia + formularz', action:'Przetestuj CTA z kart cenowych i zachowanie wybranego wariantu po wejściu do formularza.' },
    { key:'mobile-abandonment', when:(form.abandoned || 0) >= 3 && mobileForm >= Math.max(2, Math.round((form.started || 0) * .45)), title:'Uprość formularz mobilny', priority:'high', reason:`Porzucenia: ${form.abandoned || 0}; eventy formularza mobile: ${mobileForm}.`, source:'Lejek formularza', action:'Sprawdź pierwszy problematyczny krok na 360–430 px i ogranicz tarcie bez usuwania wymaganych danych.' },
    { key:'power-info', when:(categories.get('prąd_10a_ev') || categories.get('prąd') || 0) >= 3, title:'Przenieś informację o prądzie 10A wyżej', priority:'medium', reason:`Pytania o prąd/EV: ${categories.get('prąd_10a_ev') || categories.get('prąd') || 0}.`, source:'CAMPY', action:'Pokaż zasady 10A i zakaz ładowania EV bliżej kart pobytu i kalkulatora.' },
    { key:'summer-info', when:(categories.get('lipiec_sierpień') || 0) >= 3, title:'Wzmocnij komunikat lipiec/sierpień', priority:'high', reason:`Pytania sezonowe: ${categories.get('lipiec_sierpień') || 0}.`, source:'CAMPY', action:'Powtórz zasadę kolejności przyjazdu przed wyborem campingu.' },
    { key:'de-audit', when:(feedback.lowByLanguage || []).some((row) => row.label === 'DE' && row.count >= 2), title:'Ręcznie sprawdź wersję niemiecką', priority:'medium', reason:'Co najmniej dwie niskie oceny w języku DE.', source:'Feedback', action:'Przejdź najważniejsze ścieżki DE i popraw niejasne tłumaczenia.' },
    { key:'attractions-tours-cta', when:attractionClicks >= 5 && tourClicks < Math.ceil(attractionClicks * .15), title:'Wzmocnij CTA wycieczek przy atrakcjach', priority:'medium', reason:`Kliknięcia atrakcji: ${attractionClicks}; wycieczki: ${tourClicks}.`, source:'Atrakcje i wycieczki', action:'Sprawdź widoczność klient-friendly CTA bez sugerowania gwarancji miejsc.' },
  ];
  const active = rules.filter((rule) => rule.when);
  if (!active.length) active.push({ key:'collect-more-data', title:'Zbieraj dane przez pełne 30 dni', priority:'low', reason:'Za mało sygnałów do mocnej rekomendacji.', source:'Wszystkie moduły', action:'Nie zmieniaj UX na podstawie pojedynczych zdarzeń; wróć do raportu po zebraniu większej próby.' });
  return active.map(({ when, key, ...rule }) => ({ key, ...rule, status: statusMap.get(key) || 'new' }));
};

const markdownList = (rows, empty = 'brak danych') => rows?.length ? rows.slice(0, 8).map((row) => `- ${row.label}: ${row.count}`).join('\n') : `- ${empty}`;

export const renderAnalyticsReport = ({ dashboard, feedback, recommendations }) => `# RAPORT CC WEB — ${dashboard.filters.fromLabel}–${dashboard.filters.toLabel}

## Najważniejsze liczby

- Anonimowe sesje: ${dashboard.overview.sessions}
- Odsłony: ${dashboard.overview.pageViews}
- Kliknięcia CTA: ${dashboard.overview.ctaClicks}
- Formularz: ${dashboard.form.started} startów → ${dashboard.form.submitted} wysłań (${dashboard.form.completionRate}%)
- CAMPY: ${dashboard.campy.opened} otwarć, ${dashboard.campy.questions} pytań kategorialnych
- Feedback: ${feedback.count}, średnia ${feedback.average ?? 'brak ocen'}/5

### Kraje orientacyjne
${markdownList(dashboard.countries.rows)}

### Języki
${markdownList(dashboard.languages)}

### Top strony
${markdownList(dashboard.pages.top)}

### Top CTA
${markdownList(dashboard.clicks.top)}

### Atrakcje
${markdownList(dashboard.attractions.topAttractions)}

### Wycieczki
${markdownList(dashboard.attractions.topTours)}

## Najważniejsze problemy

${markdownList(dashboard.form.errors, 'brak powtarzalnych błędów walidacji')}

## Co działa dobrze

- Eventy są first-party, bez pełnych IP i bez danych kontaktowych.
- Awaria analityki nie blokuje publicznej strony.
- Raport oddziela oficjalne wejście Auschwitz od opcjonalnej wycieczki.

## Co poprawić w pierwszej kolejności

${recommendations.map((item) => `- [${item.priority}/${item.status}] ${item.title}: ${item.action}`).join('\n') || '- Brak rekomendacji.'}

## Sugestie zmian do kolejnego taska

${feedback.recentSuggestions.slice(0, 8).map((item) => `- ${item.suggestion} (${item.locale || 'brak języka'})`).join('\n') || '- Brak nowych sugestii tekstowych.'}

## Surowe podsumowanie danych bez danych osobowych

- Eventy w zakresie: ${dashboard.overview.events}
- Urządzenia: ${(dashboard.devices || []).map((row) => `${row.label}=${row.count}`).join(', ') || 'brak danych'}
- Porzucenia formularza: ${dashboard.form.abandoned}
- Auschwitz official CTA: ${dashboard.attractions.auschwitzOfficial}
- Auschwitz tour CTA: ${dashboard.attractions.auschwitzTour}

> ${dashboard.countries.notice}
`;

export const loadAnalyticsEvents = async () => {
  const { body } = await supabaseRequest(`${EVENTS_TABLE}?select=*&order=created_at.desc&limit=5000`, { method: 'GET' });
  return safeArray(body);
};

export const loadFeedbackIntelligence = async (query = {}) => {
  const filters = parseAnalyticsFilters(query);
  const [inquiriesResult, stayResult] = await Promise.allSettled([
    listReservationInquiries(),
    supabaseRequest('stay_panels?select=feedback_rating,feedback_helpful,feedback_text,feedback_at,updated_at,locale&feedback_at=not.is.null&order=feedback_at.desc&limit=1000', { method: 'GET' }),
  ]);
  const inquiries = inquiriesResult.status === 'fulfilled' ? inquiriesResult.value : [];
  const stayPanels = stayResult.status === 'fulfilled' ? safeArray(stayResult.value.body) : [];
  const result = analyzeFeedbackRows(inquiries, stayPanels, filters);
  return {
    ...result,
    sources: {
      reservationInquiries: inquiriesResult.status === 'fulfilled',
      stayPanels: stayResult.status === 'fulfilled',
    },
  };
};

export const loadRecommendationStatuses = async () => {
  const { body } = await supabaseRequest(`${RECOMMENDATIONS_TABLE}?select=recommendation_key,status,note,updated_at&order=updated_at.desc&limit=100`, { method: 'GET' });
  return safeArray(body);
};

export const saveRecommendationStatus = async (key, status, note = '') => {
  const recommendationKey = text(key, 120);
  const nextStatus = ['new', 'planned', 'done', 'rejected'].includes(status) ? status : '';
  if (!recommendationKey || !nextStatus) throw new Error('RECOMMENDATION_STATUS_INVALID');
  const { body } = await supabaseRequest(`${RECOMMENDATIONS_TABLE}?on_conflict=recommendation_key&select=recommendation_key,status,note,updated_at`, {
    method: 'POST',
    headers: { prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({ recommendation_key: recommendationKey, status: nextStatus, note: text(note, 500) || null, updated_at: new Date().toISOString() }),
  });
  return safeArray(body)[0] || null;
};

export const buildAnalyticsBundle = async (query = {}) => {
  const filters = parseAnalyticsFilters(query);
  const [events, feedback, statusRows] = await Promise.all([
    loadAnalyticsEvents(),
    loadFeedbackIntelligence(query),
    loadRecommendationStatuses(),
  ]);
  const dashboard = aggregateEvents(events, filters);
  const recommendations = generateRecommendations(dashboard, feedback, statusRows);
  const report = renderAnalyticsReport({ dashboard, feedback, recommendations });
  return { dashboard, feedback, recommendations, report };
};
