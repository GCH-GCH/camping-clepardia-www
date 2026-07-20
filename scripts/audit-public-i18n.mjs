import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const locales = ['en', 'de', 'it', 'fr', 'es', 'nl', 'cs', 'sk', 'sv'];
const nonEnglishLocales = locales.filter((locale) => locale !== 'en');

const polishLeakPhrases = [
  'Użyj w kalkulatorze',
  'Kto przyjeżdża',
  'Czym przyjeżdżasz',
  'gdzie śpisz',
  'Twój koszt',
  'Wyślij zapytanie',
  'Dziękujemy',
  'Zapytanie zostało wysłane',
  'Recepcja odpowie',
  'Imię i nazwisko',
  'Data przyjazdu',
  'Data wyjazdu',
  'Liczba osób',
  'Dodaj plan pobytu',
  'Zobacz atrakcje',
  'Zobacz, co zwiedzić',
  'Jak dojechać do centrum?',
  'Pomóż mi przygotować pobyt',
  'Zaplanuj dzień w Krakowie',
  'Budynek sanitarny',
  'Przystanek przy campingu',
  'Domek 4-osobowy',
  'Domek 3-osobowy',
  'Domek 2-osobowy',
  'Łazienka',
  'Zaplecze sanitarne',
  'Sypialnia',
  'Miejsca campingowe',
  'Strefa dla kamperów',
  'Strefa namiotowa',
  'Prąd i zaplecze',
  'Otwarta przestrzeń campingu',
  'Płyty betonowe dla kamperów',
  'Kampery pod drzewami',
  'Droga i główna część campingu',
  'Alejka przy domkach',
  'Rząd domków',
  'Domki przy części campingowej',
  'Kuchnia turystyczna',
  'Pralnia dla gości',
  'Rodzinna część campingu',
  'Camping z lotu ptaka',
  'Sprawdzamy aktualną pogodę',
  'Nie udało się teraz pobrać pogody',
  'Liczba nocy',
  'Data przyjazdu',
  'Rozpocznij planowanie',
  'Zapytaj CAMPY',
  'Plan przygotowany',
  'Pogoda',
  'Wybierz datę',
  'Przewiń',
  'Słonecznie',
  'Deszcz',
  'Dzisiaj',
  'Jutro',
  'Dokładna kolejność',
  'Informacje praktyczne',
  'Przydatne linki',
  'Otwórz Google Maps',
  'Poprzedni dzień',
  'Następny dzień',
  'Prognoza godzinowa',
  'Planer Premium',
  'Premium Planner',
  'Sprawdź prognozę',
  'Kraków · teraz',
  'Dopasuj plan do pogody',
  'Warunki przy campingu',
  'Opady',
  'Wiatr',
];

const englishFallbackPhrases = [
  'July and August — important rule',
  'July and August - important rule',
  'In July and August',
  'Good to know',
  'Good to know before arrival',
  'A green campsite in the city',
  'green city campsite',
  'A green base',
  'Why it works',
  'What you will find on site',
  'Important information',
  'Before arriving',
  'Next step',
  'Check availability',
  'Send inquiry',
  'Book now',
  'See prices',
  'Read more',
  'Frequently asked questions',
  'Find an answer before arrival',
  'Search FAQ',
  'No answer found',
  'Need help',
  'Ask CAMPY',
  'Start planning',
  'Choose language',
  'Form sent',
  'Thank you',
  'Contact reception',
  'Your stay',
  'Practical facilities',
  'Vehicle and extra prices',
  'Bungalows and camping for families',
  'Attractions for children',
  'Practical information',
  'Family prices',
  'Property character',
  'Arrival and registration',
  'Check-in and check-out',
  'Bookings and availability',
  'Privacy policy',
  'Data administrator',
];

const ambiguousPolishWatch = [
  'Transport',
  'Tempo',
  'Zarezerwuj',
  'Dorośli',
  'Dzieci',
  'Wiadomość',
  'Telefon',
  'Kraj',
  'Prąd',
  'Przyczepa',
  'Namiot',
  'przyczepa',
  'prąd',
  'namiot',
  'osoby',
  'noc',
  'od',
  'ok.',
];

const ambiguousEnglishWatch = [
  'Arrival',
  'Departure',
  'Guests',
  'Adults',
  'Children',
  'Campsite',
  'Bungalows',
  'Directions',
  'Attractions',
  'Message',
  'Phone',
  'Country',
  'Name',
  'Email',
  'Camping',
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

const stripScriptsAndStyles = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ');

const visibleText = (html) =>
  decodeEntities(stripScriptsAndStyles(html).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

const htmlWithoutInactiveBlocks = (html) =>
  decodeEntities(stripScriptsAndStyles(html)).replace(/\s+/g, ' ');

const scriptText = (html) =>
  decodeEntities([...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).join(' '))
    .replace(/\s+/g, ' ')
    .trim();

const countOccurrences = (haystack, needle) => {
  const source = haystack.toLocaleLowerCase('pl');
  const query = needle.toLocaleLowerCase('pl');
  let count = 0;
  let index = source.indexOf(query);
  while (index !== -1) {
    count += 1;
    index = source.indexOf(query, index + query.length);
  }
  return count;
};

const toRoute = (locale, file) => {
  const localeDir = path.join(distDir, locale);
  const relative = path.relative(localeDir, file).replaceAll(path.sep, '/').replace(/(^|\/)index\.html$/, '');
  return `/${locale}${relative ? `/${relative}` : ''}/`;
};

const collectHtmlFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(target);
      } else if (entry.isFile() && entry.name === 'index.html') {
        files.push(target);
      }
    }
  };

  visit(dir);
  return files;
};

const scanSurface = ({ locale, route, label, content, phrases, type }) => {
  const rows = [];
  for (const phrase of phrases) {
    const count = countOccurrences(content, phrase);
    if (count > 0) {
      rows.push({ type, locale, route, phrase, count, surface: label });
    }
  }
  return rows;
};

if (!fs.existsSync(distDir)) {
  console.error('Brak katalogu dist. Uruchom najpierw npm run build.');
  process.exit(1);
}

const failures = [];
const warnings = [];
let filesChecked = 0;

for (const locale of locales) {
  const files = collectHtmlFiles(path.join(distDir, locale));

  for (const file of files) {
    filesChecked += 1;
    const route = toRoute(locale, file);
    const html = fs.readFileSync(file, 'utf8');
    const text = visibleText(html);
    const attrsAndText = htmlWithoutInactiveBlocks(html);
    const scripts = scriptText(html);

    failures.push(...scanSurface({ locale, route, label: 'visible-text', content: text, phrases: polishLeakPhrases, type: 'PL_LEAK' }));
    failures.push(...scanSurface({ locale, route, label: 'attr/html', content: attrsAndText, phrases: polishLeakPhrases, type: 'PL_LEAK' }));
    warnings.push(...scanSurface({ locale, route, label: 'visible-text-watch', content: text, phrases: ambiguousPolishWatch, type: 'PL_WATCH' }));
    warnings.push(...scanSurface({ locale, route, label: 'runtime-js-watch', content: scripts, phrases: polishLeakPhrases, type: 'PL_JS_WATCH' }));

    if (nonEnglishLocales.includes(locale)) {
      failures.push(...scanSurface({ locale, route, label: 'visible-text', content: text, phrases: englishFallbackPhrases, type: 'EN_FALLBACK' }));
      failures.push(...scanSurface({ locale, route, label: 'attr/html', content: attrsAndText, phrases: englishFallbackPhrases, type: 'EN_FALLBACK' }));
      warnings.push(...scanSurface({ locale, route, label: 'visible-text-watch', content: text, phrases: ambiguousEnglishWatch, type: 'EN_WATCH' }));
      warnings.push(...scanSurface({ locale, route, label: 'runtime-js-watch', content: scripts, phrases: englishFallbackPhrases, type: 'EN_JS_WATCH' }));
    }
  }
}

if (warnings.length) {
  console.warn(`I18N audit watchlist: ${warnings.length} dwuznacznych trafień do ręcznej oceny.`);
  console.table(warnings.slice(0, 80));
  if (warnings.length > 80) console.warn(`... oraz ${warnings.length - 80} kolejnych ostrzeżeń.`);
}

if (failures.length) {
  console.error(`I18N audit failed: ${failures.length} twardych przecieków PL/EN fallback w obcych wersjach.`);
  console.table(failures);
  process.exit(1);
}

console.log(`I18N audit passed: sprawdzono ${filesChecked} publicznych plików HTML dla ${locales.length} języków; EN_FALLBACK aktywny dla ${nonEnglishLocales.length} języków.`);
