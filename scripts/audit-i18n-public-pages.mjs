import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const languages = ['en', 'de', 'it', 'fr', 'es', 'nl', 'cs', 'sk', 'sv'];

const forbiddenPhrases = [
  // High-confidence visible UI leaks.
  'Strona główna',
  'Użyj w kalkulatorze',
  'Kto przyjeżdża',
  'Czym przyjeżdżasz',
  'gdzie śpisz',
  'Twój koszt',
  'Liczba nocy',
  'Cena za noc',
  'Wybrane',
  'Cena obejmuje',
  'Wyślij zapytanie',
  'Zapytanie zostało wysłane',
  'Recepcja odpowie',
  'Imię i nazwisko',
  'Data przyjazdu',
  'Data wyjazdu',
  'Liczba osób',
  'Wiadomość',
  'Wszystkie prawa zastrzeżone',
  'Dodaj plan pobytu',
  'Zobacz atrakcje',
  'Zobacz, co zwiedzić',
  'Jak dojechać do centrum?',
  'Pomóż mi przygotować pobyt',
  'Zaplanuj dzień w Krakowie',

  // Gallery/image-data leaks, checked in visible text and attributes.
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
  'Widok z góry',
];

const stripInactiveHtml = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ');

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

const visibleText = (html) =>
  decodeEntities(stripInactiveHtml(html).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

const markupWithoutScripts = (html) =>
  decodeEntities(stripInactiveHtml(html)).replace(/\s+/g, ' ');

const countOccurrences = (haystack, needle) => {
  const normalizedHaystack = haystack.toLocaleLowerCase('pl');
  const normalizedNeedle = needle.toLocaleLowerCase('pl');
  let count = 0;
  let index = normalizedHaystack.indexOf(normalizedNeedle);
  while (index !== -1) {
    count += 1;
    index = normalizedHaystack.indexOf(normalizedNeedle, index + normalizedNeedle.length);
  }
  return count;
};

const collectHtmlFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectHtmlFiles(fullPath);
    return entry.isFile() && entry.name === 'index.html' ? [fullPath] : [];
  });
};

if (!fs.existsSync(distDir)) {
  console.error('Brak katalogu dist. Uruchom najpierw npm run build.');
  process.exit(1);
}

const rows = [];
let filesChecked = 0;

for (const lang of languages) {
  const langDir = path.join(distDir, lang);
  for (const file of collectHtmlFiles(langDir)) {
    filesChecked += 1;
    const html = fs.readFileSync(file, 'utf8');
    const route = `/${path.relative(distDir, path.dirname(file)).replace(/\\/g, '/')}/`;
    const text = visibleText(html);
    const markup = markupWithoutScripts(html);

    for (const phrase of forbiddenPhrases) {
      const textCount = countOccurrences(text, phrase);
      const markupCount = countOccurrences(markup, phrase);
      const count = Math.max(textCount, markupCount);
      if (count > 0) {
        rows.push({
          lang,
          route,
          phrase,
          count,
          surface: textCount > 0 ? 'text' : 'attr/html',
        });
      }
    }
  }
}

if (rows.length) {
  console.error(`I18N audit failed: wykryto ${rows.length} przecieków PL w obcych wersjach.`);
  console.table(rows);
  process.exit(1);
}

console.log(`I18N audit passed: sprawdzono ${filesChecked} plików HTML dla ${languages.length} języków.`);
