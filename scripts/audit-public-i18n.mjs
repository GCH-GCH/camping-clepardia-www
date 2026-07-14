import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const languages = ['en', 'de', 'it', 'fr', 'es', 'nl', 'cs', 'sk', 'sv'];
const publicRouteCandidates = [
  '',
  'camping',
  'domki',
  'cennik',
  'dojazd',
  'atrakcje',
  'galeria',
  'kontakt',
  'faq',
  'rezerwacja',
  'booking',
  'buchung',
  'prenotazione',
  'aktualnosci',
];

const obviousPhrases = [
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
];

const ambiguousPhrases = [
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

const routeToFile = (lang, route) => {
  const routePart = route ? `${route}/` : '';
  return path.join(distDir, lang, routePart, 'index.html');
};

const scanSurface = ({ lang, route, label, content, phrases }) => {
  const rows = [];
  for (const phrase of phrases) {
    const count = countOccurrences(content, phrase);
    if (count > 0) rows.push({ locale: lang, route: `/${lang}/${route ? `${route}/` : ''}`, phrase, count, surface: label });
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

for (const lang of languages) {
  for (const route of publicRouteCandidates) {
    const file = routeToFile(lang, route);
    if (!fs.existsSync(file)) continue;

    filesChecked += 1;
    const html = fs.readFileSync(file, 'utf8');
    const text = visibleText(html);
    const attrsAndText = htmlWithoutInactiveBlocks(html);
    const scripts = scriptText(html);

    failures.push(...scanSurface({ lang, route, label: 'visible-text', content: text, phrases: obviousPhrases }));
    failures.push(...scanSurface({ lang, route, label: 'attr/html', content: attrsAndText, phrases: obviousPhrases }));

    // Runtime JS is a hard failure for the components fixed in this task:
    // pricing and gallery. The booking form still carries a multilingual
    // dictionary in JS; it is reported below as a watchlist item unless it
    // becomes visible in HTML/attributes.
    if (route === 'cennik' || route === 'galeria') {
      failures.push(...scanSurface({ lang, route, label: 'runtime-js', content: scripts, phrases: obviousPhrases }));
    } else {
      warnings.push(...scanSurface({ lang, route, label: 'runtime-js-watch', content: scripts, phrases: obviousPhrases }));
    }

    warnings.push(...scanSurface({ lang, route, label: 'visible-text-watch', content: text, phrases: ambiguousPhrases }));
    warnings.push(...scanSurface({ lang, route, label: 'runtime-js-watch', content: scripts, phrases: ambiguousPhrases }));
  }
}

if (warnings.length) {
  console.warn(`I18N audit watchlist: ${warnings.length} dwuznacznych trafień do ręcznej oceny.`);
  console.table(warnings.slice(0, 80));
  if (warnings.length > 80) console.warn(`... oraz ${warnings.length - 80} kolejnych ostrzeżeń.`);
}

if (failures.length) {
  console.error(`I18N audit failed: ${failures.length} oczywistych polskich przecieków w obcych wersjach.`);
  console.table(failures);
  process.exit(1);
}

console.log(`I18N audit passed: sprawdzono ${filesChecked} publicznych plików HTML dla ${languages.length} języków.`);
