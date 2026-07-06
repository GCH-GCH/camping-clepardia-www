import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));

const pricingPages = [
  { lang: 'pl', file: 'cennik/index.html' },
  { lang: 'en', file: 'en/cennik/index.html' },
  { lang: 'de', file: 'de/cennik/index.html' },
  { lang: 'it', file: 'it/cennik/index.html' },
  { lang: 'fr', file: 'fr/cennik/index.html' },
  { lang: 'es', file: 'es/cennik/index.html' },
  { lang: 'nl', file: 'nl/cennik/index.html' },
  { lang: 'cs', file: 'cs/cennik/index.html' },
  { lang: 'sk', file: 'sk/cennik/index.html' },
  { lang: 'sv', file: 'sv/cennik/index.html' },
];

const foreignPolishLeaks = [
  'Użyj w kalkulatorze',
  'Zarezerwuj',
  'Kto przyjeżdża',
  'Dorośli',
  'Dzieci',
  'Twój koszt',
  '2 osoby',
  'przyczepa',
  'prąd',
  'namiot',
  'Domek dla pary',
  'Najprostszy namiot',
  'Większy namiot',
];

const decodeEntities = (value) =>
  value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&#x2F;', '/');

const visibleText = (html) =>
  decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );

const failures = [];

for (const page of pricingPages) {
  const absolutePath = join(distDir, page.file);

  if (!existsSync(absolutePath)) {
    failures.push(`${page.lang}: missing ${page.file}`);
    continue;
  }

  const html = readFileSync(absolutePath, 'utf8');
  const text = visibleText(html);

  if (!html.includes(`data-pricing-locale="${page.lang}"`)) {
    failures.push(`${page.lang}: missing data-pricing-locale="${page.lang}"`);
  }

  if (!html.includes('300 PLN') || !html.includes('350 PLN')) {
    failures.push(`${page.lang}: missing 300/350 PLN bungalow 3 prices`);
  }

  if (html.includes('250 PLN')) {
    failures.push(`${page.lang}: forbidden 250 PLN found`);
  }

  if (page.lang !== 'pl') {
    const hits = foreignPolishLeaks.filter((phrase) => text.includes(phrase));
    if (hits.length > 0) {
      failures.push(`${page.lang}: visible Polish pricing text found: ${hits.join(', ')}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Pricing i18n audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Pricing i18n audit passed for 10 pricing pages.');
