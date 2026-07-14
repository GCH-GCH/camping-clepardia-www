import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const locales = ['en', 'de', 'it', 'fr', 'es', 'nl', 'cs', 'sk', 'sv'];

const reservationRoutes = {
  pl: 'rezerwacja/index.html',
  en: 'en/booking/index.html',
  de: 'de/buchung/index.html',
  it: 'it/prenotazione/index.html',
  fr: 'fr/booking/index.html',
  es: 'es/booking/index.html',
  nl: 'nl/booking/index.html',
  cs: 'cs/booking/index.html',
  sk: 'sk/booking/index.html',
  sv: 'sv/booking/index.html',
};

const plannerRoutes = {
  pl: 'planer-pobytu/index.html',
  en: 'en/stay-planner/index.html',
  de: 'de/aufenthaltsplaner/index.html',
  it: 'it/pianificatore-soggiorno/index.html',
  fr: 'fr/planificateur-sejour/index.html',
  es: 'es/planificador-estancia/index.html',
  nl: 'nl/verblijfsplanner/index.html',
  cs: 'cs/planovac-pobytu/index.html',
  sk: 'sk/planovac-pobytu/index.html',
  sv: 'sv/vistelseplanerare/index.html',
};

const sharedSlugPages = [
  'camping',
  'domki',
  'cennik',
  'dojazd',
  'atrakcje',
  'galeria',
  'kontakt',
  'faq',
];

const pages = [
  { id: 'home', routes: Object.fromEntries(['pl', ...locales].map((locale) => [locale, locale === 'pl' ? 'index.html' : `${locale}/index.html`])) },
  ...sharedSlugPages.map((slug) => ({
    id: slug,
    routes: Object.fromEntries(['pl', ...locales].map((locale) => [locale, locale === 'pl' ? `${slug}/index.html` : `${locale}/${slug}/index.html`])),
  })),
  { id: 'rezerwacja', routes: reservationRoutes, reservation: true },
  { id: 'planer-pobytu', routes: plannerRoutes },
  {
    id: 'aktualnosci',
    optional: true,
    routes: Object.fromEntries(['pl', ...locales].map((locale) => [locale, locale === 'pl' ? 'aktualnosci/index.html' : `${locale}/aktualnosci/index.html`])),
  },
];

const forbiddenReservationPhrases = [
  'Quick helper',
  'Help me choose my stay',
  'Stay mini quiz',
  'Prepare before arrival',
];

const decodeEntities = (value) =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));

const stripRuntime = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ');

const visibleText = (html) =>
  decodeEntities(stripRuntime(html).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

const count = (source, pattern) => (source.match(pattern) ?? []).length;

const routePath = (relative) => `/${relative.replaceAll('\\', '/').replace(/(^|\/)index\.html$/, '').replace(/\/$/, '')}`.replace(/\/$/, '') || '/';

const readHtml = (relative) => {
  const file = path.join(distDir, relative);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
};

const metricsFor = (html) => {
  const text = visibleText(html);
  return {
    sections: count(html, /<section\b/gi),
    dataSections: count(html, /\bdata-section=/gi),
    reservationForms: count(html, /\bdata-reservation-mini-game\b/gi),
    clientGuides: count(html, /\bdata-client-guide\b/gi),
    galleryCards: count(html, /\bdata-gallery-item\b/gi),
    pricingModes: count(html, /\bdata-pricing-mode\b/gi),
    mainCtas: count(html, /class="[^"]*\bbtn\b/gi),
    forbiddenReservationPhrases: forbiddenReservationPhrases.filter((phrase) => text.includes(phrase)),
  };
};

if (!fs.existsSync(distDir)) {
  console.error('Brak katalogu dist. Uruchom najpierw npm run build.');
  process.exit(1);
}

const failures = [];
const warnings = [];
const summaries = [];

for (const page of pages) {
  const plHtml = readHtml(page.routes.pl);
  if (!plHtml) {
    if (page.optional) continue;
    failures.push({ type: 'PL_ROUTE_MISSING', page: page.id, locale: 'pl', route: routePath(page.routes.pl) });
    continue;
  }

  const plMetrics = metricsFor(plHtml);

  for (const locale of locales) {
    const relative = page.routes[locale];
    const html = readHtml(relative);
    const route = routePath(relative);

    if (!html) {
      warnings.push({ type: 'ROUTE_MISSING', page: page.id, locale, route });
      continue;
    }

    const metrics = metricsFor(html);
    summaries.push({
      page: page.id,
      locale,
      route,
      sections: metrics.sections,
      plSections: plMetrics.sections,
      reservationForms: metrics.reservationForms,
      clientGuides: metrics.clientGuides,
      galleryCards: metrics.galleryCards,
      pricingModes: metrics.pricingModes,
    });

    if (page.reservation) {
      if (metrics.reservationForms < 1) {
        failures.push({ type: 'RESERVATION_FORM_MISSING', page: page.id, locale, route });
      }

      if (metrics.clientGuides > 0) {
        failures.push({ type: 'RESERVATION_CLIENT_GUIDE_FOUND', page: page.id, locale, route, count: metrics.clientGuides });
      }

      if (metrics.sections > plMetrics.sections) {
        failures.push({
          type: 'RESERVATION_EXTRA_SECTIONS',
          page: page.id,
          locale,
          route,
          sections: metrics.sections,
          plSections: plMetrics.sections,
        });
      }

      for (const phrase of metrics.forbiddenReservationPhrases) {
        failures.push({ type: 'RESERVATION_FORBIDDEN_HELPER_TEXT', page: page.id, locale, route, phrase });
      }
    } else if (metrics.sections !== plMetrics.sections) {
      warnings.push({
        type: 'SECTION_COUNT_DIFF',
        page: page.id,
        locale,
        route,
        sections: metrics.sections,
        plSections: plMetrics.sections,
      });
    }

    if (page.id === 'galeria' && metrics.galleryCards !== plMetrics.galleryCards) {
      warnings.push({
        type: 'GALLERY_CARD_COUNT_DIFF',
        page: page.id,
        locale,
        route,
        galleryCards: metrics.galleryCards,
        plGalleryCards: plMetrics.galleryCards,
      });
    }

    if (page.id === 'cennik' && metrics.pricingModes !== plMetrics.pricingModes) {
      warnings.push({
        type: 'PRICING_MODE_COUNT_DIFF',
        page: page.id,
        locale,
        route,
        pricingModes: metrics.pricingModes,
        plPricingModes: plMetrics.pricingModes,
      });
    }
  }
}

if (warnings.length) {
  console.warn(`Structure audit watchlist: ${warnings.length} różnic do ręcznej oceny.`);
  console.table(warnings.slice(0, 80));
  if (warnings.length > 80) console.warn(`... oraz ${warnings.length - 80} kolejnych ostrzeżeń.`);
}

if (failures.length) {
  console.error(`Structure audit failed: ${failures.length} twardych błędów struktury.`);
  console.table(failures);
  process.exit(1);
}

console.log(`Structure audit passed: sprawdzono ${summaries.length} par PL vs języki. Rezerwacja bez Quick helper / quiz.`);
